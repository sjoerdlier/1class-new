import { useEffect, useRef } from 'react'
import { focusables } from './focus.js'

// Gedeelde dialoog-logica voor de winkelwagenlade en het mobiele menu:
//  - achtergrond (#root) onbereikbaar: `inert`, met aria-hidden als terugval in oudere browsers
//  - focus naar [data-autofocus] (of eerste bedienbare element), Tab blijft binnen de dialoog (trap)
//  - Escape sluit; focus gaat terug naar het element dat de dialoog opende
//  - scroll van de pagina vergrendeld (zonder dat de pagina verspringt door de verdwijnende scrollbalk)
// Gebruik:  const ref = useDialog(open, close);  <Portal><div role="dialog" aria-modal="true" ref={ref}>…
const supportsInert = typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype
let locks = 0 // meerdere dialogen tegelijk: pas loslaten bij de laatste

function lock() {
  const app = document.getElementById('root')
  if (locks++ === 0) {
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.dataset.prevOverflow = document.body.style.overflow
    document.body.dataset.prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`
    if (app) {
      if (supportsInert) app.inert = true
      else app.setAttribute('aria-hidden', 'true')
    }
  }
}
function unlock() {
  if (--locks > 0) return
  locks = 0
  const app = document.getElementById('root')
  document.body.style.overflow = document.body.dataset.prevOverflow || ''
  document.body.style.paddingRight = document.body.dataset.prevPad || ''
  delete document.body.dataset.prevOverflow
  delete document.body.dataset.prevPad
  if (app) {
    if (supportsInert) app.inert = false
    else app.removeAttribute('aria-hidden')
  }
}

export function useDialog(open, onClose) {
  const ref = useRef(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const root = ref.current
    if (!root) return undefined
    const opener = document.activeElement
    lock()
    const first = root.querySelector('[data-autofocus]') || focusables(root)[0] || root
    if (first === root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1')
    first.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault()
        closeRef.current?.()
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables(root)
      if (list.length === 0) { e.preventDefault(); return }
      const a = document.activeElement
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (!root.contains(a)) { e.preventDefault(); firstEl.focus(); return }
      if (e.shiftKey && (a === firstEl || a === root)) { e.preventDefault(); lastEl.focus() }
      else if (!e.shiftKey && a === lastEl) { e.preventDefault(); firstEl.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unlock()
      // Focus terug naar de opener, maar niet als die verdwenen is (dan neemt de routewissel het over).
      if (opener && opener !== document.body && opener.isConnected && typeof opener.focus === 'function') opener.focus({ preventScroll: true })
    }
  }, [open])

  return ref
}
