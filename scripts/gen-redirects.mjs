// Genereert de "redirects"-sectie van vercel.json uit products.json + categories.json
// (en optioneel src/data/redirects.json). Draait in `npm run build` (prebuild-stap).
// Oude Lightspeed-URL's (https://www.1classadditions.nl/nl/...) -> nieuwe routes, 301.
import fs from 'node:fs'
import path from 'node:path'
import { ROOT, products, categories, exists, readJson, staticRoutes } from './site.mjs'

const prods = products()
const cats = categories()
const routes = new Set(staticRoutes())
const R = [] // [source, destination]
const seen = new Set()
const add = (source, destination) => {
  if (seen.has(source) || source === destination) return
  seen.add(source)
  R.push({ source, destination, statusCode: 301 })
}
// Let op: met "trailingSlash": false + "cleanUrls": true strippen Vercel's eigen redirects eerst de slash en
// ".html" (308), pas daarna volgen onderstaande regels. Bronnen dus zonder slash en zonder .html schrijven.
const addBoth = add

// 0. Handmatige overrides (bv. nieuwe slugs door een andere agent): src/data/redirects.json
//    Formaat: [{ "source": "/p/oud", "destination": "/p/nieuw" }] of { "/p/oud": "/p/nieuw" }
if (exists('src/data/redirects.json')) {
  const j = readJson('src/data/redirects.json')
  const list = Array.isArray(j) ? j : Object.entries(j).map(([source, destination]) => ({ source, destination }))
  for (const r of list) add(r.source, r.destination)
}

const has = (r) => routes.has(r)
const legal = (r, fallback) => (has(r) ? r : fallback)

for (const lang of ['nl', 'de', 'fr']) {
  const L = `/${lang}`
  // 1. Servicepagina's (alleen nl heeft inhoud; de/fr gaan naar dezelfde nieuwe pagina's)
  addBoth(`${L}/service/about`, '/over-ons')
  addBoth(`${L}/service/shipping-returns`, '/verzenden')
  addBoth(`${L}/service/payment-methods`, '/klantenservice')
  addBoth(`${L}/service/general-terms-conditions`, legal('/algemene-voorwaarden', '/klantenservice'))
  addBoth(`${L}/service/disclaimer`, legal('/disclaimer', '/klantenservice'))
  addBoth(`${L}/service/privacy-policy`, legal('/privacy', '/klantenservice'))
  addBoth(`${L}/service/legal-guarantee-notice`, legal('/wettelijke-garantie', '/klantenservice'))
  addBoth(`${L}/service`, '/klantenservice')
  addBoth(`${L}/dealers`, '/dealers')
  addBoth(`${L}/autohoezen/fabels-feiten`, '/kennis')
  addBoth(`${L}/cart`, '/bestellen')
  add(`${L}/checkout/:path*`, '/bestellen')
  add(`${L}/account/:path*`, '/')
  addBoth(`${L}/sitemap`, '/sitemap.xml')
  add(`${L}/blogs/:path*`, '/c/autohoezen/supertex-binnenhoezen')
  add(`${L}/collection/:path*`, '/c')
  add(`${L}/brands/:path*`, '/c')
  add(`${L}/tags/:path*`, '/c')
  add(`${L}/search/:term`, '/c?q=:term')

  // 2. Categorieen (diepste eerst zodat sub-slugs voor hun ouder komen). Ook oude paginering /page2.html.
  for (const c of [...cats].sort((a, b) => b.depth - a.depth)) {
    addBoth(`${L}/${c.slug}`, `/c/${c.slug}`)
    add(`${L}/${c.slug}/:path+`, `/c/${c.slug}`)
  }

  // 3. Producten: expliciet per bestaand product (oud: /nl/{slug}.html -> hier zonder .html door cleanUrls)
  for (const p of prods) {
    add(`${L}/${p.slug}`, `/p/${p.slug}`)
  }
  // Onbekende oude product-/categorie-URL (/nl/xxx[.html] die niet meer bestaat): naar het assortiment i.p.v. een 404.
  // Staat na alle expliciete regels (eerste match wint).
  add(`${L}/:slug([^/]+)`, '/c')
}
// 4. Taalroots
add('/nl', '/'); add('/nl/', '/')
add('/de/:path*', '/'); add('/fr/:path*', '/')

// 5. Apex -> www (alleen als SITE_URL een www-host is; eigenaar kan dit ook in het Vercel-domeinoverzicht doen)
const host = new URL(process.env.SITE_URL || 'https://www.1classadditions.nl').hostname
if (host.startsWith('www.')) {
  R.push({
    source: '/:path(.*)',
    has: [{ type: 'host', value: host.slice(4) }],
    destination: `https://${host}/:path`,
    statusCode: 301,
  })
}

const file = path.join(ROOT, 'vercel.json')
const cfg = JSON.parse(fs.readFileSync(file, 'utf8'))
cfg.redirects = R
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n')
console.log(`gen-redirects: ${R.length} redirects geschreven naar vercel.json`)
if (R.length > 1900) console.warn('WAARSCHUWING: Vercel staat max. 2048 redirects in vercel.json toe')
