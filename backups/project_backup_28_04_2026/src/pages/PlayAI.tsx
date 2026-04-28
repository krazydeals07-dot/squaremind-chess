import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Chess, Piece, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Grid, Paper, Typography, Button, Box, Modal, CircularProgress, Dialog, DialogTitle, DialogContent, Stack, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'; 
import { db } from '../firebase';
import { doc, setDoc, updateDoc, increment, collection, serverTimestamp, getDocs, query, where, FieldValue, onSnapshot, getDoc } from 'firebase/firestore';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ChessIcon from '../components/ChessIcon';
import { GameHistory, UnlockedAchievement } from '../types';
import { achievementsList } from '../data/achievements';
import confetti from 'canvas-confetti';

const pieceComponents: { [key: string]: string } = {
    wK: '♚', wQ: '♛', wR: '♜', wB: '♝', wN: '♞', wP: '♟︎',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟︎'
};

const SOUNDS = {
    move: '/sounds/move.ogg',
    capture: '/sounds/capture.ogg',
    check: '/sounds/check.ogg',
    win: '/sounds/win.ogg',
    lose: '/sounds/lose.ogg'
};

const playSound = (type: keyof typeof SOUNDS) => {
    try {
        const audio = new Audio(SOUNDS[type]);
        audio.volume = 1.0;
        audio.play().catch(e => console.warn(`Audio play blocked: ${type}`, e));
    } catch (e) {
        console.error(`Sound error: ${type}`, e);
    }
};

const CapturedPieces = ({ title, pieces, variant = 'dark' }: { title: string, pieces: Piece[], variant?: 'dark' | 'light' }) => {
    const style = variant === 'dark' 
        ? { background: 'rgba(128, 128, 128, 0.3)', color: 'white' }
        : { background: 'rgba(230, 230, 230, 0.85)', color: 'black' };

    return (
        <Paper elevation={4} sx={{ p: 0.5, my: 0.5, minHeight: '35px', width: '100%', borderRadius: '8px', ...style }}>
            <Typography variant="caption" align="center" sx={{ height: '12px', display: 'block', color: 'inherit', fontWeight: 'bold', fontSize: '0.65rem' }}>{title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', mt: 0.1 }}>
                {pieces.map((p, i) => <div key={i} style={{ fontSize: '16px', margin: '0 1px' }}>{pieceComponents[p.color + p.type.toUpperCase()]}</div>)}
            </Box>
        </Paper>
    );
};

const getAiMove = (game: Chess) => {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return null;
    
    const captureMoves = possibleMoves.filter(m => m.captured);
    if (captureMoves.length > 0) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }
    
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
};

const getPieceValue = (pieceType: string) => {
    const values: { [key: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    return values[pieceType.toLowerCase()];
};

const PlayAI = () => {
    const { currentUser, loading, isUpdating } = useAuth();
    const gameRef = useRef(new Chess());
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [fen, setFen] = useState(gameRef.current.fen());
    const [gameResult, setGameResult] = useState<'win' | 'loss' | 'draw' | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [capturedPieces, setCapturedPieces] = useState<{ w: Piece[], b: Piece[] }>({ w: [], b: [] });
    
    const [boardWidth, setBoardWidth] = useState(() => {
        const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
        if (initialWidth < 600) return initialWidth * 0.85;
        return 320;
    });
    
    const chessboardContainerRef = useRef<HTMLDivElement>(null);
    const [isResetStatsDialogOpen, setResetStatsDialogOpen] = useState(false);
    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<{[key: string]: React.CSSProperties}>({});
    
    const [moveExpectsPromotion, setMoveExpectsPromotion] = useState(false);
    const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);

    const [localStats, setLocalStats] = useState({
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        draws: 0,
        winPercentage: 0
    });

    useEffect(() => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const aiStats = data.aiStats || {};
                setLocalStats({
                    gamesPlayed: aiStats.gamesPlayed || 0,
                    gamesWon: aiStats.gamesWon || 0,
                    gamesLost: aiStats.gamesLost || 0,
                    draws: aiStats.draws || 0,
                    winPercentage: aiStats.winPercentage || 0
                });
            }
        }, (error) => {
            console.error("Error listening to user stats:", error);
        });
        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        const updateSize = () => {
            if (chessboardContainerRef.current) {
                const { offsetWidth, offsetHeight } = chessboardContainerRef.current;
                const maxWidth = isMobile ? offsetWidth * 0.9 : Math.min(offsetWidth, offsetHeight * 0.7, 320);
                setBoardWidth(maxWidth);
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, [isMobile]);

    const currentAiLevel = useMemo(() => {
        const wins = localStats.gamesWon;
        if (wins <= 5) return 'Easy';
        if (wins <= 15) return 'Medium';
        return 'Hard';
    }, [localStats.gamesWon]);

    const checkAndUnlockAchievements = useCallback(async (result: 'win' | 'loss' | 'draw') => {
        if (!currentUser || result !== 'win') return;

        const unlockedAchievementsRef = collection(db, 'users', currentUser.uid, 'unlockedAchievements');
        const unlockedSnapshot = await getDocs(unlockedAchievementsRef);
        const unlockedIds = unlockedSnapshot.docs.map(doc => doc.id);

        const gameHistoryRef = collection(db, 'users', currentUser.uid, 'gameHistory');

        for (const achievement of achievementsList) {
            if (unlockedIds.includes(achievement.id)) continue;

            let unlock = false;
            switch (achievement.id) {
                case 'first_win_ai':
                    unlock = true;
                    break;
                case 'ten_wins_ai':
                    const aiWinsQuery = query(gameHistoryRef, where('gameType', '==', 'AI'), where('result', '==', 'win'));
                    const aiWinsSnapshot = await getDocs(aiWinsQuery);
                    if (aiWinsSnapshot.size >= 9) unlock = true;
                    break;
                case 'flawless_victory':
                    if (!gameRef.current.history({ verbose: true }).some(move => move.captured && move.color === 'b')) unlock = true;
                    break;
            }

            if (unlock) {
                const unlockedAchievementDoc: Partial<UnlockedAchievement> & { unlockedAt: FieldValue } = {
                    id: achievement.id,
                    name: achievement.name,
                    description: achievement.description,
                    unlockedAt: serverTimestamp(),
                };
                await setDoc(doc(unlockedAchievementsRef, achievement.id), unlockedAchievementDoc);
            }
        }
    }, [currentUser]);

    const handleGameEnd = useCallback(async (result: 'win' | 'loss' | 'draw') => {
        if (gameResult) return;
        setGameResult(result);
        
        if (result === 'win') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFA500', '#FFD700', '#FFFFFF']
            });
            playSound('win');
        } else if (result === 'loss') {
            playSound('lose');
        }

        if (currentUser) {
            const gameId = `ai-${Date.now()}`;
            const userRef = doc(db, 'users', currentUser.uid);

            try {
                // Step 1: Update increments
                const initialUpdate: any = {
                    'aiStats.gamesPlayed': increment(1),
                    'stats.totalGames': increment(1),
                    'friendsStats.totalGames': increment(1)
                };

                if (result === 'win') {
                    initialUpdate['aiStats.gamesWon'] = increment(1);
                    initialUpdate['stats.totalWins'] = increment(1);
                    initialUpdate['friendsStats.totalWins'] = increment(1);
                } else if (result === 'loss') {
                    initialUpdate['aiStats.gamesLost'] = increment(1);
                    initialUpdate['stats.totalLosses'] = increment(1);
                    initialUpdate['friendsStats.totalLosses'] = increment(1);
                } else if (result === 'draw') {
                    initialUpdate['aiStats.draws'] = increment(1);
                    initialUpdate['stats.draws'] = increment(1);
                    initialUpdate['friendsStats.draws'] = increment(1);
                }

                await updateDoc(userRef, initialUpdate);

                // Step 2: Recalculate percentages and elo based on current snapshot
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const stats = data.stats || {};
                    const aiStats = data.aiStats || {};

                    const totalWins = stats.totalWins || 0;
                    const totalGames = stats.totalGames || 0;
                    const aiWins = aiStats.gamesWon || 0;
                    const aiGames = aiStats.gamesPlayed || 0;

                    const currentElo = stats.elo || stats.rating || 1200;
                    let newElo = currentElo;
                    if (result === 'win') newElo += 15;
                    else if (result === 'draw') newElo += 5;
                    else if (result === 'loss') newElo -= 10;
                    newElo = Math.max(800, newElo);

                    const winPct = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
                    const aiWinPct = aiGames > 0 ? Math.round((aiWins / aiGames) * 100) : 0;
                    const newLevel = 1 + (totalGames / 10);

                    const complexUpdate = {
                        'stats.winPercentage': winPct,
                        'stats.rating': newElo,
                        'stats.elo': newElo,
                        'aiStats.winPercentage': aiWinPct,
                        'friendsStats.winPercentage': winPct,
                        'friendsStats.rating': newElo,
                        'friendsStats.elo': newElo,
                        'level': newLevel
                    };

                    await updateDoc(userRef, complexUpdate);

                    // Fallback local update
                    setLocalStats({
                        gamesPlayed: aiGames,
                        gamesWon: aiWins,
                        gamesLost: aiStats.gamesLost || 0,
                        draws: aiStats.draws || 0,
                        winPercentage: aiWinPct
                    });
                }

                const gameHistoryEntry: Omit<GameHistory, 'playedAt'> & { playedAt: FieldValue } = {
                    gameId: gameId,
                    opponent: { uid: 'ai', name: `AI (${currentAiLevel})`, photoURL: '' },
                    result: result,
                    playedAt: serverTimestamp(),
                    gameType: 'AI'
                };
                await setDoc(doc(collection(db, 'users', currentUser.uid, 'gameHistory'), gameId), gameHistoryEntry);

                await checkAndUnlockAchievements(result);

            } catch (error) {
                console.error("Error updating AI game results:", error);
            }
        }
    }, [gameResult, currentUser, currentAiLevel, checkAndUnlockAchievements, playSound]);

    const checkGameState = useCallback((currentGame: Chess) => {
        if (currentGame.isGameOver()) {
            if (currentGame.isCheckmate()) handleGameEnd(currentGame.turn() === 'b' ? 'win' : 'loss');
            else if (currentGame.isDraw() || currentGame.isStalemate() || currentGame.isThreefoldRepetition() || currentGame.isInsufficientMaterial()) handleGameEnd('draw');
            return true;
        }
        return false;
    }, [handleGameEnd]);

    const processMove = (move: Move) => {
        if (move.captured) {
            const capturedPiece: Piece = { type: move.captured, color: move.color === 'w' ? 'b' : 'w' };
            setCapturedPieces(prev => ({
                ...prev,
                [move.color === 'w' ? 'b' : 'w']: [...prev[move.color === 'w' ? 'b' : 'w'], capturedPiece].sort((a, b) => getPieceValue(b.type) - getPieceValue(a.type))
            }));
        }
    };
    
    const makeAiMove = useCallback(() => {
        if (checkGameState(gameRef.current) || gameRef.current.turn() === 'w') return;
        setIsThinking(true);
        setTimeout(() => {
            const move = getAiMove(gameRef.current);
            if (move) {
                const gameCopy = new Chess(gameRef.current.fen());
                const fullMove = gameCopy.move(move);
                if (fullMove) {
                    if (gameCopy.isCheckmate()) {
                        // handled in checkGameState -> handleGameEnd
                    } else if (gameCopy.inCheck()) {
                        playSound('check');
                    } else if (fullMove.captured) {
                        playSound('capture');
                    } else {
                        playSound('move');
                    }

                    gameRef.current = gameCopy;
                    setFen(gameCopy.fen());
                    processMove(fullMove);
                    checkGameState(gameCopy);
                }
            }
            setIsThinking(false);
        }, 1200);
    }, [checkGameState]);
    
    const makeAMove = (move: { from: Square; to: Square; promotion?: string }) => {
        const gameCopy = new Chess(gameRef.current.fen());
        try {
            const result = gameCopy.move(move);
            if (result) {
                if (gameCopy.isCheckmate()) {
                    // handled in checkGameState -> handleGameEnd
                } else if (gameCopy.inCheck()) {
                    playSound('check');
                } else if (result.captured) {
                    playSound('capture');
                } else {
                    playSound('move');
                }

                gameRef.current = gameCopy;
                setFen(gameCopy.fen());
                processMove(result);
                if (!checkGameState(gameCopy)) makeAiMove();
            }
            return result;
        } catch (e) {
            return null;
        }
    }

    const onPromotionSelect = (piece: string) => {
        if (pendingMove) {
            makeAMove({ ...pendingMove, promotion: piece });
            setPendingMove(null);
            setMoveExpectsPromotion(false);
        }
    };

    const getMoveOptions = (square: Square) => {
        const moves = gameRef.current.moves({ square, verbose: true });
        if (moves.length === 0 || gameRef.current.get(square)?.color !== gameRef.current.turn()) {
            setOptionSquares({});
            setFromSquare(null);
            return false;
        }
        const newSquares: { [key: string]: React.CSSProperties } = {};
        moves.forEach(move => {
            newSquares[move.to] = {
                background: gameRef.current.get(move.to) && gameRef.current.get(move.to)?.color !== gameRef.current.get(square)?.color
                    ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, #4A90E2 85%)' : 'radial-gradient(circle, #4A90E2 30%, transparent 30%)',
                borderRadius: '50%',
            };
        });
        newSquares[square] = { background: 'rgba(74, 144, 226, 0.4)' };
        setOptionSquares(newSquares);
        return true;
    }

    const checkPromotion = (from: Square, to: Square) => {
        const piece = gameRef.current.get(from);
        if (piece?.type === 'p') {
            if ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1')) {
                return true;
            }
        }
        return false;
    };

    const onSquareClick = (square: Square) => {
        if (gameRef.current.turn() !== 'w' || isThinking || gameResult || moveExpectsPromotion) return;
        if (!fromSquare) {
            if (getMoveOptions(square)) setFromSquare(square);
            return;
        }
        if (fromSquare === square) {
            setFromSquare(null);
            setOptionSquares({});
            return;
        }

        if (checkPromotion(fromSquare, square)) {
            const moves = gameRef.current.moves({ square: fromSquare, verbose: true });
            if (moves.some(m => m.to === square)) {
                setPendingMove({ from: fromSquare, to: square });
                setMoveExpectsPromotion(true);
                setFromSquare(null);
                setOptionSquares({});
                return;
            }
        }

        if (makeAMove({ from: fromSquare, to: square, promotion: 'q' }) === null) {
            if (getMoveOptions(square)) setFromSquare(square);
        } else {
           setFromSquare(null);
           setOptionSquares({});
        }
    }
    
    const onSquareRightClick = () => {
        setOptionSquares({});
        setFromSquare(null);
    }
    
    const onDrop = (sourceSquare: Square, targetSquare: Square) => {
        if (isThinking || gameResult || moveExpectsPromotion) return false;
        
        if (checkPromotion(sourceSquare, targetSquare)) {
            const moves = gameRef.current.moves({ square: sourceSquare, verbose: true });
            if (moves.some(m => m.to === targetSquare)) {
                setPendingMove({ from: sourceSquare, to: targetSquare });
                setMoveExpectsPromotion(true);
                return true;
            }
            return false;
        }

        if (makeAMove({ from: sourceSquare, to: targetSquare, promotion: 'q' }) === null) return false;
        setFromSquare(null);
        setOptionSquares({});
        return true;
    }

    const resetGame = (isNewGame: boolean = true) => {
        if (isNewGame) {
          gameRef.current = new Chess();
          setFen(gameRef.current.fen());
        }
        setGameResult(null);
        setCapturedPieces({ w: [], b: [] });
        setFromSquare(null);
        setOptionSquares({});
        setIsThinking(false);
        setMoveExpectsPromotion(false);
        setPendingMove(null);
    };
    
    const handleResetStats = async () => {
        if (!currentUser) return;
        setResetStatsDialogOpen(false);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                aiStats: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    gamesLost: 0,
                    draws: 0,
                    winPercentage: 0,
                    level: 'Easy'
                }
            });
            setLocalStats({ gamesPlayed: 0, gamesWon: 0, gamesLost: 0, draws: 0, winPercentage: 0 });
            resetGame(true);
        } catch (error) {
            console.error("Error resetting stats:", error);
        }
    };

    const checkSquares = useMemo(() => {
        const squares: { [key: string]: React.CSSProperties } = {};
        if (gameRef.current.inCheck()) {
            const turn = gameRef.current.turn();
            const board = gameRef.current.board();
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
            const history = gameRef.current.history({ verbose: true });
            if (history.length > 0) {
                const lastMove = history[history.length - 1];
                squares[lastMove.to] = { backgroundColor: 'rgba(255, 0, 0, 0.5)' };
            }
        }
        return squares;
    }, [fen]);
    
    const customPieces = useMemo(() => {
        const pieceRenderer = (piece: string, color: string, isBlack: boolean = false) => ({ squareWidth }: { squareWidth: number }) => (
            <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: squareWidth * 0.75, color: color, textShadow: isBlack ? '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, -2px -2px 5px rgba(0,0,0,0.3)' : '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                {piece}
            </div>
        );
        return {
            wK: pieceRenderer(pieceComponents.wK, '#FFFFFF'), wQ: pieceRenderer(pieceComponents.wQ, '#FFFFFF'), wR: pieceRenderer(pieceComponents.wR, '#FFFFFF'), wB: pieceRenderer(pieceComponents.wB, '#FFFFFF'), wN: pieceRenderer(pieceComponents.wN, '#FFFFFF'), wP: pieceRenderer(pieceComponents.wP, '#FFFFFF'),
            bK: pieceRenderer(pieceComponents.bK, '#1A1A1A', true), bQ: pieceRenderer(pieceComponents.bQ, '#1A1A1A', true), bR: pieceRenderer(pieceComponents.bR, '#1A1A1A', true), bB: pieceRenderer(pieceComponents.bB, '#1A1A1A', true), bN: pieceRenderer(pieceComponents.bN, '#1A1A1A', true), bP: pieceRenderer(pieceComponents.bP, '#1A1A1A', true),
        };
    }, []);

    if (loading && !currentUser) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 0.5, pt: 0, display: 'flex', flexDirection: 'column', height: { md: 'calc(100vh - 160px)' }, overflowX: 'hidden' }}>
            <Grid container spacing={isMobile ? 0.5 : 1} justifyContent="center" alignItems="center" sx={{ flexGrow: 1, mt: 0 }}>
                <Grid item xs={12} md={7} lg={8} ref={chessboardContainerRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                    <Box sx={{ width: boardWidth * 0.9 }}>
                        <CapturedPieces title={isThinking ? "AI is thinking..." : "AI's Captures"} pieces={capturedPieces.w} />
                    </Box>
                    <Paper elevation={10} sx={{ p: 0.4, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                        <Chessboard 
                            position={fen} 
                            onPieceDrop={onDrop} 
                            onSquareClick={onSquareClick} 
                            onSquareRightClick={onSquareRightClick} 
                            customSquareStyles={{ ...optionSquares, ...checkSquares }} 
                            customPieces={customPieces} 
                            boardWidth={boardWidth} 
                            customBoardStyle={{ borderRadius: '6px', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.5)' }} 
                            customDarkSquareStyle={{ backgroundColor: '#6B3F23' }} 
                            customLightSquareStyle={{ backgroundColor: '#EAD8C3' }} 
                        />
                    </Paper>
                    <Box sx={{ width: boardWidth * 0.9 }}>
                        <CapturedPieces title="Your Captures" pieces={capturedPieces.b} variant="light" />
                    </Box>
                </Grid>

                <Grid item xs={12} md={5} lg={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: { md: '100%' } }}>
                    <Paper elevation={10} sx={{ p: 2, background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white', textAlign: 'center', position: 'relative' }}>
                        <Stack spacing={1} alignItems="center">
                            <Box sx={{ width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ChessIcon />
                            </Box>
                            <Box>
                                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontFamily: 'Orbitron', color: '#FFA500', fontWeight: 'bold', mb: 0.5 }}>PLAY WITH AI</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>Level: <span style={{ color: '#FFA500', fontWeight: 'bold' }}>{currentAiLevel}</span></Typography>
                            </Box>
                            
                            <Box sx={{ width: '100%', py: 1, px: 1, borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Total: <span style={{ color: '#FFA500', fontWeight: 'bold' }}>{localStats.gamesPlayed}</span></Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Wins: <span style={{ color: '#32CD32', fontWeight: 'bold' }}>{localStats.gamesWon}</span></Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Losses: <span style={{ color: '#FF6347', fontWeight: 'bold' }}>{localStats.gamesLost}</span></Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Draws: <span style={{ color: '#888', fontWeight: 'bold' }}>{localStats.draws}</span></Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Win%: <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{localStats.winPercentage}%</span></Typography>
                            </Box>
                        </Stack>
                    </Paper>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2, mb: { xs: 4, md: 0 } }}>
                         <Button variant="contained" onClick={() => resetGame(true)} sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#66BB6A' }, fontFamily: 'Orbitron', fontSize: '0.8rem', padding: '5px 12px' }}>New Game</Button>
                        <Button variant="contained" onClick={handleResetStats} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#E57373' }, fontFamily: 'Orbitron', fontSize: '0.8rem', padding: '5px 12px' }} disabled={isUpdating}>
                            {isUpdating ? <CircularProgress size={20} color="inherit" /> : 'Reset Stats'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            
            <ConfirmationDialog open={isResetStatsDialogOpen} onClose={() => setResetStatsDialogOpen(false)} onConfirm={handleResetStats} title="Reset Statistics?" description="Are you sure you want to reset all your AI game stats? This action cannot be undone." />

            <Modal open={!!gameResult} onClose={() => setGameResult(null)} sx={{ backdropFilter: 'blur(5px)' }}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400, md: 500 }, bgcolor: '#1a1a2e', border: '2px solid #FFA500', borderRadius: '20px', boxShadow: 24, p: 4, textAlign: 'center', color: 'white' }}>
                    {gameResult === 'win' ? (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Typography variant="h3" sx={{ fontFamily: 'Orbitron', color: '#FFD700' }}>🎉 Congratulations! 🎉</Typography>
                            <Typography variant="h1" sx={{ my: 2 }}>🏆</Typography>
                            <Typography variant="h6">You are one step closer to becoming a grandmaster!</Typography>
                        </motion.div>
                    ) : gameResult === 'loss' ? (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Typography variant="h4" sx={{ fontFamily: 'Orbitron', color: '#FF6347' }}>Don&apos;t give up!</Typography>
                            <Typography variant="h6" sx={{ my: 3 }}>&quot;Every master was once a beginner.&quot;</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button variant="contained" href="/tutorials" sx={{ bgcolor: '#1E90FF' }}>Learn</Button>
                                <Button variant="contained" onClick={() => { setGameResult(null); resetGame(true); }} sx={{ bgcolor: '#32CD32' }}>Try Again</Button>
                            </Box>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Typography variant="h4">It&apos;s a Draw!</Typography>
                        </motion.div>
                    )}
                     <Button onClick={() => { setGameResult(null); resetGame(true); }} sx={{ mt: 4, color: 'white' }}>Play Again</Button>
                </Box>
            </Modal>

            <Dialog open={moveExpectsPromotion} disableEscapeKeyDown>
                <DialogTitle sx={{ textAlign: 'center', bgcolor: '#1e293b', color: 'white' }}>Promote Pawn To:</DialogTitle>
                <DialogContent sx={{ bgcolor: '#1e293b', p: 3 }}>
                    <Stack direction="row" spacing={3} justifyContent="center">
                        <IconButton onClick={() => onPromotionSelect('q')} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <span style={{ fontSize: '40px' }}>{pieceComponents.wQ}</span>
                        </IconButton>
                        <IconButton onClick={() => onPromotionSelect('r')} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <span style={{ fontSize: '40px' }}>{pieceComponents.wR}</span>
                        </IconButton>
                        <IconButton onClick={() => onPromotionSelect('b')} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <span style={{ fontSize: '40px' }}>{pieceComponents.wB}</span>
                        </IconButton>
                        <IconButton onClick={() => onPromotionSelect('n')} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                            <span style={{ fontSize: '40px' }}>{pieceComponents.wN}</span>
                        </IconButton>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PlayAI;