export interface QA {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const questions: QA[] = [
  {
    id: 1,
    question: "What is the most powerful piece in chess?",
    options: ['Rook', 'Knight', 'Bishop', 'Queen'],
    correctAnswer: 'Queen',
    explanation: "The Queen can move any number of squares horizontally, vertically, or diagonally, making it the most powerful piece.",
    difficulty: 'Easy',
  },
  {
    id: 2,
    question: "What is the term for a situation where a player is not in check, but has no legal moves?",
    options: ['Checkmate', 'Stalemate', 'Draw', 'Resignation'],
    correctAnswer: 'Stalemate',
    explanation: "Stalemate is a draw. It occurs when the player whose turn it is has no legal moves, but their king is not in check.",
    difficulty: 'Easy',
  },
  {
    id: 3,
    question: "Which piece can jump over other pieces?",
    options: ['Rook', 'Knight', 'Bishop', 'Pawn'],
    correctAnswer: 'Knight',
    explanation: "The Knight moves in an 'L' shape and is the only piece that can jump over other pieces.",
    difficulty: 'Easy',
  },
  {
    id: 4,
    question: "What is the name of the move where the king and rook move at the same time?",
    options: ['En Passant', 'Promotion', 'Castling', 'Interference'],
    correctAnswer: 'Castling',
    explanation: "Castling is a special move to protect the king and connect the rooks. It is the only move where two pieces can move at once.",
    difficulty: 'Medium',
  },
  {
    id: 5,
    question: "In the opening, it is generally recommended to...",
    options: ['Move your queen out early', 'Control the center of the board', 'Move all your pawns first', 'Keep your king in the center'],
    correctAnswer: 'Control the center of the board',
    explanation: "Controlling the center (the squares e4, d4, e5, d5) is crucial as it allows your pieces greater mobility and influence over the game.",
    difficulty: 'Medium',
  },
    {
    id: 6,
    question: "Which of the following is NOT a valid way to achieve a draw?",
    options: ["Stalemate", "Agreement between players", "Threefold repetition", "One player having only a king left"],
    correctAnswer: "One player having only a king left",
    explanation: "While having only a king is a huge disadvantage, it is not an automatic draw. The opponent might still have enough material to force a checkmate.",
    difficulty: "Hard"
  },
  {
    id: 7,
    question: "What does the term 'Zwischenzug' mean in chess?",
    options: ["A forced move", "A quiet move", "An in-between move", "A blunder"],
    correctAnswer: "An in-between move",
    explanation: "A Zwischenzug (German for 'in-between move') is a tactic where a player, instead of making an expected move (like a recapture), first plays another move that poses a more immediate threat.",
    difficulty: "Hard"
  }
];
