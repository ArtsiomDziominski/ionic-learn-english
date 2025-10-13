# SEO Composables - Руководство по использованию

## Обзор

Эта папка содержит два основных composable для управления SEO:
- `useSEO.ts` - для мета-тегов
- `useStructuredData.ts` - для структурированных данных

---

## useSEO.ts

### Основная функция: `useSEO(config)`

#### Параметры:
```typescript
interface SEOConfig {
  title: string;           // Обязательно - заголовок страницы
  description: string;     // Обязательно - описание страницы
  keywords?: string;       // Необязательно - ключевые слова
  image?: string;         // Необязательно - изображение для соц.сетей
  url?: string;           // Необязательно - URL страницы
  type?: 'website' | 'article';  // Необязательно - тип контента
  author?: string;        // Необязательно - автор
  publishedTime?: string; // Необязательно - дата публикации
  modifiedTime?: string;  // Необязательно - дата изменения
}
```

#### Пример использования:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '@/composables/useSEO';

onMounted(() => {
  useSEO({
    title: 'Название вашей страницы',
    description: 'Описание вашей страницы для поисковых систем',
    keywords: 'ключевые, слова, через, запятую',
    url: 'https://www.learnenglisheasy.ru/your-page'
  });
});
</script>
```

### Специализированная функция: `useArticleSEO(article)`

#### Параметры:
```typescript
interface ArticleData {
  title: string;
  description: string;
  img?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}
```

#### Пример использования:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useArticleSEO } from '@/composables/useSEO';

const article = {
  title: 'Как быстро учить английские слова',
  description: 'Эффективные методы запоминания английских слов',
  img: 'https://example.com/image.jpg',
  publishedTime: '2024-01-15T10:00:00Z',
  modifiedTime: '2024-01-20T15:30:00Z',
  author: 'Иван Иванов'
};

onMounted(() => {
  useArticleSEO(article);
});
</script>
```

---

## useStructuredData.ts

### 1. `useWebApplicationSchema()`

Используйте на главной странице приложения.

#### Пример:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useWebApplicationSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useWebApplicationSchema();
});
</script>
```

### 2. `useArticleSchema(article)`

Используйте на страницах статей.

#### Параметры:
```typescript
interface ArticleSchema {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}
```

#### Пример:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useArticleSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useArticleSchema({
    headline: 'Заголовок статьи',
    description: 'Описание статьи',
    image: 'https://example.com/image.jpg',
    datePublished: '2024-01-15T10:00:00Z',
    author: 'Имя Автора'
  });
});
</script>
```

### 3. `useBreadcrumbSchema(items)`

Добавляет навигационные хлебные крошки.

#### Параметры:
```typescript
interface BreadcrumbItem {
  name: string;
  url: string;
}
```

#### Пример:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useBreadcrumbSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useBreadcrumbSchema([
    { name: 'Главная', url: 'https://www.learnenglisheasy.ru/' },
    { name: 'Статьи', url: 'https://www.learnenglisheasy.ru/article' },
    { name: 'Текущая статья', url: window.location.href }
  ]);
});
</script>
```

### 4. `useOrganizationSchema(data?)`

Добавляет информацию об организации.

#### Пример:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrganizationSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useOrganizationSchema({
    name: 'Learn English Easy',
    url: 'https://www.learnenglisheasy.ru',
    logo: 'https://www.learnenglisheasy.ru/favicon.png',
    description: 'Платформа для изучения английского языка',
    sameAs: [
      'https://facebook.com/yourpage',
      'https://instagram.com/yourpage'
    ]
  });
});
</script>
```

### 5. `useCourseSchema(course)`

Используйте для образовательного контента.

#### Параметры:
```typescript
interface CourseData {
  name: string;
  description: string;
  provider?: string;
  courseMode?: string;
  courseWorkload?: string;
}
```

#### Пример:
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useCourseSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useCourseSchema({
    name: 'Курс английского языка',
    description: 'Интенсивный курс для начинающих',
    provider: 'Learn English Easy',
    courseMode: 'online',
    courseWorkload: 'PT1H' // 1 час (ISO 8601 duration)
  });
});
</script>
```

---

## Комплексный пример (статья)

```vue
<template>
  <ion-page>
    <ion-content>
      <h1>{{ article.title }}</h1>
      <div v-html="article.body"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useArticleSEO } from '@/composables/useSEO';
import { 
  useArticleSchema, 
  useBreadcrumbSchema 
} from '@/composables/useStructuredData';

const route = useRoute();
const article = ref(null);

onMounted(async () => {
  // Загружаем статью
  const id = route.params.id;
  const response = await fetch(`/articles/${id}.json`);
  article.value = await response.json();
  
  // Настраиваем SEO
  setupSEO();
});

const setupSEO = () => {
  if (!article.value) return;
  
  // 1. Мета-теги для соц.сетей и поисковиков
  useArticleSEO({
    title: article.value.title,
    description: article.value.description,
    img: article.value.img,
    publishedTime: article.value.publishedTime,
    modifiedTime: article.value.modifiedTime,
    author: article.value.author
  });
  
  // 2. Структурированные данные для Google
  useArticleSchema({
    headline: article.value.title,
    description: article.value.description,
    image: article.value.img,
    datePublished: article.value.publishedTime,
    dateModified: article.value.modifiedTime,
    author: article.value.author
  });
  
  // 3. Хлебные крошки
  useBreadcrumbSchema([
    { 
      name: 'Главная', 
      url: 'https://www.learnenglisheasy.ru/' 
    },
    { 
      name: 'Статьи', 
      url: 'https://www.learnenglisheasy.ru/article' 
    },
    { 
      name: article.value.title, 
      url: window.location.href 
    }
  ]);
};
</script>
```

---

## Комплексный пример (обычная страница)

```vue
<template>
  <ion-page>
    <ion-content>
      <h1>Изучение английских слов</h1>
      <!-- Ваш контент -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '@/composables/useSEO';
import { useWebApplicationSchema } from '@/composables/useStructuredData';

onMounted(() => {
  // Мета-теги
  useSEO({
    title: 'Изучение английских слов онлайн | Learn English Easy',
    description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений и карточек.',
    keywords: 'английские слова, учить английский, тренажер слов, карточки',
    url: 'https://www.learnenglisheasy.ru/words'
  });
  
  // Структурированные данные
  useWebApplicationSchema();
});
</script>
```

---

## Что автоматически добавляется

### useSEO добавляет:
- ✅ `<title>` tag
- ✅ `<meta name="description">`
- ✅ `<meta name="keywords">` (если указано)
- ✅ `<meta name="author">` (если указано)
- ✅ Все Open Graph теги (og:title, og:description, og:image и т.д.)
- ✅ Все Twitter Card теги
- ✅ `<link rel="canonical">` с правильным URL

### useStructuredData добавляет:
- ✅ `<script type="application/ld+json">` с структурированными данными
- ✅ Валидные Schema.org схемы
- ✅ Правильную разметку для Google Rich Results

---

## Важные замечания

### 1. Вызывайте в onMounted
```vue
// ✅ Правильно
onMounted(() => {
  useSEO({ title: '...', description: '...' });
});

// ❌ Неправильно
useSEO({ title: '...', description: '...' }); // вызов вне onMounted
```

### 2. Используйте уникальные мета-теги
Каждая страница должна иметь уникальные title и description.

### 3. Длина текста
- **Title**: 50-60 символов
- **Description**: 150-160 символов
- **Keywords**: 5-10 ключевых слов

### 4. URL должны быть полными
```typescript
// ✅ Правильно
url: 'https://www.learnenglisheasy.ru/words'

// ❌ Неправильно
url: '/words'
```

### 5. Даты в ISO 8601
```typescript
// ✅ Правильно
publishedTime: '2024-01-15T10:00:00Z'

// ❌ Неправильно
publishedTime: '15.01.2024'
```

---

## Проверка результатов

После внедрения проверьте:

1. **Исходный код страницы** - откройте в браузере и посмотрите HTML
2. **Google Rich Results Test** - https://search.google.com/test/rich-results
3. **Facebook Sharing Debugger** - https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator** - https://cards-dev.twitter.com/validator

---

## Поддержка

Если у вас есть вопросы или нужна помощь, обратитесь к полной документации в `SEO_DOCUMENTATION.md`.

