import React, { useState, useEffect } from 'react';
import { 
    Box, Button, TextField, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, IconButton, 
    Alert, CircularProgress, Divider, Grid, Chip, Accordion,
    AccordionSummary, AccordionDetails
} from '@mui/material';
import { Delete, Save, Event as EventIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';

interface Winner {
    id: string;
    displayName: string;
    tournamentName: string;
    prize: string;
    date: any;
}

const WinnerManagement: React.FC = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        tournamentName: '',
        prize: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const formatDate = (dateSource: any) => {
        if (!dateSource) return 'N/A';
        const d = dateSource.toDate ? dateSource.toDate() : new Date(dateSource);
        return format(d, 'PPP'); // Format like "May 1, 2026"
    };

    const groupWinnersByDate = (winnersList: Winner[]) => {
        return winnersList.reduce((acc, winner) => {
            const dateKey = formatDate(winner.date);
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(winner);
            return acc;
        }, {} as Record<string, Winner[]>);
    };

    const fetchWinners = async () => {
        try {
            setLoading(true);
            const winnersRef = collection(db, 'winners');
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
            
            const q = query(
                winnersRef, 
                orderBy('date', 'desc'), 
                where('date', '>=', Timestamp.fromDate(ninetyDaysAgo))
            );
            
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as Winner));
            setWinners(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch winners. This might require creating a composite index in Firestore. Check the browser console for a link to create it.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.displayName || !formData.tournamentName || !formData.date) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const winnerDate = new Date(formData.date);
            await addDoc(collection(db, 'winners'), {
                displayName: formData.displayName,
                tournamentName: formData.tournamentName,
                prize: formData.prize || 'Champion',
                date: Timestamp.fromDate(winnerDate)
            });
            
            setSuccess(`Winner ${formData.displayName} announced for ${formData.date}!`);
            setFormData({ 
                displayName: '', 
                tournamentName: '', 
                prize: '', 
                date: format(new Date(), 'yyyy-MM-dd') 
            });
            fetchWinners();
        } catch (err) {
            console.error(err);
            setError('Failed to announce winner.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Remove this winner record?')) {
            try {
                await deleteDoc(doc(db, 'winners', id));
                fetchWinners();
            } catch (err) {
                setError('Failed to delete winner.');
            }
        }
    };

    const groupedWinners = groupWinnersByDate(winners);

    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Winner Management</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Announce new winners and view the history for the last 90 days.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 4, mb: 4, borderRadius: '12px', border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <EventIcon sx={{ mr: 1, color: 'primary.main' }} /> Announce New Winner
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Form Fields... */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth type="date" label="Winning Date" InputLabelProps={{ shrink: true }} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Winner Name" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} required />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Tournament" value={formData.tournamentName} onChange={(e) => setFormData({...formData, tournamentName: e.target.value})} placeholder="e.g. Daily Knockout" required />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField fullWidth label="Prize" value={formData.prize} onChange={(e) => setFormData({...formData, prize: e.target.value})} placeholder="e.g. ₹500" />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />} disabled={saving} size="large" sx={{ px: 5, borderRadius: '8px' }}>
                                {saving ? 'Announcing...' : 'Save Winner'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Winner History (Last 90 Days)</Typography>
            <Paper sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
                ) : Object.keys(groupedWinners).length === 0 ? (
                    <Typography align="center" sx={{ py: 5 }}>No winners recorded in the last 90 days.</Typography>
                ) : (
                    Object.entries(groupedWinners).map(([date, dailyWinners], index) => (
                        <Accordion key={date} defaultExpanded={index === 0} sx={{ boxShadow:'none', '&:before': { display: 'none' }, borderBottom: index < Object.keys(groupedWinners).length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8f9fa' }}>
                                <Grid container justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                                    <Grid item>
                                        <Typography sx={{ fontWeight: 600 }}>{date}</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Chip label={`${dailyWinners.length} Winner(s)`} size="small" color="primary" />
                                    </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            {dailyWinners.map((winner) => (
                                                <TableRow key={winner.id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{winner.displayName}</TableCell>
                                                    <TableCell>{winner.tournamentName}</TableCell>
                                                    <TableCell>{winner.prize}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton onClick={() => handleDelete(winner.id)} color="error" size="small"><Delete /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Paper>
        </Box>
    );
};

export default WinnerManagement;
