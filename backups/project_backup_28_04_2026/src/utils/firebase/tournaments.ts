import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc,
    Timestamp,
    writeBatch,
    arrayUnion,
    runTransaction,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types/user';

// Interfaces (some already exist)
export interface Player {
  uid: string;
  displayName: string;
  elo?: number; // Add elo for sorting
  photoURL?: string;
}

export interface Match {
  id: string;
  round: number;
  matchIndex: number; // Added to help Cloud Function progression
  player1: Player | null;
  player2: Player | null;
  status: 'pending' | 'ongoing' | 'completed' | 'waiting' | 'active';
  winnerId?: string | null;
  gameId?: string;
  nextMatchId?: string | null; // Added for deterministic progression
  nextMatchSlot?: 'player1' | 'player2' | null; // Added for deterministic progression
}

export interface Tournament {
    id: string;
    name: string;
    description?: string;
    type: 'Single Elimination' | 'Double Elimination' | 'Round Robin' | 'Swiss' | 'Knockout';
    status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled';
    players: Player[];
    matches: Record<string, Match>; // Map structure for O(1) access
    winner?: Player | null;
    createdAt?: Timestamp;
    startDate?: Timestamp | Date;
    endDate?: Timestamp | Date;
    entryFee?: number;
    participantCount?: number; // Already there, good.
    reward?: string;
    maxPlayers?: number | null;
    timeControl?: string;
    autoPairing?: boolean;
    autoStartNextRound?: boolean;
    currentRound?: number;
    totalRounds?: number; // Added to store total rounds
    matchesOngoing?: number;
    matchesCompleted?: number;
}

// Get Real-time updates for tournaments
export const getTournamentsRT = (
  onUpdate: (tournaments: Tournament[]) => void,
  onError: (error: Error) => void
) => {
  const tournamentsCollection = collection(db, 'tournaments');
  const unsubscribe = onSnapshot(tournamentsCollection,
    (snapshot) => {
      const tournaments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to JS Dates
          startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
          matches: data.matches || {},
        } as Tournament;
      });
      onUpdate(tournaments);
    },
    (error) => {
      console.error("Error fetching tournaments: ", error);
      onError(error);
    }
  );
  return unsubscribe;
};

// Get a single tournament document
export const getTournamentDoc = async (id: string): Promise<Tournament | null> => {
    const docRef = doc(db, 'tournaments', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            players: data.players || [],
            matches: data.matches || {},
        } as Tournament;
    }
    return null;
};


// Create a new tournament
export const createTournament = async (tournamentData: Omit<Tournament, 'id'>) => {
    const tournamentsCollection = collection(db, 'tournaments');
    await addDoc(tournamentsCollection, tournamentData);
};

// Create a new tournament with a specific ID
export const createTournamentWithId = async (id: string, tournamentData: Omit<Tournament, 'id'>) => {
    const tournamentRef = doc(db, 'tournaments', id);
    await setDoc(tournamentRef, tournamentData);
};

// Update an existing tournament
export const updateTournament = async (id: string, tournamentData: Partial<Omit<Tournament, 'id'>>) => {
    const tournamentRef = doc(db, 'tournaments', id);
    await updateDoc(tournamentRef, tournamentData);
};

// Delete a tournament
export const deleteTournament = async (id: string) => {
    const tournamentRef = doc(db, 'tournaments', id);
    await deleteDoc(tournamentRef);
};


// Simple shuffle function
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate bracket for a tournament
export const generateBracket = async (id: string) => {
    const tournament = await getTournamentDoc(id);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
        throw new Error('Tournament must be in "upcoming" or "registration" status to start.');
    }
    if (tournament.players.length < 2) {
        throw new Error('Tournament needs at least 2 players to start.');
    }

    const players = shuffleArray([...tournament.players]);
    const playerCount = players.length;
    
    // Calculate total rounds needed (2^rounds >= playerCount)
    const totalRounds = Math.ceil(Math.log2(playerCount));
    const totalSlots = Math.pow(2, totalRounds);
    
    const allMatches: Record<string, Match> = {};
    
    // Generate the complete empty structure for all rounds (Map based)
    let matchesInRoundCount = totalSlots / 2;
    for (let round = 1; round <= totalRounds; round++) {
        for (let i = 0; i < matchesInRoundCount; i++) {
            const matchId = `r${round}m${i + 1}`;
            
            // Pre-calculate next match progression for Cloud Function use
            let nextMatchId = null;
            let nextMatchSlot = null;
            
            if (round < totalRounds) {
                const nextRound = round + 1;
                const nextMatchIndex = Math.floor(i / 2);
                nextMatchId = `r${nextRound}m${nextMatchIndex + 1}`;
                nextMatchSlot = i % 2 === 0 ? 'player1' : 'player2';
            }

            allMatches[matchId] = {
                id: matchId,
                round: round,
                matchIndex: i,
                player1: null,
                player2: null,
                status: 'waiting',
                winnerId: null,
                nextMatchId,
                nextMatchSlot: nextMatchSlot as 'player1' | 'player2' | null
            };
        }
        matchesInRoundCount /= 2;
    }

    // Populate Round 1 with players and handle Byes immediately
    for (let i = 0; i < totalSlots; i += 2) {
        const matchIndex = i / 2;
        const matchId = `r1m${matchIndex + 1}`;
        const match = allMatches[matchId];
        
        const p1 = players[i] || null;
        const p2 = players[i + 1] || null;

        match.player1 = p1;
        match.player2 = p2;

        if (p1 && p2) {
            match.status = 'pending';
        } else if (p1 && !p2) {
            // Bye logic: Player 1 wins automatically and is promoted
            match.status = 'completed';
            match.winnerId = p1.uid;
            
            if (match.nextMatchId) {
                const nextMatch = allMatches[match.nextMatchId];
                if (nextMatch && match.nextMatchSlot) {
                    nextMatch[match.nextMatchSlot] = p1;
                }
            }
        } else if (!p1 && !p2) {
            match.status = 'completed'; 
        }
    }

    await updateTournament(id, {
        matches: allMatches,
        status: 'ongoing',
        startDate: new Date(),
        currentRound: 1,
        totalRounds: totalRounds
    });
};

export const addPlayerToTournament = async (tournamentId: string, player: Player) => {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournament = await getTournamentDoc(tournamentId);

    if (!tournament) throw new Error('Tournament not found');

    if (tournament.players.some(p => p.uid === player.uid)) {
        throw new Error('Player is already registered in this tournament.');
    }

    if (tournament.maxPlayers && tournament.players.length >= tournament.maxPlayers) {
        throw new Error('Tournament is full.');
    }

    await updateDoc(tournamentRef, {
        players: arrayUnion(player)
    });
};

export const updateMatch = async (tournamentId: string, matchId: string, winnerId: string) => {
    try {
        const tournament = await getTournamentDoc(tournamentId);
        if (!tournament) throw new Error("Tournament not found");

        const tournamentRef = doc(db, 'tournaments', tournamentId);

        // Map based lookup
        if (!tournament.matches[matchId]) throw new Error(`Match ${matchId} not found`);

        const updatePath = `matches.${matchId}`;
        await updateDoc(tournamentRef, {
            [`${updatePath}.status`]: 'completed',
            [`${updatePath}.winnerId`]: winnerId
        });

        // Trigger manual check for progression if needed
        await generateNextRound(tournamentId);
    } catch (error) {
        console.error("Error updating match:", error);
        throw error;
    }
};

const recordDailyWinner = async (tournamentId: string, tournamentName: string, winner: Player) => {
    if (!winner) return;

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const newWinnerRecord = {
        tournamentId: tournamentId,
        tournamentName: tournamentName,
        date: today,
        winners: [
            {
                rank: 1,
                name: winner.displayName,
                prize: 'Champion', // Placeholder prize
                uid: winner.uid
            }
        ]
    };

    const dailyWinnersCol = collection(db, 'dailyWinners');

    try {
        // Create a new document in the `dailyWinners` collection
        await addDoc(dailyWinnersCol, newWinnerRecord);

        // Also, update the user's stats (e.g., daily streak)
        const userRef = doc(db, 'users', winner.uid);
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                return;
            }
            const currentStreak = userDoc.data().stats?.dailyTournamentStreak || 0;
            transaction.update(userRef, { 'stats.dailyTournamentStreak': currentStreak + 1 });
        });

    } catch (error) {
        console.error("Failed to record daily winner:", error);
    }
};

const resetDailyKnockoutTournament = async () => {
    const tournamentRef = doc(db, 'tournaments', 'daily-knockout');
    await updateDoc(tournamentRef, {
        players: [],
        matches: {},
        status: 'ongoing',
        winner: null,
        startDate: null,
        endDate: null,
    });
}

export const generateNextRound = async (tournamentId: string) => {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(tournamentRef);
        if (!docSnap.exists()) throw new Error("Tournament not found");
        
        const tournament = docSnap.data() as Tournament;
        if (tournament.status !== 'ongoing') return;

        const allMatches = Object.values(tournament.matches || {});
        const currentRound = tournament.currentRound || Math.max(1, ...allMatches.map(m => m.round));
        const currentRoundMatches = allMatches.filter(m => m.round === currentRound);

        // All matches in current round must be completed
        if (currentRoundMatches.length === 0 || !currentRoundMatches.every(m => m.status === 'completed')) {
            return;
        }

        const winners = currentRoundMatches
            .map(m => m.winnerId ? tournament.players.find(p => p.uid === m.winnerId) : null)
            .filter((p): p is Player => p !== null && p !== undefined);

        if (winners.length === 1) {
            // Champion found
            if (tournamentId === 'daily-knockout') {
                await recordDailyWinner(tournamentId, tournament.name, winners[0]);
                await resetDailyKnockoutTournament();
            } else {
                transaction.update(tournamentRef, {
                    winner: winners[0],
                    status: 'completed',
                    endDate: Timestamp.now(),
                });
            }
            return;
        }

        if (winners.length === 0) return;

        // Progress round tracking
        const nextRound = currentRound + 1;
        transaction.update(tournamentRef, { currentRound: nextRound });
    });
};

export const resetBracket = async (tournamentId: string) => {
    try {
        const batch = writeBatch(db);
        
        // 1. Find all associated games in 'games' collection where tournamentId matches
        const gamesRef = collection(db, 'games');
        const q = query(gamesRef, where('tournamentId', '==', tournamentId));
        const gamesSnapshot = await getDocs(q);
        
        // 2. Add each game document update to the batch to set status to 'ended'
        gamesSnapshot.forEach((gameDoc) => {
            batch.update(gameDoc.ref, { 
                status: 'ended',
                reason: 'tournament_reset',
                lastMove: Timestamp.now()
            });
        });

        // 3. Add the tournament document update to the batch for a clean slate
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        batch.update(tournamentRef, {
            players: [],
            matches: {},
            status: 'upcoming',
            winner: null,
            startDate: null,
            endDate: null,
            currentRound: 1,
            matchesOngoing: 0,
            matchesCompleted: 0,
            bracket: null
        });

        // 4. Commit the batch write atomic operation
        await batch.commit();
        console.log(`Tournament ${tournamentId} and all associated games have been reset successfully.`);
    } catch (error) {
        console.error("Error resetting tournament bracket: ", error);
        throw error;
    }
};