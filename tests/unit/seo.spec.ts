import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import vercel from '../../vercel.json';

const root = join(__dirname, '..', '..');
const robots = readFileSync(join(root, 'public', 'robots.txt'), 'utf8');

/** Правила Disallow из группы User-agent (без разбора Allow: его здесь не нужно). */
function disallowsFor(agent: string): string[] {
  const out: string[] = [];
  let active = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (/^user-agent$/i.test(key)) active = value === agent;
    else if (active && /^disallow$/i.test(key) && value) out.push(value);
  }
  return out;
}

describe('адреса /words', () => {
  const redirects = (vercel as { redirects?: Array<{ source: string; destination: string; permanent?: boolean }> }).redirects ?? [];

  test('/words и всё под ним уходит на главную постоянным редиректом', () => {
    expect(redirects).toContainEqual({ source: '/words', destination: '/', permanent: true });
    expect(redirects).toContainEqual({ source: '/words/:path*', destination: '/', permanent: true });
  });

  test('старый адрес урока больше не отдаёт приложение под видом отдельной страницы', () => {
    const rewrites = (vercel as { rewrites?: Array<{ source: string }> }).rewrites ?? [];
    expect(rewrites.some((r) => r.source.startsWith('/words'))).toBe(false);
  });

  test('robots.txt не закрывает /words: робот должен увидеть редирект', () => {
    for (const agent of ['*', 'Yandex']) {
      expect(disallowsFor(agent).some((d) => '/words'.startsWith(d) || d.startsWith('/words'))).toBe(false);
    }
  });
});

describe('индексация страниц', () => {
  const indexable = ['/', '/vocabulary', '/article', '/article/kak-bystro-uchit-slova', '/about'];

  test.each(['*', 'Yandex'])('robots.txt (%s) не закрывает главную, словарь, статьи и «О сайте»', (agent) => {
    const rules = disallowsFor(agent);
    expect(rules.length).toBeGreaterThan(0);
    for (const path of indexable) {
      expect(rules.filter((d) => path.startsWith(d)), `${path} закрыт правилом`).toEqual([]);
    }
  });

  test('карта сайта указана в robots.txt', () => {
    expect(robots).toMatch(/^Sitemap:\s*https:\/\/www\.learnenglisheasy\.ru\/sitemap\.xml\s*$/m);
  });
});
