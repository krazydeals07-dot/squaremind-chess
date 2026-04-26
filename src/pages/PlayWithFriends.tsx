import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import FriendLeaderboard from '../components/leaderboard/FriendLeaderboard';
import ChessIcon from '../components/ChessIcon';
import { motion } from 'framer-motion';

const PlayWithFriends = () => {
    const [gameId, setGameId] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const createNewGame = async () => {
        if (!currentUser) return;
        const newGame = {
            players: {
                white: currentUser.uid,
                black: null,
            },
            fen: 'start',
            status: 'waiting',
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, 'games'), newGame);
        navigate(`/game/friends/${docRef.id}`);
    };

    const joinGame = async () => {
        if (!gameId) return;
        const gameRef = doc(db, 'games', gameId);
        const gameSnap = await getDoc(gameRef);
        if (gameSnap.exists()) {
            navigate(`/game/friends/${gameId}`);
        } else {
            alert('Game not found!');
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#0F172A',
            overflow: 'hidden',
            py: 0,
            my: 0,
        }}>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'center',
                py: 0,
                my: 0,
                mt: 0,
            }}>
                <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0, py: 0 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Box sx={{ mb: 0, mt: 0, transform: { xs: 'scale(0.7)', sm: 'scale(0.8)' } }}>
                            <ChessIcon />
                        </Box>
                        <Typography
                            variant="h1"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontFamily: 'Orbitron, sans-serif',
                                fontWeight: 700,
                                fontSize: { xs: '1.4rem', sm: '2rem', md: '2.5rem' },
                                letterSpacing: '0.05em',
                                background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.5,
                                mt: 0,
                                textAlign: 'center'
                            }}
                        >
                            PLAY WITH FRIENDS
                        </Typography>
                    </motion.div>

                    <Box sx={{ mt: 0, px: 2, width: '100%' }}>
                        <Grid container spacing={{ xs: 1, md: 1.5 }} justifyContent="center">
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ 
                                    p: 1.5, 
                                    backgroundColor: '#1E293B', 
                                    border: '1px solid #334155', 
                                    borderRadius: '12px',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <Typography variant="h5" align="center" sx={{ mb: 0.5, fontFamily: '"Orbitron", sans-serif', color: '#E2E8F0', fontSize: '0.9rem' }}>LOBBY</Typography>
                                    <Typography align="center" sx={{ mb: 1, color: '#94A3B8', fontSize: '0.75rem' }}>Create a new game and invite a friend.</Typography>
                                    <Button 
                                        fullWidth 
                                        variant="contained"
                                        size="small"
                                        onClick={createNewGame} 
                                        sx={{ 
                                            mb: 1, 
                                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', 
                                            color: 'white', 
                                            fontFamily: '"Orbitron", sans-serif',
                                            py: 0.5,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        CREATE NEW GAME
                                    </Button>
                                    <Typography align="center" sx={{ my: 0.5, color: '#94A3B8', fontSize: '0.75rem' }}>Or join a game using an ID.</Typography>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        placeholder="Enter Game ID"
                                        value={gameId}
                                        onChange={(e) => setGameId(e.target.value)}
                                        sx={{ 
                                            mb: 1, 
                                            input: { color: 'white', py: 0.5, fontSize: '0.75rem' }, 
                                            fieldset: { borderColor: '#334155' },
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#F59E0B',
                                                },
                                            }
                                        }}
                                    />
                                    <Button 
                                        fullWidth 
                                        variant="contained"
                                        size="small"
                                        onClick={joinGame} 
                                        sx={{ 
                                            background: 'linear-gradient(45deg, #8A2BE2 30%, #BA55D3 90%)', 
                                            color: 'white', 
                                            fontFamily: '"Orbitron", sans-serif',
                                            py: 0.5,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        JOIN GAME
                                    </Button>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ 
                                    p: 1.5, 
                                    backgroundColor: '#1E293B', 
                                    border: '1px solid #334155', 
                                    borderRadius: '12px',
                                    height: '100%',
                                    overflow: 'auto'
                                }}>
                                    <FriendLeaderboard />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default PlayWithFriends;