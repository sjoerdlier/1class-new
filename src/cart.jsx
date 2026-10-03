import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { productBySlug } from './lib.js'
import { buildLine, cleanQty, lineKey, sanitizeLines, totals } from './pricing.js'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

// Opslag: alleen { slug, vid, qty } per regel, met versienummer. Prijzen komen altijd uit de catalogus.
const KEY = '1class-cart:v2'
const LEGACY_KEY = '1class-cart'
const VERSION = 2

const hasStorage = () => {
  try { return typeof window !== 'undefined' && !!window.localStorage } catch { return false }
}

function readLines() {
  if (!hasStorage()) return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw != null) {
      const data = JSON.parse(raw)
      if (data && data.v === VERSION) return sanitizeLines(data.lines, productBySlug)
      return []
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY) // oude, ongeversioneerde wagen
    return legacy ? sanitizeLines(JSON.parse(legacy), productBySlug) : []
  } catch {
    return []
  }
}

function writeLines(lines) {
  if (!hasStorage()) return
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ v: VERSION, lines: lines.map((l) => ({ slug: l.slug, vid: l.vid, qty: l.qty })) }))
    window.localStorage.removeItem(LEGACY_KEY)
  } catch { /* privemodus of vol: de wagen werkt dan alleen tijdens dit bezoek */ }
}

export function CartProvider({ children }) {
  // Begin altijd leeg (server en eerste client-render zijn gelijk); laden gebeurt pas in een effect.
  const [lines, setLines] = useState([])
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    setLines(readLines())
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) writeLines(lines) // pas na het laden, anders overschrijven we de opgeslagen wagen met een lege
  }, [lines, ready])

  // Andere tab wijzigt de wagen: overnemen.
  useEffect(() => {
    if (!hasStorage()) return undefined
    const onStorage = (e) => { if (e.key === KEY) setLines(readLines()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((product, variant, qty = 1) => {
    if (!product) return
    const key = lineKey(product, variant)
    setLines((ls) => {
      const hit = ls.find((l) => l.key === key)
      if (hit) return ls.map((l) => (l.key === key ? { ...l, qty: cleanQty(l.qty + cleanQty(qty)) } : l))
      return [...ls, buildLine(product, variant, qty)]
    })
    setOpen(true)
  }, [])
  const setQty = useCallback((key, qty) => setLines((ls) => (Number(qty) < 1 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty: cleanQty(qty) } : l)))), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const t = totals(lines, code)
    return { lines, count, ...t, code, setCode, add, setQty, clear, open, setOpen, ready }
  }, [lines, open, code, ready, add, setQty, clear])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
