// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// ЧТО ИЗМЕНЕНО: Добавлен парсинг data-i18n-placeholder для текстовых полей.
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData, showToast } from './utils/helpers.js';
import { askGeminiRecipe } from './utils/aiChef.js';
import { initScanner } from './utils/barcodeScanner.js';
import { guessExpirationDays } from './utils/gostDB.js';
import { TRANSLATIONS } from './utils/translations.js';

const PASSWORDS = { admin: 'admin2026', user: '1234' };
const PERMISSIONS = {
    admin: { canAdd: true, canTake: true, canWaste: true },
    user:  { canAdd: true, canTake: true, canWaste: true },
    guest: { canAdd: true, canTake: false, canWaste: false }
};

const fridge = new FridgeModel();
const analytics = new AnalyticsModel();

let currentRole = 'user';
window.appLang = 'ru';

const roleSelector = document.getElementById('role-selector');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');
const inputName = document.getElementById('p-name');
const inputCategory = document.getElementById('p-category');
const inputUnit = document.getElementById('p-unit');
const inputCount = document.getElementById('p-count');
const inputDays = document.getElementById('p-days');
const inputDate = document.getElementById('p-date');
const userNameInput = document.getElementById('user-name-input');
const langSelector = document.getElementById('lang-selector');
const loaderOverlay = document.getElementById('loader-overlay');

roleSelector.value = currentRole;

const savedName = localStorage.getItem('smart_fridge_username');
if (savedName) userNameInput.value = savedName;

userNameInput.addEventListener('input', (e) => {
    localStorage.setItem('smart_fridge_username', e.target.value.trim());
});

// ПЕРЕВОДЧИК ИНТЕРФЕЙСА
function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    loaderOverlay.classList.remove('hidden');

    setTimeout(() => {
        document.body.dir = dict.dir;

        // 1. Переводим обычный текст и опции
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerHTML = dict[key];
        });

        // 2. Переводим Placeholders (серый текст в полях ввода)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });

        updateUI(); // Перерисовываем карточки
        loaderOverlay.classList.add('hidden');
    }, 400);
}

langSelector.addEventListener('change', (e) => {
    window.appLang = e.target.value;
    applyTranslations(window.appLang);
});

inputName.addEventListener('blur', () => {
    const nameVal = inputName.value.trim();
    const catVal = inputCategory.value;
    if (nameVal && !inputDays.value && !inputDate.value) {
        const days = guessExpirationDays(nameVal, catVal);
        if (days) {
            inputDays.value = days;
            inputDays.classList.add('bg-green-100', 'transition', 'duration-500');
            setTimeout(() => inputDays.classList.remove('bg-green-100'), 1500);
        }
    }
});

function updateUI() {
    const perms = PERMISSIONS[currentRole];
    addFormPanel.classList.toggle('hidden', !perms.canAdd);

    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, perms);
    renderAnalytics(analytics.getStats());
}

inputDays.addEventListener('input', () => { if (inputDays.value !== '') inputDate.value = ''; });
inputDate.addEventListener('input', () => { if (inputDate.value !== '') inputDays.value = ''; });

roleSelector.addEventListener('change', (event) => {
    const selectedRole = event.target.value;
    if (selectedRole === 'admin') {
        if (prompt('Пароль:') !== PASSWORDS.admin) {
            showToast('Доступ запрещен', 'error');
            roleSelector.value = currentRole;
            return;
        }
    }
    currentRole = selectedRole;
    updateUI();
});

const btnToggleAdvanced = document.getElementById('btn-toggle-advanced');
const advancedSettings = document.getElementById('advanced-settings');
btnToggleAdvanced.addEventListener('click', () => {
    advancedSettings.classList.toggle('hidden');
});

const startBarcodeScanner = initScanner((productName) => {
    if (productName) {
        inputName.value = productName;
        const days = guessExpirationDays(productName, inputCategory.value);
        if (days && !inputDays.value && !inputDate.value) inputDays.value = days;
    }
    inputName.focus();
});
document.getElementById('btn-scan-barcode').addEventListener('click', startBarcodeScanner);

async function handleProductAction(event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const batch = fridge.getBatchById(id);
    if (!batch) return;

    if (action === 'consume' && PERMISSIONS[currentRole].canTake) {
        const amountStr = prompt(`Сколько "${batch.unit}" взять? (Доступно: ${batch.count})`, "1");
        if (amountStr !== null) {
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                if (amount >= batch.count) {
                    await analytics.recordConsumption(batch.count);
                    await fridge.removeBatch(id);
                } else {
                    await analytics.recordConsumption(amount);
                    await fridge.updateFullBatch(id, { count: batch.count - amount });
                }
                updateUI();
            }
        }
    } else if (action === 'waste' && PERMISSIONS[currentRole].canWaste) {
        if (confirm(`Выбросить "${batch.name}"?`)) {
            await analytics.recordWaste(batch.count, batch.price);
            await fridge.removeBatch(id);
            updateUI();
        }
    }
}
document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);

btnAdd.addEventListener('click', async () => {
    if (!PERMISSIONS[currentRole].canAdd) return;

    const name = inputName.value;
    const category = inputCategory.value;
    const count = inputCount.value;
    const unit = inputUnit.value;
    const exactDate = inputDate.value;

    let finalDays = inputDays.value;
    const validationResult = validateProductData(name, count, finalDays, exactDate);
    if (!validationResult.valid) { showToast(validationResult.error, 'error'); return; }

    btnAdd.disabled = true;
    btnAdd.textContent = '⏳ ...';

    try {
        await fridge.addBatch(name, category, count, unit, finalDays, exactDate, false, false, false, 0, '', '');
        showToast('Добавлено', 'success');

        inputName.value = ''; inputCount.value = ''; inputDays.value = ''; inputDate.value = '';
        updateUI();
    } catch (error) {
        showToast('Ошибка', 'error');
    } finally {
        btnAdd.disabled = false;
        btnAdd.textContent = '➕';
    }
});

async function initApp() {
    try {
        await fridge.fetchBatchesFromCloud();
        await analytics.loadFromCloud();
        updateUI();
    } catch (error) {
        updateUI();
    }
}
initApp();