import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

// Type definition for User data
export interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    isAdmin?: boolean;
    photoURL?: string;
    elo?: number;
    phoneNumber?: string;
    dob?: string;
}

// Get all users/players
export const getUsers = async (): Promise<UserData[]> => {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
    return userList;
};

// Update a user's data
export const updateUser = async (uid: string, data: Partial<UserData>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};

// Delete a user's document from Firestore
export const deleteUser = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);
    // Note: This only deletes the Firestore document, not the Firebase Auth user.
};


// Fetch a user's profile
export const getUserProfile = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
};

// Send a friend request
export const sendFriendRequest = async (fromId: string, toId: string) => {
    const toUserRef = doc(db, 'users', toId);
    await updateDoc(toUserRef, {
        friendRequests: arrayUnion({ from: fromId, status: 'pending' })
    });
};

// Accept a friend request
export const acceptFriendRequest = async (userId: string, fromId: string) => {
    const userRef = doc(db, 'users', userId);
    const fromUserRef = doc(db, 'users', fromId);

    // Get the current friend requests
    const userDoc = await getDoc(userRef);
    const requests = userDoc.data()?.friendRequests || [];

    // Find and remove the specific friend request, then add to friends list
    const requestToRemove = requests.find((req: { from: string; }) => req.from === fromId);
    if(requestToRemove) {
        await updateDoc(userRef, {
            friendRequests: arrayRemove(requestToRemove),
            friends: arrayUnion(fromId)
        });
        // Also add the user to the sender's friend list
        await updateDoc(fromUserRef, {
            friends: arrayUnion(userId)
        });
    }
};

// Search for users by display name
export const searchUsersByName = async (displayName: string) => {
    const usersRef = collection(db, 'users');
    // This is a simple search, for more complex scenarios, consider a dedicated search service like Algolia
    const q = query(usersRef, where('displayName', '>=', displayName), where('displayName', '<=', displayName + '\uf8ff'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};