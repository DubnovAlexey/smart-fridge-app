<!--suppress MarkdownUnresolvedFileReference -->

# ❄️ Умный холодильник 2.0 (Smart Fridge)

[Русский](#russian) · [English](#english) · [עברית](#hebrew) · [Español](#spanish) · [Français](#french)

<a name="russian"></a>

## Русский

**Умный холодильник** — веб-прототип учёта домашних продуктов: сроки хранения, остатки, корзина покупок и аналитика. Сканирование штрих-кодов и генерация рецептов — дополнительные сетевые возможности.

Презентационный прототип с локальным деморежимом, интеграцией Firebase и мультиязычным интерфейсом. Локальные данные изолированы от облака; серверные права доступа требуют отдельной настройки Firebase Rules.

---

### Короткий сценарий просмотра

Выберите **«Войти локально»**, добавьте продукт, измените остаток и отправьте нужную покупку в корзину. Перезагрузите страницу и попробуйте экспорт CSV. Этот сценарий не требует Firebase-входа или ключа Gemini и не изменяет облачные данные.

### 🚀 Основной функционал

* **Турбо-сканер штрих-кодов:** Автоматическое распознавание продуктов через камеру телефона с подтягиванием состава и идей для блюд из мировой базы OpenFoodFacts.
* **ИИ-Шеф-повар (Gemini AI):** Нейросеть генерирует рецепты на основе текущих остатков еды в холодильнике (функции "Из всего" и "Спасти продукты").
* **ИИ-Снабженец:** Анализирует рецепт желаемого блюда, сверяет его с вашим холодильником и автоматически добавляет недостающие ингредиенты в Корзину.
* **Умные сроки годности:** Приложение предлагает срок из локального справочника по названию и категории; дату можно скорректировать вручную.
* **Демонстрация ролей:** Ролевая система интерфейса (Админ, Юзер, Гость, Ребенок). Изменение клиентской роли не предоставляет серверных прав. Администратор доступен в локальном демо.
* **Система рейтинга блюд:** После того как продукт съеден, семья может оценить качество блюда по 5-звездочной шкале и оставить отзыв.
* **Мультиязычность и Мультивалютность:** Полный перевод интерфейса на лету (Русский, Иврит, Английский, Немецкий, Испанский) с поддержкой RTL (чтения справа налево) и выбора валюты (₽, ₪, $, €).
* **Аналитика и Экспорт:** Подсчет финансовых потерь от выброшенной еды и возможность выгрузки/загрузки базы данных в формате CSV, который можно открыть в табличном редакторе.
* **Установка на телефон (PWA):** Манифест позволяет добавить ярлык приложения на рабочий стол поддерживаемого браузера. Полноценный запуск без сети пока не реализован.

---

### 🧠 Техническая архитектура (Под капотом)

Проект построен на принципах Vanilla JavaScript (без использования тяжеловесных фреймворков), но с применением современных паттернов проектирования.

#### 1. Паттерн MVC (Model-View-Controller)
Логика строго разделена на независимые слои, что предотвращает превращение кода в «спагетти»:
* **Модель (`js/models/Fridge.js`):** "Мозг" приложения. Хранит массивы данных, сортирует их и общается с сервером. Ничего не знает про интерфейс.
* **Представление (`js/ui/render.js`):** "Лицо". Только рисует HTML-карточки на основе полученных данных.
* **Контроллер (`js/app.js`):** "Дирижер". Слушает клики пользователя, передает команды Модели и просит Представление обновить экран.

#### 2. Асинхронность и работа с сетью (Promises, async/await)
Для предотвращения "зависания" интерфейса при долгих вычислениях, все сетевые запросы выполняются в фоне. Приложение не блокируется, пока ждет ответ от базы данных или нейросети.

#### 3. Интеграция сторонних API
* **Google Gemini AI:** Связь с нейросетью через REST API. Реализован сложный промптинг, заставляющий ИИ возвращать не просто текст, а строго структурированный формат `JSON` для автоматического парсинга списка покупок. ИИ настроен на генерацию ответов на выбранном языке интерфейса.
* **Firebase Firestore:** Облачная NoSQL база данных. В облачном режиме используются существующие коллекции; ограничения доступа и изоляцию пользователей необходимо подтвердить правилами Firestore перед публичным многопользовательским использованием.
* **Firebase Auth:** Модуль входа и управления пользовательскими сессиями через Firebase Auth.

#### 4. Событийно-ориентированная архитектура (Event Delegation)
Вместо того чтобы вешать обработчики кликов (`addEventListener`) на каждую из сотен кнопок "Взять" или "Списать", используется паттерн **Делегирования**. На весь холодильник вешается всего один слушатель, который через `event.target` и `dataset.id` определяет, какая именно кнопка была нажата. Это радикально экономит оперативную память браузера (Performance Optimization).

#### 5. Принцип единого источника истины (Single Source of Truth)
Интерфейс (HTML) никогда не хранит состояние приложения. При любом действии (например, съели 2 яйца из 10), программа сначала обновляет данные в объекте Модели (`batches`), а затем полностью перерисовывает полку. Так экран строится из модели после каждого завершённого изменения.

#### 6. PWA (Progressive Web App) и Service Workers
Написан файл `manifest.json` для установки и отдельного окна приложения. Текущий `Service Worker` не кэширует приложение: полноценный запуск без сети пока не реализован. Добавлен скрипт обнаружения iOS-устройств (iPhone) для вывода пользовательских подсказок по установке, а также кнопка-инструкция для ручной настройки.

### Запуск и режимы данных

Откройте проект через локальный HTTP-сервер и выберите «Войти локально». Продукты, корзина и аналитика сохраняются только в `localStorage` с префиксом `smart-fridge-app:demo:`. Этот режим не читает и не изменяет Firestore. Если браузер запрещает хранилище, приложение продолжает работать в памяти текущей вкладки; после её закрытия изменения не сохранятся. Переход между режимами инвалидирует ответы прежней сессии, чтобы они не попали в текущие данные. Для первоначальной загрузки интерфейса требуются внешние CDN-зависимости; локальные данные не означают полностью автономную установку.

Вход по Email подключает существующий Firebase-проект. Роли интерфейса не заменяют Firebase Security Rules. Функции Gemini требуют собственного ключа и сети; локальный учёт продуктов работает без вызовов ИИ.

CSV сохраняет многострочные заметки, кавычки, запятые, цену, валюту, состав и признак готового блюда. Формат старых CSV с 11 колонками поддерживается.

### Проверки

`npm test` запускает Node.js-регрессии локального CRUD, аналитики, CSV, полной инициализации гостевого контроллера при запрете storage и поздних ответов после смены режима. Тесты не обращаются к Firebase или Gemini и не изменяют облачные данные.

### Планы развития

Это предложения следующего этапа, а не уже реализованные возможности.

- **Визуал:** дать компактное представление запасов по категориям, явный статус сохранения и более заметный вход в локальное демо; проверить поля и RTL на узких экранах.
- **Инженерия:** сначала подтвердить Firebase Rules и UID-изоляцию, вынести ИИ-запросы на контролируемый сервер, затем проверить обновление и кэширование Service Worker.
- **Функции:** добавить предварительный просмотр импорта с исправлением ошибок строк, фильтр продуктов с близким сроком и понятное планирование покупок.

[Расширенные варианты следующей версии](docs/DEVELOPMENT_OPTIONS_RU.md) — предварительный список для выбора, а не описание текущего продукта.

---

<a name="english"></a>

## English

**Smart Fridge** is a web prototype for keeping track of food at home: shelf life, what is left, a shopping cart and analytics. Barcode scanning and recipe generation are extra network features.

A presentation prototype with a local demo mode, Firebase integration and a multilingual interface. Local data is isolated from the cloud; server-side access rights need a separate Firebase Rules setup.

### Quick tour

Choose **"Sign in locally"**, add a product, change how much is left and send the purchase you need to the cart. Reload the page and try the CSV export. This tour needs no Firebase sign-in and no Gemini key, and it does not change any cloud data.

### 🚀 Main features

* **Turbo barcode scanner:** recognises products through the phone camera and pulls in their ingredients and dish ideas from the worldwide OpenFoodFacts database.
* **AI chef (Gemini AI):** the neural network writes recipes from what is currently left in the fridge (the "Use everything" and "Save the products" functions).
* **AI supplier:** analyses the recipe of the dish you want, checks it against your fridge and adds the missing ingredients to the Cart automatically.
* **Smart expiry dates:** the app suggests a shelf life from a local reference by name and category; the date can be corrected by hand.
* **Role demo:** a role system in the interface (Admin, User, Guest, Child). Changing the client-side role grants no server rights. The administrator is available in the local demo.
* **Dish rating system:** after a product has been eaten, the family can rate the dish on a 5-star scale and leave a review.
* **Many languages and currencies:** full on-the-fly translation of the interface (Russian, Hebrew, English, German, Spanish) with right-to-left (RTL) support and a choice of currency (₽, ₪, $, €).
* **Analytics and export:** counts the money lost on thrown-away food and lets you download and upload the database as CSV, which opens in a spreadsheet editor.
* **Install on the phone (PWA):** the manifest lets you add an app shortcut to the home screen of a supported browser. Full offline launch is not implemented yet.

---

### 🧠 Technical architecture (under the hood)

The project is built on plain Vanilla JavaScript (no heavyweight frameworks), but with modern design patterns.

#### 1. The MVC pattern (Model-View-Controller)
The logic is strictly split into independent layers, which keeps the code from turning into "spaghetti":
* **Model (`js/models/Fridge.js`):** the "brain" of the app. It stores data arrays, sorts them and talks to the server. It knows nothing about the interface.
* **View (`js/ui/render.js`):** the "face". It only draws HTML cards from the data it receives.
* **Controller (`js/app.js`):** the "conductor". It listens to user clicks, passes commands to the Model and asks the View to refresh the screen.

#### 2. Asynchrony and networking (Promises, async/await)
To keep the interface from "freezing" during long operations, all network requests run in the background. The app is not blocked while it waits for an answer from the database or the neural network.

#### 3. Third-party API integration
* **Google Gemini AI:** connection to the neural network through a REST API. Careful prompting makes the AI return not just text but a strictly structured `JSON` format, so the shopping list can be parsed automatically. The AI is set up to answer in the chosen interface language.
* **Firebase Firestore:** a cloud NoSQL database. Cloud mode uses the existing collections; access limits and user isolation must be confirmed with Firestore rules before public multi-user use.
* **Firebase Auth:** the sign-in and user session module, through Firebase Auth.

#### 4. Event-driven architecture (Event Delegation)
Instead of attaching click handlers (`addEventListener`) to each of hundreds of "Take" or "Write off" buttons, the app uses the **delegation** pattern. The whole fridge gets a single listener, which uses `event.target` and `dataset.id` to work out which button was pressed. This saves a great deal of browser memory (performance optimisation).

#### 5. Single Source of Truth
The interface (HTML) never stores the app's state. On any action (say, 2 eggs out of 10 were eaten) the program first updates the data in the Model object (`batches`) and then redraws the whole shelf. This way the screen is built from the model after every completed change.

#### 6. PWA (Progressive Web App) and Service Workers
A `manifest.json` file provides installation and a separate app window. The current `Service Worker` does not cache the app: full offline launch is not implemented yet. A script detects iOS devices (iPhone) to show installation hints, and there is an instruction button for manual setup.

### Running and data modes

Open the project through a local HTTP server and choose "Sign in locally". Products, the cart and analytics are saved only in `localStorage` with the prefix `smart-fridge-app:demo:`. This mode neither reads nor changes Firestore. If the browser forbids storage, the app keeps working in the memory of the current tab; changes are lost when it is closed. Switching modes invalidates the answers of the previous session so they cannot reach the current data. The first load of the interface needs external CDN dependencies; local data does not mean a fully offline installation.

Email sign-in connects to an existing Firebase project. Interface roles do not replace Firebase Security Rules. The Gemini features need your own key and a network; local product tracking works without any AI calls.

CSV keeps multi-line notes, quotes, commas, the price, the currency, the ingredients and the "ready dish" flag. The old 11-column CSV format is supported.

### Checks

`npm test` runs Node.js regression tests of local CRUD, analytics, CSV, the full start of the guest controller when storage is forbidden, and late answers after a mode switch. The tests never call Firebase or Gemini and do not change cloud data.

### Development plans

These are proposals for the next stage, not features that already exist.

- **Visual:** a compact view of stock by category, a clear save status and a more visible way into the local demo; check fields and RTL on narrow screens.
- **Engineering:** first confirm Firebase Rules and UID isolation, move AI requests to a controlled server, then check Service Worker updates and caching.
- **Features:** an import preview with fixes for faulty rows, a filter for products close to expiry and clear shopping planning.

[Extended options for the next version](docs/DEVELOPMENT_OPTIONS_RU.md) (in Russian) — a draft list to choose from, not a description of the current product.

---

<a name="hebrew"></a>

<div dir="rtl">

## עברית

**המקרר החכם** — אב-טיפוס ווב לניהול מזון בבית: תוקף, כמה נשאר, עגלת קניות וניתוח נתונים. סריקת ברקודים ויצירת מתכונים הן יכולות רשת נוספות.

אב-טיפוס להצגה עם מצב הדגמה מקומי, שילוב Firebase וממשק רב-לשוני. הנתונים המקומיים מבודדים מהענן; הרשאות הגישה בשרת דורשות הגדרה נפרדת של Firebase Rules.

### סיור קצר

בחרו **"כניסה מקומית"**, הוסיפו מוצר, שנו את הכמות שנשארה ושלחו את הקנייה הדרושה לעגלה. טענו מחדש את הדף ונסו ייצוא CSV. הסיור הזה לא דורש כניסה ל-Firebase או מפתח Gemini ואינו משנה נתונים בענן.

### 🚀 יכולות עיקריות

* **סורק ברקודים טורבו:** זיהוי אוטומטי של מוצרים דרך מצלמת הטלפון, עם משיכת הרכיבים ורעיונות למנות ממאגר OpenFoodFacts העולמי.
* **שף בינה מלאכותית (Gemini AI):** הרשת העצבית כותבת מתכונים לפי מה שנשאר כרגע במקרר (הפונקציות "מהכול" ו"הצלת מוצרים").
* **ספק בינה מלאכותית:** מנתח את המתכון של המנה הרצויה, משווה אותו למקרר שלכם ומוסיף אוטומטית לעגלה את הרכיבים החסרים.
* **תוקף חכם:** האפליקציה מציעה תוקף מתוך מאגר מקומי לפי שם וקטגוריה; אפשר לתקן את התאריך ידנית.
* **הדגמת תפקידים:** מערכת תפקידים בממשק (מנהל, משתמש, אורח, ילד). שינוי התפקיד בצד הלקוח אינו נותן הרשאות בשרת. המנהל זמין בהדגמה המקומית.
* **מערכת דירוג מנות:** אחרי שמוצר נאכל, המשפחה יכולה לדרג את המנה בסולם של 5 כוכבים ולהשאיר חוות דעת.
* **רב-לשוניות וריבוי מטבעות:** תרגום מלא של הממשק תוך כדי עבודה (רוסית, עברית, אנגלית, גרמנית, ספרדית) עם תמיכה בכתיבה מימין לשמאל (RTL) ובחירת מטבע (₽, ₪, $, €).
* **ניתוח וייצוא:** חישוב ההפסד הכספי ממזון שנזרק ואפשרות להוריד ולהעלות את מסד הנתונים בפורמט CSV, שנפתח בעורך גיליונות.
* **התקנה בטלפון (PWA):** המניפסט מאפשר להוסיף קיצור דרך לאפליקציה במסך הבית של דפדפן נתמך. הפעלה מלאה בלי רשת עדיין לא מומשה.

---

### 🧠 ארכיטקטורה טכנית (מתחת למכסה המנוע)

הפרויקט בנוי על JavaScript נקי (Vanilla, בלי פריימוורקים כבדים), אבל עם תבניות תכנון מודרניות.

#### 1. תבנית MVC (Model-View-Controller)
הלוגיקה מחולקת בקפדנות לשכבות עצמאיות, וכך הקוד לא הופך ל"ספגטי":
* **מודל (`js/models/Fridge.js`):** ה"מוח" של האפליקציה. שומר מערכי נתונים, ממיין אותם ומדבר עם השרת. לא יודע דבר על הממשק.
* **תצוגה (`js/ui/render.js`):** ה"פנים". רק מציירת כרטיסי HTML לפי הנתונים שקיבלה.
* **בקר (`js/app.js`):** ה"מנצח". מקשיב ללחיצות המשתמש, מעביר פקודות למודל ומבקש מהתצוגה לרענן את המסך.

#### 2. אסינכרוניות ועבודה עם הרשת (Promises, async/await)
כדי שהממשק לא "ייתקע" בפעולות ארוכות, כל בקשות הרשת רצות ברקע. האפליקציה לא נחסמת בזמן שהיא מחכה לתשובה ממסד הנתונים או מהרשת העצבית.

#### 3. שילוב ממשקי API חיצוניים
* **Google Gemini AI:** חיבור לרשת העצבית דרך REST API. ניסוח הנחיות מוקפד גורם לבינה המלאכותית להחזיר לא סתם טקסט אלא פורמט `JSON` מובנה בקפדנות, כדי לנתח אוטומטית את רשימת הקניות. הבינה המלאכותית מוגדרת לענות בשפת הממשק שנבחרה.
* **Firebase Firestore:** מסד נתונים NoSQL בענן. במצב הענן משתמשים באוספים הקיימים; את הגבלות הגישה ואת בידוד המשתמשים יש לאשר בכללי Firestore לפני שימוש ציבורי מרובה משתמשים.
* **Firebase Auth:** מודול הכניסה וניהול הפעלות המשתמשים דרך Firebase Auth.

#### 4. ארכיטקטורה מונחית אירועים (Event Delegation)
במקום לחבר מטפלי לחיצה (`addEventListener`) לכל אחד ממאות כפתורי "לקחת" או "למחוק", משתמשים בתבנית **האצלה**. על כל המקרר מחובר מאזין אחד בלבד, שבעזרת `event.target` ו-`dataset.id` מזהה איזה כפתור נלחץ. זה חוסך מאוד בזיכרון הדפדפן (אופטימיזציית ביצועים).

#### 5. מקור אמת יחיד (Single Source of Truth)
הממשק (HTML) אף פעם לא שומר את מצב האפליקציה. בכל פעולה (למשל, אכלו 2 ביצים מתוך 10) התוכנית קודם מעדכנת את הנתונים באובייקט המודל (`batches`), ואז מציירת מחדש את כל המדף. כך המסך נבנה מהמודל אחרי כל שינוי שהושלם.

#### 6. PWA (Progressive Web App) ו-Service Workers
נכתב קובץ `manifest.json` להתקנה ולחלון אפליקציה נפרד. ה-`Service Worker` הנוכחי אינו שומר את האפליקציה במטמון: הפעלה מלאה בלי רשת עדיין לא מומשה. נוסף סקריפט שמזהה מכשירי iOS (iPhone) כדי להציג רמזי התקנה, וגם כפתור הוראות להגדרה ידנית.

### הרצה ומצבי נתונים

פתחו את הפרויקט דרך שרת HTTP מקומי ובחרו "כניסה מקומית". המוצרים, העגלה והניתוח נשמרים רק ב-`localStorage` עם הקידומת `smart-fridge-app:demo:`. המצב הזה לא קורא ולא משנה את Firestore. אם הדפדפן אוסר אחסון, האפליקציה ממשיכה לעבוד בזיכרון של הלשונית הנוכחית; אחרי סגירתה השינויים לא יישמרו. מעבר בין מצבים מבטל את התשובות של ההפעלה הקודמת, כדי שלא יגיעו לנתונים הנוכחיים. הטעינה הראשונה של הממשק דורשת תלויות CDN חיצוניות; נתונים מקומיים אינם התקנה עצמאית לגמרי.

כניסה באימייל מתחברת לפרויקט Firebase קיים. תפקידי הממשק אינם מחליפים את Firebase Security Rules. יכולות Gemini דורשות מפתח משלכם ורשת; ניהול המוצרים המקומי עובד בלי קריאות לבינה מלאכותית.

ה-CSV שומר הערות מרובות שורות, מירכאות, פסיקים, מחיר, מטבע, רכיבים וסימון של מנה מוכנה. הפורמט הישן של CSV עם 11 עמודות נתמך.

### בדיקות

`npm test` מריץ בדיקות רגרסיה ב-Node.js ל-CRUD מקומי, לניתוח, ל-CSV, לאתחול המלא של בקר האורח כשהאחסון אסור ולתשובות מאוחרות אחרי החלפת מצב. הבדיקות לא פונות ל-Firebase או ל-Gemini ואינן משנות נתונים בענן.

### תוכניות פיתוח

אלה הצעות לשלב הבא, לא יכולות שכבר מומשו.

- **עיצוב:** תצוגה קומפקטית של המלאי לפי קטגוריות, מצב שמירה ברור וכניסה בולטת יותר להדגמה המקומית; בדיקת שדות ו-RTL במסכים צרים.
- **הנדסה:** קודם לאשר את Firebase Rules ובידוד לפי UID, להעביר את בקשות הבינה המלאכותית לשרת מבוקר, ואז לבדוק עדכון ומטמון של ה-Service Worker.
- **יכולות:** תצוגה מקדימה של ייבוא עם תיקון שורות שגויות, מסנן למוצרים שתוקפם מתקרב ותכנון קניות ברור.

[אפשרויות מורחבות לגרסה הבאה](docs/DEVELOPMENT_OPTIONS_RU.md) (ברוסית) — רשימה ראשונית לבחירה, לא תיאור של המוצר הנוכחי.

</div>

---

<a name="spanish"></a>

## Español

**Nevera inteligente**: un prototipo web para llevar la cuenta de los alimentos de casa: caducidad, existencias, carrito de la compra y análisis. El escaneo de códigos de barras y la generación de recetas son funciones de red adicionales.

Un prototipo de presentación con modo de demostración local, integración con Firebase e interfaz multilingüe. Los datos locales están aislados de la nube; los permisos de acceso en el servidor requieren configurar aparte las Firebase Rules.

### Recorrido rápido

Elija **«Entrar en local»**, añada un producto, cambie lo que queda y envíe la compra necesaria al carrito. Recargue la página y pruebe la exportación CSV. Este recorrido no necesita iniciar sesión en Firebase ni una clave de Gemini, y no modifica datos en la nube.

### 🚀 Funciones principales

* **Escáner turbo de códigos de barras:** reconoce productos con la cámara del móvil y trae su composición e ideas de platos de la base mundial OpenFoodFacts.
* **Chef IA (Gemini AI):** la red neuronal genera recetas con lo que queda ahora en la nevera (las funciones «Con todo» y «Salvar los productos»).
* **Proveedor IA:** analiza la receta del plato deseado, la compara con su nevera y añade solo al Carrito los ingredientes que faltan.
* **Fechas de caducidad inteligentes:** la aplicación propone un plazo a partir de una guía local según el nombre y la categoría; la fecha se puede corregir a mano.
* **Demostración de roles:** un sistema de roles en la interfaz (Administrador, Usuario, Invitado, Niño). Cambiar el rol en el cliente no concede derechos en el servidor. El administrador está disponible en la demo local.
* **Sistema de valoración de platos:** cuando un producto se ha comido, la familia puede puntuar el plato en una escala de 5 estrellas y dejar una opinión.
* **Varios idiomas y monedas:** traducción completa de la interfaz al vuelo (ruso, hebreo, inglés, alemán, español) con soporte de escritura de derecha a izquierda (RTL) y elección de moneda (₽, ₪, $, €).
* **Análisis y exportación:** calcula el dinero perdido en comida tirada y permite descargar y cargar la base de datos en formato CSV, que se abre en una hoja de cálculo.
* **Instalación en el móvil (PWA):** el manifiesto permite añadir un acceso directo a la pantalla de inicio de un navegador compatible. El arranque completo sin red aún no está implementado.

---

### 🧠 Arquitectura técnica (bajo el capó)

El proyecto está hecho con JavaScript puro (Vanilla, sin frameworks pesados), pero con patrones de diseño modernos.

#### 1. El patrón MVC (Model-View-Controller)
La lógica está estrictamente dividida en capas independientes, lo que evita que el código se convierta en «espaguetis»:
* **Modelo (`js/models/Fridge.js`):** el «cerebro» de la aplicación. Guarda los arrays de datos, los ordena y habla con el servidor. No sabe nada de la interfaz.
* **Vista (`js/ui/render.js`):** la «cara». Solo dibuja tarjetas HTML a partir de los datos recibidos.
* **Controlador (`js/app.js`):** el «director de orquesta». Escucha los clics del usuario, pasa órdenes al Modelo y pide a la Vista que actualice la pantalla.

#### 2. Asincronía y red (Promises, async/await)
Para que la interfaz no se «congele» en operaciones largas, todas las peticiones de red se ejecutan en segundo plano. La aplicación no se bloquea mientras espera la respuesta de la base de datos o de la red neuronal.

#### 3. Integración de API de terceros
* **Google Gemini AI:** conexión con la red neuronal mediante una API REST. Un prompting cuidadoso hace que la IA no devuelva simple texto, sino un formato `JSON` estrictamente estructurado para analizar automáticamente la lista de la compra. La IA está configurada para responder en el idioma elegido de la interfaz.
* **Firebase Firestore:** una base de datos NoSQL en la nube. El modo en la nube usa las colecciones existentes; los límites de acceso y el aislamiento de usuarios deben confirmarse con reglas de Firestore antes de un uso público multiusuario.
* **Firebase Auth:** el módulo de inicio de sesión y de gestión de sesiones de usuario mediante Firebase Auth.

#### 4. Arquitectura orientada a eventos (Event Delegation)
En lugar de poner manejadores de clic (`addEventListener`) en cada uno de los cientos de botones «Tomar» o «Dar de baja», se usa el patrón de **delegación**. Toda la nevera tiene un solo oyente que, mediante `event.target` y `dataset.id`, averigua qué botón se pulsó. Esto ahorra muchísima memoria del navegador (optimización del rendimiento).

#### 5. Fuente única de verdad (Single Source of Truth)
La interfaz (HTML) nunca guarda el estado de la aplicación. Ante cualquier acción (por ejemplo, se comieron 2 huevos de 10), el programa primero actualiza los datos en el objeto Modelo (`batches`) y luego vuelve a dibujar la balda entera. Así la pantalla se construye a partir del modelo tras cada cambio completado.

#### 6. PWA (Progressive Web App) y Service Workers
Un archivo `manifest.json` permite instalarla y abrirla en una ventana propia. El `Service Worker` actual no guarda la aplicación en caché: el arranque completo sin red aún no está implementado. Un script detecta dispositivos iOS (iPhone) para mostrar consejos de instalación, y hay un botón con instrucciones para configurarla a mano.

### Ejecución y modos de datos

Abra el proyecto mediante un servidor HTTP local y elija «Entrar en local». Los productos, el carrito y el análisis se guardan solo en `localStorage` con el prefijo `smart-fridge-app:demo:`. Este modo no lee ni modifica Firestore. Si el navegador prohíbe el almacenamiento, la aplicación sigue funcionando en la memoria de la pestaña actual; al cerrarla, los cambios se pierden. El cambio de modo invalida las respuestas de la sesión anterior para que no lleguen a los datos actuales. La primera carga de la interfaz necesita dependencias CDN externas; tener datos locales no significa una instalación totalmente autónoma.

El inicio de sesión por email se conecta a un proyecto de Firebase existente. Los roles de la interfaz no sustituyen a las Firebase Security Rules. Las funciones de Gemini necesitan su propia clave y red; el control local de productos funciona sin llamadas a la IA.

El CSV conserva notas de varias líneas, comillas, comas, el precio, la moneda, la composición y la marca de plato preparado. Se admite el formato antiguo de CSV de 11 columnas.

### Comprobaciones

`npm test` ejecuta pruebas de regresión en Node.js del CRUD local, el análisis, el CSV, el arranque completo del controlador de invitado con el almacenamiento prohibido y las respuestas tardías tras un cambio de modo. Las pruebas no llaman a Firebase ni a Gemini y no modifican datos en la nube.

### Planes de desarrollo

Son propuestas para la siguiente etapa, no funciones ya implementadas.

- **Visual:** una vista compacta de las existencias por categoría, un estado de guardado claro y una entrada más visible a la demo local; revisar los campos y el RTL en pantallas estrechas.
- **Ingeniería:** confirmar primero las Firebase Rules y el aislamiento por UID, llevar las peticiones de IA a un servidor controlado y después comprobar la actualización y la caché del Service Worker.
- **Funciones:** una vista previa de la importación con corrección de filas erróneas, un filtro de productos a punto de caducar y una planificación de compras clara.

[Opciones ampliadas para la próxima versión](docs/DEVELOPMENT_OPTIONS_RU.md) (en ruso): una lista preliminar para elegir, no una descripción del producto actual.

---

<a name="french"></a>

## Français

**Le réfrigérateur intelligent** est un prototype web pour suivre les aliments de la maison : dates de conservation, restes, panier de courses et analyses. Le scan des codes-barres et la génération de recettes sont des fonctions réseau en plus.

Un prototype de présentation avec un mode démo local, une intégration Firebase et une interface multilingue. Les données locales sont isolées du cloud ; les droits d'accès côté serveur demandent une configuration séparée des Firebase Rules.

### Visite rapide

Choisissez **« Se connecter en local »**, ajoutez un produit, changez ce qui reste et envoyez l'achat nécessaire au panier. Rechargez la page et essayez l'export CSV. Cette visite ne demande ni connexion Firebase ni clé Gemini et ne modifie aucune donnée dans le cloud.

### 🚀 Fonctions principales

* **Scanner turbo de codes-barres :** reconnaissance automatique des produits par la caméra du téléphone, avec leur composition et des idées de plats tirées de la base mondiale OpenFoodFacts.
* **Chef IA (Gemini AI) :** le réseau neuronal invente des recettes avec ce qui reste dans le réfrigérateur (les fonctions « Avec tout » et « Sauver les produits »).
* **Fournisseur IA :** analyse la recette du plat voulu, la compare avec votre réfrigérateur et ajoute automatiquement au Panier les ingrédients qui manquent.
* **Dates de péremption intelligentes :** l'application propose une durée tirée d'un référentiel local selon le nom et la catégorie ; la date peut être corrigée à la main.
* **Démonstration des rôles :** un système de rôles dans l'interface (Admin, Utilisateur, Invité, Enfant). Changer de rôle côté client ne donne aucun droit côté serveur. L'administrateur est disponible dans la démo locale.
* **Notation des plats :** une fois le produit mangé, la famille peut noter le plat sur une échelle de 5 étoiles et laisser un avis.
* **Plusieurs langues et devises :** traduction complète de l'interface à la volée (russe, hébreu, anglais, allemand, espagnol) avec la prise en charge de l'écriture de droite à gauche (RTL) et le choix de la devise (₽, ₪, $, €).
* **Analyses et export :** calcul de l'argent perdu en nourriture jetée et possibilité de télécharger et de charger la base de données au format CSV, qui s'ouvre dans un tableur.
* **Installation sur téléphone (PWA) :** le manifeste permet d'ajouter un raccourci de l'application à l'écran d'accueil d'un navigateur compatible. Le lancement complet hors ligne n'est pas encore réalisé.

---

### 🧠 Architecture technique (sous le capot)

Le projet repose sur du JavaScript pur (Vanilla, sans frameworks lourds), mais avec des patrons de conception modernes.

#### 1. Le patron MVC (Model-View-Controller)
La logique est strictement séparée en couches indépendantes, ce qui empêche le code de tourner aux « spaghettis » :
* **Modèle (`js/models/Fridge.js`) :** le « cerveau » de l'application. Il garde les tableaux de données, les trie et dialogue avec le serveur. Il ne sait rien de l'interface.
* **Vue (`js/ui/render.js`) :** le « visage ». Elle ne fait que dessiner des cartes HTML à partir des données reçues.
* **Contrôleur (`js/app.js`) :** le « chef d'orchestre ». Il écoute les clics de l'utilisateur, transmet les ordres au Modèle et demande à la Vue de rafraîchir l'écran.

#### 2. Asynchronisme et réseau (Promises, async/await)
Pour que l'interface ne se « fige » pas pendant les opérations longues, toutes les requêtes réseau s'exécutent en arrière-plan. L'application n'est pas bloquée pendant qu'elle attend la réponse de la base de données ou du réseau neuronal.

#### 3. Intégration d'API tierces
* **Google Gemini AI :** connexion au réseau neuronal via une API REST. Un prompting soigné oblige l'IA à renvoyer non pas un simple texte mais un format `JSON` strictement structuré, pour analyser automatiquement la liste de courses. L'IA est réglée pour répondre dans la langue choisie de l'interface.
* **Firebase Firestore :** une base de données NoSQL dans le cloud. Le mode cloud utilise les collections existantes ; les limites d'accès et l'isolation des utilisateurs doivent être confirmées par les règles Firestore avant tout usage public à plusieurs utilisateurs.
* **Firebase Auth :** le module de connexion et de gestion des sessions utilisateur via Firebase Auth.

#### 4. Architecture événementielle (Event Delegation)
Au lieu d'attacher des gestionnaires de clic (`addEventListener`) à chacun des centaines de boutons « Prendre » ou « Retirer », on utilise le patron de **délégation**. Tout le réfrigérateur n'a qu'un seul écouteur qui, grâce à `event.target` et `dataset.id`, détermine quel bouton a été pressé. Cela économise énormément la mémoire du navigateur (optimisation des performances).

#### 5. Source unique de vérité (Single Source of Truth)
L'interface (HTML) ne garde jamais l'état de l'application. À chaque action (par exemple, 2 œufs sur 10 ont été mangés), le programme met d'abord à jour les données dans l'objet Modèle (`batches`), puis redessine toute l'étagère. Ainsi, l'écran est construit à partir du modèle après chaque modification terminée.

#### 6. PWA (Progressive Web App) et Service Workers
Un fichier `manifest.json` permet l'installation et une fenêtre d'application à part. Le `Service Worker` actuel ne met pas l'application en cache : le lancement complet hors ligne n'est pas encore réalisé. Un script détecte les appareils iOS (iPhone) pour afficher des conseils d'installation, et un bouton d'instructions aide à la configuration manuelle.

### Lancement et modes de données

Ouvrez le projet via un serveur HTTP local et choisissez « Se connecter en local ». Les produits, le panier et les analyses ne sont enregistrés que dans `localStorage`, avec le préfixe `smart-fridge-app:demo:`. Ce mode ne lit ni ne modifie Firestore. Si le navigateur interdit le stockage, l'application continue de fonctionner dans la mémoire de l'onglet actuel ; une fois l'onglet fermé, les modifications sont perdues. Le changement de mode invalide les réponses de la session précédente pour qu'elles n'atteignent pas les données actuelles. Le premier chargement de l'interface a besoin de dépendances CDN externes ; des données locales ne signifient pas une installation entièrement autonome.

La connexion par e-mail se branche sur un projet Firebase existant. Les rôles de l'interface ne remplacent pas les Firebase Security Rules. Les fonctions Gemini demandent votre propre clé et le réseau ; le suivi local des produits fonctionne sans aucun appel à l'IA.

Le CSV conserve les notes sur plusieurs lignes, les guillemets, les virgules, le prix, la devise, la composition et l'indicateur de plat préparé. L'ancien format CSV à 11 colonnes est pris en charge.

### Vérifications

`npm test` lance des tests de non-régression Node.js du CRUD local, des analyses, du CSV, du démarrage complet du contrôleur invité quand le stockage est interdit et des réponses tardives après un changement de mode. Les tests n'appellent ni Firebase ni Gemini et ne modifient aucune donnée dans le cloud.

### Projets d'évolution

Ce sont des propositions pour l'étape suivante, pas des fonctions déjà réalisées.

- **Visuel :** une vue compacte des stocks par catégorie, un état d'enregistrement clair et une entrée plus visible dans la démo locale ; vérifier les champs et le RTL sur écran étroit.
- **Ingénierie :** confirmer d'abord les Firebase Rules et l'isolation par UID, déplacer les requêtes d'IA vers un serveur contrôlé, puis vérifier la mise à jour et le cache du Service Worker.
- **Fonctions :** un aperçu de l'import avec correction des lignes erronées, un filtre des produits proches de la péremption et une planification des courses claire.

[Options étendues pour la prochaine version](docs/DEVELOPMENT_OPTIONS_RU.md) (en russe) — une liste préliminaire à choisir, pas une description du produit actuel.
