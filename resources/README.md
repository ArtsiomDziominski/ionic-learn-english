# Ресурсы приложения

Исходники иконок и заставок. Их не рисуют вручную: они генерируются
из кода талисмана Лекси (`src/art/lexi.ts`), поэтому иконка всегда
совпадает с персонажем в приложении.

## Как обновить иконки и заставки

```bash
npm run generate:brand    # пересоздаёт файлы в этой папке и фавиконки сайта
npm run generate:assets   # раскладывает их по Android и PWA (@capacitor/assets)
npm run cap:sync:android  # переносит ресурсы в Android-проект
```

## Файлы

`@capacitor/assets` работает в режиме полного контроля — фон каждого
изображения задан в самом файле, флаги цветов не нужны.

| Файл | Размер | Назначение |
|---|---|---|
| `icon-only.png` | 1024×1024 | Обычная иконка (старые Android, PWA): мордочка на фиолетовом фоне |
| `icon-foreground.png` | 1024×1024 | Передний слой adaptive icon: мордочка на прозрачном фоне |
| `icon-background.png` | 1024×1024 | Задний слой adaptive icon: фирменный фиолетовый |
| `splash.png` | 2732×2732 | Заставка светлой темы: Лекси машет лапой на белом |
| `splash-dark.png` | 2732×2732 | Заставка тёмной темы: то же на фоне `#131022` |

Скрипт `generate:brand` также обновляет `public/favicon.png` (512×512) и
`public/favicon.ico` (48×48).

## Что генерирует `generate:assets`

### Android
- `android/app/src/main/res/mipmap-*/ic_launcher*.png` — иконки, включая слои adaptive icon
- `android/app/src/main/res/drawable-*/splash.png` — заставки всех ориентаций и плотностей, в том числе для тёмной темы

### PWA
- `public/assets/icons/icon-*.webp` — иконки для `manifest.json`
