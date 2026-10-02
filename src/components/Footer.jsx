import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTACT } from '../lib.js'

export default function Footer() {
  const [done, setDone] = useState(false)
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <img className="foot-logo" src="/logo-1class.png" alt="1ClassAdditions" />
          <p>Al ruim 25 jaar dé specialist in hoezen, stalling en onderhoud voor klassieke en moderne auto’s.</p>
          <p className="muted">Onderdeel van <a href="https://www.imparts.nl" target="_blank" rel="noreferrer">Imparts B.V.</a> — the British car parts specialist.</p>
        </div>
        <div>
          <h4>Winkel</h4>
          <Link to="/c/autohoezen">Autohoezen</Link>
          <Link to="/c/stalling">Stalling</Link>
          <Link to="/c/onderhoud">Onderhoud</Link>
          <Link to="/c/accessoires">Accessoires</Link>
        </div>
        <div>
          <h4>Service</h4>
          <Link to="/klantenservice">Klantenservice</Link>
          <Link to="/verzenden">Verzenden &amp; retourneren</Link>
          <Link to="/dealers">Dealers</Link>
          <Link to="/kennis">Fabels &amp; Feiten</Link>
          <Link to="/over-ons">Over ons</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <p>{CONTACT.address}</p>
          <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <p className="muted">ma t/m vr 09:00 – 17:30</p>
        </div>
        <form className="news" onSubmit={(e) => { e.preventDefault(); setDone(true) }}>
          <h4>Nieuwsbrief</h4>
          {done ? <p>Bedankt! Je staat op de lijst.</p> : (
            <>
              <p>Tips voor de klassieker en actuele aanbiedingen.</p>
              <div><input type="email" required placeholder="E-mailadres" aria-label="E-mailadres" /><button className="btn">Aanmelden</button></div>
            </>
          )}
        </form>
      </div>
      <div className="wrap legal">
        <span>© {new Date().getFullYear()} 1ClassAdditions · Imparts B.V.</span>
        <span>iDEAL · Creditcard · PayPal · Rembours</span>
      </div>
    </footer>
  )
}
