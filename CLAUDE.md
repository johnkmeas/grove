# Grove — Agent Context

**Stack:** Shopify Skeleton theme base, Liquid, vanilla JS, nested BEM SCSS, Vue 3 islands, Shopify CLI, Vite

**What Grove is:** A Shopify Theme Store theme built on the official [Skeleton theme](https://github.com/Shopify/skeleton-theme). All visual design comes from merchant-edited settings and presets in the theme editor — never hardcoded. The Vite build pipeline compiles `src/` → `shopify/`.

## Rules

- **Work in `src/` only.** Never edit `shopify/` — it is a build artifact.
- **Built on Skeleton theme.** Dawn/Horizon patterns are NOT eligible for Theme Store. Do not introduce them.
- **Design is merchant-controlled.** All visual customisation (colours, fonts, spacing, layout) comes from theme settings and presets. Never hardcode visual design choices.
- **All design values from CSS custom properties.** Use `var(--spacing-*)`, `var(--type-*)`, `var(--motion-*)`, `var(--radius-*)` from `css-variables.liquid`. Never hardcode spacing, type sizes, or motion values in SCSS.
- **All merchant-facing strings via `{{ 'key' | t }}`.** Never hardcode text.
- **BEM always nested.** Never write `.block__element` as a top-level selector.
- **Max snippet nesting: 1 level** per component.
- **Vue only** in components marked `"js": "vue"` in `registry.json`.
- **No `import`/`export` in component JS.** Shopify's `{% javascript %}` wraps code in an IIFE. Component JS must be self-contained and self-initializing.
- **All compiled output must be human-readable.** No minification — theme store requirement. SCSS: `expanded`, Vite: `minify: false`.
- `src/templates/` and `src/config/` are **read-only** unless you are the `template-composer` or `theme-settings` agent.
- **Theme blocks use `block.settings`**, not `section.settings`. Blocks have no access to section scope.
- **Snippets in blocks must be fully parameterized** — pass all values explicitly via `{% render %}`. No reliance on ambient variables.
- **New sections SHOULD use `{ "type": "@theme" }` blocks.** Inline section blocks are deprecated for new development.
- **Block BEM prefix: `grove-`** — e.g. `.grove-heading`, `.grove-button`. Avoids collision with section classes.
- **No app-dependent features.** Wishlists, scheduling, discount codes, Instagram feeds etc. are not allowed (theme store rule).
- **No deceptive patterns.** No fake countdowns, fake stock levels, fake viewer counts (theme store rule).
- **Navigation and product form must work without JavaScript** (theme store rule).
- **Payment icons must use `enabled_payment_types`** + `payment_type_svg_tag` filter (theme store rule).

## Before Starting Any Task

1. Read `DECISIONS.md` — check before any structural change.
2. Read `KNOWN_AGENT_FAILURES.md` — avoid known failure patterns.
3. Check `src/components/registry.json` — see what exists before creating.
4. Check `src/blocks/registry.json` — see what blocks exist before creating.

## Performance Budget

See `.performance-budget.json`. Targets aligned with Shopify Theme Store requirements:
- Lighthouse performance: **60+ minimum** (averaged across product, collection, home pages)
- Lighthouse accessibility: **90+ minimum** (same pages)
- Minified JS bundle: **16KB or less**
- All compiled CSS/JS must be human-readable (no minification)

## Theme Store Key Requirements

- Built on Skeleton theme (Dawn/Horizon NOT eligible)
- Max 5 presets per theme
- `settings_data.json` max 1.5MB
- `/listings` folder required in theme zip for multi-preset themes
- Custom Liquid section + Custom Liquid blocks mandatory
- App blocks (`@app`) in product and featured-product sections
- Follow on Shop button, Shop Pay Installments, unit pricing required
- No external marketplace distribution (Theme Store exclusive)
- Support contact form + documentation link required

## Agent Roles

| Agent | Purpose |
|---|---|
| `component-builder` | Create and edit components in `src/components/[target]/` |
| `block-builder` | Create and edit theme blocks in `src/blocks/[target]/` |
| `schema-editor` | Edit `*.schema.json` only |
| `template-composer` | Compose page templates in `src/templates/` |
| `theme-settings` | Edit global settings in `src/config/` |
| `perf-auditor` | Review and flag performance/a11y issues |

## Build Commands

```
pnpm build                    # compile all
pnpm validate-schemas         # lint all *.schema.json
pnpm new-component [name]     # scaffold a new section component
pnpm new-component [name] --type block  # scaffold a new theme block
```
