// =========================
// BLOG SYSTEM V3.0 - INTERATIVIDADE CLIENT-SIDE
// Adiciona interatividade aos posts estáticos gerados pelo build.
// =========================

class BlogSystem {
    constructor() {
        // As propriedades de estado (posts, lang, etc.) agora são inferidas do DOM
        // ou desnecessárias, pois o HTML já está pronto.
        this.currentLang = this.getCurrentLanguage();
        this.posts = Array.from(document.querySelectorAll('.blog-card'));
        this.currentCategory = this.getInitialCategory();
        this.searchTerm = '';
        this.init();
    }

    // Detecta idioma atual (da URL)
    getCurrentLanguage() {
        const path = window.location.pathname;
        const langMatch = path.match(/^\/(pt|en|es)\//);
        return langMatch ? langMatch[1] : 'pt';
    }

    // Pega a categoria inicial da URL, se houver
    getInitialCategory() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('category') || 'all';
    }

    // Inicializa o sistema, apenas configurando os event listeners
    init() {
        this.setupEventListeners();
        this.updateCategoryButtons();
        // Nenhuma renderização inicial é necessária, pois o HTML já está pronto
    }

    // Configura os event listeners para os botões de filtro e busca
    setupEventListeners() {
        // Filtro de Categorias
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const newCategory = e.target.getAttribute('data-category');
                this.filterPosts(newCategory);
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

    // Lógica para filtrar posts
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

    // Lógica para buscar posts
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

    // Atualiza o estado visual dos botões de categoria
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