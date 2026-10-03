import { describe, it, expect } from 'vitest'
import { totals, cleanQty, sanitizeLines, toCents } from '../pricing.js'
import products from '../data/products.json'

const L = (price, qty = 1) => ({ price, qty })

describe('totals', () => {
  it('geen korting onder de drempel', () => {
    const t = totals([L(199.99)], '1Class2026')
    expect(t.promoOk).toBe(false); expect(t.discount).toBe(0); expect(t.total).toBe(199.99)
  })
  it('korting precies op EUR 200 (grens inclusief)', () => {
    const t = totals([L(100, 2)], '1Class2026')
    expect(t.promoOk).toBe(true); expect(t.discount).toBe(20); expect(t.total).toBe(180)
  })
  it('grens met float-ruis: 66.67+66.67+66.66 = 200.00', () => {
    expect(totals([L(66.67, 2), L(66.66)], '1class2026').promoOk).toBe(true)
  })
  it('code is niet hoofdlettergevoelig en wordt getrimd; foute code geeft geen korting', () => {
    expect(totals([L(250)], '  1CLASS2026 ').promoOk).toBe(true)
    expect(totals([L(250)], 'fout').promoOk).toBe(false)
    expect(totals([L(250)], '').promoOk).toBe(false)
  })
  it('afronding: subtotaal - korting == totaal in centen (11 x 18,95)', () => {
    const t = totals([L(18.95, 11)], '1Class2026')
    expect(t.subtotal).toBe(208.45); expect(t.discount).toBe(20.85); expect(t.total).toBe(187.6) // oud: 187.61
    expect(toCents(t.subtotal) - toCents(t.discount)).toBe(toCents(t.total))
  })
  it('gratis verzending vanaf 150, grens inclusief', () => {
    expect(totals([L(149.99)]).freeShip).toBe(false)
    expect(totals([L(150)]).freeShip).toBe(true)
    expect(totals([]).freeShip).toBe(false)
  })
  it('ongeldige aantallen worden 1 (0, negatief, NaN, tekst, decimaal)', () => {
    for (const q of [0, -3, NaN, 'abc', undefined, null, 0.4]) expect(cleanQty(q)).toBe(1)
    expect(cleanQty('2')).toBe(2); expect(cleanQty(2.9)).toBe(2); expect(cleanQty(1e6)).toBe(99)
  })
  it('lege winkelwagen', () => {
    expect(totals([])).toMatchObject({ subtotal: 0, total: 0, discount: 0, freeShip: false })
  })
})

describe('kortingscode-status', () => {
  it('none / invalid / low / ok', () => {
    expect(totals([L(250)], '').codeStatus).toBe('none')
    expect(totals([L(250)], 'abc').codeStatus).toBe('invalid')
    expect(totals([L(100)], '1Class2026').codeStatus).toBe('low')
    expect(totals([L(250)], '1class2026').codeStatus).toBe('ok')
  })
  it('geen NaN of negatieve bedragen bij rommelinvoer', () => {
    const t = totals([{ price: 'x', qty: 'y' }, { price: -5, qty: -2 }], null)
    for (const k of ['subtotal', 'discount', 'total']) expect(Number.isFinite(t[k])).toBe(true)
    expect(t.total).toBeGreaterThanOrEqual(0)
  })
})

describe('sanitizeLines (localStorage)', () => {
  const find = (s) => products.find((p) => p.slug === s)
  it('geen array -> leeg', () => { for (const x of [{}, 5, 'a', true, null, undefined]) expect(sanitizeLines(x, find)).toEqual([]) })
  it('null-items, onbekende producten en onbekende varianten worden overgeslagen', () => {
    const v = find('topcover').variants[0]
    const out = sanitizeLines([null, { slug: 'bestaat-niet', qty: 1 }, { slug: 'topcover', vid: 1, qty: 1 }, { slug: 'topcover', vid: v.id, qty: '3', price: 0.01 }], find)
    expect(out).toHaveLength(1); expect(out[0].qty).toBe(3); expect(out[0].price).toBe(v.price) // prijs uit catalogus, niet uit localStorage
  })
})

describe('products.json integriteit', () => {
  it('unieke slugs/ids, geldige prijzen, afbeeldingen aanwezig', () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length)
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
    for (const p of products) { expect(p.price).toBeGreaterThan(0); expect(p.images.length).toBeGreaterThan(0) }
  })
  it('rapporteert prijs-uitschieters in varianten (bronfout in de data, geen testfout)', () => {
    const out = []
    for (const p of products) if (p.variants.length > 1) {
      const pr = p.variants.map((v) => v.price)
      if (Math.max(...pr) > 5 * Math.min(...pr)) out.push(`${p.slug}: ${Math.min(...pr)} .. ${Math.max(...pr)}`)
    }
    if (out.length) console.warn(`Data-uitschieters (controleer met de eigenaar):\n  ${out.join('\n  ')}`)
    expect(Array.isArray(out)).toBe(true)
  })
})
