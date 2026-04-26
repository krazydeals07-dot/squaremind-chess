
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Container, Paper, Typography, Button, Slider, Box } from '@mui/material';

const GameReplayPage = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [game, setGame] = useState<any>(null);
    const [fen, setFen] = useState('start');
    const [move, setMove] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const chess = new Chess();

    useEffect(() => {
        const fetchGame = async () => {
            if (gameId) {
                const gameRef = doc(db, 'games', gameId);
                const gameSnap = await getDoc(gameRef);
                if (gameSnap.exists()) {
                    const gameData = gameSnap.data();
                    setGame(gameData);
                    setHistory(gameData.history || []);
                    updateBoard(0, gameData.history || []);
                }
            }
        };
        fetchGame();
    }, [gameId]);

    const updateBoard = (moveIndex: number, gameHistory: any[]) => {
        const tempChess = new Chess();
        for (let i = 0; i <= moveIndex; i++) {
            if(gameHistory[i]){
                tempChess.move(gameHistory[i]);
            }
        }
        setFen(tempChess.fen());
        setMove(moveIndex);
    };

    const handleSliderChange = (event: Event, newValue: number | number[]) => {
        updateBoard(newValue as number, history);
    };

    const handleMove = (direction: number) => {
        const newMove = move + direction;
        if (newMove >= 0 && newMove < history.length) {
            updateBoard(newMove, history);
        }
    };

    if (!game) {
        return <Container><Typography>Loading game...</Typography></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.7)' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFA500' }}>
                    Game Replay
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Chessboard position={fen} arePiecesDraggable={false} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                    <Button onClick={() => handleMove(-1)} disabled={move === 0}>&lt;</Button>
                    <Slider
                        value={move}
                        onChange={handleSliderChange}
                        min={0}
                        max={history.length - 1}
                        step={1}
                        sx={{ width: '60%', mx: 2 }}
                    />
                    <Button onClick={() => handleMove(1)} disabled={move === history.length - 1}>&gt;</Button>
                </Box>
                <Typography align="center">Move: {move + 1} / {history.length}</Typography>
            </Paper>
        </Container>
    );
};

export default GameReplayPage;
