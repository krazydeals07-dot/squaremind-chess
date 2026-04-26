
import { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const pulseAnimation = keyframes`
  0% { transform: scale(1); boxShadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  50% { transform: scale(1.05); boxShadow: 0 0 10px 10px rgba(255, 0, 0, 0); }
  100% { transform: scale(1); boxShadow: 0 0 0 0 rgba(255, 0, 0, 0); }
`;

interface GameTimerProps {
    initialTime: number;
    moveTime: number;
    activePlayer: 'w' | 'b';
    onTimeout: (player: 'w' | 'b') => void;
    isPaused: boolean;
}

const GameTimer = ({ initialTime, moveTime, activePlayer, onTimeout, isPaused }: GameTimerProps) => {
    const [whiteTime, setWhiteTime] = useState(initialTime);
    const [blackTime, setBlackTime] = useState(initialTime);
    const [whiteMoveTime, setWhiteMoveTime] = useState(moveTime);
    const [blackMoveTime, setBlackMoveTime] = useState(moveTime);
    const timeoutRef = useRef(false);

    useEffect(() => {
        setWhiteTime(initialTime);
        setBlackTime(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (activePlayer === 'w') {
            setWhiteMoveTime(moveTime);
        } else {
            setBlackMoveTime(moveTime);
        }
    }, [activePlayer, moveTime]);

    useEffect(() => {
        if (isPaused || timeoutRef.current) return;

        const timer = setInterval(() => {
            if (activePlayer === 'w') {
                setWhiteTime(t => {
                    if (t <= 1) {
                        if (!timeoutRef.current) {
                            onTimeout('w');
                            timeoutRef.current = true;
                        }
                        return 0;
                    }
                    return t - 1;
                });
                setWhiteMoveTime(t => {
                     if (t <= 1) {
                        if (!timeoutRef.current) {
                            onTimeout('w');
                            timeoutRef.current = true;
                        }
                        return 0;
                    }
                    return t - 1;
                });
            } else {
                setBlackTime(t => {
                     if (t <= 1) {
                        if (!timeoutRef.current) {
                            onTimeout('b');
                            timeoutRef.current = true;
                        }
                        return 0;
                    }
                    return t - 1;
                });
                setBlackMoveTime(t => {
                     if (t <= 1) {
                        if (!timeoutRef.current) {
                            onTimeout('b');
                            timeoutRef.current = true;
                        }
                        return 0;
                    }
                    return t - 1;
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [activePlayer, isPaused, onTimeout]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const renderTimer = (time: number, moveTime: number, isActive: boolean) => {
        const isMoveTimeAlert = moveTime <= 7 && moveTime > 0;
        return (
            <Paper 
                elevation={5} 
                sx={{
                    p: 1, 
                    textAlign: 'center',
                    background: isActive ? 'linear-gradient(45deg, #4CAF50, #81C784)' : 'linear-gradient(45deg, #424242, #616161)',
                    color: isMoveTimeAlert && isActive ? '#ffc107' : 'white',
                    border: isActive ? '2px solid #66BB6A' : '2px solid #555',
                    borderRadius: '8px',
                    animation: isMoveTimeAlert && isActive ? `${pulseAnimation} 1.5s ease-in-out infinite` : 'none',
                    transition: 'all 0.3s ease',
                    minWidth: '130px',
                    boxShadow: isActive ? '0 4px 20px 0 rgba(0,0,0,0.3)' : '0 2px 10px 0 rgba(0,0,0,0.2)'
                }}
            >
                <Typography variant="h5" sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: '700', letterSpacing: '1px' }}>
                    {formatTime(time)}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: '"Roboto Mono", monospace', opacity: 0.8 }}>
                    Move: {formatTime(moveTime)}
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', p: 1, gap: 2, background: '#212121', borderRadius: '12px', mb: 2 }}>
            {renderTimer(whiteTime, whiteMoveTime, activePlayer === 'w')}
            {renderTimer(blackTime, blackMoveTime, activePlayer === 'b')}
        </Box>
    );
};

export default GameTimer;
