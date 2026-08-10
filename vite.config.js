// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
// import { VitePWA } from 'vite-plugin-pwa';

// export default defineConfig({
//   plugins: [
//     vue(),
//     VitePWA({
//       registerType: 'prompt',
//       workbox: {
//         globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
//         cleanupOutdatedCaches: true,
//         sourcemap: false,
//         runtimeCaching: [
//           {
//             urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'google-fonts-cache',
//               expiration: {
//                 maxEntries: 10,
//                 maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
//               },
//               cacheableResponse: {
//                 statuses: [0, 200],
//               },
//             },
//           },
//           {
//             urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'gstatic-fonts-cache',
//               expiration: {
//                 maxEntries: 10,
//                 maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
//               },
//               cacheableResponse: {
//                 statuses: [0, 200],
//               },
//             },
//           },
//           {
//             urlPattern: /^http:\/\/localhost:8001\/.*/i,
//             handler: 'NetworkFirst',
//             //Com NetworkFirst, o Workbox tenta buscar os dados na rede. Se não conseguir (sem conexão ou timeout de 10 segundos), usa a versão em cache.
//             options: {
//               cacheName: 'api-cache',
//               expiration: {
//                 maxEntries: 50,
//                 maxAgeSeconds: 60 * 60 * 24, // 24 horas
//               },
//               cacheableResponse: {
//                 statuses: [0, 200],
//               },
//               networkTimeoutSeconds: 10,
//             },
//           },
//         ],
//       },
//       manifest: {
//         name: 'Gerenciador de Tarefas',
//         short_name: 'Tarefas',
//         description: 'Aplicativo PWA para gerenciar tarefas diárias',
//         theme_color: '#4a90d9',
//         background_color: '#ffffff',
//         display: 'standalone',
//         scope: '/',
//         start_url: '/',
//         icons: [
//           {
//             src: '/icons/icon-192x192.png',
//             sizes: '192x192',
//             type: 'image/png',
//           },
//           {
//             src: '/icons/icon-512x512.png',
//             sizes: '512x512',
//             type: 'image/png',
//           },
//           {
//             src: '/icons/icon-512x512.png',
//             sizes: '512x512',
//             type: 'image/png',
//             purpose: 'maskable',
//           },
//         ],
//       },
//     }),
//   ],
// });


import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest', // 
      srcDir: 'src',                // 
      filename: 'sw.js',            // 

      manifest: {
        name: 'Gerenciador de Tarefas',
        short_name: 'Tarefas',
        description: 'Aplicativo PWA para gerenciar tarefas diárias',
        theme_color: '#4a90d9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        id: 'com.task-manager.app',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module', // 
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})