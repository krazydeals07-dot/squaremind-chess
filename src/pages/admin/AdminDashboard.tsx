import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { People, SportsEsports, EmojiEvents, MonetizationOn } from '@mui/icons-material';
import { blue, green, orange, red } from '@mui/material/colors';
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
import { getUsers } from '../../utils/firebase/users';
import { getTournamentsRT } from '../../utils/firebase/tournaments';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: '12px', backgroundColor: color[50], borderLeft: `5px solid ${color[500]}` }}>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h4" component="p" sx={{ fontWeight: "bold" }}>{value}</Typography>
        </Box>
        <Box sx={{ color: color[600] }}>
            {React.cloneElement(icon, { sx: { fontSize: 48 } })}
        </Box>
    </Paper>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.element.isRequired,
    color: PropTypes.object.isRequired,
};

const AdminDashboard = () => {
    const { isAdmin, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGames: 0,
        ongoingTournaments: 0,
        earnings: '₹0'
    });
    const [userGrowthData, setUserGrowthData] = useState([]);
    const [tournamentTypesData, setTournamentTypesData] = useState([]);
    const [topPlayersData, setTopPlayersData] = useState([]);
    const [participationData, setParticipationData] = useState([]);
    
    const [staticLoading, setStaticLoading] = useState(true);
    const [rtLoading, setRtLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchStaticData = async () => {
            setStaticLoading(true);
            try {
                console.log("Fetching static admin data...");
                const [userGrowth, tournamentDistribution, topPlayers, participation, users, activeGames] = await Promise.all([
                    getDailyUserGrowth(7),
                    getTournamentTypeDistribution(),
                    getTopPlayersByElo(5),
                    getTournamentParticipation(5),
                    getUsers(),
                    getActiveGamesCount(),
                ]);

                setUserGrowthData(userGrowth || []);
                setTournamentTypesData(tournamentDistribution || []);
                setTopPlayersData(topPlayers || []);
                setParticipationData(participation || []);
                setStats(prevStats => ({ 
                    ...prevStats, 
                    totalUsers: (users && users.length) || 0, 
                    activeGames: activeGames || 0 
                }));

            } catch (err) {
                setError('Failed to fetch dashboard data. Check your connection or security rules.');
                console.error("Static data fetch error:", err);
            } finally {
                setStaticLoading(false);
            }
        };

        fetchStaticData();

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
                setRtLoading(false);
            },
            (err) => {
                setError('Failed to fetch real-time tournament data.');
                console.error("Real-time data fetch error:", err);
                setRtLoading(false);
            }
        );

        return () => unsubscribe();

    }, [isAdmin]);

    if (authLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Verifying permissions...</Typography>
            </Box>
        );
    }

    if (!isAdmin) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">
                    <Typography variant="h6">Access Denied</Typography>
                    <Typography>You do not have permission to view this page. Please log in as an administrator.</Typography>
                </Alert>
            </Box>
        );
    }

    const dataLoading = staticLoading || rtLoading;

    return (
        <Box sx={{ p: 3, background: "#f5f5f5", minHeight: "100vh" }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: "bold", color: "text.primary" }}>
                Admin Dashboard
            </Typography>
            
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Users" value={dataLoading ? '--' : stats.totalUsers} icon={<People />} color={blue} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Active Games" value={dataLoading ? '--' : stats.activeGames} icon={<SportsEsports />} color={green} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Ongoing Tournaments" value={dataLoading ? '--' : stats.ongoingTournaments} icon={<EmojiEvents />} color={orange} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Earnings" value={dataLoading ? '--' : stats.earnings} icon={<MonetizationOn />} color={red} />
                </Grid>

                {dataLoading ? (
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <CircularProgress />
                    </Grid>
                ) : (
                    <>
                        <Grid item xs={12} lg={8}>
                            <UserGrowthChart data={userGrowthData} />
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            <TournamentTypesChart data={tournamentTypesData} />
                        </Grid>
                        <Grid item xs={12} lg={7}>
                            <TournamentParticipationChart data={participationData} />
                        </Grid>
                        <Grid item xs={12} lg={5}>
                            <TopPlayersChart data={topPlayersData} />
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
