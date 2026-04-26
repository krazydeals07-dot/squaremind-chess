import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
    children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    // 1. First, wait for the authentication state to be determined.
    if (loading) {
        // Show a full-page loader while checking auth status.
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // 2. After loading, if there is no user, redirect to the login page.
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // 3. If the user is authenticated, render the children inside its own Suspense.
    // This ensures that the lazy-loaded component is only loaded AFTER auth is confirmed,
    // and it has its own fallback for the component-loading phase.
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>}>
            {children}
        </Suspense>
    );
};

export default PrivateRoute;
