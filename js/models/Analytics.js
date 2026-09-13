// ==============================================================================
// ФАЙЛ: js/models/Analytics.js
// НАЗНАЧЕНИЕ: Бизнес-логика (Мозг) для статистики. Считает съеденное и выброшенное.
// ==============================================================================

// Ключ для сейфа браузера (LocalStorage), куда мы будем сохранять цифры статистики
const STATS_KEY = 'smart_fridge_stats';

// Создаем Класс (Чертеж) для Аналитики
export class AnalyticsModel {

    // constructor срабатывает при запуске программы
    constructor() {
        // Достаем текст из LocalStorage
        const data = localStorage.getItem(STATS_KEY);

        // Условие (Тернарный оператор):
        // ЕСЛИ data есть (?), то превращаем текст в объект через JSON.parse
        // ИНАЧЕ (:) создаем новый объект с нулями.
        this.stats = data ? JSON.parse(data) : { consumed: 0, wasted: 0, moneyLost: 0 };
    }

    // Внутренняя функция для сохранения обновленных цифр в браузер
    save() {
        localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    }

    // МЕТОД 1: Записать съеденное
    recordConsumption(amount) {
        // Берем текущее значение и прибавляем к нему новое (+=)
        // parseFloat гарантирует, что мы прибавляем математическое число, а не текст
        this.stats.consumed += parseFloat(amount);
        this.save(); // Сразу сохраняем
    }

    // МЕТОД 2: Записать выброшенное
    recordWaste(amount, price) {
        this.stats.wasted += parseFloat(amount);
        // Считаем потери: если цену не указали, прибавляем 0
        this.stats.moneyLost += parseFloat(price) || 0;
        this.save();
    }

    // МЕТОД 3: Отдать статистику Контроллеру для отрисовки
    getStats() {
        return this.stats;
    }
}