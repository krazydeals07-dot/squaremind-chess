import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc, Firestore } from 'firebase/firestore';
import { db } from '../firebase';
import { GameData } from '../types';

const typedDb = db as Firestore;

export const useGameData = (gameId: string) => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const gameDocRef = doc(typedDb, 'games', gameId);

        const unsubscribe = onSnapshot(gameDocRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as GameData;

                if (data.status === 'aborted') {
                    setError('This game has been aborted.');
                    setLoading(false);
                    return;
                }

                // Check if player names need to be fetched locally
                const { white: whiteId, black: blackId } = data.players;
                const needsNames = whiteId && blackId && (!data.playerNames?.white || !data.playerNames?.black || data.playerNames.white.startsWith("Waiting"));

                if (needsNames) {
                    try {
                        const [whiteProfile, blackProfile] = await Promise.all([
                            getDoc(doc(typedDb, "users", whiteId)),
                            getDoc(doc(typedDb, "users", blackId))
                        ]);

                        const updatedData = {
                            ...data,
                            playerNames: {
                                white: (whiteProfile.exists() ? whiteProfile.data().displayName : null) || data.playerNames?.white || 'Player 1',
                                black: (blackProfile.exists() ? blackProfile.data().displayName : null) || data.playerNames?.black || 'Player 2',
                            }
                        };
                        setGameData(updatedData);
                    } catch (err) {
                        console.error("Error fetching player names:", err);
                        setGameData(data); // Set data even if name fetch fails
                    }
                } else {
                    setGameData(data);
                }
                
                setLoading(false);

            } else {
                setError("Game not found.");
                setLoading(false);
            }
        }, (err) => {
            console.error("Snapshot error:", err);
            setError("Failed to listen to game updates.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [gameId]);

    return { gameData, loading, error };
};