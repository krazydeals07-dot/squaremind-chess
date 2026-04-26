import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Marquee: React.FC = () => {
    const [message, setMessage] = useState('Loading news...');

    useEffect(() => {
        // Listen to the marquee settings document in real-time
        const marqueeDocRef = doc(db, 'settings', 'marquee');
        const unsubscribe = onSnapshot(marqueeDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const marqueeMessage = docSnap.data().message || 'Welcome to Squaremind!';
                setMessage(`${marqueeMessage} • ${marqueeMessage}`);
            } else {
                setMessage('Welcome to Squaremind! Join a tournament today.');
            }
        });

        return () => unsubscribe();
    }, []);

    const marqueeVariants = {
        animate: {
            x: ['100%', '-100%'],
            transition: {
                x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 35, // Slightly slower for better readability
                    ease: 'linear',
                },
            },
        },
    };

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            backgroundColor: '#0F172A', // Match dashboard background
            py: 0.7,
            borderTop: '1px solid #334155',
            borderBottom: '1px solid #334155',
            cursor: 'pointer',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <RouterLink to="/tournaments" style={{ textDecoration: 'none', color: 'inherit' }}>
                <motion.div
                    variants={marqueeVariants}
                    animate="animate"
                    style={{ display: 'flex', whiteSpace: 'nowrap' }}
                >
                    <Typography
                        variant="h6"
                        component="span"
                        sx={{
                            display: 'inline-block',
                            color: '#0EA5E9', // Beautiful Sky Blue color
                            fontFamily: 'Orbitron, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            mx: 10,
                            textShadow: '0 0 8px rgba(14, 165, 233, 0.4)' // Subtle sky blue glow
                        }}
                    >
                        {message}
                    </Typography>
                </motion.div>
            </RouterLink>
        </Box>
    );
};

export default Marquee;
