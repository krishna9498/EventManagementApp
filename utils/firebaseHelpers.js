// utils/firebaseHelpers.js
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        email,
        favorites: [],
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
};

export const toggleFavorite = async (userId, eventId, isCurrentlyFavorite) => {
  if (!userId || !eventId) return false;

  const userRef = doc(db, 'users', userId);
  
  try {
    // First, check if user document exists
    const userSnapshot = await getDoc(userRef);
    
    // If user document doesn't exist, create it
    if (!userSnapshot.exists()) {
      const userEmail = auth.currentUser?.email || 'user@example.com';
      await setDoc(userRef, {
        email: userEmail,
        favorites: [],
        createdAt: new Date(),
      });
    }

    // Now toggle the favorite
    if (isCurrentlyFavorite) {
      await updateDoc(userRef, {
        favorites: arrayRemove(eventId)
      });
      return false;
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(eventId)
      });
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

export const getUserFavorites = async (userId) => {
  if (!userId) return [];

  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data().favorites || [];
  }

  return [];
};