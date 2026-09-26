// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Связь с Google Gemini AI (С поддержкой выбора языка и модели)
// ==============================================================================

const AI_MODEL = 'gemini-3-flash-preview';

const LANG_NAMES = {
    ru: 'русском',
    he: 'иврите',
    en: 'английском',
    de: 'немецком',
    es: 'испанском'
};

export async function askGeminiRecipe(apiKey, batches, mode, specificDish = "", language = 'ru') {
    if (!apiKey) throw new Error("API Key is missing");
    let promptText = "";
    const foodList = batches.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');
    const langName = LANG_NAMES[language] || 'русском';

    if (mode === 'rescue') {
        promptText = `У меня есть продукты: ${foodList}. Дай 3 простых рецепта, чтобы их спасти. Отвечай СТРОГО на ${langName} языке. Используй только HTML теги (<b>, <ul>, <li>).`;
    } else if (mode === 'specific' && specificDish) {
        promptText = `Я хочу приготовить блюдо: "${specificDish}". В моем холодильнике сейчас есть: ${foodList || 'ничего'}. 
        Напиши подробный рецепт. Отдельно выдели, какие ингредиенты я возьму из холодильника, а какие мне придется докупить. Отвечай СТРОГО на ${langName} языке. Используй только HTML теги (<b>, <ul>, <li>).`;
    } else {
        promptText = `В моем холодильнике: ${foodList}. Придумай 3 интересных рецепта из этих продуктов. Отвечай СТРОГО на ${langName} языке. Используй только HTML теги (<b>, <ul>, <li>).`;
    }
    return await fetchGeminiText(apiKey, promptText, false);
}

export async function askGeminiProductInfo(apiKey, productName, language = 'ru') {
    if (!apiKey) return "";
    const langName = LANG_NAMES[language] || 'русском';
    const promptText = `Пользователь отсканировал "${productName}". 
    Ответь СТРОГО на ${langName} языке. Напиши 3 факта в HTML формате:
    <ul class="space-y-1 mt-2">
      <li><b>Хранение:</b> (коротко)</li>
      <li><b>Годность:</b> (в среднем)</li>
      <li><b>Идея блюда:</b> (одно применение)</li>
    </ul>`;
    return await fetchGeminiText(apiKey, promptText, false);
}

export async function askGeminiMissingIngredients(apiKey, recipeName, batches, language = 'ru') {
    if (!apiKey) throw new Error("API Key is missing");

    const foodList = batches.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');
    const langName = LANG_NAMES[language] || 'русском';

    const promptText = `Блюдо: "${recipeName}".
    В наличии: ${foodList || 'Ничего нет'}.
    Чего не хватает для приготовления?
    Верни результат ТОЛЬКО в формате JSON-массива. Пример: [{"name": "Картофель", "category": "veg", "count": 1, "unit": "кг"}].
    Категория должна быть одна из: dairy, meat, veg, prepared, preserves, alcohol, other.
    Названия продуктов переведи на ${langName} язык.`;

    try {
        const response = await fetchGeminiText(apiKey, promptText, true);
        const cleanJsonStr = response.replace(/```json/gi, '').replace(/```/g, '').trim();
        if (!cleanJsonStr) return [];
        return JSON.parse(cleanJsonStr);
    } catch (error) {
        console.error("Ошибка парсинга JSON от ИИ:", error);
        throw error;
    }
}

async function fetchGeminiText(apiKey, promptText, forceJson = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`;

    const body = {
        contents: [{ parts: [{ text: promptText }] }]
    };

    if (forceJson) {
        body.generationConfig = { responseMimeType: "application/json" };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Ошибка API");
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}