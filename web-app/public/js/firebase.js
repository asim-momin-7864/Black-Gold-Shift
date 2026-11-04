// firebase.js  (CDN ESM — static site)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmu1ZCFbZWzpYM0HTQUtzpaXA89sMawgA",
  authDomain: "black-gold-shift-2-hosted.firebaseapp.com",
  projectId: "black-gold-shift-2-hosted",
  storageBucket: "black-gold-shift-2-hosted.firebasestorage.app",
  messagingSenderId: "988921262702",
  appId: "1:988921262702:web:02aabf0008819d0f6eac7f",
  measurementId: "G-563G7BFQZF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
