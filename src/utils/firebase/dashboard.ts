import { collection, getDocs, query, where, Timestamp, getCountFromServer } from "firebase/firestore";
import { db } from "../../firebase";

// 1. Daily User Growth
export const getDailyUserGrowth = async (days = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("createdAt", ">=", Timestamp.fromDate(startDate)));
    const querySnapshot = await getDocs(q);

    const growthData = new Map<string, number>();

    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const formattedDate = d.toISOString().split('T')[0];
        growthData.set(formattedDate, 0);
    }

    querySnapshot.docs.forEach(doc => {
        const user = doc.data();
        if (user.createdAt && user.createdAt.toDate) {
            const createdAtDate = user.createdAt.toDate();
            const formattedDate = createdAtDate.toISOString().split('T')[0];
            if (growthData.has(formattedDate)) {
                growthData.set(formattedDate, growthData.get(formattedDate)! + 1);
            }
        }
    });
    
    return Array.from(growthData, ([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// 2. Tournament Type Distribution
export const getTournamentTypeDistribution = async () => {
    const tournamentsRef = collection(db, "tournaments");
    const querySnapshot = await getDocs(tournamentsRef);
    
    const distribution = new Map<string, number>();
    querySnapshot.forEach(doc => {
        const type = doc.data().type || 'Unknown';
        distribution.set(type, (distribution.get(type) || 0) + 1);
    });
    
    return Array.from(distribution, ([name, value]) => ({ name, value }));
};

// 3. Top Players by Elo Rating (Reverted to client-side sorting for reliability)
export const getTopPlayersByElo = async (count = 5) => {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    
    const players = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.displayName || 'Anonymous',
            rating: data.stats?.rating || 1000
        };
    });

    // Sort on the client-side
    players.sort((a, b) => b.rating - a.rating);

    return players.slice(0, count);
};

// 4. Tournament Participation (Reverted to client-side sorting for reliability)
export const getTournamentParticipation = async (limit = 5) => {
    const tournamentsRef = collection(db, "tournaments");
    const querySnapshot = await getDocs(tournamentsRef);

    const participationData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            name: data.name || 'Unnamed Tournament',
            participants: Array.isArray(data.players) ? data.players.length : 0
        };
    });

    // Sort on the client-side
    participationData.sort((a, b) => b.participants - a.participants);

    return participationData.slice(0, limit);
};

// 5. Get Active Games Count
export const getActiveGamesCount = async () => {
    try {
        const gamesRef = collection(db, "games");
        // Corrected the query to look for 'active' status, which is now being set correctly.
        const q = query(gamesRef, where("status", "==", "active"));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (error) {
        console.error("Failed to get active games count:", error);
        return 0;
    }
};