import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  ButtonGroup,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { puzzles, dailyPuzzleId } from '../data/puzzles';
import PuzzleDisplay from '../components/puzzles/Puzzle';
import QASession from '../components/puzzles/QASession';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import ChessIcon from '../components/ChessIcon';

type View = 'daily' | 'practice' | 'qa';

interface UserStats {
  score: number;
  streak: number;
  puzzlesSolved: number[];
  lastSolved: string;
}

const Puzzles = () => {
  const { currentUser, isGuest } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    score: 0,
    streak: 0,
    puzzlesSolved: [],
    lastSolved: ''
  });
  const [view, setView] = useState<View>('daily');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dailyPuzzle = puzzles.find(p => p.id === dailyPuzzleId);
  const otherPuzzles = puzzles.filter(p => p.id !== dailyPuzzleId);

  useEffect(() => {
    if (currentUser && !isGuest) {
      const fetchUserStats = async () => {
        const ref = doc(db, 'userPuzzles', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserStats(snap.data() as UserStats);
        } else {
          await setDoc(ref, {
            score: 0,
            streak: 0,
            puzzlesSolved: [],
            lastSolved: ''
          });
        }
      };
      fetchUserStats();
    }
  }, [currentUser, isGuest]);

  const handleSolve = async (points: number, puzzleId: number) => {
    if (userStats.puzzlesSolved.includes(puzzleId)) return;

    if (isGuest) {
      setUserStats(prev => ({
        ...prev,
        score: prev.score + points,
        puzzlesSolved: [...prev.puzzlesSolved, puzzleId]
      }));
      return;
    }

    if (!currentUser) return;

    const ref = doc(db, 'userPuzzles', currentUser.uid);
    const today = new Date().toDateString();

    await updateDoc(ref, {
      score: increment(points),
      puzzlesSolved: [...userStats.puzzlesSolved, puzzleId],
      lastSolved: today
    });

    const snap = await getDoc(ref);
    if (snap.exists()) setUserStats(snap.data() as UserStats);
  };

  const renderView = () => {
    switch (view) {
      case 'daily':
        return dailyPuzzle ? (
          <Box mt={1} display="flex" justifyContent="center">
            <PuzzleDisplay
              puzzle={dailyPuzzle}
              onSolve={(p) => handleSolve(p, dailyPuzzle.id)}
              isGuest={isGuest}
              userStats={userStats}
            />
          </Box>
        ) : null;

      case 'practice':
        return (
          <Grid container spacing={2}>
            {otherPuzzles.map(p => (
              <Grid item xs={12} sm={6} md={4} key={p.id}>
                <PuzzleDisplay
                  puzzle={p}
                  onSolve={(pts) => handleSolve(pts, p.id)}
                  isGuest={isGuest}
                  userStats={userStats}
                />
              </Grid>
            ))}
          </Grid>
        );

      case 'qa':
        return <QASession />;

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 0 }}>
      <Paper elevation={12} sx={{ p: 1, background: '#1E293B', border: '1px solid #334155', borderRadius: '15px', color: 'white', pb: 0.5 }}>
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
            <Box sx={{ mb: 0, mt: 0, transform: { xs: 'scale(0.8)', sm: 'scale(1)' } }}>
                <ChessIcon />
            </Box>
            <Typography variant="h1" sx={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.2rem' }, background: 'linear-gradient(45deg, #F59E0B, #FBBF24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.1 }}>
                Puzzles & Training
            </Typography>
        </Box>

        <ButtonGroup 
            variant="contained" 
            fullWidth 
            sx={{ mb: 1 }} 
            size="small"
            orientation={isMobile ? 'vertical' : 'horizontal'}
        >
            <Button onClick={() => setView('daily')} color={view === 'daily' ? 'primary' : 'inherit'}>Puzzle of the Day</Button>
            <Button onClick={() => setView('practice')} color={view === 'practice' ? 'primary' : 'inherit'}>Practice Puzzles</Button>
            <Button onClick={() => setView('qa')} color={view === 'qa' ? 'primary' : 'inherit'}>Q&A</Button>
        </ButtonGroup>

        {renderView()}

      </Paper>
    </Container>
  );
};

export default Puzzles;