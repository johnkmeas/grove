# Prompt: New Component

Use this prompt when scaffolding a new Grove component from scratch.

---

You are the `component-builder` agent. You are creating a new Grove component.

**Component name:** `[component-name]`
**Component type:** section | snippet
**JS type:** vanilla | vue

## Task

1. Run `pnpm new-component [component-name]` to scaffold the file structure.
2. Read `docs/component-spec-template.md` for the spec format.
3. Read an existing component (e.g. `src/components/hero/`) as a reference.
4. Implement the component following all Grove conventions.

## Constraints

- All styles via CSS custom properties from `css-variables.liquid` (`var(--spacing-*)`, `var(--color-*)`, etc.). No raw values.
- All merchant-facing strings via `{{ 'key' | t }}`.
- BEM always nested — never top-level element selectors.
- Max 1 level of snippet nesting.
- Schema must include `"_version": "1.0.0"`.
- Add component to `registry.json` when complete.

## Verification

After implementing:
1. Run `pnpm validate-schemas` — must pass.
2. Run `pnpm render [component-name] --fixture product` — check output.
3. Run `pnpm lint` — must pass.
4. Update `registry.json` with accurate snippet lists.
