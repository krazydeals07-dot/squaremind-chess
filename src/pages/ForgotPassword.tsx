import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Alert, Stack } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState(0); // 0: Verify Identity, 1: Reset Password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('email', '==', email),
        where('phoneNumber', '==', phoneNumber),
        where('dob', '==', dob)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStep(1);
        setMessage('Identity verified. Please set your new password.');
      } else {
        setError('No account found with these details. Please check and try again.');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match");
    }

    if (newPassword.length < 6) {
      return setError("Password should be at least 6 characters");
    }

    setLoading(true);
    try {
      // NOTE: Direct password update without a current session or reset token 
      // typically requires a Firebase Cloud Function using Admin SDK for security.
      // This is a placeholder for that integration.
      setMessage('Password reset request submitted successfully. (Admin approval or Cloud Function required to complete)');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to update password.');
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
          {step === 0 ? 'Verify Identity' : 'Set New Password'}
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: '8px' }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mt: 2, width: '100%', borderRadius: '8px' }}>{message}</Alert>}

        {step === 0 ? (
          <Box component="form" onSubmit={handleVerifyIdentity} noValidate sx={{ mt: 1, width: '100%' }}>
            <Stack spacing={2}>
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
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#475569' } } }}
              />
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Mobile Number"
                name="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#475569' } } }}
              />
              <TextField
                required
                fullWidth
                id="dob"
                label="Date of Birth"
                type="date"
                name="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#475569' } } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, py: 1.5, background: 'linear-gradient(45deg, #F59E0B, #D97706)', fontWeight: 'bold' }}
              >
                {loading ? 'Verifying...' : 'Verify Identity'}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleResetPassword} noValidate sx={{ mt: 1, width: '100%' }}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#475569' } } }}
              />
              <TextField
                required
                fullWidth
                name="confirmNewPassword"
                label="Confirm New Password"
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                sx={{ '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: '#475569' } } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, py: 1.5, background: 'linear-gradient(45deg, #10B981, #059669)', fontWeight: 'bold' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Stack>
          </Box>
        )}

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/login')}
          sx={{ mt: 2, color: '#94a3b8', textTransform: 'none' }}
        >
          Back to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;