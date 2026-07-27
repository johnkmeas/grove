import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { glob } from 'glob'
import shopifyLiquidPlugin from './plugins/vite-plugin-shopify-liquid.js'

function getComponentEntries() {
  const entries = {}

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
      shopifyLiquidPlugin({
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
          theme: resolve(process.cwd(), 'src/theme.js'),
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
        '@components': resolve(process.cwd(), 'src/components'),
      },
    },

    server: {
      port: 3000,
    },
  }
})
