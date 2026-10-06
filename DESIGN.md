# Design — NeuroMedit

## Fonte única de verdade

O design system oficial do NeuroMedit é este:

**https://claude.ai/artifact/JHzwjfKnJ11kwCCJkcxvrQ**

Cores, tipografia, ícones, espaçamento, raios, sombras e movimento vêm dele. O CSS deste repositório segue o design system, e não o contrário: se os dois discordarem, o design system ganha e o código é corrigido.

No artifact, os ficheiros que contam são:

- `project/README.md` — o livro da marca: princípios, temas, regras de uso de cor, tipografia, forma, movimento e iconografia.
- `project/tokens.json` — os valores (cores por tema, famílias e estilos de texto, espaçamento, raios, sombras).
- `project/components/<Nome>/README.md` — guia de cada componente; `project/components/bundle.css` — o CSS de referência.

## A regra

> **Nenhuma cor, fonte, raio, sombra ou duração nova fora dos tokens.**

- Usa `var(--token)` com o nome exato do token (`--bg`, `--text-soft`, `--accent`, `--radius-pill`, `--shadow-card`…). Não escrevas o valor literal no CSS.
- Não há fallbacks inventados: em `var(--x, …)`, o valor de reserva também tem de ser um valor de token.
- O design system ainda **não tem tokens de movimento**. As únicas durações documentadas são o ciclo de respiração da Luz (11 s: inspira 4,5 s, expira 6,5 s) e o `sessionBreathe` das sessões (8 s). Qualquer outra duração precisa de ser proposta primeiro.
- Precisas mesmo de um valor que não existe? Propõe-o **primeiro** como adição ao design system (com nome, valor em cada tema e nota de uso). Só depois de entrar nos tokens é que vai para o código.
- O que o README do design system marca como "Decidido, ainda por implementar" é direção, não código atual.

### Tokens com variável própria em `tokens.css`

`tokens.css` (carregado antes de qualquer outra folha) define as variáveis dos tokens que não mudam com o tema: `--radius-pill`, `--radius-chip`, `--control-height`, `--button-pad-x`, `--font-sans`, `--font-serif`, `--luz-gold`, `--luz-gold-soft`, `--luz-glow-core`, `--luz-glow-mid` e `--glow-gold`. As cores e sombras por tema continuam em `theme-sync.css` e no CSS de cada página.

## Temas

Os nomes dos tokens são sempre os mesmos; só os valores mudam com o tema (`theme-sync.js`): `calm` (padrão), `dawn`, `day`, `evening`, `night`, `late-night` e `luz`. Uma regra de CSS nunca deve depender de um tema específico através de um valor literal.

## Componentes existentes

Antes de criar um componente novo, usa um destes:

| Componente | O que é | Origem no código |
|---|---|---|
| **Button** | Botão em pílula: `primary` (um por ecrã, `accent`), `secondary` (borda `line`), `link` (`text-soft`). Altura mínima `control-height`, raio `radius-pill`. | `home.css`, `session.css` |
| **Chip** | Etiqueta de metadados de uma sessão, não clicável. Só na preparação, nunca durante a prática. | `.session-chip` em `session.css` |
| **BottomNav** | Barra inferior do telemóvel: pílula com Início, Biblioteca e Menu, círculo Voltar e, na Biblioteca, círculo de busca. Respeita a mão dominante. Some durante a prática. | `bottom-nav.css`, `bottom-nav.js` |
| **SessionOrb** | Orbe que respira no centro da sessão (ciclo de 8 s), com uma palavra no centro. Decorativo. | `.airlock-orb`, `.practice-orb` em `session.css` |
| **LuzOrbButton** | O único controlo da versão Luz: círculo dourado de 58px só com ícone (play/pause), sempre sobre o escuro da Luz. | `.luz-orb-btn` em `luz-airlock.css` |
| **Planeta** | Planeta de pontos de brilho para fundo de página: SVG base + SVG que respira em 11 s. Um por ecrã, num canto. | ativos do grupo Planetas no design system |
| **SessionCard** | Cartão da biblioteca: disponível (link), "Em breve" (bloqueado, com ícone `lock`) ou com "Por que funciona" dobrado por baixo. Sempre dentro de `nm-session-grid`. | `library.html`, `library.css` (alinhamento em curso, ver Roadmap › Para o site) |

Fora do design system por agora (não copiar como modelo sem o propor antes): cabeçalho, folha "Menu", painel de definições e ecrã de feedback. Estão por documentar, por esta ordem, em `project/07-roadmap.md` do design system.

## Dívida conhecida

O código atual ainda tem muitos valores literais que não correspondem a nenhum token (gradientes `--surface-static-*`, tokens `--header-*`, cores e durações soltas em várias páginas). Estão listados ficheiro a ficheiro, sem alterar nada, em [`docs/valores-fora-do-sistema.md`](docs/valores-fora-do-sistema.md). Ao tocar num desses ficheiros, não acrescentes valores novos; se puderes, troca o literal pelo token equivalente.
