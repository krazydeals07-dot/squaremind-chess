
import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Chess } from 'chess.js';

interface GameStatusDisplayProps {
    chess: Chess;
    isPlayerTurn: boolean;
}

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({ chess, isPlayerTurn }) => {
    let message = null;
    let severity: "info" | "warning" | "success" | "error" = 'info';

    if (chess.isGameOver()) {
        severity = 'success';
        if (chess.isCheckmate()) {
            message = `Checkmate! ${chess.turn() === 'w' ? 'Black' : 'White'} wins.`
        } else if (chess.isDraw()) {
            message = "Draw!";
        } else if (chess.isStalemate()) {
            message = "Stalemate!";
        } else {
            message = "Game Over";
        }
    } else if (isPlayerTurn) {
        severity = 'info';
        message = "Your turn to move.";
        if (chess.inCheck()) {
            severity = 'warning';
            message = "You are in check! Your turn to move.";
        }
    } else {
        severity = 'info';
        message = "Waiting for opponent's move...";
    }

    return (
        <Box sx={{ my: 2 }}>
            {message && 
                <Alert severity={severity} sx={{ justifyContent: 'center', fontWeight: 'bold' }}>
                    {message}
                </Alert>
            }
        </Box>
    );
};

export default GameStatusDisplay;
