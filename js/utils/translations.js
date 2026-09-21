// ==============================================================================
// ФАЙЛ: js/utils/translations.js
// НАЗНАЧЕНИЕ: Словарь для мультиязычности (i18n)
// ==============================================================================

export const TRANSLATIONS = {
    ru: {
        dir: 'ltr',
        title: "❄️ Умный холодильник",
        how_to: "ℹ️ Как пользоваться",
        stats_title: "📊 Общая статистика",
        consumed: "✅ Съедено:",
        wasted: "🗑 Списано:",
        lost: "💸 Потери:",
        ai_title: "🤖 AI-Шеф-повар",
        ai_desc: "Идеи рецептов из ваших запасов.",
        rescue: "🚨 Спасти продукты",
        all_food: "🥗 Из всего, что есть",
        add_title: "➕ Добавить на полку",
        scan_btn: "📷 Скан штрих-кода",
        what_add: "Что добавляем?",
        cat_label: "Категория",
        unit_label: "Ед.",
        count_label: "Кол-во",
        exp_label: "Срок хранения:",
        or: "ИЛИ",
        adv_settings: "⚙️ Расширенные настройки ▾",
        add_btn: "➕ В холодильник",
        shelves_title: "🧊 Содержимое полок",
        role_user: "🛡️ Юзер",
        role_admin: "🛠️ Админ",
        role_guest: "👁️ Гость",

        // КАТЕГОРИИ
        cat_dairy: "🥛 Молочка", cat_meat: "🥩 Мясо", cat_veg: "🍎 Овощи/Фрукты",
        cat_prepared: "🍲 Готовая еда", cat_preserves: "🥫 Заготовки", cat_alcohol: "🍷 Напитки", cat_other: "📦 Прочее",

        // ЕДИНИЦЫ ИЗМЕРЕНИЯ
        unit_шт: "шт", unit_кг: "кг", unit_л: "л",

        // РАСШИРЕННЫЕ НАСТРОЙКИ
        price_label: "Цена", comp_label: "Состав", note_label: "Заметка",
        perish_label: "⚠️ Скоропортящееся", frozen_label: "❄️ В морозилку", cooked_label: "⭐ Требует оценки качества",

        // СКАНЕР
        scan_title: "📷 Скан штрих-кода",
        scan_wait: "Поместите штрих-код в центр рамки. Сфокусируйте камеру.",
        scan_code: "Код", scan_search: "Ищем в базе...",

        // PLACEHOLDERS (Подсказки в полях ввода)
        what_add_ph: "Напр. Кефир (или скан)", count_ph: "1", days_ph: "Дней (напр. 5)",
        price_ph: "Напр. 450", comp_ph: "Ингредиенты...", note_ph: "Откуда / Магазин",
        name_ph: "Ваше имя",

        // ДЛЯ КАРТОЧЕК
        added: "Добавлено", days_left: "Осталось дней", frozen: "В морозилке",
        craft_badge: "Крафт / Блюдо", review_family: "Отзыв",
        btn_edit: "Изменить", btn_take: "Взять", btn_rate: "Оценить", btn_waste: "Списать",
        empty_fridge: "На полках пусто. Добавьте продукты!"
    },
    he: {
        dir: 'rtl',
        title: "❄️ מקרר חכם",
        how_to: "ℹ️ הדרכה",
        stats_title: "📊 סטטיסטיקה כללית",
        consumed: "✅ נצרך:",
        wasted: "🗑 נזרק:",
        lost: "💸 הפסד:",
        ai_title: "🤖 שף AI",
        ai_desc: "רעיונות למתכונים.",
        rescue: "🚨 להציל אוכל",
        all_food: "🥗 להכין מהכל",
        add_title: "➕ הוסף למדף",
        scan_btn: "📷 סרוק ברקוד",
        what_add: "מה מוסיפים?",
        cat_label: "קטגוריה",
        unit_label: "יחידה",
        count_label: "כמות",
        exp_label: "תוקף:",
        or: "או",
        adv_settings: "⚙️ הגדרות מתקדמות ▾",
        add_btn: "➕ הוסף למקרר",
        shelves_title: "🧊 תכולת המקרר",
        role_user: "🛡️ משתמש",
        role_admin: "🛠️ מנהל",
        role_guest: "👁️ אורח",

        cat_dairy: "🥛 חלב וביצים", cat_meat: "🥩 בשר ודגים", cat_veg: "🍎 ירקות ופירות",
        cat_prepared: "🍲 אוכל מוכן", cat_preserves: "🥫 שימורים", cat_alcohol: "🍷 משקאות", cat_other: "📦 אחר",

        unit_шт: "יח'", unit_кг: "ק״ג", unit_л: "ליטר",

        price_label: "מחיר", comp_label: "רכיבים", note_label: "הערה",
        perish_label: "⚠️ מתקלקל מהר", frozen_label: "❄️ למקפיא", cooked_label: "⭐ דורש דירוג",

        scan_title: "📷 סורק ברקוד",
        scan_wait: "הצב את הברקוד במרכז וודא שהמצלמה ממוקדת.",
        scan_code: "קוד", scan_search: "מחפש במסד הנתונים...",

        what_add_ph: "למשל חלב (או סרוק)", count_ph: "1", days_ph: "ימים (למשל 5)",
        price_ph: "מחיר", comp_ph: "רכיבים...", note_ph: "חנות / מקור",
        name_ph: "השם שלך",

        added: "נוסף", days_left: "ימים נותרו", frozen: "במקפיא",
        craft_badge: "מאכל ביתי", review_family: "ביקורת",
        btn_edit: "ערוך", btn_take: "קח", btn_rate: "דרג", btn_waste: "זרוק",
        empty_fridge: "המדפים ריקים. הוסף מוצרים!"
    },
    en: {
        dir: 'ltr',
        title: "❄️ Smart Fridge",
        how_to: "ℹ️ Guide",
        stats_title: "📊 Global Statistics",
        consumed: "✅ Consumed:",
        wasted: "🗑 Wasted:",
        lost: "💸 Lost:",
        ai_title: "🤖 AI Chef",
        ai_desc: "Recipe ideas from supplies.",
        rescue: "🚨 Rescue food",
        all_food: "🥗 Make from all",
        add_title: "➕ Add to shelf",
        scan_btn: "📷 Scan Barcode",
        what_add: "What to add?",
        cat_label: "Category",
        unit_label: "Unit",
        count_label: "Count",
        exp_label: "Expiration:",
        or: "OR",
        adv_settings: "⚙️ Advanced Settings ▾",
        add_btn: "➕ Add to Fridge",
        shelves_title: "🧊 Fridge Contents",
        role_user: "🛡️ User",
        role_admin: "🛠️ Admin",
        role_guest: "👁️ Guest",

        cat_dairy: "🥛 Dairy", cat_meat: "🥩 Meat", cat_veg: "🍎 Veg/Fruits",
        cat_prepared: "🍲 Prepared", cat_preserves: "🥫 Preserves", cat_alcohol: "🍷 Alcohol", cat_other: "📦 Other",

        unit_шт: "pcs", unit_кг: "kg", unit_л: "L",

        price_label: "Price", comp_label: "Ingredients", note_label: "Note",
        perish_label: "⚠️ Perishable", frozen_label: "❄️ To Freezer", cooked_label: "⭐ Needs Rating",

        scan_title: "📷 Barcode Scanner",
        scan_wait: "Place barcode in center. Ensure it's in focus.",
        scan_code: "Code", scan_search: "Searching...",

        what_add_ph: "e.g. Milk (or scan)", count_ph: "1", days_ph: "Days (e.g. 5)",
        price_ph: "Price", comp_ph: "Ingredients...", note_ph: "Store / Note",
        name_ph: "Your name",

        added: "Added", days_left: "Days left", frozen: "Frozen",
        craft_badge: "Home Meal", review_family: "Review",
        btn_edit: "Edit", btn_take: "Take", btn_rate: "Rate", btn_waste: "Waste",
        empty_fridge: "Shelves are empty!"
    }
};

export function t(key) {
    const lang = window.appLang || 'ru';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        return TRANSLATIONS[lang][key];
    }
    return key; // Fallback
}