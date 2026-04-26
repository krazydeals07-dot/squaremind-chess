import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';

interface Player {
    id: string;
    displayName: string;
    photoURL?: string;
    stats?: {
        gamesPlayed: number;
        gamesWon: number;
        gamesLost: number;
        draws: number;
        elo: number;
    };
}

const FriendLeaderboard = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            orderBy('stats.elo', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const playersData: Player[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // TEMPORARY TEST: Removing the gamesPlayed > 0 condition to check if it's the cause of the issue.
                // if (data.stats && data.stats.gamesPlayed > 0) {
                    playersData.push({ id: doc.id, ...data } as Player);
                // }
            });
            setPlayers(playersData);
            setError(null); // Clear error on successful data fetch
        }, (err) => {
            console.error("Firestore Leaderboard Query Error:", err);
            setError(`Failed to load leaderboard. The required database index might be missing or still building. Check the browser console (F12) for a detailed error message and a link to create the index.`);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Paper sx={{ p: 2, background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            <Typography variant="h5" align="center" sx={{ mb: 2, fontFamily: '"Orbitron", sans-serif', color: 'white' }}>
                Friend Leaderboard
            </Typography>
            {error && (
                <Typography align="center" sx={{ color: '#FFBABA', my: 2, p: 1, background: 'rgba(255, 0, 0, 0.1)', borderRadius: '4px' }}>
                    {error}
                </Typography>
            )}
            <List dense>
                {players.length > 0 ? players.map((player, index) => (
                    <ListItem
                        key={player.id}
                        sx={{
                            background: 'rgba(255,255,255,0.05)',
                            mb: 1,
                            borderRadius: '8px',
                            borderLeft: `5px solid ${
                                index === 0 ? '#FFD700' : // Gold
                                index === 1 ? '#C0C0C0' : // Silver
                                index === 2 ? '#CD7F32' : // Bronze
                                'transparent'
                            }`
                        }}
                    >
                        <ListItemText
                            primary={`#${index + 1}`}
                            primaryTypographyProps={{ fontWeight: 'bold', color: 'white', mr: 2 }}
                        />
                        <ListItemAvatar>
                            <Avatar src={player.photoURL || 'default_avatar.png'} alt={player.displayName} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={player.displayName}
                            primaryTypographyProps={{ color: 'white', fontWeight: '500' }}
                            secondary={`ELO: ${player.stats?.elo || 1200}`}
                            secondaryTypographyProps={{ color: '#aaa' }}
                        />
                         <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ color: '#4CAF50' }}>{player.stats?.gamesWon || 0} W</Typography>
                            <Typography variant="body2" sx={{ color: '#F44336' }}>{player.stats?.gamesLost || 0} L</Typography>
                        </Box>
                    </ListItem>
                )) : !error && (
                    <Typography align="center" sx={{ color: 'lightgrey', mt: 2 }}>No ranked players yet. Play a game to get on the board!</Typography>
                )}
            </List>
        </Paper>
    );
};

export default FriendLeaderboard;
