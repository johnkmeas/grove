# Architectural Decision Log

This file records significant architectural decisions for Grove. Read before making structural changes.

---

## ADR-001 — Initial Architecture

**Date:** 2024-01-01
**Status:** Accepted

### Context

Needed a framework foundation for component-first Shopify theme development optimised for AI agent workflows.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Repo structure | Single theme | No monorepo complexity |
| Build tool | Vite | First-class SCSS, JS, Vue support |
| JS default | Vanilla ES modules | Lighthouse score, theme store compliance |
| JS interactive | Vue 3 islands | Cart drawer, filters, variant picker only |
| CSS convention | Nested BEM SCSS | Agent-predictable, enforceable via Stylelint |
| CI platform | GitHub Actions | Standard, Shopify CLI integrates cleanly |
| Deploy target | CI pipeline only | `shopify/` gitignored, build artifact only |
| Design values | Static CSS custom properties in `css-variables.liquid` | No build pipeline; merchant settings for colours/fonts, static vars for spacing/motion/radii |
| Presets | Shopify `settings_data.json` only | Native Shopify mechanism, no separate token layer |
| Theme store | Full compliance target | 100+ variants, app blocks, a11y, Lighthouse 90+ |

### Consequences

- Agents work exclusively in `src/`. The `shopify/` directory is never committed.
- Vite handles multi-entry JS compilation. One entry per component.
- CSS custom properties from `css-variables.liquid` are the preferred values in SCSS for spacing, motion, and radii.
- Vue 3 is only introduced in components explicitly marked `"js": "vue"` in `registry.json`.

---

## ADR-002 — Schema Versioning Convention

**Date:** 2024-01-01
**Status:** Accepted

### Context

Schema changes that remove or rename setting `id` fields cause permanent merchant content loss. Needed a way to detect and flag these.

### Decision

- Every `*.schema.json` file must include a `"_version"` field using semver format.
- `scripts/schema-diff.js` compares schema between branches and flags breaking changes.
- A breaking change is: removing a setting `id`, removing a block `type`, renaming a setting `id`.
- On breaking change: increment `_version` major, document migration path in DECISIONS.md.

### Consequences

- `validate-schemas.js` fails the build if `_version` is missing.
- `schema-diff.js` runs in CI on every PR to main.

---

## ADR-003 — Locale-First Strings

**Date:** 2024-01-01
**Status:** Accepted

### Context

Hardcoded strings in Liquid are a theme store rejection risk and prevent merchant translation.

### Decision

All merchant-facing strings use `{{ 'component.key' | t }}`. Never hardcode text. Locale files live in `shopify/locales/`.

### Consequences

- Agents must use the `t` filter. Stylelint cannot enforce this — it is a code review rule.
- `KNOWN_AGENT_FAILURES.md` tracks instances of agents hardcoding strings.

---

## ADR-004 — Shopify Theme Blocks

**Date:** 2026-03-08
**Status:** Accepted

### Context

Grove currently inlines all content as section-level settings (heading, subheading, button). This prevents reuse — the same heading/button patterns must be duplicated in every section. Shopify's Theme Blocks (`@theme` blocks) provide reusable content blocks that merchants can compose freely into any section that opts in.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Block source | `src/blocks/[name]/` | Parallel to `src/components/`, keeps concerns separate |
| Block registry | `src/blocks/registry.json` | Separate from section registry — different schema shape and lifecycle |
| Build output | `shopify/blocks/[name].liquid` | Standard Shopify theme blocks directory |
| Block CSS | `grove-[name]` BEM prefix | Avoids collision with section-level classes |
| Section opt-in | `"blocks": [{ "type": "@theme" }]` | Standard Shopify theme block reference |
| Default for new sections | Theme blocks | Inline section blocks deprecated for new development |
| Migration | Incremental, per-section | Existing sections keep working as-is |
| Snippets in blocks | Allowed if fully parameterized | `{% render %}` creates isolated scope; snippet must not rely on ambient variables |

### Consequences

- New `src/blocks/` directory with its own registry.
- Build pipeline extended to compile blocks to `shopify/blocks/`.
- `validate-schemas.js` updated to understand `@theme`/`@app` block types and block schemas.
- `new-component.js` gains `--type block` flag.
- A section uses EITHER theme blocks OR inline section blocks, never both.
- Existing sections continue to work unchanged. Migration is atomic per section.

---

## ADR-005 — Shopify Theme Block Patterns Reference

**Date:** 2026-03-09
**Status:** Accepted

### Context

Multiple failed attempts to fix hero section blocks in the theme editor revealed gaps in understanding of Shopify's theme block system. This ADR documents the correct patterns based on [Shopify's official documentation](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks).

### Shopify Theme Block Targeting Patterns

| Pattern | Schema | Behavior |
|---|---|---|
| Accept all blocks | `[{ "type": "@theme" }]` | All public blocks appear in picker |
| Target specific blocks | `[{ "type": "heading" }, { "type": "button" }]` | Only listed blocks appear |
| Recommend blocks | `[{ "type": "@theme" }, { "type": "heading" }]` | Listed blocks highlighted, others via "Show all" |
| Private blocks | `[{ "type": "_slide" }]` | File is `_slide.liquid`; hidden from `@theme` pickers |
| Static blocks | `{% content_for "block", type: "x", id: "x" %}` | Fixed position, not deletable by merchant |
| Accept app blocks | `[{ "type": "@app" }]` | Enables app blocks in section |

### Key Rules

- **`@theme` is NOT mandatory.** Targeting specific blocks by type works without it.
- **Underscore prefix is NOT mandatory.** It only controls visibility in `@theme` sections (private vs public).
- **Block type = block filename** (without `.liquid`). E.g., `blocks/heading.liquid` → type `heading`.
- **Blocks need `presets`** in their schema to appear in the block picker.
- **JSON templates need `blocks` + `block_order`** keys for the block picker to activate in the editor.
- **No mixing:** A section uses EITHER theme blocks OR inline section blocks, never both.
- **Nesting:** Up to 8 levels deep via `{% content_for 'blocks' %}` in block templates.

### Documentation Links

- [Quick start](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/quick-start)
- [Block schema](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/schema)
- [Targeting](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/targeting)
- [Static blocks](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/static-blocks)

### Consequences

- ADR-004's `"blocks": [{ "type": "@theme" }]` is the DEFAULT pattern, not the only valid one.
- Agents must check JSON template `blocks`/`block_order` keys before assuming a schema issue.
- Build plugin must compile `_`-prefixed block directories (Shopify private blocks convention).

---

## ADR-006 — Horizon-Style Asset Loading

**Date:** 2026-03-10
**Status:** Accepted

### Context

Component CSS was never compiled (SCSS files existed but were not imported), JS output to invalid subdirectories, and no section loaded its own assets. Needed a pattern that works with Shopify's asset delivery and meets theme store editability requirements.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Component CSS delivery | `{% stylesheet %}` tags in Liquid | Shopify handles concatenation/delivery via `content_for_header` |
| Component JS delivery | `{% javascript %}` tags in Liquid | Same Shopify-managed delivery, no manual `<script>` tags needed |
| SCSS compilation | Build plugin, `style: 'expanded'` | Human-readable output required for theme store |
| JS minification | Disabled (`minify: false`) | Same theme store editability requirement |
| Vite scope | Global assets only (`theme.js`, `theme.css`, Vue islands) | Component JS/CSS handled by build plugin |
| Asset directory | Flat `shopify/assets/`, no subdirectories | Shopify requirement |

### Consequences

- `plugins/vite-plugin-grove-liquid.js` compiles SCSS and injects both `{% stylesheet %}` and `{% javascript %}` blocks.
- Component `.js` files must be self-contained — no `import`/`export` (Shopify wraps in IIFE).
- Vue components are the exception — they still go through Vite bundling (need module imports).
- Vite no longer has component JS entries. Only `theme.js` and Vue entries remain.
- All compiled output in `shopify/` is human-readable and editable by merchants.

---

## ADR-007 — Skeleton Theme Migration

**Date:** 2026-03-15
**Status:** Accepted

### Context

Shopify updated Theme Store requirements (effective May 15, 2025): the Skeleton theme is now the only approved codebase for new Theme Store submissions. Themes built on or derived from Dawn or Horizon are no longer eligible. Grove's original custom components needed to be replaced with Skeleton-based patterns to ensure theme store eligibility.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Base theme | Shopify Skeleton theme | Only approved codebase for new submissions |
| Migration strategy | Full replacement | Clean slate using Skeleton patterns, no Dawn/Horizon remnants |
| Component structure | Keep Grove's co-located `src/` pattern | Skeleton provides patterns; Grove provides build pipeline |
| Design authority | Merchant settings + presets | All visual customisation via theme editor, not hardcoded |
| Hero component | Replaced with header + hello-world | Skeleton patterns preferred over custom hero |
| Performance targets | Lighthouse perf 60+, a11y 90+ | Aligned with actual Shopify Theme Store minimums |
| JS bundle size | 16KB minified maximum | Shopify Theme Store requirement |
| Preset limit | Max 5 presets | Shopify Theme Store limit |
| Listings folder | `/listings/[preset]/` in theme zip | Required for multi-preset submissions (effective May 2025) |

### Consequences

- All 14 base sections now follow Skeleton theme patterns.
- Performance budget updated: Lighthouse perf 60+ (not 90+), a11y 90+ (not 95+).
- JS bundle budget reduced from 80KB total to 16KB minified.
- Theme zip must include `/listings` folder for multi-preset themes.
- Demo stores must match preset industry/catalog tags.
- No app-dependent features, no deceptive patterns (fake countdowns, stock levels).
- Dawn/Horizon patterns must not be reintroduced.

---

## ADR-008 — Remove Design Token Build Pipeline

**Date:** 2026-03-21
**Status:** Accepted
**Supersedes:** ADR-001 (design tokens and presets rows)

### Context

The design token system (`src/tokens/` → `generate-tokens.js` → `tokens.css`) was scaffolded but never consumed. Zero `--grove-*` variables were referenced in any component SCSS, Liquid, or JS. Meanwhile, `css-variables.liquid` already provided merchant-editable colours/fonts via Shopify theme settings — the correct pattern for a Theme Store theme.

Maintaining a separate build-time token layer added complexity with no benefit: two variable namespaces, a compilation step, preset override files that duplicated `settings_data.json`, and agent documentation for a system that was never used.

### Decisions

| Decision | Choice | Reason |
|---|---|---|
| Remove `src/tokens/` | Yes | Never consumed; zero references in codebase |
| Remove `generate-tokens.js` | Yes | No longer needed |
| Remove `token-manager` agent role | Yes | No token system to manage |
| Migrate spacing/motion/radii/typography | Static CSS custom properties in `css-variables.liquid` | Same file that handles merchant settings; one source of truth |
| Colours/fonts | Merchant-editable via `settings_schema.json` | Already working correctly |
| Presets | `settings_data.json` only | Native Shopify mechanism; no separate token override layer |

### Consequences

- `css-variables.liquid` is the single source for all CSS custom properties (merchant-editable and static).
- No build step for design values. Spacing, motion, radii, and typography scale are static values in Liquid.
- Presets are purely Shopify `settings_data.json` — different preset appearances come from different merchant setting values.
- Components use `var(--spacing-*)`, `var(--type-*)`, `var(--motion-*)`, `var(--radius-*)` for static values and `var(--color-*)`, `var(--font-*)`, `var(--page-*)` for merchant-editable values.

---

*Add new ADRs below this line.*
