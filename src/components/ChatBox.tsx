
import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Box, TextField, IconButton } from '@mui/material';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, FieldValue } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import SendIcon from '@mui/icons-material/Send';

interface ChatMessage {
    id?: string;
    uid: string;
    text: string;
    displayName: string;
    createdAt: FieldValue;
}

const ChatBox: React.FC<{ gameId: string }> = ({ gameId }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        const messagesRef = collection(db, 'games', gameId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(msgs);
        });
        return unsubscribe;
    }, [gameId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser) return;

        await addDoc(collection(db, 'games', gameId, 'messages'), {
            text: newMessage,
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Anonymous',
            createdAt: serverTimestamp(),
        });
        setNewMessage('');
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mt: 2, height: '350px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.5)' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 1, pr: 1 }}>
                {messages.map((msg) => (
                    <Typography key={msg.id} sx={{ color: 'white', textAlign: msg.uid === currentUser?.uid ? 'right' : 'left', mb: 1, wordBreak: 'break-word' }}>
                        <b style={{ color: msg.uid === currentUser?.uid ? '#90caf9' : '#a5d6a7' }}>{msg.displayName}:</b> {msg.text}
                    </Typography>
                ))}
                <div ref={messagesEndRef} />
            </Box>
            <form onSubmit={handleSendMessage}>
                <Box sx={{ display: 'flex' }}>
                    <TextField variant="outlined" size="small" fullWidth value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." sx={{ mr: 1, input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'gray' } } }} />
                    <IconButton type="submit" color="primary" disabled={!newMessage.trim()}><SendIcon /></IconButton>
                </Box>
            </form>
        </Paper>
    );
};

export default ChatBox;
