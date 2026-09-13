// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData, showToast } from './utils/helpers.js';
import { askGeminiRecipe } from './utils/aiChef.js';
import { exportToCSV, importFromCSV } from './utils/csvManager.js';

const PASSWORDS = { admin: 'admin2026', user: '1234' };
const PERMISSIONS = {
    admin: { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: true, canManageRights: true },
    user:  { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: false, canManageRights: true },
    guest: { canAdd: true, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false },
    child: { canAdd: false, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false }
};

const fridge = new FridgeModel();
const analytics = new AnalyticsModel();

let currentRole = 'guest';
let editingBatchId = null;

const roleSelector = document.getElementById('role-selector');
const adminPanel = document.getElementById('admin-panel');
const rightsPanel = document.getElementById('rights-panel');
const analyticsPanel = document.getElementById('analytics-panel');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');
const inputUnit = document.getElementById('p-unit');
const inputCount = document.getElementById('p-count');
const inputDays = document.getElementById('p-days');
const inputDate = document.getElementById('p-date');
const apiKeyInput = document.getElementById('api-key-input');

const btnExport = document.getElementById('btn-export-csv');
const btnImport = document.getElementById('btn-import-csv');
const inputCsv = document.getElementById('input-csv');

const chkGuestTake = document.getElementById('perm-guest-take');
const chkGuestWaste = document.getElementById('perm-guest-waste');
const chkChildTake = document.getElementById('perm-child-take');

roleSelector.value = currentRole;

const savedKey = sessionStorage.getItem('gemini_api_key');
if (savedKey) apiKeyInput.value = savedKey;

function updateUI() {
    const perms = PERMISSIONS[currentRole];
    adminPanel.classList.toggle('hidden', !perms.canSeeAdmin);
    rightsPanel.classList.toggle('hidden', !perms.canManageRights);
    analyticsPanel.classList.toggle('hidden', !perms.canSeeAnalytics);
    addFormPanel.classList.toggle('hidden', !perms.canAdd);

    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, perms);
    renderAnalytics(analytics.getStats());
}

inputDays.addEventListener('input', () => { if (inputDays.value !== '') inputDate.value = ''; });
inputDate.addEventListener('input', () => { if (inputDate.value !== '') inputDays.value = ''; });

roleSelector.addEventListener('change', (event) => {
    const selectedRole = event.target.value;
    let isAuthenticated = true;

    if (selectedRole === 'admin') {
        const pass = prompt('Вход для Администратора. Введите пароль:');
        if (pass !== PASSWORDS.admin) isAuthenticated = false;
    } else if (selectedRole === 'user') {
        const pass = prompt('Вход для Пользователя. Введите пароль:');
        if (pass !== PASSWORDS.user) isAuthenticated = false;
    }

    if (isAuthenticated) {
        currentRole = selectedRole;
        if (currentRole !== 'admin') {
            sessionStorage.removeItem('gemini_api_key');
            apiKeyInput.value = '';
        }
        updateUI();
        showToast(`Вы вошли как: ${selectedRole.toUpperCase()}`, 'success');
    } else {
        showToast('Неверный пароль! Доступ запрещен.', 'error');
        roleSelector.value = currentRole;
    }
});

chkGuestTake.addEventListener('change', (e) => { PERMISSIONS.guest.canTake = e.target.checked; updateUI(); });
chkGuestWaste.addEventListener('change', (e) => { PERMISSIONS.guest.canWaste = e.target.checked; updateUI(); });
chkChildTake.addEventListener('change', (e) => { PERMISSIONS.child.canTake = e.target.checked; updateUI(); });

function handleProductAction(event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (!id || !action) return;
    const batch = fridge.getBatchById(id);
    if (!batch) return;
    const perms = PERMISSIONS[currentRole];

    if (action === 'consume' && perms.canTake) {
        const amountStr = prompt(`Сколько "${batch.unit}" взять? (Доступно: ${batch.count})`, "1");
        if (amountStr !== null) {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                if (amount >= batch.count) {
                    analytics.recordConsumption(batch.count);
                    fridge.removeBatch(id);
                } else {
                    analytics.recordConsumption(amount);
                    fridge.updateBatchCount(id, batch.count - amount);
                }
                updateUI();
            } else { showToast('Введите корректное число больше нуля.', 'error'); }
        }
    }
    else if (action === 'waste' && perms.canWaste) {
        if (confirm(`Вы уверены, что хотите выбросить "${batch.name}"?`)) {
            analytics.recordWaste(batch.count, batch.price);
            fridge.removeBatch(id);
            updateUI();
        }
    }
    else if (action === 'edit' && perms.canAdd) {
        document.getElementById('p-name').value = batch.name;
        document.getElementById('p-category').value = batch.category;
        document.getElementById('p-count').value = batch.count;
        document.getElementById('p-unit').value = batch.unit;

        // Исправление бага с датой: конвертируем timestamp обратно в строку для инпута
        const expDate = new Date(batch.expirationDate);
        const yyyy = expDate.getFullYear();
        const mm = String(expDate.getMonth() + 1).padStart(2, '0');
        const dd = String(expDate.getDate()).padStart(2, '0');

        document.getElementById('p-date').value = `${yyyy}-${mm}-${dd}`;
        document.getElementById('p-days').value = '';

        document.getElementById('p-price').value = batch.price || '';
        document.getElementById('p-note').value = batch.note || '';
        document.getElementById('p-perishable').checked = batch.isPerishable;
        document.getElementById('p-frozen').checked = batch.isFrozen;

        editingBatchId = id;
        btnAdd.textContent = '💾 Сохранить изменения';
        btnAdd.classList.replace('bg-green-500', 'bg-blue-600');
        btnAdd.classList.replace('hover:bg-green-600', 'hover:bg-blue-700');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);
document.getElementById('warning-list').addEventListener('click', handleProductAction);

inputUnit.addEventListener('change', (event) => {
    const val = event.target.value;
    if (val === 'шт' || val === 'упак') {
        inputCount.step = '1'; inputCount.placeholder = '1, 2...';
    } else if (val === 'гр' || val === 'мл') {
        inputCount.step = '1'; inputCount.placeholder = '100, 250...';
    } else if (val === 'кг' || val === 'л') {
        inputCount.step = '0.1'; inputCount.placeholder = '1.5, 0.2...';
    }
});

btnAdd.addEventListener('click', () => {
    if (!PERMISSIONS[currentRole].canAdd) return;

    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const count = document.getElementById('p-count').value;
    const unit = document.getElementById('p-unit').value;
    const days = document.getElementById('p-days').value;
    const exactDate = document.getElementById('p-date').value;
    const price = document.getElementById('p-price').value;
    const note = document.getElementById('p-note').value;
    const isPerishable = document.getElementById('p-perishable').checked;
    const isFrozen = document.getElementById('p-frozen').checked;

    const validationResult = validateProductData(name, count, days, exactDate);
    if (!validationResult.valid) { showToast(validationResult.error, 'error'); return; }

    if (editingBatchId) {
        const msInDay = 24 * 60 * 60 * 1000;
        const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (days * msInDay);
        fridge.updateFullBatch(editingBatchId, {
            name, category, count: parseFloat(count), unit,
            expirationDate, isPerishable, isFrozen, price: parseFloat(price) || 0, note
        });
        editingBatchId = null;
        btnAdd.textContent = 'В холодильник';
        btnAdd.classList.replace('bg-blue-600', 'bg-green-500');
        btnAdd.classList.replace('hover:bg-blue-700', 'hover:bg-green-600');
        showToast('Изменения сохранены', 'success');
    } else {
        fridge.addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, price, note);
        showToast('Продукт добавлен', 'success');
    }

    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    document.getElementById('p-date').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-note').value = '';
    document.getElementById('p-unit').value = 'шт';
    inputCount.step = '1'; inputCount.placeholder = '1, 2...';
    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;

    updateUI();
});

const v2Stubs = document.querySelectorAll('.v2-stub');
v2Stubs.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('🚀 Функция будет доступна в Версии 2.0!', 'info');
    });
});

btnExport.addEventListener('click', () => { exportToCSV(fridge.batches); });
btnImport.addEventListener('click', () => { inputCsv.click(); });
inputCsv.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { importFromCSV(file, fridge, updateUI); inputCsv.value = ''; }
});

async function handleAiRequest(mode) {
    const apiKey = apiKeyInput.value.trim() || sessionStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Введите ваш API-ключ Gemini в Панели Админа.', 'error'); return; }

    sessionStorage.setItem('gemini_api_key', apiKey);

    const responseBox = document.getElementById('ai-response-box');
    const btnRescue = document.getElementById('btn-ask-ai-rescue');
    const btnAll = document.getElementById('btn-ask-ai-all');

    responseBox.classList.remove('hidden');
    responseBox.innerHTML = '<i>⏳ Нейросеть составляет меню из 5-7 рецептов... Пожалуйста, подождите.</i>';
    btnRescue.disabled = true;
    btnAll.disabled = true;

    const recipe = await askGeminiRecipe(apiKey, fridge.getProcessedBatches(), mode);

    let formattedRecipe = recipe
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>')
        .replace(/---/g, '<hr class="my-4 border-indigo-100">');

    responseBox.innerHTML = formattedRecipe;
    btnRescue.disabled = false;
    btnAll.disabled = false;
}

document.getElementById('btn-ask-ai-rescue').addEventListener('click', () => handleAiRequest('rescue'));
document.getElementById('btn-ask-ai-all').addEventListener('click', () => handleAiRequest('all'));

updateUI();