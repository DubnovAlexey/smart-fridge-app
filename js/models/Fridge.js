// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Бизнес-логика (Мозг). Здесь мы считаем даты, создаем партии продуктов.
// ==============================================================================

import { loadFridgeData, saveFridgeData } from '../storage.js';

export class FridgeModel {
    constructor() {
        this.batches = loadFridgeData();
    }

    // МЕТОД: Добавление новой партии (без изменений)
    addBatch(name, category, count, unit, daysValid, isPerishable, isFrozen, price, note) {
        const now = Date.now();
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = now + (daysValid * msInDay);

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

    // МЕТОД: Получить все продукты с пересчетом дат (без изменений)
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

    // ================= НОВЫЕ МЕТОДЫ =================

    // МЕТОД: Найти конкретный продукт по его уникальному ID
    getBatchById(id) {
        // Функция find ищет в массиве первый элемент, у которого совпадает id
        return this.batches.find(batch => batch.id === id);
    }

    // МЕТОД: Удалить продукт полностью (например, когда съели всё или выбросили)
    removeBatch(id) {
        // Функция filter оставляет в массиве только те продукты, чей id НЕ РАВЕН удаляемому
        this.batches = this.batches.filter(batch => batch.id !== id);
        saveFridgeData(this.batches); // Перезаписываем сейф
    }

    // МЕТОД: Изменить количество (когда взяли только часть)
    updateBatchCount(id, newCount) {
        const batch = this.getBatchById(id);
        if (batch) {
            batch.count = parseFloat(newCount);
            saveFridgeData(this.batches);
        }
    }
}