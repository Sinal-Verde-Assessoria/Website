// Article page interactions
document.addEventListener('DOMContentLoaded', function() {
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    const articleUrl = window.location.href;
    const articleTitle = document.querySelector('.article-title').textContent;
    
    shareButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            let shareUrl = '';
            
            if (btn.classList.contains('linkedin')) {
                shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
            } else if (btn.classList.contains('twitter')) {
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(articleUrl)}`;
            } else if (btn.classList.contains('facebook')) {
                shareUrl = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
            } else if (btn.classList.contains('whatsapp')) {
                shareUrl = `https://wa.me/?text=${encodeURIComponent(articleTitle + ' ' + articleUrl)}`;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
    
    // Reading progress bar
    const article = document.querySelector('.article-content');
    if (article) {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#16a34a,#15803d);z-index:9999;transition:width 0.1s';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const progress = (scrollTop / (articleHeight - windowHeight)) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        });
    }
});
