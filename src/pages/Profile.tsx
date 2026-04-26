import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot, collection, query, orderBy, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
    Container, Typography, Paper, Grid, TextField, Button, 
    Box, Avatar, CircularProgress, Tabs, Tab, LinearProgress, Divider,
    List, ListItem, ListItemText, ListItemAvatar, ListItemIcon, IconButton,
    useTheme, useMediaQuery
} from '@mui/material';
import { Edit, EmojiEvents, People, SportsEsports, PhotoCamera } from '@mui/icons-material';
import { achievementsList } from '../data/achievements';
import { UserProfile as UserProfileType, GameHistory as GameHistoryType, UnlockedAchievement } from '../types';
import StatsCategory from '../components/profile/StatsCategory';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameHistoryType[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfileType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
        setProfileLoading(true);
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const profileData = docSnap.data() as UserProfileType;
                setUserProfile(profileData);
                setEditableProfile(profileData);
            }
            setProfileLoading(false);
        });
        return () => unsubscribe();
    } else {
        setProfileLoading(false);
        setUserProfile(null);
    }
  }, [currentUser]);

  const fetchGameHistory = useCallback(async () => {
      if (currentUser && tabValue === 2) {
          setHistoryLoading(true);
          try {
            const historyCollectionRef = collection(db, 'users', currentUser.uid, 'gameHistory');
            const q = query(historyCollectionRef, orderBy('playedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => doc.data() as GameHistoryType);
            setGameHistory(history);
          } catch (error) {
            console.error("Error fetching game history:", error);
          } finally {
            setHistoryLoading(false);
          }
      }
  }, [currentUser, tabValue]);

  useEffect(() => {
      if (tabValue === 2) fetchGameHistory();
  }, [tabValue, fetchGameHistory]);

  const handleSave = async () => {
    if (editableProfile && currentUser) {
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, editableProfile, { merge: true });
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editableProfile) {
      setEditableProfile({ ...editableProfile, [e.target.name]: e.target.value });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editableProfile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableProfile({ ...editableProfile, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  if (authLoading || profileLoading) {
    return <Container><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress color="warning" /></Box></Container>;
  }

  if (!currentUser || !userProfile) {
    return <Container><Typography color="white" sx={{textAlign: 'center', mt: 5}}>Please log in to view your profile.</Typography></Container>;
  }
  
  const { photoURL } = currentUser || {};
  const { displayName = 'User', level = 1, aiStats, stats, tournamentsStats, unlockedAchievements = [] } = userProfile || {};
  const levelProgress = level ? (level - Math.floor(level)) * 100 : 0;
  const safeUnlockedAchievements: UnlockedAchievement[] = Array.isArray(unlockedAchievements) ? unlockedAchievements : [];

  return (
    <Box sx={{ 
        color: 'white', 
        fontFamily: '"Orbitron", sans-serif', 
        pt: { xs: 0, md: 0 }, 
        mt: { md: -4 },
        pb: 0,
        mb: 0, 
        minHeight: 'calc(100vh - 120px)', 
        height: 'auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
            <Paper 
                elevation={12} 
                sx={{ 
                    background: 'rgba(20, 20, 30, 0.85)',
                    backdropFilter: 'blur(20px)',
                    p: { xs: 1.5, md: 2 }, 
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    minHeight: { md: '400px' }
                }}
            >
                <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar 
                                    src={isEditing ? (editableProfile?.photoURL || '') : (currentUser?.photoURL || userProfile?.photoURL || '')} 
                                    sx={{ 
                                        width: { xs: 130, md: 160 }, 
                                        height: { xs: 130, md: 160 }, 
                                        mb: 1.5, 
                                        border: '5px solid #FFA500',
                                        boxShadow: '0 0 25px #FFA500'
                                    }}
                                >
                                    <Typography variant="h1" sx={{ fontFamily: '"Orbitron", sans-serif', fontSize: { xs: '3.5rem', md: '6rem' } }}>
                                        {displayName?.charAt(0)?.toUpperCase() || 'U'}
                                    </Typography>
                                </Avatar>
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            ref={fileInputRef}
                                            onChange={handlePhotoChange}
                                        />
                                        <IconButton 
                                            onClick={() => fileInputRef.current?.click()}
                                            sx={{ 
                                                position: 'absolute', 
                                                bottom: 15, 
                                                right: 5, 
                                                bgcolor: '#FFA500', 
                                                '&:hover': { bgcolor: '#E03D00' },
                                                p: 1
                                            }}
                                        >
                                            <PhotoCamera sx={{ fontSize: '1.5rem', color: 'white' }} />
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                            <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFA500', fontWeight: 'bold', mb: 0.5 }}>
                                {isEditing ? editableProfile?.displayName : displayName}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: '#08d4b4', fontFamily: '"Orbitron", sans-serif', mb: 0.5 }}>
                                {`Level ${Math.floor(level)}`}
                            </Typography>
                            <Box sx={{ width: '90%', mb: 1.5 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={levelProgress}
                                    sx={{ 
                                        height: 10, 
                                        borderRadius: 5, 
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        '& .MuiLinearProgress-bar': { 
                                            background: 'linear-gradient(90deg, #E03D00, #FFA500)',
                                            boxShadow: '0 0 10px #FFA500'
                                        } 
                                    }} 
                                />
                            </Box>
                            <Button 
                                variant="contained" 
                                startIcon={isEditing ? null : <Edit />} 
                                sx={{ 
                                    fontFamily: '"Orbitron", sans-serif',
                                    bgcolor: isEditing ? '#E03D00' : '#08d4b4', 
                                    '&:hover': { bgcolor: isEditing ? '#FFA500' : '#07bfa0' },
                                    borderRadius: '12px',
                                    px: 4,
                                    py: 1.2,
                                    fontSize: '0.9rem'
                                }}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        {isEditing ? (
                            <Box component="form" noValidate autoComplete="off" sx={{ p: 0.5 }}>
                                <Grid container spacing={1.5}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth size="small" variant="filled" label="Display Name" name="displayName" value={editableProfile?.displayName || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
                                    </Grid>
                                     <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" variant="filled" label="Mobile Number" name="mobileNumber" value={editableProfile?.mobileNumber || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
                                    </Grid>
                                     <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" variant="filled" label="Date of Birth" name="dob" type="date" value={editableProfile?.dob ? new Date(editableProfile.dob).toISOString().split('T')[0] : ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' }, shrink: true }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
                                    </Grid>
                                     <Grid item xs={12}>
                                        <TextField fullWidth size="small" variant="filled" label="Address" name="address" value={editableProfile?.address || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" variant="filled" label="Country" name="country" value={editableProfile?.country || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
                                    </Grid>
                                </Grid>
                                <Button onClick={handleSave} variant="contained" size="small" sx={{ mt: 1.5, bgcolor: '#FFA500', fontFamily: '"Orbitron", sans-serif', '&:hover': { bgcolor: '#E03D00' } }}>
                                    Save Changes
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ width: '100%' }}>
                                <Tabs 
                                    value={tabValue} 
                                    onChange={handleTabChange} 
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    allowScrollButtonsMobile
                                    sx={{ 
                                        mb: 0.5, 
                                        minHeight: '32px',
                                        '& .MuiTabs-indicator': { background: 'linear-gradient(90deg, #E03D00, #FFA500)', height: 3 }, 
                                        '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontFamily: '"Orbitron", sans-serif', minWidth: 'auto', px: 2, py: 0.25, fontSize: '0.8rem', minHeight: '32px' }, 
                                        '& .Mui-selected': { color: '#FFA500' } 
                                    }}
                                >
                                    <Tab label="Statistics" />
                                    <Tab label="Achievements" />
                                    <Tab label="Game History" />
                                </Tabs>

                                {tabValue === 0 && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, p: 0 }}>
                                      <StatsCategory title="Play with AI" stats={aiStats} icon={<SportsEsports sx={{fontSize: '1.1rem'}} />} />
                                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                       <StatsCategory title="Play with Friends" stats={stats} icon={<People sx={{fontSize: '1.1rem'}} />} />
                                      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                       <StatsCategory title="Tournaments" stats={tournamentsStats} icon={<EmojiEvents sx={{fontSize: '1.1rem'}} />} />
                                    </Box>
                                )}
                                {tabValue === 1 && (
                                     <Box sx={{ p: 0 }}>
                                        <List dense sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px', maxHeight: '35vh', overflowY: 'auto' }}>
                                            {achievementsList.map((ach) => {
                                                const unlocked = safeUnlockedAchievements.find(ua => ua.id === ach.id);
                                                const iconElement = typeof ach.icon === 'string' ? <Typography sx={{fontSize: '1.5rem'}}>{ach.icon}</Typography> : ach.icon;
                                                const unlockedDate = unlocked && unlocked.unlockedAt && (unlocked.unlockedAt as any).seconds 
                                                    ? new Date((unlocked.unlockedAt as any).seconds * 1000).toLocaleDateString()
                                                    : null;

                                                return (
                                                    <ListItem key={ach.id} divider sx={{ opacity: unlocked ? 1 : 0.4, py: 0.5 }}>
                                                         <ListItemIcon sx={{ fontSize: '1.5rem', color: unlocked ? '#FFD700' : 'grey', minWidth: 40 }}>
                                                            {iconElement}
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={ach.name}
                                                            secondary={unlockedDate ? `Unlocked on ${unlockedDate}` : ach.description}
                                                            primaryTypographyProps={{ color: unlocked ? 'white' : 'grey', variant: 'body2', fontSize: '0.8rem' }}
                                                            secondaryTypographyProps={{ color: 'grey', variant: 'caption', fontSize: '0.7rem' }}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                )}
                                {tabValue === 2 && (
                                    <Box sx={{ p: 0 }}>
                                        {historyLoading ? (
                                            <CircularProgress size={24} color="warning" />
                                        ) : gameHistory.length === 0 ? (
                                            <Typography sx={{ textAlign: 'center', p: 3, fontSize: '0.8rem' }}>No game history yet.</Typography>
                                        ) : (
                                            <List dense sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '8px', maxHeight: '35vh', overflowY: 'auto' }}>
                                                {gameHistory.map((game, index) => {
                                                    const playedDate = game.playedAt && (game.playedAt as any).seconds
                                                        ? new Date((game.playedAt as any).seconds * 1000).toLocaleDateString()
                                                        : 'Date not available';

                                                    return (
                                                        <ListItem key={game.gameId || index} divider sx={{ py: 0.5 }}>
                                                            <ListItemAvatar sx={{ minWidth: 40 }}>
                                                                 <Avatar sx={{ width: 28, height: 28 }} src={game.opponent.photoURL || undefined} />
                                                            </ListItemAvatar>
                                                            <ListItemText 
                                                                 primary={`vs ${game.opponent.name}`}
                                                                 secondary={`${game.result ? game.result.toUpperCase() : 'N/A'} - ${playedDate}`}
                                                                primaryTypographyProps={{ 
                                                                    variant: 'body2',
                                                                    fontSize: '0.8rem',
                                                                    color: game.result && game.result.toLowerCase() === 'win' ? '#4caf50' : game.result && game.result.toLowerCase() === 'loss' ? '#f44336' : 'white' 
                                                                }}
                                                                secondaryTypographyProps={{ color: 'grey', variant: 'caption', fontSize: '0.7rem' }}
                                                            />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    </Box>
  );
};

export default Profile;