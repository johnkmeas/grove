#!/usr/bin/env node
/**
 * new-component.js
 *
 * Scaffolds a new component with all required files.
 *
 * Usage:
 *   node scripts/new-component.js product-badge
 *   node scripts/new-component.js cart-drawer --vue
 *   node scripts/new-component.js heading --type block
 *   pnpm new-component product-badge
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const args = process.argv.slice(2)
const isVue = args.includes('--vue')
const isBlock = args.includes('--type') && args[args.indexOf('--type') + 1] === 'block'
const name = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--type')

if (!name) {
  console.error('Usage: pnpm new-component [component-name] [--vue] [--type block]')
  process.exit(1)
}

if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error(`Component name must be kebab-case. Got: "${name}"`)
  console.error('Examples: hero, product-card, cart-drawer, image-with-text')
  process.exit(1)
}

const ROOT = process.cwd()

const pascalName = name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')

const humanName = pascalName.replace(/([A-Z])/g, ' $1').trim()

if (isBlock) {
  scaffoldBlock()
} else {
  scaffoldSection()
}

function scaffoldBlock() {
  const blockDir = resolve(ROOT, 'src/blocks', name)

  if (existsSync(blockDir)) {
    console.error(`Block already exists: src/blocks/${name}/`)
    process.exit(1)
  }

  mkdirSync(blockDir, { recursive: true })

  const liquidContent = `<div class="${name}" {{ block.shopify_attributes }}>
  {%- comment -%} Block content here {%- endcomment -%}
</div>

<!-- SCHEMA_INJECT -->
`
  writeFileSync(resolve(blockDir, 'index.liquid'), liquidContent)

  const schemaContent = {
    _version: '1.0.0',
    name: humanName,
    tag: null,
    settings: [],
  }
  writeFileSync(resolve(blockDir, `${name}.schema.json`), JSON.stringify(schemaContent, null, 2))

  const scssContent = `.${name} {
}
`
  writeFileSync(resolve(blockDir, `${name}.scss`), scssContent)

  const registryPath = resolve(ROOT, 'src/blocks/registry.json')
  let registry = {}
  if (existsSync(registryPath)) {
    registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
  }

  registry[name] = {
    type: 'block',
    status: 'draft',
    schemaVersion: '1.0.0',
    reusableIn: [],
  }

  writeFileSync(registryPath, JSON.stringify(registry, null, 2))

  console.log(`\nBlock "${name}" scaffolded at src/blocks/${name}/\n`)
  console.log('  Files created:')
  console.log(`    index.liquid`)
  console.log(`    ${name}.schema.json`)
  console.log(`    ${name}.scss`)
  console.log(`\n  src/blocks/registry.json updated`)
  console.log(`\nNext steps:`)
  console.log(`  1. Edit src/blocks/${name}/ to implement the block`)
  console.log(`  2. Run: pnpm validate-schemas`)
  console.log(`  3. Run: pnpm build\n`)
}

function scaffoldSection() {
  const componentDir = resolve(ROOT, 'src/components', name)

  if (existsSync(componentDir)) {
    console.error(`Component already exists: src/components/${name}/`)
    process.exit(1)
  }

  mkdirSync(componentDir, { recursive: true })

  const liquidContent = `<section class="${name}">
  <div class="${name}__inner page-width">
    {%- comment -%} Component markup goes here {%- endcomment -%}
  </div>
</section>

<!-- SCHEMA_INJECT -->
`
  writeFileSync(resolve(componentDir, 'index.liquid'), liquidContent)

  const schemaContent = {
    _version: '1.0.0',
    name: humanName,
    tag: 'section',
    settings: [
      {
        type: 'header',
        content: 'Content',
      },
      {
        type: 'inline_richtext',
        id: 'heading',
        label: 'Heading',
        default: humanName,
      },
    ],
    presets: [
      {
        name: humanName,
        settings: {},
      },
    ],
  }
  writeFileSync(resolve(componentDir, `${name}.schema.json`), JSON.stringify(schemaContent, null, 2))

  const scssContent = `.${name} {

  &__inner {
    padding-block: var(--spacing-section-vertical);
  }
}
`
  writeFileSync(resolve(componentDir, `${name}.scss`), scssContent)

  if (isVue) {
    const vueContent = `<template>
  <div class="${name}">
    <slot />
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
`
    writeFileSync(resolve(componentDir, `${pascalName}.vue`), vueContent)
  } else {
    const jsContent = `class ${pascalName}Section {
  constructor(el) {
    this.el = el
    this.init()
  }

  init() {
  }
}

document.querySelectorAll('.${name}').forEach((el) => {
  new ${pascalName}Section(el)
})
`
    writeFileSync(resolve(componentDir, `${name}.js`), jsContent)
  }

  const registryPath = resolve(ROOT, 'src/components/registry.json')
  let registry = {}
  if (existsSync(registryPath)) {
    registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
  }

  registry[name] = {
    type: 'section',
    js: isVue ? 'vue' : 'vanilla',
    interactive: isVue,
    vue: isVue,
    status: 'draft',
    schemaVersion: '1.0.0',
    usedIn: [],
    privateSnippets: [],
    sharedSnippets: [],
  }

  writeFileSync(registryPath, JSON.stringify(registry, null, 2))

  console.log(`\nComponent "${name}" scaffolded at src/components/${name}/\n`)
  console.log('  Files created:')
  console.log(`    index.liquid`)
  console.log(`    ${name}.schema.json`)
  console.log(`    ${name}.scss`)
  console.log(`    ${isVue ? `${pascalName}.vue` : `${name}.js`}`)
  console.log(`\n  registry.json updated`)
  console.log(`\nNext steps:`)
  console.log(`  1. Edit src/components/${name}/ to implement the component`)
  console.log(`  2. Run: pnpm validate-schemas`)
  console.log(`  3. Run: pnpm build\n`)
}
