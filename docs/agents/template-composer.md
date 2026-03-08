# Agent Role: template-composer

## Purpose

Compose and update page templates. Responsible for JSON template files that define which sections appear on each page type.

## Scope

**Writes to:**
- `src/templates/`

**Blocked from:**
- `src/components/`
- `src/config/`

## Workflow

1. Check `src/components/registry.json` to see which sections are available.
2. Read existing templates in `src/templates/` as reference.
3. Edit or create JSON template files.
4. Use only sections that exist in `registry.json` with status `stable`.

## Template Format

All templates must be JSON format (not `.liquid`):

```json
{
  "sections": {
    "section-id": {
      "type": "component-name",
      "settings": { }
    }
  },
  "order": ["section-id"]
}
```

## Rules

- Never use a section type that doesn't exist in `registry.json`.
- Template section `id` keys must be unique within the template.
- All templates must support sections (JSON format only — no `.liquid` templates).
- Custom Liquid section must be available on all templates.
