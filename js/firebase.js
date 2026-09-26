// ==============================================================================
// ФАЙЛ: js/firebase.js
// НАЗНАЧЕНИЕ: Инициализация БД Firestore и системы Идентификации (Auth)
// ==============================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC3t2zb4pl721MXAcLgHG5Kna00m8eDtAI",
    authDomain: "smart-fridge-v2.firebaseapp.com",
    projectId: "smart-fridge-v2",
    storageBucket: "smart-fridge-v2.firebasestorage.app",
    messagingSenderId: "814625416001",
    appId: "1:814625416001:web:d440c783760fd6d92037c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };