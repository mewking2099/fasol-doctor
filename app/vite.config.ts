import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff2}'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB — covers the ONNX model
        runtimeCaching: [
          {
            urlPattern: /\/model\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fasol-model', expiration: { maxAgeSeconds: 60 * 60 * 24 * 90 } },
          },
          {
            urlPattern: /\/audio\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fasol-audio', expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
      manifest: {
        name: 'Fasol Doctor',
        short_name: 'Fasol Doctor',
        description: 'ধানের রোগ নির্ণয় — Rice disease detection for Bangladesh',
        theme_color: '#16a34a',
        background_color: '#f0fdf4',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'bn',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      // COEP omitted — single-threaded WASM works without it and allows cross-origin images
    },
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
})
