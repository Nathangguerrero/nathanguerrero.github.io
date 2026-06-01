# Changelog

Todas as mudanças relevantes deste projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] — 2026-06-01

Primeiro lançamento público em [nathangguerrero.com.br](https://nathangguerrero.com.br).

### Features
- **Hero** com vídeo de fundo, título com parallax e palavra que cicla (typewriter).
- **Seção "Quem sou eu"** com efeito de máscara "goo" na foto seguindo o mouse.
- **Drawer de projetos** — 13 estudos de caso abertos em `<iframe>`, com navegação por
  setas, swipe (mobile) e teclado.
- **Background animado** em Canvas (orbs com gradientes radiais) no desktop.
- **Scroll suave** (Lenis) + zoom de parallax nas seções (desktop).
- **Formulário de contato** integrado via Cloudflare Worker + Resend, com validação
  inteligente de e-mail/WhatsApp.
- **SEO** completo: meta description, Open Graph, Twitter Card, canonical, `robots.txt`,
  `sitemap.xml`.
- **Google Analytics 4** integrado.
- Versões **mobile dedicadas** dos vídeos pesados (hero e thumbnails).

### Performance
- Vídeos do hero e thumbnails recomprimidos (ex.: hero 14MB → 4MB; thumbs até −96%).
- Imagens 4K downscaladas para 1920px; assets de imagem reduzidos ~31%.
- Animações pesadas (Canvas, tilt 3D, Lenis, parallax) **desligadas no mobile**.
- Scripts não-bloqueantes; fontes com carregamento diferido.
- Lazy loading de vídeos dos cards e posters em todos os vídeos de projeto.

### Correções
- **Scroll mobile:** corrigido o bloqueio do scroll dentro do drawer no iOS
  (remoção de `transform`/`overflow` em ancestrais do iframe; `touch-action`).
- Trava de scroll do fundo ao abrir overlays sem travar o conteúdo interno.
- Teclado mobile não abre mais sozinho ao abrir o formulário.
- Foto da seção "sobre" agora segue e retorna suavemente com o mouse.
- Vídeos verticais ajustados para não estourar a tela no mobile.
- **SEO:** corrigido `og:image` que apontava para arquivo inexistente (preview de
  compartilhamento quebrado).

### Acessibilidade
- Contraste do texto secundário nas páginas de projeto corrigido para WCAG AA
  (`#5a5a5a` → `#909090`, 2.87:1 → 6.20:1).
- `aria-label` nos links de logo (antes sem nome acessível).

### Qualidade & manutenção
- Estrutura de pastas/arquivos padronizada em **kebab-case** (pastas e mídia de projeto),
  garantindo compatibilidade com servidores case-sensitive.
- Remoção de código morto (`src/` legado, imagens não usadas, variáveis órfãs).
- Config de ESLint, `.editorconfig`, scripts de `minify`/`lint`/`deploy:worker`.
- Worker: CORS restrito a origens autorizadas + escape de HTML nos inputs.
- Documentação: README, DEVELOPMENT, ARCHITECTURE, CHANGELOG.

### Migração
- Provedor de e-mail do formulário migrado de **EmailJS → Resend** (via Cloudflare Worker),
  tirando qualquer credencial do frontend.

---

[1.0.0]: https://github.com/Nathangguerrero/nathanguerrero.github.io
