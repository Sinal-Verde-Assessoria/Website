// =========================
// SERVICES PAGE JAVASCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    
    // Category Filter
    const categoryButtons = document.querySelectorAll('.category-btn');
    const serviceBlocks = document.querySelectorAll('.service-block');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter service blocks
            serviceBlocks.forEach(block => {
                if (category === 'all' || block.getAttribute('data-category') === category) {
                    block.classList.remove('hidden');
                    block.style.animation = 'fadeIn 0.5s ease';
                } else {
                    block.classList.add('hidden');
                }
            });
            
            // Smooth scroll to first visible service
            setTimeout(() => {
                const firstVisible = document.querySelector('.service-block:not(.hidden)');
                if (firstVisible) {
                    const offset = 150;
                    const elementPosition = firstVisible.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });
    });
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offset = 150;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // If it's a service block, highlight it
                if (targetElement.classList.contains('service-block')) {
                    targetElement.style.animation = 'pulse 1s ease';
                    setTimeout(() => {
                        targetElement.style.animation = '';
                    }, 1000);
                }
            }
        });
    });
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
            }
            70% {
                box-shadow: 0 0 0 20px rgba(22, 163, 74, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Animate process steps on scroll
    const processSteps = document.querySelectorAll('.process-step');
    
    if (processSteps.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.animation = 'fadeIn 0.6s ease forwards';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        processSteps.forEach(step => {
            step.style.opacity = '0';
            observer.observe(step);
        });
    }
    
    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    if (featureCards.length > 0) {
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = `slideInUp 0.6s ease ${index * 0.1}s forwards`;
                    featureObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        
        featureCards.forEach(card => {
            card.style.opacity = '0';
            featureObserver.observe(card);
        });
    }
    
    // Add slideInUp animation
    if (!document.querySelector('#services-animations')) {
        const animationStyles = document.createElement('style');
        animationStyles.id = 'services-animations';
        animationStyles.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(animationStyles);
    }
    
    // Category navigation sticky behavior enhancement
    const categoriesNav = document.querySelector('.services-categories');
    const header = document.querySelector('.main-header');
    
    if (categoriesNav && header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 200) {
                // Scrolling down
                categoriesNav.style.top = '0';
            } else {
                // Scrolling up
                const headerHeight = header.offsetHeight;
                categoriesNav.style.top = `${headerHeight}px`;
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Service block hover effect
    serviceBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Add transition to service blocks
    serviceBlocks.forEach(block => {
        block.style.transition = 'all 0.3s ease';
    });
});