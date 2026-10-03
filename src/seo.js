import { useEffect } from 'react'

// Titels en meta per pagina op de client. Dezelfde formaten gebruikt scripts/prerender.mjs:
//   home                 HOME_TITLE
//   overige pagina's     `${naam} | 1ClassAdditions`
// Alleen in een effect, dus veilig bij server-side render (prerender).
export const SITE_NAME = '1ClassAdditions'
export const HOME_TITLE = `${SITE_NAME} — Autohoezen, stalling & onderhoud voor klassiekers`
export const HOME_DESC = 'Autohoezen, stalling en onderhoud voor klassieke auto’s, van Imparts B.V. uit Ede. Gratis verzending vanaf € 150.'
export const pageTitle = (name) => `${name} | ${SITE_NAME}`

export const strip = (html = '') => String(html)
  .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&euro;/g, '€')
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ').trim()

export const truncate = (s, n = 155) => {
  const t = String(s).replace(/\s+/g, ' ').trim()
  if (t.length <= n) return t
  const cut = t.slice(0, n - 1)
  return cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : n - 1).replace(/[,;:\s-]+$/, '') + '…'
}

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (content == null) { if (el) el.remove(); return }
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

// Zet titel, description en optioneel robots. Bij verlaten van de pagina valt alles terug op de
// standaardwaarden, zodat pagina's zonder eigen titel (bestellen, juridisch, 404) niets overhouden.
export function useSeo({ title, description, robots }) {
  useEffect(() => {
    document.title = title || HOME_TITLE
    setMeta('description', description || HOME_DESC)
    setMeta('robots', robots || null)
    return () => {
      document.title = HOME_TITLE
      setMeta('description', HOME_DESC)
      setMeta('robots', null)
    }
  }, [title, description, robots])
}
