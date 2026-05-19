document.addEventListener('DOMContentLoaded', () => {
    console.log("Phase 3: JS Initialized with Intersection Observer");

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to animate
    const animatableElements = document.querySelectorAll('.animate-on-scroll');
    animatableElements.forEach(el => observer.observe(el));
});
