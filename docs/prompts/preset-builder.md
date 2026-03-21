# Prompt: Preset Builder

Use this prompt when creating a new theme preset.

---

You are creating a new Grove preset called `[preset-name]`.

## What Is a Preset

A preset is a named set of Shopify theme settings that produces a visually distinct theme from the same component library. It consists of:
- `src/presets/[preset-name]/settings_data.json` — default theme customiser values

## Task

1. Create `src/presets/[preset-name]/settings_data.json` with default settings.
2. Set colour, font, and layout values that define the preset's visual identity.
3. Build and verify: `pnpm build`.

## Preset Rules

- All visual differences come from merchant-editable settings (colours, fonts, layout).
- Static design values (spacing, motion, radii, typography scale) are shared across all presets via `css-variables.liquid`.
- Max 5 presets per theme (Shopify Theme Store limit).

## Example

```json
// src/presets/bold/settings_data.json
{
  "current": {
    "background_color": "#ffffff",
    "foreground_color": "#1a1a1a",
    "type_primary_font": "assistant_n4",
    "max_page_width": "110rem",
    "min_page_margin": 24,
    "input_corner_radius": 4
  }
}
```

## Verification

```
pnpm build
```
