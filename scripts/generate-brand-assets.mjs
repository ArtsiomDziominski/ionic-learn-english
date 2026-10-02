/**
 * Иконки и заставки с Лекси из того же кода, что рисует персонажа
 * в приложении (src/art/lexi.ts) — без исходников в графическом
 * редакторе.
 *
 *   npm run generate:brand    # этот скрипт: resources/* и фавиконки
 *   npm run generate:assets   # @capacitor/assets раскладывает resources/* по Android и PWA
 *
 * Создаёт исходники для режима полного контроля @capacitor/assets:
 *   resources/icon-only.png        1024², непрозрачная иконка (обычные иконки, PWA)
 *   resources/icon-foreground.png  1024², мордочка на прозрачном фоне (adaptive icon)
 *   resources/icon-background.png  1024², фирменный фиолетовый фон (adaptive icon)
 *   resources/splash.png           2732², заставка светлой темы
 *   resources/splash-dark.png      2732², заставка тёмной темы
 * и фавиконки сайта:
 *   public/favicon.png             512², мордочка на скруглённом фиолетовом квадрате
 *   public/favicon.ico             48² (PNG внутри ICO — так его понимают все браузеры и Яндекс)
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FULL_VIEWBOX, HEAD_VIEWBOX, renderLexi } from '../src/art/lexi.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIOLET_TOP = '#9579FF';
const VIOLET = '#7C5CFF';
const VIOLET_SHADE = '#5B3BE0';
const DARK_BG = '#131022';

/** Вписывает SVG персонажа в квадрат size×size с отступом и фоном. */
function frame(inner, { size, viewBox, pad, background }) {
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
  const box = size - pad * 2;
  const scale = Math.min(box / vw, box / vh);
  const w = vw * scale;
  const h = vh * scale;
  const x = (size - w) / 2;
  const y = (size - h) / 2;
  const body = inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (background ?? '') +
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vx} ${vy} ${vw} ${vh}">${body}</svg>` +
    '</svg>';
}

const gradient = '<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">' +
  `<stop offset="0" stop-color="${VIOLET_TOP}"/><stop offset="1" stop-color="${VIOLET}"/></linearGradient></defs>`;

/** Фон на весь квадрат — лаунчер сам скругляет иконку своей маской. */
const fullBleed = (size) => `${gradient}<rect width="${size}" height="${size}" fill="url(#bg)"/>`;

/** Скруглённый квадрат с «объёмной» нижней гранью — для фавиконки. */
const rounded = (size) =>
  gradient +
  `<rect x="0" y="${size * 0.02}" width="${size}" height="${size * 0.98}" rx="${size * 0.22}" fill="${VIOLET_SHADE}"/>` +
  `<rect width="${size}" height="${size * 0.96}" rx="${size * 0.22}" fill="url(#bg)"/>`;

const solid = (size, color) => `<rect width="${size}" height="${size}" fill="${color}"/>`;

async function png(svg, file) {
  const out = await sharp(Buffer.from(svg)).png().toBuffer();
  writeFileSync(join(root, file), out);
  console.log('✓', file, `${Math.round(out.length / 1024)} КБ`);
  return out;
}

/** ICO-контейнер с одной PNG-картинкой внутри. */
function ico(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

const head = renderLexi({ crop: 'head', mood: 'idle', uid: 'icon', shadow: false });
const wave = renderLexi({ view: 'front', mood: 'wave', uid: 'splash', shadow: true });

// Иконка приложения
await png(frame(head, { size: 1024, viewBox: HEAD_VIEWBOX, pad: 190, background: fullBleed(1024) }), 'resources/icon-only.png');
// Adaptive icon: мордочка в безопасной зоне, фон отдельным слоем
await png(frame(head, { size: 1024, viewBox: HEAD_VIEWBOX, pad: 110 }), 'resources/icon-foreground.png');
await png(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${fullBleed(1024)}</svg>`, 'resources/icon-background.png');

// Заставки: Лекси машет лапой — светлая и тёмная
await png(frame(wave, { size: 2732, viewBox: FULL_VIEWBOX, pad: 950, background: solid(2732, '#FFFFFF') }), 'resources/splash.png');
await png(frame(wave, { size: 2732, viewBox: FULL_VIEWBOX, pad: 950, background: solid(2732, DARK_BG) }), 'resources/splash-dark.png');

// Фавиконки сайта
await png(frame(head, { size: 512, viewBox: HEAD_VIEWBOX, pad: 70, background: rounded(512) }), 'public/favicon.png');
const small = await sharp(Buffer.from(frame(head, { size: 48, viewBox: HEAD_VIEWBOX, pad: 5, background: rounded(48) }))).png().toBuffer();
writeFileSync(join(root, 'public/favicon.ico'), ico(small, 48));
console.log('✓ public/favicon.ico');
