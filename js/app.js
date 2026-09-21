// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller). Управляет логикой и связью UI с Firebase.
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData, showToast } from './utils/helpers.js';
import { askGeminiRecipe } from './utils/aiChef.js';
import { exportToCSV, importFromCSV } from './utils/csvManager.js';
import { initScanner } from './utils/barcodeScanner.js';
import { guessExpirationDays } from './utils/gostDB.js';
import { TRANSLATIONS, t } from './utils/translations.js';

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
const adminPanel = document.getElementById('admin-panel');
const rightsPanel = document.getElementById('rights-panel');

roleSelector.value = currentRole;

const savedName = localStorage.getItem('smart_fridge_username');
if (savedName) userNameInput.value = savedName;

userNameInput.addEventListener('input', (e) => {
    localStorage.setItem('smart_fridge_username', e.target.value.trim());
});

function applyTranslations(lang) {
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    loaderOverlay.classList.remove('hidden');

    setTimeout(() => {
        document.body.dir = dict.dir;
        document.documentElement.lang = lang;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.innerHTML = dict[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });

        updateUI();
        loaderOverlay.classList.add('hidden');
    }, 400);
}

langSelector.addEventListener('change', (e) => {
    window.appLang = e.target.value;
    applyTranslations(window.appLang);
});

function updateUI() {
    const perms = PERMISSIONS[currentRole];
    adminPanel.classList.toggle('hidden', currentRole !== 'admin');
    rightsPanel.classList.toggle('hidden', currentRole !== 'admin');
    addFormPanel.classList.toggle('hidden', !perms.canAdd);

    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, perms);
    renderAnalytics(analytics.getStats());
}

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

// ==============================================================================
// ЛОГИКА ОКНА ПРЕВЬЮ СКАНЕРА
// ==============================================================================
const previewModal = document.getElementById('scan-preview-modal');
const previewName = document.getElementById('preview-name');
const previewBarcode = document.getElementById('preview-barcode');
const previewImg = document.getElementById('preview-img');
const previewIngredients = document.getElementById('preview-ingredients');
const previewIngredientsBox = document.getElementById('preview-ingredients-box');

let scannedProductTemp = null;

const startBarcodeScanner = initScanner((productData) => {
    if (productData && productData.name) {
        scannedProductTemp = productData;
        previewName.textContent = productData.name;
        previewBarcode.textContent = `${t('scan_code')}: ${productData.barcode}`;

        if (productData.image) {
            previewImg.src = productData.image;
            previewImg.classList.remove('hidden');
        } else {
            previewImg.classList.add('hidden');
        }

        if (productData.ingredients) {
            previewIngredients.textContent = productData.ingredients;
            previewIngredientsBox.classList.remove('hidden');
        } else {
            previewIngredientsBox.classList.add('hidden');
        }

        previewModal.classList.remove('hidden');
    } else {
        inputName.focus();
    }
});

document.getElementById('btn-scan-barcode').addEventListener('click', startBarcodeScanner);

// Кнопки внутри окна превью
document.getElementById('btn-preview-add').addEventListener('click', () => {
    previewModal.classList.add('hidden');
    if (scannedProductTemp) {
        inputName.value = scannedProductTemp.name;
        if (scannedProductTemp.ingredients) {
            document.getElementById('p-composition').value = scannedProductTemp.ingredients.substring(0, 100);
            advancedSettings.classList.remove('hidden'); // Открываем настройки, чтобы показать состав
        }
        const days = guessExpirationDays(scannedProductTemp.name, inputCategory.value);
        if (days) inputDays.value = days;
        inputCount.focus(); // Предлагаем сразу ввести количество
    }
});

document.getElementById('btn-preview-next').addEventListener('click', () => {
    previewModal.classList.add('hidden');
    startBarcodeScanner();
});

document.getElementById('btn-preview-fake').addEventListener('click', () => {
    previewModal.classList.add('hidden');
    showToast(t('fake_alert') || 'Жалоба отправлена! Сканируем дальше...', 'info');
    startBarcodeScanner();
});

// ==============================================================================

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
    const price = document.getElementById('p-price').value;
    const composition = document.getElementById('p-composition').value;
    const note = document.getElementById('p-note').value;
    const isPerishable = document.getElementById('p-perishable').checked;
    const isFrozen = document.getElementById('p-frozen').checked;
    const isCooked = document.getElementById('p-cooked').checked;

    let finalDays = inputDays.value;
    const validationResult = validateProductData(name, count, finalDays, exactDate);
    if (!validationResult.valid) { showToast(validationResult.error, 'error'); return; }

    btnAdd.disabled = true;
    btnAdd.textContent = '⏳ ...';

    try {
        await fridge.addBatch(name, category, count, unit, finalDays, exactDate, isPerishable, isFrozen, isCooked, price, composition, note);
        showToast('Добавлено', 'success');

        inputName.value = ''; inputCount.value = ''; inputDays.value = ''; inputDate.value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-composition').value = '';
        document.getElementById('p-note').value = '';
        document.getElementById('p-perishable').checked = false;
        document.getElementById('p-frozen').checked = false;
        document.getElementById('p-cooked').checked = false;

        advancedSettings.classList.add('hidden');
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