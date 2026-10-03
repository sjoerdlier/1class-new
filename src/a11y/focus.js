// Focus-hulpjes (WCAG 2.4.3). Geen document bij import: veilig voor prerender.
export const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])',
  'textarea:not([disabled])', 'summary', '[tabindex]:not([tabindex="-1"])',
].join(',')

export const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)

export function focusables(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[inert]') && visible(el))
}

// Zet focus op de hoofdkop van de pagina (of <main>) zonder te scrollen. Wordt na een routewissel
// en bij een nieuwe stap in het bestelformulier gebruikt.
export function focusHeading() {
  if (typeof document === 'undefined') return
  const target = document.querySelector('main h1') || document.getElementById('main')
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
