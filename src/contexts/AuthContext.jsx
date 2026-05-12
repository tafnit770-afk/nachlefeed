// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { trackSignup } from '../utils/analytics';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserProfile(snap.data());
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const checkUsernameUnique = async (username) => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snap = await getDocs(q);
    return snap.empty;
  };

  const registerCustomer = async ({ email, password, firstName, lastName, username, phone, address }) => {
    const unique = await checkUsernameUnique(username);
    if (!unique) throw new Error('שם המשתמש כבר תפוס');
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: user.uid, email, firstName, lastName, username, phone, address,
      role: 'customer', createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  const registerProvider = async ({ email, password, firstName, lastName, username, phone, description, categories, location, priceRange, profileImageUrl }) => {
    const unique = await checkUsernameUnique(username);
    if (!unique) throw new Error('שם המשתמש כבר תפוס');
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: user.uid, email, firstName, lastName, username, phone,
      role: 'provider', createdAt: serverTimestamp(),
    };
    const providerData = {
      uid: user.uid, email, firstName, lastName, username, phone,
      description, categories, location, priceRange,
      profileImageUrl: profileImageUrl || '',
      rating: 0, reviewCount: 0, createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    await setDoc(doc(db, 'providers', user.uid), providerData);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) setUserProfile(snap.data());
    return user;
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const value = { currentUser, userProfile, loading, login, logout, registerCustomer, registerProvider, resetPassword };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
