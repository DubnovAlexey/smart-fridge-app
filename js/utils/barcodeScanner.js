// ==============================================================================
// ФАЙЛ: js/utils/barcodeScanner.js
// НАЗНАЧЕНИЕ: Сканнер с улучшенной рамкой и визуальной зеленой вспышкой
// ==============================================================================

import { showToast } from './helpers.js';
import { t } from './translations.js'; // Подключили переводы

let html5QrCode = null;
let isProcessing = false;

async function fetchProductByBarcode(barcode) {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1 && data.product) {
            const product = data.product;
            const name = product.product_name_ru || product.product_name || '';
            if (!name) return null;
            return name.trim();
        }
        return null;
    } catch (error) {
        return null;
    }
}

export function initScanner(onSuccessCallback) {
    const scannerModal = document.getElementById('scanner-modal');
    const scannerContainer = document.getElementById('scanner-container');
    const header = document.getElementById('scanner-header');
    const btnCloseScanner = document.getElementById('btn-close-scanner');
    const laser = document.getElementById('scanner-laser');
    const statusText = document.getElementById('scanner-status');

    function startScanner() {
        isProcessing = false;
        scannerModal.classList.remove('hidden');

        // Сброс визуальных стилей в начальное состояние
        scannerContainer.classList.remove('scan-success-flash');
        header.classList.replace('bg-green-600', 'bg-indigo-600');
        laser.classList.remove('hidden');

        // Перевод стартового текста
        statusText.innerHTML = t('scan_wait');
        statusText.className = 'p-6 text-center text-sm font-semibold bg-slate-50 text-slate-600 transition-colors';

        html5QrCode = new Html5Qrcode("reader");

        html5QrCode.start(
            { facingMode: "environment" },
            // Увеличили рамку, чтобы мелкие штрихкоды вроде Orbit ловились проще
            { fps: 10, qrbox: { width: 300, height: 200 } },
            async (decodedText) => {
                if (isProcessing) return;
                isProcessing = true;

                // === ЗЕЛЕНАЯ ВСПЫШКА УСПЕХА ===
                laser.classList.add('hidden');
                scannerContainer.classList.add('scan-success-flash'); // Рамка окна зеленеет
                header.classList.replace('bg-indigo-600', 'bg-green-600'); // Шапка зеленеет

                statusText.innerHTML = `✅ ${t('scan_code')} <b>${decodedText}</b>!<br><span class="text-xs">⏳ ${t('scan_search')}</span>`;
                statusText.classList.replace('text-slate-600', 'text-green-600');
                statusText.classList.replace('bg-slate-50', 'bg-green-50');

                const productName = await fetchProductByBarcode(decodedText);

                await stopScanner();

                if (productName) {
                    showToast(`Найдено: ${productName}`, 'success');
                    onSuccessCallback(productName);
                } else {
                    showToast(`Не найдено.`, 'error');
                    onSuccessCallback('');
                }
            },
            (errorMessage) => { }
        ).catch((err) => {
            stopScanner();
            showToast('❌ Ошибка камеры.', 'error');
        });
    }

    async function stopScanner() {
        if (html5QrCode && html5QrCode.isScanning) {
            try { await html5QrCode.stop(); } catch (e) { }
        }
        scannerModal.classList.add('hidden');
    }

    btnCloseScanner.addEventListener('click', stopScanner);
    return startScanner;
}