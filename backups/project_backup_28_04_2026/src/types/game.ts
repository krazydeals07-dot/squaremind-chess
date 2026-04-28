
import { FieldValue } from 'firebase/firestore';

export interface Move {
  from: string;
  to: string;
  fen: string;
}

export interface ChatMessage {
  uid: string;
  displayName: string;
  text: string;
  timestamp: FieldValue | Date;
}

export interface Game {
  id: string;
  players: {
    white: string; // UID of the white player
    black: string; // UID of the black player
  };
  fen: string; // Forsyth-Edwards Notation of the board state
  moves: Move[];
  timers: {
    white: number; // Remaining time in seconds
    black: number;
  };
  increment: number; // Time increment per move in seconds
  status: 'pending' | 'ongoing' | 'completed' | 'aborted';
  result?: {
    winner: 'w' | 'b' | 'd'; // 'd' for draw
    reason: 'checkmate' | 'resign' | 'timeout' | 'stalemate' | 'threefold repetition' | 'insufficient material' | '50-move rule' | 'draw agreed' | 'aborted';
  } | null;
  drawOffer?: {
    from: string;
    to: string;
  } | null;
  chat?: ChatMessage[];
  lastMoveAt: FieldValue | Date;
  createdAt: FieldValue | Date;
  tournamentId: string;
  round: number;
  totalRounds: number;
}
