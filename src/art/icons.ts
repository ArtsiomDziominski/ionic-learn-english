/**
 * Игровые иконки learnenglisheasy.ru: огонь серии, кристаллы, жизни, XP…
 *
 * Как и Лекси, это SVG-строки с цветами в атрибутах: одна
 * разметка работает в компоненте GameIcon, на canvas карточки
 * «Поделиться» и не зависит от темы. Сетка 32×32, мягкие формы
 * без обводок — в одном стиле с персонажем.
 */

export const GAME_ICONS = {
  flame:
    '<path d="M16 2.5c.9 3.6 3.3 5.9 5.6 8.4 2.4 2.6 4.4 5.4 4.4 9.3 0 5.4-4.4 9.3-10 9.3S6 25.6 6 20.2c0-3.6 1.8-6.4 3.9-8.2.3 2.4 1.4 4 3 4.8C12.6 11.1 14 6.4 16 2.5z" fill="#FF9600"/>' +
    '<path d="M16 14.5c3.2 2.6 5.2 5 5.2 8.2 0 3.3-2.3 5.8-5.2 5.8s-5.2-2.5-5.2-5.8c0-2.2 1.1-3.8 2.4-4.9.2 1.4.9 2.4 1.9 2.8-.3-2.3.1-4.3.9-6.1z" fill="#FFC800"/>' +
    '<path d="M16 21.5c1.4 1.1 2.3 2.2 2.3 3.6 0 1.4-1 2.5-2.3 2.5s-2.3-1.1-2.3-2.5c0-1.4.9-2.5 2.3-3.6z" fill="#FFF3B0"/>',

  gem:
    '<path d="M9 5h14l6 8-13 15L3 13z" fill="#1CB0F6"/>' +
    '<path d="M3 13h9l4 15z" fill="#1590CC"/>' +
    '<path d="M29 13h-9l-4 15z" fill="#36BEFF"/>' +
    '<path d="M12 13h8l-4 15z" fill="#5CCBFF"/>' +
    '<path d="M9 5h14l-3 8h-8z" fill="#8FDEFF"/>' +
    '<path d="M9 5l3 8H3zM23 5l-3 8h9z" fill="#4FC8FF"/>' +
    '<path d="M11 7.5l1.2 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>',

  heart:
    '<path d="M16 28.5S2.5 20.6 2.5 11.6C2.5 7.3 5.8 4 10 4c2.6 0 4.8 1.4 6 3.5C17.2 5.4 19.4 4 22 4c4.2 0 7.5 3.3 7.5 7.6 0 9-13.5 16.9-13.5 16.9z" fill="#FF4B4B"/>' +
    '<path d="M16 28.5S2.5 20.6 2.5 11.6c0-.4 0-.8.1-1.2C4 18.3 16 25 16 25s12-6.7 13.4-14.6c.1.4.1.8.1 1.2 0 9-13.5 16.9-13.5 16.9z" fill="#E02E2E"/>' +
    '<ellipse cx="9.6" cy="10" rx="3.2" ry="2" transform="rotate(-32 9.6 10)" fill="#fff" opacity=".6"/>',

  bolt:
    '<path d="M18.5 2 6 18.2h9.2L12.6 30 26 13.4h-9.4z" fill="#FFC800"/>' +
    '<path d="M18.5 2 6 18.2h4.6L18 6.6z" fill="#FFE066"/>' +
    '<path d="M26 13.4 12.6 30l2.6-11.8h3.4z" fill="#F2A900"/>',

  star:
    '<path d="M16 2.8l3.9 8 8.8 1.2-6.4 6.1 1.6 8.7L16 22.6l-7.9 4.2 1.6-8.7-6.4-6.1 8.8-1.2z" fill="#FFC800"/>' +
    '<path d="M16 2.8v19.8l-7.9 4.2 1.6-8.7-6.4-6.1 8.8-1.2z" fill="#FFDA4D"/>',

  book:
    '<rect x="5" y="4" width="22" height="24" rx="3.5" fill="#1CB0F6"/>' +
    '<path d="M5 21.5h22V25a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="#1590CC"/>' +
    '<rect x="7.5" y="21.5" width="17" height="3.4" rx="1.4" fill="#fff"/>' +
    '<rect x="10" y="8.5" width="12" height="3" rx="1.5" fill="#DDF4FF"/>' +
    '<rect x="10" y="13.5" width="8" height="3" rx="1.5" fill="#DDF4FF"/>',

  dumbbell:
    '<rect x="8" y="14" width="16" height="4" rx="2" fill="#B9BED0"/>' +
    '<rect x="4.5" y="8.5" width="6" height="15" rx="3" fill="#7C5CFF"/>' +
    '<rect x="21.5" y="8.5" width="6" height="15" rx="3" fill="#7C5CFF"/>' +
    '<rect x="1.5" y="12" width="4" height="8" rx="2" fill="#5B3BE0"/>' +
    '<rect x="26.5" y="12" width="4" height="8" rx="2" fill="#5B3BE0"/>' +
    '<rect x="6" y="10.5" width="2" height="5" rx="1" fill="#B3A3FF"/>',

  trophy:
    '<path d="M9 7H5.6A2.6 2.6 0 0 0 3 9.6C3 13.3 5.6 16 9.8 16.2M23 7h3.4A2.6 2.6 0 0 1 29 9.6c0 3.7-2.6 6.4-6.8 6.6" fill="none" stroke="#F2A900" stroke-width="2.8" stroke-linecap="round"/>' +
    '<path d="M8.5 3.5h15V12a7.5 7.5 0 0 1-15 0z" fill="#FFC800"/>' +
    '<path d="M13.8 18.8h4.4v4.4h-4.4z" fill="#E5A800"/>' +
    '<rect x="8.5" y="23" width="15" height="5.5" rx="2.2" fill="#E5A800"/>' +
    '<rect x="11.5" y="25" width="9" height="1.8" rx=".9" fill="#FFE066"/>' +
    '<path d="M12.5 6.5v6" stroke="#FFF3B0" stroke-width="2.4" stroke-linecap="round"/>',

  chest:
    '<path d="M4 13.5a5.5 5.5 0 0 1 5.5-5.5h13a5.5 5.5 0 0 1 5.5 5.5v2H4z" fill="#D9843F"/>' +
    '<rect x="4" y="15" width="24" height="12.5" rx="2.6" fill="#B5652A"/>' +
    '<rect x="4" y="14" width="24" height="3.2" fill="#FFC800"/>' +
    '<path d="M8.5 8.4v19M23.5 8.4v19" stroke="#FFC800" stroke-width="2.2"/>' +
    '<rect x="13.5" y="12" width="5" height="7.5" rx="1.6" fill="#FFE066"/>' +
    '<rect x="15.2" y="14.6" width="1.6" height="2.8" rx=".8" fill="#8A4B19"/>',

  chestOpen:
    '<path d="M16 1l1.6 3.4L21 6l-3.4 1.6L16 11l-1.6-3.4L11 6l3.4-1.6z" fill="#FFE066"/>' +
    '<path d="M5 9.5 7.5 3h17L27 9.5z" fill="#D9843F"/>' +
    '<path d="M6 9.5h20l-1.3-4H7.3z" fill="#8A4B19" opacity=".35"/>' +
    '<rect x="4" y="15" width="24" height="12.5" rx="2.6" fill="#B5652A"/>' +
    '<path d="M4 12h24v4H4z" fill="#7A3F14"/>' +
    '<circle cx="11" cy="13.5" r="2.4" fill="#1CB0F6"/><circle cx="16.5" cy="12.8" r="2.6" fill="#FFC800"/><circle cx="21.5" cy="13.6" r="2.2" fill="#FF4B4B"/>' +
    '<rect x="4" y="15.5" width="24" height="3" fill="#FFC800"/>' +
    '<path d="M8.5 15.5v12M23.5 15.5v12" stroke="#FFC800" stroke-width="2.2"/>',

  lock:
    '<path d="M10.5 14.5V10a5.5 5.5 0 0 1 11 0v4.5" fill="none" stroke="#8F97AE" stroke-width="3.2"/>' +
    '<rect x="6" y="14" width="20" height="15" rx="4" fill="#B9BED0"/>' +
    '<circle cx="16" cy="20.5" r="2.3" fill="#6F7690"/>' +
    '<rect x="15" y="21" width="2" height="4.2" rx="1" fill="#6F7690"/>',

  target:
    '<circle cx="16" cy="16" r="13.5" fill="#FF4B4B"/>' +
    '<circle cx="16" cy="16" r="9.5" fill="#fff"/>' +
    '<circle cx="16" cy="16" r="5.5" fill="#FF4B4B"/>' +
    '<circle cx="16" cy="16" r="2" fill="#fff"/>',

  headphones:
    '<path d="M5 19v-3a11 11 0 0 1 22 0v3" fill="none" stroke="#7C5CFF" stroke-width="3.2" stroke-linecap="round"/>' +
    '<rect x="3" y="17" width="7.5" height="11.5" rx="3.2" fill="#7C5CFF"/>' +
    '<rect x="21.5" y="17" width="7.5" height="11.5" rx="3.2" fill="#7C5CFF"/>' +
    '<rect x="5.2" y="19.2" width="3" height="7" rx="1.5" fill="#B3A3FF"/>' +
    '<rect x="23.8" y="19.2" width="3" height="7" rx="1.5" fill="#B3A3FF"/>',

  keyboard:
    '<rect x="2.5" y="8" width="27" height="17.5" rx="4.2" fill="#8F97AE"/>' +
    '<rect x="2.5" y="8" width="27" height="15.5" rx="4.2" fill="#C7CCDB"/>' +
    '<g fill="#fff"><rect x="6" y="11.5" width="3" height="3" rx="1"/><rect x="10.5" y="11.5" width="3" height="3" rx="1"/><rect x="15" y="11.5" width="3" height="3" rx="1"/><rect x="19.5" y="11.5" width="3" height="3" rx="1"/><rect x="24" y="11.5" width="2.5" height="3" rx="1"/>' +
    '<rect x="7.5" y="16" width="3" height="3" rx="1"/><rect x="12" y="16" width="3" height="3" rx="1"/><rect x="16.5" y="16" width="3" height="3" rx="1"/><rect x="21" y="16" width="3" height="3" rx="1"/>' +
    '<rect x="10" y="20" width="12" height="2" rx="1"/></g>',

  puzzle:
    '<path d="M6 9.5h5.2a3.3 3.3 0 1 1 6.1 0h5.2v5.2a3.3 3.3 0 1 1 0 6.1v5.2H17.3a3.3 3.3 0 1 0-6.1 0H6V20.8a3.3 3.3 0 1 0 0-6.1z" fill="#58CC02"/>' +
    '<path d="M6 9.5h5.2a3.3 3.3 0 0 1 6.1 0H22.5v2H6z" fill="#7EE11F" opacity=".8"/>',

  sparkle:
    '<path d="M12 3c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z" fill="#FFC800"/>' +
    '<path d="M23 15.5c.5 3 1.5 4 4.5 4.5-3 .5-4 1.5-4.5 4.5-.5-3-1.5-4-4.5-4.5 3-.5 4-1.5 4.5-4.5z" fill="#FFB020"/>' +
    '<circle cx="8" cy="23" r="2" fill="#FFE066"/>',

  crown:
    '<path d="M4 10.5l6.2 5.2L16 6l5.8 9.7 6.2-5.2-2.2 13.5H6.2z" fill="#FFC800"/>' +
    '<rect x="6" y="23" width="20" height="5" rx="2" fill="#E5A800"/>' +
    '<circle cx="4" cy="10.5" r="2" fill="#FFC800"/><circle cx="16" cy="6" r="2" fill="#FFC800"/><circle cx="28" cy="10.5" r="2" fill="#FFC800"/>' +
    '<circle cx="16" cy="17.5" r="2.4" fill="#FF4B4B"/><circle cx="10" cy="19" r="1.6" fill="#1CB0F6"/><circle cx="22" cy="19" r="1.6" fill="#1CB0F6"/>',

  calendar:
    '<rect x="4" y="6" width="24" height="22.5" rx="4.5" fill="#fff"/>' +
    '<rect x="4" y="6" width="24" height="22.5" rx="4.5" fill="none" stroke="#E2E1EE" stroke-width="2"/>' +
    '<path d="M4 10.5A4.5 4.5 0 0 1 8.5 6h15A4.5 4.5 0 0 1 28 10.5V13H4z" fill="#FF4B4B"/>' +
    '<rect x="9" y="3.5" width="2.6" height="6" rx="1.3" fill="#9A3B3B"/><rect x="20.4" y="3.5" width="2.6" height="6" rx="1.3" fill="#9A3B3B"/>' +
    '<path d="M10.5 20.5l3.4 3.2 7.6-7.2" fill="none" stroke="#58CC02" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',

  freeze:
    '<rect x="4" y="4" width="24" height="24" rx="7" fill="#7CD3FF"/>' +
    '<path d="M4 18h24v3a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7z" fill="#4DBCF5"/>' +
    '<path d="M16 9v14M10 12.5l12 7M22 12.5l-12 7" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' +
    '<rect x="7.5" y="7" width="7" height="3" rx="1.5" fill="#fff" opacity=".7"/>',

  clock:
    '<circle cx="16" cy="16" r="13" fill="#1CB0F6"/>' +
    '<circle cx="16" cy="16" r="10" fill="#fff"/>' +
    '<path d="M16 10v6.5l4 2.5" fill="none" stroke="#1590CC" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',

  sun:
    '<g stroke="#FFB020" stroke-width="2.6" stroke-linecap="round"><path d="M16 2.5v3.5M16 26v3.5M2.5 16H6M26 16h3.5M6.5 6.5l2.4 2.4M23.1 23.1l2.4 2.4M6.5 25.5l2.4-2.4M23.1 8.9l2.4-2.4"/></g>' +
    '<circle cx="16" cy="16" r="7.5" fill="#FFC800"/>' +
    '<circle cx="13.8" cy="13.8" r="2.2" fill="#FFF3B0"/>',

  moon:
    '<path d="M20.5 3.5A12.5 12.5 0 1 0 28.5 21 10 10 0 0 1 20.5 3.5z" fill="#7C5CFF"/>' +
    '<path d="M20.5 3.5A12.5 12.5 0 0 0 9.4 24.2 10 10 0 0 1 20.5 3.5z" fill="#9B83FF"/>' +
    '<path d="M24.5 7.5l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z" fill="#FFC800"/>',

  home:
    '<path d="M4 15 16 4.5 28 15" fill="none" stroke="#FF4B4B" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M7 14.5 16 7l9 7.5V26a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 7 26z" fill="#FFB14E"/>' +
    '<rect x="13" y="18.5" width="6" height="10" rx="1.6" fill="#B5652A"/>' +
    '<rect x="21" y="5.5" width="3.2" height="6" rx="1" fill="#FF4B4B"/>',

  medal:
    '<path d="M9 2.5h5l3.5 9h-5zM23 2.5h-5l-3.5 9h5z" fill="#1CB0F6"/>' +
    '<path d="M9 2.5h5l3.5 9h-5z" fill="#FF4B4B"/>' +
    '<circle cx="16" cy="20" r="9" fill="#FFC800"/>' +
    '<circle cx="16" cy="20" r="6" fill="#FFE066"/>' +
    '<path d="M16 16.2l1.2 2.4 2.6.4-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.8 2.6-.4z" fill="#F2A900"/>',

  check:
    '<circle cx="16" cy="16" r="13.5" fill="#58CC02"/>' +
    '<path d="M9.5 16.5l4.5 4.3 8.5-9" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',

  cards:
    '<rect x="9" y="3.5" width="18" height="22" rx="3.5" fill="#B3A3FF" transform="rotate(12 18 14.5)"/>' +
    '<rect x="6" y="6" width="18" height="22" rx="3.5" fill="#7C5CFF"/>' +
    '<rect x="9.5" y="11" width="11" height="3" rx="1.5" fill="#fff"/>' +
    '<rect x="9.5" y="16.5" width="7" height="3" rx="1.5" fill="#E6E0FF"/>',
} as const;

export type GameIconName = keyof typeof GAME_ICONS;

/** Полный SVG иконки — для canvas и мест вне Vue. */
export function gameIconSvg(name: GameIconName, size = 32): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">${GAME_ICONS[name]}</svg>`;
}
