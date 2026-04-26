import { useEffect, useState } from 'react';

interface GameInfoProps {
    players: {
        white: string;
        black: string;
    };
    timers: { w: number; b: number } | null;
    currentUserId: string;
    playerIds: {
        white: string;
        black: string;
    };
}

const GameInfo = ({ players, timers, currentUserId, playerIds }: GameInfoProps) => {

    const formatTime = (timeInSeconds: number) => {
        if (typeof timeInSeconds !== 'number' || timeInSeconds < 0) {
            return '00:00';
        }
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isUserWhite = playerIds.white === currentUserId;

    const userPlayerName = isUserWhite ? players.white : players.black;
    const opponentPlayerName = isUserWhite ? players.black : players.white;

    const userTimer = timers ? (isUserWhite ? timers.w : timers.b) : 0;
    const opponentTimer = timers ? (isUserWhite ? timers.b : timers.w) : 0;

    return (
        <div className="bg-gray-800 p-4 rounded-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-white">Tournament Match</h2>
            <div className="space-y-3">
                {/* Opponent Info */}
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-md">
                    <span className="text-white truncate font-semibold">{opponentPlayerName}</span>
                    <span className="text-white font-mono bg-black px-3 py-1 rounded-md text-lg">
                        {formatTime(opponentTimer)}
                    </span>
                </div>
                {/* User Info */}
                <div className="flex justify-between items-center p-3 bg-gray-600 rounded-md border-2 border-orange-500">
                    <span className="text-white truncate font-semibold">{userPlayerName} (You)</span>
                    <span className="text-white font-mono bg-black px-3 py-1 rounded-md text-lg">
                        {formatTime(userTimer)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GameInfo;
