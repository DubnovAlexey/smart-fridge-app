// ==============================================================================
// ФАЙЛ: js/models/Analytics.js
// НАЗНАЧЕНИЕ: Бизнес-логика (Мозг) для статистики. Считает съеденное и выброшенное.
//
// ЧТО РЕАЛИЗОВАНО В ЭТОМ ФАЙЛЕ (V 2.0 Облако):
// 1. Интеграция с Firestore: Статистика хранится в документе 'general' коллекции 'stats'.
// 2. Асинхронная инициализация: При старте пытается загрузить статистику из облака.
// 3. Автосоздание: Если документа в облаке еще нет, он создается (setDoc).
// 4. Обновление (updateDoc): При каждом списании/потреблении отправляет новые цифры на сервер.
// 5. Поколение режима защищает текущую статистику от ответа прежней облачной сессии.
// ==============================================================================

import { db } from '../firebase.js';
import { readLocalState, writeLocalState } from '../utils/localStore.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class AnalyticsModel {
    constructor() {
        // Начальное состояние (нули).
        // Оно будет перезаписано данными из облака при вызове loadFromCloud()
        this.stats = { consumed: 0, wasted: 0, moneyLost: 0 };
        this.localMode = true;
        this.modeGeneration = 0;
    }

    // НАЧАЛО ФУНКЦИИ setLocalMode
    setLocalMode(enabled) {
        this.modeGeneration++;
        this.localMode = Boolean(enabled);
        this.stats = { consumed: 0, wasted: 0, moneyLost: 0 };
    }
    // КОНЕЦ ФУНКЦИИ setLocalMode

    // 1. Асинхронная загрузка статистики из облака Firebase
    async loadFromCloud() {
        if (this.localMode) {
            const saved = readLocalState('stats', {});
            for (const key of Object.keys(this.stats)) {
                const value = Number(saved?.[key]);
                this.stats[key] = Number.isFinite(value) && value >= 0 ? value : 0;
            }
            return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            // Создаем ссылку на документ 'general' внутри коллекции 'stats'
            const statRef = doc(db, "stats", "general");
            const statSnap = await getDoc(statRef);
            if (requestGeneration !== this.modeGeneration || this.localMode) return;

            if (statSnap.exists()) {
                // Если документ есть, берем данные из него
                this.stats = statSnap.data();
            } else {
                // Если документа еще нет (первый запуск приложения),
                // создаем его в облаке с нулями
                await setDoc(statRef, { ...this.stats });
            }
        } catch (error) {
            console.error("Ошибка при загрузке аналитики из Firebase:", error);
            // Если нет сети, программа продолжит работать с нулями
        }
    }

    // 2. Асинхронное сохранение обновленных цифр в Firebase
    async saveToCloud() {
        if (this.localMode) { writeLocalState('stats', this.stats); return; }
        try {
            const statRef = doc(db, "stats", "general");
            await updateDoc(statRef, { ...this.stats });
        } catch (error) {
            console.error("Ошибка при сохранении аналитики в Firebase:", error);
        }
    }

    // МЕТОД 1: Записать съеденное (теперь асинхронный)
    async recordConsumption(amount) {
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) return;
        this.stats.consumed += value;
        await this.saveToCloud(); // Отправляем в облако
    }

    // МЕТОД 2: Записать выброшенное (теперь асинхронный)
    async recordWaste(amount, price) {
        const value = Number(amount), cost = Number(price);
        if (!Number.isFinite(value) || value <= 0) return;
        this.stats.wasted += value;
        this.stats.moneyLost += Number.isFinite(cost) && cost > 0 ? cost : 0;
        await this.saveToCloud(); // Отправляем в облако
    }

    // МЕТОД 3: Отдать статистику Контроллеру для отрисовки
    getStats() {
        return this.stats;
    }
}