import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export interface Marquee {
    id: string;
    text: string;
    active: boolean;
}

export interface Quote {
    id: string;
    text: string;
    author: string;
}

const marqueeDocRef = doc(db, 'settings', 'marquee');

// --- Original Marquee Functions (keeping for backward compatibility) ---
export const getMarqueeMessage = async (): Promise<string> => {
    try {
        const docSnap = await getDoc(marqueeDocRef);
        return docSnap.exists() ? docSnap.data().message || '' : '';
    } catch (error) {
        console.error("Error fetching marquee message: ", error);
        return '';
    }
};

export const updateMarqueeMessage = async (newMessage: string): Promise<void> => {
    try {
        await setDoc(marqueeDocRef, { message: newMessage });
    } catch (error) {
        console.error("Error updating marquee message: ", error);
        throw error;
    }
};

// --- New Marquee Management Functions (Collection based) ---
export const getMarquees = async (): Promise<Marquee[]> => {
    const colRef = collection(db, 'marquee');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Marquee));
};

export const createMarquee = async (data: Omit<Marquee, 'id'>) => {
    const colRef = collection(db, 'marquee');
    return await addDoc(colRef, data);
};

export const updateMarquee = async (id: string, data: Partial<Marquee>) => {
    const docRef = doc(db, 'marquee', id);
    return await updateDoc(docRef, data);
};

export const deleteMarquee = async (id: string) => {
    const docRef = doc(db, 'marquee', id);
    return await deleteDoc(docRef);
};

// --- New Quote Management Functions (Collection based) ---
export const getQuotes = async (): Promise<Quote[]> => {
    const colRef = collection(db, 'quotes');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote));
};

export const createQuote = async (data: Omit<Quote, 'id'>) => {
    const colRef = collection(db, 'quotes');
    return await addDoc(colRef, data);
};

export const updateQuote = async (id: string, data: Partial<Quote>) => {
    const docRef = doc(db, 'quotes', id);
    return await updateDoc(docRef, data);
};

export const deleteQuote = async (id: string) => {
    const docRef = doc(db, 'quotes', id);
    return await deleteDoc(docRef);
};
