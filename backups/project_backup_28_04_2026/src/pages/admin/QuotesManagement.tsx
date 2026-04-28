import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import {
    Box, Typography, Button, List, ListItem, ListItemText, IconButton, Paper, 
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, Alert, Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Restore as RestoreIcon } from '@mui/icons-material';

interface Quote {
    id: string;
    text: string;
    author?: string;
}

const QuotesManagement: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentQuote, setCurrentQuote] = useState<Partial<Quote>>({ text: '', author: '' });

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'quotes'));
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Quote));
            setQuotes(data || []);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching quotes:", err);
            setError("Failed to load quotes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    const seedQuotes = async () => {
        if (!window.confirm("Do you want to restore the default chess quotes? This will add them to your current list.")) return;
        
        const defaultQuotes = [
            { text: "Chess is the struggle against the error.", author: "Emanuel Lasker" },
            { text: "Every chess master was once a beginner.", author: "Irving Chernev" },
            { text: "The only way to get smarter is by playing a smarter opponent.", author: "Fundamentals of Chess" },
            { text: "Play the opening like a book, the middlegame like a magician, and the endgame like a machine.", author: "Rudolf Spielmann" },
            { text: "Chess is life in miniature.", author: "Garry Kasparov" },
            { text: "Daring ideas are like chessmen moved forward. They may be beaten, but they may start a winning game.", author: "Johann Wolfgang von Goethe" },
            { text: "In chess, as in life, a man is his own greatest enemy.", author: "Vasily Smyslov" }
        ];

        try {
            setLoading(true);
            const batch = writeBatch(db);
            defaultQuotes.forEach(q => {
                const newDocRef = doc(collection(db, 'quotes'));
                batch.set(newDocRef, q);
            });
            await batch.commit();
            alert("Default quotes restored successfully!");
            fetchQuotes();
        } catch (err) {
            console.error("Error seeding quotes:", err);
            setError("Failed to restore quotes.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (quote?: Quote) => {
        if (quote) {
            setIsEditing(true);
            setCurrentQuote(quote);
        } else {
            setIsEditing(false);
            setCurrentQuote({ text: '', author: '' });
        }
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleSave = async () => {
        if (!currentQuote.text?.trim()) return;

        try {
            if (isEditing && currentQuote.id) {
                await updateDoc(doc(db, 'quotes', currentQuote.id), {
                    text: currentQuote.text,
                    author: currentQuote.author || 'Anonymous'
                });
            } else {
                await addDoc(collection(db, 'quotes'), {
                    text: currentQuote.text,
                    author: currentQuote.author || 'Anonymous'
                });
            }
            fetchQuotes();
            handleClose();
        } catch (err) {
            console.error("Error saving quote:", err);
            setError("Failed to save quote.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this quote?")) {
            try {
                await deleteDoc(doc(db, 'quotes', id));
                fetchQuotes();
            } catch (err) {
                setError("Failed to delete quote.");
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Motivational Quotes</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        startIcon={<RestoreIcon />} 
                        onClick={seedQuotes}
                        disabled={loading}
                    >
                        Restore Defaults
                    </Button>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpen()}
                        disabled={loading}
                    >
                        Add Quote
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                {loading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {quotes.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No quotes found. Click &apos;Restore Defaults&apos; to add some!</Typography>
                            </Box>
                        ) : (
                            quotes.map((q, index) => (
                                <ListItem 
                                    key={q.id} 
                                    divider={index !== quotes.length - 1}
                                    sx={{ py: 2, '&:hover': { bgcolor: '#f8f9fa' } }}
                                    secondaryAction={
                                        <Box>
                                            <IconButton onClick={() => handleOpen(q)} color="primary"><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(q.id)} color="error"><DeleteIcon /></IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText 
                                        primary={
                                            <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 500, pr: 10 }}>
                                                &quot;{q.text}&quot;
                                            </Typography>
                                        } 
                                        secondary={
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                — {q.author || 'Anonymous'}
                                            </Typography>
                                        } 
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                )}
            </Paper>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>{isEditing ? 'Edit Quote' : 'New Quote'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth multiline rows={4} label="Quote Text"
                        value={currentQuote.text}
                        onChange={(e) => setCurrentQuote({ ...currentQuote, text: e.target.value })}
                        sx={{ mt: 2 }}
                        placeholder="Enter a motivational quote..."
                    />
                    <TextField
                        fullWidth label="Author Name"
                        value={currentQuote.author}
                        onChange={(e) => setCurrentQuote({ ...currentQuote, author: e.target.value })}
                        sx={{ mt: 3 }}
                        placeholder="Anonymous"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ px: 4 }}>Save Quote</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default QuotesManagement;
