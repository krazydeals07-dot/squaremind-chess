import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  CircularProgress,
  Divider,
  Stack
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, isSameDay } from 'date-fns';
import confetti from 'canvas-confetti';

interface Winner {
  id: string;
  displayName: string;
  tournamentName: string;
  prize: string;
  date: any;
}

const Winners: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  useEffect(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWinners = async () => {
      setLoading(true);
      try {
        const winnersRef = collection(db, 'winners');
        const q = query(winnersRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const filteredData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Winner))
          .filter(winner => {
            const winnerDate = winner.date.toDate ? winner.date.toDate() : new Date(winner.date);
            return isSameDay(winnerDate, selectedDate);
          });
        setWinners(filteredData);
      } catch (error) {
        console.error("Error fetching winners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, [selectedDate]);

  return (
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0F172A', 
      color: 'white',
      py: { xs: 2, md: 3 },
      px: 2
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontFamily: 'Orbitron', 
            fontWeight: 'bold', 
            color: '#FFD700',
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          }}
        >
          HALL OF FAME
        </Typography>
        <Typography 
          variant="h6" 
          align="center" 
          sx={{ mb: { xs: 2, md: 3 }, color: '#94A3B8', fontFamily: 'Orbitron' }}
        >
          Weekly Tournament Champions
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: 1.5, 
          mb: { xs: 2, md: 3 } 
        }}>
          {last7Days.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            return (
              <Button
                key={date.toISOString()}
                variant={isSelected ? "contained" : "outlined"}
                onClick={() => setSelectedDate(date)}
                sx={{
                  display: 'flex', flexDirection: 'column', minWidth: { xs: '60px', sm: '80px' }, height: { xs: '60px', sm: '70px' }, borderRadius: '12px', borderColor: '#FFD700', color: isSelected ? '#0F172A' : '#FFD700', bgcolor: isSelected ? '#FFD700' : 'transparent', '&:hover': { bgcolor: isSelected ? '#FFC400' : 'rgba(255, 215, 0, 0.1)', borderColor: '#FFD700', }, boxShadow: isSelected ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none', textTransform: 'none'
                }}
              >
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
                  {format(date, 'EEE')}
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
                  {format(date, 'd MMM')}
                </Typography>
              </Button>
            );
          })}
        </Box>
        <Divider sx={{ mb: { xs: 2, md: 3 }, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      </Container>

      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        px: 2
      }}>
        <Container maxWidth="xl">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#FFD700' }} />
            </Box>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {winners.length > 0 ? (
                  <Grid container spacing={2} justifyContent="center">
                    {winners.map((winner) => (
                      <Grid item xs={12} sm={6} md={2.4} key={winner.id}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 1.5, 
                            textAlign: 'center', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', 
                            border: `2px solid #FFD700`, 
                            position: 'relative', 
                            overflow: 'hidden', 
                            transition: 'transform 0.3s ease', 
                            '&:hover': { 
                              transform: 'translateY(-8px)', 
                              boxShadow: `0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(255,215,0,0.2)` 
                            },
                            height: '100%'
                          }}>
                          <Box sx={{ position: 'absolute', top: 8, right: -30, bgcolor: '#FFD700', color: '#0F172A', px: 4, py: 0.2, transform: 'rotate(45deg)', fontWeight: 'bold', fontSize: '0.6rem', fontFamily: 'Orbitron' }}>CHAMPION</Box>
                          <Typography variant="h1" sx={{ fontSize: '2.5rem', mb: 0.5 }}>🏆</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 0.5, fontFamily: 'Orbitron', fontSize: '1rem' }}>{winner.displayName}</Typography>
                          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5, fontSize: '0.75rem' }}>{winner.tournamentName}</Typography>
                          <Box sx={{ bgcolor: 'rgba(255, 215, 0, 0.1)', py: 0.8, borderRadius: '8px', border: `1px dashed #FFD700` }}>
                            <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 'bold' }}>{winner.prize}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Stack alignItems="center" spacing={2} sx={{ py: 5, opacity: 0.5 }}>
                    <Typography variant="h1" sx={{ fontSize: '4rem' }}>🏅</Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'Orbitron' }}>No winners recorded for {format(selectedDate, 'PPP')}</Typography>
                    <Typography variant="body1">Champions of this day will be announced soon.</Typography>
                  </Stack>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Winners;
