import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
    Dashboard as DashboardIcon, 
    People as PeopleIcon, 
    EmojiEvents as EmojiEventsIcon, 
    Campaign as CampaignIcon, 
    FormatQuote as FormatQuoteIcon, 
    Star as StarIcon, 
    Category as CategoryIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { text: 'Players', path: '/admin/players', icon: <PeopleIcon /> },
        { text: 'Tournaments', path: '/admin/tournaments', icon: <EmojiEventsIcon /> },
        { text: 'Tournament Types', path: '/admin/tournament-types', icon: <CategoryIcon /> },
        { text: 'Marquee', path: '/admin/marquee', icon: <CampaignIcon /> },
        { text: 'Quotes', path: '/admin/quotes', icon: <FormatQuoteIcon /> },
        { text: 'Winners', path: '/admin/winners', icon: <StarIcon /> },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#1A2035' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Squaremind Admin Panel
                    </Typography>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { 
                        width: drawerWidth, 
                        boxSizing: 'border-box', 
                        background: '#ffffff',
                        borderRight: '1px solid #e0e0e0'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem 
                                button 
                                component={Link} 
                                to={item.path} 
                                key={item.text}
                                selected={location.pathname === item.path}
                                sx={{
                                    mb: 1,
                                    mx: 1,
                                    borderRadius: '8px',
                                    '&.Mui-selected': {
                                        backgroundColor: '#e3f2fd',
                                        color: '#1976d2',
                                        '& .MuiListItemIcon-root': {
                                            color: '#1976d2',
                                        },
                                    },
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
