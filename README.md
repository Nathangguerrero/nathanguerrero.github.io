# Nathan Guerrero — Portfólio

Portfólio pessoal de **Nathan Guerrero** — Estratégia, Direção Criativa & Audiovisual.
Site estático de alta performance, com background animado em Canvas, scroll suave,
drawer de projetos em iframe e formulário de contato via serverless.

🔗 **Produção:** [nathangguerrero.com.br](https://nathangguerrero.com.br)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Marcação | HTML5 semântico |
| Estilo | CSS3 escrito à mão (`assets/css/style.css`) — sem framework |
| Comportamento | JavaScript ES6 vanilla (`assets/js/main.js`) — sem dependências de build |
| Background | Canvas 2D API (orbs animados, desktop) |
| Scroll suave | [Lenis](https://github.com/darkroomengineering/lenis) 1.1.14 (desktop) |
| Formulário | [Cloudflare Workers](https://workers.cloudflare.com/) + [Resend](https://resend.com/) |
| Analytics | Google Analytics 4 |
| Fontes | Google Fonts (Inter + Syne) |
| Hospedagem | GitHub Pages + domínio customizado (CNAME) |
| Dev/minify | Vite (dev server), Terser (JS), clean-css (CSS) |

> **Nota:** apesar de `@tailwindcss/vite` aparecer no `package.json`, **Tailwind não é
> usado** — todo o CSS é escrito à mão. GSAP **também não é usado**; as animações de
> reveal são feitas com `IntersectionObserver`. Ver [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Estrutura de pastas

```
.
├── index.html              # Página principal (single-page)
├── pages/                  # 13 páginas de projeto (carregadas no drawer via iframe)
│   ├── riberalves.html
│   ├── hybrid-media.html
│   └── ...
├── assets/
│   ├── css/
│   │   ├── style.css        # Fonte editável
│   │   └── style.min.css    # Minificado (carregado em produção)
│   ├── js/
│   │   ├── main.js          # Fonte editável
│   │   └── main.min.js      # Minificado (carregado em produção)
│   ├── images/
│   │   ├── about/           # Foto da seção "Quem sou eu"
│   │   ├── logo/            # Favicon, logo SVG
│   │   └── projects/<slug>/ # Mídia por projeto (vídeos, posters, fotos)
│   └── video/               # Hero + animação do loader
├── worker/                 # Cloudflare Worker (proxy do formulário → Resend)
│   ├── index.js
│   └── wrangler.toml
├── CNAME                   # Domínio customizado do GitHub Pages
├── robots.txt              # SEO
├── sitemap.xml             # SEO
└── package.json            # Scripts de dev/minify
```

> Pastas ignoradas pelo Git: `node_modules/`, `dist/` (build Vite não usado em deploy),
> `_originals/` (mídia bruta de alta resolução). Ver `.gitignore`.

---

## Rodando localmente

```bash
npm install          # instala devDependencies (Vite, Terser, clean-css)
npm run dev          # Vite dev server em http://localhost:5173
```

Alternativa com live-reload simples (sem Vite):

```bash
node devserver.mjs   # http://localhost:3456
```

Mais detalhes em [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Build (minificação)

O deploy **não tem etapa de build** — os arquivos `.min` são commitados. Após editar
`assets/css/style.css` ou `assets/js/main.js`, regenere os minificados:

```bash
npm run minify       # minifica CSS + JS
```

---

## Deploy

GitHub Pages serve a branch `main` na raiz. **Deploy = push:**

```bash
git push origin main
```

O domínio `nathangguerrero.com.br` é apontado via arquivo `CNAME` + DNS na Cloudflare.

O Worker do formulário é deployado separadamente (ver [DEVELOPMENT.md](DEVELOPMENT.md#worker)):

```bash
cd worker && npx wrangler deploy
```

---

## Créditos & contato

Design, desenvolvimento e conteúdo: **Nathan Guerrero**
📧 nathangguerrero@gmail.com · [Instagram](https://www.instagram.com/nathangguerrero/) · [LinkedIn](https://www.linkedin.com/in/nathan-guerrero-235732366/) · [Behance](https://www.behance.net/nathanguerrero1)
