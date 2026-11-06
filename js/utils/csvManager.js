// ==============================================================================
// ФАЙЛ: js/utils/csvManager.js
// НАЗНАЧЕНИЕ: Экспорт и импорт продуктов с сохранением полного состава полей.
// РАЗДЕЛЫ: 1. Загрузка CSV; 2. Проверка всего файла до записи в выбранное хранилище.
// ==============================================================================
import { showToast } from './helpers.js';
import { parseCSV, batchesToCSV, csvRowToProduct } from './csvCodec.js';

// НАЧАЛО ФУНКЦИИ exportToCSV
export function exportToCSV(batches) {
    if (!batches.length) { showToast('Холодильник пуст. Нечего экспортировать!', 'error'); return; }
    const url = URL.createObjectURL(new Blob([batchesToCSV(batches)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = `Умный_Холодильник_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('База успешно экспортирована', 'success');
}
// КОНЕЦ ФУНКЦИИ exportToCSV

// НАЧАЛО ФУНКЦИИ importFromCSV
export function importFromCSV(file, fridgeModel, updateCallback) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const rows = parseCSV(event.target.result);
            // Ошибочная строка не приводит к частичной записи предыдущих продуктов.
            const products = rows.slice(1).map(csvRowToProduct);
            if (!products.length) throw new Error('Файл не содержит продуктов');
            showToast('⏳ Импорт продуктов...', 'info');
            for (const item of products) {
                await fridgeModel.addBatch(item.name, item.category, item.count, item.unit, '', item.exactDate,
                    item.isPerishable, item.isFrozen, item.isCooked, item.price, item.currency, item.composition, item.note);
            }
            showToast(`✅ Импортировано продуктов: ${products.length}`, 'success');
            updateCallback();
        } catch (error) { showToast('❌ Ошибка импорта: ' + error.message, 'error'); }
    };
    reader.onerror = () => showToast('Не удалось прочитать CSV', 'error');
    reader.readAsText(file);
}
// КОНЕЦ ФУНКЦИИ importFromCSV
