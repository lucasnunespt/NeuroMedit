/**
 * Avisos por e-mail do NeuroMedit (Google Apps Script, grátis, na conta Google do Lucas).
 *
 * Três avisos:
 *   1. Pedido novo      → e-mail para o Lucas quando alguém pede uma sessão (verifica a cada 10 min).
 *   2. Sessão cancelada → e-mail para o Lucas quando a pessoa cancela (a cada 10 min).
 *   3. Véspera          → e-mail para a pessoa, no dia antes de uma sessão confirmada (todos os dias às 18h).
 *
 * Lê e marca os pedidos em /bookings pela API REST do Firestore, com a conta Google dona do projeto
 * Firebase "neuromedit" (as regras do site não se aplicam a esta conta). Cada pedido ganha um campo
 * avisoPedido / avisoCancelada / avisoVespera, para nunca enviar o mesmo aviso duas vezes.
 *
 * Limite: 100 destinatários por dia numa conta Gmail. Instalação: ver README.md ao lado.
 */

const PROJETO = "neuromedit";
const BASE = "https://firestore.googleapis.com/v1/projects/" + PROJETO + "/databases/(default)/documents";
const PAINEL = "https://neuromedit.com/painel.html";
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

// ---------- instalar os gatilhos (correr uma vez, à mão)
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("verificarPedidos").timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger("lembrarVespera").timeBased().atHour(18).everyDays(1).inTimezone("Europe/Lisbon").create();
  // O que já existe antes de instalar não gera avisos: só o que chegar a partir de agora.
  porEstado("pedida").forEach(function (b) { if (!b.avisoPedido) marcar(b.id, "avisoPedido"); });
  porEstado("cancelada").forEach(function (b) { if (!b.avisoCancelada) marcar(b.id, "avisoCancelada"); });
  Logger.log("Gatilhos instalados: verificarPedidos (10 min) e lembrarVespera (18h).");
}

// ---------- 1 e 2: pedidos novos e cancelamentos, para o Lucas
function verificarPedidos() {
  const cfg = lerAjustes();
  const para = cfg.emailAvisos || Session.getEffectiveUser().getEmail();

  porEstado("pedida").forEach(function (b) {
    if (b.avisoPedido) return;
    MailApp.sendEmail({
      to: para,
      subject: "Pedido novo: " + (b.nome || b.email) + ", " + quando(b),
      body: [
        (b.nome || "Alguém") + " pediu uma sessão.",
        "",
        "Quando: " + quando(b),
        "Onde: " + (b.local || "a combinar"),
        "Telefone: " + (b.telefone || "—"),
        "E-mail: " + (b.email || "—"),
        "Valor: " + euro(b.valor) + (b.plano > 1 ? " (pacote de " + b.plano + ")" : "") + " · sinal " + euro(b.sinal),
        "",
        "Confirme quando o sinal chegar: " + PAINEL
      ].join("\n")
    });
    marcar(b.id, "avisoPedido");
  });

  porEstado("cancelada").forEach(function (b) {
    if (b.avisoCancelada || b.canceladoPor === "lucas") return;
    MailApp.sendEmail({
      to: para,
      subject: "Sessão cancelada: " + (b.nome || b.email) + ", " + quando(b),
      body: [
        (b.nome || "Alguém") + " cancelou a sessão de " + quando(b) + ".",
        b.motivo ? "Motivo: " + b.motivo : "",
        b.reembolsoPedido ? "Pediu o reembolso do sinal: faça-o por MB Way e marque no painel." : "",
        "",
        "O horário já voltou a ficar livre. " + PAINEL
      ].filter(function (l, i, a) { return l || a[i - 1]; }).join("\n")
    });
    marcar(b.id, "avisoCancelada");
  });
}

// ---------- 3: lembrete na véspera, para a pessoa
function lembrarVespera() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const dia = Utilities.formatDate(amanha, "Europe/Lisbon", "yyyy-MM-dd");
  const cfg = lerAjustes();

  porEstado("confirmada").forEach(function (b) {
    if (b.data !== dia || b.avisoVespera || !b.email) return;
    const nome = (b.nome || "").split(" ")[0];
    const restante = Math.max(0, (b.valor || 0) - (b.sinal || 0));
    MailApp.sendEmail({
      to: b.email,
      replyTo: cfg.emailAvisos || undefined,
      name: "Lucas · NeuroMedit",
      subject: "Amanhã, às " + b.hora + ": a sua meditação",
      body: [
        "Olá" + (nome ? ", " + nome : "") + ".",
        "",
        "Amanhã, " + quando(b) + ", nos encontramos para a sua meditação" + (b.local ? ", em " + b.local.charAt(0).toLowerCase() + b.local.slice(1) : "") + ".",
        "",
        "Venha com roupa confortável. Não precisa trazer nada nem saber meditar: eu guio tudo.",
        restante && (b.plano || 1) === 1 ? "No dia, falta pagar " + euro(restante) + "." : "",
        "",
        "Se precisar mudar o horário, é só responder a este e-mail.",
        "",
        "Até amanhã,",
        "Lucas"
      ].filter(function (l, i, a) { return l || a[i - 1]; }).join("\n")
    });
    marcar(b.id, "avisoVespera");
  });
}

// ---------- Firestore (REST)
function pedido(url, opcoes) {
  const o = opcoes || {};
  o.headers = { Authorization: "Bearer " + ScriptApp.getOAuthToken() };
  o.contentType = "application/json";
  o.muteHttpExceptions = true;
  const r = UrlFetchApp.fetch(url, o);
  if (r.getResponseCode() >= 300) throw new Error("Firestore " + r.getResponseCode() + ": " + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText() || "{}");
}

function porEstado(estado) {
  const res = pedido(BASE + ":runQuery", {
    method: "post",
    payload: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: "bookings" }],
      where: { fieldFilter: { field: { fieldPath: "estado" }, op: "EQUAL", value: { stringValue: estado } } }
    } })
  });
  return res.filter(function (x) { return x.document; }).map(function (x) {
    const d = valores(x.document.fields);
    d.id = x.document.name.split("/").pop();
    return d;
  });
}

function marcar(id, campo) {
  const corpo = { fields: {} };
  corpo.fields[campo] = { timestampValue: new Date().toISOString() };
  pedido(BASE + "/bookings/" + id + "?updateMask.fieldPaths=" + campo, { method: "patch", payload: JSON.stringify(corpo) });
}

function lerAjustes() {
  try { return valores(pedido(BASE + "/settings/sessao").fields); } catch (e) { return {}; }
}

function valores(campos) {
  const o = {};
  Object.keys(campos || {}).forEach(function (k) { o[k] = valor(campos[k]); });
  return o;
}
function valor(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue" in v) return valores(v.mapValue.fields);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
  return null;
}

// ---------- texto
function quando(b) {
  const d = new Date(b.data + "T" + (b.hora || "00:00") + ":00");
  return SEMANA[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()] + ", às " + b.hora;
}
function euro(n) { return "€" + String(Math.round((n || 0) * 100) / 100).replace(".", ","); }
