#!/usr/bin/env node

/**
 * SINAL VERDE SSG BUILD ENGINE V3.0 - PRODUCTION READY
 * =====================================================
 * Static Site Generator com todas as correções implementadas
 * 
 * DEPENDÊNCIAS NECESSÁRIAS:
 * npm install cheerio mustache
 * 
 * @author Sinal Verde Tech Team
 * @version 3.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const Mustache = require('mustache');
const cheerio = require('cheerio'); // npm install cheerio

// Disable Mustache HTML escaping
Mustache.escape = (text) => text;

// ===============================
// CONFIGURATION
// ===============================
const CONFIG = {
  languages: ['pt', 'en', 'es'],
  defaultLang: 'pt',
  
  paths: {
    templates: './templates',
    locales: './lang',
    content: './content',
    assets: './assets',
    dist: './dist'
  },
  
  production: process.env.NODE_ENV === 'production',
  minify: process.env.MINIFY !== 'false',
  debug: process.env.DEBUG === 'true',
  
  version: Date.now(),
  
  sitemap: {
    domain: 'https://sinalverdeassessoria.com.br',
    changefreq: 'weekly',
    priority: '0.8'
  }
};

// ===============================
// UTILITIES
// ===============================
class Utils {
  static async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  
  static async readJSON(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ Erro ao ler JSON ${filePath}:`, error.message);
      return null;
    }
  }
  
  static async copyDir(src, dest) {
    await Utils.ensureDir(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await Utils.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
  
  static minifyHTML(html) {
    if (!CONFIG.minify) return html;
    
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/<!--.*?-->/g, '')
      .trim();
  }
  
  static formatDate(dateString, lang) {
    const date = new Date(dateString);
    const locales = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES'
    };
    
    return date.toLocaleDateString(locales[lang], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// ===============================
// LINK PROCESSOR
// ===============================
class LinkProcessor {
  /**
   * Processa links internos no HTML para adicionar prefixo de idioma
   */
  static processLinks(html, currentLang, currentPage = '') {
    const $ = cheerio.load(html, { decodeEntities: false });
    
    // Atualiza o botão de idioma atual no selector
    const langButton = $('.lang-current');
    if (langButton.length) {
      const langConfig = {
        pt: { flag: '🇧🇷', code: 'PT' },
        en: { flag: '🇺🇸', code: 'EN' },
        es: { flag: '🇪🇸', code: 'ES' }
      };
      
      const config = langConfig[currentLang];
      if (config) {
        langButton.html(`
          <span class="flag-emoji">${config.flag}</span>
          <span>${config.code}</span>
          <i class="fas fa-chevron-down"></i>
        `);
      }
    }
    
    // Processar todos os links <a href>
    $('a[href]').each((i, elem) => {
      const $elem = $(elem);
      let href = $elem.attr('href');
      
      // Skip external links, anchors, and special protocols
      if (!href || 
          href.startsWith('http://') || 
          href.startsWith('https://') || 
          href.startsWith('#') || 
          href.startsWith('mailto:') || 
          href.startsWith('tel:') ||
          href.startsWith('javascript:') ||
          href.startsWith('//')) {
        return;
      }
      
      // Skip if already has a language prefix
      if (href.match(/^\/(pt|en|es)\//)) {
        return;
      }
      
      // Processar link interno
      let newHref = href;
      
      // Se o link começa com /, é absoluto
      if (href.startsWith('/')) {
        // Remove leading slash for processing
        let cleanHref = href.substring(1);
        
        // Para português (idioma padrão), adiciona /pt/ para navegação consistente
        if (currentLang === CONFIG.defaultLang) {
          // Se não é um asset, adiciona /pt/
          if (!cleanHref.startsWith('assets/')) {
            newHref = `/pt/${cleanHref}`;
          }
        } else {
          // Para outros idiomas
          if (!cleanHref.startsWith('assets/')) {
            newHref = `/${currentLang}/${cleanHref}`;
          }
        }
      } else {
        // Links relativos - mantém como estão se já estão na pasta do idioma
        if (!href.startsWith('assets/')) {
          // Já estamos na pasta do idioma, links relativos funcionam
          newHref = href;
        }
      }
      
      $elem.attr('href', newHref);
    });
    
    // Processar links do language selector especificamente
    $('.lang-option').each((i, elem) => {
      const $elem = $(elem);
      const targetLang = $elem.attr('data-lang');
      if (targetLang) {
        // Remove classe active de todos e adiciona ao idioma atual
        $elem.removeClass('active');
        if (targetLang === currentLang) {
          $elem.addClass('active');
        }
        
        // Determina a página atual baseada no currentPage
        let pagePath = currentPage || 'index.html';
        
        // Remove extensão .html se existir
        pagePath = pagePath.replace(/\.html$/, '');
        
        // Constrói o novo href com o idioma correto
        let newHref = `/${targetLang}/${pagePath === 'index' ? '' : pagePath + '.html'}`;
        
        $elem.attr('href', newHref);
      }
    });
    
    // Corrigir links específicos que têm nomes diferentes em inglês/espanhol
    $('a[href*="privacy-policy"]').each((i, elem) => {
      const $elem = $(elem);
      let href = $elem.attr('href');
      // Substitui privacy-policy por politica-privacidade
      href = href.replace('privacy-policy', 'politica-privacidade');
      $elem.attr('href', href);
    });
    
    return $.html();
  }
}

// ===============================
// TEMPLATE PREPROCESSOR
// ===============================
class TemplatePreprocessor {
  static preprocess(template) {
    let processed = template;
    
    // Converter {{#if variable}} para {{#variable}}
    processed = processed.replace(/\{\{#if\s+([^\}]+)\}\}/g, '{{#$1}}');
    
    // Rastrear variáveis para fechar corretamente
    const ifMatches = [...template.matchAll(/\{\{#if\s+([^\}]+)\}\}/g)];
    const ifStack = [];
    
    for (const match of ifMatches) {
      const varName = match[1].trim();
      ifStack.push(varName);
    }
    
    // Substituir {{/if}} pelos fechamentos corretos
    let ifIndex = 0;
    processed = processed.replace(/\{\{\/if\}\}/g, () => {
      if (ifStack[ifIndex]) {
        const closing = `{{/${ifStack[ifIndex]}}}`;
        ifIndex++;
        return closing;
      }
      return '{{/if}}';
    });
    
    // Converter {{#each array}} para {{#array}}
    processed = processed.replace(/\{\{#each\s+([^\}]+)\}\}/g, '{{#$1}}');
    processed = processed.replace(/\{\{\/each\}\}/g, (match, offset) => {
      const beforeMatch = processed.substring(0, offset);
      const lastEach = beforeMatch.lastIndexOf('{{#');
      if (lastEach !== -1) {
        const varMatch = processed.substring(lastEach).match(/\{\{#([^\}]+)\}\}/);
        if (varMatch) {
          return `{{/${varMatch[1]}}}`;
        }
      }
      return match;
    });
    
    // Converter {{else}} para {{^variable}}
    processed = processed.replace(/\{\{else\}\}/g, (match, offset) => {
      const beforeMatch = processed.substring(0, offset);
      const lastIf = beforeMatch.lastIndexOf('{{#');
      if (lastIf !== -1) {
        const varMatch = processed.substring(lastIf).match(/\{\{#([^\}]+)\}\}/);
        if (varMatch) {
          return `{{/${varMatch[1]}}}{{^${varMatch[1]}}}`;
        }
      }
      return match;
    });
    
    // Manter {{@index}} e {{this}}
    processed = processed.replace(/\{\{@index\}\}/g, '{{@index}}');
    processed = processed.replace(/\{\{this\}\}/g, '{{.}}');
    
    return processed;
  }
  
  static processArrayData(data) {
    const processed = { ...data };
    
    // Processar arrays para adicionar propriedades especiais
    for (const key in processed) {
      if (Array.isArray(processed[key])) {
        processed[key] = processed[key].map((item, index, arr) => ({
          ...item,
          '@index': index,
          '@first': index === 0,
          '@last': index === arr.length - 1,
          'isLast': index === arr.length - 1
        }));
      } else if (typeof processed[key] === 'object' && processed[key] !== null) {
        processed[key] = this.processArrayData(processed[key]);
      }
    }
    
    return processed;
  }
}

// ===============================
// TEMPLATE ENGINE
// ===============================
class TemplateEngine {
  constructor() {
    this.cache = new Map();
  }
  
  async loadTemplate(templateName) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }
    
    const templatePath = path.join(CONFIG.paths.templates, templateName);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Pré-processar o template
    template = TemplatePreprocessor.preprocess(template);
    
    this.cache.set(templateName, template);
    
    return template;
  }
  
  async render(templateName, data) {
    const template = await this.loadTemplate(templateName);
    
    // Processar os dados
    const processedData = TemplatePreprocessor.processArrayData(data);
    
    // Renderizar com Mustache
    const rendered = Mustache.render(template, processedData);
    
    // Debug mode: check for unresolved placeholders
    if (CONFIG.debug && rendered.includes('{{')) {
      const unresolved = rendered.match(/\{\{[^}]+\}\}/g);
      if (unresolved) {
        console.warn(`⚠️  Placeholders não resolvidos em ${templateName}:`, unresolved.slice(0, 5));
      }
    }
    
    return rendered;
  }
}

// ===============================
// CONTENT MANAGER
// ===============================
class ContentManager {
  constructor() {
    this.locales = {};
    this.content = {};
    this.blogPosts = [];
  }
  
  async loadAll() {
    console.log('📚 Carregando conteúdo...');
    
    // Load locales
    for (const lang of CONFIG.languages) {
      const localePath = path.join(CONFIG.paths.locales, `${lang}.json`);
      this.locales[lang] = await Utils.readJSON(localePath) || {};
    }
    
    // Load content files
    const contentFiles = await fs.readdir(CONFIG.paths.content);
    for (const file of contentFiles) {
      if (file.endsWith('.json')) {
        const name = path.basename(file, '.json');
        const filePath = path.join(CONFIG.paths.content, file);
        this.content[name] = await Utils.readJSON(filePath) || {};
      }
    }
    
    // Load blog posts
    await this.loadBlogPosts();
    
    console.log(`✅ Conteúdo carregado: ${CONFIG.languages.length} idiomas, ${this.blogPosts.length} posts`);
  }
  
  async loadBlogPosts() {
    const blogDir = path.join(CONFIG.paths.content, 'blog');
    const posts = [];
    
    try {
      const files = await fs.readdir(blogDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(blogDir, file);
          const post = await Utils.readJSON(filePath);
          if (post) posts.push(post);
        }
      }
      
      // Sort by date (newest first)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('❌ Erro ao carregar posts do blog:', error.message);
    }
    
    this.blogPosts = posts;
  }
  
  getData(lang) {
    // Processar privacy-policy que tem estrutura diferente
    let privacyPolicyData = {};
    const privacyContent = this.content['privacy-policy'] || {};
    
    // Privacy policy tem a língua como primeiro nível
    if (privacyContent[lang]) {
      privacyPolicyData = privacyContent[lang];
    } else if (privacyContent[CONFIG.defaultLang]) {
      privacyPolicyData = privacyContent[CONFIG.defaultLang];
    }
    
    return {
      ui: this.locales[lang] || this.locales[CONFIG.defaultLang],
      segments: this.content.segments || {},
      otherData: this.content['other-data'] || {},
      privacyPolicy: privacyPolicyData,
      blogPosts: this.blogPosts || [],
      
      // Metadados globais
      meta: {
        lang,
        baseUrl: CONFIG.sitemap.domain,
        version: CONFIG.version,
        year: new Date().getFullYear()
      }
    };
  }
}

// ===============================
// PAGE BUILDERS
// ===============================
class PageBuilder {
  constructor(templateEngine, contentManager) {
    this.templateEngine = templateEngine;
    this.contentManager = contentManager;
  }
  
  formatPostForTemplate(post, lang) {
    if (!post) return null;
    
    // IMPORTANTE: Verificar se existe tradução para o idioma
    const hasTranslation = post[lang] && post[lang].title;
    const postLang = hasTranslation ? post[lang] : post.pt || post.en || post.es || {};
    
    // Se não houver tradução, retornar null para não exibir
    if (!postLang.title && lang !== 'pt') {
        console.warn(`⚠️  Post ${post.id} sem tradução para ${lang}`);
        // Para desenvolvimento, use fallback. Para produção, pode retornar null
        const fallbackLang = post.pt || post.en || post.es || {};
        return {
            id: post.id,
            title: fallbackLang.title || '',
            excerpt: fallbackLang.excerpt || '',
            date: Utils.formatDate(post.date, lang),
            author: post.author || '',
            authorRole: post.authorRole || '',
            readTime: post.readTime || 0,
            views: post.views || 0,
            category: post.category || '',
            categoryName: this.getCategoryName(post.category, lang),
            image: post.image || 'default.jpg',
            tags: post.tags || [],
            featured: post.featured || false,
            content: fallbackLang.content || {}
        };
    }
    
    return {
        id: post.id,
        title: postLang.title || '',
        excerpt: postLang.excerpt || '',
        date: Utils.formatDate(post.date, lang),
        author: post.author || '',
        authorRole: post.authorRole || '',
        readTime: post.readTime || 0,
        views: post.views || 0,
        category: post.category || '',
        categoryName: this.getCategoryName(post.category, lang),
        image: post.image || 'default.jpg',
        tags: post.tags || [],
        featured: post.featured || false,
        content: postLang.content || {}
    };
}
  
  getCategories(posts, lang) {
    const categories = new Map();
    
    for (const post of posts) {
      if (post.category) {
        categories.set(post.category, {
          id: post.category,
          name: this.getCategoryName(post.category, lang)
        });
      }
    }
    
    return Array.from(categories.values());
  }
  
  getCategoryName(category, lang) {
    const categoryNames = {
      pt: {
        all: 'Todas as Matérias',
        compliance: 'Compliance',
        legislation: 'Legislação',
        licenses: 'Licenças',
        licencas: 'Licenças',
        corporate: 'Societário',
        societario: 'Societário',
        tutorials: 'Tutoriais',
        tutorial: 'Tutoriais',
        market: 'Mercado'
      },
      en: {
        all: 'All Articles',
        compliance: 'Compliance',
        legislation: 'Legislation',
        licenses: 'Licenses',
        licencas: 'Licenses',
        corporate: 'Corporate',
        societario: 'Corporate',
        tutorials: 'Tutorials',
        tutorial: 'Tutorials',
        market: 'Market'
      },
      es: {
        all: 'Todos los Artículos',
        compliance: 'Compliance',
        legislation: 'Legislación',
        licenses: 'Licencias',
        licencas: 'Licencias',
        corporate: 'Corporativo',
        societario: 'Corporativo',
        tutorials: 'Tutoriales',
        tutorial: 'Tutoriales',
        market: 'Mercado'
      }
    };
    
    return categoryNames[lang]?.[category] || category;
}
  
  async buildPage(templateName, lang, additionalData = {}) {
    const baseData = this.contentManager.getData(lang);
    
    // Adicionar labels de UI necessários para o template
    const uiLabels = {
      // Navigation labels
      LANG: lang,
      MENU_LABEL: baseData.ui?.common?.menu || 'Menu',
      SERVICES_LABEL: baseData.ui?.nav?.services || 'Services',
      SEGMENTS_LABEL: baseData.ui?.nav?.segments || 'Segments',
      ABOUT_LABEL: baseData.ui?.nav?.about || 'About',
      BLOG_LABEL: baseData.ui?.nav?.blog || 'Blog',
      CONTACT_LABEL: baseData.ui?.nav?.contact || 'Contact',
      
      // Common labels
      SHARE_LABEL: baseData.ui?.blog?.share || 'Share',
      RELATED_ARTICLES_TITLE: baseData.ui?.blog?.relatedArticles || 'Related Articles',
      WHATSAPP_NUMBER: baseData.otherData?.company?.whatsappNumber || '5511936621755',
      WHATSAPP_LABEL: 'WhatsApp'
    };
    
    const data = {
      ...baseData,
      ...additionalData,
      ...uiLabels,
      
      // URLs e caminhos
      CURRENT_LANG: lang,
      BASE_URL: '', // Sempre raiz para assets
      LANG_PREFIX: lang === CONFIG.defaultLang ? '' : `/${lang}`,
      ASSET_VERSION: CONFIG.version
    };
    
    // Renderizar template
    let html = await this.templateEngine.render(templateName, data);
    
    // Extrair nome da página do templateName
    const pageName = templateName.replace('.html', '');
    
    // Processar links internos
    html = LinkProcessor.processLinks(html, lang, pageName);
    
    return html;
  }
  
  async buildAllPages() {
    console.log('🏗️  Construindo páginas...');
    
    for (const lang of CONFIG.languages) {
      console.log(`  📄 Gerando páginas em ${lang.toUpperCase()}...`);
      
      // Create language directory
      const langDir = path.join(CONFIG.paths.dist, lang);
      await Utils.ensureDir(langDir);
      
      // Build root pages
      const rootTemplates = [
        'index.html',
        'servicos.html',
        'sobre.html',
        'contato.html',
        'contato-sucesso.html',
        'politica-privacidade.html'
      ];
      
      for (const page of rootTemplates) {
        try {
          const html = await this.buildPage(page, lang);
          const outputPath = path.join(langDir, page);
          await fs.writeFile(outputPath, html);
          console.log(`      ✓ ${page}`);
        } catch (error) {
          console.warn(`      ⚠ Erro ao processar ${page}: ${error.message}`);
          if (CONFIG.debug) {
            console.error(error.stack);
          }
        }
      }
      
      // Build blog pages
      await this.buildBlogPages(lang);
      
      // Build segment pages
      await this.buildSegmentPages(lang);
    }
    
    console.log('✅ Páginas construídas com sucesso');
  }
  
  getBlogPageData(lang) {
    const blogPosts = this.contentManager.blogPosts || [];
    const featuredPost = blogPosts.find(p => p.featured) || blogPosts[0];
    const regularPosts = blogPosts.filter(p => p !== featuredPost);
    
    // Adicionar categoria "all" no início
    const allCategories = [
        { id: 'all', name: this.getCategoryName('all', lang) },
        ...this.getCategories(blogPosts, lang)
    ];
    
    return {
      featuredPost: featuredPost ? this.formatPostForTemplate(featuredPost, lang) : null,
      articles: regularPosts.map(p => this.formatPostForTemplate(p, lang)),
      categories: allCategories,  // Usar allCategories em vez de this.getCategories
      popularPosts: blogPosts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3)
        .map(p => this.formatPostForTemplate(p, lang))
    };
}
  
  async buildBlogPages(lang) {
    const blogDir = path.join(CONFIG.paths.dist, lang, 'blog');
    await Utils.ensureDir(blogDir);
    
    try {
      // Build blog listing page
      const blogData = this.getBlogPageData(lang);
      const blogListHtml = await this.buildPage('blog.html', lang, blogData);
      
      // Save as index.html in blog directory
      await fs.writeFile(path.join(blogDir, 'index.html'), blogListHtml);
      
      // Also save as blog.html in lang directory
      await fs.writeFile(path.join(CONFIG.paths.dist, lang, 'blog.html'), blogListHtml);
      console.log(`      ✓ blog.html`);
      
      // Build individual article pages
      for (const post of this.contentManager.blogPosts) {
        const articleHtml = await this.buildArticlePage(post, lang);
        const articlePath = path.join(blogDir, `${post.id}.html`);
        await fs.writeFile(articlePath, articleHtml);
        console.log(`      ✓ blog/${post.id}.html`);
      }
    } catch (error) {
      console.error(`      ❌ Erro ao construir páginas do blog: ${error.message}`);
      if (CONFIG.debug) {
        console.error(error.stack);
      }
    }
  }
  
  async buildArticlePage(post, lang) {
    const formattedPost = this.formatPostForTemplate(post, lang);
    const postData = post[lang] || post.pt || {};
    const baseData = this.contentManager.getData(lang);
    
    // Get related articles
    const relatedPosts = this.contentManager.blogPosts
      .filter(p => p.id !== post.id && p.category === post.category)
      .slice(0, 3)
      .map(p => this.formatPostForTemplate(p, lang));
    
    // Processar keywords
    let keywords = '';
    if (postData.seo?.keywords) {
      if (Array.isArray(postData.seo.keywords)) {
        keywords = postData.seo.keywords.join(', ');
      } else if (typeof postData.seo.keywords === 'string') {
        keywords = postData.seo.keywords;
      }
    } else if (post.tags && Array.isArray(post.tags)) {
      keywords = post.tags.join(', ');
    }
    
    // Adicionar todas as variáveis necessárias para o artigo
    const articleData = {
      ...formattedPost,
      
      // Meta tags
      META_TITLE: postData.seo?.metaTitle || postData.title,
      META_DESCRIPTION: postData.seo?.metaDescription || postData.excerpt,
      META_KEYWORDS: keywords,
      OG_TITLE: postData.title,
      OG_DESCRIPTION: postData.excerpt,
      
      // Article content
      TITLE: postData.title,
      EXCERPT: postData.excerpt,
      CONTENT: this.renderArticleContent(postData.content, lang), // Mudando de contentHtml para CONTENT
      TAGS: this.renderTags(post.tags || [], lang),
      
      // Article metadata
      CATEGORY: this.getCategoryName(post.category, lang),
      DATE: Utils.formatDate(post.date, lang),
      AUTHOR: post.author,
      AUTHOR_ROLE: post.authorRole,
      READ_TIME_LABEL: `${post.readTime} min`,
      
      // Related
      RELATED_ARTICLES: relatedPosts,
      relatedPosts: relatedPosts, // Manter ambos para compatibilidade
      
      // UI Labels específicos do artigo
      SHARE_LABEL: baseData.ui?.blog?.share || 'Compartilhar',
      RELATED_ARTICLES_TITLE: baseData.ui?.blog?.relatedArticles || 'Artigos Relacionados',
      WHATSAPP_NUMBER: baseData.otherData?.company?.whatsappNumber || '5511936621755',
      WHATSAPP_LABEL: 'WhatsApp'
    };
    
    // Build the page with all data
    const html = await this.buildPage('artigo.html', lang, articleData);
    
    // Process links specifically for article pages
    return LinkProcessor.processLinks(html, lang, `blog/${post.id}`);
  }
  
  renderArticleContent(content, lang) {
    if (!content) return '';
    
    let html = '';
    
    if (content.introduction) {
      html += `<div class="article-intro">
        <p>${content.introduction}</p>
      </div>`;
    }
    
    if (content.sections && Array.isArray(content.sections)) {
      for (const section of content.sections) {
        html += `<section class="article-section">`;
        
        if (section.heading || section.title) {
          html += `<h2>${section.heading || section.title}</h2>`;
        }
        
        if (section.content || section.text) {
          html += `<p>${section.content || section.text}</p>`;
        }
        
        if (section.list && Array.isArray(section.list)) {
          html += '<ul>';
          for (const item of section.list) {
            html += `<li>${item}</li>`;
          }
          html += '</ul>';
        }
        
        if (section.checklist && Array.isArray(section.checklist)) {
          html += '<div class="checklist">';
          for (const item of section.checklist) {
            html += `<div class="checklist-item">
              <i class="fas fa-check-circle"></i>
              <span>${item}</span>
            </div>`;
          }
          html += '</div>';
        }
        
        if (section.highlight) {
          html += `<div class="highlight-box">
            <p>${section.highlight}</p>
          </div>`;
        }
        
        if (section.highlights && typeof section.highlights === 'object') {
          html += '<div class="highlights">';
          for (const [key, value] of Object.entries(section.highlights)) {
            html += `<div class="highlight-item">
              <strong>${key}:</strong> ${value}
            </div>`;
          }
          html += '</div>';
        }
        
        if (section.table) {
          html += '<div class="table-wrapper"><table>';
          if (section.table.headers) {
            html += '<thead><tr>';
            for (const header of section.table.headers) {
              html += `<th>${header}</th>`;
            }
            html += '</tr></thead>';
          }
          if (section.table.rows) {
            html += '<tbody>';
            for (const row of section.table.rows) {
              html += '<tr>';
              for (const cell of row) {
                html += `<td>${cell}</td>`;
              }
              html += '</tr>';
            }
            html += '</tbody>';
          }
          html += '</table></div>';
        }
        
        html += '</section>';
      }
    }
    
    if (content.tips && Array.isArray(content.tips)) {
      html += '<div class="tips-section">';
      html += '<h3>Dicas Importantes:</h3>';
      html += '<div class="tips-grid">';
      for (const tip of content.tips) {
        html += `<div class="tip-card">
          <i class="fas fa-lightbulb"></i>
          <p>${tip}</p>
        </div>`;
      }
      html += '</div></div>';
    }
    
    if (content.checklist && typeof content.checklist === 'object') {
      html += '<div class="checklist-section">';
      html += `<h3>${content.checklist.title || 'Checklist'}</h3>`;
      html += '<div class="checklist">';
      
      const items = content.checklist.items || content.checklist;
      if (typeof items === 'object') {
        for (const [key, value] of Object.entries(items)) {
          if (key !== 'title') {
            html += `<div class="checklist-item">
              <i class="fas fa-check-circle"></i>
              <strong>${key}:</strong> ${value}
            </div>`;
          }
        }
      }
      html += '</div></div>';
    }
    
    if (content.conclusion) {
      html += `<div class="article-conclusion">
        <p>${content.conclusion}</p>
      </div>`;
    }
    
    if (content.cta) {
      html += `<div class="article-cta">
        <p>${content.cta.text}</p>
        <a href="${content.cta.link}" class="btn btn-primary">
          ${content.cta.button}
        </a>
      </div>`;
    }
    
    return html;
  }
  
  renderTags(tags, lang) {
    if (!tags || !Array.isArray(tags)) return '';
    
    return tags.map(tag => `
      <span class="tag">#${tag}</span>
    `).join('');
  }
  
  async buildSegmentPages(lang) {
    const segmentsDir = path.join(CONFIG.paths.dist, lang, 'segmentos');
    await Utils.ensureDir(segmentsDir);
    
    const segmentTemplates = [
      'grupos-economicos.html',
      'escritorios-advocacia.html',
      'incorporadoras.html',
      'empresas.html'
    ];
    
    for (const template of segmentTemplates) {
      try {
        const segmentId = path.basename(template, '.html');
        const segmentData = this.getSegmentData(segmentId, lang);
        
        const html = await this.buildPage(
          `segmentos/${template}`,
          lang,
          segmentData
        );
        
        const outputPath = path.join(segmentsDir, template);
        await fs.writeFile(outputPath, html);
        console.log(`      ✓ segmentos/${template}`);
      } catch (error) {
        console.warn(`      ⚠ Erro ao processar segmento ${template}: ${error.message}`);
        if (CONFIG.debug) {
          console.error(error.stack);
        }
      }
    }
  }
  
  getSegmentData(segmentId, lang) {
    const segments = this.contentManager.content.segments || {};
    
    // Map template names to segment keys
    const segmentMap = {
      'grupos-economicos': 'economic-groups',
      'escritorios-advocacia': 'law-firms',
      'incorporadoras': 'real-estate',
      'empresas': 'general-companies'
    };
    
    const segmentKey = segmentMap[segmentId];
    const segment = segments[segmentKey];
    
    if (!segment) {
      console.warn(`⚠️  Segmento não encontrado: ${segmentId}`);
      return {};
    }
    
    const segmentLang = segment[lang] || segment.pt || {};
    
    // Mapear todos os campos do segmento para variáveis do template
    return {
      // Meta tags
      META_TITLE: segmentLang.metaTitle,
      META_DESCRIPTION: segmentLang.metaDescription,
      META_KEYWORDS: segmentLang.metaKeywords,
      
      // Conteúdo principal
      SEGMENT_TITLE: segmentLang.title,
      SEGMENT_SUBTITLE: segmentLang.subtitle,
      SEGMENT_CTA1: segmentLang.cta1,
      SEGMENT_CTA2: segmentLang.cta2,
      
      // Indicadores
      INDICATOR1: segmentLang.indicator1,
      INDICATOR2: segmentLang.indicator2,
      INDICATOR3: segmentLang.indicator3,
      
      // Pain Points
      PAIN_POINTS_TITLE: segmentLang.painPointsTitle,
      PAIN_POINTS_SUBTITLE: segmentLang.painPointsSubtitle,
      painPoints: segmentLang.painPoints || [],
      
      // Soluções
      SEGMENT_SERVICES_TITLE: segmentLang.servicesTitle || 'Nossas Soluções',
      SOLUTION_1_TITLE: segmentLang.solutions?.[0]?.title || '',
      SOLUTION_1_DESC: segmentLang.solutions?.[0]?.desc || '',
      SOLUTION_2_TITLE: segmentLang.solutions?.[1]?.title || '',
      SOLUTION_2_DESC: segmentLang.solutions?.[1]?.desc || '',
      SOLUTION_3_TITLE: segmentLang.solutions?.[2]?.title || '',
      SOLUTION_3_DESC: segmentLang.solutions?.[2]?.desc || '',
      SOLUTION_4_TITLE: segmentLang.solutions?.[3]?.title || '',
      SOLUTION_4_DESC: segmentLang.solutions?.[3]?.desc || '',
      
      // Processo
      PROCESS_TITLE: segmentLang.processTitle || 'Como Funciona',
      PROCESS_STEP_1_TITLE: segmentLang.processSteps?.[0]?.title || '',
      PROCESS_STEP_1_DESC: segmentLang.processSteps?.[0]?.desc || '',
      PROCESS_STEP_2_TITLE: segmentLang.processSteps?.[1]?.title || '',
      PROCESS_STEP_2_DESC: segmentLang.processSteps?.[1]?.desc || '',
      PROCESS_STEP_3_TITLE: segmentLang.processSteps?.[2]?.title || '',
      PROCESS_STEP_3_DESC: segmentLang.processSteps?.[2]?.desc || '',
      PROCESS_STEP_4_TITLE: segmentLang.processSteps?.[3]?.title || '',
      PROCESS_STEP_4_DESC: segmentLang.processSteps?.[3]?.desc || '',
      ...segmentLang,
      
      // Add metadata
      metaTitle: segmentLang.metaTitle || segmentLang.title || '',
      metaDescription: segmentLang.metaDescription || segmentLang.subtitle || '',
      metaKeywords: segmentLang.metaKeywords || '',
      
      // Ensure all fields exist
      title: segmentLang.title || '',
      subtitle: segmentLang.subtitle || '',
      label: segmentLang.label || '',
      cta1: segmentLang.cta1 || '',
      cta2: segmentLang.cta2 || '',
      indicator1: segmentLang.indicator1 || '',
      indicator2: segmentLang.indicator2 || '',
      indicator3: segmentLang.indicator3 || '',
      
      // Process arrays for templates with safety checks
      painPoints: (segmentLang.painPoints || []).map((item, index, arr) => ({
        ...item,
        hasArrow: index < arr.length - 1,
        isLast: index === arr.length - 1
      })),
      
      solutions: (segmentLang.solutions || []).map(item => ({
        ...item,
        badge: item.badge || null
      })),
      
      processSteps: (segmentLang.processSteps || []).map((item, index, arr) => ({
        ...item,
        hasArrow: index < arr.length - 1,
        isLast: index === arr.length - 1,
        isNotLast: index < arr.length - 1,
        number: item.number || (index + 1)
      })),
      
      results: segmentLang.results || [],
      servicesShowcase: segmentLang.servicesShowcase || [],
      ctaSectionBenefits: segmentLang.ctaSectionBenefits || []
    };
    
    return processedData;
  }
}

// ===============================
// SITEMAP GENERATOR
// ===============================
class SitemapGenerator {
  constructor(contentManager) {
    this.contentManager = contentManager;
  }
  
  async generate() {
    console.log('🗺️  Gerando sitemap...');
    
    const urls = [];
    const domain = CONFIG.sitemap.domain;
    
    for (const lang of CONFIG.languages) {
      // Homepage
      const loc = lang === CONFIG.defaultLang ? 
        domain : `${domain}/${lang}`;
      
      urls.push({
        loc,
        changefreq: 'daily',
        priority: '1.0'
      });
      
      // Static pages
      const staticPages = [
        'servicos', 'sobre', 'blog', 'contato', 
        'politica-privacidade'
      ];
      
      for (const page of staticPages) {
        const pageLoc = lang === CONFIG.defaultLang ?
          `${domain}/${page}` :
          `${domain}/${lang}/${page}`;
          
        urls.push({
          loc: pageLoc,
          changefreq: 'weekly',
          priority: page === 'blog' ? '0.9' : '0.7'
        });
      }
      
      // Blog posts
      for (const post of this.contentManager.blogPosts || []) {
        const postLoc = lang === CONFIG.defaultLang ?
          `${domain}/blog/${post.id}` :
          `${domain}/${lang}/blog/${post.id}`;
          
        urls.push({
          loc: postLoc,
          changefreq: 'monthly',
          priority: '0.6'
        });
      }
      
      // Segments
      const segments = ['grupos-economicos', 'escritorios-advocacia', 'incorporadoras', 'empresas'];
      for (const segment of segments) {
        const segmentLoc = lang === CONFIG.defaultLang ?
          `${domain}/segmentos/${segment}` :
          `${domain}/${lang}/segmentos/${segment}`;
          
        urls.push({
          loc: segmentLoc,
          changefreq: 'weekly',
          priority: '0.8'
        });
      }
    }
    
    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    await fs.writeFile(path.join(CONFIG.paths.dist, 'sitemap.xml'), xml);
    
    // Generate robots.txt
    const robots = `User-agent: *
Allow: /
Sitemap: ${domain}/sitemap.xml

# Directories
Allow: /pt/
Allow: /en/
Allow: /es/
Allow: /assets/
Allow: /blog/
Allow: /segmentos/

# Block admin areas (if any)
Disallow: /admin/
Disallow: /api/

# Crawl delay
Crawl-delay: 1`;
    
    await fs.writeFile(path.join(CONFIG.paths.dist, 'robots.txt'), robots);
    
    console.log('✅ Sitemap e robots.txt gerados');
  }
}

// ===============================
// MAIN BUILD SYSTEM
// ===============================
class BuildSystem {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.contentManager = new ContentManager();
    this.pageBuilder = new PageBuilder(this.templateEngine, this.contentManager);
    this.sitemapGenerator = new SitemapGenerator(this.contentManager);
  }
  
  async run() {
    console.log('');
    console.log('🚀 SINAL VERDE BUILD SYSTEM V3.0');
    console.log('=====================================');
    console.log(`📅 Build iniciado: ${new Date().toISOString()}`);
    console.log(`🔧 Ambiente: ${CONFIG.production ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    console.log(`🐛 Debug: ${CONFIG.debug ? 'ATIVADO' : 'DESATIVADO'}`);
    console.log('');
    
    try {
      // Clean dist directory
      console.log('🧹 Limpando diretório de distribuição...');
      await fs.rm(CONFIG.paths.dist, { recursive: true, force: true });
      await Utils.ensureDir(CONFIG.paths.dist);
      
      // Load all content
      await this.contentManager.loadAll();
      
      // Build all pages
      await this.pageBuilder.buildAllPages();
      
      // Copy assets
      console.log('📦 Copiando assets...');
      await Utils.copyDir(CONFIG.paths.assets, path.join(CONFIG.paths.dist, 'assets'));
      
      // Create root index.html (smart redirect)
      await this.createRootIndex();
      
      // Generate sitemap and robots.txt
      await this.sitemapGenerator.generate();
      
      // Generate build info
      await this.generateBuildInfo();
      
      // Create Netlify config if in production
      if (CONFIG.production) {
        await this.createNetlifyConfig();
      }
      
      console.log('');
      console.log('✨ BUILD CONCLUÍDO COM SUCESSO!');
      console.log('=====================================');
      console.log(`📊 Estatísticas:`);
      console.log(`   - Idiomas: ${CONFIG.languages.join(', ')}`);
      console.log(`   - Posts do blog: ${this.contentManager.blogPosts?.length || 0}`);
      console.log(`   - Tempo total: ${process.uptime().toFixed(2)}s`);
      console.log('');
      
      if (CONFIG.production) {
        console.log('📌 Build de PRODUÇÃO concluído!');
        console.log('   Pronto para deploy no Netlify');
      } else {
        console.log('📌 Próximos passos:');
        console.log('   1. Teste local: npm run serve');
        console.log('   2. Acesse: http://localhost:8080');
        console.log('   3. Para produção: NODE_ENV=production npm run build');
      }
      console.log('');
      
    } catch (error) {
      console.error('❌ ERRO NO BUILD:', error);
      console.error(error.stack);
      process.exit(1);
    }
  }
  
  async createRootIndex() {
    const indexHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sinal Verde - Redirecionando...</title>
    <script>
    (function() {
        // Para desenvolvimento local, redireciona direto para /pt/
        var isLocal = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
        
        if (isLocal) {
            // Em desenvolvimento, vai direto para /pt/
            window.location.href = '/pt/index.html';
            return;
        }
        
        // Em produção, detecta idioma preferido
        var savedLang = localStorage.getItem('preferredLanguage');
        var browserLang = navigator.language || navigator.userLanguage;
        var lang = 'pt'; // Default
        
        if (savedLang) {
            lang = savedLang;
        } else if (browserLang) {
            // Detectar idioma do navegador
            if (browserLang.startsWith('en')) {
                lang = 'en';
            } else if (browserLang.startsWith('es')) {
                lang = 'es';
            } else if (browserLang.startsWith('pt')) {
                lang = 'pt';
            }
        }
        
        // Redirecionar para o idioma apropriado
        window.location.href = '/' + lang + '/';
    })();
    </script>
    <noscript>
        <meta http-equiv="refresh" content="0; url=/pt/">
    </noscript>
</head>
<body>
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
        <h1>Redirecionando...</h1>
        <p>Se não for redirecionado automaticamente, escolha seu idioma:</p>
        <hr style="margin: 30px auto; width: 200px;">
        <p style="font-size: 20px;">
            <a href="/pt/" style="margin: 0 10px;">🇧🇷 Português</a> | 
            <a href="/en/" style="margin: 0 10px;">🇺🇸 English</a> | 
            <a href="/es/" style="margin: 0 10px;">🇪🇸 Español</a>
        </p>
    </div>
</body>
</html>`;
    
    await fs.writeFile(path.join(CONFIG.paths.dist, 'index.html'), indexHTML);
    console.log('✅ index.html de redirecionamento inteligente criado');
  }
  
  async generateBuildInfo() {
    const buildInfo = {
      version: '3.0.0',
      buildDate: new Date().toISOString(),
      environment: CONFIG.production ? 'production' : 'development',
      languages: CONFIG.languages,
      pages: {
        static: 6,
        blog: this.contentManager.blogPosts?.length || 0,
        segments: 4,
        total: 6 + (this.contentManager.blogPosts?.length || 0) * 3 + 4 * 3
      },
      features: {
        multilingual: true,
        seo: true,
        responsive: true,
        pwa: false,
        analytics: true
      }
    };
    
    await fs.writeFile(
      path.join(CONFIG.paths.dist, 'build-info.json'),
      JSON.stringify(buildInfo, null, 2)
    );
  }
  
  async createNetlifyConfig() {
    const redirects = `# Redirects for language detection
/  /pt/  302  Language=pt
/  /en/  302  Language=en
/  /es/  302  Language=es

# Default to Portuguese
/  /pt/  302

# Redirect old URLs
/index.html  /pt/  301
/home  /pt/  301
/inicio  /pt/  301

# API redirects (if needed in future)
/api/*  /.netlify/functions/:splat  200`;
    
    await fs.writeFile(path.join(CONFIG.paths.dist, '_redirects'), redirects);
    
    const headers = `# Security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  
# Cache static assets
/assets/*
  Cache-Control: public, max-age=31536000, immutable
  
# Cache HTML pages
/*.html
  Cache-Control: public, max-age=3600, must-revalidate`;
    
    await fs.writeFile(path.join(CONFIG.paths.dist, '_headers'), headers);
    
    console.log('✅ Configurações do Netlify criadas (_redirects e _headers)');
  }
}

// ===============================
// EXECUTE BUILD
// ===============================
const build = new BuildSystem();
build.run().catch(error => {
  console.error('❌ Erro fatal no build:', error);
  process.exit(1);
});