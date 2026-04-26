import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
    Container, Paper, Box, CircularProgress, Grid, Typography, Button, Stack, Divider, List, ListItem, ListItemText, Avatar, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { usePlayFriends } from '../hooks/usePlayFriends';
import { useTournamentGame } from '../hooks/useTournamentGame';
import { UserProfile, GameData } from '../types';
import GameInfo from '../components/game/GameInfo';
import Chat from '../components/game/Chat';
import GameOverModal from '../components/game/GameOverModal';
import PieceRenderer from '../components/game/PieceRenderer';
import CapturedPieces from '../components/CapturedPieces';

const PromotionDialog = ({ open, onSelect, color }: { open: boolean, onSelect: (piece: string) => void, color: 'w' | 'b' }) => {
    const pieces = [
        { type: 'q', label: 'Queen' },
        { type: 'r', label: 'Rook' },
        { type: 'b', label: 'Bishop' },
        { type: 'n', label: 'Knight' }
    ];

    return (
        <Dialog open={open} PaperProps={{ sx: { bgcolor: '#1a1a2e', color: 'white', borderRadius: '12px', border: '1px solid #c9a35e' } }}>
            <DialogTitle align="center" sx={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>Promote Pawn</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ py: 2 }}>
                    {pieces.map((p) => {
                        const pieceKey = (color + p.type.toUpperCase()) as keyof typeof PieceRenderer;
                        const PieceComponent = PieceRenderer[pieceKey];
                        return (
                            <Box key={p.type} onClick={() => onSelect(p.type)} sx={{ 
                                cursor: 'pointer', 
                                p: 1, 
                                borderRadius: '8px', 
                                '&:hover': { bgcolor: 'rgba(201, 163, 94, 0.2)' },
                                textAlign: 'center'
                            }}>
                                <Box sx={{ width: 60, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <PieceComponent squareWidth={60} isDraggable={false} square="a1" />
                                </Box>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#c9a35e' }}>{p.label}</Typography>
                            </Box>
                        );
                    })}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

const PlayerInfoBox = ({ name, photoURL, timer, isCurrentUser, isTurn, gameStatus }: { name: string, photoURL?: string, timer: number, isCurrentUser?: boolean, isTurn?: boolean, gameStatus: string }) => (
    <Box sx={{
        width: '100%',
        p: 1.5,
        background: isCurrentUser ? '#4a3f2b' : '#201d2d',
        borderRadius: '8px',
        border: isCurrentUser ? '1px solid #c9a35e' : '1px solid #201d2d',
        transition: 'all 0.3s ease'
    }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={photoURL} sx={{ width: 32, height: 32, bgcolor: '#444' }} />
                <Typography variant="subtitle2" noWrap color="#e0e0e0">{name || 'Opponent'}</Typography>
                {isTurn && gameStatus === 'active' && <Typography sx={{ color: '#66bb6a', fontWeight: 'bold', ml: 1, fontSize: '0.75rem' }}>Your Turn</Typography>}
            </Stack>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', background: '#1a1a1a', color: '#e0e0e0', p: '2px 8px', borderRadius: 1 }}>
                {timer ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` : '-'}
            </Typography>
        </Stack>
    </Box>
  );

const GameRoom = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGameData = async () => {
            const gameDoc = await getDoc(doc(db, 'games', gameId!));
            if (gameDoc.exists()) {
                setGameData(gameDoc.data() as GameData);
            }
            setLoading(false);
        };
        fetchGameData();
    }, [gameId]);

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Container>;
    }

    if (!gameData) {
        return <Typography>Game not found</Typography>;
    }

    return gameData.tournamentId ? <TournamentGame gameData={gameData} /> : <FriendlyGame gameData={gameData} />;
};

const FriendlyGame = ({ gameData: initialGameData }: { gameData: GameData }) => {
    const { gameId } = useParams<{ gameId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const {
        game,
        gameData,
        capturedBy,
        gameResult,
        isModalOpen,
        onSquareClick,
        optionSquares,
        closeModal,
        boardOrientation,
        startNewGame,
        pendingPromotion,
        resolvePromotion
    } = usePlayFriends(gameId!, initialGameData)

    const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
    const [boardWidth, setBoardWidth] = useState(440);
    const chessboardContainerRef = useRef<HTMLDivElement>(null);

    const opponentId = useMemo(() => {
        if (!gameData || !currentUser) return null;
        return gameData.players.white === currentUser.uid ? gameData.players.black : gameData.players.white;
    }, [gameData?.players, currentUser]);

    useEffect(() => {
        const handleResize = () => {
            if (chessboardContainerRef.current) {
                setBoardWidth(Math.min(chessboardContainerRef.current.offsetWidth, 440));
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (opponentId) {
            getDoc(doc(db, 'users', opponentId)).then(userDoc => {
                if (isMounted && userDoc.exists()) {
                    setOpponentProfile({ ...userDoc.data(), uid: opponentId } as UserProfile);
                }
            });
        } else {
            if (isMounted) setOpponentProfile(null);
        }
        return () => { isMounted = false; };
    }, [opponentId]);
    
    const handleSendMessage = useCallback(async (message: string) => {
        if (message.trim() && gameId && currentUser) {
            await updateDoc(doc(db, 'games', gameId), { chat: arrayUnion({ senderId: currentUser.uid, senderName: currentUser.displayName || 'Anonymous', message, timestamp: new Date() }) });
        }
    }, [gameId, currentUser]);

    const handleGoBack = useCallback(() => {
        navigate('/play/friends');
    }, [navigate]);

    if (!gameData || !currentUser) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Container>;
    }

    const displayOpponent = opponentProfile || { displayName: 'Waiting...', photoURL: '', uid: 'placeholder' };

    const isMyTurn = (game.turn() === 'w' && gameData?.players?.white === currentUser.uid) || (game.turn() === 'b' && gameData?.players?.black === currentUser.uid);
    const gameStatus = !opponentId || gameData.status === 'waiting' 
        ? 'Waiting for opponent...' 
        : game.isGameOver() 
        ? 'Game Over' 
        : isMyTurn 
        ? "Your Turn" 
        : `${displayOpponent.displayName}’s Turn`;

    const yourColor = boardOrientation === 'white' ? 'w' : 'b';
    const opponentColor = boardOrientation === 'white' ? 'b' : 'w';
    
    const yourColorKey = boardOrientation === 'white' ? 'white' : 'black';
    const opponentColorKey = boardOrientation === 'white' ? 'black' : 'white';

    return (
        <Box sx={{ p: 0.5 }}>
            <Grid container spacing={1} justifyContent="center" alignItems="flex-start">
                <Grid item xs={12} md={7} lg={8} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: '440px' }}>
                        <CapturedPieces sx={{mb:0.5}} title={`${displayOpponent.displayName} Captures`} pieces={capturedBy[opponentColorKey]} capturedPiecesColor={yourColor} />
                        <Paper ref={chessboardContainerRef} elevation={10} sx={{ background: 'transparent', width: '100%' }}>
                            <Chessboard position={game.fen()} arePiecesDraggable={true} onSquareClick={onSquareClick} customSquareStyles={optionSquares} boardWidth={boardWidth} boardOrientation={boardOrientation} customPieces={PieceRenderer} customBoardStyle={{ borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }} customDarkSquareStyle={{ backgroundColor: '#6B3F23' }} customLightSquareStyle={{ backgroundColor: '#EAD8C3' }} />
                        </Paper>
                        <CapturedPieces sx={{mt:0.5}} title="Your Captures" pieces={capturedBy[yourColorKey]} capturedPiecesColor={opponentColor} />
                    </Box>
                </Grid>

                <Grid item xs={12} md={5} lg={4}>
                    <Paper elevation={10} sx={{ p: 1.5, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
                       <GameInfo isTournamentGame={false} currentUser={currentUser} opponentProfile={displayOpponent} isMyTurn={isMyTurn} gameStatus={gameStatus} />
                    </Paper>
                    <Paper sx={{ p: 1, mt: 1.5, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white', height: '220px', display: 'flex', flexDirection: 'column' }}>
                        <Chat chat={gameData.chat || []} currentUser={currentUser} handleSendMessage={handleSendMessage} />
                    </Paper>
                </Grid>
            </Grid>

            <GameOverModal isOpen={isModalOpen} onClose={closeModal} gameResult={gameResult} isTournamentGame={false} handleGoBack={handleGoBack} startNewGame={startNewGame} />
            
            <PromotionDialog 
                open={!!pendingPromotion} 
                onSelect={(piece) => resolvePromotion && resolvePromotion(piece)} 
                color={game.turn()} 
            />
        </Box>
    );
};

const TournamentGame = ({ gameData: initialGameData }: { gameData: GameData }) => {
    const { gameId } = useParams<{ gameId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { 
        game, 
        gameData, 
        timers, 
        error, 
        capturedBy, 
        gameResult, 
        isModalOpen, 
        drawOffer, 
        optionSquares, 
        lastMoveSquares, 
        onSquareClick, 
        closeModal, 
        resign, 
        offerDraw, 
        acceptDraw, 
        declineDraw, 
        isMyTurn,
        pendingPromotion,
        resolvePromotion
    } = useTournamentGame(gameId!, initialGameData);

    const [boardWidth, setBoardWidth] = useState(480);
    const chessboardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function updateSize() {
          if (chessboardRef.current) {
              const containerWidth = chessboardRef.current.offsetWidth;
              const containerHeight = window.innerHeight - 350;
              setBoardWidth(Math.min(containerWidth, containerHeight, 600));
          }
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
      }, []);

    const orientation = useMemo(() => {
        if (!gameData || !currentUser) return 'white';
        return gameData.players.white === currentUser.uid ? 'white' : 'black';
    }, [gameData, currentUser]);

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#201d2d', color: 'white' }}>
                <Typography variant="h5" gutterBottom>{error}</Typography>
                <Button variant="contained" onClick={() => navigate('/tournaments')}>Back to Tournaments</Button>
            </Box>
        );
    }

    if (!gameData || !gameData.playerNames) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Container>;
    }

    const { playerNames, moves, status } = gameData;
    const whitePlayerName = playerNames.white || 'Waiting for opponent...';
    const blackPlayerName = playerNames.black || 'Player';

    const opponentPlayerName = orientation === 'white' ? blackPlayerName : whitePlayerName;
    const currentPlayerName = orientation === 'white' ? whitePlayerName : blackPlayerName;
    const opponentColor = orientation === 'white' ? 'b' : 'w';
    const yourColor = orientation === 'white' ? 'w' : 'b';

    return (
        <Box sx={{ p: 1 }}>
            <Grid container spacing={1} justifyContent="center" alignItems="flex-start">
                <Grid item xs={12} md={8} sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}} ref={chessboardRef}>
                    <CapturedPieces sx={{mb: 1}} title={`${opponentPlayerName} Captures`} pieces={capturedBy[yourColor]} capturedPiecesColor={yourColor} />
                    <Paper elevation={10} sx={{ p: 1, background: '#2c2a3a', borderRadius: '15px', display: 'inline-block' }}>
                        <Chessboard 
                            boardWidth={boardWidth} 
                            position={game.fen()} 
                            onSquareClick={onSquareClick} 
                            boardOrientation={orientation} 
                            customBoardStyle={{ borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }} 
                            customDarkSquareStyle={{ backgroundColor: '#764f3a' }} 
                            customLightSquareStyle={{ backgroundColor: '#e9d9b9' }} 
                            customSquareStyles={{...optionSquares, ...lastMoveSquares}}
                            isDraggablePiece={({piece}) => piece[0] === orientation[0]}
                        />
                    </Paper>
                    <CapturedPieces sx={{mt: 1}} title="Your Captures" pieces={capturedBy[opponentColor]} capturedPiecesColor={opponentColor} />
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 1.5, background: '#2c2a3a', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" align="center" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif', color: '#33C3FF', fontSize: '1.1rem' }}>
                            Tournament Match
                        </Typography>
                       
                        <Stack spacing={1} sx={{my: 1.5}}>
                            <PlayerInfoBox name={opponentPlayerName} timer={timers[opponentColor.charAt(0)]} isTurn={!isMyTurn} gameStatus={status} />
                            <PlayerInfoBox name={currentPlayerName} timer={timers[yourColor.charAt(0)]} isCurrentUser={true} isTurn={isMyTurn} gameStatus={status} />
                        </Stack>
                       
                        <Divider sx={{ borderColor: '#444', my: 1 }} />

                        <Typography variant="subtitle2" sx={{mt: 1, mb: 0.5, color: '#9e9e9e'}}>Move History</Typography>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', background: '#201d2d', borderRadius: 2, p: 1, minHeight: '120px' }}>
                            <List dense>
                               {moves?.map((move: any, index: number) => (
                                    <ListItem key={index} sx={{ py: 0.1, my: 0 }}>
                                        <ListItemText primary={`${Math.floor(index / 2) + 1}. ${move.san}`} primaryTypographyProps={{ style: { color: '#b0b0b0', fontSize: '0.8rem' } }} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                       
                        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1.5 }}>
                            {drawOffer && drawOffer.to === currentUser?.uid ? (
                                <>
                                    <Button size="small" variant="contained" onClick={acceptDraw}>Accept</Button>
                                    <Button size="small" variant="outlined" onClick={declineDraw}>Decline</Button>
                                </>
                            ) : (
                                <>
                                    <Button size="small" variant="contained" onClick={resign} disabled={status !== 'active'}>Resign</Button>
                                    <Button size="small" variant="contained" onClick={offerDraw} disabled={status !== 'active' || !!drawOffer}>{drawOffer ? "Offered" : "Offer Draw"}</Button>
                                </>
                            )}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
            {isModalOpen && (
                <GameOverModal isOpen={isModalOpen} onClose={closeModal} gameResult={{message: gameResult, result: 'win'}} isTournamentGame={true} handleGoBack={() => navigate(`/tournaments/${gameData.tournamentId}`)} />
            )}
            
            <PromotionDialog 
                open={!!pendingPromotion} 
                onSelect={(piece) => resolvePromotion && resolvePromotion(piece)} 
                color={game.turn()} 
            />
        </Box>
    );
};

export default GameRoom;