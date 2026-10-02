/**
 * Мир Лекси — декорации пути на главной.
 *
 * Каждый юнит курса проходит через свою локацию: опушку с норой
 * лисёнка, поле, озеро, осенний лес, горы и зимний лес. Как и Лекси,
 * всё рисуется SVG-строками: узлы пути (пеньки, кувшинки, камни),
 * тропинка со следами лапок и природа вокруг.
 *
 * Цвета задаются CSS-переменными из theme/scenery.css, поэтому одна
 * разметка работает в светлой и тёмной темах. Раскладка случайная,
 * но детерминированная: генератор берёт зерно от юнита, и картинка
 * не «прыгает» между открытиями экрана.
 */
import type { NodeState } from '@/core/course';
import { GAME_ICONS } from './icons';

export type BiomeId = 'forest' | 'field' | 'lake' | 'autumn' | 'mountains' | 'winter';

export interface Biome {
  id: BiomeId;
  /** Название локации на табличке юнита. */
  name: string;
  /** Узлы на воде — кувшинки вместо пеньков. */
  water: boolean;
}

export const BIOMES: readonly Biome[] = [
  { id: 'forest', name: 'Опушка', water: false },
  { id: 'field', name: 'Поле', water: false },
  { id: 'lake', name: 'Озеро', water: true },
  { id: 'autumn', name: 'Осенний лес', water: false },
  { id: 'mountains', name: 'Горы', water: false },
  { id: 'winter', name: 'Зимний лес', water: false },
];

/** Локации идут по кругу: юнит 1 — опушка, юнит 2 — поле… */
export const biomeAt = (unitIndex: number): Biome => BIOMES[unitIndex % BIOMES.length];

export type SceneNodeKind = 'lesson' | 'chest' | 'review';

export interface SceneNode {
  kind: SceneNodeKind;
  state: NodeState;
  /** Сдвиг узла от центра пути. */
  x: number;
  /** Центр строки узла от верха пути. */
  y: number;
}

export interface SceneInput {
  biome: Biome;
  nodes: SceneNode[];
  /** Высота пути юнита в пикселях. */
  height: number;
  seed: number;
  /** Где стоит Лекси: верх рамки 120×120 и сторона от пути (−1 слева, 1 справа). */
  mascot: { top: number; side: number } | null;
  /** Первый юнит раздела — у Лекси здесь нора. */
  home: boolean;
}

/* ——— Утилиты ———————————————————————————————————————————— */

const f = (n: number): number => Math.round(n * 10) / 10;

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Зерно генератора из строки — у каждого юнита своя раскладка. */
export function seedOf(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Разные длительность и фаза у анимаций, чтобы природа не двигалась хором. */
let animN = 0;
const anim = (base: number, spread: number): string => {
  const i = animN++;
  return `animation-duration:${(base + (((i * 7) % 10) / 10) * spread).toFixed(2)}s;animation-delay:${(-((i * 1.618) % base)).toFixed(2)}s`;
};

const at = (x: number, y: number, inner: string, cls = ''): string =>
  `<g${cls ? ` class="${cls}"` : ''} transform="translate(${f(x)} ${f(y)})">${inner}</g>`;

/* ——— Кривая пути: та же змейка, что связывает узлы ——————————— */

const K = 52;

interface CurvePoint { x: number; y: number; dx: number; dy: number }

/** Точка кубической кривой между соседними узлами (касательные вертикальные). */
function curve(a: { x: number; y: number }, b: { x: number; y: number }, t: number): CurvePoint {
  const k = (b.y - a.y) / 2 || K;
  return {
    x: a.x + (b.x - a.x) * (3 * t * t - 2 * t ** 3),
    y: a.y + k * (3 * t - 3 * t * t + 2 * t ** 3),
    dx: (b.x - a.x) * (6 * t - 6 * t * t),
    dy: k * (3 - 6 * t + 6 * t * t),
  };
}

function trailPath(pts: Array<{ x: number; y: number }>, lead = 0, tail = 0): string {
  let d = `M${pts[0].x} ${pts[0].y - lead} L${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const k = (b.y - a.y) / 2;
    d += ` C${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
  }
  const z = pts[pts.length - 1];
  return `${d} L${z.x} ${z.y + tail}`;
}

/* ——— Глифы узлов ——————————————————————————————————————— */

const GLYPH = {
  lock: '<path d="M10.5 14.5V11a5.5 5.5 0 0 1 11 0v3.5M8 14h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  check: '<path d="M7 16.5l6 5.8L25.5 10" fill="none" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M16 3.5l3.7 7.6 8.3 1.2-6 5.9 1.4 8.3L16 22.6l-7.4 3.9 1.4-8.3-6-5.9 8.3-1.2z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
};

/** Значок лежит на плоской поверхности — в перспективе он сжат по вертикали. */
const flat = (name: keyof typeof GLYPH, s: number, k: number, cls: string): string =>
  `<g class="${cls}" transform="scale(${s} ${f(s * k * 100) / 100}) translate(-16 -16)">${GLYPH[name]}</g>`;

/* ——— Природа ——————————————————————————————————————————— */

type Tone = 'green' | 'orange' | 'red' | 'yellow';

const shadow = (x: number, y: number, rx: number, ry: number): string =>
  `<ellipse class="sc-shadow" cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}"/>`;

function pine(x: number, y: number, s = 1, snowy = false, sway = true): string {
  const w = 28 * s;
  const h = 84 * s;
  const P = (pts: Array<[number, number]>): string => pts.map(([px, py]) => `${f(px)} ${f(py)}`).join(' L');
  const tiers = `M${P([[0, -h], [w * 0.55, -h * 0.64], [w * 0.3, -h * 0.64], [w * 0.82, -h * 0.34], [w * 0.52, -h * 0.34], [w, -12 * s], [-w, -12 * s], [-w * 0.52, -h * 0.34], [-w * 0.82, -h * 0.34], [-w * 0.3, -h * 0.64], [-w * 0.55, -h * 0.64]])}Z`;
  const lit = `M${P([[0, -h], [-w * 0.55, -h * 0.64], [-w * 0.3, -h * 0.64], [-w * 0.82, -h * 0.34], [-w * 0.52, -h * 0.34], [-w, -12 * s], [-w * 0.15, -12 * s], [0, -h * 0.8]])}Z`;
  let snow = '';
  if (snowy) {
    // Снежные шапки на ярусах: от вершины яруса вниз волнистым краем
    const caps: Array<[number, number, number]> = [[-h, h * 0.2, w * 0.36], [-h * 0.64, h * 0.16, w * 0.5], [-h * 0.34, h * 0.14, w * 0.66]];
    snow = caps.map(([top, hh, half]) =>
      `<path class="sc-snow" d="M0 ${f(top)} L${f(half)} ${f(top + hh)} Q${f(half * 0.5)} ${f(top + hh - 3 * s)} ${f(half * 0.2)} ${f(top + hh + 1 * s)} Q${f(-half * 0.3)} ${f(top + hh - 3 * s)} ${f(-half)} ${f(top + hh)}Z"/>`).join('');
  }
  const crown = `<path class="sc-pine" d="${tiers}"/><path class="sc-pine-l" d="${lit}"/>${snow}`;
  return at(x, y, `${shadow(6 * s, 0, 24 * s, 6 * s)}<rect class="sc-trunk" x="${f(-3.5 * s)}" y="${f(-16 * s)}" width="${f(7 * s)}" height="${f(17 * s)}" rx="${f(2 * s)}"/>${sway ? `<g class="sc-sway" style="${anim(6, 3)}">${crown}</g>` : crown}`);
}

function oak(x: number, y: number, s = 1, tone: Tone = 'green', sway = true): string {
  const c: Array<[number, number, number]> = [[0, -54, 25], [-19, -42, 18], [19, -41, 19], [-7, -68, 17], [12, -63, 16]];
  const C = (dx: number, dy: number, cls: string): string =>
    c.map(([cx, cy, r]) => `<circle class="${cls}" cx="${f((cx + dx) * s)}" cy="${f((cy + dy) * s)}" r="${f(r * s)}"/>`).join('');
  const crown = `${C(3, 4, `sc-crown-${tone}-d`)}${C(0, 0, `sc-crown-${tone}`)}<circle class="sc-crown-${tone}-l" cx="${f(-10 * s)}" cy="${f(-62 * s)}" r="${f(10 * s)}"/><circle class="sc-crown-${tone}-l" cx="${f(-22 * s)}" cy="${f(-46 * s)}" r="${f(7 * s)}"/>`;
  return at(x, y, `${shadow(7 * s, 0, 30 * s, 7 * s)}<path class="sc-trunk" d="M${f(-5 * s)} 0 L${f(-4 * s)} ${f(-30 * s)} L${f(4 * s)} ${f(-30 * s)} L${f(5.5 * s)} 0Z"/>${sway ? `<g class="sc-sway" style="${anim(7, 3)}">${crown}</g>` : crown}`);
}

function bush(x: number, y: number, s = 1, berries = true, snowy = false): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `${shadow(3 * s, 1 * s, 20 * s, 5 * s)}
    <circle class="sc-crown-green-d" cx="${S(-8)}" cy="${S(-8)}" r="${S(10)}"/><circle class="sc-crown-green-d" cx="${S(9)}" cy="${S(-7)}" r="${S(11)}"/>
    <circle class="sc-bush" cx="${S(-9)}" cy="${S(-10)}" r="${S(9)}"/><circle class="sc-bush" cx="${S(1)}" cy="${S(-15)}" r="${S(10)}"/><circle class="sc-bush" cx="${S(10)}" cy="${S(-9)}" r="${S(9)}"/>
    ${snowy ? `<path class="sc-snow" d="M${S(-17)} ${S(-12)} C${S(-14)} ${S(-24)} ${S(14)} ${S(-28)} ${S(18)} ${S(-11)} C${S(10)} ${S(-16)} ${S(-8)} ${S(-17)} ${S(-17)} ${S(-12)}Z"/>` : `<circle class="sc-crown-green-l" cx="${S(-4)}" cy="${S(-19)}" r="${S(4)}"/>`}
    ${berries && !snowy ? `<circle class="sc-berry" cx="${S(-6)}" cy="${S(-8)}" r="${S(2)}"/><circle class="sc-berry" cx="${S(6)}" cy="${S(-12)}" r="${S(2)}"/><circle class="sc-berry" cx="${S(11)}" cy="${S(-5)}" r="${S(1.8)}"/>` : ''}`);
}

const FLOWERS = ['#FFFFFF', '#FFD84D', '#FF8FB1', '#B79BFF', '#FF7A59'];

function flower(x: number, y: number, color: string, s = 1): string {
  let petals = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    petals += `<circle cx="${f(Math.cos(a) * 2.6 * s)}" cy="${f(Math.sin(a) * 2.2 * s)}" r="${f(2.1 * s)}"/>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)})" fill="${color}">${petals}<circle r="${f(1.5 * s)}" fill="#FFB800"/></g>`;
}

/** Эдельвейс — белая звёздочка горных лугов */
function edelweiss(x: number, y: number, s = 1): string {
  let petals = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 360;
    petals += `<ellipse class="sc-edelweiss" cx="0" cy="${f(-3.2 * s)}" rx="${f(1.4 * s)}" ry="${f(3.2 * s)}" transform="rotate(${a})"/>`;
  }
  return at(x, y, `${petals}<circle r="${f(1.6 * s)}" fill="#F5D76E"/>`);
}

const tuft = (x: number, y: number, s = 1, cls = 'sc-tuft'): string =>
  at(x, y, `<path class="${cls}" d="M${f(-5 * s)} 0 Q${f(-6 * s)} ${f(-7 * s)} ${f(-9 * s)} ${f(-11 * s)} Q${f(-3 * s)} ${f(-7 * s)} ${f(-1 * s)} 0Z M${f(-1.5 * s)} 0 Q${f(-0.5 * s)} ${f(-9 * s)} ${f(1 * s)} ${f(-15 * s)} Q${f(2.5 * s)} ${f(-8 * s)} ${f(2.5 * s)} 0Z M${f(2 * s)} 0 Q${f(5 * s)} ${f(-6 * s)} ${f(9 * s)} ${f(-9 * s)} Q${f(5 * s)} ${f(-3 * s)} ${f(5.5 * s)} 0Z"/>`);

function mushroom(x: number, y: number, s = 1, kind: 'fly' | 'boletus' = 'fly'): string {
  const S = (n: number): number => f(n * s);
  if (kind === 'boletus') {
    return at(x, y, `${shadow(2 * s, 0, 9 * s, 2.6 * s)}<path class="sc-stem" d="M${S(-3.6)} 0 C${S(-4.6)} ${S(-5)} ${S(-3)} ${S(-8)} ${S(-2.4)} ${S(-9)} L${S(2.4)} ${S(-9)} C${S(3)} ${S(-8)} ${S(4.6)} ${S(-5)} ${S(3.6)} 0Z"/><path class="sc-boletus" d="M${S(-9.5)} ${S(-8)} C${S(-9.5)} ${S(-17)} ${S(9.5)} ${S(-17)} ${S(9.5)} ${S(-8)} C${S(4)} ${S(-6.6)} ${S(-4)} ${S(-6.6)} ${S(-9.5)} ${S(-8)}Z"/><ellipse class="sc-boletus-l" cx="${S(-3)}" cy="${S(-13)}" rx="${S(3)}" ry="${S(1.4)}"/>`);
  }
  return at(x, y, `${shadow(2 * s, 0, 8 * s, 2.4 * s)}<path class="sc-stem" d="M${S(-3)} 0 L${S(-2.4)} ${S(-9)} L${S(2.4)} ${S(-9)} L${S(3)} 0Z"/><path class="sc-cap" d="M${S(-9)} ${S(-8)} C${S(-9)} ${S(-17)} ${S(9)} ${S(-17)} ${S(9)} ${S(-8)}Z"/><circle class="sc-dot" cx="${S(-4)}" cy="${S(-12)}" r="${S(1.5)}"/><circle class="sc-dot" cx="${S(3)}" cy="${S(-13.5)}" r="${S(1.2)}"/><circle class="sc-dot" cx="${S(5)}" cy="${S(-10)}" r="${S(1)}"/>`);
}

const stone = (x: number, y: number, s = 1): string =>
  at(x, y, `<ellipse class="sc-stone-d" cy="${f(1 * s)}" rx="${f(7 * s)}" ry="${f(4.2 * s)}"/><ellipse class="sc-stone" cx="${f(-0.6 * s)}" rx="${f(6.4 * s)}" ry="${f(3.6 * s)}"/><ellipse class="sc-stone-l" cx="${f(-2 * s)}" cy="${f(-1.2 * s)}" rx="${f(2.4 * s)}" ry="${f(1.2 * s)}"/>`);

function boulder(x: number, y: number, s = 1, snowy = false): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `${shadow(3 * s, 2 * s, 24 * s, 6 * s)}<path class="sc-rock-d" d="M${S(-22)} ${S(2)} C${S(-24)} ${S(-10)} ${S(-14)} ${S(-22)} ${S(-2)} ${S(-22)} C${S(12)} ${S(-22)} ${S(24)} ${S(-12)} ${S(22)} ${S(1)} C${S(14)} ${S(5)} ${S(-14)} ${S(5)} ${S(-22)} ${S(2)}Z"/><path class="sc-rock" d="M${S(-22)} ${S(0)} C${S(-23)} ${S(-11)} ${S(-13)} ${S(-21)} ${S(-2)} ${S(-21)} C${S(8)} ${S(-21)} ${S(16)} ${S(-15)} ${S(18)} ${S(-6)} C${S(6)} ${S(-10)} ${S(-12)} ${S(-6)} ${S(-22)} ${S(0)}Z"/>${snowy ? `<path class="sc-snow" d="M${S(-16)} ${S(-15)} C${S(-10)} ${S(-23)} ${S(8)} ${S(-24)} ${S(15)} ${S(-12)} C${S(6)} ${S(-16)} ${S(-6)} ${S(-12)} ${S(-16)} ${S(-15)}Z"/>` : ''}`);
}

function wheat(x: number, y: number, s = 1): string {
  let out = '';
  [-7, -3, 1, 5, 9].forEach((dx, i) => {
    const h = (26 + (i % 2) * 6) * s;
    const tx = (dx + (i - 2) * 1.5) * s;
    out += `<path class="sc-straw" d="M${f(dx * s)} 0 Q${f(dx * s)} ${f(-h * 0.5)} ${f(tx)} ${f(-h + 9 * s)}"/>`;
    for (let k = 0; k < 4; k++) {
      const gx = tx + (k % 2 ? 1.6 : -1.6) * s;
      const gy = -h + k * 3.2 * s;
      out += `<ellipse class="sc-grain" cx="${f(gx)}" cy="${f(gy)}" rx="${f(1.5 * s)}" ry="${f(2.6 * s)}" transform="rotate(${k % 2 ? 25 : -25} ${f(gx)} ${f(gy)})"/>`;
    }
  });
  return at(x, y, `<g class="sc-sway sc-sway--fast" style="${anim(3.5, 2)}">${out}</g>`);
}

function hay(x: number, y: number, s = 1): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `${shadow(4 * s, 1 * s, 28 * s, 6 * s)}<rect class="sc-hay-d" x="${S(-24)}" y="${S(-30)}" width="${S(44)}" height="${S(30)}" rx="${S(10)}"/><rect class="sc-hay" x="${S(-24)}" y="${S(-30)}" width="${S(38)}" height="${S(30)}" rx="${S(10)}"/><ellipse class="sc-hay-end" cx="${S(14)}" cy="${S(-15)}" rx="${S(8)}" ry="${S(15)}"/><path class="sc-hay-line" d="M${S(14)} ${S(-24)} a${S(5)} ${S(9)} 0 1 1 0 ${S(18)} a${S(3)} ${S(6)} 0 1 1 0 ${S(-12)} a${S(1.5)} ${S(3)} 0 1 1 0 ${S(6)} M${S(-18)} ${S(-22)} L${S(4)} ${S(-22)} M${S(-20)} ${S(-14)} L${S(2)} ${S(-14)} M${S(-18)} ${S(-7)} L${S(3)} ${S(-7)}"/>`);
}

const butterfly = (x: number, y: number, color: string): string =>
  at(x, y, `<g class="sc-fly" style="${anim(9, 5)}"><g class="sc-flap" style="${anim(0.35, 0.2)}"><path fill="${color}" d="M0 0 C-7 -9 -12 -3 -7 1 C-11 4 -6 8 0 2Z M0 0 C7 -9 12 -3 7 1 C11 4 6 8 0 2Z"/><path class="sc-body" d="M0 -3 L0 4"/></g></g>`);

function reed(x: number, y: number, s = 1): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `<g class="sc-sway" style="${anim(4, 2)}"><path class="sc-reed-leaf" d="M${S(-2)} 0 Q${S(-10)} ${S(-18)} ${S(-16)} ${S(-30)} Q${S(-6)} ${S(-18)} ${S(1)} 0Z M${S(2)} 0 Q${S(9)} ${S(-16)} ${S(16)} ${S(-24)} Q${S(6)} ${S(-12)} ${S(4)} 0Z"/><path class="sc-reed" d="M0 0 L${S(-1)} ${S(-44)} M${S(4)} 0 L${S(6)} ${S(-36)}"/><rect class="sc-cattail" x="${S(-3.6)}" y="${S(-46)}" width="${S(5.4)}" height="${S(13)}" rx="${S(2.7)}"/><rect class="sc-cattail" x="${S(3.4)}" y="${S(-38)}" width="${S(5)}" height="${S(11)}" rx="${S(2.5)}"/></g>`);
}

const ripple = (x: number, y: number, s = 1): string =>
  at(x, y, `<path class="sc-ripple" d="M${f(-10 * s)} 0 Q0 ${f(-3 * s)} ${f(10 * s)} 0 M${f(-5 * s)} ${f(5 * s)} Q${f(1 * s)} ${f(3 * s)} ${f(7 * s)} ${f(5 * s)}"/>`);

/** Лист кувшинки: круг с вырезом */
function padPath(rx: number, ry: number, notch = 0.32, rot = -0.6): string {
  const a0 = rot + notch / 2;
  const a1 = rot + Math.PI * 2 - notch / 2;
  const P = (a: number): string => `${f(Math.cos(a) * rx)} ${f(Math.sin(a) * ry)}`;
  return `M0 0 L${P(a0)} A${rx} ${ry} 0 1 1 ${P(a1)}Z`;
}

function lily(x: number, y: number, s = 1): string {
  const petals = [-60, -30, 0, 30, 60].map((a) => `<ellipse class="sc-lily" cy="${f(-6 * s)}" rx="${f(3 * s)}" ry="${f(7 * s)}" transform="rotate(${a})"/>`).join('');
  return at(x, y, `${petals}<ellipse class="sc-lily-l" cy="${f(-5 * s)}" rx="${f(2.6 * s)}" ry="${f(6 * s)}"/><circle cy="${f(-1 * s)}" r="${f(2.2 * s)}" fill="#FFD84D"/>`);
}

const padDecor = (x: number, y: number, s = 1, withLily = false): string =>
  at(x, y, `<path class="sc-pad-d" d="${padPath(14 * s, 8 * s)}" transform="translate(1 1.5)"/><path class="sc-pad" d="${padPath(14 * s, 8 * s)}"/>${withLily ? lily(2 * s, -2 * s, 0.7 * s) : ''}`);

const duck = (x: number, y: number): string =>
  at(x, y, `<g class="sc-swim" style="${anim(14, 6)}"><ellipse class="sc-ripple-fill" cx="0" cy="4" rx="16" ry="4"/><path class="sc-duck" d="M-11 0 C-11 -6 -4 -8 3 -6 C5 -10 9 -13 12 -10 C14 -8 13 -5 10 -4 C12 0 8 4 0 4 C-6 4 -11 3 -11 0Z"/><path class="sc-duck-wing" d="M-7 -1 C-4 -5 1 -4 3 -1 C0 1 -4 1 -7 -1Z"/><path class="sc-beak" d="M13 -9 L18 -8 L13 -6.6Z"/><circle cx="10.5" cy="-9.6" r="1" fill="#2A170F"/></g>`);

function pier(x: number, y: number): string {
  return at(x, y, `<rect class="sc-post" x="4" y="18" width="6" height="18" rx="2"/><rect class="sc-post" x="56" y="18" width="6" height="18" rx="2"/><rect class="sc-plank-d" x="0" y="-8" width="70" height="38" rx="3"/><rect class="sc-plank" x="0" y="-12" width="70" height="38" rx="3"/><path class="sc-plank-gap" d="M14 -12 V26 M28 -12 V26 M42 -12 V26 M56 -12 V26"/>`);
}

/* Осень */
const LEAF = 'M0 -5 C3.4 -3.6 4.4 0 0 5 C-4.4 0 -3.4 -3.6 0 -5Z';
const leaf = (x: number, y: number, tone: Tone, rot: number, s = 1): string =>
  `<path class="sc-leaf-${tone}" d="${LEAF}" transform="translate(${f(x)} ${f(y)}) rotate(${Math.round(rot)}) scale(${s})"/>`;
const fallingLeaf = (x: number, y: number, tone: Tone): string =>
  at(x, y, `<g class="sc-fall" style="${anim(7, 4)}"><path class="sc-leaf-${tone}" d="${LEAF}"/></g>`);

function hedgehog(x: number, y: number, s = 1): string {
  const S = (n: number): number => f(n * s);
  let spikes = '';
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    const r1 = 12;
    const r2 = 17;
    const a2 = a + Math.PI / 16;
    spikes += `${i ? 'L' : 'M'}${S(Math.cos(a) * r1 * 1.2 - 2)} ${S(Math.sin(a) * r1)} L${S(Math.cos(a2) * r2 * 1.2 - 2)} ${S(Math.sin(a2) * r2)} `;
  }
  return at(x, y, `${shadow(0, 1 * s, 18 * s, 4 * s)}<path class="sc-hedgehog" d="${spikes} L${S(12)} 0 L${S(-16)} 0Z"/><path class="sc-hedgehog-face" d="M${S(6)} 0 C${S(6)} ${S(-8)} ${S(12)} ${S(-10)} ${S(19)} ${S(-3)} C${S(16)} 0 ${S(10)} ${S(1)} ${S(6)} 0Z"/><circle cx="${S(19)}" cy="${S(-3)}" r="${S(1.6)}" fill="#2A170F"/><circle cx="${S(12)}" cy="${S(-5)}" r="${S(1.1)}" fill="#2A170F"/>${leaf(-2 * s, -15 * s, 'red', 30, 0.9 * s)}`);
}

/* Горы */
function cliff(x: number, y: number, s = 1, flip = false): string {
  const S = (n: number): number => f(n * s * (flip ? -1 : 1));
  const V = (n: number): number => f(n * s);
  return `<g transform="translate(${f(x)} ${f(y)})">${shadow(0, 2 * s, 56 * s, 9 * s)}
    <path class="sc-cliff" d="M${S(-56)} ${V(2)} L${S(-40)} ${V(-46)} L${S(-22)} ${V(-74)} L${S(-6)} ${V(-58)} L${S(12)} ${V(-96)} L${S(34)} ${V(-50)} L${S(56)} ${V(2)}Z"/>
    <path class="sc-cliff-l" d="M${S(-56)} ${V(2)} L${S(-40)} ${V(-46)} L${S(-22)} ${V(-74)} L${S(-16)} ${V(-40)} L${S(-6)} ${V(-58)} L${S(12)} ${V(-96)} L${S(4)} ${V(-30)} L${S(-10)} ${V(2)}Z"/>
    <path class="sc-snow" d="M${S(12)} ${V(-96)} L${S(22)} ${V(-74)} L${S(16)} ${V(-78)} L${S(10)} ${V(-70)} L${S(4)} ${V(-80)} L${S(0)} ${V(-74)}Z M${S(-22)} ${V(-74)} L${S(-14)} ${V(-60)} L${S(-19)} ${V(-63)} L${S(-24)} ${V(-57)} L${S(-29)} ${V(-62)}Z"/>
  </g>`;
}

function waterfall(x: number, y: number, h: number): string {
  return at(x, y, `${boulder(-4, 0, 1.2)}
    <rect class="sc-fall-water" x="-12" y="-4" width="22" height="${f(h)}" rx="8"/>
    <path class="sc-fall-foam" style="${anim(1.4, 0.6)}" d="M-6 0 V${f(h - 10)} M0 6 V${f(h - 6)} M5 -2 V${f(h - 12)}"/>
    <ellipse class="sc-pool" cx="-1" cy="${f(h)}" rx="30" ry="9"/>
    <ellipse class="sc-pool-foam" cx="-1" cy="${f(h - 2)}" rx="16" ry="4"/>
    ${stone(-26, h + 4, 0.8)}${stone(24, h + 6, 0.7)}`);
}

/* Зима */
const snowdrift = (x: number, y: number, s = 1): string =>
  at(x, y, `<ellipse class="sc-snow-shade" cx="${f(3 * s)}" cy="${f(2 * s)}" rx="${f(26 * s)}" ry="${f(7 * s)}"/><path class="sc-snow" d="M${f(-26 * s)} ${f(2 * s)} C${f(-22 * s)} ${f(-10 * s)} ${f(-8 * s)} ${f(-14 * s)} ${f(2 * s)} ${f(-10 * s)} C${f(10 * s)} ${f(-16 * s)} ${f(24 * s)} ${f(-8 * s)} ${f(26 * s)} ${f(2 * s)}Z"/>`);

function snowman(x: number, y: number, s = 1): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `${shadow(3 * s, 1 * s, 20 * s, 5 * s)}
    <path class="sc-twig" d="M${S(-10)} ${S(-30)} L${S(-22)} ${S(-40)} M${S(-17)} ${S(-35)} L${S(-20)} ${S(-31)} M${S(10)} ${S(-30)} L${S(22)} ${S(-38)}"/>
    <circle class="sc-snowball" cx="0" cy="${S(-12)}" r="${S(13)}"/><circle class="sc-snowball" cx="0" cy="${S(-33)}" r="${S(10)}"/><circle class="sc-snowball" cx="0" cy="${S(-50)}" r="${S(7.5)}"/>
    <path class="sc-scarf" d="M${S(-8)} ${S(-43)} Q0 ${S(-39)} ${S(8)} ${S(-43)} L${S(8)} ${S(-40)} Q0 ${S(-36)} ${S(-8)} ${S(-40)}Z M${S(3)} ${S(-41)} L${S(7)} ${S(-31)} L${S(10)} ${S(-32)} L${S(6)} ${S(-41)}Z"/>
    <path class="sc-carrot" d="M0 ${S(-50)} L${S(8)} ${S(-48.5)} L0 ${S(-47.5)}Z"/>
    <circle cx="${S(-2.6)}" cy="${S(-53)}" r="${S(1.1)}" fill="#2A170F"/><circle cx="${S(2.4)}" cy="${S(-53)}" r="${S(1.1)}" fill="#2A170F"/>
    <circle cx="0" cy="${S(-34)}" r="${S(1)}" fill="#2A170F"/><circle cx="0" cy="${S(-29)}" r="${S(1)}" fill="#2A170F"/>`);
}

const snowflake = (x: number, y: number, r: number): string =>
  `<circle class="sc-flake" style="${anim(8, 5)}" cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;

function icePond(x: number, y: number, s = 1): string {
  const S = (n: number): number => f(n * s);
  return at(x, y, `<ellipse class="sc-snow-shade" cx="0" cy="${S(3)}" rx="${S(40)}" ry="${S(13)}"/><ellipse class="sc-ice" rx="${S(38)}" ry="${S(12)}"/><path class="sc-ice-hi" d="M${S(-24)} ${S(-3)} L${S(-10)} ${S(-6)} M${S(-4)} ${S(2)} L${S(14)} ${S(-3)} M${S(18)} ${S(4)} L${S(26)} ${S(2)}"/>`);
}

const firefly = (x: number, y: number): string => `<circle class="sc-firefly" style="${anim(3, 3)}" cx="${f(x)}" cy="${f(y)}" r="1.8"/>`;

const paw = (x: number, y: number, a: number): string =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${Math.round(a)})"><ellipse cy="1.6" rx="3.1" ry="2.7"/><circle cx="-3.2" cy="-2.3" r="1.25"/><circle cx="-1.1" cy="-3.8" r="1.25"/><circle cx="1.1" cy="-3.8" r="1.25"/><circle cx="3.2" cy="-2.3" r="1.25"/></g>`;

/** Нора Лекси: холмик под корнями. Вход смотрит к тропинке. */
function den(x: number, y: number, flip: boolean): string {
  return `<g transform="translate(${f(x)} ${f(y)})${flip ? ' scale(-1 1)' : ''}">
    ${shadow(6, 2, 66, 10)}
    <path class="sc-mound-d" d="M-64 2 C-60 -36 -24 -60 8 -58 C40 -56 62 -32 64 2Z"/>
    <path class="sc-mound" d="M-64 2 C-60 -36 -24 -60 8 -58 C30 -57 44 -46 50 -34 C30 -44 -6 -44 -26 -20 C-40 -6 -54 0 -64 2Z"/>
    <path class="sc-mound-grass" d="M-62 -10 C-56 -38 -24 -58 8 -58 C40 -56 60 -34 63 -10 C54 -30 34 -46 8 -47 C-20 -48 -46 -34 -62 -10Z"/>
    <ellipse class="sc-hole" cx="10" cy="-12" rx="22" ry="17"/>
    <ellipse class="sc-hole-d" cx="11" cy="-9" rx="16" ry="12"/>
    <path class="sc-root" d="M-8 -26 C-4 -18 -10 -12 -6 -4 M26 -27 C22 -18 30 -12 26 -4 M2 -29 C6 -24 2 -20 6 -16"/>
    ${stone(-40, -2, 1.1)}${stone(46, 0, 0.9)}${tuft(-54, 0, 1)}${tuft(56, -2, 0.9)}
  </g>`;
}

/* ——— Узлы пути ——————————————————————————————————————————— */

function badge(state: NodeState, rx: number, ry: number): string {
  const k = ry / rx;
  if (state === 'done') return `<ellipse class="nd-badge nd-badge--done" rx="${f(rx * 0.6)}" ry="${f(ry * 0.6)}"/>${flat('check', 0.62, k, 'nd-glyph')}`;
  if (state === 'current') return `<ellipse class="nd-badge nd-badge--current" rx="${f(rx * 0.62)}" ry="${f(ry * 0.62)}"/>${flat('star', 0.7, k, 'nd-glyph')}`;
  return flat('lock', 0.6, k, 'nd-lock');
}

/** Пенёк: кора, годичные кольца, корни; на спиле — значок урока. */
function stump(state: NodeState, rx: number, variant: 'plain' | 'autumn' | 'snow'): string {
  const ry = rx * 0.5;
  const h = 15;
  let grooves = '';
  for (const u of [-0.72, -0.34, 0.12, 0.56]) {
    const x = u * rx;
    const yt = ry * Math.sqrt(1 - u * u);
    grooves += `<path class="nd-groove" d="M${f(x)} ${f(yt + 1)} Q${f(x + 1.5)} ${f(yt + h / 2)} ${f(x)} ${f(yt + h - 1)}"/>`;
  }
  const snow = variant === 'snow'
    ? `<path class="sc-snow" d="M${-rx - 2} ${f(-1)} C${f(-rx + 2)} ${f(-ry - 6)} ${f(rx - 2)} ${f(-ry - 6)} ${rx + 2} ${f(-1)} C${f(rx - 2)} ${f(-ry + 3)} ${f(-rx + 4)} ${f(-ry + 3)} ${-rx - 2} ${f(-1)}Z"/><path class="sc-snow" d="M${f(-rx - 10)} ${f(h + ry + 2)} C${f(-rx - 6)} ${f(h + ry - 8)} ${f(rx + 6)} ${f(h + ry - 8)} ${f(rx + 10)} ${f(h + ry + 2)}Z"/>`
    : '';
  const leaves = variant === 'autumn' ? `${leaf(-rx * 0.82, -ry * 0.1, 'orange', 40, 1.2)}${leaf(rx * 0.7, ry * 0.45, 'red', -30, 1.1)}` : '';
  return `${shadow(4, h + ry - 3, rx * 1.25, ry * 0.6)}
    <path class="nd-root" d="M${f(-rx - 7)} ${f(h + 6)} C${f(-rx - 2)} ${f(h - 2)} ${f(-rx + 4)} ${f(h - 4)} ${f(-rx + 10)} ${f(h + 2)}Z M${f(rx + 8)} ${f(h + 4)} C${f(rx + 2)} ${f(h - 3)} ${f(rx - 5)} ${f(h - 3)} ${f(rx - 10)} ${f(h + 3)}Z M-4 ${f(h + ry + 4)} C-6 ${f(h + ry - 3)} 4 ${f(h + ry - 4)} 6 ${f(h + ry + 1)}Z"/>
    <path class="nd-bark" d="M${-rx} 0 L${-rx} ${h} A${rx} ${ry} 0 0 0 ${rx} ${h} L${rx} 0Z"/>
    <path class="nd-bark-d" d="M${f(rx * 0.3)} ${f(ry * 0.95)} L${f(rx * 0.3)} ${f(ry * 0.95 + h)} A${rx} ${ry} 0 0 0 ${rx} ${h} L${rx} 0Z"/>
    ${grooves}
    <ellipse class="nd-rim" rx="${rx}" ry="${f(ry)}"/>
    <ellipse class="nd-wood" rx="${f(rx - 3)}" ry="${f(ry - 2.2)}"/>
    <ellipse class="nd-ring" rx="${f(rx * 0.74)}" ry="${f(ry * 0.74)}"/>
    <ellipse class="nd-ring" rx="${f(rx * 0.48)}" ry="${f(ry * 0.48)}"/>
    <ellipse class="nd-ring" rx="${f(rx * 0.24)}" ry="${f(ry * 0.24)}"/>
    <path class="nd-ring" d="M${f(rx * 0.2)} ${f(-ry * 0.1)} L${f(rx * 0.62)} ${f(-ry * 0.4)}"/>
    ${snow}${leaves}
    ${badge(state, rx, ry)}`;
}

/** Плоский камень для горной тропы */
function slab(state: NodeState, rx: number): string {
  const ry = rx * 0.5;
  const h = 12;
  return `${shadow(4, h + ry - 2, rx * 1.2, ry * 0.55)}
    <path class="sc-rock-d" d="M${-rx} ${f(-2)} C${-rx} ${f(h + ry * 0.6)} ${f(-rx * 0.5)} ${f(h + ry)} 0 ${f(h + ry)} C${f(rx * 0.6)} ${f(h + ry)} ${rx} ${f(h + ry * 0.5)} ${rx} ${f(-2)}Z"/>
    <path class="sc-rock-dd" d="M${f(rx * 0.25)} ${f(ry * 0.95)} C${f(rx * 0.3)} ${f(h + ry * 0.5)} ${f(rx * 0.2)} ${f(h + ry * 0.9)} 0 ${f(h + ry)} C${f(rx * 0.6)} ${f(h + ry)} ${rx} ${f(h + ry * 0.5)} ${rx} ${f(-2)}Z"/>
    <ellipse class="sc-rock" rx="${rx}" ry="${f(ry)}"/>
    <ellipse class="sc-rock-l" cx="${f(-rx * 0.15)}" cy="${f(-ry * 0.12)}" rx="${f(rx * 0.86)}" ry="${f(ry * 0.8)}"/>
    <path class="sc-crack" d="M${f(-rx * 0.7)} ${f(ry * 0.1)} L${f(-rx * 0.45)} ${f(ry * 0.35)} L${f(-rx * 0.2)} ${f(ry * 0.3)} M${f(rx * 0.5)} ${f(-ry * 0.5)} L${f(rx * 0.68)} ${f(-ry * 0.15)}"/>
    <path class="sc-moss" d="M${f(-rx * 0.9)} ${f(-ry * 0.2)} C${f(-rx * 0.8)} ${f(-ry * 0.75)} ${f(-rx * 0.3)} ${f(-ry * 0.95)} ${f(-rx * 0.05)} ${f(-ry * 0.98)} C${f(-rx * 0.4)} ${f(-ry * 0.7)} ${f(-rx * 0.7)} ${f(-ry * 0.5)} ${f(-rx * 0.9)} ${f(-ry * 0.2)}Z"/>
    ${badge(state, rx, ry)}`;
}

function pad(state: NodeState, rx: number): string {
  const ry = rx * 0.56;
  const k = ry / rx;
  let veins = '';
  for (let i = 0; i < 8; i++) {
    const a = -0.2 + (i / 8) * (Math.PI * 2 - 0.8);
    veins += `<path class="nd-vein" d="M0 0 L${f(Math.cos(a) * rx * 0.86)} ${f(Math.sin(a) * ry * 0.86)}"/>`;
  }
  let face: string;
  if (state === 'done') face = flat('check', 0.68, k, 'nd-glyph');
  else if (state === 'current') face = `<ellipse class="nd-badge nd-badge--current" rx="${f(rx * 0.5)}" ry="${f(ry * 0.5)}"/>${flat('star', 0.62, k, 'nd-glyph')}`;
  else face = flat('lock', 0.6, k, 'nd-pad-lock');
  return `<ellipse class="nd-wave" cy="3" rx="${f(rx * 1.32)}" ry="${f(ry * 1.32)}"/>
    <ellipse class="nd-pad-shadow" cx="3" cy="5" rx="${rx}" ry="${f(ry)}"/>
    <path class="sc-pad-d" d="${padPath(rx, ry)}" transform="translate(0 3)"/>
    <path class="sc-pad" d="${padPath(rx, ry)}"/>
    ${veins}
    <ellipse class="nd-shine" cx="${f(-rx * 0.32)}" cy="${f(-ry * 0.4)}" rx="${f(rx * 0.36)}" ry="${f(ry * 0.26)}"/>
    ${face}
    ${state === 'done' ? lily(rx * 0.62, -ry * 0.2, 0.5) : ''}`;
}

/** Иконка игры внутри SVG узла */
function gameIcon(svg: string, x: number, y: number, size: number, cls = ''): string {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 32 32" overflow="visible"${cls ? ` class="${cls}"` : ''}>${svg}</svg>`;
}

export interface NodeArtInput {
  kind: SceneNodeKind;
  state: NodeState;
  biome: Biome;
}

/** Картинка узла пути: viewBox −50…50 × −52…40, центр строки — (0, 0). */
export function nodeArt({ kind, state, biome }: NodeArtInput): string {
  let inner: string;
  const water = biome.water;
  if (kind === 'chest') {
    let base: string;
    if (water) base = '<ellipse class="nd-wave" cy="8" rx="36" ry="12"/><rect class="sc-plank" x="-30" y="-2" width="60" height="9" rx="3"/><rect class="sc-plank-d" x="-28" y="6" width="56" height="7" rx="3"/><path class="sc-plank-gap" d="M-10 -2 V13 M10 -2 V13"/>';
    else if (biome.id === 'winter') base = snowdrift(0, 6, 1.2);
    else base = `${shadow(3, 4, 28, 7)}${tuft(-26, 4, 0.8, biome.id === 'autumn' ? 'sc-tuft-dry' : 'sc-tuft')}${tuft(24, 5, 0.7, biome.id === 'autumn' ? 'sc-tuft-dry' : 'sc-tuft')}`;
    const opened = state === 'done';
    inner = `${base}<g class="nd-chest${state === 'open' ? ' nd-chest--ready' : ''}">${gameIcon(opened ? GAME_ICONS.chestOpen : GAME_ICONS.chest, -26, -44, 52, state === 'locked' ? 'nd-muted' : opened ? 'nd-faded' : '')}</g>`;
  } else if (kind === 'review') {
    const rock = water
      ? '<ellipse class="nd-wave" cy="8" rx="44" ry="13"/>'
      : shadow(4, 6, 36, 8);
    const snowy = biome.id === 'winter';
    inner = `${rock}
      <path class="sc-rock-d" d="M-32 6 C-34 -6 -24 -14 -4 -15 C18 -16 34 -8 32 4 C30 10 -30 12 -32 6Z"/>
      <path class="sc-rock" d="M-32 2 C-33 -8 -22 -15 -4 -16 C16 -17 31 -10 30 0 C24 -4 -20 -4 -32 2Z"/>
      <path class="${snowy ? 'sc-snow' : 'sc-moss'}" d="M-26 -9 C-18 -15 -6 -16 4 -15 C-4 -12 -16 -10 -26 -9Z"/>
      ${gameIcon(GAME_ICONS.trophy, -20, -52, 40, state === 'locked' ? 'nd-muted' : '')}`;
  } else if (water) {
    inner = pad(state, state === 'current' ? 36 : 31);
  } else if (biome.id === 'mountains') {
    inner = slab(state, state === 'current' ? 36 : 31);
  } else {
    inner = stump(state, state === 'current' ? 35 : 30, biome.id === 'winter' ? 'snow' : biome.id === 'autumn' ? 'autumn' : 'plain');
  }
  const glow = state === 'current' ? `<ellipse class="nd-glow" cy="${water ? 3 : 15}" rx="40" ry="16"/>` : '';
  const sparks = state === 'current'
    ? [[-40, -16, 0], [38, -22, 0.6], [30, 18, 1.2], [-34, 16, 1.8]].map(([x, y, d]) => `<path class="nd-spark" style="animation-delay:${d}s" transform="translate(${x} ${y})" d="M0 -5 C.6 -1 1 -.6 5 0 C1 .6 .6 1 0 5 C-.6 1 -1 .6 -5 0 C-1 -.6 -.6 -1 0 -5Z"/>`).join('')
    : '';
  return `<svg class="nd-art" viewBox="-50 -52 100 92" width="100" height="92" aria-hidden="true">${glow}<g class="${water && kind !== 'chest' ? 'nd-float' : ''}">${inner}</g>${sparks}</svg>`;
}

/* ——— Сцена юнита ———————————————————————————————————————— */

/** Ширина сцены: на телефоне видна середина, на широком экране — края. */
export const SCENE_HALF = 320;
export const SCENE_TOP = 70;

export function sceneArt({ biome, nodes, height, seed, mascot, home }: SceneInput): { back: string; front: string } {
  animN = seed % 97;
  const r = rng(seed);
  const pts = nodes.map((n) => ({ x: n.x, y: n.y }));
  const mx = mascot ? mascot.side * 108 : 0;
  const lex = mascot ? { x0: mx - 64, x1: mx + 64, y0: mascot.top - 10, y1: mascot.top + 128 } : null;
  const denBox = mascot && home && biome.id === 'forest'
    ? { x0: mascot.side < 0 ? mx - 112 : mx - 20, x1: mascot.side < 0 ? mx + 20 : mx + 112, y0: mascot.top + 40, y1: mascot.top + 128 }
    : null;
  const hints = nodes.filter((n) => n.state === 'current').map((n) => ({ x0: n.x - 64, x1: n.x + 64, y0: n.y - 104, y1: n.y - 20 }));

  // Точки тропы — чтобы природа не вырастала на тропинке
  const samples: CurvePoint[] = [];
  for (let i = 1; i < pts.length; i++) for (let t = 0; t <= 1.0001; t += 0.1) samples.push(curve(pts[i - 1], pts[i], t));

  const inBox = (x: number, y: number, b: { x0: number; x1: number; y0: number; y1: number } | null): boolean =>
    !!b && x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1;
  const free = (x: number, y: number, gap = 20): boolean => {
    if (pts.some((p) => Math.abs(p.x - x) < 54 && y > p.y - 58 && y < p.y + 52)) return false;
    if (samples.some((p) => Math.hypot(p.x - x, p.y - y) < gap)) return false;
    if (inBox(x, y, lex) || inBox(x, y, denBox) || hints.some((b) => inBox(x, y, b))) return false;
    return true;
  };
  const place = (count: number, draw: (x: number, y: number, i: number) => string, opts: { xr?: number; xMin?: number; y0?: number; y1?: number; gap?: number } = {}): string => {
    const { xr = 195, xMin = 0, y0 = 14, y1 = height - 8, gap = 20 } = opts;
    let out = '';
    for (let i = 0; i < count; i++) {
      for (let k = 0; k < 30; k++) {
        const side = r() < 0.5 ? -1 : 1;
        const x = side * (xMin + r() * (xr - xMin));
        const y = y0 + r() * (y1 - y0);
        if (free(x, y, gap)) {
          out += draw(x, y, i);
          break;
        }
      }
    }
    return out;
  };
  /** Ряды крупных деревьев/скал вдоль краёв: на телефоне видны ближние, на широком экране — и дальние. */
  const nearMascot = (x: number, y: number): boolean =>
    !!mascot && Math.abs(x - mx) < (denBox ? 150 : 100) && y > mascot.top - 10 && y < mascot.top + 215;
  const edges = (draw: (x: number, y: number, i: number) => string, step = 200, near = 182, far = 268): string => {
    let out = '';
    let i = 0;
    for (const side of [-1, 1]) {
      for (let y = 30 + r() * 60 + (side > 0 ? step / 2 : 0); y < height + 40; y += step * (0.8 + r() * 0.4)) {
        const x = side * (near + r() * 14);
        if (!nearMascot(x, y)) out += draw(x, y, i++);
        const xf = side * (far + r() * 30);
        out += draw(xf, y + step * 0.45, i++);
      }
    }
    return out;
  };

  let back = '';
  let front = '';

  /* Тропинка */
  if (!biome.water && pts.length) {
    const walkedTo = nodes.findIndex((n) => n.state !== 'done');
    const cut = walkedTo === -1 ? pts.length - 1 : walkedTo;
    const walked = pts.slice(0, cut + 1);
    const rest = pts.slice(cut);
    const kind = biome.id === 'mountains' ? 'gravel' : biome.id === 'winter' ? 'snow' : 'dirt';
    if (walked.length > 1) {
      const d = trailPath(walked, 120, 0);
      back += `<path class="tr-edge tr-edge--${kind}" d="${d}"/><path class="tr-path tr-path--${kind}" d="${d}"/>`;
    }
    if (rest.length > 1 || walked.length <= 1) {
      const d = trailPath(walked.length > 1 ? rest : pts, walked.length > 1 ? 0 : 120, 60);
      back += `<path class="tr-edge tr-edge--${kind} tr-rest" d="${d}"/><path class="tr-path tr-path--${kind} tr-rest" d="${d}"/>`;
    }
    // Следы лапок вдоль пройденной части
    if (walked.length > 1) {
      let paws = '';
      let acc = 0;
      let side = 1;
      for (let i = 1; i < walked.length; i++) {
        let prev = curve(walked[i - 1], walked[i], 0);
        for (let t = 0.02; t <= 1.0001; t += 0.02) {
          const p = curve(walked[i - 1], walked[i], t);
          acc += Math.hypot(p.x - prev.x, p.y - prev.y);
          prev = p;
          if (acc < 21) continue;
          acc = 0;
          if (pts.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 30)) continue;
          const len = Math.hypot(p.dx, p.dy) || 1;
          side = -side;
          paws += paw(p.x - (p.dy / len) * 4.5 * side, p.y + (p.dx / len) * 4.5 * side, (Math.atan2(p.dy, p.dx) * 180) / Math.PI + 90);
        }
      }
      back += `<g class="tr-paws tr-paws--${kind}">${paws}</g>`;
    }
    if (kind === 'gravel') back += place(14, (x, y) => stone(x, y, 0.4 + r() * 0.3), { xr: 140, gap: 2 });
  } else if (pts.length) {
    for (let i = 1; i < pts.length; i++) {
      const p = curve(pts[i - 1], pts[i], 0.5);
      back += `<ellipse class="nd-wave" cx="${f(p.x)}" cy="${f(p.y)}" rx="9" ry="4"/>`;
    }
  }

  /* Где стоит Лекси */
  if (mascot) {
    const fy = mascot.top + 112;
    // Нора чуть дальше от тропы, чем Лекси, вход повёрнут к тропинке
    if (home && biome.id === 'forest') back += den(mx + mascot.side * 42, fy + 2, mascot.side > 0);
    else if (biome.id === 'lake') back += at(mx, fy, '<ellipse class="sc-rock-d" cx="2" cy="4" rx="44" ry="13"/><ellipse class="sc-rock" rx="40" ry="11"/><path class="sc-moss" d="M-32 -4 C-18 -10 12 -11 30 -5 C8 -7 -14 -7 -32 -4Z"/>');
    else if (biome.id === 'winter') back += snowdrift(mx, fy + 4, 1.7);
    else if (biome.id === 'mountains') back += at(mx, fy, '<ellipse class="sc-rock-d" cx="2" cy="5" rx="46" ry="12"/><ellipse class="sc-rock" rx="42" ry="10"/><ellipse class="sc-rock-l" cx="-8" cy="-2" rx="26" ry="5"/>');
    else if (biome.id === 'autumn') back += at(mx, fy, `${leaf(-30, 2, 'orange', 20, 1.4)}${leaf(-18, 4, 'red', -40, 1.3)}${leaf(24, 3, 'yellow', 60, 1.4)}${leaf(34, 0, 'orange', -10, 1.2)}${leaf(-4, 6, 'red', 80, 1.2)}`);
  }

  /* Природа локации */
  switch (biome.id) {
    case 'forest': {
      front += edges((x, y, i) => (i % 3 === 1 ? oak(x, y, 0.95 + r() * 0.15, 'green', i % 2 === 0) : pine(x, y, 0.95 + r() * 0.15, false, i % 2 === 0)), 190);
      front += place(3, (x, y) => bush(x, y, 0.8 + r() * 0.15), { xMin: 130, xr: 175, gap: 26 });
      back += place(5, (x, y) => mushroom(x, y, 0.8 + r() * 0.4), { xr: 160, gap: 22 });
      back += place(16, (x, y) => tuft(x, y, 0.8 + r() * 0.5), { xr: 180, gap: 18 });
      back += place(12, (x, y, i) => flower(x, y, FLOWERS[i % 3], 0.9), { xr: 180, gap: 16 });
      back += place(8, (x, y) => stone(x, y, 0.5 + r() * 0.5), { xr: 150, gap: 16 });
      front += place(8, (x, y) => firefly(x, y - 20), { xr: 175, gap: 6 });
      break;
    }
    case 'field': {
      front += edges((x, y, i) => (i % 4 === 3 ? oak(x, y, 0.85, 'green', false) : wheat(x, y, 0.95 + r() * 0.3)), 120);
      front += place(2, (x, y) => hay(x, y, 0.85 + r() * 0.1), { xMin: 140, xr: 180, gap: 30 });
      back += place(26, (x, y, i) => flower(x, y, FLOWERS[i % FLOWERS.length], 0.8 + r() * 0.4), { xr: 185, gap: 15 });
      back += place(14, (x, y) => tuft(x, y, 0.8 + r() * 0.5), { xr: 185, gap: 16 });
      front += butterfly(-120, height * 0.15, '#FFB84D') + butterfly(110, height * 0.5, '#9C7BFF') + butterfly(-90, height * 0.82, '#FF8FB1');
      front += place(6, (x, y) => firefly(x, y - 20), { xr: 175, gap: 6 });
      break;
    }
    case 'lake': {
      front += edges((x, y) => reed(x, y, 0.95 + r() * 0.3), 150);
      front += place(1, (x, y) => duck(x, y), { xMin: 120, xr: 170, gap: 30 });
      // Мостки только справа: доски уходят за край экрана
      for (let y = height * 0.35; y < height * 0.75; y += 24) {
        if (free(158, y, 30) && free(190, y, 30) && free(158, y + 30, 30)) {
          back += pier(150, y);
          break;
        }
      }
      back += place(7, (x, y, i) => padDecor(x, y, 0.8 + r() * 0.4, i % 3 === 0), { xr: 185, gap: 24 });
      back += place(16, (x, y) => ripple(x, y, 0.8 + r() * 0.6), { xr: 190, gap: 18 });
      front += place(5, (x, y) => firefly(x, y - 20), { xr: 175, gap: 6 });
      break;
    }
    case 'autumn': {
      const tones: Tone[] = ['orange', 'red', 'yellow'];
      front += edges((x, y, i) => (i % 4 === 2 ? pine(x, y, 0.95, false, false) : oak(x, y, 0.95 + r() * 0.15, tones[i % 3], i % 2 === 0)), 185);
      back += place(28, (x, y, i) => leaf(x, y, tones[i % 3], r() * 360, 0.9 + r() * 0.5), { xr: 190, gap: 10 });
      back += place(5, (x, y) => mushroom(x, y, 0.85 + r() * 0.35, 'boletus'), { xr: 160, gap: 22 });
      back += place(12, (x, y) => tuft(x, y, 0.8 + r() * 0.5, 'sc-tuft-dry'), { xr: 185, gap: 18 });
      back += place(1, (x, y) => hedgehog(x, y, 1), { xMin: 70, xr: 150, gap: 30 });
      front += place(7, (x, y, i) => fallingLeaf(x, y - 60, tones[i % 3]), { xr: 185, gap: 4 });
      break;
    }
    case 'mountains': {
      front += edges((x, y, i) => (i % 3 === 0 ? cliff(x, y + 20, 0.9 + r() * 0.2, x > 0) : pine(x, y, 0.75 + r() * 0.15, false, false)), 210);
      // Водопад с края, где нет узлов
      const rows = nodes.map((n, i) => ({ i, n })).filter(({ n }) => n.x <= 0);
      if (rows.length >= 3 && (!mascot || mascot.side < 0 || mascot.top > height * 0.6)) {
        const y0 = rows[1].n.y - 40;
        back += waterfall(162, y0, 120);
      }
      back += place(6, (x, y) => boulder(x, y, 0.45 + r() * 0.3), { xr: 180, gap: 26 });
      back += place(16, (x, y) => edelweiss(x, y, 0.9 + r() * 0.4), { xr: 185, gap: 15 });
      back += place(12, (x, y) => tuft(x, y, 0.8 + r() * 0.4), { xr: 185, gap: 16 });
      break;
    }
    case 'winter': {
      front += edges((x, y, i) => (i % 4 === 3 ? bush(x, y, 0.85, false, true) : pine(x, y, 0.95 + r() * 0.15, true, i % 2 === 0)), 185);
      back += place(1, (x, y) => snowman(x, y, 0.9), { xMin: 120, xr: 170, gap: 34 });
      back += place(1, (x, y) => icePond(x, y, 0.9), { xMin: 130, xr: 160, gap: 40 });
      back += place(8, (x, y) => snowdrift(x, y, 0.5 + r() * 0.5), { xr: 185, gap: 22 });
      back += place(8, (x, y) => tuft(x, y, 0.7 + r() * 0.3, 'sc-tuft-frost'), { xr: 185, gap: 16 });
      front += place(16, (x, y) => snowflake(x, y - 80, 1.2 + r() * 1.4), { xr: 195, gap: 2 });
      break;
    }
  }

  const box = `viewBox="${-SCENE_HALF} ${-SCENE_TOP} ${SCENE_HALF * 2} ${height + SCENE_TOP * 2}" width="${SCENE_HALF * 2}" height="${height + SCENE_TOP * 2}"`;
  return {
    back: `<svg class="scene-art" ${box} aria-hidden="true">${back}</svg>`,
    front: `<svg class="scene-art" ${box} aria-hidden="true">${front}</svg>`,
  };
}

/* ——— Переход между локациями ————————————————————————————— */

function wave(y: number, amp: number, phase: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let x = 0; x <= 400; x += 25) pts.push([x, y + Math.sin(x / 38 + phase) * amp + Math.sin(x / 17 + phase * 2) * amp * 0.4]);
  return pts;
}
const line = (pts: Array<[number, number]>): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join(' ');

/** Полоса сверху юнита: край прошлой локации, у воды — песчаный берег. */
export function edgeArt(prev: Biome, next: Biome, seed: number): string {
  const r = rng(seed);
  const top = wave(22, 4, r() * 6);
  let out = `<path class="edge-${prev.id}" d="M0 0 L400 0 ${line(top.slice().reverse()).replace('M', 'L')}Z"/>`;
  if (prev.water || next.water) {
    const sand = wave(42, 4, r() * 6);
    out += `<path class="edge-sand" d="${line(top)} ${line(sand.slice().reverse()).replace('M', 'L')}Z"/>`;
    out += `<path class="edge-foam" d="${line(next.water ? sand : top)}"/>`;
  } else if (next.id === 'winter' || prev.id === 'winter') {
    out += `<path class="edge-frost" d="${line(top)}"/>`;
  }
  return `<svg class="edge-art" viewBox="0 0 400 64" preserveAspectRatio="none" aria-hidden="true">${out}</svg>`;
}

/* ——— Значки локаций для табличек ——————————————————————— */

export const BIOME_ICONS: Record<BiomeId, string> = {
  forest: '<path d="M16 3 C8 9 6 17 9 23 C11 27 15 29 16 29 C17 29 21 27 23 23 C26 17 24 9 16 3Z" fill="#4CAF50"/><path d="M16 8 V27 M16 14 L11 11 M16 19 L21 15 M16 23 L12 20" stroke="#2E7D32" stroke-width="1.8" stroke-linecap="round" fill="none"/>',
  field: '<path d="M16 29 V10" stroke="#C99A2E" stroke-width="2" stroke-linecap="round"/><g fill="#F2B735"><ellipse cx="13" cy="9" rx="2.6" ry="4.4" transform="rotate(-25 13 9)"/><ellipse cx="19" cy="9" rx="2.6" ry="4.4" transform="rotate(25 19 9)"/><ellipse cx="13" cy="15" rx="2.6" ry="4.4" transform="rotate(-25 13 15)"/><ellipse cx="19" cy="15" rx="2.6" ry="4.4" transform="rotate(25 19 15)"/><ellipse cx="13" cy="21" rx="2.6" ry="4.4" transform="rotate(-25 13 21)"/><ellipse cx="19" cy="21" rx="2.6" ry="4.4" transform="rotate(25 19 21)"/><ellipse cx="16" cy="4.5" rx="2.4" ry="4"/></g>',
  lake: '<path d="M16 4 C11 11 8 15 8 20 A8 8 0 0 0 24 20 C24 15 21 11 16 4Z" fill="#35A6E0"/><path d="M12 20 A4 4 0 0 0 16 24" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>',
  autumn: '<path d="M16 3 L18.6 9.4 L24.4 7 L22.6 13 L28.6 14.4 L23.2 18 L25.8 23.6 L19.6 22 L16 28.6 L12.4 22 L6.2 23.6 L8.8 18 L3.4 14.4 L9.4 13 L7.6 7 L13.4 9.4Z" fill="#F08A2E"/><path d="M16 10 V29" stroke="#B5561B" stroke-width="1.8" stroke-linecap="round"/>',
  mountains: '<path d="M2 26 L12 9 L17 16 L21 11 L30 26Z" fill="#8E99A6"/><path d="M12 9 L15.4 14.8 L13.4 13.6 L11 15.6 L9.6 13.4Z M21 11 L24 16 L22 15 L20.4 16.4 L19.4 13.4Z" fill="#fff"/><path d="M2 26 L12 9 L10 26Z" fill="#A9B3BE"/>',
  winter: '<path d="M16 3 V29 M4.7 9.5 L27.3 22.5 M27.3 9.5 L4.7 22.5" stroke="#5AA9E6" stroke-width="2.4" stroke-linecap="round"/><path d="M13 5.5 L16 8.5 L19 5.5 M13 26.5 L16 23.5 L19 26.5 M5.4 13.4 L9.4 12.2 L8.4 8.2 M26.6 18.6 L22.6 19.8 L23.6 23.8 M26.6 13.4 L22.6 12.2 L23.6 8.2 M5.4 18.6 L9.4 19.8 L8.4 23.8" stroke="#5AA9E6" stroke-width="2" stroke-linecap="round" fill="none"/>',
};
