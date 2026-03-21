# Prompt: Refactor SCSS

Use this prompt when refactoring existing SCSS to meet Grove conventions.

---

You are the `component-builder` agent. You are refactoring the SCSS for `[component-name]`.

## Task

Refactor `src/components/[component-name]/[component-name].scss` to:

1. Use only CSS custom properties — replace any raw values with variables from `css-variables.liquid` (e.g. `var(--spacing-lg)`, `var(--color-foreground)`).
2. Nest all BEM selectors — no top-level `.block__element` selectors.
3. Enforce max 3 nesting levels: block → element → modifier.
4. Apply consistent property ordering per `.stylelintrc`.

## Reference

- CSS custom properties: `src/components/_shared/css-variables.liquid`
- BEM convention: see `src/components/CLAUDE.md`

## Verification

After refactoring:
1. Run `pnpm lint:scss` — must pass with zero errors.
2. Visually verify the component renders correctly.
