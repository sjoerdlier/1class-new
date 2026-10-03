// Live-meldingen voor schermlezers (WCAG 4.1.3). De twee regio's staan direct onder <body>, buiten #root,
// zodat ze ook werken wanneer een dialoog open is en #root `inert` is.
//   announce('Hoes toegevoegd aan winkelwagen')                    beleefd (polite)
//   announce('Er ging iets mis', { assertive: true })              onderbreekt
// Zonder document (prerender/tests) doet announce() niets.
let regions = null

function ensure() {
  if (typeof document === 'undefined') return null
  if (regions && regions.polite.isConnected) return regions
  const make = (kind) => {
    const el = document.createElement('div')
    el.className = 'sr-only'
    el.setAttribute('data-announcer', kind)
    el.setAttribute('role', kind === 'assertive' ? 'alert' : 'status')
    el.setAttribute('aria-live', kind)
    el.setAttribute('aria-atomic', 'true')
    document.body.appendChild(el)
    return el
  }
  regions = { polite: make('polite'), assertive: make('assertive'), timers: {} }
  return regions
}

export function initAnnouncer() { ensure() }

export function announce(message, { assertive = false } = {}) {
  const r = ensure()
  if (!r || !message) return
  const kind = assertive ? 'assertive' : 'polite'
  const el = r[kind]
  clearTimeout(r.timers[kind])
  el.textContent = ''
  // Even leegmaken en daarna vullen, zodat dezelfde tekst twee keer achter elkaar toch wordt voorgelezen.
  r.timers[kind] = setTimeout(() => { el.textContent = message }, 60)
}
