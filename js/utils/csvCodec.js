// ==============================================================================
// ФАЙЛ: js/utils/csvCodec.js
// НАЗНАЧЕНИЕ: Чистый CSV-кодек: кавычки, запятые, многострочные заметки, переносы CRLF.
// РАЗДЕЛЫ: 1. Чтение RFC4180; 2. Безопасная сериализация экспортируемых полей.
// ==============================================================================
// НАЧАЛО РАЗДЕЛА 1
export function parseCSV(text) {
    const rows = []; let row = [], field = '', quoted = false;
    text = String(text).replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            if (quoted && text[i + 1] === '"') { field += '"'; i++; }
            else quoted = !quoted;
        } else if (char === ',' && !quoted) { row.push(field); field = ''; }
        else if ((char === '\n' || char === '\r') && !quoted) {
            if (char === '\r' && text[i + 1] === '\n') i++;
            row.push(field); if (row.some(value => value.trim())) rows.push(row);
            row = []; field = '';
        } else field += char;
    }
    if (quoted) throw new Error('Незакрытые кавычки CSV');
    row.push(field); if (row.some(value => value.trim())) rows.push(row);
    return rows;
}
// КОНЕЦ РАЗДЕЛА 1
// НАЧАЛО РАЗДЕЛА 2
export function serializeCSV(rows) {
    return rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
}
export function batchesToCSV(batches) {
    const rows = [['ID', 'Название', 'Категория', 'Кол-во', 'Ед.изм.', 'Дата_добавления', 'Годен_до', 'Цена', 'Скоропорт', 'Заморозка', 'Заметка', 'Валюта', 'Приготовлено', 'Состав']];
    for (const b of batches) rows.push([b.id, b.name, b.category, b.count, b.unit,
        new Date(b.addedAt).toLocaleDateString('ru-RU'), new Date(b.expirationDate).toLocaleDateString('ru-RU'),
        b.price || 0, b.isPerishable ? 'Да' : 'Нет', b.isFrozen ? 'Да' : 'Нет', b.note || '',
        b.currency || 'RUB', b.isCooked ? 'Да' : 'Нет', b.composition || '']);
    return '\uFEFF' + serializeCSV(rows);
}
export function csvRowToProduct(columns) {
    if (columns.length < 7) throw new Error('Недостаточно колонок CSV');
    const count = Number(columns[3]), price = Number(columns[7] || 0);
    if (!columns[1].trim() || !Number.isFinite(count) || count <= 0 || !Number.isFinite(price) || price < 0) throw new Error('Некорректное количество или цена');
    let exactDate = columns[6].trim();
    const ru = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(exactDate);
    if (ru) exactDate = `${ru[3]}-${ru[2].padStart(2, '0')}-${ru[1].padStart(2, '0')}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exactDate) || (!Number.isFinite(Date.parse(exactDate)) || new Date(exactDate).toISOString().slice(0, 10) !== exactDate)) throw new Error('Некорректная дата CSV');
    return { name: columns[1], category: columns[2], count, unit: columns[4], exactDate, price,
        isPerishable: columns.length > 9 && columns[8] === 'Да', isFrozen: columns.length > 9 && columns[9] === 'Да',
        note: columns.length > 9 ? columns[10] || '' : columns[8] || '', currency: columns[11] || 'RUB',
        isCooked: columns[12] === 'Да', composition: columns[13] || '' };
}
// КОНЕЦ РАЗДЕЛА 2
