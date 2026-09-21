// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Работа с данными холодильника через облачную базу данных Firebase Firestore.
//
// РЕАЛИЗОВАНО В ЭТОМ ФАЙЛЕ:
// 1. Асинхронная загрузка всех продуктов из облака Firebase (getDocs).
// 2. Добавление новой партии продуктов в облачную коллекцию 'batches' (addDoc).
// 3. Удаление продукта из облака по его уникальному ID (deleteDoc).
// 4. Обновление счетчиков и параметров продукта в базе (updateDoc).
// 5. Умная сортировка продуктов по оставшимся дням свежести.
// ==============================================================================

import { db } from '../firebase.js';
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class FridgeModel {
    constructor() {
        // В облачной версии список продуктов изначально пуст.
        // Данные будут подгружаться асинхронно из Firestore.
        this.batches = [];
    }

    // Загрузка всех продуктов из облака Firebase
    async fetchBatchesFromCloud() {
        try {
            const querySnapshot = await getDocs(collection(db, "batches"));
            this.batches = [];
            querySnapshot.forEach((document) => {
                this.batches.push({
                    id: document.id, // Используем стандартный ID документа Firestore
                    ...document.data()
                });
            });
            return this.batches;
        } catch (error) {
            console.error("Ошибка при загрузке из Firebase:", error);
            throw error;
        }
    }

    // Добавление новой партии продуктов в облачную базу
    async addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, price, note) {
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (days * msInDay);

        const newBatchData = {
            name,
            category,
            count: parseFloat(count),
            unit,
            addedAt: Date.now(),
            expirationDate,
            isPerishable,
            isFrozen,
            price: parseFloat(price) || 0,
            note: note || ''
        };

        try {
            // Отправляем данные в коллекцию 'batches' в Firestore
            const docRef = await addDoc(collection(db, "batches"), newBatchData);

            // Добавляем созданный объект в локальный массив с ID от Firebase
            this.batches.push({
                id: docRef.id,
                ...newBatchData
            });
        } catch (error) {
            console.error("Ошибка при добавлении продукта в Firebase:", error);
            throw error;
        }
    }

    // Удаление продукта из облака по ID
    async removeBatch(id) {
        try {
            await deleteDoc(doc(db, "batches", id));
            this.batches = this.batches.filter(b => b.id !== id);
        } catch (error) {
            console.error("Ошибка при удалении продукта из Firebase:", error);
            throw error;
        }
    }

    // Обновление количества продукта в облаке
    async updateBatchCount(id, newCount) {
        try {
            const batchRef = doc(db, "batches", id);
            await updateDoc(batchRef, { count: newCount });

            const batch = this.batches.find(b => b.id === id);
            if (batch) {
                batch.count = newCount;
            }
        } catch (error) {
            console.error("Ошибка при обновлении количества в Firebase:", error);
            throw error;
        }
    }

    // Полное обновление данных продукта в облаке (например, при редактировании или частичном расходе)
    async updateFullBatch(id, updatedData) {
        try {
            const batchRef = doc(db, "batches", id);
            await updateDoc(batchRef, updatedData);

            const index = this.batches.findIndex(b => b.id === id);
            if (index !== -1) {
                this.batches[index] = { ...this.batches[index], ...updatedData };
            }
        } catch (error) {
            console.error("Ошибка при обновлении партии в Firebase:", error);
            throw error;
        }
    }

    // Поиск продукта в локальном массиве по ID
    getBatchById(id) {
        return this.batches.find(b => b.id === id);
    }

    // Обработка и сортировка продуктов (расчет оставшихся дней)
    getProcessedBatches() {
        const msInDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        const processed = this.batches.map(batch => {
            const daysLeft = Math.ceil((batch.expirationDate - now) / msInDay);
            return { ...batch, daysLeft };
        });

        // Сортировка: скоропортящиеся и с истекающим сроком — всегда наверху
        return processed.sort((a, b) => a.daysLeft - b.daysLeft);
    }
}