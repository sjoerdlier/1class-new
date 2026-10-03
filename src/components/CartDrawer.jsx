import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { eur, FREE_SHIPPING, PROMO } from '../lib.js'
import { lineTotal, MAX_QTY, PROMO_TEXT } from '../pricing.js'
import { Close, Minus, Plus, Truck } from './Icons.jsx'
import Portal from '../a11y/Portal.jsx'
import { useDialog } from '../a11y/useDialog.js'
import '../shop.css'

// Voortgang naar gratis verzending. `total` is het bedrag na korting.
export function ShipBar({ total }) {
  const t = Number.isFinite(total) && total > 0 ? total : 0
  const left = Math.max(0, FREE_SHIPPING - t)
  const pct = Math.min(100, Math.round((t / FREE_SHIPPING) * 100))
  return (
    <div className="shipbar">
      <p><Truck size={16} /> {left > 0 ? <>Nog <b>{eur(left)}</b> tot gratis verzending</> : <b>Uw bestelling wordt gratis verzonden</b>}</p>
      <div className="bar" role="progressbar" aria-label="Voortgang naar gratis verzending" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

// Totaalregels: subtotaal, korting, verzending, totaal. Gedeeld door lade en bestelaanvraag.
export function OrderTotals({ c }) {
  return (
    <div className="totals">
      <div className="row"><span>Subtotaal</span><span>{eur(c.subtotal)}</span></div>
      {c.discount > 0 && <div className="row good"><span>Korting {PROMO.pct}%</span><span>− {eur(c.discount)}</span></div>}
      <div className="row ship">
        <span>Verzending</span>
        {c.freeShip ? <b className="free">Gratis</b> : <small>Wordt berekend en bevestigd in onze reactie</small>}
      </div>
      <div className="row total"><span>Totaal incl. btw</span><span>{eur(c.total)}</span></div>
      {!c.freeShip && <p className="note">Excl. verzendkosten. Alle prijzen zijn inclusief btw.</p>}
      {c.freeShip && <p className="note">Alle prijzen zijn inclusief btw.</p>}
    </div>
  )
}

export default function CartDrawer() {
  const c = useCart()
  const close = useCallback(() => c.setOpen(false), [c.setOpen])
  const ref = useDialog(c.open, close)
  if (!c.open) return null

  // Na verwijderen verdwijnt de knop waar focus op stond: zet focus op de volgende regel, anders op "Sluiten".
  const remove = (e, key) => {
    const li = e.currentTarget.closest('li')
    const sibling = li?.nextElementSibling || li?.previousElementSibling
    c.setQty(key, 0)
    setTimeout(() => {
      const root = ref.current
      const target = sibling?.isConnected ? sibling.querySelector('.rm') : root?.querySelector('.empty a, [data-autofocus]')
      target?.focus()
    }, 0)
  }
  const change = (key, qty, e) => {
    if (e.currentTarget.getAttribute('aria-disabled') === 'true') return
    c.setQty(key, qty)
  }

  return (
    <Portal>
      <div className="drawer-wrap" role="dialog" aria-modal="true" aria-labelledby="cart-title" ref={ref}>
        <div className="scrim" onClick={close} />
        <div className="drawer">
          <header>
            <h2 id="cart-title">Winkelwagen <span>({c.count})</span></h2>
            <button data-autofocus className="btn-icon plain" onClick={close} aria-label="Winkelwagen sluiten"><Close /></button>
          </header>
          {c.lines.length === 0 ? (
            <div className="empty"><p>Uw winkelwagen is leeg.</p><Link className="btn" to="/c" onClick={close}>Bekijk de producten</Link></div>
          ) : (
            <>
              <ShipBar total={c.total} />
              <ul className="lines" aria-label="Producten in uw winkelwagen">
                {c.lines.map((l) => (
                  <li key={l.key}>
                    <img src={l.image} alt="" />
                    <div>
                      <Link to={`/p/${l.slug}`} onClick={close}>{l.title}</Link>
                      {l.variant && <small>{l.variant}</small>}
                      <div className="qty sm">
                        <button type="button" onClick={(e) => change(l.key, l.qty - 1, e)} aria-disabled={l.qty <= 1} aria-label={`Minder: ${l.title}`}><Minus size={14} /></button>
                        <output aria-label={`Aantal ${l.title}`}>{l.qty}</output>
                        <button type="button" onClick={(e) => change(l.key, l.qty + 1, e)} aria-disabled={l.qty >= MAX_QTY} aria-label={`Meer: ${l.title}`}><Plus size={14} /></button>
                      </div>
                      <button type="button" className="rm" onClick={(e) => remove(e, l.key)} aria-label={`Verwijder ${l.title}`}>Verwijderen</button>
                    </div>
                    <b>{eur(lineTotal(l))}</b>
                  </li>
                ))}
              </ul>
              <footer>
                {c.codeStatus !== 'ok' && c.subtotal > 0 && (
                  <p className="hint">
                    {PROMO_TEXT}.
                    {c.subtotal < PROMO.min && <> Nog <b>{eur(c.missingForPromo)}</b> te gaan.</>}
                  </p>
                )}
                <OrderTotals c={c} />
                <Link className="btn block" to="/bestellen" onClick={close}>Naar bestelaanvraag</Link>
                <button type="button" className="link" onClick={close}>Verder winkelen</button>
              </footer>
            </>
          )}
        </div>
      </div>
    </Portal>
  )
}
