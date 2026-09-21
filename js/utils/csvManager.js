// ==============================================================================
// ФАЙЛ: js/utils/csvManager.js
// НАЗНАЧЕНИЕ: Экспорт и Импорт базы продуктов в формате CSV (для открытия в Excel).
//
// ЧТО РЕАЛИЗОВАНО В ЭТОМ ФАЙЛЕ:
// 1. exportToCSV: Превращает массив продуктов в текст. Оборачивает названия в кавычки, чтобы
//    запятые в тексте не ломали таблицу.
// 2. importFromCSV: Читает файл, разбивает строки, правильно парсит даты и возвращает в базу.
// 3. Совместимость: Система умеет читать как новые файлы (с галочками), так и старые.
// ==============================================================================
import { showToast } from './helpers.js';

export function exportToCSV(batches) {
    if (batches.length === 0) {
        showToast('Холодильник пуст. Нечего экспортировать!', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    // [ИСПРАВЛЕНИЕ] 1. Добавлены заголовки "Скоропорт" и "Заморозка" перед "Заметкой"
    csvContent += "ID,Название,Категория,Кол-во,Ед.изм.,Дата_добавления,Годен_до,Цена,Скоропорт,Заморозка,Заметка\n";

    batches.forEach(b => {
        const added = new Date(b.addedAt).toLocaleDateString('ru-RU');
        const exp = new Date(b.expirationDate).toLocaleDateString('ru-RU');

        const safeName = `"${b.name.replace(/"/g, '""')}"`;
        const safeNote = `"${(b.note || '').replace(/"/g, '""')}"`;

        // [ИСПРАВЛЕНИЕ] 2. Превращаем логические true/false в понятные для Excel "Да"/"Нет"
        const isPerish = b.isPerishable ? 'Да' : 'Нет';
        const isFroz = b.isFrozen ? 'Да' : 'Нет';

        // [ИСПРАВЛЕНИЕ] 3. Вставляем переменные isPerish и isFroz в строку экспорта
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

    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            let importedCount = 0;

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

                    // [ИСПРАВЛЕНИЕ] 4. Проверка совместимости со старыми файлами
                    // Если колонок больше 9, значит это новый формат с галочками
                    if (columns.length > 9) {
                        isPerishable = columns[8] === 'Да';
                        isFrozen = columns[9] === 'Да';
                        note = columns[10] || '';
                    } else {
                        // Если загрузили старый файл, где заметка была сразу после цены
                        note = columns[8] || '';
                    }

                    // [ИСПРАВЛЕНИЕ] 5. Передаем isPerishable и isFrozen в функцию создания
                    fridgeModel.addBatch(name, category, count, unit, '', exactDate, isPerishable, isFrozen, price, note);
                    importedCount++;
                }
            }
            showToast(`Успешно импортировано продуктов: ${importedCount}`, 'success');
            updateCallback();
        } catch (error) {
            showToast('Ошибка при чтении CSV файла. Убедитесь, что формат верный.', 'error');
            console.error(error);
        }
    };

    reader.readAsText(file);
}