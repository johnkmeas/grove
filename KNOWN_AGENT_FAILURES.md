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

*Add new failure patterns below this line.*
