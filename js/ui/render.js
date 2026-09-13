// ==============================================================================
// ФАЙЛ: js/ui/render.js
// НАЗНАЧЕНИЕ: Рендеринг (отрисовка) данных на странице HTML.
// Этот модуль ТОЛЬКО рисует. Он не считает сроки и не сохраняет данные.
// ==============================================================================

// Импортируем функцию-помощник для получения цвета бейджика (ОБЯЗАТЕЛЬНО пишем .js в конце!)
import { getStatusBadge } from '../utils/helpers.js';

// Словарь категорий. В коде категории называются на английском (dairy, meat),
// а на экране мы хотим показывать красивые русские названия с эмодзи.
const CATEGORY_NAMES = {
    dairy: '🥛 Молочка и Яйца',
    meat: '🥩 Мясо и Рыба',
    veg: '🍎 Овощи и Фрукты',
    prepared: '🍲 Готовая еда',
    pantry: '🥫 Бакалея',
    other: '📦 Прочее'
};

// ------------------------------------------------------------------------------
// ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ
// Она принимает "batches" (массив наших партий продуктов из Fridge.js)
// и "currentRole" (текущую роль пользователя, чтобы знать, какие кнопки прятать)
// ------------------------------------------------------------------------------
export function renderFridgeContents(batches, currentRole) {

    // 1. Находим в нашем HTML-файле контейнер (div), куда будем вставлять полки.
    // document.getElementById ищет элемент по его id.
    const shelvesContainer = document.getElementById('fridge-shelves');
    const warningList = document.getElementById('warning-list');
    const warningZone = document.getElementById('warning-zone');

    // 2. Очищаем контейнеры (innerHTML = '') перед тем, как рисовать заново.
    // Если этого не сделать, новые продукты будут добавляться к старым, и список будет дублироваться.
    shelvesContainer.innerHTML = '';
    warningList.innerHTML = '';

    // 3. Проверка: если массив пустой (length === 0)
    if (batches.length === 0) {
        // Записываем прямо внутрь HTML-тега сообщение о том, что пусто.
        shelvesContainer.innerHTML = '<p class="text-slate-400 text-center py-10">Холодильник пока пуст. Загрузите продукты!</p>';
        // Прячем красную зону Ахтунг (добавляем класс 'hidden' из Tailwind CSS)
        warningZone.classList.add('hidden');
        // Останавливаем функцию (return), дальше рисовать нечего.
        return;
    }

    // Заводим счетчик опасных продуктов, чтобы знать, показывать ли красную зону Ахтунг
    let warningCount = 0;

    // 4. ПЕРЕБОР МАССИВА
    // Метод forEach (для каждого) берет каждый продукт (batch) по очереди.
    batches.forEach(batch => {

        // Получаем объект с цветом и текстом (например: {text: 'Просрочено', classes: 'bg-red-100...'})
        const badge = getStatusBadge(batch.daysLeft);

        // Формируем HTML-код карточки продукта (используем обратные кавычки ` ` для вставки переменных)
        // Если роль 'child', мы не показываем кнопку "Списать в мусор".
        const cardHTML = `
            <div class="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition gap-4">
                
                <!-- Левая часть карточки: Имя, Категория, Статус -->
                <div>
                    <h3 class="text-lg font-bold text-slate-800">${batch.name}</h3>
                    <p class="text-xs text-slate-500 mb-2">${CATEGORY_NAMES[batch.category]} • Положено: ${new Date(batch.addedAt).toLocaleDateString('ru-RU')}</p>
                    <span class="px-3 py-1 text-xs font-bold border rounded-full ${badge.classes}">
                        ${badge.text}
                    </span>
                </div>

                <!-- Правая часть карточки: Остаток и Кнопки -->
                <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div class="text-right">
                        <span class="block text-2xl font-black text-blue-600">${batch.count}</span>
                        <span class="text-xs font-bold text-slate-400 uppercase">${batch.unit}</span>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <!-- Кнопка Взять часть (Видят все) -->
                        <button class="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-1.5 px-3 rounded transition">➖ Взять</button>
                        
                        <!-- Кнопка Списать (Тернарный оператор: ЕСЛИ роль не child, рисуем кнопку, ИНАЧЕ рисуем пустоту '') -->
                        ${currentRole !== 'child' ? `<button class="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-1.5 px-3 rounded transition">🗑 Списать</button>` : ''}
                    </div>
                </div>
            </div>
        `;

        // 5. РАСПРЕДЕЛЕНИЕ КАРТОЧЕК
        // Вставляем наш сгенерированный HTML в конец контейнера (insertAdjacentHTML).
        shelvesContainer.insertAdjacentHTML('beforeend', cardHTML);

        // Если продукту осталось 3 или меньше дней, ИЛИ стоит галочка isPerishable (Скоропортящееся)
        if (batch.daysLeft <= 3 || batch.isPerishable) {
            warningCount++;
            // Копируем эту же карточку в зону Ахтунг!
            warningList.insertAdjacentHTML('beforeend', cardHTML);
        }
    });

    // 6. УПРАВЛЕНИЕ ЗОНОЙ АХТУНГ
    // Если опасных продуктов больше нуля, убираем класс 'hidden' (показываем зону), иначе добавляем 'hidden' (прячем).
    if (warningCount > 0) {
        warningZone.classList.remove('hidden');
    } else {
        warningZone.classList.add('hidden');
    }
}