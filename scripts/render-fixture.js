#!/usr/bin/env node
/**
 * render-fixture.js
 *
 * Dry-run renders a component's index.liquid against a mock fixture.
 * Uses liquidjs for Liquid parsing.
 *
 * Usage:
 *   node scripts/render-fixture.js hero --fixture product
 *   pnpm render hero --fixture product
 *   pnpm render hero --fixture cart
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { Liquid } from 'liquidjs'

const args = process.argv.slice(2)
const componentName = args.find((a) => !a.startsWith('--'))
const fixtureIndex = args.indexOf('--fixture')
const fixtureName = fixtureIndex !== -1 ? args[fixtureIndex + 1] : 'product'

if (!componentName) {
  console.error('Usage: pnpm render [component-name] --fixture [product|collection|cart|customer]')
  process.exit(1)
}

const ROOT = process.cwd()
const liquidFile = resolve(ROOT, `src/components/${componentName}/index.liquid`)
const fixtureFile = resolve(ROOT, `src/fixtures/${fixtureName}.json`)
const schemaFile = resolve(ROOT, `src/components/${componentName}/${componentName}.schema.json`)

if (!existsSync(liquidFile)) {
  console.error(`Component not found: src/components/${componentName}/index.liquid`)
  process.exit(1)
}

if (!existsSync(fixtureFile)) {
  console.error(`Fixture not found: src/fixtures/${fixtureName}.json`)
  console.error('Available fixtures: product, collection, cart, customer')
  process.exit(1)
}

// Load template and fixture
let liquidContent = readFileSync(liquidFile, 'utf-8')
const fixtureData = JSON.parse(readFileSync(fixtureFile, 'utf-8'))

// Strip the SCHEMA_INJECT comment for rendering (it will be replaced at build time)
liquidContent = liquidContent.replace('<!-- SCHEMA_INJECT -->', '')

// Load schema to get default settings
let schema = {}
let defaultSettings = {}
if (existsSync(schemaFile)) {
  schema = JSON.parse(readFileSync(schemaFile, 'utf-8'))

  // Build default settings from schema
  if (schema.settings) {
    for (const setting of schema.settings) {
      if (setting.id && setting.default !== undefined) {
        defaultSettings[setting.id] = setting.default
      }
    }
  }

  // Apply preset defaults if available
  if (schema.presets && schema.presets[0] && schema.presets[0].settings) {
    defaultSettings = { ...defaultSettings, ...schema.presets[0].settings }
  }
}

// Build mock Shopify context
const context = {
  // Section mock
  section: {
    id: `section-${componentName}-fixture`,
    type: componentName,
    settings: defaultSettings,
    blocks: {},
  },

  // Page-level objects from fixture
  product: fixtureName === 'product' ? fixtureData : null,
  collection: fixtureName === 'collection' ? fixtureData : null,
  cart: fixtureName === 'cart' ? fixtureData : null,
  customer: fixtureName === 'customer' ? fixtureData : null,

  // Mock Shopify globals
  shop: {
    name: 'Grove Demo Store',
    url: 'https://grove-demo.myshopify.com',
    description: 'Grove Framework Demo Store',
    currency: 'USD',
    money_format: '${{amount}}',
  },

  request: {
    page_type: 'index',
    locale: { iso_code: 'en' },
  },

  // Liquid filters mock
  settings: {
    page_width: 1280,
  },
}

// Configure LiquidJS with Shopify-like settings
const engine = new Liquid({
  root: resolve(ROOT, 'src/components/_shared'),
  extname: '.liquid',
  strictFilters: false,
  strictVariables: false,
  ownPropertyOnly: false,
})

// Add common Shopify filters
engine.registerFilter('t', (key, ...args) => {
  // Mock translation — return the key as readable text
  const parts = String(key).split('.')
  const lastPart = parts[parts.length - 1]
  return lastPart.replace(/_/g, ' ')
})

engine.registerFilter('money', (cents) => {
  if (typeof cents !== 'number') return cents
  return `$${(cents / 100).toFixed(2)}`
})

engine.registerFilter('image_url', (image, options = {}) => {
  if (typeof image === 'string') return image
  if (image && image.src) return image.src
  return 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'
})

engine.registerFilter('image_tag', (url, options = {}) => {
  const {
    class: cls = '',
    alt = '',
    loading = 'lazy',
    fetchpriority = 'auto',
    sizes = '100vw',
  } = options
  const attrs = [
    `src="${url}"`,
    `alt="${alt}"`,
    cls ? `class="${cls}"` : '',
    `loading="${loading}"`,
    `fetchpriority="${fetchpriority}"`,
    `sizes="${sizes}"`,
  ]
    .filter(Boolean)
    .join(' ')
  return `<img ${attrs}>`
})

engine.registerFilter('asset_url', (filename) => {
  return `/assets/${filename}`
})

engine.registerFilter('stylesheet_tag', (url) => {
  return `<link rel="stylesheet" href="${url}">`
})

engine.registerFilter('script_tag', (url) => {
  return `<script src="${url}"></script>`
})

engine.registerFilter('img_tag', (url, alt = '') => {
  return `<img src="${url}" alt="${alt}">`
})

engine.registerFilter('placeholder_svg_tag', (type, cssClass = '') => {
  return `<svg class="${cssClass}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 525 350"><rect fill="#e8e8e8" width="525" height="350"/><text fill="#aaa" x="50%" y="50%" text-anchor="middle">${type}</text></svg>`
})

engine.registerFilter('escape', (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
})

engine.registerFilter('prepend', (str, prefix) => `${prefix}${str}`)
engine.registerFilter('append', (str, suffix) => `${str}${suffix}`)
engine.registerFilter('default', (val, fallback) => (val == null || val === '' ? fallback : val))
engine.registerFilter('divided_by', (val, divisor) => val / divisor)
engine.registerFilter('times', (val, factor) => val * factor)
engine.registerFilter('strip', (str) => String(str).trim())

engine.registerFilter('video_tag', (video, options = {}) => {
  const { class: cls = '', autoplay, loop, muted, playsinline } = options
  const attrs = [
    cls ? `class="${cls}"` : '',
    autoplay ? 'autoplay' : '',
    loop ? 'loop' : '',
    muted ? 'muted' : '',
    playsinline ? 'playsinline' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return `<video ${attrs}><source src="placeholder-video.mp4"></video>`
})

// Render
async function render() {
  try {
    const html = await engine.parseAndRender(liquidContent, context)

    console.log(`\n${'='.repeat(60)}`)
    console.log(`Grove Render: ${componentName} (fixture: ${fixtureName})`)
    console.log('='.repeat(60))
    console.log(html)
    console.log('='.repeat(60))
    console.log(`\n✓ Rendered successfully`)
  } catch (err) {
    console.error(`\nRender error: ${err.message}`)
    if (err.stack) console.error(err.stack)
    process.exit(1)
  }
}

render()
