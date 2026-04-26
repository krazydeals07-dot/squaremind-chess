import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface GuestPromptModalProps {
  open: boolean;
  onClose: () => void;
}

const GuestPromptModal: React.FC<GuestPromptModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="guest-prompt-title"
      aria-describedby="guest-prompt-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="guest-prompt-title" variant="h6" component="h2">
          Login or Sign Up to Register
        </Typography>
        <Typography id="guest-prompt-description" sx={{ mt: 2 }}>
          You need to be logged in to register for tournaments.
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
          <Button component={Link} to="/login" variant="contained" color="primary">
            Login
          </Button>
          <Button component={Link} to="/signup" variant="contained" color="secondary">
            Sign Up
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GuestPromptModal;
