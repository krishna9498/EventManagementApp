import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKRX3rr9smMVjFtNkEbGHeSGMwQn-6FK4",
  authDomain: "eventmanagementapp-be4b5.firebaseapp.com",
  projectId: "eventmanagementapp-be4b5",
  storageBucket: "eventmanagementapp-be4b5.firebasestorage.app",
  messagingSenderId: "1067596592488",
  appId: "1:1067596592488:web:3925ec93dfd02043acd2dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };