"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGameEnd = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
/**
 * This function triggers when a game document is updated.
 * It handles the tournament progression logic when a game ends.
 * Final synchronization of Cloud Function with Map-based match storage.
 */
exports.onGameEnd = functions.firestore
    .document("games/{gameId}")
    .onUpdate(async (change, context) => {
    const previousGameData = change.before.data();
    const newGameData = change.after.data();
    // Proceed only if the game status has just changed to 'ended'.
    if (newGameData.status !== "ended" || previousGameData.status === "ended") {
        return null;
    }
    const { gameId } = context.params;
    const { winner: winnerId, tournamentId, matchId: providedMatchId, players } = newGameData;
    // Validation for tournament match
    if (!tournamentId || !providedMatchId) {
        functions.logger.info(`Game ${gameId} is not a valid tournament match. Skipping logic.`);
        return null;
    }
    functions.logger.info(`[Tournament ${tournamentId}] Processing game end: ${gameId} for Match ${providedMatchId}`);
    // Handle Draw (No progression for now)
    if (winnerId === "draw") {
        functions.logger.info(`[Tournament ${tournamentId}] Game ${gameId} ended in a draw.`);
        return null;
    }
    if (!winnerId) {
        functions.logger.error(`[Tournament ${tournamentId}] No winner identified for ended game ${gameId}`);
        return null;
    }
    const whiteId = players === null || players === void 0 ? void 0 : players.white;
    const blackId = players === null || players === void 0 ? void 0 : players.black;
    if (!whiteId || !blackId) {
        functions.logger.error(`[Tournament ${tournamentId}] Player IDs missing in game document ${gameId}`);
        return null;
    }
    const loserId = whiteId === winnerId ? blackId : whiteId;
    // Update User Statistics
    try {
        const batch = db.batch();
        const winnerRef = db.collection("users").doc(winnerId);
        const loserRef = db.collection("users").doc(loserId);
        batch.update(winnerRef, {
            "stats.totalWins": admin.firestore.FieldValue.increment(1),
            "stats.totalGames": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(15),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        batch.update(loserRef, {
            "stats.totalLosses": admin.firestore.FieldValue.increment(1),
            "stats.totalGames": admin.firestore.FieldValue.increment(1),
            "stats.rating": admin.firestore.FieldValue.increment(-10),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        functions.logger.info(`[Tournament ${tournamentId}] Stats updated for winner ${winnerId} and loser ${loserId}`);
    }
    catch (error) {
        functions.logger.error(`[Tournament ${tournamentId}] Error updating user stats:`, error);
    }
    const tournamentRef = db.collection("tournaments").doc(tournamentId);
    try {
        await db.runTransaction(async (transaction) => {
            var _a, _b;
            const tournamentDoc = await transaction.get(tournamentRef);
            if (!tournamentDoc.exists) {
                functions.logger.warn(`[Tournament ${tournamentId}] Not found in Firestore.`);
                return;
            }
            const tournamentData = tournamentDoc.data();
            const matches = tournamentData.matches || {};
            if (!matches[providedMatchId]) {
                functions.logger.error(`[Tournament ${tournamentId}] Match ${providedMatchId} not found in tournament.`);
                return;
            }
            const currentMatch = matches[providedMatchId];
            const winnerPlayer = ((_a = tournamentData.players) === null || _a === void 0 ? void 0 : _a.find((p) => p.uid === winnerId)) ||
                (((_b = currentMatch.player1) === null || _b === void 0 ? void 0 : _b.uid) === winnerId ? currentMatch.player1 : currentMatch.player2);
            if (!winnerPlayer) {
                functions.logger.error(`[Tournament ${tournamentId}] Winner ${winnerId} details not found.`);
            }
            // 1. Update Current Match status and winner in the Map
            const tournamentUpdates = {
                [`matches.${providedMatchId}.winnerId`]: winnerId,
                [`matches.${providedMatchId}.status`]: "completed",
                matchesCompleted: admin.firestore.FieldValue.increment(1),
                matchesOngoing: admin.firestore.FieldValue.increment(-1)
            };
            // 2. Check if this was the Final (no nextMatchId)
            const nextMatchId = currentMatch.nextMatchId;
            if (!nextMatchId) {
                tournamentUpdates.status = "completed";
                tournamentUpdates.winner = winnerPlayer || { uid: winnerId, displayName: "Winner" };
                tournamentUpdates.endDate = admin.firestore.FieldValue.serverTimestamp();
                transaction.update(tournamentRef, tournamentUpdates);
                functions.logger.info(`[Tournament ${tournamentId}] Champion declared in Final Match ${providedMatchId}: ${winnerId}`);
                return;
            }
            // 3. Promote winner to next match in the Map
            if (!matches[nextMatchId]) {
                functions.logger.error(`[Tournament ${tournamentId}] Next match ${nextMatchId} missing from matches.`);
                transaction.update(tournamentRef, tournamentUpdates);
                return;
            }
            const playerSlot = currentMatch.nextMatchSlot || "player1";
            tournamentUpdates[`matches.${nextMatchId}.${playerSlot}`] = winnerPlayer || { uid: winnerId, displayName: "Winner" };
            // 4. Check if both players are ready in the next match
            const nextMatchData = Object.assign({}, matches[nextMatchId]);
            nextMatchData[playerSlot] = winnerPlayer || { uid: winnerId, displayName: "Winner" };
            const p1 = nextMatchData.player1;
            const p2 = nextMatchData.player2;
            if (p1 && p2 && p1.uid && p2.uid) {
                functions.logger.info(`[Tournament ${tournamentId}] Next Match ${nextMatchId} ready: ${p1.uid} vs ${p2.uid}.`);
                const newGameRef = db.collection("games").doc();
                const newGameId = newGameRef.id;
                const newGame = {
                    players: { white: p1.uid, black: p2.uid },
                    playerNames: { white: p1.displayName || "White Player", black: p2.displayName || "Black Player" },
                    status: "active",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastMove: admin.firestore.FieldValue.serverTimestamp(),
                    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                    moves: [],
                    timers: { w: 480, b: 480 },
                    timeControl: { initial: 480, increment: 2 },
                    tournamentId: tournamentId,
                    matchId: nextMatchId,
                    gameId: newGameId
                };
                transaction.set(newGameRef, newGame);
                tournamentUpdates[`matches.${nextMatchId}.gameId`] = newGameId;
                tournamentUpdates[`matches.${nextMatchId}.status`] = "active";
                tournamentUpdates.matchesOngoing = admin.firestore.FieldValue.increment(0); // Ongoing counter adjustment if needed
                functions.logger.info(`[Tournament ${tournamentId}] Created game ${newGameId} for match ${nextMatchId}.`);
            }
            else {
                functions.logger.info(`[Tournament ${tournamentId}] Winner ${winnerId} moved to ${nextMatchId} (${playerSlot}). Waiting for opponent.`);
            }
            transaction.update(tournamentRef, tournamentUpdates);
        });
    }
    catch (error) {
        functions.logger.error(`[Tournament ${tournamentId}] Transaction error in onGameEnd:`, error);
    }
    return null;
});
//# sourceMappingURL=index.js.map