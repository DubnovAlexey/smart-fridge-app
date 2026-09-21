// ==============================================================================
// ФАЙЛ: js/utils/barcodeScanner.js
// НАЗНАЧЕНИЕ: Сканнер с запросом полной информации о продукте (фото, состав)
// ==============================================================================

import { showToast } from './helpers.js';
import { t } from './translations.js';

let html5QrCode = null;
let isProcessing = false;

async function fetchProductByBarcode(barcode) {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1 && data.product) {
            const p = data.product;
            const name = p.product_name_ru || p.product_name || '';
            if (!name) return null;

            const brand = p.brands ? p.brands.split(',')[0] : '';
            let fullName = name;
            if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
                fullName = `${brand} ${name}`;
            }

            // Возвращаем богатый объект данных
            return {
                barcode: barcode,
                name: fullName.trim(),
                image: p.image_front_url || '',
                ingredients: p.ingredients_text_ru || p.ingredients_text || ''
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

export function initScanner(onSuccessCallback) {
    const scannerModal = document.getElementById('scanner-modal');
    const targetBox = document.getElementById('scanner-target-box');
    const btnCloseScanner = document.getElementById('btn-close-scanner');
    const statusText = document.getElementById('scanner-status');
    const laser = document.getElementById('scanner-laser');
    const scannerContainer = document.getElementById('scanner-container');
    const header = document.getElementById('scanner-header');

    function startScanner() {
        isProcessing = false;
        scannerModal.classList.remove('hidden');

        scannerContainer.classList.remove('scan-success-flash');
        header.classList.replace('bg-green-600', 'bg-indigo-600');
        targetBox.classList.replace('border-green-500', 'border-red-500');
        targetBox.classList.remove('bg-green-500/20');
        laser.classList.remove('hidden');

        statusText.innerHTML = t('scan_wait') || 'Поместите штрих-код в центр рамки...';
        statusText.className = 'p-6 text-center text-sm font-semibold bg-slate-50 text-slate-600 transition-colors';

        html5QrCode = new Html5Qrcode("reader");

        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 300, height: 200 } },
            async (decodedText) => {
                if (isProcessing) return;
                isProcessing = true;

                targetBox.classList.replace('border-red-500', 'border-green-500');
                targetBox.classList.add('bg-green-500/20');
                laser.classList.add('hidden');
                scannerContainer.classList.add('scan-success-flash');
                header.classList.replace('bg-indigo-600', 'bg-green-600');

                if (navigator.vibrate) navigator.vibrate(200);

                statusText.innerHTML = `✅ ${t('scan_code')} <b>${decodedText}</b>!<br><span class="text-xs">⏳ ${t('scan_search')}</span>`;
                statusText.classList.replace('text-slate-600', 'text-green-600');
                statusText.classList.replace('bg-slate-50', 'bg-green-50');

                const productData = await fetchProductByBarcode(decodedText);

                setTimeout(async () => {
                    await stopScanner();
                    if (productData) {
                        onSuccessCallback(productData);
                    } else {
                        showToast(t('scan_not_found') || 'Не найдено.', 'error');
                        onSuccessCallback(null);
                    }
                }, 1000);
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