// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// ЧТО ИСПРАВЛЕНО: ВОССТАНОВЛЕНА ЛОГИКА РЕЙТИНГОВ (ЗВЕЗДЫ) И ИНСТРУКЦИЙ!
// Ни одной строчки не потеряно. Полная интеграция всех модулей.
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData, showToast } from './utils/helpers.js';
import { askGeminiRecipe, askGeminiProductInfo } from './utils/aiChef.js';
import { exportToCSV, importFromCSV } from './utils/csvManager.js';
import { initScanner } from './utils/barcodeScanner.js';
import { guessExpirationDays } from './utils/gostDB.js';
import { TRANSLATIONS, t } from './utils/translations.js';

const PASSWORDS = { admin: 'admin2026', user: '1234' };
const PERMISSIONS = {
    admin: { canAdd: true, canTake: true, canWaste: true },
    user:  { canAdd: true, canTake: true, canWaste: true },
    guest: { canAdd: true, canTake: false, canWaste: false },
    child: { canAdd: false, canTake: false, canWaste: false }
};

const fridge = new FridgeModel();
const analytics = new AnalyticsModel();

let currentRole = 'user';
let editingBatchId = null;
window.appLang = 'ru';

// DOM Элементы
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
const apiKeyInput = document.getElementById('api-key-input');
const btnExport = document.getElementById('btn-export-csv');
const btnImport = document.getElementById('btn-import-csv');
const inputCsv = document.getElementById('input-csv');
const chkGuestTake = document.getElementById('perm-guest-take');
const chkGuestWaste = document.getElementById('perm-guest-waste');
const chkChildTake = document.getElementById('perm-child-take');

roleSelector.value = currentRole;

const savedName = localStorage.getItem('smart_fridge_username');
if (savedName) userNameInput.value = savedName;
const savedKey = sessionStorage.getItem('gemini_api_key');
if (savedKey) apiKeyInput.value = savedKey;

userNameInput.addEventListener('input', (e) => {
    localStorage.setItem('smart_fridge_username', e.target.value.trim());
});

let datePicker = null;

// ==============================================================================
// ЛОКАЛИЗАЦИЯ И КАЛЕНДАРЬ
// ==============================================================================
function applyTranslations(lang) {
    localStorage.setItem('appLang', lang);
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

        if (datePicker) datePicker.destroy();
        datePicker = flatpickr("#p-date", {
            dateFormat: "Y-m-d",
            locale: lang === 'en' ? 'default' : lang
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

// Умные сроки
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

// Роли
roleSelector.addEventListener('change', (event) => {
    const selectedRole = event.target.value;
    if (selectedRole === 'admin') {
        if (prompt('Пароль (admin2026):') !== PASSWORDS.admin) {
            showToast('Доступ запрещен', 'error');
            roleSelector.value = currentRole;
            return;
        }
    }
    currentRole = selectedRole;
    updateUI();
});

if (chkGuestTake) chkGuestTake.addEventListener('change', (e) => { PERMISSIONS.guest.canTake = e.target.checked; updateUI(); });
if (chkGuestWaste) chkGuestWaste.addEventListener('change', (e) => { PERMISSIONS.guest.canWaste = e.target.checked; updateUI(); });
if (chkChildTake) chkChildTake.addEventListener('change', (e) => { PERMISSIONS.child.canTake = e.target.checked; updateUI(); });

const btnToggleAdvanced = document.getElementById('btn-toggle-advanced');
const advancedSettings = document.getElementById('advanced-settings');
btnToggleAdvanced.addEventListener('click', () => {
    advancedSettings.classList.toggle('hidden');
});

// ==============================================================================
// ВОССТАНОВЛЕНО: ЛОГИКА ИНСТРУКЦИИ (ONBOARDING)
// ==============================================================================
const modalInstruction = document.getElementById('instruction-modal');
const btnInstruction = document.getElementById('btn-instruction');
const btnCloseInstruction = document.getElementById('btn-close-instruction');
const btnUnderstand = document.getElementById('btn-understand');

if (btnInstruction && modalInstruction) {
    function openInstruction() { modalInstruction.classList.remove('hidden'); }
    function closeInstruction() {
        modalInstruction.classList.add('hidden');
        localStorage.setItem('fridge_instruction_seen', 'true');
    }
    btnInstruction.addEventListener('click', openInstruction);
    if (btnCloseInstruction) btnCloseInstruction.addEventListener('click', closeInstruction);
    if (btnUnderstand) btnUnderstand.addEventListener('click', closeInstruction);

    if (!localStorage.getItem('fridge_instruction_seen')) {
        openInstruction();
    }
}

// ==============================================================================
// ВОССТАНОВЛЕНО: ЛОГИКА РЕЙТИНГА И ОЦЕНОК (ЗВЕЗДЫ)
// ==============================================================================
const ratingModal = document.getElementById('rating-modal');
const btnCloseRating = document.getElementById('btn-close-rating');
const ratingStars = document.querySelectorAll('#rating-stars span');
const btnSubmitRating = document.getElementById('btn-submit-rating');
const ratingComment = document.getElementById('rating-comment');
const ratingMealName = document.getElementById('rating-meal-name');

let currentRatingBatch = null;
let selectedStars = 0;

function closeRatingModal() {
    ratingModal.classList.add('hidden');
    currentRatingBatch = null;
    selectedStars = 0;
    ratingComment.value = '';
    updateStarsUI();
}

if (btnCloseRating) btnCloseRating.addEventListener('click', closeRatingModal);

function updateStarsUI() {
    ratingStars.forEach(star => {
        const val = parseInt(star.dataset.val);
        if (val <= selectedStars) {
            star.classList.replace('text-slate-200', 'text-orange-400');
        } else {
            star.classList.replace('text-orange-400', 'text-slate-200');
        }
    });
}

ratingStars.forEach(star => {
    star.addEventListener('click', (e) => {
        selectedStars = parseInt(e.target.dataset.val);
        updateStarsUI();
    });
});

if (btnSubmitRating) {
    btnSubmitRating.addEventListener('click', async () => {
        if (selectedStars === 0) {
            showToast('Пожалуйста, поставьте оценку от 1 до 5 звезд!', 'error');
            return;
        }
        if (!currentRatingBatch) return;

        let author = userNameInput.value.trim();
        if (!author) {
            author = prompt("Как вас зовут? Введите имя, чтобы семья знала, чей это отзыв:");
            if (author) {
                userNameInput.value = author;
                localStorage.setItem('smart_fridge_username', author);
            } else {
                author = 'Аноним';
            }
        }

        btnSubmitRating.disabled = true;
        btnSubmitRating.textContent = '⏳ Отправка...';

        try {
            await fridge.updateFullBatch(currentRatingBatch.id, {
                rating: selectedStars,
                ratingComment: ratingComment.value.trim(),
                ratingAuthor: author
            });
            showToast('⭐ Отзыв сохранен!', 'success');

            const batch = currentRatingBatch;
            closeRatingModal();
            promptAndConsume(batch); // Вызываем списание после оценки
        } catch(error) {
            showToast('❌ Ошибка связи с сервером', 'error');
        } finally {
            btnSubmitRating.disabled = false;
            btnSubmitRating.textContent = t('cooked_label') || 'Отправить';
        }
    });
}

// Вспомогательная функция для списания продукта
async function promptAndConsume(batch) {
    const amountStr = prompt(`Сколько "${batch.unit}" взять? (Доступно: ${batch.count})`, "1");
    if (amountStr !== null) {
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
            try {
                if (amount >= batch.count) {
                    await analytics.recordConsumption(batch.count);
                    await fridge.removeBatch(batch.id);
                } else {
                    await analytics.recordConsumption(amount);
                    await fridge.updateFullBatch(batch.id, { count: batch.count - amount });
                }
                updateUI();
            } catch (error) {
                showToast('❌ Ошибка связи с сервером', 'error');
            }
        }
    } else {
        updateUI();
    }
}

// ==============================================================================
// ЛОГИКА ОКНА ПРЕВЬЮ СКАНЕРА + ИИ
// ==============================================================================
const previewModal = document.getElementById('scan-preview-modal');
const previewName = document.getElementById('preview-name');
const previewBarcode = document.getElementById('preview-barcode');
const previewImg = document.getElementById('preview-img');
const previewIngredients = document.getElementById('preview-ingredients');
const previewIngredientsBox = document.getElementById('preview-ingredients-box');
const previewAiInsights = document.getElementById('preview-ai-insights');

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

        const apiKey = apiKeyInput.value.trim() || sessionStorage.getItem('gemini_api_key');
        if (apiKey) {
            previewAiInsights.classList.remove('hidden');
            previewAiInsights.innerHTML = `<div class="flex items-center gap-2"><span class="animate-spin text-xl">⏳</span> <b>${t('preview_ai_loading') || 'Анализ...'}</b></div>`;

            askGeminiProductInfo(apiKey, productData.name, window.appLang).then(info => {
                previewAiInsights.innerHTML = info;
            }).catch(() => {
                previewAiInsights.classList.add('hidden');
            });
        } else {
            previewAiInsights.classList.add('hidden');
        }

        previewModal.classList.remove('hidden');
    } else {
        inputName.focus();
    }
});

document.getElementById('btn-scan-barcode').addEventListener('click', startBarcodeScanner);

if (document.getElementById('btn-preview-add')) {
    document.getElementById('btn-preview-add').addEventListener('click', () => {
        previewModal.classList.add('hidden');
        if (scannedProductTemp) {
            inputName.value = scannedProductTemp.name;
            if (scannedProductTemp.ingredients) {
                document.getElementById('p-composition').value = scannedProductTemp.ingredients.substring(0, 100);
                advancedSettings.classList.remove('hidden');
            }
            const days = guessExpirationDays(scannedProductTemp.name, inputCategory.value);
            if (days) inputDays.value = days;
            inputCount.focus();
        }
    });
}

if (document.getElementById('btn-preview-next')) {
    document.getElementById('btn-preview-next').addEventListener('click', () => {
        previewModal.classList.add('hidden');
        startBarcodeScanner();
    });
}

if (document.getElementById('btn-preview-fake')) {
    document.getElementById('btn-preview-fake').addEventListener('click', () => {
        previewModal.classList.add('hidden');
        showToast(t('fake_alert') || 'Жалоба отправлена! Сканируем дальше...', 'info');
        startBarcodeScanner();
    });
}

// ==============================================================================
// ОБРАБОТКА ВСЕХ КНОПОК НА КАРТОЧКЕ (+, -, Изменить, Взять, Списать, Оценить)
// ==============================================================================
async function handleProductAction(event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const batch = fridge.getBatchById(id);
    if (!batch) return;

    // ВОССТАНОВЛЕНО: Вызов окна оценки
    if (action === 'rate-and-consume' && PERMISSIONS[currentRole].canTake) {
        currentRatingBatch = batch;
        ratingMealName.textContent = batch.name;
        ratingModal.classList.remove('hidden');
    }
    else if (action === 'increase' && PERMISSIONS[currentRole].canAdd) {
        await fridge.updateFullBatch(id, { count: batch.count + 1 });
        updateUI();
    }
    else if (action === 'decrease' && PERMISSIONS[currentRole].canTake) {
        if (batch.count > 1) {
            await analytics.recordConsumption(1);
            await fridge.updateFullBatch(id, { count: batch.count - 1 });
            updateUI();
        } else {
            if (confirm(`Выбросить или полностью съесть "${batch.name}"?`)) {
                await analytics.recordConsumption(1);
                await fridge.removeBatch(id);
                updateUI();
            }
        }
    }
    else if (action === 'consume' && PERMISSIONS[currentRole].canTake) {
        await promptAndConsume(batch);
    }
    else if (action === 'edit' && PERMISSIONS[currentRole].canAdd) {
        advancedSettings.classList.remove('hidden');
        inputName.value = batch.name;
        inputCategory.value = batch.category;
        inputCount.value = batch.count;
        inputUnit.value = batch.unit;

        const expDate = new Date(batch.expirationDate);
        const yyyy = expDate.getFullYear();
        const mm = String(expDate.getMonth() + 1).padStart(2, '0');
        const dd = String(expDate.getDate()).padStart(2, '0');

        if (datePicker) datePicker.setDate(`${yyyy}-${mm}-${dd}`);
        inputDays.value = '';

        document.getElementById('p-price').value = batch.price || '';
        document.getElementById('p-composition').value = batch.composition || '';
        document.getElementById('p-note').value = batch.note || '';
        document.getElementById('p-perishable').checked = batch.isPerishable;
        document.getElementById('p-frozen').checked = batch.isFrozen;
        document.getElementById('p-cooked').checked = batch.isCooked || false;

        editingBatchId = id;
        btnAdd.textContent = '💾 Сохранить изменения';
        btnAdd.classList.replace('bg-green-500', 'bg-blue-600');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (action === 'waste' && PERMISSIONS[currentRole].canWaste) {
        if (confirm(`Выбросить "${batch.name}"?`)) {
            await analytics.recordWaste(batch.count, batch.price);
            await fridge.removeBatch(id);
            updateUI();
        }
    }
}

document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);

// ==============================================================================
// ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ
// ==============================================================================
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
        if (editingBatchId) {
            const msInDay = 24 * 60 * 60 * 1000;
            const expirationDate = exactDate ? new Date(exactDate).getTime() : Date.now() + (finalDays * msInDay);
            await fridge.updateFullBatch(editingBatchId, {
                name, category, count: parseFloat(count), unit, expirationDate, isPerishable, isFrozen, isCooked, price, composition, note
            });
            editingBatchId = null;
            btnAdd.classList.replace('bg-blue-600', 'bg-green-500');
            showToast('Обновлено', 'success');
        } else {
            await fridge.addBatch(name, category, count, unit, finalDays, exactDate, isPerishable, isFrozen, isCooked, price, composition, note);
            showToast('Добавлено', 'success');
        }

        inputName.value = ''; inputCount.value = ''; inputDays.value = '';
        if (datePicker) datePicker.clear();
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

// CSV
if (btnExport) btnExport.addEventListener('click', () => { exportToCSV(fridge.batches); });
if (btnImport) btnImport.addEventListener('click', () => { inputCsv.click(); });
if (inputCsv) inputCsv.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) { importFromCSV(file, fridge, updateUI); inputCsv.value = ''; }
});

// AI Chef
async function handleAiRequest(mode) {
    const apiKey = apiKeyInput.value.trim() || sessionStorage.getItem('gemini_api_key');
    if (!apiKey) { showToast('Введите ключ Gemini в Панели Админа.', 'error'); return; }
    sessionStorage.setItem('gemini_api_key', apiKey);

    const responseBox = document.getElementById('ai-response-box');
    responseBox.classList.remove('hidden');
    responseBox.innerHTML = '<i>⏳ Нейросеть составляет меню...</i>';

    const recipe = await askGeminiRecipe(apiKey, fridge.getProcessedBatches(), mode);
    responseBox.innerHTML = recipe.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}
if (document.getElementById('btn-ask-ai-rescue')) document.getElementById('btn-ask-ai-rescue').addEventListener('click', () => handleAiRequest('rescue'));
if (document.getElementById('btn-ask-ai-all')) document.getElementById('btn-ask-ai-all').addEventListener('click', () => handleAiRequest('all'));

// Старт
async function initApp() {
    try {
        await fridge.fetchBatchesFromCloud();
        await analytics.loadFromCloud();
        applyTranslations(window.appLang);
    } catch (error) {
        applyTranslations(window.appLang);
    }
}
initApp().catch(console.error);