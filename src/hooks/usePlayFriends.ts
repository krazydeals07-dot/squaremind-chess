import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { doc, onSnapshot, updateDoc, arrayUnion, DocumentData, getDoc, collection, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { Chess, Square, Piece } from 'chess.js';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GameResultType, GameData } from '../types';

type GameResult = {
    message: string;
    result: GameResultType;
}

const SOUND_URLS = {
    move: '/sounds/move.ogg',
    capture: '/sounds/capture.ogg',
    check: '/sounds/check.ogg',
    win: '/sounds/win.ogg',
    lose: '/sounds/lose.ogg',
};

export const usePlayFriends = (gameId: string, initialGameData: GameData) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const userId = currentUser?.uid;

    const [game, setGame] = useState(new Chess(initialGameData.fen));
    const [gameData, setGameData] = useState<DocumentData | null>(initialGameData);
    const [capturedBy, setCapturedBy] = useState<{ white: Piece[], black: Piece[] }>({ white: [], black: [] });
    const [gameResult, setGameResult] = useState<GameResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<{ [key: string]: React.CSSProperties }>({});
    const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

    const hasUpdatedStats = useRef(false);
    const prevFenRef = useRef(initialGameData.fen);
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        Object.entries(SOUND_URLS).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = 1.0;
            audioRefs.current[key] = audio;
        });
    }, []);

    const playSound = useCallback((type: keyof typeof SOUND_URLS) => {
        try {
            const audio = audioRefs.current[type];
            if (audio) {
                audio.currentTime = 0;
                audio.volume = 1.0;
                audio.play().catch(e => console.log('Audio play blocked:', e));
            }
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }, []);

    const { playerColor, boardOrientation } = useMemo(() => {
        if (!gameData || !userId) return { playerColor: 'w', boardOrientation: 'white' };
        const pColor = gameData.players.white === userId ? 'w' : 'b';
        const bOrientation = pColor === 'w' ? 'white' : 'black';
        return { playerColor: pColor, boardOrientation: bOrientation };
    }, [gameData?.players, userId]);

    useEffect(() => {
        if (!gameId || !userId) return;

        const gameDocRef = doc(db, 'games', gameId);
        const unsubscribe = onSnapshot(gameDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                 if (data.nextGameId && data.status === 'ended') {
                    navigate(`/game/friends/${data.nextGameId}`, { replace: true });
                    return;
                }
                
                const currentFen = data.fen || new Chess().fen();
                
                if (currentFen !== prevFenRef.current) {
                    const tempGame = new Chess(prevFenRef.current);
                    const moves = data.moves || [];
                    const lastSan = moves[moves.length - 1];

                    // Play sound for opponent moves (snapshot updates when it's NOT our local turn)
                    if (game.turn() !== playerColor) {
                        if (lastSan) {
                            if (lastSan.includes('#')) {
                                playSound('lose');
                            } else if (lastSan.includes('+')) {
                                playSound('check');
                            } else if (lastSan.includes('x')) {
                                playSound('capture');
                            } else {
                                playSound('move');
                            }
                        }
                    }
                    prevFenRef.current = currentFen;
                }

                const newGame = new Chess();
                if (data.moves) {
                    data.moves.forEach((move: string) => {
                        try {
                            newGame.move(move);
                        } catch (e) {
                            console.error("Invalid move in history:", move, e);
                        }
                    });
                }
                setGame(newGame);
                setGameData(data);

                const history = newGame.history({ verbose: true });
                const whiteCaptured: Piece[] = [];
                const blackCaptured: Piece[] = [];
                
                history.forEach(move => {
                    if (move.captured) {
                        if (move.color === 'w') {
                            whiteCaptured.push({ type: move.captured, color: 'b' });
                        } else {
                            blackCaptured.push({ type: move.captured, color: 'w' });
                        }
                    }
                });
                setCapturedBy({ white: whiteCaptured, black: blackCaptured });

                if (data.status === 'waiting' && data.players.black === null && data.players.white !== userId) {
                    updateDoc(gameDocRef, {
                        'players.black': userId,
                        status: 'ongoing'
                    }).catch(err => console.error("Error joining game: ", err));
                }

                if ((data.status === 'gameOver' || data.status === 'ended') && data.result) {
                    const isWinner = data.result.resultType === 'win' && userId === data.result.winnerId;
                    const wasAlreadyEnded = gameData?.status === 'ended' || gameData?.status === 'gameOver';
                    if (data.result.resultType === 'win' && !wasAlreadyEnded) {
                        playSound(isWinner ? 'win' : 'lose');
                    }
                }

            } else {
                console.error("Game not found");
                navigate('/play/friends');
            }
        });

        return () => unsubscribe();
    }, [gameId, userId, navigate, playSound, playerColor, game, gameData?.status]);

    useEffect(() => {
        const finalizeGameStatus = async () => {
            if (game.isGameOver() && gameData?.status === 'ongoing' && userId === gameData.players.white) {
                const gameDocRef = doc(db, 'games', gameId);
                let resultType: GameResultType;
                let winnerId: string | undefined;

                if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
                    resultType = 'draw';
                } else {
                    resultType = 'win';
                    const winnerColor = game.turn() === 'w' ? 'b' : 'w';
                    winnerId = gameData.players[winnerColor === 'w' ? 'white' : 'black'];
                }

                try {
                    await updateDoc(gameDocRef, {
                        status: 'gameOver',
                        result: { winnerId, resultType, message: 'Game Over' }
                    });
                } catch (e) {
                    console.error("Error updating game status:", e);
                }
            }
        };
        finalizeGameStatus();
    }, [game, gameData?.status, gameId, userId, gameData?.players.white]);

    useEffect(() => {
        const updateMyStats = async () => {
            if (gameData?.status === 'gameOver' && !hasUpdatedStats.current && userId) {
                hasUpdatedStats.current = true;
                
                const result = gameData.result;
                const userRef = doc(db, 'users', userId);
                
                try {
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) return;

                    const userData = userSnap.data();
                    const currentStats = userData.stats || { gamesPlayed: 0, totalGames: 0, gamesWon: 0, totalWins: 0, gamesLost: 0, totalLosses: 0, draws: 0, rating: 1200, elo: 1200 };
                    const currentFriendsStats = userData.friendsStats || { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, draws: 0, winPercentage: 0, elo: 1200 };

                    const isWinner = result.resultType === 'win' && userId === result.winnerId;
                    const isDraw = result.resultType === 'draw';
                    const isLoser = result.resultType === 'win' && userId !== result.winnerId;

                    const newFriendsGamesWon = isWinner ? (currentFriendsStats.gamesWon || 0) + 1 : (currentFriendsStats.gamesWon || 0);
                    const newFriendsGamesLost = isLoser ? (currentFriendsStats.gamesLost || 0) + 1 : (currentFriendsStats.gamesLost || 0);
                    const newFriendsDraws = isDraw ? (currentFriendsStats.draws || 0) + 1 : (currentFriendsStats.draws || 0);
                    const newFriendsGamesPlayed = newFriendsGamesWon + newFriendsGamesLost + newFriendsDraws;
                    const newFriendsElo = isDraw ? (currentFriendsStats.elo || 1200) + 5 : (isWinner ? (currentFriendsStats.elo || 1200) + 15 : Math.max(800, (currentFriendsStats.elo || 1200) - 10));

                    const updatedFriendsStats = {
                        gamesPlayed: newFriendsGamesPlayed,
                        gamesWon: newFriendsGamesWon,
                        gamesLost: newFriendsGamesLost,
                        draws: newFriendsDraws,
                        winPercentage: newFriendsGamesPlayed > 0 ? Math.round((newFriendsGamesWon / newFriendsGamesPlayed) * 100) : 0,
                        elo: newFriendsElo
                    };

                    const newTotalWins = isWinner ? ((currentStats.totalWins || currentStats.gamesWon || 0) + 1) : (currentStats.totalWins || currentStats.gamesWon || 0);
                    const newTotalLosses = isLoser ? ((currentStats.totalLosses || currentStats.gamesLost || 0) + 1) : (currentStats.totalLosses || currentStats.gamesLost || 0);
                    const newTotalDraws = isDraw ? ((currentStats.draws || 0) + 1) : (currentStats.draws || 0);
                    const newTotalGames = newTotalWins + newTotalLosses + newTotalDraws;
                    const newRating = isDraw ? (currentStats.rating || 1200) + 5 : (isWinner ? (currentStats.rating || 1200) + 15 : Math.max(800, (currentStats.rating || 1200) - 10));

                    const updatedStats = {
                        ...currentStats,
                        gamesPlayed: newTotalGames,
                        totalGames: newTotalGames,
                        gamesWon: newTotalWins,
                        totalWins: newTotalWins,
                        gamesLost: newTotalLosses,
                        totalLosses: newTotalLosses,
                        draws: newTotalDraws,
                        rating: newRating,
                        elo: newRating,
                        winPercentage: newTotalGames > 0 ? Math.round((newTotalWins / newTotalGames) * 100) : 0
                    };

                    await updateDoc(userRef, {
                        stats: updatedStats,
                        friendsStats: updatedFriendsStats
                    });

                    const historyRef = doc(collection(userRef, 'gameHistory'), gameId);
                    const opponentId = userId === gameData.players.white ? gameData.players.black : gameData.players.white;
                    const opponentSnap = await getDoc(doc(db, 'users', opponentId));
                    const opponentData = opponentSnap.data();

                    await setDoc(historyRef, {
                        gameId,
                        opponent: { 
                            uid: opponentId, 
                            name: opponentData?.displayName || 'Opponent', 
                            photoURL: opponentData?.photoURL 
                        },
                        result: isWinner ? 'win' : (isLoser ? 'loss' : 'draw'),
                        playedAt: serverTimestamp()
                    });

                    console.log("Stats updated successfully for user:", userId);
                } catch (e) {
                    console.error("Error updating stats:", e);
                    hasUpdatedStats.current = false;
                }
            }
        };
        updateMyStats();
    }, [gameData?.status, userId, gameId, gameData?.players.white, gameData?.players.black, gameData?.result]);

    useEffect(() => {
        const showModal = async () => {
            if (gameData?.status === 'gameOver' && !isModalOpen) {
                const result = gameData.result;
                const userResult = result.resultType === 'draw' ? 'draw' : (result.winnerId === userId ? 'win' : 'loss');
                
                let message = 'The game is a draw!';
                if (result.resultType !== 'draw' && result.winnerId) {
                    const winnerDoc = await getDoc(doc(db, 'users', result.winnerId));
                    const winnerName = winnerDoc.exists() ? (winnerDoc.data()?.displayName || 'Unknown') : 'Unknown';
                    message = `Victory for ${winnerName}!`;
                }

                setGameResult({ message, result: userResult });
                setIsModalOpen(true);
            }
        };
        showModal();
    }, [gameData, isModalOpen, userId]);

    const makeMove = useCallback(async (move: { from: Square, to: Square, promotion?: string }) => {
        if (game.isGameOver() || game.turn() !== playerColor) return null;
        
        const gameCopy = new Chess(game.fen());
        
        const moves = gameCopy.moves({ square: move.from, verbose: true });
        const moveDetails = moves.find(m => m.to === move.to);
        
        if (moveDetails?.flags.includes('p') && !move.promotion) {
            setPendingPromotion({ from: move.from, to: move.to });
            return null;
        }

        const result = gameCopy.move(move);
        if (result) {
            // Play local move sound
            if (gameCopy.isCheckmate()) {
                playSound('win');
            } else if (gameCopy.inCheck()) {
                playSound('check');
            } else if (result.captured) {
                playSound('capture');
            } else {
                playSound('move');
            }

            prevFenRef.current = gameCopy.fen();
            await updateDoc(doc(db, 'games', gameId), {
                fen: gameCopy.fen(),
                moves: arrayUnion(result.san),
            });
        }
        return result;
    }, [game, playerColor, gameId, playSound]);

    const resolvePromotion = useCallback(async (pieceType: string) => {
        if (!pendingPromotion) return;
        await makeMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: pieceType });
        setPendingPromotion(null);
    }, [pendingPromotion, makeMove]);

    const getCheckSquares = useCallback(() => {
        const squares: { [key: string]: React.CSSProperties } = {};
        if (game.inCheck()) {
            const turn = game.turn();
            const board = game.board();
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = board[r][c];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        const square = String.fromCharCode(97 + c) + (8 - r) as Square;
                        squares[square] = { backgroundColor: 'rgba(255, 0, 0, 0.5)' };
                        break;
                    }
                }
            }
            const history = game.history({ verbose: true });
            if (history.length > 0) {
                const lastMove = history[history.length - 1];
                squares[lastMove.to] = { backgroundColor: 'rgba(255, 0, 0, 0.5)' };
            }
        }
        return squares;
    }, [game]);

    const mergedOptionSquares = useMemo(() => {
        return { ...getCheckSquares(), ...optionSquares };
    }, [getCheckSquares, optionSquares]);

    const onSquareClick = useCallback(async (square: Square) => {
        if (game.turn() !== playerColor || game.isGameOver() || pendingPromotion) return;
        if (!fromSquare) {
            const moves = game.moves({ square, verbose: true });
            if (moves.length > 0) {
                setFromSquare(square);
                const newOptionSquares = moves.reduce((acc, move) => {
                    acc[move.to] = {
                        background: game.get(move.to) ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
                        borderRadius: '50%'
                    };
                    return acc;
                }, {} as { [key: string]: React.CSSProperties });
                setOptionSquares(newOptionSquares);
            }
        } else {
            const isMoveLegal = game.moves({ square: fromSquare, verbose: true }).some(m => m.to === square);
            if (isMoveLegal) {
                await makeMove({ from: fromSquare, to: square });
            }
            setFromSquare(null);
            setOptionSquares({});
        }
    }, [fromSquare, game, makeMove, playerColor, pendingPromotion]);
    
    const closeModal = useCallback(() => setIsModalOpen(false), []);
    
    const startNewGame = useCallback(async () => {
        if (!gameData?.players) return;
        closeModal();
        const newGameData = {
            players: { white: gameData.players.black, black: gameData.players.white },
            fen: new Chess().fen(),
            status: 'waiting',
            createdAt: serverTimestamp(),
            moves: [],
            rematchOf: gameId,
        };
        const newGameRef = await addDoc(collection(db, 'games'), newGameData);
        await updateDoc(doc(db, 'games', gameId), { status: 'ended', nextGameId: newGameRef.id });
    }, [gameData?.players, gameId, closeModal]);

    return {
        game,
        gameData,
        capturedBy,
        gameResult,
        isModalOpen,
        onSquareClick,
        optionSquares: mergedOptionSquares,
        closeModal,
        startNewGame,
        boardOrientation,
        pendingPromotion,
        resolvePromotion,
    };
};