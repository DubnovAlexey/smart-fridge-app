// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Интеграция с нейросетью Gemini (ИИ-повар).
// ==============================================================================

// Слово async (асинхронная) означает, что функция будет ЖДАТЬ ответа от интернета,
// не подвешивая при этом весь остальной сайт.
export async function askGeminiRecipe(apiKey, fridgeBatches) {

    // 1. Находим продукты, которые умирают (осталось <= 3 дней) ИЛИ скоропортящиеся
    const dyingProducts = fridgeBatches.filter(b => b.daysLeft <= 3 || b.isPerishable);

    if (dyingProducts.length === 0) {
        return "Отличные новости! У вас нет продуктов, которые срочно нужно спасать. Можете приготовить что угодно из свежих запасов.";
    }

    // 2. Превращаем массив продуктов в текстовый список (Например: "Кефир (1 л), Мясо (0.5 кг)")
    const ingredients = dyingProducts.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');

    // 3. Формируем ПРОМПТ (Задание для нейросети)
    const promptText = `Я хочу приготовить еду. У меня скоро испортятся следующие продукты: ${ingredients}. 
    Придумай 1 простой и вкусный рецепт, чтобы спасти эти продукты (использовать всё не обязательно, только то, что сочетается). 
    Напиши коротко: название блюда, какие еще базовые ингредиенты нужны (соль, масло не в счет), и 3-4 шага приготовления.`;

    try {
        // Формируем URL для запроса к Google
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Делаем POST-запрос к API
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка связи с API');
        }

        // Ждем конвертации ответа в JSON
        const data = await response.json();

        // Вытаскиваем нужный текст из сложной структуры ответа Google
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error(error);
        return "❌ Ошибка при обращении к AI-Шефу. Проверьте API-ключ в настройках Админа (или включите VPN, если API заблокирован в вашем регионе).";
    }
}