import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    SelectChangeEvent
} from '@mui/material';

// Define interface for tournament data
interface TournamentData {
    id?: string;
    name: string;
    type: string;
    entryFee: string;
    prize: string;
}

// Define interface for component props
interface TournamentFormProps {
    open: boolean;
    handleClose: () => void;
    tournament: TournamentData | null;
    onSave: (data: TournamentData) => void;
}

const initialFormData: TournamentData = {
    name: '',
    type: '',
    entryFee: '',
    prize: '',
};

const TournamentForm: React.FC<TournamentFormProps> = ({ open, handleClose, tournament, onSave }) => {

    const [formData, setFormData] = useState<TournamentData>(initialFormData);

    useEffect(() => {
        if (tournament) {
            setFormData(tournament);
        } else {
            setFormData(initialFormData);
        }
    }, [tournament]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{tournament ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="name"
                    label="Tournament Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.name}
                    onChange={handleChange}
                    sx={{ mt: 2 }}
                />
                <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel id="type-label">Tournament Type</InputLabel>
                    <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        label="Tournament Type"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <MenuItem value="Daily Knockout">Daily Knockout</MenuItem>
                        <MenuItem value="Weekly Contest">Weekly Contest</MenuItem>
                        <MenuItem value="Monthly Mega Challenge">Monthly Mega Challenge</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="dense"
                    id="entryFee"
                    name="entryFee"
                    label="Entry Fee (INR)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={formData.entryFee}
                    onChange={handleChange}
                />
                <TextField
                    margin="dense"
                    id="prize"
                    name="prize"
                    label="Prize Structure"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={formData.prize}
                    onChange={handleChange}
                />
                {/* TODO: Add Date/Time pickers for schedule */}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleClose} color="secondary">Cancel</Button>
                <Button onClick={handleSave} variant="contained" sx={{ fontWeight: 'bold' }}>{tournament ? 'Save Changes' : 'Create'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TournamentForm;
