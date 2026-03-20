# Reference Components

Grove is built on the Shopify Skeleton theme. Components follow Skeleton patterns and expose all design choices as merchant-editable settings.

## Current Components (Skeleton Base)

These sections were migrated from the Skeleton theme and provide the essential page structure:

| Component | Type | Status | Notes |
|---|---|---|---|
| `header` | Section | ✅ Stable | Navigation, branding, account |
| `footer` | Section | ✅ Stable | Copyright, links |
| `product` | Section | ✅ Stable | Product detail page |
| `collection` | Section | ✅ Stable | Collection listing |
| `collections` | Section | ✅ Stable | List-collections page |
| `cart` | Section | ✅ Stable | Shopping cart |
| `article` | Section | ✅ Stable | Blog article |
| `blog` | Section | ✅ Stable | Blog listing |
| `page` | Section | ✅ Stable | Generic page |
| `search` | Section | ✅ Stable | Search results |
| `404` | Section | ✅ Stable | Not found page |
| `password` | Section | ✅ Stable | Password-protected page |
| `hello-world` | Section | ✅ Stable | Homepage demo |
| `custom-section` | Section | ✅ Stable | Theme block container |
| `text` | Block | ✅ Stable | Text with style options |
| `group` | Block | ✅ Stable | Layout wrapper block |

## Planned Components (Phase 8)

These need to be built to create a complete, theme-store-ready theme:

### Marketing Sections

| Component | JS | Complexity | Key Patterns |
|---|---|---|---|
| `announcement-bar` | Vanilla | Low | Section groups, dismissible, auto-rotate |
| `image-with-text` | Vanilla | Low | Layout variants, responsive images, CTA |
| `slideshow` | Vanilla | Medium | Full-width media, overlay text, transitions |
| `featured-collection` | Vanilla | Medium | Product grid, app blocks (`@app`) |
| `featured-product` | Vanilla | Medium | Single product showcase, app blocks (`@app`) |
| `rich-text` | Vanilla | Low | Formatted content |
| `newsletter` | Vanilla | Low | Email signup form |
| `video` | Vanilla | Low | Embedded/hosted video, poster image |
| `collapsible-content` | Vanilla | Low | FAQ/accordion, `<details>` element |
| `multicolumn` | Vanilla | Low | Flexible column layout |
| `contact-form` | Vanilla | Low | Form with `autocomplete` attributes |
| `custom-liquid` | None | Low | **Mandatory** for theme store |

### Interactive Components (Vue 3 Islands)

| Component | Complexity | Key Patterns |
|---|---|---|
| `cart-drawer` | High | Vue island, reactive state, Shopify AJAX API |
| `variant-picker` | High | Vue island, variant selection, inventory |
| `collection-filters` | High | Vue island, filter state, URL sync |

### Theme Blocks

| Block | Key Patterns |
|---|---|
| `heading` | Configurable heading level and style |
| `button` | Primary/secondary/outline variants |
| `image` | Responsive image with crop options |
| `price` | Price formatting, compare-at, unit pricing |
| `custom-liquid` | **Mandatory** for theme store |

## Design Principles

All components must follow these principles:

1. **Merchant-controlled design** — All visual choices exposed as settings
2. **Color scheme support** — Every section supports `color_scheme` setting
3. **No JavaScript dependency** — Navigation and product forms work without JS
4. **No app features** — No wishlists, scheduling, discount codes, Instagram
5. **No deceptive patterns** — No fake countdowns, stock levels, or viewer counts
6. **Skeleton patterns** — Follow Skeleton theme conventions, not Dawn/Horizon
7. **Accessible** — 90+ Lighthouse a11y, keyboard navigable, proper contrast
