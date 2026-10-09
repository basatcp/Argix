import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { NOT_FOUND_META, ROUTES, SITE_NAME, SITE_URL, type RouteMeta } from './src/data/routes';
import { FAQ_GROUPS } from './src/data/faq';

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Replace one tag attribute in the built HTML; fail the build if the tag is missing (so meta never silently goes stale). */
function setAttr(html: string, tag: RegExp, value: string) {
  if (!tag.test(html)) throw new Error(`route-pages: ${tag} not found in index.html`);
  return html.replace(tag, (_m, start: string, end: string) => `${start}${attr(value)}${end}`);
}

function jsonLd(route: RouteMeta, url: string) {
  const graph: object[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: route.label, item: url },
      ],
    },
  ];
  if (route.key === 'faq') {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
}

function pageHtml(base: string, meta: { title: string; description: string }, url: string | null, ld: string | null, noindex = false) {
  let html = base.replace(/<title>[\s\S]*?<\/title>/, `<title>${text(meta.title)}</title>`);
  html = setAttr(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, meta.description);
  html = setAttr(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, meta.title);
  html = setAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, meta.description);
  html = setAttr(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, meta.title);
  html = setAttr(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, meta.description);
  if (url) {
    html = setAttr(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, url);
    html = setAttr(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url);
  } else {
    html = html.replace(/\s*<link\s+rel="canonical"[^>]*>/, '').replace(/\s*<meta\s+property="og:url"[^>]*>/, '');
  }
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ld ? `<script type="application/ld+json">\n${ld}\n    </script>` : '');
  if (noindex) html = html.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>');
  return html;
}

/**
 * After the build, write one HTML file per inner route (dist/services/index.html, …)
 * with that page's title, description, canonical URL and structured data, so each
 * page works when opened directly on any static host and is described correctly
 * before JavaScript runs. Also writes 404.html (unknown paths render the app's
 * not-found page), sitemap.xml and robots.txt.
 */
/** Source file of each inner page (src/pages/<name>.tsx), for preloading its chunk. */
const PAGE_FILES: Record<RouteMeta['key'], string> = {
  home: 'HomePage',
  services: 'ServicesPage',
  industries: 'IndustriesPage',
  process: 'ProcessPage',
  security: 'SecurityPage',
  faq: 'FaqPage',
};

function routePages(): Plugin {
  let publicBase = '/';
  return {
    name: 'route-pages',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      publicBase = config.base;
    },
    generateBundle: {
      // After Vite has emitted index.html.
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (!index || index.type !== 'asset') return;
        const base = String(index.source);
        const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source });
        // Inner pages are separate chunks: preload the page's chunk (and its shared chunks) in its
        // own HTML so a direct visit doesn't wait for the main bundle before requesting them.
        const preloads = (route: RouteMeta) => {
          const file = `/src/pages/${PAGE_FILES[route.key]}.tsx`;
          const chunk = Object.values(bundle).find((c) => c.type === 'chunk' && c.facadeModuleId?.endsWith(file));
          if (!chunk || chunk.type !== 'chunk') return '';
          return [chunk.fileName, ...chunk.imports]
            .filter((f) => !base.includes(f))
            .map((f) => `    <link rel="modulepreload" crossorigin href="${publicBase}${f}" />\n`)
            .join('');
        };
        for (const route of ROUTES) {
          if (route.path === '/') continue;
          const url = SITE_URL + route.path;
          emit(`${route.path.slice(1)}/index.html`, pageHtml(base, route, url, jsonLd(route, url)).replace('</head>', `${preloads(route)}  </head>`));
        }
        emit('404.html', pageHtml(base, NOT_FOUND_META, null, null, true));
        const urls = ROUTES.map((r) => `  <url><loc>${SITE_URL}${r.path}</loc></url>`).join('\n');
        emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
        emit('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), routePages()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
