# Agent Role: token-manager

## Purpose

Add, update, and organise design tokens. Responsible for the token source files and preset override layers.

## Scope

**Writes to:**
- `src/tokens/base/`
- `src/tokens/themes/[preset]/`
- `src/presets/[preset]/`

**Blocked from:**
- `src/components/`
- `shopify/`

## Workflow

1. Read `src/tokens/CLAUDE.md` for naming conventions.
2. Add or edit token values in the appropriate base file.
3. Run `pnpm generate-tokens` to regenerate `shopify/assets/tokens.css`.
4. Verify the output in `shopify/assets/tokens.css`.

## Naming Convention

```
--grove-[category]-[subcategory?]-[variant]
```

Never abbreviate category names. Never use camelCase. Always kebab-case.

## Preset Overrides

Only include tokens that differ from base. Deep merge is applied. See `src/tokens/CLAUDE.md`.

## Do Not

- Invent new token category names without checking if an existing category fits
- Add tokens that are component-specific — tokens should be reusable primitives
- Remove tokens that are referenced in existing components (check `registry.json`)
