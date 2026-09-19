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
       // ---------- 8. Before/After Slider ----------
    const baSliders = document.querySelectorAll('[data-ba-slider]');

    baSliders.forEach(function (slider) {
        const beforeEl = slider.querySelector('.ba-slider__before');
        const handleEl = slider.querySelector('.ba-slider__handle');

        if (!beforeEl || !handleEl) return;

        let isDragging = false;
        let currentPos = 50; // درصد

        // تنظیم موقعیت
        function setPosition(percent) {
            // محدود کردن بین 0 تا 100
            percent = Math.max(0, Math.min(100, percent));
            currentPos = percent;

            beforeEl.style.width = percent + '%';
            handleEl.style.left = percent + '%';
            handleEl.setAttribute('aria-valuenow', Math.round(percent));
        }

        // دریافت موقعیت از رویداد
        function getPercentFromEvent(clientX) {
            const rect = slider.getBoundingClientRect();
            const x = clientX - rect.left;
            return (x / rect.width) * 100;
        }

        // شروع کشیدن
        function startDrag(e) {
            isDragging = true;
            slider.style.cursor = 'grabbing';
            // اگه کلیک روی handle نبود، موقعیت رو مستقیم ببر
            if (e.type === 'mousedown' || e.type === 'touchstart') {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                // فقط اگه داخل خود اسلایدر کلیک شده
                if (e.target === slider || e.target.closest('.ba-slider__handle')) {
                    setPosition(getPercentFromEvent(clientX));
                }
            }
            e.preventDefault();
        }

        // پایان کشیدن
        function endDrag() {
            isDragging = false;
            slider.style.cursor = 'ew-resize';
        }

        // حرکت
        function onMove(e) {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            setPosition(getPercentFromEvent(clientX));
        }

        // Mouse Events
        slider.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', endDrag);

        // Touch Events
        slider.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', endDrag);

        // کلیک مستقیم روی اسلایدر (بدون drag)
        slider.addEventListener('click', function (e) {
            if (e.target.closest('.ba-slider__handle-btn')) return;
            if (!isDragging) {
                setPosition(getPercentFromEvent(e.clientX));
            }
        });

        // کیبورد (دسترسی‌پذیری)
        handleEl.addEventListener('keydown', function (e) {
            const STEP = 5;
            if (e.key === 'ArrowLeft') {
                setPosition(currentPos - STEP);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                setPosition(currentPos + STEP);
                e.preventDefault();
            } else if (e.key === 'Home') {
                setPosition(0);
                e.preventDefault();
            } else if (e.key === 'End') {
                setPosition(100);
                e.preventDefault();
            }
        });

        // مقدار اولیه
        setPosition(50);
    });
       // ---------- 9. Testimonianze Slider ----------
    const tSlider = document.getElementById('testimonianzeSlider');
    const tDotsContainer = document.getElementById('testimonianzeDots');
    const tPrev = document.querySelector('.testimonianze__nav--prev');
    const tNext = document.querySelector('.testimonianze__nav--next');

    if (tSlider && tPrev && tNext) {
        const cards = tSlider.querySelectorAll('.testimonianze__card');
        const totalCards = cards.length;

        // ---------- محاسبه تعداد کارت‌های قابل مشاهده ----------
        function getCardsPerView() {
            const w = window.innerWidth;
            if (w <= 768) return 1;
            if (w <= 992) return 2;
            return 3;
        }

        // ---------- ساخت Dots (فقط برای موبایل) ----------
        function buildDots() {
            if (!tDotsContainer) return;
            tDotsContainer.innerHTML = '';

            const cardsPerView = getCardsPerView();
            if (cardsPerView !== 1) return; // فقط در موبایل

            cards.forEach(function (_, i) {
                const dot = document.createElement('button');
                dot.className = 'testimonianze__dot' + (i === 0 ? ' is-active' : '');
                dot.setAttribute('aria-label', 'Vai alla recensione ' + (i + 1));
                dot.addEventListener('click', function () {
                    const cardWidth = cards[0].offsetWidth + 16; // +gap
                    tSlider.scrollTo({
                        left: cardWidth * i,
                        behavior: 'smooth'
                    });
                });
                tDotsContainer.appendChild(dot);
            });
        }

        // ---------- به‌روزرسانی Dots ----------
        function updateDots() {
            if (!tDotsContainer) return;
            const dots = tDotsContainer.querySelectorAll('.testimonianze__dot');
            if (dots.length === 0) return;

            const scrollLeft = tSlider.scrollLeft;
            const cardWidth = cards[0].offsetWidth + 16;
            const activeIndex = Math.round(scrollLeft / cardWidth);

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === activeIndex);
            });
        }

        // ---------- به‌روزرسانی دکمه‌های Prev/Next ----------
        function updateNavButtons() {
            const scrollLeft = tSlider.scrollLeft;
            const maxScroll = tSlider.scrollWidth - tSlider.clientWidth;

            tPrev.disabled = scrollLeft <= 5;
            tNext.disabled = scrollLeft >= maxScroll - 5;
        }

        // ---------- اسکرول به کارت بعدی/قبلی ----------
        function scrollByCard(direction) {
            const cardWidth = cards[0].offsetWidth + 24; // +gap
            tSlider.scrollBy({
                left: cardWidth * direction,
                behavior: 'smooth'
            });
        }

        // ---------- رویدادها ----------
        tPrev.addEventListener('click', function () {
            scrollByCard(-1);
        });

        tNext.addEventListener('click', function () {
            scrollByCard(1);
        });

        // ---------- مشاهده تغییرات اسکرول ----------
        let scrollTimer;
        tSlider.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                updateDots();
                updateNavButtons();
            }, 80);
        }, { passive: true });

        // ---------- مدیریت تغییر اندازه ----------
        let resizeT;
        window.addEventListener('resize', function () {
            clearTimeout(resizeT);
            resizeT = setTimeout(function () {
                buildDots();
                updateDots();
                updateNavButtons();
            }, 200);
        });

        // ---------- پشتیبانی از کیبورد ----------
        tSlider.setAttribute('tabindex', '0');
        tSlider.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                scrollByCard(-1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                scrollByCard(1);
                e.preventDefault();
            }
        });

        // ---------- راه‌اندازی اولیه ----------
        buildDots();
        updateDots();
        updateNavButtons();
    }
       // ---------- 10. Prenotazione Form — Validation & Submit ----------
    const prenotaForm = document.getElementById('prenotaForm');

    if (prenotaForm) {
        const submitBtn = document.getElementById('submitBtn');
        const successMsg = document.getElementById('formSuccess');
        const errorMsg = document.getElementById('formError');
        const messaggioField = document.getElementById('messaggio');
        const charCount = document.getElementById('charCount');
        const dataField = document.getElementById('data');

        // ---------- تنظیم حداقل تاریخ = امروز ----------
        if (dataField) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dataField.min = `${yyyy}-${mm}-${dd}`;
        }

        // ---------- شمارنده کاراکتر ----------
        if (messaggioField && charCount) {
            messaggioField.addEventListener('input', function () {
                charCount.textContent = this.value.length;
                if (this.value.length > 450) {
                    charCount.style.color = '#FCA5A5';
                } else {
                    charCount.style.color = '';
                }
            });
        }

        // ---------- پیام‌های خطا به ایتالیایی ----------
        const errorMessages = {
            nome: {
                valueMissing: 'Inserisci il tuo nome e cognome.',
                tooShort: 'Il nome deve contenere almeno 2 caratteri.'
            },
            email: {
                valueMissing: 'Inserisci la tua email.',
                typeMismatch: 'Inserisci un indirizzo email valido.'
            },
            telefono: {
                valueMissing: 'Inserisci il tuo numero di telefono.',
                patternMismatch: 'Inserisci un numero di telefono valido.'
            },
            servizio: {
                valueMissing: 'Seleziona un servizio.'
            },
            privacy: {
                valueMissing: 'Devi accettare la Privacy Policy per continuare.'
            }
        };

        // ---------- نمایش خطا برای یک فیلد ----------
        function showError(field, message) {
            const fieldWrapper = field.closest('.prenota__field');
            if (!fieldWrapper) return;

            fieldWrapper.classList.add('has-error');
            fieldWrapper.classList.remove('has-success');

            const errorSpan = fieldWrapper.querySelector('.prenota__error');
            if (errorSpan) {
                errorSpan.textContent = message;
            }
        }

        // ---------- پاک کردن خطا ----------
        function clearError(field) {
            const fieldWrapper = field.closest('.prenota__field');
            if (!fieldWrapper) return;

            fieldWrapper.classList.remove('has-error');
            const errorSpan = fieldWrapper.querySelector('.prenota__error');
            if (errorSpan) {
                errorSpan.textContent = '';
            }
        }

        // ---------- نشان دادن حالت موفق ----------
        function showSuccess(field) {
            const fieldWrapper = field.closest('.prenota__field');
            if (!fieldWrapper) return;
            fieldWrapper.classList.add('has-success');
            fieldWrapper.classList.remove('has-error');
        }

        // ---------- اعتبارسنجی یک فیلد ----------
        function validateField(field) {
            if (!field.checkValidity()) {
                const errors = errorMessages[field.name] || {};
                let message = '';

                // بررسی نوع خطا
                if (field.validity.valueMissing) {
                    message = errors.valueMissing || 'Questo campo è obbligatorio.';
                } else if (field.validity.typeMismatch) {
                    message = errors.typeMismatch || 'Formato non valido.';
                } else if (field.validity.tooShort) {
                    message = errors.tooShort || 'Il valore è troppo corto.';
                } else if (field.validity.patternMismatch) {
                    message = errors.patternMismatch || 'Formato non valido.';
                } else {
                    message = field.validationMessage || 'Campo non valido.';
                }

                showError(field, message);
                return false;
            }

            clearError(field);
            if (field.value.trim()) {
                showSuccess(field);
            }
            return true;
        }

        // ---------- اعتبارسنجی لحظه‌ای ----------
        const fieldsToValidate = prenotaForm.querySelectorAll('input[required], select[required], textarea[required]');

        fieldsToValidate.forEach(function (field) {
            // در لحظه از دست دادن فوکوس
            field.addEventListener('blur', function () {
                validateField(field);
            });

            // هنگام تایپ — خطا رو پاک کن
            field.addEventListener('input', function () {
                const fieldWrapper = field.closest('.prenota__field');
                if (fieldWrapper && fieldWrapper.classList.contains('has-error')) {
                    validateField(field);
                }
            });

            // برای select و checkbox
            field.addEventListener('change', function () {
                const fieldWrapper = field.closest('.prenota__field');
                if (fieldWrapper && fieldWrapper.classList.contains('has-error')) {
                    validateField(field);
                }
            });
        });

        // ---------- اعتبارسنجی همه فیلدها ----------
        function validateAll() {
            let allValid = true;
            let firstInvalid = null;

            fieldsToValidate.forEach(function (field) {
                if (!validateField(field)) {
                    allValid = false;
                    if (!firstInvalid) firstInvalid = field;
                }
            });

            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            return allValid;
        }

        // ---------- ارسال فرم ----------
        prenotaForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // مخفی کردن پیام خطای قبلی
            errorMsg.classList.remove('is-visible');

            // اعتبارسنجی
            if (!validateAll()) {
                return;
            }

            // شروع حالت loading
            submitBtn.classList.add('is-loading');
            submitBtn.disabled = true;

            // جمع‌آوری داده‌ها
            const formData = new FormData(prenotaForm);
            const data = Object.fromEntries(formData.entries());

            // ---------- اینجا رو با API واقعی جایگزین کن ----------
            // مثال ۱: Formspree
            // const response = await fetch('https://formspree.io/f/YOUR_ID', {
            //     method: 'POST',
            //     body: formData,
            //     headers: { 'Accept': 'application/json' }
            // });

            // مثال ۲: Netlify Forms (فقط data-netlify="true" به فرم اضافه کن)
            // const response = await fetch('/', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            //     body: new URLSearchParams(formData).toString()
            // });

            // ---------- شبیه‌سازی ارسال (برای تست) ----------
            try {
                await new Promise(function (resolve) { setTimeout(resolve, 1500); });

                // لاگ داده‌ها (برای debug)
                console.log('Form data:', data);

                // نمایش پیام موفقیت
                prenotaForm.querySelectorAll('.prenota__field, .prenota__form-header, .prenota__submit').forEach(function (el) {
                    el.style.display = 'none';
                });
                successMsg.classList.add('is-visible');

                // اسکرول به پیام موفقیت
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // ---------- اختیاری: ریست فرم بعد از ۵ ثانیه ----------
                // setTimeout(function () {
                //     prenotaForm.reset();
                //     location.reload();
                // }, 5000);

            } catch (error) {
                console.error('Form submission error:', error);

                // نمایش پیام خطا
                errorMsg.classList.add('is-visible');
                errorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } finally {
                // پایان حالت loading
                submitBtn.classList.remove('is-loading');
                submitBtn.disabled = false;
            }
        });

        // ---------- بهبود UX: پاک کردن خطا با Escape ----------
        prenotaForm.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                prenotaForm.querySelectorAll('.prenota__field.has-error').forEach(function (field) {
                    field.classList.remove('has-error');
                });
            }
        });
    }
       // ---------- 11. Footer — Current Year ----------
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ---------- 12. Back to Top Button ----------
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        // نمایش/مخفی کردن دکمه هنگام اسکرول
        let backToTopTicking = false;

        function handleBackToTop() {
            const scrollY = window.scrollY;
            const showAfter = window.innerHeight * 1.5;

            if (scrollY > showAfter) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }

            backToTopTicking = false;
        }

        window.addEventListener('scroll', function () {
            if (!backToTopTicking) {
                window.requestAnimationFrame(handleBackToTop);
                backToTopTicking = true;
            }
        }, { passive: true });

        // کلیک روی دکمه
        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // بررسی اولیه
        handleBackToTop();
    }
})();


