interface MoveHistoryProps {
    moves: any[]; // Accepting any array type to be extremely defensive.
}

/**
 * A robust function to get a displayable string from a move, 
 * regardless of its underlying data structure (string, object, etc.).
 * This prevents the UI from crashing due to legacy or corrupted data.
 */
const getMoveText = (move: any): string => {
    // Case 1: The move is a simple string (e.g., "Nf3"). This is the ideal case.
    if (typeof move === 'string') {
        return move;
    }
    // Case 2: The move is an object and has a `san` property which is a string.
    if (move && typeof move.san === 'string') {
        return move.san;
    }
    // Fallback Case: If the data is in an unknown format (e.g., old object, null, undefined),
    // return a placeholder to avoid crashing the React render.
    return "..."; 
};


const MoveHistory = ({ moves }: MoveHistoryProps) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg w-full flex-grow">
            <h3 className="text-lg font-bold mb-3 text-white">Move History</h3>
            <div className="bg-gray-700 rounded p-2 h-48 overflow-y-auto">
                <ol className="space-y-1">
                    {moves.map((move, index) => {
                        const moveText = getMoveText(move);
                        const moveNumber = Math.floor(index / 2) + 1;
                        const isWhiteMove = index % 2 === 0;

                        return (
                            <li 
                                key={index} 
                                className={`font-mono text-sm px-2 py-1 rounded flex items-center ${isWhiteMove ? 'bg-gray-600' : 'bg-gray-500'}`}
                            >
                                <span className="text-gray-400 w-6 font-semibold">{isWhiteMove ? `${moveNumber}.` : ''}</span>
                                <span className="text-white">{moveText}</span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
};

export default MoveHistory;
