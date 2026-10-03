// Prijslogica in hele centen. Puur (geen React, geen window), dus ook veilig voor SSR/prerender en testbaar.
export const FREE_SHIPPING = 150 // euro, gratis verzending vanaf dit orderbedrag
export const PROMO = { code: '1Class2026', min: 200, pct: 10 }
export const MAX_QTY = 99

export const toCents = (n) => {
  const c = Math.round(Number(n) * 100)
  return Number.isFinite(c) && c > 0 ? c : 0
}
export const fromCents = (c) => c / 100

export function cleanQty(q) {
  const n = Math.floor(Number(q))
  return Number.isFinite(n) && n >= 1 ? Math.min(n, MAX_QTY) : 1
}

export const lineKey = (product, variant) => `${product.id}:${variant?.id ?? 0}`

// Bouw een winkelwagenregel uit de catalogus. De prijs komt altijd uit de catalogus.
export function buildLine(product, variant, qty = 1) {
  const price = Number(variant?.price ?? product.price)
  return {
    key: lineKey(product, variant),
    slug: product.slug,
    title: product.title,
    variant: variant?.title || '',
    vid: variant?.id ?? product.vid,
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    image: product.images?.[0] || '',
    qty: cleanQty(qty),
  }
}

// Herbouw opgeslagen regels tegen de actuele catalogus: onbekende producten/varianten vallen weg,
// prijs en titel komen uit de catalogus, aantallen worden geklemd. Dubbele regels worden samengevoegd.
export function sanitizeLines(raw, findProduct) {
  if (!Array.isArray(raw)) return []
  const byKey = new Map()
  for (const l of raw) {
    if (!l || typeof l !== 'object' || typeof l.slug !== 'string') continue
    const p = findProduct(l.slug)
    if (!p) continue
    const variants = Array.isArray(p.variants) ? p.variants : []
    const v = variants.find((x) => x.id === l.vid)
    if (variants.length && !v) continue
    const line = buildLine(p, v, l.qty)
    const hit = byKey.get(line.key)
    if (hit) hit.qty = cleanQty(hit.qty + line.qty)
    else byKey.set(line.key, line)
  }
  return [...byKey.values()]
}

export const isPromoCode = (code) => String(code ?? '').trim().toLowerCase() === PROMO.code.toLowerCase()

// codeStatus: 'none' (leeg) | 'invalid' | 'low' (code goed, bedrag te laag) | 'ok'
export function totals(lines, code = '') {
  const subC = lines.reduce((n, l) => n + toCents(l.price) * cleanQty(l.qty), 0)
  const entered = String(code ?? '').trim() !== ''
  const codeOk = isPromoCode(code)
  const promoOk = codeOk && subC >= PROMO.min * 100
  const discC = promoOk ? Math.round((subC * PROMO.pct) / 100) : 0
  const totC = Math.max(0, subC - discC)
  const freeC = FREE_SHIPPING * 100
  return {
    subtotal: fromCents(subC),
    discount: fromCents(discC),
    total: fromCents(totC),
    codeOk,
    promoOk,
    codeStatus: !entered ? 'none' : !codeOk ? 'invalid' : promoOk ? 'ok' : 'low',
    freeShip: subC > 0 && totC >= freeC,
    missingForFree: fromCents(Math.max(0, freeC - totC)),
    missingForPromo: fromCents(Math.max(0, PROMO.min * 100 - subC)),
    progress: subC > 0 ? Math.min(1, totC / freeC) : 0,
  }
}

export const lineTotal = (l) => fromCents(toCents(l.price) * cleanQty(l.qty))

// Eenduidige formuleringen, overal gebruiken.
export const PROMO_TEXT = `Bij bestellingen vanaf € ${PROMO.min}: ${PROMO.pct}% korting met code ${PROMO.code}`
export const PROMO_LOW_TEXT = `Deze code geldt vanaf € ${PROMO.min}.`
export const PROMO_INVALID_TEXT = 'Deze code is niet geldig.'

const fmt = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n).replace(/ /g, ' ')
const clean = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim()

// Tekst van de bestelaanvraag (platte tekst). Bedragen komen uit totals(), dus gelijk aan wat de klant ziet.
export function buildRequestMessage(lines, code, form) {
  const t = totals(lines, code)
  const rows = lines.map((l, i) => {
    const title = `${l.title}${l.variant ? ` (${l.variant})` : ''}`
    return `${i + 1}. ${cleanQty(l.qty)} x ${title} - ${fmt(l.price)} per stuk - ${fmt(lineTotal(l))}`
  })
  const out = [
    'BESTELAANVRAAG via 1classadditions.nl',
    '',
    'Producten',
    ...rows,
    '',
    `Subtotaal: ${fmt(t.subtotal)}`,
  ]
  if (t.discount > 0) out.push(`Korting (code ${PROMO.code}, ${PROMO.pct}%): -${fmt(t.discount)}`)
  out.push(
    `Verzendkosten: ${t.freeShip ? 'gratis' : 'nog te berekenen (graag bevestigen in uw reactie)'}`,
    `Totaal producten incl. btw: ${fmt(t.total)}${t.freeShip ? '' : ' (excl. verzendkosten)'}`,
    '',
    'Klantgegevens',
    `Naam: ${clean(form.naam)}`,
    `E-mail: ${clean(form.email)}`,
    `Telefoon: ${clean(form.tel) || '-'}`,
    `Adres: ${clean(form.adres)}, ${clean(form.postcode)} ${clean(form.plaats)}`,
    `Opmerking: ${clean(form.opm) || '-'}`,
    '',
    'Dit is een aanvraag, nog geen bindende bestelling. Prijzen zijn inclusief btw.',
    'Ik heb kennisgenomen van de algemene voorwaarden, de herroepingsinformatie en de privacyverklaring.',
  )
  return out.join('\n')
}
