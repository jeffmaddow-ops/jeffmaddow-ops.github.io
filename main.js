/* ============================================================
   JEFF MADDOW — PORTFOLIO
   Scroll Animations + Interactions
   ============================================================ */

// Always load page from top
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', function () {
    window.scrollTo(0, 0);
});

(function () {
    'use strict';

    // ---- Reduced Motion Check ----
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    /* ==========================================================
       SITE INIT
       ========================================================== */

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

    // ---- Scroll Reveal (GSAP ScrollTrigger) ----
    function initScrollReveal() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal, .reveal-line').forEach((el) => {
                el.classList.add('is-visible');
            });
            return;
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
            );
            document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('.reveal').forEach((el) => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 86%',
                once: true,
                onEnter: () => el.classList.add('is-visible'),
            });
        });
    }

    // ---- Scrollytelling: Premium Editorial Parallax Effects ----
    function initScrollytelling() {
        if (prefersReducedMotion) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // ----------------------------------------------------------
        // 1. METRIC ROWS — staggered entry + number count-up + divider draw
        // ----------------------------------------------------------
        (function initMetricScrollytelling() {
            const rows = document.querySelectorAll('.metric-row');
            if (!rows.length) return;

            // Let parent reveal class fire instantly; per-row GSAP takes over
            const metricsBlock = document.querySelector('.metrics-editorial');
            if (metricsBlock) {
                metricsBlock.style.opacity = '1';
                metricsBlock.style.transform = 'none';
                metricsBlock.classList.add('is-visible');
            }

            rows.forEach(function (row) {
                gsap.set(row, { opacity: 0, x: -18 });
                const divider = row.querySelector('.metric-row__divider');
                if (divider) gsap.set(divider, { scaleY: 0, transformOrigin: 'top center' });
                const numEl = row.querySelector('.metric-row__number');
                if (numEl) gsap.set(numEl, { opacity: 0 });
            });

            ScrollTrigger.create({
                trigger: '.metrics-editorial',
                start: 'top 76%',
                once: true,
                onEnter: function () {
                    rows.forEach(function (row, i) {
                        var delay = i * 0.11;

                        // Row slide in
                        gsap.to(row, {
                            opacity: 1, x: 0,
                            duration: 0.55,
                            ease: 'power2.out',
                            delay: delay,
                        });

                        // Vertical divider draw
                        var divider = row.querySelector('.metric-row__divider');
                        if (divider) {
                            gsap.to(divider, {
                                scaleY: 1,
                                duration: 0.55,
                                ease: 'power2.out',
                                delay: delay + 0.22,
                            });
                        }

                        // Number count-up
                        var numEl = row.querySelector('.metric-row__number');
                        if (!numEl) return;

                        var suffix = numEl.querySelector('.metric-row__suffix');
                        var suffixHTML = suffix ? suffix.outerHTML : '';
                        var textNode = Array.from(numEl.childNodes).find(function (n) {
                            return n.nodeType === Node.TEXT_NODE;
                        });
                        var rawNum = textNode ? parseInt(textNode.textContent.trim(), 10) : NaN;

                        if (!isNaN(rawNum)) {
                            var counter = { val: 0 };
                            gsap.to(counter, {
                                val: rawNum,
                                duration: 0.85,
                                ease: 'power2.out',
                                delay: delay + 0.14,
                                onStart: function () {
                                    gsap.set(numEl, { opacity: 1 });
                                },
                                onUpdate: function () {
                                    numEl.innerHTML = Math.round(counter.val) + suffixHTML;
                                },
                            });
                        } else {
                            gsap.to(numEl, { opacity: 1, duration: 0.3, delay: delay + 0.14 });
                        }
                    });
                },
            });
        })();

        // ----------------------------------------------------------
        // 2. PHILOSOPHY EMPHASIS — editorial highlight sweep
        // ----------------------------------------------------------
        (function initPhilosophyHighlight() {
            var emphasis = document.querySelector('#philosophy .philosophy__emphasis');
            if (!emphasis) return;

            // Override the existing initNarrative opacity-only animation for emphasis
            // by adding the highlight class with a delay after section enters
            ScrollTrigger.create({
                trigger: '#philosophy',
                start: 'top 68%',
                once: true,
                onEnter: function () {
                    setTimeout(function () {
                        emphasis.classList.add('is-highlighted');
                    }, 480);
                },
            });
        })();

        // ----------------------------------------------------------
        // 3. ATMOSPHERIC BACKGROUND DRIFT — fixed gradient layer
        // ----------------------------------------------------------
        (function initBgDrift() {
            var driftEl = document.createElement('div');
            driftEl.className = 'bg-drift-layer';
            document.body.prepend(driftEl);

            var ticking = false;

            window.addEventListener('scroll', function () {
                if (!ticking) {
                    requestAnimationFrame(function () {
                        var scrolled = window.scrollY;
                        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
                        var progress = docHeight > 0 ? scrolled / docHeight : 0;

                        // Very gentle drift: vertical at ~3% scroll rate, subtle horizontal sine wave
                        var yShift = scrolled * -0.028;
                        var xShift = Math.sin(progress * Math.PI) * 24;

                        driftEl.style.transform = 'translate(' + xShift.toFixed(1) + 'px, ' + yShift.toFixed(1) + 'px)';
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        })();

    }

    // ---- Scroll Narrative: section-level entrance animations ----
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

        // ---- Hero word-split drift entrance ----
        (function initHeroNarrative() {
            const nameEl     = document.querySelector('.hero__name');
            const subtitleEl = document.querySelector('.hero__subtitle');
            const actionsEl  = document.querySelector('.hero__actions');
            if (!nameEl) return;

            // Split text nodes into word spans; preserve child elements (em, etc.)
            const wordSpans = [];
            Array.from(nameEl.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const words = node.textContent.trim().split(/\s+/).filter(Boolean);
                    words.forEach((word) => {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.style.display = 'inline-block';
                        span.style.marginRight = '0.28em';
                        wordSpans.push(span);
                        node.before(span);
                    });
                    node.remove();
                }
                // element nodes (em) stay in place — they animate as a unit below
            });

            const emEl = nameEl.querySelector('em');

            // Set starting state — container visible, words/em start hidden
            gsap.set(nameEl, { opacity: 1 });
            gsap.set(wordSpans, { opacity: 0, y: 10 });
            if (emEl) gsap.set(emEl, { opacity: 0, y: 10 });
            if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 8 });
            if (actionsEl)  gsap.set(actionsEl,  { opacity: 0, y: 8 });

            // Animate
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

        // --- How I Work: lead paragraph + list items ---
        const modelContent = document.querySelector('#model .model__content');
        const modelLead    = document.querySelector('#model .body-large');
        const modelItems   = document.querySelectorAll('#model .model__list li');

        if (modelContent) {
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

        // --- Experience list items: staggered fade ---
        const expItems = document.querySelectorAll('#experience .experience__list li');
        if (expItems.length) {
            gsap.set(expItems, { opacity: 0 });
            ScrollTrigger.create({
                trigger: '#experience',
                start: 'top 70%',
                once: true,
                onEnter: () => {
                    gsap.to(expItems, {
                        opacity: 1,
                        duration: 0.35,
                        ease: 'power1.out',
                        stagger: 0.06,
                        delay: 0.25,
                    });
                },
            });
        }

        // --- Capability cards: staggered fade + rise ---
        const capCards = document.querySelectorAll('.cap-card');
        if (capCards.length) {
            gsap.set(capCards, { opacity: 0, y: 24, scale: 0.96 });
            ScrollTrigger.create({
                trigger: '.cap-grid',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    gsap.to(capCards, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.55,
                        ease: 'power2.out',
                        stagger: 0.08,
                        delay: 0.1,
                    });
                },
            });
        }

        // --- Architecture layers: sequential marker + content reveal ---
        const archLayers = document.querySelectorAll('.arch-layer');
        if (archLayers.length) {
            archLayers.forEach(layer => {
                gsap.set(layer, { opacity: 0, x: -16 });
                const lineEl = layer.querySelector('.arch-layer__line');
                if (lineEl) gsap.set(lineEl, { scaleY: 0, transformOrigin: 'top center' });
                const numberEl = layer.querySelector('.arch-layer__number');
                if (numberEl) gsap.set(numberEl, { scale: 0.6, opacity: 0 });
            });
            ScrollTrigger.create({
                trigger: '.arch-layers',
                start: 'top 76%',
                once: true,
                onEnter: () => {
                    archLayers.forEach((layer, i) => {
                        const delay = i * 0.14;

                        // Number marker pop-in
                        const numberEl = layer.querySelector('.arch-layer__number');
                        if (numberEl) {
                            gsap.to(numberEl, {
                                scale: 1,
                                opacity: 1,
                                duration: 0.4,
                                ease: 'back.out(1.7)',
                                delay: delay,
                            });
                        }

                        // Content slide-in
                        gsap.to(layer, {
                            opacity: 1,
                            x: 0,
                            duration: 0.5,
                            ease: 'power2.out',
                            delay: delay + 0.06,
                        });

                        // Vertical connector line draw
                        const lineEl = layer.querySelector('.arch-layer__line');
                        if (lineEl) {
                            gsap.to(lineEl, {
                                scaleY: 1,
                                duration: 0.5,
                                ease: 'power2.out',
                                delay: delay + 0.3,
                            });
                        }
                    });
                },
            });
        }

        // --- Impact list items: staggered fade ---
        const impactItems = document.querySelectorAll('#impact .model__list li');
        if (impactItems.length) {
            gsap.set(impactItems, { opacity: 0 });
            ScrollTrigger.create({
                trigger: '#impact',
                start: 'top 70%',
                once: true,
                onEnter: () => {
                    gsap.to(impactItems, {
                        opacity: 1,
                        duration: 0.3,
                        ease: 'power1.out',
                        stagger: 0.05,
                        delay: 0.2,
                    });
                },
            });
        }

        // --- Contact links: simple staggered fade ---
        const contactLinks = document.querySelectorAll('#contact .contact__link');
        if (contactLinks.length) {
            gsap.set(contactLinks, { opacity: 0 });
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    gsap.to(contactLinks, {
                        opacity: 1,
                        duration: 0.45,
                        ease: 'power1.out',
                        stagger: 0.1,
                        delay: 0.2,
                    });
                },
            });
        }

        // --- Philosophy emphasis: delayed accent reveal ---
        const emphasis = document.querySelector('#philosophy .philosophy__emphasis');
        if (emphasis) {
            gsap.set(emphasis, { opacity: 0 });
            ScrollTrigger.create({
                trigger: '#philosophy',
                start: 'top 74%',
                once: true,
                onEnter: () => {
                    gsap.to(emphasis, {
                        opacity: 1,
                        duration: 0.7,
                        ease: 'power2.out',
                        delay: 0.4,
                    });
                },
            });
        }
    }

    // ---- Nav Scroll State ----
    function initNavScroll() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        let lastY   = window.scrollY;
        let ticking = false;

        function updateNav() {
            const currentY = window.scrollY;
            const delta    = currentY - lastY;

            // Glass background once past the very top
            if (currentY > 80) {
                nav.classList.add('is-scrolled');
            } else {
                nav.classList.remove('is-scrolled');
            }

            // Direction-aware: hide on scroll-down (past initial band), reveal on scroll-up
            if (currentY > 200 && delta > 4) {
                nav.classList.add('is-hidden');
            } else if (delta < -4) {
                nav.classList.remove('is-hidden');
            }

            lastY   = currentY;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNav);
                ticking = true;
            }
        }, { passive: true });
    }

    // ---- Smooth Scroll for Anchor Links ----
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const navHeight = document.getElementById('nav')?.offsetHeight || 0;
                const targetPosition =
                    target.getBoundingClientRect().top + window.scrollY - navHeight - 24;

                window.scrollTo({
                    top: targetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                });
            });
        });
    }

    // ---- Hero Fade on Scroll (opacity only — no parallax) ----
    function initHeroFade() {
        if (prefersReducedMotion) return;

        const hero = document.querySelector('.hero__content');
        if (!hero) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    hero.style.opacity = Math.max(1 - scrolled / 600, 0);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ---- Scroll Progress Indicator ----
    function initScrollProgress() {
        const progressNav = document.getElementById('scroll-progress');
        if (!progressNav) return;

        const dots = Array.from(progressNav.querySelectorAll('.scroll-progress__dot'));
        const sections = dots.map((dot) =>
            document.querySelector(dot.getAttribute('href'))
        ).filter(Boolean);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                dots.forEach((dot) => {
                    dot.classList.toggle('is-active', dot.getAttribute('href') === '#' + id);
                });
                if (id === 'hero') {
                    progressNav.classList.remove('is-visible');
                } else {
                    progressNav.classList.add('is-visible');
                }
            });
        }, { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' });

        sections.forEach((section) => observer.observe(section));
    }

    // ---- GSAP ScrollTrigger: Stat Card Stagger ----
    function initScrollTrigger() {
        if (prefersReducedMotion) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        const statsRow = document.querySelector('.stats__row');
        const statCards = statsRow ? Array.from(statsRow.querySelectorAll('.stat-card')) : [];
        if (statCards.length) {
            gsap.set(statCards, { opacity: 0 });
            gsap.to(statCards, {
                opacity: 1,
                duration: 0.5,
                ease: 'power1.out',
                stagger: 0.1,
                scrollTrigger: {
                    trigger: statsRow,
                    start: 'top 80%',
                    once: true,
                },
            });
        }
    }

    // ---- Expandable Leadership Section ----
    function initLeadershipToggle() {
        const toggleBtn = document.getElementById('leadership-toggle');
        const collapsible = document.getElementById('leadership-collapsible');

        if (!toggleBtn || !collapsible || typeof gsap === 'undefined') return;

        gsap.set(collapsible, { height: 0, opacity: 0, overflow: 'hidden', visibility: 'hidden' });

        let isExpanded = false;

        toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            toggleBtn.setAttribute('aria-expanded', isExpanded);
            collapsible.setAttribute('aria-hidden', !isExpanded);

            if (isExpanded) {
                gsap.to(collapsible, {
                    height: 'auto',
                    opacity: 1,
                    visibility: 'visible',
                    duration: 0.5,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(collapsible, {
                    height: 0,
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(collapsible, { visibility: 'hidden' });
                    }
                });
            }
        });
    }

    // ---- Flow Modal ----
    function initFlowToggle() {
        const toggleBtn = document.getElementById('flow-toggle');
        const modal     = document.getElementById('flow-modal');
        if (!toggleBtn || !modal) return;

        const backdrop = document.getElementById('flow-modal-backdrop');
        const closeBtn = document.getElementById('flow-modal-close');

        function openModal() {
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        toggleBtn.addEventListener('click', openModal);
        backdrop.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
        });
    }

    // ---- Iframe Modal ----
    function initIframeModal() {
        const modal = document.getElementById('iframe-modal');
        if (!modal) return;

        const backdrop   = document.getElementById('iframe-modal-backdrop');
        const closeBtn   = document.getElementById('iframe-modal-close');
        const titleEl    = document.getElementById('iframe-modal-title');
        const newTabLink = document.getElementById('iframe-modal-newtab');
        const iframe     = document.getElementById('iframe-modal-iframe');
        const loader     = document.getElementById('iframe-modal-loader');
        const redirect   = document.getElementById('iframe-modal-redirect');
        const redirectLink = document.getElementById('iframe-modal-redirect-link');

        const EMBED_BLOCKED = ['github.com', 'www.github.com'];

        function isBlocked(url) {
            try {
                return EMBED_BLOCKED.includes(new URL(url).hostname);
            } catch (_) {
                return false;
            }
        }

        function openModal(url, title) {
            titleEl.textContent = title;
            newTabLink.href = url;
            redirectLink.href = url;

            if (isBlocked(url)) {
                iframe.style.display = 'none';
                loader.style.display = 'none';
                redirect.classList.add('is-visible');
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                iframe.style.display = 'block';
                iframe.classList.remove('is-loaded');
                loader.style.display = 'flex';
                redirect.classList.remove('is-visible');
                setTimeout(function () { iframe.src = url; }, 120);
            }

            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(function () {
                iframe.src = '';
                iframe.style.display = 'block';
                iframe.classList.remove('is-loaded');
                loader.style.display = 'flex';
                redirect.classList.remove('is-visible');
            }, 420);
        }

        iframe.addEventListener('load', function () {
            if (iframe.src && iframe.src !== window.location.href) {
                loader.style.display = 'none';
                iframe.classList.add('is-loaded');
            }
        });

        document.querySelectorAll('[data-modal]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                var url   = el.getAttribute('data-modal-url') || el.getAttribute('href');
                var title = el.getAttribute('data-modal-title') || 'Preview';
                openModal(url, title);
            });
        });

        backdrop.addEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }

    /* ============================================================
       PRELOADER — skip immediately
       ============================================================ */

    (function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        preloader.style.display = 'none';
    })();

    /* ============================================================
       BOOT
       ============================================================ */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }

})();
