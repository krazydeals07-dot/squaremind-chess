"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGameEnd = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.onGameEnd = functions.firestore
    .document("games/{gameId}")
    .onUpdate(async (change, context) => {
    const previousGameData = change.before.data();
    const newGameData = change.after.data();
    // Proceed only if the game has just finished
    if (newGameData.status !== "ended" && newGameData.status !== "gameOver") {
        return null;
    }
    // And if it wasn't already finished
    if (previousGameData.status === "ended" || previousGameData.status === "gameOver") {
        return null;
    }
    const { gameId } = context.params;
    const { winner: winnerId, tournamentId, matchId: providedMatchId, players, result } = newGameData;
    // Determine winner and loser from game data
    const finalWinnerId = winnerId || (result === null || result === void 0 ? void 0 : result.winnerId);
    const isDraw = (result === null || result === void 0 ? void 0 : result.resultType) === "draw" || finalWinnerId === "draw";
    if (isDraw) {
        functions.logger.info(`Game ${gameId} is a draw. No stat updates.`);
        // Optional: Handle draw stats if needed
        return null;
    }
    if (!finalWinnerId) {
        functions.logger.error(`No winner identified for ended game ${gameId}.`);
        return null;
    }
    const whiteId = players === null || players === void 0 ? void 0 : players.white;
    const blackId = players === null || players === void 0 ? void 0 : players.black;
    if (!whiteId || !blackId) {
        functions.logger.error(`Player IDs missing in game document ${gameId}`);
        return null;
    }
    const loserId = whiteId === finalWinnerId ? blackId : whiteId;
    const batch = db.batch();
    const winnerRef = db.collection("users").doc(finalWinnerId);
    const loserRef = db.collection("users").doc(loserId);
    const isTournamentGame = tournamentId && providedMatchId;
    if (isTournamentGame) {
        // --- TOURNAMENT GAME STATS ---
        functions.logger.info(`[Tournament ${tournamentId}] Updating TOURNAMENT stats for game ${gameId}.`);
        batch.update(winnerRef, {
            "tournamentsStats.gamesWon": admin.firestore.FieldValue.increment(1),
            "tournamentsStats.gamesPlayed": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(15),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        batch.update(loserRef, {
            "tournamentsStats.gamesLost": admin.firestore.FieldValue.increment(1),
            "tournamentsStats.gamesPlayed": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(-10),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    else {
        // --- REGULAR "Play with Friends" GAME STATS ---
        functions.logger.info(`Updating REGULAR stats for game ${gameId}.`);
        batch.update(winnerRef, {
            "stats.gamesWon": admin.firestore.FieldValue.increment(1),
            "stats.gamesPlayed": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(10),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        batch.update(loserRef, {
            "stats.gamesLost": admin.firestore.FieldValue.increment(1),
            "stats.gamesPlayed": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(-5),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    // Commit the stat updates
    try {
        await batch.commit();
        functions.logger.info(`Stats updated successfully for game ${gameId}. Winner: ${finalWinnerId}, Loser: ${loserId}.`);
    }
    catch (error) {
        functions.logger.error(`Error committing stats batch for game ${gameId}:`, error);
        return; // Exit if we can't update stats
    }
    // --- TOURNAMENT PROGRESSION LOGIC (only if it's a tournament game) ---
    if (isTournamentGame) {
        functions.logger.info(`[Tournament ${tournamentId}] Continuing with progression logic for match ${providedMatchId}.`);
        const tournamentRef = db.collection("tournaments").doc(tournamentId);
        try {
            await db.runTransaction(async (transaction) => {
                var _a, _b;
                const tournamentDoc = await transaction.get(tournamentRef);
                if (!tournamentDoc.exists) {
                    throw new Error(`Tournament ${tournamentId} not found.`);
                }
                const tournamentData = tournamentDoc.data();
                const matches = tournamentData.matches || {};
                const currentMatch = matches[providedMatchId];
                if (!currentMatch) {
                    throw new Error(`Match ${providedMatchId} not found in tournament ${tournamentId}.`);
                }
                const winnerPlayer = ((_a = tournamentData.players) === null || _a === void 0 ? void 0 : _a.find((p) => p.uid === finalWinnerId)) ||
                    (((_b = currentMatch.player1) === null || _b === void 0 ? void 0 : _b.uid) === finalWinnerId ? currentMatch.player1 : currentMatch.player2);
                const tournamentUpdates = {
                    [`matches.${providedMatchId}.winnerId`]: finalWinnerId,
                    [`matches.${providedMatchId}.status`]: "completed",
                    matchesCompleted: admin.firestore.FieldValue.increment(1),
                    matchesOngoing: admin.firestore.FieldValue.increment(-1)
                };
                const nextMatchId = currentMatch.nextMatchId;
                if (!nextMatchId) {
                    // This was the final match
                    tournamentUpdates.status = "completed";
                    tournamentUpdates.winner = winnerPlayer || { uid: finalWinnerId, displayName: "Winner" };
                    tournamentUpdates.endDate = admin.firestore.FieldValue.serverTimestamp();
                    transaction.update(tournamentRef, tournamentUpdates);
                    functions.logger.info(`[Tournament ${tournamentId}] Champion declared: ${finalWinnerId}`);
                }
                else {
                    // Promote winner to the next match
                    const nextMatchData = matches[nextMatchId];
                    if (!nextMatchData) {
                        throw new Error(`Next match ${nextMatchId} missing from tournament ${tournamentId}.`);
                    }
                    const playerSlot = currentMatch.nextMatchSlot || "player1";
                    tournamentUpdates[`matches.${nextMatchId}.${playerSlot}`] = winnerPlayer || { uid: finalWinnerId, displayName: "Winner" };
                    // Check if the next match is now ready to start
                    const updatedNextMatchData = Object.assign(Object.assign({}, nextMatchData), { [playerSlot]: winnerPlayer });
                    const p1 = updatedNextMatchData.player1;
                    const p2 = updatedNextMatchData.player2;
                    if (p1 && p2 && p1.uid && p2.uid) {
                        // Create a new game for the next match
                        const newGameRef = db.collection("games").doc();
                        const newGame = {
                            players: { white: p1.uid, black: p2.uid },
                            playerNames: { white: p1.displayName, black: p2.displayName },
                            status: "active",
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                            moves: [],
                            tournamentId: tournamentId,
                            matchId: nextMatchId,
                            gameId: newGameRef.id
                        };
                        transaction.set(newGameRef, newGame);
                        tournamentUpdates[`matches.${nextMatchId}.gameId`] = newGameRef.id;
                        tournamentUpdates[`matches.${nextMatchId}.status`] = "active";
                    }
                    transaction.update(tournamentRef, tournamentUpdates);
                }
            });
        }
        catch (error) {
            functions.logger.error(`[Tournament ${tournamentId}] Transaction error in onGameEnd:`, error);
        }
    }
    return null;
});
//# sourceMappingURL=index.js.map