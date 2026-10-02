import { useState } from 'react'
import { Link } from 'react-router-dom'
import pages from '../data/pages.json'
import { CONTACT } from '../lib.js'
import { Phone } from '../components/Icons.jsx'

function Page({ title, lead, html, children }) {
  return (
    <div className="wrap section narrow">
      <nav className="crumbs"><Link to="/">Home</Link> / <span>{title}</span></nav>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {html && <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />}
      {children}
    </div>
  )
}

export const About = () => <Page title="Over ons" lead="Informatie en producten voor het stallen van uw voertuig, van een ervaren team uit Ede." html={pages.over}>
  <div className="callout"><b>Onderdeel van Imparts B.V.</b><p>Dezelfde mensen, dezelfde kennis van klassiekers. {CONTACT.address}.</p><a className="btn" href={CONTACT.phoneHref}><Phone size={16} /> Bel ons</a></div>
</Page>
export const Shipping = () => <Page title="Verzenden & retourneren" html={pages.verzenden} />
export const Knowledge = () => <Page title="Fabels & Feiten" lead="Wat kan een autohoes wel, en wat niet? Eerlijke antwoorden van de specialist." html={pages.feiten} />
export const Dealers = () => <Page title="Dealers" lead="Ons assortiment is ook verkrijgbaar bij geselecteerde bedrijven in Nederland, België en Duitsland." html={pages.dealers.replace(/^\s*<p>.*?<\/p>/, '')} />

const FAQ = [
  ['Waarom een hoes als mijn auto binnen staat?', 'Een goede hoes beschermt tegen stof en krassen, bijvoorbeeld van kinderfietsjes, de grasmaaier of de rits van je jas.'],
  ['Waarom is mijn auto nat, ook in de garage?', 'Dat is condenswater. Condens ontstaat onder bepaalde klimatologische omstandigheden en kan zowel buiten als binnen voorkomen.'],
  ['Kan een hoes condens voorkomen?', 'Nee, dat is een fabeltje. Een hoes kan het weer niet veranderen. Wel bestaan er geventileerde stallingssystemen die het klimaat rond de auto beïnvloeden.'],
  ['Welke hoes is de beste?', 'Dé beste hoes bestaat niet; het hangt af van waar en hoe lang je auto staat. Gebruik onze keuzehulp op de homepage of bel ons voor advies.'],
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
          <div className="callout"><b>Bel ons</b><a className="big" href={CONTACT.phoneHref}>{CONTACT.phone}</a><p>ma t/m vr 09:00 – 17:30, zaterdag gesloten.<br />Afspraak buiten openingstijden? Bel +31 (0)6 83 24 04 11.</p><p>{CONTACT.address}</p></div>
          <form className="form" onSubmit={submit}>
            <h3>Stel je vraag</h3>
            <label>Naam<input name="naam" required /></label>
            <label>E-mail<input name="email" type="email" required /></label>
            <label>Bericht<textarea name="bericht" rows="5" required /></label>
            <button className="btn">Verstuur</button>
            {sent && <p className="hint">Je mailprogramma opent nu met je bericht.</p>}
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
