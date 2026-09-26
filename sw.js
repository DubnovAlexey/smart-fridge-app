// Пустой Service Worker нужен только для того, чтобы браузер телефона
// позволил установить сайт как приложение на рабочий стол.
self.addEventListener('install', (e) => { console.log('[Service Worker] Установлен'); });
self.addEventListener('fetch', (e) => {});