# Ресурсы приложения

Эта папка содержит исходные файлы для генерации иконок и splash screens приложения.

## Требования к файлам

### icon.png
- **Размер:** 1024x1024 пикселей
- **Формат:** PNG
- **Рекомендации:** 
  - Используйте прозрачный фон для лучшего результата на Android Adaptive Icons
  - Убедитесь, что важные элементы находятся в центральной области (избегайте важного контента по краям)
  - Минимальная безопасная зона: 512x512 пикселей в центре

### splash.png
- **Размер:** 2732x2732 пикселей
- **Формат:** PNG
- **Рекомендации:**
  - Размещайте логотип в центре
  - Используйте простой фон (цвет фона настраивается в команде генерации)

## Генерация ресурсов

После изменения файлов `icon.png` или `splash.png`, запустите команду для генерации ресурсов:

```bash
npm run generate:assets
```

Эта команда автоматически создаст:
- Иконки для Android (все необходимые размеры и adaptive icons)
- Splash screens для Android (все ориентации и размеры, включая темную тему)
- PWA иконки для веб-версии (в формате webp)

## Настройка цветов

По умолчанию используются следующие цвета:
- **Фон иконки (светлая тема):** #ffffff (белый)
- **Фон иконки (темная тема):** #000000 (черный)
- **Фон splash screen (светлая тема):** #ffffff (белый)
- **Фон splash screen (темная тема):** #000000 (черный)

Чтобы изменить цвета, отредактируйте скрипт `generate:assets` в файле `package.json`.

## Что генерируется

### Android
- `android/app/src/main/res/mipmap-*/ic_launcher.png` - обычные иконки
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png` - круглые иконки
- `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png` - foreground для adaptive icons
- `android/app/src/main/res/mipmap-*/ic_launcher_background.png` - background для adaptive icons
- `android/app/src/main/res/drawable-*/splash.png` - splash screens

### PWA (Web)
- `public/assets/icons/icon-*.webp` - иконки разных размеров для PWA

## После генерации

1. Для Android: пересоберите приложение
   ```bash
   npm run build
   npx cap sync android
   ```

2. Для веб-версии: пересоберите проект
   ```bash
   npm run build
   ```

3. Проверьте результат на устройстве или эмуляторе

