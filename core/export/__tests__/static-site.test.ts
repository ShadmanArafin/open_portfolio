import { describe, expect, it } from 'vitest';
import { assetFile, exportStaticSite, pageFile, referencedPaths } from '../static-site';

describe('static export', () => {
  it('finds same-origin assets in markup, srcset and CSS, and skips routes and other hosts', () => {
    const html = `
      <link rel="stylesheet" href="/_next/static/css/a.css">
      <script src="/_next/static/chunks/b.js"></script>
      <img src="/api/media/p.jpg" srcset="/api/media/p.jpg.w640.webp 640w, /api/media/p.jpg 2000w">
      <a href="/work">Work</a>
      <img src="//cdn.example.com/x.png">
      <img src="https://elsewhere.example/y.png">`;
    expect(referencedPaths(html).sort()).toEqual(
      [
        '/_next/static/chunks/b.js',
        '/_next/static/css/a.css',
        '/api/media/p.jpg',
        '/api/media/p.jpg.w640.webp',
      ].sort()
    );
    expect(referencedPaths('@font-face{src:url(/_next/static/media/f.woff2)}')).toEqual([
      '/_next/static/media/f.woff2',
    ]);
  });

  it('names files so root-relative links keep working', () => {
    expect(pageFile('/')).toBe('index.html');
    expect(pageFile('/work/harbour')).toBe('work/harbour/index.html');
    expect(assetFile('/api/media/a%20b.jpg?v=1')).toBe('api/media/a b.jpg');
  });

  it('crawls pages, then their assets, then what the stylesheets reference', async () => {
    const site: Record<string, string> = {
      '/': '<link href="/_next/static/css/s.css"><a href="/work">w</a>',
      '/work': '<img src="/api/media/p.jpg">',
      '/_next/static/css/s.css': 'body{background:url(/_next/static/media/bg.png)}',
      '/api/media/p.jpg': 'JPEG',
      '/_next/static/media/bg.png': 'PNG',
      '/sitemap.xml': '<urlset/>',
    };
    const fetcher = (async (url: string) => {
      const path = new URL(url).pathname;
      return path in site
        ? new Response(site[path], { status: 200 })
        : new Response('<h1>Not found</h1>', { status: 404 });
    }) as typeof fetch;
    const result = await exportStaticSite({
      origin: 'http://site.test',
      pages: ['/', '/work', '/gone'],
      files: ['/sitemap.xml'],
      fetcher,
    });
    const names = result.entries.map((entry) => entry.name).sort();
    expect(names).toEqual(
      [
        '404.html',
        'README.txt',
        '_next/static/css/s.css',
        '_next/static/media/bg.png',
        'api/media/p.jpg',
        'index.html',
        'sitemap.xml',
        'work/index.html',
      ].sort()
    );
    expect(result.pages).toBe(2);
    expect(result.failed).toEqual(['/gone']);
  });
});

describe('stylesheet references', () => {
  it('resolves the build’s relative font URLs against the stylesheet, and skips data: URLs', () => {
    expect(
      referencedPaths(
        '@font-face{src:url(../media/a.woff2)}.x{background:url("data:image/png;base64,AA")}',
        '/_next/static/chunks/site.css'
      )
    ).toEqual(['/_next/static/media/a.woff2']);
  });
});
