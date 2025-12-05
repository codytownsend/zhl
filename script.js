// ZHL - Zero Hour Labs
// Clean, refined interactions

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // SCROLL REVEAL
    // ============================================
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    const revealElements = document.querySelectorAll(
        '.problem-content, ' +
        '.services-header, .service-card, ' +
        '.work-header, .testimonial-card, ' +
        '.process-header, .process-steps, ' +
        '.pricing-header, .pricing-card, ' +
        '.contact-content, .contact-form-container'
    );
    
    revealElements.forEach((el, index) => {
        el.classList.add('reveal-on-scroll');
        
        // Stagger delays for grid items
        if (el.classList.contains('service-card')) {
            const cardIndex = [...document.querySelectorAll('.service-card')].indexOf(el);
            el.style.transitionDelay = `${cardIndex * 0.1}s`;
        } else if (el.classList.contains('testimonial-card')) {
            const cardIndex = [...document.querySelectorAll('.testimonial-card')].indexOf(el);
            el.style.transitionDelay = `${cardIndex * 0.1}s`;
        } else if (el.classList.contains('pricing-card')) {
            const cardIndex = [...document.querySelectorAll('.pricing-card')].indexOf(el);
            el.style.transitionDelay = `${cardIndex * 0.15}s`;
        }
        
        revealObserver.observe(el);
    });

    // ============================================
    // MOBILE NAVIGATION
    // ============================================
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    function openMobileMenu() {
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden';
        
        // Animate toggle to X
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'rotate(45deg) translateY(0)';
        spans[1].style.opacity = '0';
        spans[1].style.transform = 'scaleX(0)';
        spans[2].style.transform = 'rotate(-45deg) translateY(0)';
    }

    function closeMobileMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
        
        // Reset toggle bars
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'translateY(-6px)';
        spans[1].style.opacity = '1';
        spans[1].style.transform = 'translateY(0)';
        spans[2].style.transform = 'translateY(6px)';
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    
    const header = document.querySelector('.header');

    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', throttle(handleHeaderScroll, 50));
    handleHeaderScroll();

    // ============================================
    // STAT COUNTER ANIMATION
    // ============================================
    
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.metric-value').forEach(stat => {
        statObserver.observe(stat);
    });
    
    function animateCounter(element) {
        const text = element.textContent;
        const hasPercent = text.includes('%');
        const hasX = text.includes('x');
        const isNegative = text.includes('-');
        const numMatch = text.match(/[\d.]+/);
        
        if (!numMatch) return;
        
        const target = parseFloat(numMatch[0]);
        const decimals = hasX ? 1 : 0;
        const prefix = isNegative ? '-' : '+';
        const suffix = hasPercent ? '%' : (hasX ? 'x' : '');
        const duration = 1500;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            
            element.textContent = prefix + current.toFixed(decimals) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        element.textContent = prefix + '0' + suffix;
        requestAnimationFrame(update);
    }

    // ============================================
    // FORM HANDLING
    // ============================================
    
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32">
                        <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite"/>
                    </circle>
                </svg>
                Sending...
            `;
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    // Success
                    submitBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Message Sent
                    `;
                    submitBtn.style.background = '#22c55e';
                    this.reset();
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                submitBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    Try Again
                `;
                submitBtn.style.background = '#ef4444';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // ============================================
    // KEYBOARD NAVIGATION
    // ============================================
    
    document.addEventListener('keydown', function(e) {
        // ESC closes mobile menu
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
            navToggle.focus();
        }
    });

    // ============================================
    // PAGE LOAD ANIMATION
    // ============================================
    
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
    
    // Fallback if load event already fired
    if (document.readyState === 'complete') {
        document.body.classList.add('loaded');
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// SERVICES CAROUSEL DOTS
// ============================================

const servicesGrid = document.querySelector('.services-grid');
const dots = document.querySelectorAll('.carousel-dots .dot');

if (servicesGrid && dots.length > 0) {
    servicesGrid.addEventListener('scroll', () => {
        const scrollLeft = servicesGrid.scrollLeft;
        const cardWidth = servicesGrid.querySelector('.service-card').offsetWidth;
        const gap = 16; // var(--space-md)
        const activeIndex = Math.round(scrollLeft / (cardWidth + gap));
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
        });
    });
}