// =========================
// SERVICES PAGE JAVASCRIPT
// =========================

document.addEventListener('DOMContentLoaded', function() {
    
    // Category Filter System
    const categoryButtons = document.querySelectorAll('.category-btn');
    const serviceBlocks = document.querySelectorAll('.service-block');
    
    // Add "all" button functionality
    const allButton = document.querySelector('.category-btn[data-category="all"]');
    if (!allButton && categoryButtons.length > 0) {
        // Create "All Services" button if it doesn't exist
        const categoriesNav = document.querySelector('.categories-nav');
        if (categoriesNav) {
            const allBtn = document.createElement('button');
            allBtn.className = 'category-btn active';
            allBtn.setAttribute('data-category', 'all');
            allBtn.innerHTML = '<i class="fas fa-th"></i> <span>Todos os Serviços</span>';
            categoriesNav.insertBefore(allBtn, categoriesNav.firstChild);
        }
    }
    
    // Re-query buttons after potentially adding "all" button
    const updatedCategoryButtons = document.querySelectorAll('.category-btn');
    
    updatedCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            updatedCategoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter service blocks
            let visibleCount = 0;
            serviceBlocks.forEach(block => {
                const blockCategory = block.getAttribute('data-category');
                
                if (category === 'all' || blockCategory === category) {
                    block.style.display = 'block';
                    block.classList.remove('hidden');
                    // Add fade-in animation
                    block.style.opacity = '0';
                    setTimeout(() => {
                        block.style.transition = 'opacity 0.5s ease';
                        block.style.opacity = '1';
                    }, 50);
                    visibleCount++;
                } else {
                    block.style.display = 'none';
                    block.classList.add('hidden');
                }
            });
            
            // If no services visible, show a message
            if (visibleCount === 0) {
                const servicesDetail = document.querySelector('.services-detail');
                if (servicesDetail && !document.querySelector('.no-services-message')) {
                    const message = document.createElement('div');
                    message.className = 'no-services-message';
                    message.style.cssText = 'text-align: center; padding: 3rem; color: #666;';
                    message.innerHTML = '<p>Nenhum serviço disponível nesta categoria.</p>';
                    servicesDetail.appendChild(message);
                }
            } else {
                // Remove no services message if exists
                const noServicesMsg = document.querySelector('.no-services-message');
                if (noServicesMsg) {
                    noServicesMsg.remove();
                }
            }
            
            // Smooth scroll to first visible service
            if (visibleCount > 0) {
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
            }
        });
    });
    
    // Set initial state - show all services
    const initialActiveBtn = document.querySelector('.category-btn.active');
    if (!initialActiveBtn && updatedCategoryButtons.length > 0) {
        updatedCategoryButtons[0].classList.add('active');
    }
    
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isOpen = item.classList.contains('active');
                
                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = '0';
                        }
                    }
                });
                
                // Toggle current FAQ
                if (isOpen) {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0';
                } else {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.feature-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Process timeline animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe process steps
    document.querySelectorAll('.process-step').forEach(step => {
        observer.observe(step);
    });
    
    // Observe benefit items
    document.querySelectorAll('.benefit-item').forEach(item => {
        observer.observe(item);
    });
});