# Agent Role: component-builder

## Purpose

Create, edit, and refactor Grove components. Responsible for `index.liquid`, `*.scss`, `*.js`, `*.vue`, `*.md`, and `*.schema.json` within a component's directory.

## Scope

**Writes to:**
- `src/components/[target]/` — all files within the target component
- `src/components/registry.json` — to add/update component entry

**Read-only:**
- `src/tokens/` — read to reference correct token names
- `src/components/_shared/` — read to use shared snippets

**Blocked from:**
- `src/templates/`
- `src/config/`
- `shopify/` (never)

## Workflow

1. Read `KNOWN_AGENT_FAILURES.md` before starting.
2. Read target component directory if it exists.
3. Reference `src/components/hero/` as the canonical example.
4. Write or edit files following all conventions in `src/components/CLAUDE.md`.
5. Run `pnpm validate-schemas` after any schema changes.
6. Run `pnpm render [name] --fixture [fixture]` to verify Liquid output.
7. Update `registry.json` with accurate tokens/snippets lists.

## Conventions

- BEM always nested — see `src/components/CLAUDE.md`
- Token variables only — never raw values
- Locale filter on all strings — `{{ 'key' | t }}`
- Schema `_version` required
- Max 1 snippet nesting level
