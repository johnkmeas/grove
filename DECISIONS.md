# Architectural Decision Log

This file records significant architectural decisions. Read before making structural changes.

---

## ADR-001 — Vite Build Pipeline for Shopify Themes

**Date:** 2024-01-01
**Status:** Accepted

### Context

Needed a build pipeline that supports component-first Shopify theme development with SCSS compilation, JS injection, and schema management.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Build tool | Vite | First-class SCSS, JS, Vue support |
| JS default | Vanilla ES modules via `{% javascript %}` | Shopify-native, no manual script loading |
| JS interactive | Vue 3 islands | Cart drawer, filters, variant picker only |
| CSS convention | Nested BEM SCSS | Predictable, enforceable via Stylelint |
| Deploy target | `shopify/` is gitignored build artifact | Clean separation of source and output |
| SCSS delivery | `{% stylesheet %}` injection by build plugin | Shopify handles concatenation/delivery |
| JS delivery | `{% javascript %}` injection by build plugin | Same Shopify-managed delivery |
| SCSS compilation | `style: 'expanded'` | Human-readable output by default |

### Consequences

- Work exclusively in `src/`. The `shopify/` directory is never committed.
- Vite handles global JS/Vue compilation. Component JS/CSS is handled by the build plugin.
- Component `.js` files must be self-contained — no `import`/`export` (Shopify wraps in IIFE).
- Vue components are the exception — they go through Vite bundling.

---

## ADR-002 — Schema Versioning Convention

**Date:** 2024-01-01
**Status:** Accepted

### Context

Schema changes that remove or rename setting `id` fields cause merchant content loss on deployed themes.

### Decision

- Every `*.schema.json` file must include a `"_version"` field using semver format.
- `scripts/schema-diff.js` compares schema between branches and flags breaking changes.
- A breaking change is: removing a setting `id`, removing a block `type`, renaming a setting `id`.
- On breaking change: increment `_version` major, document migration path.

### Consequences

- `validate-schemas.js` fails the build if `_version` is missing.
- `schema-diff.js` can run in CI on every PR.

---

## ADR-003 — Shopify Theme Blocks

**Date:** 2026-03-08
**Status:** Accepted

### Context

Inline section settings prevent reuse. Shopify's Theme Blocks (`@theme` blocks) provide reusable content blocks that merchants can compose freely.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Block source | `src/blocks/[name]/` | Parallel to `src/components/`, keeps concerns separate |
| Block registry | `src/blocks/registry.json` | Separate from section registry |
| Build output | `shopify/blocks/[name].liquid` | Standard Shopify theme blocks directory |
| Section opt-in | `"blocks": [{ "type": "@theme" }]` | Standard Shopify theme block reference |
| Default for new sections | Theme blocks preferred | Inline section blocks still allowed |

### Consequences

- `src/blocks/` directory with its own registry.
- Build pipeline compiles blocks to `shopify/blocks/`.
- A section uses EITHER theme blocks OR inline section blocks, never both.

---

## ADR-004 — Horizon Base Theme for Custom Development

**Date:** 2026-07-27
**Status:** Accepted

### Context

The Grove project was built for Shopify Theme Store submission using the Skeleton theme. A separate project is needed for custom merchant theme development where Theme Store restrictions don't apply. The Horizon theme provides a richer starting point for custom themes.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Base theme | Shopify Horizon | Rich feature set, modern patterns, not constrained to Theme Store rules |
| Schema labels | Plain strings | No translation key requirement for custom themes |
| CSS values | Raw values allowed | Stylelint enforces BEM and property order but not design tokens |
| Minification | Disabled by default, optional | Human-readable output preferred for development |
| Snippets | `src/snippets/` + `src/components/_shared/` | Dedicated snippet dir for Horizon's snippet library |
| Build plugin | Renamed `vite-plugin-shopify-liquid` | Generic name, not tied to Grove |

### Consequences

- Horizon and Dawn patterns are valid — no Theme Store restrictions.
- Schema labels can be plain English strings, not translation keys.
- SCSS can use raw `px`, `rem`, hex colors, etc. — Stylelint only enforces structure (BEM, property order, nesting depth).
- `src/snippets/` is a new first-class directory for standalone snippets.
- The build pipeline is identical in mechanics but the linting and validation rules are relaxed.

---

*Add new ADRs below this line.*
