// =========================
// UI INTERACTIONS & ANIMATIONS
// =========================

// Parallax Effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.parallax || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
}

// Animate on Scroll
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animated');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// Typing Effect
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect for hero title if exists
const heroTitle = document.querySelector('.hero-title[data-typing]');
if (heroTitle) {
    const text = heroTitle.textContent;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeWriter(heroTitle, text);
                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(heroTitle);
}

// Ripple Effect for Buttons
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to all buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Magnetic Cursor Effect
function initMagneticCursor() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    });
}

// Progress Bar on Scroll
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Smooth Reveal Animation
function smoothReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1
    });
    
    reveals.forEach(element => {
        observer.observe(element);
    });
}

// Card Tilt Effect
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Glitch Effect for Text
function glitchEffect(element) {
    const text = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let iterations = 0;
    
    const interval = setInterval(() => {
        element.textContent = text
            .split('')
            .map((char, index) => {
                if (index < iterations) {
                    return text[index];
                }
                return glitchChars[Math.floor(Math.random() * glitchChars.length)];
            })
            .join('');
        
        if (iterations >= text.length) {
            clearInterval(interval);
        }
        
        iterations += 1 / 3;
    }, 30);
}

// Apply glitch effect on hover
document.querySelectorAll('[data-glitch]').forEach(element => {
    element.addEventListener('mouseenter', () => {
        glitchEffect(element);
    });
});

// Particle Background
function createParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Image Loading Animation
function initImageLoading() {
    const images = document.querySelectorAll('img:not([data-src])');
    
    images.forEach(img => {
        img.classList.add('loading');
        
        if (img.complete) {
            img.classList.remove('loading');
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.remove('loading');
                this.classList.add('loaded');
            });
        }
    });
}

// Cursor Trail Effect
function initCursorTrail() {
    if (window.innerWidth < 768) return; // Disable on mobile
    
    const trail = [];
    const trailLength = 20;
    
    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.opacity = (i + 1) / trailLength;
        document.body.appendChild(dot);
        trail.push(dot);
    }
    
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateTrail() {
        let x = mouseX;
        let y = mouseY;
        
        trail.forEach((dot, index) => {
            const nextDot = trail[index + 1] || trail[0];
            dot.style.left = x + 'px';
            dot.style.top = y + 'px';
            x += (nextDot.offsetLeft - dot.offsetLeft) * 0.3;
            y += (nextDot.offsetTop - dot.offsetTop) * 0.3;
        });
        
        requestAnimationFrame(animateTrail);
    }
    
    animateTrail();
}

// Initialize all UI effects
document.addEventListener('DOMContentLoaded', function() {
    initParallax();
    initScrollAnimations();
    initMagneticCursor();
    initScrollProgress();
    smoothReveal();
    initTiltEffect();
    createParticles();
    initImageLoading();
    
    // Only init cursor trail on desktop
    if (window.innerWidth > 1024) {
        // initCursorTrail(); // Commented out for performance
    }
});

// Add CSS for UI effects
const style = document.createElement('style');
style.textContent = `
    /* Ripple Effect */
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Scroll Progress */
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--primary), var(--primary-light));
        z-index: 1000;
        transition: width 0.1s ease;
    }
    
    /* Reveal Animation */
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    
    .reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* AOS Animation */
    [data-aos] {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    [data-aos].aos-animated {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Tilt Effect */
    [data-tilt] {
        transition: transform 0.1s ease;
        transform-style: preserve-3d;
    }
    
    /* Loading Images */
    img.loading {
        filter: blur(5px);
        opacity: 0;
    }
    
    img.loaded {
        filter: blur(0);
        opacity: 1;
        transition: filter 0.5s, opacity 0.5s;
    }
    
    /* Particle */
    .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--primary);
        border-radius: 50%;
        opacity: 0.3;
        animation: float-particle linear infinite;
    }
    
    @keyframes float-particle {
        from {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.3;
        }
        90% {
            opacity: 0.3;
        }
        to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    /* Cursor Trail */
    .cursor-trail {
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--primary);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
    }
    
    /* Cookie Banner */
    .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--text-primary);
        color: var(--white);
        padding: 1.5rem;
        z-index: 1000;
        animation: slideUp 0.5s ease;
    }
    
    .cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
    }
    
    .cookie-banner a {
        color: var(--primary-light);
        text-decoration: underline;
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
    
    /* Error Messages */
    .error .error-message {
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
    
    .error input,
    .error textarea {
        border-color: #ef4444;
    }
    
    /* Success Message */
    .success-message {
        background: #10b981;
        color: white;
        padding: 2rem;
        border-radius: var(--radius);
        text-align: center;
        margin-top: 2rem;
        animation: fadeIn 0.5s ease;
    }
    
    .success-message i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
    }
    
    /* Header Scroll Effects */
    .main-header.scrolled {
        box-shadow: var(--shadow-lg);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .main-header.hide {
        transform: translateY(-100%);
    }
    
    /* Menu Open State */
    body.menu-open {
        overflow: hidden;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);