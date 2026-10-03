import { createPortal } from 'react-dom'

// Rendert dialogen direct onder <body>, buiten #root. Daardoor kan #root `inert` worden terwijl de dialoog bedienbaar blijft.
// Alleen aanroepen wanneer de dialoog open is (dan is er altijd een document).
export default function Portal({ children }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}
