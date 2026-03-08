# Hero

## Purpose

Full-width hero banner positioned at the top of key templates (homepage, landing pages). Supports three media modes — image, video, and solid colour background — with configurable overlay, content positioning, and call-to-action button. Serves as the primary above-the-fold element and the reference component for the full Grove pipeline.

## Variants in use

- **Image hero** — static image with overlay, heading, subheading, CTA button
- **Video hero** — looping background video (autoplay, muted, playsinline)
- **Colour hero** — gradient or flat colour background, no media required

## Settings

| Setting | Notes |
|---|---|
| `media_type` | Toggles between image, video, and colour mode |
| `image_mobile` | Optional swap image for screens ≤749px |
| `overlay_opacity` | 0–100 range, stored as integer, divided by 100 in Liquid for CSS var |
| `content_position` | Combined vertical-horizontal string (e.g. `middle-center`) split in Liquid |
| `button_style` | primary / secondary / outline — maps to BEM modifiers |

## BEM Structure

```
.hero
.hero--height-{small|medium|large|full}
.hero--{image|video|color}
.hero__media
.hero__image
.hero__image--mobile
.hero__image--placeholder
.hero__video-wrapper
.hero__video
.hero__color-bg
.hero__overlay
.hero__content
.hero__content--{top|middle|bottom}
.hero__content--align-{left|center|right}
.hero__content-inner
.hero__heading
.hero__subheading
.hero__cta
.hero__button
.hero__button--{primary|secondary|outline}
```

## Accessibility

- `<section>` has `aria-label` set to heading text for landmark navigation
- Overlay `<div>` is `aria-hidden="true"` — decorative only
- Videos are muted, paused when `prefers-reduced-motion: reduce` is set
- All buttons use `<a>` with descriptive label text — never icon-only
- Focus ring on buttons via `focus-visible` — 3px offset

## Known Quirks

- `content_position` is stored as a compound string (`middle-center`) and split in Liquid. Do not change the dash-separated format without updating the Liquid split logic.
- Mobile image swap hides the desktop image via CSS; both `<img>` tags are in the DOM. If the mobile image setting is empty, only desktop image renders at all sizes.
- Video autoplay is handled by the JS module, not the `autoplay` attribute in Liquid, to respect `prefers-reduced-motion`.
- `overlay_opacity` is stored as an integer (0–100) in schema but used as a decimal (0.0–1.0) in CSS. The `/` operator in Liquid handles this conversion.

## Dependencies

- **Private snippets:** none
- **Shared snippets:** `image-srcset` (responsive image helper)
- **Tokens:** `spacing.md`, `spacing.lg`, `spacing.xl`, `typography.heading-xl`, `typography.heading-lg`, `typography.body-lg`, `typography.body-md`, `typography.weight-medium`, `colors.button-primary-*`, `colors.button-secondary-*`, `colors.focus-ring`, `border-radius.button`, `motion.duration-fast`, `motion.easing-standard`
- **JS:** Uses `IntersectionObserver` (all modern browsers) and `window.matchMedia`
