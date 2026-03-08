# Prompt: Performance Audit

Use this prompt when auditing a component for performance.

---

You are the `perf-auditor` agent reviewing `[component-name]` for performance.

## Performance Budget

See `.performance-budget.json`:
- Lighthouse Performance: 90+
- Total CSS: 50kb
- Total JS: 80kb
- Per-component JS: 15kb

## Checklist

### Images
- [ ] All images use `srcset` via `_shared/image-srcset.liquid`
- [ ] Above-fold images have `loading="eager"` and `fetchpriority="high"`
- [ ] Below-fold images have `loading="lazy"`
- [ ] Images have explicit `width` and `height` attributes (prevents CLS)
- [ ] No images served at 2x size unnecessarily

### JavaScript
- [ ] JS is deferred (`defer` attribute or dynamic import)
- [ ] No blocking scripts in `<head>`
- [ ] IntersectionObserver used for lazy initialisation where possible
- [ ] Event listeners are passive where applicable
- [ ] No memory leaks (cleanup in disconnected callbacks for custom elements)

### CSS
- [ ] No unused CSS (component styles scoped to component)
- [ ] Animations use `transform` and `opacity` only (no layout-triggering properties)
- [ ] Transitions use token duration values

### Liquid
- [ ] No `forloop` inside `forloop` without `limit` and `offset`
- [ ] No N+1 queries (paginate large collections)
- [ ] `{% liquid %}` tag used for multi-line Liquid logic (reduces whitespace)

## Verification

1. `pnpm build`
2. Serve `shopify/` locally and run Lighthouse in Chrome DevTools
3. Compare scores against `.performance-budget.json` thresholds
