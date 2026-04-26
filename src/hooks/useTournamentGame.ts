import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, getDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { Chess, Piece, Square, PieceSymbol } from 'chess.js';
import { db } from '../firebase';
import { Game, UserProfile } from '../types'; 
import { useAuth } from '../contexts/AuthContext';
import confetti from 'canvas-confetti';

const initialPieces = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
};

const SOUNDS = {
    move: '/sounds/move.ogg',
    capture: '/sounds/capture.ogg',
    check: '/sounds/check.ogg',
    win: '/sounds/win.ogg',
    lose: '/sounds/lose.ogg'
};

export const useTournamentGame = (gameId: string, tournamentId?: string) => {
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;

    const [game, setGame] = useState(new Chess());
    const [gameData, setGameData] = useState<Game | null>(null);
    const [playerDetails, setPlayerDetails] = useState<{ white: UserProfile | null, black: UserProfile | null }>({ white: null, black: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<{ [key: string]: any }>({});
    const [lastMoveSquares, setLastMoveSquares] = useState<{ [key: string]: any }>({});
    const [checkSquares, setCheckSquares] = useState<{ [key: string]: any }>({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDismissed, setModalDismissed] = useState(false);
    const [gameResult, setGameResult] = useState("");
    
    const [timers, setTimers] = useState<{ w: number, b: number }>({ w: 480, b: 480 });
    const [capturedBy, setCapturedBy] = useState<{ w: Piece[], b: Piece[] }>({ w: [], b: [] });
    const [myColor, setMyColor] = useState<'w' | 'b' | null>(null);
    
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const finalizationAttemptedRef = useRef(false);
    const prevFenRef = useRef<string | null>(null);

    const playSound = useCallback((type: keyof typeof SOUNDS) => {
        try {
            const audio = new Audio(SOUNDS[type]);
            audio.volume = 1.0; 
            audio.currentTime = 0;
            audio.play().catch(e => console.warn('Audio play blocked or failed:', e));
        } catch (e) {
            console.error('Sound error:', e);
        }
    }, []);

    const boardOrientation = useMemo(() => myColor === 'b' ? 'black' : 'white', [myColor]);
    const isSpectator = useMemo(() => !!gameData && userId !== gameData.players.white && userId !== gameData.players.black, [gameData, userId]);

    const isMyTurn = useMemo(() => {
        if (isSpectator || !myColor || !gameData || gameData.status !== 'active') return false;
        return game.turn() === myColor;
    }, [game, gameData, myColor, isSpectator]);

    const opponentId = useMemo(() => {
        if (!userId || !gameData) return null;
        return gameData.players.white === userId ? gameData.players.black : gameData.players.white;
    }, [gameData, userId]);
    
    const finalizeTournamentMatch = useCallback(async (winnerId: any, matchId: string, tourneyId: string) => {
        if (finalizationAttemptedRef.current) return;
        finalizationAttemptedRef.current = true;

        try {
            await runTransaction(db, async (transaction) => {
                const tournamentRef = doc(db, 'tournaments', tourneyId);
                const tournamentDoc = await transaction.get(tournamentRef);

                if (!tournamentDoc.exists()) throw new Error("Tournament not found during finalization.");
                
                const tournamentData = tournamentDoc.data();
                let matches = Array.isArray(tournamentData.matches) 
                    ? [...tournamentData.matches] 
                    : Object.values(tournamentData.matches || {});
                
                const matchIndex = matches.findIndex((m: any) => m.id === matchId);

                if (matchIndex !== -1) {
                    if (matches[matchIndex].status !== 'completed') {
                        matches[matchIndex].status = 'completed';
                        matches[matchIndex].winnerId = winnerId;
                        transaction.update(tournamentRef, { matches: matches });
                    }
                } else {
                    console.error(`Could not find match ${matchId} in tournament ${tourneyId} to finalize.`);
                }
            });
        } catch (e) {
            console.error("Transaction to finalize tournament match failed:", e);
        }
    }, []);

    const handleMove = useCallback(async (move: { from: Square, to: Square, promotion?: PieceSymbol }) => {
        if (!isMyTurn) return false;

        const moves = game.moves({ square: move.from, verbose: true });
        const moveDetails = moves.find(m => m.to === move.to);

        if (moveDetails?.flags.includes('p') && !move.promotion) {
            setPendingPromotion({ from: move.from, to: move.to });
            return false;
        }
        
        const gameCopy = new Chess(game.fen());
        try {
            const result = gameCopy.move(move);
            if (result) {
                if (!gameCopy.isGameOver()) {
                    if (gameCopy.inCheck()) playSound('check');
                    else if (result.captured) playSound('capture');
                    else playSound('move');
                }

                const serverTimeAtLastMove = (gameData?.lastMove instanceof Timestamp) ? gameData.lastMove.toMillis() : Date.now();
                const timeSpent = (Date.now() - serverTimeAtLastMove) / 1000; 

                const currentTimers = gameData?.timers || { w: 480, b: 480 };
                const timeBeforeMove = currentTimers[myColor!] || 0;
                const increment = gameData?.timeControl?.increment || 2;

                const newTime = Math.max(0, timeBeforeMove - timeSpent + increment);
                const newTimers = { ...currentTimers, [myColor!]: newTime };

                let update: any = {
                    fen: gameCopy.fen(),
                    moves: arrayUnion(result.san),
                    lastMove: serverTimestamp(),
                    timers: newTimers,
                    drawOffer: null, 
                };

                if (gameCopy.isGameOver()) {
                    update.status = 'ended';
                    let winner: string | 'draw' | null = null;
                    let reason = 'draw';
                    let resultText = "Game Over.";

                    if (gameCopy.isCheckmate()) {
                         winner = gameCopy.turn() === 'w' ? gameData?.players.black : gameData?.players.white;
                         reason = 'checkmate';
                    } else {
                         winner = 'draw';
                    }

                    update.winner = winner;
                    update.reason = reason;

                    if (winner === userId) {
                        resultText = `You won by ${reason}!`;
                    } else if (winner === 'draw') {
                        resultText = `The game is a draw by ${reason}.`;
                    } else {
                        resultText = `You lost by ${reason}.`;
                    }

                    setGameResult(resultText);
                    setIsModalOpen(true);
                }

                await updateDoc(doc(db, 'games', gameId), update);
                return true;
            }
        } catch (e) {
            console.warn("Invalid move attempted:", e);
        }
        finally {
            setFromSquare(null);
            setOptionSquares({});
            setPendingPromotion(null);
        }
        return false;
    }, [isMyTurn, game, gameData, gameId, myColor, userId, playSound]);

    const resolvePromotion = useCallback(async (piece: PieceSymbol) => {
        if (!pendingPromotion) return;
        await handleMove({ ...pendingPromotion, promotion: piece });
    }, [pendingPromotion, handleMove]);

    const onSquareClick = useCallback(async (square: Square) => {
        if (!isMyTurn || pendingPromotion) return;

        if (!fromSquare) {
            const moves = game.moves({ square, verbose: true });
            if (moves.length > 0) {
                setFromSquare(square);
                const newOptions: { [key: string]: any } = {};
                moves.forEach(m => {
                    newOptions[m.to] = { background: game.get(m.to) ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', borderRadius: '50%' };
                });
                newOptions[square] = { background: 'rgba(255, 215, 0, 0.4)' };
                setOptionSquares(newOptions);
            } 
        } else {
            await handleMove({ from: fromSquare, to: square });
        }
    }, [isMyTurn, fromSquare, game, handleMove, pendingPromotion]);

    const onPieceDrop = useCallback(async (sourceSquare: Square, targetSquare: Square): Promise<boolean> => {
        if (!isMyTurn || pendingPromotion) return false;
        const moveResult = await handleMove({ from: sourceSquare, to: targetSquare });
        return moveResult;
    }, [isMyTurn, handleMove, pendingPromotion]);
    
    const endGame = useCallback(async (winner: string | 'draw' | null, reason: string) => {
        if (isSpectator) return;
        if (gameId && gameData?.status === 'active') {
            await updateDoc(doc(db, 'games', gameId), { status: 'ended', winner, reason });
        }
    }, [gameId, gameData, isSpectator]);

    const resign = useCallback(() => endGame(opponentId, 'resign'), [endGame, opponentId]);
    const acceptDraw = useCallback(() => endGame('draw', 'draw'), [endGame]);
    
    const offerDraw = useCallback(async () => {
        if (isSpectator || !gameId || gameData?.status !== 'active' || !userId || !opponentId) return;
        await updateDoc(doc(db, 'games', gameId), { drawOffer: { from: userId, to: opponentId } });
    }, [gameId, gameData, userId, opponentId, isSpectator]);

    const declineDraw = useCallback(async ( ) => {
        if (isSpectator || !gameId || !gameData?.drawOffer || userId !== gameData.drawOffer.to) return;
        await updateDoc(doc(db, 'games', gameId), { drawOffer: null });
    }, [gameId, gameData, userId, isSpectator]);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalDismissed(true);
    }, []);

    useEffect(() => {
        setModalDismissed(false);
        finalizationAttemptedRef.current = false;
        prevFenRef.current = null;
    }, [gameId]);
    
    useEffect(() => {
        if (!gameId) return;

        const unsub = onSnapshot(doc(db, 'games', gameId), async (docSnap) => {
            if (!docSnap.exists()) {
                setError("Game not found.");
                setLoading(false);
                return;
            }
            
            const data = docSnap.data() as Game;
            const previousStatus = gameData?.status;
            const currentFen = data.fen;
            
            setGameData(data);

            if (userId) {
              if (userId === data.players.white) setMyColor('w');
              else if (userId === data.players.black) setMyColor('b');
            }

            if (data.players.white && data.players.black) {
                const whitePlayerDoc = await getDoc(doc(db, 'users', data.players.white));
                const blackPlayerDoc = await getDoc(doc(db, 'users', data.players.black));
                setPlayerDetails({
                    white: whitePlayerDoc.exists() ? whitePlayerDoc.data() as UserProfile : null,
                    black: blackPlayerDoc.exists() ? blackPlayerDoc.data() as UserProfile : null
                });
            }

            const newGame = new Chess();
            if (currentFen) {
                newGame.load(currentFen);
                
                if (prevFenRef.current && prevFenRef.current !== currentFen) {
                    const isMyMove = (newGame.turn() !== myColor); 
                    if (!isMyMove && data.status !== 'ended') {
                        if (newGame.inCheck()) {
                            playSound('check');
                        } else {
                            const history = newGame.history({ verbose: true });
                            if (history.length > 0) {
                                const lastMove = history[history.length - 1];
                                if (lastMove.captured) playSound('capture');
                                else playSound('move');
                            }
                        }
                    }
                }
                prevFenRef.current = currentFen;
            }
            setGame(newGame);

            if (data.timers) setTimers(data.timers);

            if (data.status === 'ended') {
                if (data.tournamentId && data.matchId) {
                    await finalizeTournamentMatch(data.winner, data.matchId, data.tournamentId);
                }

                if (previousStatus !== 'ended' && previousStatus !== undefined) {
                    if (data.winner === userId) {
                        playSound('win');
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                    }
                    else if (data.winner !== 'draw' && data.winner !== null) playSound('lose');
                }

                if (!modalDismissed && !isModalOpen) {
                    let resultText = "Game Over.";
                    if (data.winner === userId) resultText = `You won by ${data.reason}!`;
                    else if (data.winner === 'draw') resultText = `The game is a draw by ${data.reason}.`;
                    else resultText = `You lost by ${data.reason}.`;
                    setGameResult(resultText);
                    setIsModalOpen(true);
                }
            } else if (data.status !== 'ended') {
                setIsModalOpen(false);
            }
            
            setLoading(false);
        }, (err) => {
            console.error("Game snapshot error:", err);
            setError("Failed to listen to game updates.");
            setLoading(false);
        });

        return () => unsub();
    }, [gameId, userId, modalDismissed, isModalOpen, finalizeTournamentMatch, myColor, isSpectator, playSound, gameData?.status]);

    useEffect(() => {
        if (!gameData || gameData.status !== 'active' || isSpectator) {
            if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return;
        }

        const activeTurn = game.turn();
        const lastMoveTime = (gameData.lastMove as Timestamp)?.toMillis();
        if (!lastMoveTime) return;
        
        timerIntervalRef.current = setInterval(async () => {
            const elapsed = (Date.now() - lastMoveTime) / 1000;
            const remaining = Math.max(0, (gameData.timers?.[activeTurn] ?? 480) - elapsed);
            setTimers(prev => ({ ...prev, [activeTurn]: remaining }));

            if (remaining <= 0) {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                const winner = activeTurn === 'w' ? gameData.players.black : gameData.players.white;
                await endGame(winner, 'timeout');
            }
        }, 500);
        
        return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
    }, [game, gameData, isSpectator, endGame]);

    useEffect(() => {
        const currentPieces: { w: { [key in PieceSymbol]?: number }, b: { [key in PieceSymbol]?: number } } = { w: {}, b: {} };
        game.board().forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    currentPieces[piece.color] = currentPieces[piece.color] || {};
                    currentPieces[piece.color][piece.type] = (currentPieces[piece.color][piece.type] || 0) + 1;
                }
            });
        });

        const capturedW: Piece[] = [];
        const capturedB: Piece[] = [];

        (Object.keys(initialPieces.w) as PieceSymbol[]).forEach(p => {
            const initialCount = initialPieces.w[p];
            const currentCount = currentPieces.w[p] || 0;
            for (let i = 0; i < initialCount - currentCount; i++) capturedW.push({ type: p, color: 'w' });
        });
        (Object.keys(initialPieces.b) as PieceSymbol[]).forEach(p => {
            const initialCount = initialPieces.b[p];
            const currentCount = currentPieces.b[p] || 0;
            for (let i = 0; i < initialCount - currentCount; i++) capturedB.push({ type: p, color: 'b' });
        });

        setCapturedBy({ w: capturedW, b: capturedB });

        const newCheckSquares: { [key: string]: any } = {};
        if (game.inCheck()) {
            const kingSquare = game.board().flat().find(p => p?.type === 'k' && p?.color === game.turn())?.square;
            if (kingSquare) {
                newCheckSquares[kingSquare] = { backgroundColor: 'rgba(255, 0, 0, 0.6)' };
                const attackers = game.attackers(kingSquare, game.turn() === 'w' ? 'b' : 'w');
                attackers.forEach(attackerSquare => {
                     newCheckSquares[attackerSquare] = { backgroundColor: 'rgba(255, 0, 0, 0.6)' };
                });
            }
        }
        setCheckSquares(newCheckSquares);

        const history = game.history({ verbose: true });
        if (history.length > 0) {
            const last = history[history.length - 1];
            setLastMoveSquares({ [last.from]: { backgroundColor: 'rgba(255, 215, 0, 0.4)' }, [last.to]: { backgroundColor: 'rgba(255, 215, 0, 0.4)' } });
        } else {
            setLastMoveSquares({});
        }

    }, [game]);

    return {
        game, gameData, timers, error, loading,
        isMyTurn, myColor, boardOrientation, isSpectator,
        onSquareClick, onPieceDrop,
        resign, offerDraw, acceptDraw, declineDraw,
        gameResult, isModalOpen, closeModal,
        pendingPromotion, 
        resolvePromotion,
        optionSquares: { ...lastMoveSquares, ...checkSquares, ...optionSquares },
        capturedBy, drawOffer: gameData?.drawOffer,
        playerDetails
    };
};