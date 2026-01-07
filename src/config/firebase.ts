import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBiMmPrfOzU9raSBWL1W3_aFX5IRvkzJPA",
  authDomain: "moneya-72fe6.firebaseapp.com",
  projectId: "moneya-72fe6",
  storageBucket: "moneya-72fe6.firebasestorage.app",
  messagingSenderId: "688215695102",
  appId: "1:688215695102:web:bfbbf70f2ddbf47aa44faf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const db = getFirestore(app);