/**
 * i18n.js - Sistema de Internacionalização
 * Gerencia mudanças de idioma e persistência de preferências
 */

(function() {
    'use strict';
    
    class I18nManager {
        constructor() {
            this.currentLang = this.detectCurrentLanguage();
            this.availableLanguages = ['pt', 'en', 'es'];
            this.init();
        }
        
        /**
         * Detecta o idioma atual baseado na URL
         */
        detectCurrentLanguage() {
            const path = window.location.pathname;
            
            // Verifica se há prefixo de idioma na URL
            const langMatch = path.match(/^\/(en|es|pt)\//);
            if (langMatch) {
                return langMatch[1];
            }
            
            // Se não há prefixo ou é raiz, assume português
            return 'pt';
        }
        
        /**
         * Inicializa o sistema de idiomas
         */
        init() {
            this.updateLanguageSelector();
            this.attachEventListeners();
            this.setDocumentLanguage();
        }
        
        /**
         * Atualiza o seletor de idiomas para refletir o idioma atual
         */
        updateLanguageSelector() {
            const langConfig = {
                pt: { flag: '🇧🇷', code: 'PT', name: 'Português' },
                en: { flag: '🇺🇸', code: 'EN', name: 'English' },
                es: { flag: '🇪🇸', code: 'ES', name: 'Español' }
            };
            
            const config = langConfig[this.currentLang];
            if (!config) return;
            
            // Atualiza o botão atual
            const langButton = document.querySelector('.lang-current');
            if (langButton) {
                langButton.innerHTML = `
                    <span class="flag-emoji">${config.flag}</span>
                    <span>${config.code}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
            }
            
            // Atualiza as opções e marca a atual como ativa
            const langOptions = document.querySelectorAll('.lang-option');
            langOptions.forEach(option => {
                const optionLang = option.getAttribute('data-lang');
                if (optionLang === this.currentLang) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
                
                // Atualiza o href da opção
                const newHref = this.generateLanguageUrl(optionLang);
                option.setAttribute('href', newHref);
            });
        }
        
        /**
         * Gera a URL correta para um idioma específico
         */
        /**
 * Gera a URL correta para um idioma específico
 */
generateLanguageUrl(targetLang) {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // Remove o idioma atual se existir
    if (['pt', 'en', 'es'].includes(pathParts[0])) {
        pathParts.shift();
    }
    
    // Reconstrói o caminho
    let newPath = pathParts.join('/');
    
    // Se não houver caminho ou for index, vai para raiz do idioma
    if (!newPath || newPath === 'index.html') {
        return `/${targetLang}/`;
    }
    
    // Mantém a mesma página no novo idioma
    return `/${targetLang}/${newPath}`;
}
        
        /**
         * Adiciona event listeners
         */
        attachEventListeners() {
            // Click nas opções de idioma
            document.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newLang = option.getAttribute('data-lang');
                    const newUrl = this.generateLanguageUrl(newLang);
                    
                    // Salva preferência no localStorage
                    localStorage.setItem('preferredLanguage', newLang);
                    
                    // Navega para a nova URL
                    window.location.href = newUrl;
                });
            });
            
            // Toggle do dropdown
            const langDropdown = document.querySelector('.lang-dropdown');
            const langCurrent = document.querySelector('.lang-current');
            
            if (langCurrent && langDropdown) {
                langCurrent.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    langDropdown.classList.toggle('active');
                });
                
                // Fecha ao clicar fora
                document.addEventListener('click', (e) => {
                    if (!langDropdown.contains(e.target)) {
                        langDropdown.classList.remove('active');
                    }
                });
            }
            
            // Atalhos de teclado
            this.initKeyboardShortcuts();
        }
        
        /**
         * Inicializa atalhos de teclado
         */
        initKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Alt + L para abrir seletor
                if (e.altKey && e.key === 'l') {
                    e.preventDefault();
                    const langDropdown = document.querySelector('.lang-dropdown');
                    if (langDropdown) {
                        langDropdown.classList.toggle('active');
                    }
                }
                
                // Alt + 1, 2, 3 para trocar idioma
                if (e.altKey) {
                    const langMap = { '1': 'pt', '2': 'en', '3': 'es' };
                    if (langMap[e.key]) {
                        e.preventDefault();
                        const newUrl = this.generateLanguageUrl(langMap[e.key]);
                        window.location.href = newUrl;
                    }
                }
            });
        }
        
        /**
         * Define atributos de idioma no documento
         */
        setDocumentLanguage() {
            const langMap = {
                pt: 'pt-BR',
                en: 'en-US',
                es: 'es-ES'
            };
            
            document.documentElement.lang = langMap[this.currentLang] || 'pt-BR';
            document.documentElement.dir = 'ltr';
            document.body.classList.add(`lang-${this.currentLang}`);
        }
        
        /**
         * Verifica se há preferência salva e sugere mudança
         */
        checkSavedPreference() {
            const savedLang = localStorage.getItem('preferredLanguage');
            
            if (savedLang && savedLang !== this.currentLang && !sessionStorage.getItem('langSuggestionShown')) {
                // Mostra sugestão apenas uma vez por sessão
                sessionStorage.setItem('langSuggestionShown', 'true');
                
                // Cria notificação suave
                setTimeout(() => {
                    this.showLanguageSuggestion(savedLang);
                }, 2000);
            }
        }
        
        /**
         * Mostra sugestão de idioma
         */
        showLanguageSuggestion(lang) {
            const langNames = {
                pt: 'Português',
                en: 'English',
                es: 'Español'
            };
            
            const notification = document.createElement('div');
            notification.className = 'lang-suggestion';
            notification.innerHTML = `
                <p>Preferência de idioma: ${langNames[lang]}</p>
                <button onclick="window.i18n.switchToLanguage('${lang}')">Mudar</button>
                <button onclick="this.parentElement.remove()">×</button>
            `;
            
            document.body.appendChild(notification);
            
            // Remove após 10 segundos
            setTimeout(() => {
                notification.remove();
            }, 10000);
        }
        
        /**
         * Muda para um idioma específico
         */
        switchToLanguage(lang) {
            const newUrl = this.generateLanguageUrl(lang);
            window.location.href = newUrl;
        }
    }
    
    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.i18n = new I18nManager();
        });
    } else {
        window.itml = new I18nManager();
    }
})();