import { Box, Typography, Stack } from '@mui/material';
import { Piece, PieceSymbol } from 'chess.js';

const pieceSymbols: { [key: string]: string } = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
  P: '♟', N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚'
};

interface CapturedPiecesProps {
  title: string;
  pieces: Piece[];
  capturedPiecesColor: 'w' | 'b'; // The color of the pieces that will be in this box
  sx?: any;  
}

const CapturedPieces = ({ title, pieces, capturedPiecesColor, sx }: CapturedPiecesProps) => {
  const pieceOrder: { [key in PieceSymbol]: number } = { q: 1, r: 2, b: 3, n: 4, p: 5, k: 0 };

  const sortedPieces = Array.isArray(pieces)
    ? [...pieces].sort((a, b) => pieceOrder[a.type] - pieceOrder[b.type])
    : [];

  // Determine the background color based on the designated color for the box
  const backgroundColor = capturedPiecesColor === 'b' ? '#E0E0E0' : '#424242';
  const textColor = capturedPiecesColor === 'b' ? '#424242' : '#E0E0E0';

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: 52, 
      background: backgroundColor, 
      borderRadius: '8px', 
      p: 1, 
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease',
      ...sx
    }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ height: '100%' }}>
        <Typography variant="caption" sx={{ color: textColor, fontStyle: 'italic', minWidth: '80px' }}>
          {title}
        </Typography>
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={0.5}>
          {sortedPieces.map((piece, index) => {
            const isWhite = piece.color === 'w';
            const symbol = pieceSymbols[piece.type];

            return (
              <Typography
                key={index}
                sx={{
                    fontSize: '24px', 
                    color: isWhite ? '#FFFFFF' : '#000000',
                    textShadow: isWhite ? '0 0 3px rgba(0,0,0,0.7)' : '0 0 3px rgba(255,255,255,0.7)',
                    lineHeight: 1
                }}
              >
                {symbol}
              </Typography>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
};

export default CapturedPieces;