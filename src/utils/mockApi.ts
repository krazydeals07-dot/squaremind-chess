interface UserStats {
    wins: number;
    losses: number;
    draws: number;
}

// In-memory store for stats to simulate a backend
const statsStore: { [key: string]: { ai: UserStats, friend: UserStats } } = {};

const defaultStats = {
    wins: 0,
    losses: 0,
    draws: 0
};

const ensureUserStats = (userId: string) => {
    if (!statsStore[userId]) {
        statsStore[userId] = {
            ai: { wins: Math.floor(Math.random() * 20), losses: Math.floor(Math.random() * 10), draws: Math.floor(Math.random() * 5) },
            friend: { wins: Math.floor(Math.random() * 15), losses: Math.floor(Math.random() * 15), draws: Math.floor(Math.random() * 10) },
        };
    }
};


export const getAIStats = (userId: string): Promise<UserStats> => {
    console.log(`Fetching AI stats for user ${userId}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            ensureUserStats(userId);
            resolve(statsStore[userId].ai);
        }, 500);
    });
};

export const getFriendStats = (userId: string): Promise<UserStats> => {
    console.log(`Fetching Friend stats for user ${userId}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            ensureUserStats(userId);
            resolve(statsStore[userId].friend);
        }, 500);
    });
};

export const resetAllStats = (userId: string): Promise<{ ai: UserStats, friend: UserStats }> => {
    console.log(`Resetting all stats for user ${userId}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            statsStore[userId] = {
                ai: { ...defaultStats },
                friend: { ...defaultStats }
            };
            resolve(statsStore[userId]);
        }, 500);
    });
};