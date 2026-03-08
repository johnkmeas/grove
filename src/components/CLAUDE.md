# Component Authoring Rules

## BEM Convention

- **Always nest** using `&__` and `&--` — never write `.block__element` as a top-level selector.
- **Max 3 levels:** block → element → modifier.
- One blank line between nested blocks.
- Modifiers belong on the element they modify, not the block.

```scss
// ✅ Correct
.hero {
  &__heading { }
  &__heading--large { }
}

// ❌ Wrong — flat selectors
.hero__heading { }
.hero__heading--large { }
```

## Required Files Per Component

Every component directory must contain:
- `index.liquid` — section markup with `<!-- SCHEMA_INJECT -->` comment
- `[name].schema.json` — settings schema with `_version` field
- `[name].scss` — scoped BEM styles, tokens only
- `[name].js` OR `[name].vue` — behaviour (Vue only if `"js": "vue"` in registry)
- `[name].md` — component spec (see `docs/component-spec-template.md`)

## Schema Conventions

- Always include `"_version": "1.0.0"` in every schema.
- Use `header` settings to group related settings visually.
- Never hardcode merchant-facing text — use the `label` field, not `default` for copy.
- Increment `_version` on any breaking change (removed/renamed setting `id`).

## Snippets

- **Private snippets** (`_name.liquid`): component-specific, live in the component folder, copied to `shopify/snippets/`.
- **Shared snippets** (`_shared/name.liquid`): reused across components, live in `src/components/_shared/`.
- Max 1 level of snippet nesting per component.

## Registry

Every new component must be added to `src/components/registry.json`. The scaffold script does this automatically. If creating manually, copy the schema from an existing entry.

## Strings

All merchant-facing strings must use `{{ 'component.key' | t }}`. Never hardcode text that a merchant might want to customise or translate.

## Dry-Run Rendering

After editing Liquid, verify output with:
```
pnpm render [component-name] --fixture [product|collection|cart|customer]
```
