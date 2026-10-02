import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { ShipBar } from '../components/CartDrawer.jsx'
import { CONTACT, PROMO, eur } from '../lib.js'

// NOTE: payment is not wired up yet. This sends the order as an e-mail request to sales@;
// replace `submit` with the Lightspeed/Woo checkout call once that is decided.
export default function Checkout() {
  const c = useCart()
  const [sent, setSent] = useState(false)

  if (c.lines.length === 0 && !sent) {
    return <div className="wrap section narrow"><h1>Je winkelwagen is leeg</h1><Link className="btn" to="/c">Naar de producten</Link></div>
  }
  if (sent) {
    return <div className="wrap section narrow"><h1>Bedankt voor je bestelling</h1><p className="lead">Je mailprogramma opent met je bestelling. Verstuur die, dan bevestigen we je order en sturen we een betaallink.</p><Link className="btn" to="/">Terug naar home</Link></div>
  }

  const submit = (e) => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const rows = c.lines.map((l) => `${l.qty}x ${l.title}${l.variant ? ` (${l.variant})` : ''} — ${eur(l.price * l.qty)}`).join('\n')
    const body = `BESTELLING\n\n${rows}\n\nSubtotaal: ${eur(c.subtotal)}${c.discount ? `\nKorting (${c.code}): -${eur(c.discount)}` : ''}\nTotaal: ${eur(c.total)}\n\nNaam: ${f.naam}\nE-mail: ${f.email}\nTelefoon: ${f.tel}\nAdres: ${f.adres}, ${f.postcode} ${f.plaats}\nOpmerking: ${f.opm || '-'}`
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Bestelling 1classadditions.nl')}&body=${encodeURIComponent(body)}`
    c.clear()
    setSent(true)
  }

  return (
    <div className="wrap section">
      <h1>Bestelling afronden</h1>
      <div className="checkout">
        <form className="form" onSubmit={submit}>
          <h3>Jouw gegevens</h3>
          <div className="two"><label>Naam<input name="naam" required autoComplete="name" /></label><label>Telefoon<input name="tel" autoComplete="tel" /></label></div>
          <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
          <label>Adres<input name="adres" required autoComplete="street-address" /></label>
          <div className="two"><label>Postcode<input name="postcode" required autoComplete="postal-code" /></label><label>Plaats<input name="plaats" required autoComplete="address-level2" /></label></div>
          <label>Opmerking (optioneel)<textarea name="opm" rows="3" /></label>
          <button className="btn lg">Bestelling versturen</button>
          <p className="muted">Na je bestelling ontvang je een bevestiging en betaallink (iDEAL, creditcard of rembours).</p>
        </form>

        <aside className="summary">
          <h3>Overzicht</h3>
          <ShipBar total={c.total} />
          <ul className="lines">
            {c.lines.map((l) => (
              <li key={l.key}><img src={l.image} alt="" /><div><span>{l.title}</span>{l.variant && <small>{l.variant}</small>}<small>{l.qty} ×</small></div><b>{eur(l.price * l.qty)}</b></li>
            ))}
          </ul>
          <div className="code-in">
            <input value={c.code} onChange={(e) => c.setCode(e.target.value)} placeholder="Kortingscode" aria-label="Kortingscode" />
            {c.code && <small className={c.promoOk ? 'ok' : 'bad'}>{c.promoOk ? `${PROMO.pct}% korting toegepast` : `Geldig vanaf ${eur(PROMO.min)}`}</small>}
          </div>
          <div className="row"><span>Subtotaal</span><span>{eur(c.subtotal)}</span></div>
          {c.discount > 0 && <div className="row good"><span>Korting</span><span>− {eur(c.discount)}</span></div>}
          <div className="row total"><span>Totaal</span><span>{eur(c.total)}</span></div>
        </aside>
      </div>
    </div>
  )
}
