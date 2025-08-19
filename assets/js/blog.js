// =========================
// BLOG SYSTEM V3.0 - INTERATIVIDADE CLIENT-SIDE
// =========================

class BlogSystem {
    constructor() {
        this.currentLang = this.getCurrentLanguage();
        this.posts = Array.from(document.querySelectorAll('.blog-card'));
        this.currentCategory = this.getInitialCategory();
        this.searchTerm = '';
        this.init();
    }

    getCurrentLanguage() {
        const path = window.location.pathname;
        const langMatch = path.match(/^\/(pt|en|es)\//);
        return langMatch ? langMatch[1] : 'pt';
    }

    getInitialCategory() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || 'all';
    }

    init() {
        this.addAllCategoriesButton();
        this.setupEventListeners();
        this.updateCategoryButtons();
        
        // Aplicar filtro inicial se houver
        if (this.currentCategory !== 'all') {
            this.filterPosts(this.currentCategory);
        }
    }

    addAllCategoriesButton() {
        const categoriesContainer = document.querySelector('.categories-scroll');
        if (categoriesContainer && !document.querySelector('[data-category="all"]')) {
            const allBtn = document.createElement('a');
            allBtn.href = '/blog.html?category=all';
            allBtn.className = 'category-tag';
            allBtn.setAttribute('data-category', 'all');
            allBtn.textContent = 'Todas as Matérias';
            categoriesContainer.insertBefore(allBtn, categoriesContainer.firstChild);
        }
    }

    setupEventListeners() {
        // Filtro de Categorias
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const newCategory = tag.getAttribute('data-category');
                this.filterPosts(newCategory);
                
                // Atualizar URL
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('category', newCategory);
                window.history.pushState({}, '', newUrl);
            });
        });

        // Busca
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.searchPosts(searchInput.value);
            };
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });
        }
    }

    filterPosts(category) {
        this.currentCategory = category;
        this.updateCategoryButtons();
        
        this.posts.forEach(post => {
            const postCategory = post.getAttribute('data-category');
            if (category === 'all' || postCategory === category) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    searchPosts(term) {
        this.searchTerm = term.toLowerCase();
        
        this.posts.forEach(post => {
            const title = post.querySelector('h3')?.textContent.toLowerCase() || '';
            const excerpt = post.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(this.searchTerm) || excerpt.includes(this.searchTerm)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    updateCategoryButtons() {
        document.querySelectorAll('.category-tag').forEach(tag => {
            if (tag.getAttribute('data-category') === this.currentCategory) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
    }
}

// Inicializa o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new BlogSystem();
});