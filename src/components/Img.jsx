import '../img.css'

// Afbeelding met srcset (480w en grote versie). De data verwijst naar `<naam>-900.webp`; de kleine
// versie is `<naam>-480.webp`. Geen window/document bij render, dus veilig voor prerender.
//   w/h       intrinsieke afmetingen van het grote bestand (producten 900x900, categoriefoto's 760x550);
//             bepalen de aspect-ratio en voorkomen layoutverschuiving.
//   sizes     weergavebreedte voor de browser (standaard 100vw).
//   priority  eager + fetchpriority high (alleen voor de eerste zichtbare afbeelding).
//   small     alleen de 480-versie gebruiken (thumbnails).
const BIG = '-900.webp'
const SMALL = '-480.webp'

export default function Img({ src, alt = '', w = 900, h = 900, sizes = '100vw', priority = false, small = false, className, ...rest }) {
  const derived = typeof src === 'string' && src.endsWith(BIG)
  const lo = derived ? src.slice(0, -BIG.length) + SMALL : null
  const loW = Math.min(480, w)
  const loH = Math.round((h * loW) / w)
  const props = derived
    ? small
      ? { src: lo, width: loW, height: loH }
      : { src, srcSet: `${lo} ${loW}w, ${src} ${w}w`, sizes, width: w, height: h }
    : { src, width: w, height: h }
  return (
    <img
      {...props}
      alt={alt}
      className={className ? `pic ${className}` : 'pic'}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      {...rest}
    />
  )
}
