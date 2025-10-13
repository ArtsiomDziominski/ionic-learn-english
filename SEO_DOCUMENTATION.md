# Документация по SEO настройкам

## Обзор выполненной работы

Проект полностью оптимизирован для поисковых систем (SEO) с использованием современных практик и стандартов.

---

## 1. Основные мета-теги (index.html)

### Базовые мета-теги
- ✅ Title tag с ключевыми словами
- ✅ Meta description (160-320 символов)
- ✅ Meta keywords
- ✅ Meta author
- ✅ Meta robots (index, follow)
- ✅ Canonical URL
- ✅ Language meta tag

### Open Graph (Facebook, LinkedIn)
- ✅ og:type
- ✅ og:url
- ✅ og:title
- ✅ og:description
- ✅ og:image
- ✅ og:locale (ru_RU)
- ✅ og:site_name

### Twitter Cards
- ✅ twitter:card (summary_large_image)
- ✅ twitter:title
- ✅ twitter:description
- ✅ twitter:image
- ✅ twitter:url

### PWA мета-теги
- ✅ theme-color
- ✅ apple-mobile-web-app-capable
- ✅ apple-mobile-web-app-title
- ✅ apple-mobile-web-app-status-bar-style
- ✅ manifest.json

---

## 2. Структурированные данные (Schema.org JSON-LD)

Созданы composables для различных типов структурированных данных:

### `src/composables/useStructuredData.ts`

#### WebApplication Schema
- Для главной страницы приложения
- Описание образовательного приложения
- Информация о бесплатности (price: 0)
- Список функций

#### Article Schema
- Для страниц статей
- Информация об авторе
- Даты публикации и изменения
- Publisher information

#### Breadcrumb Schema
- Навигационные хлебные крошки
- Улучшает отображение в поисковой выдаче

#### Organization Schema
- Информация об организации
- Логотип и социальные сети

#### Course Schema
- Для образовательного контента
- Информация о провайдере
- Режим обучения (онлайн)

---

## 3. Динамические мета-теги

### `src/composables/useSEO.ts`

Созданы функции для управления SEO на всех страницах:

#### `useSEO(config)`
Универсальная функция для установки мета-тегов:
- Title
- Description
- Keywords
- Open Graph теги
- Twitter Cards
- Canonical URL

#### `useArticleSEO(article)`
Специализированная функция для статей:
- Автоматически добавляет article:published_time
- Автоматически добавляет article:modified_time
- Устанавливает og:type = 'article'

---

## 4. Настройка SEO по страницам

### Главная страница (`/words`)
**Файл:** `src/views/Tab1Page.vue`
- ✅ Title: "Изучение английских слов онлайн тренажер бесплатно"
- ✅ Ключевые слова: английские слова, тренажер слов, карточки английского
- ✅ WebApplication Schema
- ✅ Canonical URL

### Словарь (`/vocabulary`)
**Файл:** `src/views/vocabulary/VocabularyView.vue`
- ✅ Title: "Мой словарь английских слов"
- ✅ Описание персонального словаря
- ✅ Ключевые слова для словаря

### Статьи (`/article`)
**Файл:** `src/views/Article/ArticlesPage.vue`
- ✅ Title: "Статьи для изучения английского языка"
- ✅ Ключевые слова: статьи, методы изучения
- ✅ Расширенное описание

### Страница статьи (`/article/:id`)
**Файл:** `src/views/Article/ArticlePage.vue`
- ✅ Динамические мета-теги из JSON
- ✅ Article Schema
- ✅ Breadcrumb Schema
- ✅ Open Graph для статей
- ✅ Twitter Cards для статей

### Настройки (`/settings`)
**Файл:** `src/views/SettingsPage.vue`
- ✅ Title: "Настройки"
- ✅ Базовое описание

---

## 5. Sitemap.xml

**Файл:** `public/sitemap.xml`

### Включены все страницы:
- Главная (/)
- Изучение слов (/words)
- Словарь (/vocabulary)
- Список словаря (/vocabulary/list)
- Статьи (/article)
- Настройки (/settings)
- Все статьи из списка (6 статей)

### Параметры для каждого URL:
- `<loc>` - URL страницы
- `<lastmod>` - Дата последнего изменения
- `<changefreq>` - Частота изменений (daily/weekly/monthly)
- `<priority>` - Приоритет страницы (0.5-1.0)

---

## 6. Robots.txt

**Файл:** `public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://www.learnenglisheasy.ru/sitemap.xml
```

- Открыт доступ для всех роботов
- Указан путь к sitemap

---

## 7. PWA Manifest

**Файл:** `public/manifest.json`

### Параметры:
- ✅ name и short_name
- ✅ description
- ✅ start_url: "/"
- ✅ display: "standalone"
- ✅ theme_color и background_color
- ✅ icons (512x512)
- ✅ categories: ["education", "productivity"]
- ✅ lang: "ru"

---

## 8. Верификация поисковых систем

### Google Search Console
- ✅ Google Site Verification установлена
- ✅ Meta tag: `wdOAEkIei30IdlfirH3jDhE-ESCxqFE6_RaVjbC7Kyw`

---

## 9. Рекомендации по дальнейшему улучшению

### Контент
1. Добавьте уникальные изображения для каждой статьи (og:image)
2. Создайте изображение для Open Graph (размер 1200x630px)
3. Добавьте даты публикации и обновления статей

### Технические улучшения
1. Настройте Google Analytics или Yandex.Metrica
2. Добавьте structured data для FAQ (если есть)
3. Настройте hreflang для других языков (если планируется)
4. Добавьте VideoObject schema, если будут видео

### Производительность
1. Оптимизируйте изображения (используйте WebP)
2. Настройте lazy loading для изображений
3. Минифицируйте CSS и JS
4. Используйте CDN для статических ресурсов

### Контент маркетинг
1. Регулярно добавляйте новые статьи
2. Обновляйте sitemap.xml при добавлении статей
3. Создайте внутренние ссылки между статьями
4. Добавьте разделы с комментариями (если планируется)

---

## 10. Использование composables

### Пример использования в новой странице:

```typescript
<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '@/composables/useSEO';
import { useCourseSchema } from '@/composables/useStructuredData';

onMounted(() => {
  // Базовые мета-теги
  useSEO({
    title: 'Название страницы',
    description: 'Описание страницы',
    keywords: 'ключевые, слова, через, запятую',
    url: 'https://www.learnenglisheasy.ru/your-page'
  });
  
  // Структурированные данные
  useCourseSchema({
    name: 'Название курса',
    description: 'Описание курса',
    courseMode: 'online'
  });
});
</script>
```

---

## 11. Проверка SEO

### Инструменты для проверки:
1. **Google Search Console** - мониторинг индексации
2. **Google PageSpeed Insights** - производительность
3. **Google Rich Results Test** - проверка структурированных данных
4. **Yandex Webmaster** - для русскоязычной аудитории
5. **Schema.org Validator** - проверка JSON-LD
6. **Facebook Sharing Debugger** - проверка Open Graph
7. **Twitter Card Validator** - проверка Twitter Cards

### Ссылки:
- https://search.google.com/search-console
- https://pagespeed.web.dev/
- https://search.google.com/test/rich-results
- https://webmaster.yandex.ru/
- https://validator.schema.org/
- https://developers.facebook.com/tools/debug/
- https://cards-dev.twitter.com/validator

---

## 12. Важные файлы

```
проект/
├── index.html                              # Основные мета-теги
├── public/
│   ├── sitemap.xml                        # Карта сайта
│   ├── robots.txt                         # Правила для роботов
│   ├── manifest.json                      # PWA manifest
│   └── google17af7d3f79455626.html       # Google verification
├── src/
│   ├── composables/
│   │   ├── useSEO.ts                     # Динамические мета-теги
│   │   └── useStructuredData.ts          # Структурированные данные
│   └── views/
│       ├── Tab1Page.vue                   # Главная
│       ├── Article/
│       │   ├── ArticlesPage.vue          # Список статей
│       │   └── ArticlePage.vue           # Страница статьи
│       ├── vocabulary/
│       │   └── VocabularyView.vue        # Словарь
│       └── SettingsPage.vue              # Настройки
```

---

## Заключение

Проект полностью оптимизирован для поисковых систем Google и Yandex. Все современные стандарты SEO соблюдены:
- ✅ Мета-теги и Open Graph
- ✅ Структурированные данные Schema.org
- ✅ Sitemap и Robots.txt
- ✅ PWA поддержка
- ✅ Canonical URLs
- ✅ Динамические мета-теги для всех страниц

Следующий шаг - регистрация в Google Search Console и Yandex Webmaster для мониторинга результатов.

