#!/usr/bin/env node
/**
 * schema-diff.js
 *
 * Detects breaking changes in *.schema.json files between two git branches/commits.
 * A breaking change is any removal or rename of a setting id, block type, or version bump.
 *
 * Usage:
 *   node scripts/schema-diff.js                    (compare HEAD to main)
 *   node scripts/schema-diff.js --base main        (compare HEAD to main)
 *   node scripts/schema-diff.js --base HEAD~1      (compare HEAD to previous commit)
 *   node scripts/schema-diff.js --base abc123      (compare HEAD to specific commit)
 */

import { execSync } from 'child_process'
import { resolve } from 'path'

const args = process.argv.slice(2)
const baseIndex = args.indexOf('--base')
const base = baseIndex !== -1 ? args[baseIndex + 1] : 'main'
const head = 'HEAD'

const ROOT = process.cwd()

/**
 * Get the content of a file at a specific git ref
 */
function getFileAtRef(ref, filePath) {
  try {
    const relPath = filePath.startsWith(ROOT) ? filePath.slice(ROOT.length + 1) : filePath
    const content = execSync(`git show ${ref}:${relPath}`, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return JSON.parse(content)
  } catch {
    return null
  }
}

/**
 * Get all schema files tracked by git at a given ref
 */
function getSchemaFilesAtRef(ref) {
  try {
    const output = execSync(`git ls-tree -r --name-only ${ref}`, {
      cwd: ROOT,
      encoding: 'utf-8',
    })
    return output
      .split('\n')
      .filter((f) => f.endsWith('.schema.json'))
      .map((f) => resolve(ROOT, f))
  } catch {
    return []
  }
}

/**
 * Extract setting ids from a schema
 */
function getSettingIds(schema) {
  const ids = new Set()

  if (schema.settings) {
    for (const s of schema.settings) {
      if (s.id) ids.add(s.id)
    }
  }

  return ids
}

/**
 * Extract block types from a schema
 */
function getBlockTypes(schema) {
  const types = new Set()
  if (schema.blocks) {
    for (const b of schema.blocks) {
      if (b.type) types.add(b.type)
    }
  }
  return types
}

/**
 * Extract block setting ids, keyed by block type
 */
function getBlockSettingIds(schema) {
  const result = {}
  if (schema.blocks) {
    for (const block of schema.blocks) {
      if (!block.type) continue
      result[block.type] = new Set()
      if (block.settings) {
        for (const s of block.settings) {
          if (s.id) result[block.type].add(s.id)
        }
      }
    }
  }
  return result
}

function detectBreakingChanges(filePath, oldSchema, newSchema) {
  const breaking = []
  const warnings = []

  // Version change
  if (oldSchema._version && newSchema._version && oldSchema._version !== newSchema._version) {
    warnings.push(`_version changed: ${oldSchema._version} → ${newSchema._version}`)
  }

  // Removed top-level settings
  const oldSettingIds = getSettingIds(oldSchema)
  const newSettingIds = getSettingIds(newSchema)
  for (const id of oldSettingIds) {
    if (!newSettingIds.has(id)) {
      breaking.push(`Removed setting id: "${id}" — existing content using this setting will lose data`)
    }
  }

  // Removed block types
  const oldBlockTypes = getBlockTypes(oldSchema)
  const newBlockTypes = getBlockTypes(newSchema)
  for (const type of oldBlockTypes) {
    if (!newBlockTypes.has(type)) {
      breaking.push(`Removed block type: "${type}" — existing blocks of this type will be lost`)
    }
  }

  // Removed settings within blocks
  const oldBlockSettings = getBlockSettingIds(oldSchema)
  const newBlockSettings = getBlockSettingIds(newSchema)
  for (const blockType of Object.keys(oldBlockSettings)) {
    if (!newBlockSettings[blockType]) continue
    for (const id of oldBlockSettings[blockType]) {
      if (!newBlockSettings[blockType].has(id)) {
        breaking.push(`Removed setting id "${id}" from block "${blockType}"`)
      }
    }
  }

  return { breaking, warnings }
}

function run() {
  console.log(`Comparing schemas: ${base} → ${head}\n`)

  const headFiles = getSchemaFilesAtRef(head)

  if (headFiles.length === 0) {
    console.log('No schema files found in HEAD.')
    process.exit(0)
  }

  let totalBreaking = 0
  let totalWarnings = 0
  const report = []

  for (const filePath of headFiles) {
    const relPath = filePath.startsWith(ROOT) ? filePath.slice(ROOT.length + 1) : filePath
    const oldSchema = getFileAtRef(base, filePath)
    const newSchema = getFileAtRef(head, filePath)

    if (!oldSchema) {
      // New file — not a breaking change
      report.push({ file: relPath, status: 'new', breaking: [], warnings: [] })
      continue
    }

    if (!newSchema) {
      report.push({
        file: relPath,
        status: 'deleted',
        breaking: ['Schema file deleted — all content using this section will lose settings'],
        warnings: [],
      })
      totalBreaking++
      continue
    }

    const { breaking, warnings } = detectBreakingChanges(filePath, oldSchema, newSchema)
    totalBreaking += breaking.length
    totalWarnings += warnings.length
    report.push({ file: relPath, status: 'modified', breaking, warnings })
  }

  // Print report
  for (const entry of report) {
    if (entry.status === 'new') {
      console.log(`  ✦ ${entry.file} (new)`)
      continue
    }
    if (entry.breaking.length === 0 && entry.warnings.length === 0) continue

    console.log(`  ${entry.file}`)
    for (const b of entry.breaking) {
      console.error(`    ✗ BREAKING: ${b}`)
    }
    for (const w of entry.warnings) {
      console.warn(`    ⚠ WARNING: ${w}`)
    }
  }

  console.log()

  if (totalBreaking > 0) {
    console.error(`✗ ${totalBreaking} breaking schema change(s) detected.`)
    console.error('  Breaking changes will cause merchant content loss. Increment _version and migrate.')
    process.exit(1)
  }

  if (totalWarnings > 0) {
    console.warn(`⚠ ${totalWarnings} schema warning(s). Review before merging.`)
  } else {
    console.log('✓ No breaking schema changes detected.')
  }
}

run()
