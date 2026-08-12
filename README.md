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
| Hospedagem | Vercel + domínio customizado |
| Dev/minify | `devserver.mjs` (dev server), Terser (JS), clean-css (CSS) |

> **Nota:** **Tailwind e GSAP não são usados** — todo o CSS é escrito à mão e as
> animações de reveal são feitas com `IntersectionObserver`. Ver
> [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Estrutura de pastas

```
.
├── index.html              # Página principal (single-page)
├── pages/                  # 14 páginas de projeto (carregadas no drawer via iframe)
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
├── 404.html                # Página 404 animada (canvas: partículas, pulsos, glitch)
├── privacidade.html        # Política de Privacidade (LGPD)
├── vercel.json             # Config do Vercel (rota 404 customizada)
├── robots.txt              # SEO
├── sitemap.xml             # SEO
└── package.json            # Scripts de dev/minify
```

> Pastas ignoradas pelo Git: `node_modules/`, `_originals/` (mídia bruta de alta
> resolução). Ver `.gitignore`.

---

## Rodando localmente

```bash
npm install          # instala devDependencies (Terser, clean-css, eslint)
npm run dev          # dev server com live-reload em http://localhost:3456
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

Vercel faz deploy automático a cada push na branch `main`. **Deploy = push:**

```bash
git push origin main
```

O domínio `nathangguerrero.com.br` é configurado no painel da Vercel. A rota 404 customizada está em `vercel.json`.

O Worker do formulário é deployado separadamente (ver [DEVELOPMENT.md](DEVELOPMENT.md#worker)):

```bash
cd worker && npx wrangler deploy
```

---

## Créditos & contato

Design, desenvolvimento e conteúdo: **Nathan Guerrero**
📧 nathangguerrero@gmail.com · [Instagram](https://www.instagram.com/nathangguerrero/) · [LinkedIn](https://www.linkedin.com/in/nathan-guerrero-235732366/) · [Behance](https://www.behance.net/nathanguerrero1)
