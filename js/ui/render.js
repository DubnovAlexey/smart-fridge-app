// ==============================================================================
// ФАЙЛ: js/ui/render.js
// НАЗНАЧЕНИЕ: Генерация HTML для списка продуктов и аналитики
// ==============================================================================

export function renderFridgeContents(batches, permissions) {
    const container = document.getElementById('fridge-shelves');
    container.innerHTML = '';

    // ПУСТОЕ СОСТОЯНИЕ (Empty State)
    if (batches.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-b from-blue-50/50 to-white rounded-2xl border-2 border-dashed border-blue-200">
                <div class="text-7xl mb-4 filter drop-shadow-sm opacity-90">❄️🧊</div>
                <h3 class="text-2xl font-black text-blue-900 mb-2">Холодильник пуст</h3>
                <p class="text-blue-600/80 text-center max-w-sm font-medium text-sm">Самое время отправиться за покупками! Наполните полки, чтобы AI-Шеф смог составить для вас вкусное меню.</p>
            </div>
        `;
        return;
    }

    batches.forEach(batch => {
        const isWarning = batch.daysLeft <= 3 || batch.isPerishable;
        const itemHTML = `
            <div class="flex flex-col md:flex-row justify-between md:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                <div>
                    <h4 class="font-bold text-slate-800 text-lg">${batch.name}</h4>
                    <p class="text-sm text-slate-500">${batch.category} | Добавлено: ${new Date(batch.addedAt).toLocaleDateString()} | ${batch.isFrozen ? '❄️ В морозилке' : ''}</p>
                    <div class="mt-2">
                        <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${isWarning ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                            Осталось дней: ${batch.daysLeft}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-6">
                    <div class="text-center">
                        <div class="text-2xl font-black text-slate-700">${batch.count}</div>
                        <div class="text-xs text-slate-500 uppercase font-bold">${batch.unit}</div>
                    </div>
                    <div class="flex flex-col gap-2">
                        ${permissions.canAdd ? `<button data-id="${batch.id}" data-action="edit" class="text-xs text-blue-600 hover:underline cursor-pointer">✏️ Изменить</button>` : ''}
                        ${permissions.canTake ? `<button data-id="${batch.id}" data-action="consume" class="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded text-sm transition cursor-pointer">— Взять</button>` : ''}
                        ${permissions.canWaste ? `<button data-id="${batch.id}" data-action="waste" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1 px-3 rounded text-sm transition cursor-pointer">🗑 Списать</button>` : ''}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}

export function renderAnalytics(stats) {
    document.getElementById('stat-consumed').textContent = stats.consumed;
    document.getElementById('stat-wasted').textContent = stats.wasted;
    document.getElementById('stat-money').textContent = stats.money;
}