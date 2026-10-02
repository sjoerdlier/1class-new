import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PROMO, FREE_SHIPPING } from './lib.js'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

function load() {
  try { return JSON.parse(localStorage.getItem('1class-cart')) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load)
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    try { localStorage.setItem('1class-cart', JSON.stringify(lines)) } catch { /* private mode */ }
  }, [lines])

  const add = (product, variant, qty = 1) => {
    const key = `${product.id}:${variant?.id ?? 0}`
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key)
      if (hit) return ls.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      return [...ls, {
        key, slug: product.slug, title: product.title, variant: variant?.title || '',
        vid: variant?.id ?? product.vid, price: variant?.price ?? product.price,
        image: product.images[0] || '', qty,
      }]
    })
    setOpen(true)
  }
  const setQty = (key, qty) => setLines((ls) => (qty < 1 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l))))
  const clear = () => setLines([])

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0)
    const promoOk = code.trim().toLowerCase() === PROMO.code.toLowerCase() && subtotal >= PROMO.min
    const discount = promoOk ? subtotal * (PROMO.pct / 100) : 0
    const total = subtotal - discount
    const freeShip = total >= FREE_SHIPPING
    return { lines, count, subtotal, discount, total, freeShip, promoOk, code, setCode, add, setQty, clear, open, setOpen }
  }, [lines, open, code])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
