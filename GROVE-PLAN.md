# Grove — Build Plan

> A Shopify theme built on the official Skeleton theme, engineered for AI agent development, token efficiency, and theme store quality. Every decision in this document is final and locked.

---

## What Grove Is

Grove is a Shopify Theme Store theme built on the [Shopify Skeleton theme](https://github.com/Shopify/skeleton-theme) — the only approved codebase for new Theme Store submissions (Dawn/Horizon codebases are no longer eligible). Components are co-located, self-describing, and agent-readable. A Vite build pipeline compiles source (`src/`) to standard Shopify structure (`shopify/`). Agents work exclusively in `src/`. The compiled `shopify/` output is a build artifact — never committed, never edited directly.

Design is merchant-driven: all visual customisation comes from **user-edited settings and presets** in the Shopify theme editor, not hardcoded styles.

---

## Locked Decisions

| Decision | Choice | Reason |
|---|---|---|
| Base theme | Shopify Skeleton theme | Only approved codebase for new Theme Store submissions |
| Repo structure | Single theme | No monorepo complexity |
| Build tool | Vite | First-class SCSS, JS, Vue support |
| JS default | Vanilla (self-contained) | Lighthouse score, theme store compliance, `{% javascript %}` IIFE wrapping |
| JS interactive | Vue 3 islands | Cart drawer, filters, variant picker only |
| CSS convention | Nested BEM SCSS | Agent-predictable, enforceable via Stylelint |
| CSS delivery | `{% stylesheet %}` / `{% javascript %}` | Shopify-managed asset delivery, no manual `<script>` tags |
| CI platform | GitHub Actions | Standard, Shopify CLI integrates cleanly |
| Deploy target | CI pipeline only | `shopify/` gitignored, build artifact only |
| Design tokens | JSON → CSS custom properties | Single source of truth, bridges theme settings and design tools |
| Presets | Token override layers + `/listings` folder | One component library, many theme faces (max 5 presets) |
| Theme store | Full compliance target | Skeleton base, Lighthouse 60+ perf / 90+ a11y, no app dependencies |
| Design authority | Merchant settings + presets | All design comes from user-edited settings, not hardcoded values |

---

## Phase 1 — Foundation ✅ COMPLETE

**Goal:** Working repo scaffold, Vite pipeline, reference component end-to-end.

### Tasks

- [x] Initialise pnpm repo, configure package.json scripts
- [x] Set up `src/` and `shopify/` separation, add `shopify/` to `.gitignore`
- [x] Configure `vite.config.js` with multi-entry build, Dart Sass, Vue 3 plugin, `vite-plugin-grove-liquid`
- [x] Write `vite-plugin-grove-liquid` for schema injection and Liquid file handling
- [x] Write `scripts/generate-tokens.js` with `--preset` flag
- [x] Integrate Shopify CLI: `shopify theme dev --path shopify/`
- [x] Write `scripts/validate-schemas.js`
- [x] Add `src/components/registry.json` and `src/blocks/registry.json`
- [x] Create `DECISIONS.md` and `KNOWN_AGENT_FAILURES.md`
- [x] Build reference `hero` component end-to-end to validate full pipeline
- [x] Add multi-locale convention from day one
- [x] Add `_version` field to all schemas, write `scripts/schema-diff.js`

---

## Phase 2 — Skeleton Theme Migration ✅ COMPLETE

**Goal:** Replace custom base with Shopify Skeleton theme. Establish all essential page sections.

### Tasks

- [x] Migrate to Shopify Skeleton theme as base
- [x] Build all essential page sections from Skeleton patterns:
  - [x] `header`, `footer`, `product`, `collection`, `collections`
  - [x] `cart`, `article`, `blog`, `page`, `search`, `404`, `password`
- [x] Create `custom-section` with theme block support (`text`, `group` blocks)
- [x] Set up shared snippets: `image.liquid`, `meta-tags.liquid`, `css-variables.liquid`
- [x] Configure section groups for header/footer
- [x] Set up JSON templates for all page types
- [x] Create locale files (`en.default.json`, `en.default.schema.json`)
- [x] Add critical CSS file

### Deliverable
All essential page types render correctly using Skeleton-based sections.

---

## Phase 3 — Design Token System + Performance Budget 🟡 IN PROGRESS

**Goal:** Agents reference tokens only. Hardcoded values are a lint error. Performance targets match Shopify requirements.

### Tasks

- [x] Define initial token files: `colors.json`, `spacing.json`, `typography.json`, `motion.json`
- [x] Build preset override system: `base/` + `themes/[preset]/` → merged `tokens.css`
- [x] Create `.performance-budget.json` aligned with Shopify Theme Store minimums
- [x] Reference performance budget in root `CLAUDE.md`
- [ ] Configure Stylelint rule to fail on raw hex/pixel values
- [ ] Validate CSS variable names at build time — warn on references to unknown `--grove-*` vars
- [ ] Add Shopify Lighthouse CI GitHub Action for automated perf/a11y checking
- [ ] Add a11y section to component spec template

### Deliverable
`tokens.css` auto-generated. Stylelint blocks raw values. Performance budget enforced in CI.

---

## Phase 4 — CLAUDE.md Hierarchy + Agent Context 🟡 IN PROGRESS

**Goal:** Layered agent context. Agents never have to guess conventions.

### Tasks

- [x] Write root `CLAUDE.md`, `src/components/CLAUDE.md`, `src/tokens/CLAUDE.md`
- [x] Write `KNOWN_AGENT_FAILURES.md` with failure patterns (12 documented)
- [x] Write all prompt templates in `docs/prompts/`
- [x] Write all agent role definitions in `docs/agents/`
- [ ] Measure token budget per CLAUDE.md file
- [ ] Validate CLAUDE.md hierarchy loads correctly in Claude Code

### Deliverable
An agent given only a component name and a task can complete the task correctly.

---

## Phase 5 — CI/CD + Agent Role Scoping 🟡 IN PROGRESS

**Goal:** Discrete agents with explicit file permissions. Every PR gets a live preview.

### Tasks

- [x] Write `.claude/settings.json` with glob-based allow/deny
- [x] Document agent roles in root `CLAUDE.md`
- [x] Write all three GitHub Actions workflow files (dev, staging, release)
- [ ] Test each agent role against a real task to validate scope boundaries
- [ ] Configure Lighthouse CI with `.performance-budget.json` thresholds
- [ ] Set up PR preview theme commenting

### Deliverable
Every PR gets a live preview theme URL. CI enforces lint, schema validation, theme-check, and Lighthouse.

---

## Phase 6 — Full Linting Stack 🟡 IN PROGRESS

**Goal:** Every file type is formatted and linted. Nothing bad reaches compile.

### Tasks

- [x] Configure ESLint with `eslint-plugin-vue` and `eslint-plugin-import`
- [x] Configure Stylelint with `stylelint-order`
- [x] Configure Prettier
- [x] Configure `@shopify/theme-check` in `.shopify-theme-check.yml`
- [x] Set up Husky pre-commit hooks with `lint-staged`
- [ ] Configure Prettier with `@shopify/prettier-plugin-liquid`
- [ ] Add BEM pattern enforcement to Stylelint
- [ ] Add token-only value enforcement to Stylelint
- [ ] Validate full lint pipeline against all components

### Deliverable
`pnpm lint` passes on every commit. Theme-check runs post-build in CI.

---

## Phase 7 — Component Scaffold CLI + Fixture System ✅ MOSTLY COMPLETE

**Goal:** `pnpm new-component [name]` scaffolds components. `pnpm render` dry-runs Liquid.

### Tasks

- [x] Write `scripts/new-component.js` with `--type block` flag
- [x] Write `docs/component-spec-template.md`
- [x] Write `scripts/render-fixture.js`
- [x] Create `src/fixtures/` with mock data
- [ ] Validate scaffold output against all conventions
- [ ] Add render script to agent workflow documentation

### Deliverable
New components scaffolded in one command. Agents can dry-run render components locally.

---

## Phase 8 — Production Component Build 🔴 NOT STARTED

**Goal:** Production-quality sections with full merchant customisation via theme settings.

All design comes from **merchant-editable settings and presets** — sections expose settings for colours, fonts, spacing, layout variants, and content. No hardcoded visual design.

### Core Sections (enhance Skeleton base)

- [ ] `header` — navigation, logo, search, cart icon, mobile menu, sticky option
- [ ] `footer` — link lists, newsletter signup, social icons, payment icons
- [ ] `product` — media gallery, variant picker, add-to-cart, app blocks (`@app`), Shop Pay Installments, unit pricing, subscriptions
- [ ] `collection` — product grid, filtering, sorting, pagination
- [ ] `cart` — line items, quantity updates, cart notes, shipping calculator

### Marketing Sections (new builds)

- [ ] `announcement-bar` — dismissible bar, auto-rotate, urgency-free (no fake countdowns)
- [ ] `image-with-text` — layout variants, responsive images, CTA buttons
- [ ] `slideshow` / `hero` — full-width media sections with overlay text
- [ ] `featured-collection` — curated product grid with app blocks (`@app`)
- [ ] `featured-product` — single product showcase with app blocks (`@app`)
- [ ] `rich-text` — formatted content block
- [ ] `newsletter` — email signup form
- [ ] `video` — embedded/hosted video with poster image
- [ ] `collapsible-content` — FAQ/accordion pattern
- [ ] `multicolumn` — flexible column layout
- [ ] `contact-form` — form with autocomplete attributes
- [ ] `custom-liquid` — Custom Liquid section (theme store mandatory)

### Interactive Components (Vue 3 islands)

- [ ] `cart-drawer` — slide-out cart, reactive state, Shopify AJAX API
- [ ] `variant-picker` — variant selection, inventory display
- [ ] `collection-filters` — filter state, URL sync

### Theme Blocks (reusable across sections)

- [ ] `heading` — configurable heading level and style
- [ ] `button` — primary/secondary/outline variants
- [ ] `image` — responsive image with crop options
- [ ] `price` — price formatting, compare-at, unit pricing
- [ ] `custom-liquid` — Custom Liquid block (theme store mandatory)
- [ ] Enhance existing `text` and `group` blocks

### Requirements

- [ ] All sections expose `color_scheme` setting tied to preset colours
- [ ] App blocks (`@app`) supported in product, featured-product, and featured-collection
- [ ] Custom Liquid section + Custom Liquid blocks present
- [ ] Header and footer in section groups
- [ ] Payment icons use `enabled_payment_types` + `payment_type_svg_tag`
- [ ] All interactive elements work without JavaScript (navigation, product form)
- [ ] No app-like features (wishlists, scheduling, discount codes, Instagram feeds)
- [ ] No deceptive patterns (fake countdowns, fake stock levels, fake viewer counts)

### Deliverable
A complete, theme-store-ready component library where all design is merchant-controlled.

---

## Phase 9 — Preset System + Theme Store Submission 🔴 NOT STARTED

**Goal:** One component library, multiple preset "faces." Ready for Theme Store submission.

### Tasks

- [ ] Build 3 initial presets: `default`, `minimal`, `bold` (max 5 allowed)
- [ ] Each preset has:
  - Complete `settings_data.json` (max 1.5MB)
  - Token override file in `src/tokens/themes/[preset]/`
  - Unique JSON templates in `/listings/[preset]/templates/`
  - Optional preset-specific section groups in `/listings/[preset]/sections/`
- [ ] Add `/listings` folder structure to theme zip (required for multi-preset themes)
- [ ] Tag each preset with industry (max 2 of 20 categories) and catalog size (1 of 4 categories)
- [ ] Create demo store for each preset matching its industry/catalog tags
- [ ] Provide screenshots per demo store (desktop: 1000×1248px or 2000×2496px, mobile: 750×1334px)
- [ ] Write preset taglines (70 chars max, no marketing superlatives)
- [ ] Write 3 highlights per preset (first can be video)
- [ ] Prepare support contact form and documentation link
- [ ] Set price ($100–$500 USD, increments of $10)
- [ ] Add preset building workflow to `release.yml`
- [ ] Document preset authoring in `docs/` and `src/tokens/CLAUDE.md`

### Deliverable
Theme zip with `/listings` folder, all presets, demo stores, and listing pages ready for submission.

---

## Theme Store Compliance Checklist

To be verified before any submission:

### Technical Requirements
- [ ] Built on Shopify Skeleton theme (NOT Dawn/Horizon)
- [ ] All templates use JSON format and support sections
- [ ] All `.json` files free of demo-store-specific resources (metafields, `shopify://` URLs)
- [ ] Header/Footer link_list defaults set to `main-menu`/`footer`
- [ ] Section names use correct Shopify terminology, sentence case
- [ ] Preset names describe content type, sentence case
- [ ] `config/markets.json` excluded from theme submission
- [ ] `checkout.liquid` not used (deprecated)
- [ ] `settings_data.json` under 1.5MB
- [ ] All Liquid passes stricter parsing rules
- [ ] `@shopify/theme-check` passes with zero errors
- [ ] All compiled output is human-readable (no minification)

### Mandatory Features
- [ ] Custom Liquid section present and available on all templates
- [ ] Custom Liquid blocks in all sections that support app blocks
- [ ] App blocks (`@app`) in product and featured-product sections
- [ ] Header and footer rendered within section groups
- [ ] Follow on Shop button present (unmodified branded colours)
- [ ] Shop Pay Installments banner on product page
- [ ] Unit pricing on product and collection pages
- [ ] Variant images supported
- [ ] Subscriptions supported
- [ ] Payment icons via `enabled_payment_types` + `payment_type_svg_tag`

### Performance & Accessibility
- [ ] Lighthouse performance: **60+ minimum** (averaged across product, collection, home; desktop + mobile)
- [ ] Lighthouse accessibility: **90+ minimum** (same pages)
- [ ] Minified JS bundle: **16KB or less**
- [ ] Keyboard navigation works for all links, buttons, dropdowns, forms
- [ ] Visible focus indicators on all interactive elements
- [ ] DOM order matches visual order
- [ ] Color contrast: 4.5:1 for body text, 3.0:1 for large text/icons/borders
- [ ] Form fields use `autocomplete` attribute
- [ ] Error/success messages announced via `aria-live`
- [ ] Media does not autoplay
- [ ] Navigation and product form work without JavaScript

### Content & Listings
- [ ] No app-dependent functionality (wishlists, scheduling, discount codes, Instagram)
- [ ] No deceptive practices (fake countdowns, fake stock, fake viewer counts)
- [ ] No external marketing material or affiliate links
- [ ] No designer credits or links to developer website in theme files
- [ ] Theme exclusive to Shopify Theme Store (not on other marketplaces)
- [ ] `/listings` folder with preset-specific templates (if multi-preset)
- [ ] Demo store per preset matching industry/catalog tags
- [ ] Screenshots per demo store (desktop + mobile, correct dimensions)
- [ ] Support contact form (not just email) + documentation link

---

*Grove — grow your theme, tend your components.*
