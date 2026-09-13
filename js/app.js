// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData } from './utils/helpers.js';

const PASSWORDS = {
    admin: 'admin2026',
    user: '1234'
};

const PERMISSIONS = {
    admin: { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: true, canManageRights: true },
    user:  { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: false, canManageRights: true },
    guest: { canAdd: true, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false },
    child: { canAdd: false, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false }
};

const fridge = new FridgeModel();
const analytics = new AnalyticsModel();

let currentRole = 'guest';

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

const chkGuestTake = document.getElementById('perm-guest-take');
const chkGuestWaste = document.getElementById('perm-guest-waste');
const chkChildTake = document.getElementById('perm-child-take');

roleSelector.value = currentRole;

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

inputDays.addEventListener('input', () => {
    if (inputDays.value !== '') inputDate.value = '';
});

inputDate.addEventListener('input', () => {
    if (inputDate.value !== '') inputDays.value = '';
});

roleSelector.addEventListener('change', (event) => {
    const selectedRole = event.target.value;
    let isAuthenticated = true;

    if (selectedRole === 'admin') {
        const pass = prompt('Вход для Администратора. Введите пароль:');
        if (pass !== PASSWORDS.admin) isAuthenticated = false;
    }
    else if (selectedRole === 'user') {
        const pass = prompt('Вход для Пользователя. Введите пароль:');
        if (pass !== PASSWORDS.user) isAuthenticated = false;
    }

    if (isAuthenticated) {
        currentRole = selectedRole;
        updateUI();
    } else {
        alert('❌ Неверный пароль! Доступ запрещен.');
        roleSelector.value = currentRole;
    }
});

chkGuestTake.addEventListener('change', (e) => {
    PERMISSIONS.guest.canTake = e.target.checked;
    updateUI();
});
chkGuestWaste.addEventListener('change', (e) => {
    PERMISSIONS.guest.canWaste = e.target.checked;
    updateUI();
});
chkChildTake.addEventListener('change', (e) => {
    PERMISSIONS.child.canTake = e.target.checked;
    updateUI();
});

// ==============================================================================
// ОБРАБОТКА КЛИКОВ ПО КНОПКАМ ПРОДУКТОВ
// ==============================================================================
function handleProductAction(event) {
    const btn = event.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (!id || !action) return;

    const batch = fridge.getBatchById(id);
    if (!batch) return;

    const perms = PERMISSIONS[currentRole];

    // ДЕЙСТВИЕ 1: Взять (Consume)
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
            } else {
                alert('Введите корректное число больше нуля.');
            }
        }
    }
    // ДЕЙСТВИЕ 2: Списать (Waste)
    else if (action === 'waste' && perms.canWaste) {
        if (confirm(`Вы уверены, что хотите выбросить "${batch.name}"?`)) {
            analytics.recordWaste(batch.count, batch.price);
            fridge.removeBatch(id);
            updateUI();
        }
    }
    // ДЕЙСТВИЕ 3 (НОВОЕ): Редактировать заметку (Edit Note)
    else if (action === 'edit-note' && perms.canAdd) {
        // Показываем текущую заметку в окне ввода
        const currentNote = batch.note || "";
        const newNote = prompt(`Введите новый комментарий для "${batch.name}":`, currentNote);

        // Если пользователь не нажал "Отмена"
        if (newNote !== null) {
            // Передаем новый текст в Мозг и перерисовываем
            fridge.updateBatchNote(id, newNote.trim());
            updateUI();
        }
    }
}

document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);
document.getElementById('warning-list').addEventListener('click', handleProductAction);

inputUnit.addEventListener('change', (event) => {
    const val = event.target.value;
    if (val === 'шт' || val === 'упак') {
        inputCount.step = '1';
        inputCount.placeholder = '1, 2...';
    }
    else if (val === 'гр' || val === 'мл') {
        inputCount.step = '1';
        inputCount.placeholder = '100, 250...';
    }
    else if (val === 'кг' || val === 'л') {
        inputCount.step = '0.1';
        inputCount.placeholder = '1.5, 0.2...';
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
    if (!validationResult.valid) {
        alert(`❌ Ошибка: ${validationResult.error}`);
        return;
    }

    fridge.addBatch(name, category, count, unit, days, exactDate, isPerishable, isFrozen, price, note);

    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    document.getElementById('p-date').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-note').value = '';

    document.getElementById('p-unit').value = 'шт';
    inputCount.step = '1';
    inputCount.placeholder = '1, 2...';

    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;

    updateUI();
});

// 9. ПЕРВЫЙ ЗАПУСК
updateUI();