/**
 * Лекси — талисман Слова.Day: лисёнок-лингвист в фиолетовом шарфе.
 *
 * Персонаж собирается из SVG-примитивов, а не из картинок:
 *  - один и тот же код рисует его в приложении, на карточке
 *    «Поделиться» (canvas) и в скриптах генерации PNG (Node);
 *  - части тела — отдельные группы с классами lx-*, поэтому
 *    анимации (моргание, хвост, взмах лапой) задаёт CSS
 *    в theme/mascot.css, а не JS;
 *  - цвета заданы атрибутами, без CSS-переменных: SVG остаётся
 *    самодостаточным и одинаково выглядит в любой теме и вне DOM.
 *
 * Файл намеренно без enum и прочего несотрираемого TS-синтаксиса:
 * его импортирует и Vite, и Node со встроенным снятием типов.
 */

export type LexiView = 'front' | 'threeQuarter' | 'side' | 'back';

export type LexiMood =
  | 'idle'
  | 'happy'
  | 'cheer'
  | 'sad'
  | 'think'
  | 'wave'
  | 'sleep'
  | 'talk'
  | 'wow'
  | 'run'
  | 'read';

export interface LexiOptions {
  view?: LexiView;
  mood?: LexiMood;
  /** Отразить по горизонтали (смотрит в другую сторону). */
  flip?: boolean;
  /** Тень под персонажем. */
  shadow?: boolean;
  /** 'head' — только голова, для аватаров и иконок. */
  crop?: 'full' | 'head';
  /** Префикс id градиентов; нужен уникальный на каждый SVG в документе. */
  uid?: string;
  /** Подпись для скринридеров. */
  title?: string;
}

export const LEXI_COLORS = {
  furTop: '#FFB46A',
  fur: '#FF8A3D',
  furBottom: '#EC6A2B',
  furDark: '#D95A22',
  furShadow: '#B9471A',
  cream: '#FFF8EE',
  creamShade: '#F7E1C8',
  dark: '#3A2219',
  darkSoft: '#5B3526',
  innerEar: '#7A3B26',
  eye: '#2A170F',
  blush: '#FF6F8E',
  mouth: '#7C2633',
  tongue: '#FF7F8F',
  scarfTop: '#9B7BFF',
  scarf: '#7C5CFF',
  scarfDark: '#5B3BE0',
  stripe: '#FFC83D',
  tear: '#6EC4FF',
  zzz: '#8C9BFF',
  sparkle: '#FFC83D',
  bookCover: '#1CB0F6',
  bookCoverDark: '#1592D0',
  bookPage: '#FFFFFF',
} as const;

const P = LEXI_COLORS;

let instanceCounter = 0;

/* ——— Утилиты ——————————————————————————————————————————— */

/**
 * Зеркалит абсолютный SVG-путь относительно вертикали x = cx.
 * Поддерживает команды M, L, C, Q, Z с абсолютными координатами —
 * этого хватает для всех форм персонажа. Так симметричные детали
 * (уши, лапы, хвост) описываются один раз.
 */
export function mirrorPath(d: string, cx = 120): string {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/gi) ?? [];
  const out: string[] = [];
  let isX = true;
  for (const t of tokens) {
    if (/[MLCQZ]/i.test(t)) {
      out.push(t);
      isX = true;
      continue;
    }
    const n = Number(t);
    out.push(String(isX ? round(2 * cx - n) : n));
    isX = !isX;
  }
  return out.join(' ');
}

const round = (n: number): number => Math.round(n * 100) / 100;

type Attrs = Record<string, string | number | undefined>;

const attrs = (o: Attrs): string =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

const path = (d: string, fill: string, extra: Attrs = {}): string => `<path ${attrs({ d, fill, ...extra })}/>`;

const stroke = (d: string, color: string, width: number, extra: Attrs = {}): string =>
  `<path ${attrs({ d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra })}/>`;

const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, extra: Attrs = {}): string =>
  `<ellipse ${attrs({ cx, cy, rx, ry, fill, ...extra })}/>`;

const g = (cls: string, inner: string, extra: Attrs = {}): string =>
  `<g ${attrs({ class: cls || undefined, ...extra })}>${inner}</g>`;

const clip = (id: string, d: string): string => `<clipPath id="${id}">${path(d, '#000')}</clipPath>`;

/** Четырёхлучевая звёздочка для эффектов. */
const sparkle = (x: number, y: number, r: number, cls: string): string => {
  const k = r * 0.2;
  return g(cls, path(
    `M${x} ${y - r} C ${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y} C ${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r} ` +
    `C ${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y} C ${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r} Z`,
    P.sparkle,
  ));
};

/* ——— Градиенты ———————————————————————————————————————— */

function defs(u: string): string {
  return `<defs>
    <linearGradient id="${u}-fur" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.furTop}"/>
      <stop offset="0.5" stop-color="${P.fur}"/>
      <stop offset="1" stop-color="${P.furBottom}"/>
    </linearGradient>
    <linearGradient id="${u}-arm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.fur}"/>
      <stop offset="1" stop-color="${P.furDark}"/>
    </linearGradient>
    <linearGradient id="${u}-tail" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${P.furDark}"/>
      <stop offset="0.55" stop-color="${P.fur}"/>
      <stop offset="1" stop-color="${P.furTop}"/>
    </linearGradient>
    <linearGradient id="${u}-cream" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.cream}"/>
      <stop offset="1" stop-color="${P.creamShade}"/>
    </linearGradient>
    <linearGradient id="${u}-scarf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.scarfTop}"/>
      <stop offset="1" stop-color="${P.scarfDark}"/>
    </linearGradient>
  </defs>`;
}

/* ——— Общие детали ————————————————————————————————————— */

interface Ctx {
  u: string;
  mood: LexiMood;
  fur: string;
  tail: string;
  cream: string;
  scarf: string;
  arm: string;
}

interface ArmOpts {
  len?: number;
  /** Без блика на лапе — когда она что-то держит. */
  holding?: boolean;
}

/**
 * Лапа-рука: капсула с тёмной «перчаткой» и тенью на теле.
 * Начало координат — плечо: внешняя группа ставит лапу на место,
 * внутренняя (lx-arm) остаётся свободной для CSS-анимации.
 */
function arm(ctx: Ctx, x: number, y: number, angle: number, cls: string, opts: ArmOpts = {}): string {
  const len = opts.len ?? 32;
  const shape =
    `<rect x="-6" y="-2" width="17" height="${len + 4}" rx="8.5" fill="${P.furShadow}" opacity="0.32"/>` +
    `<rect x="-8.5" y="-6" width="17" height="${len + 4}" rx="8.5" fill="${ctx.arm}"/>` +
    ellipse(0, len, 9.8, 9.2, P.dark) +
    (opts.holding ? '' : ellipse(-2.6, len - 2.6, 2.8, 1.7, '#fff', { opacity: 0.2 }));
  return g('', g(`lx-arm ${cls}`, shape), { transform: `translate(${x} ${y}) rotate(${angle})` });
}

function shadow(): string {
  return ellipse(120, 229, 56, 7, '#1B0F35', { class: 'lx-shadow', opacity: 0.14 });
}

/**
 * Хвост: пышная «кисть», обвитая вокруг лап. Белый кончик —
 * область за зубчатой линией, обрезанная по контуру хвоста:
 * зубцы читаются как шерсть, а не как приклеенный круг.
 */
const TAIL_FRONT =
  'M146 214 C 182 225 222 211 231 180 C 236 164 234 148 224 134 ' +
  'C 222 152 213 166 198 173 C 182 180 164 184 150 190 Z';
const TAIL_TIP_FRONT =
  'M196 96 L 248 96 L 248 156 L 240 153 L 235 160 L 229 153 L 223 160 L 217 153 L 211 160 L 205 153 L 196 156 Z';

function tail(ctx: Ctx, d: string, tip: string, id: string): string {
  return g('lx-tail', clip(id, d) + path(d, ctx.tail) + path(tip, ctx.cream, { 'clip-path': `url(#${id})` }));
}

function book(x: number, y: number): string {
  return g('lx-book',
    path(`M${x - 34} ${y - 2} L ${x} ${y + 5} L ${x + 34} ${y - 2} L ${x + 34} ${y + 26} L ${x} ${y + 33} L ${x - 34} ${y + 26} Z`, P.bookCoverDark) +
    path(`M${x - 31} ${y - 6} C ${x - 18} ${y - 9} ${x - 7} ${y - 6} ${x} ${y} L ${x} ${y + 27} C ${x - 7} ${y + 21} ${x - 18} ${y + 19} ${x - 31} ${y + 21} Z`, P.bookPage) +
    path(`M${x + 31} ${y - 6} C ${x + 18} ${y - 9} ${x + 7} ${y - 6} ${x} ${y} L ${x} ${y + 27} C ${x + 7} ${y + 21} ${x + 18} ${y + 19} ${x + 31} ${y + 21} Z`, '#EEF3FF') +
    stroke(`M${x - 25} ${y + 2} L ${x - 7} ${y + 5} M ${x - 25} ${y + 9} L ${x - 7} ${y + 12} M ${x - 25} ${y + 16} L ${x - 12} ${y + 18}`, '#B9C6E6', 2) +
    stroke(`M${x + 7} ${y + 5} L ${x + 25} ${y + 2} M ${x + 7} ${y + 12} L ${x + 25} ${y + 9}`, '#B9C6E6', 2));
}

/* ——— Лицо (анфас и вполоборота) ———————————————————————— */

function eyes(ctx: Ctx, lx: number, rx: number, y: number, farScale = 1): string {
  const mood = ctx.mood;
  const one = (x: number, scale: number): string => {
    const w = 12 * scale;
    if (mood === 'happy' || mood === 'cheer' || mood === 'wave') {
      return stroke(`M${x - w} ${y + 3} Q ${x} ${y - 12} ${x + w} ${y + 3}`, P.eye, 4.6);
    }
    if (mood === 'sleep') {
      return stroke(`M${x - w} ${y} Q ${x} ${y + 8} ${x + w} ${y}`, P.eye, 4.2);
    }
    const big = mood === 'wow' ? 1.12 : 1;
    const ry = (mood === 'sad' ? 13.2 : 14.5) * big;
    // При чтении взгляд опущен — блики уходят вниз
    const look = mood === 'read' ? 3 : mood === 'think' ? -2 : 0;
    return (
      ellipse(x, y, w * big, ry, P.eye) +
      ellipse(x + 4.5 * scale, y - 5.5 + look, 4.8 * big * scale, 4.8 * big, '#fff') +
      ellipse(x - 4 * scale, y + 6.5 + look, 2.2 * scale, 2.2, '#fff', { opacity: 0.9 })
    );
  };
  const blinkable = !['happy', 'cheer', 'wave', 'sleep'].includes(mood);
  return g(blinkable ? 'lx-eyes lx-blink' : 'lx-eyes', one(lx, 1) + one(rx, farScale));
}

function brows(ctx: Ctx, lx: number, rx: number, y: number): string {
  switch (ctx.mood) {
    case 'sad':
      return stroke(`M${lx - 12} ${y - 15} Q ${lx} ${y - 22} ${lx + 10} ${y - 25}`, P.darkSoft, 3.4) +
        stroke(`M${rx + 12} ${y - 15} Q ${rx} ${y - 22} ${rx - 10} ${y - 25}`, P.darkSoft, 3.4);
    case 'think':
      return stroke(`M${lx - 11} ${y - 21} Q ${lx} ${y - 25} ${lx + 10} ${y - 21}`, P.darkSoft, 3.2) +
        stroke(`M${rx - 10} ${y - 26} Q ${rx} ${y - 32} ${rx + 11} ${y - 27}`, P.darkSoft, 3.2);
    case 'wow':
      return stroke(`M${lx - 10} ${y - 26} Q ${lx} ${y - 31} ${lx + 10} ${y - 26}`, P.darkSoft, 3.2) +
        stroke(`M${rx - 10} ${y - 26} Q ${rx} ${y - 31} ${rx + 10} ${y - 26}`, P.darkSoft, 3.2);
    default:
      return '';
  }
}

function mouth(ctx: Ctx, x: number, y: number): string {
  switch (ctx.mood) {
    case 'happy':
    case 'cheer':
    case 'wave':
      return g('lx-mouth',
        path(`M${x - 11} ${y - 2} C ${x - 9} ${y + 14} ${x + 9} ${y + 14} ${x + 11} ${y - 2} C ${x + 4} ${y + 1} ${x - 4} ${y + 1} ${x - 11} ${y - 2} Z`, P.mouth) +
        path(`M${x - 6} ${y + 8} C ${x - 3} ${y + 4} ${x + 3} ${y + 4} ${x + 6} ${y + 8} C ${x + 3} ${y + 11} ${x - 3} ${y + 11} ${x - 6} ${y + 8} Z`, P.tongue));
    case 'talk':
      return g('lx-mouth lx-talk', ellipse(x, y + 3, 7, 6, P.mouth) + ellipse(x, y + 6, 4.5, 2.6, P.tongue));
    case 'sad':
      return stroke(`M${x - 8} ${y + 5} Q ${x} ${y - 2} ${x + 8} ${y + 5}`, P.eye, 2.8);
    case 'think':
      return stroke(`M${x - 3} ${y + 2} Q ${x + 4} ${y} ${x + 9} ${y + 3}`, P.eye, 2.8);
    case 'sleep':
      return ellipse(x, y + 3, 3.4, 4, P.mouth);
    case 'wow':
      return ellipse(x, y + 4, 5.5, 7, P.mouth);
    default:
      return stroke(`M${x - 10} ${y} C ${x - 7} ${y + 5} ${x - 2} ${y + 5} ${x} ${y - 1} C ${x + 2} ${y + 5} ${x + 7} ${y + 5} ${x + 10} ${y}`, P.eye, 2.7);
  }
}

function nose(x: number, y: number, w = 8): string {
  return path(`M${x - w} ${y - 3} C ${x - w} ${y - 7} ${x + w} ${y - 7} ${x + w} ${y - 3} C ${x + w} ${y + 1} ${x + 2} ${y + 5} ${x} ${y + 5} C ${x - 2} ${y + 5} ${x - w} ${y + 1} ${x - w} ${y - 3} Z`, P.dark) +
    ellipse(x - 2.5, y - 3.2, 2.4, 1.3, '#fff', { opacity: 0.45 });
}

function effects(ctx: Ctx, headTopY = 30): string {
  switch (ctx.mood) {
    case 'cheer':
      return sparkle(30, 50, 10, 'lx-fx lx-sparkle lx-sparkle-1') +
        sparkle(212, 40, 12, 'lx-fx lx-sparkle lx-sparkle-2') +
        sparkle(222, 98, 7, 'lx-fx lx-sparkle lx-sparkle-3') +
        sparkle(18, 104, 6, 'lx-fx lx-sparkle lx-sparkle-4');
    case 'sleep':
      return g('lx-fx lx-zzz',
        stroke('M170 34 L 182 34 L 170 46 L 182 46', P.zzz, 3.4) +
        stroke('M190 12 L 200 12 L 190 22 L 200 22', P.zzz, 2.8, { opacity: 0.8 }) +
        stroke('M206 -4 L 213 -4 L 206 3 L 213 3', P.zzz, 2.3, { opacity: 0.6 }));
    case 'sad':
      return path('M165 112 C 165 112 159 121 159 125 C 159 129 162 131 165 131 C 168 131 171 129 171 125 C 171 121 165 112 165 112 Z', P.tear, { class: 'lx-fx lx-tear' });
    case 'think':
      return g('lx-fx lx-question',
        ellipse(200, headTopY + 2, 18, 18, '#fff', { stroke: '#E4E1F5', 'stroke-width': 2 }) +
        ellipse(181, headTopY + 25, 5, 5, '#fff', { stroke: '#E4E1F5', 'stroke-width': 1.6 }) +
        stroke(`M194 ${headTopY - 3} C 194 ${headTopY - 10} 206 ${headTopY - 10} 206 ${headTopY - 3} C 206 ${headTopY + 2} 200 ${headTopY + 2} 200 ${headTopY + 7}`, P.scarf, 3.6) +
        ellipse(200, headTopY + 13.5, 2.3, 2.3, P.scarf));
    case 'wow':
      return sparkle(36, 44, 8, 'lx-fx lx-sparkle lx-sparkle-1') + sparkle(206, 40, 9, 'lx-fx lx-sparkle lx-sparkle-2');
    default:
      return '';
  }
}

/* ——— Анфас ————————————————————————————————————————————— */

const HEAD_FRONT =
  'M120 34 C 153 34 185 50 193 84 C 197 100 201 112 211 122 C 197 124 187 127 179 131 ' +
  'C 167 147 145 157 120 157 C 95 157 73 147 61 131 C 53 127 43 124 29 122 ' +
  'C 39 112 43 100 47 84 C 55 50 87 34 120 34 Z';

const EAR_FRONT_L = 'M57 76 C 47 52 45 26 53 6 C 74 11 96 28 107 47 Z';
const EAR_INNER_L = 'M66 64 C 61 46 60 31 62 20 C 76 27 88 38 96 49 Z';
const EAR_FLUFF_L = 'M68 63 C 70 54 76 48 84 46 C 80 52 79 57 80 64 Z';

/** Кремовая маска: щёки и мордочка, обрезается по контуру головы. */
const MASK_FRONT =
  'M22 120 C 44 108 70 105 92 113 C 104 117 112 118 120 110 C 128 118 136 117 148 113 ' +
  'C 170 105 196 108 218 120 L 218 176 L 22 176 Z';

const BODY_FRONT = 'M120 138 C 151 138 167 166 167 192 C 167 212 149 223 120 223 C 91 223 73 212 73 192 C 73 166 89 138 120 138 Z';
const BELLY_FRONT = 'M120 163 C 138 163 149 178 149 195 C 149 209 137 217 120 217 C 103 217 91 209 91 195 C 91 178 102 163 120 163 Z';

function ear(ctx: Ctx, side: 'l' | 'r', droop: number, transform?: string): string {
  const m = (d: string): string => (side === 'l' ? d : mirrorPath(d));
  const id = `${ctx.u}-ear-${side}`;
  const pivotX = side === 'l' ? 80 : 160;
  const rot = side === 'l' ? -droop : droop;
  const parts = [
    clip(id, m(EAR_FRONT_L)),
    path(m(EAR_FRONT_L), ctx.fur),
    `<rect x="${side === 'l' ? 36 : 124}" y="0" width="80" height="24" fill="${P.dark}" clip-path="url(#${id})"/>`,
    path(m(EAR_INNER_L), P.innerEar),
    path(m(EAR_FLUFF_L), P.cream),
  ].join('');
  const tr = [transform, droop ? `rotate(${rot} ${pivotX} 62)` : ''].filter(Boolean).join(' ');
  return g(`lx-ear lx-ear-${side}`, parts, tr ? { transform: tr } : {});
}

function scarf(ctx: Ctx, knotX: number): string {
  return g('lx-scarf',
    path('M79 145 C 98 159 142 159 161 145 C 165 150 167 155 167 160 C 147 176 93 176 73 160 C 73 155 75 150 79 145 Z', ctx.scarf) +
    stroke('M76 153 C 96 167 144 167 164 153', P.stripe, 3) +
    g('lx-scarf-end',
      path(`M${knotX - 6} 166 L ${knotX + 8} 164 L ${knotX + 17} 198 C ${knotX + 12} 202 ${knotX + 4} 204 ${knotX - 1} 201 Z`, P.scarfDark) +
      stroke(`M${knotX + 1} 188 L ${knotX + 14} 185`, P.stripe, 3) +
      stroke(`M${knotX} 201 L ${knotX - 1} 206 M ${knotX + 6} 203 L ${knotX + 6} 208 M ${knotX + 12} 202 L ${knotX + 14} 207`, P.scarfDark, 2.4)) +
    ellipse(knotX + 1, 166, 8, 7, ctx.scarf));
}

function feet(leftX: number, rightX: number, rightColor: string = P.dark, rightScale = 1): string {
  return g('lx-feet',
    ellipse(leftX, 221, 17, 9, P.dark) + ellipse(rightX, 221 - (1 - rightScale) * 10, 17 * rightScale, 9 * rightScale, rightColor) +
    ellipse(leftX - 5, 218, 6, 2.4, '#fff', { opacity: 0.16 }) +
    ellipse(rightX - 5, 218, 6 * rightScale, 2.4, '#fff', { opacity: 0.16 }));
}

/** Лапы анфас: под головой (обычно) и поверх неё (поднятые). */
function frontArms(ctx: Ctx): { under: string; over: string } {
  switch (ctx.mood) {
    case 'cheer':
      return { under: '', over: arm(ctx, 84, 162, 146, 'lx-arm-l lx-arm-up', { len: 40 }) + arm(ctx, 156, 162, -146, 'lx-arm-r lx-arm-up', { len: 40 }) };
    case 'wave':
      return { under: arm(ctx, 86, 168, 22, 'lx-arm-l'), over: arm(ctx, 158, 164, -128, 'lx-arm-r lx-arm-wave', { len: 38 }) };
    case 'think':
      return { under: arm(ctx, 86, 168, 22, 'lx-arm-l'), over: arm(ctx, 156, 168, 126, 'lx-arm-r', { len: 30 }) };
    case 'happy':
      return { under: arm(ctx, 84, 166, 42, 'lx-arm-l') + arm(ctx, 156, 166, -42, 'lx-arm-r'), over: '' };
    case 'sad':
      return { under: arm(ctx, 90, 168, 8, 'lx-arm-l') + arm(ctx, 150, 168, -8, 'lx-arm-r'), over: '' };
    case 'read':
      return { under: arm(ctx, 88, 166, -32, 'lx-arm-l', { holding: true, len: 30 }) + arm(ctx, 152, 166, 32, 'lx-arm-r', { holding: true, len: 30 }), over: '' };
    default:
      return { under: arm(ctx, 86, 168, 22, 'lx-arm-l') + arm(ctx, 154, 168, -22, 'lx-arm-r'), over: '' };
  }
}

function renderFront(ctx: Ctx, headOnly = false): string {
  const droop = ctx.mood === 'sad' ? 26 : ctx.mood === 'sleep' ? 12 : 0;
  const arms = frontArms(ctx);
  const headClip = `${ctx.u}-head`;
  const eyeY = ctx.mood === 'think' ? 98 : 100;
  const reading = ctx.mood === 'read';

  const head = g('lx-head',
    ear(ctx, 'l', droop) + ear(ctx, 'r', droop) +
    clip(headClip, HEAD_FRONT) +
    path(HEAD_FRONT, ctx.fur) +
    path(MASK_FRONT, ctx.cream, { 'clip-path': `url(#${headClip})` }) +
    ellipse(94, 52, 18, 8, '#fff', { opacity: 0.2, transform: 'rotate(-18 94 52)' }) +
    ellipse(75, 121, 9.5, 5.5, P.blush, { opacity: 0.5 }) +
    ellipse(165, 121, 9.5, 5.5, P.blush, { opacity: 0.5 }) +
    eyes(ctx, 92, 148, eyeY) +
    brows(ctx, 92, 148, eyeY) +
    nose(120, 121) +
    mouth(ctx, 120, 132));

  // Для аватара и иконки — одна голова: без шарфа и хвоста, торчащих снизу
  if (headOnly) return g('lx-body-wrap', head);

  return g('lx-body-wrap',
    tail(ctx, TAIL_FRONT, TAIL_TIP_FRONT, `${ctx.u}-tailclip`) +
    feet(100, 140) +
    path(BODY_FRONT, ctx.fur) +
    path(BELLY_FRONT, ctx.cream) +
    scarf(ctx, 138) +
    (reading ? book(120, 186) : '') +
    arms.under +
    head +
    arms.over +
    effects(ctx));
}

/* ——— Вполоборота (смотрит вправо) ——————————————————————— */

const HEAD_TQ =
  'M118 34 C 152 34 184 50 192 84 C 196 98 199 108 205 116 C 197 120 189 125 182 130 ' +
  'C 170 147 148 157 124 157 C 98 157 74 147 61 131 C 52 127 40 124 25 122 ' +
  'C 36 112 41 100 45 84 C 53 51 85 34 118 34 Z';

const MASK_TQ =
  'M16 120 C 42 108 72 106 100 114 C 116 118 134 120 146 111 C 152 118 160 118 168 114 ' +
  'C 182 108 198 108 222 116 L 222 176 L 16 176 Z';

function renderThreeQuarter(ctx: Ctx): string {
  const droop = ctx.mood === 'sad' ? 22 : 0;
  const headClip = `${ctx.u}-headtq`;
  const mood = ctx.mood;

  const farArm = mood === 'wave' || mood === 'talk' ? '' : arm(ctx, 158, 168, -18, 'lx-arm-r');
  const nearArm = arm(ctx, 92, 168, 20, 'lx-arm-l');
  const overArm = mood === 'wave'
    ? arm(ctx, 160, 162, -128, 'lx-arm-r lx-arm-wave', { len: 38 })
    : mood === 'talk'
      ? arm(ctx, 160, 164, -100, 'lx-arm-r lx-arm-point', { len: 36 })
      : '';

  const tailD = mirrorPath(TAIL_FRONT);
  const tipD = mirrorPath(TAIL_TIP_FRONT);

  const head = g('lx-head',
    ear(ctx, 'r', droop, 'translate(38 5) scale(0.8 0.95)') +
    ear(ctx, 'l', droop, 'translate(5 0)') +
    clip(headClip, HEAD_TQ) +
    path(HEAD_TQ, ctx.fur) +
    path(MASK_TQ, ctx.cream, { 'clip-path': `url(#${headClip})` }) +
    ellipse(98, 52, 18, 8, '#fff', { opacity: 0.2, transform: 'rotate(-18 98 52)' }) +
    ellipse(84, 121, 9.5, 5.5, P.blush, { opacity: 0.5 }) +
    ellipse(178, 119, 6.5, 4.8, P.blush, { opacity: 0.45 }) +
    eyes(ctx, 108, 162, 100, 0.76) +
    brows(ctx, 108, 162, 100) +
    nose(148, 121, 7.5) +
    mouth(ctx, 146, 132));

  return g('lx-body-wrap',
    tail(ctx, tailD, tipD, `${ctx.u}-tailtq`) +
    farArm +
    feet(106, 142, P.darkSoft, 0.88) +
    path(BODY_FRONT, ctx.fur, { transform: 'translate(4 0)' }) +
    path(BELLY_FRONT, ctx.cream, { transform: 'translate(132 0) scale(0.92 1) translate(-120 0)' }) +
    scarf(ctx, 148) +
    nearArm +
    head +
    overArm +
    effects(ctx));
}

/* ——— Профиль (смотрит вправо) ——————————————————————————— */

const HEAD_SIDE =
  'M84 40 C 116 30 150 42 163 68 C 170 82 182 94 198 101 C 208 106 209 119 198 122 ' +
  'C 180 128 160 132 144 140 C 127 149 106 153 88 151 C 76 151 66 147 57 141 ' +
  'C 47 139 39 137 30 133 C 40 125 45 117 47 107 C 45 77 57 49 84 40 Z';

const MASK_SIDE =
  'M198 122 C 180 128 160 132 144 140 C 127 149 106 153 88 151 C 76 151 66 147 57 141 ' +
  'C 47 139 39 137 30 133 C 52 127 76 125 100 124 C 128 122 156 114 174 104 C 184 110 192 115 198 122 Z';

const EAR_SIDE = 'M78 54 C 70 32 72 14 82 0 C 98 11 112 27 118 44 Z';
const EAR_SIDE_FAR = 'M60 58 C 54 38 56 21 64 8 C 77 18 87 31 91 45 Z';

const TAIL_SIDE =
  'M88 206 C 58 215 24 204 15 177 C 10 161 12 146 21 132 ' +
  'C 24 149 34 161 50 167 C 64 172 78 176 92 186 Z';
const TAIL_TIP_SIDE =
  'M-8 100 L 60 100 L 60 152 L 52 149 L 46 156 L 40 149 L 34 156 L 28 149 L 22 156 L 16 149 L 10 156 L -8 152 Z';

function renderSide(ctx: Ctx): string {
  const running = ctx.mood === 'run';
  const happy = ctx.mood === 'happy' || ctx.mood === 'cheer' || running;
  const headClip = `${ctx.u}-heads`;
  const earClip = `${ctx.u}-ears`;

  const eye = happy && !running
    ? stroke('M128 92 Q 138 80 148 92', P.eye, 4.4)
    : ctx.mood === 'sleep'
      ? stroke('M128 90 Q 138 98 148 90', P.eye, 4)
      : g('lx-eyes lx-blink', ellipse(139, 90, 9.5, 13.5, P.eye) + ellipse(142.5, 84.5, 4, 4, '#fff') + ellipse(136, 96, 1.8, 1.8, '#fff', { opacity: 0.9 }));

  const legs = running
    ? g('lx-legs',
      g('', g('lx-leg lx-leg-far', `<rect x="-6" y="-2" width="12" height="20" rx="6" fill="${P.darkSoft}"/>` + ellipse(5, 18, 13, 7, P.darkSoft)), { transform: 'translate(102 200)' }) +
      g('', g('lx-leg lx-leg-near', `<rect x="-6.5" y="-2" width="13" height="20" rx="6.5" fill="${P.dark}"/>` + ellipse(5, 19, 14, 7.5, P.dark)), { transform: 'translate(124 201)' }))
    : g('lx-feet', ellipse(102, 221, 18, 8.5, P.darkSoft) + ellipse(124, 222, 19, 9, P.dark));

  const armAngle = running ? -40 : ctx.mood === 'wave' ? -150 : 12;
  const armCls = running ? 'lx-arm-r lx-arm-swing' : ctx.mood === 'wave' ? 'lx-arm-r lx-arm-wave' : 'lx-arm-r';

  return g('lx-body-wrap',
    tail(ctx, TAIL_SIDE, TAIL_TIP_SIDE, `${ctx.u}-tails`) +
    legs +
    path('M106 140 C 134 140 149 166 149 192 C 149 211 134 222 112 222 C 90 222 78 211 78 192 C 78 166 84 140 106 140 Z', ctx.fur) +
    path('M126 160 C 140 168 147 182 146 198 C 145 210 136 218 124 219 C 130 204 131 180 126 160 Z', ctx.cream) +
    g('lx-scarf',
      path('M78 148 C 96 160 128 160 146 146 C 150 151 151 156 150 161 C 130 176 96 176 76 162 C 75 157 76 152 78 148 Z', ctx.scarf) +
      stroke('M77 155 C 97 168 129 168 148 154', P.stripe, 3) +
      g('lx-scarf-end',
        path(running ? 'M82 152 C 66 150 50 144 36 133 L 31 146 C 47 156 64 162 80 165 Z' : 'M84 156 L 70 160 L 64 194 C 69 198 77 199 82 196 Z', P.scarfDark) +
        (running ? stroke('M60 150 L 52 158', P.stripe, 3) : ''))) +
    g('lx-head',
      path(EAR_SIDE_FAR, P.furDark) +
      clip(earClip, EAR_SIDE) +
      path(EAR_SIDE, ctx.fur) +
      `<rect x="60" y="-4" width="70" height="22" fill="${P.dark}" clip-path="url(#${earClip})"/>` +
      path('M86 46 C 82 32 84 20 88 12 C 98 20 106 30 110 40 Z', P.innerEar) +
      clip(headClip, HEAD_SIDE) +
      path(HEAD_SIDE, ctx.fur) +
      path(MASK_SIDE, ctx.cream, { 'clip-path': `url(#${headClip})` }) +
      ellipse(92, 56, 18, 8, '#fff', { opacity: 0.2, transform: 'rotate(-14 92 56)' }) +
      ellipse(128, 114, 9, 5, P.blush, { opacity: 0.45 }) +
      eye +
      path('M192 104 C 196 100 205 101 207 107 C 209 113 203 117 198 116 C 193 115 190 108 192 104 Z', P.dark) +
      (happy
        ? path('M190 122 C 184 132 172 134 166 128 C 174 128 182 126 190 122 Z', P.mouth)
        : stroke('M190 123 C 184 127 176 128 170 126', P.eye, 2.6))) +
    arm(ctx, 116, 166, armAngle, armCls) +
    effects(ctx, 34));
}

/* ——— Со спины ————————————————————————————————————————— */

const TAIL_BACK =
  'M114 216 C 150 226 188 210 198 178 C 204 158 200 138 186 120 ' +
  'C 186 140 178 156 164 166 C 150 176 130 182 112 194 Z';
const TAIL_TIP_BACK =
  'M160 90 L 240 90 L 240 142 L 232 139 L 226 146 L 220 139 L 214 146 L 208 139 L 202 146 L 196 139 L 190 146 L 184 139 L 176 143 L 160 143 Z';

function renderBack(ctx: Ctx): string {
  const clipL = `${ctx.u}-bear-l`;
  const clipR = `${ctx.u}-bear-r`;
  const earL = EAR_FRONT_L;
  const earR = mirrorPath(EAR_FRONT_L);
  const waving = ctx.mood === 'wave';
  /* Со спины хвост ближе к зрителю, чем опущенная лапа: она уходит
     под хвост. Поднятая лапа хвост не пересекает и рисуется поверх. */
  const rightArm = waving
    ? arm(ctx, 156, 162, -132, 'lx-arm-r lx-arm-wave', { len: 38 })
    : arm(ctx, 156, 168, -24, 'lx-arm-r');

  return g('lx-body-wrap',
    feet(102, 138) +
    arm(ctx, 84, 168, 24, 'lx-arm-l') +
    (waving ? '' : rightArm) +
    path(BODY_FRONT, ctx.fur) +
    path('M120 152 C 134 152 144 168 144 188 C 144 202 134 212 120 212 C 106 212 96 202 96 188 C 96 168 106 152 120 152 Z', '#fff', { opacity: 0.08 }) +
    g('lx-head',
      clip(clipL, earL) + clip(clipR, earR) +
      path(earL, ctx.fur) + path(earR, ctx.fur) +
      `<rect x="36" y="0" width="80" height="24" fill="${P.dark}" clip-path="url(#${clipL})"/>` +
      `<rect x="124" y="0" width="80" height="24" fill="${P.dark}" clip-path="url(#${clipR})"/>` +
      path(HEAD_FRONT, ctx.fur) +
      path('M120 40 C 146 40 172 54 180 80 C 170 66 146 56 120 56 C 94 56 70 66 60 80 C 68 54 94 40 120 40 Z', '#fff', { opacity: 0.14 }) +
      path('M47 118 C 70 134 96 142 120 142 C 144 142 170 134 193 118 C 186 128 178 134 172 138 C 156 150 140 155 120 155 C 100 155 84 150 68 138 C 62 134 54 128 47 118 Z', P.furBottom, { opacity: 0.55 })) +
    g('lx-scarf',
      path('M78 146 C 97 158 143 158 162 146 C 166 151 168 156 167 161 C 147 175 93 175 73 161 C 72 156 74 151 78 146 Z', ctx.scarf) +
      stroke('M76 154 C 96 166 144 166 164 154', P.stripe, 3)) +
    tail(ctx, TAIL_BACK, TAIL_TIP_BACK, `${ctx.u}-btail`) +
    (waving ? rightArm : '') +
    effects(ctx));
}

/** Кадр всей фигуры и кадр «только голова» (уши + щёчки). */
export const FULL_VIEWBOX = '-4 -10 248 250';
export const HEAD_VIEWBOX = '24 1 192 160';

/* ——— Сборка —————————————————————————————————————————————— */

export function renderLexi(opts: LexiOptions = {}): string {
  const view = opts.view ?? 'front';
  const mood = opts.mood ?? 'idle';
  const u = opts.uid ?? `lx${++instanceCounter}`;
  const ctx: Ctx = {
    u,
    mood,
    fur: `url(#${u}-fur)`,
    tail: `url(#${u}-tail)`,
    cream: `url(#${u}-cream)`,
    scarf: `url(#${u}-scarf)`,
    arm: `url(#${u}-arm)`,
  };

  let body: string;
  switch (view) {
    case 'threeQuarter':
      body = renderThreeQuarter(ctx);
      break;
    case 'side':
      body = renderSide(ctx);
      break;
    case 'back':
      body = renderBack(ctx);
      break;
    default:
      body = renderFront(ctx, opts.crop === 'head');
  }

  const showShadow = opts.shadow ?? opts.crop !== 'head';
  const flipped = opts.flip ? g('', body, { transform: 'translate(240 0) scale(-1 1)' }) : body;
  const viewBox = opts.crop === 'head' ? HEAD_VIEWBOX : FULL_VIEWBOX;
  const title = opts.title ? `<title>${opts.title}</title>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="lx lx--${view} lx--${mood}">` +
    title + defs(u) +
    (showShadow ? shadow() : '') +
    g('lx-root', flipped) +
    '</svg>';
}

/** Сочетания для листа персонажа (скрипт превью и экран знакомства). */
export const LEXI_SHEET: Array<{ view: LexiView; mood: LexiMood; label: string }> = [
  { view: 'front', mood: 'idle', label: 'Анфас' },
  { view: 'threeQuarter', mood: 'talk', label: 'Вполоборота · объясняет' },
  { view: 'side', mood: 'run', label: 'Профиль · бежит' },
  { view: 'back', mood: 'wave', label: 'Со спины · машет' },
  { view: 'front', mood: 'wave', label: 'Привет!' },
  { view: 'front', mood: 'cheer', label: 'Урок пройден' },
  { view: 'front', mood: 'happy', label: 'Верно!' },
  { view: 'front', mood: 'sad', label: 'Ошибка' },
  { view: 'front', mood: 'think', label: 'Задумался' },
  { view: 'front', mood: 'wow', label: 'Новое слово' },
  { view: 'front', mood: 'sleep', label: 'Спит' },
  { view: 'front', mood: 'read', label: 'Читает' },
];
