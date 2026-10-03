import { useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Home from './pages/Home.jsx'
import Collection from './pages/Collection.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import { About, Shipping, Knowledge, Dealers, Service } from './pages/Info.jsx'
import { Privacy, Voorwaarden, Herroeping } from './pages/Legal.jsx'
import { focusHeading } from './a11y/focus.js'

// Bij een routewissel: naar boven scrollen en focus op de hoofdkop (of <main>), zodat toetsenbord- en
// schermlezergebruikers weten dat de pagina is veranderd. De eerste pagina krijgt geen geforceerde focus.
// De documenttitel wordt per pagina gezet door de pagina zelf (useSeo).
function RouteEffects() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    window.scrollTo(0, 0)
    if (first.current) { first.current = false; return undefined }
    const id = requestAnimationFrame(focusHeading)
    return () => cancelAnimationFrame(id)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div className="wrap section narrow notfound">
      <span className="eyebrow red">404</span>
      <h1>Deze pagina bestaat niet (meer)</h1>
      <p className="lead">Misschien is de link verouderd of is het adres verkeerd getypt. Ga terug naar de homepage of bekijk onze producten.</p>
      <div className="btn-row">
        <Link className="btn" to="/">Terug naar de homepage</Link>
        <Link className="btn-ghost" to="/c">Bekijk alle producten</Link>
      </div>
    </div>
  )
}

export default function App() {
  const skip = (e) => {
    const main = document.getElementById('main')
    if (!main) return
    e.preventDefault()
    main.focus()
    main.scrollIntoView()
  }
  return (
    <>
      <a className="skip" href="#main" onClick={skip}>Ga naar de inhoud</a>
      <RouteEffects />
      <Header />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/c/*" element={<Collection />} />
          <Route path="/p/:slug" element={<Product />} />
          <Route path="/bestellen" element={<Checkout />} />
          <Route path="/over-ons" element={<About />} />
          <Route path="/verzenden" element={<Shipping />} />
          <Route path="/kennis" element={<Knowledge />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/klantenservice" element={<Service />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/voorwaarden" element={<Voorwaarden />} />
          <Route path="/herroeping" element={<Herroeping />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
