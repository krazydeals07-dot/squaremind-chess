import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ensure correct path

const AdminRoute: React.FC = () => {
    const { currentUser, loading, isAdmin } = useAuth();

    console.log('AdminRoute check:', { currentUser: currentUser?.email, loading, isAdmin });

    if (loading) {
        console.log('AdminRoute: still loading auth state...');
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        console.log('AdminRoute: No user found. Redirecting to /admin/login');
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        console.log('AdminRoute: User is not an admin. Redirecting to /');
        return <Navigate to="/" replace />; // Or a dedicated 'unauthorized' page
    }

    console.log('AdminRoute: Access granted, rendering admin component.');
    return <Outlet />; // Render nested routes
};

export default AdminRoute;