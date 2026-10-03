import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { OrderTotals, ShipBar } from '../components/CartDrawer.jsx'
import { CONTACT, FREE_SHIPPING, PROMO, eur } from '../lib.js'
import { PROMO_INVALID_TEXT, PROMO_LOW_TEXT, buildRequestMessage, lineTotal } from '../pricing.js'
import { announce } from '../announce.js'
import { focusHeading } from '../a11y/focus.js'
import '../shop.css'

// De bestelling loopt (nog) via e-mail: dit is een aanvraag, geen betaalde bestelling.
// Vervang `openMail` door een echte checkout zodra die er is.
const EMPTY = { naam: '', tel: '', email: '', adres: '', postcode: '', plaats: '', opm: '' }

// Veld met label en foutmelding. De foutmelding is met aria-describedby aan het veld gekoppeld (zie `aria`).
function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>{label}{children}</label>
      {error && <small id={`err-${id}`} className="field-err">{error}</small>}
    </div>
  )
}
const aria = (k, errors) => (errors[k] ? { 'aria-invalid': 'true', 'aria-describedby': `err-${k}` } : {})

export default function Checkout() {
  const c = useCart()
  const [form, setForm] = useState(EMPTY)
  const [agreed, setAgreed] = useState(false)
  const [stage, setStage] = useState('form') // 'form' | 'sent' | 'done'
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState({})

  // Nieuwe stap (bevestigingsscherm): focus naar de kop, zodat schermlezers de wissel horen.
  useEffect(() => { if (stage !== 'form') focusHeading() }, [stage])

  if (!c.ready) return <div className="wrap section narrow"><p className="muted">Een moment geduld.</p></div>

  if (stage === 'done') {
    return (
      <div className="wrap section narrow">
        <h1 tabIndex={-1}>Dank u voor uw aanvraag</h1>
        <p className="lead">U heeft aangegeven dat u de e-mail heeft verzonden. Wij bevestigen uw bestelling en betaalinstructies per e-mail. Heeft u een tijdje niets van ons gehoord, neem dan contact met ons op via <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> of <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>
        <Link className="btn" to="/">Terug naar home</Link>
      </div>
    )
  }

  if (c.lines.length === 0 && stage === 'form') {
    return <div className="wrap section narrow"><h1>Uw winkelwagen is leeg</h1><Link className="btn" to="/c">Naar de producten</Link></div>
  }

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }
  const mailtoHref = (msg) => `mailto:${CONTACT.email}?subject=${encodeURIComponent('Bestelaanvraag 1classadditions.nl')}&body=${encodeURIComponent(msg.replace(/\n/g, '\r\n'))}`

  const validate = () => {
    const er = {}
    if (!form.naam.trim()) er.naam = 'Vul uw naam in.'
    if (!form.email.trim()) er.email = 'Vul uw e-mailadres in.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.nl.'
    if (!form.adres.trim()) er.adres = 'Vul uw straat en huisnummer in.'
    if (!form.postcode.trim()) er.postcode = 'Vul uw postcode in.'
    if (!form.plaats.trim()) er.plaats = 'Vul uw woonplaats in.'
    if (!agreed) er.agreed = 'Vink aan dat u de voorwaarden, de herroepingsinformatie en de privacyverklaring heeft gelezen.'
    return er
  }

  const submit = (e) => {
    e.preventDefault()
    if (c.lines.length === 0) return
    const er = validate()
    if (Object.keys(er).length > 0) {
      setErrors(er)
      const n = Object.keys(er).length
      announce(`Controleer uw gegevens: ${n} ${n === 1 ? 'veld is' : 'velden zijn'} niet goed ingevuld.`, { assertive: true })
      // Focus naar het eerste veld met een fout.
      setTimeout(() => {
        const first = Object.keys(er)[0]
        document.getElementById(first === 'agreed' ? 'f-agreed' : `f-${first}`)?.focus()
      }, 0)
      return
    }
    setErrors({})
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
      announce('De tekst staat op uw klembord.')
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
          <h1 tabIndex={-1}>Uw bestelaanvraag</h1>
          <p className="lead">Uw e-mailprogramma is geopend. Verstuur de e-mail om uw aanvraag door te geven; wij bevestigen uw bestelling en betaalinstructies per e-mail.</p>
          <p>Is er geen e-mailprogramma geopend? Kopieer dan de tekst hieronder en mail die naar <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, of <a href={mailtoHref(message)}>probeer het opnieuw</a>. Uw winkelwagen blijft bewaard tot u aangeeft dat de e-mail is verzonden.</p>
          <label htmlFor="aanvraag-tekst" className="muted">Uw bericht</label>
          <textarea id="aanvraag-tekst" readOnly rows="14" value={message} onFocus={(e) => e.target.select()} />
          <div className="btn-row">
            <button type="button" className="btn-ghost" onClick={copy}>{copied ? 'Gekopieerd' : 'Tekst kopiëren'}</button>
            <button type="button" className="btn" onClick={confirmSent}>Ik heb de e-mail verzonden</button>
            <button type="button" className="link" onClick={() => setStage('form')}>Terug</button>
          </div>
          <span role="status" aria-live="polite" className="muted">{copied ? 'De tekst staat op uw klembord.' : ''}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap section">
      <h1>Bestelaanvraag</h1>
      <div className="checkout">
        <form className="form" onSubmit={submit} noValidate>
          <div className="request-note">
            <p><b>Dit is een aanvraag, nog geen betaalde bestelling.</b> U betaalt nu niets. Wij bevestigen uw bestelling, de verzendkosten en de betaalinstructies per e-mail.</p>
            <p>Alle prijzen zijn inclusief btw. Verzending is gratis vanaf {eur(FREE_SHIPPING)}; daaronder berekenen wij de verzendkosten en bevestigen wij die in onze reactie.</p>
          </div>
          <h2 className="h3">Uw gegevens</h2>
          <p className="muted" style={{ margin: 0 }}>Velden met een * zijn verplicht.</p>
          {Object.values(errors).some(Boolean) && (
            <div className="form-alert" role="alert">Er ontbreekt nog iets. Controleer de gemarkeerde velden hieronder.</div>
          )}
          <div className="two">
            <Field id="naam" label="Naam *" error={errors.naam}><input id="f-naam" name="naam" value={form.naam} onChange={set('naam')} required aria-required="true" autoComplete="name" {...aria('naam', errors)} /></Field>
            <Field id="tel" label="Telefoon (optioneel)"><input id="f-tel" name="tel" type="tel" inputMode="tel" value={form.tel} onChange={set('tel')} autoComplete="tel" /></Field>
          </div>
          <Field id="email" label="E-mail *" error={errors.email}><input id="f-email" name="email" type="email" value={form.email} onChange={set('email')} required aria-required="true" autoComplete="email" {...aria('email', errors)} /></Field>
          <Field id="adres" label="Straat en huisnummer *" error={errors.adres}><input id="f-adres" name="adres" value={form.adres} onChange={set('adres')} required aria-required="true" autoComplete="street-address" {...aria('adres', errors)} /></Field>
          <div className="two">
            <Field id="postcode" label="Postcode *" error={errors.postcode}><input id="f-postcode" name="postcode" value={form.postcode} onChange={set('postcode')} required aria-required="true" autoComplete="postal-code" {...aria('postcode', errors)} /></Field>
            <Field id="plaats" label="Plaats *" error={errors.plaats}><input id="f-plaats" name="plaats" value={form.plaats} onChange={set('plaats')} required aria-required="true" autoComplete="address-level2" {...aria('plaats', errors)} /></Field>
          </div>
          <Field id="opm" label="Opmerking (optioneel)"><textarea id="f-opm" name="opm" rows="3" value={form.opm} onChange={set('opm')} /></Field>
          <div>
            <label className="consent" htmlFor="f-agreed">
              <input id="f-agreed" type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if (errors.agreed) setErrors((er) => ({ ...er, agreed: undefined })) }} required aria-required="true" {...aria('agreed', errors)} />
              <span>Ik heb de <Link to="/voorwaarden" target="_blank">algemene voorwaarden<span className="sr-only"> (opent in een nieuw tabblad)</span></Link>, de <Link to="/herroeping" target="_blank">herroepingsinformatie<span className="sr-only"> (opent in een nieuw tabblad)</span></Link> en de <Link to="/privacy" target="_blank">privacyverklaring<span className="sr-only"> (opent in een nieuw tabblad)</span></Link> gelezen. *</span>
            </label>
            {errors.agreed && <small id="err-agreed" className="field-err">{errors.agreed}</small>}
          </div>
          <button className="btn lg" disabled={c.lines.length === 0}>Bestelaanvraag opstellen</button>
          <p className="muted">Er opent een e-mail aan {CONTACT.email} met uw bestelling. Pas als u die e-mail verstuurt, ontvangen wij uw aanvraag.</p>
        </form>

        <section className="summary" aria-labelledby="overzicht-titel">
          <h2 id="overzicht-titel" className="h3">Overzicht</h2>
          <ShipBar total={c.total} />
          <ul className="lines" aria-label="Uw producten">
            {c.lines.map((l) => (
              <li key={l.key}><img src={l.image} alt="" /><div><span>{l.title}</span>{l.variant && <small>{l.variant}</small>}<small>{l.qty} ×</small></div><b>{eur(lineTotal(l))}</b></li>
            ))}
          </ul>
          <div className="code-in">
            <label htmlFor="kortingscode">Kortingscode</label>
            <input id="kortingscode" name="kortingscode" value={c.code} onChange={(e) => c.setCode(e.target.value)} placeholder="Heeft u een code?" aria-describedby="code-msg" aria-invalid={c.codeStatus === 'invalid' || c.codeStatus === 'low' ? 'true' : undefined} autoComplete="off" autoCapitalize="off" spellCheck="false" />
            <small id="code-msg" role="status" aria-live="polite" className={`msg ${c.codeStatus === 'ok' ? 'ok' : c.codeStatus === 'none' ? '' : 'bad'}`}>
              {c.codeStatus === 'ok' && `${PROMO.pct}% korting toegepast.`}
              {c.codeStatus === 'low' && PROMO_LOW_TEXT}
              {c.codeStatus === 'invalid' && PROMO_INVALID_TEXT}
            </small>
          </div>
          <OrderTotals c={c} />
        </section>
      </div>
    </div>
  )
}
