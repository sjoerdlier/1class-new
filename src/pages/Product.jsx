import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { Check, Minus, Plus, Shield, Truck, Phone } from '../components/Icons.jsx'
import { useCart } from '../cart.jsx'
import { productBySlug, resolveSlug, mainCat, catById, eur, hasRange, CONTACT, FREE_SHIPPING, sanitizeHtml, leadText, cheapestIndex, relatedProducts } from '../lib.js'
import { MAX_QTY } from '../pricing.js'
import '../shop.css'

// Specificaties alleen tonen als de data ze heeft: [{label, value}], [[label, value]] of {label: value}.
function specRows(p) {
  const s = p.specs
  if (Array.isArray(s)) return s.map((r) => (Array.isArray(r) ? r : [r?.label, r?.value])).filter(([k, v]) => k && v)
  if (s && typeof s === 'object') return Object.entries(s).filter(([k, v]) => k && v)
  return []
}

function NotFound() {
  useEffect(() => { document.title = 'Product niet gevonden — 1ClassAdditions' }, [])
  return (
    <div className="wrap section narrow">
      <h1>Product niet gevonden</h1>
      <p className="lead">Dit product bestaat niet (meer) of het adres is niet juist. U vindt ons assortiment hieronder, of neem contact met ons op.</p>
      <div className="btn-row">
        <Link className="btn" to="/c">Bekijk alle producten</Link>
        <Link className="btn-ghost" to="/klantenservice">Neem contact op</Link>
      </div>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const target = resolveSlug(slug)
  const p = productBySlug(target)
  if (target !== slug && p) return <Navigate to={`/p/${target}`} replace />
  if (!p) return <NotFound />
  return <ProductPage key={p.slug} p={p} />
}

function ProductPage({ p }) {
  const { add } = useCart()
  const cheapest = cheapestIndex(p)
  const [pick, setPick] = useState(null) // null: standaard de goedkoopste uitvoering (komt overeen met 'vanaf' op de kaart)
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [showBar, setShowBar] = useState(false)
  const buyRef = useRef(null)
  const vi = pick ?? cheapest
  const multi = p.variants.length > 1

  useEffect(() => { document.title = `${p.title} — 1ClassAdditions` }, [p])

  // Mobiele koopbalk: alleen zichtbaar als de eigen koopknop en de footer uit beeld zijn.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const state = { buy: true, foot: false }
    const update = () => setShowBar(!state.buy && !state.foot)
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) state[e.target === buyRef.current ? 'buy' : 'foot'] = e.isIntersecting
      update()
    })
    if (buyRef.current) io.observe(buyRef.current)
    const foot = document.querySelector('footer')
    if (foot) io.observe(foot)
    return () => io.disconnect()
  }, [p])

  const v = p.variants[vi]
  const price = v?.price ?? p.price
  const cat = mainCat(p)
  const parent = cat?.parent ? catById(cat.parent) : null
  const related = relatedProducts(p, 4)
  const ok = v ? v.available !== false : p.available !== false
  const specs = specRows(p)
  const inStock = p.stock === 'in_stock' || p.inStock === true // alleen als de data het expliciet zegt
  const lead = leadText(p.short)

  const onAdd = () => {
    add(p, v, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="wrap section pdp-page">
      <nav className="crumbs" aria-label="Kruimelpad">
        <Link to="/">Home</Link> / {parent && <><Link to={`/c/${parent.slug}`}>{parent.title}</Link> / </>}
        {cat && <><Link to={`/c/${cat.slug}`}>{cat.title}</Link> / </>}<span>{p.title}</span>
      </nav>

      <div className="pdp">
        <div className="gallery">
          <div className="main-img"><img src={p.images[img]} alt={p.title} /></div>
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((s, i) => <button key={s} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Foto ${i + 1}`}><img src={s} alt="" /></button>)}
            </div>
          )}
        </div>

        <div className="buy">
          {p.brand && p.brand !== '1ClassAdditions' && <span className="eyebrow">{p.brand}</span>}
          <h1>{p.title}</h1>
          {lead && <p className="lead">{lead}</p>}

          <div className="pdp-price">
            <b>{eur(price)}</b>
            {v?.old && <s>{eur(v.old)}</s>}
            <span className="vat">incl. btw</span>
          </div>

          {multi && (
            <fieldset className="variants">
              <legend>Kies uitvoering</legend>
              <div>
                {p.variants.map((x, i) => (
                  <button type="button" key={x.id} className={i === vi ? 'on' : ''} aria-pressed={i === vi} onClick={() => setPick(i)} disabled={x.available === false}>
                    <span>{x.title}</span><small>{eur(x.price)}</small>
                  </button>
                ))}
              </div>
              <span className="picked">Gekozen: <b>{v?.title}</b>{hasRange(p) ? ' (goedkoopste uitvoering is voorgeselecteerd)' : ''}</span>
            </fieldset>
          )}

          <p className="stockline">
            <Truck size={18} />
            {inStock
              ? <span>Op voorraad: voor 15:00 besteld, volgende werkdag verzonden</span>
              : <span>Levertijd: <Link to="/verzenden">zie verzendinformatie</Link></span>}
          </p>

          <div className="buy-row" ref={buyRef}>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Minder"><Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(MAX_QTY, qty + 1))} disabled={qty >= MAX_QTY} aria-label="Meer"><Plus size={16} /></button>
            </div>
            <button className="btn lg grow" onClick={onAdd} disabled={!ok}>
              {added ? <><Check size={18} /> Toegevoegd</> : ok ? `In winkelwagen · ${eur(price * qty)}` : 'Tijdelijk niet leverbaar'}
            </button>
          </div>

          <ul className="assure">
            <li><Truck size={18} /><span>Gratis verzending vanaf {eur(FREE_SHIPPING)}; daaronder berekenen wij de verzendkosten en bevestigen die in onze reactie.</span></li>
            <li><Shield size={18} /><span>14 dagen herroepingsrecht, behalve voor producten die op maat zijn gemaakt, en wettelijke garantie. <Link to="/herroeping">Lees meer</Link></span></li>
            <li><Phone size={18} /><span>Twijfelt u over de juiste maat? Bel <a href={CONTACT.phoneHref}>{CONTACT.phone}</a></span></li>
          </ul>
        </div>
      </div>

      <section className="desc">
        <h2>Productinformatie</h2>
        {p.content
          ? <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.content) }} />
          : <div className="prose"><p>{p.short || 'Voor dit product is nog geen uitgebreide beschrijving beschikbaar.'}</p><p>Vragen over dit product? Bel <a href={CONTACT.phoneHref}>{CONTACT.phone}</a> of mail <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.</p></div>}
      </section>

      {specs.length > 0 && (
        <section className="desc">
          <h2>Specificaties</h2>
          <dl className="specs">{specs.map(([k, val]) => <Fragment key={k}><dt>{k}</dt><dd>{String(val)}</dd></Fragment>)}</dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <header className="sec-head"><h2>Meer in deze categorie</h2></header>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}

      <div className={`sticky-buy sb2${showBar ? ' show' : ''}`}>
        <div><b>{p.title}</b><span>{multi && v ? `${v.title} · ` : ''}{eur(price)}</span></div>
        <button className="btn" onClick={onAdd} disabled={!ok}>{added ? 'Toegevoegd' : 'In winkelwagen'}</button>
      </div>
    </div>
  )
}
