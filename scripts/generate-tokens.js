#!/usr/bin/env node
/**
 * generate-tokens.js
 *
 * Merges src/tokens/base/ with src/tokens/themes/[preset]/
 * and outputs shopify/assets/tokens.css as CSS custom properties.
 *
 * Usage:
 *   node scripts/generate-tokens.js
 *   node scripts/generate-tokens.js --preset minimal
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

const args = process.argv.slice(2)
const presetIndex = args.indexOf('--preset')
const preset = presetIndex !== -1 ? args[presetIndex + 1] : 'default'

const ROOT = process.cwd()
const BASE_TOKENS_DIR = resolve(ROOT, 'src/tokens/base')
const THEME_TOKENS_DIR = resolve(ROOT, `src/tokens/themes/${preset}`)
const OUTPUT_DIR = resolve(ROOT, 'shopify/assets')
const OUTPUT_FILE = resolve(OUTPUT_DIR, 'tokens.css')

/**
 * Deep merge two objects
 */
function deepMerge(base, override) {
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (
      typeof override[key] === 'object' &&
      override[key] !== null &&
      !Array.isArray(override[key]) &&
      typeof base[key] === 'object' &&
      base[key] !== null
    ) {
      result[key] = deepMerge(base[key], override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

/**
 * Load all JSON files from a directory into a merged object
 */
function loadTokenDir(dir) {
  if (!existsSync(dir)) return {}

  const files = glob.sync(`${dir}/*.json`)
  let tokens = {}

  for (const file of files) {
    const content = JSON.parse(readFileSync(file, 'utf-8'))
    tokens = deepMerge(tokens, content)
  }

  return tokens
}

/**
 * Flatten a nested token object into CSS custom property declarations
 * Input:  { colors: { primary: '#000', surface: '#fff' } }
 * Output: ['--grove-colors-primary: #000', '--grove-colors-surface: #fff']
 */
function flattenTokens(obj, prefix = '--grove') {
  const declarations = []

  for (const [key, value] of Object.entries(obj)) {
    const varName = `${prefix}-${key}`

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      declarations.push(...flattenTokens(value, varName))
    } else {
      declarations.push(`  ${varName}: ${value};`)
    }
  }

  return declarations
}

/**
 * Generate the tokens.css file
 */
function generateTokens() {
  console.log(`Generating tokens for preset: ${preset}`)

  // Load base tokens
  const baseTokens = loadTokenDir(BASE_TOKENS_DIR)

  // Load and merge preset overrides
  const themeTokens = loadTokenDir(THEME_TOKENS_DIR)
  const mergedTokens = deepMerge(baseTokens, themeTokens)

  // Flatten to CSS custom properties
  const declarations = flattenTokens(mergedTokens)

  const css = `/**
 * Grove Design Tokens
 * Preset: ${preset}
 * Generated: ${new Date().toISOString()}
 *
 * DO NOT EDIT — auto-generated from src/tokens/
 * Source: src/tokens/base/ + src/tokens/themes/${preset}/
 */

:root {
${declarations.join('\n')}
}
`

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true })
  writeFileSync(OUTPUT_FILE, css)

  console.log(`✓ tokens.css written to ${OUTPUT_FILE}`)
  console.log(`  ${declarations.length} custom properties generated`)
}

generateTokens()
