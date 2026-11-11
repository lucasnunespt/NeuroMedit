# Avisos por e-mail (Google Apps Script)

Três avisos automáticos, grátis, enviados pela sua conta Google:

| Aviso | Para quem | Quando |
| --- | --- | --- |
| Pedido novo | você | até 10 min depois de alguém pedir uma sessão |
| Sessão cancelada | você | até 10 min depois de a pessoa cancelar |
| Véspera | a pessoa | às 18h do dia antes de uma sessão confirmada |
| Limpeza de moradas | — | às 3h: a morada de quem recebe a sessão em casa é apagada 2 dias depois da sessão |

Com contas por profissional, os avisos de um pedido de outro profissional vão para o e-mail dele (Ajustes dele), não para o seu.

Os e-mails para você vão para o "E-mail para avisos" dos Ajustes do painel. O lembrete da véspera sai em seu nome ("Lucas · NeuroMedit") e, se a pessoa responder, a resposta chega a esse mesmo e-mail.

## Instalar (uma vez, ~5 minutos)

1. Entre em [script.google.com](https://script.google.com) com a conta que é dona do projeto Firebase `neuromedit` (kaullyano@gmail.com).
2. **Novo projeto** → dê o nome "NeuroMedit avisos".
3. Apague o que estiver em `Code.gs` e cole o conteúdo de `Code.gs` desta pasta.
4. Engrenagem **Definições do projeto** → marque "Mostrar o ficheiro de manifesto appsscript.json". Abra `appsscript.json` e cole o desta pasta.
5. Escolha a função `instalar` no menu de cima e carregue em **Executar**. O Google pede autorização: aceite (ler o Firestore, enviar e-mails, criar gatilhos).
6. Pronto. Para testar já: execute `verificarPedidos` à mão e veja o registo de execução.

## Bom saber

- Limite do Gmail gratuito: 100 destinatários por dia. Chega para dezenas de sessões por dia.
- Cada pedido fica marcado (`avisoPedido`, `avisoCancelada`, `avisoVespera`) para nunca receber o mesmo aviso duas vezes.
- Cancelamentos feitos por você no painel não geram aviso para você.
- Quando o painel abrir a outros profissionais, isto passa para o plano Blaze do Firebase (Trigger Email), com um remetente por profissional.
- Para parar tudo: em script.google.com → Acionadores → apague os três.
