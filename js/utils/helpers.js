// ==============================================================================
// ФАЙЛ: js/utils/helpers.js
// НАЗНАЧЕНИЕ: Вспомогательные функции и фейс-контроль (Валидация).
// ==============================================================================

// ДОБАВЛЕНО: Новый параметр exactDate (точная дата)
export function validateProductData(name, count, days, exactDate) {

    // 1. Проверка названия
    if (!name || name.trim() === '') {
        return { valid: false, error: 'Название продукта не может быть пустым.' };
    }

    // 2. Проверка количества
    if (count <= 0 || isNaN(count)) {
        return { valid: false, error: 'Количество должно быть больше нуля.' };
    }

    // 3. НОВАЯ ЛОГИКА: Проверка сроков годности
    // Если пользователь не ввел ни дни, ни точную дату
    if (!days && !exactDate) {
        return { valid: false, error: 'Укажите срок годности в днях ИЛИ выберите точную дату в календаре.' };
    }

    // Если ввели дни, проверяем, чтобы они не были отрицательными
    if (days && (days < 0 || isNaN(days))) {
        return { valid: false, error: 'Срок годности в днях не может быть отрицательным.' };
    }

    // Если все проверки пройдены
    return { valid: true };
}

// Функция бейджиков остается без изменений
export function getStatusBadge(daysLeft) {
    if (daysLeft < 0) {
        return { text: 'Просрочено', classes: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (daysLeft <= 3) {
        return { text: `Осталось дней: ${daysLeft}`, classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    }
    return { text: `Осталось дней: ${daysLeft}`, classes: 'bg-green-100 text-green-700 border-green-200' };
}