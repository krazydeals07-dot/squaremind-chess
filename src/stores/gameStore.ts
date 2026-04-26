import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Player {
    id: string;
    name: string;
    isHost: boolean;
}

interface Message {
    id: string;
    text: string;
    sender: string;
}

interface GameState {
    roomId: string | null;
    players: Player[];
    messages: Message[];
    setRoomId: (roomId: string) => void;
    addPlayer: (player: Player) => void;
    addMessage: (message: Message) => void;
}

export const useGameStore = create<GameState>()(immer((set) => ({
    roomId: null,
    players: [],
    messages: [],
    setRoomId: (roomId) => set((state) => {
        state.roomId = roomId;
    }),
    addPlayer: (player) => set((state) => {
        state.players.push(player);
    }),
    addMessage: (message) => set((state) => {
        state.messages.push(message);
    }),
})));
