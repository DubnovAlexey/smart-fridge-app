// ==============================================================================
// ФАЙЛ: js/ui/render.js
// НАЗНАЧЕНИЕ: Рендеринг (отрисовка) данных на странице HTML.
// ==============================================================================

import { getStatusBadge } from '../utils/helpers.js';

const CATEGORY_NAMES = {
    dairy: '🥛 Молочка и Яйца',
    meat: '🥩 Мясо и Рыба',
    veg: '🍎 Овощи и Фрукты',
    prepared: '🍲 Готовая еда',
    pantry: '🥫 Бакалея',
    other: '📦 Прочее'
};

// МЕТОД 1: Отрисовка полок (добавлены data-атрибуты к кнопкам)
export function renderFridgeContents(batches, currentRole) {
    const shelvesContainer = document.getElementById('fridge-shelves');
    const warningList = document.getElementById('warning-list');
    const warningZone = document.getElementById('warning-zone');

    shelvesContainer.innerHTML = '';
    warningList.innerHTML = '';

    if (batches.length === 0) {
        shelvesContainer.innerHTML = '<p class="text-slate-400 text-center py-10">Холодильник пока пуст. Загрузите продукты!</p>';
        warningZone.classList.add('hidden');
        return;
    }

    let warningCount = 0;

    batches.forEach(batch => {
        const badge = getStatusBadge(batch.daysLeft);

        // ВНИМАНИЕ: В тегах <button> мы добавили data-id="${batch.id}" и data-action
        const cardHTML = `
            <div class="bg-white border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition gap-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">${batch.name}</h3>
                    <p class="text-xs text-slate-500 mb-2">${CATEGORY_NAMES[batch.category]} • Положено: ${new Date(batch.addedAt).toLocaleDateString('ru-RU')}</p>
                    <span class="px-3 py-1 text-xs font-bold border rounded-full ${badge.classes}">
                        ${badge.text}
                    </span>
                </div>
                <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div class="text-right">
                        <span class="block text-2xl font-black text-blue-600">${batch.count}</span>
                        <span class="text-xs font-bold text-slate-400 uppercase">${batch.unit}</span>
                    </div>
                    
                    <div class="flex flex-col gap-2">
                        <!-- Кнопка Взять. data-action="consume" -->
                        <button class="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-1.5 px-3 rounded transition" 
                                data-id="${batch.id}" data-action="consume">➖ Взять</button>
                        
                        <!-- Кнопка Списать. data-action="waste" -->
                        ${currentRole !== 'child' ? `
                            <button class="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-1.5 px-3 rounded transition" 
                                    data-id="${batch.id}" data-action="waste">🗑 Списать</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        shelvesContainer.insertAdjacentHTML('beforeend', cardHTML);

        if (batch.daysLeft <= 3 || batch.isPerishable) {
            warningCount++;
            warningList.insertAdjacentHTML('beforeend', cardHTML);
        }
    });

    if (warningCount > 0) {
        warningZone.classList.remove('hidden');
    } else {
        warningZone.classList.add('hidden');
    }
}

// ================= НОВАЯ ФУНКЦИЯ =================
// МЕТОД 2: Отрисовка цифр в панели статистики
export function renderAnalytics(stats) {
    // Находим HTML-элементы и меняем в них текст (.textContent)
    // .toFixed(1) оставляет только 1 знак после запятой (например 1.5),
    // а .toFixed(0) убирает копейки из рублей.
    document.getElementById('stat-consumed').textContent = stats.consumed.toFixed(1);
    document.getElementById('stat-wasted').textContent = stats.wasted.toFixed(1);
    document.getElementById('stat-money').textContent = stats.moneyLost.toFixed(0);
}