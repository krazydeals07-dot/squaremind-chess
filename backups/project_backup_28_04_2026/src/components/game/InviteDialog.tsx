import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, IconButton } from '@mui/material';
import { CopyAll as CopyAllIcon } from '@mui/icons-material';
import QRCode from 'react-qr-code';

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
}

const InviteDialog = ({ open, onClose, gameId }: InviteDialogProps) => {
  const inviteLink = `${window.location.origin}/play/online/${gameId}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add a toast notification for feedback
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: 'center', fontFamily: '"Orbitron", sans-serif' }}>Invite a Friend</DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography gutterBottom>Share this code, link, or QR code with your friend.</Typography>
        
        <Box sx={{ my: 2, p: 2, background: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
          <Typography variant="h5" sx={{ fontFamily: '"Orbitron", sans-serif' }}>{gameId}</Typography>
          <IconButton onClick={() => handleCopy(gameId)}><CopyAllIcon /></IconButton>
        </Box>

        <TextField 
          fullWidth 
          variant="filled" 
          label="Invite Link" 
          value={inviteLink} 
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={() => handleCopy(inviteLink)}>
                <CopyAllIcon />
              </IconButton>
            )
          }}
        />

        <Box sx={{ mt: 3, p: 2, background: 'white', display: 'inline-block' }}>
          <QRCode value={inviteLink} size={128} />
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteDialog;
