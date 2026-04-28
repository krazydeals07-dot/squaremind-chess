import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Box, Button, TextField, Typography, Modal, CircularProgress } from '@mui/material';
import { toast } from 'react-hot-toast';

interface JoinTournamentFormProps {
  open: boolean;
  onClose: () => void;
  onJoin: () => Promise<void>;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  color: 'black'
};

const JoinTournamentForm: React.FC<JoinTournamentFormProps> = ({ open, onClose, onJoin }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    dob: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && open) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              name: userData.displayName || currentUser.displayName || '',
              address: userData.address || '',
              phoneNumber: userData.phoneNumber || userData.mobileNumber || '',
              dob: userData.dob || '',
            });
          } else {
             setFormData({
              name: currentUser.displayName || '',
              address: '',
              phoneNumber: '',
              dob: '',
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [currentUser, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in.");
      return;
    }
    setLoading(true);
    try {
      if (!formData.name || !formData.address || !formData.phoneNumber || !formData.dob) {
          toast.error("Please fill all the fields.");
          setLoading(false);
          return;
      }
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        displayName: formData.name,
      });

      await onJoin();
      
      toast.success("Your information has been updated and you have joined the tournament!");
      onClose();
    } catch (error) {
      console.error("Error updating user info or joining tournament:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to save details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="join-tournament-form"
      aria-describedby="form-to-collect-user-details-for-tournament"
    >
      <Box sx={style}>
        <Typography id="join-tournament-form" variant="h6" component="h2">
          Player Information Form
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Player's Name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="address"
            label="Full Address / Location"
            name="address"
            autoComplete="street-address"
            value={formData.address}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phoneNumber"
            label="Mobile Number"
            name="phoneNumber"
            autoComplete="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="dob"
            label="Date of Birth"
            name="dob"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.dob}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Join Now"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default JoinTournamentForm;