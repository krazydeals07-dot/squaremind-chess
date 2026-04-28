
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Paper, Typography, List, ListItem, ListItemText, Avatar, ListItemAvatar, Box, CircularProgress } from '@mui/material';

interface LeaderboardFriend {
    id: string;
    wins: number;
    displayName: string;
    photoURL?: string;
}

const MiniFriendLeaderboard = () => {
    const { currentUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardFriend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const statsRef = collection(db, 'user_stats', currentUser.uid, 'friends');
        const q = query(statsRef, orderBy('wins', 'desc'), limit(7));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const friendsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const friendId = docSnap.id;
                const stats = docSnap.data();
                const userDoc = await getDoc(doc(db, 'users', friendId));
                const userData = userDoc.data();
                return {
                    id: friendId,
                    wins: stats.wins,
                    displayName: userData?.displayName,
                    photoURL: userData?.photoURL,
                } as LeaderboardFriend;
            }));
            setLeaderboard(friendsData.filter(f => f.displayName));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching friend leaderboard:", error);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [currentUser]);

    if (!currentUser) {
        return (
             <Paper sx={{ p: 2, mt: 3, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
                <Typography variant="h6" sx={{ mb: 1, borderBottom: 1, borderColor: 'grey.700'}}>Top Friends</Typography>
                <Typography sx={{textAlign: 'center', mt: 2, color: 'grey.500'}}>Login to see your friend leaderboard!</Typography>
             </Paper>
        )
    }

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>;
    }

    if (leaderboard.length === 0) {
        return (
             <Paper sx={{ p: 2, mt: 3, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
                <Typography variant="h6" sx={{ mb: 1, borderBottom: 1, borderColor: 'grey.700'}}>Top Friends</Typography>
                <Typography sx={{textAlign: 'center', mt: 2, color: 'grey.500'}}>Play games with friends to see your leaderboard!</Typography>
             </Paper>
        )
    }

    return (
        <Paper sx={{ p: 2, mt: 3, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
            <Typography variant="h6" sx={{ mb: 1, borderBottom: 1, borderColor: 'grey.700'}}>Top Friends</Typography>
            <List dense>
                {leaderboard.map((friend: LeaderboardFriend, index: number) => (
                    <ListItem key={friend.id} secondaryAction={
                        <Typography sx={{color: '#FFD700'}}>{`${friend.wins} Wins`}</Typography>
                    }>
                        <ListItemAvatar>
                            <Avatar src={friend.photoURL || ''} sx={{width: 32, height: 32}}/>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={`${index + 1}. ${friend.displayName}`}
                            primaryTypographyProps={{ style: { color: 'white', fontWeight: 'bold' } }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default MiniFriendLeaderboard;
