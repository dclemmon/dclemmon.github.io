import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { basePath } from './scripts/site.ts';

// The manifest can't read CSS variables, so these mirror --color-bg in src/theme/tokens.css.
const THEME = '#f4eef8';
const BACKGROUND = '#f4eef8';

export default defineConfig({
  // "/" for a domain/subdomain root; set BASE_PATH=/sub/ to serve from a sub-path.
  base: basePath(),
  build: { target: 'es2020' },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: {
        name: 'Advent Devotional',
        short_name: 'Advent',
        description: 'Weekly Advent activities for families at home.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        theme_color: THEME,
        background_color: BACKGROUND,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Hashed JS/CSS and icons are precached. HTML is NOT precached so content fixes
        // show up on the next online visit (network-first below).
        globPatterns: ['**/*.{js,css,svg,png,ico,webp}'],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages', networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/advent.ics'),
            handler: 'NetworkFirst',
            options: { cacheName: 'calendar', networkTimeoutSeconds: 3 },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
});
