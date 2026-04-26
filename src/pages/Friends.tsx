import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, database } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDoc, limit } from 'firebase/firestore';
import { ref, onValue } from "firebase/database";
import {
    Container, Typography, Grid, TextField, Button,
    Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton, CircularProgress, Tabs, Tab, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PersonAdd, PersonRemove, CheckCircle, Cancel, Search } from '@mui/icons-material';
import ChessIcon from '../components/ChessIcon';

interface UserSearchResult {
    uid: string;
    displayName: string;
    photoURL: string;
}

interface FriendRequest {
    senderId: string;
    senderName: string;
    senderPhotoURL: string;
    message: string;
}

interface OnlineStatus {
    state: 'online' | 'offline';
    last_changed: number;
}

const Friends = () => {
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
    const [initialUsers, setInitialUsers] = useState<UserSearchResult[]>([]);
    const [friends, setFriends] = useState<UserSearchResult[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<string[]>([]);
    const [friendStatuses, setFriendStatuses] = useState<{[key: string]: OnlineStatus}>({});
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!currentUser) return;

        let unsubscribeFriends: (() => void) | null = null;

        const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
            const userData = userDoc.data();
            if (userData) {
                setFriendRequests(userData.friendRequests || []);
                
                const friendIds = userData.friends || [];
                
                if (unsubscribeFriends) {
                    unsubscribeFriends();
                }

                if (friendIds.length > 0) {
                    // Firestore 'in' query supports up to 30 elements
                    const friendsQuery = query(
                        collection(db, 'users'), 
                        where('__name__', 'in', friendIds.slice(0, 30))
                    );
                    
                    unsubscribeFriends = onSnapshot(friendsQuery, (snapshot) => {
                        const friendList = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserSearchResult));
                        setFriends(friendList);

                        // Status listeners
                        friendList.forEach(friend => {
                            const statusRef = ref(database, '/status/' + friend.uid);
                            onValue(statusRef, (snapshot) => {
                                setFriendStatuses(prev => ({...prev, [friend.uid]: snapshot.val()}));
                            });
                        });
                    }, (err) => {
                        console.error("Error fetching friend details:", err);
                    });
                } else {
                    setFriends([]);
                }
            }
        });

        return () => {
            unsubUser();
            if (unsubscribeFriends) unsubscribeFriends();
        };
    }, [currentUser]);

    useEffect(() => {
        if (tabValue === 2 && currentUser) {
            fetchInitialUsers();
        }
    }, [tabValue, currentUser]);

    const fetchInitialUsers = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, limit(20));
            const snapshot = await getDocs(q);
            let userList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserSearchResult));
            const friendUIDs = new Set(friends.map(f => f.uid));
            userList = userList.filter(user => user.uid !== currentUser.uid && !friendUIDs.has(user.uid));
            setInitialUsers(userList);
            setSearchResults(userList);
        } catch (error) {
            console.error("Error fetching initial users:", error);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!currentUser) return;
        if (!searchQuery.trim()) {
            setSearchResults(initialUsers);
            return;
        }
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, 
                            where('displayName', '>=', searchQuery),
                            where('displayName', '<=', searchQuery + '\uf8ff')
                           );
            const snapshot = await getDocs(q);
            let userList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserSearchResult));
            const friendUIDs = new Set(friends.map(f => f.uid));
            userList = userList.filter(user => user.uid !== currentUser.uid && !friendUIDs.has(user.uid));
            setSearchResults(userList);
        } catch (error) {
            console.error("Error searching users:", error);
        }
        setLoading(false);
    };

    const sendFriendRequest = async (targetId: string) => {
        if (!currentUser || targetId === currentUser.uid) return;
        const message = 'Hi! Let\'s be friends!';
        const targetUserRef = doc(db, 'users', targetId);

        const targetDoc = await getDoc(targetUserRef);
        if(targetDoc.exists()) {
            const targetData = targetDoc.data();
            if(targetData.friendRequests?.some((req: FriendRequest) => req.senderId === currentUser.uid)) {
                alert("Friend request already sent.");
                setSentRequests(prev => [...new Set([...prev, targetId])]);
                return;
            }
        }

        await updateDoc(targetUserRef, {
            friendRequests: arrayUnion({
                senderId: currentUser.uid,
                senderName: currentUser.displayName || currentUser.email,
                senderPhotoURL: currentUser.photoURL || '',
                message
            })
        });
        alert('Friend request sent!');
        setSentRequests(prev => [...prev, targetId]);
    };

    const acceptFriendRequest = async (request: FriendRequest) => {
        if (!currentUser) return;
        const currentUserRef = doc(db, 'users', currentUser.uid);
        const requesterUserRef = doc(db, 'users', request.senderId);
        
        await updateDoc(currentUserRef, {
            friends: arrayUnion(request.senderId),
            friendRequests: arrayRemove(request)
        });
        await updateDoc(requesterUserRef, { friends: arrayUnion(currentUser.uid) });
    };

    const declineFriendRequest = async (request: FriendRequest) => {
        if (!currentUser) return;
        const currentUserRef = doc(db, 'users', currentUser.uid);
        await updateDoc(currentUserRef, { friendRequests: arrayRemove(request) });
    };
    
    const removeFriend = async (friendId: string) => {
        if (!currentUser || !window.confirm("Are you sure you want to remove this friend?")) return;
        const currentUserRef = doc(db, 'users', currentUser.uid);
        const friendUserRef = doc(db, 'users', friendId);
        
        await updateDoc(currentUserRef, { friends: arrayRemove(friendId) });
        await updateDoc(friendUserRef, { friends: arrayRemove(currentUser.uid) });
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const renderFindFriends = () => {
        return (
            <List sx={{ width: '100%', mt: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3}}><CircularProgress /></Box>
                ) : (
                    searchResults.map(user => {
                        const requestSent = sentRequests.includes(user.uid);

                        return (
                            <ListItem
                                key={user.uid}
                                sx={{ background: '#1c1c1e', mb: 1, borderRadius: '8px' }}
                                secondaryAction={
                                    requestSent ? (
                                        <Button variant="contained" disabled>
                                            Request Sent
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<PersonAdd />}
                                            onClick={() => sendFriendRequest(user.uid)}
                                            sx={{
                                                bgcolor: '#FFA500',
                                                color: 'white',
                                                '&:hover': {
                                                    bgcolor: '#E08E00',
                                                },
                                            }}
                                        >
                                            Add Friend
                                        </Button>
                                    )
                                }
                            >
                                <ListItemAvatar><Avatar src={user.photoURL} /></ListItemAvatar>
                                <ListItemText primary={user.displayName} sx={{color: 'white'}} />
                            </ListItem>
                        );
                    })
                )}
            </List>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <ChessIcon />
                <Typography variant="h4" sx={{ fontFamily: '"Orbitron", sans-serif', mb: 3, color: '#FFA500', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    FRIENDS
                </Typography>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    centered={!isMobile}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : undefined}
                    allowScrollButtonsMobile={isMobile}
                    sx={{
                        width: '100%',
                        mb: 4,
                        '& .MuiTabs-indicator': { backgroundColor: '#FFA500' },
                        '& .MuiTab-root': { color: 'white', fontWeight: 'bold', fontSize: '0.875rem' },
                        '& .Mui-selected': { color: '#4dabf5' },
                    }}
                >
                    <Tab label={`MY FRIENDS (${friends.length})`} />
                    <Tab label={`FRIEND REQUESTS (${friendRequests.length})`} />
                    <Tab label="FIND FRIENDS" />
                </Tabs>

                <Box sx={{ width: '100%' }}>
                    {tabValue === 0 && (
                        <List sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
                           {friends.map(friend => (
                                <ListItem key={friend.uid} sx={{ background: '#1c1c1e', mb: 1, borderRadius: '8px'}} secondaryAction={<IconButton edge="end" onClick={() => removeFriend(friend.uid)}><PersonRemove sx={{color: 'white'}} /></IconButton>}>
                                    <ListItemAvatar><Avatar src={friend.photoURL} /></ListItemAvatar>
                                    <ListItemText primary={friend.displayName} sx={{color: 'white'}} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: friendStatuses[friend.uid]?.state === 'online' ? 'green' : 'grey', ml: 2 }} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {tabValue === 1 && (
                        <List sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
                           {friendRequests.map((request, index) => (
                                <ListItem key={index} sx={{ background: '#1c1c1e', mb: 1, borderRadius: '8px'}} secondaryAction={
                                    <>
                                        <IconButton edge="end" onClick={() => acceptFriendRequest(request)}><CheckCircle color="success" /></IconButton>
                                        <IconButton edge="end" onClick={() => declineFriendRequest(request)}><Cancel color="error" /></IconButton>
                                    </>
                                }>
                                    <ListItemAvatar><Avatar src={request.senderPhotoURL} /></ListItemAvatar>
                                    <ListItemText primary={request.senderName} secondary={request.message} sx={{color: 'white'}} secondaryTypographyProps={{color: 'lightgray'}} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {tabValue === 2 && (
                        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
                             <Grid container spacing={1} alignItems="center" sx={{maxWidth: 600, mx: 'auto' }} >
                                <Grid item xs>
                                    <TextField 
                                        fullWidth 
                                        placeholder="Search for players by name..."
                                        variant="filled" 
                                        hiddenLabel
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        InputProps={{ disableUnderline: true }}
                                        sx={{ 
                                            '& .MuiFilledInput-root': { 
                                                backgroundColor: '#3A3A3C', 
                                                borderRadius: '8px', 
                                                '&:hover': { backgroundColor: '#4a4a4c' } 
                                            },
                                            '& .MuiInputBase-input::placeholder': { color: '#a0a0a0', opacity: 1 },
                                            input: { color: 'white' }
                                        }} 
                                    />
                                </Grid>
                                <Grid item>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSearch}
                                        sx={{ 
                                            bgcolor: '#FFA500', 
                                            '&:hover': { bgcolor: '#E08E00' },
                                            height: '56px' // Match TextField height
                                        }}
                                    >
                                        <Search />
                                    </Button>
                                </Grid>
                            </Grid>
                            {renderFindFriends()}
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default Friends;