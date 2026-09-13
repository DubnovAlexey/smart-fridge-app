// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// Связывает интерфейс (HTML) с бизнес-логикой и отрисовкой.
// ==============================================================================

// 1. ИМПОРТЫ
import { FridgeModel } from './models/Fridge.js';
import { AnalyticsModel } from './models/Analytics.js'; // Импортируем Аналитику
import { renderFridgeContents, renderAnalytics } from './ui/render.js'; // Импортируем новую функцию отрисовки
import { validateProductData } from './utils/helpers.js';

// 2. ИНИЦИАЛИЗАЦИЯ
const fridge = new FridgeModel();
const analytics = new AnalyticsModel(); // Создаем объект Аналитики
let currentRole = 'parent';

// 3. ПОИСК ЭЛЕМЕНТОВ НА СТРАНИЦЕ (DOM)
const roleSelector = document.getElementById('role-selector');
const adminPanel = document.getElementById('admin-panel');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');
const inputUnit = document.getElementById('p-unit');
const inputCount = document.getElementById('p-count');

// 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ЭКРАНА
function updateUI() {
    // 1. Рисуем полки
    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, currentRole);

    // 2. Рисуем статистику
    renderAnalytics(analytics.getStats());
}

// ================= НОВАЯ ЛОГИКА =================
// 5. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ: Обработка кликов по кнопкам "Взять" и "Списать"
function handleProductAction(event) {
    // Ищем ближайшую кнопку, по которой кликнули (вдруг кликнули по тексту внутри кнопки)
    const btn = event.target.closest('button');
    if (!btn) return; // Если кликнули мимо кнопки — выходим

    // Достаем невидимые данные из атрибутов data-* (dataset)
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    // Если у кнопки нет id или action, значит это какая-то другая кнопка, игнорируем
    if (!id || !action) return;

    // Спрашиваем у Мозга (Fridge.js), что это за продукт
    const batch = fridge.getBatchById(id);
    if (!batch) return;

    // ЕСЛИ НАЖАЛИ "ВЗЯТЬ"
    if (action === 'consume') {
        // Показываем стандартное браузерное окно ввода (prompt)
        const amountStr = prompt(`Сколько "${batch.unit}" взять? (Доступно: ${batch.count})`, "1");

        // Если не нажали Отмена
        if (amountStr !== null) {
            const amount = parseFloat(amountStr);

            // Проверка: ввели ли число и больше ли оно нуля
            if (!isNaN(amount) && amount > 0) {

                // Если захотели взять больше или столько же, сколько есть на полке
                if (amount >= batch.count) {
                    analytics.recordConsumption(batch.count); // Записываем в стату всё что было
                    fridge.removeBatch(id); // Удаляем продукт с полки
                } else {
                    // Если взяли часть
                    analytics.recordConsumption(amount); // Записываем часть в стату
                    fridge.updateBatchCount(id, batch.count - amount); // Изменяем остаток
                }
                updateUI(); // Перерисовываем экран
            } else {
                alert('Пожалуйста, введите корректное число больше нуля.');
            }
        }
    }
    // ЕСЛИ НАЖАЛИ "СПИСАТЬ"
    else if (action === 'waste') {
        // Показываем окно подтверждения (confirm)
        if (confirm(`Вы уверены, что хотите выбросить "${batch.name}"?`)) {
            analytics.recordWaste(batch.count, batch.price); // Записываем всё в мусор и потери
            fridge.removeBatch(id); // Удаляем
            updateUI(); // Перерисовываем
        }
    }
}

// Вешаем "Слушателя" на весь контейнер полок
document.getElementById('fridge-shelves').addEventListener('click', handleProductAction);
// Вешаем второго "Слушателя" на красную Зону Внимания (там ведь тоже есть эти кнопки)
document.getElementById('warning-list').addEventListener('click', handleProductAction);
// ================================================

// 6. АДАПТАЦИЯ КОЛИЧЕСТВА ПОД ЕДИНИЦЫ
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

// 7. СЛУШАТЕЛЬ СОБЫТИЙ: СМЕНА РОЛИ
roleSelector.addEventListener('change', (event) => {
    currentRole = event.target.value;
    if (currentRole === 'admin') {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
    if (currentRole === 'child') {
        addFormPanel.classList.add('hidden');
    } else {
        addFormPanel.classList.remove('hidden');
    }
    updateUI();
});

// 8. НАЖАТИЕ КНОПКИ "ДОБАВИТЬ В ХОЛОДИЛЬНИК"
btnAdd.addEventListener('click', () => {
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