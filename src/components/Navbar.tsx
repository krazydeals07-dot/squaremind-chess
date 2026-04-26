import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    Menu as MenuIcon, 
    ArrowBack as ArrowBackIcon,
    AdminPanelSettings as AdminIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ChessIcon from './ChessIcon';

const Navbar: React.FC = () => {
    const { currentUser, isGuest, logout, signInAsGuest } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleGuestSignIn = async () => {
        handleClose();
        try {
            await signInAsGuest();
            navigate('/');
        } catch (error) {
            console.error("Guest sign-in failed", error);
        }
    }

    const navigateAndClose = (path: string) => {
        handleClose();
        navigate(path);
    }

    const showBackButton = location.pathname !== '/';

    const buttonSx = {
        color: 'black',
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.9rem',
        mx: 1
    };

    const menuItemSx = {
        fontFamily: '"Roboto", sans-serif',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: 'black'
    };

    const loggedInMenuItems = [
        <MenuItem key="profile" sx={menuItemSx} onClick={() => navigateAndClose(`/profile/${currentUser!.uid}`)}>Profile</MenuItem>,
        <MenuItem key="friends" sx={menuItemSx} onClick={() => navigateAndClose('/friends')}>Friends</MenuItem>,
        <MenuItem key="admin" sx={menuItemSx} onClick={() => navigateAndClose('/admin/login')}>
            <ListItemIcon sx={{ minWidth: '35px' }}><AdminIcon sx={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Admin Panel" primaryTypographyProps={{ sx: menuItemSx }} />
        </MenuItem>,
        <MenuItem key="logout" sx={menuItemSx} onClick={handleLogout}>Logout</MenuItem>
    ];

    const loggedOutMenuItems = [
        <MenuItem key="login" sx={menuItemSx} onClick={() => navigateAndClose('/login')}>Login</MenuItem>,
        <MenuItem key="guest" sx={menuItemSx} onClick={handleGuestSignIn}>Play as Guest</MenuItem>,
        <MenuItem key="signup" sx={menuItemSx} onClick={() => navigateAndClose('/signup')}>Sign Up</MenuItem>,
        <MenuItem key="admin" sx={menuItemSx} onClick={() => navigateAndClose('/admin/login')}>
            <ListItemIcon sx={{ minWidth: '35px' }}><AdminIcon sx={{ color: 'black' }} /></ListItemIcon>
            <ListItemText primary="Admin Panel" primaryTypographyProps={{ sx: menuItemSx }} />
        </MenuItem>
    ];

    return (
        <AppBar position="static" sx={{
            background: '#FF8C00', // Orange background
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.2)',
            minHeight: '48px',
        }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: '48px !important' }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            fontFamily: '"Orbitron", sans-serif',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'white', // Back to white
                            textDecoration: 'none',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                            fontSize: '1.2rem'
                        }}
                    >
                        <ChessIcon noCircle={true} typographySx={{ fontSize: '1.5rem', mr: '8px' }} />
                        SQUAREMIND
                    </Typography>

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        {currentUser && !isGuest ? (
                             <>
                                <Button onClick={() => navigate(`/profile/${currentUser!.uid}`)} sx={buttonSx}>
                                    PROFILE
                                </Button>
                                <Button onClick={() => navigate('/friends')} sx={buttonSx}>
                                    FRIENDS
                                </Button>
                                <Button onClick={handleLogout} sx={buttonSx}>
                                    LOGOUT
                                </Button>
                                <IconButton onClick={() => navigate('/admin/login')} sx={{ color: 'black', ml: 1 }}>
                                    <AdminIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <Button component={Link} to="/login" sx={buttonSx}>
                                    LOGIN
                                </Button>
                                <Button onClick={handleGuestSignIn} sx={buttonSx}>
                                    PLAY AS GUEST
                                </Button>
                                <Button component={Link} to="/signup" sx={buttonSx}>
                                    SIGN UP
                                </Button>
                                <IconButton onClick={() => navigate('/admin/login')} sx={{ color: 'black', ml: 1 }}>
                                    <AdminIcon />
                                </IconButton>
                            </>
                        )}
                        {showBackButton && (
                            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'black', ml: 1 }}>
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="small"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                           {currentUser && !isGuest ? loggedInMenuItems : loggedOutMenuItems}
                           {showBackButton && (
                               <MenuItem sx={menuItemSx} onClick={() => { handleClose(); navigate(-1);}}>
                                   <ArrowBackIcon sx={{ mr:1 }} fontSize="small" /> BACK
                               </MenuItem>
                           )}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;