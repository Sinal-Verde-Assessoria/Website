/**
 * cookies.js - Sistema de Cookies e LGPD Compliance
 * Multilingual cookie consent modal
 */

(function() {
    'use strict';
    
    // Traduções do modal de cookies
    const cookieTranslations = {
        pt: {
            title: 'Política de Cookies',
            message: 'Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa',
            link: 'Política de Privacidade',
            accept: 'Aceitar',
            decline: 'Recusar',
            customize: 'Personalizar'
        },
        en: {
            title: 'Cookie Policy',
            message: 'We use cookies to improve your experience. By continuing to browse, you agree to our',
            link: 'Privacy Policy',
            accept: 'Accept',
            decline: 'Decline',
            customize: 'Customize'
        },
        es: {
            title: 'Política de Cookies',
            message: 'Usamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra',
            link: 'Política de Privacidad',
            accept: 'Aceptar',
            decline: 'Rechazar',
            customize: 'Personalizar'
        }
    };
    
    class CookieManager {
        constructor() {
            this.cookieName = 'sinal_verde_cookies_accepted';
            this.cookieExpiry = 365; // days
            this.currentLang = this.detectLanguage();
            this.init();
        }
        
        detectLanguage() {
            const path = window.location.pathname;
            const langMatch = path.match(/^\/(en|es|pt)\//);
            if (langMatch) {
                return langMatch[1];
            }
            return 'pt';
        }
        
        init() {
            // Verifica se já aceitou cookies
            if (!this.getCookie(this.cookieName)) {
                this.showCookieModal();
            }
            
            // Adiciona listeners para links de política
            document.addEventListener('click', (e) => {
                if (e.target.matches('[data-show-cookies]')) {
                    e.preventDefault();
                    this.showCookieModal(true);
                }
            });
        }
        
        showCookieModal(force = false) {
            // Se já existe modal, remove
            const existingModal = document.getElementById('cookie-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Se não for forçado e já aceitou, não mostra
            if (!force && this.getCookie(this.cookieName)) {
                return;
            }
            
            const t = cookieTranslations[this.currentLang];
            const privacyLink = this.currentLang === 'pt' ? 
                '/pt/politica-privacidade.html' : 
                `/${this.currentLang}/politica-privacidade.html`;
            
            const modalHTML = `
                <div id="cookie-modal" class="cookie-modal">
                    <div class="cookie-content">
                        <h3>${t.title}</h3>
                        <p>
                            ${t.message} 
                            <a href="${privacyLink}" target="_blank">${t.link}</a>.
                        </p>
                        <div class="cookie-buttons">
                            <button class="cookie-accept" onclick="cookieManager.acceptCookies()">
                                ${t.accept}
                            </button>
                            <button class="cookie-decline" onclick="cookieManager.declineCookies()">
                                ${t.decline}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Adiciona estilos se não existirem
            if (!document.getElementById('cookie-styles')) {
                const styles = `
                    <style id="cookie-styles">
                        .cookie-modal {
                            position: fixed;
                            bottom: 20px;
                            left: 20px;
                            right: 20px;
                            max-width: 500px;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                            padding: 24px;
                            z-index: 99999;
                            animation: slideUp 0.3s ease-out;
                        }
                        
                        @media (min-width: 768px) {
                            .cookie-modal {
                                left: auto;
                                right: 20px;
                            }
                        }
                        
                        .cookie-content h3 {
                            margin: 0 0 12px 0;
                            color: #1a1a1a;
                            font-size: 20px;
                        }
                        
                        .cookie-content p {
                            margin: 0 0 20px 0;
                            color: #666;
                            line-height: 1.5;
                        }
                        
                        .cookie-content a {
                            color: #16a34a;
                            text-decoration: underline;
                        }
                        
                        .cookie-buttons {
                            display: flex;
                            gap: 12px;
                        }
                        
                        .cookie-buttons button {
                            flex: 1;
                            padding: 12px 24px;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        }
                        
                        .cookie-accept {
                            background: linear-gradient(135deg, #16a34a, #14532d);
                            color: white;
                        }
                        
                        .cookie-accept:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                        }
                        
                        .cookie-decline {
                            background: #f3f4f6;
                            color: #666;
                        }
                        
                        .cookie-decline:hover {
                            background: #e5e7eb;
                        }
                        
                        @keyframes slideUp {
                            from {
                                transform: translateY(100%);
                                opacity: 0;
                            }
                            to {
                                transform: translateY(0);
                                opacity: 1;
                            }
                        }
                    </style>
                `;
                document.head.insertAdjacentHTML('beforeend', styles);
            }
        }
        
        acceptCookies() {
            this.setCookie(this.cookieName, 'accepted', this.cookieExpiry);
            this.hideModal();
            
            // Ativa Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                });
            }
        }
        
        declineCookies() {
            this.setCookie(this.cookieName, 'declined', this.cookieExpiry);
            this.hideModal();
            
            // Desativa Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied'
                });
            }
        }
        
        hideModal() {
            const modal = document.getElementById('cookie-modal');
            if (modal) {
                modal.style.animation = 'slideUp 0.3s ease-out reverse';
                setTimeout(() => modal.remove(), 300);
            }
        }
        
        setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = 'expires=' + date.toUTCString();
            document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
        }
        
        getCookie(name) {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    }
    
    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.cookieManager = new CookieManager();
        });
    } else {
        window.cookieManager = new CookieManager();
    }
})();