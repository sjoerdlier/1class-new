import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { OrderTotals, ShipBar } from '../components/CartDrawer.jsx'
import { CONTACT, FREE_SHIPPING, PROMO, eur } from '../lib.js'
import { PROMO_INVALID_TEXT, PROMO_LOW_TEXT, buildRequestMessage, lineTotal } from '../pricing.js'
import '../shop.css'

// De bestelling loopt (nog) via e-mail: dit is een aanvraag, geen betaalde bestelling.
// Vervang `openMail` door een echte checkout zodra die er is.
const EMPTY = { naam: '', tel: '', email: '', adres: '', postcode: '', plaats: '', opm: '' }

export default function Checkout() {
  const c = useCart()
  const [form, setForm] = useState(EMPTY)
  const [agreed, setAgreed] = useState(false)
  const [stage, setStage] = useState('form') // 'form' | 'sent' | 'done'
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)

  if (!c.ready) return <div className="wrap section narrow"><p className="muted">Een moment geduld.</p></div>

  if (stage === 'done') {
    return (
      <div className="wrap section narrow">
        <h1>Dank u voor uw aanvraag</h1>
        <p className="lead">U heeft aangegeven dat u de e-mail heeft verzonden. Wij bevestigen uw bestelling en betaalinstructies per e-mail. Heeft u een tijdje niets van ons gehoord, neem dan contact met ons op via <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> of <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
        <Link className="btn" to="/">Terug naar home</Link>
      </div>
    )
  }

  if (c.lines.length === 0 && stage === 'form') {
    return <div className="wrap section narrow"><h1>Uw winkelwagen is leeg</h1><Link className="btn" to="/c">Naar de producten</Link></div>
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const mailtoHref = (msg) => `mailto:${CONTACT.email}?subject=${encodeURIComponent('Bestelaanvraag 1classadditions.nl')}&body=${encodeURIComponent(msg.replace(/\n/g, '\r\n'))}`

  const submit = (e) => {
    e.preventDefault()
    if (!agreed || c.lines.length === 0) return
    const msg = buildRequestMessage(c.lines, c.code, form)
    setMessage(msg)
    setCopied(false)
    setStage('sent')
    window.scrollTo?.(0, 0)
    window.location.href = mailtoHref(msg)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      document.getElementById('aanvraag-tekst')?.select() // zonder clipboard-toegang: tekst selecteren
    }
  }

  const confirmSent = () => {
    c.clear()
    setStage('done')
    window.scrollTo?.(0, 0)
  }

  if (stage === 'sent') {
    return (
      <div className="wrap section narrow">
        <div className="sent-box">
          <h1>Uw bestelaanvraag</h1>
          <p className="lead">Uw e-mailprogramma is geopend. Verstuur de e-mail om uw aanvraag door te geven; wij bevestigen uw bestelling en betaalinstructies per e-mail.</p>
          <p>Is er geen e-mailprogramma geopend? Kopieer dan de tekst hieronder en mail die naar <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, of <a href={mailtoHref(message)}>probeer het opnieuw</a>. Uw winkelwagen blijft bewaard tot u aangeeft dat de e-mail is verzonden.</p>
          <label htmlFor="aanvraag-tekst" className="muted">Uw bericht</label>
          <textarea id="aanvraag-tekst" readOnly rows="14" value={message} onFocus={(e) => e.target.select()} />
          <div className="btn-row">
            <button type="button" className="btn-ghost" onClick={copy}>{copied ? 'Gekopieerd' : 'Tekst kopiëren'}</button>
            <button type="button" className="btn" onClick={confirmSent}>Ik heb de e-mail verzonden</button>
            <button type="button" className="link" onClick={() => setStage('form')}>Terug</button>
          </div>
          <span role="status" className="muted">{copied ? 'De tekst staat op uw klembord.' : ''}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <h1>Bestelaanvraag</h1>
      <div className="checkout">
        <form className="form" onSubmit={submit}>
          <div className="request-note">
            <p><b>Dit is een aanvraag, nog geen betaalde bestelling.</b> U betaalt nu niets. Wij bevestigen uw bestelling, de verzendkosten en de betaalinstructies per e-mail.</p>
            <p>Alle prijzen zijn inclusief btw. Verzending is gratis vanaf {eur(FREE_SHIPPING)}; daaronder berekenen wij de verzendkosten en bevestigen wij die in onze reactie.</p>
          </div>
          <h3>Uw gegevens</h3>
          <div className="two"><label>Naam<input name="naam" value={form.naam} onChange={set('naam')} required autoComplete="name" /></label><label>Telefoon (optioneel)<input name="tel" type="tel" inputMode="tel" value={form.tel} onChange={set('tel')} autoComplete="tel" /></label></div>
          <label>E-mail<input name="email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
          <label>Adres<input name="adres" value={form.adres} onChange={set('adres')} required autoComplete="street-address" /></label>
          <div className="two"><label>Postcode<input name="postcode" value={form.postcode} onChange={set('postcode')} required autoComplete="postal-code" /></label><label>Plaats<input name="plaats" value={form.plaats} onChange={set('plaats')} required autoComplete="address-level2" /></label></div>
          <label>Opmerking (optioneel)<textarea name="opm" rows="3" value={form.opm} onChange={set('opm')} /></label>
          <label className="consent">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required />
            <span>Ik heb de <Link to="/voorwaarden" target="_blank">algemene voorwaarden</Link>, de <Link to="/herroeping" target="_blank">herroepingsinformatie</Link> en de <Link to="/privacy" target="_blank">privacyverklaring</Link> gelezen.</span>
          </label>
          <button className="btn lg" disabled={c.lines.length === 0}>Bestelaanvraag opstellen</button>
          <p className="muted">Er opent een e-mail aan {CONTACT.email} met uw bestelling. Pas als u die e-mail verstuurt, ontvangen wij uw aanvraag.</p>
        </form>

        <aside className="summary">
          <h3>Overzicht</h3>
          <ShipBar total={c.total} />
          <ul className="lines">
            {c.lines.map((l) => (
              <li key={l.key}><img src={l.image} alt="" /><div><span>{l.title}</span>{l.variant && <small>{l.variant}</small>}<small>{l.qty} ×</small></div><b>{eur(lineTotal(l))}</b></li>
            ))}
          </ul>
          <div className="code-in">
            <input value={c.code} onChange={(e) => c.setCode(e.target.value)} placeholder="Kortingscode" aria-label="Kortingscode" aria-describedby="code-msg" autoComplete="off" />
            <small id="code-msg" role="status" className={`msg ${c.codeStatus === 'ok' ? 'ok' : c.codeStatus === 'none' ? '' : 'bad'}`}>
              {c.codeStatus === 'ok' && `${PROMO.pct}% korting toegepast.`}
              {c.codeStatus === 'low' && PROMO_LOW_TEXT}
              {c.codeStatus === 'invalid' && PROMO_INVALID_TEXT}
            </small>
          </div>
          <OrderTotals c={c} />
        </aside>
      </div>
    </div>
  )
}
