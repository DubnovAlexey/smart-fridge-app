// ==============================================================================
// ФАЙЛ: js/utils/csvManager.js
// НАЗНАЧЕНИЕ: Экспорт и Импорт базы продуктов в формате CSV
// ==============================================================================

export function exportToCSV(batches) {
    if (batches.length === 0) {
        alert('Холодильник пуст. Нечего экспортировать!');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Название,Категория,Кол-во,Ед.изм.,Дата_добавления,Годен_до,Цена,Заметка\n";

    batches.forEach(b => {
        const added = new Date(b.addedAt).toLocaleDateString('ru-RU');
        const exp = new Date(b.expirationDate).toLocaleDateString('ru-RU');

        // Оборачиваем в кавычки и экранируем внутренние кавычки
        const safeName = `"${b.name.replace(/"/g, '""')}"`;
        const safeNote = `"${(b.note || '').replace(/"/g, '""')}"`;

        const row = `${b.id},${safeName},${b.category},${b.count},${b.unit},${added},${exp},${b.price || 0},${safeNote}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Умный_Холодильник_${new Date().toLocaleDateString('ru-RU')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function importFromCSV(file, fridgeModel, updateCallback) {
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            let importedCount = 0;

            // Надежный парсер строки CSV с поддержкой кавычек и запятых внутри
            const parseCSVLine = (str) => {
                let result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < str.length; i++) {
                    let char = str[i];
                    if (char === '"' && str[i+1] === '"') {
                        current += '"'; i++; // пропускаем экранированную кавычку
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

                    // Парсим русскую дату (ДД.ММ.ГГГГ) в формат для инпута (ГГГГ-ММ-ДД)
                    let exactDate = '';
                    if (columns[6]) {
                        const dateParts = columns[6].split('.');
                        if (dateParts.length === 3) {
                            exactDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                        }
                    }

                    const price = columns[7] || 0;
                    const note = columns[8] || '';

                    // Передаем пустую строку в days, и точную дату в exactDate
                    fridgeModel.addBatch(name, category, count, unit, '', exactDate, false, false, price, note);
                    importedCount++;
                }
            }
            alert(`✅ Успешно импортировано продуктов: ${importedCount}`);
            updateCallback();
        } catch (error) {
            alert('❌ Ошибка при чтении CSV файла. Убедитесь, что формат верный.');
            console.error(error);
        }
    };

    reader.readAsText(file);
}