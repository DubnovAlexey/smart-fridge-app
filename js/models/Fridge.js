// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Бизнес-логика (Мозг).
// ==============================================================================

import { loadFridgeData, saveFridgeData } from '../storage.js';

export class FridgeModel {
    constructor() {
        this.batches = loadFridgeData();
    }

    // ДОБАВЛЕНО: параметр exactDate
    addBatch(name, category, count, unit, daysValid, exactDate, isPerishable, isFrozen, price, note) {
        const now = Date.now();
        const msInDay = 24 * 60 * 60 * 1000;

        let expirationDate;

        // ЛОГИКА ВЫБОРА ДАТЫ:
        // Если пользователь выбрал дату в календаре (например, "2026-10-15")
        if (exactDate) {
            // Класс 'new Date()' переводит текстовую дату в системный формат,
            // а '.getTime()' делает из неё миллисекунды (Timestamp)
            expirationDate = new Date(exactDate).getTime();
        }
        // Иначе высчитываем дату прибавлением дней к текущему моменту
        else {
            expirationDate = now + (daysValid * msInDay);
        }

        const newBatch = {
            id: Date.now().toString(),
            name: name,
            category: category,
            count: parseFloat(count),
            unit: unit,
            addedAt: now,
            expirationDate: expirationDate,
            isPerishable: isPerishable,
            isFrozen: isFrozen,
            price: parseFloat(price) || 0,
            note: note
        };

        this.batches.push(newBatch);
        saveFridgeData(this.batches);
    }

    getProcessedBatches() {
        const now = Date.now();
        const msInDay = 24 * 60 * 60 * 1000;

        const processed = this.batches.map(batch => {
            if (batch.isFrozen) {
                return { ...batch, daysLeft: 999 };
            }
            const diffMs = batch.expirationDate - now;
            const daysLeft = Math.ceil(diffMs / msInDay);
            return { ...batch, daysLeft: daysLeft };
        });

        return processed.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    getBatchById(id) {
        return this.batches.find(batch => batch.id === id);
    }

    removeBatch(id) {
        this.batches = this.batches.filter(batch => batch.id !== id);
        saveFridgeData(this.batches);
    }

    updateBatchCount(id, newCount) {
        const batch = this.getBatchById(id);
        if (batch) {
            batch.count = parseFloat(newCount);
            saveFridgeData(this.batches);
        }
    }
}