import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert, Tooltip, AppBar, Toolbar, Slide
} from '@mui/material';
import { ExpandMore, Restore as RestoreIcon, PlayArrow as PlayArrowIcon, AccountTree as AccountTreeIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getTournamentsRT, updateTournament, Tournament } from '../../utils/firebase/tournaments';
import BracketView from '../../components/admin/BracketView';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// Interface for individual tournament actions
interface TournamentActionsProps {
    tournament: Tournament;
    onReset: (id: string) => void;
    onStart: (id: string) => void;
    onViewBracket: (tournament: Tournament) => void;
}

const TournamentActions: React.FC<TournamentActionsProps> = ({ tournament, onReset, onStart, onViewBracket }) => {
    const canReset = tournament.status === 'ongoing' || tournament.status === 'completed';
    const canStart = tournament.status === 'upcoming' || (tournament.id === 'daily-knockout' && (tournament.status as string) === 'registration');
    const canViewBracket = tournament.status === 'ongoing' || tournament.status === 'completed';

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {canViewBracket && (
                <Tooltip title="View Bracket">
                    <IconButton color="primary" onClick={() => onViewBracket(tournament)}>
                        <AccountTreeIcon />
                    </IconButton>
                </Tooltip>
            )}
            {canStart && (
                 <Tooltip title="Start Tournament">
                    <IconButton color="success" onClick={() => onStart(tournament.id)}>
                        <PlayArrowIcon />
                    </IconButton>
                </Tooltip>
            )}
            {canReset && (
                <Tooltip title="Reset Tournament">
                    <IconButton color="warning" onClick={() => onReset(tournament.id)}>
                        <RestoreIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
};

const TournamentTable = ({ tournaments, onReset, onStart, onViewBracket }: { tournaments: Tournament[], onReset: (id: string) => void, onStart: (id: string) => void, onViewBracket: (t: Tournament) => void }) => {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: '12px' }}>
            <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Players</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tournaments.length === 0 ? (
                         <TableRow><TableCell colSpan={5} align="center">No tournaments in this category.</TableCell></TableRow>
                    ) : tournaments.map((tournament) => (
                        <TableRow key={tournament.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{tournament.name}</TableCell>
                            <TableCell>{tournament.type}</TableCell>
                            <TableCell>{`${tournament.participantCount || tournament.players?.length || 0} / ${tournament.maxPlayers || '∞'}`}</TableCell>
                            <TableCell>
                                <Chip 
                                    label={tournament.id === 'daily-knockout' && tournament.status === 'completed' ? 'ongoing' : tournament.status} 
                                    size="small"
                                    color={(tournament.status === 'ongoing' || (tournament.id === 'daily-knockout' && tournament.status === 'completed')) ? 'success' : tournament.status === 'upcoming' ? 'primary' : 'default'} 
                                />
                            </TableCell>
                            <TableCell align="right">
                                <TournamentActions tournament={tournament} onReset={onReset} onStart={onStart} onViewBracket={onViewBracket} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const TournamentManagement: React.FC = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [tournamentToReset, setTournamentToReset] = useState<string | null>(null);
    
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [tournamentToStart, setTournamentToStart] = useState<string | null>(null);

    const [selectedTournamentForBracket, setSelectedTournamentForBracket] = useState<Tournament | null>(null);

    useEffect(() => {
        const unsubscribe = getTournamentsRT(data => {
            setTournaments(data);
            setLoading(false);
        }, (err) => {
            setError('Failed to load tournaments.');
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Reset Logic ---
    const handleOpenResetDialog = (id: string) => { setTournamentToReset(id); setResetDialogOpen(true); };
    const handleCloseResetDialog = () => { setTournamentToReset(null); setResetDialogOpen(false); };
    const handleConfirmReset = async () => {
        if (!tournamentToReset) return;
        try {
            const tournament = tournaments.find(t => t.id === tournamentToReset);
            if (!tournament) throw new Error("Tournament not found!");
            await updateTournament(tournament.id, { 
                status: tournament.id === 'daily-knockout' ? 'registration' : 'upcoming', 
                players: [], 
                bracket: null, 
                matches: {}, 
                currentRound: 0,
                participantCount: 0 
            });
            setSuccess(`Tournament '${tournament.name}' has been reset successfully.`);
        } catch (err) { setError("Failed to reset the tournament."); } finally { handleCloseResetDialog(); }
    };

    // --- Start Logic ---
    const handleOpenStartDialog = (id: string) => { setTournamentToStart(id); setStartDialogOpen(true); };
    const handleCloseStartDialog = () => { setTournamentToStart(null); setStartDialogOpen(false); };
    const handleConfirmStart = async () => {
        if (!tournamentToStart) return;
        try {
            const tournament = tournaments.find(t => t.id === tournamentToStart);
            if (!tournament) throw new Error("Tournament not found!");
            await updateTournament(tournament.id, { status: 'ongoing' });
            setSuccess(`Tournament '${tournament.name}' has been started.`);
        } catch (err) { setError("Failed to start the tournament."); } finally { handleCloseStartDialog(); }
    };

    const handleViewBracket = (tournament: Tournament) => {
        setSelectedTournamentForBracket(tournament);
    };

    const handleCloseBracket = () => {
        setSelectedTournamentForBracket(null);
    };

    const { upcoming, ongoing, past } = useMemo(() => ({
        upcoming: tournaments.filter(t => t.status === 'upcoming' || (t.id === 'daily-knockout' && (t.status as string) === 'registration')),
        ongoing: tournaments.filter(t => t.status === 'ongoing' || (t.id === 'daily-knockout' && t.status === 'completed')),
        past: tournaments.filter(t => (t.status === 'completed' || t.status === 'cancelled') && t.id !== 'daily-knockout'),
    }), [tournaments]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Tournament Management</Typography>

            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>}

            {loading ? <CircularProgress /> : (
                <>
                    <Accordion defaultExpanded sx={{ mb: 2, borderRadius: '12px !important' }}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6">Upcoming ({upcoming.length})</Typography></AccordionSummary><AccordionDetails><TournamentTable tournaments={upcoming} onReset={handleOpenResetDialog} onStart={handleOpenStartDialog} onViewBracket={handleViewBracket} /></AccordionDetails></Accordion>
                    <Accordion defaultExpanded sx={{ mb: 2, borderRadius: '12px !important' }}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6">Ongoing ({ongoing.length})</Typography></AccordionSummary><AccordionDetails><TournamentTable tournaments={ongoing} onReset={handleOpenResetDialog} onStart={handleOpenStartDialog} onViewBracket={handleViewBracket} /></AccordionDetails></Accordion>
                    <Accordion sx={{ mb: 2, borderRadius: '12px !important' }}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="h6">Past ({past.length})</Typography></AccordionSummary><AccordionDetails><TournamentTable tournaments={past} onReset={handleOpenResetDialog} onStart={handleOpenStartDialog} onViewBracket={handleViewBracket} /></AccordionDetails></Accordion>
                </>
            )}

            {/* Bracket View Dialog */}
            <Dialog
                fullScreen
                open={selectedTournamentForBracket !== null}
                onClose={handleCloseBracket}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative', bgcolor: '#1e293b' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleCloseBracket}
                            aria-label="close"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {selectedTournamentForBracket?.name} - Tournament Bracket
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleCloseBracket}>
                            Back
                        </Button>
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
                    {selectedTournamentForBracket && (
                        <BracketView 
                            tournament={selectedTournamentForBracket} 
                            onUpdate={() => {
                                // The RT listener will handle updating the list, 
                                // but we might need to update the local selected tournament
                                const updated = tournaments.find(t => t.id === selectedTournamentForBracket.id);
                                if (updated) setSelectedTournamentForBracket(updated);
                            }} 
                        />
                    )}
                </Box>
            </Dialog>

            {/* Reset Dialog */}
            <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog}>
                <DialogTitle>Reset Tournament?</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to reset this tournament? All data will be deleted and status will be set to &apos;upcoming&apos;. This action cannot be undone.</DialogContentText></DialogContent>
                <DialogActions><Button onClick={handleCloseResetDialog}>Cancel</Button><Button onClick={handleConfirmReset} color="warning" variant="contained">Confirm Reset</Button></DialogActions>
            </Dialog>

            {/* Start Dialog */}
            <Dialog open={startDialogOpen} onClose={handleCloseStartDialog}>
                <DialogTitle>Start Tournament?</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to start this tournament? The status will be changed to &apos;ongoing&apos; and players will no longer be able to join.</DialogContentText></DialogContent>
                <DialogActions><Button onClick={handleCloseStartDialog}>Cancel</Button><Button onClick={handleConfirmStart} color="success" variant="contained">Start Now</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default TournamentManagement;