# Known Agent Failures

> Living document. Read before starting any task. Add new entries when you identify a recurring failure pattern.

---

## Failure Patterns

### 1 — Schema Corruption via Injection Comment Edits

**What happens:** Agent edits the `<!-- SCHEMA_INJECT -->` comment in `index.liquid`, moves it, or replaces it with an inline `{% schema %}` block. The build pipeline then either injects schema in the wrong location or fails to inject at all.

**Result:** Schema not compiled into section. Section appears in theme editor but has no settings.

**Prevention:** Never edit `<!-- SCHEMA_INJECT -->`. It is a build marker. Edit `[name].schema.json` to change schema.

---

### 2 — Invented CSS Variable Names

**What happens:** Agent writes `var(--grove-color-brand-primary)` when the actual token is `var(--grove-colors-primary)`. The variable doesn't exist so the value is empty/inherited.

**Result:** Silent visual regression. No error in console. Hard to debug.

**Prevention:** Always check `src/tokens/base/` for exact token names before writing `var(--grove-*)`. Run `pnpm generate-tokens` and check `shopify/assets/tokens.css` for the full list.

---

### 3 — Vue Introduced in Vanilla Components

**What happens:** Agent adds a `.vue` file or `import { ref } from 'vue'` to a component that is marked `"js": "vanilla"` in `registry.json`.

**Result:** Build succeeds but Vue is bundled into a component that doesn't need it. Increases bundle size and breaks the component classification system.

**Prevention:** Check `registry.json` before writing any Vue code. Only use Vue in components marked `"js": "vue"`. If a component needs Vue, update the registry entry and get it reviewed.

---

### 4 — Snippet Nesting Beyond 1 Level

**What happens:** A component renders a snippet that renders another snippet. e.g. `hero/index.liquid` → `_shared/card.liquid` → `_shared/image-srcset.liquid`.

**Result:** Reduces clarity, complicates agent context loading, and can create infinite loop risk with badly-written conditions.

**Prevention:** Max 1 level of snippet nesting per component. A component's `index.liquid` may render `_shared/` snippets. Those snippets must not render further snippets.

---

### 5 — Hardcoded Strings Bypassing Translation Filter

**What happens:** Agent writes `<button>Add to cart</button>` instead of `<button>{{ 'products.add_to_cart' | t }}</button>`.

**Result:** String cannot be translated. Theme store review may flag it. Merchant has no way to customise the text.

**Prevention:** Every merchant-facing text node must use `{{ 'key' | t }}`. This includes button labels, headings, ARIA labels, alt text defaults, and error messages.

---

### 6 — Using `section.settings` Inside a Theme Block

**What happens:** Agent writes `{{ section.settings.heading }}` inside a theme block's `index.liquid`. Theme blocks have their own isolated scope and cannot access section settings.

**Result:** The value renders as empty. Block appears blank in the theme editor with no visible error.

**Prevention:** Inside `src/blocks/*/index.liquid`, always use `block.settings` and `block.id`. Never reference `section.settings` or `section.id`. Global Liquid objects (e.g. `shop`, `cart`, `routes`) are still available.

---

### 7 — Mixing @theme Blocks and Inline Section Blocks

**What happens:** Agent adds `{ "type": "@theme" }` to the `blocks` array in a section schema that also has inline section block definitions (blocks with `name` + `settings`). Shopify does not allow both models in the same section.

**Result:** Schema validation error. Section fails to render in the theme editor.

**Prevention:** A section uses EITHER `{ "type": "@theme" }` (theme blocks) OR inline block definitions, never both. Check the section's `blockModel` field in `registry.json` to confirm which model it uses.

---

### 8 — Rendering Snippets in Blocks with Ambient Variables

**What happens:** Agent renders a snippet inside a theme block that relies on variables from the parent section scope (e.g. `{% render 'snippet', image: section.settings.image %}`). Since `section.settings` is not available in blocks, the snippet receives a blank value.

**Result:** Snippet renders incorrectly or produces blank output. No Liquid error.

**Prevention:** Snippets rendered inside blocks must only use values from `block.settings` or global objects. Example: `{% render 'image-srcset', image: block.settings.image %}`.

---

### 9 — Wrong Diagnosis for Missing Theme Blocks in Editor

**What happens:** Agent assumes blocks don't appear because of a missing `@theme` entry or because blocks need underscore-prefixed filenames. Agent proposes schema changes without checking the actual root causes.

**Result:** Wrong fix applied. Blocks still don't show in the theme editor. Multiple failed fix attempts.

**Prevention:** When blocks don't appear in the theme editor, check in this order:

1. **JSON template has `blocks` + `block_order`** — sections in JSON templates need these keys for the block picker to activate.
2. **Build produces files in `shopify/blocks/`** — run `pnpm build` and verify block `.liquid` files exist with valid `{% schema %}` tags.
3. **Block schemas have `presets`** — blocks need a `presets` array to appear in the picker.
4. **Block type matches filename** — `{ "type": "heading" }` requires `blocks/heading.liquid`.
5. **Only then** check the targeting pattern in the section schema.

Key facts: `@theme` is NOT mandatory for targeting. Underscore prefix is NOT mandatory. See ADR-005.

---

### 10 — Using `export` or `import` in Component JS

**What happens:** Agent writes `export { MyClass }` or `import ... from '...'` in a component's `.js` file. Shopify's `{% javascript %}` tag wraps code in an IIFE `(function() { ... })();`, so ES module syntax is invalid.

**Result:** Runtime error: `Uncaught SyntaxError: Unexpected token 'export'`.

**Prevention:** Component JS must be self-contained with no `import` or `export` statements. Classes self-initialize at the bottom (e.g. `document.querySelectorAll('.hero').forEach(...)`). If a component needs module imports, it must use Vue (`"js": "vue"` in registry) which is bundled by Vite.

---

### 11 — Creating Subdirectories in `shopify/assets/`

**What happens:** Agent configures Vite entry keys with slashes (e.g. `components/hero`) which creates nested output like `shopify/assets/components/hero.js`. Shopify requires all assets in a flat directory.

**Result:** Asset files are not accessible via `{{ 'file.js' | asset_url }}`. Shopify CLI may fail to upload them.

**Prevention:** Never use `/` in Vite entry keys. Use flat names like `component-hero` → outputs `shopify/assets/component-hero.js`. However, vanilla JS components should not be in Vite at all — they are injected via `{% javascript %}` by the build plugin.

---

### 12 — Minifying Compiled Output for Theme Store Themes

**What happens:** Agent uses `style: 'compressed'` for SCSS or leaves Vite's default `minify: true`. The compiled output in `shopify/` is unreadable.

**Result:** Theme store review rejection. Merchants cannot read or edit the theme code.

**Prevention:** All compiled output must be human-readable. SCSS uses `style: 'expanded'`. Vite uses `minify: false`. This applies to everything in `shopify/` — sections, blocks, assets.

---

*Add new failure patterns below this line.*
