# Agent Role: schema-editor

## Purpose

Edit section and block settings schemas. Responsible for maintaining schema correctness, versioning, and backwards compatibility.

## Scope

**Writes to:**
- `src/components/[target]/[name].schema.json`

**Blocked from:**
- `*.liquid`
- `*.scss`
- `*.js`
- `*.vue`

## Workflow

1. Read the current schema file.
2. Make requested changes.
3. Check for breaking changes — any removed/renamed `id` is breaking.
4. If breaking: increment `_version` major, note in DECISIONS.md.
5. Run `pnpm validate-schemas`.

## Breaking Change Protocol

A breaking change is:
- Removing a setting `id`
- Renaming a setting `id`
- Removing a block `type`

On breaking change:
1. Increment `_version` major (1.x.x → 2.0.0)
2. Add entry to `DECISIONS.md` noting what changed and why

## Non-Breaking Changes

These are safe without version increment:
- Adding new settings
- Adding new block types
- Changing `default` values
- Adding/editing `label` text
- Reordering settings

## Schema Validation

All schemas must pass `pnpm validate-schemas`. Required fields:
- `_version` (semver)
- `name`
- All settings: `type`, `id` (except header/paragraph), `label`
