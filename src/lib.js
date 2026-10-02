import products from './data/products.json'
import categories from './data/categories.json'

export { products, categories }
export const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n)

export const FREE_SHIPPING = 150
export const PROMO = { code: '1Class2026', min: 200, pct: 10 }
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

export function search(q) {
  const t = q.trim().toLowerCase()
  if (!t) return []
  return products.filter((p) => `${p.title} ${p.brand} ${p.short} ${p.tags.join(' ')}`.toLowerCase().includes(t))
}

// Hand-picked by slug so the homepage always leads with what sells; falls back to first products.
const FEATURED = ['topcover', 'acculader-xs-08', 'stallingsbok', 'convertible-soft-top-clean-protect']
export const featured = () => {
  const picked = FEATURED.map(productBySlug).filter(Boolean)
  return picked.length ? picked : products.slice(0, 4)
}
