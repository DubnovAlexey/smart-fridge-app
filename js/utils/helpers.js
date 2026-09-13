// ==============================================================================
// ФАЙЛ: js/utils/helpers.js
// НАЗНАЧЕНИЕ: Валидация и UI-утилиты (Toasts)
// ==============================================================================

export function validateProductData(name, count, days, exactDate) {
    if (!name.trim()) return { valid: false, error: 'Введите название продукта.' };
    if (isNaN(count) || count <= 0) return { valid: false, error: 'Укажите корректное количество.' };
    if (!days && !exactDate) return { valid: false, error: 'Укажите срок годности в днях ИЛИ выберите дату.' };
    return { valid: true };
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');

    // Базовые стили для плашки
    toast.className = 'px-5 py-3 rounded-xl shadow-xl text-sm font-bold text-white transform transition-all duration-300 translate-y-10 opacity-0 flex items-center gap-3 max-w-xs sm:max-w-md w-full';

    let icon = '💡';
    if (type === 'error') {
        toast.classList.add('bg-red-500');
        icon = '🚨';
    } else if (type === 'success') {
        toast.classList.add('bg-green-500');
        icon = '✅';
    } else {
        toast.classList.add('bg-blue-600');
    }

    toast.innerHTML = `<span class="text-xl">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    // Появление
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    // Исчезновение через 3.5 секунды
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-10');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}