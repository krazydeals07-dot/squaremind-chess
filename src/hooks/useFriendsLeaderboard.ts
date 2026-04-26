import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, Stats } from '../types';

export interface LeaderboardEntry {
    uid: string;
    displayName: string | null;
    stats: Stats;
}

export const useFriendsLeaderboard = () => {
    const { currentUser } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) {
            setLeaderboard([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const userRef = doc(db, 'users', currentUser.uid);

        // Listen to the current user's document to get their friend list
        const unsubscribeUser = onSnapshot(userRef, (userDoc) => {
            if (!userDoc.exists()) {
                setLeaderboard([]);
                setLoading(false);
                return;
            }

            const userData = userDoc.data() as UserProfile;
            // Assuming userData.friends is an array of UIDs (strings)
            const friendIds = userData.friends || [];
            
            // Combine current user with friends. Ensure unique IDs and limit to 10 for 'in' query
            const allUserIds = [...new Set([currentUser.uid, ...friendIds])].slice(0, 10);

            if (allUserIds.length === 0) {
                setLeaderboard([]);
                setLoading(false);
                return;
            }

            // Create a query to get details of all users in the combined list
            const usersQuery = query(
                collection(db, 'users'),
                where('__name__', 'in', allUserIds)
            );

            // Listen to updates for all users in the leaderboard
            const unsubscribeLeaderboard = onSnapshot(usersQuery, (snapshot) => {
                const entries: LeaderboardEntry[] = snapshot.docs.map(doc => {
                    const data = doc.data() as UserProfile;
                    return {
                        uid: doc.id,
                        displayName: data.displayName || 'Unknown Player',
                        stats: data.stats || data.friendsStats || {
                            gamesPlayed: 0,
                            gamesWon: 0,
                            gamesLost: 0,
                            draws: 0,
                            winPercentage: 0,
                            elo: 1200
                        }
                    };
                });

                // Sort by ELO rating in descending order
                const sortedLeaderboard = entries.sort((a, b) => 
                    (b.stats.elo || 1200) - (a.stats.elo || 1200)
                );

                setLeaderboard(sortedLeaderboard);
                setLoading(false);
            }, (err) => {
                console.error("Error fetching leaderboard data:", err);
                setError("Failed to load leaderboard data.");
                setLoading(false);
            });

            return () => unsubscribeLeaderboard();
        }, (err) => {
            console.error("Error fetching current user data:", err);
            setError("Failed to load profile data.");
            setLoading(false);
        });

        return () => unsubscribeUser();

    }, [currentUser]);

    return { leaderboard, loading, error };
};