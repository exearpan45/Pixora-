import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

  return {
    base: isGitHubPages ? '/Pixora-/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: isGitHubPages ? '/Pixora-/' : '/',
          name: 'Pixora — Premium Image Workspace',
          short_name: 'Pixora',
          description: 'Every image. Every tool. One workspace. Edit, resize, compress, convert, and enhance images locally.',
          theme_color: '#0b0f17',
          background_color: '#0b0f17',
          display: 'standalone',
          start_url: isGitHubPages ? '/Pixora-/' : '/',
          scope: isGitHubPages ? '/Pixora/' : '/',
          icons: [
            { src: '/Pixora-/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/Pixora-/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/Pixora-/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
