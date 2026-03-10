import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { glob } from 'glob'
import grovePlugin from './plugins/vite-plugin-grove-liquid.js'

// Dynamically find all component JS/Vue entry points
function getComponentEntries() {
  const entries = {}

  // Vue island components (vanilla JS is handled by the Liquid plugin via {% javascript %})
  const vueFiles = glob.sync('src/components/*/*.vue')
  for (const file of vueFiles) {
    const match = file.match(/src\/components\/([^/]+)\/[^/]+\.vue$/)
    if (match) {
      const name = match[1]
      if (!name.startsWith('_')) {
        entries[`component-${name}-vue`] = resolve(process.cwd(), file)
      }
    }
  }

  return entries
}

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      grovePlugin({
        srcDir: 'src',
        outDir: 'shopify',
      }),
    ],

    build: {
      outDir: 'shopify/assets',
      emptyOutDir: false,
      manifest: false,
      minify: false,
      rollupOptions: {
        input: {
          // Main theme entry
          theme: resolve(process.cwd(), 'src/theme.js'),
          // Component entries (auto-discovered)
          ...getComponentEntries(),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return '[name].css'
            }
            return 'media/[name]-[hash][extname]'
          },
        },
      },
    },

    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        '@tokens': resolve(process.cwd(), 'src/tokens'),
        '@components': resolve(process.cwd(), 'src/components'),
      },
    },

    // Development server for local component preview
    server: {
      port: 3000,
    },
  }
})
