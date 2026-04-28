
import { Box, Grid, TextField, Button } from '@mui/material';
import { UserProfile } from '../../types';
import React from 'react';

interface ProfileEditorProps {
    editableProfile: UserProfile | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
}

const ProfileEditor = ({ editableProfile, handleChange, handleSave }: ProfileEditorProps) => (
    <Box component="form" noValidate autoComplete="off" sx={{ p: 2 }}>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <TextField fullWidth variant="filled" label="Display Name" name="displayName" value={editableProfile?.displayName || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth variant="filled" label="Mobile Number" name="mobileNumber" value={editableProfile?.mobileNumber || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth variant="filled" label="Date of Birth" name="dob" type="date" value={editableProfile?.dob ? new Date(editableProfile.dob).toISOString().split('T')[0] : ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' }, shrink: true }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
            </Grid>
            <Grid item xs={12}>
                <TextField fullWidth variant="filled" label="Address" name="address" value={editableProfile?.address || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField fullWidth variant="filled" label="Country" name="country" value={editableProfile?.country || ''} onChange={handleChange} InputLabelProps={{ style: { color: 'white' } }} InputProps={{ style: { color: 'white', backgroundColor: 'rgba(0,0,0,0.3)' } }} />
            </Grid>
        </Grid>
        <Button onClick={handleSave} variant="contained" sx={{ mt: 3, bgcolor: '#FFA500', fontFamily: '"Orbitron", sans-serif', '&:hover': { bgcolor: '#E03D00' } }}>
            Save Changes
        </Button>
    </Box>
);

export default React.memo(ProfileEditor);
