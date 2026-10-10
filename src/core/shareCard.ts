/**
 * Карточка «Мой прогресс» для соцсетей и мессенджеров.
 *
 * Рисуется на canvas из тех же SVG, что и интерфейс (Лекси и
 * игровые иконки), поэтому выглядит как часть приложения и не
 * требует сервера. Формат 4:5 — хорошо смотрится в историях и ленте.
 */
import { renderLexi } from '@/art/lexi';
import { gameIconSvg, type GameIconName } from '@/art/icons';
import { plural } from './dates';

export interface ShareCardData {
  name: string;
  streak: number;
  xp: number;
  words: number;
  level: string;
}

const W = 1080;
const H = 1350;
const FONT = '"Nunito Variable", Nunito, system-ui, sans-serif';

function svgImage(svg: string, size: number): Promise<HTMLImageElement> {
  // Повторный width/height делает SVG невалидным XML — добавляем, только если их нет
  const openTag = svg.slice(0, svg.indexOf('>'));
  const sized = /\swidth=/.test(openTag) ? svg : svg.replace('<svg ', `<svg width="${size}" height="${size}" `);
  const img = new Image();
  img.decoding = 'async';
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  return img.decode().then(() => img);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function ensureFonts(): Promise<void> {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`900 64px ${FONT}`, 'learnenglisheasy.ru 123'),
      document.fonts.load(`700 32px ${FONT}`, 'дней подряд'),
    ]);
  } catch {
    /* без шрифта карточка всё равно нарисуется системным */
  }
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas недоступен');

  // Фон: фирменный фиолетовый с мягкими кругами
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#8B6BFF');
  bg.addColorStop(1, '#4E2FD2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (const [x, y, r] of [[160, 220, 260], [980, 380, 200], [880, 1180, 300], [60, 1060, 160]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 60px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('learnenglisheasy.ru', 72, 120);
  ctx.font = `700 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Учу английский каждый день', 72, 172);

  // Уровень — плашка справа сверху
  ctx.font = `900 36px ${FONT}`;
  const levelW = ctx.measureText(data.level).width + 56;
  roundRect(ctx, W - 72 - levelW, 76, levelW, 72, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(data.level, W - 72 - levelW / 2, 125);

  // Лекси радуется
  const mascot = await svgImage(renderLexi({ view: 'front', mood: 'cheer', uid: 'share', shadow: true }), 600);
  ctx.drawImage(mascot, (W - 600) / 2, 190, 600, 600);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 66px ${FONT}`;
  ctx.fillText(data.name, W / 2, 870, W - 144);

  // Три показателя
  const stats: Array<{ icon: GameIconName; value: string; label: string }> = [
    { icon: 'flame', value: String(data.streak), label: plural(data.streak, 'день подряд', 'дня подряд', 'дней подряд') },
    { icon: 'bolt', value: String(data.xp), label: 'очков опыта' },
    { icon: 'book', value: String(data.words), label: plural(data.words, 'слово', 'слова', 'слов') },
  ];
  const cardW = 292;
  const gap = 30;
  const startX = (W - (cardW * 3 + gap * 2)) / 2;
  const cardY = 930;
  const icons = await Promise.all(stats.map((s) => svgImage(gameIconSvg(s.icon, 84), 84)));
  stats.forEach((s, i) => {
    const x = startX + i * (cardW + gap);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    roundRect(ctx, x, cardY + 10, cardW, 250, 40);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, x, cardY, cardW, 250, 40);
    ctx.fill();
    ctx.drawImage(icons[i], x + (cardW - 84) / 2, cardY + 26, 84, 84);
    ctx.fillStyle = '#2E2A44';
    ctx.font = `900 64px ${FONT}`;
    ctx.fillText(s.value, x + cardW / 2, cardY + 176, cardW - 24);
    ctx.fillStyle = '#6B6585';
    ctx.font = `700 28px ${FONT}`;
    ctx.fillText(s.label, x + cardW / 2, cardY + 218, cardW - 24);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `800 34px ${FONT}`;
  ctx.fillText('Присоединяйся: learnenglisheasy.ru', W / 2, H - 70);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Не удалось создать картинку'))), 'image/png');
  });
}
