# Motion Narrative + Typography — Design Spec
**Date:** 2026-03-19
**Site:** jeffmaddow-ops.github.io

---

## Goal

Add a quiet, editorial motion narrative to the portfolio page — each section has a distinct entrance character that feels like the page composing itself as the reader scrolls. Nothing bouncy or over-the-top. Typography in key areas gets a visibility bump.

---

## Animation System

### Guiding principle
Line-C style throughout: whole lines/blocks fade in with a slight upward drift, staggered by element. No character splits, no clip reveals. Slow expo eases, not spring physics.

---

### Hero

**Conflict resolution:** `.hero__name`, `.hero__subtitle`, and `.hero__actions` carry the `reveal` class in the HTML. Before applying the word-split animation, suppress the `reveal` system for these three elements by calling `el.classList.add('is-visible')` immediately (making opacity:1, transform:none via CSS), then GSAP sets them back to the starting state (`opacity:0`, `translateY`) and drives the entrance. This must happen synchronously before the first paint — set initial GSAP state in the same tick as DOMContentLoaded, before `initScrollReveal()` fires.

**Word split:** Split `.hero__name` text content into individual word `<span>` elements via JS on DOMContentLoaded.

**Entrance:**
- Each word span: `opacity 0→1`, `translateY 10px→0`, staggered 80ms per word, 0.65s `power3.out`
- `.hero__subtitle`: whole-line drift `y:8px→0`, `opacity 0→1`, 0.7s `power3.out`, starts after last word delay + 60ms
- `.hero__actions`: drift `y:8px→0`, `opacity 0→1`, 0.65s `power3.out`, starts after subtitle + 100ms
- All hero animation fires immediately on load — not scroll-triggered

---

### Section headings (`editorial__heading`)
- These carry `reveal` — the existing entrance (translateY 20px, 0.9s) is kept but the CSS transition values are tuned: `translateY 8px→0` instead of 20px, same duration
- Achieved by changing `.reveal` default `translateY` from `20px` to `8px` in CSS — affects all reveals consistently, which is the desired "quieter" feel site-wide

---

### How I Work — paragraphs + list
**Replace** (not duplicate) the existing `#model` block in `initNarrative()`.

- Lead paragraph (`.body-large` inside `#model`): whole-line drift `y:8px→0`, `opacity 0→1`, 0.7s `power3.out`, fires when `#model` enters at `top 72%`
- The `model__content` wrapper has class `reveal` — suppress it the same way as hero (add `is-visible` immediately so CSS doesn't fight GSAP)
- Three list items: **replace** existing `x:-12, stagger:0.07` with `x:-8px→0`, `opacity 0→1`, staggered 100ms apart, 0.45s `power2.out`, fires 150ms after paragraph start

---

### Impact paragraphs
**Conflict resolution:** `.impact__content` has class `reveal` on the wrapper div. Suppress its `reveal` animation immediately (add `is-visible` on init) so the wrapper doesn't fire first and make children visible before the per-paragraph stagger.

- Each `<p>` inside `.impact__content`: `y:8px→0`, `opacity 0→1`, staggered 150ms, 0.65s `power3.out`
- Trigger when `#impact` enters viewport at `top 72%`
- `once: true`

---

### Core Capability cards
- **Conflict resolution:** Each `.cap-card` carries `reveal` in HTML and is already managed by GSAP in `initNarrative()`. Suppress `reveal` on all `.cap-card` elements (add `is-visible` immediately on init) so `initScrollReveal()` does not race with GSAP — same pattern as hero/model/impact
- Keep existing stagger structure
- Add `rotateX(4deg)→0` on entry so cards settle onto the surface
- Increase ease duration: 0.55s → 0.65s
- `perspective` must be set on `.cap-grid` for `rotateX` to render correctly: add `perspective: 1000px` to `.cap-grid` in CSS

---

### Integration Architecture layers
- Keep existing number pop (`back.out(1.7)`) and line draw
- Reduce x offset: `-16px → -8px`
- Increase duration: 0.5s → 0.6s

---

### Proof Points (work items)
- Currently no per-item animation — add new block to `initNarrative()`
- Each `.work-item`: `x:-10px→0`, `opacity 0→1`, staggered 100ms, 0.5s `power2.out`
- Trigger on `.work-editorial__list` at `top 76%`, `once: true`

---

### Connect section
**Replace** (not duplicate) the existing `#contact .contact__link` block in `initNarrative()`.

- Contact links: `y:10px→0`, `opacity 0→1`, staggered 120ms, 0.55s `power2.out`
- Trigger at `top 78%`, `once: true`

---

## Typography

### Hero headline
- **Target:** CSS custom property `--text-hero` in `:root` (not a property directly on `.hero__name`)
- **Current value:** `clamp(2.25rem, 4.5vw, 3.75rem)`
- **New value:** `clamp(3.0rem, 5.5vw, 5rem)`
- **Responsive overrides:** Any breakpoint overrides on `.hero__name` font-size should be scaled proportionally (increase by the same ~30% factor)

### Section label (`editorial__heading`)
- **Target:** `font-size` on `.editorial__heading` in CSS
- Current: `0.68rem` → New: `0.78rem`

### Integration Architecture — layer numbers (`.arch-layer__number`)
- **Target:** font-size on `.arch-layer__number`
- New: `2.8rem`, `font-weight: 600`

### Integration Architecture — layer body text
- **Target:** font-size on `.arch-layer__content` or equivalent text element inside `.arch-layer`
- New: `1rem`, `line-height: 1.75`

---

## Implementation Scope

| File | Changes |
|---|---|
| `main.js` | In `initNarrative()`: add hero word-split + entrance; suppress `reveal` on hero, model__content, impact__content wrappers; replace `#model` block; add impact `<p>` stagger; replace `#contact` block; add work-items block; tune arch-layer + cap-card timings |
| `index.css` | `--text-hero` custom property; `.reveal` translateY 20px→8px; `.editorial__heading` font-size; `.arch-layer__number` size+weight; arch layer body text size; `.cap-grid` perspective |
| `index.html` | No structural changes |

---

## Non-goals
- No character-level splits
- No scroll-scrub / parallax on text
- No entrance sounds or color transitions
- No changes to the GSAP infrastructure itself
