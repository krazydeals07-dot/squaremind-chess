import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, Container, CircularProgress, 
    Alert, Button, Grid, Avatar, List, ListItem, ListItemText 
} from '@mui/material';
import { doc, onSnapshot, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Tournament, Match } from '../utils/firebase/tournaments';
import { UserProfile } from '../types/user';
import { Chess } from 'chess.js';

const TournamentDetails: React.FC = () => {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [playerProfiles, setPlayerProfiles] = useState<{[key: string]: UserProfile}>({});

    useEffect(() => {
        if (!tournamentId) {
            setError("Tournament ID is missing.");
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'tournaments', tournamentId), (docSnap) => {
            if (docSnap.exists()) {
                setTournament({ id: docSnap.id, ...docSnap.data() } as Tournament);
            } else {
                setError("Tournament not found.");
            }
            setLoading(false);
        }, (err) => {
            setError("Failed to load tournament data: " + err.message);
            setLoading(false);
        });

        return () => unsub();
    }, [tournamentId]);

    useEffect(() => {
        if (tournament?.players) {
            const fetchProfiles = async () => {
                const profiles: {[key: string]: UserProfile} = {};
                for (const player of tournament.players) {
                    if (!playerProfiles[player.uid] && player.uid) {
                        const userDoc = await getDoc(doc(db, 'users', player.uid));
                        if (userDoc.exists()) {
                            profiles[player.uid] = userDoc.data() as UserProfile;
                        }
                    }
                }
                if(Object.keys(profiles).length > 0) {
                   setPlayerProfiles(prev => ({...prev, ...profiles}));
                }
            }
            fetchProfiles();
        }
    }, [tournament?.players]);


    const handleJoinMatch = async (match: Match) => {
        if (!currentUser || !tournamentId || !match.player1) {
            setError("Cannot start match, player information is missing.");
            return;
        }
    
        setLoading(true);
        setError(null);
    
        try {
            let gameId = match.gameId;
    
            if (gameId) {
                // Scenario 1: Game room already exists
                const gameRef = doc(db, 'games', gameId);
                const gameDoc = await getDoc(gameRef);

                if (gameDoc.exists()) {
                    const gameData = gameDoc.data();
                    // If current user is player2 and game is waiting for them
                    if (match.player2 && currentUser.uid === match.player2.uid && gameData.status === 'waiting') {
                        await updateDoc(gameRef, {
                            'players.black': match.player2.uid,
                            'playerNames.black': match.player2.displayName,
                            status: 'ongoing',
                            'timers.lastMoveTimestamp': new Date()
                        });
                    }
                }
            } else {
                // Scenario 2: Game room does NOT exist yet.
                // Only allow player1 (White) to initiate the room creation.
                if (currentUser.uid !== match.player1.uid) {
                    setError("Waiting for opponent to create the game room...");
                    setLoading(false);
                    return;
                }

                const isPlayer2Present = !!match.player2;
                const newGameData = {
                    fen: new Chess().fen(),
                    players: {
                        white: match.player1.uid,
                        black: isPlayer2Present ? match.player2.uid : null,
                    },
                    playerNames: {
                        white: match.player1.displayName,
                        black: isPlayer2Present ? match.player2.displayName : "Waiting for opponent...",
                    },
                    createdAt: new Date(),
                    status: isPlayer2Present ? 'ongoing' : 'waiting',
                    moves: [],
                    chat: [],
                    tournamentId: tournamentId,
                    matchId: match.id,
                    timeControl: tournament?.timeControl || { initialTime: 300, increment: 0 },
                    timers: {
                        white: tournament?.timeControl?.initialTime || 300,
                        black: tournament?.timeControl?.initialTime || 300,
                        lastMoveTimestamp: new Date(),
                    }
                };
    
                const gameRef = await addDoc(collection(db, "games"), newGameData);
                gameId = gameRef.id;
    
                // Update the tournament match with the new gameId
                const tournamentRef = doc(db, 'tournaments', tournamentId);
                const tourneyDoc = await getDoc(tournamentRef);
                if (tourneyDoc.exists()) {
                    const existingMatches = [...(tourneyDoc.data().matches || [])] as Match[];
                    const matchIndex = existingMatches.findIndex(m => m.id === match.id);
                    
                    if (matchIndex !== -1) {
                        existingMatches[matchIndex].gameId = gameId;
                        if (isPlayer2Present) {
                           existingMatches[matchIndex].status = 'ongoing';
                        }
                        await updateDoc(tournamentRef, { matches: existingMatches });
                    } 
                } 
            }
            
            // Navigate to the game room
            navigate(`/tournament/${tournamentId}/game/${gameId}`);
    
        } catch (err: any) {
            console.error("Error joining or creating match:", err);
            setError(`Failed to join match: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <Container sx={{textAlign: 'center', mt: 5}}><CircularProgress /></Container>;
    if (error) return <Container><Alert severity="error" sx={{mt: 2}}>{error}</Alert></Container>;
    if (!tournament) return <Container><Alert severity="info" sx={{mt: 2}}>No tournament data available.</Alert></Container>;
    
    const userMatch = tournament.matches?.find(m => (m.player1?.uid === currentUser?.uid || m.player2?.uid === currentUser?.uid) && m.status !== 'completed');

    return (
        <Container maxWidth="lg" sx={{ mt: 4, color: 'white' }}>
            <Typography variant="h3" gutterBottom align="center" sx={{ fontFamily: 'Orbitron', mb: 3 }}>
                {tournament.name}
            </Typography>
            
            {userMatch && (
                 <Paper sx={{ p: 2, mb: 3, background: 'rgba(26, 42, 74, 0.8)', border: '1px solid #FF6F00', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontFamily: 'Roboto Condensed' }}>Your Next Match</Typography>
                    <Typography sx={{ my: 1 }}>
                        {userMatch.player1?.displayName} vs {userMatch.player2?.displayName || 'Waiting...'}
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => handleJoinMatch(userMatch)} 
                        sx={{mt: 1, fontFamily: 'Orbitron', fontWeight: 'bold'}}
                        disabled={loading || userMatch.status === 'completed'}
                    >
                        {userMatch.status === 'completed' ? 'Match Over' : 'Join Match Room'}
                    </Button>
                </Paper>
            )}

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" gutterBottom>Bracket</Typography>
                     {tournament.matches?.length > 0 ? (
                        <List>
                            {tournament.matches.map(match => (
                                <Paper key={match.id} sx={{ mb: 2, p: 2, background: '#1A2A4A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography sx={{fontWeight: 'bold'}}>Round {match.round}</Typography>
                                        <Typography variant="body2" color="lightgray">
                                            {match.player1?.displayName || 'TBD'} vs {match.player2?.displayName || 'TBD'}
                                        </Typography>
                                    </Box>
                                     <Box textAlign="right">
                                         <Typography variant="body2" sx={{ textTransform: 'capitalize', color: match.status === 'completed' ? '#4CAF50' : '#FFC107' }}>
                                            {match.status}
                                        </Typography>
                                        {match.status === 'completed' && match.winner && (
                                            <Typography variant="caption" color="#4CAF50"> 
                                                Winner: {match.winner.displayName}
                                            </Typography>
                                        )}
                                    </Box>
                                </Paper>
                            ))}
                        </List>
                     ) : <Typography>The bracket has not been generated yet.</Typography>}
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h5" gutterBottom>Players ({tournament.players?.length || 0})</Typography>
                    <Paper sx={{ p: 2, background: '#1A2A4A', maxHeight: '400px', overflowY: 'auto' }}>
                        <List dense>
                            {tournament.players?.map(player => (
                                <ListItem key={player.uid}>
                                    <Avatar src={playerProfiles[player.uid]?.photoURL || undefined} sx={{ mr: 2, width: 32, height: 32 }} />
                                    <ListItemText primary={player.displayName} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TournamentDetails;