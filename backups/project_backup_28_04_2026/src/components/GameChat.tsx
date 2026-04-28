import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface GameChatProps {
    gameId: string;
}

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: any;
}

const GameChat = ({ gameId }: GameChatProps) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (!gameId) return;

        const q = query(collection(db, `games/${gameId}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const msgs: Message[] = [];
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                const senderName = await getSenderName(data.senderId);
                msgs.push({ 
                    id: doc.id, 
                    ...data, 
                    senderName 
                } as Message);
            }
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [gameId]);

    const getSenderName = async (senderId: string) => {
        if (!senderId) return 'Anonymous';
        const userRef = doc(db, 'users', senderId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data().name : 'Anonymous';
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        await addDoc(collection(db, `games/${gameId}/messages`), {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
        });

        setNewMessage('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg w-full h-full flex flex-col">
            <h3 className="text-lg font-bold mb-3 text-white">Match Chat</h3>
            <div className="bg-gray-700 rounded p-2 flex-grow h-64 overflow-y-auto mb-3">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-2 my-1 rounded-lg ${msg.senderId === currentUser?.uid ? 'bg-orange-600 text-right' : 'bg-gray-600'}`}>
                        <div className="text-xs text-gray-300 font-semibold">{msg.senderName}</div>
                        <p className="text-white">{msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow bg-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md">Send</button>
            </form>
        </div>
    );
};

export default GameChat;
