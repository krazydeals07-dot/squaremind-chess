
import { Modal, Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

interface GameOverModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameResult: { message: string } | null;
    isTournamentGame: boolean;
    handleGoBack: () => void;
    startNewGame: () => void;
}

const GameOverModal = ({ isOpen, onClose, gameResult, isTournamentGame, handleGoBack, startNewGame }: GameOverModalProps) => {
    return (
        <Modal open={isOpen} onClose={onClose} sx={{ backdropFilter: 'blur(5px)' }}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 400 }, bgcolor: '#1a1a2e', border: '2px solid #FFA500', borderRadius: '20px', boxShadow: 24, p: 4, textAlign: 'center', color: 'white' }}>
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Typography variant="h4" sx={{ fontFamily: 'Orbitron', color: '#FFD700' }}>{gameResult?.message}</Typography>
                </motion.div>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {isTournamentGame ? (
                        <Button variant="contained" onClick={handleGoBack} sx={{ bgcolor: '#1E90FF' }}>Return to Tournament</Button>
                    ) : (
                        <>
                            <Button variant="contained" onClick={startNewGame} sx={{ bgcolor: '#32CD32' }}>New Game</Button>
                            <Button variant="contained" onClick={handleGoBack} sx={{ bgcolor: '#1E90FF' }}>Back to Lobby</Button>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default GameOverModal;
