import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';

interface CongratulationsPopupProps {
  open: boolean;
  onClose: () => void;
  stats: {
    currentLevel: string;
    winsAtCurrentLevel: number;
  };
}

const CongratulationsPopup = ({ open, onClose, stats }: CongratulationsPopupProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '2rem' }}>
        <CheckCircleOutline sx={{ color: 'green', fontSize: 40, verticalAlign: 'middle' }} />
        <Typography variant="h4" component="span" sx={{ ml: 1, verticalAlign: 'middle' }}>
          Congratulations!
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6">
          You won the match!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Your current level is <strong>{stats.currentLevel}</strong>.
        </Typography>
        <Typography variant="body1">
          You have won <strong>{stats.winsAtCurrentLevel}</strong> game(s) at this level.
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3 }}>
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationsPopup;
