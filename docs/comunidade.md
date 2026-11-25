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

## Encontros, seguir e anfitriões (nov 2026)

Adaptado da pesquisa sobre comunidades de yoga e meditação (sanghas do Plum Village, Insight Timer, Meetup, estúdios):

- **Encontro fixo semanal** (`repete: "semanal"`): como as sanghas, o mesmo dia e hora todas as semanas. O site mostra sempre a próxima data.
- **"N pessoas vão"** (`vao` no encontro): o contador muda no mesmo lote que o lugar guardado; as regras só deixam subir ou descer 1, com o lugar criado ou apagado nesse momento.
- **Lembrete**: quem guardou lugar vê, no topo do mural, o encontro das próximas 24 horas. Sem servidor, só aparece ao abrir o site; por isso cada encontro tem também **"Pôr no calendário"** (Google Calendar; os semanais repetem).
- **Seguir professores**: `comMembros/{prof}/seguidores/{uid}` e a lista própria em `users/{uid}.comSigo`. Quando o professor marca um encontro ou publica um aviso, os seguidores recebem um aviso no sino (tipo `seguindo`).
- **Boas-vindas**: ao aprovar alguém na página da cidade, o anfitrião manda uma mensagem curta (aviso `boas-vindas`). Nos estúdios, até 90% de quem vem pela primeira vez não volta; uma pessoa que fala com elas muda isso.
- **Quero ser anfitrião** (`comPedidosAnfitriao/{uid}`): na lista de cidades e nas cidades em breve. O Lucas vê os pedidos na Gestão e pode tornar a pessoa professora.
- **Dia Internacional do Yoga** (21 de junho, ONU): destaque na lista de cidades, com contagem dos dias e "Pôr no calendário".

## Quem pode o quê

- **Lucas (admin)**: aprova e remove pessoas, convida, resolve denúncias, apaga qualquer coisa.
- **Professor** (o Lucas dá o papel na Gestão): cria círculos, grupos, avisos e encontros; só apaga o que criou.
- **Membro**: publica, responde, denuncia; só edita e apaga o que é seu.
- **Partilha sem nome**: o nome fica escondido dos membros; só a moderação o consegue ler.
- **Números só onde ajudam a aparecer** (nov 2026, decisão do Lucas): "Isto ressoou em mim" continua visível só a quem carregou. Pode-se **seguir professores**, mas o número de seguidores só o próprio professor o vê (no perfil). Cada encontro mostra **"N pessoas vão"** (quantos, nunca quem). Sem curtidas nem rankings.

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

## Vistoria (25 nov 2026)

Antes de a primeira pessoa de fora usar a comunidade, revimos cada ecrã como admin, anfitrião, membro, quem está à espera e visitante, em 1440, 1024, 768, 390 e 320 px.

- **Cabeçalho:** a lateral começa por baixo do cabeçalho. Antes subia por trás do logótipo e a borda cortava o nome "NeuroMedit".
- **Espaço no topo:** o cabeçalho é sticky e já ocupa o seu lugar; a página deixou de somar a altura dele outra vez (no telemóvel havia ~90 px vazios).
- **Anfitriões:**
  - O Lucas escolhe entre todos os membros aprovados, não só professores.
  - Pode tirar um anfitrião.
  - Pode **convidar por e-mail** quem ainda não está na comunidade. Ao entrar com essa conta Google, a pessoa fica aprovada e anfitriã da cidade do convite, e a cidade abre. Isto acontece num só lote, que as regras confirmam contra o convite.
  - "Copiar mensagem" prepara o texto para mandar pelo WhatsApp.
- **O anfitrião marca encontros e cria subcomunidades na sua cidade**, mesmo sem ser professor. Quem criou um grupo continua a geri-lo.
- **Partilha como no Facebook:**
  - As ações secundárias (editar, denunciar, apagar) ficam num "⋯".
  - Em baixo, uma barra com "Isto ressoou em mim" e "Comentar".
  - Quem partilha sem nome tem um ícone de pessoa (antes era um ponto).
- **Comentários:**
  - Balões com o nome e o texto; por baixo, quando e as ações.
  - A caixa de comentar é uma pílula que cresce com o texto, com o enviar dentro. No computador, Enter envia e Shift+Enter muda de linha.
  - **Comentários denunciáveis:** a denúncia marca o comentário e manda a partilha para a fila de moderação, onde "Abrir" mostra o comentário marcado.
- **Telemóvel:** o destaque do Dia do Yoga e o lembrete já não espremem o texto; o lixo de um encontro fica ao lado do título; "Seguir" tem área de toque maior.

Testes: 31 cliques antigos, 25 dos fluxos novos, cidades e anfitriões. Auditoria automática a 110 ecrãs: sem rolagem horizontal nem erros. As regras novas têm testes em `tests/comunidade.test.mjs`, ainda por correr no emulador.
