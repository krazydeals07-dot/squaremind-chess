import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import {
    Paper, Typography, Avatar,
    Box, CircularProgress, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow
} from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

interface FriendStat {
    id: string;
    elo: number;
    wins: number;
    losses: number;
    draws: number;
    displayName?: string;
    photoURL?: string;
}

const getTrophyColor = (rank: number) => {
    if (rank === 0) return '#FFD700'; // Gold
    if (rank === 1) return '#C0C0C0'; // Silver
    if (rank === 2) return '#CD7F32'; // Bronze
    return 'inherit';
}

const FriendsLeaderboard = () => {
    const { currentUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState<FriendStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        
        const unsubscribe = onSnapshot(userDocRef, (userSnap) => {
            if (!userSnap.exists()) {
                setLoading(false);
                return;
            }

            const userData = userSnap.data();
            const friendsList = (userData.friends || []).filter((id: string) => !!id);
            const allUIDs = [currentUser.uid, ...friendsList];

            if (allUIDs.length === 0) {
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, 'users'),
                where('__name__', 'in', allUIDs.slice(0, 30))
            );

            const unsubStats = onSnapshot(q, (snapshot) => {
                const stats = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const fStats = data.friendsStats || {};
                    return {
                        id: doc.id,
                        displayName: data.displayName || 'Unknown Player',
                        photoURL: data.photoURL || '',
                        elo: fStats.elo ?? 1200,
                        wins: fStats.gamesWon ?? 0,
                        losses: fStats.gamesLost ?? 0,
                        draws: fStats.draws ?? 0
                    };
                });

                // Sort by ELO descending
                const sortedStats = stats.sort((a, b) => b.elo - a.elo);
                setLeaderboard(sortedStats);
                setLoading(false);
            }, (error) => {
                console.error("Stats Listener Error:", error);
                setLoading(false);
            });

            return () => unsubStats();

        }, (error) => {
            console.error("User Listener Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUser]);

    return (
        <Paper elevation={10} sx={{
            p: { xs: 2, md: 3 }, 
            height: '100%',
            background: 'rgba(30, 30, 40, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            color: 'white',
        }}>
            <Typography variant="h4" sx={{ fontFamily: 'Orbitron', fontWeight: 'bold', mb: 2, color: '#FFA500' }}>
                Top 10 Friends
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                    <CircularProgress color="warning" />
                </Box>
            ) : leaderboard.length === 0 ? (
                <Typography sx={{ textAlign: 'center', mt: 4, color: 'grey.400' }}>No friend data available. Play some games to see stats!</Typography>
            ) : (
                 <TableContainer component={Paper} sx={{background: 'transparent', boxShadow: 'none'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{color: '#FFA500', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>Rank</TableCell>
                                <TableCell sx={{color: '#FFA500', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>Player</TableCell>
                                <TableCell align="right" sx={{color: '#FFA500', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>Elo</TableCell>
                                <TableCell align="right" sx={{color: '#FFA500', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'}}>W/L/D</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboard.map((player, index) => (
                                <TableRow key={player.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 'bold', fontSize: '1.1rem'}}>
                                        {index < 3 ? <EmojiEvents sx={{color: getTrophyColor(index)}} /> : `#${index + 1}`}
                                    </TableCell>
                                    <TableCell sx={{color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>
                                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                                            <Avatar src={player.photoURL} sx={{width: 32, height: 32, mr: 1.5}} />
                                            <Typography variant="body2" sx={{ fontWeight: player.id === currentUser?.uid ? 'bold' : 'normal', color: player.id === currentUser?.uid ? '#FFA500' : 'white' }}>
                                                {player.displayName} {player.id === currentUser?.uid ? '(You)' : ''}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 'bold'}}>{Math.round(player.elo)}</TableCell>
                                     <TableCell align="right" sx={{color: 'grey.400', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'}}>{`${player.wins}/${player.losses}/${player.draws}`}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    )
}

export default FriendsLeaderboard;