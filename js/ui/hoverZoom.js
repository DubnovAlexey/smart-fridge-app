// ==============================================================================
// ФАЙЛ: js/ui/hoverZoom.js
// НАЗНАЧЕНИЕ: Фото продукта под мышью увеличивается по-настоящему.
//
// Правило владельца (14.11.2026): картинки стоят в небольших окошках, поэтому при наведении они должны серьёзно
// увеличиваться — примерно в 2,5 раза (широкое фото в 3), целиком, поверх соседей и в пределах окна, —
// а не чуть-чуть дёргаться. Сейчас это фото распознанного продукта в окне сканера (80×80).
// 1. Растёт из своего места и туда же уходит; копия не ловит мышь — кнопки окна под ней работают как раньше.
// 2. Только для настоящей мыши: у пальца нет наведения, на телефоне всё как было.
// 3. «Уменьшить движение»: крупное фото появляется сразу, без анимации.
// ==============================================================================

const PICTURES = '#preview-img'; // фото продукта из базы штрих-кодов
const TALL = 2.5; // портрет и квадрат
const WIDE = 3; // широкое фото (шире 4:3) растёт сильнее
const MARGIN = 14; // отступ от края окна

// Где стоит крупная копия: k × ширина фото, целиком в своих пропорциях, ужатая до окна,
// по центру над своим фото и сдвинутая внутрь полей окна
export function peekBox(rect, ratio, view) {
    const k = ratio > 4 / 3 ? WIDE : TALL;
    let width = rect.width * k;
    let height = width / ratio;
    const fit = Math.min(1, (view.width - MARGIN * 2) / width, (view.height - MARGIN * 2) / height);
    width *= fit;
    height *= fit;
    const clamp = (value, size, limit) => Math.min(Math.max(value, MARGIN), limit - size - MARGIN);
    return {
        left: clamp(rect.left + rect.width / 2 - width / 2, width, view.width),
        top: clamp(rect.top + rect.height / 2 - height / 2, height, view.height),
        width,
        height
    };
}

export function initHoverZoom() {
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = null; // { img, peek, from }
    let timer = 0;

    function close(instant) {
        clearTimeout(timer);
        if (!current) return;
        const { peek, from } = current;
        current = null;
        if (instant || still.matches) { peek.remove(); return; }
        peek.style.transform = from; // уходит туда же, откуда выросла
        peek.style.opacity = '0';
        peek.addEventListener('transitionend', () => peek.remove(), { once: true });
        setTimeout(() => peek.remove(), 400); // на случай, если анимация не дошла
    }

    function open(img) {
        if (current?.img === img) return;
        close(true);
        const rect = img.getBoundingClientRect();
        if (rect.width < 24 || !img.naturalWidth) return; // фото ещё не загрузилось
        const box = peekBox(rect, img.naturalWidth / img.naturalHeight, { width: window.innerWidth, height: window.innerHeight });
        const peek = document.createElement('div');
        peek.className = 'zoom-peek';
        peek.setAttribute('aria-hidden', 'true');
        Object.assign(peek.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
        const copy = document.createElement('img');
        copy.alt = '';
        copy.src = img.currentSrc || img.src;
        peek.append(copy);
        // Растёт из своего места: старт — там, где лежит маленькое фото
        const from = `translate(${rect.left - box.left}px, ${rect.top - box.top}px) scale(${rect.width / box.width}, ${rect.height / box.height})`;
        if (!still.matches) { peek.style.transform = from; peek.style.opacity = '0.4'; }
        document.body.append(peek);
        current = { img, peek, from };
        if (!still.matches) requestAnimationFrame(() => requestAnimationFrame(() => { peek.style.transform = 'none'; peek.style.opacity = '1'; }));
    }

    document.addEventListener('pointerover', event => {
        if (!mouse.matches || event.pointerType !== 'mouse') return;
        const img = event.target.closest?.(PICTURES);
        if (!img) return;
        clearTimeout(timer);
        timer = setTimeout(() => open(img), 140); // мышь просто пролетела мимо — не мигаем
    });
    document.addEventListener('pointerout', event => {
        const img = event.target.closest?.(PICTURES);
        if (!img || img.contains(event.relatedTarget)) return;
        clearTimeout(timer);
        if (current?.img === img) close(false);
    });
    window.addEventListener('scroll', () => close(true), { passive: true });
    window.addEventListener('resize', () => close(true));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
    document.addEventListener('click', () => close(true), true); // кнопки окна под копией — копия не мешает
}
