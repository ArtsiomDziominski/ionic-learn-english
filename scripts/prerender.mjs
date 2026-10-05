import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const ARTICLES = join(root, 'public', 'articles');
const ABOUT = join(root, 'src', 'content', 'about.json');
const WORDS = join(root, 'src', 'content', 'words_level.ts');
const COURSE = join(root, 'src', 'core', 'course.ts');
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
const toHref = (path) =>
  path.split('/').map((s) => encodeURIComponent(s).replace(/'/g, '%27')).join('/');

const toUrl = (path) => ORIGIN + toHref(path);

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
    const content = page.bodyHtml.replace(/<style[\s\S]*?<\/style>/gi, '').trim();
    html = html.replace('<div id="app"></div>', () => `<div id="app">${content}</div>`);
  }

  return html;
}

function writePage(routePath, html) {
  // "/" -> dist/index.html, "/vocabulary" -> dist/vocabulary/index.html
  const target = routePath === '/' ? join(DIST, 'index.html') : join(DIST, routePath, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html, 'utf8');
  return target;
}

/**
 * «О сайте»: и Vue-страница, и этот скрипт читают один about.json,
 * поэтому текст для роботов не может разойтись с тем, что видит человек.
 */
function renderAboutBody(about) {
  const sections = about.sections.map((s) =>
    [
      `<section id="${escapeAttr(s.id)}">`,
      `<h2>${escapeAttr(s.heading)}</h2>`,
      ...(s.paragraphs ?? []).map((text) => `<p>${escapeAttr(text)}</p>`),
      s.items
        ? `<ul>${s.items.map((i) => `<li><strong>${escapeAttr(i.title)}.</strong> ${escapeAttr(i.text)}</li>`).join('')}</ul>`
        : '',
      ...(s.questions ?? []).map((i) => `<h3>${escapeAttr(i.q)}</h3><p>${escapeAttr(i.a)}</p>`),
      '</section>',
    ].filter(Boolean).join('\n')
  );

  const actions = about.actions.map((a) => `<a href="${escapeAttr(a.href)}">${escapeAttr(a.text)}</a>`);

  return [
    '<article class="page">',
    `<h1>${escapeAttr(about.heading)}</h1>`,
    `<p>${escapeAttr(about.lead)}</p>`,
    ...sections,
    `<nav aria-label="Куда дальше">${actions.join(' · ')}</nav>`,
    '<p><a href="/privacy-policy.html">Политика конфиденциальности</a> · <a href="/terms-of-service.html">Условия использования</a></p>',
    '</article>',
  ].join('\n');
}

function aboutJsonLd(about) {
  const url = toUrl(about.path);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${url}#webpage`,
        url,
        name: about.heading,
        description: about.description,
        inLanguage: 'ru',
        isPartOf: { '@type': 'WebSite', name: 'Слова.Day', url: `${ORIGIN}/` },
        about: {
          '@type': 'WebApplication',
          name: 'Слова.Day',
          url: `${ORIGIN}/`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          inLanguage: 'ru',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'RUB' },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: about.heading, item: url },
        ],
      },
    ],
  };
}

/* ——— Тело страниц для роботов ————————————————————————————— */

/**
 * Ссылки на основные разделы. Приложение рисует навигацию скриптом, а робот
 * без JS (Яндекс исполняет его лишь частично) иначе не нашёл бы ничего,
 * кроме самой страницы: без ссылок остальные адреса остаются неизвестными.
 */
const SECTION_LINKS = [
  { path: '/', text: 'Начать учиться' },
  { path: '/vocabulary', text: 'Словарь английских слов' },
  { path: '/article', text: 'Статьи об изучении английского' },
  { path: '/about', text: 'О сайте' },
];

const renderSiteNav = (current) =>
  `<nav aria-label="Разделы сайта">${SECTION_LINKS
    .filter((link) => link.path !== current)
    .map((link) => `<a href="${link.path}">${escapeAttr(link.text)}</a>`)
    .join(' · ')}</nav>`;

/** Главная: вступление и ссылки; текст общий со страницей «О сайте». */
function renderHomeBody(about) {
  return [
    '<main class="page">',
    '<h1>Слова.Day — бесплатный тренажёр английских слов</h1>',
    `<p>${escapeAttr(about.lead)}</p>`,
    renderSiteNav('/'),
    '</main>',
  ].join('\n');
}

/** Список статей: тексты те же, что показывает ArticlesPage. */
function renderArticlesBody(articles) {
  const items = articles.map(({ slug, article }) =>
    [
      '<li>',
      `<h2><a href="${toHref(`/article/${slug}`)}">${escapeAttr(article.title)}</a></h2>`,
      article.description ? `<p>${escapeAttr(article.description)}</p>` : '',
      '</li>',
    ].filter(Boolean).join('')
  );

  return [
    '<article class="page">',
    '<h1>Блог для изучения английского</h1>',
    '<p>Полезные статьи, советы и ресурсы для эффективного изучения языка</p>',
    `<ul>${items.join('\n')}</ul>`,
    renderSiteNav('/article'),
    '</article>',
  ].join('\n');
}

/**
 * Словарь хранится в TS-файле: одна запись на строку, каждая — валидный JSON.
 * Разбираем построчно, чтобы не тянуть в Node компилятор и алиасы из src.
 * Если формат изменится, сборка упадёт, а не выдаст пустую страницу.
 */
function readRawWords() {
  const source = readFileSync(WORDS, 'utf8');
  const raws = [...source.matchAll(/^\s*(\{.*\}),?\s*$/gm)].map((m) => JSON.parse(m[1]));
  if (raws.length < 1000) {
    throw new Error(`[prerender] словарь разобран неверно: ${raws.length} записей в ${WORDS}`);
  }
  return raws;
}

/** Уровни и темы читаем из course.ts, чтобы названия не разошлись с приложением. */
function readCourseMeta() {
  const source = readFileSync(COURSE, 'utf8');
  const levels = [...source.matchAll(/\{ key: '([^']+)', title: '([^']+)', english: '([^']+)'/g)]
    .map(([, key, title, english]) => ({ key, title, english }));
  const topics = [...source.matchAll(/\{ key: '([^']+)', title: '([^']+)', subtitle: '[^']*' \}/g)]
    .map(([, key, title]) => ({ key, title }));
  if (levels.length !== 6 || topics.length < 10) {
    throw new Error(`[prerender] не разобраны уровни (${levels.length}) или темы (${topics.length}) в ${COURSE}`);
  }
  return { levels, topics };
}

const pluralRu = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

/**
 * Словарь: все слова курса с переводом. Слово попадает в самый ранний
 * уровень, а слова без уровня — в свою тему (так же, как в course.ts),
 * поэтому каждое слово указано один раз.
 */
function renderVocabularyBody() {
  const raws = readRawWords();
  const { levels, topics } = readCourseMeta();

  const meanings = (translation) => translation.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
  const bank = new Map();
  for (const raw of raws) {
    const id = raw.word.trim().toLowerCase();
    if (!id) continue;
    const entry = bank.get(id) ?? { word: raw.word.trim(), meanings: [] };
    for (const m of meanings(raw.translation)) if (!entry.meanings.includes(m)) entry.meanings.push(m);
    bank.set(id, entry);
  }

  const taken = new Set();
  const collect = (key) => {
    const ids = [];
    for (const raw of raws) {
      if (!raw.levels.includes(key)) continue;
      const id = raw.word.trim().toLowerCase();
      if (!id || taken.has(id)) continue;
      taken.add(id);
      ids.push(id);
    }
    return ids;
  };

  const renderList = (ids) =>
    `<ul>${ids
      .map((id) => {
        const { word, meanings: tr } = bank.get(id);
        return `<li><span lang="en">${escapeAttr(word)}</span> — ${escapeAttr(tr.join(', '))}</li>`;
      })
      .join('')}</ul>`;

  const levelSections = levels
    .map((level) => ({ ...level, ids: collect(level.key) }))
    .filter((s) => s.ids.length)
    .map((s) => `<section id="${s.key.toLowerCase()}"><h3>${escapeAttr(`${s.key} — ${s.title} (${s.english})`)}</h3>${renderList(s.ids)}</section>`);

  const topicSections = topics
    .map((topic) => ({ ...topic, ids: collect(topic.key) }))
    .filter((s) => s.ids.length)
    .map((s) => `<section id="topic-${escapeAttr(s.key)}"><h3>${escapeAttr(s.title)}</h3>${renderList(s.ids)}</section>`);

  const total = bank.size;
  return [
    '<article class="page">',
    '<h1>Словарь английских слов</h1>',
    `<p>Все слова курса с переводом на русский: ${total} ${pluralRu(total, 'слово', 'слова', 'слов')} — шесть уровней от A1 до C2 и тематические наборы. В приложении слова можно искать, слушать произношение и отмечать сердечком сложные, чтобы повторить их в тренировке.</p>`,
    renderSiteNav('/vocabulary'),
    '<h2>Слова по уровням</h2>',
    ...levelSections,
    '<h2>Слова по темам</h2>',
    ...topicSections,
    '</article>',
  ].join('\n');
}

function main() {
  const indexPath = join(DIST, 'index.html');
  if (!existsSync(indexPath)) {
    throw new Error('dist/index.html не найден — сначала нужно выполнить сборку');
  }
  const template = readFileSync(indexPath, 'utf8');
  const about = JSON.parse(readFileSync(ABOUT, 'utf8'));

  const slugs = JSON.parse(readFileSync(join(ARTICLES, 'list.json'), 'utf8'));
  const articles = [];
  for (const slug of slugs) {
    const file = join(ARTICLES, `${slug}.json`);
    if (!existsSync(file)) {
      console.warn(`[prerender] пропущена статья без файла: ${slug}`);
      continue;
    }
    articles.push({ slug, article: JSON.parse(readFileSync(file, 'utf8')) });
  }

  /* Тексты продублированы из useSEO в соответствующих экранах.
     При изменении там нужно поправить и здесь. Исключение — «О сайте»:
     его тексты общие с экраном и лежат в about.json. */
  const pages = [
    {
      path: '/',
      title: 'Изучение английских слов онлайн тренажер бесплатно',
      description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений. Карточки, тесты и игры для быстрого запоминания слов. Бесплатный онлайн тренажер для всех уровней.',
      keywords: 'английские слова, изучение английского, тренажер слов, карточки английского, учить слова онлайн, vocabulary trainer, английский бесплатно',
      bodyHtml: renderHomeBody(about),
    },
    {
      path: '/vocabulary',
      title: 'Мой словарь английских слов | Слова.Day',
      description: 'Ваш персональный словарь для изучения английского языка. Отслеживайте прогресс, повторяйте слова и расширяйте свой словарный запас эффективно.',
      keywords: 'словарь английского, мой словарь, изученные слова, английский словарь, vocabulary list',
      bodyHtml: renderVocabularyBody(),
    },
    {
      path: '/article',
      title: 'Статьи для изучения английского языка | Слова.Day',
      description: 'Узнайте лучшие статьи и ресурсы для изучения английского языка. Полезные советы, методы и рекомендации для всех уровней. Эффективные способы запоминания слов, грамматика и практические упражнения.',
      keywords: 'английский язык, изучение английского, статьи, ресурсы, советы по изучению английского, методы изучения, как учить английский',
      bodyHtml: renderArticlesBody(articles),
    },
    {
      path: about.path,
      title: about.title,
      description: about.description,
      keywords: about.keywords,
      priority: '0.5',
      bodyHtml: renderAboutBody(about),
      jsonLd: aboutJsonLd(about),
    },
  ];

  const written = [];

  for (const page of pages) {
    const html = renderPage(template, { ...page, canonical: toUrl(page.path) });
    written.push(writePage(page.path, html));
  }

  // Статьи
  for (const { slug, article } of articles) {
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

  writeSitemap(pages, articles.map((a) => a.slug));
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
      changefreq: page.path === '/' ? 'weekly' : 'monthly',
      priority: page.priority ?? (page.path === '/' ? '1.0' : '0.8'),
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
