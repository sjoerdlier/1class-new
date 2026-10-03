import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { products, catBySlug, childrenOf, catById, search, topCategories } from '../lib.js'
import '../shop.css'

const SORTS = {
  pop: ['Aanbevolen', null],
  low: ['Prijs laag-hoog', (a, b) => a.priceFrom - b.priceFrom],
  high: ['Prijs hoog-laag', (a, b) => b.priceFrom - a.priceFrom],
  az: ['Naam A-Z', (a, b) => a.title.localeCompare(b.title, 'nl')],
}

export default function Collection() {
  const slug = useParams()['*'].replace(/\/$/, '')
  const [sp] = useSearchParams()
  const q = sp.get('q') || ''
  const cat = slug ? catBySlug(slug) : null
  const [sort, setSort] = useState('pop')
  // Het merkfilter hoort bij de huidige categorie/zoekopdracht en vervalt vanzelf bij wisselen.
  const scope = `${slug}|${q}`
  const [brandSel, setBrandSel] = useState({ scope: '', brand: '' })
  const [open, setOpen] = useState(false)

  const base = useMemo(() => (q ? search(q) : cat ? products.filter((p) => p.cats.includes(cat.id)) : products), [q, cat])
  const brands = useMemo(() => [...new Set(base.map((p) => p.brand).filter(Boolean))].sort(), [base])
  const brand = brandSel.scope === scope && brands.includes(brandSel.brand) ? brandSel.brand : ''
  const setBrand = (b) => setBrandSel({ scope, brand: b })
  const list = useMemo(() => {
    let l = brand ? base.filter((p) => p.brand === brand) : base
    const fn = SORTS[sort][1]
    return fn ? [...l].sort(fn) : l
  }, [base, brand, sort])

  if (slug && !cat) return <div className="wrap section"><h1>Categorie niet gevonden</h1><Link to="/c">Bekijk alle producten</Link></div>

  const kids = cat ? childrenOf(cat.id) : []
  const parent = cat?.parent ? catById(cat.parent) : null
  const title = q ? `Zoekresultaten voor “${q}”` : cat ? cat.title : 'Alle producten'
  const sibs = parent ? childrenOf(parent.id) : kids

  return (
    <div className="wrap section">
      <nav className="crumbs" aria-label="Kruimelpad">
        <Link to="/">Home</Link> / {parent && <><Link to={`/c/${parent.slug}`}>{parent.title}</Link> / </>}<span>{title}</span>
      </nav>
      <header className="coll-head">
        <h1>{title}</h1>
        {cat?.description && <p className="lead">{cat.description}</p>}
      </header>

      {(sibs.length > 0) && (
        <div className="chips">
          {parent && <Link to={`/c/${parent.slug}`}>Alles</Link>}
          {sibs.map((k) => <Link key={k.id} className={cat?.id === k.id ? 'on' : ''} to={`/c/${k.slug}`}>{k.title}</Link>)}
        </div>
      )}

      <div className="toolbar">
        <span>{list.length} {list.length === 1 ? 'product' : 'producten'}</span>
        <div>
          {(brands.length > 1 || brand) && (
            <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Merk">
              <option value="">Alle merken</option>
              {brands.map((b) => <option key={b}>{b}</option>)}
            </select>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sorteren">
            {Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          {q ? <h2>Geen resultaten voor “{q}”</h2> : <h2>Geen producten gevonden</h2>}
          {q && <ul><li>Controleer de spelling of probeer een korter zoekwoord.</li><li>Zoek bijvoorbeeld op een merk of categorie, zoals Autoglym, CTEK of autohoes.</li></ul>}
          <div className="btn-row">
            {brand && <button className="btn" onClick={() => setBrand('')}>Filter wissen</button>}
            <Link className="btn-ghost" to="/c">Alle producten bekijken</Link>
            <Link className="btn-ghost" to="/klantenservice">Neem contact op</Link>
          </div>
          {q && <div className="chips">{topCategories.map((k) => <Link key={k.id} to={`/c/${k.slug}`}>{k.title}</Link>)}</div>}
        </div>
      ) : (
        <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  )
}
