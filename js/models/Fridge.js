// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Изолированное локальное демо и данные Firebase; старый сеанс не меняет новый.
// ==============================================================================
import { db } from '../firebase.js';
import { readLocalState, writeLocalState, createLocalId } from '../utils/localStore.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class FridgeModel {
    constructor() {
        this.batches = [];
        this.cart = [];
        this.localMode = true; // До явного входа никогда не обращаемся к общей облачной базе.
        this.modeGeneration = 0;
    }

    // НАЧАЛО ФУНКЦИИ setLocalMode
    /** Демо и облако не смешивают данные между собой. */
    setLocalMode(enabled) {
        this.modeGeneration++; // Меняется и при повторном входе в тот же режим/новую сессию.
        this.localMode = Boolean(enabled);
        this.batches = []; this.cart = [];
    }
    // КОНЕЦ ФУНКЦИИ setLocalMode

    async fetchBatchesFromCloud() {
        if (this.localMode) {
            const saved = readLocalState('batches', []);
            this.batches = Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string') : [];
            return this.batches;
        }
        const requestGeneration = this.modeGeneration;
        try {
            const querySnapshot = await getDocs(collection(db, "batches"));
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.batches = [];
            querySnapshot.forEach(doc => this.batches.push({ ...doc.data(), id: doc.id }));
            return this.batches;
        } catch (error) { throw error; }
    }

    async addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, isCooked, price, currency, composition, note, userEmail = 'Аноним') {
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (days * msInDay);

        const quantity = Number(count);
        if (!String(name).trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(expirationDate)) {
            throw new Error('Название, количество и срок годности продукта должны быть корректными');
        }
        const newBatchData = {
            name, category, count: parseFloat(count), unit, addedAt: Date.now(),
            expirationDate, isPerishable, isFrozen, isCooked: isCooked || false,
            price: parseFloat(price) || 0, currency: currency || 'RUB',
            composition: composition || '', note: note || '', rating: null, ratingComment: '',
            addedBy: userEmail
        };

        if (this.localMode) {
            this.batches.push({ id: createLocalId(), ...newBatchData });
            writeLocalState('batches', this.batches);
            return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            const docRef = await addDoc(collection(db, "batches"), newBatchData);
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.batches.push({ id: docRef.id, ...newBatchData });
        } catch (error) { throw error; }
    }

    async removeBatch(id) {
        if (this.localMode) {
            this.batches = this.batches.filter(batch => batch.id !== id);
            writeLocalState('batches', this.batches); return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            await deleteDoc(doc(db, "batches", id));
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.batches = this.batches.filter(b => b.id !== id);
        } catch (error) { throw error; }
    }

    async updateFullBatch(id, updatedData) {
        if (this.localMode) {
            this.batches = this.batches.map(batch => batch.id === id ? { ...batch, ...updatedData, id } : batch);
            writeLocalState('batches', this.batches); return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            const batchRef = doc(db, "batches", id);
            await updateDoc(batchRef, updatedData);
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            const index = this.batches.findIndex(b => b.id === id);
            if (index !== -1) this.batches[index] = { ...this.batches[index], ...updatedData };
        } catch (error) { throw error; }
    }

    getBatchById(id) { return this.batches.find(b => b.id === id); }

    getProcessedBatches() {
        const now = Date.now();
        const processed = this.batches.map(batch => {
            const daysLeft = Math.ceil((batch.expirationDate - now) / 86400000);
            return { ...batch, daysLeft };
        });
        return processed.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    async fetchCartFromCloud() {
        if (this.localMode) {
            const saved = readLocalState('cart', []);
            this.cart = Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string') : [];
            return this.cart;
        }
        const requestGeneration = this.modeGeneration;
        try {
            const querySnapshot = await getDocs(collection(db, "cart"));
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.cart = [];
            querySnapshot.forEach(doc => this.cart.push({ ...doc.data(), id: doc.id }));
            return this.cart;
        } catch (error) { throw error; }
    }

    async addCartItem(name, category, count, unit) {
        const quantity = Number(count);
        if (!String(name).trim() || !Number.isFinite(quantity) || quantity <= 0) throw new Error('Некорректное количество');
        const newItem = { name, category, count: quantity, unit, addedAt: Date.now() };
        if (this.localMode) {
            this.cart.push({ id: createLocalId(), ...newItem });
            writeLocalState('cart', this.cart); return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            const docRef = await addDoc(collection(db, "cart"), newItem);
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.cart.push({ id: docRef.id, ...newItem });
        } catch (error) { throw error; }
    }

    async removeCartItem(id) {
        if (this.localMode) {
            this.cart = this.cart.filter(item => item.id !== id);
            writeLocalState('cart', this.cart); return;
        }
        const requestGeneration = this.modeGeneration;
        try {
            await deleteDoc(doc(db, "cart", id));
            if (requestGeneration !== this.modeGeneration || this.localMode) return;
            this.cart = this.cart.filter(item => item.id !== id);
        } catch (error) { throw error; }
    }
}
