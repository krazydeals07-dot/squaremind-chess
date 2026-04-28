import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Alert, CircularProgress, Divider } from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { getMarqueeMessage, updateMarqueeMessage } from '../../utils/firebase/marquee';

const MarqueeManagement: React.FC = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarquee = async () => {
            try {
                const msg = await getMarqueeMessage();
                setMessage(msg || '');
            } catch (err) {
                setError('Failed to load marquee message.');
            } finally {
                setLoading(false);
            }
        };
        fetchMarquee();
    }, []);

    const handleUpdate = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await updateMarqueeMessage(message);
            setSuccess('Marquee message updated successfully!');
        } catch (err) {
            setError('Failed to update marquee message.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Marquee Management</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Update the scrolling message displayed at the top of the application for all users.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 4, borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom>Current Message</Typography>
                <Divider sx={{ mb: 3 }} />
                
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Marquee Text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="outlined"
                    placeholder="Enter the message to display on the marquee..."
                    disabled={saving}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleUpdate}
                        disabled={saving || !message.trim()}
                        sx={{ px: 4 }}
                    >
                        {saving ? 'Updating...' : 'Update Marquee'}
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 4, bgcolor: '#fff9c4', borderRadius: '12px' }}>
                <Typography variant="subtitle2" color="warning.dark" sx={{ fontWeight: 'bold' }}>
                    Note:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Changing this message will immediately update it for all active users in the application. Keep it concise and informative.
                </Typography>
            </Paper>
        </Box>
    );
};

export default MarqueeManagement;
