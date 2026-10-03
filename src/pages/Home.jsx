import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { Arrow, Award, Check, Clock, Copy, Shield, Truck } from '../components/Icons.jsx'
import { catBySlug, featured, products, PROMO, FREE_SHIPPING, eur, CONTACT } from '../lib.js'
import { PROMO_TEXT } from '../pricing.js'
import '../shop.css'

const USPS = [
  [Award, 'Specialist in klassiekers', 'Uit Ede, onderdeel van Imparts B.V.'],
  [Truck, `Gratis verzending vanaf ${eur(FREE_SHIPPING)}`, 'Daaronder berekenen wij de verzendkosten'],
  [Clock, 'Snel verzonden', 'Voor 15:00 besteld, volgende werkdag verzonden (op voorraad)'],
  [Shield, 'Persoonlijk advies', 'Bel of mail ons, wij helpen u graag'],
]

const FINDER = [
  { q: 'Mijn auto staat in de garage', slug: 'autohoezen/supertex-binnenhoezen', why: 'Zacht, ademend en krasvrij. Beschermt tegen stof en schaafplekken.' },
  { q: 'Mijn auto staat buiten', slug: 'autohoezen/moltex-buitenhoezen', why: 'Waterafstotend en UV-bestendig, met ademende binnenzijde.' },
  { q: 'Ik heb een cabrio en wil de kap beschermen', slug: 'autohoezen/topcovers', why: 'Licht, waterdicht en snel op te zetten. Tegen boomsap, UV en vuil.' },
  { q: 'Ik wil een hoes met perfecte pasvorm', slug: 'autohoezen/maathoezen', why: 'Op maat gemaakt voor uw model, zonder compromissen.' },
  { q: 'Mijn auto staat maanden stil', slug: 'stalling', why: 'Een geventileerde cabine tegen condens en roest, of stalling bij ons in Ede.' },
]

const BRANDS = ['Autoglym', 'CTEK', 'Penrite', 'Millers Oils', 'Supertex', 'Moltex']

function Finder() {
  const [i, setI] = useState(0)
  const pick = FINDER[i]
  const cat = catBySlug(pick.slug)
  return (
    <section className="finder wrap">
      <div className="finder-intro">
        <span className="eyebrow red">Hulp bij kiezen</span>
        <h2>Welke bescherming past bij uw auto?</h2>
        <p>Beantwoord één vraag en wij wijzen u de goede kant op.</p>
      </div>
      <div className="finder-box">
        <div className="finder-q" role="radiogroup" aria-label="Situatie">
          {FINDER.map((f, k) => (
            <button key={f.slug} role="radio" aria-checked={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{f.q}</button>
          ))}
        </div>
        <div className="finder-a">
          {cat?.imageUrl && <img src={cat.imageUrl} alt="" />}
          <div>
            <h3>{cat?.title}</h3>
            <p>{pick.why}</p>
            <Link className="btn" to={`/c/${pick.slug}`}>Bekijk {cat?.title.toLowerCase()} <Arrow size={18} /></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Promo() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMO.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* geen toegang tot klembord: de code staat zichtbaar op de knop */ }
  }
  return (
    <section className="promo">
      <div className="wrap promo-in">
        <div>
          <span className="eyebrow light">Actie</span>
          <h2>{PROMO_TEXT}</h2>
          <p>Vul de code in bij de bestelaanvraag. De korting wordt berekend over het bedrag van de producten (incl. btw); verzendkosten vallen erbuiten.</p>
        </div>
        <button className="code" onClick={copy} aria-label={`Kopieer code ${PROMO.code}`}>
          <span>{PROMO.code}</span>
          {copied ? <><Check size={16} /> Gekopieerd</> : <><Copy size={16} /> Kopieer</>}
        </button>
      </div>
    </section>
  )
}

export default function Home() {
  const tiles = ['autohoezen', 'stalling', 'onderhoud', 'accessoires'].map(catBySlug).filter(Boolean)
  const hero = catBySlug('autohoezen')
  const nCovers = products.filter((p) => p.cats.includes(hero?.id)).length

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="eyebrow red">Ede · Onderdeel van Imparts B.V.</span>
            <h1>Bescherm wat u <em>koestert.</em></h1>
            <p className="lead">Hoezen, stalling en onderhoud voor klassieke en moderne auto’s. Uitgezocht door liefhebbers, met persoonlijk advies als u er niet uitkomt.</p>
            <div className="cta-row">
              <Link className="btn lg" to="/c/autohoezen">Bekijk autohoezen <Arrow size={18} /></Link>
              <a className="btn-ghost lg" href={CONTACT.phoneHref}>Advies? Bel {CONTACT.phone}</a>
            </div>
            <ul className="ticks">
              <li><Check size={16} /> Gratis verzending vanaf {eur(FREE_SHIPPING)}</li>
              <li><Check size={16} /> Voor 15:00 besteld, volgende werkdag verzonden (op voorraad)</li>
              <li><Check size={16} /> {PROMO.pct}% korting bij bestellingen vanaf {eur(PROMO.min).replace(',00', '')}</li>
            </ul>
          </div>
          <Link to="/c/autohoezen" className="hero-img" aria-label="Autohoezen">
            {hero?.imageUrl && <img src={hero.imageUrl} alt="Autohoes over een klassieke auto" />}
            <span className="hero-tag"><b>{nCovers}</b> hoezen, van binnen tot buiten</span>
          </Link>
        </div>
      </section>

      <section className="usps"><div className="wrap usp-grid">
        {USPS.map(([Icon, t, s]) => (
          <div key={t}><Icon size={26} /><div><b>{t}</b><span>{s}</span></div></div>
        ))}
      </div></section>

      <section className="wrap section">
        <header className="sec-head"><h2>Waar bent u naar op zoek?</h2></header>
        <div className="tiles">
          {tiles.map((c) => (
            <Link key={c.id} to={`/c/${c.slug}`} className="tile">
              {c.imageUrl && <img src={c.imageUrl} alt="" loading="lazy" />}
              <div><h3>{c.title}</h3><span>{products.filter((p) => p.cats.includes(c.id)).length} producten <Arrow size={16} /></span></div>
            </Link>
          ))}
        </div>
      </section>

      <Finder />

      <section className="wrap section">
        <header className="sec-head">
          <h2>Uitgelicht</h2>
          <Link to="/c" className="more">Alle producten <Arrow size={16} /></Link>
        </header>
        <div className="grid">{featured().map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      <Promo />

      <section className="wrap section knowledge">
        <div>
          <span className="eyebrow red">Fabels &amp; Feiten</span>
          <h2>“Met een hoes heb ik geen last meer van condens.”</h2>
          <p className="lead">Fabel. Condens ontstaat door het klimaat, niet door het ontbreken van een hoes. Wij vertellen eerlijk wat een hoes wél doet, en wanneer u beter voor een geventileerd stallingssysteem kiest.</p>
          <Link className="btn-ghost" to="/kennis">Lees de feiten <Arrow size={16} /></Link>
        </div>
        <div className="brands">
          <span className="eyebrow">Merken die we voeren</span>
          <ul>{BRANDS.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      </section>

      <section className="imparts">
        <div className="wrap imparts-in">
          <div>
            <span className="eyebrow light">Onderdeel van Imparts B.V.</span>
            <h2>Een echt bedrijf, met echte mensen.</h2>
            <p>Achter 1ClassAdditions zit Imparts uit Ede, specialist in Britse auto-onderdelen. Twijfelt u? Bel of mail ons. U krijgt antwoord van iemand die verstand heeft van klassiekers.</p>
          </div>
          <div className="imparts-cta">
            <a className="btn light" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            <a className="btn-ghost on-dark" href="https://shop.imparts.nl" target="_blank" rel="noreferrer">Naar de Imparts-shop</a>
            <small>ma t/m vr 09:00 – 17:30</small>
          </div>
        </div>
      </section>
    </>
  )
}
