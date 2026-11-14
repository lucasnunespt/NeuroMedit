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
- **Foto**: a da conta Google.
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

## Por fazer

- Traduzir a página (hoje só em português do Brasil).
- Barra de baixo no telemóvel ao estilo do mockup (hoje a Comunidade está no Menu).
- Política de privacidade revista por alguém da área, e decidir a idade mínima.
- Ao apagar um círculo, as respostas de outras pessoas e os "ressoou" ficam órfãos na base de dados (não aparecem em lado nenhum); limpar exige o plano Blaze ou um script do Lucas.
- Com Blaze: e-mails, resumo semanal, fotos próprias.
