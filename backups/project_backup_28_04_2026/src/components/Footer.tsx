import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
    return (
        <Box 
            component="footer" 
            sx={{ 
                py: 1, // Reduced padding for a shorter footer
                px: 2,
                mt: 'auto',
                backgroundColor: '#1E293B',
                color: '#94A3B8',
                borderTop: '1px solid #334155',
                textAlign: 'center',
                flexShrink: 0
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 0.5 }}>
                <MuiLink 
                    component={RouterLink} 
                    to="/support" 
                    sx={{ 
                        textDecoration: 'none', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        color: '#F59E0B',
                        '&:hover': {
                            color: '#FBBF24'
                        }
                    }}
                >
                    Support
                </MuiLink>
                <MuiLink 
                    component={RouterLink} 
                    to="/privacy" 
                    sx={{ 
                        textDecoration: 'none', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        color: '#F59E0B',
                        '&:hover': {
                            color: '#FBBF24'
                        }
                    }}
                >
                    Privacy Policy
                </MuiLink>
                <MuiLink 
                    component={RouterLink} 
                    to="/terms" 
                    sx={{ 
                        textDecoration: 'none', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        color: '#F59E0B',
                        '&:hover': {
                            color: '#FBBF24'
                        }
                    }}
                >
                    Terms & Conditions
                </MuiLink>
            </Box>
            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                © {new Date().getFullYear()} SquareMind. All Rights Reserved.
            </Typography>
        </Box>
    );
};

export default Footer;