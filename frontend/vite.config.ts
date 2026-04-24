/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true // Enables PWA testing even in npm run dev
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000 // 5MB to handle larger chunks without warning
      },
      manifest: {
        name: "PrimeSetu Sovereign Retail OS",
        short_name: "PrimeSetu",
        start_url: "/",
        display: "standalone",
        background_color: "#FAF7F2",
        theme_color: "#0D1B3E",
        description: "Zero-Cloud Sovereign Retail Operating System",
        orientation: "landscape",
        icons: [
          {
            src: "/vite.svg", // Fallback icon since we haven't provided custom PNGs yet
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "/vite.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
