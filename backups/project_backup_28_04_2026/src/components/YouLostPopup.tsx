import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';
import { HighlightOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface YouLostPopupProps {
  open: boolean;
  onClose: () => void;
}

const YouLostPopup = ({ open, onClose }: YouLostPopupProps) => {
  const navigate = useNavigate();

  const handleTutorialClick = () => {
    navigate('/tutorials');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '2rem' }}>
        <HighlightOff sx={{ color: 'red', fontSize: 40, verticalAlign: 'middle' }} />
        <Typography variant="h4" component="span" sx={{ ml: 1, verticalAlign: 'middle' }}>
          You Lost
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6">
            Don&apos;t give up! The best players lose a lot.
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 3, mr: 1 }}>
          Try Again
        </Button>
        <Button onClick={handleTutorialClick} variant="outlined" sx={{ mt: 3, ml: 1 }}>
          Learn via Tutorial
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default YouLostPopup;
