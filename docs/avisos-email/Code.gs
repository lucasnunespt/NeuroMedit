/**
 * Avisos por e-mail do NeuroMedit (Google Apps Script, grátis, na conta Google do Lucas).
 *
 * Três avisos:
 *   1. Pedido novo      → e-mail para o Lucas quando alguém pede uma sessão (verifica a cada 10 min).
 *   2. Sessão cancelada → e-mail para o Lucas quando a pessoa cancela (a cada 10 min).
 *   3. Véspera          → e-mail para a pessoa, no dia antes de uma sessão confirmada (todos os dias às 18h).
 * E uma limpeza: a morada do cliente (sessões em casa dele) é apagada dois dias depois da sessão (todos os dias às 3h).
 *
 * Contas por profissional: um pedido com proId avisa o e-mail desse profissional (/pros/{proId}, sessao.emailAvisos);
 * sem proId, é do Lucas (/settings/sessao).
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
  ScriptApp.newTrigger("apagarMoradas").timeBased().atHour(3).everyDays(1).inTimezone("Europe/Lisbon").create();
  // O que já existe antes de instalar não gera avisos: só o que chegar a partir de agora.
  porEstado("pedida").forEach(function (b) { if (!b.avisoPedido) marcar(b.id, "avisoPedido"); });
  porEstado("cancelada").forEach(function (b) { if (!b.avisoCancelada) marcar(b.id, "avisoCancelada"); });
  Logger.log("Gatilhos instalados: verificarPedidos (10 min), lembrarVespera (18h) e apagarMoradas (3h).");
}

// ---------- 1 e 2: pedidos novos e cancelamentos, para o Lucas
function verificarPedidos() {
  const lucas = lerAjustes().emailAvisos || Session.getEffectiveUser().getEmail();
  const cache = {};
  function emailDe(b) {
    if (!b.proId) return lucas;
    if (!(b.proId in cache)) cache[b.proId] = (lerAjustesPro(b.proId).emailAvisos) || lucas;
    return cache[b.proId];
  }

  porEstado("pedida").forEach(function (b) {
    if (b.avisoPedido) return;
    MailApp.sendEmail({
      to: emailDe(b),
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
      to: emailDe(b),
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
  const lucas = lerAjustes();

  porEstado("confirmada").forEach(function (b) {
    if (b.data !== dia || b.avisoVespera || !b.email) return;
    const cfg = b.proId ? lerAjustesPro(b.proId) : lucas;
    const quem = b.proId ? ((lerPro(b.proId).perfil || {}).nome || "").split(" ")[0] : "Lucas";
    const nome = (b.nome || "").split(" ")[0];
    const restante = Math.max(0, (b.valor || 0) - (b.sinal || 0));
    MailApp.sendEmail({
      to: b.email,
      replyTo: cfg.emailAvisos || undefined,
      name: (quem || "NeuroMedit") + " · NeuroMedit",
      subject: "Amanhã, às " + b.hora + ": a sua meditação",
      body: [
        "Olá" + (nome ? ", " + nome : "") + ".",
        "",
        "Amanhã, " + quando(b) + ", nos encontramos para a sua meditação" + (b.local ? ", em " + b.local.charAt(0).toLowerCase() + b.local.slice(1) : "") + ".",
        "",
        b.proId ? "" : "Venha com roupa confortável. Não precisa trazer nada nem saber meditar: eu guio tudo.",
        restante && (b.plano || 1) === 1 ? "No dia, falta pagar " + euro(restante) + "." : "",
        "",
        "Se precisar mudar o horário, é só responder a este e-mail.",
        "",
        "Até amanhã,",
        quem || ""
      ].filter(function (l, i, a) { return l || a[i - 1]; }).join("\n")
    });
    marcar(b.id, "avisoVespera");
  });
}

// ---------- limpeza: morada do cliente apagada 2 dias depois da sessão
function apagarMoradas() {
  const limite = new Date();
  limite.setDate(limite.getDate() - 2);
  const ate = Utilities.formatDate(limite, "Europe/Lisbon", "yyyy-MM-dd");
  ["pedida", "confirmada", "realizada", "falta", "cancelada", "libertada", "reembolsada"].forEach(function (estado) {
    porEstado(estado).forEach(function (b) {
      if (!b.moradaCliente || !b.data || b.data > ate) return;
      // updateMask com o campo e sem valor = o campo é apagado.
      pedido(BASE + "/bookings/" + b.id + "?updateMask.fieldPaths=moradaCliente", { method: "patch", payload: JSON.stringify({ fields: {} }) });
    });
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
function lerPro(proId) {
  try { return valores(pedido(BASE + "/pros/" + proId).fields); } catch (e) { return {}; }
}
function lerAjustesPro(proId) { return lerPro(proId).sessao || {}; }

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
