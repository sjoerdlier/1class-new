import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { Check, Minus, Plus, Shield, Truck, Phone } from '../components/Icons.jsx'
import { useCart } from '../cart.jsx'
import { productBySlug, products, mainCat, catById, eur, hasRange, CONTACT, FREE_SHIPPING } from '../lib.js'

export default function Product() {
  const { slug } = useParams()
  const p = productBySlug(slug)
  const { add } = useCart()
  const [vi, setVi] = useState(0)
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => { setVi(0); setImg(0); setQty(1); document.title = p ? `${p.title} — 1ClassAdditions` : '1ClassAdditions' }, [slug, p])
  if (!p) return <div className="wrap section"><h1>Product niet gevonden</h1><Link to="/c">Bekijk alle producten</Link></div>

  const v = p.variants[vi]
  const price = v?.price ?? p.price
  const cat = mainCat(p)
  const parent = cat?.parent ? catById(cat.parent) : null
  const related = products.filter((x) => x.id !== p.id && x.cats.some((c) => p.cats.includes(c))).slice(0, 4)
  const ok = v ? v.available : p.available

  const onAdd = () => {
    add(p, v, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="wrap section">
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
          {p.brand && <span className="eyebrow">{p.brand}</span>}
          <h1>{p.title}</h1>
          {p.short && <p className="lead">{p.short}</p>}

          <div className="pdp-price">
            {p.variants.length > 1 && hasRange(p) && <small>{v ? '' : 'vanaf '}</small>}
            <b>{eur(price)}</b>
            {v?.old && <s>{eur(v.old)}</s>}
            <span className="vat">incl. btw</span>
          </div>

          {p.variants.length > 1 && (
            <fieldset className="variants">
              <legend>Kies uitvoering</legend>
              <div>
                {p.variants.map((x, i) => (
                  <button key={x.id} className={i === vi ? 'on' : ''} onClick={() => setVi(i)} disabled={!x.available}>
                    <span>{x.title}</span><small>{eur(x.price)}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="buy-row">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Minder"><Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Meer"><Plus size={16} /></button>
            </div>
            <button className="btn lg grow" onClick={onAdd} disabled={!ok}>
              {added ? <><Check size={18} /> Toegevoegd</> : ok ? `In winkelwagen · ${eur(price * qty)}` : 'Tijdelijk niet leverbaar'}
            </button>
          </div>

          <ul className="assure">
            <li><Truck size={18} /><span>{p.delivery ? `Levertijd ${p.delivery}` : 'Snel geleverd'} · gratis verzending vanaf {eur(FREE_SHIPPING)}</span></li>
            <li><Shield size={18} /><span>14 dagen bedenktijd en wettelijke garantie</span></li>
            <li><Phone size={18} /><span>Twijfel je over de juiste maat? Bel <a href={CONTACT.phoneHref}>{CONTACT.phone}</a></span></li>
          </ul>
        </div>
      </div>

      {p.content && (
        <section className="desc">
          <h2>Productinformatie</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.content }} />
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <header className="sec-head"><h2>Hier passen ze goed bij</h2></header>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}

      <div className="sticky-buy" aria-hidden={false}>
        <div><b>{p.title}</b><span>{eur(price)}</span></div>
        <button className="btn" onClick={onAdd} disabled={!ok}>{added ? 'Toegevoegd' : 'In winkelwagen'}</button>
      </div>
    </div>
  )
}
