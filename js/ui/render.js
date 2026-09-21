// ==============================================================================
// ФАЙЛ: js/ui/render.js
// НАЗНАЧЕНИЕ: Генерация HTML для списка продуктов и аналитики
// ЧТО ИЗМЕНЕНО: Добавлен вывод текстовых комментариев к рейтингу и состава.
// ==============================================================================

export function renderFridgeContents(batches, permissions) {
    const container = document.getElementById('fridge-shelves');
    container.innerHTML = '';

    if (batches.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200">
                <div class="text-7xl mb-4 filter drop-shadow-sm opacity-80">❄️</div>
                <h3 class="text-2xl font-black text-slate-800 mb-2">На полках пусто</h3>
                <p class="text-slate-500 text-center max-w-sm font-medium text-sm">Добавьте продукты, домашние заготовки или крафт, чтобы начать вести учет.</p>
            </div>
        `;
        return;
    }

    batches.forEach(batch => {
        const isWarning = batch.daysLeft <= 3 || batch.isPerishable;
        const isCooked = batch.isCooked;

        // Выделяем крафт/блюда стилистически
        const bgClass = isCooked ? 'bg-orange-50/50 border-orange-200 shadow-sm' : 'bg-white border-slate-200 hover:shadow-md transition-shadow';
        const titleColor = isCooked ? 'text-orange-900' : 'text-slate-800';

        // Генерируем блок "Состав и Заметка", если они есть
        let extraInfoHTML = '';
        if (batch.composition || batch.note) {
            extraInfoHTML = `<div class="mt-3 text-xs text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-100">`;
            if (batch.composition) extraInfoHTML += `<p><strong>Состав:</strong> ${batch.composition}</p>`;
            if (batch.note) extraInfoHTML += `<p><strong>Откуда:</strong> ${batch.note}</p>`;
            extraInfoHTML += `</div>`;
        }

        // Генерируем красивый блок "Отзыв Семьи", если блюдо было оценено
        let reviewHTML = '';
        if (batch.rating) {
            const stars = '★'.repeat(batch.rating) + '☆'.repeat(5 - batch.rating);
            reviewHTML = `
                <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-yellow-500 text-sm tracking-widest">${stars}</span>
                        <span class="text-xs font-bold text-yellow-800 uppercase tracking-wider">Оценка семьи</span>
                    </div>
                    ${batch.ratingComment ? `<p class="text-sm font-medium text-yellow-900 italic">«${batch.ratingComment}»</p>` : ''}
                </div>
            `;
        }

        const itemHTML = `
            <div class="flex flex-col md:flex-row justify-between md:items-start ${bgClass} p-5 rounded-2xl border gap-4">
                <div class="flex-1">
                    <h4 class="font-black ${titleColor} text-xl flex flex-wrap items-center gap-2 mb-1">
                        ${batch.name}
                        ${isCooked ? '<span class="text-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-0.5 rounded-md font-bold shadow-sm uppercase tracking-wider">Крафт / Блюдо</span>' : ''}
                    </h4>
                    
                    <p class="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <span>${batch.category}</span>
                        <span class="text-slate-300">•</span>
                        <span>Добавлено: ${new Date(batch.addedAt).toLocaleDateString()}</span>
                        ${batch.isFrozen ? '<span class="text-blue-500 ml-2">❄️ В морозилке</span>' : ''}
                    </p>
                    
                    <div class="flex items-center gap-3 mb-2">
                        <span class="inline-block px-3 py-1.5 rounded-lg text-sm font-black tracking-wide ${isWarning ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                            Осталось дней: ${batch.daysLeft}
                        </span>
                    </div>

                    ${extraInfoHTML}
                    ${reviewHTML}
                </div>

                <div class="flex flex-col items-end justify-between min-h-full min-w-[140px] pl-4 md:border-l border-slate-200">
                    <div class="text-right mb-4">
                        <div class="text-4xl font-black text-slate-800 tracking-tighter">${batch.count}</div>
                        <div class="text-sm text-slate-500 uppercase font-black tracking-widest">${batch.unit}</div>
                    </div>
                    
                    <div class="flex flex-col gap-2 w-full">
                        ${permissions.canAdd ? `<button data-id="${batch.id}" data-action="edit" class="text-xs text-indigo-500 hover:text-indigo-700 font-bold uppercase tracking-wider cursor-pointer text-right mb-1">✏️ Изменить</button>` : ''}
                        
                        ${permissions.canTake ? `
                            <button data-id="${batch.id}" 
                                    data-action="${isCooked ? 'rate-and-consume' : 'consume'}" 
                                    class="w-full ${isCooked ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'} font-black py-2 px-3 rounded-xl text-sm transition cursor-pointer shadow-sm flex justify-center items-center gap-2">
                                ${isCooked ? '⭐ Оценить' : '— Взять'}
                            </button>
                        ` : ''}
                        
                        ${permissions.canWaste ? `<button data-id="${batch.id}" data-action="waste" class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer mt-1">🗑 Списать</button>` : ''}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}

export function renderAnalytics(stats) {
    document.getElementById('stat-consumed').textContent = stats.consumed.toFixed(1);
    document.getElementById('stat-wasted').textContent = stats.wasted.toFixed(1);
    document.getElementById('stat-money').textContent = stats.moneyLost.toFixed(2);
}