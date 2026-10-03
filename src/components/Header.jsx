import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../cart.jsx'
import { topCategories, childrenOf, search, eur, CONTACT, FREE_SHIPPING } from '../lib.js'
import { Bag, Search, Menu, Close, Phone, Chevron } from './Icons.jsx'
import Portal from '../a11y/Portal.jsx'
import { useDialog } from '../a11y/useDialog.js'

const order = ['autohoezen', 'stalling', 'onderhoud', 'accessoires']
const cats = order.map((s) => topCategories.find((c) => c.slug === s)).filter(Boolean)

// Zoekveld met suggesties volgens het ARIA-combobox-patroon: pijltjestoetsen, Enter, Escape.
function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const nav = useNavigate()
  const id = useId()
  const listId = `${id}-lijst`
  const formRef = useRef(null)
  const hits = q.trim().length > 1 ? search(q).slice(0, 5) : []
  const shown = open && hits.length > 0
  const total = hits.length + 1 // laatste optie: alle resultaten

  useEffect(() => { setActive(-1) }, [q])

  const close = () => { setOpen(false); setActive(-1) }
  const goAll = () => {
    const t = q.trim()
    if (t) { nav(`/c?q=${encodeURIComponent(t)}`); close() }
  }
  const onSubmit = (e) => {
    e.preventDefault()
    if (shown && active >= 0 && active < hits.length) { nav(`/p/${hits[active].slug}`); setQ(''); close() } else goAll()
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!shown) { setOpen(true); return }
      setActive((a) => (a + 1) % total)
    } else if (e.key === 'ArrowUp') {
      if (!shown) return
      e.preventDefault()
      setActive((a) => (a <= 0 ? total - 1 : a - 1))
    } else if (e.key === 'Escape') {
      if (shown) { e.preventDefault(); close() } else if (q) { e.preventDefault(); setQ('') }
    } else if (e.key === 'Enter' && shown && active === hits.length) {
      e.preventDefault()
      goAll()
    }
  }
  const onBlur = (e) => { if (!formRef.current?.contains(e.relatedTarget)) close() }

  return (
    <form className="search" onSubmit={onSubmit} role="search" aria-label="Zoeken in de winkel" ref={formRef} onBlur={onBlur}>
      <Search size={18} />
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Zoek hoes, acculader, olie…"
        aria-label="Zoeken"
        autoComplete="off"
        enterKeyHint="search"
        role="combobox"
        aria-expanded={shown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-activedescendant={shown && active >= 0 ? `${id}-opt-${active}` : undefined}
      />
      <div className="sr-only" role="status" aria-live="polite">
        {shown ? `${hits.length} ${hits.length === 1 ? 'suggestie' : 'suggesties'}. Gebruik de pijltjestoetsen om te kiezen.` : ''}
      </div>
      {shown && (
        <ul className="suggest" id={listId} role="listbox" aria-label="Suggesties" onMouseDown={(e) => e.preventDefault()}>
          {hits.map((p, i) => (
            <li key={p.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''}>
              <Link to={`/p/${p.slug}`} tabIndex={-1} onClick={() => { setQ(''); close() }}><img src={p.images[0]} alt="" /><span>{p.title}</span><b>{eur(p.priceFrom)}</b></Link>
            </li>
          ))}
          <li id={`${id}-opt-${hits.length}`} role="option" aria-selected={active === hits.length} className={`all${active === hits.length ? ' is-active' : ''}`}>
            <Link to={`/c?q=${encodeURIComponent(q.trim())}`} tabIndex={-1} onClick={close}>Alle resultaten voor “{q.trim()}”</Link>
          </li>
        </ul>
      )}
    </form>
  )
}

// Hoofdmenu-item met uitklapmenu: link + aparte knop (disclosure). Werkt met muis (hover), toetsenbord en touch.
function NavItem({ cat, kids, openId, setOpenId }) {
  const isOpen = openId === cat.id
  const ref = useRef(null)
  const btn = useRef(null)
  const menuId = `mega-${cat.id}`
  return (
    <div
      className="nav-item"
      ref={ref}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpenId(cat.id) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpenId((o) => (o === cat.id ? null : o)) }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isOpen) {
          e.stopPropagation()
          setOpenId(null)
          if (ref.current?.contains(document.activeElement)) btn.current?.focus()
        }
      }}
      onBlur={(e) => { if (isOpen && !ref.current?.contains(e.relatedTarget)) setOpenId((o) => (o === cat.id ? null : o)) }}
    >
      <NavLink to={`/c/${cat.slug}`}>{cat.title}</NavLink>
      {kids.length > 0 && (
        <>
          <button type="button" ref={btn} className="nav-toggle" aria-expanded={isOpen} aria-controls={menuId} aria-label={`Submenu ${cat.title}`} onClick={() => setOpenId(isOpen ? null : cat.id)}>
            <Chevron size={14} />
          </button>
          <div className="mega" id={menuId} hidden={!isOpen}>
            {kids.map((k) => <Link key={k.id} to={`/c/${k.slug}`}>{k.title}</Link>)}
            <Link to={`/c/${cat.slug}`} className="all">Alles in {cat.title} →</Link>
          </div>
        </>
      )}
    </div>
  )
}

export default function Header() {
  const { count, setOpen } = useCart()
  const [mobile, setMobile] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [openId, setOpenId] = useState(null)
  const loc = useLocation()
  const closeMenu = () => setMobile(false)
  const menuRef = useDialog(mobile, closeMenu)

  useEffect(() => { setMobile(false); setOpenId(null) }, [loc.pathname])
  useEffect(() => {
    const f = () => setSticky(window.scrollY > 80)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  // Tikken of klikken buiten het uitklapmenu sluit het.
  useEffect(() => {
    if (openId == null) return undefined
    const away = (e) => { if (!e.target.closest?.('.nav-item')) setOpenId(null) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [openId])

  return (
    <>
      <div className="topbar" role="region" aria-label="Service-informatie">
        <div className="wrap">
          <span>Gratis verzending vanaf {eur(FREE_SHIPPING)}</span>
          <a href={CONTACT.phoneHref}><Phone size={14} /> {CONTACT.phone}</a>
        </div>
      </div>
      <header className={`header ${sticky ? 'stuck' : ''}`}>
        <div className="wrap head-row">
          <button type="button" className="btn-icon plain only-mobile" onClick={() => setMobile(true)} aria-label="Menu" aria-haspopup="dialog" aria-expanded={mobile}><Menu /></button>
          <Link to="/" className="logo" aria-label="1ClassAdditions, onderdeel van Imparts, naar de homepage">
            <img src="/logo-1class.png" alt="" width="172" height="40" />
            <span className="part-of" aria-hidden="true">Onderdeel van <b>Imparts</b></span>
          </Link>
          <SearchBox />
          <button type="button" className="cart-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Winkelwagen, ${count} ${count === 1 ? 'artikel' : 'artikelen'}`}>
            <Bag /><span>Winkelwagen</span>{count > 0 && <em aria-hidden="true">{count}</em>}
          </button>
        </div>
        <nav className="nav wrap" aria-label="Hoofdmenu">
          {cats.map((c) => <NavItem key={c.id} cat={c} kids={childrenOf(c.id)} openId={openId} setOpenId={setOpenId} />)}
          <NavLink to="/kennis">Fabels &amp; Feiten</NavLink>
          <NavLink to="/dealers">Dealers</NavLink>
          <NavLink to="/over-ons">Over ons</NavLink>
        </nav>
      </header>
      {mobile && (
        <Portal>
          <div className="drawer-wrap left" role="dialog" aria-modal="true" aria-label="Menu" ref={menuRef}>
            <div className="scrim" onClick={closeMenu} />
            <div className="drawer menu">
              <header>
                <img src="/logo-1class.png" alt="" height="34" />
                <button type="button" data-autofocus className="btn-icon plain" onClick={closeMenu} aria-label="Menu sluiten"><Close /></button>
              </header>
              <nav aria-label="Mobiel menu">
                <ul>
                  {cats.map((c) => (
                    <li key={c.id}>
                      <Link to={`/c/${c.slug}`} onClick={closeMenu}>{c.title}</Link>
                      {childrenOf(c.id).map((k) => <Link key={k.id} className="sub" to={`/c/${k.slug}`} onClick={closeMenu}>{k.title}</Link>)}
                    </li>
                  ))}
                  <li><Link to="/kennis" onClick={closeMenu}>Fabels &amp; Feiten</Link></li>
                  <li><Link to="/dealers" onClick={closeMenu}>Dealers</Link></li>
                  <li><Link to="/over-ons" onClick={closeMenu}>Over ons</Link></li>
                  <li><Link to="/klantenservice" onClick={closeMenu}>Klantenservice</Link></li>
                </ul>
              </nav>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
