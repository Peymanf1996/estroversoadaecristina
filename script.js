/* ============================================================
   ESTROVERSO — Header Interactions
   ============================================================ */

(function () {
    'use strict';

    // ---------- Elements ----------
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.header__link');

    // ---------- 1. Sticky header on scroll ----------
    let lastScrollY = window.scrollY;
    const SCROLL_THRESHOLD = 40;

    function handleScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > SCROLL_THRESHOLD) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }

        lastScrollY = currentScrollY;
    }

    // Throttle with requestAnimationFrame for performance
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load
    handleScroll();

    // ---------- 2. Mobile menu toggle ----------
    function openMenu() {
        menuToggle.classList.add('is-active');
        nav.classList.add('is-open');
        overlay.classList.add('is-active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Chiudi menu');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuToggle.classList.remove('is-active');
        nav.classList.remove('is-open');
        overlay.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Apri menu');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        const isOpen = nav.classList.contains('is-open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    // Close menu on link click (mobile)
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
        }
    });

    // Reset menu state when resizing to desktop
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        }, 150);
    });

    // ---------- 3. Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---------- 4. Active link highlighting (optional) ----------
    const sections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window && sections.length > 0) {
        const observerOptions = {
            rootMargin: '-30% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.classList.toggle(
                            'is-active',
                            link.getAttribute('href') === '#' + id
                        );
                    });
                }
            });
        }, observerOptions);

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }
    // ---------- 5. Hero: Parallax soft effect ----------
    const heroBg = document.querySelector('.hero__bg-img');

    if (heroBg && window.matchMedia('(min-width: 769px)').matches) {
        let heroTicking = false;

        window.addEventListener('scroll', function () {
            if (!heroTicking) {
                window.requestAnimationFrame(function () {
                    const scrolled = window.scrollY;
                    const heroHeight = window.innerHeight;

                    if (scrolled < heroHeight) {
                        const translate = scrolled * 0.15;
                        heroBg.style.transform = `translateY(${translate}px) scale(1.05)`;
                    }
                    heroTicking = false;
                });
                heroTicking = true;
            }
        }, { passive: true });
    }

    // ---------- 6. Rispetta prefers-reduced-motion ----------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && heroBg) {
        heroBg.style.animation = 'none';
    }
       // ---------- 7. Animate elements on scroll (Servizi, ecc.) ----------
    const animatedElements = document.querySelectorAll('[data-animate="fade-up"]');

    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        // ابتدا عناصر داخل hero رو نادیده بگیر (چون از قبل با CSS انیمیت میشن)
        const heroElements = document.querySelectorAll('.hero [data-animate]');

        heroElements.forEach(function (el) {
            el.classList.add('is-animated');
        });

        const animationObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || '0';
                    entry.target.style.animationDelay = (parseInt(delay) / 1000) + 's';
                    entry.target.classList.add('is-animated');
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        animatedElements.forEach(function (el) {
            // فقط عناصری که توی hero نیستن رو observe کن
            if (!el.closest('.hero')) {
                animationObserver.observe(el);
            }
        });
    } else {
        // Fallback: اگه IntersectionObserver پشتیبانی نشد
        animatedElements.forEach(function (el) {
            el.classList.add('is-animated');
        });
    }
})();


