import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentGame } from '../hooks/useTournamentGame';
import { Chessboard } from 'react-chessboard';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Flag, Handshake, Check, Close, EmojiEvents, SentimentVeryDissatisfied, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CapturedPieces from '../components/CapturedPieces';
import Chat from '../components/game/Chat';
import PieceRenderer from '../components/game/PieceRenderer';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const PlayerInfoBox = ({ name, photoURL, timer, isCurrentUser, isTurn, gameStatus }: { name: string, photoURL?: string, timer: number, isCurrentUser?: boolean, isTurn?: boolean, gameStatus: string }) => {
    const displayTime = useMemo(() => {
        if (typeof timer !== 'number' || isNaN(timer) || timer < 0) return '00:00';
        const minutes = Math.floor(timer / 60);
        const seconds = Math.floor(timer % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [timer]);

    return (
        <Paper elevation={3} sx={{
            width: '100%',
            p: 1.5,
            background: isTurn && gameStatus === 'active' ? 'rgba(255, 215, 0, 0.15)' : (isCurrentUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'),
            borderRadius: '12px',
            border: isTurn && gameStatus === 'active' ? '2px solid #FFD700' : (isCurrentUser ? '1px solid #777' : '1px solid #444'),
            boxShadow: isTurn && gameStatus === 'active' ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none',
            transition: 'all 0.3s ease-in-out'
        }}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={photoURL} sx={{ width: 40, height: 40, border: isTurn && gameStatus === 'active' ? '2px solid #FFD700' : 'none' }} />
                    <Box>
                        <Typography variant="subtitle1" noWrap color={isTurn && gameStatus === 'active' ? '#FFD700' : "#e0e0e0"} sx={{ fontWeight: 600 }}>{name || 'Player'}</Typography>
                        {isTurn && gameStatus === 'active' && (
                            <Typography sx={{ color: '#FFD700', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>{isCurrentUser ? 'Your Turn' : 'Thinking...'}</Typography>
                        )}
                    </Box>
                </Stack>
                <Typography variant="h5" sx={{ fontFamily: 'monospace', background: '#111', color: isTurn ? '#FFD700' : '#e0e0e0', p: '4px 12px', borderRadius: 2, border: isTurn ? '1px solid #FFD700' : '1px solid #333' }}>
                    {displayTime}
                </Typography>
            </Stack>
        </Paper>
    );
};

const getMoveText = (move: any): string => {
    if (move && typeof move.san === 'string') return move.san;
    if (typeof move === 'string') return move;
    return "..."; 
};

const LiveTournamentGame = () => {
  const { tournamentId, gameId } = useParams<{ tournamentId: string, gameId: string }>();
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
      onSquareClick,
      onPieceDrop,
      closeModal,
      resign,
      offerDraw,
      acceptDraw,
      declineDraw,
      isMyTurn,
      loading: hookLoading,
      optionSquares,
      boardOrientation: orientation,
      pendingPromotion, 
      resolvePromotion,
      myColor: userColor,
      playerDetails
  } = useTournamentGame(gameId!, tournamentId);

  const [boardWidth, setBoardWidth] = useState(320);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 900;
      
      let newSize;
      if (isMobile) {
        newSize = Math.min(width * 0.95, height * 0.5);
      } else {
        newSize = Math.min(width * 0.45, height * 0.7, 560);
      }
      setBoardWidth(Math.max(250, newSize));
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    
    const timer = setTimeout(updateSize, 100);
    
    return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
        clearTimeout(timer);
    };
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (message.trim() && gameId && currentUser) {
        await updateDoc(doc(db, 'games', gameId), { 
            chat: arrayUnion({ senderId: currentUser.uid, senderName: currentUser.displayName || 'Anonymous', message, timestamp: new Date() }) 
        });
    }
  }, [gameId, currentUser]);

  const renderGameResultIcon = useCallback(() => {
    if (!gameResult) return null;
    if (gameResult.includes('won')) return <EmojiEvents sx={{ fontSize: 60, color: '#FFD700' }} />;
    if (gameResult.includes('lost')) return <SentimentVeryDissatisfied sx={{ fontSize: 60, color: '#C62828' }} />;
    if (gameResult.includes('draw')) return <Handshake sx={{ fontSize: 60, color: '#61DAFB' }} />;
    return null;
  }, [gameResult]);

  const handleCloseModal = useCallback(() => {
    closeModal();
    if (gameData?.tournamentId === 'daily-knockout') {
        navigate('/daily-knockout');
    } else {
        navigate('/tournaments');
    }
  }, [closeModal, navigate, gameData?.tournamentId]);

  if (hookLoading || !playerDetails.white || !playerDetails.black) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1A1A2E' }}><CircularProgress color="warning" /></Box>;

  if (error || !gameData) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1A1A2E', color: 'white' }}>
        <Typography variant="h5">{error || "Match is being prepared..."}</Typography>
        <Button variant="contained" onClick={() => navigate('/tournaments')} sx={{ mt: 2 }}>Back to Tournaments</Button>
    </Box>
  );
  
  const myPlayerDetails = orientation === 'white' ? playerDetails.white : playerDetails.black;
  const opponentPlayerDetails = orientation === 'white' ? playerDetails.black : playerDetails.white;

  const myColor = orientation === 'white' ? 'w' : 'b';
  const opponentColor = orientation === 'white' ? 'b' : 'w';

  const promotionPieces = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <Box sx={{ p: 0, m: 0, background: '#1A1A2E', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Grid container sx={{ height: 'auto', flexGrow: 1 }}>
            <Grid item xs={12} md={7} lg={8} ref={boardContainerRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 1, md: 2 }, pt: {xs: 2, md: 2}}}>
                <Box sx={{ width: '100%', maxWidth: boardWidth, opacity: gameData.status === 'waiting' ? 0.5 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CapturedPieces 
                        title={`${opponentPlayerDetails.displayName}'s Captures`} 
                        pieces={capturedBy[myColor]} 
                        capturedPiecesColor={myColor} 
                    />
                    <Paper elevation={10} sx={{ background: 'transparent', width: boardWidth, height: boardWidth, my: 1 }}>
                        <Chessboard 
                            id="TournamentBoard"
                            boardWidth={boardWidth} 
                            position={game.fen()} 
                            onPieceDrop={onPieceDrop}
                            onSquareClick={onSquareClick}
                            boardOrientation={orientation}
                            arePiecesDraggable={gameData.status === 'active' || gameData.status === 'ongoing'}
                            customPieces={PieceRenderer}
                            customSquareStyles={optionSquares}
                            customBoardStyle={{ borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }}
                            customDarkSquareStyle={{ backgroundColor: '#6B3F23' }}
                            customLightSquareStyle={{ backgroundColor: '#EAD8C3' }}
                        />
                    </Paper>
                    <CapturedPieces 
                        title="Your Captures" 
                        pieces={capturedBy[opponentColor]} 
                        capturedPiecesColor={opponentColor} 
                    />
                </Box>
            </Grid>

            <Grid item xs={12} md={5} lg={4} sx={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ p: { xs: 1, md: 2 }, background: '#282C34', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <IconButton onClick={() => navigate(-1)} sx={{ color: '#61DAFB' }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" sx={{ color: '#61DAFB', flexGrow: 1, textAlign: 'center', fontFamily: 'Orbitron', mr: 5, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>Match #{gameId?.split('-m')[1] || ''}</Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mb: 1 }}>
                        {gameData.status === 'waiting' ? (
                            <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>WAITING FOR OPPONENT...</Typography>
                        ) : (
                            <Typography variant="subtitle2" sx={{ color: isMyTurn ? '#4CAF50' : '#999', fontWeight: 'bold' }}>
                                {(gameData.status === 'active' || gameData.status === 'ongoing') ? (isMyTurn ? "YOUR TURN" : "OPPONENT'S TURN") : "GAME OVER"}
                            </Typography>
                        )}
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2, opacity: gameData.status === 'waiting' ? 0.6 : 1 }}>
                        <PlayerInfoBox name={opponentPlayerDetails.displayName} photoURL={opponentPlayerDetails.photoURL} timer={timers[opponentColor]} isTurn={!isMyTurn} gameStatus={gameData.status} />
                        <PlayerInfoBox name={myPlayerDetails.displayName} photoURL={myPlayerDetails.photoURL} timer={timers[myColor]} isTurn={isMyTurn} isCurrentUser gameStatus={gameData.status} />
                    </Stack>
                    
                    {drawOffer && drawOffer.to === currentUser?.uid ? (
                        <Paper elevation={4} sx={{ p: 1.5, my: 1, background: '#4CAF50' }}>
                            <Typography align="center" sx={{ mb: 1, fontSize: '0.9rem' }}>{opponentPlayerDetails.displayName} offers a draw.</Typography>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Button startIcon={<Check />} variant="contained" color="success" size="small" onClick={acceptDraw}>Accept</Button>
                                <Button startIcon={<Close />} variant="contained" color="error" size="small" onClick={declineDraw}>Decline</Button>
                            </Stack>
                        </Paper>
                    ) : (
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ my: 1 }}>
                            <Button startIcon={<Flag />} variant="contained" size="small" onClick={resign} disabled={gameData.status !== 'active' && gameData.status !== 'ongoing'} sx={{ bgcolor: '#b71c1c', '&:hover': { bgcolor: '#9a1616' }, flexGrow:1 }}>Resign</Button>
                            <Button startIcon={<Handshake />} variant="contained" size="small" onClick={offerDraw} disabled={(gameData.status !== 'active' && gameData.status !== 'ongoing') || !!drawOffer} sx={{ bgcolor: '#0097a7', '&:hover': { bgcolor: '#007a8a' }, flexGrow:1 }}>Offer Draw</Button>
                        </Stack>
                    )}

                    <Divider sx={{ borderColor: '#555', my: 1 }} />
                    <Typography variant="overline" sx={{ color: '#999', lineHeight: 1 }}>Move History</Typography>
                    <Box sx={{ height: '100px', overflowY: 'auto', background: '#1F2327', p: 1, mb: 2, borderRadius: '4px' }}>
                        <Grid container spacing={0.5}>
                            {gameData.moves?.reduce((acc: any[], move: any, i: number) => {
                                if (i % 2 === 0) acc.push([move]);
                                else acc[acc.length - 1].push(move);
                                return acc;
                            }, []).map((pair: string[], i: number) => (
                                <Grid container item xs={12} key={i} sx={{ borderBottom: '1px solid #333', py: 0.5 }}>
                                    <Grid item xs={2}><Typography variant="body2" sx={{ color: '#666', fontFamily: 'monospace' }}>{i + 1}.</Typography></Grid>
                                    <Grid item xs={5}><Typography variant="body2" sx={{ color: '#ccc', fontWeight: 600 }}>{getMoveText(pair[0])}</Typography></Grid>
                                    <Grid item xs={5}><Typography variant="body2" sx={{ color: '#ccc', fontWeight: 600 }}>{pair[1] ? getMoveText(pair[1]) : ''}</Typography></Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box sx={{ minHeight: '250px', display: 'flex', flexDirection: 'column', background: '#1F2327', borderRadius: '8px', overflow: 'hidden' }}>
                        <Chat chat={gameData.chat || []} currentUser={currentUser} handleSendMessage={handleSendMessage} />
                    </Box>
                </Paper>
            </Grid>
        </Grid>

        <Dialog 
            open={!!pendingPromotion} 
            PaperProps={{ 
                sx: { 
                    background: 'linear-gradient(145deg, #2a2d34, #21252b)',
                    color: 'white',
                    borderRadius: '16px',
                    border: '1px solid #444',
                    p: 2
                } 
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', color: '#61DAFB', fontFamily: 'Orbitron' }}>Promote Pawn</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={2} justifyContent="center">
                    {promotionPieces.map((piece) => (
                        <IconButton 
                            key={piece.type} 
                            onClick={() => resolvePromotion(piece.type as any)}
                            sx={{ 
                                transition: 'all 0.2s',
                                '&:hover': { 
                                    transform: 'scale(1.2)', 
                                    backgroundColor: 'rgba(97, 218, 251, 0.1)',
                                    boxShadow: '0 0 15px rgba(97, 218, 251, 0.4)'
                                } 
                            }}
                        >
                            <Box sx={{ width: 60, height: 60 }}>
                                <PieceRenderer 
                                    isDraggable={false} 
                                    piece={(userColor + piece.type.toUpperCase()) as any} 
                                    squareWidth={60} 
                                />
                            </Box>
                        </IconButton>
                    ))}
                </Stack>
            </DialogContent>
        </Dialog>

        <Dialog 
            open={isModalOpen} 
            onClose={handleCloseModal} 
            disableEscapeKeyDown
            PaperProps={{ 
                sx: { 
                    background: 'linear-gradient(145deg, #2a2d34, #21252b)', 
                    color: 'white', 
                    borderRadius: '16px', 
                    border: '1px solid #444', 
                    minWidth: '320px' 
                } 
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 3 }} component="div"><Typography variant="h4" component="div" sx={{ fontFamily: 'Orbitron', color: '#61DAFB' }}>Game Over</Typography></DialogTitle>
            <DialogContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>{renderGameResultIcon()}</Box>
                <DialogContentText sx={{ color: '#e0e0e0', fontSize: '1.1rem' }}>{gameResult}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={handleCloseModal} variant="contained" sx={{ background: 'linear-gradient(45deg, #61DAFB 30%, #FFD700 90%)', color: '#000', fontWeight: 'bold' }}>Close</Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};

export default LiveTournamentGame;