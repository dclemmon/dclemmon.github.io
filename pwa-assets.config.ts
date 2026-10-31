import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

// Run `npm run icons` after changing public/favicon.svg; the PNGs are committed.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#4a2f7a' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#4a2f7a' } },
  },
  images: ['public/favicon.svg'],
});
