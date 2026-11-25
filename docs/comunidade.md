# Comunidade

A página `comunidade.html`: um lugar fechado e calmo para partilhar o que a prática deixou.
Corre só com o plano gratuito do Firebase (login Google + Firestore), sem Cloud Functions.

## Ficheiros

| Ficheiro | O que faz |
|---|---|
| `comunidade.html` / `comunidade.css` | A página e o estilo (só tokens) |
| `comunidade.js` | Os ecrãs e os botões |
| `comunidade-dados.js` | Tudo o que lê e escreve no Firestore |
| `firestore.rules` (bloco COMUNIDADE) | Quem pode o quê. É aqui que a segurança existe a sério |
| `tests/comunidade.test.mjs` | Testes das regras |

## Antes de a página funcionar: publicar as regras

A página não funciona enquanto as regras novas não estiverem no Firebase. No terminal do VS Code, na pasta do projeto:

```
npx firebase login
npx firebase deploy --only firestore:rules
```

Para correr os testes das regras (precisa de Java): `npm install` e depois `npm run testar-regras`.

## Cidades (nov 2026)

A comunidade passou a ser a **comunidade internacional de yoga e meditação** do NeuroMedit, em três níveis:

1. **Mundo**: os círculos (Calma, Sono, Foco, Partilhas) continuam globais e online.
2. **Cidade** (`#cidade=lisboa`): a camada presencial. Tem o mural da cidade, os encontros no lugar (ou online) e as subcomunidades.
3. **Subcomunidades**: os grupos que os professores criam dentro de uma cidade (campo `cidade` em `comGrupos`).

Decisões do Lucas:

- **Uma cidade só abre com anfitrião.** As outras aparecem "Em breve", com o botão "Quero o NeuroMedit em…". Os pedidos (`comPedidosCidade`, incluindo cidades fora da lista) só o Lucas os vê, para saber onde abrir a seguir.
- **Os anfitriões aprovam quem entra na sua cidade.** Quem pede para entrar escolhe a cidade. O anfitrião só aprova ou recusa os pedidos pendentes da sua cidade, e não vê e-mails nem muda papéis. O Lucas continua a ver tudo.
- **A cidade é escolhida, não detetada.** Não há localização automática. Muda-se no perfil ou em "Esta é a minha cidade".
- **Lista inicial** (botão "Criar a lista de cidades" na Gestão): Lisboa (aberta, com o Lucas como anfitrião), Porto, Sevilha, Madrid, Paris e as 27 capitais do Brasil. Abrir uma cidade = escolher um anfitrião na página dela.

Encontros: online (link do Meet) ou presenciais (lugar numa cidade aberta, com "Ver no mapa").

Por fazer: o mapa das cidades como pontos de luz na Terra (vistas Europa e Américas do design system); seguir mais de uma cidade.

## Quem pode o quê

- **Lucas (admin)**: aprova e remove pessoas, convida, resolve denúncias, apaga qualquer coisa.
- **Professor** (o Lucas dá o papel na Gestão): cria círculos, grupos, avisos e encontros; só apaga o que criou.
- **Membro**: publica, responde, denuncia; só edita e apaga o que é seu.
- **Partilha sem nome**: o nome fica escondido dos membros; só a moderação o consegue ler.
- **Sem contagens**: "Isto ressoou em mim" só é visível a quem carregou.

## O que ficou diferente por não haver plano Blaze

- **Avisos no site, não por e-mail**: o pedido aprovado, as respostas e as inclusões em grupos aparecem nas Novidades (o sino).
- **Convite**: guarda o e-mail da pessoa; ela entra logo quando fizer login com esse e-mail. É o Lucas que lhe manda o link.
- **Encontros ao vivo**: o professor cola o link de uma sala do Google Meet.
- **Foto de perfil**: a da conta Google.
- **Foto da prática** (nov 2026): sem Storage. O aparelho corta a foto ao centro em 4:3, reduz para 960×720 (ou menos) em JPEG e guarda-a no próprio documento da partilha, no campo `imagem` (a regra aceita só `data:image/jpeg;base64,…` até 200 000 caracteres). **É preciso publicar as regras outra vez** para isto funcionar.
- **Perfil**: um só, no avatar do topo ("Meu perfil na comunidade"). Saiu da lateral (nov 2026).
- **Etiqueta Professor nas partilhas**: campo `professor: true`, que a regra só aceita de quem é professor e nunca numa partilha sem nome. Também precisa das regras publicadas.
- **Capas das práticas**: cada prática tem o seu planeta (Respiração Calma → Vênus, Quem está falando? → Saturno, Desacelerar à Noite → Lua, Antes de Dormir → Netuno). O cartão leva direto à prática.
- **Sem resumo semanal.**

## Dívida de design system (não esquecer)

Combinado com o Lucas em nov 2026: estes componentes nasceram no código e ainda têm de ser levados ao design system.

- [ ] Cartão de partilha (`.com-cartao` com autor, etiqueta da prática e ações)
- [ ] Campo de publicar / responder (`.com-novo`, `.com-campo`)
- [ ] Ação de texto e ação de perigo (`.com-acao`, `.com-acao--perigo`, `.com-perigo`)
- [ ] Opção em pílula com estado ligado (`.com-opt`)
- [ ] Mensagem de conversa (`.com-msg`)
- [ ] Janela de confirmação, com nome a escrever (`.com-dialogo`)
- [ ] Aviso curto no fundo do ecrã (`.com-aviso`)
- [ ] Item de círculo na lateral, que vira pílula no telemóvel (`.com-circ`)
- [ ] Botão de perfil e menu da conta, lupa e Novidades da barra do topo
- [ ] Lateral colada à esquerda (`.com-esq` em ecrãs largos): segue a anatomia da SideNav, com destinos em cima e conta/gestão no fundo
- [ ] Região "Dos professores" em dourado da Luz (`.com-prof`: `luz-gold` misturado em `surface` e `line`)
- [ ] Menu "Mais opções" (`.com-menu`), onde fica "Apagar círculo"
- [ ] Foto da prática (`.com-imagem`): 4:3, `radius-md`, tom quente `accent` em soft-light
- [ ] Capa do círculo com o seu planeta (`.com-topo--capa`): Partilhas → Saturno, Calma → Vênus, Sono → Lua, Foco → Netuno; os criados depois recebem um pelo id
- [ ] "Em destaque" (`.com-destaque`): o aviso mais recente dos professores fixado no topo do feed, como os destaques dos grupos do Facebook
- [ ] Campo de publicar fechado numa linha (`.com-compor-abrir`), que abre ao tocar
- [ ] Etiqueta "Professor" (`.com-selo`), segue o Badge (tom neutro) com borda dourada
- [ ] "Sobre este círculo" na coluna da direita (propósito e cuidado); no telemóvel ficam na capa
- [ ] Lista de cidades com ponto de luz (`.com-cidade`, `.com-cidade-ponto`): aberta = `luz-gold`, em breve = só contorno
- [ ] Badge em código (`.com-badge`, tons feito e neutro), igual ao Badge do design system
- [ ] Página da cidade (capa com país, "Esta é a minha cidade", anfitriões, pedidos para entrar)
- [ ] Encontro presencial (`.com-enc-lugar`, com "Ver no mapa")
- [ ] Cartão da prática com capa de planeta em pontos (`.com-pratica`, `planeta()` em comunidade.js): versão pequena (64 px) dos Planetas, com cor do tema (`accent-dark`/`accent`) e não sobre o fundo da Luz

## Por fazer

- ~~Traduzir a página~~ Feito (nov 2026): textos em translations-*.js com chaves `com_*`. O que as pessoas escrevem fica como foi escrito; os quatro círculos iniciais e a prática escolhida são traduzidos na hora de mostrar.
- Barra de baixo no telemóvel ao estilo do mockup (hoje a Comunidade está no Menu).
- Política de privacidade revista por alguém da área, e decidir a idade mínima.
- Ao apagar um círculo, as respostas de outras pessoas e os "ressoou" ficam órfãos na base de dados (não aparecem em lado nenhum); limpar exige o plano Blaze ou um script do Lucas.
- Com Blaze: e-mails, resumo semanal, fotos próprias.
