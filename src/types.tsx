import { Timestamp } from 'firebase/firestore';

export type GameType = 'ai' | 'friends' | 'tournaments';
export type GameResultType = 'win' | 'loss' | 'draw';

export interface GameHistory {
    gameId: string;
    gameType: 'AI' | 'Friend' | 'Tournament';
    result: GameResultType;
    opponent: OpponentDetails;
    playedAt: Timestamp;
  }

export interface OpponentDetails {
    name: string;
    uid: string;
    photoURL?: string;
}

export interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Timestamp;
  icon: React.ReactNode;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface Stats {
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    draws: number;
    winPercentage: number;
    elo: number;
}

export interface AiStats extends Stats {
    level: 'Easy' | 'Medium' | 'Hard';
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    level: number;
    aiStats: AiStats;
    stats: Stats;
    tournamentsStats: Stats;
    gameHistory?: GameHistory[];
    unlockedAchievements?: UnlockedAchievement[];
    createdAt?: Timestamp;
    mobileNumber?: string;
    dob?: string;
    address?: string;
    country?: string;
    friends?: { uid: string; displayName: string }[];
}

export interface GameResult {
    message: string;
    type: GameResultType;
}
