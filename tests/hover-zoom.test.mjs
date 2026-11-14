// Фото продукта под мышью растёт по-настоящему (правило владельца, 14.11.2026): портрет и квадрат ≈ 2,5×,
// широкое ≈ 3×, целиком и внутри окна. Проверяем расчёт места из js/ui/hoverZoom.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { peekBox } from '../js/ui/hoverZoom.js';

const view = { width: 1366, height: 900 };
const near = (a, b) => Math.abs(a - b) < 1e-9;

test('квадратное фото 80×80 в окне сканера вырастает до 200×200 по центру себя', () => {
    const rect = { left: 600, top: 300, width: 80, height: 80 };
    const box = peekBox(rect, 1, view);
    assert.ok(near(box.width, 200) && near(box.height, 200));
    assert.ok(near(box.left + box.width / 2, rect.left + rect.width / 2));
});

test('высокая упаковка — ×2,5 по ширине, пропорции сохранены', () => {
    const box = peekBox({ left: 600, top: 300, width: 80, height: 80 }, 0.6, view);
    assert.ok(near(box.width, 200));
    assert.ok(near(box.width / box.height, 0.6), 'ничего не обрезано');
});

test('широкое фото растёт в 3 раза', () => {
    const box = peekBox({ left: 500, top: 300, width: 80, height: 80 }, 1.6, view);
    assert.ok(near(box.width, 240));
});

test('на телефоне копия не вылезает за экран', () => {
    const phone = { width: 390, height: 844 };
    const box = peekBox({ left: 2, top: 830, width: 160, height: 160 }, 0.5, phone);
    assert.ok(box.left >= 14 && box.top >= 14);
    assert.ok(box.left + box.width <= phone.width - 14 + 1e-9 && box.top + box.height <= phone.height - 14 + 1e-9);
});
