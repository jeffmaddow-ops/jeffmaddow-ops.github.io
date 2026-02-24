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

 // ---- Cinematic Preloader ----
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader || prefersReducedMotion) {
        if (preloader) preloader.style.display = 'none';
        initSite();
        return;
    }

    // Constants
    const FRAME_SELECTOR = '.preloader__frame';
    const INIT_SELECTOR = '.preloader__init';
    const CHECKMARK_SELECTOR = '.checkmark';
    const STABLE_MSG_SELECTOR = '#stable-msg';
    const PRELOADER_CHECKLIST_SELECTOR = '.preloader__init, .preloader__checklist';
    const PRELOADER_LABEL_SELECTOR = '.preloader__label';

    // Animation durations
    const DURATION_FRAME = 0.8;
    const DURATION_INIT = 0.35;
    const DURATION_CHECKMARK = 0.2;
    const DURATION_CHECKLIST = 0.5;
    const DURATION_STABLE_MSG = 0.4;
    const DURATION_LABEL = 0.3;
    const DURATION_FRAME_TRANSITION = 0.7;
    const DURATION_PRELOADER_FADE = 0.4;

    // Lock scroll during preloader
    document.body.style.overflow = 'hidden';

    // Initial set
    gsap.set(FRAME_SELECTOR, { opacity: 0, scale: 0.98 });
    gsap.set(INIT_SELECTOR, { opacity: 0 });
    gsap.set(CHECKMARK_SELECTOR, { opacity: 0 });
    gsap.set(STABLE_MSG_SELECTOR, { opacity: 0 });

    // Create timeline
    const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    tl.to(FRAME_SELECTOR, { opacity: 1, scale: 1, duration: DURATION_FRAME, ease: 'power3.out' })
      .to(INIT_SELECTOR, { opacity: 1, duration: DURATION_INIT }, "-=0.3")
      .to('#check-1 .checkmark', { opacity: 1, duration: DURATION_CHECKMARK }, "+=0.1")
      .to('#check-2 .checkmark', { opacity: 1, duration: DURATION_CHECKMARK }, "+=0.1")
      .to('#check-3 .checkmark', { opacity: 1, duration: DURATION_CHECKMARK }, "+=0.1")
      .to(PRELOADER_CHECKLIST_SELECTOR, { opacity: 0, duration: DURATION_CHECKLIST }, "+=0.2")
      .to(STABLE_MSG_SELECTOR, { opacity: 1, duration: DURATION_STABLE_MSG, ease: 'power3.out' }, "-=0.1")
      .addLabel('transition', '+=0.1')
      .to([STABLE_MSG_SELECTOR, PRELOADER_LABEL_SELECTOR], { opacity: 0, duration: DURATION_LABEL }, 'transition')
      .to(FRAME_SELECTOR, {
          width: '72px',
          height: '1px',
          borderWidth: '0px',
          backgroundColor: 'var(--accent)',
          duration: DURATION_FRAME_TRANSITION,
          ease: 'power4.inOut'
      }, 'transition')
      .to(preloader, { opacity: 0, duration: DURATION_PRELOADER_FADE, ease: 'power2.in' }, 'transition+=0.3')
      .call(initSite, null, 'transition+=0.2');
};
