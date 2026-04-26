
import { Grid, Typography, Avatar } from '@mui/material';
import { UserProfile } from '../../types';

interface GameInfoProps {
    isTournamentGame: boolean;
    currentUser: any;
    opponentProfile: UserProfile;
    isMyTurn: boolean;
    gameStatus: string;
}

const GameInfo = ({ isTournamentGame, currentUser, opponentProfile, isMyTurn, gameStatus }: GameInfoProps) => {
    return (
        <>
            <Typography variant="h5" sx={{ fontFamily: 'Orbitron', mb: 2, color: '#FFA500', fontWeight: 'bold', textAlign: 'center' }}>
                {isTournamentGame ? "TOURNAMENT MATCH" : "PLAY WITH A FRIEND"}
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={5} textAlign="center">
                    <Avatar src={currentUser.photoURL || ''} sx={{ width: 60, height: 60, margin: 'auto' }}/>
                    <Typography sx={{mt: 1, fontWeight: 'bold'}}>{currentUser.displayName || 'You'}</Typography>
                </Grid>
                <Grid item xs={2} textAlign="center"><Typography variant="h4">VS</Typography></Grid>
                <Grid item xs={5} textAlign="center">
                    <Avatar src={opponentProfile.photoURL || ''} sx={{ width: 60, height: 60, margin: 'auto' }}/>
                    <Typography sx={{mt: 1, fontWeight: 'bold'}}>{opponentProfile.displayName}</Typography>
                </Grid>
            </Grid>
            <Typography variant="h6" align="center" sx={{ mt: 3, color: isMyTurn ? '#32CD32' : '#FF6347' }}>
                {gameStatus}
            </Typography>
        </>
    );
};

export default GameInfo;
