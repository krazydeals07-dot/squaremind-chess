import { UserProfile, Achievement, UnlockedAchievement, GameHistory } from './types.tsx';

const ALL_ACHIEVEMENTS: Achievement[] = [
    // AI Related Achievements
    { id: 'ai_first_win', name: 'First AI Win', description: 'Win your first game against the AI.' },
    { id: 'ai_veteran', name: 'AI Veteran', description: 'Play 10 games against the AI.' },
    { id: 'ai_master', name: 'AI Master', description: 'Win 25 games against the AI.' },

    // Friend Related Achievements (Examples)
    { id: 'friend_first_game', name: 'First Friendly Match', description: 'Play your first game with a friend.' },
    { id: 'social_butterfly', name: 'Social Butterfly', description: 'Play games with 5 different friends.' },

    // Tournament Related Achievements (Examples)
    { id: 'tourney_debut', name: 'Tournament Debut', description: 'Participate in your first tournament.' },
    { id: 'tourney_winner', name: 'Tournament Champion', description: 'Win a tournament.' },
];

// This function checks the user's profile against the list of all achievements
// and returns any new achievements that have been earned but not yet unlocked.
export const checkAndUnlockAchievements = (profile: UserProfile): Achievement[] => {
    // If profile is not fully loaded, exit early.
    if (!profile) return [];

    const newAchievements: Achievement[] = [];
    // Ensure unlockedAchievements is an array before mapping
    const unlockedIds = new Set((profile.unlockedAchievements || []).map(a => a.id));

    for (const ach of ALL_ACHIEVEMENTS) {
        if (unlockedIds.has(ach.id)) {
            continue; // Already unlocked, skip checking
        }

        let isUnlocked = false;
        // Provide default stats to prevent errors if they don't exist
        const aiStats = profile.aiStats || { gamesPlayed: 0, gamesWon: 0 };
        const friendsStats = profile.friendsStats || { gamesPlayed: 0, gamesWon: 0 };
        const tournamentsStats = profile.tournamentsStats || { gamesPlayed: 0, gamesWon: 0 };
        const gameHistory = profile.gameHistory || [];

        switch (ach.id) {
            // AI Achievements
            case 'ai_first_win':
                if (aiStats.gamesWon >= 1) isUnlocked = true;
                break;
            case 'ai_veteran':
                if (aiStats.gamesPlayed >= 10) isUnlocked = true;
                break;
            case 'ai_master':
                if (aiStats.gamesWon >= 25) isUnlocked = true;
                break;

            // Friend Achievements
            case 'friend_first_game':
                if (friendsStats.gamesPlayed >= 1) isUnlocked = true;
                break;
            case 'social_butterfly':
                const uniqueFriends = new Set(
                    gameHistory
                        .filter(g => g.gameType === 'Friend')
                        .map(g => g.opponent.uid)
                );
                if (uniqueFriends.size >= 5) isUnlocked = true;
                break;

            // Tournament Achievements
            case 'tourney_debut':
                if (tournamentsStats.gamesPlayed >= 1) isUnlocked = true;
                break;
            case 'tourney_winner':
                // This might need more specific logic, like a flag in the game history
                const wonTourney = gameHistory.some(g => g.gameType === 'Tournament' && g.result === 'Win');
                if (wonTourney) isUnlocked = true; 
                break;
        }

        if (isUnlocked) {
            newAchievements.push(ach);
        }
    }

    return newAchievements;
};