# NeuroMedit

Meditação guiada com base em neurociência, com a voz de Lucas Nunes. No ar em **[neuromedit.com](https://neuromedit.com)**.

- **Práticas guiadas** em cinco línguas (português, inglês, espanhol, italiano e russo), com temas que acompanham a hora do dia.
- **Meditação ao vivo:** reserva de sessões presenciais, perfil público de cada profissional e um painel para gerir agenda, pedidos e dinheiro.
- **Comunidade sem curtidas:** círculos online por intenção, cidades com encontros ao vivo e anfitrião, grupos, mensagens a dois e perguntas aos professores.

O que mudou, dia a dia: **[NOVIDADES.md](NOVIDADES.md)**.

## Como está feito

Site estático no GitHub Pages, com Firebase (Firestore e login com Google) no plano gratuito, sem servidor próprio. Por isso a segurança está nas regras do Firestore (`firestore.rules`), com testes em `tests/`.

- Design system próprio: tokens em `tokens.css`, regras em `DESIGN.md`.
- Textos: português do Brasil é a língua canónica; as traduções vivem em `translations-*.js`.
- Notas de cada parte em `docs/`.

Desenhado e dirigido por [Lucas Nunes](https://lucasnunespt.github.io), designer de experiência em Lisboa.
