/**
 * animations.js — DOM Animation Layer
 * Custom cursor, tilt effects, GSAP scroll animations,
 * type cycling, metric counters, and scroll progress.
 *
 * Dependencies: GSAP 3.12+, ScrollTrigger, VanillaTilt
 */
document.addEventListener('DOMContentLoaded', () => {
    // Respect prefers-reduced-motion globally
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // 1. CUSTOM CURSOR
    // ==========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Outline follows with GSAP smooth easing
            gsap.to(cursorOutline, {
                x: posX,
                y: posY,
                duration: 0.15,
                ease: 'power2.out'
            });
        });

        // Hover states for interactive elements
        const hoverTargets = document.querySelectorAll(
            'a, button, .btn, .skill-tag, .strategy-card, .cert-tag, .exp-tag'
        );
        hoverTargets.forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hovering');
                gsap.to(cursorDot, { scale: 0, duration: 0.2 });
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hovering');
                gsap.to(cursorDot, { scale: 1, duration: 0.2 });
            });
        });
    }

    // ==========================================
    // 2. VANILLA TILT (3D Glass Panels)
    // ==========================================
    if (typeof VanillaTilt !== 'undefined' && window.innerWidth > 768 && !prefersReducedMotion) {
        const tiltElements = document.querySelectorAll('.glass-panel[data-tilt]');
        if (tiltElements.length > 0) {
            VanillaTilt.init(Array.from(tiltElements), {
                max: 4,
                speed: 400,
                glare: true,
                'max-glare': 0.08,
                scale: 1.01
            });
        }
    }

    // ==========================================
    // 3. GSAP SCROLL ANIMATIONS
    // ==========================================
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
        // ------------------------------------------
        // Hero Section — Stagger Timeline
        // ------------------------------------------
        const heroTitles = document.querySelectorAll('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroTypeCycle = document.querySelector('.type-cycle');
        const heroCTAs = document.querySelectorAll('#hero .btn');
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Animate each hero-title line
        if (heroTitles.length > 0) {
            heroTitles.forEach((title, i) => {
                heroTimeline.fromTo(
                    title,
                    { y: 60, opacity: 0, rotationX: 10 },
                    { y: 0, opacity: 1, rotationX: 0, duration: 1 },
                    i === 0 ? 0.2 : '-=0.6'
                );
            });
        }

        // Hero subtitle
        if (heroSubtitle) {
            heroTimeline.fromTo(
                heroSubtitle,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                '-=0.5'
            );
        }

        // Type cycle container
        if (heroTypeCycle) {
            heroTimeline.fromTo(
                heroTypeCycle,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6 },
                '-=0.4'
            );
        }

        // CTA buttons stagger in
        if (heroCTAs.length > 0) {
            heroTimeline.fromTo(
                heroCTAs,
                { y: 20, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.5)' },
                '-=0.3'
            );
        }

        // Hero parallax on scroll
        const heroOverlay = document.querySelector('.hero-overlay');
        if (heroOverlay) {
            gsap.to(heroOverlay, {
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                },
                y: 150,
                opacity: 0,
                ease: 'none'
            });
        }

        // ------------------------------------------
        // Section Titles — Scroll Reveal
        // ------------------------------------------
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach((title) => {
            gsap.fromTo(
                title,
                { y: 50, opacity: 0 },
                {
                    scrollTrigger: {
                        trigger: title,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    },
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power2.out'
                }
            );
        });
    }

    // ==========================================
    // 4. SCROLL PROGRESS BAR
    // ==========================================
    const scrollProgressBar = document.getElementById('scroll-progress');

    if (scrollProgressBar) {
        window.addEventListener(
            'scroll',
            () => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                scrollProgressBar.style.width = `${progress}%`;
            },
            { passive: true }
        );
    }

    // ==========================================
    // 5. TYPE CYCLING
    // ==========================================
    const cycleWords = document.querySelectorAll('.cycle-word');

    if (cycleWords.length > 1) {
        let currentCycleIndex = 0;

        // Ensure first word is active
        cycleWords[0].classList.add('active');

        setInterval(() => {
            cycleWords[currentCycleIndex].classList.remove('active');
            currentCycleIndex = (currentCycleIndex + 1) % cycleWords.length;
            cycleWords[currentCycleIndex].classList.add('active');
        }, 2000);
    }

    // ==========================================
    // 6. METRIC COUNTER ANIMATION
    // ==========================================
    const metricNumbers = document.querySelectorAll('.metric-number');

    if (metricNumbers.length > 0) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    const el = entry.target;
                    const raw = el.getAttribute('data-count');

                    // Handle text values like "Zero"
                    if (raw && isNaN(parseInt(raw, 10))) {
                        el.textContent = raw;
                        counterObserver.unobserve(el);
                        return;
                    }

                    const target = parseInt(raw, 10) || 0;
                    const suffix = el.textContent.replace(/[\d,]/g, '').trim(); // e.g. '+', '%'

                    // Animate with GSAP
                    const counter = { value: 0 };
                    gsap.to(counter, {
                        value: target,
                        duration: 2,
                        ease: 'power1.out',
                        snap: { value: 1 },
                        onUpdate: () => {
                            el.textContent = Math.round(counter.value) + suffix;
                        }
                    });

                    counterObserver.unobserve(el);
                });
            },
            { threshold: 0.5 }
        );

        metricNumbers.forEach((el) => counterObserver.observe(el));
    }

    // ==========================================
    // 7. INTERSECTION OBSERVER — .animate-on-scroll
    // ==========================================
    const animatableElements = document.querySelectorAll('.animate-on-scroll');

    if (animatableElements.length > 0) {
        const scrollObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.12
            }
        );

        animatableElements.forEach((el) => scrollObserver.observe(el));
    }
});
