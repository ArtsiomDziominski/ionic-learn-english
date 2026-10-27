/**
 * Графика для страницы приложения в Google Play — из того же кода,
 * что рисует Лекси в приложении (src/art/lexi.ts).
 *
 *   npm run generate:store
 *
 * Создаёт:
 *   store/icon-512.png            512², значок приложения (32-bit PNG, требование Play)
 *   store/feature-graphic.png     1024×500, баннер «Рекомендуемое изображение»
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FULL_VIEWBOX, HEAD_VIEWBOX, renderLexi } from '../src/art/lexi.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIOLET_TOP = '#9579FF';
const VIOLET = '#7C5CFF';
const VIOLET_DEEP = '#5B3BE0';

/** Кладёт SVG персонажа в прямоугольник x,y,w,h с сохранением пропорций. */
function place(inner, viewBox, x, y, w, h) {
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
  const scale = Math.min(w / vw, h / vh);
  const sw = vw * scale;
  const sh = vh * scale;
  const body = inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg x="${x + (w - sw) / 2}" y="${y + (h - sh) / 2}" width="${sw}" height="${sh}" viewBox="${vx} ${vy} ${vw} ${vh}">${body}</svg>`;
}

async function png(svg, file) {
  const out = await sharp(Buffer.from(svg)).flatten({ background: VIOLET }).png().toBuffer();
  writeFileSync(join(root, file), out);
  console.log('✓', file, `${Math.round(out.length / 1024)} КБ`);
}

mkdirSync(join(root, 'store'), { recursive: true });

const head = renderLexi({ crop: 'head', mood: 'idle', uid: 'storeicon', shadow: false });
const wave = renderLexi({ view: 'front', mood: 'wave', uid: 'storefg', shadow: true });

// Значок: Play сам скругляет углы, поэтому фон на весь квадрат
await png(
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
    `<stop offset="0" stop-color="${VIOLET_TOP}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient></defs>` +
    '<rect width="512" height="512" fill="url(#bg)"/>' +
    place(head, HEAD_VIEWBOX, 95, 95, 322, 322) +
    '</svg>',
  'store/icon-512.png',
);

// Баннер: текст слева, Лекси справа. Важное держим подальше от краёв —
// Play может обрезать баннер и накладывать на него кнопку видео.
const font = "'Segoe UI', 'Arial', sans-serif";
await png(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">' +
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">' +
    `<stop offset="0" stop-color="${VIOLET_TOP}"/><stop offset="0.6" stop-color="${VIOLET}"/><stop offset="1" stop-color="${VIOLET_DEEP}"/></linearGradient></defs>` +
    '<rect width="1024" height="500" fill="url(#bg)"/>' +
    '<circle cx="800" cy="250" r="210" fill="#FFFFFF" fill-opacity="0.12"/>' +
    '<circle cx="800" cy="250" r="150" fill="#FFFFFF" fill-opacity="0.10"/>' +
    place(wave, FULL_VIEWBOX, 630, 70, 340, 360) +
    `<text x="80" y="215" font-family="${font}" font-size="64" font-weight="800" fill="#FFFFFF">LearnEnglishEasy</text>` +
    `<text x="82" y="280" font-family="${font}" font-size="34" font-weight="600" fill="#FFFFFF" fill-opacity="0.92">Английские слова каждый день</text>` +
    `<text x="82" y="330" font-family="${font}" font-size="28" fill="#FFFFFF" fill-opacity="0.8">Короткие уроки · серии · награды</text>` +
    '</svg>',
  'store/feature-graphic.png',
);
