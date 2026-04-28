
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Tournament, Player } from '../types/tournament';
import { UserProfile } from '../types';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Grid } from '@mui/material';
import { styled } from '@mui/system';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const LobbyContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const TournamentPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: 'linear-gradient(145deg, #2c3e50, #34495e)',
    color: '#ecf0f1',
    borderRadius: '15px',
    textAlign: 'center',
}));

const TournamentLobby = () => {
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);

    useEffect(() => {
        if (!tournamentId || !currentUser) {
            setLoading(false);
            return;
        };

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch user profile
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const profileData = userSnap.data() as UserProfile;
                    setUserProfile(profileData);
                    // Check if profile is complete
                    if (profileData.displayName && profileData.mobileNumber && profileData.dob && profileData.address && profileData.country) {
                        setIsProfileComplete(true);
                    }
                }

                // Set up tournament listener
                const tournamentRef = doc(db, 'tournaments', tournamentId);
                const unsubscribe = onSnapshot(tournamentRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const tourneyData = { id: docSnap.id, ...docSnap.data() } as Tournament;
                        setTournament(tourneyData);
                        const userIsPlayer = tourneyData.players?.some(p => p.uid === currentUser.uid) || false;
                        setIsRegistered(userIsPlayer);
                    } else {
                        setError("Tournament not found.");
                    }
                });
                // `unsubscribe` will be returned and called on cleanup
                return unsubscribe;
            } catch (err) {
                console.error(err);
                setError("Failed to load tournament or user data.");
            } finally {
                setLoading(false);
            }
        };

        let unsubscribe: (() => void) | undefined;
        fetchInitialData().then(unsub => {
            if (unsub) unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [tournamentId, currentUser]);

    const handleJoinNowClick = async () => {
        if (!currentUser || !tournamentId || !tournament) return;

        if (isRegistered) {
            // User is registered, find their game
            const myCurrentMatch = tournament.matches?.find(m => m.status === 'ongoing' && (m.player1?.uid === currentUser.uid || m.player2?.uid === currentUser.uid));
            if (myCurrentMatch && myCurrentMatch.gameId) {
                navigate(`/tournaments/${tournamentId}/game/${myCurrentMatch.gameId}`);
            } else {
                alert("Your match has not started yet. Please wait for the bracket to be updated.");
            }
        } else if (isProfileComplete) {
            // Profile is complete, but not registered -> Register now
            setIsProcessing(true);
            try {
                const player: Player = { uid: currentUser.uid, displayName: userProfile?.displayName || 'N/A' };
                const tournamentRef = doc(db, "tournaments", tournamentId);
                await updateDoc(tournamentRef, { players: arrayUnion(player) });
                alert("You have been successfully registered!");
            } catch (e) {
                setError("Failed to register.");
            } finally {
                setIsProcessing(false);
            }
        } else {
            // Profile is incomplete -> Open profile dialog
            setProfileDialogOpen(true);
        }
    };

    const handleProfileUpdateAndRegister = async () => {
        if (!currentUser || !userProfile) return;
        
        const requiredFields = ['displayName', 'mobileNumber', 'dob', 'address', 'country'];
        for (const field of requiredFields) {
            if (!(userProfile as any)[field]) {
                setError(`Please fill out the ${field} field.`);
                return;
            }
        }

        setIsProcessing(true);
        try {
            // 1. Update user profile
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, userProfile, { merge: true });
            setIsProfileComplete(true);

            // 2. Register for tournament
            const player: Player = { uid: currentUser.uid, displayName: userProfile.displayName };
            const tournamentRef = doc(db, "tournaments", tournamentId!);
            await updateDoc(tournamentRef, { players: arrayUnion(player) });
            
            setProfileDialogOpen(false);
            alert("Your profile has been updated and you are now registered!");

        } catch (e) {
            setError("Failed to update profile or register.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (userProfile) {
            setUserProfile({ ...userProfile, [name]: value });
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
    if (error) return <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>;
    if (!tournament) return <Typography sx={{textAlign: 'center', mt: 4}}>Tournament not found or not available.</Typography>;

    const getButtonText = () => {
        if (isRegistered) return 'Go to Game Room';
        if (!isProfileComplete) return 'Complete Profile to Join';
        return 'Join Now';
    };

    return (
        <LobbyContainer>
            <TournamentPaper elevation={10}>
                <EmojiEventsIcon sx={{ fontSize: 60, color: '#f1c40f' }} />
                <Typography variant="h3" gutterBottom>{tournament.name}</Typography>
                <Chip label={`Status: ${tournament.status}`} color={tournament.status === 'ongoing' ? 'success' : 'default'} />
                <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                    Welcome to the {tournament.name}. Click below to join the action!
                </Typography>
                
                <Button 
                    variant="contained" 
                    color="success" 
                    size="large" 
                    onClick={handleJoinNowClick} 
                    disabled={isProcessing || (tournament.status !== 'ongoing' && tournament.status !== 'registration')}
                >
                    {isProcessing ? <CircularProgress size={24} color="inherit" /> : getButtonText()}
                </Button>
            </TournamentPaper>

            <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Complete Your Profile to Register</DialogTitle>
                <DialogContent>
                     <Typography variant="body2" sx={{mb: 2}}>This information is required for tournament participation and is saved to your main profile.</Typography>
                     <Grid container spacing={2} sx={{mt: 1}}>
                        <Grid item xs={12}>
                             <TextField name="displayName" label="Display Name" value={userProfile?.displayName || ''} onChange={handleProfileChange} fullWidth required />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField name="mobileNumber" label="Mobile No" type="tel" value={userProfile?.mobileNumber || ''} onChange={handleProfileChange} fullWidth required />
                        </Grid>
                         <Grid item xs={12} sm={6}>
                            <TextField name="dob" label="Date of Birth" type="date" value={userProfile?.dob || ''} onChange={handleProfileChange} fullWidth required InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="address" label="Address" value={userProfile?.address || ''} onChange={handleProfileChange} fullWidth required multiline rows={2} />
                        </Grid>
                         <Grid item xs={12}>
                            <TextField name="country" label="Country" value={userProfile?.country || ''} onChange={handleProfileChange} fullWidth required />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleProfileUpdateAndRegister} variant="contained" disabled={isProcessing}>
                        {isProcessing ? <CircularProgress size={24} /> : 'Save and Register'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LobbyContainer>
    );
};

export default TournamentLobby;
