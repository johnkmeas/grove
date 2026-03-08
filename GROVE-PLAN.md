# Grove — Build Plan

> A component-first Shopify theme framework engineered for AI agent development, token efficiency, and theme store quality. Every decision in this document is final and locked.

---

## What Grove Is

Grove is a reusable framework repo that serves as the foundation for any Shopify theme project. Components are co-located, self-describing, and agent-readable. A Vite build pipeline compiles source to standard Shopify structure. Agents work exclusively in `src/`. The compiled `shopify/` output is a build artifact — never committed, never edited directly.

---

## Locked Decisions

| Decision | Choice | Reason |
|---|---|---|
| Repo structure | Single theme | No monorepo complexity |
| Build tool | Vite | First-class SCSS, JS, Vue support |
| JS default | Vanilla ES modules | Lighthouse score, theme store compliance |
| JS interactive | Vue 3 islands | Cart drawer, filters, variant picker only |
| CSS convention | Nested BEM SCSS | Agent-predictable, enforceable via Stylelint |
| CI platform | GitHub Actions | Standard, Shopify CLI integrates cleanly |
| Deploy target | CI pipeline only | `shopify/` gitignored, build artifact only |
| Design tokens | JSON → CSS custom properties | Single source of truth, token layer bridges design tools |
| Presets | Token override layers | One component library, many theme faces |
| Theme store | Full compliance target | 100+ variants, app blocks, a11y, Lighthouse 90+ |
| Design tooling | Pencil.dev as optional upstream MCP | Not a core dependency, optional design-to-component bridge |

---

## Phase 1 — Foundation

**Goal:** Working repo scaffold, Vite pipeline, one reference component end-to-end.

### Tasks

- [x] Initialise pnpm repo, configure package.json scripts
- [x] Set up `src/` and `shopify/` separation, add `shopify/` to `.gitignore`
- [x] Configure `vite.config.js`:
  - Multi-entry build: one JS entry per component
  - SCSS compilation with Dart Sass
  - Vue 3 plugin for island components
  - Custom `vite-plugin-grove-liquid` for schema injection and `.liquid` file handling
- [x] Write `vite-plugin-grove-liquid`:
  - Reads `*.schema.json` per component
  - Injects schema JSON into `{% schema %}{% endschema %}` block in compiled `.liquid`
  - Copies `.liquid` files to `shopify/sections/` or `shopify/snippets/` based on component type
- [x] Write `scripts/generate-tokens.js`:
  - Merges `src/tokens/base/` with `src/tokens/themes/[preset]/`
  - Outputs `shopify/assets/tokens.css` as CSS custom properties
  - Accepts `--preset [name]` flag
- [x] Integrate Shopify CLI: `shopify theme dev --path shopify/`
- [x] Write `scripts/validate-schemas.js` — validate all `*.schema.json` against Shopify schema spec before build
- [x] Add `src/components/registry.json` — scaffold entry, auto-updated by scaffold script
- [x] Create `DECISIONS.md` with first entry: initial architecture decisions
- [x] Create `KNOWN_AGENT_FAILURES.md` — empty template, ready to populate
- [x] Build reference `hero` component end-to-end to validate full pipeline
- [x] Add multi-locale convention from day one: all strings via `{{ 'component.key' | t }}`, never hardcoded
- [x] Add `_version` field to all schemas, write `scripts/schema-diff.js`

### Deliverable
Editing `src/components/hero/` auto-compiles and syncs to a dev theme via Shopify CLI.

---

## Phase 2 — Design Token System + Performance Budget

**Goal:** Agents reference tokens only. Hardcoded values are a lint error. Performance targets are enforced.

### Tasks

- [ ] Define initial token files: `colors.json`, `spacing.json`, `typography.json`, `motion.json`
- [ ] Build preset override system: `base/` + `themes/[preset]/` → merged `tokens.css`
- [ ] Configure Stylelint rule to fail on raw hex/pixel values (custom plugin or `stylelint-declaration-block-no-ignored-properties`)
- [ ] Validate CSS variable names at build time — warn on references to unknown `--grove-*` vars
- [ ] Create `.performance-budget.json`:

```json
{
  "lighthouse": {
    "performance": 90,
    "accessibility": 95,
    "best-practices": 90,
    "seo": 90
  },
  "bundleSize": {
    "totalCSS": "50kb",
    "totalJS": "80kb",
    "perComponentJS": "15kb"
  }
}
```

- [ ] Reference performance budget in root `CLAUDE.md`
- [ ] Add `pa11y` or `axe-core` to post-build CI job for automated accessibility checking
- [ ] Add a11y section to component spec template

### Deliverable
`tokens.css` auto-generated. Stylelint blocks raw values. Performance budget documented and referenced by agents.

---

## Phase 3 — CLAUDE.md Hierarchy + Agent Context

**Goal:** Layered agent context. Fast to load, narrow in scope, agents never have to guess conventions.

### Tasks

- [ ] Write all CLAUDE.md files, measure token budget per file
- [ ] Write `KNOWN_AGENT_FAILURES.md` with first known failure patterns
- [ ] Write all prompt templates in `docs/prompts/`
- [ ] Write all agent role definitions in `docs/agents/`
- [ ] Validate CLAUDE.md hierarchy loads correctly in Claude Code

### Deliverable
An agent given only a component name and a task can complete the task correctly without additional file hints.

---

## Phase 4 — Agent Role Scoping

**Goal:** Discrete agents with explicit file permissions. Prompts are simple. Risk surface is minimal.

### Tasks

- [ ] Write `.claude/settings.json` with glob-based allow/deny per agent role
- [ ] Test each agent role against a real task to validate scope boundaries
- [ ] Document agent roles in root `CLAUDE.md` with one-line purpose each

### GitHub Actions Workflows

- [ ] Write all three workflow files
- [ ] Configure `SHOPIFY_CLI_THEME_TOKEN` secret in GitHub repo settings
- [ ] Configure Lighthouse CI with `.performance-budget.json` thresholds
- [ ] Set up PR preview theme commenting (Shopify CLI + GitHub Actions bot)

### Deliverable
Every PR gets a live preview theme URL automatically. Every merge to main passes lint, schema validation, theme-check, a11y, and Lighthouse before deploying.

---

## Phase 5 — Full Linting Stack

**Goal:** Every file type is formatted and linted. Nothing bad reaches the compile step.

### Tasks

- [ ] Configure Prettier with `@shopify/prettier-plugin-liquid`
- [ ] Configure Stylelint: BEM pattern, token-only values, `stylelint-order`
- [ ] Configure ESLint with `eslint-plugin-vue` and `eslint-plugin-import`
- [ ] Configure `@shopify/theme-check` in `.shopify-theme-check.yml` with a11y rules enabled
- [ ] Set up Husky pre-commit hooks with `lint-staged`
- [ ] Validate full lint pipeline against reference hero component

### Deliverable
`pnpm lint` passes on every commit without manual intervention. Theme-check runs post-build in CI.

---

## Phase 6 — Component Scaffold CLI

**Goal:** `pnpm new-component [name]` generates a complete, correctly structured component in seconds.

### Tasks

- [ ] Write `scripts/new-component.js`
- [ ] Enforce kebab-case component names
- [ ] Add `--vue` flag for island components (generates `ComponentName.vue` instead of `*.js`)
- [ ] Add `"new-component": "node scripts/new-component.js"` to `package.json`
- [ ] Write `docs/component-spec-template.md` — the template spec file uses

### Deliverable
A new component can be scaffolded in one command and is immediately ready for agent authoring.

---

## Phase 7 — Liquid Fixture System

**Goal:** Agents can dry-run render components against mock Shopify data locally without a live store.

### Tasks

- [ ] Write mock fixture files: `product.json`, `collection.json`, `cart.json`, `customer.json`
- [ ] Match Shopify's actual object shape (pull from Shopify Liquid reference)
- [ ] Write `scripts/render-fixture.js`
- [ ] Add render script to agent workflow documentation
- [ ] Document in `src/components/CLAUDE.md`: agents should dry-run render after editing Liquid

### Deliverable
`pnpm render [component] --fixture [fixture]` produces rendered HTML locally for agent verification.

---

## Phase 8 — Reference Component Library

**Goal:** Production-ready reference components demonstrating every framework pattern.

### Tasks

- [ ] Build all 9 reference components following all Phase 1–7 patterns
- [ ] Write `docs/reference-components.md` documenting each component's purpose and patterns
- [ ] Validate all components pass theme-check, a11y, and Lighthouse budget
- [ ] Validate app blocks supported in product and featured-product sections (theme store requirement)
- [ ] Validate Custom Liquid section and Custom Liquid blocks present (theme store requirement)
- [ ] Validate header and footer rendered within section groups (theme store requirement)
- [ ] Validate Follow on Shop button, Shop Pay Installments, unit pricing support

### Deliverable
A complete, theme-store-ready reference component library that demonstrates every Grove pattern.

---

## Phase 9 — Preset System

**Goal:** One component library, many theme faces. 100+ variant support for theme store.

### Tasks

- [ ] Build 3 initial presets: `default`, `minimal`, `bold`
- [ ] Each preset has a complete `settings_data.json` and token override file
- [ ] Add `--preset` flag to all build and deploy scripts
- [ ] Add preset building workflow to `release.yml`: builds all presets, packages each as separate zip
- [ ] Document preset authoring in `docs/` and `src/tokens/CLAUDE.md`
- [ ] Write `preset-builder.md` prompt template for agents creating new presets

### Deliverable
`vite build --preset [name]` produces a fully distinct theme from the same component library. Each preset packaged as a separate theme store submission artifact.

---

## Theme Store Compliance Checklist

To be verified against each reference component and before any release:

- [ ] All templates use JSON format and support sections
- [ ] Custom Liquid section present and available on all templates
- [ ] Custom Liquid blocks in all sections that support app blocks
- [ ] App blocks (`@app`) supported in main product and featured product sections
- [ ] Header and footer rendered within section groups
- [ ] Follow on Shop button present (unmodified branded colours)
- [ ] Shop Pay Installments banner on product page
- [ ] Unit pricing supported on product and collection pages
- [ ] Variant images supported
- [ ] Subscriptions supported
- [ ] All Liquid passes stricter parsing rules (enforced January 2026)
- [ ] `config/markets.json` excluded from theme submission
- [ ] `checkout.liquid` not used (deprecated)
- [ ] Lighthouse scores: Performance 90+, Accessibility 95+, Best Practices 90+, SEO 90+
- [ ] `@shopify/theme-check` passes with zero errors

---

*Grove — grow your theme, tend your components.*
