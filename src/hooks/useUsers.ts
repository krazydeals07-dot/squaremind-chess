
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Stats } from '../types';

const useUsers = (userIds: string[] = []) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (userIds.length === 0) {
                // Fetch all users for a global leaderboard if no specific IDs are provided
                try {
                    const usersRef = collection(db, 'users');
                    // Order by ELO rating for the leaderboard
                    const q = query(usersRef, orderBy('stats.elo', 'desc'));
                    const querySnapshot = await getDocs(q);
                    const allUsers: UserProfile[] = [];
                    querySnapshot.forEach((doc) => {
                        allUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
                    });
                    setUsers(allUsers);
                } catch (e) {
                    setError('Failed to fetch users');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                // Fetch specific users by their IDs
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('__name__', 'in', userIds));
                    const querySnapshot = await getDocs(q);
                    const specificUsers: UserProfile[] = [];
                    querySnapshot.forEach((doc) => {
                        specificUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
                    });
                    // Sort by ELO rating in descending order
                    specificUsers.sort((a, b) => (b.stats?.elo ?? 1200) - (a.stats?.elo ?? 1200));
                    setUsers(specificUsers);
                } catch (e) {
                    setError('Failed to fetch user data');
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUsers();
    }, [JSON.stringify(userIds)]); // Re-run effect if userIds array changes

    return { users, loading, error };
};

export default useUsers;
