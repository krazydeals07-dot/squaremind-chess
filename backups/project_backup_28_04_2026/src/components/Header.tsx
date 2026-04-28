import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChessIcon from './ChessIcon';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:600px)');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const navLinks = [
        { title: 'Profile', path: `/profile/${currentUser?.uid}` },
        { title: 'Friends', path: '/friends' },
    ];

    const drawer = (
        <Box
            sx={{ width: 250, backgroundColor: '#0F172A', height: '100%', color: 'white' }}
            role="presentation"
            onClick={() => setDrawerOpen(false)}
            onKeyDown={() => setDrawerOpen(false)}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChessIcon noCircle={true} iconColor="white" typographySx={{ fontSize: '2rem' }}/>
                <Typography variant="h6" sx={{ ml: 1, fontFamily: 'Orbitron', fontWeight: 'bold' }}>SQUAREMIND</Typography>
            </Box>
            <Divider sx={{ bgcolor: '#334155' }}/>
            <List>
                {navLinks.map((link) => (
                    <ListItem button key={link.title} onClick={() => handleNavigation(link.path)}>
                        <ListItemText primary={link.title} sx={{ textAlign: 'center' }}/>
                    </ListItem>
                ))}
                 <ListItem button onClick={() => handleNavigation('/')}>
                    <ListItemText primary="Home" sx={{ textAlign: 'center' }}/>
                </ListItem>
            </List>
            <Divider sx={{ bgcolor: '#334155' }}/>
            <List>
                <ListItem button onClick={handleLogout}>
                     <ListItemText primary="Logout" sx={{ textAlign: 'center', color: '#F87171' }}/>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" sx={{
            backgroundColor: '#F97316',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
            <Toolbar sx={{ minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 } }}> 
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <ChessIcon noCircle={true} iconColor="black" typographySx={{ fontSize: '1.5rem', mr: 0.5 }} />
                    <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold', fontFamily: 'Orbitron', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        SQUAREMIND
                    </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                {isMobile ? (
                    <>
                        <IconButton
                            aria-label="open drawer"
                            edge="end"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ color: 'black', p: 0.5 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor="right"
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        >
                            {drawer}
                        </Drawer>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {navLinks.map((link) => (
                            <Button component={Link} to={link.path} key={link.path} sx={{ color: 'black', fontWeight: 'bold', mx: 1, py: 0.5 }}>
                                {link.title}
                            </Button>
                        ))}
                        <Button onClick={handleLogout} sx={{ color: 'black', fontWeight: 'bold', mx: 1, py: 0.5 }}>
                            Logout
                        </Button>
                        <IconButton onClick={() => navigate(-1)} sx={{ color: 'black', p: 0.5 }}>
                           <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1 }}>←</Typography>
                        </IconButton>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;