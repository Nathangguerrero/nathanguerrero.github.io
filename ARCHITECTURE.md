# Arquitetura

## Visão geral

Site **estático** (sem servidor de aplicação) hospedado no GitHub Pages. A única peça
dinâmica é o formulário de contato, que delega o envio de e-mail a um **Cloudflare Worker**
(serverless edge) para manter a API key do Resend fora do frontend.

```
                          ┌─────────────────────────────────────────┐
                          │            NAVEGADOR (cliente)            │
                          │                                           │
   GitHub Pages  ───────► │  index.html + assets/*.min.{css,js}       │
   (CDN, estático)        │  pages/*.html  (drawer via <iframe>)      │
                          │                                           │
                          │  Lenis (scroll) · Canvas (bg) · GA        │
                          └──────────────────┬────────────────────────┘
                                             │  POST JSON (form)
                                             ▼
                          ┌─────────────────────────────────────────┐
                          │     CLOUDFLARE WORKER  (resend-proxy)     │
                          │  - valida método/CORS/campos              │
                          │  - lê RESEND_API_KEY (secret)             │
                          └──────────────────┬────────────────────────┘
                                             │  POST /emails (Bearer key)
                                             ▼
                          ┌─────────────────────────────────────────┐
                          │              RESEND API                   │
                          │      entrega e-mail → inbox do Nathan     │
                          └─────────────────────────────────────────┘
```

---

## Fluxo de dados do formulário

```
1. Usuário clica "Vamos criar juntos"        → abre #contact-panel
2. Preenche nome, contato, tipo, mensagem    → submit
3. main.js valida (e-mail OU ≥10 dígitos)    → se inválido, mostra erro e para
4. fetch(CONTACT_ENDPOINT, POST JSON)         → Cloudflare Worker
5. Worker valida campos + monta HTML do email
6. Worker → Resend (Authorization: Bearer RESEND_API_KEY)
7. Resend entrega → nathangguerrero@gmail.com
8. Worker responde { success: true }          → main.js mostra "Mensagem enviada!"
```

**Por que um Worker?** A API key do Resend é um segredo de servidor. Colocá-la no
JavaScript do navegador a exporia a qualquer visitante. O Worker é o "backend mínimo"
que guarda o segredo e faz a chamada autenticada.

---

## Componentes do frontend (`assets/js/main.js`)

Cada bloco é uma IIFE independente, ativada apenas se seus elementos existem:

| Bloco | Responsabilidade | Desktop-only? |
|---|---|---|
| Mobile menu | Hambúrguer + overlay | — |
| Loader | Barra de progresso + vídeo da logo | — |
| About symbols 3D | Símbolos flutuantes com parallax do mouse | ✅ |
| Scroll progress | Barra de progresso no topo | — |
| Scroll reveal | `IntersectionObserver` para fade-in | — |
| Counters | Animação dos números de estatística | — |
| Typewriter | Palavra que cicla no hero | — |
| Project drawer | Abre `pages/*.html` em iframe, com swipe/teclado | — |
| Tilt 3D | Inclinação dos cards no hover | ✅ |
| Background canvas | Orbs animados (radial gradients) | ✅ |
| Lenis + parallax | Scroll suave + zoom das seções | ✅ |
| Photo blob reveal | Máscara "goo" seguindo o mouse na foto | ✅ |
| Contact panel | Validação + envio ao Worker | — |
| Lazy videos | `IntersectionObserver` carrega vídeos sob demanda | — |

> `_isMobileDevice` (`max-width: 768px` ou `hover: none`) desliga os blocos pesados,
> trocando o Canvas por um gradiente CSS estático e o Lenis por scroll nativo.

---

## Dependências

### Runtime (carregadas pelo navegador)
- **Lenis** 1.1.14 — `unpkg.com` (scroll suave, desktop)
- **Google Fonts** — Inter + Syne (carregamento não-bloqueante via `media="print"` swap)
- **Google Analytics 4** — `gtag.js`

### Dev (npm, não vão a produção)
- **vite** — dev server
- **terser** — minificação de JS
- **clean-css-cli** — minificação de CSS
- **playwright** — testes/screenshots manuais
- `@tailwindcss/vite` — **resíduo, não utilizado** (candidato a remoção)

---

## Variáveis de ambiente

Nenhuma no frontend. O **Worker** usa um único secret, configurado via Wrangler
(nunca commitado):

| Nome | Onde | Como definir |
|---|---|---|
| `RESEND_API_KEY` | Cloudflare Worker (secret) | `npx wrangler secret put RESEND_API_KEY` |

---

## Decisões de hospedagem

- **GitHub Pages** serve a branch `main` na raiz — deploy é `git push`, sem build.
- Os arquivos `.min.css`/`.min.js` são **commitados** (não gerados no deploy).
- Domínio `nathangguerrero.com.br` via `CNAME` + DNS na Cloudflare.
- `dist/` e `vite.config.js` são resíduos de um pipeline de build Vite **não usado** no
  deploy atual.
