import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, Container, Paper, Grid, CircularProgress, Modal, List, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, updateDoc, doc, serverTimestamp, getDoc, setDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import ChessIcon from '../components/ChessIcon';
import { UserProfile } from '../types/user';
import { ContentCopy } from '@mui/icons-material';

interface LeaderboardEntry extends UserProfile {
    id: string;
}

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    textAlign: 'center',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    color: 'white',
    borderRadius: '15px'
};

const generateGameId = (length = 9) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const PlayFriends: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [joinGameId, setJoinGameId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [createdGameId, setCreatedGameId] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLeaderboardLoading(false);
      return;
    }

    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (userSnap) => {
      if (!userSnap.exists()) {
        setLeaderboardLoading(false);
        return;
      }

      const userData = userSnap.data();
      const friendUIDs = userData.friends || [];
      const uidsToFetch = [...new Set([currentUser.uid, ...friendUIDs])].filter(id => !!id).slice(0, 30);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('__name__', 'in', uidsToFetch));

      const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
        const playersData = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as LeaderboardEntry));

        playersData.sort((a, b) => (b.friendsStats?.elo || b.stats?.elo || 0) - (a.friendsStats?.elo || a.stats?.elo || 0));
        setLeaderboard(playersData);
        setLeaderboardLoading(false);
      }, (error) => {
        console.error("Error fetching leaderboard snapshot:", error);
        setLeaderboardLoading(false);
      });

      return () => unsubscribeLeaderboard();
    });

    return () => unsubscribeUser();
  }, [currentUser]);

  useEffect(() => {
    if (!createdGameId) return;

    const gameRef = doc(db, 'games', createdGameId);
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'ongoing') {
          toast.success("Friend joined! Starting game...");
          navigate(`/game/${createdGameId}`);
        }
      }
    });

    return () => unsubscribe();
  }, [createdGameId, navigate]);


  const handleCreateGame = useCallback(async () => {
    if (!currentUser) {
      toast.error('You must be logged in to create a game.');
      return;
    }
    try {
        const newGameId = generateGameId();
        const gameRef = doc(db, 'games', newGameId);
        await setDoc(gameRef, {
            players: {
                white: currentUser.uid,
                black: null,
            },
            moves: [],
            status: 'waiting',
            createdAt: serverTimestamp(),
            chat: [],
        });
        setCreatedGameId(newGameId);
        setShowModal(true);
    } catch (error) {
        console.error("Error creating game:", error);
        toast.error('Failed to create game. Please try again.');
    }
  }, [currentUser]);

  const handleJoinGame = useCallback(async () => {
    const trimmedId = joinGameId.trim().toUpperCase();
    if (!trimmedId) {
      toast.error('Please enter a valid Game ID to join.');
      return;
    }
    if (!currentUser) {
      toast.error('You must be logged in to join a game.');
      return;
    }
    try {
        const gameRef = doc(db, 'games', trimmedId);
        
        await runTransaction(db, async (transaction) => {
            const gameDoc = await transaction.get(gameRef);
            if (!gameDoc.exists()) {
                throw new Error("Game not found.");
            }

            const gameData = gameDoc.data();
            if (gameData.status !== 'waiting') {
                throw new Error("Game is already active or has ended.");
            }

            if (gameData.players.white === currentUser.uid) {
                throw new Error("You cannot join your own game.");
            }

            transaction.update(gameRef, {
                'players.black': currentUser.uid,
                status: 'ongoing',
            });
        });

        navigate(`/game/${trimmedId}`);
    } catch (error: any) {
        console.error("Error joining game:", error);
        toast.error(error.message || 'Failed to join game. Please try again.');
    }
  }, [joinGameId, currentUser, navigate]);
  
  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(createdGameId)
            .then(() => toast.success('Game ID copied to clipboard!'))
            .catch(err => {
                console.warn('Clipboard API failed, falling back.', err);
                fallbackCopyToClipboard();
            });
    } else {
        fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
      const textArea = document.createElement('textarea');
      textArea.value = createdGameId;
      textArea.style.position = 'fixed'; 
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
          document.execCommand('copy');
          toast.success('Game ID copied to clipboard!');
      } catch (err) {
          console.error('Fallback copy failed', err);
          toast.error('Failed to copy Game ID.');
      }
      document.body.removeChild(textArea);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 180px)', py: 0, background: '#0F172A' }}>
        <Modal
            open={showModal}
            onClose={() => setShowModal(false)}
            aria-labelledby="game-created-modal-title"
            aria-describedby="game-created-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="game-created-modal-title" variant="h6" component="h2">
                    Game Created!
                </Typography>
                <Typography id="game-created-modal-description" sx={{ mt: 2 }}>
                    Share this ID with your friend:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2, gap: 1 }}>
                    <TextField
                        size="small"
                        value={createdGameId}
                        InputProps={{
                            readOnly: true,
                            style: { color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                        variant="outlined"
                    />
                    <IconButton onClick={copyToClipboard} sx={{ color: 'white' }}>
                        <ContentCopy />
                    </IconButton>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic', opacity: 0.8 }}>
                    Waiting for your friend to join... You will be redirected automatically.
                </Typography>

                <Button variant="contained" color="primary" onClick={() => navigate(`/game/${createdGameId}`)} sx={{ mt: 2, fontFamily: 'Orbitron' }}>
                    Go to Game
                </Button>
            </Box>
        </Modal>

        <Container maxWidth="md" sx={{ p: 0, py: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ mb: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ChessIcon sx={{ mb: 0.5, mt: 0 }} />
                <Typography 
                    variant="h1" 
                    align="center" 
                    sx={{ 
                        fontFamily: 'Orbitron', 
                        fontWeight: 700, 
                        fontSize: '2rem', 
                        background: 'linear-gradient(45deg, #F59E0B, #FBBF24)', 
                        WebkitBackgroundClip: 'text', 
                        WebkitTextFillColor: 'transparent', 
                        mb: 0.8, 
                        mt: 0,
                        textTransform: 'uppercase'
                    }}
                >
                    Play with Friends
                </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center" sx={{ mt: 0 }}>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', width: '100%', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Roboto, sans-serif', color: '#00BFFF', mb: 1, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '1.1rem' }}>Lobby</Typography>
                    
                    <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'white', mb: 1, textAlign: 'center', fontSize: '0.9rem' }}>Create a new game and invite a friend.</Typography>
                    <Button variant="contained" onClick={handleCreateGame} fullWidth size="medium" sx={{ fontFamily: 'Orbitron', py: 1, background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', color: 'white' }}>
                        Create New Game
                    </Button>
                    </Box>

                    <Box>
                    <Typography variant="body2" sx={{ color: 'white', mb: 1, textAlign: 'center', fontSize: '0.9rem' }}>Or join a game using an ID.</Typography>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Enter Game ID"
                        value={joinGameId}
                        onChange={(e) => setJoinGameId(e.target.value)}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, input: { color: 'white' } }}
                    />
                    <Button variant="contained" color="secondary" onClick={handleJoinGame} fullWidth sx={{ mt: 1, fontFamily: 'Orbitron', py: 1 }}>
                        Join Game
                    </Button>
                    </Box>
                </Paper>
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={0} sx={{ p: 1.5, backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', width: '100%', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontFamily: 'Roboto, sans-serif', color: '#00BFFF', mb: 1, textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '1.1rem' }}>Friend Leaderboard</Typography>
                    {leaderboardLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : (
                        <List sx={{ py: 0, flex: 1 }}>
                            {leaderboard.map((player, index) => (
                                <Paper
                                    key={player.id}
                                    elevation={0}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 1,
                                        mb: 1,
                                        background: player.id === currentUser?.uid ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'left', fontWeight: 'bold' }}>#{index + 1}</Typography>
                                    <Typography variant="body2" sx={{ flex: 3, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.displayName}</Typography>
                                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: '#FFA500', fontWeight: 'bold' }}>{Math.round(player.friendsStats?.elo || player.stats?.elo || 1200)}</Typography>
                                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: 'lightgreen' }}>{player.friendsStats?.gamesWon || player.stats?.gamesWon || 0}W</Typography>
                                    <Typography variant="body2" sx={{ flex: 1, textAlign: 'right', color: '#ff7961' }}>{player.friendsStats?.gamesLost || player.stats?.gamesLost || 0}L</Typography>
                                </Paper>
                            ))}
                        </List>
                    )}
                </Paper>
                </Grid>
            </Grid>
        </Container>
    </Box>
  );
};

export default PlayFriends;