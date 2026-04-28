import { Box, Typography, Grid, Paper, Avatar } from '@mui/material';
import { UserProfile } from '../types/auth';

interface MiniLeaderboardProps {
    player1: UserProfile | null;
    player2: UserProfile | null;
}

const MiniLeaderboard = ({ player1, player2 }: MiniLeaderboardProps) => {

    const renderPlayerStats = (player: UserProfile | null, title: string) => {
        if (!player) {
            return null; // Don't render if a player is not present
        }

        const stats = player.stats || { wins: 0, losses: 0, draws: 0 };

        return (
            <Paper elevation={3} sx={{ p: 2, background: '#1c1c1e', color: 'white', borderRadius: '8px' }}>
                <Typography variant="h6" align="center" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFA500' }}>{title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                    <Avatar src={player.photoURL || undefined} sx={{ width: 40, height: 40, mr: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{player.displayName || 'Guest'}</Typography>
                </Box>
                <Grid container spacing={1} textAlign="center">
                    <Grid item xs={4}>
                        <Typography variant="h6">{stats.wins}</Typography>
                        <Typography variant="caption">Wins</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6">{stats.losses}</Typography>
                        <Typography variant="caption">Losses</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h6">{stats.draws}</Typography>
                        <Typography variant="caption">Draws</Typography>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Box sx={{ my: 3 }}>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} sm={5}>
                    {renderPlayerStats(player1, 'Player 1')}
                </Grid>
                <Grid item xs={12} sm={5}>
                    {renderPlayerStats(player2, 'Player 2')}
                </Grid>
            </Grid>
        </Box>
    );
};

export default MiniLeaderboard;
