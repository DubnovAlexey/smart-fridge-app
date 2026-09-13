// ==============================================================================
// ФАЙЛ: js/app.js
// НАЗНАЧЕНИЕ: Главный Контроллер (Controller).
// Связывает интерфейс (HTML) с бизнес-логикой и отрисовкой.
// ==============================================================================

// 1. ИМПОРТЫ (Обязательно с расширением .js на конце!)
// Забираем наши готовые инструменты из других файлов.
import { FridgeModel } from './models/Fridge.js';
import { renderFridgeContents } from './ui/render.js';
import { validateProductData } from './utils/helpers.js';

// 2. ИНИЦИАЛИЗАЦИЯ
// Создаем реальный объект холодильника по нашему чертежу (Классу).
// В этот момент срабатывает constructor() в Fridge.js, и данные загружаются из памяти.
const fridge = new FridgeModel();

// Устанавливаем роль по умолчанию. Мы начинаем как "Родитель".
let currentRole = 'parent';

// 3. ПОИСК ЭЛЕМЕНТОВ НА СТРАНИЦЕ (Работа с DOM)
// Мы находим HTML-теги по их ID, чтобы JavaScript мог ими управлять.
const roleSelector = document.getElementById('role-selector');
const adminPanel = document.getElementById('admin-panel');
const addFormPanel = document.getElementById('add-form-panel');
const btnAdd = document.getElementById('btn-add');

// 4. ФУНКЦИЯ ОБНОВЛЕНИЯ ЭКРАНА
// Создаем удобную функцию, которая берет посчитанные продукты из Мозга
// и отдает их Рисовальщику, передавая также текущую роль.
function updateUI() {
    const batches = fridge.getProcessedBatches();
    renderFridgeContents(batches, currentRole);
}

// ------------------------------------------------------------------------------
// 5. СЛУШАТЕЛЬ СОБЫТИЙ: СМЕНА РОЛИ
// addEventListener "слушает" событие 'change' (когда пользователь выбрал другое значение в выпадающем списке).
// ------------------------------------------------------------------------------
roleSelector.addEventListener('change', (event) => {
    // event.target.value — это то значение, которое только что выбрали (admin, child, guest, parent)
    currentRole = event.target.value;

    // ЛОГИКА ПРЯТАНЬЯ БЛОКОВ (Контроль доступа)
    // Если выбрали 'admin', убираем класс 'hidden' (показываем панель), иначе — добавляем 'hidden' (прячем).
    if (currentRole === 'admin') {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }

    // Если выбрали 'child' (Ребенок), мы прячем форму добавления продуктов.
    // Ребенку нельзя добавлять продукты. Остальным — можно.
    if (currentRole === 'child') {
        addFormPanel.classList.add('hidden');
    } else {
        addFormPanel.classList.remove('hidden');
    }

    // После смены роли обязательно перерисовываем полки (чтобы спрятать или показать кнопку "Списать")
    updateUI();
});

// ------------------------------------------------------------------------------
// 6. СЛУШАТЕЛЬ СОБЫТИЙ: НАЖАТИЕ КНОПКИ "ДОБАВИТЬ В ХОЛОДИЛЬНИК"
// Слушаем событие 'click' по зеленой кнопке.
// ------------------------------------------------------------------------------
btnAdd.addEventListener('click', () => {

    // Считываем то, что пользователь написал в полях ввода (.value)
    const name = document.getElementById('p-name').value;
    const category = document.getElementById('p-category').value;
    const count = document.getElementById('p-count').value;
    const unit = document.getElementById('p-unit').value;
    const days = document.getElementById('p-days').value;

    // Для чекбоксов (галочек) мы считываем свойство .checked (возвращает true или false)
    const isPerishable = document.getElementById('p-perishable').checked;
    const isFrozen = document.getElementById('p-frozen').checked;

    // ОТПРАВЛЯЕМ ДАННЫЕ НА ФЕЙС-КОНТРОЛЬ (Валидация)
    // Функция вернет объект, например: { valid: false, error: 'Ошибка' } или { valid: true }
    const validationResult = validateProductData(name, count, days);

    // Если данные НЕ валидны (!validationResult.valid)
    if (!validationResult.valid) {
        // Выводим системное окно с текстом ошибки и останавливаем работу (return).
        alert(`❌ Ошибка: ${validationResult.error}`);
        return;
    }

    // Если всё отлично, передаем данные в Мозг (Fridge.js) для создания новой партии
    fridge.addBatch(name, category, count, unit, days, isPerishable, isFrozen, 0, "");

    // Очищаем поля ввода, чтобы было удобно вводить следующий продукт
    document.getElementById('p-name').value = '';
    document.getElementById('p-count').value = '';
    document.getElementById('p-days').value = '';
    document.getElementById('p-perishable').checked = false;
    document.getElementById('p-frozen').checked = false;

    // Перерисовываем экран, чтобы новый продукт сразу появился на полке
    updateUI();
});

// 7. ПЕРВЫЙ ЗАПУСК
// Как только скрипт загрузился, мы один раз вызываем отрисовку, чтобы показать то, что уже есть в памяти.
updateUI();