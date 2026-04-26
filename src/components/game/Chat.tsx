
import { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, List, ListItem, Typography, Paper, IconButton, InputAdornment } from '@mui/material';
import { Send, Chat as ChatIcon } from '@mui/icons-material';

interface ChatProps {
    chat: any[];
    currentUser: any;
    handleSendMessage: (message: string) => void;
}

const Chat = ({ chat, currentUser, handleSendMessage }: ChatProps) => {
    const [chatMessage, setChatMessage] = useState('');
    const chatBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chat]);

    const onSendMessage = () => {
        if (chatMessage.trim()) {
            handleSendMessage(chatMessage);
            setChatMessage('');
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 1, 
                pb: 1, 
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
            }}>
                <ChatIcon sx={{ color: '#33C3FF', fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" sx={{ 
                    fontFamily: '"Orbitron", sans-serif', 
                    color: '#e0e0e0', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    letterSpacing: '0.5px'
                }}>
                    MATCH CHAT
                </Typography>
            </Box>

            <Box 
                ref={chatBoxRef} 
                sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    mb: 1.5,
                    px: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }
                }}
            >
                {(chat || []).map((msg: any, i: number) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    return (
                        <Box 
                            key={i} 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                                mb: 0.5
                            }}
                        >
                            <Typography sx={{ fontSize: '0.65rem', color: '#888', mb: 0.2, mx: 1 }}>
                                {isMe ? 'You' : msg.senderName}
                            </Typography>
                            <Paper 
                                sx={{ 
                                    p: '6px 12px', 
                                    maxWidth: '85%',
                                    borderRadius: isMe ? '15px 15px 2px 15px' : '15px 15px 15px 2px',
                                    background: isMe ? 'linear-gradient(135deg, #007BFF, #0056b3)' : '#3a3a4a',
                                    color: '#fff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                    {msg.message}
                                </Typography>
                            </Paper>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    size="small" 
                    placeholder="Type a message..." 
                    value={chatMessage} 
                    onChange={(e) => setChatMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage()} 
                    autoComplete="off"
                    sx={{ 
                        '& .MuiOutlinedInput-root': {
                            color: '#fff',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#33C3FF' }
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton 
                                    onClick={onSendMessage} 
                                    size="small" 
                                    disabled={!chatMessage.trim()}
                                    sx={{ color: '#33C3FF' }}
                                >
                                    <Send fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Box>
    );
}

export default Chat;