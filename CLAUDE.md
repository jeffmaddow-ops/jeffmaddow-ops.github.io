# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Personal portfolio site for an Enterprise SaaS Implementation & Solutions Engineering professional. Deployed via GitHub Pages. **No build step, no package manager, no framework** — pure static HTML/CSS/JS.

## Development

Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

There are no build, lint, or test commands.

## File Layout

All production files live at the root:

| File | Purpose |
|---|---|
| `index.html` | Single page; all sections inline |
| `index.css` | All styles (~44KB); versioned via `?v=x.x.x` query param in HTML |
| `main.js` | All scroll/interaction logic; versioned similarly |
| `shader-hero.js` | WebGL2 animated hero background |

Static assets (images, favicons, manifest) also live at the root.

`docs/superpowers/` holds planning and spec documents — not served to users.

## Architecture Notes

### CSS Versioning
Cache-busting is done manually via query strings in `index.html`:
```html
<link rel="stylesheet" href="index.css?v=6.2.2">
<script src="main.js?v=6.0.0"></script>
```
Bump the version string in `index.html` whenever `index.css` or `main.js` changes significantly.

### JavaScript
`main.js` uses a module-per-feature pattern with named `init*` functions called on `DOMContentLoaded`:
- `initScrollReveal` — scroll-in reveal animations
- `initNavScroll` — sticky nav behavior
- `initSmoothScroll` — anchor link scrolling
- `initScrollProgress` — reading progress bar
- `initLeadershipToggle` / `initFlowToggle` — section expand/collapse
- `initScrollTrigger` — GSAP ScrollTrigger animations
- `initIframeModal` — modal overlay for embedded content

External libraries are loaded from CDN (GSAP 3.12.5 + ScrollTrigger). No npm involved.

### WebGL Hero
`shader-hero.js` renders a fullscreen WebGL2 canvas behind the hero section. It is self-contained and communicates with `main.js` only through DOM state (canvas element and CSS classes).

### Theming
Dark/light mode is toggled via a class on `<body>` and persisted to `localStorage`. Both themes must be verified when changing colors or layout.

### Accessibility
The site respects `prefers-reduced-motion`. Any new animation code must check `window.matchMedia('(prefers-reduced-motion: reduce)')` before running motion.
