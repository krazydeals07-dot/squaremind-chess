import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    Auth, 
    onAuthStateChanged, 
    User, 
    signInWithEmailAndPassword, 
    signInAnonymously, 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail,
    signOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    isAdmin: boolean;
    isGuest: boolean;
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string, phoneNumber?: string, dob?: string) => Promise<void>;
    signInAsGuest: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const typedAuth = auth as Auth;
        const unsubscribe = onAuthStateChanged(typedAuth, async (user) => {
            if (user) {
                // Check if user is banned
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().isBanned === true) {
                    await signOut(typedAuth);
                    setCurrentUser(null);
                    setIsAdmin(false);
                    setIsGuest(false);
                    toast.error("Your account has been banned. Please contact support.");
                    setLoading(false);
                    return;
                }

                setCurrentUser(user);
                const isAnonymous = user.isAnonymous;
                setIsGuest(isAnonymous);

                if (isAnonymous) {
                    setIsAdmin(false);
                } else {
                    try {
                        const idTokenResult = await user.getIdTokenResult(true);
                        const isAdminClaim = idTokenResult.claims.isAdmin === true;
                        setIsAdmin(isAdminClaim);
                    } catch (error) {
                        console.error("Error getting ID token result: ", error);
                        setIsAdmin(false);
                    }
                }
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
                setIsGuest(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const typedAuth = auth as Auth;
        await signInWithEmailAndPassword(typedAuth, email, password);
    };

    const signup = async (email: string, password: string, displayName: string, phoneNumber?: string, dob?: string) => {
        const typedAuth = auth as Auth;
        const userCredential = await createUserWithEmailAndPassword(typedAuth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            displayName,
            phoneNumber: phoneNumber || '',
            dob: dob || '',
            role: 'user',
            createdAt: new Date(),
            aiStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                gamesLost: 0,
                draws: 0,
                winPercentage: 0,
                elo: 1200,
                level: 'Medium',
            },
            stats: {
                gamesPlayed: 0,
                gamesWon: 0,
                gamesLost: 0,
                draws: 0,
                winPercentage: 0,
                elo: 1200,
            },
            tournamentsStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                gamesLost: 0,
                draws: 0,
                winPercentage: 0,
                elo: 1200,
            }
        });
    };

    const resetPassword = async (email: string) => {
        const typedAuth = auth as Auth;
        await sendPasswordResetEmail(typedAuth, email);
    };

    const signInAsGuest = async () => {
        const typedAuth = auth as Auth;
        await signInAnonymously(typedAuth);
    };

    const logout = async () => {
        try {
            await (auth as Auth).signOut();
            setCurrentUser(null);
            setIsAdmin(false);
            setIsGuest(false);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        isAdmin,
        isGuest,
        logout,
        login,
        signup,
        signInAsGuest,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};