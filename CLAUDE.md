# Grove — Agent Context

**Stack:** Liquid, vanilla JS (ES modules), nested BEM SCSS, Vue 3 islands, Shopify CLI, Vite

## Rules

- **Work in `src/` only.** Never edit `shopify/` — it is a build artifact.
- **All design values from `src/tokens/`.** Never hardcode colours, spacing, or type sizes.
- **All merchant-facing strings via `{{ 'key' | t }}`.** Never hardcode text.
- **BEM always nested.** Never write `.block__element` as a top-level selector.
- **Max snippet nesting: 1 level** per component.
- **Vue only** in components marked `"js": "vue"` in `registry.json`.
- `src/templates/` and `src/config/` are **read-only** unless you are the `template-composer` or `theme-settings` agent.
- **Theme blocks use `block.settings`**, not `section.settings`. Blocks have no access to section scope.
- **Snippets in blocks must be fully parameterized** — pass all values explicitly via `{% render %}`. No reliance on ambient variables.
- **New sections SHOULD use `{ "type": "@theme" }` blocks.** Inline section blocks are deprecated for new development.
- **Block BEM prefix: `grove-`** — e.g. `.grove-heading`, `.grove-button`. Avoids collision with section classes.

## Before Starting Any Task

1. Read `DECISIONS.md` — check before any structural change.
2. Read `KNOWN_AGENT_FAILURES.md` — avoid known failure patterns.
3. Check `src/components/registry.json` — see what exists before creating.
4. Check `src/blocks/registry.json` — see what blocks exist before creating.

## Performance Budget

See `.performance-budget.json`. Lighthouse 90+ performance, 95+ accessibility, 90+ best practices, 90+ SEO.

## Agent Roles

| Agent | Purpose |
|---|---|
| `component-builder` | Create and edit components in `src/components/[target]/` |
| `block-builder` | Create and edit theme blocks in `src/blocks/[target]/` |
| `schema-editor` | Edit `*.schema.json` only |
| `token-manager` | Add and update tokens in `src/tokens/` |
| `template-composer` | Compose page templates in `src/templates/` |
| `theme-settings` | Edit global settings in `src/config/` |
| `perf-auditor` | Review and flag performance/a11y issues |

## Build Commands

```
pnpm build                    # compile all
pnpm generate-tokens          # regenerate tokens.css
pnpm validate-schemas         # lint all *.schema.json
pnpm new-component [name]     # scaffold a new section component
pnpm new-component [name] --type block  # scaffold a new theme block
```
