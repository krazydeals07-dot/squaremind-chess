import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Box, CircularProgress, TablePagination } from '@mui/material';
import { UserProfile } from '../types';
import ChessIcon from '../components/ChessIcon';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy("stats.rating", "desc"), limit(100));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const users: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data() as UserProfile);
            });
            setLeaderboard(users);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching leaderboard: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    return (
        <Container maxWidth="md" sx={{ mt: -3, mb: 0, py: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper sx={{ p: 1.5, my: 0, background: 'rgba(0,0,0,0.7)', borderRadius: '16px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ mt: 0, mb: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ transform: 'scale(0.65)', mb: -2.5 }}>
                        <ChessIcon />
                    </Box>
                    <Typography variant="h5" align="center" sx={{ fontFamily: '"Orbitron", sans-serif', mb: 0.5, color: '#FFA500', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        SQUAREMIND LEADERBOARD
                    </Typography>
                </Box>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2}}>
                         <CircularProgress color="warning" />
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ overflow: 'hidden' }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', py: 0.5 }}>Rank</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', py: 0.5 }}>Player</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', py: 0.5 }} align="right">Rating</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', py: 0.5 }} align="right">Games</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leaderboard.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                                        <TableRow key={user.uid} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                                            <TableCell sx={{ color: 'white', py: 0.4, fontSize: '0.9rem' }}>{(page * rowsPerPage) + index + 1}</TableCell>
                                            <TableCell sx={{ color: 'white', py: 0.4, fontSize: '0.9rem' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar src={user.photoURL} sx={{ mr: 2, width: 32, height: 32 }} />
                                                    {user.displayName}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: 'white', py: 0.4, fontSize: '0.9rem' }} align="right">{user.stats.rating}</TableCell>
                                            <TableCell sx={{ color: 'white', py: 0.4, fontSize: '0.9rem' }} align="right">{user.stats.gamesPlayed}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[]}
                            component="div"
                            count={leaderboard.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            sx={{
                                color: 'white',
                                mt: 0,
                                '.MuiTablePagination-toolbar': { minHeight: '32px' },
                                '.MuiTablePagination-actions': { color: '#FFA500' },
                                '.MuiTablePagination-selectLabel, .MuiTablePagination-input': { display: 'none' }
                            }}
                        />
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default LeaderboardPage;