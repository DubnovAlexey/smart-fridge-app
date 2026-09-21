// ==============================================================================
// ФАЙЛ: js/utils/csvManager.js
// НАЗНАЧЕНИЕ: Экспорт и Импорт базы продуктов (Адаптировано для Облака V2).
//
// ЧТО РЕАЛИЗОВАНО В ЭТОМ ФАЙЛЕ:
// 1. Асинхронный импорт: Загрузка файлов теперь использует async/await, чтобы
//    дождаться сохранения каждого продукта в Firebase перед переходом к следующему.
// 2. Информативность: Добавлены уведомления (Toasts) о начале и окончании облачной загрузки.
// 3. Совместимость: Сохранены алгоритмы экранирования кавычек и чтения старых файлов.
// ==============================================================================
import { showToast } from './helpers.js';

export function exportToCSV(batches) {
    if (batches.length === 0) {
        showToast('Холодильник пуст. Нечего экспортировать!', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Название,Категория,Кол-во,Ед.изм.,Дата_добавления,Годен_до,Цена,Скоропорт,Заморозка,Заметка\n";

    batches.forEach(b => {
        const added = new Date(b.addedAt).toLocaleDateString('ru-RU');
        const exp = new Date(b.expirationDate).toLocaleDateString('ru-RU');

        const safeName = `"${b.name.replace(/"/g, '""')}"`;
        const safeNote = `"${(b.note || '').replace(/"/g, '""')}"`;

        const isPerish = b.isPerishable ? 'Да' : 'Нет';
        const isFroz = b.isFrozen ? 'Да' : 'Нет';

        const row = `${b.id},${safeName},${b.category},${b.count},${b.unit},${added},${exp},${b.price || 0},${isPerish},${isFroz},${safeNote}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Умный_Холодильник_${new Date().toLocaleDateString('ru-RU')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('База успешно экспортирована', 'success');
}

export function importFromCSV(file, fridgeModel, updateCallback) {
    const reader = new FileReader();

    // 1. Делаем функцию обработки файла асинхронной (async)
    reader.onload = async function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            let importedCount = 0;

            // 2. Предупреждаем пользователя, что процесс может занять пару секунд
            showToast('⏳ Начинаем импорт в облако. Пожалуйста, подождите...', 'info');

            const parseCSVLine = (str) => {
                let result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < str.length; i++) {
                    let char = str[i];
                    if (char === '"' && str[i+1] === '"') {
                        current += '"'; i++;
                    } else if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            };

            for (let i = 1; i < lines.length; i++) {
                const columns = parseCSVLine(lines[i]);
                if (columns.length >= 7) {
                    const name = columns[1];
                    const category = columns[2];
                    const count = columns[3];
                    const unit = columns[4];

                    let exactDate = '';
                    if (columns[6]) {
                        const dateParts = columns[6].split('.');
                        if (dateParts.length === 3) {
                            exactDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                        }
                    }

                    const price = columns[7] || 0;

                    let isPerishable = false;
                    let isFrozen = false;
                    let note = '';

                    if (columns.length > 9) {
                        isPerishable = columns[8] === 'Да';
                        isFrozen = columns[9] === 'Да';
                        note = columns[10] || '';
                    } else {
                        note = columns[8] || '';
                    }

                    // 3. Главное изменение: добавляем await.
                    // Код остановится здесь на миллисекунду и дождется ответа от Firebase,
                    // прежде чем переходить к следующей строчке файла.
                    await fridgeModel.addBatch(name, category, count, unit, '', exactDate, isPerishable, isFrozen, price, note);
                    importedCount++;
                }
            }
            // 4. Обновляем интерфейс только когда ВСЕ продукты загружены в базу
            showToast(`✅ Успешно загружено в облако: ${importedCount} продуктов`, 'success');
            updateCallback();
        } catch (error) {
            showToast('❌ Ошибка при импорте. Проверьте формат файла или соединение.', 'error');
            console.error(error);
        }
    };

    reader.readAsText(file);
}