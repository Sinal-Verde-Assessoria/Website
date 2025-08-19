# Sinal Verde - Website Oficial

Website multilíngue da Sinal Verde Assessoria Paralegal.

## 🚀 Tecnologias

- HTML5/CSS3/JavaScript (Vanilla)
- Build System customizado com Node.js
- Deploy automatizado via Netlify
- Suporte para 3 idiomas (PT/EN/ES)

## 📦 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sinal-verde-website.git

# Entre na pasta
cd sinal-verde-website

# Instale as dependências
npm install

# Rode o build
npm run build

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🛠️ Scripts Disponíveis

- `npm run build` - Gera o site estático em `/dist`
- `npm run build:production` - Build otimizado para produção
- `npm run dev` - Build + servidor local na porta 8080
- `npm run serve` - Apenas servidor local (sem build)
- `npm run clean` - Limpa a pasta dist
- `npm run rebuild` - Limpa e reconstrói

## 📁 Estrutura do Projeto

```
├── content/          # Conteúdo (JSON) multilíngue
│   ├── blog/        # Artigos do blog
│   └── i18n/        # Traduções da interface
├── templates/        # Templates HTML
├── dist/            # Site gerado (ignorado no git)
├── build-script.js   # Script de build
└── netlify.toml     # Configuração do Netlify
```

## 🌍 Idiomas Suportados

- 🇧🇷 Português (pt)
- 🇺🇸 English (en)
- 🇪🇸 Español (es)

## 📝 Adicionando Novos Artigos

1. Crie um arquivo JSON em `/content/blog/`
2. Siga a estrutura dos artigos existentes
3. Rode `npm run build`
4. Commit e push para deploy automático

## 🚀 Deploy

O site é automaticamente deployado no Netlify quando há push na branch `main`.

**URL de Produção:** https://sinalverdeassessoria.com.br

## 📞 Contato

- **Website:** https://sinalverdeassessoria.com.br
- **Email:** contato@sinalverdeassessoria.com.br
- **WhatsApp:** +55 11 93662-1755

## 📄 Licença

© 2025 Sinal Verde Apoio Administrativo LTDA. Todos os direitos reservados.
