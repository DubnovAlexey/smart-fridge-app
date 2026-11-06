// ==============================================================================
// ФАЙЛ: js/utils/localStore.js
// НАЗНАЧЕНИЕ: Изолированное хранилище локального демо; без обращений к Firebase.
// РАЗДЕЛЫ: 1. Защищённое чтение/запись; 2. Идентификаторы; 3. Необязательные настройки сеанса.
// ==============================================================================
// НАЧАЛО РАЗДЕЛА 1
export function readLocalState(key, fallback) {
    try { return JSON.parse(localStorage.getItem(`smart-fridge-app:demo:${key}`)) ?? fallback; }
    catch { return fallback; }
}
export function writeLocalState(key, value) {
    try { localStorage.setItem(`smart-fridge-app:demo:${key}`, JSON.stringify(value)); return true; }
    catch { return false; } // Закрытое хранилище не мешает работать с данными текущего сеанса.
}
// КОНЕЦ РАЗДЕЛА 1
// НАЧАЛО РАЗДЕЛА 2
export function createLocalId() {
    return `local-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
// КОНЕЦ РАЗДЕЛА 2

// НАЧАЛО РАЗДЕЛА 3
// Старые ключи настроек сохраняют совместимость; при запрете storage действует память вкладки.
const sessionPreferences = new Map();
export function readPreference(key, fallback = '') {
    if (sessionPreferences.has(key)) return sessionPreferences.get(key);
    try { return localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
}
export function writePreference(key, value) {
    const text = String(value);
    sessionPreferences.set(key, text);
    try { localStorage.setItem(key, text); sessionPreferences.delete(key); return true; }
    catch { return false; }
}
// КОНЕЦ РАЗДЕЛА 3
