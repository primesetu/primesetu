/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
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
      includeAssets: ['icon.png'],
      manifest: {
        name: 'SMRITI-OS Sovereign Retail',
        short_name: 'SMRITI-OS',
        description: 'Sovereign AI-Governed Retail Operating System',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/api\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5
            }
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
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600, // [R6] Governance: Warn if chunks exceed 600KB
    rollupOptions: {
      output: {
        // [R6] Operational Critical Chunk Governance
        // Prevents excessive micro-chunking while isolating heavy dependencies.
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom', 'zustand', '@tanstack/react-query'],
          vendor_grid: ['ag-grid-community', 'ag-grid-react'],
          vendor_charts: ['recharts'],
          vendor_utils: ['xlsx', 'react-to-print', 'axios', 'react-barcode'],
          vendor_ui: ['framer-motion', 'lucide-react', 'react-hook-form'],
          vendor_cloud: ['@supabase/supabase-js'],
          vendor_i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    },
    watch: {
      usePolling: true,
    },
  },
})
