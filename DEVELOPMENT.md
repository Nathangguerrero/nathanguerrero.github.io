# Guia de Desenvolvimento

Guia prático para manter e evoluir o portfólio.

---

## 1. Setup

```bash
git clone https://github.com/Nathangguerrero/nathanguerrero.github.io.git
cd nathanguerrero.github.io
npm install
```

Ferramentas globais opcionais (para o Worker):

```bash
npm install -g wrangler   # ou use npx wrangler
```

---

## 2. Rodando localmente

| Comando | Servidor | Porta | Observação |
|---|---|---|---|
| `npm run dev` | Vite | 5173 | HMR completo, recomendado |
| `node devserver.mjs` | Custom | 3456 | Live-reload simples via SSE |

O site é estático: abrir `index.html` direto no navegador também funciona, mas alguns
recursos (fontes, fetch do Worker) preferem ser servidos por HTTP.

---

## 3. Fluxo de edição

> ⚠️ **O navegador carrega os arquivos `.min`, não os fontes.** Editar `style.css`/`main.js`
> sem regenerar o `.min` **não tem efeito em produção.**

1. Edite o **fonte**: `assets/css/style.css` ou `assets/js/main.js`
2. Regenere o **minificado**:
   ```bash
   npm run minify        # ambos
   npm run minify:css    # só CSS
   npm run minify:js     # só JS
   ```
3. Teste local (`npm run dev`)
4. Commit + push (deploy automático no GitHub Pages)

---

## 4. Worker (Cloudflare) {#worker}

O formulário de contato faz `POST` para um Cloudflare Worker, que chama a API do Resend
com a API key guardada como **secret** (nunca no frontend).

**Arquivos:** `worker/index.js` (lógica) · `worker/wrangler.toml` (config)

### Deploy do Worker

```bash
cd worker
npx wrangler login                    # 1x, autentica no Cloudflare
npx wrangler secret put RESEND_API_KEY # cola a API key do Resend quando pedir
npx wrangler deploy                    # publica
```

URL pública: `https://resend-proxy.nathangguerrero.workers.dev`
(referenciada em `assets/js/main.js` → constante `CONTACT_ENDPOINT`)

### Alterar o e-mail receptor

Em `worker/index.js`, campo `to: ['...']`. Após editar, **redeploy** (`npx wrangler deploy`).

---

## 5. Testando o formulário

Teste direto no Worker (sem passar pelo site):

```bash
curl -X POST https://resend-proxy.nathangguerrero.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","contato":"teste@teste.com","tipo_projeto":"Branding","mensagem":"Teste"}'
```

Resposta esperada: `{"success":true}` (HTTP 200) e um e-mail no inbox configurado.

**Validação client-side** (em `main.js`, antes do envio):
- Campo contato com `@` → valida formato de e-mail
- Sem `@` → exige ≥ 10 dígitos (WhatsApp com DDD)

---

## 6. Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Mudança no CSS/JS não aparece | esqueceu de rodar `npm run minify` | regenere os `.min` |
| Form retorna erro | Worker fora do ar / secret faltando | teste o Worker via curl; confira `wrangler secret list` |
| `ERR_NAME_NOT_RESOLVED` no form | cache de DNS local desatualizado | trocar DNS para `8.8.8.8` ou `dscacheutil -flushcache` |
| Vídeo do card não scrolla (iOS) | `transform`/`overflow` no ancestral do iframe | manter `#drawer-panel` sem `transform` quando aberto |
| Scroll do fundo "vaza" no mobile | listener de `touchmove` ausente nos overlays | ver `lockScroll()` em `main.js` |

---

## 7. Padrões de código

- **Indentação:** 2 espaços (ver `.editorconfig`)
- **Nomes de arquivo:** `kebab-case` (ex.: `welcome-day.html`)
- **CSS:** custom properties em `:root`; seções marcadas com `/* ── Título ── */`
- **JS:** IIFEs por feature; seções marcadas com `/* ── Título ── */`; mobile detectado
  uma única vez via `_isMobileDevice`
- **Mobile-first em performance:** animações pesadas (Canvas, tilt 3D, Lenis, parallax)
  são desligadas em telas `≤ 768px` ou `hover: none`
