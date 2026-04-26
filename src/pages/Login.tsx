import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Paper, Grid, Alert, InputAdornment, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import ChessIcon from '../components/ChessIcon';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [agreed, setAgreed] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!agreed) {
            setError("Please agree to the Privacy Policy and Terms of Service to continue.");
            return;
        }
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    const handleClickShowPassword = () => {
      setShowPassword(!showPassword);
    };
  
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={12} sx={{ 
                marginTop: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: 4, 
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                color: 'white'
            }}>
                <ChessIcon />
                <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Sign In
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2, backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#ffcdd2' }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#475569' },
                                '&:hover fieldset': { borderColor: '#64748b' },
                                '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                                color: 'white'
                            }
                        }}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        sx={{ 
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#475569' },
                                '&:hover fieldset': { borderColor: '#64748b' },
                                '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
                                color: 'white'
                            }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                sx={{ color: '#94a3b8' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{color: '#94a3b8'}}/>}
                        label={
                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                I agree to the <Link to="/privacy" style={{ color: '#38bdf8' }}>Privacy Policy</Link> and <Link to="/terms" style={{ color: '#38bdf8' }}>Terms of Service</Link>.
                            </Typography>
                        }
                        sx={{ mt: 1, width: '100%' }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, background: 'linear-gradient(45deg, #38bdf8, #3b82f6)', fontWeight: 'bold', padding: '12px' }}
                    >
                        Sign In
                    </Button>
                    <Grid container sx={{ mt: 2 }}>
                        <Grid item xs>
                            <Link to="/forgot-password" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link to="/signup" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
