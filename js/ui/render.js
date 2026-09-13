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

// ОБРАТИТЕ ВНИМАНИЕ: Теперь мы передаем объект perms (permissions - права)
export function renderFridgeContents(batches, perms) {
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
                        <!-- Динамическое рисование кнопок на основе переданных прав (perms) -->
                        
                        <!-- Если у текущей роли есть право canTake, рисуем кнопку Взять -->
                        ${perms.canTake ? `
                            <button class="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold py-1.5 px-3 rounded transition" 
                                    data-id="${batch.id}" data-action="consume">➖ Взять</button>
                        ` : ''}
                        
                        <!-- Если у текущей роли есть право canWaste, рисуем кнопку Списать -->
                        ${perms.canWaste ? `
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

export function renderAnalytics(stats) {
    document.getElementById('stat-consumed').textContent = stats.consumed.toFixed(1);
    document.getElementById('stat-wasted').textContent = stats.wasted.toFixed(1);
    document.getElementById('stat-money').textContent = stats.moneyLost.toFixed(0);
}