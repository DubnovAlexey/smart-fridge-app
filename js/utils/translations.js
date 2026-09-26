// ==============================================================================
// ФАЙЛ: js/utils/translations.js
// НАЗНАЧЕНИЕ: Словарь для мультиязычности (i18n)
// ==============================================================================

export const TRANSLATIONS = {
    ru: {
        dir: 'ltr', title: "❄️ Умный холодильник", how_to: "ℹ️ Инструкция",
        stats_title: "📊 Общая статистика", consumed: "✅ Съедено:", wasted: "🗑 Списано:", lost: "💸 Потери:",
        ai_title: "🤖 AI-Шеф", ai_desc: "Идеи рецептов из запасов.", rescue: "🚨 Спасти", all_food: "🥗 Из всего",
        add_title: "➕ Добавить на полку", scan_btn: "📷 Скан штрих-кода",
        what_add: "Что добавляем?", cat_label: "Категория", unit_label: "Ед.", count_label: "Кол-во", exp_label: "Срок:", or: "ИЛИ",
        adv_settings: "⚙️ Расширенные настройки ▾", add_btn: "➕ В холодильник", shelves_title: "🧊 Полки",
        role_user: "🛡️ Юзер", role_admin: "🛠️ Админ", role_guest: "👁️ Гость", role_child: "🧒 Ребенок",
        rights_title: "⚙️ Права", guest_rights: "👤 Права Гостей", child_rights: "🧒 Права Детей", allow_take: "Разрешить брать", allow_waste: "Разрешить списывать",
        cat_dairy: "🥛 Молочка", cat_meat: "🥩 Мясо", cat_veg: "🍎 Овощи/Фрукты", cat_prepared: "🍲 Готовая еда", cat_preserves: "🥫 Заготовки", cat_alcohol: "🍷 Напитки", cat_other: "📦 Прочее",

        unit_шт: "шт", unit_кг: "кг", unit_гр: "гр", unit_л: "л", unit_мл: "мл", unit_упак: "упак", unit_порц: "порц",

        price_label: "Цена", comp_label: "Состав", note_label: "Заметка", perish_label: "⚠️ Скоропорт", frozen_label: "❄️ Морозилка", cooked_label: "⭐ Оценить",
        scan_title: "📷 Скан", scan_wait: "Ищем штрих-код...", scan_code: "Код", scan_search: "Ищем...", scan_not_found: "Не найдено",
        what_add_ph: "Напр. Кефир", count_ph: "1", days_ph: "Дней", price_ph: "Цена", comp_ph: "Ингредиенты...", note_ph: "Заметка", name_ph: "Имя",
        added: "Добавл.", days_left: "Осталось", frozen: "Морозилка", craft_badge: "Блюдо", review_family: "Отзыв",
        btn_edit: "Изменить", btn_take: "Взять", btn_rate: "Оценить", btn_waste: "Списать", empty_fridge: "Пусто!",
        preview_title: "📦 Продукт", preview_fake_warn: "⚠️ Базы могут ошибаться.", preview_ai_loading: "🤖 ИИ думает...",
        btn_preview_add: "✅ Перенести в форму", btn_preview_cart: "📝 В список покупок", btn_preview_next: "🔄 Следующий", btn_preview_fake: "❌ Подделка", fake_alert: "Жалоба!",
        cart_title: "🛒 Список покупок", empty_cart: "Корзина пуста", btn_cart_buy: "✅ Куплено", btn_cart_del: "❌ Убрать",
        specific_recipe_label: "Конкретное блюдо:", ai_recipe_ph: "Напр. Борщ", btn_ai_recipe: "📖 Дай рецепт", btn_ai_supplier: "🛒 Что докупить?",
        auth_title: "Вход в систему", auth_email: "Email", auth_pass: "Пароль", auth_login: "Войти / Регистрация", auth_guest: "Войти локально",
        btn_export: "📥 Экспорт", btn_import: "📤 Импорт", loading_ai: "ИИ ДУМАЕТ...",

        btn_api_settings: "🔑 AI-Ключ",
        api_modal_title: "🤖 Настройки ИИ",
        api_modal_desc: "Для работы нейросети введите ваш Gemini API ключ.",
        api_modal_btn: "💾 Сохранить",
        api_saved: "Ключ сохранен!",

        welcome_title: "👋 Добро пожаловать!",
        step_1: "🧑‍🍳 <b>Семья:</b> Выберите имя для подписи отзывов.",
        step_2: "📷 <b>Сканер:</b> Наведите на штрих-код продукта.",
        step_3: "🤖 <b>AI-Шеф:</b> Внесите API-ключ (🔑) и просите рецепты.",
        step_4: "🛒 <b>Снабженец:</b> ИИ сам найдет, что докупить.",
        step_5: "⭐ <b>Рейтинг:</b> Оценивайте домашнюю еду.",
        btn_understand: "Всё понятно!",

        ios_install: "📱 <b>Установите приложение:</b> нажмите ⎋ Поделиться, затем «На экран Домой»."
    },
    he: {
        dir: 'rtl', title: "❄️ מקרר חכם", how_to: "ℹ️ הדרכה",
        stats_title: "📊 סטטיסטיקה", consumed: "✅ נצרך:", wasted: "🗑 נזרק:", lost: "💸 הפסד:",
        ai_title: "🤖 שף AI", ai_desc: "רעיונות למתכונים.", rescue: "🚨 להציל", all_food: "🥗 מהכל",
        add_title: "➕ הוסף", scan_btn: "📷 סרוק",
        what_add: "מה להוסיף?", cat_label: "קטגוריה", unit_label: "יח'", count_label: "כמות", exp_label: "תוקף:", or: "או",
        adv_settings: "⚙️ מתקדם ▾", add_btn: "➕ למקרר", shelves_title: "🧊 מדפים",
        role_user: "🛡️ משתמש", role_admin: "🛠️ מנהל", role_guest: "👁️ אורח", role_child: "🧒 ילד",
        rights_title: "⚙️ הרשאות", guest_rights: "👤 אורחים", child_rights: "🧒 ילדים", allow_take: "לקחת", allow_waste: "לזרוק",
        cat_dairy: "🥛 חלב", cat_meat: "🥩 בשר", cat_veg: "🍎 ירקות", cat_prepared: "🍲 מוכן", cat_preserves: "🥫 שימורים", cat_alcohol: "🍷 אלכוהול", cat_other: "📦 אחר",
        unit_шт: "יח'", unit_кг: "ק״ג", unit_гр: "גרם", unit_л: "ליטר", unit_мл: "מ״ל", unit_упак: "אריזה", unit_порц: "מנה",
        price_label: "מחיר", comp_label: "רכיבים", note_label: "הערה", perish_label: "⚠️ מתקלקל", frozen_label: "❄️ מקפיא", cooked_label: "⭐ דירוג",
        scan_title: "📷 סורק", scan_wait: "סורק...", scan_code: "קוד", scan_search: "מחפש...", scan_not_found: "לא נמצא",
        what_add_ph: "חלב...", count_ph: "1", days_ph: "ימים", price_ph: "מחיר", comp_ph: "רכיבים...", note_ph: "חנות", name_ph: "שם",
        added: "נוסף", days_left: "נותרו", frozen: "במקפיא", craft_badge: "ביתי", review_family: "ביקורת",
        btn_edit: "ערוך", btn_take: "קח", btn_rate: "דרג", btn_waste: "זרוק", empty_fridge: "ריק!",
        preview_title: "📦 מוצר", preview_fake_warn: "⚠️ מסדים יכולים לטעות.", preview_ai_loading: "🤖 מנתח...",
        btn_preview_add: "✅ העבר לטופס", btn_preview_cart: "📝 לרשימה", btn_preview_next: "🔄 הבא", btn_preview_fake: "❌ זיוף", fake_alert: "נשלח!",
        cart_title: "🛒 רשימת קניות", empty_cart: "הרשימה ריקה", btn_cart_buy: "✅ נקנה", btn_cart_del: "❌ מחק",
        specific_recipe_label: "מנה ספציפית:", ai_recipe_ph: "למשל פלוב", btn_ai_recipe: "📖 תן מתכון", btn_ai_supplier: "🛒 מה לקנות?",
        auth_title: "התחברות", auth_email: "אימייל", auth_pass: "סיסמה", auth_login: "כניסה / הרשמה", auth_guest: "כניסה מקומית",
        btn_export: "📥 יצוא", btn_import: "📤 יבוא", loading_ai: "AI חושב...",

        btn_api_settings: "🔑 מפתח API",
        api_modal_title: "🤖 הגדרות AI", api_modal_desc: "הזן את מפתח ה-Gemini API שלך.", api_modal_btn: "💾 שמור", api_saved: "נשמר!",
        welcome_title: "👋 ברוכים הבאים!",
        step_1: "🧑‍🍳 <b>משפחה:</b> הזן את שמך.", step_2: "📷 <b>סורק:</b> סרוק ברקוד.", step_3: "🤖 <b>שף AI:</b> הזן מפתח (🔑) ובקש מתכון.", step_4: "🛒 <b>קניות:</b> ה-AI ימצא מה חסר.", step_5: "⭐ <b>דירוג:</b> דרג מאכלים.",
        btn_understand: "הבנתי!",
        ios_install: "📱 <b>התקן את האפליקציה:</b> לחץ על ⎋ שתף, ואז 'למסך הבית'."
    },
    en: {
        dir: 'ltr', title: "❄️ Smart Fridge", how_to: "ℹ️ Guide",
        stats_title: "📊 Stats", consumed: "✅ Consumed:", wasted: "🗑 Wasted:", lost: "💸 Lost:",
        ai_title: "🤖 AI Chef", ai_desc: "Recipes.", rescue: "🚨 Rescue", all_food: "🥗 All food",
        add_title: "➕ Add", scan_btn: "📷 Scan",
        what_add: "What?", cat_label: "Category", unit_label: "Unit", count_label: "Qty", exp_label: "Exp:", or: "OR",
        adv_settings: "⚙️ Advanced ▾", add_btn: "➕ To Fridge", shelves_title: "🧊 Shelves",
        role_user: "🛡️ User", role_admin: "🛠️ Admin", role_guest: "👁️ Guest", role_child: "🧒 Child",
        rights_title: "⚙️ Rights", guest_rights: "👤 Guests", child_rights: "🧒 Children", allow_take: "Take", allow_waste: "Waste",
        cat_dairy: "🥛 Dairy", cat_meat: "🥩 Meat", cat_veg: "🍎 Veg", cat_prepared: "🍲 Prepared", cat_preserves: "🥫 Canned", cat_alcohol: "🍷 Alcohol", cat_other: "📦 Other",
        unit_шт: "pcs", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "pack", unit_порц: "portion",
        price_label: "Price", comp_label: "Ingredients", note_label: "Note", perish_label: "⚠️ Perish", frozen_label: "❄️ Frozen", cooked_label: "⭐ Rate",
        scan_title: "📷 Scanner", scan_wait: "Scanning...", scan_code: "Code", scan_search: "Searching...", scan_not_found: "Not found",
        what_add_ph: "Milk...", count_ph: "1", days_ph: "Days", price_ph: "Price", comp_ph: "Ingredients...", note_ph: "Note", name_ph: "Name",
        added: "Added", days_left: "Left", frozen: "Frozen", craft_badge: "Meal", review_family: "Review",
        btn_edit: "Edit", btn_take: "Take", btn_rate: "Rate", btn_waste: "Waste", empty_fridge: "Empty!",
        preview_title: "📦 Product", preview_fake_warn: "⚠️ DB may be wrong.", preview_ai_loading: "🤖 AI thinking...",
        btn_preview_add: "✅ To Form", btn_preview_cart: "📝 To List", btn_preview_next: "🔄 Next", btn_preview_fake: "❌ Fake", fake_alert: "Reported!",
        cart_title: "🛒 Shopping List", empty_cart: "Cart empty", btn_cart_buy: "✅ Bought", btn_cart_del: "❌ Remove",
        specific_recipe_label: "Specific dish:", ai_recipe_ph: "e.g. Soup", btn_ai_recipe: "📖 Give Recipe", btn_ai_supplier: "🛒 What to buy?",
        auth_title: "Login", auth_email: "Email", auth_pass: "Password", auth_login: "Login / Register", auth_guest: "Guest Mode (Local)",
        btn_export: "📥 Export", btn_import: "📤 Import", loading_ai: "AI IS THINKING...",

        btn_api_settings: "🔑 AI Key",
        api_modal_title: "🤖 AI Settings", api_modal_desc: "Enter your Gemini API key.", api_modal_btn: "💾 Save", api_saved: "Key saved!",
        welcome_title: "👋 Welcome!",
        step_1: "🧑‍🍳 <b>Family:</b> Enter your name.", step_2: "📷 <b>Scanner:</b> Scan a barcode.", step_3: "🤖 <b>AI Chef:</b> Add API key (🔑) and get recipes.", step_4: "🛒 <b>Cart:</b> AI finds what to buy.", step_5: "⭐ <b>Rating:</b> Rate meals.",
        btn_understand: "Got it!",
        ios_install: "📱 <b>Install App:</b> Tap ⎋ Share, then 'Add to Home Screen'."
    },
    de: { dir: 'ltr', title: "❄️ Kühlschrank", stats_title: "📊 Statistiken", consumed: "✅ Verbr.:", wasted: "🗑 Müll:", lost: "💸 Verl.:", unit_шт: "Stk", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "Pckg", unit_порц: "Port.", btn_export: "📥 Export", btn_import: "📤 Import", btn_preview_add: "✅ Zum Formular", loading_ai: "KI DENKT...", btn_api_settings: "🔑 KI", api_modal_title: "KI-Einstellungen", api_modal_desc: "Gemini API-Schlüssel eingeben.", api_modal_btn: "Speichern", api_saved: "Gespeichert!", welcome_title: "👋 Willkommen!", step_1: "Name eingeben.", step_2: "Barcode scannen.", step_3: "KI-Rezepte testen.", step_4: "Einkaufsliste.", step_5: "Mahlzeiten bewerten.", btn_understand: "Verstanden!", ios_install: "📱 Teilen ⎋ -> 'Zum Home-Bildschirm'." },
    es: { dir: 'ltr', title: "❄️ Nevera", stats_title: "📊 Estadísticas", consumed: "✅ Cons.:", wasted: "🗑 Basura:", lost: "💸 Perd.:", unit_шт: "ud", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "paq", unit_порц: "porc", btn_export: "📥 Exportar", btn_import: "📤 Importar", btn_preview_add: "✅ Al formulario", loading_ai: "LA IA PIENSA...", btn_api_settings: "🔑 IA", api_modal_title: "Ajustes IA", api_modal_desc: "Clave API Gemini.", api_modal_btn: "Guardar", api_saved: "Guardado", welcome_title: "👋 ¡Bienvenido!", step_1: "Ingresa nombre.", step_2: "Escanea código.", step_3: "Recetas IA.", step_4: "Lista de compras.", step_5: "Valora comidas.", btn_understand: "¡Entendido!", ios_install: "📱 Compartir ⎋ -> 'Añadir a inicio'." }
};

export function t(key) {
    const lang = window.appLang || 'ru';
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];
    return key;
}