// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Интеграция с нейросетью Gemini (ИИ-повар).
// ==============================================================================

export async function askGeminiRecipe(apiKey, fridgeBatches, mode = 'all') {
    let targetProducts = [];
    let promptContext = "";

    // РЕЖИМ 1: Спасти продукты (только то, чему осталось <= 3 дней, или скоропорт)
    if (mode === 'rescue') {
        targetProducts = fridgeBatches.filter(b => b.daysLeft <= 3 || b.isPerishable);
        if (targetProducts.length === 0) {
            return "Отличные новости! У вас нет продуктов, которые срочно нужно спасать. Нажмите кнопку «Из всего, что есть», чтобы придумать меню из свежих запасов.";
        }
        promptContext = "У меня скоро испортятся следующие продукты:";
    }
    // РЕЖИМ 2: Из всего, что есть (весь холодильник)
    else {
        targetProducts = fridgeBatches;
        if (targetProducts.length === 0) {
            return "Ваш холодильник пуст. Сначала добавьте продукты на полки!";
        }
        promptContext = "У меня в холодильнике есть следующие продукты:";
    }

    const ingredients = targetProducts.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');

    // Обновленный ПРОМПТ: требуем 5-7 рецептов и строгую структуру
    const promptText = `Я хочу приготовить еду. ${promptContext} ${ingredients}. 
    Придумай 5-7 РАЗНЫХ простых и вкусных рецептов. 
    ${mode === 'rescue' ? 'Сделай акцент на использовании этих продуктов, чтобы спасти их от пропадания.' : 'Используй любые удачные сочетания из этого списка.'}
    Важно: использовать абсолютно всё в одном блюде НЕ НУЖНО. Выбирай только то, что логично сочетается (не мешай рыбу со сладким и т.д.).
    Напиши ответ четко структурированно. Для КАЖДОГО из 5-7 рецептов укажи:
    1. Название блюда.
    2. Дополнительные базовые ингредиенты (соль, масло, вода, специи - если нужны).
    3. 3-4 кратких шага приготовления.
    Обязательно разделяй рецепты горизонтальной линией (---).`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) throw new Error('Ошибка связи с API');
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error(error);
        return "❌ Ошибка при обращении к AI-Шефу. Проверьте API-ключ в настройках Админа (или включите VPN).";
    }
}