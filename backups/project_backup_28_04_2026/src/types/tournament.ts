
import { Timestamp } from 'firebase/firestore';

export interface Tournament {
    id: string;
    name: string;
    type: 'daily-knockout' | 'swiss';
    status: 'pending' | 'ongoing' | 'completed';
    createdAt: Timestamp;
    startTime: Timestamp;
    participants: string[]; // array of user UIDs
    rounds?: number; // For Swiss
    currentRound?: number;
    pairings?: Match[];
}

export interface Match {
    matchId: string;
    round: number;
    players: [string, string]; // [white, black]
    result?: string; // '1-0', '0-1', '1/2-1/2'
    gameId?: string;
}

export interface Game {
    fen: string;
    players: {
        white: string;
        black: string;
    };
    playerNames: {
        white: string;
        black: string;
    };
    moves: { from: string, to: string, san: string, promotion?: string, timestamp: Date }[];
    status: string;
    drawOffer?: { from: string, to: string } | null;
    chat?: { senderId: string, senderName: string, message: string, timestamp: Date }[];
    timers?: { 
        white: number; 
        black: number; 
        lastMove: number; 
    };
    updatedAt?: Date;
}


