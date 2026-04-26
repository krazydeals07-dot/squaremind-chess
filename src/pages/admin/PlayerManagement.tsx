import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    CircularProgress, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Typography, 
    Alert,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import { Delete, Add, Block } from '@mui/icons-material';
import { getUsers, updateUser, deleteUser, UserData } from '../../utils/firebase/users';
import { getTournamentsRT, addPlayerToTournament, Tournament } from '../../utils/firebase/tournaments';

interface ExtendedUserData extends UserData {
    isBanned?: boolean;
}

const PlayerManagement: React.FC = () => {
    const [players, setPlayers] = useState<ExtendedUserData[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<ExtendedUserData | null>(null);
    const [selectedTournament, setSelectedTournament] = useState('');

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const data = await getUsers() as ExtendedUserData[];
            setPlayers(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch players.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlayers();
        const unsubscribe = getTournamentsRT(
            (data) => setTournaments(data),
            (err) => console.error("Failed to fetch tournaments", err)
        );
        return () => unsubscribe();
    }, []);

    const handleRoleChange = async (player: ExtendedUserData, isAdmin: boolean) => {
        try {
            await updateUser(player.uid, { isAdmin });
            setPlayers(players.map(p => p.uid === player.uid ? { ...p, isAdmin } : p));
        } catch (err) {
            setError(`Failed to update role for ${player.displayName}.`);
            console.error(err);
        }
    };

    const handleBanToggle = async (player: ExtendedUserData, isBanned: boolean) => {
        try {
            await updateUser(player.uid, { isBanned });
            setPlayers(players.map(p => p.uid === player.uid ? { ...p, isBanned } : p));
        } catch (err) {
            setError(`Failed to update ban status for ${player.displayName}.`);
            console.error(err);
        }
    };
    
    const handleDelete = async (uid: string) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await deleteUser(uid);
                fetchPlayers();
            } catch (err) {
                setError('Failed to delete user.');
                console.error(err);
            }
        }
    };

    const handleOpenModal = (player: ExtendedUserData) => {
        setSelectedPlayer(player);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setSelectedPlayer(null);
        setSelectedTournament('');
    };

    const handleAddPlayerToTournament = async () => {
        if (!selectedPlayer || !selectedTournament) return;

        try {
            await addPlayerToTournament(selectedTournament, { uid: selectedPlayer.uid, displayName: selectedPlayer.displayName, photoURL: selectedPlayer.photoURL });
            handleCloseModal();
        } catch (error) {
            setError('Failed to add player to tournament.');
            console.error(error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                Player Management
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Mobile</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>Banned</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {players.map((player) => {
                                const isAnonymous = !player.displayName || player.displayName === 'N/A';
                                return (
                                    <TableRow 
                                        key={player.uid} 
                                        sx={{ 
                                            opacity: player.isBanned ? 0.6 : 1,
                                            bgcolor: player.isBanned ? 'rgba(255, 0, 0, 0.05)' : (isAnonymous ? 'rgba(255, 165, 0, 0.05)' : 'inherit'),
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        <TableCell sx={{ color: isAnonymous ? '#ff9800' : 'inherit', fontWeight: isAnonymous ? 'bold' : 'normal' }}>
                                            {player.displayName || 'Anonymous (N/A)'}
                                        </TableCell>
                                        <TableCell>{player.email}</TableCell>
                                        <TableCell>{player.phoneNumber || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Switch
                                                size="small"
                                                checked={player.isAdmin || false}
                                                onChange={(e) => handleRoleChange(player, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                size="small"
                                                color="error"
                                                checked={player.isBanned || false}
                                                onChange={(e) => handleBanToggle(player, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button size="small" color="error" onClick={() => handleDelete(player.uid)}><Delete /></Button>
                                            <Button size="small" startIcon={<Add />} onClick={() => handleOpenModal(player)} disabled={player.isBanned}>Add to Tourney</Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
             <Dialog open={open} onClose={handleCloseModal}>
                <DialogTitle>Add {selectedPlayer?.displayName} to Tournament</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{mt: 2}}>
                        <InputLabel>Tournament</InputLabel>
                        <Select
                            value={selectedTournament}
                            label="Tournament"
                            onChange={(e) => setSelectedTournament(e.target.value as string)}
                        >
                            {tournaments.map((tournament) => (
                                <MenuItem key={tournament.id} value={tournament.id}>{tournament.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleAddPlayerToTournament} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PlayerManagement;