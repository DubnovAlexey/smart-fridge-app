// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Связь с Google Gemini AI (Рецепты и анализ продуктов)
// ==============================================================================

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Базовая функция для меню
export async function askGeminiRecipe(apiKey, batches, mode) {
    if (!apiKey) throw new Error("API Key is missing");

    let promptText = "";
    const foodList = batches.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');

    if (mode === 'rescue') {
        promptText = `У меня есть продукты: ${foodList}. Придумай 3 простых рецепта, чтобы спасти то, что скоро испортится. Отвечай на языке продуктов или на русском. Форматируй ответ только HTML тегами (<b>, <ul>, <li>). Не используй markdown.`;
    } else {
        promptText = `В моем холодильнике: ${foodList}. Придумай 3 интересных рецепта. Форматируй ответ только HTML тегами (<b>, <ul>, <li>). Не используй markdown.`;
    }

    return await fetchGemini(apiKey, promptText);
}

// НОВОЕ: Мгновенный анализ продукта из сканера
export async function askGeminiProductInfo(apiKey, productName, language) {
    if (!apiKey) return "";

    const promptText = `Ты кулинарный ИИ-эксперт. Пользователь отсканировал продукт "${productName}". 
    Ответь СТРОГО на языке с кодом "${language}" (например, ru = русский, he = иврит, en = английский).
    Напиши 3 коротких факта об этом продукте в формате HTML списка (без markdown):
    <ul class="space-y-1 mt-2">
      <li><b>Правила хранения:</b> (коротко)</li>
      <li><b>Срок годности:</b> (в среднем)</li>
      <li><b>Идея блюда:</b> (одно простое применение)</li>
    </ul>
    Обязательно переведи жирные заголовки на запрашиваемый язык!`;

    return await fetchGemini(apiKey, promptText);
}

async function fetchGemini(apiKey, promptText) {
    try {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        }
        return "<i>Ошибка ответа AI</i>";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "<i>Ошибка соединения с AI.</i>";
    }
}