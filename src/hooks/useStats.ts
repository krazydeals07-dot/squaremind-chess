import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Stats } from '../types';

const useStats = (userId: string, statType: 'aiStats' | 'stats' | 'tournamentsStats') => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    };

    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setStats(userData[statType] || { gamesPlayed: 0, gamesWon: 0, gamesLost: 0 });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, statType]);

  return { stats, loading };
};

export default useStats;
