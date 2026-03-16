/* ============================================================
   JEFF MADDOW — PORTFOLIO
   Preloader + Scroll Animations + Interactions
   GSAP for preloader timeline, vanilla for the rest
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
       SITE INIT — Immediate Initialization
       ========================================================== */

    function initSite() {
        initScrollReveal();
        initNarrative();
        initNavScroll();
        initSmoothScroll();
        initMagneticButtons();
        initHeroParallax();
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
            // Fallback: IntersectionObserver
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

    // ---- Scroll Narrative: section-level stagger animations ----
    function initNarrative() {
        if (prefersReducedMotion) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // --- Section wrappers: subtle entrance Y shift ---
        // Gives each section a gentle "rise into view" without touching child opacity
        document.querySelectorAll('.section:not(#hero):not(#stats)').forEach((section) => {
            gsap.from(section, {
                y: 20,
                duration: 0.8,
                ease: 'power3.out',
                immediateRender: false,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 88%',
                    once: true,
                },
            });
        });

        // --- Model list items: horizontal slide-in stagger ---
        const modelItems = document.querySelectorAll('#model .model__list li');
        if (modelItems.length) {
            gsap.set(modelItems, { opacity: 0, x: -16 });
            ScrollTrigger.create({
                trigger: '#model',
                start: 'top 72%',
                once: true,
                onEnter: () => {
                    gsap.to(modelItems, {
                        opacity: 1, x: 0,
                        duration: 0.45,
                        ease: 'power3.out',
                        stagger: 0.09,
                        delay: 0.3,
                    });
                },
            });
        }

        // --- Experience list items: staggered fade-up ---
        const expItems = document.querySelectorAll('#experience .experience__list li');
        if (expItems.length) {
            gsap.set(expItems, { opacity: 0, y: 14 });
            ScrollTrigger.create({
                trigger: '#experience',
                start: 'top 70%',
                once: true,
                onEnter: () => {
                    gsap.to(expItems, {
                        opacity: 1, y: 0,
                        duration: 0.45,
                        ease: 'power3.out',
                        stagger: 0.07,
                        delay: 0.35,
                    });
                },
            });
        }

        // --- Impact list items: staggered fade-up ---
        const impactItems = document.querySelectorAll('#impact .model__list li');
        if (impactItems.length) {
            gsap.set(impactItems, { opacity: 0, y: 14 });
            ScrollTrigger.create({
                trigger: '#impact',
                start: 'top 70%',
                once: true,
                onEnter: () => {
                    gsap.to(impactItems, {
                        opacity: 1, y: 0,
                        duration: 0.40,
                        ease: 'power3.out',
                        stagger: 0.05,
                        delay: 0.3,
                    });
                },
            });
        }

        // --- Contact links: staggered scale + fade ---
        const contactLinks = document.querySelectorAll('#contact .contact__link');
        if (contactLinks.length) {
            gsap.set(contactLinks, { opacity: 0, y: 14, scale: 0.96 });
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 78%',
                once: true,
                onEnter: () => {
                    gsap.to(contactLinks, {
                        opacity: 1, y: 0, scale: 1,
                        duration: 0.5,
                        ease: 'back.out(1.3)',
                        stagger: 0.08,
                        delay: 0.25,
                    });
                },
            });
        }

        // --- Philosophy emphasis: delayed accent reveal ---
        const emphasis = document.querySelector('#philosophy .philosophy__emphasis');
        if (emphasis) {
            gsap.set(emphasis, { opacity: 0, y: 8 });
            ScrollTrigger.create({
                trigger: '#philosophy',
                start: 'top 74%',
                once: true,
                onEnter: () => {
                    gsap.to(emphasis, {
                        opacity: 1, y: 0,
                        duration: 0.65,
                        ease: 'power3.out',
                        delay: 0.5,
                    });
                },
            });
        }
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

        const magneticElements = document.querySelectorAll('.cta-button, .nav__link, .work-item__link, .impl-btn, .expand-toggle, .availability .contact__link');

        magneticElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

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
                // Hide dots while hero is active, show for all other sections
                if (id === 'hero') {
                    progressNav.classList.remove('is-visible');
                } else {
                    progressNav.classList.add('is-visible');
                }
            });
        }, { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' });

        sections.forEach((section) => observer.observe(section));
    }

    // ---- Theme Toggle (Light / Dark) ----

    // ---- GSAP ScrollTrigger: Stat Card Stagger + Animated Counters ----
    function initScrollTrigger() {
        if (prefersReducedMotion) return;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Stagger individual stat cards into view
        const statsRow = document.querySelector('.stats__row');
        const statCards = statsRow ? Array.from(statsRow.querySelectorAll('.stat-card')) : [];
        if (statCards.length) {
            gsap.set(statCards, { opacity: 0, y: 44 });
            gsap.to(statCards, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                stagger: 0.12,
                scrollTrigger: {
                    trigger: statsRow,
                    start: 'top 80%',
                    once: true,
                },
            });
        }

        // Count-up animation for stat numbers
        document.querySelectorAll('.stat-card__number[data-count]').forEach((el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const counter = { val: 0 };

            ScrollTrigger.create({
                trigger: el,
                start: 'top 82%',
                once: true,
                onEnter: () => {
                    gsap.to(counter, {
                        val: target,
                        duration: 1.4,
                        ease: 'power2.out',
                        delay: 0.25,
                        onUpdate: () => {
                            el.textContent = Math.ceil(counter.val) + suffix;
                        },
                    });
                },
            });
        });
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

    // ---- Flow Modal (Integration Validation Flow pop-out) ----
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

    // ---- Iframe Modal (Live API Demo + View Source) ----
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

        // Hosts known to refuse iframe embedding
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
                // GitHub blocks embedding — show redirect card and auto-open new tab
                iframe.style.display = 'none';
                loader.style.display = 'none';
                redirect.classList.add('is-visible');
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                iframe.style.display = 'block';
                iframe.classList.remove('is-loaded');
                loader.style.display = 'flex';
                redirect.classList.remove('is-visible');
                // Slight delay so panel animation completes first
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
            // Reset state after panel exit animation
            setTimeout(function () {
                iframe.src = '';
                iframe.style.display = 'block';
                iframe.classList.remove('is-loaded');
                loader.style.display = 'flex';
                redirect.classList.remove('is-visible');
            }, 420);
        }

        // Reveal iframe once content is loaded
        iframe.addEventListener('load', function () {
            if (iframe.src && iframe.src !== window.location.href) {
                loader.style.display = 'none';
                iframe.classList.add('is-loaded');
            }
        });

        // Wire [data-modal] buttons
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
       PRELOADER — self-contained IIFE
       ============================================================ */

    (function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Skip preloader on same-tab refresh — only show once per session
        if (sessionStorage.getItem('jm-preloader-shown')) {
            preloader.style.display = 'none';
            return;
        }

        const MESSAGE_INTERVAL = 550;

        function scrollMessages() {
            const scroller = document.getElementById('message-scroller');
            if (!scroller) return;

            const messages = scroller.querySelectorAll('.loading-message');
            let currentIndex = 0;

            messages[0].classList.add('active');

            const scrollInterval = setInterval(() => {
                if (currentIndex >= messages.length - 1) {
                    clearInterval(scrollInterval);
                    setTimeout(hidePreloader, 300);
                    return;
                }

                messages[currentIndex].classList.remove('active');
                currentIndex++;
                messages[currentIndex].classList.add('active');

                scroller.style.transform = `translateY(-${currentIndex * 45}px)`;
            }, MESSAGE_INTERVAL);
        }

        let dismissed = false;

        function hidePreloader() {
            if (dismissed) return;
            dismissed = true;

            preloader.classList.add('complete');
            sessionStorage.setItem('jm-preloader-shown', '1');

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }

        // Start preloader animation when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', scrollMessages);
        } else {
            scrollMessages();
        }

        // Failsafe — if anything breaks, dismiss preloader after 6s
        setTimeout(hidePreloader, 6000);
    })();

    /* ============================================================
       BOOT — call initSite when DOM is ready
       ============================================================ */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSite);
    } else {
        initSite();
    }

})(); // closes the outer IIFE
