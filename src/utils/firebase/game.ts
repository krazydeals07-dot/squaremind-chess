
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';

interface Move {
    from: string;
    to: string;
    promotion?: string;
}

export const makeMoveInGame = async (gameId: string, move: Move) => {
    const gameRef = doc(db, "games", gameId);
    const gameDoc = await getDoc(gameRef);

    if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        // Basic validation - more complex logic (like whose turn it is) should be handled in a backend or secure environment
        await updateDoc(gameRef, {
            moves: arrayUnion(move),
            fen: gameData.fen // This needs to be updated based on the move, requires a chess engine
        });
    } else {
        throw new Error("Game not found");
    }
};