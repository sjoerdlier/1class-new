// Genereert dist/sitemap.xml (absolute URL's, SITE_URL default https://www.1classadditions.nl)
// en zet de juiste Sitemap-regel in dist/robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, SITE_URL, NOINDEX_ROUTES, products, categories, staticRoutes, abs, esc } from './site.mjs'

const DIST = path.join(ROOT, 'dist')
const P = products()
const urls = [
  ...staticRoutes().filter((r) => !NOINDEX_ROUTES.has(r)).map((r) => ({ loc: r === '/' ? SITE_URL + '/' : SITE_URL + r })),
  { loc: SITE_URL + '/c' },
  ...categories().map((c) => ({ loc: `${SITE_URL}/c/${c.slug}` })),
  ...P.map((p) => ({ loc: `${SITE_URL}/p/${p.slug}`, images: p.images.slice(0, 5).map(abs) })),
]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${(u.images || []).map((i) => `<image:image><image:loc>${esc(i)}</image:loc></image:image>`).join('')}</url>`).join('\n')}
</urlset>
`
fs.mkdirSync(DIST, { recursive: true })
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml)

const robots = path.join(DIST, 'robots.txt')
if (fs.existsSync(robots)) {
  const t = fs.readFileSync(robots, 'utf8').replace(/^Sitemap:.*$/m, `Sitemap: ${SITE_URL}/sitemap.xml`)
  fs.writeFileSync(robots, t)
}
console.log(`sitemap: ${urls.length} URL's naar dist/sitemap.xml`)
