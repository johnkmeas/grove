/**
 * vite-plugin-grove-liquid
 *
 * Handles .liquid files in the Grove build pipeline:
 * - Reads *.schema.json per component
 * - Injects schema JSON into {% schema %}{% endschema %} block in compiled .liquid
 * - Copies .liquid files to shopify/sections/ or shopify/snippets/ based on component type
 */

import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, watch } from 'fs'
import { resolve, dirname, basename, relative } from 'path'
import { glob } from 'glob'
import * as sass from 'sass'

const SCHEMA_INJECT_COMMENT = '<!-- SCHEMA_INJECT -->'

export default function grovePlugin(options = {}) {
  const { srcDir = 'src', outDir = 'shopify' } = options
  let fsWatcherStarted = false
  let debounceTimer = null

  return {
    name: 'vite-plugin-grove-liquid',
    apply: 'build',

    async buildStart() {
      // Only register .liquid and .schema.json with Rollup's watcher.
      // Do NOT register .js or .scss — Vite treats watched .js files as
      // modules, which disrupts the build when they change.
      const srcPath = resolve(process.cwd(), srcDir)
      const watchFiles = await glob(`${srcPath}/**/*.{liquid,schema.json}`)
      for (const file of watchFiles) {
        this.addWatchFile(file)
      }
    },

    async writeBundle() {
      // Run AFTER Vite writes its own assets, so our output is never overwritten
      await processLiquidFiles(srcDir, outDir)

      // Set up a separate fs watcher for .scss and .js files.
      // These don't go through Vite's pipeline — the plugin reads them
      // directly — so they need their own watcher to trigger rebuilds.
      // unref() allows the process to exit naturally for one-shot builds
      // while keeping the watcher alive during watch mode.
      if (!fsWatcherStarted && !process.env.CI) {
        fsWatcherStarted = true
        const srcPath = resolve(process.cwd(), srcDir)
        const dirsToWatch = [resolve(srcPath, 'components'), resolve(srcPath, 'blocks')]

        for (const dir of dirsToWatch) {
          if (!existsSync(dir)) continue
          const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.scss') || filename.endsWith('.js'))) {
              // Debounce to avoid rapid-fire rebuilds from editor save events
              clearTimeout(debounceTimer)
              debounceTimer = setTimeout(() => {
                processLiquidFiles(srcDir, outDir)
              }, 100)
            }
          })
          watcher.unref()
        }
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

    // Compile SCSS and inject {% stylesheet %} block
    const scssFile = resolve(componentDir, `${componentName}.scss`)
    if (existsSync(scssFile)) {
      const result = sass.compile(scssFile, {
        style: 'expanded',
        loadPaths: [resolve(process.cwd(), srcDir)],
      })
      const stylesheetBlock = `{% stylesheet %}\n${result.css}\n{% endstylesheet %}`
      if (liquidContent.includes(SCHEMA_INJECT_COMMENT)) {
        liquidContent = liquidContent.replace(SCHEMA_INJECT_COMMENT, `${stylesheetBlock}\n\n${SCHEMA_INJECT_COMMENT}`)
      } else {
        liquidContent = `${liquidContent}\n\n${stylesheetBlock}`
      }
    }

    // Inject JS as {% javascript %} block
    const jsFile = resolve(componentDir, `${componentName}.js`)
    if (existsSync(jsFile)) {
      const jsContent = readFileSync(jsFile, 'utf-8')
      const javascriptBlock = `{% javascript %}\n${jsContent}\n{% endjavascript %}`
      if (liquidContent.includes(SCHEMA_INJECT_COMMENT)) {
        liquidContent = liquidContent.replace(SCHEMA_INJECT_COMMENT, `${javascriptBlock}\n\n${SCHEMA_INJECT_COMMENT}`)
      } else {
        liquidContent = `${liquidContent}\n\n${javascriptBlock}`
      }
    }

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

    // Note: Do NOT skip _ prefixed blocks. In Shopify, _ prefix means
    // "private theme block" (hidden from @theme pickers). These must still
    // be compiled to shopify/blocks/. The _ skip is only for components
    // (line 46 above) where _ means shared snippets.

    const schemaFile = resolve(blockDir, `${blockName}.schema.json`)
    let liquidContent = readFileSync(liquidFile, 'utf-8')

    // Compile SCSS and inject {% stylesheet %} block
    const scssFile = resolve(blockDir, `${blockName}.scss`)
    if (existsSync(scssFile)) {
      const result = sass.compile(scssFile, {
        style: 'expanded',
        loadPaths: [resolve(process.cwd(), srcDir)],
      })
      const stylesheetBlock = `{% stylesheet %}\n${result.css}\n{% endstylesheet %}`
      if (liquidContent.includes(SCHEMA_INJECT_COMMENT)) {
        liquidContent = liquidContent.replace(SCHEMA_INJECT_COMMENT, `${stylesheetBlock}\n\n${SCHEMA_INJECT_COMMENT}`)
      } else {
        liquidContent = `${liquidContent}\n\n${stylesheetBlock}`
      }
    }

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

  // Process section groups (src/section-groups/*.json → shopify/sections/*.json)
  const sectionGroupsPath = resolve(process.cwd(), 'src/section-groups')
  const sectionGroupFiles = await glob(`${sectionGroupsPath}/*.json`)
  for (const groupFile of sectionGroupFiles) {
    const sectionsDir = resolve(outPath, 'sections')
    mkdirSync(sectionsDir, { recursive: true })
    copyFileSync(groupFile, resolve(sectionsDir, basename(groupFile)))
  }

  // Process static assets (src/assets/* → shopify/assets/*)
  const staticAssets = await glob(`${srcPath}/assets/*`)
  for (const assetFile of staticAssets) {
    const assetsDir = resolve(outPath, 'assets')
    mkdirSync(assetsDir, { recursive: true })
    copyFileSync(assetFile, resolve(assetsDir, basename(assetFile)))
  }
}
