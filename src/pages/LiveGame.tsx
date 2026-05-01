import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { toast } from 'react-hot-toast';

const INITIAL_TIME = 480;

const LiveGame = () => {
  const { gameId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState(new Chess());
  const [gameData, setGameData] = useState<any>(null);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');

  const [timers, setTimers] = useState({ white: INITIAL_TIME, black: INITIAL_TIME });

  const chessboardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  // FETCH GAME
  useEffect(() => {
    if (!gameId) return;

    const ref = doc(db, 'games', gameId);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        toast.error("Game not found!");
        navigate('/');
        return;
      }

      const data = snap.data();
      setGameData(data);
      setGame(new Chess(data.fen));

      if (currentUser) {
        if (data.players.white.uid === currentUser.uid) setOrientation('white');
        else if (data.players.black.uid === currentUser.uid) setOrientation('black');
      }

      if (data.timers) setTimers(data.timers);

      setLoading(false);
    });

    return () => unsub();
  }, [gameId, currentUser, navigate]);

  // BOARD SIZE
  useLayoutEffect(() => {
    function update() {
      if (chessboardRef.current) {
        setBoardWidth(chessboardRef.current.offsetWidth);
      }
    }
    window.addEventListener('resize', update);
    update();
    return () => window.removeEventListener('resize', update);
  }, []);

  // TIMER LOGIC
  useEffect(() => {
    if (!gameData || gameData.status !== 'ongoing') return;

    const interval = setInterval(async () => {
      const turn = game.turn() === 'w' ? 'white' : 'black';

      setTimers((prev) => {
        const updated = { ...prev, [turn]: prev[turn] - 1 };

        // TIMEOUT
        if (updated[turn] <= 0) {
          handleGameOver('timeout');
        }

        // Sync to Firestore
        updateDoc(doc(db, 'games', gameId!), {
            timers: updated,
          });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameData, game]);

  // MOVE
  const makeMove = async (move: any) => {
    if (!gameData || gameData.status !== 'ongoing') return;

    const copy = new Chess(game.fen());
    const result = copy.move(move);
    if (!result) return;

    const turnPlayer =
      game.turn() === 'w'
        ? gameData.players.white.uid
        : gameData.players.black.uid;

    if (currentUser?.uid !== turnPlayer) return;

    await updateDoc(doc(db, 'games', gameId!), {
        fen: copy.fen(),
        moves: arrayUnion({
          from: move.from,
          to: move.to,
          san: result.san,
        }),
        lastMoveTimestamp: serverTimestamp(),
      });
  };

  const onDrop = (s: string, t: string) => {
    makeMove({ from: s, to: t, promotion: 'q' });
    return true;
  };

  // GAME OVER
  const handleGameOver = async (reason: 'checkmate' | 'timeout' | 'resign' | 'draw') => {
    if (gameData?.status === 'completed') return;

    let winner: 'white' | 'black' | 'draw' = 'draw';

    if (reason === 'checkmate') {
      winner = game.turn() === 'w' ? 'black' : 'white';
    } else if (reason === 'timeout') {
      winner = game.turn() === 'w' ? 'black' : 'white';
    } else if (reason === 'resign') {
      winner = orientation === 'white' ? 'black' : 'white';
    }

    await updateDoc(doc(db, 'games', gameId!), {
        status: 'completed',
        result: { winner, reason },
      });

    toast.success(`Game over: ${winner} wins by ${reason}!`);
  };

  // RESIGN
  const resign = async () => {
    handleGameOver('resign');
  };

  // SEND CHAT
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    await updateDoc(doc(db, 'games', gameId!), {
      chat: arrayUnion({
        text: chatMessage,
        sender: currentUser?.displayName,
        timestamp: serverTimestamp(),
      }),
    });

    setChatMessage('');
  };

  useEffect(() => {
    if (!gameData) return;

    if (game.isGameOver()) {
      if (game.isCheckmate()) handleGameOver('checkmate');
      else handleGameOver('draw');
    }
  }, [game]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 2, background: '#1a1a1a', color: 'white' }}>
      <Grid container spacing={2}>
        {/* Chessboard */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, background: '#2c2c2c', height: '100%' }}>
            <Typography variant="h5" align="center" mb={2}>
              Live Game
            </Typography>
            <Box ref={chessboardRef} sx={{ maxWidth: 600, margin: 'auto' }}>
              {boardWidth > 0 && (
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onDrop}
                  boardWidth={boardWidth}
                  boardOrientation={orientation}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Game Info, Chat, Moves */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, background: '#2c2c2c', display: 'flex', flexDirection: 'column' }}>
            {/* Player Info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography>{gameData.players.white.displayName}</Typography>
                <Typography>Time: {timers.white}s</Typography>
              </Box>
              <Box>
                <Typography>{gameData.players.black.displayName}</Typography>
                <Typography>Time: {timers.black}s</Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2, background: 'grey' }} />

            {/* Move History */}
            <Box sx={{ height: 200, overflowY: 'auto', mb: 2 }}>
              <List dense>
                {gameData.moves.map((move: any, i: number) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${i + 1}. ${move.san}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Divider sx={{ mb: 2, background: 'grey' }} />

            {/* Chat */}
            <Box sx={{ height: 200, overflowY: 'auto', mb: 2 }}>
              <List dense>
                {gameData.chat?.map((msg: any, i: number) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={msg.text}
                      secondary={msg.sender}
                      secondaryTypographyProps={{ color: 'lightgrey' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                sx={{
                  input: { color: 'white' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'grey' },
                    '&:hover fieldset': { borderColor: 'white' },
                  },
                }}
              />
              <Button onClick={sendChatMessage} variant="contained" sx={{ ml: 1 }}>Send</Button>
            </Box>

            {/* Resign Button */}
            {gameData.status === 'ongoing' && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                sx={{ mt: 2 }}
                onClick={resign}
              >
                Resign
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveGame;