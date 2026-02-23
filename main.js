/* ============================================================
   JEFF MADDOW — PORTFOLIO
   Preloader + Scroll Animations + Interactions
   GSAP for preloader timeline, vanilla for the rest
   ============================================================ */

(function () {
    'use strict';

    // ---- Reduced Motion Check ----
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;


    /* ==========================================================
       PRELOADER — GSAP TIMELINE
       Total duration: ~3.5s
       Phase 1: Terminal lines type in (staggered)
       Phase 2: Terminal fades, brand name fades up
       Phase 3: Brand name + preloader dissolve into hero with blur + scale
       ========================================================== */

    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return initSite();

        // Skip preloader if reduced motion
        if (prefersReducedMotion) {
            preloader.remove();
            document.body.classList.remove('is-loading');
            initSite();
            return;
        }

        // Lock scroll
        document.body.classList.add('is-loading');

        // Wait for GSAP to be available
        if (typeof gsap === 'undefined') {
            // Fallback: just remove preloader
            preloader.remove();
            document.body.classList.remove('is-loading');
            initSite();
            return;
        }

        const lines = preloader.querySelectorAll('.preloader__line');
        const terminal = preloader.querySelector('.preloader__terminal');
        const nav = document.getElementById('nav');
        const heroElements = document.querySelectorAll('.hero .reveal, .hero .reveal-line');

        // Master timeline
        const tl = gsap.timeline({
            onComplete: () => {
                preloader.remove();
                document.body.classList.remove('is-loading');
                initSite();
            },
        });

        // ---- Phase 1: Terminal lines appear one-by-one ----
        lines.forEach((line, i) => {
            const delay = i * 0.35;

            tl.to(line, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                ease: 'power2.out',
                onStart: () => {
                    // Remove cursor from previous line
                    if (i > 0) lines[i - 1].classList.remove('is-typing');
                    line.classList.add('is-typing');
                },
            }, delay);
        });

        // Remove cursor from last line after brief pause
        tl.call(() => {
            lines[lines.length - 1].classList.remove('is-typing');
        }, null, '>+0.3');


        // ---- Phase 2: Terminal fades out, preloader dissolves into hero ----
        tl.to(terminal, {
            opacity: 0,
            y: -16,
            duration: 0.5,
            ease: 'power3.inOut',
        }, '>+0.15');

        tl.to(preloader, {
            opacity: 0,
            scale: 1.04,
            filter: 'blur(12px)',
            duration: 0.7,
            ease: 'power3.inOut',
            onStart: () => {
                preloader.classList.add('is-done');
            },
        }, '>+0.1');

        // Bring in the nav
        tl.fromTo(nav, {
            opacity: 0,
            y: -12,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
        }, '<+0.3');

        // Bring in hero elements with stagger
        tl.to(heroElements, {
            opacity: 1,
            y: 0,
            scaleX: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.1,
            onComplete: function () {
                // Add is-visible class to all hero elements so CSS handles hover states
                heroElements.forEach(el => el.classList.add('is-visible'));
            },
        }, '<+0.1');
    }


    /* ==========================================================
       SITE INIT — Everything after preloader completes
       ========================================================== */

    function initSite() {
        initScrollReveal();
        initNavScroll();
        initSmoothScroll();
        initSkillTags();
        initHeroParallax();
    }


    // ---- Scroll Reveal ----
    function initScrollReveal() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal, .reveal-line').forEach((el) => {
                el.classList.add('is-visible');
            });
            return;
        }

        // Only observe elements NOT already visible (hero elements handled by preloader)
        const revealElements = document.querySelectorAll(
            '.reveal:not(.is-visible), .reveal-line:not(.is-visible)'
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -60px 0px',
            }
        );

        revealElements.forEach((el) => observer.observe(el));
    }


    // ---- Nav Scroll State ----
    function initNavScroll() {
        const nav = document.getElementById('nav');
        if (!nav) return;

        let ticking = false;

        function updateNav() {
            if (window.scrollY > 80) {
                nav.classList.add('is-scrolled');
            } else {
                nav.classList.remove('is-scrolled');
            }
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


    // ---- Skill Tag Interaction ----
    function initSkillTags() {
        document.querySelectorAll('.skill-tag').forEach((tag) => {
            tag.addEventListener('mouseenter', () => {
                tag.style.transform = 'translateY(-2px)';
            });
            tag.addEventListener('mouseleave', () => {
                tag.style.transform = 'translateY(0)';
            });
        });
    }


    // ---- Hero Parallax (subtle) ----
    function initHeroParallax() {
        if (prefersReducedMotion) return;

        const hero = document.querySelector('.hero__content');
        if (!hero) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const rate = scrolled * 0.15;
                    hero.style.transform = `translateY(${rate}px)`;
                    hero.style.opacity = Math.max(1 - scrolled / 800, 0);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }


    // ---- Kick everything off ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreloader);
    } else {
        initPreloader();
    }
})();
