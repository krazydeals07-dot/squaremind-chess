import React, { useState, useRef, useMemo } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Typography, Paper, Box, Button, Chip, Grid } from '@mui/material';
import { Puzzle } from '../../data/puzzles';

interface PuzzleProps {
  puzzle: Puzzle;
  onSolve: (points: number) => void;
  isGuest: boolean;
  userStats: {
    score: number;
    streak: number;
    puzzlesSolved: number[];
    lastSolved: string;
  };
}

const pieceComponents: { [key: string]: string } = {
    wK: '♚', wQ: '♛', wR: '♜', wB: '♝', wN: '♞', wP: '♟︎',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟︎'
};

const customPieces = {
    wK: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wK}</Typography></div>,
    wQ: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wQ}</Typography></div>,
    wR: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wR}</Typography></div>,
    wB: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wB}</Typography></div>,
    wN: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wN}</Typography></div>,
    wP: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#FFFFFF', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.wP}</Typography></div>,
    bK: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bK}</Typography></div>,
    bQ: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bQ}</Typography></div>,
    bR: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bR}</Typography></div>,
    bB: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bB}</Typography></div>,
    bN: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bN}</Typography></div>,
    bP: ({ squareWidth }: { squareWidth: number }) => <div style={{ width: squareWidth, height: squareWidth, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography sx={{ fontSize: squareWidth * 0.85, color: '#000000', textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>{pieceComponents.bP}</Typography></div>,
};

const PuzzleDisplay: React.FC<PuzzleProps> = ({ puzzle, onSolve, isGuest, userStats }) => {
  const [game, setGame] = useState(new Chess(puzzle.fen));
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const chessboardContainerRef = useRef<HTMLDivElement>(null);
  const [moveFrom, setMoveFrom] = useState<Square | ''>('');
  const [optionSquares, setOptionSquares] = useState<{ [key: string]: React.CSSProperties }>({});

  useMemo(() => {
    setGame(new Chess(puzzle.fen));
    setMessage('');
    setHint('');
    setHintUsed(false);
    setMoveFrom('');
    setOptionSquares({});
  }, [puzzle]);

  function makeAMove(move: { from: Square, to: Square, promotion?: string }): boolean {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result === null) {
      return false; // Illegal move
    }

    setGame(gameCopy);
    setMoveFrom(''); 
    setOptionSquares({});

    const solution = Array.isArray(puzzle.solution) ? puzzle.solution : [puzzle.solution];
    if (solution.includes(result.san)) {
        setMessage('Correct! Puzzle solved.');
        onSolve(puzzle.points);
    } else {
        setMessage('Incorrect move. Try Again');
    }
    return true;
  }

  function onSquareClick(square: Square) {
    if (square === moveFrom) {
        setMoveFrom('');
        setOptionSquares({});
        return;
    }

    if (moveFrom) {
        const moveSuccessful = makeAMove({ from: moveFrom, to: square, promotion: 'q' });
        if (!moveSuccessful) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                showMoveOptions(square);
            }
        }
        return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
        showMoveOptions(square);
    }
  }

  function showMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
        return;
    }

    const newOptions: { [key: string]: React.CSSProperties } = {};
    moves.forEach((move: Move) => {
        newOptions[move.to] = {
            background: 'rgba(255, 215, 0, 0.4)',
        };
    });
    newOptions[square] = {
        background: 'rgba(255, 215, 0, 0.5)',
    };
    
    setOptionSquares(newOptions);
    setMoveFrom(square);
  }

  function onPieceDrop(sourceSquare: Square, targetSquare: Square): boolean {
    makeAMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    return true;
  }

  const handleShowHint = () => {
    if (isGuest && hintUsed) {
      setMessage("Guests can only use one hint per puzzle.");
      return;
    }
    setHint(puzzle.hint);
    setHintUsed(true);
  };

  const handleShowSolution = () => {
    const solution = Array.isArray(puzzle.solution) ? puzzle.solution.join(', ') : puzzle.solution;
    setMessage(`Solution: ${solution}`);
  };

  const resetPuzzle = () => {
    setGame(new Chess(puzzle.fen));
    setMessage('');
    setHint('');
  };

  return (
    <Paper sx={{ 
        p: 1, 
        background: 'rgba(30, 30, 40, 0.85)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px', 
        color: 'white', 
        width: '100%', 
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
        maxWidth: '850px',
        mx: 'auto'
    }}>
        <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    <div ref={chessboardContainerRef} style={{width: '100%', maxWidth: '340px'}}>
                        <Chessboard
                            position={game.fen()}
                            onPieceDrop={onPieceDrop}
                            onSquareClick={onSquareClick}
                            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
                            customDarkSquareStyle={{ backgroundColor: '#6B3F23' }}
                            customLightSquareStyle={{ backgroundColor: '#EAD8C3' }}
                            customPieces={customPieces}
                            customSquareStyles={optionSquares}
                        />
                    </div>
                </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 0.5 }}>
                <Box>
                    <Box sx={{ mb: 0.5, p: 0.4, borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                        <Typography sx={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '0.7rem', letterSpacing: '0.3px' }}>
                            Score: {userStats.score} | Streak: {userStats.streak} 🔥
                        </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Orbitron', color: '#FFA500', fontSize: '0.9rem', fontWeight: 'bold', lineHeight: 1.2 }}>{puzzle.type}</Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                            <Chip size="small" label={puzzle.difficulty} color={puzzle.difficulty === 'Easy' ? 'success' : puzzle.difficulty === 'Medium' ? 'warning' : 'error'} sx={{ height: '18px', fontSize: '0.6rem', fontWeight: 'bold' }} />
                            <Chip size="small" label={`${puzzle.points} pts`} color="primary" sx={{ height: '18px', fontSize: '0.6rem', fontWeight: 'bold' }} />
                        </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: 'lightgray', mb: 1, fontSize: '0.75rem', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {puzzle.question}
                    </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                        <Button size="small" variant="contained" color="info" onClick={handleShowHint} sx={{ flex: 1, py: 0.3, fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'Orbitron', minWidth: 0 }}>Hint</Button>
                        <Button size="small" variant="contained" color="secondary" onClick={handleShowSolution} sx={{ flex: 1, py: 0.3, fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'Orbitron', minWidth: 0 }}>Sol</Button>
                        <Button size="small" variant="outlined" color="warning" onClick={resetPuzzle} sx={{ flex: 1, py: 0.3, fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'Orbitron', minWidth: 0 }}>Reset</Button>
                    </Box>
                    {message && <Typography sx={{ fontSize: '0.65rem', color: message.includes('Correct') ? 'lightgreen' : '#ff7961', textAlign: 'center' }}>{message}</Typography>}
                    {hint && <Typography sx={{ mt: 0.5, textAlign: 'center', fontSize: '0.65rem', color: 'lightblue' }}>Hint: {hint}</Typography>}
                </Box>
            </Grid>
        </Grid>
    </Paper>
  );
};

export default PuzzleDisplay;