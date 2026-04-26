import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
    doc, onSnapshot, serverTimestamp, getDoc, runTransaction, arrayUnion, updateDoc, increment
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, Card, CardContent, Grid, CircularProgress, List, ListItem, ListItemText, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-hot-toast';
import { Match, Tournament } from '../utils/firebase/tournaments';
import JoinTournamentForm from '../components/JoinTournamentForm';
import { Chess } from 'chess.js';
import { v4 as uuidv4 } from 'uuid';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #0A1F44, #1A3A6D)',
  color: 'white',
  borderRadius: '15px',
  padding: theme.spacing(2),
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
}));

const StyledButton = styled(Button)(() => ({
  background: '#FF6F00',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '10px',
  padding: '10px 20px',
  '&:hover': {
    background: '#FF8F00',
  },
  '&:disabled': {
    background: '#555',
    color: '#999',
  }
}));

const KNOCKOUT_TOURNAMENT_ID = 'daily-knockout';
const WINS_TO_CHAMPION = 7;

const KnockoutTournament = () => {
  const { id: idFromParams } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const tournamentId = idFromParams || KNOCKOUT_TOURNAMENT_ID;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tournaments', tournamentId), (doc) => {
      if (doc.exists()) {
        setTournament(doc.data() as Tournament);
      } else {
        setError('Tournament not found or not yet created for today.');
      }
      setLoading(false);
    }, (err) => {
      console.error("Tournament snapshot error: ", err);
      toast.error(`Failed to load tournament info: ${err.message}`);
      setLoading(false);
    });
    return () => unsub();
  }, [tournamentId]);

  const handleOpenForm = async () => {
    if (!currentUser) {
      toast.error("Please log in to join.");
      navigate('/login');
      return;
    }
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists() && userDoc.data().address && userDoc.data().mobileNumber && userDoc.data().dob) {
      await handleJoin();
    } else {
      setIsFormOpen(true);
    }
  };

  const handleJoin = async (formData?: any) => {
    if (!currentUser) return toast.error("Please log in.");

    setIsJoining(true);
    const toastId = toast.loading('Processing your entry...');

    try {
        if (formData) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                ...formData,
                displayName: formData.playerName || currentUser.displayName,
            });
        }

        const result = await runTransaction(db, async (transaction) => {
            const tournamentRef = doc(db, "tournaments", tournamentId);
            const tournamentDoc = await transaction.get(tournamentRef);
            if (!tournamentDoc.exists()) throw new Error("Tournament not found.");

            const currentTournament = tournamentDoc.data() as Tournament;
            const matchesMap = currentTournament.matches || {};
            const matches = Object.values(matchesMap);
            
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const userData = userDoc.data()!;

            const currentPlayer = { 
                uid: currentUser.uid, 
                displayName: userData.displayName || 'Anonymous', 
                photoURL: userData.photoURL || '' 
            };

            if (matches.some(m => (m.player1?.uid === currentUser.uid || m.player2?.uid === currentUser.uid) && (m.status === 'active' || m.status === 'waiting'))) {
               const existingMatch = matches.find(m => (m.player1?.uid === currentUser.uid || m.player2?.uid === currentUser.uid) && (m.status === 'active' || m.status === 'waiting'))!;
               return { action: 'RE-JOIN', gameId: existingMatch.gameId };
            }

            if (matches.some(m => (m.player1?.uid === currentUser.uid || m.player2?.uid === currentUser.uid) && m.status === 'completed' && m.winnerId !== currentUser.uid)) {
                throw new Error("You have been knocked out. Better luck tomorrow!");
            }

            const wins = matches.filter(m => m.winnerId === currentUser.uid).length;
            if (wins >= WINS_TO_CHAMPION) throw new Error("Congratulations! You are the champion!");
            const targetRound = wins + 1;

            const waitingMatch = matches.find(m => m.status === 'waiting' && m.round === targetRound && m.player1?.uid !== currentUser.uid);

            if (waitingMatch) {
                const matchId = waitingMatch.id;
                const gameRef = doc(db, 'games', waitingMatch.gameId!);
                transaction.update(gameRef, { 'players.black': currentPlayer.uid, status: 'active', lastMove: serverTimestamp() });
                transaction.update(tournamentRef, { 
                    [`matches.${matchId}.player2`]: currentPlayer, 
                    [`matches.${matchId}.status`]: 'active', 
                    players: arrayUnion(currentPlayer),
                    participantCount: increment(1)
                });
                return { action: 'JOINED', gameId: waitingMatch.gameId, round: targetRound };
            } else {
                const newGameId = uuidv4();
                const newMatchId = `${tournamentId}-r${targetRound}-m${uuidv4().substring(0, 8)}`;
                const newMatch: Match = { id: newMatchId, round: targetRound, player1: currentPlayer, player2: null, status: 'waiting', gameId: newGameId };
                
                const gameRef = doc(db, 'games', newGameId);
                transaction.set(gameRef, {
                    players: { white: currentPlayer.uid, black: null }, playerNames: { white: currentPlayer.displayName, black: "Waiting..." },
                    playerPhotoURLs: { white: currentPlayer.photoURL, black: '' }, moves: [], status: 'waiting', createdAt: serverTimestamp(),
                    chat: [], tournamentId: tournamentId, matchId: newMatchId, fen: new Chess().fen(),
                    timeControl: { initial: 8 * 60, increment: 2 }, timers: { w: 8 * 60, b: 8 * 60 }, lastMove: serverTimestamp()
                });

                transaction.update(tournamentRef, { 
                    [`matches.${newMatchId}`]: newMatch,
                    players: arrayUnion(currentPlayer),
                    participantCount: increment(1)
                });
                return { action: 'QUEUED', gameId: newGameId, round: targetRound };
            }
        });

        toast.success(result.action === 'RE-JOIN' ? 'Returning to your match...' : `Joined Round ${result.round}!`, { id: toastId });
        navigate(`/tournament/${tournamentId}/game/${result.gameId}`);
    } catch (err: any) {
        toast.error(err.message, { id: toastId });
    } finally {
        setIsJoining(false);
        setIsFormOpen(false);
    }
};

  const rules = [
    'Players are auto-paired upon joining.',
    'Each match uses a 8-minute timer per player, with a 2-second increment per move.',
    'Winning 7 consecutive games makes you a Daily Winner!',
    'Prizes are awarded to the top 10 players daily.',
    'Cheating will result in a permanent ban.',
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ 
        p: { xs: 1, md: 2 }, 
        background: '#0A1F44', 
        minHeight: 'calc(100vh - 250px)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center'
    }}>
       <JoinTournamentForm 
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onJoin={handleJoin}
        />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#FF6F00', fontWeight: 'bold', mb: 1 }}>{tournament?.name}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Entry Fee: Free</Typography>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Joined Players: {tournament?.participantCount || 0}</Typography>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Start Time: 24x7 Instant Join</Typography>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Prize: Top 10 Daily Winners</Typography>
              <Box sx={{ mt: 2 }}>
                <StyledButton onClick={handleOpenForm} disabled={isJoining}>
                    {isJoining ? 'Searching...' : 'Join Now'}
                </StyledButton>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={6}>
            <StyledCard>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6F00', fontWeight: 'bold', mb: 1 }}>Live Stats</Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>Participants: {tournament?.participantCount || 0}</Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>Matches Ongoing: {Object.values(tournament?.matches || {}).filter(m => m.status === 'ongoing' || m.status === 'active').length}</Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>Matches Completed: {Object.values(tournament?.matches || {}).filter(m => m.status === 'completed').length}</Typography>
                </CardContent>
            </StyledCard>
        </Grid>

        <Grid item xs={12}>
          <StyledCard>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#FF6F00', fontWeight: 'bold', mb: 1 }}>Rules</Typography>
              <List dense sx={{ p: 0 }}>
                {rules.map((rule, index) => (
                  <ListItem key={index} sx={{ py: 0.2 }}>
                    <ListItemText primary={rule} primaryTypographyProps={{ variant: 'body2', style: { fontWeight: 'normal' } }} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KnockoutTournament;