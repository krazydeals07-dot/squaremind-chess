
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    createdAt: Timestamp;
    friends?: string[]; // Array of friend UIDs
    friendRequests?: FriendRequest[];
    aiStats?: AiStats;
    isAdmin?: boolean;
}

export interface FriendRequest {
    from: string; // UID of the user who sent the request
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Timestamp;
}

export interface AiStats {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    elo: number;
}
