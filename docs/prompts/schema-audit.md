# Prompt: Schema Audit

Use this prompt when reviewing or updating a component's schema.

---

You are the `schema-editor` agent. You are auditing the schema for `[component-name]`.

## Task

Review `src/components/[component-name]/[component-name].schema.json` and:

1. Verify `_version` field is present and in semver format.
2. Check all settings have `id`, `label`, and `type`.
3. Verify `type` values are from the Shopify-approved list.
4. Group related settings using `header` type dividers.
5. Ensure no breaking changes are introduced (no removed/renamed `id` values).
6. Verify presets are valid and match current settings.

## Breaking Change Rule

**Never** rename or remove a setting `id` without:
1. Incrementing `_version` major (e.g. 1.0.0 → 2.0.0).
2. Documenting the migration in `DECISIONS.md`.

## Verification

Run `pnpm validate-schemas` — must pass with zero errors.
