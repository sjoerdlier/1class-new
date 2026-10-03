import { useState } from 'react'
import { Link } from 'react-router-dom'
import pages from '../data/pages.json'
import { CONTACT, sanitizeHtml } from '../lib.js'
import '../shop.css'
import { Phone } from '../components/Icons.jsx'

// Kopjes uit de scrape staan als <p><strong>HOOFDLETTERS</strong></p>: maak er echte koppen van.
const sentence = (t) => t.charAt(0) + t.slice(1).toLowerCase()
const tidy = (html) => html.replace(/<p>\s*<strong>([^<a-z]{4,})<\/strong>\s*<\/p>/g, (_, t) => `<h2>${sentence(t.trim())}</h2>`)
const prepare = (html) => sanitizeHtml(tidy(html))

function Page({ title, lead, html, children }) {
  return (
    <div className="wrap section narrow">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{title}</span></nav>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {html && <div className="prose" dangerouslySetInnerHTML={{ __html: prepare(html) }} />}
      {children}
    </div>
  )
}

export const About = () => <Page title="Over ons" lead="Informatie en producten voor het stallen van uw voertuig, van een ervaren team uit Ede." html={pages.over}>
  <div className="callout"><b>Onderdeel van Imparts B.V.</b><p>Dezelfde mensen, dezelfde kennis van klassiekers. {CONTACT.address}.</p><a className="btn" href={CONTACT.phoneHref}><Phone size={16} /> Bel ons</a></div>
</Page>
// Het oude retourgedeelte (dienst-tekst, onvolledig) is vervangen door de pagina Herroeping.
const shippingHtml = pages.verzenden.split(/<p>\s*<strong>RETOURNEREN<\/strong>\s*<\/p>/)[0]
export const Shipping = () => <Page title="Verzenden & retourneren" html={shippingHtml}>
  <div className="callout"><b>Retourneren en herroepen</b><p>Informatie over uw herroepingsrecht, het terugsturen van een bestelling en het modelformulier vindt u op onze pagina <Link to="/herroeping">Herroepingsrecht en retourneren</Link>.</p></div>
</Page>
export const Knowledge = () => <Page title="Fabels & Feiten" lead="Wat kan een autohoes wel, en wat niet? Eerlijke antwoorden van de specialist." html={pages.feiten} />
export const Dealers = () => <Page title="Dealers" lead="Ons assortiment is ook verkrijgbaar bij geselecteerde bedrijven in Nederland, België en Duitsland." html={pages.dealers.replace(/^\s*<p>.*?<\/p>/, '')} />

const FAQ = [
  ['Waarom een hoes als mijn auto binnen staat?', 'Een goede hoes beschermt tegen stof en krassen, bijvoorbeeld van kinderfietsjes, de grasmaaier of de rits van uw jas.'],
  ['Waarom is mijn auto nat, ook in de garage?', 'Dat is condenswater. Condens ontstaat onder bepaalde klimatologische omstandigheden en kan zowel buiten als binnen voorkomen.'],
  ['Kan een hoes condens voorkomen?', 'Nee, dat is een fabeltje. Een hoes kan het weer niet veranderen. Wel bestaan er geventileerde stallingssystemen die het klimaat rond de auto beïnvloeden.'],
  ['Welke hoes is de beste?', 'Dé beste hoes bestaat niet; het hangt af van waar en hoe lang uw auto staat. Gebruik onze keuzehulp op de homepage of bel ons voor advies.'],
]

export function Service() {
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    const f = new FormData(e.target)
    const body = `Naam: ${f.get('naam')}\nE-mail: ${f.get('email')}\n\n${f.get('bericht')}`
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Vraag via 1classadditions.nl')}&body=${encodeURIComponent(body)}`
    setSent(true)
  }
  return (
    <Page title="Klantenservice" lead="Wilt u meer weten over een van onze producten? Wij informeren u graag.">
      <div className="service-grid">
        <div>
          <div className="callout"><b>Bel ons</b><a className="big" href={CONTACT.phoneHref}>{CONTACT.phone}</a><p>ma t/m vr 09:00 – 17:30, zaterdag gesloten.</p><p>{CONTACT.address}</p></div>
          <form className="form" onSubmit={submit}>
            <h3>Stel uw vraag</h3>
            <label>Naam<input name="naam" required /></label>
            <label>E-mail<input name="email" type="email" required /></label>
            <label>Bericht<textarea name="bericht" rows="5" required /></label>
            <button className="btn">E-mail opstellen</button>
            <p className="muted">Er opent een e-mail aan {CONTACT.email}. Pas als u die verstuurt, ontvangen wij uw bericht. Zie onze <Link to="/privacy">privacyverklaring</Link>.</p>
            {sent && <p className="hint" role="status">Uw e-mailprogramma is geopend. Verstuur de e-mail om uw bericht door te geven. Opent er niets, mail dan naar <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p>}
          </form>
        </div>
        <div>
          <h3>Veelgestelde vragen</h3>
          {FAQ.map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>)}
          <p><Link to="/kennis">Meer in Fabels &amp; Feiten →</Link></p>
        </div>
      </div>
    </Page>
  )
}
