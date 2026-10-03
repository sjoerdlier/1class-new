import { Link } from 'react-router-dom'
import { CONTACT } from '../lib.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div className="foot-brand">
          <img className="foot-logo" src="/logo-1class.png" alt="1ClassAdditions" width="172" height="40" />
          <p>Hoezen, stalling en onderhoud voor klassieke en moderne auto’s. Uit Ede, met persoonlijk advies.</p>
          <p className="muted">
            Onderdeel van <a className="inline" href="https://www.imparts.nl" target="_blank" rel="noopener noreferrer">Imparts B.V.<span className="sr-only"> (opent in een nieuw tabblad)</span></a>, specialist in onderdelen voor Britse auto’s.
          </p>
        </div>
        <nav aria-label="Winkel">
          <h2 className="foot-h">Winkel</h2>
          <Link to="/c/autohoezen">Autohoezen</Link>
          <Link to="/c/stalling">Stalling</Link>
          <Link to="/c/onderhoud">Onderhoud</Link>
          <Link to="/c/accessoires">Accessoires</Link>
        </nav>
        <nav aria-label="Service">
          <h2 className="foot-h">Service</h2>
          <Link to="/klantenservice">Klantenservice</Link>
          <Link to="/verzenden">Verzenden</Link>
          <Link to="/herroeping">Herroepen en retourneren</Link>
          <Link to="/kennis">Fabels &amp; Feiten</Link>
          <Link to="/dealers">Dealers</Link>
          <Link to="/over-ons">Over ons</Link>
        </nav>
        <div className="foot-advice">
          <h2 className="foot-h">Vragen of advies?</h2>
          <p>Mail <a className="inline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> of bel <a className="inline" href={CONTACT.phoneHref}>{CONTACT.phone}</a>.</p>
          <p className="muted">ma t/m vr 09:00 – 17:30<br />{CONTACT.address}</p>
        </div>
      </div>
      <div className="wrap legal">
        <span>© {new Date().getFullYear()} 1ClassAdditions · Imparts B.V.</span>
        <nav aria-label="Juridisch">
          <Link to="/voorwaarden">Algemene voorwaarden</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/herroeping">Herroeping</Link>
        </nav>
      </div>
    </footer>
  )
}
