// ==============================================================================
// ФАЙЛ: js/utils/barcodeScanner.js
// НАЗНАЧЕНИЕ: Интеграция камеры мобильного телефона и базы Open Food Facts.
// ==============================================================================

import { showToast } from './helpers.js';

let html5QrcodeScanner = null;

// Функция отправки запроса в мировую базу продуктов
async function fetchProductByBarcode(barcode) {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url);
        const data = await response.json();

        // Если продукт найден в базе (статус 1)
        if (data.status === 1 && data.product) {
            const product = data.product;

            // Пытаемся найти русское название, если нет — берем международное
            const name = product.product_name_ru || product.product_name || '';

            // Если названия вообще нет, возвращаем null
            if (!name) return null;

            // Добавляем бренд к названию для точности (например, "Простоквашино Кефир")
            const brand = product.brands ? product.brands.split(',')[0] : '';
            let fullName = name;

            if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
                fullName = `${brand} ${name}`;
            }

            return fullName.trim();
        }
        return null; // В базе такого штрих-кода нет
    } catch (error) {
        console.error("Ошибка при запросе к базе штрих-кодов:", error);
        return null;
    }
}

// Экспортируем функцию инициализации сканера
export function initScanner(onSuccessCallback) {
    const scannerModal = document.getElementById('scanner-modal');
    const btnCloseScanner = document.getElementById('btn-close-scanner');

    function startScanner() {
        // Открываем модальное окно на весь экран
        scannerModal.classList.remove('hidden');

        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
        }

        // Настройки камеры (прямоугольное окошко как раз под штрих-коды)
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 150 } },
            false
        );

        // Запуск распознавания
        html5QrcodeScanner.render(async (decodedText) => {
            // Как только поймали код - сразу выключаем камеру и закрываем окно
            html5QrcodeScanner.clear();
            scannerModal.classList.add('hidden');

            showToast(`Штрих-код ${decodedText} считан! Ищу в базе...`, 'info');

            const productName = await fetchProductByBarcode(decodedText);

            if (productName) {
                showToast(`Найдено: ${productName}`, 'success');
                onSuccessCallback(productName);
            } else {
                showToast(`Продукт не найден в базе. Введите название вручную.`, 'error');
                // Передаем пустую строку, чтобы программа просто перевела курсор на поле ввода
                onSuccessCallback('');
            }
        }, (errorMessage) => {
            // Библиотека постоянно генерирует ошибки, пока ищет фокус. Мы их просто игнорируем.
        });
    }

    // Обработчик закрытия окна (крестик)
    btnCloseScanner.addEventListener('click', () => {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear(); // Выключаем камеру
        }
        scannerModal.classList.add('hidden');
    });

    return startScanner;
}