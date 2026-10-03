import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles.css' // eerst: basisstijlen; shop.css en img.css (via de componenten) komen erna en mogen die aanvullen
import App from './App.jsx'
import { CartProvider } from './cart.jsx'
import { initAnnouncer } from './announce.js'

initAnnouncer() // live-regio's voor schermlezers staan er vóór de eerste melding
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
)
