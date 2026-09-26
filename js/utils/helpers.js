// ==============================================================================
// ФАЙЛ: js/utils/helpers.js
// НАЗНАЧЕНИЕ: Библиотека изолированных функций (Валидация, UI, Звуки)
// ==============================================================================

export function validateProductData(name, count, days, exactDate) {
    if (!name.trim()) return { valid: false, error: 'Введите название продукта.' };
    if (isNaN(count) || count <= 0) return { valid: false, error: 'Укажите корректное количество.' };
    if (!days && !exactDate) return { valid: false, error: 'Укажите срок годности в днях ИЛИ выберите дату.' };
    return { valid: true };
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 max-w-xs sm:max-w-md w-full z-50';

    let icon = '💡';
    if (type === 'error') { toast.classList.add('bg-red-500'); icon = '🚨'; }
    else if (type === 'success') { toast.classList.add('bg-green-500'); icon = '✅'; }
    else { toast.classList.add('bg-blue-600'); }

    toast.innerHTML = `<span class="text-xl">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-10');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

export function playSound(type) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const playTone = (freq, start, dur) => {
            const osc = ctx.createOscillator(); const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
            gain.gain.linearRampToValueAtTime(0, start + dur);
            osc.start(start); osc.stop(start + dur);
        };
        const now = ctx.currentTime;
        if (type === 'add') playTone(880, now, 0.15);
        else if (type === 'remove') { playTone(523, now, 0.15); playTone(440, now + 0.2, 0.15); }
    } catch(e) {}
}

export function getFormData() {
    return {
        name: document.getElementById('p-name').value.trim(),
        category: document.getElementById('p-category').value,
        count: document.getElementById('p-count').value,
        unit: document.getElementById('p-unit').value,
        exactDate: document.getElementById('p-date').value,
        finalDays: document.getElementById('p-days').value,
        price: document.getElementById('p-price').value,
        currency: document.getElementById('p-currency').value,
        composition: document.getElementById('p-composition').value,
        note: document.getElementById('p-note').value,
        isPerishable: document.getElementById('p-perishable').checked,
        isFrozen: document.getElementById('p-frozen').checked,
        isCooked: document.getElementById('p-cooked').checked
    };
}

export function clearAddForm(datePicker) {
    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    if (datePicker) datePicker.clear();
    document.getElementById('p-price').value = '';
    document.getElementById('p-composition').value = '';
    document.getElementById('p-note').value = '';
    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;
    document.getElementById('p-cooked').checked = false;
    document.getElementById('advanced-settings').classList.add('hidden');
}

export function fillAddForm(batch, datePicker) {
    document.getElementById('advanced-settings').classList.remove('hidden');
    document.getElementById('p-name').value = batch.name;
    document.getElementById('p-category').value = batch.category;
    document.getElementById('p-count').value = batch.count;
    document.getElementById('p-unit').value = batch.unit;
    document.getElementById('p-currency').value = batch.currency || 'RUB';

    if (batch.expirationDate) {
        const expDate = new Date(batch.expirationDate);
        const yyyy = expDate.getFullYear();
        const mm = String(expDate.getMonth() + 1).padStart(2, '0');
        const dd = String(expDate.getDate()).padStart(2, '0');
        if (datePicker) datePicker.setDate(`${yyyy}-${mm}-${dd}`);
    } else {
        if (datePicker) datePicker.clear();
    }

    document.getElementById('p-days').value = '';
    document.getElementById('p-price').value = batch.price || '';
    document.getElementById('p-composition').value = batch.composition || '';
    document.getElementById('p-note').value = batch.note || '';
    document.getElementById('p-perishable').checked = batch.isPerishable || false;
    document.getElementById('p-frozen').checked = batch.isFrozen || false;
    document.getElementById('p-cooked').checked = batch.isCooked || false;
}

export async function executeConsumption(batch, amount, fridgeModel, analyticsModel) {
    if (amount >= batch.count) {
        await analyticsModel.recordConsumption(batch.count);
        await fridgeModel.removeBatch(batch.id);
    } else {
        await analyticsModel.recordConsumption(amount);
        await fridgeModel.updateFullBatch(batch.id, { count: batch.count - amount });
    }
}

export function formatAiResponse(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}