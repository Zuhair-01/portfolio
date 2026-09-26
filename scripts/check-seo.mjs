import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://zuhair-portfolio.vercel.app';
const slugs = [
  'ai-contract-intelligence', 'ai-security-log-analyzer',
  'enterprise-ai-assistant', 'enterprise-bi-platform', 'open-axis', 'ostazi',
];
const pairs = [['index.html', 'ar/index.html', '/', '/ar'], ['resume.html', 'ar/resume.html', '/resume', '/ar/resume']];
for (const slug of slugs) pairs.push([`projects/${slug}.html`, `ar/projects/${slug}.html`, `/projects/${slug}`, `/ar/projects/${slug}`]);

const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.equal(listed.length, pairs.length * 2, 'sitemap URL count');
assert.equal(new Set(listed).size, listed.length, 'duplicate sitemap URL');
assert.match(readFileSync(join(root, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/zuhair-portfolio\.vercel\.app\/sitemap\.xml/);

for (const [enFile, arFile, enPath, arPath] of pairs) {
  for (const [file, language, selfPath] of [[enFile, 'en', enPath], [arFile, 'ar', arPath]]) {
    const html = readFileSync(join(root, file), 'utf8');
    const head = html.split('</head>')[0];
    assert.match(head, new RegExp(`<html lang="${language}"`), `${file}: language`);
    assert.match(head, /<meta name="description" content="[^"]+">/, `${file}: description`);
    assert.ok(head.includes(`<link rel="canonical" href="${base}${selfPath}">`), `${file}: canonical`);
    assert.ok(head.includes(`<link rel="alternate" hreflang="en" href="${base}${enPath}">`), `${file}: English alternate`);
    assert.ok(head.includes(`<link rel="alternate" hreflang="ar" href="${base}${arPath}">`), `${file}: Arabic alternate`);
    assert.ok(listed.includes(`${base}${selfPath}`), `${file}: sitemap URL`);
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(head), `${file}: unexpected noindex`);
  }
}

if (process.argv.includes('--live')) {
  for (const path of ['/', '/ar', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `${path}: live status`);
    if (path === '/sitemap.xml') {
      const live = await response.text();
      for (const url of listed) assert.ok(live.includes(`<loc>${url}</loc>`), `live sitemap missing ${url}`);
    }
  }
}

console.log(`SEO checks passed for ${pairs.length * 2} English/Arabic pages${process.argv.includes('--live') ? ' and live endpoints' : ''}.`);
