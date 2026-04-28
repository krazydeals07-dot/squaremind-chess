
import React, { useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';

interface CustomChessboardProps {
  boardWidth: number;
  position: string;
  onSquareClick: (square: Square) => void;
  onPieceDrop?: (sourceSquare: Square, targetSquare: Square) => boolean;
  boardOrientation?: 'white' | 'black';
  isDraggablePiece?: (args: { piece: string; sourceSquare: Square }) => boolean;
  customSquareStyles?: React.CSSProperties;
  customDarkSquareStyle?: React.CSSProperties;
  customLightSquareStyle?: React.CSSProperties;
  lastMoveSquares?: { [key: string]: React.CSSProperties };
  optionSquares?: { [key: string]: React.CSSProperties };
}

const CustomChessboard: React.FC<CustomChessboardProps> = ({
  boardWidth,
  position,
  onSquareClick,
  onPieceDrop,
  boardOrientation = 'white',
  isDraggablePiece,
  lastMoveSquares = {},
  optionSquares = {},
}) => {
  const customPieces = useMemo(() => {
    const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    const components: { [key: string]: React.FC<{ squareWidth: number }> } = {};
    pieces.forEach((piece) => {
      components[piece] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/pieces/${piece}.svg)`,
            backgroundSize: '100%',
          }}
        />
      );
    });
    return components;
  }, []);

  return (
    <Chessboard
      boardWidth={boardWidth}
      position={position}
      onSquareClick={onSquareClick}
      onPieceDrop={onPieceDrop}
      boardOrientation={boardOrientation}
      isDraggablePiece={isDraggablePiece}
      customSquareStyles={{ ...optionSquares, ...lastMoveSquares }}
      customDarkSquareStyle={{ backgroundColor: '#8B5E3C' }}
      customLightSquareStyle={{ backgroundColor: '#EADDC4' }}
      customPieces={customPieces}
      customBoardStyle={{
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
};

export default CustomChessboard;
