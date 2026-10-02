import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Home from './pages/Home.jsx'
import Collection from './pages/Collection.jsx'
import Product from './pages/Product.jsx'
import Checkout from './pages/Checkout.jsx'
import { About, Shipping, Knowledge, Dealers, Service } from './pages/Info.jsx'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Header />
      <main>
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
          <Route path="*" element={<div className="wrap section"><h1>Pagina niet gevonden</h1></div>} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
