import { Chessboard as ReactChessboard, ChessboardProps } from 'react-chessboard';

// Custom theme for the chessboard to give it a more premium feel.
const customTheme = {
  light: { backgroundColor: '#f0d9b5' }, // A warm, wooden light square
  dark: { backgroundColor: '#b58863' }, // A rich, wooden dark square
  drop: { boxShadow: 'inset 0 0 1px 4px #f7b538' }, // A golden highlight for drop squares
  highlight: { backgroundColor: 'rgba(247, 181, 56, 0.4)' }, // A subtle highlight for legal moves
};

// Define the props for our custom Chessboard by extending the original ones
// We are adding our own `isDraggable` to control piece movement from the parent component.
interface CustomChessboardProps extends Omit<ChessboardProps, 'arePiecesDraggable'> {
    isDraggable: boolean;
}

// We are creating a wrapper around the original react-chessboard component.
// This allows us to enforce a consistent, beautiful design across the app
// and makes future customizations much easier.
export const Chessboard = (props: CustomChessboardProps) => {
    return (
        <div className="shadow-2xl rounded-lg overflow-hidden border-4 border-gray-700">
            <ReactChessboard
                {...props}
                arePiecesDraggable={props.isDraggable}
                customBoardTheme={customTheme}
            />
        </div>
    );
};
