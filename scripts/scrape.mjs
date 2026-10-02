// Scrapes the Lightspeed shop (JSON endpoints) into src/data/*.json and downloads images.
import fs from 'node:fs'
import path from 'node:path'
const BASE = 'https://www.1classadditions.nl/nl/'
const UA = { 'User-Agent': 'Mozilla/5.0' }
const root = path.resolve(import.meta.dirname, '..')
const imgDir = path.join(root, 'public', 'img')
fs.mkdirSync(imgDir, { recursive: true })
fs.mkdirSync(path.join(root, 'src', 'data'), { recursive: true })

const j = async (u) => (await fetch(u, { headers: UA })).json()
const strip = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

async function img(id, size = '900x900x2', name = 'img.jpg') {
  if (!id) return null
  const file = `${id}-${size.split('x')[0]}.jpg`
  const dest = path.join(imgDir, file)
  if (!fs.existsSync(dest)) {
    const r = await fetch(`https://cdn.webshopapp.com/shops/219293/files/${id}/${size}/${name}`, { headers: UA })
    if (!r.ok) { console.warn('img fail', id, r.status); return null }
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()))
  }
  return `/img/${file}`
}

const urls = new Map()
for (const p of [1, 2]) {
  const d = await j(`${BASE}collection/page${p}.ajax?format=json&limit=100`)
  for (const x of d.products) urls.set(x.id, x.url)
}
console.log('products', urls.size)

const products = []
const cats = new Map()
for (const [id, url] of urls) {
  const { product: p } = await j(url + '?format=json')
  const variants = Object.values(p.variants || {}).map((v) => ({
    id: v.id, title: v.title, price: v.price.price, old: v.price.price_old || null, code: v.code || '',
    available: v.stock?.available ?? true,
  }))
  const prices = variants.length ? variants.map((v) => v.price) : [p.price.price]
  const catList = Object.values(p.categories || {})
  for (const c of catList) cats.set(c.id, { id: c.id, parent: c.parent, slug: c.url, title: c.title, description: strip(c.description), image: c.image, depth: c.depth })
  const images = []
  for (const iid of (p.images || []).map(String).slice(0, 5)) { const u = await img(iid); if (u) images.push(u) }
  products.push({
    id: p.id, vid: p.vid, slug: p.url.replace(/\.html$/, ''), title: p.title, brand: p.brand?.title || '',
    short: strip(p.description), content: p.content || '', price: p.price.price, old: p.price.price_old || null,
    priceFrom: Math.min(...prices), priceTo: Math.max(...prices), variants, images,
    cats: catList.map((c) => c.id), tags: Object.values(p.tags || {}).map((t) => t.title || t),
    delivery: p.stock?.delivery?.title || '', available: p.stock?.available ?? true,
  })
  process.stdout.write('.')
}
console.log()

for (const c of cats.values()) c.imageUrl = await img(c.image, '760x550x2')
fs.writeFileSync(path.join(root, 'src/data/products.json'), JSON.stringify(products))
fs.writeFileSync(path.join(root, 'src/data/categories.json'), JSON.stringify([...cats.values()]))
console.log('done', products.length, 'products', cats.size, 'cats')
