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

## Ainda falta

1. **Painel para cada profissional:** hoje o painel só abre para o admin. Falta abrir para quem tem `/pros/{uid}`, com os módulos (Agenda, Ajustes, Pedidos, Dinheiro) a ler e escrever no caminho do profissional.
2. **Formulário de entrada** (uma pergunta por vez) que cria `/pros/{uid}` em rascunho.
3. **Aprovação** no painel do Lucas: lista de perfis pendentes, com Aprovar e Pedir alterações.
4. **Página de colaboradores** a partir dos perfis aprovados.
5. **Publicar as regras** (`firebase deploy --only firestore:rules`) depois de as testar no emulador. Ainda não foram testadas.
