/**
 * Пререндер статических страниц после `vite build`.
 *
 * Зачем: приложение — SPA, и до этого шага любой URL отдавал роботам
 * один и тот же index.html. В нём захардкожены заголовок главной и
 * `<link rel="canonical" href="https://www.learnenglisheasy.ru/">`,
 * то есть каждая страница сообщала поисковику «я дубликат главной».
 * Google дорисовывает мета через JS, но канонический адрес из
 * исходного HTML — сильный сигнал, а Yandex JS почти не исполняет.
 *
 * Скрипт кладёт рядом с index.html по файлу на маршрут с настоящими
 * title / description / canonical / OG, а для статей ещё и вставляет
 * их текст в #app — Vue заменит его при монтировании, поэтому для
 * пользователя ничего не меняется, а робот без JS видит содержимое.
 *
 * Мета здесь должны совпадать с тем, что ставит useSEO на клиенте:
 * расхождение поисковики трактуют как подмену контента.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const ARTICLES = join(root, 'public', 'articles');
const ORIGIN = 'https://www.learnenglisheasy.ru';

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Кодируем путь так же, как это сделает браузер в адресной строке.
 * encodeURIComponent оставляет апостроф как есть, а слаги статей его
 * содержат — без доопределения канонический адрес в пререндере
 * («…uchit'-slova») разошёлся бы с тем, что подставит useSEO из
 * window.location.href («…uchit%27-slova»).
 */
const toUrl = (path) =>
  ORIGIN + path.split('/').map((s) => encodeURIComponent(s).replace(/'/g, '%27')).join('/');

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    throw new Error(`Шаблон не найден в index.html: ${pattern}`);
  }
  return html.replace(pattern, replacement);
};

function renderPage(template, page) {
  const url = page.canonical;
  const image = page.image || `${ORIGIN}/favicon.png`;
  const type = page.type || 'website';

  let html = template;

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(page.title)}</title>`);
  html = replaceTag(html, /<meta name="title" content="[^"]*">/, `<meta name="title" content="${escapeAttr(page.title)}">`);
  html = replaceTag(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeAttr(page.description)}">`);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeAttr(url)}">`);

  html = replaceTag(html, /<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="${type}">`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeAttr(url)}">`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeAttr(page.title)}">`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeAttr(page.description)}">`);
  html = replaceTag(html, /<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeAttr(image)}">`);

  html = replaceTag(html, /<meta name="twitter:url" content="[^"]*">/, `<meta name="twitter:url" content="${escapeAttr(url)}">`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeAttr(page.title)}">`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeAttr(page.description)}">`);
  html = replaceTag(html, /<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeAttr(image)}">`);

  if (page.keywords) {
    html = replaceTag(html, /<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${escapeAttr(page.keywords)}">`);
  }

  if (page.jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">\n${JSON.stringify(page.jsonLd, null, 2)}\n  </script>\n  </head>`
    );
  }

  if (page.bodyHtml) {
    /* Тело статьи содержит собственный <style> с правилами для body
       (в том числе светлый фон). До монтирования Vue он успел бы
       перекрасить страницу, поэтому вырезаем: роботам стили не нужны. */
    const content = page.bodyHtml.replace(/<style[\s\S]*?<\/style>/gi, '').trim();
    html = html.replace('<div id="app"></div>', `<div id="app">${content}</div>`);
  }

  return html;
}

function writePage(routePath, html) {
  // "/" -> dist/index.html, "/words" -> dist/words/index.html
  const target = routePath === '/' ? join(DIST, 'index.html') : join(DIST, routePath, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
  return target;
}

function main() {
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error('dist/index.html не найден — сначала нужно выполнить сборку');
  }
  const template = readFileSync(indexPath, 'utf8');

  /* Тексты продублированы из useSEO в соответствующих экранах.
     При изменении там нужно поправить и здесь. */
  const pages = [
    {
      path: '/',
      title: 'Изучение английских слов онлайн тренажер бесплатно',
      description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений. Карточки, тесты и игры для быстрого запоминания слов. Бесплатный онлайн тренажер для всех уровней.',
      keywords: 'английские слова, изучение английского, тренажер слов, карточки английского, учить слова онлайн, vocabulary trainer, английский бесплатно',
    },
    {
      path: '/words',
      title: 'Изучение английских слов онлайн тренажер бесплатно',
      description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений. Карточки, тесты и игры для быстрого запоминания слов. Бесплатный онлайн тренажер для всех уровней.',
      keywords: 'английские слова, изучение английского, тренажер слов, карточки английского, учить слова онлайн, vocabulary trainer, английский бесплатно',
    },
    {
      path: '/vocabulary',
      title: 'Мой словарь английских слов | Слова.Day',
      description: 'Ваш персональный словарь для изучения английского языка. Отслеживайте прогресс, повторяйте слова и расширяйте свой словарный запас эффективно.',
      keywords: 'словарь английского, мой словарь, изученные слова, английский словарь, vocabulary list',
    },
    {
      path: '/article',
      title: 'Статьи для изучения английского языка | Слова.Day',
      description: 'Узнайте лучшие статьи и ресурсы для изучения английского языка. Полезные советы, методы и рекомендации для всех уровней. Эффективные способы запоминания слов, грамматика и практические упражнения.',
      keywords: 'английский язык, изучение английского, статьи, ресурсы, советы по изучению английского, методы изучения, как учить английский',
    },
  ];

  const written = [];

  for (const page of pages) {
    const html = renderPage(template, { ...page, canonical: toUrl(page.path) });
    written.push(writePage(page.path, html));
  }

  // Статьи
  const list = JSON.parse(readFileSync(join(ARTICLES, 'list.json'), 'utf8'));
  for (const slug of list) {
    const file = join(ARTICLES, `${slug}.json`);
    if (!existsSync(file)) {
      console.warn(`[prerender] пропущена статья без файла: ${slug}`);
      continue;
    }
    const article = JSON.parse(readFileSync(file, 'utf8'));
    const path = `/article/${slug}`;
    const canonical = toUrl(path);

    const html = renderPage(template, {
      title: `${article.title} | Слова.Day`,
      description: article.description,
      image: article.img,
      type: 'article',
      canonical,
      bodyHtml: article.body || '',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: article.img,
        inLanguage: 'ru',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: { '@type': 'Organization', name: 'Слова.Day' },
        publisher: {
          '@type': 'Organization',
          name: 'Слова.Day',
          logo: { '@type': 'ImageObject', url: `${ORIGIN}/favicon.png` },
        },
      },
    });

    written.push(writePage(path, html));
  }

  writeSitemap(pages, list);
  console.log(`[prerender] создано страниц: ${written.length}`);
}

/**
 * Карта сайта собирается из того же списка статей, что и страницы,
 * поэтому не может разойтись с ним. Прежняя версия правилась руками
 * и успела устареть: в ней были страницы настроек и словаря, которым
 * в поиске делать нечего.
 */
function writeSitemap(pages, articleSlugs) {
  const entries = [];

  for (const page of pages) {
    entries.push({
      loc: toUrl(page.path),
      lastmod: fileDate(join(DIST, 'index.html')),
      changefreq: page.path === '/' || page.path === '/words' ? 'weekly' : 'monthly',
      priority: page.path === '/' ? '1.0' : '0.8',
    });
  }

  for (const slug of articleSlugs) {
    const file = join(ARTICLES, `${slug}.json`);
    if (!existsSync(file)) continue;
    entries.push({
      loc: toUrl(`/article/${slug}`),
      lastmod: fileDate(file),
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // Юридические страницы — статический HTML, их тоже стоит отдать в индекс
  for (const legal of ['/privacy-policy.html', '/terms-of-service.html']) {
    const file = join(DIST, legal.slice(1));
    if (!existsSync(file)) continue;
    entries.push({ loc: ORIGIN + legal, lastmod: fileDate(file), changefreq: 'yearly', priority: '0.3' });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((e) =>
      [
        '  <url>',
        `    <loc>${e.loc}</loc>`,
        `    <lastmod>${e.lastmod}</lastmod>`,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        '  </url>',
      ].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`[prerender] sitemap.xml: ${entries.length} адресов`);
}

/** Дата последнего изменения файла в формате W3C — без выдуманных значений. */
const fileDate = (file) => statSync(file).mtime.toISOString().split('T')[0];

main();
