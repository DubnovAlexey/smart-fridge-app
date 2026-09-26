// ==============================================================================
// ФАЙЛ: js/utils/translations.js
// НАЗНАЧЕНИЕ: Глобальный словарь для мультиязычности (i18n).
//
// ЧТО ДЕЛАЕТ ЭТОТ ФАЙЛ:
// 1. Хранит переводы всех текстовых элементов интерфейса на 5 языках.
// 2. Управляет направлением текста (LTR для русского/английского, RTL для иврита).
// 3. Экспортирует функцию t(), которая безопасно достает нужный перевод,
//    предотвращая появление ошибки "undefined" (если перевода нет - отдает оригинал).
// ==============================================================================

export const TRANSLATIONS = {
    // --------------------------------------------------------------------------
    // 1. РУССКИЙ ЯЗЫК (Базовый)
    // --------------------------------------------------------------------------
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
        step_1: "<div class='mb-3'><b class='text-indigo-600 text-base'>1️⃣ Кто вы? (Роли)</b><br>В самом верху выберите свое имя. Так приложение поймет, кто добавил еду и кто оставил отзыв. Если вы 'Админ', вы можете давать и забирать права у других.</div>",
        step_2: "<div class='mb-3'><b class='text-indigo-600 text-base'>2️⃣ Как добавить продукт?</b><br>Нажмите «Скан штрих-кода» и наведите камеру на товар. Умная база сама найдет название. Вам останется лишь ввести количество и нажать зеленую кнопку «➕ В холодильник». Срок годности поставится сам!</div>",
        step_3: "<div class='mb-3'><b class='text-indigo-600 text-base'>3️⃣ ИИ-Шеф (Рецепты)</b><br>Нажмите «🔑 AI-Ключ» в шапке и вставьте свой ключ. Теперь нажмите «🥗 Из всего», и нейросеть сама придумает блюдо из того, что прямо сейчас лежит на ваших полках!</div>",
        step_4: "<div class='mb-3'><b class='text-indigo-600 text-base'>4️⃣ Умный список покупок</b><br>Захотели борщ? Напишите слово «Борщ» и нажмите «🛒 Что докупить?». Нейросеть проверит ваш холодильник и сама добавит недостающие продукты в корзину.</div>",
        step_5: "<div class='mb-3'><b class='text-indigo-600 text-base'>5️⃣ Как взять или выбросить?</b><br>На карточке продукта нажмите кнопку с минусом (Взять), чтобы указать, сколько вы съели. Для списания испорченной еды в мусор есть кнопка 🗑️.</div>",
        step_6: "<div class='mb-3'><b class='text-indigo-600 text-base'>6️⃣ Рейтинг блюд</b><br>Отмечайте приготовленную домашнюю еду галочкой «⭐ Требует оценки» при добавлении. Когда вы ее съедите, программа попросит поставить от 1 до 5 звезд.</div>",
        step_7: "<div class='mb-3'><b class='text-indigo-600 text-base'>7️⃣ Финансы и Статистика</b><br>Приложение считает, на какую сумму испортились продукты (ваши Потери). Старайтесь, чтобы эта цифра всегда была равна нулю!</div>",
        btn_understand: "Мне всё понятно!",

        pwa_banner_text: "Скачайте приложение на телефон для быстрого доступа!",
        pwa_install_btn: "📲 Установить",

        // ОБНОВЛЕНО: Двойная инструкция для iPhone
        ios_install_guide: "🍎 <b>Установка на iPhone:</b><br>• <b>В Safari:</b> Поделиться (кнопка внизу экрана) ➔ «На экран Домой».<br>• <b>В Chrome:</b> Поделиться (вверху справа) ➔ «Показать больше» (⬇️) ➔ «На экран Домой» (➕)."
    },
    // --------------------------------------------------------------------------
    // 2. ИВРИТ (RTL)
    // --------------------------------------------------------------------------
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
        step_1: "<div class='mb-3'><b class='text-indigo-600 text-base'>1️⃣ משפחה:</b> בחר את שמך למעלה כדי שהמערכת תדע מי ביצע פעולות.</div>",
        step_2: "<div class='mb-3'><b class='text-indigo-600 text-base'>2️⃣ הוספת מוצר:</b> השתמש בסורק הברקודים כדי להוסיף מוצרים בקלות.</div>",
        step_3: "<div class='mb-3'><b class='text-indigo-600 text-base'>3️⃣ שף AI:</b> הוסף מפתח API ובקש מתכונים ממה שיש במקרר.</div>",
        step_4: "<div class='mb-3'><b class='text-indigo-600 text-base'>4️⃣ רשימת קניות חכמה:</b> כתוב מה תרצה לאכול וה-AI יוסיף את החסר לעגלה.</div>",
        step_5: "<div class='mb-3'><b class='text-indigo-600 text-base'>5️⃣ לקחת או לזרוק:</b> לחץ על המינוס כדי לקחת, או על הפח כדי לזרוק מוצר.</div>",
        step_6: "<div class='mb-3'><b class='text-indigo-600 text-base'>6️⃣ דירוגים:</b> דרג ארוחות שאכלת מ-1 עד 5 כוכבים.</div>",
        step_7: "<div class='mb-3'><b class='text-indigo-600 text-base'>7️⃣ סטטיסטיקה:</b> עקוב אחר הפסדים כספיים של אוכל שנזרק.</div>",
        btn_understand: "הבנתי!",
        pwa_banner_text: "התקן את האפליקציה בטלפון שלך!",
        pwa_install_btn: "📲 התקן",
        // ОБНОВЛЕНО: Двойная инструкция
        ios_install_guide: "🍎 <b>התקנה באייפון:</b><br>• <b>ב-Safari:</b> שתף (למטה) ➔ 'למסך הבית'.<br>• <b>ב-Chrome:</b> שתף (למעלה) ➔ 'הצג עוד' (⬇️) ➔ 'למסך הבית' (➕)."
    },
    // --------------------------------------------------------------------------
    // 3. АНГЛИЙСКИЙ
    // --------------------------------------------------------------------------
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
        step_1: "<div class='mb-3'><b class='text-indigo-600 text-base'>1️⃣ Who are you?</b><br>Select your name at the top to track actions and reviews.</div>",
        step_2: "<div class='mb-3'><b class='text-indigo-600 text-base'>2️⃣ Adding Food</b><br>Use the Barcode Scanner to quickly add items and auto-fill details.</div>",
        step_3: "<div class='mb-3'><b class='text-indigo-600 text-base'>3️⃣ AI Chef</b><br>Add your API Key and ask the AI for recipes based on what you have.</div>",
        step_4: "<div class='mb-3'><b class='text-indigo-600 text-base'>4️⃣ Smart Cart</b><br>Type a dish name, and AI will add the missing ingredients to your cart.</div>",
        step_5: "<div class='mb-3'><b class='text-indigo-600 text-base'>5️⃣ Take or Waste</b><br>Click minus to consume an item, or the trash bin to waste it.</div>",
        step_6: "<div class='mb-3'><b class='text-indigo-600 text-base'>6️⃣ Ratings</b><br>Rate homemade meals from 1 to 5 stars after eating.</div>",
        step_7: "<div class='mb-3'><b class='text-indigo-600 text-base'>7️⃣ Stats</b><br>Track your wasted food value and try to keep it at zero!</div>",
        btn_understand: "Got it!",
        pwa_banner_text: "Install the app for quick access!",
        pwa_install_btn: "📲 Install",
        // ОБНОВЛЕНО: Двойная инструкция
        ios_install_guide: "🍎 <b>iPhone Install:</b><br>• <b>Safari:</b> Share (bottom) ➔ 'Add to Home Screen'.<br>• <b>Chrome:</b> Share (top right) ➔ 'Show more' (⬇️) ➔ 'Add to Home Screen' (➕)."
    },
    // --------------------------------------------------------------------------
    // 4. НЕМЕЦКИЙ
    // --------------------------------------------------------------------------
    de: {
        dir: 'ltr', title: "❄️ Kühlschrank", how_to: "ℹ️ Guide",
        stats_title: "📊 Statistiken", consumed: "✅ Verbr.:", wasted: "🗑 Müll:", lost: "💸 Verl.:", unit_шт: "Stk", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "Pckg", unit_порц: "Port.", btn_export: "📥 Export", btn_import: "📤 Import", btn_preview_add: "✅ Zum Formular", loading_ai: "KI DENKT...", btn_api_settings: "🔑 KI", api_modal_title: "KI-Einstellungen", api_modal_desc: "Gemini API-Schlüssel eingeben.", api_modal_btn: "Speichern", api_saved: "Gespeichert!", welcome_title: "👋 Willkommen!",
        step_1: "<div class='mb-3'><b class='text-indigo-600 text-base'>1️⃣ Familie:</b> Name eingeben.</div>",
        step_2: "<div class='mb-3'><b class='text-indigo-600 text-base'>2️⃣ Scanner:</b> Barcode scannen.</div>",
        step_3: "<div class='mb-3'><b class='text-indigo-600 text-base'>3️⃣ KI-Koch:</b> KI-Rezepte testen.</div>",
        step_4: "<div class='mb-3'><b class='text-indigo-600 text-base'>4️⃣ Einkaufsliste:</b> KI fügt hinzu.</div>",
        step_5: "<div class='mb-3'><b class='text-indigo-600 text-base'>5️⃣ Verwaltung:</b> Rechte verwalten.</div>",
        step_6: "<div class='mb-3'><b class='text-indigo-600 text-base'>6️⃣ Bewertung:</b> Mahlzeiten bewerten.</div>",
        step_7: "<div class='mb-3'><b class='text-indigo-600 text-base'>7️⃣ Statistiken:</b> Finanzen prüfen.</div>",
        btn_understand: "Verstanden!", pwa_banner_text: "App installieren!", pwa_install_btn: "📲 Installieren",
        ios_install_guide: "🍎 <b>iPhone Installation:</b><br>• <b>Safari:</b> Teilen (unten) ➔ 'Zum Home-Bildschirm'.<br>• <b>Chrome:</b> Teilen (oben rechts) ➔ 'Mehr anzeigen' ➔ 'Zum Home-Bildschirm'."
    },
    // --------------------------------------------------------------------------
    // 5. ИСПАНСКИЙ
    // --------------------------------------------------------------------------
    es: {
        dir: 'ltr', title: "❄️ Nevera", how_to: "ℹ️ Guía",
        stats_title: "📊 Estadísticas", consumed: "✅ Cons.:", wasted: "🗑 Basura:", lost: "💸 Perd.:", unit_шт: "ud", unit_кг: "kg", unit_гр: "g", unit_л: "L", unit_мл: "ml", unit_упак: "paq", unit_порц: "porc", btn_export: "📥 Exportar", btn_import: "📤 Importar", btn_preview_add: "✅ Al formulario", loading_ai: "LA IA PIENSA...", btn_api_settings: "🔑 IA", api_modal_title: "Ajustes IA", api_modal_desc: "Clave API Gemini.", api_modal_btn: "Guardar", api_saved: "Guardado", welcome_title: "👋 ¡Bienvenido!",
        step_1: "<div class='mb-3'><b class='text-indigo-600 text-base'>1️⃣ Familia:</b> Ingresa nombre.</div>",
        step_2: "<div class='mb-3'><b class='text-indigo-600 text-base'>2️⃣ Escáner:</b> Escanea código.</div>",
        step_3: "<div class='mb-3'><b class='text-indigo-600 text-base'>3️⃣ Chef IA:</b> Recetas IA.</div>",
        step_4: "<div class='mb-3'><b class='text-indigo-600 text-base'>4️⃣ Compras:</b> Lista IA.</div>",
        step_5: "<div class='mb-3'><b class='text-indigo-600 text-base'>5️⃣ Permisos:</b> Gestión.</div>",
        step_6: "<div class='mb-3'><b class='text-indigo-600 text-base'>6️⃣ Valoración:</b> Valorar comidas.</div>",
        step_7: "<div class='mb-3'><b class='text-indigo-600 text-base'>7️⃣ Estadísticas:</b> Ver pérdidas.</div>",
        btn_understand: "¡Entendido!", pwa_banner_text: "¡Instalar la app!", pwa_install_btn: "📲 Instalar",
        ios_install_guide: "🍎 <b>Instalación en iPhone:</b><br>• <b>Safari:</b> Compartir (abajo) ➔ 'Añadir a inicio'.<br>• <b>Chrome:</b> Compartir (arriba derecha) ➔ 'Mostrar más' ➔ 'Añadir a inicio'."
    }
};

// Функция безопасного извлечения перевода. Защита от undefined.
export function t(key, defaultText = '') {
    const lang = window.appLang || 'ru';
    // Если перевод существует в базе, возвращаем его
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
        return TRANSLATIONS[lang][key];
    }
    // Если перевода нет (ошибка в словаре), возвращаем дефолтный текст или сам ключ
    return defaultText || key;
}