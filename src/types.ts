import { Timestamp } from 'firebase/firestore';

// Represents a player in the game, linking to their user ID and display name.
export interface Player {
  id: string;
  name: string;
}

// Defines the structure for a draw offer between players.
export interface DrawOffer {
  from: string; // User ID of the player offering the draw
  to: string;   // User ID of the player to whom the draw is offered
}

// Represents a single chat message in the game.
export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Timestamp | Date;
}

// The main interface for a game document in Firestore.
export interface Game {
  id: string;
  players: {
    white: string; // User ID of the white player
    black: string; // User ID of the black player
  };
  playerNames: {
    white: string;
    black: string;
  };
  fen: string; // Forsyth-Edwards Notation of the current board state.
  moves: (string | { san: string })[]; // A list of moves in Standard Algebraic Notation.
  status: 'waiting' | 'active' | 'ended'; // The current status of the game.
  winner?: string | 'draw'; // The user ID of the winner, or 'draw'.
  reason?: 'checkmate' | 'timeout' | 'resign' | 'draw'; // The reason the game ended.
  createdAt: Timestamp;
  lastMove: Timestamp; // Timestamp of the last move, used for timer calculations.
  timeControl: string; // e.g., "600+5" (10 minutes + 5 seconds increment)
  timeIncrement: number; // The time increment in seconds.
  timers: {
    w: number; // Remaining time for white in seconds.
    b: number; // Remaining time for black in seconds.
  };
  drawOffer?: DrawOffer | null; // Stores any active draw offer.
  chat?: ChatMessage[]; // A log of all chat messages for the game.
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  // Add any other user-specific fields you might have
  stats?: {
      gamesPlayed: number;
      gamesWon: number;
      gamesLost: number;
      draws: number;
      elo: number;
  };
}
