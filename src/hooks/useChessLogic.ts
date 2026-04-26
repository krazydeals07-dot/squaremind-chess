import { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square, Piece } from 'chess.js';
import { GameData } from '../types';

export const useChessLogic = (gameData: GameData | null) => {
    // Initialize with FEN if available, otherwise default start position
    const [game, setGame] = useState(new Chess(gameData?.fen || undefined));
    const [capturedBy, setCapturedBy] = useState<{ w: Piece[], b: Piece[] }>({ w: [], b: [] });
    const [lastMoveSquares, setLastMoveSquares] = useState<{ [key: string]: React.CSSProperties }>({});
    const [fromSquare, setFromSquare] = useState<Square | null>(null);
    const [optionSquares, setOptionSquares] = useState<{ [key: string]: React.CSSProperties }>({});

    // Sync local game state with database FEN
    useEffect(() => {
        if (gameData?.fen) {
            console.log("Syncing board with FEN:", gameData.fen);
            const newGame = new Chess(gameData.fen);
            setGame(newGame);

            const history = newGame.history({ verbose: true });
            const captures = { w: [] as Piece[], b: [] as Piece[] };
            history.forEach(move => {
                if (move.captured) {
                    const capturedColor = move.color === 'w' ? 'b' : 'w';
                    const piece: Piece = { type: move.captured, color: capturedColor };
                    (move.color === 'w' ? captures.w : captures.b).push(piece);
                }
            });
            setCapturedBy(captures);

            if (history.length > 0) {
                const lastMove = history[history.length - 1];
                setLastMoveSquares({
                    [lastMove.from]: { background: 'rgba(255, 255, 0, 0.4)' },
                    [lastMove.to]: { background: 'rgba(255, 255, 0, 0.4)' },
                });
            } else {
                setLastMoveSquares({});
            }
        }
    }, [gameData?.fen]);

    const isGameOver = useMemo(() => game.isGameOver(), [game]);

    const selectPiece = (square: Square) => {
        setFromSquare(square);
        const moves = game.moves({ square, verbose: true });
        const newOptionSquares = moves.reduce((acc, move) => {
            acc[move.to] = {
                background: game.get(move.to)
                    ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, #FF6F00 85%)' 
                    : 'radial-gradient(circle, #FF6F00 25%, transparent 25%)',
                borderRadius: '50%',
            };
            return acc;
        }, {} as { [key: string]: React.CSSProperties });
        newOptionSquares[square] = { background: 'rgba(255, 111, 0, 0.3)' };
        setOptionSquares(newOptionSquares);
    };

    const handleSquareClick = useCallback((square: Square, isMyTurn: boolean, makeMove: (move: { from: Square, to: Square, promotion?: string }) => void) => {
        if (!isMyTurn) {
            console.log("Not your turn, ignoring click.");
            return;
        }

        if (fromSquare) {
            if (fromSquare === square) {
                setFromSquare(null);
                setOptionSquares({});
                return;
            }
            
            // Validate move before calling makeMove
            const moves = game.moves({ square: fromSquare, verbose: true });
            const moveAttempt = moves.find(m => m.to === square);
            
            if (moveAttempt) {
                console.log(`Valid move detected: ${fromSquare} to ${square}`);
                makeMove({ from: fromSquare, to: square, promotion: 'q' });
                setFromSquare(null);
                setOptionSquares({});
            } else {
                const piece = game.get(square);
                if (piece && piece.color === game.turn()) {
                    selectPiece(square);
                } else {
                    setFromSquare(null);
                    setOptionSquares({});
                }
            }
        } else {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                selectPiece(square);
            }
        }
    }, [fromSquare, game]);

    const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, isMyTurn: boolean, makeMove: (move: { from: Square, to: Square, promotion?: string }) => void) => {
        if (!isMyTurn) {
            console.log("Not your turn, ignoring drop.");
            return false;
        }
        
        const moves = game.moves({ square: sourceSquare, verbose: true });
        const isValid = moves.some(m => m.to === targetSquare);
        
        if (isValid) {
            console.log(`Valid drop move: ${sourceSquare} to ${targetSquare}`);
            makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' });
            setFromSquare(null);
            setOptionSquares({});
            return true;
        }
        console.log("Invalid move attempt.");
        return false;
    }, [game]);
    
    return { 
        game, 
        capturedBy, 
        lastMoveSquares, 
        optionSquares, 
        isGameOver, 
        onSquareClick: handleSquareClick, 
        onPieceDrop, 
        setFromSquare, 
        setOptionSquares 
    };
};