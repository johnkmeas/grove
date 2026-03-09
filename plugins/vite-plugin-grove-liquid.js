/**
 * vite-plugin-grove-liquid
 *
 * Handles .liquid files in the Grove build pipeline:
 * - Reads *.schema.json per component
 * - Injects schema JSON into {% schema %}{% endschema %} block in compiled .liquid
 * - Copies .liquid files to shopify/sections/ or shopify/snippets/ based on component type
 */

import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs'
import { resolve, dirname, basename, relative } from 'path'
import { glob } from 'glob'

const SCHEMA_INJECT_COMMENT = '<!-- SCHEMA_INJECT -->'

export default function grovePlugin(options = {}) {
  const { srcDir = 'src', outDir = 'shopify' } = options

  return {
    name: 'vite-plugin-grove-liquid',
    apply: 'build',

    async buildStart() {
      await processLiquidFiles(srcDir, outDir)
    },

    async watchChange(id) {
      if (id.endsWith('.liquid') || id.endsWith('.schema.json')) {
        await processLiquidFiles(srcDir, outDir)
      }
    },
  }
}

async function processLiquidFiles(srcDir, outDir) {
  const srcPath = resolve(process.cwd(), srcDir)
  const outPath = resolve(process.cwd(), outDir)

  // Process component sections (src/components/*/index.liquid)
  const sectionFiles = await glob(`${srcPath}/components/*/index.liquid`)
  for (const liquidFile of sectionFiles) {
    const componentDir = dirname(liquidFile)
    const componentName = basename(componentDir)

    // Skip _shared directory — those are snippets
    if (componentName.startsWith('_')) continue

    const schemaFile = resolve(componentDir, `${componentName}.schema.json`)
    let liquidContent = readFileSync(liquidFile, 'utf-8')

    // Inject schema if schema file exists
    if (existsSync(schemaFile)) {
      const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'))
      delete schema._version
      const schemaJson = JSON.stringify(schema, null, 2)
      const schemaBlock = `{% schema %}\n${schemaJson}\n{% endschema %}`

      if (liquidContent.includes(SCHEMA_INJECT_COMMENT)) {
        liquidContent = liquidContent.replace(SCHEMA_INJECT_COMMENT, schemaBlock)
      } else if (!liquidContent.includes('{% schema %}')) {
        liquidContent = `${liquidContent}\n\n${schemaBlock}`
      }
    }

    // Write to shopify/sections/
    const sectionsDir = resolve(outPath, 'sections')
    mkdirSync(sectionsDir, { recursive: true })
    writeFileSync(resolve(sectionsDir, `${componentName}.liquid`), liquidContent)
  }

  // Process theme blocks (src/blocks/*/index.liquid)
  const blockFiles = await glob(`${srcPath}/blocks/*/index.liquid`)
  for (const liquidFile of blockFiles) {
    const blockDir = dirname(liquidFile)
    const blockName = basename(blockDir)

    // Skip _ prefixed directories
    if (blockName.startsWith('_')) continue

    const schemaFile = resolve(blockDir, `${blockName}.schema.json`)
    let liquidContent = readFileSync(liquidFile, 'utf-8')

    // Inject schema if schema file exists
    if (existsSync(schemaFile)) {
      const schema = JSON.parse(readFileSync(schemaFile, 'utf-8'))
      delete schema._version
      const schemaJson = JSON.stringify(schema, null, 2)
      const schemaBlock = `{% schema %}\n${schemaJson}\n{% endschema %}`

      if (liquidContent.includes(SCHEMA_INJECT_COMMENT)) {
        liquidContent = liquidContent.replace(SCHEMA_INJECT_COMMENT, schemaBlock)
      } else if (!liquidContent.includes('{% schema %}')) {
        liquidContent = `${liquidContent}\n\n${schemaBlock}`
      }
    }

    // Write to shopify/blocks/
    const blocksDir = resolve(outPath, 'blocks')
    mkdirSync(blocksDir, { recursive: true })
    writeFileSync(resolve(blocksDir, `${blockName}.liquid`), liquidContent)
  }

  // Process shared snippets (src/components/_shared/*.liquid)
  const sharedSnippets = await glob(`${srcPath}/components/_shared/*.liquid`)
  for (const snippetFile of sharedSnippets) {
    const snippetsDir = resolve(outPath, 'snippets')
    mkdirSync(snippetsDir, { recursive: true })
    copyFileSync(snippetFile, resolve(snippetsDir, basename(snippetFile)))
  }

  // Process layout files (src/layout/*.liquid)
  const layoutFiles = await glob(`${srcPath}/layout/*.liquid`)
  for (const layoutFile of layoutFiles) {
    const layoutDir = resolve(outPath, 'layout')
    mkdirSync(layoutDir, { recursive: true })
    copyFileSync(layoutFile, resolve(layoutDir, basename(layoutFile)))
  }

  // Process templates (src/templates/*.json)
  const templateFiles = await glob(`${srcPath}/templates/**/*.{json,liquid}`)
  for (const templateFile of templateFiles) {
    const relPath = relative(resolve(srcPath, 'templates'), templateFile)
    const destFile = resolve(outPath, 'templates', relPath)
    mkdirSync(dirname(destFile), { recursive: true })
    copyFileSync(templateFile, destFile)
  }

  // Process config (src/config/*.json)
  const configFiles = await glob(`${srcPath}/config/*.json`)
  for (const configFile of configFiles) {
    const configDir = resolve(outPath, 'config')
    mkdirSync(configDir, { recursive: true })
    copyFileSync(configFile, resolve(configDir, basename(configFile)))
  }

  // Process locales (src/locales/*.json)
  const localeFiles = await glob(`${srcPath}/locales/*.json`)
  for (const localeFile of localeFiles) {
    const localesDir = resolve(outPath, 'locales')
    mkdirSync(localesDir, { recursive: true })
    copyFileSync(localeFile, resolve(localesDir, basename(localeFile)))
  }
}
