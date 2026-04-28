import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, getDoc, updateDoc, addDoc, serverTimestamp, query, where, getDocs, onSnapshot, setDoc, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { Tournament, Player, Round, Game, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useTournament = (tournamentId: string) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [rounds, setRounds] = useState<Round[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeGameId, setActiveGameId] = useState<string | null>(null);

    useEffect(() => {
        if (!tournamentId || !currentUser) return;

        const tournamentRef = doc(db, 'tournaments', tournamentId);
        const unsubscribeTournament = onSnapshot(tournamentRef, (docSnap) => {
            if (docSnap.exists()) {
                setTournament({ id: docSnap.id, ...docSnap.data() } as Tournament);
            } else {
                setError('Tournament not found.');
            }
            setLoading(false);
        });

        const playersQuery = query(collection(db, `tournaments/${tournamentId}/players`));
        const unsubscribePlayers = onSnapshot(playersQuery, (snap) => {
            const playersData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
            setPlayers(playersData);
        });

        const roundsQuery = query(collection(db, `tournaments/${tournamentId}/rounds`));
        const unsubscribeRounds = onSnapshot(roundsQuery, (snap) => {
            const roundsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Round)).sort((a, b) => a.roundNumber - b.roundNumber);
            setRounds(roundsData);
        });

        // Listen for user's active game, but ignore finished ones to avoid "stale" state
        const gamesQuery = query(
            collection(db, 'games'),
            where('tournamentId', '==', tournamentId),
            where('status', '==', 'active')
        );

        const unsubscribeGames = onSnapshot(gamesQuery, (snap) => {
            const userGame = snap.docs.find(doc => {
                const data = doc.data();
                return (data.players.white === currentUser.uid || data.players.black === currentUser.uid);
            });
            
            if (userGame) {
                setActiveGameId(userGame.id);
            } else {
                setActiveGameId(null);
            }
        });

        return () => {
            unsubscribeTournament();
            unsubscribePlayers();
            unsubscribeRounds();
            unsubscribeGames();
        };
    }, [tournamentId, currentUser]);

    const resetStuckGame = async () => {
        if (!currentUser || !tournamentId) return;
        setActiveGameId(null);
        // Force cleanup of current game ID in user profile
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { currentGameId: null });
    };

    const joinTournament = async () => {
        if (!currentUser || !tournament) return;

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Check user profile
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) throw new Error("User profile not found.");
                const userData = userSnap.data() as User;

                if (!userData.displayName || !userData.photoURL || !userData.email) {
                    throw new Error("Please complete your profile details before joining.");
                }

                // 2. Check current registration status
                const playerRef = doc(db, `tournaments/${tournamentId}/players`, currentUser.uid);
                const playerSnap = await transaction.get(playerRef);
                const isRegistered = playerSnap.exists();

                // If already in a game, just return
                if (isRegistered && playerSnap.data().status === 'in-game') {
                    return;
                }

                // 3. Find a waiting opponent
                const playersColRef = collection(db, `tournaments/${tournamentId}/players`);
                const waitingQuery = query(playersColRef, where('status', '==', 'waiting'));
                const waitingSnap = await getDocs(waitingQuery);
                
                const waitingOpponentDoc = waitingSnap.docs.find(d => d.id !== currentUser.uid);

                if (waitingOpponentDoc) {
                    // AUTO-PAIRING: Found someone waiting
                    const opponentData = waitingOpponentDoc.data();
                    const gameId = `${tournamentId}_${waitingOpponentDoc.id}_${currentUser.uid}_${Date.now()}`;
                    const gameRef = doc(db, 'games', gameId);

                    const gameData = {
                        players: { white: waitingOpponentDoc.id, black: currentUser.uid },
                        playerNames: { white: opponentData.name, black: userData.displayName },
                        status: 'active',
                        createdAt: serverTimestamp(),
                        lastMove: serverTimestamp(),
                        tournamentId: tournamentId,
                        round: 1, // Assume round 1 for auto-pairing
                        groupId: 0,
                        timers: { w: 480, b: 480 },
                        moveTimerLimit: 60,
                        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                        moves: [],
                        chat: []
                    };

                    // Create the game document
                    transaction.set(gameRef, gameData);

                    // Update current player (Black)
                    transaction.set(playerRef, {
                        id: currentUser.uid,
                        name: userData.displayName,
                        photoURL: userData.photoURL,
                        elo: userData.stats?.elo || 1200,
                        joinedAt: serverTimestamp(),
                        status: 'in-game',
                        currentGameId: gameId,
                        currentRound: 1
                    }, { merge: true });

                    // Update opponent (White)
                    transaction.update(waitingOpponentDoc.ref, {
                        status: 'in-game',
                        currentGameId: gameId
                    });

                    // Update user profiles
                    transaction.update(userRef, { currentGameId: gameId });
                    transaction.update(doc(db, 'users', waitingOpponentDoc.id), { currentGameId: gameId });

                } else {
                    // NO OPPONENT: Set current player to waiting
                    transaction.set(playerRef, {
                        id: currentUser.uid,
                        name: userData.displayName,
                        photoURL: userData.photoURL,
                        elo: userData.stats?.elo || 1200,
                        joinedAt: serverTimestamp(),
                        status: 'waiting',
                        currentRound: 1
                    }, { merge: true });
                }
            });
        } catch (err: any) {
            console.error("Error joining tournament: ", err);
            setError(err.message || "Failed to join tournament.");
        }
    };

    const startTournament = async () => {
        if (!tournament || tournament.status !== 'pending' || players.length < 2) return;

        try {
            const tournamentRef = doc(db, 'tournaments', tournamentId);
            await updateDoc(tournamentRef, { status: 'ongoing' });
            
            const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
            for (let g = 0; g < 10; g++) {
                const groupPlayers = shuffledPlayers.slice(g * 128, (g + 1) * 128);
                if (groupPlayers.length > 0) {
                    await createRound(1, groupPlayers, g);
                }
            }
        } catch (err) {
            console.error("Error starting tournament: ", err);
            setError("Failed to start tournament.");
        }
    };

    const createRound = async (roundNumber: number, roundPlayers: Player[], groupId: number) => {
        const pairings = createPairings(roundPlayers);
        const roundData: Omit<Round, 'id'> = {
            roundNumber,
            groupId,
            pairings: [],
            status: 'ongoing',
            createdAt: serverTimestamp(),
        };
        const roundRef = await addDoc(collection(db, `tournaments/${tournamentId}/rounds`), roundData);

        const gamesPromises = pairings.map(async (pair) => {
            // 2. Generate a unique ID using Timestamp to prevent stale board collisions
            const uniqueMatchId = `${tournamentId}_${pair[0].id}_${pair[1].id}_${Date.now()}`;
            
            const gameData = {
                players: { white: pair[0].id, black: pair[1].id },
                playerNames: { white: pair[0].name, black: pair[1].name },
                status: 'active',
                createdAt: serverTimestamp(),
                lastMove: serverTimestamp(),
                tournamentId: tournamentId,
                round: roundNumber,
                groupId: groupId,
                timers: { w: 480, b: 480 },
                moveTimerLimit: 60,
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                moves: [],
                chat: []
            };
            
            // Use setDoc with a unique ID instead of addDoc
            await setDoc(doc(db, 'games', uniqueMatchId), gameData);
            
            // Update both players' profile with this fresh ID
            const whiteRef = doc(db, 'users', pair[0].id);
            const blackRef = doc(db, 'users', pair[1].id);
            await updateDoc(whiteRef, { currentGameId: uniqueMatchId });
            await updateDoc(blackRef, { currentGameId: uniqueMatchId });

            return { white: pair[0].id, black: pair[1].id, gameId: uniqueMatchId };
        });

        const gamePairings = await Promise.all(gamesPromises);
        await updateDoc(roundRef, { pairings: gamePairings });
    };

    const createPairings = (currentPlayers: Player[]): [Player, Player][] => {
        const pairings: [Player, Player][] = [];
        for (let i = 0; i < currentPlayers.length; i += 2) {
            if (currentPlayers[i + 1]) {
                pairings.push([currentPlayers[i], currentPlayers[i + 1]]);
            }
        }
        return pairings;
    };

    const handleGameEnd = async (gameId: string, winnerId: string, groupId: number, roundNumber: number) => {
        if (roundNumber === 7) {
            await addDoc(collection(db, 'dailyWinners'), {
                tournamentId,
                winnerId,
                date: serverTimestamp(),
                groupId
            });
        }
    };

    const spectateGame = (gameId: string) => {
        navigate(`/tournament/game/${gameId}`);
    };

    return { 
        tournament, 
        players, 
        rounds, 
        loading, 
        error, 
        activeGameId, 
        startTournament, 
        joinTournament, 
        spectateGame,
        resetStuckGame,
        fetchTournamentData: () => {} 
    };
};