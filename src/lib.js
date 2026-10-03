import products from './data/products.json'
import categories from './data/categories.json'

// Optioneel: src/data/redirects.json met oude product-adressen. Formaat: { "/p/oud": "/p/nieuw" } of [{ source, destination }].
// Bestaat het bestand niet, dan is dit gewoon leeg.
const redirectFiles = import.meta.glob('./data/redirects.json', { eager: true, import: 'default' })
const rawRedirects = Object.values(redirectFiles)[0] || {}
const redirectList = Array.isArray(rawRedirects) ? rawRedirects.map((r) => [r?.source, r?.destination]) : Object.entries(rawRedirects)
const slugOf = (u) => (typeof u === 'string' && u.startsWith('/p/') ? u.slice(3).replace(/\/$/, '') : null)
export const redirects = Object.fromEntries(redirectList.map(([a, b]) => [slugOf(a), slugOf(b)]).filter(([a, b]) => a && b))
export const resolveSlug = (slug) => (Object.prototype.hasOwnProperty.call(redirects, slug) ? redirects[slug] : slug)

export { products, categories }
export const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export { FREE_SHIPPING, PROMO } from './pricing.js'
export const CONTACT = {
  phone: '+31 (0)26 442 99 37',
  phoneHref: 'tel:+31264429937',
  email: 'sales@1classadditions.nl',
  address: 'Bonnetstraat 33, 6718 XN Ede',
}

export const topCategories = categories.filter((c) => c.parent === 0)
export const childrenOf = (id) => categories.filter((c) => c.parent === id)
export const catBySlug = (slug) => categories.find((c) => c.slug === slug)
export const catById = (id) => categories.find((c) => c.id === id)
export const productBySlug = (slug) => products.find((p) => p.slug === slug)

export const hasRange = (p) => p.priceTo > p.priceFrom
export const mainCat = (p) => {
  const cs = p.cats.map(catById).filter(Boolean)
  return cs.sort((a, b) => b.depth - a.depth)[0]
}

// Zoeken: accent- en hoofdletterongevoelig, per woord (alle woorden moeten voorkomen),
// met eenvoudige meervoud/enkelvoud-herkenning (nummerplaat -> nummerplaten, hoes -> hoezen).
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const words = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean)
export function stem(w) {
  let t = w
  if (t.length > 4) t = t.replace(/(en|s|e)$/, '')
  t = t.replace(/([aeou])\1([^aeiou])$/, '$1$2') // plaat -> plat
  t = t.replace(/z$/, 's').replace(/v$/, 'f') // hoez -> hoes
  return t
}
const catTitles = (p) => p.cats.flatMap((id) => {
  const c = catById(id)
  const par = c?.parent ? catById(c.parent) : null
  return [c?.title, par?.title]
}).filter(Boolean).join(' ')
const index = new Map()
const hayOf = (p) => {
  let h = index.get(p.id)
  if (!h) {
    const title = `${p.title} ${p.brand}`
    const all = `${title} ${p.short} ${p.tags.join(' ')} ${catTitles(p)}`
    h = { title: norm(title), raw: norm(all), stem: words(all).map(stem).join(' '), titleStem: words(title).map(stem).join(' ') }
    index.set(p.id, h)
  }
  return h
}

export function search(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const hits = []
  for (const p of products) {
    const h = hayOf(p)
    let inTitle = 0
    let ok = true
    for (const t of terms) {
      const st = words(t).map(stem).join(' ')
      const found = h.raw.includes(t) || (st && h.stem.includes(st))
      if (!found) { ok = false; break }
      if (h.title.includes(t) || (st && h.titleStem.includes(st))) inTitle++
    }
    if (ok) hits.push([inTitle, p])
  }
  return hits.sort((a, b) => b[0] - a[0]).map(([, p]) => p) // stabiele sortering: titel-treffers eerst
}

// Strikte HTML-allowlist (werkt in browser en Node, geen DOM nodig). Alleen onderstaande tags, zonder attributen,
// behalve <a href> met http(s)/mailto/tel of een pad. Alles anders wordt verwijderd of als tekst geescaped.
const ALLOWED = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'span', 'a'])
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i
export function sanitizeHtml(html) {
  if (!html) return ''
  let s = String(html).replace(/<!--[\s\S]*?-->/g, '')
  s = s.replace(/<(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
  return s.split(/(<[^<>]*>)/).map((part) => {
    if (!part.startsWith('<') || !part.endsWith('>')) return part.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/.exec(part)
    if (!m || !ALLOWED.has(m[2].toLowerCase())) return ''
    const tag = m[2].toLowerCase()
    if (m[1]) return `</${tag}>`
    if (tag !== 'a') return `<${tag}>`
    const h = /\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(part)
    const href = (h?.[1] ?? h?.[2] ?? h?.[3] ?? '').replace(/[\u0000-\u0020\u007f-\u009f]/g, '')
    if (!href || !SAFE_HREF.test(href)) return '<a>'
    const safe = href.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E')
    const ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${safe}"${ext}>`
  }).join('')
}

// Hand-picked by slug so the homepage always leads with what sells; falls back to first products.
const FEATURED = ['topcover', 'acculader-xs-08', 'stallingsbok', 'convertible-soft-top-clean-protect']
export const featured = () => {
  const picked = FEATURED.map(productBySlug).filter(Boolean)
  return picked.length ? picked : products.slice(0, 4)
}

// Korte tekst netjes afkappen op een zin of woord (de scrape knipte `short` soms midden in een woord).
export function leadText(s, max = 200) {
  const t = String(s ?? '').replace(/([a-z])\.([A-Z])/g, '$1. $2').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const i = cut.lastIndexOf('. ')
  if (i > 60) return cut.slice(0, i + 1)
  return `${cut.replace(/\s+\S*$/, '')}…`
}

export const cheapestIndex = (p) => {
  const vs = p.variants || []
  let best = -1
  vs.forEach((v, i) => { if (v.available !== false && (best < 0 || v.price < vs[best].price)) best = i })
  return best < 0 ? 0 : best
}

export function relatedProducts(p, n = 4) {
  const mine = mainCat(p)
  const seen = new Set([p.title])
  const score = (x) => (mine && mainCat(x)?.id === mine.id ? 0 : 1)
  return products
    .filter((x) => x.id !== p.id && x.cats.some((c) => p.cats.includes(c)))
    .sort((a, b) => score(a) - score(b) || Math.abs(a.priceFrom - p.priceFrom) - Math.abs(b.priceFrom - p.priceFrom))
    .filter((x) => (seen.has(x.title) ? false : (seen.add(x.title), true)))
    .slice(0, n)
}
