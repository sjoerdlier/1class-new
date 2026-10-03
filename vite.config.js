import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Alleen voor `vite preview`: zelfde gedrag als Vercel met cleanUrls (/p/x -> dist/p/x/index.html)
// en een echte 404 (dist/404.html) in plaats van een SPA-fallback.
const previewLikeVercel = () => ({
  name: 'preview-like-vercel',
  configurePreviewServer(server) {
    const dist = path.resolve(server.config.build.outDir)
    server.middlewares.use((req, _res, next) => {
      const [p, q] = req.url.split('?')
      if (p !== '/' && !path.extname(p)) {
        const clean = p.replace(/\/$/, '')
        if (fs.existsSync(path.join(dist, clean, 'index.html'))) req.url = `${clean}/index.html${q ? '?' + q : ''}`
      }
      next()
    })
  },
})

export default defineConfig(({ isPreview }) => ({
  plugins: [react(), previewLikeVercel()],
  appType: isPreview ? 'mpa' : 'spa',
  server: { port: 5174 },
}))
