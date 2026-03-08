# Prompt: Accessibility Review

Use this prompt when auditing a component for accessibility compliance.

---

You are the `perf-auditor` agent reviewing `[component-name]` for accessibility.

## Checklist

### Semantic HTML
- [ ] Correct heading hierarchy (h2 for sections, h3 for nested content)
- [ ] Landmark roles: `<main>`, `<nav>`, `<header>`, `<footer>`, `<section aria-label>`
- [ ] Lists use `<ul>`/`<ol>` not `<div>` chains
- [ ] Buttons are `<button>`, links are `<a href>`

### Images
- [ ] All `<img>` have meaningful `alt` text or `alt=""` for decorative images
- [ ] `aria-hidden="true"` on decorative containers
- [ ] Background images have text equivalents if content-bearing

### Interactive Elements
- [ ] All interactive elements keyboard-reachable
- [ ] Focus styles visible (`focus-visible` not suppressed)
- [ ] `aria-expanded`, `aria-controls`, `aria-label` on custom controls
- [ ] `role="dialog"` and focus trap on modals/drawers

### Motion
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No auto-playing video without user control (or muted with `prefers-reduced-motion` pause)

### Forms
- [ ] Labels associated with inputs (`for`/`id` or `aria-label`)
- [ ] Error messages linked with `aria-describedby`
- [ ] Required fields indicated in label, not just visually

## Verification

Run `pnpm build` then check with:
- Browser: keyboard navigation test
- Chrome DevTools: Accessibility tree panel
- axe DevTools extension (if available)
