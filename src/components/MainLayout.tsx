import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import Marquee from './Marquee';

const MainLayout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Marquee />
            <Container component="main" maxWidth="xl" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 1 }}>
                <Outlet />
            </Container>
            <Footer />
        </Box>
    );
};

export default MainLayout;