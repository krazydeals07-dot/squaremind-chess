import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert, Stack } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return setError("Please enter your email address");
    }

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("No user found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Failed to reset password. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={10} sx={{ 
        mt: 8, p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        background: 'rgba(30, 41, 59, 0.9)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <Typography component="h1" variant="h5" color="white" sx={{ textTransform: 'uppercase', fontWeight: 'bold', mb: 2 }}>
          Password Reset
        </Typography>

        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, textAlign: 'center' }}>
          Enter your email and we'll send you a link to reset your password.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '8px' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2, width: '100%', borderRadius: '8px' }}>{message}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <Stack spacing={3}>
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  color: 'white', 
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#64748b' },
                  '&.Mui-focused fieldset': { borderColor: '#38bdf8' }
                } 
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                py: 1.5, 
                background: 'linear-gradient(45deg, #38bdf8, #3b82f6)', 
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0ea5e9, #2563eb)'
                }
              }}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>
          </Stack>
        </Box>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 3, color: '#94a3b8', textTransform: 'none', '&:hover': { color: '#38bdf8' } }}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;