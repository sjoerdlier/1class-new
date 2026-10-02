import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { topCategories, childrenOf, search, eur, CONTACT, FREE_SHIPPING } from '../lib.js'
import { Bag, Search, Menu, Close, Phone, Chevron } from './Icons.jsx'

const order = ['autohoezen', 'stalling', 'onderhoud', 'accessoires']
const cats = order.map((s) => topCategories.find((c) => c.slug === s)).filter(Boolean)

function SearchBox({ onDone }) {
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const nav = useNavigate()
  const hits = q.length > 1 ? search(q).slice(0, 5) : []
  const go = (e) => {
    e.preventDefault()
    if (q.trim()) { nav(`/c?q=${encodeURIComponent(q.trim())}`); setFocus(false); onDone?.() }
  }
  return (
    <form className="search" onSubmit={go} role="search">
      <Search size={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder="Zoek hoes, acculader, olie…" aria-label="Zoeken" />
      {focus && hits.length > 0 && (
        <ul className="suggest">
          {hits.map((p) => (
            <li key={p.id}><Link to={`/p/${p.slug}`} onClick={() => { setQ(''); onDone?.() }}><img src={p.images[0]} alt="" /><span>{p.title}</span><b>{eur(p.priceFrom)}</b></Link></li>
          ))}
          <li className="all"><button type="submit">Alle resultaten voor “{q}”</button></li>
        </ul>
      )}
    </form>
  )
}

export default function Header() {
  const { count, setOpen } = useCart()
  const [mobile, setMobile] = useState(false)
  const [sticky, setSticky] = useState(false)
  const loc = useLocation()
  useEffect(() => { setMobile(false) }, [loc.pathname])
  useEffect(() => {
    const f = () => setSticky(window.scrollY > 80)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <span>Gratis verzending vanaf {eur(FREE_SHIPPING)} · Voor 15:00 besteld, volgende werkdag in huis</span>
          <a href={CONTACT.phoneHref}><Phone size={14} /> {CONTACT.phone}</a>
        </div>
      </div>
      <header className={`header ${sticky ? 'stuck' : ''}`}>
        <div className="wrap head-row">
          <button className="btn-icon plain only-mobile" onClick={() => setMobile(true)} aria-label="Menu"><Menu /></button>
          <Link to="/" className="logo" aria-label="1ClassAdditions, onderdeel van Imparts">
            <img src="/logo-1class.png" alt="1ClassAdditions" />
            <span className="part-of">onderdeel van <b>Im<i>Parts</i></b></span>
          </Link>
          <SearchBox />
          <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Winkelwagen, ${count} artikelen`}>
            <Bag /><span>Winkelwagen</span>{count > 0 && <em>{count}</em>}
          </button>
        </div>
        <nav className="nav wrap" aria-label="Hoofdmenu">
          {cats.map((c) => {
            const kids = childrenOf(c.id)
            return (
              <div className="nav-item" key={c.id}>
                <NavLink to={`/c/${c.slug}`}>{c.title}{kids.length > 0 && <Chevron size={14} />}</NavLink>
                {kids.length > 0 && (
                  <div className="mega">
                    {kids.map((k) => <Link key={k.id} to={`/c/${k.slug}`}>{k.title}</Link>)}
                    <Link to={`/c/${c.slug}`} className="all">Alles in {c.title} →</Link>
                  </div>
                )}
              </div>
            )
          })}
          <NavLink to="/kennis">Fabels &amp; Feiten</NavLink>
          <NavLink to="/dealers">Dealers</NavLink>
          <NavLink to="/over-ons">Over ons</NavLink>
        </nav>
      </header>

      {mobile && (
        <div className="drawer-wrap left">
          <div className="scrim" onClick={() => setMobile(false)} />
          <aside className="drawer menu">
            <header><img src="/logo-1class.png" alt="1ClassAdditions" height="34" /><button className="btn-icon plain" onClick={() => setMobile(false)} aria-label="Sluiten"><Close /></button></header>
            <SearchBox onDone={() => setMobile(false)} />
            <ul>
              {cats.map((c) => (
                <li key={c.id}>
                  <Link to={`/c/${c.slug}`}>{c.title}</Link>
                  {childrenOf(c.id).map((k) => <Link key={k.id} className="sub" to={`/c/${k.slug}`}>{k.title}</Link>)}
                </li>
              ))}
              <li><Link to="/kennis">Fabels &amp; Feiten</Link></li>
              <li><Link to="/dealers">Dealers</Link></li>
              <li><Link to="/over-ons">Over ons</Link></li>
              <li><Link to="/klantenservice">Klantenservice</Link></li>
            </ul>
          </aside>
        </div>
      )}
    </>
  )
}
