import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, createTheme, ThemeProvider } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/admin/AdminLayout'; 

// Lazy-loaded imports for faster initial load
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup.tsx'));
const PlayAI = React.lazy(() => import('./pages/PlayAI'));
const PlayFriends = React.lazy(() => import('./pages/PlayFriends'));
const GameRoom = React.lazy(() => import('./pages/GameRoom')); // Import GameRoom
const Profile = React.lazy(() => import('./pages/Profile'));
const Puzzles = React.lazy(() => import('./pages/Puzzles'));
const Tournaments = React.lazy(() => import('./pages/Tournaments'));
const TournamentDetails = React.lazy(() => import('./pages/TournamentDetails'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const Tutorials = React.lazy(() => import('./pages/Tutorials.tsx'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Top100 = React.lazy(() => import('./pages/Top100'));
const PrivacyPolicy = React.lazy(() => import('./pages/Privacy'));
const TermsAndConditions = React.lazy(() => import('./pages/Terms'));
const Support = React.lazy(() => import('./pages/Support'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const KnockoutTournament = React.lazy(() => import('./pages/KnockoutTournament'));
const GameAnalysis = React.lazy(() => import('./pages/GameAnalysis'));
const LiveGame = React.lazy(() => import('./pages/LiveGame'));
const Friends = React.lazy(() => import('./pages/Friends'));
const TournamentCategoryPage = React.lazy(() => import('./pages/TournamentCategoryPage'));
const GameReplayPage = React.lazy(() => import('./pages/GameReplayPage'));
const Winners = React.lazy(() => import('./pages/Winners'));
const LiveTournamentGame = React.lazy(() => import('./pages/LiveTournamentGame'));


// Admin pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const PlayerManagement = React.lazy(() => import('./pages/admin/PlayerManagement'));
const TournamentManagement = React.lazy(() => import('./pages/admin/TournamentManagement'));
const MarqueeManagement = React.lazy(() => import('./pages/admin/MarqueeManagement'));
const QuotesManagement = React.lazy(() => import('./pages/admin/QuotesManagement'));
const WinnerManagement = React.lazy(() => import('./pages/admin/WinnerManagement'));
const TournamentTypeManagement = React.lazy(() => import('./pages/admin/TournamentTypeManagement')); // New import


// Custom theme configuration
const theme = createTheme({
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    textDecoration: 'none',
                },
            },
        },
    },
});

const App: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            const backButtonHandler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (location.pathname === '/') {
                    CapacitorApp.exitApp();
                } else {
                    window.history.back();
                }
            });

            return () => {
                backButtonHandler.then(h => h.remove());
            };
        }
    }, [location]);

    return (
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>}>
                <Routes>
                    {/* Admin Routes - Login and Signup are outside the protected layout */}
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes with proper nesting */}
                    <Route element={<AdminRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/players" element={<PlayerManagement />} />
                            <Route path="/admin/tournaments" element={<TournamentManagement />} />
                            <Route path="/admin/marquee" element={<MarqueeManagement />} />
                            <Route path="/admin/quotes" element={<QuotesManagement />} />
                            <Route path="/admin/winners" element={<WinnerManagement />} />
                            <Route path="/admin/tournament-types" element={<TournamentTypeManagement />} /> {/* New Route */}
                        </Route>
                    </Route>

                    {/* Main Application Routes - These routes ALL use the MainLayout */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/play/ai" element={<PlayAI />} />
                        <Route path="/puzzles" element={<Puzzles />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/tutorials" element={<Tutorials />} />
                        <Route path="/top100" element={<Top100 />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/winners" element={<Winners />} />
                        
                        {/* Protected Routes */}
                        <Route path="/profile/:userId?" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/play/friends" element={<PrivateRoute><PlayFriends /></PrivateRoute>} />
                        <Route path="/game/:gameId" element={<PrivateRoute><GameRoom /></PrivateRoute>} />
                        <Route path="/friends" element={<PrivateRoute><Friends /></PrivateRoute>} />
                        <Route path="/tournaments" element={<PrivateRoute><Tournaments /></PrivateRoute>} />
                        <Route path="/tournament/:tournamentId" element={<PrivateRoute><TournamentDetails /></PrivateRoute>} />
                        <Route path="/replay/:gameId" element={<PrivateRoute><GameReplayPage /></PrivateRoute>} />
                        
                        {/* New Tournament Category Routes */}
                        <Route path="/tournaments/knockout" element={<PrivateRoute><KnockoutTournament /></PrivateRoute>} />
                        <Route path="/tournaments/upcoming" element={<PrivateRoute><TournamentCategoryPage title="Upcoming Challenges" filterFn={(t) => t.status === 'upcoming'} /></PrivateRoute>} />
                        <Route path="/tournaments/live" element={<PrivateRoute><TournamentCategoryPage title="Live Arenas" filterFn={(t) => t.status === 'ongoing'} /></PrivateRoute>} />
                        <Route path="/tournaments/swiss" element={<PrivateRoute><TournamentCategoryPage title="Swiss Leagues" filterFn={(t) => t.type === 'Swiss'} /></PrivateRoute>} />

                        <Route path="/daily-knockout" element={<PrivateRoute><KnockoutTournament /></PrivateRoute>} />
                        <Route path="/live" element={<PrivateRoute><LiveGame /></PrivateRoute>} />
                        <Route path="/analysis/:gameId" element={<PrivateRoute><GameAnalysis /></PrivateRoute>} />
                        
                        {/* LiveTournamentGame moved inside MainLayout for consistent Header and Footer */}
                        <Route path="/tournament/:tournamentId/game/:gameId" element={<PrivateRoute><LiveTournamentGame /></PrivateRoute>} />
                    </Route>

                    {/* Fallback for any other route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
    );
};

export default App;