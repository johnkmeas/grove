#!/usr/bin/env node
/**
 * validate-schemas.js
 *
 * Validates all *.schema.json files against the Shopify section schema spec.
 * Runs before build and as a pre-commit hook.
 *
 * Usage:
 *   node scripts/validate-schemas.js
 *   node scripts/validate-schemas.js --staged   (lint-staged mode)
 *   node scripts/validate-schemas.js path/to/hero.schema.json
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, relative, sep } from 'path'
import { glob } from 'glob'

const args = process.argv.slice(2)
const specificFiles = args.filter((a) => !a.startsWith('--') && a.endsWith('.schema.json'))

const ROOT = process.cwd()

// Shopify schema field types
const VALID_FIELD_TYPES = new Set([
  'text',
  'textarea',
  'image_picker',
  'radio',
  'select',
  'checkbox',
  'number',
  'range',
  'color',
  'color_background',
  'color_scheme',
  'color_scheme_group',
  'font_picker',
  'collection',
  'collection_list',
  'product',
  'product_list',
  'blog',
  'page',
  'link_list',
  'url',
  'video',
  'video_url',
  'richtext',
  'inline_richtext',
  'html',
  'article',
  'metaobject',
  'metaobject_list',
  'header',
  'paragraph',
])

const errors = []
const warnings = []

function addError(file, message) {
  errors.push(`  ✗ ${relative(ROOT, file)}: ${message}`)
}

function addWarning(file, message) {
  warnings.push(`  ⚠ ${relative(ROOT, file)}: ${message}`)
}

/**
 * Check if a schema file is a block schema (lives under src/blocks/)
 */
function isBlockSchema(filePath) {
  return filePath.includes(`${sep}blocks${sep}`) || filePath.includes('/blocks/')
}

/**
 * Validate a single schema file
 */
function validateSchema(filePath) {
  let schema

  try {
    const content = readFileSync(filePath, 'utf-8')
    schema = JSON.parse(content)
  } catch (e) {
    addError(filePath, `Invalid JSON: ${e.message}`)
    return
  }

  const isBlock = isBlockSchema(filePath)

  // Required: name field
  if (!schema.name) {
    addError(filePath, 'Missing required field: name')
  }

  // Required: _version field (Grove convention)
  if (!schema._version) {
    addError(filePath, 'Missing required Grove field: _version (e.g. "1.0.0")')
  } else if (!/^\d+\.\d+\.\d+$/.test(schema._version)) {
    addError(filePath, `Invalid _version format "${schema._version}" — must be semver (e.g. "1.0.0")`)
  }

  // Validate settings array
  if (schema.settings) {
    if (!Array.isArray(schema.settings)) {
      addError(filePath, 'settings must be an array')
    } else {
      for (let i = 0; i < schema.settings.length; i++) {
        const setting = schema.settings[i]
        validateSetting(filePath, setting, `settings[${i}]`)
      }
    }
  }

  // Block-specific validation
  if (isBlock) {
    // Blocks must not have presets
    if (schema.presets) {
      addError(filePath, 'Block schemas must not have presets — presets belong on sections')
    }

    // Validate tag if present
    const validTags = new Set([null, 'div', 'section', 'article', 'aside', 'header', 'footer', 'li', 'p', 'span'])
    if (schema.tag !== undefined && !validTags.has(schema.tag)) {
      addError(filePath, `Invalid block tag "${schema.tag}" — must be null or a valid HTML element`)
    }

    // Validate limit if present
    if (schema.limit !== undefined && (typeof schema.limit !== 'number' || schema.limit < 1)) {
      addError(filePath, 'Block limit must be a positive number')
    }

    return
  }

  // Section-specific validation below

  // Validate blocks array
  if (schema.blocks) {
    if (!Array.isArray(schema.blocks)) {
      addError(filePath, 'blocks must be an array')
    } else {
      const hasThemeRef = schema.blocks.some((b) => b.type === '@theme')
      const hasAppRef = schema.blocks.some((b) => b.type === '@app')
      const hasInlineBlocks = schema.blocks.some((b) => b.type !== '@theme' && b.type !== '@app' && b.settings)

      // Cannot mix @theme blocks with inline section blocks
      if ((hasThemeRef || hasAppRef) && hasInlineBlocks) {
        addError(filePath, 'Cannot mix @theme/@app block references with inline section blocks')
      }

      for (let i = 0; i < schema.blocks.length; i++) {
        const block = schema.blocks[i]
        if (!block.type) {
          addError(filePath, `blocks[${i}] missing required field: type`)
        }

        // @theme and @app are valid block references without name
        if (block.type === '@theme' || block.type === '@app') {
          continue
        }

        // Theme block type references (no inline settings) don't require name —
        // Shopify resolves the name and settings from the theme block file.
        // Only true inline section blocks (those that define their own settings)
        // must have a name.
        if (block.settings) {
          if (!block.name) {
            addError(filePath, `blocks[${i}] missing required field: name`)
          }
          if (Array.isArray(block.settings)) {
            for (let j = 0; j < block.settings.length; j++) {
              validateSetting(filePath, block.settings[j], `blocks[${i}].settings[${j}]`)
            }
          }
        }
      }
    }
  }

  // Validate presets array
  if (schema.presets) {
    if (!Array.isArray(schema.presets)) {
      addError(filePath, 'presets must be an array')
    } else {
      for (let i = 0; i < schema.presets.length; i++) {
        if (!schema.presets[i].name) {
          addError(filePath, `presets[${i}] missing required field: name`)
        }
      }
    }
  }

  // max_blocks
  if (schema.max_blocks !== undefined && typeof schema.max_blocks !== 'number') {
    addError(filePath, 'max_blocks must be a number')
  }

  // Check for deprecated fields
  if (schema.class !== undefined) {
    addWarning(filePath, 'schema.class is deprecated — use CSS targeting instead')
  }
}

/**
 * Validate a single setting object
 */
function validateSetting(filePath, setting, path) {
  if (!setting.type) {
    addError(filePath, `${path} missing required field: type`)
    return
  }

  if (!VALID_FIELD_TYPES.has(setting.type)) {
    addError(filePath, `${path} has invalid type "${setting.type}"`)
    return
  }

  // Structural types don't need id/label
  if (setting.type === 'header' || setting.type === 'paragraph') {
    if (!setting.content) {
      addError(filePath, `${path} (type: ${setting.type}) missing required field: content`)
    }
    return
  }

  // All other types need id and label
  if (!setting.id) {
    addError(filePath, `${path} missing required field: id`)
  }
  if (!setting.label) {
    addError(filePath, `${path} missing required field: label`)
  }

  // Select and radio need options
  if ((setting.type === 'select' || setting.type === 'radio') && !setting.options) {
    addError(filePath, `${path} (type: ${setting.type}) missing required field: options`)
  }

  // Range needs min, max, step
  if (setting.type === 'range') {
    if (setting.min === undefined) addError(filePath, `${path} (type: range) missing required field: min`)
    if (setting.max === undefined) addError(filePath, `${path} (type: range) missing required field: max`)
    if (setting.step === undefined) addError(filePath, `${path} (type: range) missing required field: step`)
  }
}

async function run() {
  let filesToValidate = specificFiles

  if (filesToValidate.length === 0) {
    filesToValidate = await glob(`${ROOT}/src/**/*.schema.json`)
  }

  if (filesToValidate.length === 0) {
    console.log('No schema files found.')
    process.exit(0)
  }

  console.log(`Validating ${filesToValidate.length} schema file(s)...\n`)

  for (const file of filesToValidate) {
    const absPath = existsSync(file) ? file : resolve(ROOT, file)
    if (existsSync(absPath)) {
      validateSchema(absPath)
    } else {
      addError(absPath, 'File not found')
    }
  }

  if (warnings.length > 0) {
    console.log('Warnings:')
    warnings.forEach((w) => console.log(w))
    console.log()
  }

  if (errors.length > 0) {
    console.error('Schema validation errors:')
    errors.forEach((e) => console.error(e))
    console.error(`\n✗ ${errors.length} error(s) found. Fix before building.`)
    process.exit(1)
  }

  console.log(`✓ All schemas valid (${filesToValidate.length} file(s) checked)`)
}

run()
