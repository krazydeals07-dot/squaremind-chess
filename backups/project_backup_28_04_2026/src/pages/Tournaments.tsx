import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SportsEsports, Event } from '@mui/icons-material';
import { getTournamentsRT, Tournament } from '../utils/firebase/tournaments';
import ChessIcon from '../components/ChessIcon';

const categoryStyles = {
    paper: {
        padding: { xs: '0.75rem', md: '2rem' },
        textAlign: 'center',
        borderRadius: '20px',
        color: '#fff',
        height: '100%',
        minHeight: { xs: '130px', md: '250px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 15px 25px rgba(0,0,0,0.3)',
        },
    },
    icon: {
        fontSize: { xs: '2rem', md: '3.5rem' },
        marginBottom: '0.25rem',
    },
    title: {
        fontWeight: 'bold',
        fontSize: { xs: '1rem', md: '1.6rem' },
        textTransform: 'uppercase',
        lineHeight: 1.2
    },
    count: {
        fontSize: { xs: '0.85rem', md: '1rem' },
        marginTop: '0.5rem',
        opacity: 0.9,
        fontWeight: '500',
    },
};

const Tournaments = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = getTournamentsRT(
            (data) => {
                setTournaments(data);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const categories = useMemo(() => {
        const upcomingCount = tournaments.filter(t => t.status === 'upcoming').length;
        const knockoutCount = tournaments.filter(t => 
            t.type?.toLowerCase().includes('knockout') || 
            t.type?.toLowerCase().includes('elimination')
        ).length;

        return { upcoming: upcomingCount, knockout: knockoutCount };
    }, [tournaments]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ 
            py: { xs: 1, md: 0 }, 
            pt: { xs: 1, md: 2 },
            mt: 0,
            background: '#0F172A', 
            minHeight: 'calc(100vh - 180px)', 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 1, textAlign: 'center', '& svg': { width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 } } }}>
                    <ChessIcon />
                </Box>
                
                 <Typography 
                    variant="h4" 
                    align="center" 
                    sx={{ 
                        mb: 0.5, 
                        fontWeight: 'bold', 
                        fontFamily: 'Orbitron, sans-serif',
                        color: '#F59E0B',
                        fontSize: { xs: '1.6rem', md: '2.2rem' }
                    }}
                >
                    TOURNAMENT HUB
                </Typography>
                <Typography 
                    variant="body1" 
                    align="center"
                    sx={{ mb: 2, color: '#94A3B8', fontWeight: 'normal', fontSize: { xs: '0.85rem', md: '1rem' } }}
                >
                    Compete, Win, and Rise to the Top!
                </Typography>

                <Grid container spacing={{ xs: 1.5, md: 4 }} justifyContent="center">
                    <Grid item xs={12} sm={6} md={5}>
                        <Paper 
                            onClick={() => navigate('/tournaments/knockout')}
                            elevation={10} 
                            sx={{ ...categoryStyles.paper, background: 'linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)' }}
                        >
                            <SportsEsports sx={categoryStyles.icon} />
                            <Typography sx={categoryStyles.title}>DAILY KNOCKOUT TOURNAMENTS</Typography>
                            <Typography sx={categoryStyles.count}>{categories.knockout} tournaments</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={5}>
                        <Paper 
                            onClick={() => navigate('/tournaments/upcoming')}
                            elevation={10} 
                            sx={{ ...categoryStyles.paper, background: 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)' }}
                        >
                            <Event sx={categoryStyles.icon} />
                            <Typography sx={categoryStyles.title}>UPCOMING CHALLENGES</Typography>
                            <Typography sx={categoryStyles.count}>{categories.upcoming} tournaments</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Tournaments;