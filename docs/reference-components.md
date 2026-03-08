# Reference Components

These components demonstrate every Grove pattern. They are the canonical examples for agent authoring.

## Component Library

| Component | JS | Complexity | Demonstrates |
|---|---|---|---|
| `hero` | Vanilla | Medium | Image/video/colour modes, schema extraction, lazy-load, all tokens |
| `announcement-bar` | Vanilla | Low | Minimal schema, section groups, translation filter |
| `image-with-text` | Vanilla | Low | Layout variants, responsive images, token spacing |
| `product-card` | Vanilla | Medium | Private snippets, price formatting, variant images, badges |
| `collection-grid` | Vanilla | High | Pagination, app blocks, performance patterns |
| `testimonials` | Vanilla | Medium | Repeating blocks schema, slider pattern |
| `cart-drawer` | Vue | High | Vue island, reactive state, Shopify AJAX API |
| `variant-picker` | Vue | High | Vue island, variant selection, inventory display |
| `collection-filters` | Vue | High | Vue island, filter state, URL sync |

## Status

| Component | Status | Phase |
|---|---|---|
| `hero` | ✅ Stable | Phase 1 |
| `announcement-bar` | ⏳ Planned | Phase 8 |
| `image-with-text` | ⏳ Planned | Phase 8 |
| `product-card` | ⏳ Planned | Phase 8 |
| `collection-grid` | ⏳ Planned | Phase 8 |
| `testimonials` | ⏳ Planned | Phase 8 |
| `cart-drawer` | ⏳ Planned | Phase 8 |
| `variant-picker` | ⏳ Planned | Phase 8 |
| `collection-filters` | ⏳ Planned | Phase 8 |

## Hero

The reference component for the full Grove pipeline. Demonstrates:

- Three media modes: image, video, colour background
- Responsive image srcset via `_shared/image-srcset.liquid`
- Schema extraction and `<!-- SCHEMA_INJECT -->` pattern
- Vanilla JS for video autoplay with `prefers-reduced-motion` support
- Full BEM nesting with token variables only
- Content positioning via compound schema field split in Liquid
- All available button styles (primary, secondary, outline)
