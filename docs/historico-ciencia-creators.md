# Histórico: Ciência, Leituras, Creators e a história de Lucas

Registo de tudo o que foi feito nesta frente de trabalho (outubro de 2026), para servir de base aos commits e para quem continuar depois. A regra de interface é a do `CLAUDE.md`: só tokens do design system, nada de cor, fonte, raio, sombra ou duração soltos.

## 1. Páginas de ciência (escondidas)

| Ficheiro | O que é |
|---|---|
| `evidencia.html` + `evidencia.css` | **Ciência.** 7 estudos (Killingsworth 2010, Hasenkamp 2012, Brewer 2011, Hölzel 2011, Kral 2022, Balban 2023, Kim 2025), cada um com a "leitura honesta" e um botão para o artigo. Secção "O que a ciência ainda não consegue" (6 limites, incluindo Van Dam 2018). |
| `leituras.html` | **Leituras.** O que escrevi (artigos do LinkedIn, case studies, estudos, poema, apresentação) e o que estudei, por tema, com botões. |

- As duas têm `noindex, nofollow`. Não aparecem em nenhum menu.
- Entrada discreta: botão "Ver os estudos e os limites" no fim da página Filosofia (`about.html`, bloco "Sem milagres").
- Todos os links de artigos são DOI ou a página da revista. Em 2026-10-22: os 7 DOI correspondem aos estudos citados e a página do eNeuro abre (Kim, Chen & Mather, 2025). Falta só clicar uma vez em cada botão no navegador, porque as editoras bloqueiam a leitura automática.

## 2. Página Creators (antiga Contributors)

- `contributors.html` passa a chamar-se **Creators** no menu, no título e nos textos (pt, en; rótulos também em es, it, ru). O endereço continua `contributors.html`.
- Conteúdo: cartão do fundador, **A ideia**, **Como eu desenho** (3 cartões), convite para a história completa, cartão do livro *A Revolução da Delicadeza*, **O que construí**, **O que agrego**, princípios e fecho.
- `contributors.css` reescrito só com tokens. Campo de neurónios decorativo atrás do cartão do livro; fotos mais baixas em ecrãs pequenos.
- Textos de venda baseados só em factos do site e do portfólio. Sem números nem prémios inventados.

## 3. Página da história (`about-lucas.html`)

- Reescrita em português e inglês, na primeira pessoa, com 10 capítulos: Dentro das árvores (2002–2008), A música, A escola nova, O colégio inteiro, Representar, Me construir, Atravessar, Longe do Brasil, O mundo me constrói, A NeuroMedit.
- **Linha do tempo horizontal em forma de rede neural** (`story-timeline.js` + CSS): cada capítulo é um neurónio, as ligações têm dendrites e acendem à medida que se avança.
- **Modo fixo:** ao rolar a página para baixo, a página fica parada e a linha do tempo corre da direita para a esquerda. Só liga se a janela tiver altura para mostrar a linha inteira; senão, a faixa desliza na horizontal com os botões.
- Sem animações com duração (o design system não tem tokens de movimento). O movimento é o scroll da pessoa.
- Fecho em três convites: fazer parte (contacto), ler o livro (Amazon BR) e começar uma meditação (único botão principal).
- Navegação: a seta de voltar leva a Creators e o item Creators fica marcado no menu (`bottom-nav.js`, `header-nav.js`).
- Removidos: `about-lucas.css`, `about-lucas.js` e o conteúdo antigo de 7 capítulos em inglês.

## 4. Decisões editoriais (as tuas)

- Linha do tempo curta na página Creators; a história completa vive na sua própria página (o botão "Ler a história completa"). A secção "De onde venho" ficou só com um convite e o botão.
- **Religião:** fica "viver como criança, sem julgar, de forma pura", sem o nome nem a igreja.
- **Dinheiro:** os 800 € e o "recomeço do zero" saíram de todos os textos públicos (NeuroMedit e portfólio).
- **Trufas e beijinhos** saíram; ficou a popularidade crescente e o ser conhecido e confiável por todas as turmas, o que levou a ser votado para representar os alunos.
- **Avó:** com gratidão. Pagou o primeiro ano do curso de espanhol (2019); em 2020 e 2021 pagaram juntos.
- **Gastronomia** fica fora do portfólio. Os países, os idiomas, as pessoas e a música que o constroem entram nos capítulos "Longe do Brasil" e "O mundo me constrói".
- Biblioteca: de fevereiro de 2020 a abril de 2021. Curso de espanhol: começou em 2019 e terminou em 2021, atrasado pela pandemia.

## 5. Design system no portfólio

- `lucas-portfolio/neuromedit-ds.css` com os tokens (tema `calm` claro e `night` escuro por `prefers-color-scheme`).
- As quatro páginas do portfólio trocaram a paleta terracota e as fontes Inter e Newsreader pelos tokens, sem animações nem fontes externas.
- `tokens.css` ganhou `--container`, `--gutter`, `--radius-lg`, `--radius-md` e `--radius-sm`, que já são tokens do design system.
- **Site publicado** (`lucasnunespt.github.io`, repositório à parte): `neuromedit-ds.css`, o reestilo (incluindo `case-study-silencio.html`), `DESIGN.md`, `CLAUDE.md`, `design-system/` (README e tokens) e a correção da biblioteca. Commit local `4eb8ba7` (tira os 800 €) ainda por enviar.

## 6. Pendente

- Push do commit `4eb8ba7` no repositório do site (tira os 800 € do texto Sobre).
- O PDF do título de residência (`assets/images/benchmark/`) foi removido do repositório e de todo o histórico (o histórico foi reescrito e enviado com push forçado). O GitHub ainda serve o commit antigo `49669de` pelo endereço direto até o suporte apagar os objetos órfãos: ver o pedido em "Remover dados sensíveis" no suporte do GitHub.
- ~~"Hoje tenho 23 anos e vivo há 4 fora do Brasil"~~ — feito em 2026-10-22: "Vivo fora do Brasil desde 2022", nos cinco idiomas.
- Idiomas: as páginas Creators, da história, Ciência e Leituras estão 100% em pt, en, es, it e ru. Os títulos originais dos artigos científicos e os nomes das revistas ficam no idioma original, como em qualquer citação.
- ~~Confirmar a linha do tempo no telemóvel e no desktop largo~~ — verificado em 2026-10-22 (390, 1440 e 2560 px; claro e escuro): modo fixo ativo, sem erros nem scroll horizontal. Nota de desenho: no desktop fica muito espaço vazio entre o cabeçalho e a linha.
- Decidir se a página Ciência deve ser indexada pelo Google (hoje não é).
