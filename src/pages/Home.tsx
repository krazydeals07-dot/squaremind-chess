import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ChessIcon from '../components/ChessIcon';
import TournamentWinnerBanner from '../components/TournamentWinnerBanner';

const featureCards = [
    {
        title: 'Play with AI',
        description: 'Sharpen your skills against our advanced AI.',
        link: '/play/ai',
        requiresAuth: false,
    },
    {
        title: 'Play with a Friend',
        description: 'Challenge a friend to a classic game of chess.',
        link: '/play/friends',
        requiresAuth: true,
    },
    {
        title: 'Puzzles',
        description: 'Solve intricate puzzles and improve your tactical vision.',
        link: '/puzzles',
        requiresAuth: false,
    },
    {
        title: 'Tournaments',
        description: 'Compete in tournaments and win exclusive prizes.',
        link: '/tournaments',
        requiresAuth: true,
    },
    {
        title: 'Leaderboard',
        description: 'See how you rank against the best players in the world.',
        link: '/leaderboard',
        requiresAuth: false,
    },
    {
        title: 'Tutorials',
        description: 'Learn the fundamentals and master advanced strategies.',
        link: '/tutorials',
        requiresAuth: false,
    },
];

const motivationalMessages = [
    "The only bad move is the one you don't make.",
    "Every chess master was once a beginner.",
    "Think a move ahead, not just the one in front of you.",
    "In chess, the small advantages accumulate.",
    "Patience is a virtue that you must have in chess.",
    "The art of chess is knowing what to do when there is nothing to do.",
    "A good player is always lucky.",
    "When you see a good move, look for a better one."
];

const Home: React.FC = () => {
    const [allQuotes, setAllQuotes] = useState<string[]>(motivationalMessages);
    const [message, setMessage] = useState(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    const { isGuest } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                const quotesRef = collection(db, 'quotes');
                const querySnapshot = await getDocs(quotesRef);
                const fetchedQuotes = querySnapshot.docs.map(doc => doc.data().text || doc.data().quote).filter(Boolean);
                
                if (fetchedQuotes.length > 0) {
                    setAllQuotes(fetchedQuotes);
                    setMessage(fetchedQuotes[Math.floor(Math.random() * fetchedQuotes.length)]);
                }
            } catch (error) {
                console.error("Error fetching quotes:", error);
            }
        };

        fetchQuotes();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (allQuotes.length > 0) {
                setMessage(allQuotes[Math.floor(Math.random() * allQuotes.length)]);
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [allQuotes]);

    const handleCardClick = (link: string, requiresAuth: boolean) => {
        if (requiresAuth && isGuest) {
            navigate('/signup');
        } else {
            navigate(link);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            background: '#0F172A',
            overflow: 'hidden',
        }}>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                textAlign: 'center',
                py: { xs: 0.5, md: 1 },
                my: 0,
            }}>
                <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0, py: 0 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <Box sx={{ mb: 0, mt: 0, transform: { xs: 'scale(0.8)', sm: 'scale(1)' } }}>
                            <ChessIcon />
                        </Box>
                        <Typography
                            variant="h1"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontFamily: 'Orbitron, sans-serif',
                                fontWeight: 700,
                                fontSize: { xs: '1.6rem', sm: '2.5rem', md: '2.8rem' },
                                letterSpacing: '0.05em',
                                background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 0.2,
                            }}
                        >
                            SQUAREMIND
                        </Typography>
                        <Typography variant="h6" component="p" sx={{
                            mb: 0.5,
                            color: '#94A3B8',
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: { xs: '0.75rem', sm: '0.95rem', md: '1.05rem' },
                        }}>
                            {message}
                        </Typography>
                    </motion.div>

                    <Box sx={{ my: 0.5, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <TournamentWinnerBanner />
                    </Box>

                    <Box sx={{ mt: 0.5, px: 0, width: '100%' }}>
                        <Grid container spacing={{ xs: 0.5, md: 1.5 }} justifyContent="center">
                            {featureCards.map((card, index) => (
                                <Grid item xs={6} sm={4} key={index}>
                                    <Box onClick={() => handleCardClick(card.link, card.requiresAuth)} sx={{ cursor: 'pointer', height: '100%' }}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                                            whileHover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' }}
                                            style={{ height: '100%' }}
                                        >
                                            <Card sx={{
                                                backgroundColor: '#1E293B',
                                                borderRadius: '12px',
                                                border: '1px solid #334155',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    borderColor: '#F59E0B',
                                                }
                                            }}>
                                                <CardContent sx={{ p: { xs: '8px !important', md: 1.5 } }}>
                                                    <Typography component="h2" sx={{ fontWeight: 'bold', color: '#E2E8F0', fontSize: { xs: '0.75rem', sm: '1rem' }, mb: 1 }}>
                                                        {card.title}
                                                    </Typography>
                                                    <Typography sx={{ color: '#94A3B8', fontSize: { xs: '0.65rem', sm: '0.8rem' } }}>
                                                        {card.description}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;