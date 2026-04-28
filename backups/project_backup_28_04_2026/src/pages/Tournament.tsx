import React from 'react';
import { Container, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Tournament: React.FC = () => {

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tournaments
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Knockout Tournament</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A single-elimination tournament where the loser of each match is immediately eliminated.
            </Typography>
            <Button component={Link} to="/knockout-tournament" variant="contained">
              View Knockout Tournament
            </Button>
          </Paper>
        </Grid>

        {/* Add more tournament types here */}
        
      </Grid>
    </Container>
  );
};

export default Tournament;
