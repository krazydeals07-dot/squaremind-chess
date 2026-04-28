import React, { useState, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Alert, CircularProgress, Divider, Grid, Dialog, DialogTitle, 
    DialogContent, DialogActions
} from '@mui/material';
import { Delete, Edit, Event as EventIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { createTournament, updateTournament } from '../../utils/firebase/tournaments'; // Function to create/update a tournament

interface TournamentType {
    id: string;
    name: string;
    maxPlayers: number;
    rounds: number;
    entryFee: number;
    prizePool: string;
    timeControl: number; // in minutes
    increment: number; // in seconds
    winnersCount: number;
    playersPerWinner: number;
}

const TournamentTypeManagement: React.FC = () => {
    const [types, setTypes] = useState<TournamentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);

    // State for the creation dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TournamentType | null>(null);
    const [newTournamentName, setNewTournamentName] = useState('');
    const [newTournamentStartDate, setNewTournamentStartDate] = useState('');
    const [newTournamentEndDate, setNewTournamentEndDate] = useState('');

    const [formData, setFormData] = useState<Omit<TournamentType, 'id'>>({
        name: '',
        maxPlayers: 1280,
        rounds: 7,
        entryFee: 0,
        prizePool: '',
        timeControl: 10,
        increment: 2,
        winnersCount: 10,
        playersPerWinner: 128
    });

    const fetchTypes = async () => {
        try {
            setLoading(true);
            const colRef = collection(db, 'tournamentTypes');
            const snapshot = await getDocs(colRef);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TournamentType));
            setTypes(data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch tournament types.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (editId) {
                const docRef = doc(db, 'tournamentTypes', editId);
                await updateDoc(docRef, { ...formData });
                setSuccess('Tournament type updated successfully!');
            } else {
                const colRef = collection(db, 'tournamentTypes');
                await addDoc(colRef, { ...formData });
                setSuccess('New tournament type template added!');
            }
            setFormData({
                name: '', maxPlayers: 1280, rounds: 7, entryFee: 0, prizePool: '', timeControl: 10, increment: 2, winnersCount: 10, playersPerWinner: 128
            });
            setEditId(null);
            fetchTypes();
        } catch (err) {
            setError('Failed to save tournament type.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (type: TournamentType) => {
        const { id, ...data } = type;
        setFormData(data);
        setEditId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this tournament template? This will not affect existing tournaments.')) {
            try {
                await deleteDoc(doc(db, 'tournamentTypes', id));
                setSuccess('Template deleted.');
                fetchTypes();
            } catch (err) {
                setError('Failed to delete template.');
            }
        }
    };
    
    const handleOpenCreateDialog = (type: TournamentType) => {
        setSelectedType(type);
        setNewTournamentName(`${type.name} - ${new Date().toLocaleDateString('en-CA')}`);
        const now = new Date();
        const start = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().substring(0, 16);
        const end = new Date(now.getTime() - now.getTimezoneOffset() * 60000 + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16);
        setNewTournamentStartDate(start);
        setNewTournamentEndDate(end);
        setCreateDialogOpen(true);
    };

    const handleCreateTournament = async () => {
        if (!selectedType || !newTournamentName.trim() || !newTournamentStartDate || !newTournamentEndDate) {
            setError("Please fill all fields for the new tournament.");
            return;
        }
        setSaving(true);
        try {
            const { id, ...typeData } = selectedType;
            const newTournamentData = {
                ...typeData,
                name: newTournamentName,
                type: selectedType.name,
                status: 'ongoing',
                players: [],
                bracket: null,
                currentRound: 0,
                matches: {},
                createdAt: Timestamp.now(),
                startDate: Timestamp.fromDate(new Date(newTournamentStartDate)),
                endDate: Timestamp.fromDate(new Date(newTournamentEndDate)),
            };

            if (selectedType.name.toUpperCase().includes('KNOCKOUT')) {
                // Special handling for the main daily knockout tournament ID
                await updateTournament('daily-knockout', newTournamentData as any);
                setSuccess(`Daily Knockout Tournament settings updated successfully!`);
            } else {
                await createTournament(newTournamentData as any);
                setSuccess(`Tournament '${newTournamentName}' created successfully!`);
            }
            setCreateDialogOpen(false);
        } catch (err) {
            console.error("Failed to create/update tournament:", err);
            setError('Failed to create/update tournament.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Tournament Type & Rules</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Define templates for different tournament formats. You can create a new live tournament from a template.
            </Typography>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 4, mb: 4, borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                    <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} /> {editId ? 'Edit Template' : 'Create New Template'}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Template Name (e.g. Blitz Pro)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Winners Count" value={formData.winnersCount} onChange={(e) => {
                            const count = parseInt(e.target.value);
                            setFormData({...formData, winnersCount: count, maxPlayers: count * formData.playersPerWinner});
                        }} required /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Players Per Winner" value={formData.playersPerWinner} onChange={(e) => {
                            const perWinner = parseInt(e.target.value);
                            setFormData({...formData, playersPerWinner: perWinner, maxPlayers: formData.winnersCount * perWinner});
                        }} required /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Max Players" value={formData.maxPlayers} InputProps={{ readOnly: true }} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Total Rounds" value={formData.rounds} onChange={(e) => setFormData({...formData, rounds: parseInt(e.target.value)})} required /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth type="number" label="Entry Fee (₹)" value={formData.entryFee} onChange={(e) => setFormData({...formData, entryFee: parseInt(e.target.value)})} /></Grid>
                        <Grid item xs={12} sm={6} md={4}><TextField fullWidth label="Prize Pool Details" placeholder="e.g. Winner: ₹1000" value={formData.prizePool} onChange={(e) => setFormData({...formData, prizePool: e.target.value})} /></Grid>
                        <Grid item xs={12} sm={6} md={2}><TextField fullWidth type="number" label="Time (Mins)" value={formData.timeControl} onChange={(e) => setFormData({...formData, timeControl: parseInt(e.target.value)})} /></Grid>
                        <Grid item xs={12} sm={6} md={2}><TextField fullWidth type="number" label="Inc (Secs)" value={formData.increment} onChange={(e) => setFormData({...formData, increment: parseInt(e.target.value)})} /></Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {editId && <Button variant="outlined" onClick={() => { setEditId(null); setFormData({name: '', maxPlayers: 1280, rounds: 7, entryFee: 0, prizePool: '', timeControl: 10, increment: 2, winnersCount: 10, playersPerWinner: 128}); }}>Cancel Edit</Button>}
                            <Button type="submit" variant="contained" size="large" sx={{ px: 4 }} disabled={saving}>{saving ? <CircularProgress size={24} /> : (editId ? 'Update Template' : 'Save Template')}</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}><TableRow><TableCell sx={{ fontWeight: 'bold' }}>Format Name</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Players/Rounds</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Winners Info</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Entry/Prize</TableCell><TableCell sx={{ fontWeight: 'bold' }}>Time Control</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell></TableRow></TableHead>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow> : types.map((type) => (
                                <TableRow key={type.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{type.name}</TableCell>
                                    <TableCell>{`${type.maxPlayers} Players / ${type.rounds} Rds`}</TableCell>
                                    <TableCell>{`${type.winnersCount} Winners / ${type.playersPerWinner} Per`}</TableCell>
                                    <TableCell>{`₹${type.entryFee} / ${type.prizePool || 'None'}`}</TableCell>
                                    <TableCell>{`${type.timeControl}m + ${type.increment}s`}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenCreateDialog(type)} color="success" title="Create Tournament from this Type"><EventIcon /></IconButton>
                                        <IconButton onClick={() => handleEdit(type)} color="primary" title="Edit Template"><Edit /></IconButton>
                                        <IconButton onClick={() => handleDelete(type.id)} color="error" title="Delete Template"><Delete /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Tournament from Type: {selectedType?.name}</DialogTitle>
                <form onSubmit={(e) => { e.preventDefault(); handleCreateTournament(); }}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}><TextField fullWidth label="New Tournament Name" value={newTournamentName} onChange={(e) => setNewTournamentName(e.target.value)} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth type="datetime-local" label="Start Date" value={newTournamentStartDate} onChange={(e) => setNewTournamentStartDate(e.target.value)} InputLabelProps={{ shrink: true }} required /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth type="datetime-local" label="End Date" value={newTournamentEndDate} onChange={(e) => setNewTournamentEndDate(e.target.value)} InputLabelProps={{ shrink: true }} required /></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pb: 2 }}>
                        <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={saving}>{saving ? <CircularProgress size={24} /> : 'Create Now'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default TournamentTypeManagement;