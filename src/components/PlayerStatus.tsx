
import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { Tournament, Match } from '../utils/firebase/tournaments';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PlayerStatusProps {
    tournament: Tournament | null;
}

const getRoundName = (round: number, totalRounds: number): string => {
    if (totalRounds <= 1) return 'Final';
    const remainingRounds = totalRounds - round;
    if (remainingRounds === 0) return 'Final';
    if (remainingRounds === 1) return 'Semi-Final';
    if (remainingRounds === 2) return 'Quarter-Final';
    return `Round ${round}`;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ tournament }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (!tournament || !currentUser) {
        return <Typography sx={{color: 'white', textAlign: 'center', p: 2}}>Your match status will appear here once you join.</Typography>;
    }

    const waitingMatch = tournament.matches.find(m => m.status === 'waiting' && m.player1?.uid === currentUser.uid);
    if (waitingMatch) {
        return (
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: 'rgba(26, 58, 109, 0.7)', color: 'white', border: '1px solid #FF8F00' }}>
                <Typography variant="h6">You are in the Queue!</Typography>
                <Typography>Waiting for an opponent to start Round 1.</Typography>
            </Paper>
        );
    }

    const playerMatch = [...tournament.matches]
        .filter(m => m.player1?.uid === currentUser.uid || m.player2?.uid === currentUser.uid)
        .sort((a, b) => b.round - a.round)
        [0];

    if (!playerMatch) {
        return <Typography sx={{color: 'white', textAlign: 'center', p: 2}}>You are not currently in a match for this tournament.</Typography>;
    }

    const opponent = playerMatch.player1?.uid === currentUser.uid
        ? playerMatch.player2
        : playerMatch.player1;
        
    const totalPlayers = Math.max(tournament.players.length, 2);
    const totalRounds = Math.ceil(Math.log2(totalPlayers));

    const handleJoinGame = (gameId: string | undefined) => {
        if (gameId) {
            navigate(`/tournament/${tournament.id}/game/${gameId}`);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(10, 31, 68, 0.8)', color: 'white', border: '1px solid #FF6F00' }}>
            <Typography variant="h5" sx={{ color: '#FF6F00', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                Your Current Status
            </Typography>
            <Box>
                <Typography variant="h6" textAlign="center">{getRoundName(playerMatch.round, totalRounds)}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', my: 2 }}>
                    <Typography variant="body1" sx={{fontWeight: 'bold'}}>{currentUser.displayName || 'You'}</Typography>
                    <Typography variant="caption">vs</Typography>
                    <Typography variant="body1" sx={{fontWeight: 'bold'}}>{opponent?.displayName || 'Waiting...'}</Typography>
                </Box>

                {playerMatch.status === 'ongoing' && playerMatch.gameId ? (
                    <Button 
                        variant="contained" 
                        color="success"
                        onClick={() => handleJoinGame(playerMatch.gameId)}
                        sx={{display: 'block', mx: 'auto', mt: 2}}
                    >
                        Join Game
                    </Button>
                ) : (
                    <Chip 
                        label={playerMatch.status === 'waiting' ? 'PENDING' : playerMatch.status.toUpperCase()} 
                        color={
                            playerMatch.status === 'completed' ? 'success' :
                            playerMatch.status === 'ongoing' ? 'warning' :
                            'info'
                        }
                        sx={{display: 'block', mx: 'auto', width: 'fit-content', mb: 1}}
                    />
                )}

                {playerMatch.status === 'completed' && (
                     <Typography align="center" sx={{mt: 1, fontWeight: 'bold', color: playerMatch.winnerId === currentUser.uid ? 'success.light' : 'error.light'}}>
                         {playerMatch.winnerId === currentUser.uid ? 'Congratulations, you won!' : 'Better luck next time.'}
                     </Typography>
                )}
            </Box>
        </Paper>
    );
};

export default PlayerStatus;
