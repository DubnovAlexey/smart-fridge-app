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

    const ingredientNames = targetProducts.map(b => b.name).join(', ');
    const fullIngredients = targetProducts.map(b => `${b.name} (${b.count} ${b.unit})`).join(', ');

    const promptText = `Я хочу приготовить еду. ${promptContext} ${fullIngredients}. 
    Придумай 5-7 РАЗНЫХ простых и вкусных рецептов. 
    ${mode === 'rescue' ? 'Сделай акцент на использовании этих продуктов, чтобы спасти их от пропадания.' : 'Используй любые удачные сочетания.'}
    Важно: использовать абсолютно всё в одном блюде НЕ НУЖНО.
    Напиши ответ четко структурированно. Для КАЖДОГО из рецептов укажи:
    1. Название блюда.
    2. Дополнительные базовые ингредиенты.
    3. 3-4 кратких шага приготовления.
    Разделяй рецепты горизонтальной линией (---).`;

    try {
        // ИЗМЕНЕНИЕ: Используем суффикс -latest, это надежнее для новых ключей
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            // Читаем, что именно нам ответил сервер Google, и выводим в консоль
            const errorDetails = await response.text();
            console.error("Ответ от Google:", errorDetails);
            throw new Error(`Ошибка API: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.warn("Включаем резервный генератор (Mock Mode) из-за ошибки сети:", error);

        // РЕЗЕРВНЫЙ ГЕНЕРАТОР: Сработает, если Google выдал 404
        return `**1. Универсальное рагу из того, что есть**
Дополнительно: соль, перец, столовая ложка масла.
1. Нарежьте ваши запасы (${ingredientNames}) небольшими кусочками.
2. Обжарьте на сковороде 5-7 минут до золотистой корочки.
3. Добавьте немного воды, накройте крышкой и тушите до готовности.
---
**2. Быстрая запеканка**
Дополнительно: яйца, сыр или сметана.
1. Выложите (${ingredientNames}) в форму для запекания.
2. Залейте взбитыми яйцами и присыпьте любимыми специями.
3. Запекайте в духовке 20 минут при 180°C.
---
**3. Легкий домашний салат/закуска**
Дополнительно: любимый соус или оливковое масло.
1. Если среди продуктов (${ingredientNames}) есть свежие — нарежьте их соломкой.
2. Если продукты требуют термической обработки — отварите их.
3. Смешайте всё в глубокой миске и заправьте соусом.
---
*(Демонстрационный режим: сервер Google временно недоступен. Рецепты сгенерированы резервным алгоритмом на основе ваших продуктов).*`;
    }
}