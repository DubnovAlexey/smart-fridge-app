// ==============================================================================
// ФАЙЛ: js/utils/translations.js
// НАЗНАЧЕНИЕ: Словарь для мультиязычности (i18n)
// ==============================================================================

export const TRANSLATIONS = {
    ru: {
        dir: 'ltr', title: "❄️ Умный холодильник", how_to: "ℹ️ Как пользоваться",
        stats_title: "📊 Общая статистика", consumed: "✅ Съедено:", wasted: "🗑 Списано:", lost: "💸 Потери:",
        ai_title: "🤖 AI-Шеф", ai_desc: "Идеи рецептов из запасов.", rescue: "🚨 Спасти", all_food: "🥗 Из всего",
        add_title: "➕ Добавить на полку", scan_btn: "📷 Скан штрих-кода",
        what_add: "Что добавляем?", cat_label: "Категория", unit_label: "Ед.", count_label: "Кол-во", exp_label: "Срок:", or: "ИЛИ",
        adv_settings: "⚙️ Расширенные настройки ▾", add_btn: "➕ В холодильник", shelves_title: "🧊 Полки",
        role_user: "🛡️ Юзер", role_admin: "🛠️ Админ", role_guest: "👁️ Гость", role_child: "🧒 Ребенок",
        admin_panel_title: "🛠️ Системные настройки", api_key_label: "API-ключ Gemini",
        rights_title: "⚙️ Права", guest_rights: "👤 Права Гостей", child_rights: "🧒 Права Детей", allow_take: "Разрешить брать", allow_waste: "Разрешить списывать",
        cat_dairy: "🥛 Молочка", cat_meat: "🥩 Мясо", cat_veg: "🍎 Овощи/Фрукты", cat_prepared: "🍲 Готовая еда", cat_preserves: "🥫 Заготовки", cat_alcohol: "🍷 Напитки", cat_other: "📦 Прочее",

        unit_шт: "шт", unit_кг: "кг", unit_гр: "гр", unit_л: "л", unit_мл: "мл", unit_упак: "упак", unit_порц: "порц",

        price_label: "Цена", comp_label: "Состав", note_label: "Заметка", perish_label: "⚠️ Скоропорт", frozen_label: "❄️ Морозилка", cooked_label: "⭐ Оценить",
        scan_title: "📷 Скан", scan_wait: "Ищем штрих-код...", scan_code: "Код", scan_search: "Ищем...", scan_not_found: "Не найдено",
        what_add_ph: "Напр. Кефир", count_ph: "1", days_ph: "Дней", price_ph: "Цена", comp_ph: "Ингредиенты...", note_ph: "Заметка", name_ph: "Имя",
        added: "Добавл.", days_left: "Осталось", frozen: "Морозилка", craft_badge: "Блюдо", review_family: "Отзыв",
        btn_edit: "Изменить", btn_take: "Взять", btn_rate: "Оценить", btn_waste: "Списать", empty_fridge: "Пусто!",
        preview_title: "📦 Продукт", preview_fake_warn: "⚠️ Базы могут ошибаться.", preview_ai_loading: "🤖 ИИ думает...",
        btn_preview_add: "✅ В холодильник", btn_preview_cart: "📝 В список покупок", btn_preview_next: "🔄 Следующий", btn_preview_fake: "❌ Подделка", fake_alert: "Жалоба!",
        cart_title: "🛒 Список покупок", empty_cart: "Корзина пуста", btn_cart_buy: "✅ Куплено", btn_cart_del: "❌ Убрать",
        ai_recipe_ph: "Напр. Борщ", btn_ai_supplier: "🪄 Что докупить?",

        auth_title: "Вход в систему", auth_email: "Email", auth_pass: "Пароль", auth_login: "Войти / Регистрация", auth_guest: "Войти локально",

        // НОВОЕ: Перевод кнопок базы данных
        btn_export: "📥 Экспорт", btn_import: "📤 Импорт"
    },
    he: {
        dir: 'rtl', title: "❄️ מקרר חכם", how_to: "ℹ️ הדרכה",
        stats_title: "📊 סטטיסטיקה", consumed: "✅ נצרך:", wasted: "🗑 נזרק:", lost: "💸 הפסד:",
        ai_title: "🤖 שף AI", ai_desc: "רעיונות למתכונים.", rescue: "🚨 להציל", all_food: "🥗 מהכל",
        add_title: "➕ הוסף", scan_btn: "📷 סרוק",
        what_add: "מה להוסיף?", cat_label: "קטגוריה", unit_label: "יח'", count_label: "כמות", exp_label: "תוקף:", or: "או",
        adv_settings: "⚙️ מתקדם ▾", add_btn: "➕ למקרר", shelves_title: "🧊 מדפים",
        role_user: "🛡️ משתמש", role_admin: "🛠️ מנהל", role_guest: "👁️ אורח", role_child: "🧒 ילד",
        admin_panel_title: "🛠️ הגדרות", api_key_label: "מפתח API",
        rights_title: "⚙️ הרשאות", guest_rights: "👤 אורחים", child_rights: "🧒 ילדים", allow_take: "לקחת", allow_waste: "לזרוק",
        cat_dairy: "🥛 חלב", cat_meat: "🥩 בשר", cat_veg: "🍎 ירקות", cat_prepared: "🍲 מוכן", cat_preserves: "🥫 שימורים", cat_alcohol: "🍷 אלכוהול", cat_other: "📦 אחר",
        unit_шт: "יח'", unit_кг: "ק״ג", unit_гр: "גרם", unit_л: "ליטר", unit_мл: "מ״ל", unit_упак: "אריזה", unit_порц: "מנה",
        price_label: "מחיר", comp_label: "רכיבים", note_label: "הערה", perish_label: "⚠️ מתקלקל", frozen_label: "❄️ מקפיא", cooked_label: "⭐ דירוג",
        scan_title: "📷 סורק", scan_wait: "סורק...", scan_code: "קוד", scan_search: "מחפש...", scan_not_found: "לא נמצא",
        what_add_ph: "חלב...", count_ph: "1", days_ph: "ימים", price_ph: "מחיר", comp_ph: "רכיבים...", note_ph: "חנות", name_ph: "שם",
        added: "נוסף", days_left: "נותרו", frozen: "במקפיא", craft_badge: "ביתי", review_family: "ביקורת",
        btn_edit: "ערוך", btn_take: "קח", btn_rate: "דרג", btn_waste: "זרוק", empty_fridge: "ריק!",
        preview_title: "📦 מוצר", preview_fake_warn: "⚠️ מסדים יכולים לטעות.", preview_ai_loading: "🤖 מנתח...",
        btn_preview_add: "✅ למקרר", btn_preview_cart: "📝 לרשימה", btn_preview_next: "🔄 הבא", btn_preview_fake: "❌ זיוף", fake_alert: "נשלח!",
        cart_title: "🛒 רשימת קניות", empty_cart: "הרשימה ריקה", btn_cart_buy: "✅ נקנה", btn_cart_del: "❌ מחק",
        ai_recipe_ph: "למשל לזניה", btn_ai_supplier: "🪄 מה חסר?",
        auth_title: "התחברות", auth_email: "אימייל", auth_pass: "סיסמה", auth_login: "כניסה / הרשמה", auth_guest: "כניסה מקומית",
        btn_export: "📥 יצוא", btn_import: "📤 יבוא"
    },
    en: {
        dir: 'ltr', title: "❄️ Smart Fridge", how_to: "ℹ️ Guide",
        stats_title: "📊 Stats", consumed: "✅ Consumed:", wasted: "🗑 Wasted:", lost: "💸 Lost:",
        ai_title: "🤖 AI Chef", ai_desc: "Recipes.", rescue: "🚨 Rescue", all_food: "🥗 All food",
        add_title: "➕ Add", scan_btn: "📷 Scan",
        what_add: "What?", cat_label: "Category", unit_label: "Unit", count_label: "Qty", exp_label: "Exp:", or: "OR",
        adv_settings: "⚙️ Advanced ▾", add_btn: "➕ To Fridge", shelves_title: "🧊 Shelves",
        role_user: "🛡️ User", role_admin: "🛠️ Admin", role_guest: "👁️ Guest", role_child: "🧒 Child",
        admin_panel_title: "🛠️ Settings", api_key_label: "API Key",
        rights_title: "⚙️ Rights", guest_rights: "👤 Guests", child_rights: "🧒 Children", allow_take: "Take", allow_waste: "Waste",
        cat_dairy: "🥛 Dairy", cat_meat: "🥩 Meat", cat_veg: "🍎 Veg", cat_prepared: "🍲 Prepared", cat_preserves: "🥫 Canned", cat_alcohol: "🍷 Alcohol", cat_other: "📦 Other",
        unit_шт: "pcs", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "pack", unit_порц: "portion",
        price_label: "Price", comp_label: "Ingredients", note_label: "Note", perish_label: "⚠️ Perish", frozen_label: "❄️ Frozen", cooked_label: "⭐ Rate",
        scan_title: "📷 Scanner", scan_wait: "Scanning...", scan_code: "Code", scan_search: "Searching...", scan_not_found: "Not found",
        what_add_ph: "Milk...", count_ph: "1", days_ph: "Days", price_ph: "Price", comp_ph: "Ingredients...", note_ph: "Note", name_ph: "Name",
        added: "Added", days_left: "Left", frozen: "Frozen", craft_badge: "Meal", review_family: "Review",
        btn_edit: "Edit", btn_take: "Take", btn_rate: "Rate", btn_waste: "Waste", empty_fridge: "Empty!",
        preview_title: "📦 Product", preview_fake_warn: "⚠️ DB may be wrong.", preview_ai_loading: "🤖 AI thinking...",
        btn_preview_add: "✅ To Fridge", btn_preview_cart: "📝 To List", btn_preview_next: "🔄 Next", btn_preview_fake: "❌ Fake", fake_alert: "Reported!",
        cart_title: "🛒 Shopping List", empty_cart: "Cart empty", btn_cart_buy: "✅ Bought", btn_cart_del: "❌ Remove",
        ai_recipe_ph: "e.g. Soup", btn_ai_supplier: "🪄 What to buy?",
        auth_title: "Login", auth_email: "Email", auth_pass: "Password", auth_login: "Login / Register", auth_guest: "Guest Mode (Local)",
        btn_export: "📥 Export", btn_import: "📤 Import"
    },
    de: { dir: 'ltr', title: "❄️ Kühlschrank", stats_title: "📊 Statistiken", consumed: "✅ Verbr.:", wasted: "🗑 Müll:", lost: "💸 Verl.:", unit_шт: "Stk", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "Pckg", unit_порц: "Port.", btn_export: "📥 Export", btn_import: "📤 Import" },
    es: { dir: 'ltr', title: "❄️ Nevera", stats_title: "📊 Estadísticas", consumed: "✅ Cons.:", wasted: "🗑 Basura:", lost: "💸 Perd.:", unit_шт: "ud", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "paq", unit_порц: "porc", btn_export: "📥 Exportar", btn_import: "📤 Importar" }
};

export function t(key) {
    const lang = window.appLang || 'ru';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
    return key;
}