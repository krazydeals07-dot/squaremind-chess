import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Container, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Avatar, ListItemAvatar, Box } from '@mui/material';
import { UserProfile } from '../types/auth';

interface LeaderboardEntry extends UserProfile {
    id: string;
}

const FriendLeaderboard = () => {
    const { currentUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const friendUIDs = userData.friends || [];

                    const friendsData: LeaderboardEntry[] = [];

                    if (friendUIDs.length > 0) {
                        // Firestore 'in' query has a limit of 30 elements.
                        // We need to chunk the friendUIDs array into batches of 30.
                        const CHUNK_SIZE = 30;
                        const chunks = [];
                        for (let i = 0; i < friendUIDs.length; i += CHUNK_SIZE) {
                            chunks.push(friendUIDs.slice(i, i + CHUNK_SIZE));
                        }

                        // Fetch documents for each chunk
                        const fetchPromises = chunks.map(chunk => {
                            const usersRef = collection(db, 'users');
                            const q = query(usersRef, where('__name__', 'in', chunk));
                            return getDocs(q);
                        });

                        // Wait for all fetches to complete
                        const snapshots = await Promise.all(fetchPromises);

                        // Process results from all snapshots
                        snapshots.forEach(querySnapshot => {
                            querySnapshot.docs.forEach(docSnap => {
                                friendsData.push({
                                    id: docSnap.id,
                                    ...docSnap.data(),
                                } as LeaderboardEntry);
                            });
                        });
                    }

                    // Also include the current user in the leaderboard
                    const currentUserData = { id: currentUser.uid, ...userData } as LeaderboardEntry;
                    const allPlayers = [...friendsData, currentUserData];

                    // Sort by wins
                    allPlayers.sort((a, b) => (b.stats?.wins || 0) - (a.stats?.wins || 0));

                    setLeaderboard(allPlayers);
                }
            } catch (error) {
                console.error("Error fetching friend leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentUser]);

    if (loading) {
        return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            <Paper sx={{ p: {xs: 2, md: 4}, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif', color: '#FFA500' }}>
                    Friends Leaderboard
                </Typography>
                {leaderboard.length > 0 ? (
                    <List>
                        {leaderboard.map((player, index) => (
                            <ListItem
                                key={player.id}
                                divider
                                sx={{
                                    my: 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                <ListItemText
                                    primary={`#${index + 1}`}
                                    primaryTypographyProps={{ style: { color: '#FFA500', fontWeight: 'bold', fontSize: '1.2rem' } }}
                                    sx={{ flex: '0 0 50px' }}
                                />
                                <ListItemAvatar>
                                    <Avatar src={player.photoURL || undefined} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={player.displayName || 'Anonymous'}
                                    primaryTypographyProps={{ style: { color: 'white', fontWeight: 'bold' } }}
                                />
                                <Box sx={{ display: 'flex', gap: {xs: 1, md: 3}, textAlign: 'center', ml: 2 }}>
                                     <Box>
                                        <Typography variant="body1" sx={{fontWeight: 'bold'}}>{player.stats?.wins || 0}</Typography>
                                        <Typography variant="caption" sx={{color: 'lightgrey'}}>Wins</Typography>
                                    </Box>
                                     <Box>
                                        <Typography variant="body1" sx={{fontWeight: 'bold'}}>{player.stats?.losses || 0}</Typography>
                                        <Typography variant="caption" sx={{color: 'lightgrey'}}>Losses</Typography>
                                    </Box>
                                     <Box>
                                        <Typography variant="body1" sx={{fontWeight: 'bold'}}>{player.stats?.draws || 0}</Typography>
                                        <Typography variant="caption" sx={{color: 'lightgrey'}}>Draws</Typography>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography align="center" sx={{ mt: 3, color: 'lightgrey' }}>
                        Add some friends to see their ranking!
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default FriendLeaderboard;
