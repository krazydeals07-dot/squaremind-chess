
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // CORRECTED THE IMPORT PATH
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Container, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotivationalMessages: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const messagesCollectionRef = collection(db, 'motivational_messages');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await getDocs(messagesCollectionRef);
            setMessages(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setError(null);
        } catch (error) {
            console.error("Error fetching motivational messages: ", error);
            setError("Failed to load messages. Please check the console.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleAddMessage = async () => {
        if (newMessage.trim() === '') return;
        setLoading(true);
        try {
            const docRef = await addDoc(messagesCollectionRef, { text: newMessage });
            // Optimistically update UI, but it's better to refetch to be sure.
            setNewMessage('');
            await fetchMessages(); // Refetch all messages to get the latest list
        } catch (error) {
            console.error("Error adding message: ", error);
            setError("Failed to add the message. Please check your Firestore rules and database connection.");
        } 
        // No need to set loading to false here, fetchMessages will do it.
    };

    const handleDeleteMessage = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'motivational_messages', id));
            setMessages(messages.filter(message => message.id !== id)); // Optimistic UI update
        } catch (error) {
            console.error("Error deleting message: ", error);
            setError("Failed to delete the message.");
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: '12px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="div">
                            Manage Motivational Messages
                        </Typography>
                        <Typography variant="h6" component="div" color="text.secondary">
                            Total: {messages.length}
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" sx={{ display: 'flex', alignItems: 'center', mb: 4 }} noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleAddMessage(); }}>
                        <TextField
                            label="New Motivational Message"
                            variant="outlined"
                            fullWidth
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            sx={{ mr: 2 }}
                        />
                        <Button
                            type="submit" // Make button submit the form
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            Add
                        </Button>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {messages.map((message) => (
                                <ListItem key={message.id} divider>
                                    <ListItemText primary={message.text} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteMessage(message.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            </motion.div>
        </Container>
    );
};

export default MotivationalMessages;
