# Motion Narrative + Typography — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quiet, editorial motion narrative to the portfolio — distinct scroll-triggered entrances per section, hero word-drift, and typography size increases for hero headline and integration architecture elements.

**Architecture:** All animation lives in `main.js` inside the existing `initNarrative()` function. The key structural change is reordering `initSite()` so `initNarrative()` runs before `initScrollReveal()`, allowing GSAP inline styles (set via `gsap.set()`) to win over CSS class transitions for elements that GSAP owns. Typography changes are pure CSS variable and property updates.

**Tech Stack:** GSAP 3 + ScrollTrigger (already loaded), vanilla JS, CSS custom properties. No build step — changes are live immediately in the browser.

---

## Files

| File | What changes |
|---|---|
| `main.js` | Reorder `initSite()`; replace/extend `initNarrative()` with hero word-split, suppress logic, new section animations |
| `index.css` | `--text-hero`, `.reveal` translateY, `.editorial__heading` font-size, `.arch-layer__number` size, `.arch-layer__desc` size, `.cap-grid` perspective, responsive overrides |
| `index.html` | CSS version bump only |

---

## Task 1: CSS — reduce global reveal translateY + editorial heading size

**Files:**
- Modify: `index.css` (`.reveal`, `.editorial__heading`)

- [ ] Open `index.css`. Find `.reveal` (line ~239). Change `translateY(20px)` to `translateY(8px)`.

```css
.reveal {
    opacity: 0;
    transform: translateY(8px);   /* was 20px */
    transition:
        opacity 0.9s var(--ease-out-expo),
        transform 0.9s var(--ease-out-expo);
    transition-delay: calc(var(--stagger, 0) * 120ms);
    will-change: transform, opacity;
}
```

- [ ] Find `.editorial__heading` (line ~829). Change `font-size: 0.68rem` to `0.78rem`.

```css
.editorial__heading {
    font-family: var(--font-mono);
    font-weight: 400;
    font-size: 0.78rem;   /* was 0.68rem */
    letter-spacing: 0.22em;
    ...
}
```

- [ ] Verify in browser: scroll through site, confirm all section labels are slightly larger, all reveal entrances feel softer (shorter lift).

- [ ] Commit:
```bash
git add index.css
git commit -m "style: soften global reveal lift, increase editorial heading size"
```

---

## Task 2: CSS — hero headline font size

**Files:**
- Modify: `index.css` (`:root` custom properties, two responsive overrides)

- [ ] Find `--text-hero` in `:root` (line ~45). Update:

```css
--text-hero: clamp(3.0rem, 5.5vw, 5rem);   /* was clamp(2.25rem, 4.5vw, 3.75rem) */
```

- [ ] Find the tablet override for `.hero__name` (line ~2037):

```css
.hero__name {
    font-size: clamp(2.4rem, 6vw, 3.8rem);   /* was clamp(2rem, 6vw, 3rem) — scaled ~20% */
}
```

- [ ] Find the mobile override for `.hero__name` (line ~2062):

```css
.hero__name {
    font-size: clamp(2.4rem, 10vw, 3.8rem);   /* was clamp(2rem, 10vw, 3rem) */
    letter-spacing: 0.08em;
}
```

- [ ] Verify in browser at desktop, tablet (~768px), and mobile (~375px): headline is noticeably larger at all sizes, no overflow or wrapping issues.

- [ ] Commit:
```bash
git add index.css
git commit -m "style: increase hero headline font size across breakpoints"
```

---

## Task 3: CSS — integration architecture number + desc font sizes + cap-grid perspective

**Files:**
- Modify: `index.css` (`.arch-layer__number`, `.arch-layer__desc`, responsive arch override, `.cap-grid`)

- [ ] Find `.arch-layer__number` (line ~1323). Update font-size and adjust container size to fit larger number:

```css
.arch-layer__number {
    font-family: var(--font-display);
    font-size: 2.8rem;      /* was var(--text-2xl) */
    font-weight: 600;       /* was 700 — slightly lighter at this size */
    color: var(--accent);
    line-height: 1;
    width: 64px;            /* was 48px — grow container to fit */
    height: 64px;           /* was 48px */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: rgba(192, 144, 80, 0.06);
    border: 1px solid rgba(192, 144, 80, 0.18);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    transition:
        background 0.4s var(--ease-out-quart),
        border-color 0.4s var(--ease-out-quart),
        box-shadow 0.4s var(--ease-out-quart),
        color 0.4s var(--ease-out-quart);
}
```

- [ ] Find `.arch-layer__desc` (line ~1418). Update:

```css
.arch-layer__desc {
    font-size: 1rem;        /* was var(--text-sm) */
    line-height: 1.75;      /* was 1.7 */
    color: var(--text-secondary);
    max-width: 60ch;
    margin-bottom: var(--space-md);
}
```

- [ ] Find the responsive override for `.arch-layer__number` (line ~1461). Scale down proportionally:

```css
.arch-layer__number {
    width: 48px;            /* was 36px */
    height: 48px;           /* was 36px */
    font-size: 2rem;        /* was var(--text-lg) */
    border-radius: 10px;
}
```

- [ ] Find `.cap-grid` in CSS. Add `perspective`:

```css
.cap-grid {
    /* existing properties ... */
    perspective: 1000px;
}
```

- [ ] Verify in browser: arch numbers are prominently larger, desc text more readable, cap grid has 3D context (needed for rotateX in Task 5).

- [ ] Commit:
```bash
git add index.css
git commit -m "style: increase arch layer number and desc sizes, add cap-grid perspective"
```

---

## Task 4: JS — reorder initSite() and add suppress helper

**Files:**
- Modify: `main.js` (`initSite()` call order, top of `initNarrative()`)

**Why this matters:** `initScrollReveal()` currently runs first and claims all `.reveal` elements. GSAP inline styles (set via `gsap.set()`) win over CSS class styles, but only if GSAP sets them *after* the class is added. By running `initNarrative()` first, we: (1) add `is-visible` to suppress targets so their CSS transitions are pre-neutralised, (2) call `gsap.set()` which writes inline styles that override the class, (3) then `initScrollReveal()` runs and observes remaining `.reveal` elements — no conflict.

- [ ] In `initSite()`, swap order so `initNarrative()` runs before `initScrollReveal()`:

```js
function initSite() {
    initNarrative();        // must be first — suppresses reveals before ScrollReveal claims them
    initScrollReveal();
    initScrollytelling();
    initNavScroll();
    initSmoothScroll();
    initHeroFade();
    initScrollProgress();
    initLeadershipToggle();
    initFlowToggle();
    initScrollTrigger();
    initIframeModal();
}
```

- [ ] At the very top of `initNarrative()` (before any existing code), add the suppress step:

```js
function initNarrative() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Suppress reveal class on elements GSAP will own fully.
    // is-visible pre-sets opacity:1/transform:none via CSS; gsap.set() then
    // immediately writes inline opacity:0 which wins over the class.
    [
        '.hero__name',
        '.hero__subtitle',
        '.hero__actions',
        '.model__content',
        '.impact__content',
    ].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.classList.add('is-visible'));
    });
    document.querySelectorAll('.cap-card').forEach(el => el.classList.add('is-visible'));
    document.querySelectorAll('.work-item').forEach(el => el.classList.add('is-visible'));

    // ... existing and new animation code follows
```

- [ ] Verify in browser: page loads without flash of invisible content, hero is visible, no layout jump on scroll.

- [ ] Commit:
```bash
git add main.js
git commit -m "refactor: run initNarrative before initScrollReveal, add reveal suppress for GSAP-owned elements"
```

---

## Task 5: JS — hero word-split entrance

**Files:**
- Modify: `main.js` (inside `initNarrative()`, after suppress step)

- [ ] After the suppress block, add the hero word-split and entrance animation:

```js
    // ---- Hero word-split drift entrance ----
    (function initHeroNarrative() {
        const nameEl    = document.querySelector('.hero__name');
        const subtitleEl = document.querySelector('.hero__subtitle');
        const actionsEl  = document.querySelector('.hero__actions');
        if (!nameEl) return;

        // Split text nodes into word spans; preserve child elements (em, etc.)
        const wordSpans = [];
        Array.from(nameEl.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                words.forEach((word, i) => {
                    const span = document.createElement('span');
                    span.textContent = word;
                    span.style.display = 'inline-block';
                    span.style.marginRight = '0.28em';
                    wordSpans.push(span);
                    node.before(span);
                    if (i === words.length - 1) node.before(document.createTextNode(''));
                });
                node.remove();
            }
            // element nodes (em) stay in place — they animate as a unit below
        });

        // Gather all direct children of nameEl as animation targets (spans + em)
        const allTargets = Array.from(nameEl.childNodes)
            .filter(n => n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent.trim()));

        // Set starting state
        gsap.set(nameEl, { opacity: 1 });   // container is visible; words start hidden
        gsap.set(wordSpans, { opacity: 0, y: 10 });
        const emEl = nameEl.querySelector('em');
        if (emEl) gsap.set(emEl, { opacity: 0, y: 10 });
        if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 8 });
        if (actionsEl)  gsap.set(actionsEl,  { opacity: 0, y: 8 });

        // Animate words
        const allWordEls = emEl ? [...wordSpans, emEl] : wordSpans;
        const tl = gsap.timeline({ delay: 0.1 });

        tl.to(allWordEls, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.08,
        });

        if (subtitleEl) {
            tl.to(subtitleEl, {
                opacity: 1, y: 0,
                duration: 0.7,
                ease: 'power3.out',
            }, '-=0.3');
        }

        if (actionsEl) {
            tl.to(actionsEl, {
                opacity: 1, y: 0,
                duration: 0.65,
                ease: 'power3.out',
            }, '-=0.4');
        }
    })();
```

- [ ] Verify in browser: on load, hero words drift up one by one, subtitle follows, then CTAs — quiet and editorial, not bouncy.

- [ ] Check that the `em` (italic "Engineer") animates as part of the word sequence, not separately.

- [ ] Commit:
```bash
git add main.js
git commit -m "feat: add hero word-drift entrance animation"
```

---

## Task 6: JS — replace How I Work section animation

**Files:**
- Modify: `main.js` — replace the existing `#model` block in `initNarrative()` (currently lines ~226–243)

- [ ] Find and **replace** the entire existing `#model` block:

```js
        // --- How I Work: lead paragraph + list items ---
        const modelContent = document.querySelector('#model .model__content');
        const modelLead    = document.querySelector('#model .body-large');
        const modelItems   = document.querySelectorAll('#model .model__list li');

        if (modelContent) {
            // Container already suppressed above; set starting state
            gsap.set(modelContent, { opacity: 1 });
        }
        if (modelLead) {
            gsap.set(modelLead, { opacity: 0, y: 8 });
        }
        if (modelItems.length) {
            gsap.set(modelItems, { opacity: 0, x: -8 });
        }

        if (modelLead || modelItems.length) {
            ScrollTrigger.create({
                trigger: '#model',
                start: 'top 72%',
                once: true,
                onEnter: () => {
                    if (modelLead) {
                        gsap.to(modelLead, {
                            opacity: 1, y: 0,
                            duration: 0.7,
                            ease: 'power3.out',
                        });
                    }
                    if (modelItems.length) {
                        gsap.to(modelItems, {
                            opacity: 1, x: 0,
                            duration: 0.45,
                            ease: 'power2.out',
                            stagger: 0.1,
                            delay: 0.15,
                        });
                    }
                },
            });
        }
```

- [ ] Verify: scroll to How I Work — lead text drifts in, then list items slide from left in sequence.

- [ ] Commit:
```bash
git add main.js
git commit -m "feat: update How I Work entrance — lead paragraph drift + tightened list stagger"
```

---

## Task 7: JS — replace capability cards animation (add rotateX settle)

**Files:**
- Modify: `main.js` — replace existing `.cap-card` block (currently lines ~265–285)

- [ ] Find and **replace** the existing cap-card block:

```js
        // --- Capability cards: stagger with rotateX settle ---
        const capCards = document.querySelectorAll('.cap-card');
        if (capCards.length) {
            gsap.set(capCards, { opacity: 0, y: 20, rotateX: 4, scale: 0.97 });
            ScrollTrigger.create({
                trigger: '.cap-grid',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    gsap.to(capCards, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        duration: 0.65,
                        ease: 'power2.out',
                        stagger: 0.08,
                        delay: 0.1,
                    });
                },
            });
        }
```

- [ ] Verify: cards settle into place with a subtle tilt-flatten on entry. `.cap-grid` must have `perspective: 1000px` from Task 3 — confirm the rotateX is visible (not flat).

- [ ] Commit:
```bash
git add main.js
git commit -m "feat: add rotateX settle to capability card entrance"
```

---

## Task 8: JS — tune arch-layer entrance (reduce x, lengthen duration)

**Files:**
- Modify: `main.js` — update the existing arch-layers block (currently lines ~288–339), change two values only

- [ ] Find `x: -16` in the arch layers block and change to `x: -8`.

- [ ] Find `duration: 0.5` in the content slide-in `gsap.to(layer, {...})` and change to `0.6`.

- [ ] Find `duration: 0.5` in the connector line draw `gsap.to(lineEl, {...})` and change to `0.6`.

- [ ] Verify: arch layers enter with a shorter, more deliberate slide, number pops feel intentional.

- [ ] Commit:
```bash
git add main.js
git commit -m "style: soften arch-layer entrance — reduce x offset and slow duration"
```

---

## Task 9: JS — replace impact section animation (paragraph drift)

**Files:**
- Modify: `main.js` — replace existing `#impact` block (currently lines ~341–359)

- [ ] Find and **replace** the existing impact block:

```js
        // --- Impact paragraphs: staggered drift ---
        const impactContent = document.querySelector('.impact__content');
        const impactParas   = document.querySelectorAll('.impact__content p');

        if (impactContent) {
            gsap.set(impactContent, { opacity: 1 });  // wrapper already suppressed
        }
        if (impactParas.length) {
            gsap.set(impactParas, { opacity: 0, y: 8 });
            ScrollTrigger.create({
                trigger: '#impact',
                start: 'top 72%',
                once: true,
                onEnter: () => {
                    gsap.to(impactParas, {
                        opacity: 1, y: 0,
                        duration: 0.65,
                        ease: 'power3.out',
                        stagger: 0.15,
                        delay: 0.1,
                    });
                },
            });
        }
```

- [ ] Verify: scroll to Impact section — each paragraph drifts in one after another.

- [ ] Commit:
```bash
git add main.js
git commit -m "feat: replace impact list animation with paragraph drift stagger"
```

---

## Task 10: JS — add proof points animation + replace contact animation

**Files:**
- Modify: `main.js` — add work-items block; replace existing contact block (lines ~361–379)

- [ ] After the impact block, add the proof points animation:

```js
        // --- Proof Points: work items slide from left ---
        const workItems = document.querySelectorAll('.work-editorial__list .work-item');
        if (workItems.length) {
            gsap.set(workItems, { opacity: 0, x: -10 });
            ScrollTrigger.create({
                trigger: '.work-editorial__list',
                start: 'top 76%',
                once: true,
                onEnter: () => {
                    gsap.to(workItems, {
                        opacity: 1, x: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        stagger: 0.1,
                        delay: 0.1,
                    });
                },
            });
        }
```

- [ ] Find and **replace** the existing contact block (currently lines ~361–379):

```js
        // --- Connect links: drift up ---
        const contactLinks = document.querySelectorAll('#contact .contact__link');
        if (contactLinks.length) {
            gsap.set(contactLinks, { opacity: 0, y: 10 });
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    gsap.to(contactLinks, {
                        opacity: 1, y: 0,
                        duration: 0.55,
                        ease: 'power2.out',
                        stagger: 0.12,
                        delay: 0.2,
                    });
                },
            });
        }
```

- [ ] Verify: scroll to Proof Points — work items slide in from left. Scroll to Connect — links drift up, matching the hero drift style.

- [ ] Bump CSS version in `index.html` (e.g. `?v=6.0.1`).

- [ ] Commit:
```bash
git add main.js index.html
git commit -m "feat: add proof points animation, update connect entrance to y-drift"
```

---

## Verification Pass

- [ ] Load site at desktop width. Watch hero animate on load — words drift, subtitle follows, CTAs last.
- [ ] Scroll slowly through every section — confirm each has its own entrance character with no jarring jumps.
- [ ] Check `prefers-reduced-motion`: in browser DevTools → Rendering → Emulate CSS media → `prefers-reduced-motion: reduce`. All animations should be skipped, content fully visible.
- [ ] Check mobile (~375px): hero headline wraps cleanly at new size, arch numbers render correctly at responsive size.
- [ ] Confirm no FOUC (flash of unstyled/invisible content) on load.
