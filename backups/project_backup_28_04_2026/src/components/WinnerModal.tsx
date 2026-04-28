
import React from 'react';
import { Modal, Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface WinnerModalProps {
    open: boolean;
    winnerName: string | null;
    onClose: () => void;
}

const StyledModal = styled(Modal)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const ModalContent = styled(Paper)(({ theme }) => ({
    background: 'linear-gradient(145deg, #0A1F44, #1A3A6D)',
    color: 'white',
    padding: theme.spacing(4),
    borderRadius: '15px',
    textAlign: 'center',
    border: '2px solid #FF6F00',
    boxShadow: '0 8px 32px rgba(255, 111, 0, 0.4)',
}));

const WinnerModal: React.FC<WinnerModalProps> = ({ open, winnerName, onClose }) => {
    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent>
                <Typography variant="h4" gutterBottom sx={{ color: '#FF6F00', fontWeight: 'bold' }}>
                    Game Over
                </Typography>
                <Typography variant="h5" sx={{ my: 2 }}>
                    {winnerName ? `${winnerName} wins!` : "It's a draw!"}
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={onClose} 
                    sx={{ 
                        background: '#FF6F00', 
                        '&:hover': { background: '#FF8F00' },
                        fontWeight: 'bold'
                    }}
                >
                    Return to Tournament
                </Button>
            </ModalContent>
        </StyledModal>
    );
};

export default WinnerModal;
