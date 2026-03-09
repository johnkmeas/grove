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
| Design tokens | JSON → CSS custom properties | Single source of truth, bridges design tools |
| Presets | Token override layers | One component library, many theme faces |
| Theme store | Full compliance target | 100+ variants, app blocks, a11y, Lighthouse 90+ |

### Consequences

- Agents work exclusively in `src/`. The `shopify/` directory is never committed.
- Vite handles multi-entry JS compilation. One entry per component.
- Token variables are the only permitted values in SCSS — raw values are a lint error.
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

*Add new ADRs below this line.*
