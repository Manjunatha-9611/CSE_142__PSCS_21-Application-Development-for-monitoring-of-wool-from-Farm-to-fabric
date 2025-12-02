import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyC1Vetsw3-NqqJ6LZYo9S4RcTkQfSg1JPQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "capstone-b8a7a.firebaseapp.com",
  databaseURL: "https://capstone-b8a7a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "capstone-b8a7a",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "capstone-b8a7a.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "571766835163",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:571766835163:web:e7374e8ee34d7fbf5c89fe",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-46MYX5BR2C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Initialize Performance Monitoring
let performance;
try {
  performance = getPerformance(app);
  console.log('✓ Firebase Performance Monitoring enabled');
} catch (error) {
  console.warn('Performance monitoring not available:', error);
}

// Connection state monitoring
let isOnline = true;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

/**
 * Monitor Firebase connection state
 */
export const monitorConnection = () => {
  // Monitor online/offline state
  window.addEventListener('online', () => {
    console.log('✓ Network connection restored');
    isOnline = true;
    reconnectAttempts = 0;
    ensureFirebaseConnection();
  });

  window.addEventListener('offline', () => {
    console.warn('⚠ Network connection lost');
    isOnline = false;
  });

  // Check connection periodically
  setInterval(() => {
    if (isOnline) {
      ensureFirebaseConnection();
    }
  }, 30000); // Check every 30 seconds
};

/**
 * Ensure Firebase is connected with auto-retry
 */
export const ensureFirebaseConnection = async () => {
  try {
    await enableNetwork(firestore);
    console.log('✓ Firebase Firestore connected');
    reconnectAttempts = 0;
    return true;
  } catch (error) {
    console.error('Firebase connection error:', error);

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Retrying connection (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

      setTimeout(() => {
        ensureFirebaseConnection();
      }, RECONNECT_DELAY * reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached. Please check your internet connection.');
    }

    return false;
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = () => {
  return {
    isOnline,
    reconnectAttempts,
    maxAttempts: MAX_RECONNECT_ATTEMPTS
  };
};

// Initialize connection monitoring
monitorConnection();
ensureFirebaseConnection();

// Log successful initialization
console.log('✓ Firebase initialized successfully');
console.log('✓ Project:', firebaseConfig.projectId);
console.log('✓ Always-online mode enabled with auto-reconnect');

export default app;