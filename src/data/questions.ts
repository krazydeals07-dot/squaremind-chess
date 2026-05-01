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
    question: "How does a pawn move?",
    options: ["One or two squares forward, captures diagonally", "Only one square forward", "In an L-shape", "Diagonally only"],
    correctAnswer: "One or two squares forward, captures diagonally",
    explanation: "A pawn can move one or two squares forward on its first move, and one square forward thereafter. It captures one square diagonally forward.",
    difficulty: "Easy"
  },
  {
    id: 5,
    question: "Which piece moves only diagonally?",
    options: ["Rook", "Bishop", "Knight", "Pawn"],
    correctAnswer: "Bishop",
    explanation: "The Bishop moves any number of squares diagonally.",
    difficulty: "Easy"
  },
  {
    id: 6,
    question: "How many pawns does each player start with?",
    options: ["6", "8", "10", "16"],
    correctAnswer: "8",
    explanation: "Each player starts the game with 8 pawns.",
    difficulty: "Easy"
  },
  {
    id: 7,
    question: "What is the goal of the game of chess?",
    options: ["Capture all the opponent's pieces", "Get the king to the other side", "To checkmate the opponent's king", "Have the most pieces at the end"],
    correctAnswer: "To checkmate the opponent's king",
    explanation: "The ultimate goal in chess is to trap the opponent's king so that it is under attack and cannot make any legal move, which is called checkmate.",
    difficulty: "Easy"
  },
  {
    id: 8,
    question: "Which piece is the least powerful?",
    options: ["King", "Pawn", "Bishop", "Knight"],
    correctAnswer: "Pawn",
    explanation: "The pawn is the least powerful piece, although it has the potential to be promoted to a more powerful piece.",
    difficulty: "Easy"
  },
  {
    id: 9,
    question: "What happens when a king is under attack?",
    options: ["It is in check", "It is forked", "It is pinned", "It is game over"],
    correctAnswer: "It is in check",
    explanation: "When a king is under direct attack by one or more of the opponent's pieces, it is said to be in check.",
    difficulty: "Easy"
  },
  {
    id: 10,
    question: "What is the name for the start of the game?",
    options: ["The Middlegame", "The Endgame", "The Opening", "The Beginning"],
    correctAnswer: "The Opening",
    explanation: "The first phase of a chess game is called the opening, where players develop their pieces and control the center.",
    difficulty: "Easy"
  },
  {
    id: 11,
    question: "What is the name of the move where the king and rook move at the same time?",
    options: ['En Passant', 'Promotion', 'Castling', 'Interference'],
    correctAnswer: 'Castling',
    explanation: "Castling is a special move to protect the king and connect the rooks. It is the only move where two pieces can move at once.",
    difficulty: 'Medium',
  },
  {
    id: 12,
    question: "In the opening, it is generally recommended to...",
    options: ['Move your queen out early', 'Control the center of the board', 'Move all your pawns first', 'Keep your king in the center'],
    correctAnswer: 'Control the center of the board',
    explanation: "Controlling the center (the squares e4, d4, e5, d5) is crucial as it allows your pieces greater mobility and influence over the game.",
    difficulty: 'Medium',
  },
  {
    id: 13,
    question: "What is 'En Passant'?",
    options: ["A special pawn capture", "A type of checkmate", "Promoting a pawn", "A defensive move"],
    correctAnswer: "A special pawn capture",
    explanation: "En passant is a special pawn capture that can only occur immediately after a pawn makes a move of two squares from its starting square, and it could have been captured by an enemy pawn had it advanced only one square.",
    difficulty: "Medium"
  },
  {
    id: 14,
    question: "What is a 'fork' in chess?",
    options: ["A move that defends two pieces", "A tactic where one piece attacks two or more enemy pieces simultaneously", "A sequence of checks", "Exchanging pieces of equal value"],
    correctAnswer: "A tactic where one piece attacks two or more enemy pieces simultaneously",
    explanation: "A fork is a common tactic where a single piece, like a knight or pawn, attacks multiple enemy pieces at the same time.",
    difficulty: "Medium"
  },
  {
    id: 15,
    question: "What is a 'pin' in chess?",
    options: ["When a piece is trapped", "A move that forces the opponent's king to move", "A situation where a piece cannot move because doing so would expose a more valuable piece to attack", "A move that blocks a check"],
    correctAnswer: "A situation where a piece cannot move because doing so would expose a more valuable piece to attack",
    explanation: "A pin is a tactic where an attacking piece prevents an enemy piece from moving because a more valuable piece (often the king) is positioned behind it.",
    difficulty: "Medium"
  },
  {
    id: 16,
    question: "What is the '50-move rule'?",
    options: ["A game ends after 50 moves", "A player has 50 seconds to make a move", "A draw can be claimed if no pawn has moved and no capture has been made in the last 50 moves", "You must move a pawn within the first 50 moves"],
    correctAnswer: "A draw can be claimed if no pawn has moved and no capture has been made in the last 50 moves",
    explanation: "The 50-move rule states that a player can claim a draw if no capture has been made and no pawn has been moved in the last 50 consecutive moves by each player.",
    difficulty: "Medium"
  },
  {
    id: 17,
    question: "What is 'opposition' in a king and pawn endgame?",
    options: ["When both players have the same number of pawns", "When the kings are on opposite sides of the board", "A situation where the kings are separated by an odd number of squares on a rank or file", "When a king is blocked by its own pawn"],
    correctAnswer: "A situation where the kings are separated by an odd number of squares on a rank or file",
    explanation: "Opposition is a key concept in endgames where the positioning of the kings relative to each other can determine the outcome of the game.",
    difficulty: "Medium"
  },
  {
    id: 18,
    question: "What is a 'discovered attack'?",
    options: ["Finding a hidden piece", "An attack that is a surprise to the opponent", "An attack revealed when one piece moves out of the way of another", "Attacking a piece that has just moved"],
    correctAnswer: "An attack revealed when one piece moves out of the way of another",
    explanation: "A discovered attack is a powerful tactic where moving one piece uncovers an attack from another piece (a queen, rook, or bishop) behind it.",
    difficulty: "Medium"
  },
  {
    id: 19,
    question: "What is a 'passed pawn'?",
    options: ["A pawn that has passed the middle of the board", "A pawn that has no enemy pawns in front of it on the same or adjacent files", "A pawn that has captured an enemy piece", "A pawn that is about to be promoted"],
    correctAnswer: "A pawn that has no enemy pawns in front of it on the same or adjacent files",
    explanation: "A passed pawn is a significant advantage as it has a clear path to promotion without being challenged by other pawns.",
    difficulty: "Medium"
  },
  {
    id: 20,
    question: "What is the approximate point value of a rook?",
    options: ["3 points", "5 points", "7 points", "9 points"],
    correctAnswer: "5 points",
    explanation: "A rook is generally valued at 5 points, making it more valuable than a bishop or knight (both 3 points) but less valuable than a queen (9 points).",
    difficulty: "Medium"
  },
  {
    id: 21,
    question: "Which of the following is NOT a valid way to achieve a draw?",
    options: ["Stalemate", "Agreement between players", "Threefold repetition", "One player having only a king left"],
    correctAnswer: "One player having only a king left",
    explanation: "While having only a king is a huge disadvantage, it is not an automatic draw. The opponent might still have enough material to force a checkmate.",
    difficulty: "Hard"
  },
  {
    id: 22,
    question: "What does the term 'Zwischenzug' mean in chess?",
    options: ["A forced move", "A quiet move", "An in-between move", "A blunder"],
    correctAnswer: "An in-between move",
    explanation: "A Zwischenzug (German for 'in-between move') is a tactic where a player, instead of making an expected move (like a recapture), first plays another move that poses a more immediate threat.",
    difficulty: "Hard"
  },
  {
    id: 23,
    question: "What is a 'fortress' in chess?",
    options: ["A specific opening setup", "A position where a player with a material disadvantage can prevent the opponent from making progress", "A checkmating pattern", "A type of fork"],
    correctAnswer: "A position where a player with a material disadvantage can prevent the opponent from making progress",
    explanation: "A fortress is a position that, if obtained by the weaker side, may prevent the stronger side from winning, even with a large material advantage.",
    difficulty: "Hard"
  },
  {
    id: 24,
    question: "What is the Lucena position?",
    options: ["A famous opening trap", "A type of smothered mate", "A well-known endgame position with a rook and pawn versus a rook, where the stronger side can force a win", "A defensive formation"],
    correctAnswer: "A well-known endgame position with a rook and pawn versus a rook, where the stronger side can force a win",
    explanation: "The Lucena position is one of the most famous and important positions in endgame theory, demonstrating a winning technique.",
    difficulty: "Hard"
  },
  {
    id: 25,
    question: "What is the Philidor position?",
    options: ["An aggressive opening for White", "A key drawing position in a rook and pawn versus rook endgame", "A common checkmating pattern with two bishops", "A tactic involving a queen and knight"],
    correctAnswer: "A key drawing position in a rook and pawn versus rook endgame",
    explanation: "The Philidor position is a crucial drawing technique for the defending side in a rook and pawn endgame.",
    difficulty: "Hard"
  },
  {
    id: 26,
    question: "What is the Najdorf Variation of the Sicilian Defense?",
    options: ["A solid, defensive setup for White", "A sharp and popular opening for Black beginning with 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6", "An uncommon gambit", "A slow, positional opening"],
    correctAnswer: "A sharp and popular opening for Black beginning with 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6",
    explanation: "The Najdorf is one of the most respected and deeply analyzed of all chess openings, favored by many world champions.",
    difficulty: "Hard"
  },
  {
    id: 27,
    question: "Who was the first official World Chess Champion?",
    options: ["Paul Morphy", "Adolf Anderssen", "Wilhelm Steinitz", "Emanuel Lasker"],
    correctAnswer: "Wilhelm Steinitz",
    explanation: "Wilhelm Steinitz became the first official World Chess Champion in 1886 after defeating Johannes Zukertort in a match.",
    difficulty: "Hard"
  },
  {
    id: 28,
    question: "What is prophylaxis in chess?",
    options: ["An all-out attack", "A move that improves your position while preventing an opponent's plan", "Exchanging a minor piece for a major piece", "A move that sacrifices material for a positional advantage"],
    correctAnswer: "A move that improves your position while preventing an opponent's plan",
    explanation: "Prophylaxis is the art of anticipating and preventing threats before they materialize. It's a key element of high-level chess.",
    difficulty: "Hard"
  },
  {
    id: 29,
    question: "What is the rule of the square?",
    options: ["A rule about central control", "A method to determine if a king can catch a passed pawn", "A rule for castling", "A guideline for knight movement"],
    correctAnswer: "A method to determine if a king can catch a passed pawn",
    explanation: "The rule of the square is a geometric shortcut to quickly calculate if a king can stop an opponent's passed pawn from promoting without counting moves.",
    difficulty: "Hard"
  },
  {
    id: 30,
    question: "What is a tempo in chess?",
    options: ["The time limit in a game", "A single move or 'turn'", "A type of tactic", "The style of play"],
    correctAnswer: "A single move or 'turn'",
    explanation: "A tempo refers to a unit of time in terms of a move. Gaining a tempo means achieving a desired result in one fewer move than expected, which is a form of advantage.",
    difficulty: "Hard"
  },
  {
    id: 31,
    question: "What is a 'desperado' piece in chess?",
    options: ["A piece that is defended by the king", "A piece that delivers checkmate", "A piece that is trapped and creates a final threat before being captured", "The most active piece on the board"],
    correctAnswer: "A piece that is trapped and creates a final threat before being captured",
    explanation: "A desperado is a piece that seems doomed, so it's used to do as much damage as possible before it's captured, often by capturing an enemy piece itself.",
    difficulty: "Hard"
  }
];
