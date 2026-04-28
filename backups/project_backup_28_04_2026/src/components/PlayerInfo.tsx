
import React from 'react';
import { Box, Typography, Avatar, Paper, Grid } from '@mui/material';
import { UserProfile } from '../types/user';
import { Piece } from 'chess.js';

interface CapturedPiecesProps {
    pieces: Piece[];
}

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', minHeight: '32px', alignItems: 'center', mt: 1 }}>
        {pieces.map((piece, index) => (
            <img
                key={index}
                src={`/pieces/${piece.color}${piece.type.toUpperCase()}.svg`}
                alt={`${piece.type}`}
                style={{ width: 20, height: 20, margin: '0 1px' }}
            />
        ))}
    </Box>
);

interface PlayerInfoProps {
    player: UserProfile | null;
    playerName: string;
    capturedPieces: Piece[];
    timer: number;
    isActive: boolean;
}

const formatTime = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, playerName, capturedPieces, timer, isActive }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                p: 1.5,
                background: isActive ? 'rgba(255, 111, 0, 0.2)' : '#1E2A3E',
                border: isActive ? '2px solid #FF6F00' : '2px solid #1E2A3E',
                borderRadius: '12px',
                color: 'white',
                transition: 'all 0.3s ease',
            }}
        >
            <Grid container alignItems="center" spacing={2}>
                <Grid item>
                    <Avatar src={player?.photoURL || ''} sx={{ width: 40, height: 40 }} />
                </Grid>
                <Grid item xs>
                    <Typography variant="h6" noWrap sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{playerName}</Typography>
                </Grid>
                <Grid item>
                    <Typography variant="h5" sx={{ fontFamily: 'monospace', background: '#162233', p: 1, borderRadius: '4px', fontSize: '1.25rem' }}>
                        {formatTime(timer)}
                    </Typography>
                </Grid>
            </Grid>
            <CapturedPieces pieces={capturedPieces} />
        </Paper>
    );
};

export default PlayerInfo;
