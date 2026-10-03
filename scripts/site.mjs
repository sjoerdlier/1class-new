// Gedeelde helpers voor de build-scripts (gen-redirects, prerender, sitemap).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const SITE_URL = (process.env.SITE_URL || 'https://www.1classadditions.nl').replace(/\/+$/, '')
export const SITE_NAME = '1ClassAdditions'

export const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'))
export const products = () => readJson('src/data/products.json')
export const categories = () => readJson('src/data/categories.json')
export const exists = (rel) => fs.existsSync(path.join(ROOT, rel))

// Statische routes uit src/App.jsx (path="/..." zonder :param of *), zodat nieuwe infopagina's
// (bv. /privacy, /algemene-voorwaarden) automatisch worden geprerenderd zonder scriptwijziging.
export function staticRoutes() {
  const src = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8')
  const found = [...src.matchAll(/path=["'](\/[^"'*:]*)["']/g)].map((m) => m[1])
  return [...new Set(['/', ...found])]
}

// Routes die niet in de sitemap horen.
export const NOINDEX_ROUTES = new Set(['/bestellen'])

export const strip = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&euro;/g, '€')
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const truncate = (s, n = 155) => {
  s = s.replace(/\s+/g, ' ').trim()
  if (s.length <= n) return s
  const cut = s.slice(0, n - 1)
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : n - 1).replace(/[,;:\s-]+$/, '') + '…'
}

export const abs = (p) => (/^https?:/.test(p) ? p : SITE_URL + (p.startsWith('/') ? p : '/' + p))
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
