// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Интеграция с нейросетью Gemini (актуальная модель gemini-3.5-flash)
// ==============================================================================

export async function askGeminiRecipe(apiKey, fridgeBatches, mode = 'all') {
    let targetProducts = [];
    let promptContext = "";

    if (mode === 'rescue') {
        targetProducts = fridgeBatches.filter(b => b.daysLeft <= 3 || b.isPerishable);
        if (targetProducts.length === 0) {
            return "Отличные новости! У вас нет продуктов, которые срочно нужно спасать. Нажмите кнопку «Из всего, что есть».";
        }
        promptContext = "У меня скоро испортятся следующие продукты:";
    } else {
        targetProducts = fridgeBatches;
        if (targetProducts.length === 0) {
            return "Ваш холодильник пуст. Сначала добавьте продукты на полки!";
        }
        promptContext = "У меня в холодильнике есть следующие продукты:";
    }

    const fullIngredients = targetProducts.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');

    const promptText = `I want to cook food. ${promptContext} ${fullIngredients}. 
    Please come up with 5-7 DIFFERENT simple and delicious recipes in Russian. 
    ${mode === 'rescue' ? 'Focus on using these specific products to save them from spoiling.' : 'Use any good combinations.'}
    Do not use everything in one dish. Choose logical combinations.
    Format the response clearly with structured steps for each recipe, separated by horizontal lines (---).`;

    try {
        // Используем актуальное имя модели из документации Google
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey.trim()
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Детали ошибки Google:", errText);
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Сбой при обращении к ИИ:", error);

        return `❌ **Ой, AI-Шеф временно недоступен!**\n\nСервер отклонил запрос к модели. Проверьте правильность скопированного ключа.\n\n*(Код ошибки: ${error.message})*`;
    }
}