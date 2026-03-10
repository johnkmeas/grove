# Component Authoring Rules

## BEM Convention

- **Always nest** using `&__` and `&--` — never write `.block__element` as a top-level selector.
- **Max 3 levels:** block → element → modifier.
- One blank line between nested blocks.
- Modifiers belong on the element they modify, not the block.

```scss
// ✅ Correct
.hero {
  &__heading { }
  &__heading--large { }
}

// ❌ Wrong — flat selectors
.hero__heading { }
.hero__heading--large { }
```

## Required Files Per Component

Every component directory must contain:
- `index.liquid` — section markup with `<!-- SCHEMA_INJECT -->` comment
- `[name].schema.json` — settings schema with `_version` field
- `[name].scss` — scoped BEM styles, tokens only
- `[name].js` OR `[name].vue` — behaviour (Vue only if `"js": "vue"` in registry). See JS rules below.
- `[name].md` — component spec (see `docs/component-spec-template.md`)

## Schema Conventions

- Always include `"_version": "1.0.0"` in every schema.
- Use `header` settings to group related settings visually.
- Never hardcode merchant-facing text — use the `label` field, not `default` for copy.
- Increment `_version` on any breaking change (removed/renamed setting `id`).

## Snippets

- **Private snippets** (`_name.liquid`): component-specific, live in the component folder, copied to `shopify/snippets/`.
- **Shared snippets** (`_shared/name.liquid`): reused across components, live in `src/components/_shared/`.
- Max 1 level of snippet nesting per component.

## Registry

Every new component must be added to `src/components/registry.json`. The scaffold script does this automatically. If creating manually, copy the schema from an existing entry.

## Strings

All merchant-facing strings must use `{{ 'component.key' | t }}`. Never hardcode text that a merchant might want to customise or translate.

## Component JS Rules

Component JS is injected into `{% javascript %}` tags by the build plugin. Shopify wraps this in an IIFE, so:

- **No `import` statements** — code must be self-contained
- **No `export` statements** — IIFE scope makes exports a syntax error
- **Self-initializing** — use `document.querySelectorAll('.block').forEach(...)` at the bottom
- **No SCSS imports** — SCSS is compiled separately by the plugin into `{% stylesheet %}`
- If a component needs module imports, use Vue (`"js": "vue"` in registry) — Vue components are bundled by Vite

```js
// ✅ Correct — self-contained, self-initializing
class HeroSection {
  constructor(el) { /* ... */ }
}
document.querySelectorAll('.hero').forEach((el) => {
  new HeroSection(el)
})

// ❌ Wrong — export causes runtime SyntaxError
export { HeroSection }

// ❌ Wrong — import not available in IIFE
import { debounce } from './utils.js'
```

## Dry-Run Rendering

After editing Liquid, verify output with:
```
pnpm render [component-name] --fixture [product|collection|cart|customer]
```
