# Contas por profissional

Primeiro passo para abrir o NeuroMedit a outros profissionais (nov 2026). Ainda não publicado. Nada muda para o Lucas: os dados dele ficam onde sempre estiveram.

## Onde fica cada coisa

| O quê | Lucas (como hoje) | Outro profissional |
| --- | --- | --- |
| Preços, locais, semana, contactos | `/settings/sessao` | `/pros/{proId}` → campo `sessao` |
| Perfil público | `/settings/perfil` | `/pros/{proId}` → campo `perfil` |
| Agenda do mês | `/availability/{AAAA-MM}` | `/pros/{proId}/availability/{AAAA-MM}` |
| Horário ocupado | `/slots/AAAA-MM-DD_HH` | `/slots/{proId}_AAAA-MM-DD_HH` |
| Pedidos | `/bookings` sem `proId` | `/bookings` com `proId` |
| Página de reserva | `reservar.html` | `reservar.html?p={proId}` |
| Perfil público | `perfil.html` | `perfil.html?p={proId}` |

`proId` = o uid da conta Google do profissional.

## Quem vê o quê (firestore.rules)

- **Perfil e agenda de um profissional:** públicos só com `estado: "aprovado"`. Antes disso, só ele e o Lucas.
- **Estado:** `rascunho` → `pendente` (o profissional pede revisão) → `aprovado` (só o Lucas). Um profissional nunca se aprova.
- **Pedidos:** a pessoa vê os seus; o profissional vê e gere os pedidos com o seu `proId`; o Lucas vê todos.
- **Horários ocupados:** o id leva o `proId`, por isso dois profissionais não se bloqueiam um ao outro.

## Morada do cliente

- Só pedida quando o local é "em casa do cliente" (o nome do local contém "casa do cliente", "em sua casa" ou "ao domicílio").
- Máximo 200 caracteres, guardada no pedido (`moradaCliente`), visível só para a pessoa, o profissional e o Lucas.
- Apagada sozinha 2 dias depois da sessão, pela função `apagarMoradas` dos avisos por e-mail (Apps Script, às 3h).
- Nunca aparece no perfil público.

## O caminho de um profissional (11 nov 2026)

1. `profissional.html`: entra com o Google e responde a seis perguntas (nome, área, onde, sessão, contacto, conferir). Cria `/pros/{uid}` em **rascunho**.
2. `painel.html`: o mesmo painel do Lucas, a ler e escrever na conta dele (Agenda, Ajustes, Pedidos, Dinheiro). No Início, o cartão "A sua página" mostra o estado e o botão **Pedir aprovação**.
3. No painel do Lucas aparece "Perfis à espera de aprovação": **Aprovar** ou **Pedir alterações** (com uma nota que a pessoa lê no painel dela).
4. Aprovado: entra em `colaboradores.html` e as páginas `perfil.html?p=` e `reservar.html?p=` ficam públicas.

Limites de hoje: a reserva pede sempre um sinal por MB Way (mínimo 1 €); os pacotes só aparecem se tiverem preço; depois de aprovado, o que o profissional editar fica público sem nova revisão.

## Antes de divulgar a outros profissionais

1. **Publicar as regras**: `firebase deploy --only firestore:rules`. Sem isto, ninguém além do Lucas consegue criar conta (as regras antigas recusam `/pros`).
2. **Testar as regras.** Os 26 casos abaixo estão escritos em `tests/regras.test.mjs`. Para correr, numa máquina com Java e acesso à Google:

   ```
   npm install
   npm run testar-regras
   ```

   Ainda não foram corridos: o ambiente do agente não alcança os servidores da Google, por isso o emulador não descarrega. As regras estão publicadas sem nunca terem sido executadas contra um caso. Casos cobertos:
   - um profissional cria a sua conta em rascunho, edita, pede aprovação, e **não** consegue pôr `estado: "aprovado"`;
   - um visitante sem login lê um perfil aprovado e **não** lê um rascunho;
   - um profissional lê e confirma os seus pedidos (`where proId == uid`) e **não** lê os do Lucas;
   - um cliente reserva com `?p=` (horário `{proId}_AAAA-MM-DD_HH` + pedido com `proId`) e cancela;
   - as reservas do Lucas continuam a funcionar como antes.
3. Formulário, aprovação e colaboradores foram testados só com uma base de dados falsa, sem regras.
