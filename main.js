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
        initNavScroll();
        initSmoothScroll();
        initMagneticButtons();
        initHeroParallax();
        initThemeToggle();
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

    // ---- Theme Toggle (Light / Dark) ----
    function initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        // Initialize theme based on document attribute (already set by head script)
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(currentTheme);

        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || currentTheme;
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('jm-theme', next);
        });

        function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            toggleBtn.setAttribute('aria-checked', theme === 'light');
        }
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

/* ============================================================
   PRELOADER JAVASCRIPT
   ============================================================ */

// Scrolling Preloader Animation
(function initPreloader() {
  const MESSAGE_INTERVAL = 450; // ms between scrolls (450ms × 4 = 1.8s total)
  
  function scrollMessages() {
    const scroller = document.getElementById('message-scroller');
    if (!scroller) return;
    
    const messages = scroller.querySelectorAll('.loading-message');
    let currentIndex = 0;

    // Set first message as active
    messages[0].classList.add('active');

    const scrollInterval = setInterval(() => {
      if (currentIndex >= messages.length - 1) {
        clearInterval(scrollInterval);
        // Hide preloader after final message
        setTimeout(hidePreloader, 300);
        return;
      }

      // Remove active from current
      messages[currentIndex].classList.remove('active');

      // Move to next
      currentIndex++;
      messages[currentIndex].classList.add('active');

      // Scroll the viewport (45px per message)
      scroller.style.transform = `translateY(-${currentIndex * 45}px)`;
    }, MESSAGE_INTERVAL);
  }

  function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    
    preloader.classList.add('complete');
    
    // Remove from DOM after transition
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  }

  // Start animation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollMessages);
  } else {
    scrollMessages();
  }
})();
