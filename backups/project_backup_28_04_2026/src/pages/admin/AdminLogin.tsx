import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Button, TextField, Typography, Container, Paper, Alert, CircularProgress } from '@mui/material';

const AdminLogin = () => {
    const [email, setEmail] = useState('krazydeals07@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();
    const { login, isAdmin, currentUser, loading } = useAuth();

    // Redirect if user is already an admin
    useEffect(() => {
        if (!loading && currentUser && isAdmin) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [currentUser, isAdmin, loading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            await login(email, password);
            // The onAuthStateChanged listener in AuthContext will now handle
            // updating the user state, and the useEffect above will handle redirection.

        } catch (err: any) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(`Login failed: ${err.message}`);
            }
            setIsLoggingIn(false); // Ensure loading state is reset on error
        }
    };
    
    // Show a loading spinner while the initial auth check is running
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // If user is already logged in and not an admin, they can see the form
    // but might get an auth error if they are not on the sudo list.
    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 8, background: '#1A2035', color: 'white' }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Admin Portal Login
                </Typography>
                <Box component="form" onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoggingIn}
                        InputLabelProps={{ style: { color: '#ccc' } }}
                        sx={{
                            input: { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#888' },
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoggingIn}
                        InputLabelProps={{ style: { color: '#ccc' } }}
                        sx={{
                            input: { color: 'white' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#888' },
                            },
                        }}
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={isLoggingIn}
                        sx={{ mt: 3, mb: 2, p: 1.5 }}
                    >
                        {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminLogin;