// Prerender: draait ná `vite build`. Rendert elke route met react-dom/server + StaticRouter naar
// dist/<route>/index.html met echte inhoud, eigen <title>/description/canonical/Open Graph en JSON-LD.
// Schrijft ook dist/404.html (Vercel serveert die met een echte 404-status).
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import {
  ROOT, SITE_URL, SITE_NAME, NOINDEX_ROUTES, products, categories, staticRoutes, strip, truncate, abs, esc,
} from './site.mjs'

const DIST = path.join(ROOT, 'dist')
const SSR_OUT = path.join(ROOT, 'node_modules', '.prerender')
if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist/index.html ontbreekt: draai eerst `vite build`')

// 1. SSR-bundel van de app bouwen (scripts/entry-server.jsx) en laden
await build({
  configFile: path.join(ROOT, 'vite.config.js'),
  logLevel: 'warn',
  publicDir: false,
  build: {
    ssr: path.join(ROOT, 'scripts/entry-server.jsx'),
    outDir: SSR_OUT,
    emptyOutDir: true,
    rollupOptions: { output: { format: 'es', entryFileNames: 'entry-server.mjs' } },
  },
})
const { render } = await import(pathToFileURL(path.join(SSR_OUT, 'entry-server.mjs')).href)

// 2. Data en meta
const PRODUCTS = products()
const CATS = categories()
const catById = (id) => CATS.find((c) => c.id === id)
const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n).replace(/\s/g, ' ')
const HOME_TITLE = `${SITE_NAME} — Autohoezen, stalling & onderhoud voor klassiekers`
const HOME_DESC = 'Al 25 jaar dé specialist in autohoezen, stalling en onderhoud voor klassieke auto’s. Onderdeel van Imparts, Ede.'

const INFO = {
  '/over-ons': ['Over ons', 'Over 1ClassAdditions: informatie en producten voor het stallen van uw klassieker, van een ervaren team uit Ede (Imparts B.V.).'],
  '/verzenden': ['Verzenden & retourneren', 'Voor 15:00 besteld, volgende werkdag in huis (indien op voorraad). Lees alles over verzenden, 14 dagen retourneren en terugbetaling.'],
  '/kennis': ['Fabels & Feiten over autohoezen', 'Wat kan een autohoes wel, en wat niet? Condens, katoen, stretch- en Supertex-hoezen: eerlijke antwoorden van de specialist.'],
  '/dealers': ['Dealers', 'Ons assortiment is ook verkrijgbaar bij geselecteerde dealers in Nederland, België en Duitsland.'],
  '/klantenservice': ['Klantenservice & contact', 'Vragen over een product? Bel +31 (0)26 442 99 37 of mail sales@1classadditions.nl. Ma t/m vr 09:00 - 17:30, Bonnetstraat 33, Ede.'],
  '/bestellen': ['Bestellen', 'Rond uw bestelling bij 1ClassAdditions af.'],
}
const humanize = (r) => { const s = r.split('/').filter(Boolean).pop().replace(/-/g, ' '); return s.charAt(0).toUpperCase() + s.slice(1) }

const org = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'Store'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: 'Imparts B.V.',
  url: SITE_URL + '/',
  logo: abs('/logo-1class.png'),
  image: abs('/og-image.png'),
  telephone: '+31264429937',
  email: 'sales@1classadditions.nl',
  address: { '@type': 'PostalAddress', streetAddress: 'Bonnetstraat 33', postalCode: '6718 XN', addressLocality: 'Ede', addressCountry: 'NL' },
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:30' }],
}
const website = {
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL + '/', name: SITE_NAME, inLanguage: 'nl-NL',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/c?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
}
const crumbs = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })),
})

function productLd(p) {
  const url = `${SITE_URL}/p/${p.slug}`
  const avail = `https://schema.org/${p.available ? 'InStock' : 'OutOfStock'}`
  const range = p.priceTo > p.priceFrom
  const ret = { '@type': 'MerchantReturnPolicy', applicableCountry: 'NL', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14 }
  const offers = range
    ? { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: p.priceFrom, highPrice: p.priceTo, ...(p.variants.length ? { offerCount: p.variants.length } : {}), availability: avail, url }
    : { '@type': 'Offer', priceCurrency: 'EUR', price: p.priceFrom, availability: avail, itemCondition: 'https://schema.org/NewCondition', url, hasMerchantReturnPolicy: ret, seller: { '@id': `${SITE_URL}/#organization` } }
  return {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, name: p.title,
    description: truncate(strip(p.short || p.content), 500),
    image: p.images.map(abs),
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    sku: p.variants.find((v) => v.code)?.code || String(p.vid ?? p.id),
    url, offers,
  }
}

function metaFor(route) {
  const m = { title: HOME_TITLE, description: HOME_DESC, path: route, image: abs('/og-image.png'), imageAlt: SITE_NAME, type: 'website', robots: null, ld: [org] }
  if (route === '/') { m.ld.push(website); return m }
  if (route === '/__404') {
    return { ...m, title: `Pagina niet gevonden | ${SITE_NAME}`, path: null, robots: 'noindex, nofollow', ld: [org] }
  }
  if (route === '/c') {
    return { ...m, title: `Alle producten | ${SITE_NAME}`, description: 'Bekijk het volledige assortiment van 1ClassAdditions: autohoezen, stalling, onderhoud en accessoires voor klassieke auto’s.', ld: [org, crumbs([['Home', '/'], ['Alle producten', '/c']])] }
  }
  if (route.startsWith('/c/')) {
    const cat = CATS.find((c) => `/c/${c.slug}` === route)
    const parent = cat.parent ? catById(cat.parent) : null
    const trail = [['Home', '/'], ...(parent ? [[parent.title, `/c/${parent.slug}`]] : []), [cat.title, route]]
    const n = PRODUCTS.filter((p) => p.cats.includes(cat.id)).length
    const base = strip(cat.description || '')
    return { ...m, title: `${cat.title} | ${SITE_NAME}`, description: truncate(base ? `${base} ${n} producten.` : `${cat.title} van 1ClassAdditions: ${n} producten voor uw klassieke auto.`), image: cat.imageUrl ? abs(cat.imageUrl) : m.image, imageAlt: cat.title, ld: [org, crumbs(trail)] }
  }
  if (route.startsWith('/p/')) {
    const p = PRODUCTS.find((x) => `/p/${x.slug}` === route)
    const cs = p.cats.map(catById).filter(Boolean).sort((a, b) => b.depth - a.depth)
    const cat = cs[0]
    const parent = cat?.parent ? catById(cat.parent) : null
    const trail = [['Home', '/'], ...(parent ? [[parent.title, `/c/${parent.slug}`]] : []), ...(cat ? [[cat.title, `/c/${cat.slug}`]] : []), [p.title, route]]
    let d = truncate(strip(p.short || p.content), 135)
    d = `${d} ${p.priceTo > p.priceFrom ? 'Vanaf' : 'Prijs:'} ${eur(p.priceFrom)} incl. btw.`
    return { ...m, title: `${p.title} | ${SITE_NAME}`, description: d, image: p.images[0] ? abs(p.images[0]) : m.image, imageAlt: p.title, type: 'product', price: p.priceFrom, ld: [org, productLd(p), crumbs(trail)] }
  }
  const [t, d] = INFO[route] || [humanize(route), HOME_DESC]
  return { ...m, title: `${t} | ${SITE_NAME}`, description: d, robots: NOINDEX_ROUTES.has(route) ? 'noindex, follow' : null, ld: [org, crumbs([['Home', '/'], [t, route]])] }
}

const ldTag = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

function headHtml(m) {
  const url = m.path === null ? null : m.path === '/' ? SITE_URL + '/' : SITE_URL + m.path
  const l = [`<title>${esc(m.title)}</title>`, `<meta name="description" content="${esc(m.description)}" />`]
  if (m.robots) l.push(`<meta name="robots" content="${m.robots}" />`)
  if (url) l.push(`<link rel="canonical" href="${url}" />`)
  l.push(
    `<meta property="og:locale" content="nl_NL" />`, `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${m.type}" />`, `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
  )
  if (url) l.push(`<meta property="og:url" content="${url}" />`)
  l.push(`<meta property="og:image" content="${esc(m.image)}" />`, `<meta property="og:image:alt" content="${esc(m.imageAlt)}" />`)
  if (m.image.endsWith('/og-image.png')) l.push(`<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`)
  if (m.price != null) l.push(`<meta property="product:price:amount" content="${m.price}" />`, `<meta property="product:price:currency" content="EUR" />`)
  l.push(
    `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`, `<meta name="twitter:image" content="${esc(m.image)}" />`,
  )
  for (const o of m.ld) l.push(ldTag(o))
  return l.join('\n    ')
}

// 3. Template + fontpreloads (alleen de latin-woff2's van Inter/Fraunces, gehasht door Vite)
const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const assetDir = path.join(DIST, 'assets')
const fontPreloads = (fs.existsSync(assetDir) ? fs.readdirSync(assetDir) : [])
  .filter((f) => /^(inter|fraunces)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

function page(route) {
  const m = metaFor(route)
  const appHtml = render(route === '/__404' ? '/__404' : route)
  let html = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/, '')
  const head = [fontPreloads, headHtml(m)].filter(Boolean).join('\n    ')
  html = html.includes('<!--seo-head-->') ? html.replace('<!--seo-head-->', head) : html.replace('</head>', `    ${head}\n  </head>`)
  if (!html.includes('<div id="root"></div>')) throw new Error('<div id="root"></div> niet gevonden in template')
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

// 4. Routes
const routes = [
  ...staticRoutes(),
  '/c',
  ...CATS.map((c) => `/c/${c.slug}`),
  ...PRODUCTS.map((p) => `/p/${p.slug}`),
]
const uniq = [...new Set(routes)]
const out = (route) => (route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.replace(/^\//, ''), 'index.html'))
let n = 0
for (const r of uniq) {
  const file = out(r)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, page(r))
  n++
}
fs.writeFileSync(path.join(DIST, '404.html'), page('/__404'))
fs.rmSync(SSR_OUT, { recursive: true, force: true })
console.log(`prerender: ${n} routes + 404.html geschreven naar dist/`)
