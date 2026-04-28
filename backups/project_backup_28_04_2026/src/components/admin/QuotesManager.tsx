
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Paper, Box, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

interface Quote {
    id: string;
    text: string;
}

const QuotesManager: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [newQuote, setNewQuote] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchQuotes = useCallback(async () => {
        setLoading(true);
        try {
            const quotesCollection = collection(db, 'motivational_quotes');
            const querySnapshot = await getDocs(quotesCollection);
            const quotesList = querySnapshot.docs.map(doc => ({ id: doc.id, text: doc.data().text as string }));
            setQuotes(quotesList);
        } catch (error) {
            console.error("Error fetching quotes:", error);
            toast.error('Failed to fetch quotes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    const handleAddQuote = async () => {
        if (!newQuote.trim()) {
            toast.error('Quote cannot be empty.');
            return;
        }
        setActionLoading(true);
        try {
            // SIMPLIFIED: Removed serverTimestamp() which requires an index
            await addDoc(collection(db, 'motivational_quotes'), {
                text: newQuote,
            });
            setNewQuote('');
            toast.success('Quote added successfully!');
            await fetchQuotes(); // Refresh the list
        } catch (error) {
            console.error("Error adding quote:", error);
            toast.error('Failed to add quote. Check Firestore rules and console for errors.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteQuote = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this quote?')) return;
        try {
            await deleteDoc(doc(db, 'motivational_quotes', id));
            toast.success('Quote deleted successfully!');
            setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== id)); // More efficient refresh
        } catch (error) {
            console.error("Error deleting quote:", error);
            toast.error('Failed to delete quote.');
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, mt: 4, background: 'rgba(255, 255, 255, 0.9)' }}>
                <Typography variant="h4" gutterBottom>Manage Motivational Quotes</Typography>
                <Box component="form" sx={{ display: 'flex', mb: 3 }} onSubmit={(e) => { e.preventDefault(); handleAddQuote(); }}>
                    <TextField
                        fullWidth
                        label="New Quote"
                        variant="outlined"
                        value={newQuote}
                        onChange={(e) => setNewQuote(e.target.value)}
                        disabled={actionLoading}
                    />
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        onClick={handleAddQuote} 
                        disabled={actionLoading} 
                        sx={{ ml: 2, whiteSpace: 'nowrap' }}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Add Quote'}
                    </Button>
                </Box>

                <Typography variant="h6" gutterBottom>Existing Quotes</Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress /></Box>
                ) : (
                    <List>
                        {quotes.map((quote) => (
                            <ListItem key={quote.id} divider secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuote(quote.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                                <ListItemText primary={quote.text} />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};

export default QuotesManager;
