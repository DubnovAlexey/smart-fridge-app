// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// Связывает интерфейс (HTML) с бизнес-логикой и отрисовкой.
// ==============================================================================

// 1. ИМПОРТЫ (Обязательно с расширением .js на конце!)
import { FridgeModel } from './models/Fridge.js';
import { renderFridgeContents } from './ui/render.js';
import { validateProductData } from './utils/helpers.js';

// 2. ИНИЦИАЛИЗАЦИЯ
const fridge = new FridgeModel();
let currentRole = 'parent';

// 3. ПОИСК ЭЛЕМЕНТОВ НА СТРАНИЦЕ (Работа с DOM - Document Object Model)
// Забираем теги из HTML в переменные JavaScript, чтобы ими управлять.
const roleSelector = document.getElementById('role-selector');
const adminPanel = document.getElementById('admin-panel');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');

// Новые переменные для связи полей Единиц и Количества
const inputUnit = document.getElementById('p-unit');
const inputCount = document.getElementById('p-count');

// 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ЭКРАНА
function updateUI() {
    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, currentRole);
}

// ------------------------------------------------------------------------------
// 5. НОВЫЙ СЛУШАТЕЛЬ (Event Listener): АДАПТАЦИЯ КОЛИЧЕСТВА ПОД ЕДИНИЦЫ
// Событие 'input' срабатывает при каждом нажатии клавиши в поле "Ед. изм."
// ------------------------------------------------------------------------------
inputUnit.addEventListener('input', (event) => {
    // Получаем то, что ввел пользователь, и переводим в нижний регистр (чтобы "ШТ" и "шт" были одинаковы)
    const val = event.target.value.toLowerCase().trim();

    // ЕСЛИ выбраны штуки или упаковки
    if (val === 'шт' || val === 'упак') {
        // Устанавливаем шаг 1 (разрешаем только целые числа: 1, 2, 3)
        inputCount.step = '1';
        // Меняем подсказку в поле (placeholder)
        inputCount.placeholder = '1, 2...';
    }
    // ЕСЛИ выбраны килограммы или литры
    else if (val === 'кг' || val === 'л') {
        // Устанавливаем шаг 0.1 (разрешаем дроби: 1.5, 0.2)
        inputCount.step = '0.1';
        inputCount.placeholder = '1.5, 0.2...';
    }
    // ДЛЯ ВСЕХ ОСТАЛЬНЫХ СЛУЧАЕВ (свой вариант)
    else {
        inputCount.step = '0.1'; // Разрешаем дроби на всякий случай
        inputCount.placeholder = 'Кол-во';
    }
});

// ------------------------------------------------------------------------------
// 6. СЛУШАТЕЛЬ СОБЫТИЙ: СМЕНА РОЛИ
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
// 7. СЛУШАТЕЛЬ СОБЫТИЙ: НАЖАТИЕ КНОПКИ "ДОБАВИТЬ В ХОЛОДИЛЬНИК"
// ------------------------------------------------------------------------------
btnAdd.addEventListener('click', () => {

    // Считываем значения из полей (Обращение к DOM: .value)
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const count = document.getElementById('p-count').value;
    const unit = document.getElementById('p-unit').value;
    const days = document.getElementById('p-days').value;

    const isPerishable = document.getElementById('p-perishable').checked;
    const isFrozen = document.getElementById('p-frozen').checked;

    // ОТПРАВЛЯЕМ ДАННЫЕ НА ФЕЙС-КОНТРОЛЬ (Валидация)
    const validationResult = validateProductData(name, count, days);

    if (!validationResult.valid) {
        alert(`❌ Ошибка: ${validationResult.error}`);
        return;
    }

    // Отправляем данные в "Мозг" для расчетов
    fridge.addBatch(name, category, count, unit, days, isPerishable, isFrozen, 0, "");

    // Очищаем поля после успешного добавления
    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    // Очищаем единицы измерения (ставим пустую строку), чтобы для следующего продукта было пусто
    document.getElementById('p-unit').value = '';

    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;

    // Даем команду "Рисовальщику" обновить интерфейс
    updateUI();
});

// 8. ПЕРВЫЙ ЗАПУСК
updateUI();