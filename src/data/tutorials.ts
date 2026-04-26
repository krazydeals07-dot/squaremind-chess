
export interface TutorialStep {
    title: string;
    description: string;
    fen: string;
    highlight: string[];
}

export interface Tutorial {
    id: string;
    title: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    type: 'video' | 'interactive';
    videoId?: string; // For YouTube embeds
    content?: TutorialStep[]; // For interactive tutorials
}

export const tutorials: Tutorial[] = [
    // Beginner Tutorials
    {
        id: 'b1',
        title: 'The Pieces and Their Moves',
        level: 'Beginner',
        description: 'Learn how each chess piece moves on the board.',
        type: 'interactive',
        content: [
            {
                title: 'The King',
                description: 'The king moves one square in any direction. Here are the possible moves for the king.',
                fen: '8/8/8/8/4K3/8/8/8 w - - 0 1',
                highlight: ['d3', 'e3', 'f3', 'd4', 'f4', 'd5', 'e5', 'f5'],
            },
            {
                title: 'The Queen',
                description: 'The queen is the most powerful piece. It can move any number of squares along a rank, file, or diagonal.',
                fen: '8/8/8/8/4Q3/8/8/8 w - - 0 1',
                highlight: [
                    'd3', 'c2', 'b1', 'f5', 'g6', 'h7', 
                    'e3', 'e2', 'e1', 'e5', 'e6', 'e7', 'e8', 
                    'd4', 'c4', 'b4', 'a4', 'f4', 'g4', 'h4'  
                ]
            },
            {
                title: 'The Rook',
                description: 'The rook moves any number of squares along a rank or file.',
                fen: '8/8/8/8/4R3/8/8/8 w - - 0 1',
                highlight: [
                    'e3', 'e2', 'e1', 'e5', 'e6', 'e7', 'e8', 
                    'd4', 'c4', 'b4', 'a4', 'f4', 'g4', 'h4'
                ]
            },
            {
                title: 'The Bishop',
                description: 'The bishop moves any number of squares diagonally.',
                fen: '8/8/8/8/4B3/8/8/8 w - - 0 1',
                highlight: ['d3', 'c2', 'b1', 'f5', 'g6', 'h7', 'd5', 'c6', 'b7', 'a8', 'f3', 'g2', 'h1']
            },
            {
                title: 'The Knight',
                description: "The knight moves in an 'L' shape: two squares in one direction (horizontally or vertically) and then one square perpendicular to that.",
                fen: '8/8/8/8/4N3/8/8/8 w - - 0 1',
                highlight: ['d2', 'f2', 'c3', 'g3', 'c5', 'g5', 'd6', 'f6']
            },
            {
                title: 'The Pawn',
                description: 'The pawn moves forward one square, but on its first move, it has the option to move two squares forward. Pawns capture diagonally one square forward.',
                fen: '8/8/8/8/4p3/3P4/8/8 w - - 0 1',
                highlight: ['d4', 'e3']
            }
        ]
    },
    {
        id: 'b2',
        title: 'Board Setup and Basic Rules',
        level: 'Beginner',
        description: 'Understand how to set up the board and the fundamental rules of the game.',
        type: 'interactive',
        content: [
            {
                title: 'Initial Board Setup',
                description: 'This is the starting position for every chess game.',
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                highlight: [],
            },
            {
                title: 'Castling',
                description: 'A special move where the king moves two squares towards a rook and the rook moves to the square the king crossed. Both must not have moved.',
                fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
                highlight: ['e1', 'g1', 'c1', 'e8', 'g8', 'c8'],
            },
            {
                title: 'En Passant',
                description: "A special pawn capture. If a pawn moves two squares forward from its starting position and lands next to an opponent\'s pawn, the opponent\'s pawn can capture it as if it had only moved one square.",
                fen: '8/8/8/pP6/8/8/8/8 w - - 0 1',
                highlight: ['a5', 'b5', 'b6'],
            },
            {
                title: 'Pawn Promotion',
                description: "When a pawn reaches the opponent\'s back rank, it can be promoted to a queen, rook, bishop, or knight.",
                fen: '8/P7/8/8/8/8/k7/K7 w - - 0 1',
                highlight: ['a7', 'a8'],
            },
        ]
    },
    {
        id: 'b3',
        title: 'Check and Checkmate',
        level: 'Beginner',
        description: 'Master the concepts of check and the ultimate goal: checkmate.',
        type: 'interactive',
        content: [
            {
                title: 'What is Check?',
                description: "A king is in 'check' when it is under attack by an opponent\'s piece. The king must immediately get out of check.",
                fen: 'rnb1kbnr/pppp1ppp/8/4p3/5P1q/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3',
                highlight: ['h4', 'e1'],
            },
            {
                title: 'Escaping Check: Move the King',
                description: 'The simplest way to get out of check is to move the king to a square where it is no longer under attack.',
                fen: '8/8/8/8/4k3/8/5K2/4R3 b - - 0 1',
                highlight: ['e4', 'd5', 'f5', 'd3', 'f3'],
            },
            {
                title: 'Escaping Check: Block the Check',
                description: 'If there is a piece that can move between the king and the checking piece, you can block the check.',
                fen: 'rnb1kbnr/pppp1ppp/8/4p3/5P1q/8/PPPPP1PP/RNBQKBNR w KQkq - 1 3',
                highlight: ['g3'],
            },
            {
                title: 'Escaping Check: Capture the Piece',
                description: 'You can also get out of check by capturing the piece that is attacking your king.',
                fen: 'rn2kbnr/pp2pppp/8/q1pp4/3P4/2N1P3/PPP2PPP/R1BQK1NR w KQkq - 0 5',
                highlight: ['a5', 'c3'],
            },
            {
                title: 'What is Checkmate?',
                description: "Checkmate, or 'mate', is when a king is in check and has no legal moves to escape. This ends the game, and the player who delivered the checkmate wins.",
                fen: 'R7/8/8/8/8/8/k7/K5r1 w - - 1 1',
                highlight: ['g1', 'a1'],
            },
            {
                title: 'Checkmate Example: Queen and King',
                description: "A common checkmate pattern is using a queen and king to corner the opponent\'s king on the edge of the board.",
                fen: '8/8/8/8/8/K7/8/k1Q5 w - - 0 1',
                highlight: ['c1', 'a1', 'b1', 'a2', 'b2'],
            },
        ]
    },

    // Intermediate Tutorials
    {
        id: 'i1',
        title: 'Opening Principles',
        level: 'Intermediate',
        description: 'Grasp the core principles of a strong opening: control the center, develop your pieces, and king safety.',
        type: 'interactive',
        content: [
            {
                title: 'Control the Center',
                description: 'The player who controls the center of the board can more easily move their pieces to any part of the board and restrict their opponent.',
                fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
                highlight: ['e4', 'd4', 'e5', 'd5'],
            },
            {
                title: 'Develop Your Pieces',
                description: 'Move your pieces from their starting squares to more active squares where they can control the board and participate in the game.',
                fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
                highlight: ['f3', 'c3', 'f6', 'c6'],
            },
            {
                title: 'King Safety',
                description: 'One of the most effective ways to secure your king is by castling. This moves your king away from the center and develops a rook.',
                fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
                highlight: ['g1', 'f1', 'g8', 'f8'],
            },
        ]
    },
    {
        id: 'i2',
        title: 'Tactics: Pins',
        level: 'Intermediate',
        description: 'Learn to identify and exploit pins to gain an advantage.',
        type: 'interactive',
        content: [
            {
                title: 'What is a Pin?',
                description: 'A pin is a tactic in which a piece is unable to move because doing so would expose a more valuable piece to attack.',
                fen: 'rnb1kbnr/pp3ppp/8/2p1p3/3p4/P2P4/1PP1PPPP/RNBQKBNR w KQkq - 0 5',
                highlight: ['d1','d4','d8'],
            },
            {
                title: 'Absolute Pin',
                description: 'An absolute pin is one where the pinned piece is protecting the king. The pinned piece is not allowed to move.',
                fen: '2kr3r/pp1n1ppp/2p1p3/3n4/3P4/P1N5/1P3PPP/R1BQR1K1 b - - 5 15',
                highlight: ['e1','e6','e8'],
            },
            {
                title: 'Relative Pin',
                description: 'A relative pin is one where the pinned piece is protecting another piece, but not the king. The pinned piece can legally move, but it may result in the loss of the piece it is protecting.',
                fen: 'r1bqr1k1/pp1n1ppp/2p1pn2/3p4/2PP4/P1N2NP1/1P2PPBP/R2Q1RK1 b - - 2 9',
                highlight: ['g2','f2','c5'],
            },
        ]
    },
    {
        id: 'i3',
        title: 'Tactics: Forks',
        level: 'Intermediate',
        description: 'Understand how to use forks to attack multiple pieces at once.',
        type: 'interactive',
        content: [
            {
                title: 'What is a Fork?',
                description: 'A fork is a tactic where a single piece attacks two or more of the opponent\'s pieces at the same time.',
                fen: '8/8/8/3k4/8/3N4/8/K7 w - - 0 1',
                highlight: ['d3', 'c5', 'e5', 'b4', 'f4', 'b2', 'f2'],
            },
            {
                title: 'Knight Fork',
                description: 'The knight is the most common piece to execute a fork because of its unique L-shaped movement.',
                fen: 'r1b1k2r/pp3ppp/2n1p3/2p5/2B1P3/P1N5/1P3PPP/R2K2NR w KQkq - 0 1',
                highlight: ['c3', 'd5', 'b5'],
            },
            {
                title: 'Queen Fork',
                description: 'A queen can also be a powerful forking piece since it can attack in many directions at once.',
                fen: '6k1/5ppp/8/3Q4/8/8/8/K7 w - - 0 1',
                highlight: ['d5', 'g8', 'h7'],
            },
        ]
    },
    {
        id: 'i4',
        title: 'Tactics: Skewers',
        level: 'Intermediate',
        description: 'Discover the power of skewers to win material.',
        type: 'interactive',
        content: [
            {
                title: 'What is a Skewer?',
                description: 'A skewer is an attack on two pieces in a line, similar to a pin, but the more valuable piece is the one under direct attack.',
                fen: '8/k7/8/8/8/8/K7/4R3 w - - 0 1',
                highlight: ['e1','e8','a7'],
            },
            {
                title: 'Rook Skewer',
                description: 'When the king is forced to move out of the way, the rook can capture the less valuable piece behind it.',
                fen: '8/8/8/8/k7/8/8/K2R2r1 b - - 1 1',
                highlight: ['d1','g1','a1'],
            },
            {
                title: 'Bishop Skewer',
                description: 'A bishop can also be used to create a skewer, forcing a more valuable piece to move and exposing a less valuable piece to capture.',
                fen: '8/k7/8/8/8/8/K7/3B4 w - - 0 1',
                highlight: ['d1','h5','a6'],
            },
        ]
    },

    // Advanced Tutorials
    {
        id: 'a1',
        title: 'Advanced Strategy: Positional Play',
        level: 'Advanced',
        description: 'Dive deep into positional concepts like pawn structures, outposts, and weak squares.',
        type: 'interactive',
        content: [
            {
                title: 'Weak Pawn Structures',
                description: 'Pawn structures are the skeleton of a chess position. Weaknesses like isolated or doubled pawns can be long-term targets.',
                fen: '4k3/4p3/4p3/8/8/8/4P3/4K3 w - - 0 1',
                highlight: ['e6', 'e7'],
            },
            {
                title: 'Knight Outposts',
                description: "An outpost is a square on your opponent\'s side of the board that is supported by a pawn and cannot be easily attacked by your opponent\'s pawns. Knights are especially powerful on outposts.",
                fen: '8/5ppp/4p3/3n4/8/5P2/8/4K3 b - - 0 1',
                highlight: ['d5'],
            },
            {
                title: 'Weak Squares',
                description: "A weak square is a square that cannot be defended by a pawn. Controlling weak squares in your opponent\'s position can give you a significant advantage.",
                fen: '6k1/pp3ppp/8/8/8/1P4P1/P4P1P/6K1 w - - 0 1',
                highlight: ['d5', 'e5', 'f5', 'h5'],
            },
        ]
    },
    {
        id: 'a2',
        title: 'Endgame Techniques: Rook Endgames',
        level: 'Advanced',
        description: 'Master critical endgame techniques involving rooks and pawns.',
        type: 'interactive',
        content: [
            {
                title: 'Lucena Position: Building a Bridge',
                description: "The Lucena position is a famous winning rook endgame. The key is to 'build a bridge' with the rook to allow the king to move out and the pawn to promote.",
                fen: '3k4/4P3/3K4/8/8/8/1r6/8 w - - 0 1',
                highlight: ['e7', 'e8', 'd6', 'd7', 'd8'],
            },
            {
                title: 'Philidor Position: The Third Rank Defense',
                description: "The Philidor position is a key defensive technique in rook and pawn vs. rook endgames. By keeping the rook on the third rank, the defending side can prevent the attacking king from advancing and draw the game.",
                fen: '5k2/8/8/8/p1K5/1r6/8/R7 b - - 0 1',
                highlight: ['b3'],
            },
            {
                title: 'Cutting Off the King',
                description: "A crucial technique in rook endgames is using your rook to 'cut off' the opponent\'s king, restricting its movement and allowing your own king and pawn to advance.",
                fen: '8/8/8/8/k7/8/P7/K1R5 w - - 0 1',
                highlight: ['c1'],
            },
        ]
    }
];
