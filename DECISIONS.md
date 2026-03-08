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

*Add new ADRs below this line.*
