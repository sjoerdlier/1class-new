import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { eur, FREE_SHIPPING, PROMO } from '../lib.js'
import { lineTotal, MAX_QTY, PROMO_TEXT } from '../pricing.js'
import { Close, Minus, Plus, Truck } from './Icons.jsx'
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
  if (!c.open) return null
  return (
    <div className="drawer-wrap" role="dialog" aria-label="Winkelwagen">
      <div className="scrim" onClick={() => c.setOpen(false)} />
      <aside className="drawer">
        <header>
          <h2>Winkelwagen <span>({c.count})</span></h2>
          <button className="btn-icon plain" onClick={() => c.setOpen(false)} aria-label="Sluiten"><Close /></button>
        </header>
        {c.lines.length === 0 ? (
          <div className="empty"><p>Uw winkelwagen is leeg.</p><Link className="btn" to="/c" onClick={() => c.setOpen(false)}>Bekijk de producten</Link></div>
        ) : (
          <>
            <ShipBar total={c.total} />
            <ul className="lines">
              {c.lines.map((l) => (
                <li key={l.key}>
                  <img src={l.image} alt="" />
                  <div>
                    <Link to={`/p/${l.slug}`} onClick={() => c.setOpen(false)}>{l.title}</Link>
                    {l.variant && <small>{l.variant}</small>}
                    <div className="qty sm">
                      <button onClick={() => c.setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} aria-label="Minder"><Minus size={14} /></button>
                      <span>{l.qty}</span>
                      <button onClick={() => c.setQty(l.key, l.qty + 1)} disabled={l.qty >= MAX_QTY} aria-label="Meer"><Plus size={14} /></button>
                    </div>
                    <button className="rm" onClick={() => c.setQty(l.key, 0)}>Verwijderen</button>
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
              <Link className="btn block" to="/bestellen" onClick={() => c.setOpen(false)}>Naar bestelaanvraag</Link>
              <button className="link" onClick={() => c.setOpen(false)}>Verder winkelen</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
