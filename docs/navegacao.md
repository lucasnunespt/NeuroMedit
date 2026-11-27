# Navegação em todas as páginas (nov 2026)

**Regra:** nenhuma página deixa a pessoa presa. Em todas há, a um toque, **Início** e **Configurações** (conta), e uma forma de **voltar**.

- **Páginas do site** já trazem o cabeçalho (`[data-header]`) + `header-nav.js` + `bottom-nav.js` + `settings-panel.js`.
- **Páginas que não o tinham** recebem tudo com uma linha: `<script src="nav-global.js" defer></script>` (perfil, reservar, colaboradores, profissional, painel, poema, why, luz, lucas-site, identidade gráfica, protótipo, página de vendas, 404).
- `data-nav-sem-barra` no `<body>`: só o cabeçalho, sem a barra de baixo (reservar e painel já têm a sua barra em baixo). No telemóvel, o menu do cabeçalho e a marca (→ Início) ficam visíveis.
- A marca leva sempre ao Início (`home.html`).
- Página nova: ou copia o cabeçalho de uma página existente, ou acrescenta `nav-global.js`. Nunca uma página sem os dois.

## Para onde leva cada botão

| Onde estou | Botão | Vai para |
|---|---|---|
| Qualquer página | Marca / Início | `home.html` |
| Qualquer página | Conta (computador) / Menu (telemóvel) | Configurações (tema, idioma, conta) |
| Qualquer página | Voltar (seta) | a página anterior |
| Comunidade → nome de um professor | | `perfil.html?u=@` (perfil único) |
| Perfil | Agendar uma sessão | `reservar.html` |
| Perfil | Enviar mensagem | `comunidade.html#escrever=uid` → a conversa (`#m=`) |
| Reserva (pedido enviado, as minhas sessões) | Voltar | o perfil |
| Painel | Comunidade · Site · Ver a minha página | `comunidade.html` · `home.html` · `perfil.html` |
| Conversa | Mensagens | `#mensagens` |
