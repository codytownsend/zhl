document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // GSAP HERO SECTION ANIMATIONS
    // ============================================
    
    // Check if GSAP loaded
    if (typeof gsap !== 'undefined') {
        
        // Mark that GSAP is ready
        document.documentElement.classList.add('gsap-ready');
        
        // Register GSAP plugin
        gsap.registerPlugin(ScrollTrigger);
        
        // Set initial states explicitly
        gsap.set(['.hero-title', '.hero-subtitle', '.cta-button'], {
            opacity: 0,
            y: 50
        });
        
        // BLINDS FLIP ANIMATION
        masterTimeline.to('.blind', {
            rotationY: 0,      // Flip to flat (revealing image)
            opacity: 1,        // Fade in
            duration: 0.6,     // Duration for each blind
            stagger: {
                each: 0.5,     // Wait 0.5s between each blind
                from: "start"  // Start from left
            },
            ease: "power2.inOut",
            onStart: () => console.log('🎭 Blinds flipping IN to reveal image...')
        });
        
        // TEXT ANIMATIONS
        masterTimeline.to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.4")
        .to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6")
        .to('.cta-button', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out"
        }, "-=0.4");
        
        // Subtle parallax effect on the blinds (image)
        gsap.to('.hero-blinds', {
            y: 100,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero',
                start: "top top",
                end: "bottom top",
                scrub: 1,
                onEnter: () => console.log('📜 Parallax active')
            }
        });
        
    } else {
        console.error('❌ GSAP not loaded - showing content immediately');
        // Fallback: show content immediately if GSAP doesn't load
        const elements = document.querySelectorAll('.hero-title, .hero-subtitle, .cta-button');
        elements.forEach(el => {
            if (el) el.style.opacity = '1';
        });
        // Hide blinds if GSAP fails
        const blinds = document.querySelector('.hero-blinds');
        if (blinds) blinds.style.display = 'none';
    }
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            
            // Prevent scrolling when menu is open on mobile
            if (isExpanded) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active navigation link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        // Check if user is at bottom of page
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 10;
        
        if (isAtBottom) {
            // If at bottom, activate the last section (contact)
            navLinks.forEach(link => link.removeAttribute('aria-current'));
            const contactLink = document.querySelector('.nav-link[href="#contact"]');
            if (contactLink) {
                contactLink.setAttribute('aria-current', 'page');
            }
            return;
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.removeAttribute('aria-current'));
                if (navLink) {
                    navLink.setAttribute('aria-current', 'page');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);

    // Testimonial carousel functionality
    const testimonialDots = document.querySelectorAll('.nav-dot');
    const testimonials = [
        {
            image: '',
            logo: 'Vela Coffee Co.',
            quote: 'ZHL transformed our online store from a basic catalog into an experience that actually converts. Our AOV increased by 167%, and customers keep telling us how much easier it is to shop with us now.',
            description: 'Rachel is our brand strategy and web design client, where we redefined NovaTech\'s identity and launched a new website that elevated their online presence.',
            name: 'Marcus Wright',
            title: 'Founder & CEO'
        },
        {
            image: '',
            logo: 'Haven Furniture',
            quote: "We were hemorrhaging customers at checkout. ZHL identified every friction point and rebuilt our flow from the ground up. Cart abandonment dropped by half, and our conversion rate doubled. Best investment we've made.",
            description: 'Working with ZHL transformed our digital presence and significantly increased our conversion rates.',
            name: 'Sophia Patel',
            title: 'Director of Digital'
        },
        {
            image: '',
            logo: 'Atlas Outdoors',
            quote: "Working with ZHL felt like having a secret weapon. They didn't just make our site look incredible, they engineered it to sell. Our conversions are up, and we're finally competing with the big brands.",
            description: 'Their data-driven approach and creative solutions helped us reach new markets effectively.',
            name: 'James Rivera',
            title: 'VP of Marketing'
        }
    ];

    let currentTestimonial = 0;

    function updateTestimonial(index) {
        const testimonial = testimonials[index];
        const clientLogo = document.querySelector('.client-logo');
        const blockquote = document.querySelector('.testimonial-text blockquote');
        const description = document.querySelector('.testimonial-description');
        const authorName = document.querySelector('.author-name');
        const authorTitle = document.querySelector('.author-title');

        if (clientLogo) clientLogo.textContent = testimonial.logo;
        if (blockquote) blockquote.textContent = `"${testimonial.quote}"`;
        if (description) description.textContent = testimonial.description;
        if (authorName) authorName.textContent = testimonial.name;
        if (authorTitle) authorTitle.textContent = testimonial.title;

        // Update active dot
        testimonialDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentTestimonial = index;
            updateTestimonial(currentTestimonial);
        });
    });

    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        updateTestimonial(currentTestimonial);
    }, 5000);

    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    const successMessage = document.getElementById('formSuccessMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Disable form and show loading state
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Hide form and show success message with GSAP
                if (typeof gsap !== 'undefined' && successMessage) {
                    // Fade out form
                    gsap.to(contactForm, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            // Show success message
                            gsap.set(successMessage, { scale: 0.8, opacity: 0 });
                            successMessage.classList.add('show');
                            gsap.to(successMessage, {
                                scale: 1,
                                opacity: 1,
                                duration: 0.5,
                                ease: "back.out(1.7)"
                            });
                        }
                    });
                    
                    // Reset form after 5 seconds
                    setTimeout(() => {
                        gsap.to(successMessage, {
                            scale: 0.8,
                            opacity: 0,
                            duration: 0.3,
                            onComplete: () => {
                                successMessage.classList.remove('show');
                                this.reset();
                                submitBtn.textContent = originalText;
                                submitBtn.disabled = false;
                                gsap.to(contactForm, {
                                    opacity: 1,
                                    duration: 0.3
                                });
                            }
                        });
                    }, 5000);
                } else {
                    // Fallback without GSAP
                    if (successMessage) successMessage.classList.add('show');
                    setTimeout(() => {
                        if (successMessage) successMessage.classList.remove('show');
                        this.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 5000);
                }
            }, 2000);
        });
    }

    // Pricing card hover effects
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.service-card, .case-study, .specialty-card, .pricing-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Case Study Cards - Animate in one at a time
    const caseStudyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-animation-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, delay);
                caseStudyObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });

    const caseStudyCards = document.querySelectorAll('.case-study-card');
    caseStudyCards.forEach(card => {
        caseStudyObserver.observe(card);
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    const logo = document.querySelector('.logo');
    const nav = document.querySelector('.nav-menu');
    const naviLinks = document.querySelectorAll('.nav-link');
    const navbtn = document.querySelector('.contact-button');
    const navbtnLink = document.querySelector('.contact-btn');
    let lastScrollY = window.scrollY;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const isMobile = window.innerWidth <= 768;
        
        // Only apply scroll effects on desktop
        if (!isMobile) {
            if (currentScrollY > 900) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(1px)';
                logo.src = 'img/ZHL-logo(light).png';
                nav.style.background = 'rgba(37, 34, 41, 0.85)';
                navbtn.style.background = '#fff';
                
                naviLinks.forEach(link => {
                    link.style.color = '#F7F5F0';
                });

                navbtnLink.style.color = 'rgba(37, 34, 41, 1)';
            } else {
                header.style.background = 'transparent';
                header.style.boxShadow = 'none';
                logo.src = 'img/ZHL-logo(dark).png';
                header.style.backdropFilter = 'none';
                nav.style.background = 'rgba(245, 237, 224, 0.55)';
                navbtn.style.background = 'rgba(37, 34, 41, 1)';
                
                naviLinks.forEach(link => {
                    link.style.color = '#2c3e50';
                });

                navbtnLink.style.color = '#fff';
            }
        } else {
            // Reset styles on mobile to prevent conflicts
            header.style.background = '';
            header.style.backdropFilter = '';
            nav.style.background = '';
            if (navbtn) navbtn.style.background = '';
            
            naviLinks.forEach(link => {
                link.style.color = '';
            });
            
            if (navbtnLink) navbtnLink.style.color = '';
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial call to set correct state
    handleScroll();

    // Statistics counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number, .specialty-card h3');
        
        counters.forEach(counter => {
            const target = counter.textContent;
            const isPercentage = target.includes('%');
            const isDollar = target.includes('$');
            const isHash = target.includes('#');
            
            let number = parseInt(target.replace(/[^\d]/g, ''));
            if (isNaN(number)) return;

            let current = 0;
            const increment = number / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    current = number;
                    clearInterval(timer);
                }

                let displayValue = Math.floor(current);
                if (isDollar) {
                    displayValue = '$' + displayValue + (number >= 1000000 ? 'M' : '');
                } else if (isPercentage) {
                    displayValue = displayValue + '%';
                } else if (isHash) {
                    displayValue = '#' + displayValue;
                }

                counter.textContent = displayValue;
            }, 20);
        });
    }

    // Trigger counter animation when specialty section is visible
    const specialtySection = document.querySelector('.specialties');
    if (specialtySection) {
        const specialtyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    specialtyObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        specialtyObserver.observe(specialtySection);
    }

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
            body.style.overflow = '';
        }

        // Arrow keys for testimonial navigation
        if (e.target.classList.contains('nav-dot')) {
            let newIndex = currentTestimonial;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                newIndex = currentTestimonial > 0 ? currentTestimonial - 1 : testimonials.length - 1;
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                newIndex = currentTestimonial < testimonials.length - 1 ? currentTestimonial + 1 : 0;
            }
            
            if (newIndex !== currentTestimonial) {
                currentTestimonial = newIndex;
                updateTestimonial(currentTestimonial);
                testimonialDots[currentTestimonial].focus();
            }
        }
    });

    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });

    // Touch gesture support for sliders on mobile
    function addSwipeSupport(container) {
        if (!container) return;
        
        let startX = 0;
        let scrollLeft = 0;
        let isDown = false;

        container.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('touchend', () => {
            isDown = false;
        });
    }

    // Add swipe support to sliders
    const servicesGrid = document.querySelector('.services-grid');
    const caseStudiesGrid = document.querySelector('.case-studies-grid');
    
    if (window.innerWidth <= 768) {
        addSwipeSupport(servicesGrid);
        addSwipeSupport(caseStudiesGrid);
    }

    // Reapply on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            addSwipeSupport(servicesGrid);
            addSwipeSupport(caseStudiesGrid);
        }
    });
});

// Performance optimization: Debounce scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
