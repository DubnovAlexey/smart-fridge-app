// ==============================================================================
// ФАЙЛ: js/models/Analytics.js
// НАЗНАЧЕНИЕ: Бизнес-логика (Мозг) для статистики. Считает съеденное и выброшенное.
//
// ЧТО РЕАЛИЗОВАНО В ЭТОМ ФАЙЛЕ (V 2.0 Облако):
// 1. Интеграция с Firestore: Статистика хранится в документе 'general' коллекции 'stats'.
// 2. Асинхронная инициализация: При старте пытается загрузить статистику из облака.
// 3. Автосоздание: Если документа в облаке еще нет, он создается (setDoc).
// 4. Обновление (updateDoc): При каждом списании/потреблении отправляет новые цифры на сервер.
// ==============================================================================

import { db } from '../firebase.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class AnalyticsModel {
    constructor() {
        // Начальное состояние (нули).
        // Оно будет перезаписано данными из облака при вызове loadFromCloud()
        this.stats = { consumed: 0, wasted: 0, moneyLost: 0 };
    }

    // 1. Асинхронная загрузка статистики из облака Firebase
    async loadFromCloud() {
        try {
            // Создаем ссылку на документ 'general' внутри коллекции 'stats'
            const statRef = doc(db, "stats", "general");
            const statSnap = await getDoc(statRef);

            if (statSnap.exists()) {
                // Если документ есть, берем данные из него
                this.stats = statSnap.data();
            } else {
                // Если документа еще нет (первый запуск приложения),
                // создаем его в облаке с нулями
                await setDoc(statRef, this.stats);
            }
        } catch (error) {
            console.error("Ошибка при загрузке аналитики из Firebase:", error);
            // Если нет сети, программа продолжит работать с нулями
        }
    }

    // 2. Асинхронное сохранение обновленных цифр в Firebase
    async saveToCloud() {
        try {
            const statRef = doc(db, "stats", "general");
            await updateDoc(statRef, this.stats);
        } catch (error) {
            console.error("Ошибка при сохранении аналитики в Firebase:", error);
        }
    }

    // МЕТОД 1: Записать съеденное (теперь асинхронный)
    async recordConsumption(amount) {
        this.stats.consumed += parseFloat(amount);
        await this.saveToCloud(); // Отправляем в облако
    }

    // МЕТОД 2: Записать выброшенное (теперь асинхронный)
    async recordWaste(amount, price) {
        this.stats.wasted += parseFloat(amount);
        this.stats.moneyLost += parseFloat(price) || 0;
        await this.saveToCloud(); // Отправляем в облако
    }

    // МЕТОД 3: Отдать статистику Контроллеру для отрисовки
    getStats() {
        return this.stats;
    }
}