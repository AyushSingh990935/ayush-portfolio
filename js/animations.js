document.addEventListener('DOMContentLoaded', () => {
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

            // Outline follows with GSAP smooth animation
            gsap.to(cursorOutline, {
                x: posX,
                y: posY,
                duration: 0.15,
                ease: 'power2.out'
            });
        });

        // Add hover effect to links and buttons
        const hoverElements = document.querySelectorAll('a, button, .btn, .cert-tag');
        hoverElements.forEach(el => {
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
    // 2. VANILLA TILT (3D Cards)
    // ==========================================
    const tiltElements = document.querySelectorAll('.exp-list-item, .edu-card, .contact-card-premium');
    if (typeof VanillaTilt !== 'undefined' && window.innerWidth > 768) {
        // Apply 3D perspective to elements to make them pop out
        tiltElements.forEach(el => {
            el.style.transformStyle = 'preserve-3d';
            // Also apply translateZ to direct children for the 3D pop effect
            Array.from(el.children).forEach(child => {
                if(child.tagName !== 'SPLINE-VIEWER' && !child.style.zIndex) {
                    child.style.transform = 'translateZ(40px)';
                    child.style.transition = 'transform 0.3s ease-out';
                }
            });
        });
        VanillaTilt.init(tiltElements, {
            max: 12,
            speed: 400,
            glare: true,
            "max-glare": 0.15,
            scale: 1.05
        });
    }

    // ==========================================
    // 3. GSAP SCROLL ANIMATIONS
    // ==========================================
    gsap.registerPlugin(ScrollTrigger);

    // Hero Section Parallax & Stagger
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroBadges = document.querySelectorAll('.hero-badges .badge');

    const heroTimeline = gsap.timeline();
    
    if (heroTitle) {
        // Initial load animation
        heroTimeline.fromTo(heroTitle, 
            { y: 50, opacity: 0, rotationX: 20 },
            { y: 0, opacity: 1, rotationX: 0, duration: 1, ease: 'power3.out' }
        )
        .fromTo(heroSubtitle,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            "-=0.6"
        )
        .fromTo(heroBadges,
            { y: 20, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' },
            "-=0.4"
        );

        // Parallax effect on scroll
        gsap.to('.hero-overlay', {
            scrollTrigger: {
                trigger: '#home',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: 150,
            opacity: 0,
            ease: 'none'
        });
    }

    // Fade in sections on scroll
    const sections = document.querySelectorAll('.section-title');
    sections.forEach(section => {
        gsap.fromTo(section,
            { y: 40, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: section,
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
});
