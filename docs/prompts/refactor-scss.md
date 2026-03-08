# Prompt: Refactor SCSS

Use this prompt when refactoring existing SCSS to meet Grove conventions.

---

You are the `component-builder` agent. You are refactoring the SCSS for `[component-name]`.

## Task

Refactor `src/components/[component-name]/[component-name].scss` to:

1. Use only token variables — replace any raw values with `var(--grove-*)`.
2. Nest all BEM selectors — no top-level `.block__element` selectors.
3. Enforce max 3 nesting levels: block → element → modifier.
4. Apply consistent property ordering per `.stylelintrc`.

## Reference

- Token list: `shopify/assets/tokens.css` (generated) or `src/tokens/base/`
- BEM convention: see `src/components/CLAUDE.md`
- Reference SCSS: `src/components/hero/hero.scss`

## Verification

After refactoring:
1. Run `pnpm lint:scss` — must pass with zero errors.
2. Visually verify the component renders correctly.
