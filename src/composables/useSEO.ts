import { useHead } from '@vueuse/head';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function useSEO(config: SEOConfig) {
  const baseUrl = 'https://www.learnenglisheasy.ru';
  const defaultImage = `${baseUrl}/favicon.png`;
  
  const url = config.url || window.location.href;
  const image = config.image || defaultImage;
  const type = config.type || 'website';

  useHead({
    title: config.title,
    meta: [
      // Primary Meta Tags
      {
        name: 'title',
        content: config.title
      },
      {
        name: 'description',
        content: config.description
      },
      ...(config.keywords ? [{
        name: 'keywords',
        content: config.keywords
      }] : []),
      ...(config.author ? [{
        name: 'author',
        content: config.author
      }] : []),
      
      // Open Graph / Facebook
      {
        property: 'og:type',
        content: type
      },
      {
        property: 'og:url',
        content: url
      },
      {
        property: 'og:title',
        content: config.title
      },
      {
        property: 'og:description',
        content: config.description
      },
      {
        property: 'og:image',
        content: image
      },
      {
        property: 'og:locale',
        content: 'ru_RU'
      },
      {
        property: 'og:site_name',
        content: 'Learn English Easy'
      },
      ...(type === 'article' && config.publishedTime ? [{
        property: 'article:published_time',
        content: config.publishedTime
      }] : []),
      ...(type === 'article' && config.modifiedTime ? [{
        property: 'article:modified_time',
        content: config.modifiedTime
      }] : []),
      
      // Twitter
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:url',
        content: url
      },
      {
        name: 'twitter:title',
        content: config.title
      },
      {
        name: 'twitter:description',
        content: config.description
      },
      {
        name: 'twitter:image',
        content: image
      }
    ],
    link: [
      {
        rel: 'canonical',
        href: url
      }
    ]
  });
}

export function useArticleSEO(article: {
  title: string;
  description: string;
  img?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}) {
  useSEO({
    title: `${article.title} | Learn English Easy`,
    description: article.description,
    image: article.img,
    type: 'article',
    publishedTime: article.publishedTime,
    modifiedTime: article.modifiedTime,
    author: article.author || 'Learn English Easy'
  });
}

