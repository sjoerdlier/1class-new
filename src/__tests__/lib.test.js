import { describe, it, expect } from 'vitest'
import { search, sanitizeHtml, products } from '../lib.js'

describe('search', () => {
  it('lege zoekterm geeft niets', () => { expect(search('')).toEqual([]); expect(search('   ')).toEqual([]) })
  it('enkelvoud vindt meervoud: nummerplaat -> nummerplaten', () => {
    expect(search('nummerplaat').some((p) => /nummerplaten/i.test(p.title))).toBe(true)
  })
  it('alle woorden moeten voorkomen, volgorde maakt niet uit', () => {
    const a = search('autoglym shampoo'); const b = search('shampoo autoglym')
    expect(a.length).toBeGreaterThan(0)
    expect(a.map((p) => p.id).sort()).toEqual(b.map((p) => p.id).sort())
    expect(search('autoglym shampoo xyzonbekend')).toEqual([])
  })
  it('hoofdletter- en accentongevoelig', () => {
    expect(search('AUTOGLYM').length).toBe(search('autoglym').length)
    expect(search('hoes').length).toBeGreaterThan(0)
    expect(search('hoezen').length).toBeGreaterThan(0)
  })
  it('zoekt ook op categorie', () => { expect(search('onderhoud').length).toBeGreaterThan(0) })
  it('geeft alleen bestaande producten terug', () => { for (const p of search('hoes')) expect(products).toContain(p) })
})

describe('sanitizeHtml', () => {
  it('laat veilige opmaak staan', () => { expect(sanitizeHtml('<p>Hallo <strong>wereld</strong></p><ul><li>a</li></ul>')).toBe('<p>Hallo <strong>wereld</strong></p><ul><li>a</li></ul>') })
  it('verwijdert script, handlers, iframes en gevaarlijke links', () => {
    const out = sanitizeHtml('<p onclick="x()">a</p><script>alert(1)</script><img src=x onerror=alert(1)><iframe src="//e"></iframe><a href="javascript:alert(1)">k</a><a href=" JaVa\tScript:alert(1)">k</a><a href="&#106;avascript:alert(1)">k</a>')
    expect(out).not.toMatch(/script|onerror|onclick|<img|iframe|javascript/i)
  })
  it('behoudt https-links met rel', () => {
    expect(sanitizeHtml('<a href="https://example.com/x?a=1&b=2" onclick="x">l</a>')).toBe('<a href="https://example.com/x?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">l</a>')
  })
  it('escapet losse < en >', () => { expect(sanitizeHtml('a < b en c > d')).not.toMatch(/[<>]/) })
  it('leeg of null', () => { expect(sanitizeHtml(null)).toBe(''); expect(sanitizeHtml('')).toBe('') })
})
