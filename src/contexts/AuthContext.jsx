// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch (e) { console.error('Profile load error:', e); }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const registerCustomer = async ({ email, password, firstName, lastName, username, phone, city, address }) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '', city: city || '', address: address || '',
      role: 'customer', createdAt: serverTimestamp(), favorites: [],
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  const registerProvider = async ({ email, password, firstName, lastName, username, phone, description, categories, location, address, priceRange, profileImageUrl }) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '', role: 'provider', createdAt: serverTimestamp(),
    };
    const providerData = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '', description: description || '',
      categories: categories || [], location: location || '',
      address: address || '', priceRange: priceRange || '',
      profileImageUrl: profileImageUrl || '',
      rating: 0, reviewCount: 0, createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    await setDoc(doc(db, 'providers', user.uid), providerData);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  // כניסה עם גוגל
  const loginWithGoogle = async (role = 'customer') => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const { user } = await signInWithPopup(auth, provider);

    // בדוק אם המשתמש כבר קיים
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      setUserProfile(snap.data());
      return { user, isNew: false, profile: snap.data() };
    }

    // משתמש חדש — צור פרופיל
    const nameParts = (user.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const profile = {
      uid: user.uid,
      email: user.email,
      firstName, lastName,
      username: user.email.split('@')[0],
      phone: '', address: '',
      role, createdAt: serverTimestamp(), favorites: [],
      profileImageUrl: user.photoURL || '',
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    if (role === 'provider') {
      await setDoc(doc(db, 'providers', user.uid), {
        ...profile, description: '', categories: [],
        location: '', priceRange: '', rating: 0, reviewCount: 0,
      });
    }
    trackSignup(user.uid);
    setUserProfile(profile);
    return { user, isNew: true, profile };
  };

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    } catch (e) { console.error('Login profile error:', e); }
    return user;
  };

  const logout = () => { setUserProfile(null); return signOut(auth); };
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const value = { currentUser, userProfile, loading, login, loginWithGoogle, logout, registerCustomer, registerProvider, resetPassword };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

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
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch (e) { console.error('Profile load error:', e); }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const registerCustomer = async ({ email, password, firstName, lastName, username, phone, address }) => {
    // יצירת משתמש ב-Auth קודם
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // עכשיו המשתמש מחובר — אפשר לכתוב ל-Firestore
    const profile = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '', address: address || '',
      role: 'customer', createdAt: serverTimestamp(),
      favorites: [],
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  const registerProvider = async ({ email, password, firstName, lastName, username, phone, description, categories, location, priceRange, profileImageUrl }) => {
    // יצירת משתמש ב-Auth קודם
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // עכשיו המשתמש מחובר — אפשר לכתוב ל-Firestore
    const profile = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '',
      role: 'provider', createdAt: serverTimestamp(),
    };
    const providerData = {
      uid: user.uid, email, firstName, lastName,
      username: username || email.split('@')[0],
      phone: phone || '',
      description: description || '',
      categories: categories || [],
      location: location || '',
      priceRange: priceRange || '',
      profileImageUrl: profileImageUrl || '',
      rating: 0, reviewCount: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), profile);
    await setDoc(doc(db, 'providers', user.uid), providerData);
    trackSignup(user.uid);
    setUserProfile(profile);
    return user;
  };

  const login = async (email, password) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setUserProfile(snap.data());
    } catch (e) { console.error('Login profile error:', e); }
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
