import React, { useState } from 'react';
import { Typography, Paper, Box, Button, Grid, Chip } from '@mui/material';
import { questions } from '../../data/questions';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// Helper function to shuffle an array using the Fisher-Yates algorithm
const shuffleArray = (array: Question[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const QASession: React.FC = () => {
  // Initialize state with shuffled questions
  const [shuffledQuestions, setShuffledQuestions] = useState(() => shuffleArray(questions));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    // If it's the last question, reshuffle for a new session
    if (currentQuestionIndex === shuffledQuestions.length - 1) {
      setShuffledQuestions(shuffleArray(questions));
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const getButtonVariant = (option: string) => {
      if (!isAnswered) return 'outlined';
      if (option === currentQuestion.correctAnswer) return 'contained';
      if (option === selectedAnswer) return 'contained';
      return 'outlined';
  }

  const getButtonColor = (option: string) => {
      if (!isAnswered) return 'primary';
      if (option === currentQuestion.correctAnswer) return 'success';
      if (option === selectedAnswer) return 'error';
      return 'primary';
  }

  if (!currentQuestion) {
      return (
          <Paper elevation={10} sx={{ p: {xs:2, md:4}, background: 'rgba(30, 30, 40, 0.85)', borderRadius: '15px', color: 'white' }}>
              <Typography>Loading questions...</Typography>
          </Paper>
      )
  }

  return (
    <Paper elevation={10} sx={{ p: {xs:2, md:4}, background: 'rgba(30, 30, 40, 0.85)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white', minHeight: '400px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontFamily: 'Orbitron', color: '#FFA500' }}>Question #{currentQuestion.id}</Typography>
          <Chip label={currentQuestion.difficulty} color={currentQuestion.difficulty === 'Easy' ? 'success' : currentQuestion.difficulty === 'Medium' ? 'warning' : 'error'} />
      </Box>
      
      <Typography variant="h6" sx={{ mb: 4, color: 'lightgray', minHeight: '60px' }}>{currentQuestion.question}</Typography>

      <Grid container spacing={2}>
        {currentQuestion.options.map((option: string) => (
          <Grid item xs={12} sm={6} key={option}>
            <Button
              fullWidth
              variant={getButtonVariant(option)}
              color={getButtonColor(option)}
              onClick={() => handleAnswerSelect(option)}
              sx={{ p: 2, minHeight: '60px' }}
            >
              {option}
            </Button>
          </Grid>
        ))}
      </Grid>

      {isAnswered && (
        <Box sx={{ mt: 4, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <Typography variant="h6" color={selectedAnswer === currentQuestion.correctAnswer ? 'lightgreen' : '#ff7961'}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
            </Typography>
            <Typography sx={{mt: 1, color: 'lightgray'}}>{currentQuestion.explanation}</Typography>
            <Button variant="contained" onClick={handleNextQuestion} sx={{mt: 2}}>
                {currentQuestionIndex === shuffledQuestions.length - 1 ? 'Start New Session' : 'Next Question'}
            </Button>
        </Box>
      )}
    </Paper>
  );
};

export default QASession;
