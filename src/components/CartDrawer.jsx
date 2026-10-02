import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { eur, FREE_SHIPPING, PROMO } from '../lib.js'
import { Close, Minus, Plus, Truck } from './Icons.jsx'

export function ShipBar({ total }) {
  const left = Math.max(0, FREE_SHIPPING - total)
  return (
    <div className="shipbar">
      <p><Truck size={16} /> {left > 0 ? <>Nog <b>{eur(left)}</b> tot gratis verzending</> : <b>Je bestelling wordt gratis verzonden</b>}</p>
      <div className="bar"><i style={{ width: `${Math.min(100, (total / FREE_SHIPPING) * 100)}%` }} /></div>
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
          <div className="empty"><p>Je winkelwagen is leeg.</p><Link className="btn" to="/c" onClick={() => c.setOpen(false)}>Bekijk de producten</Link></div>
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
                      <button onClick={() => c.setQty(l.key, l.qty - 1)} aria-label="Minder"><Minus size={14} /></button>
                      <span>{l.qty}</span>
                      <button onClick={() => c.setQty(l.key, l.qty + 1)} aria-label="Meer"><Plus size={14} /></button>
                    </div>
                  </div>
                  <b>{eur(l.price * l.qty)}</b>
                </li>
              ))}
            </ul>
            <footer>
              {c.subtotal < PROMO.min && c.subtotal > 0 && <p className="hint">Bestel nog {eur(PROMO.min - c.subtotal)} extra en krijg {PROMO.pct}% korting met code <b>{PROMO.code}</b>.</p>}
              <div className="row"><span>Subtotaal</span><span>{eur(c.subtotal)}</span></div>
              {c.discount > 0 && <div className="row good"><span>Korting {PROMO.pct}%</span><span>− {eur(c.discount)}</span></div>}
              <div className="row total"><span>Totaal</span><span>{eur(c.total)}</span></div>
              <Link className="btn block" to="/bestellen" onClick={() => c.setOpen(false)}>Bestelling afronden</Link>
              <button className="link" onClick={() => c.setOpen(false)}>Verder winkelen</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
