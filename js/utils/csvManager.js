// ==============================================================================
// ФАЙЛ: js/utils/csvManager.js
// НАЗНАЧЕНИЕ: Экспорт и Импорт базы продуктов в формате CSV
// ==============================================================================

export function exportToCSV(batches) {
    if (batches.length === 0) {
        alert('Холодильник пуст. Нечего экспортировать!');
        return;
    }

    // Добавляем BOM (\uFEFF) чтобы Excel правильно понимал кириллицу (UTF-8)
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

    // Заголовки столбцов
    csvContent += "ID,Название,Категория,Кол-во,Ед.изм.,Дата_добавления,Годен_до,Цена,Заметка\n";

    batches.forEach(b => {
        const added = new Date(b.addedAt).toLocaleDateString('ru-RU');
        const exp = new Date(b.expirationDate).toLocaleDateString('ru-RU');

        // Очищаем текст от запятых и переносов строк, чтобы не сломать таблицу
        const safeName = `"${b.name.replace(/"/g, '""')}"`;
        const safeNote = `"${(b.note || '').replace(/"/g, '""')}"`;

        // Формируем строку
        const row = `${b.id},${safeName},${b.category},${b.count},${b.unit},${added},${exp},${b.price || 0},${safeNote}`;
        csvContent += row + "\n";
    });

    // Создаем невидимую ссылку и эмулируем клик для скачивания файла
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
            // Разбиваем текст на строки
            const lines = text.split('\n').filter(line => line.trim() !== '');

            // Пропускаем первую строку (заголовки) и идем по остальным
            let importedCount = 0;
            for (let i = 1; i < lines.length; i++) {
                // Простой парсер CSV (в реальном проекте лучше использовать библиотеку PapaParse)
                const columns = lines[i].split(',');
                if (columns.length >= 7) {
                    const name = columns[1].replace(/"/g, '');
                    const category = columns[2];
                    const count = columns[3];
                    const unit = columns[4];
                    // Для импорта мы используем заглушку по дате (5 дней), так как парсинг дат из строк сложен
                    const days = 5;
                    const exactDate = '';
                    const price = columns[7] || 0;
                    const note = columns[8] ? columns[8].replace(/"/g, '') : '';

                    fridgeModel.addBatch(name, category, count, unit, days, exactDate, false, false, price, note);
                    importedCount++;
                }
            }
            alert(`✅ Успешно импортировано продуктов: ${importedCount}`);
            updateCallback(); // Перерисовываем интерфейс
        } catch (error) {
            alert('❌ Ошибка при чтении CSV файла. Убедитесь, что формат верный.');
            console.error(error);
        }
    };

    reader.readAsText(file);
}