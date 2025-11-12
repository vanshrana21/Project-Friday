// firebase.js — Complete Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  collection, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ SECURITY WARNING: These credentials are exposed!
// Please add Firebase Security Rules and consider regenerating API keys
const firebaseConfig = {
  apiKey: "AIzaSyDhtzMHkfOT155xYyLdUYEvANcT0oTK6hK",
  authDomain: "project-friday-548e3.firebaseapp.com",
  projectId: "project-friday-548e3",
  storageBucket: "project-friday-548e3.firebasestorage.app",
  messagingSenderId: "450588472803",
  appId: "1:450588472803:web:0d188f4343492c9b98dc6",
  measurementId: "G-8NB3W2PERR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase initialized successfully");
console.log("📦 Firestore database ready");

// Export everything needed
export { 
  db, 
  doc, 
  getDoc, 
  setDoc,
  collection, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
};