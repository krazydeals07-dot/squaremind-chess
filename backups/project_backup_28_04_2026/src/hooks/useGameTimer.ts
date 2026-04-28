import { useState, useEffect } from 'react';
import { GameData } from '../types';

export const useGameTimer = (gameData: GameData | null, onTimeout: (timedOutColor: 'w' | 'b') => void) => {
    const [timers, setTimers] = useState<{ w: number, b: number }>({ w: 0, b: 0 });

    useEffect(() => {
        if (!gameData || gameData.status !== 'active' || !gameData.players.white || !gameData.players.black) {
            if (gameData?.timers) {
                setTimers(gameData.timers);
            }
            return;
        }

        const MOVE_TIMEOUT = gameData.timeControl?.moveLimit || 60; // 60 seconds per move limit

        const timerInterval = setInterval(() => {
            const turn = gameData.fen.split(' ')[1] as 'w' | 'b';
            const lastMoveTime = gameData.lastMoveTimestamp?.toDate().getTime() || gameData.createdAt.toDate().getTime();
            const timeSinceLastMove = (Date.now() - lastMoveTime) / 1000;

            let wTime = gameData.timers.w;
            let bTime = gameData.timers.b;

            // Check for per-move timeout (60 seconds)
            if (timeSinceLastMove >= MOVE_TIMEOUT) {
                onTimeout(turn);
                clearInterval(timerInterval);
                return;
            }

            if (turn === 'w') {
                wTime = gameData.timers.w - timeSinceLastMove;
            } else {
                bTime = gameData.timers.b - timeSinceLastMove;
            }

            // Check for total game time timeout (e.g., 13 minutes)
            if (wTime <= 0) {
                onTimeout('w');
                wTime = 0;
                clearInterval(timerInterval);
            } else if (bTime <= 0) {
                onTimeout('b');
                bTime = 0;
                clearInterval(timerInterval);
            }
            
            setTimers({ w: Math.max(0, wTime), b: Math.max(0, bTime) });

        }, 1000);

        return () => clearInterval(timerInterval);
    }, [gameData, onTimeout]);

    return timers;
};