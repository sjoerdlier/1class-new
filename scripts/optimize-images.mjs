// Zet bron-afbeeldingen (jpg/png/webp, echt formaat wordt gedetecteerd) om naar WebP.
// Gebruik: node scripts/optimize-images.mjs [--src=public/img-src] [--keep]
// Uitvoer per bron: <id>-900.webp (max 900 px breed) en <id>-480.webp (max 480 px breed).
// Bronnen met de naam <id>-900.jpg of <id>-760.jpg krijgen basisnaam <id>.
// De UI leidt het 480-pad af door '-900.webp' te vervangen door '-480.webp'.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve(process.argv.find((a) => a.startsWith('--src='))?.slice(6) || 'public/img')
const keep = process.argv.includes('--keep')
const outDir = path.resolve(process.argv.find((a) => a.startsWith('--out='))?.slice(6) || dir)
fs.mkdirSync(outDir, { recursive: true })
const SIZES = [[900, 68], [480, 68]]
let before = 0
let after = 0

for (const f of fs.readdirSync(dir)) {
  if (!/\.(jpe?g|png|webp)$/i.test(f) || /-(900|480)\.webp$/.test(f)) continue
  const file = path.join(dir, f)
  const buf = fs.readFileSync(file)
  const meta = await sharp(buf).metadata() // echt formaat, ongeacht extensie
  const base = f.replace(/\.[^.]+$/, '').replace(/-(900|760)$/, '')
  before += buf.length
  for (const [w, q] of SIZES) {
    const out = path.join(outDir, `${base}-${w}.webp`)
    const info = await sharp(buf)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .webp({ quality: q, effort: 6 })
      .toFile(out)
    after += info.size
  }
  const ext = path.extname(f).slice(1).toLowerCase().replace('jpeg', 'jpg')
  const real = meta.format.replace('jpeg', 'jpg')
  if (ext !== real) console.log(`${f}: echt formaat ${real}`)
  if (!keep) fs.unlinkSync(file)
}
console.log(`Bron ${(before / 1e6).toFixed(1)} MB -> WebP ${(after / 1e6).toFixed(1)} MB`)
