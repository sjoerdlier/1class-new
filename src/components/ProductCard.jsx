import { Link } from 'react-router-dom'
import { eur, hasRange, mainCat } from '../lib.js'
import { useCart } from '../cart.jsx'
import { Plus } from './Icons.jsx'
import Img from './Img.jsx'

const CARD_SIZES = '(max-width: 760px) 50vw, (max-width: 1060px) 33vw, 290px'

export default function ProductCard({ p, priority = false }) {
  const { add } = useCart()
  const single = p.variants.length <= 1
  const cat = mainCat(p)
  return (
    <article className="card">
      <Link to={`/p/${p.slug}`} className="card-img" aria-hidden="true" tabIndex={-1}>
        <Img src={p.images[0]} alt="" sizes={CARD_SIZES} priority={priority} />
        {p.old && <span className="badge sale">Actie</span>}
      </Link>
      <div className="card-body">
        <span className="eyebrow">{cat?.title || p.brand}</span>
        <h3><Link to={`/p/${p.slug}`}>{p.title}</Link></h3>
        <div className="card-foot">
          <div className="price">
            {hasRange(p) && <small>vanaf </small>}
            {eur(p.priceFrom)}
            {p.old && <s>{eur(p.old)}</s>}
          </div>
          {single ? (
            <button className="btn-icon" onClick={() => add(p, p.variants[0])} aria-label={`${p.title} in winkelwagen`} title="In winkelwagen"><Plus size={18} /></button>
          ) : (
            <Link className="btn-ghost sm" to={`/p/${p.slug}`}>Kies uitvoering</Link>
          )}
        </div>
      </div>
    </article>
  )
}
