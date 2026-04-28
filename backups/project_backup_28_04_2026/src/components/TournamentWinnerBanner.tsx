import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

// Define the blinking animation
const blink = keyframes`
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

const TournamentWinnerBanner = () => {
  return (
    <Link to="/winners" style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          p: { xs: 1, md: 1.5 },
          my: { xs: 1, md: 1.5 },
          mx: 'auto',
          maxWidth: '100%',
          width: { xs: '95%', sm: 'fit-content' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #00BCD4, #0097A7)',
          color: 'white',
          textAlign: 'center',
          borderRadius: '12px',
          animation: `${blink} 2.2s linear infinite`,
          cursor: 'pointer',
          border: '1px solid #00838F',
          boxShadow: '0 4px 25px 0 rgba(0, 229, 255, 0.6)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#0097A7',
            transform: 'scale(1.05)',
            boxShadow: '0 8px 30px 0 rgba(0, 229, 255, 0.8)',
          },
        }}
      >
        <Typography variant="h6" component="h2" sx={{ 
          fontWeight: 'bold', 
          fontSize: { xs: '0.85rem', sm: '1.2rem' },
          textTransform: 'uppercase', 
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          🏆 Tournament Winners 🏆
        </Typography>
      </Box>
    </Link>
  );
};

export default TournamentWinnerBanner;