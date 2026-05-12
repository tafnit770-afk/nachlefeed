// src/utils/analytics.js
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const trackEvent = async (type, userId = null, extra = {}) => {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      type,
      userId,
      timestamp: serverTimestamp(),
      ...extra,
    });
  } catch (err) {
    // Silent fail - analytics should never break the app
    console.warn('Analytics track failed:', err);
  }
};

export const trackVisit = () => trackEvent('visit');
export const trackSignup = (userId) => trackEvent('signup', userId);
export const trackConversationCreated = (userId) => trackEvent('conversation_created', userId);
export const trackMessage = (userId) => trackEvent('message', userId);
