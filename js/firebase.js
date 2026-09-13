// ==============================================================================
// ФАЙЛ: js/firebase.js
// НАЗНАЧЕНИЕ: Инициализация облачной базы данных Firebase
// ==============================================================================

// Подключаем ядро Firebase и модуль базы данных (Firestore) напрямую с серверов Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Уникальный конфигурационный ключ вашего проекта
const firebaseConfig = {
    apiKey: "AIzaSyC3t2zb4pl721MXAcLgHG5Kna00m8eDtAI",
    authDomain: "smart-fridge-v2.firebaseapp.com",
    projectId: "smart-fridge-v2",
    storageBucket: "smart-fridge-v2.firebasestorage.app",
    messagingSenderId: "814625416001",
    appId: "1:814625416001:web:d440c783760fd6d92037c0"
};

// Инициализируем приложение
const app = initializeApp(firebaseConfig);

// Активируем базу данных Firestore
const db = getFirestore(app);

// Экспортируем переменную db, чтобы другие файлы (например, Fridge.js) могли сохранять туда продукты
export { db };