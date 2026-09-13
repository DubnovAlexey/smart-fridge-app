// ==============================================================================
// ФАЙЛ: js/utils/aiChef.js
// НАЗНАЧЕНИЕ: Интеграция с нейросетью Gemini (ИИ-повар).
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

    const promptText = `Я хочу приготовить еду. ${promptContext} ${fullIngredients}. 
    Придумай 5-7 РАЗНЫХ простых и вкусных рецептов. 
    ${mode === 'rescue' ? 'Сделай акцент на использовании этих продуктов, чтобы спасти их от пропадания.' : 'Используй любые удачные сочетания.'}
    Важно: использовать абсолютно всё в одном блюде НЕ НУЖНО. Выбирай только то, что логично сочетается.
    Напиши ответ четко структурированно. Для КАЖДОГО из рецептов укажи:
    1. Название блюда.
    2. Дополнительные базовые ингредиенты.
    3. 3-4 кратких шага приготовления.
    Разделяй рецепты горизонтальной линией (---).`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Сбой при обращении к ИИ:", error);

        // Вместо выдуманного рецепта возвращаем честную ошибку, которая красиво отрисуется в интерфейсе
        return `❌ **Ой, AI-Шеф временно недоступен!**\n\nПохоже, сервер Google не отвечает или возникла проблема с сетью. \n\n*Что можно сделать:*\n1. Проверьте правильность API-ключа в Настройках Админа.\n2. Убедитесь, что у вас работает интернет (или включен VPN, если сервисы Google заблокированы в вашем регионе).\n\n*(Код ошибки: ${error.message})*`;
    }
}