// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// ==============================================================================

import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js';
import { renderFridgeContents, renderAnalytics } from './ui/render.js';
import { validateProductData } from './utils/helpers.js';

// ================= СИСТЕМА БЕЗОПАСНОСТИ =================

// 1. БАЗА ПАРОЛЕЙ (Аутентификация)
// В реальном мире это хранится на сервере в зашифрованном виде.
const PASSWORDS = {
    admin: 'admin2026', // Пароль для Админа
    user: '1234'        // Пароль для Пользователя
};

// 2. МАТРИЦА ПРАВ (Авторизация / RBAC)
const PERMISSIONS = {
    admin: { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: true, canManageRights: true },
    user:  { canAdd: true, canTake: true, canWaste: true, canSeeAnalytics: true, canSeeAdmin: false, canManageRights: true },
    guest: { canAdd: true, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false },
    child: { canAdd: false, canTake: false, canWaste: false, canSeeAnalytics: false, canSeeAdmin: false, canManageRights: false }
};

const fridge = new FridgeModel();
const analytics = new AnalyticsModel();

// Начинаем как Гость (чтобы при открытии программы никто не имел полных прав без пароля)
let currentRole = 'guest';

// ПОИСК ЭЛЕМЕНТОВ (DOM)
const roleSelector = document.getElementById('role-selector');
const adminPanel = document.getElementById('admin-panel');
const rightsPanel = document.getElementById('rights-panel');
const analyticsPanel = document.getElementById('analytics-panel');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');
const inputUnit = document.getElementById('p-unit');
const inputCount = document.getElementById('p-count');

// Чекбоксы делегирования прав
const chkGuestTake = document.getElementById('perm-guest-take');
const chkGuestWaste = document.getElementById('perm-guest-waste');
const chkChildTake = document.getElementById('perm-child-take');

// Устанавливаем в выпадающем списке стартовую роль (чтобы интерфейс совпадал с переменной)
roleSelector.value = currentRole;

// ------------------------------------------------------------------------------
// ФУНКЦИЯ ОБНОВЛЕНИЯ ЭКРАНА
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// СЛУШАТЕЛЬ: СМЕНА РОЛИ С ПРОВЕРКОЙ ПАРОЛЯ (Authentication)
// ------------------------------------------------------------------------------
roleSelector.addEventListener('change', (event) => {
    const selectedRole = event.target.value; // Роль, которую попытались выбрать
    let isAuthenticated = true; // Изначально верим, что всё хорошо

    // Если пытаются стать Админом
    if (selectedRole === 'admin') {
        const pass = prompt('Вход для Администратора. Введите пароль:');
        if (pass !== PASSWORDS.admin) {
            isAuthenticated = false; // Пароль не совпал!
        }
    }
    // Если пытаются стать Пользователем
    else if (selectedRole === 'user') {
        const pass = prompt('Вход для Пользователя. Введите пароль:');
        if (pass !== PASSWORDS.user) {
            isAuthenticated = false; // Пароль не совпал!
        }
    }
    // Гость и Ребенок пароля не требуют, isAuthenticated остается true

    // Проверяем результат
    if (isAuthenticated) {
        // Успех! Меняем роль и перерисовываем экран
        currentRole = selectedRole;
        updateUI();
    } else {
        // Провал!
        alert('❌ Неверный пароль! Доступ запрещен.');
        // Принудительно возвращаем выпадающий список на ту роль, которая была до этого
        roleSelector.value = currentRole;
    }
});

// ------------------------------------------------------------------------------
// СЛУШАТЕЛЬ: ДЕЛЕГИРОВАНИЕ ПРАВ
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// СЛУШАТЕЛЬ: Обработка кликов по продуктам (Взять / Списать)
// ------------------------------------------------------------------------------
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
            } else {
                alert('Введите корректное число больше нуля.');
            }
        }
    }
    else if (action === 'waste' && perms.canWaste) {
        if (confirm(`Вы уверены, что хотите выбросить "${batch.name}"?`)) {
            analytics.recordWaste(batch.count, batch.price);
            fridge.removeBatch(id);
            updateUI();
        }
    }
}

document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);
document.getElementById('warning-list').addEventListener('click', handleProductAction);

// ------------------------------------------------------------------------------
// СЛУШАТЕЛЬ: Единицы измерения
// ------------------------------------------------------------------------------
inputUnit.addEventListener('input', (event) => {
    const val = event.target.value.toLowerCase().trim();
    if (val === 'шт' || val === 'упак') {
        inputCount.step = '1';
        inputCount.placeholder = '1, 2...';
    } else if (val === 'кг' || val === 'л') {
        inputCount.step = '0.1';
        inputCount.placeholder = '1.5, 0.2...';
    } else {
        inputCount.step = '0.1';
        inputCount.placeholder = 'Кол-во';
    }
});

// ------------------------------------------------------------------------------
// СЛУШАТЕЛЬ: ДОБАВЛЕНИЕ
// ------------------------------------------------------------------------------
btnAdd.addEventListener('click', () => {
    if (!PERMISSIONS[currentRole].canAdd) return;

    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const count = document.getElementById('p-count').value;
    const unit = document.getElementById('p-unit').value;
    const days = document.getElementById('p-days').value;
    const isPerishable = document.getElementById('p-perishable').checked;
    const isFrozen = document.getElementById('p-frozen').checked;

    const validationResult = validateProductData(name, count, days);
    if (!validationResult.valid) {
        alert(`❌ Ошибка: ${validationResult.error}`);
        return;
    }

    fridge.addBatch(name, category, count, unit, days, isPerishable, isFrozen, 0, "");

    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    document.getElementById('p-unit').value = '';
    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;

    updateUI();
});

// 9. ПЕРВЫЙ ЗАПУСК
updateUI();