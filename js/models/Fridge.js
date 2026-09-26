// ==============================================================================
// ФАЙЛ: js/models/Fridge.js
// НАЗНАЧЕНИЕ: Работа с данными холодильника и корзины через Firebase Firestore.
// ==============================================================================
import { db } from '../firebase.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

export class FridgeModel {
    constructor() {
        this.batches = [];
        this.cart = [];
    }

    async fetchBatchesFromCloud() {
        try {
            const querySnapshot = await getDocs(collection(db, "batches"));
            this.batches = [];
            querySnapshot.forEach(doc => this.batches.push({ id: doc.id, ...doc.data() }));
            return this.batches;
        } catch (error) { throw error; }
    }

    async addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, isCooked, price, currency, composition, note, userEmail = 'Аноним') {
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (days * msInDay);

        const newBatchData = {
            name, category, count: parseFloat(count), unit, addedAt: Date.now(),
            expirationDate, isPerishable, isFrozen, isCooked: isCooked || false,
            price: parseFloat(price) || 0, currency: currency || 'RUB',
            composition: composition || '', note: note || '', rating: null, ratingComment: '',
            addedBy: userEmail
        };

        try {
            const docRef = await addDoc(collection(db, "batches"), newBatchData);
            this.batches.push({ id: docRef.id, ...newBatchData });
        } catch (error) { throw error; }
    }

    async removeBatch(id) {
        try {
            await deleteDoc(doc(db, "batches", id));
            this.batches = this.batches.filter(b => b.id !== id);
        } catch (error) { throw error; }
    }

    async updateFullBatch(id, updatedData) {
        try {
            const batchRef = doc(db, "batches", id);
            await updateDoc(batchRef, updatedData);
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
        try {
            const querySnapshot = await getDocs(collection(db, "cart"));
            this.cart = [];
            querySnapshot.forEach(doc => this.cart.push({ id: doc.id, ...doc.data() }));
            return this.cart;
        } catch (error) { throw error; }
    }

    async addCartItem(name, category, count, unit) {
        const newItem = { name, category, count: parseFloat(count), unit, addedAt: Date.now() };
        try {
            const docRef = await addDoc(collection(db, "cart"), newItem);
            this.cart.push({ id: docRef.id, ...newItem });
        } catch (error) { throw error; }
    }

    async removeCartItem(id) {
        try {
            await deleteDoc(doc(db, "cart", id));
            this.cart = this.cart.filter(item => item.id !== id);
        } catch (error) { throw error; }
    }
}