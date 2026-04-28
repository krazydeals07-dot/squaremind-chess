
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category'; // New icon for Tournament Types

interface AdminSidebarProps {
    open: boolean;
    onClose: () => void;
}

const drawerWidth = 240;

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, onClose }) => {
    const menuItems = [
        { text: 'Dashboard', to: '/admin/dashboard', icon: <DashboardIcon /> },
        { text: 'Player Management', to: '/admin/players', icon: <PeopleIcon /> },
        { text: 'Tournaments', to: '/admin/tournaments', icon: <EmojiEventsIcon /> },
        { text: 'Marquee', to: '/admin/marquee', icon: <ViewCarouselIcon /> },
        { text: 'Quotes', to: '/admin/quotes', icon: <FormatQuoteIcon /> },
        { text: 'Winners', to: '/admin/winners', icon: <StarIcon /> },
        { text: 'Tournament Types', to: '/admin/tournament-types', icon: <CategoryIcon /> }, // New menu item
    ];

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item, index) => (
                        <ListItem button component={Link} to={item.to} key={index} onClick={onClose}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default AdminSidebar;
