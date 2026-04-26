import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess, Square, PieceSymbol } from 'chess.js';
import confetti from 'canvas-confetti';

const SOUNDS = {
    move: '/sounds/move.ogg',
    capture: '/sounds/capture.ogg',
    check: '/sounds/check.ogg',
    win: '/sounds/win.ogg',
    lose: '/sounds/lose.ogg'
};

const playSound = (type: keyof typeof SOUNDS) => {
    try {
        const audio = new Audio(SOUNDS[type]);
        audio.volume = 1.0;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(`Audio play blocked: ${type}`, e));
    } catch (e) {
        console.error(`Sound error: ${type}`, e);
    }
};

const triggerWinConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
};

export const usePlayAI = (difficulty: number = 1) => {
    const [game, setGame] = useState(new Chess());
    const [gameStatus, setGameStatus] = useState<'active' | 'ended'>('active');
    const [winner, setWinner] = useState<string | null>(null);

    function makeAMove(move: { from: string; to: string; promotion?: string }) {
        if (gameStatus === 'ended') return false;
        
        const gameCopy = new Chess(game.fen());
        try {
            const result = gameCopy.move(move);
            if (result) {
                // Determine move sound for player
                if (gameCopy.isCheckmate()) {
                    playSound('win');
                    triggerWinConfetti();
                } else if (gameCopy.inCheck()) {
                    playSound('check');
                } else if (result.captured) {
                    playSound('capture');
                } else {
                    playSound('move');
                }

                setGame(gameCopy);

                if (gameCopy.isGameOver()) {
                    setGameStatus('ended');
                    if (gameCopy.isCheckmate()) {
                        setWinner('Player');
                    } else {
                        setWinner('Draw');
                    }
                } else {
                    setTimeout(() => makeAIMove(gameCopy.fen()), 500);
                }
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    function makeAIMove(fen: string) {
        const gameCopy = new Chess(fen);
        if (gameCopy.isGameOver()) return;

        const moves = gameCopy.moves({ verbose: true });
        if (moves.length === 0) return;
        
        // Simple AI logic: prioritize captures
        const captureMoves = moves.filter(m => m.captured);
        const move = captureMoves.length > 0 
            ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
            : moves[Math.floor(Math.random() * moves.length)];
        
        const result = gameCopy.move(move);
        
        if (result) {
            // Determine move sound for AI
            if (gameCopy.isCheckmate()) {
                playSound('lose');
            } else if (gameCopy.inCheck()) {
                playSound('check');
            } else if (result.captured) {
                playSound('capture');
            } else {
                playSound('move');
            }

            setGame(gameCopy);

            if (gameCopy.isGameOver()) {
                setGameStatus('ended');
                if (gameCopy.isCheckmate()) {
                    setWinner('AI');
                } else {
                    setWinner('Draw');
                }
            }
        }
    }

    function onDrop(sourceSquare: Square, targetSquare: Square) {
        const moveResult = makeAMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });
        return moveResult;
    }

    function resetGame() {
        const newGame = new Chess();
        setGame(newGame);
        setGameStatus('active');
        setWinner(null);
    }

    return {
        game,
        onDrop,
        resetGame,
        gameStatus,
        winner
    };
};