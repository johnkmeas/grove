# Token Usage Guide

## Naming Convention

All tokens output as CSS custom properties with the prefix `--grove-`:

```
--grove-[category]-[subcategory?]-[variant]
```

Examples:
- `--grove-colors-primary`
- `--grove-spacing-lg`
- `--grove-typography-heading-xl-size`
- `--grove-motion-duration-fast`

## Adding a New Token

1. Add it to the appropriate file in `src/tokens/base/`:
   - Colours → `colors.json`
   - Spacing → `spacing.json`
   - Typography → `typography.json`
   - Motion and border radius → `motion.json`

2. Run `pnpm generate-tokens` to regenerate `shopify/assets/tokens.css`.

3. Reference in SCSS as `var(--grove-[category]-[name])`.

4. Add the token to the component's `registry.json` entry under `"tokens"`.

## Preset Overrides

Presets override base tokens by providing a partial file in `src/tokens/themes/[preset]/`. Only include tokens that differ from base. Unspecified tokens inherit from base.

```
src/tokens/base/colors.json         ← universal defaults
src/tokens/themes/minimal/colors.json ← overrides only
```

Build with a preset: `pnpm build --preset minimal`

## Never Do This

- Never write raw hex values, pixel values, or font sizes in SCSS.
- Never invent a `--grove-*` variable that doesn't exist in `src/tokens/`.
- Stylelint and build-time validation will catch violations.

## Reference

Available token categories:
- `colors.*` — all colour values
- `spacing.*` — spacing scale (2xs through 4xl, page-gutter)
- `typography.*` — font sizes, line heights, weights
- `motion.*` — durations, easing functions
- `border-radius.*` — radius scale
