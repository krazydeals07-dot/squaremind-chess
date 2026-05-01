import { Paper, Typography, Grid, Box, Icon, CircularProgress } from '@mui/material';
import { BarChart, EmojiEvents } from '@mui/icons-material';
import useStats from '../../hooks/useStats';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactElement;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = '#FFA500' }) => (
    <Paper 
        elevation={4} 
        sx={{
            p: 1, 
            textAlign: 'center',
            background: 'rgba(30, 30, 40, 0.7)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
    >
        <Icon sx={{ color, fontSize: '1.2rem' }}>{icon}</Icon>
        <Typography variant="h6" sx={{ fontFamily: '"Orbitron", sans-serif', color: 'white', fontWeight: 'bold', my: 0.2 }}>
            {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {label}
        </Typography>
    </Paper>
);

interface StatsCategoryProps {
    title: string;
    statType: 'aiStats' | 'stats' | 'tournamentsStats';
    icon: React.ReactElement;
}

const StatsCategory: React.FC<StatsCategoryProps> = ({ title, statType, icon }) => {
    const { currentUser } = useAuth();
    const { stats, loading } = useStats(currentUser?.uid || '', statType);

    const safeNumber = (value: any): number => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    if (loading) {
        return <CircularProgress size={20} color="warning" />;
    }

    const played = safeNumber(stats?.gamesPlayed);
    const won = safeNumber(stats?.gamesWon);
    const lost = safeNumber(stats?.gamesLost);
    
    const winPercentage = played > 0 ? Math.round((won / played) * 100) : 0;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon sx={{ color: '#08d4b4', mr: 1.5, fontSize: '1.5rem' }}>{icon}</Icon>
                <Typography variant="h6" component="h3" sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 'bold', color: 'white' }}>
                    {title}
                </Typography>
            </Box>
            <Grid container spacing={1}>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Played" value={played} icon={<BarChart />} />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Won" value={won} icon={<EmojiEvents />} color="#FFD700" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Lost" value={lost} icon={<BarChart />} color="#f44336" />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <StatCard label="Win Rate" value={`${winPercentage}%`} icon={<BarChart />} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatsCategory;
