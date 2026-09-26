// ==============================================================================
// ФАЙЛ: js/ui/render.js
// НАЗНАЧЕНИЕ: Генерация HTML для интерфейса
// ==============================================================================
import { t } from '../utils/translations.js';

const CURRENCY_SYMBOLS = { 'RUB': '₽', 'ILS': '₪', 'USD': '$', 'EUR': '€' };

export function renderFridgeContents(batches, permissions) {
    const container = document.getElementById('fridge-shelves');
    container.innerHTML = '';

    if (batches.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-dashed border-slate-200">
                <div class="text-7xl mb-4 opacity-80">❄️</div>
                <h3 class="text-2xl font-black text-slate-800 mb-2">${t('empty_fridge')}</h3>
            </div>
        `;
        return;
    }

    batches.forEach(batch => {
        const isWarning = batch.daysLeft <= 3 || batch.isPerishable;
        const isCooked = batch.isCooked;
        const bgClass = isCooked ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-slate-200 hover:shadow-md';
        const titleColor = isCooked ? 'text-orange-900' : 'text-slate-800';

        let extraInfoHTML = '';
        if (batch.composition || batch.note || batch.price > 0) {
            extraInfoHTML = `<div class="mt-3 text-xs text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-100">`;
            if (batch.price > 0) {
                const sym = CURRENCY_SYMBOLS[batch.currency] || '₽';
                extraInfoHTML += `<p><strong>${t('price_label')}:</strong> ${batch.price} ${sym}</p>`;
            }
            if (batch.composition) extraInfoHTML += `<p><strong>${t('comp_label')}:</strong> ${batch.composition}</p>`;
            if (batch.note) extraInfoHTML += `<p><strong>${t('note_label')}:</strong> ${batch.note}</p>`;
            extraInfoHTML += `</div>`;
        }

        let reviewHTML = '';
        if (batch.rating) {
            const stars = '★'.repeat(batch.rating) + '☆'.repeat(5 - batch.rating);
            reviewHTML = `
                <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 shadow-sm">
                    <div class="flex items-center gap-2 mb-1"><span class="text-yellow-500 text-sm tracking-widest">${stars}</span><span class="text-xs font-bold text-yellow-800 uppercase tracking-wider">${t('review_family')}: ${batch.ratingAuthor || 'Семья'}</span></div>
                    ${batch.ratingComment ? `<p class="text-sm font-medium text-yellow-900 italic">«${batch.ratingComment}»</p>` : ''}
                </div>
            `;
        }

        const itemHTML = `
            <div class="flex flex-col md:flex-row justify-between md:items-start ${bgClass} p-5 rounded-2xl border gap-4">
                <div class="flex-1">
                    <h4 class="font-black ${titleColor} text-xl flex flex-wrap items-center gap-2 mb-1">
                        ${batch.name}
                        ${isCooked ? `<span class="text-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">${t('craft_badge')}</span>` : ''}
                    </h4>
                    <p class="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <span>${t('cat_' + batch.category)}</span><span class="text-slate-300">•</span><span>${t('added')}: ${new Date(batch.addedAt).toLocaleDateString()}</span>
                        ${batch.isFrozen ? `<span class="text-blue-500 ml-2">❄️ ${t('frozen')}</span>` : ''}
                    </p>
                    <div class="flex items-center gap-3 mb-2"><span class="inline-block px-3 py-1.5 rounded-lg text-sm font-black tracking-wide ${isWarning ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${t('days_left')}: ${batch.daysLeft}</span></div>
                    ${extraInfoHTML}${reviewHTML}
                </div>
                <div class="flex flex-col items-end justify-between min-h-full min-w-[140px] pl-4 md:border-l border-slate-200">
                    <div class="text-right mb-4 w-full flex flex-col items-end">
                        <div class="flex items-center gap-3">
                            ${permissions.canTake ? `<button data-id="${batch.id}" data-action="decrease" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg transition flex justify-center">-</button>` : ''}
                            <div class="text-4xl font-black text-slate-800 tracking-tighter w-12 text-center">${batch.count}</div>
                            ${permissions.canAdd ? `<button data-id="${batch.id}" data-action="increase" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-lg transition flex justify-center">+</button>` : ''}
                        </div>
                        <div class="text-sm text-slate-500 uppercase font-black tracking-widest mt-1 text-center w-full">${t('unit_' + batch.unit)}</div>
                    </div>
                    <div class="flex flex-col gap-2 w-full">
                        ${permissions.canAdd ? `<button data-id="${batch.id}" data-action="edit" class="text-xs text-indigo-500 hover:text-indigo-700 font-bold uppercase tracking-wider cursor-pointer text-center md:text-right mb-1">✏️ ${t('btn_edit')}</button>` : ''}
                        ${permissions.canTake ? `
                            <button data-id="${batch.id}" data-action="${isCooked ? 'rate-and-consume' : 'consume'}" class="w-full ${isCooked ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-800'} font-black py-2 px-3 rounded-xl text-sm transition shadow-sm">${isCooked ? `⭐ ${t('btn_rate')}` : `— ${t('btn_take')}`}</button>
                        ` : ''}
                        ${permissions.canWaste ? `<button data-id="${batch.id}" data-action="waste" class="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1.5 px-3 rounded-xl text-xs mt-1">🗑 ${t('btn_waste')}</button>` : ''}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}

export function renderCartContents(cartItems, permissions) {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    container.innerHTML = '';
    if (cartItems.length === 0) { container.innerHTML = `<div class="text-slate-400 text-center py-4 font-medium">${t('empty_cart')}</div>`; return; }

    cartItems.forEach(item => {
        container.innerHTML += `
            <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm gap-3">
                <div class="flex-1"><h5 class="font-bold text-slate-800 leading-tight">${item.name}</h5><span class="text-xs text-slate-400 font-semibold">${t('cat_' + item.category)}</span></div>
                <div class="text-right whitespace-nowrap"><div class="font-black text-lg text-indigo-600">${item.count} <span class="text-xs text-slate-500">${t('unit_' + item.unit)}</span></div></div>
                <div class="flex flex-col gap-1 border-l border-slate-100 pl-3">
                    ${permissions.canAdd ? `<button data-id="${item.id}" data-action="cart-buy" class="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">${t('btn_cart_buy')}</button>` : ''}
                    ${permissions.canWaste ? `<button data-id="${item.id}" data-action="cart-remove" class="bg-slate-100 text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">${t('btn_cart_del')}</button>` : ''}
                </div>
            </div>
        `;
    });
}

export function renderAnalytics(stats) {
    document.getElementById('stat-consumed').textContent = stats.consumed.toFixed(1);
    document.getElementById('stat-wasted').textContent = stats.wasted.toFixed(1);
    document.getElementById('stat-money').textContent = stats.moneyLost.toFixed(2);
}