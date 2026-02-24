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
       SITE INIT — Immediate Initialization
       ========================================================== */

    function initSite() {
        initScrollReveal();
        initNavScroll();
        initSmoothScroll();
        initMagneticButtons();
        initHeroParallax();
        initLeadershipToggle();
    }


    // ---- Scroll Reveal ----
    function initScrollReveal() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal, .reveal-line').forEach((el) => {
                el.classList.add('is-visible');
            });
            return;
        }

        const revealElements = document.querySelectorAll('.reveal');

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


    // ---- Magnetic Button Interaction ----
    function initMagneticButtons() {
        if (prefersReducedMotion) return;

        const magneticElements = document.querySelectorAll('.cta-button, .nav__link, .work-item__link');

        magneticElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Subtle pull (0.35 factor)
                gsap.to(el, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.6,
                    ease: 'power2.out',
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.3)',
                });
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

    // ---- Expandable Leadership Section ----
    function initLeadershipToggle() {
        const toggleBtn = document.getElementById('leadership-toggle');
        const collapsible = document.getElementById('leadership-collapsible');

        if (!toggleBtn || !collapsible || typeof gsap === 'undefined') return;

        // Set initial GSAP state
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
                    duration: 0.6,
                    ease: 'power3.out'
                });
            } else {
                gsap.to(collapsible, {
                    height: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        gsap.set(collapsible, { visibility: 'hidden' });
                    }
                });
            }
        });
    }

// ---- Fast, Fail-Safe Preloader ----
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) {
        initSite();
        return;
    }

    if (prefersReducedMotion) {
        preloader.remove();
        initSite();
        return;
    }

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: cleanup
    });

    function cleanup() {
        document.body.style.overflow = '';
        preloader.remove(); // remove entirely, not display:none
        initSite();
    }

    // HARD FAILSAFE — kills preloader no matter what
    setTimeout(() => {
        if (document.body.contains(preloader)) {
            cleanup();
        }
    }, 1000); // absolute max lifetime

    // Animation (~700ms total)
    gsap.set('.preloader__frame', { opacity: 0, scale: 0.98 });
    gsap.set('.preloader__init', { opacity: 0 });
    gsap.set('.checkmark', { opacity: 0 });
    gsap.set('#stable-msg', { opacity: 0 });

    tl.to('.preloader__frame', {
        opacity: 1,
        scale: 1,
        duration: 0.25
    })
    .to('.preloader__init', {
        opacity: 1,
        duration: 0.15
    }, "-=0.15")
    .to('#check-1 .checkmark', { opacity: 1, duration: 0.1 }, "+=0.05")
    .to('#check-2 .checkmark', { opacity: 1, duration: 0.1 }, "+=0.05")
    .to('#check-3 .checkmark', { opacity: 1, duration: 0.1 }, "+=0.05")
    .to(preloader, {
        opacity: 0,
        duration: 0.25,
        ease: 'power1.in'
    }, "+=0.05");
}

// Kick off ONLY after full page load
window.addEventListener('load', initPreloader);
