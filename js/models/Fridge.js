// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Работа с данными холодильника (CRUD + Сортировка)
// ==============================================================================

export class FridgeModel {
    constructor() {
        this.batches = JSON.parse(localStorage.getItem('fridge_batches')) || [];
    }

    save() {
        localStorage.setItem('fridge_batches', JSON.stringify(this.batches));
    }

    addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, price, note) {
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (days * msInDay);

        const newBatch = {
            id: Date.now().toString(),
            name, category, count: parseFloat(count), unit,
            addedAt: Date.now(),
            expirationDate, isPerishable, isFrozen,
            price: parseFloat(price) || 0, note: note || ''
        };
        this.batches.push(newBatch);
        this.save();
    }

    removeBatch(id) {
        this.batches = this.batches.filter(b => b.id !== id);
        this.save();
    }

    updateBatchCount(id, newCount) {
        const batch = this.batches.find(b => b.id === id);
        if (batch) {
            batch.count = newCount;
            this.save();
        }
    }

    updateFullBatch(id, updatedData) {
        const index = this.batches.findIndex(b => b.id === id);
        if (index !== -1) {
            this.batches[index] = { ...this.batches[index], ...updatedData };
            this.save();
        }
    }

    getBatchById(id) {
        return this.batches.find(b => b.id === id);
    }

    getProcessedBatches() {
        const msInDay = 24 * 60 * 60 * 1000;
        const now = Date.now();

        const processed = this.batches.map(batch => {
            const daysLeft = Math.ceil((batch.expirationDate - now) / msInDay);
            return { ...batch, daysLeft };
        });

        // Умная сортировка: скоропортящиеся и с истекающим сроком — всегда наверху
        return processed.sort((a, b) => a.daysLeft - b.daysLeft);
    }
}