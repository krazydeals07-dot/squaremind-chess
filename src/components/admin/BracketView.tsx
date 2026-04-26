import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, Stack, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { updateMatch } from '../../utils/firebase/tournaments';

const MatchConnector = styled('div')(({ theme, type, height }) => ({
    position: 'absolute',
    right: type === 'outgoing' ? '-48px' : 'auto',
    left: type === 'incoming' ? '-48px' : 'auto',
    top: '50%',
    width: '48px',
    height: height || '2px',
    borderTop: '2px solid #FF6F00',
    borderRight: type === 'outgoing' && height ? '2px solid #FF6F00' : 'none',
    borderBottom: type === 'outgoing' && height ? '2px solid #FF6F00' : 'none',
    zIndex: 0,
    pointerEvents: 'none',
    transform: type === 'outgoing' && height ? 'translateY(0)' : 'translateY(-50%)',
}));

const PlayerRow = ({ name, isWinner, isLoser }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 1,
        borderRadius: '4px',
        bgcolor: isWinner ? 'rgba(255, 215, 0, 0.2)' : 'transparent',
        border: isWinner ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isWinner ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none',
        mb: 0.5,
        transition: 'all 0.3s ease'
    }}>
        <Typography variant="body2" noWrap sx={{ 
            fontWeight: isWinner ? 800 : 400,
            color: isWinner ? '#FFD700' : (isLoser ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)'),
            textDecoration: isLoser ? 'line-through' : 'none',
            fontSize: '0.85rem'
        }}>
            {name || 'TBD'}
        </Typography>
        {isWinner && <TrophyIcon sx={{ fontSize: 18, color: '#FFD700', filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.5))' }} />}
    </Box>
);

const MatchCard = ({ match, onUpdateWinner, roundIndex, matchIndex }) => {
    const handleWinnerSelection = (e) => {
        const winnerId = e.target.value;
        if (winnerId) onUpdateWinner(match.id, winnerId);
    };

    const isBye = !match.player2 && match.player1;
    const winnerId = match.winnerId || match.winner?.uid;
    const isCompleted = match.status === 'completed' || !!winnerId;
    const statusColor = isCompleted ? '#4caf50' : match.status === 'active' ? '#FF6F00' : '#757575';

    return (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Paper 
                elevation={6} 
                sx={{
                    p: 1.5, 
                    width: '240px',
                    bgcolor: '#1A3A6D',
                    color: '#fff',
                    borderLeft: `5px solid ${statusColor}`,
                    borderRadius: '8px',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    boxShadow: isCompleted ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>
                        MATCH #{match.id.split('-m')[1] || match.id.slice(-4)}
                    </Typography>
                    <Chip 
                        label={isBye ? 'BYE' : (isCompleted ? 'COMPLETED' : match.status.toUpperCase())} 
                        size="small" 
                        sx={{ 
                            fontSize: '0.6rem', 
                            height: '20px', 
                            bgcolor: isCompleted ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 111, 0, 0.2)',
                            color: statusColor,
                            border: `1px solid ${statusColor}`,
                            fontWeight: 900
                        }}
                    />
                </Box>

                <Stack spacing={0}>
                    <PlayerRow 
                        name={match.player1?.displayName} 
                        isWinner={winnerId === match.player1?.uid || (isBye && match.player1)} 
                        isLoser={winnerId && winnerId !== match.player1?.uid} 
                    />
                    {!isBye && (
                        <PlayerRow 
                            name={match.player2?.displayName} 
                            isWinner={winnerId === match.player2?.uid} 
                            isLoser={winnerId && winnerId !== match.player2?.uid} 
                        />
                    )}
                </Stack>

                {match.status === 'pending' && match.player1 && match.player2 && !winnerId && (
                    <FormControl size="small" fullWidth sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { color: '#fff', borderColor: 'rgba(255,255,255,0.2)' } }}>
                        <InputLabel sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Set Winner</InputLabel>
                        <Select 
                            label="Set Winner"
                            onChange={handleWinnerSelection}
                            sx={{ height: '30px', fontSize: '0.75rem' }}
                            value=""
                        >
                            <MenuItem value={match.player1.uid}>{match.player1.displayName}</MenuItem>
                            <MenuItem value={match.player2.uid}>{match.player2.displayName}</MenuItem>
                        </Select>
                    </FormControl>
                )}
            </Paper>
        </Box>
    );
};

const BracketView = ({ tournament, onUpdate }) => {
    const rounds = useMemo(() => {
        if (!tournament?.matches) return [];
        const matchesArray = Array.isArray(tournament.matches) 
            ? tournament.matches 
            : Object.values(tournament.matches);
            
        const grouped = matchesArray.reduce((acc, match) => {
            const r = match.round || 1;
            if (!acc[r]) acc[r] = [];
            acc[r].push(match);
            return acc;
        }, {});
        
        return Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(key => {
            return grouped[key].sort((a, b) => (a.matchIndex || 0) - (b.matchIndex || 0));
        });
    }, [tournament?.matches]);

    const handleUpdateWinner = async (matchId, winnerId) => {
        if (!window.confirm("Confirm manual winner selection? This will trigger automatic progression.")) return;
        try {
            await updateMatch(tournament.id, matchId, winnerId);
            if(onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    if (!tournament) return null;

    return (
        <Box sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            p: 4, 
            bgcolor: '#0A1F44', 
            minHeight: '85vh',
            alignItems: 'stretch',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { height: '8px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#FF6F00', borderRadius: '4px' }
        }}>
            {rounds.map((roundMatches, roundIdx) => (
                <Box key={roundIdx} sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    minWidth: 280,
                    mr: 6
                }}>
                    <Typography variant="h6" sx={{ 
                        mb: 4, 
                        fontWeight: 900, 
                        textAlign: 'center', 
                        color: '#FF6F00',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        borderBottom: '2px solid rgba(255, 111, 0, 0.2)',
                        pb: 1,
                        fontSize: '1rem'
                    }}>
                        Round {roundIdx + 1}
                    </Typography>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-around', 
                        flexGrow: 1 
                    }}>
                        {roundMatches.map((match, matchIdx) => (
                            <MatchCard 
                                key={match.id} 
                                match={match} 
                                onUpdateWinner={handleUpdateWinner} 
                                roundIndex={roundIdx}
                                matchIndex={matchIdx}
                            />
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

BracketView.propTypes = {
    tournament: PropTypes.object,
    onUpdate: PropTypes.func
};

export default BracketView;