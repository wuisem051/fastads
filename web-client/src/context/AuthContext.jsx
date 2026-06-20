import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const register = async (email, password, displayName, referralCode = null) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });

        let referredBy = null;
        if (referralCode) {
            try {
                const q = query(collection(db, 'users'), where('referralCode', '==', referralCode.toUpperCase()));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    referredBy = snap.docs[0].id;
                }
            } catch (e) { console.error("Error finding sponsor:", e); }
        }

        // Create Firestore profile
        await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            displayName,
            email,
            balance: 0,
            totalEarnings: 0,
            adsWatched: 0,
            referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            referredBy: referredBy,
            createdAt: serverTimestamp(),
            role: 'user',
            status: 'Active'
        });
        return cred;
    };

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const logout = () => signOut(auth);

    const fetchProfile = async (uid, user) => {
        const docRef = doc(db, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            setUserProfile(snap.data());
        } else {
            console.log("Perfil faltante detected. Auto-creando...");
            const newProfile = {
                uid: uid,
                displayName: user.displayName || 'Usuario',
                email: user.email,
                balance: 0,
                totalEarnings: 0,
                adsWatched: 0,
                referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                createdAt: serverTimestamp(),
                role: 'user',
                status: 'Active'
            };
            try {
                await setDoc(docRef, newProfile);
                setUserProfile(newProfile);
            } catch (e) {
                console.error("Error auto-creando perfil:", e);
            }
        }
    };

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) await fetchProfile(user.uid, user);
            else setUserProfile(null);
            setLoading(false);
        });
        return unsub;
    }, []);

    const value = { currentUser, userProfile, register, login, logout, fetchProfile };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
