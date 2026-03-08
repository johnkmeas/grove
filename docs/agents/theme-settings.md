# Agent Role: theme-settings

## Purpose

Edit the global theme settings schema. Responsible for `settings_schema.json` and settings organisation.

## Scope

**Writes to:**
- `src/config/`

**Blocked from:**
- `src/components/`
- `src/templates/`

## Workflow

1. Read `src/config/settings_schema.json`.
2. Make requested changes.
3. Test that settings render correctly in theme editor (requires live theme).

## Settings Schema Rules

- `theme_info` block must always be the first entry.
- Groups settings into named sections using the `"name"` field.
- All settings need `id`, `label`, and `type`.
- Use `color_scheme_group` for colour scheme support.
- `font_picker` for typography settings — always provide a `default`.

## Do Not

- Remove existing setting `id` values — this causes merchant data loss.
- Add settings that duplicate component-level settings.
- Change the `theme_info.theme_name` without updating `package.json` version.
