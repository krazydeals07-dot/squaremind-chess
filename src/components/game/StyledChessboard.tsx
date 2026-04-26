import React from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';

const pieceComponents: { [key: string]: string } = {
    wK: '♚', wQ: '♛', wR: '♜', wB: '♝', wN: '♞', wP: '♟︎',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟︎'
};

const pieceRenderer = (piece: string, color: string, isBlack: boolean = false) => ({ squareWidth }: { squareWidth: number }) => (
    <div style={{
        width: squareWidth,
        height: squareWidth,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: squareWidth * 0.85,
        color: color,
        textShadow: isBlack
            ? '-1px -1px 0 #ddd, 1px -1px 0 #ddd, -1px 1px 0 #ddd, 1px 1px 0 #ddd, -2px -2px 8px rgba(0,0,0,0.5)'
            : '0px 2px 5px rgba(0, 0, 0, 0.6)',
    }}>
        {piece}
    </div>
);

const customPieces = {
    wK: pieceRenderer(pieceComponents.wK, '#FFFFFF'),
    wQ: pieceRenderer(pieceComponents.wQ, '#FFFFFF'),
    wR: pieceRenderer(pieceComponents.wR, '#FFFFFF'),
    wB: pieceRenderer(pieceComponents.wB, '#FFFFFF'),
    wN: pieceRenderer(pieceComponents.wN, '#FFFFFF'),
    wP: pieceRenderer(pieceComponents.wP, '#FFFFFF'),
    bK: pieceRenderer(pieceComponents.bK, '#1A1A1A', true),
    bQ: pieceRenderer(pieceComponents.bQ, '#1A1A1A', true),
    bR: pieceRenderer(pieceComponents.bR, '#1A1A1A', true),
    bB: pieceRenderer(pieceComponents.bB, '#1A1A1A', true),
    bN: pieceRenderer(pieceComponents.bN, '#1A1A1A', true),
    bP: pieceRenderer(pieceComponents.bP, '#1A1A1A', true),
};

interface StyledChessboardProps {
    position: string;
    onPieceDrop?: (sourceSquare: Square, targetSquare: Square, piece: string) => boolean;
    onSquareClick?: (square: Square) => void;
    onSquareRightClick?: (square: Square) => void;
    boardWidth?: number;
    customSquareStyles?: { [key: string]: React.CSSProperties };
    boardOrientation?: 'white' | 'black';
    isDraggablePiece?: (args: { piece: string, square: Square }) => boolean;
    arePiecesDraggable?: boolean;
}

const StyledChessboard: React.FC<StyledChessboardProps> = (props) => {
    const { 
        position, 
        onPieceDrop, 
        onSquareClick, 
        onSquareRightClick, 
        boardWidth, 
        customSquareStyles, 
        boardOrientation, 
        isDraggablePiece, 
        arePiecesDraggable 
    } = props;

    return (
        <Chessboard
            id="StyledChessboard"
            position={position}
            onPieceDrop={onPieceDrop}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            boardWidth={boardWidth}
            customSquareStyles={customSquareStyles}
            boardOrientation={boardOrientation}
            isDraggablePiece={isDraggablePiece}
            arePiecesDraggable={arePiecesDraggable}
            customPieces={customPieces}
            customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#6B3F23' }}
            customLightSquareStyle={{ backgroundColor: '#EAD8C3' }}
        />
    );
};

export default StyledChessboard;