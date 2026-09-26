// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Мозг приложения).
//
// ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ:
// 1. Управляет Авторизацией Firebase и правами доступа (Админ/Юзер/Ребенок).
// 2. Инициализирует мультиязычность, защищая от ошибок "undefined" при переводах.
// 3. Отлавливает клики (добавление, списание, корзина, сканер).
// 4. Связывает интерфейс (UI) с базой данных (FridgeModel) и аналитикой.
// 5. Обрабатывает вызовы к нейросети (Gemini AI) с учетом языка.
// 6. Проверяет iOS устройства для вывода баннера PWA.
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderCartContents, renderAnalytics } from './ui/render.js';
import { showToast, playSound, getFormData, validateProductData, clearAddForm, fillAddForm, executeConsumption, formatAiResponse } from './utils/helpers.js';
import { askGeminiRecipe, askGeminiProductInfo, askGeminiMissingIngredients } from './utils/aiChef.js';
import { exportToCSV, importFromCSV } from './utils/csvManager.js';
import { initScanner } from './utils/barcodeScanner.js';
import { guessExpirationDays } from './utils/gostDB.js';
import { TRANSLATIONS, t } from './utils/translations.js';

import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// --- БАЗОВЫЕ НАСТРОЙКИ ---
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
let datePicker = null;
let currentAuthEmail = 'Аноним';

// DOM Элементы
const roleSelector = document.getElementById('role-selector');
const userNameInput = document.getElementById('user-name-input');
const apiKeyInput = document.getElementById('api-key-input');
const authModal = document.getElementById('auth-modal');
const loaderOverlay = document.getElementById('loader-overlay');

roleSelector.value = currentRole;
userNameInput.value = localStorage.getItem('smart_fridge_username') || '';
apiKeyInput.value = localStorage.getItem('gemini_api_key') || '';

userNameInput.addEventListener('input', (e) => localStorage.setItem('smart_fridge_username', e.target.value.trim()));

// ==========================================
// БЛОК 1: АВТОРИЗАЦИЯ FIREBASE (Login / Register)
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        authModal.classList.add('hidden');
        currentAuthEmail = user.email;
        if (!userNameInput.value) {
            userNameInput.value = user.email.split('@')[0];
            localStorage.setItem('smart_fridge_username', userNameInput.value);
        }
        initApp();
    } else {
        authModal.classList.remove('hidden');
    }
});

document.getElementById('btn-auth-login')?.addEventListener('click', async (e) => {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) return showToast('Введите email и пароль', 'error');

    const btn = e.target;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Обработка...';

    try {
        await signInWithEmailAndPassword(auth, email, pass);
        showToast('Успешный вход!', 'success');
    } catch (error) {
        // Автоматическая регистрация при отсутствии пользователя
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
            try {
                await createUserWithEmailAndPassword(auth, email, pass);
                showToast('Регистрация успешна!', 'success');
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') showToast('Email уже занят', 'error');
                else if (err.code === 'auth/weak-password') showToast('Пароль слишком простой (минимум 6 символов)', 'error');
                else showToast('Ошибка регистрации: ' + err.message, 'error');
            }
        } else if (error.code === 'auth/operation-not-allowed') {
            showToast('Включите вход по Email в консоли Firebase!', 'error');
        } else {
            showToast('Ошибка: ' + error.message, 'error');
        }
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});

document.getElementById('btn-auth-guest')?.addEventListener('click', () => {
    authModal.classList.add('hidden');
    showToast('Локальный режим активирован', 'info');
    initApp();
});

// ==========================================
// БЛОК 2: НАСТРОЙКИ API КЛЮЧА (Сохранение в localStorage)
// ==========================================
document.getElementById('btn-open-api')?.addEventListener('click', () => {
    document.getElementById('api-modal').classList.remove('hidden');
});
document.getElementById('btn-close-api')?.addEventListener('click', () => {
    document.getElementById('api-modal').classList.add('hidden');
});
document.getElementById('btn-save-api')?.addEventListener('click', () => {
    const val = apiKeyInput.value.trim();
    localStorage.setItem('gemini_api_key', val);
    showToast(t('api_saved', 'Ключ сохранен!'), 'success');
    document.getElementById('api-modal').classList.add('hidden');
});

// ==========================================
// БЛОК 3: PWA БАННЕР ДЛЯ APPLE IPHONE
// Выводит подсказку для пользователей iOS
// ==========================================
function checkIosBanner() {
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    };
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos() && !isInStandaloneMode()) {
        const iosBanner = document.getElementById('ios-install-banner');
        if (iosBanner && !localStorage.getItem('ios_banner_closed')) {
            iosBanner.classList.remove('hidden');
        }
    }
}
document.getElementById('btn-close-ios-banner')?.addEventListener('click', () => {
    document.getElementById('ios-install-banner').classList.add('hidden');
    localStorage.setItem('ios_banner_closed', 'true');
});

// ==========================================
// БЛОК 4: ЛОКАЛИЗАЦИЯ И КАЛЕНДАРЬ (С ЗАЩИТОЙ)
// ==========================================
function applyTranslations(lang) {
    localStorage.setItem('appLang', lang);
    const dict = TRANSLATIONS[lang];
    if (!dict) return;

    loaderOverlay.classList.remove('hidden');

    setTimeout(() => {
        document.body.dir = dict.dir;
        document.documentElement.lang = lang;

        // Безопасная подстановка текста без undefined
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                el.innerHTML = dict[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key] !== undefined) {
                el.placeholder = dict[key];
            }
        });

        if (datePicker) datePicker.destroy();
        datePicker = flatpickr("#p-date", { dateFormat: "Y-m-d", locale: lang === 'en' ? 'default' : lang });

        updateUI();
        loaderOverlay.classList.add('hidden');
    }, 400);
}

document.getElementById('lang-selector').addEventListener('change', (e) => {
    window.appLang = e.target.value;
    applyTranslations(window.appLang);
});

function updateUI() {
    const perms = PERMISSIONS[currentRole];
    document.getElementById('rights-panel').classList.toggle('hidden', currentRole !== 'admin');
    document.getElementById('add-form-panel').classList.toggle('hidden', !perms.canAdd);

    renderFridgeContents(fridge.getProcessedBatches(), perms);
    if (document.getElementById('cart-items-container')) renderCartContents(fridge.cart, perms);
    renderAnalytics(analytics.getStats());
}

// ==========================================
// БЛОК 5: РОЛИ И УМНЫЕ СРОКИ ГОДНОСТИ
// ==========================================
roleSelector.addEventListener('change', (e) => {
    if (e.target.value === 'admin' && prompt('Пароль (admin2026):') !== PASSWORDS.admin) {
        showToast('Доступ запрещен', 'error');
        roleSelector.value = currentRole;
        return;
    }
    currentRole = e.target.value;
    updateUI();
});

['guest-take', 'guest-waste', 'child-take', 'child-waste'].forEach(id => {
    document.getElementById(`perm-${id}`)?.addEventListener('change', (e) => {
        const [role, action] = id.split('-');
        PERMISSIONS[role][action === 'take' ? 'canTake' : 'canWaste'] = e.target.checked;
        updateUI();
    });
});

document.getElementById('btn-toggle-advanced').addEventListener('click', () => {
    document.getElementById('advanced-settings').classList.toggle('hidden');
});

document.getElementById('p-name').addEventListener('blur', () => {
    const nameVal = document.getElementById('p-name').value.trim();
    const catVal = document.getElementById('p-category').value;
    const pDays = document.getElementById('p-days');
    if (nameVal && !pDays.value && !document.getElementById('p-date').value) {
        const days = guessExpirationDays(nameVal, catVal);
        if (days) {
            pDays.value = days;
            pDays.classList.add('bg-green-100', 'transition', 'duration-500');
            setTimeout(() => pDays.classList.remove('bg-green-100'), 1500);
        }
    }
});

// ==========================================
// БЛОК 6: ОКНО ИНСТРУКЦИИ И РЕЙТИНГ
// ==========================================
const modalInstruction = document.getElementById('instruction-modal');
if (modalInstruction) {
    const closeInstruction = () => { modalInstruction.classList.add('hidden'); localStorage.setItem('fridge_instruction_seen', 'true'); };
    document.getElementById('btn-instruction').addEventListener('click', () => modalInstruction.classList.remove('hidden'));
    document.getElementById('btn-close-instruction')?.addEventListener('click', closeInstruction);
    document.getElementById('btn-understand')?.addEventListener('click', closeInstruction);
    if (!localStorage.getItem('fridge_instruction_seen')) modalInstruction.classList.remove('hidden');
}

const ratingModal = document.getElementById('rating-modal');
const ratingStars = document.querySelectorAll('#rating-stars span');
let currentRatingBatch = null;
let selectedStars = 0;

function closeRatingModal() {
    ratingModal.classList.add('hidden');
    currentRatingBatch = null;
    selectedStars = 0;
    document.getElementById('rating-comment').value = '';
    ratingStars.forEach(star => star.classList.replace('text-orange-400', 'text-slate-200'));
}

document.getElementById('btn-close-rating')?.addEventListener('click', closeRatingModal);

ratingStars.forEach(star => {
    star.addEventListener('click', (e) => {
        selectedStars = parseInt(e.target.dataset.val);
        ratingStars.forEach(s => {
            if (parseInt(s.dataset.val) <= selectedStars) s.classList.replace('text-slate-200', 'text-orange-400');
            else s.classList.replace('text-orange-400', 'text-slate-200');
        });
    });
});

document.getElementById('btn-submit-rating')?.addEventListener('click', async (e) => {
    if (selectedStars === 0) return showToast('Поставьте оценку от 1 до 5 звезд!', 'error');
    if (!currentRatingBatch) return;

    let author = userNameInput.value.trim() || prompt("Как вас зовут?");
    if (author) { userNameInput.value = author; localStorage.setItem('smart_fridge_username', author); } else { author = 'Аноним'; }

    e.target.disabled = true; e.target.textContent = '⏳ Отправка...';

    try {
        await fridge.updateFullBatch(currentRatingBatch.id, { rating: selectedStars, ratingComment: document.getElementById('rating-comment').value.trim(), ratingAuthor: author });
        showToast('⭐ Отзыв сохранен!', 'success');
        const batch = currentRatingBatch;
        closeRatingModal();
        promptAndConsume(batch);
    } catch(error) { showToast('❌ Ошибка', 'error'); }
    finally { e.target.disabled = false; e.target.textContent = t('cooked_label', 'Отправить'); }
});

// ==========================================
// БЛОК 7: СКАНЕР ПРОДУКТОВ И ПРЕВЬЮ
// ==========================================
const previewModal = document.getElementById('scan-preview-modal');
let scannedProductTemp = null;

const startBarcodeScanner = initScanner((productData) => {
    if (productData && productData.name) {
        scannedProductTemp = productData;
        document.getElementById('preview-name').textContent = productData.name;
        document.getElementById('preview-barcode').textContent = `${t('scan_code', 'Код')}: ${productData.barcode}`;

        const img = document.getElementById('preview-img');
        if (productData.image) { img.src = productData.image; img.classList.remove('hidden'); } else { img.classList.add('hidden'); }

        const ingBox = document.getElementById('preview-ingredients-box');
        if (productData.ingredients) { document.getElementById('preview-ingredients').textContent = productData.ingredients; ingBox.classList.remove('hidden'); } else { ingBox.classList.add('hidden'); }

        // Фоновый запрос к ИИ для фактов
        const apiKey = localStorage.getItem('gemini_api_key');
        if (apiKey) {
            const aiBox = document.getElementById('preview-ai-insights');
            aiBox.classList.remove('hidden');
            aiBox.innerHTML = `<div class="flex items-center gap-2"><span class="animate-spin text-xl">⏳</span> <b>${t('preview_ai_loading', 'ИИ думает')}</b></div>`;
            askGeminiProductInfo(apiKey, productData.name, window.appLang).then(info => aiBox.innerHTML = info).catch(() => aiBox.classList.add('hidden'));
        }

        previewModal.classList.remove('hidden');
    } else {
        document.getElementById('p-name').focus();
    }
});

document.getElementById('btn-scan-barcode').addEventListener('click', startBarcodeScanner);
document.getElementById('btn-preview-next')?.addEventListener('click', () => { previewModal.classList.add('hidden'); startBarcodeScanner(); });
document.getElementById('btn-preview-fake')?.addEventListener('click', () => { previewModal.classList.add('hidden'); showToast(t('fake_alert', 'Жалоба отправлена'), 'info'); startBarcodeScanner(); });

// Перенос данных из превью в форму добавления
document.getElementById('btn-preview-add')?.addEventListener('click', () => {
    previewModal.classList.add('hidden');
    if (scannedProductTemp) {
        document.getElementById('p-name').value = scannedProductTemp.name;
        if (scannedProductTemp.ingredients) {
            document.getElementById('p-composition').value = scannedProductTemp.ingredients.substring(0, 100);
            document.getElementById('advanced-settings').classList.remove('hidden');
        }
        const days = guessExpirationDays(scannedProductTemp.name, document.getElementById('p-category').value);
        if (days) document.getElementById('p-days').value = days;

        const formPanel = document.getElementById('add-form-panel');
        if (formPanel) formPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { document.getElementById('p-count').focus(); }, 500);
    }
});

document.getElementById('btn-preview-cart')?.addEventListener('click', async () => {
    previewModal.classList.add('hidden');
    if (scannedProductTemp) {
        try {
            await fridge.addCartItem(scannedProductTemp.name, 'other', 1, 'шт');
            playSound('add');
            showToast('🛒 Добавлено в список покупок', 'success');
            updateUI();
        } catch(e) { showToast('Ошибка при добавлении', 'error'); }
    }
});

// ==========================================
// БЛОК 8: УПРАВЛЕНИЕ ХОЛОДИЛЬНИКОМ
// ==========================================
async function promptAndConsume(batch) {
    const amountStr = prompt(`Сколько "${batch.unit}" взять? (Доступно: ${batch.count})`, "1");
    if (amountStr !== null) {
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
            try {
                await executeConsumption(batch, amount, fridge, analytics);
                playSound('remove');
                updateUI();
            } catch (error) { showToast('❌ Ошибка сервера', 'error'); }
        }
    } else { updateUI(); }
}

async function handleAction(event) {
    const btn = event.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    // Взаимодействие с Корзиной
    if (action === 'cart-remove') { await fridge.removeCartItem(id); playSound('remove'); return updateUI(); }
    if (action === 'cart-buy') {
        const item = fridge.cart.find(c => c.id === id);
        if (!item) return;
        const days = guessExpirationDays(item.name, item.category) || 5;
        try {
            await fridge.addBatch(item.name, item.category, item.count, item.unit, days, '', false, false, false, 0, 'RUB', '', 'Из списка покупок', currentAuthEmail);
            await fridge.removeCartItem(id);
            playSound('add');
            showToast('📦 Куплено!', 'success');
            updateUI();
        } catch(e) { showToast('Ошибка при покупке', 'error'); }
        return;
    }

    // Взаимодействие с Полкой
    const batch = fridge.getBatchById(id);
    if (!batch) return;

    if (action === 'rate-and-consume' && PERMISSIONS[currentRole].canTake) {
        currentRatingBatch = batch;
        document.getElementById('rating-meal-name').textContent = batch.name;
        ratingModal.classList.remove('hidden');
    }
    else if (action === 'increase' && PERMISSIONS[currentRole].canAdd) {
        await fridge.updateFullBatch(id, { count: batch.count + 1 });
        playSound('add');
        updateUI();
    }
    else if (action === 'decrease' && PERMISSIONS[currentRole].canTake) {
        if (batch.count > 1) {
            await executeConsumption(batch, 1, fridge, analytics);
            playSound('remove');
            updateUI();
        } else {
            if (confirm(`Выбросить или съесть "${batch.name}"?`)) {
                await executeConsumption(batch, 1, fridge, analytics);
                playSound('remove');
                updateUI();
            }
        }
    }
    else if (action === 'consume' && PERMISSIONS[currentRole].canTake) { await promptAndConsume(batch); }
    else if (action === 'edit' && PERMISSIONS[currentRole].canAdd) {
        fillAddForm(batch, datePicker);
        editingBatchId = id;
        document.getElementById('btn-add').textContent = '💾 Сохранить изменения';
        document.getElementById('btn-add').classList.replace('bg-green-500', 'bg-blue-600');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (action === 'waste' && PERMISSIONS[currentRole].canWaste) {
        if (confirm(`Выбросить "${batch.name}"?`)) {
            await analytics.recordWaste(batch.count, batch.price);
            await fridge.removeBatch(id);
            playSound('remove');
            updateUI();
        }
    }
}

document.getElementById('fridge-shelves').addEventListener('click', handleAction);
document.getElementById('cart-items-container')?.addEventListener('click', handleAction);

// Отправка формы ручного добавления продукта
document.getElementById('btn-add').addEventListener('click', async (e) => {
    if (!PERMISSIONS[currentRole].canAdd) return;

    const data = getFormData();
    const validationResult = validateProductData(data.name, data.count, data.finalDays, data.exactDate);
    if (!validationResult.valid) { showToast(validationResult.error, 'error'); return; }

    e.target.disabled = true; e.target.textContent = '⏳ ...';

    try {
        if (editingBatchId) {
            const msInDay = 24 * 60 * 60 * 1000;
            const expirationDate = data.exactDate ? new Date(data.exactDate).getTime() : Date.now() + (data.finalDays * msInDay);
            await fridge.updateFullBatch(editingBatchId, {
                name: data.name, category: data.category, count: parseFloat(data.count), unit: data.unit, expirationDate,
                isPerishable: data.isPerishable, isFrozen: data.isFrozen, isCooked: data.isCooked, price: parseFloat(data.price)||0, currency: data.currency, composition: data.composition, note: data.note
            });
            editingBatchId = null;
            e.target.classList.replace('bg-blue-600', 'bg-green-500');
            showToast('Обновлено', 'success');
        } else {
            await fridge.addBatch(data.name, data.category, data.count, data.unit, data.finalDays, data.exactDate, data.isPerishable, data.isFrozen, data.isCooked, data.price, data.currency, data.composition, data.note, currentAuthEmail);
            showToast('Добавлено', 'success');
        }

        playSound('add');
        clearAddForm(datePicker);
        updateUI();
    } catch (error) { showToast('Ошибка сервера', 'error'); }
    finally { e.target.disabled = false; e.target.textContent = '➕ В холодильник'; }
});

// ==========================================
// БЛОК 9: ИНТЕГРАЦИИ (CSV И НЕЙРОСЕТЬ)
// ==========================================

document.getElementById('btn-export-csv')?.addEventListener('click', () => exportToCSV(fridge.batches));
document.getElementById('btn-import-csv')?.addEventListener('click', () => document.getElementById('input-csv').click());
document.getElementById('input-csv')?.addEventListener('change', (e) => {
    if (e.target.files[0]) { importFromCSV(e.target.files[0], fridge, updateUI); e.target.value = ''; }
});

// Выполнение запросов к ИИ-Шефу с передачей языка
async function executeAiTask(mode) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) return showToast('Нажмите на 🔑 AI-Ключ в шапке!', 'error');

    const recipeName = document.getElementById('ai-recipe-input').value.trim();
    if (mode === 'specific' && !recipeName) return showToast('Напишите название блюда!', 'error');

    const responseBox = document.getElementById('ai-response-box');
    responseBox.classList.remove('hidden');
    responseBox.innerHTML = '';

    loaderOverlay.classList.remove('hidden');

    try {
        const recipe = await askGeminiRecipe(apiKey, fridge.getProcessedBatches(), mode, recipeName, window.appLang);
        responseBox.innerHTML = formatAiResponse(recipe);
    } catch (error) {
        showToast('Ошибка при запросе к ИИ', 'error');
        responseBox.innerHTML = `<span class="text-red-500 font-bold">Ошибка: ${error.message}</span>`;
    } finally {
        loaderOverlay.classList.add('hidden');
    }
}

document.getElementById('btn-ask-ai-rescue')?.addEventListener('click', () => executeAiTask('rescue'));
document.getElementById('btn-ask-ai-all')?.addEventListener('click', () => executeAiTask('all'));
document.getElementById('btn-ai-recipe')?.addEventListener('click', () => executeAiTask('specific'));

// Снабженец (Сбор списка покупок)
document.getElementById('btn-ai-supplier')?.addEventListener('click', async (e) => {
    const recipeName = document.getElementById('ai-recipe-input').value.trim();
    if (!recipeName) return showToast('Напишите название блюда!', 'error');

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) return showToast('Нажмите на 🔑 AI-Ключ в шапке!', 'error');

    loaderOverlay.classList.remove('hidden');

    try {
        const missingItems = await askGeminiMissingIngredients(apiKey, recipeName, fridge.getProcessedBatches(), window.appLang);
        if (missingItems && missingItems.length > 0) {
            await Promise.all(missingItems.map(item => fridge.addCartItem(item.name, item.category, item.count, item.unit)));
            playSound('add');
            showToast(`Добавлено ${missingItems.length} позиций в список покупок!`, 'success');
            updateUI();
            document.getElementById('ai-recipe-input').value = '';
        } else { showToast('В холодильнике есть всё необходимое!', 'info'); }
    } catch(err) { showToast('Ошибка при сверке', 'error'); }
    finally { loaderOverlay.classList.add('hidden'); }
});

// ==========================================
// БЛОК 10: СТАРТ ПРИЛОЖЕНИЯ
// ==========================================
async function initApp() {
    window.appLang = localStorage.getItem('appLang') || document.getElementById('lang-selector').value || 'ru';
    document.getElementById('lang-selector').value = window.appLang;
    try {
        await fridge.fetchBatchesFromCloud();
        await fridge.fetchCartFromCloud();
        await analytics.loadFromCloud();
        applyTranslations(window.appLang);
        checkIosBanner();
    } catch (error) {
        applyTranslations(window.appLang);
        checkIosBanner();
    }
}

if (!window.firebaseAuthInitialized) {
    initApp().catch(console.error);
}