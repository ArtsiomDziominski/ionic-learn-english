import { useHead } from '@vueuse/head';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

interface ArticleSchema {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
}

interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

interface CourseSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  provider: {
    '@type': string;
    name: string;
  };
  hasCourseInstance?: {
    '@type': string;
    courseMode: string;
    courseWorkload: string;
  };
}

export function useOrganizationSchema(data?: Partial<OrganizationSchema>) {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data?.name || 'Слова.Day',
    url: data?.url || 'https://www.learnenglisheasy.ru',
    logo: data?.logo || 'https://www.learnenglisheasy.ru/favicon.png',
    description: data?.description || 'Онлайн платформа для изучения английского языка',
    sameAs: data?.sameAs || []
  };

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }
    ]
  });
}

export function useArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  const schema: ArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image || 'https://www.learnenglisheasy.ru/favicon.png',
    datePublished: article.datePublished || new Date().toISOString(),
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: article.author || 'Слова.Day'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Слова.Day',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.learnenglisheasy.ru/favicon.png'
      }
    }
  };

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }
    ]
  });
}

export function useBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const schema: BreadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }
    ]
  });
}

export function useCourseSchema(course: {
  name: string;
  description: string;
  provider?: string;
  courseMode?: string;
  courseWorkload?: string;
}) {
  const schema: CourseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider || 'Слова.Day'
    }
  };

  if (course.courseMode || course.courseWorkload) {
    schema.hasCourseInstance = {
      '@type': 'CourseInstance',
      courseMode: course.courseMode || 'online',
      courseWorkload: course.courseWorkload || 'PT1H'
    };
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }
    ]
  });
}

// Для главной страницы - комплексная структура
export function useWebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Слова.Day',
    alternateName: 'Изучение английских слов онлайн',
    url: 'https://www.learnenglisheasy.ru/',
    description: 'Онлайн платформа для изучения английского языка. Интерактивные уроки, тренажеры для изучения слов, статьи и полезные материалы.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB'
    },
    inLanguage: 'ru',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student'
    },
    featureList: [
      'Интерактивные карточки для запоминания слов',
      'Упражнения на сопоставление',
      'Персональный словарь',
      'Отслеживание прогресса',
      'Статьи и полезные материалы'
    ]
  };

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(schema)
      }
    ]
  });
}

