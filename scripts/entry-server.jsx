// Server-entry voor de prerender (alleen gebruikt door scripts/prerender.mjs; wordt niet in de client-bundel opgenomen).
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from '../src/App.jsx'
import { CartProvider } from '../src/cart.jsx'

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <CartProvider>
        <App />
      </CartProvider>
    </StaticRouter>
  )
}
