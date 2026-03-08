# Prompt: Preset Builder

Use this prompt when creating a new theme preset.

---

You are the `token-manager` agent. You are creating a new Grove preset called `[preset-name]`.

## What Is a Preset

A preset is a named token override layer that produces a visually distinct theme from the same component library. It consists of:
- `src/tokens/themes/[preset-name]/` — token overrides (only values that differ from base)
- `src/presets/[preset-name]/settings_data.json` — default theme customiser values

## Task

1. Create `src/tokens/themes/[preset-name]/colors.json` with your colour overrides.
2. Create `src/presets/[preset-name]/settings_data.json` with default settings.
3. Test with `pnpm generate-tokens --preset [preset-name]`.
4. Verify output in `shopify/assets/tokens.css`.

## Token Override Rules

- Only include tokens that differ from `src/tokens/base/`.
- Use the exact same JSON key structure as the base file.
- Deep merge is applied — you only need to specify changed values.

## Example

```json
// src/tokens/themes/bold/colors.json
{
  "colors": {
    "primary": "#e63200",
    "accent": "#e63200",
    "button": {
      "primary-bg": "#e63200",
      "primary-bg-hover": "#c72b00"
    }
  }
}
```

## Verification

```
pnpm generate-tokens --preset [preset-name]
cat shopify/assets/tokens.css | grep --grove-colors-primary
```
