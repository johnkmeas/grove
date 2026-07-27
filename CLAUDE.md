# Horizon Vite — Agent Context

**Stack:** Shopify Horizon theme base, Liquid, vanilla JS, nested BEM SCSS, Vue 3 islands, Shopify CLI, Vite

**What this is:** A Vite-powered dev workflow for building custom Shopify themes on top of the Horizon theme boilerplate. The Vite build pipeline compiles `src/` into `shopify/`. This is for custom merchant themes — not Theme Store submissions.

## Rules

- **Work in `src/` only.** Never edit `shopify/` — it is a build artifact.
- **Based on Horizon theme.** Horizon and Dawn patterns are valid. Use them freely.
- **BEM always nested.** Never write `.block__element` as a top-level selector.
- **Max snippet nesting: 1 level** per component.
- **Vue only** in components marked `"js": "vue"` in `registry.json`.
- **No `import`/`export` in component JS.** Shopify's `{% javascript %}` wraps code in an IIFE. Component JS must be self-contained and self-initializing.
- **Schema labels are plain strings.** No translation key requirements — use human-readable labels directly (e.g. `"label": "Heading"` not `"label": "t:sections.heading.label"`).
- **Theme blocks use `block.settings`**, not `section.settings`. Blocks have no access to section scope.
- **Snippets in blocks must be fully parameterized** — pass all values explicitly via `{% render %}`.
- **New sections SHOULD use `{ "type": "@theme" }` blocks.** Inline section blocks are fine but theme blocks are preferred.

## Project Structure

```
src/
  components/         # Sections — each dir compiles to shopify/sections/*.liquid
    [name]/
      index.liquid        # Markup with <!-- SCHEMA_INJECT --> placeholder
      [name].schema.json  # Settings schema (plain string labels)
      [name].scss         # Scoped BEM styles
      [name].js           # Self-contained JS (or .vue for reactive)
    _shared/              # Shared snippets → shopify/snippets/
  blocks/             # Theme blocks → shopify/blocks/*.liquid
  snippets/           # Standalone snippets → shopify/snippets/
  layout/             # Layout files → shopify/layout/
  templates/          # JSON/Liquid templates → shopify/templates/
  config/             # Theme config → shopify/config/
  locales/            # Locale files → shopify/locales/
  section-groups/     # Section groups → shopify/sections/*.json
  assets/             # Static assets → shopify/assets/
  fixtures/           # Mock data for local Liquid rendering
  theme.js            # Global JS entry (imports theme.scss)
  theme.scss          # Global styles
```

## Before Starting Any Task

1. Read `DECISIONS.md` — check before any structural change.
2. Check `src/components/registry.json` — see what exists before creating.
3. Check `src/blocks/registry.json` — see what blocks exist before creating.

## Build Commands

```
pnpm build                    # compile all
pnpm dev                      # watch build + shopify theme dev
pnpm validate-schemas         # lint all *.schema.json
pnpm new-component [name]     # scaffold a new section component
pnpm new-component [name] --type block  # scaffold a new theme block
pnpm new-component [name] --vue        # scaffold with Vue island
pnpm lint                     # run all linters
pnpm render [name] --fixture product   # dry-render a component
```

## How the Build Works

The Vite plugin (`plugins/vite-plugin-shopify-liquid.js`) runs after Vite writes its assets:

1. For each `src/components/[name]/index.liquid`:
   - Compiles `[name].scss` → injects as `{% stylesheet %}`
   - Reads `[name].js` → injects as `{% javascript %}`
   - Reads `[name].schema.json` → strips `_version` → injects as `{% schema %}`
   - Writes result to `shopify/sections/[name].liquid`

2. Same process for `src/blocks/[name]/index.liquid` → `shopify/blocks/`

3. Copies snippets, layout, templates, config, locales, section-groups, and assets directly.

Vue `.vue` files are bundled by Vite as ES modules → `shopify/assets/`.

## Component JS Rules

Component JS is injected into `{% javascript %}` tags. Shopify wraps this in an IIFE, so:

- **No `import` statements** — code must be self-contained
- **No `export` statements** — IIFE scope makes exports a syntax error
- **Self-initializing** — use `document.querySelectorAll('.block').forEach(...)` at the bottom
- If a component needs module imports, use Vue (`"js": "vue"` in registry)

## Performance Budget

See `.performance-budget.json`. Targets:
- Lighthouse performance: **60+ minimum**
- Lighthouse accessibility: **90+ minimum**
- Compiled output is human-readable by default (no minification)
