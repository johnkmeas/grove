/**
 * vite-plugin-shopify-liquid
 *
 * Handles .liquid files in the Shopify theme build pipeline:
 * - Compiles SCSS per component/block and injects as {% stylesheet %} block
 * - Injects JS as {% javascript %} block
 * - Reads *.schema.json and injects as {% schema %} block
 * - Copies Liquid files to the correct Shopify theme directories
 */

import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, watch } from 'fs'
import { resolve, dirname, basename, relative } from 'path'
import { glob } from 'glob'
import * as sass from 'sass'

const SCHEMA_INJECT_COMMENT = '<!-- SCHEMA_INJECT -->'

export default function shopifyLiquidPlugin(options = {}) {
  const { srcDir = 'src', outDir = 'shopify' } = options
  let fsWatcherStarted = false
  let debounceTimer = null

  return {
    name: 'vite-plugin-shopify-liquid',
    apply: 'build',

    async buildStart() {
      const srcPath = resolve(process.cwd(), srcDir)
      const watchFiles = await glob(`${srcPath}/**/*.{liquid,schema.json}`)
      for (const file of watchFiles) {
        this.addWatchFile(file)
      }
    },

    async writeBundle() {
      await processLiquidFiles(srcDir, outDir)

      if (!fsWatcherStarted && !process.env.CI) {
        fsWatcherStarted = true
        const srcPath = resolve(process.cwd(), srcDir)
        const dirsToWatch = [resolve(srcPath, 'components'), resolve(srcPath, 'blocks')]

        for (const dir of dirsToWatch) {
          if (!existsSync(dir)) continue
          const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.scss') || filename.endsWith('.js'))) {
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

    if (componentName.startsWith('_')) continue

    const schemaFile = resolve(componentDir, `${componentName}.schema.json`)
    let liquidContent = readFileSync(liquidFile, 'utf-8')

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

    const sectionsDir = resolve(outPath, 'sections')
    mkdirSync(sectionsDir, { recursive: true })
    writeFileSync(resolve(sectionsDir, `${componentName}.liquid`), liquidContent)
  }

  // Process theme blocks (src/blocks/*/index.liquid)
  const blockFiles = await glob(`${srcPath}/blocks/*/index.liquid`)
  for (const liquidFile of blockFiles) {
    const blockDir = dirname(liquidFile)
    const blockName = basename(blockDir)

    const schemaFile = resolve(blockDir, `${blockName}.schema.json`)
    let liquidContent = readFileSync(liquidFile, 'utf-8')

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

    const blocksDir = resolve(outPath, 'blocks')
    mkdirSync(blocksDir, { recursive: true })
    writeFileSync(resolve(blocksDir, `${blockName}.liquid`), liquidContent)
  }

  // Process snippets from src/snippets/
  const snippetFiles = await glob(`${srcPath}/snippets/*.liquid`)
  for (const snippetFile of snippetFiles) {
    const snippetsDir = resolve(outPath, 'snippets')
    mkdirSync(snippetsDir, { recursive: true })
    copyFileSync(snippetFile, resolve(snippetsDir, basename(snippetFile)))
  }

  // Process shared snippets from component _shared dirs
  const sharedSnippets = await glob(`${srcPath}/components/_shared/*.liquid`)
  for (const snippetFile of sharedSnippets) {
    const snippetsDir = resolve(outPath, 'snippets')
    mkdirSync(snippetsDir, { recursive: true })
    copyFileSync(snippetFile, resolve(snippetsDir, basename(snippetFile)))
  }

  // Process layout files
  const layoutFiles = await glob(`${srcPath}/layout/*.liquid`)
  for (const layoutFile of layoutFiles) {
    const layoutDir = resolve(outPath, 'layout')
    mkdirSync(layoutDir, { recursive: true })
    copyFileSync(layoutFile, resolve(layoutDir, basename(layoutFile)))
  }

  // Process templates
  const templateFiles = await glob(`${srcPath}/templates/**/*.{json,liquid}`)
  for (const templateFile of templateFiles) {
    const relPath = relative(resolve(srcPath, 'templates'), templateFile)
    const destFile = resolve(outPath, 'templates', relPath)
    mkdirSync(dirname(destFile), { recursive: true })
    copyFileSync(templateFile, destFile)
  }

  // Process config
  const configFiles = await glob(`${srcPath}/config/*.json`)
  for (const configFile of configFiles) {
    const configDir = resolve(outPath, 'config')
    mkdirSync(configDir, { recursive: true })
    copyFileSync(configFile, resolve(configDir, basename(configFile)))
  }

  // Process locales
  const localeFiles = await glob(`${srcPath}/locales/*.json`)
  for (const localeFile of localeFiles) {
    const localesDir = resolve(outPath, 'locales')
    mkdirSync(localesDir, { recursive: true })
    copyFileSync(localeFile, resolve(localesDir, basename(localeFile)))
  }

  // Process section groups
  const sectionGroupsPath = resolve(process.cwd(), 'src/section-groups')
  const sectionGroupFiles = await glob(`${sectionGroupsPath}/*.json`)
  for (const groupFile of sectionGroupFiles) {
    const sectionsDir = resolve(outPath, 'sections')
    mkdirSync(sectionsDir, { recursive: true })
    copyFileSync(groupFile, resolve(sectionsDir, basename(groupFile)))
  }

  // Process static assets
  const staticAssets = await glob(`${srcPath}/assets/*`)
  for (const assetFile of staticAssets) {
    const assetsDir = resolve(outPath, 'assets')
    mkdirSync(assetsDir, { recursive: true })
    copyFileSync(assetFile, resolve(assetsDir, basename(assetFile)))
  }
}
