#!/usr/bin/env node
/**
 * new-component.js
 *
 * Scaffolds a new Grove component with all required files.
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

// Enforce kebab-case
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error(`Component name must be kebab-case. Got: "${name}"`)
  console.error('Examples: hero, product-card, cart-drawer, image-with-text')
  process.exit(1)
}

const ROOT = process.cwd()

// Derive PascalCase from kebab-case
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

  // --- index.liquid ---
  const liquidContent = `<div class="grove-${name}" {{ block.shopify_attributes }}>
  {%- comment -%} Block content here {%- endcomment -%}
</div>

<!-- SCHEMA_INJECT -->
`
  writeFileSync(resolve(blockDir, 'index.liquid'), liquidContent)

  // --- [name].schema.json ---
  const schemaContent = {
    _version: '1.0.0',
    name: humanName,
    tag: null,
    settings: [],
  }
  writeFileSync(resolve(blockDir, `${name}.schema.json`), JSON.stringify(schemaContent, null, 2))

  // --- [name].scss ---
  const scssContent = `// ${humanName} Block
// Scoped nested BEM styles — use CSS custom properties from css-variables.liquid

.grove-${name} {
  // Add block styles here
}
`
  writeFileSync(resolve(blockDir, `${name}.scss`), scssContent)

  // --- Update blocks registry ---
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

  console.log(`\n✓ Block "${name}" scaffolded at src/blocks/${name}/\n`)
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

  // --- index.liquid ---
  const liquidContent = `{% liquid
  assign placeholder = true
%}

<section class="${name}">
  <div class="${name}__inner page-width">
    {%- comment -%} Component markup goes here {%- endcomment -%}
    <p>{{ '${name}.placeholder' | t }}</p>
  </div>
</section>

<!-- SCHEMA_INJECT -->
`
  writeFileSync(resolve(componentDir, 'index.liquid'), liquidContent)

  // --- [name].schema.json ---
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

  // --- [name].scss ---
  const scssContent = `// ${humanName} Component
// Scoped nested BEM styles — use CSS custom properties from css-variables.liquid

.${name} {
  // Add component styles here

  &__inner {
    padding-block: var(--spacing-xl);
  }
}
`
  writeFileSync(resolve(componentDir, `${name}.scss`), scssContent)

  // --- [ComponentName].vue OR [name].js ---
  if (isVue) {
    const vueContent = `<template>
  <div class="${name}">
    <!-- ${pascalName} Vue island -->
    <slot />
  </div>
</template>

<script setup>
// ${pascalName} interactive island
// Only use Vue for genuinely reactive functionality
</script>

<style scoped>
/* Scoped styles — prefer global BEM SCSS in ${name}.scss */
</style>
`
    writeFileSync(resolve(componentDir, `${pascalName}.vue`), vueContent)
  } else {
    const jsContent = `/**
 * ${pascalName} component — Vanilla ES module
 */

class ${pascalName}Section {
  constructor(el) {
    this.el = el
    this.init()
  }

  init() {
    // Initialise component behaviour here
  }
}

// Auto-initialise all instances on the page
document.querySelectorAll('.${name}').forEach((el) => {
  new ${pascalName}Section(el)
})

export { ${pascalName}Section }
`
    writeFileSync(resolve(componentDir, `${name}.js`), jsContent)
  }

  // --- [name].md ---
  const mdContent = `# ${humanName}

## Purpose

TODO: Describe what this component does, where it is used, and what problem it solves.

## Variants in use

- TODO: List active variants

## Settings

| Setting | Notes |
|---|---|
| \`heading\` | Section heading text |

## BEM Structure

\`\`\`
.${name}
.${name}__inner
\`\`\`

## Accessibility

- TODO: List ARIA roles, keyboard interactions, screen reader behaviour

## Known Quirks

- None yet.

## Dependencies

- **Private snippets:** none
- **Shared snippets:** none
- **CSS custom properties:** TODO: list variables used
- **JS / Vue:** ${isVue ? 'Vue 3 island' : 'Vanilla ES module'}
`
  writeFileSync(resolve(componentDir, `${name}.md`), mdContent)

  // --- Update registry.json ---
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

  console.log(`\n✓ Component "${name}" scaffolded at src/components/${name}/\n`)
  console.log('  Files created:')
  console.log(`    index.liquid`)
  console.log(`    ${name}.schema.json`)
  console.log(`    ${name}.scss`)
  console.log(`    ${isVue ? `${pascalName}.vue` : `${name}.js`}`)
  console.log(`    ${name}.md`)
  console.log(`\n  registry.json updated`)
  console.log(`\nNext steps:`)
  console.log(`  1. Edit src/components/${name}/ to implement the component`)
  console.log(`  2. Run: pnpm validate-schemas`)
  console.log(`  3. Run: pnpm render ${name} --fixture product`)
  console.log(`  4. Run: pnpm lint\n`)
}
