import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    Box, Grid, Paper, Typography, CircularProgress, Alert, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { People, SportsEsports, EmojiEvents, MonetizationOn, Star } from '@mui/icons-material';
import { blue, green, orange, red, amber } from '@mui/material/colors';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import UserGrowthChart from '../../components/admin/charts/UserGrowthChart';
import TournamentTypesChart from '../../components/admin/charts/TournamentTypesChart';
import TopPlayersChart from '../../components/admin/charts/TopPlayersChart';
import TournamentParticipationChart from '../../components/admin/charts/TournamentParticipationChart';
import { 
    getDailyUserGrowth, 
    getTournamentTypeDistribution,
    getTopPlayersByElo,
    getTournamentParticipation,
    getActiveGamesCount
} from '../../utils/firebase/dashboard';
import { getTournamentsRT } from '../../utils/firebase/tournaments';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, loading }) => (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: '12px', backgroundColor: color[50], borderLeft: `5px solid ${color[500]}` }}>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: "bold" }}>
                {loading ? <CircularProgress size={28} /> : value}
            </Typography>
        </Box>
        <Box sx={{ color: color[600] }}>
            {React.cloneElement(icon, { sx: { fontSize: 48 } })}
        </Box>
    </Paper>
);

const AdminDashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGames: 0,
        ongoingTournaments: 0,
        earnings: '₹0'
    });
    const [recentWinners, setRecentWinners] = useState([]);
    const [recentSignups, setRecentSignups] = useState([]);
    const [userGrowthData, setUserGrowthData] = useState([]);
    const [tournamentTypesData, setTournamentTypesData] = useState([]);
    const [topPlayersData, setTopPlayersData] = useState([]);
    const [participationData, setParticipationData] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            try {
                console.log("Fetching all admin data...");
                const [userGrowth, tournamentDistribution, topPlayers, participation, usersSnapshot, activeGames, winnersSnapshot] = await Promise.all([
                    getDailyUserGrowth(7).catch(() => []),
                    getTournamentTypeDistribution().catch(() => []),
                    getTopPlayersByElo(10).catch(() => []),
                    getTournamentParticipation(5).catch(() => []),
                    getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5))).catch(() => ({ docs: [] })),
                    getActiveGamesCount().catch(() => 0),
                    getDocs(query(collection(db, 'winners'), orderBy('date', 'desc'), limit(5))).catch(() => ({ docs: [] }))
                ]);

                const allUsers = await getDocs(collection(db, 'users'));

                setUserGrowthData(userGrowth || []);
                setTournamentTypesData(tournamentDistribution || []);
                setTopPlayersData(topPlayers || []);
                setParticipationData(participation || []);
                setStats(prevStats => ({ 
                    ...prevStats, 
                    totalUsers: allUsers.size || 0, 
                    activeGames: activeGames || 0 
                }));

                setRecentSignups(usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setRecentWinners(winnersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));

            } catch (err) {
                setError('Failed to fetch dashboard data. Check your connection or security rules.');
                console.error("Static data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

        const unsubscribe = getTournamentsRT(
            (tournaments) => {
                try {
                    const totalEarnings = (tournaments || []).reduce((acc, tournament) => {
                        const entryFee = tournament.entryFee || 0;
                        const participants = (tournament.players && tournament.players.length) || 0;
                        return acc + (entryFee * participants);
                    }, 0);

                    setStats(prevStats => ({
                        ...prevStats,
                        ongoingTournaments: (tournaments || []).filter(t => t.status === 'ongoing').length,
                        earnings: `₹${totalEarnings.toLocaleString()}`
                    }));
                } catch (reduceErr) {
                    console.error("Error calculating earnings:", reduceErr);
                }
            },
            (err) => {
                setError('Failed to fetch real-time tournament data.');
                console.error("Real-time data fetch error:", err);
            }
        );

        return () => unsubscribe();

    }, [isAdmin]);

    if (authLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /><Typography sx={{ ml: 2 }}>Verifying permissions...</Typography></Box>;
    }

    if (!isAdmin) {
        return <Box sx={{ p: 4 }}><Alert severity="error"><Typography variant="h6">Access Denied</Typography><Typography>You do not have permission to view this page. Please log in as an administrator.</Typography></Alert></Box>;
    }
    
    const formatDate = (dateSource) => {
        if (!dateSource) return 'N/A';
        const d = dateSource.toDate ? dateSource.toDate() : new Date(dateSource);
        return format(d, 'PP'); // Format like "May 1, 2026"
    };

    return (
        <Box sx={{ p: 3, background: "#f5f5f5", minHeight: "100vh" }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: "bold", color: "text.primary" }}>Admin Dashboard</Typography>
            
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={stats.totalUsers} icon={<People />} color={blue} loading={loading} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Active Games" value={stats.activeGames} icon={<SportsEsports />} color={green} loading={loading} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Ongoing Tournaments" value={stats.ongoingTournaments} icon={<EmojiEvents />} color={orange} loading={loading} /></Grid>
                <Grid item xs={12} sm={6} md={3}><StatCard title="Earnings" value={stats.earnings} icon={<MonetizationOn />} color={red} loading={loading} /></Grid>

                <Grid item xs={12} lg={8}><UserGrowthChart data={userGrowthData} loading={loading} /></Grid>
                <Grid item xs={12} lg={4}><TournamentTypesChart data={tournamentTypesData} loading={loading} /></Grid>
                
                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Winners</Typography>
                        {loading ? <CircularProgress /> : 
                        <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Player</TableCell><TableCell>Tournament</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {recentWinners.map(w => <TableRow key={w.id}><TableCell>{formatDate(w.date)}</TableCell><TableCell>{w.displayName}</TableCell><TableCell>{w.tournamentName}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Recent Signups</Typography>
                         {loading ? <CircularProgress /> : 
                        <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {recentSignups.map(u => <TableRow key={u.id}><TableCell>{formatDate(u.createdAt)}</TableCell><TableCell>{u.displayName}</TableCell><TableCell>{u.email}</TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={7}><TournamentParticipationChart data={participationData} loading={loading} /></Grid>
                <Grid item xs={12} lg={5}><TopPlayersChart data={topPlayersData} loading={loading} /></Grid>

            </Grid>
        </Box>
    );
};


StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.element.isRequired,
    color: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
};

export default AdminDashboard;
