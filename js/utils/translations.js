// ==============================================================================
// ФАЙЛ: js/utils/translations.js
// НАЗНАЧЕНИЕ: Полный словарь для мультиязычности (i18n)
// ==============================================================================

export const TRANSLATIONS = {
    ru: {
        dir: 'ltr',
        title: "❄️ Умный холодильник", how_to: "ℹ️ Как пользоваться",
        stats_title: "📊 Общая статистика", consumed: "✅ Съедено:", wasted: "🗑 Списано:", lost: "💸 Потери:",
        ai_title: "🤖 AI-Шеф", ai_desc: "Идеи рецептов из ваших запасов.",
        rescue: "🚨 Спасти продукты", all_food: "🥗 Из всего, что есть",
        add_title: "➕ Добавить на полку", scan_btn: "📷 Скан штрих-кода",
        what_add: "Что добавляем?", cat_label: "Категория", unit_label: "Ед.", count_label: "Кол-во", exp_label: "Срок хранения:", or: "ИЛИ",
        adv_settings: "⚙️ Расширенные настройки ▾", add_btn: "➕ В холодильник", shelves_title: "🧊 Содержимое полок",
        role_user: "🛡️ Юзер", role_admin: "🛠️ Админ", role_guest: "👁️ Гость",

        admin_panel_title: "🛠️ Системные настройки (Admin)", api_key_label: "API-ключ Gemini",
        rights_title: "⚙️ Делегирование прав", guest_rights: "👤 Права Гостей", child_rights: "🧒 Права Детей",
        allow_take: "Разрешить брать", allow_waste: "Разрешить списывать",

        cat_dairy: "🥛 Молочка", cat_meat: "🥩 Мясо", cat_veg: "🍎 Овощи/Фрукты", cat_prepared: "🍲 Готовая еда", cat_preserves: "🥫 Заготовки", cat_alcohol: "🍷 Напитки", cat_other: "📦 Прочее",
        unit_шт: "шт", unit_кг: "кг", unit_л: "л",

        price_label: "Цена", comp_label: "Состав", note_label: "Заметка",
        perish_label: "⚠️ Скоропорт", frozen_label: "❄️ В морозилку", cooked_label: "⭐ Требует оценки",

        scan_title: "📷 Скан штрих-кода", scan_wait: "Поместите штрих-код в рамку. Ищем фокус...", scan_code: "Код", scan_search: "Ищем в базе...", scan_not_found: "Не найдено в базе",
        what_add_ph: "Напр. Кефир (или скан)", count_ph: "1", days_ph: "Дней", price_ph: "Цена", comp_ph: "Ингредиенты...", note_ph: "Магазин", name_ph: "Ваше имя",
        added: "Добавлено", days_left: "Осталось дней", frozen: "В морозилке", craft_badge: "Крафт / Блюдо", review_family: "Отзыв",
        btn_edit: "Изменить", btn_take: "Взять", btn_rate: "Оценить", btn_waste: "Списать", empty_fridge: "Пусто. Добавьте продукты!",

        preview_title: "📦 Распознан продукт",
        preview_fake_warn: "⚠️ Внимание: Базы штрих-кодов могут ошибаться. Если название не совпадает с реальностью — возможно, штрих-код переклеен.",
        btn_preview_add: "✅ Перенести в форму",
        btn_preview_next: "🔄 Сканировать следующий",
        btn_preview_fake: "❌ Ошибка / Подделка",
        fake_alert: "Жалоба отправлена! Сканируем дальше..."
    },
    he: {
        dir: 'rtl',
        title: "❄️ מקרר חכם", how_to: "ℹ️ הדרכה",
        stats_title: "📊 סטטיסטיקה כללית", consumed: "✅ נצרך:", wasted: "🗑 נזרק:", lost: "💸 הפסד:",
        ai_title: "🤖 שף AI", ai_desc: "רעיונות למתכונים.",
        rescue: "🚨 להציל אוכל", all_food: "🥗 להכין מהכל",
        add_title: "➕ הוסף למדף", scan_btn: "📷 סרוק ברקוד",
        what_add: "מה מוסיפים?", cat_label: "קטגוריה", unit_label: "יחידה", count_label: "כמות", exp_label: "תוקף:", or: "או",
        adv_settings: "⚙️ הגדרות מתקדמות ▾", add_btn: "➕ הוסף למקרר", shelves_title: "🧊 תכולת המקרר",
        role_user: "🛡️ משתמש", role_admin: "🛠️ מנהל", role_guest: "👁️ אורח",

        admin_panel_title: "🛠️ הגדרות מערכת (Admin)", api_key_label: "מפתח API של Gemini",
        rights_title: "⚙️ ניהול הרשאות", guest_rights: "👤 הרשאות אורחים", child_rights: "🧒 הרשאות ילדים",
        allow_take: "אפשר לקחת", allow_waste: "אפשר לזרוק",

        cat_dairy: "🥛 חלב וביצים", cat_meat: "🥩 בשר", cat_veg: "🍎 ירקות ופירות", cat_prepared: "🍲 אוכל מוכן", cat_preserves: "🥫 שימורים", cat_alcohol: "🍷 משקאות", cat_other: "📦 אחר",
        unit_шт: "יח'", unit_кг: "ק״ג", unit_л: "ליטר",

        price_label: "מחיר", comp_label: "רכיבים", note_label: "הערה",
        perish_label: "⚠️ מתקלקל מהר", frozen_label: "❄️ למקפיא", cooked_label: "⭐ דורש דירוג",

        scan_title: "📷 סורק ברקוד", scan_wait: "הצב את הברקוד במסגרת", scan_code: "קוד", scan_search: "מחפש...", scan_not_found: "לא נמצא",
        what_add_ph: "חלב (או סרוק)", count_ph: "1", days_ph: "ימים", price_ph: "מחיר", comp_ph: "רכיבים...", note_ph: "חנות", name_ph: "השם שלך",
        added: "נוסף", days_left: "ימים נותרו", frozen: "במקפיא", craft_badge: "מאכל ביתי", review_family: "ביקורת",
        btn_edit: "ערוך", btn_take: "קח", btn_rate: "דרג", btn_waste: "זרוק", empty_fridge: "המדפים ריקים!",

        preview_title: "📦 מוצר זוהה",
        preview_fake_warn: "⚠️ שימו לב: אם שם המוצר לא תואם למציאות, ייתכן שהברקוד זויף.",
        btn_preview_add: "✅ העבר לטופס",
        btn_preview_next: "🔄 סרוק את הבא",
        btn_preview_fake: "❌ שגיאה / זיוף",
        fake_alert: "התלונה נשלחה! ממשיכים לסרוק..."
    },
    en: {
        dir: 'ltr',
        title: "❄️ Smart Fridge", how_to: "ℹ️ Guide",
        stats_title: "📊 Global Statistics", consumed: "✅ Consumed:", wasted: "🗑 Wasted:", lost: "💸 Lost:",
        ai_title: "🤖 AI Chef", ai_desc: "Recipe ideas.", rescue: "🚨 Rescue food", all_food: "🥗 Make from all",
        add_title: "➕ Add to shelf", scan_btn: "📷 Scan Barcode",
        what_add: "What to add?", cat_label: "Category", unit_label: "Unit", count_label: "Count", exp_label: "Expiration:", or: "OR",
        adv_settings: "⚙️ Advanced Settings ▾", add_btn: "➕ Add to Fridge", shelves_title: "🧊 Fridge Contents",
        role_user: "🛡️ User", role_admin: "🛠️ Admin", role_guest: "👁️ Guest",
        admin_panel_title: "🛠️ System Settings", api_key_label: "Gemini API Key",
        rights_title: "⚙️ Permissions", guest_rights: "👤 Guest Rights", child_rights: "🧒 Child Rights",
        allow_take: "Allow taking", allow_waste: "Allow wasting",
        cat_dairy: "🥛 Dairy", cat_meat: "🥩 Meat", cat_veg: "🍎 Veg/Fruits", cat_prepared: "🍲 Prepared", cat_preserves: "🥫 Preserves", cat_alcohol: "🍷 Alcohol", cat_other: "📦 Other",
        unit_шт: "pcs", unit_кг: "kg", unit_л: "L",
        price_label: "Price", comp_label: "Ingredients", note_label: "Note",
        perish_label: "⚠️ Perishable", frozen_label: "❄️ To Freezer", cooked_label: "⭐ Needs Rating",
        scan_title: "📷 Scanner", scan_wait: "Place barcode in the box", scan_code: "Code", scan_search: "Searching...", scan_not_found: "Not found",
        what_add_ph: "e.g. Milk", count_ph: "1", days_ph: "Days", price_ph: "Price", comp_ph: "Ingredients...", note_ph: "Store", name_ph: "Your name",
        added: "Added", days_left: "Days left", frozen: "Frozen", craft_badge: "Home Meal", review_family: "Review",
        btn_edit: "Edit", btn_take: "Take", btn_rate: "Rate", btn_waste: "Waste", empty_fridge: "Shelves are empty!",

        preview_title: "📦 Product Recognized",
        preview_fake_warn: "⚠️ Warning: Database info can be wrong. If the name does not match, the barcode might be fake.",
        btn_preview_add: "✅ Add to Form",
        btn_preview_next: "🔄 Scan Next",
        btn_preview_fake: "❌ Fake / Error",
        fake_alert: "Report sent! Scanning next..."
    },
    de: {
        dir: 'ltr', title: "❄️ Intelligenter Kühlschrank", how_to: "ℹ️ Anleitung", stats_title: "📊 Statistiken", consumed: "✅ Verbraucht:", wasted: "🗑 Verschwendet:", lost: "💸 Verloren:", ai_title: "🤖 KI-Koch", ai_desc: "Rezeptideen.", rescue: "🚨 Retten", all_food: "🥗 Aus allem", add_title: "➕ Hinzufügen", scan_btn: "📷 Barcode scannen", what_add: "Was?", cat_label: "Kategorie", unit_label: "Einh.", count_label: "Anz.", exp_label: "Haltbarkeit:", or: "ODER", adv_settings: "⚙️ Erweitert ▾", add_btn: "➕ Speichern", shelves_title: "🧊 Inhalt", role_user: "🛡️ Nutzer", role_admin: "🛠️ Admin", role_guest: "👁️ Gast", admin_panel_title: "🛠️ Einstellungen", api_key_label: "API-Schlüssel", rights_title: "⚙️ Rechte", guest_rights: "👤 Gast", child_rights: "🧒 Kind", allow_take: "Erlauben", allow_waste: "Verschwenden erlauben", cat_dairy: "🥛 Milch", cat_meat: "🥩 Fleisch", cat_veg: "🍎 Gemüse", cat_prepared: "🍲 Fertiggerichte", cat_preserves: "🥫 Konserven", cat_alcohol: "🍷 Alkohol", cat_other: "📦 Sonstiges", unit_шт: "Stk", unit_кг: "kg", unit_л: "L", price_label: "Preis", comp_label: "Zutaten", note_label: "Notiz", perish_label: "⚠️ Verderblich", frozen_label: "❄️ Ins Eisfach", cooked_label: "⭐ Bewertung", scan_title: "📷 Scanner", scan_wait: "Barcode in Rahmen", scan_code: "Code", scan_search: "Suchen...", scan_not_found: "Nicht gefunden", what_add_ph: "Milch...", count_ph: "1", days_ph: "Tage", price_ph: "Preis", comp_ph: "Zutaten...", note_ph: "Notiz", name_ph: "Ihr Name", added: "Hinzug.", days_left: "Tage übrig", frozen: "Gefroren", craft_badge: "Mahlzeit", review_family: "Bewertung", btn_edit: "Bearbeiten", btn_take: "Nehmen", btn_rate: "Bewerten", btn_waste: "Müll", empty_fridge: "Leer!", preview_title: "📦 Produkt Erkannt", preview_fake_warn: "⚠️ Achtung: Wenn der Name nicht stimmt, ist der Barcode möglicherweise gefälscht.", btn_preview_add: "✅ Ins Formular", btn_preview_next: "🔄 Nächster Scan", btn_preview_fake: "❌ Fehler / Fälschung", fake_alert: "Gemeldet! Nächster Scan..."
    },
    es: {
        dir: 'ltr', title: "❄️ Nevera Inteligente", how_to: "ℹ️ Guía", stats_title: "📊 Estadísticas", consumed: "✅ Consumido:", wasted: "🗑 Desperdiciado:", lost: "💸 Perdido:", ai_title: "🤖 Chef IA", ai_desc: "Ideas de recetas.", rescue: "🚨 Rescatar", all_food: "🥗 De todo", add_title: "➕ Agregar", scan_btn: "📷 Escanear", what_add: "¿Qué?", cat_label: "Categoría", unit_label: "Unid.", count_label: "Cant.", exp_label: "Caducidad:", or: "O", adv_settings: "⚙️ Avanzado ▾", add_btn: "➕ Guardar", shelves_title: "🧊 Contenido", role_user: "🛡️ Usuario", role_admin: "🛠️ Admin", role_guest: "👁️ Invitado", admin_panel_title: "🛠️ Ajustes", api_key_label: "Clave API", rights_title: "⚙️ Permisos", guest_rights: "👤 Invitado", child_rights: "🧒 Niño", allow_take: "Permitir", allow_waste: "Tirar", cat_dairy: "🥛 Lácteos", cat_meat: "🥩 Carne", cat_veg: "🍎 Verduras", cat_prepared: "🍲 Preparado", cat_preserves: "🥫 Conservas", cat_alcohol: "🍷 Alcohol", cat_other: "📦 Otro", unit_шт: "ud", unit_кг: "kg", unit_л: "L", price_label: "Precio", comp_label: "Ingredientes", note_label: "Nota", perish_label: "⚠️ Perecedero", frozen_label: "❄️ Al congelador", cooked_label: "⭐ Valorar", scan_title: "📷 Escáner", scan_wait: "Código en recuadro", scan_code: "Código", scan_search: "Buscando...", scan_not_found: "No encontrado", what_add_ph: "Leche...", count_ph: "1", days_ph: "Días", price_ph: "Precio", comp_ph: "Ingredientes...", note_ph: "Nota", name_ph: "Su nombre", added: "Agregado", days_left: "Días", frozen: "Congelado", craft_badge: "Comida", review_family: "Reseña", btn_edit: "Editar", btn_take: "Tomar", btn_rate: "Valorar", btn_waste: "Tirar", empty_fridge: "¡Vacío!", preview_title: "📦 Producto Reconocido", preview_fake_warn: "⚠️ Atención: Si el nombre no coincide, el código de barras puede ser falso.", btn_preview_add: "✅ Al formulario", btn_preview_next: "🔄 Escanear siguiente", btn_preview_fake: "❌ Error / Falso", fake_alert: "¡Reportado! Escaneando..."
    }
};

export function t(key) {
    const lang = window.appLang || 'ru';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
    return key;
}