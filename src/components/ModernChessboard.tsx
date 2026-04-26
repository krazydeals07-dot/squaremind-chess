
import { Chessboard } from 'react-chessboard';
import type { ChessboardProps } from 'react-chessboard';
import '../styles/modern.css';

// This component wraps the react-chessboard component with the desired modern theme.
// It ensures a consistent look and feel across all chessboards in the application.
export const ModernChessboard = (props: ChessboardProps) => {
    return (
        <Chessboard
            {...props}
            customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
            }}
            customDarkSquareStyle={{ backgroundColor: '#B58863' }}
            customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
        />
    );
};
