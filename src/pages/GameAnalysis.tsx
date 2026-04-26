
import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const GameAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { finalFen } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper 
        elevation={10} 
        sx={{ 
          p: 4, 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontFamily: "'Orbitron', sans-serif", color: '#FFA500' }}>
          Game Analysis
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Review the final position of the game and analyze the outcome.
        </Typography>
        
        {finalFen && (
          <Box sx={{ my: 3 }}>
             <Typography variant="h6" sx={{ fontFamily: "'Orbitron', sans-serif", mb: 2 }}>Final Board Position:</Typography>
             {/* In a real app, you would render a chessboard here with the final FEN */}
             <Typography sx={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', p: 2, borderRadius: '8px' }}>
                {finalFen}
             </Typography>
          </Box>
        )}

        <Button 
          variant="contained" 
          onClick={() => navigate('/')} 
          sx={{ mt: 3, bgcolor: '#FFA500', '&:hover': { bgcolor: '#FFC864' } }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default GameAnalysis;
