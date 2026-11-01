import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Run `npm run icons` after changing public/favicon.svg; the PNGs are committed.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#f4eef8' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#f4eef8' } },
  },
  images: ['public/favicon.svg'],
});
