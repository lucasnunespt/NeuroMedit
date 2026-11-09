/**
 * painel-pedidos.js — o que espera pelo Lucas no Início, as próximas sessões e o histórico de cancelamentos.
 *
 * Estados de um pedido: pedida → confirmada → realizada (ou falta);
 * pedida → libertada (sem sinal em 24 h); pedida/confirmada → cancelada (→ reembolsada).
 * A lista chega em tempo real (onSnapshot): cada ação muda o Firestore e o ecrã redesenha-se sozinho.
 */
import { db, doc } from "./firebase-init.js";
import { updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { euro } from "./reservas-dados.js";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const quando = (b) => { const d = new Date(`${b.data}T${b.hora}`); return `${SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]} · ${b.hora}`; };
const passou = (b) => new Date(`${b.data}T${b.hora}`) < new Date();
const ordem = (a, b) => (a.data + a.hora).localeCompare(b.data + b.hora);

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto != null) e.textContent = texto;
  return e;
}
function botao(acoes, texto, tipo, fn) {
  const x = el("button", `btn btn--${tipo}`, texto); x.type = "button";
  x.addEventListener("click", async () => {
    acoes.querySelectorAll("button").forEach((y) => { y.disabled = true; });
    try { await fn(); } catch (e) { acoes.querySelectorAll("button").forEach((y) => { y.disabled = false; }); }
  });
  acoes.append(x);
  return x;
}
function linkWhatsApp(b) {
  if (!b.telefone) return null;
  const wa = el("a", "btn btn--link", "WhatsApp"); wa.target = "_blank"; wa.rel = "noopener";
  wa.href = `https://wa.me/${b.telefone.replace(/\D/g, "")}`;
  return wa;
}
const libertarHorario = (b) => (b.slotId ? deleteDoc(doc(db, "slots", b.slotId)).catch(() => {}) : Promise.resolve());

/** Cancelamento feito pelo Lucas: pergunta o motivo (opcional) e se o sinal é devolvido. */
function blocoCancelar(b) {
  const caixa = el("div", "pedido-cancelar"); caixa.hidden = true;
  const rot = el("label", "rotulo-campo", "Motivo (opcional, só você vê)");
  const motivo = el("textarea", "campo-texto"); motivo.rows = 2;
  rot.append(motivo);
  const acoes = el("div", "pedido-acoes");
  const ref = doc(db, "bookings", b.id);
  const cancelar = async (devolver) => {
    await updateDoc(ref, {
      estado: "cancelada", canceladoEm: serverTimestamp(), canceladoPor: "lucas",
      reembolsoPedido: devolver, motivo: motivo.value.trim()
    });
    await libertarHorario(b);
  };
  if (b.sinalRecebido) {
    botao(acoes, "Cancelar e devolver o sinal", "primary", () => cancelar(true));
    botao(acoes, "Cancelar, o sinal fica", "secondary", () => cancelar(false));
  } else {
    botao(acoes, "Cancelar o pedido", "primary", () => cancelar(false));
  }
  caixa.append(rot, acoes);
  return caixa;
}

function desenharAcoes(caixa, lista) {
  const acao = [
    ...lista.filter((b) => b.estado === "pedida").map((b) => ({ b, tipo: "sinal" })),
    ...lista.filter((b) => b.estado === "cancelada" && b.reembolsoPedido && !b.reembolsoFeito).map((b) => ({ b, tipo: "reembolso" })),
    ...lista.filter((b) => b.estado === "confirmada" && passou(b)).map((b) => ({ b, tipo: "fechar" }))
  ].sort((x, y) => ordem(x.b, y.b));
  caixa.textContent = "";
  if (!acao.length) { caixa.append(el("p", "muted", "Nada por agora. Quando alguém pedir uma sessão, aparece aqui.")); return; }
  acao.forEach(({ b, tipo }) => {
    const item = el("div", "pedido");
    item.append(
      el("p", "label pedido-meta", { sinal: "Pedido novo · à espera do sinal", reembolso: "Reembolso a fazer", fechar: "Como correu?" }[tipo]),
      el("p", "pedido-nome", b.nome || b.email || "Sem nome"),
      el("p", "muted", tipo === "reembolso"
        ? `Devolver ${euro(b.sinal)} do sinal por MB Way · era ${quando(b)}`
        : `${quando(b)} · ${euro(b.valor)}${b.plano > 1 ? ` · pacote de ${b.plano}` : ""}`),
      el("p", "muted pedido-contacto", [b.telefone, b.email, b.local].filter(Boolean).join(" · "))
    );
    if (tipo === "reembolso" && b.motivo) item.append(el("p", "muted pedido-motivo", `"${b.motivo}"`));
    const acoes = el("div", "pedido-acoes");
    const ref = doc(db, "bookings", b.id);
    if (tipo === "sinal") {
      botao(acoes, "Recebi o sinal e confirmar", "primary", () => updateDoc(ref, { estado: "confirmada", sinalRecebido: true, confirmadoEm: serverTimestamp() }));
      botao(acoes, "Libertar o horário", "secondary", async () => { await updateDoc(ref, { estado: "libertada" }); await libertarHorario(b); });
    }
    if (tipo === "reembolso") botao(acoes, "Já devolvi", "primary", () => updateDoc(ref, { reembolsoFeito: true, estado: "reembolsada", reembolsadoEm: serverTimestamp() }));
    if (tipo === "fechar") {
      botao(acoes, "Sessão feita", "primary", () => updateDoc(ref, { estado: "realizada", realizadaEm: serverTimestamp() }));
      botao(acoes, "Faltou", "secondary", () => updateDoc(ref, { estado: "falta" }));
    }
    const wa = linkWhatsApp(b); if (wa) acoes.append(wa);
    item.append(acoes);
    caixa.append(item);
  });
}

function desenharProximas(caixa, lista) {
  const proximas = lista.filter((b) => b.estado === "confirmada" && !passou(b)).sort(ordem);
  caixa.textContent = "";
  if (!proximas.length) { caixa.append(el("p", "muted", "Nenhuma sessão confirmada por agora.")); return; }
  proximas.forEach((b) => {
    const item = el("div", "pedido");
    item.append(
      el("p", "pedido-nome", b.nome || b.email || "Sem nome"),
      el("p", "muted", `${quando(b)} · ${euro(b.valor)}${b.plano > 1 ? ` · pacote de ${b.plano}` : ""} · ${b.local || "a combinar"}`)
    );
    const acoes = el("div", "pedido-acoes");
    const cancelar = blocoCancelar(b);
    const abrir = el("button", "btn btn--secondary", "Cancelar esta sessão"); abrir.type = "button";
    abrir.addEventListener("click", () => {
      cancelar.hidden = !cancelar.hidden;
      abrir.textContent = cancelar.hidden ? "Cancelar esta sessão" : "Não cancelar";
    });
    acoes.append(abrir);
    const wa = linkWhatsApp(b); if (wa) acoes.append(wa);
    item.append(acoes, cancelar);
    caixa.append(item);
  });
}

function situacaoSinal(b) {
  if (b.estado === "libertada") return "sem sinal, horário libertado";
  if (!b.sinalRecebido) return "o sinal ainda não tinha chegado";
  if (b.estado === "reembolsada") return `sinal de ${euro(b.sinal)} devolvido`;
  if (b.reembolsoPedido) return `sinal de ${euro(b.sinal)} por devolver`;
  return `sinal de ${euro(b.sinal)} ficou`;
}

function desenharCanceladas(caixa, lista) {
  const canceladas = lista
    .filter((b) => ["cancelada", "reembolsada", "libertada"].includes(b.estado))
    .sort((a, b) => ordem(b, a))
    .slice(0, 30);
  caixa.textContent = "";
  if (!canceladas.length) { caixa.append(el("p", "muted", "Nenhuma sessão cancelada.")); return; }
  canceladas.forEach((b) => {
    const item = el("div", "pedido");
    const quem = b.estado === "libertada" ? "Libertada por você" : b.canceladoPor === "lucas" ? "Cancelada por você" : "Cancelada pela pessoa";
    item.append(
      el("p", "label pedido-meta", quem),
      el("p", "pedido-nome", b.nome || b.email || "Sem nome"),
      el("p", "muted", `${quando(b)} · ${situacaoSinal(b)}`)
    );
    if (b.motivo) item.append(el("p", "muted pedido-motivo", `"${b.motivo}"`));
    caixa.append(item);
  });
}

export function desenharPedidos(caixa, proxCaixa, cancCaixa, lista) {
  if (lista === null) {
    [caixa, proxCaixa, cancCaixa].forEach((c) => { c.textContent = ""; c.append(el("p", "muted", "Não consegui ler os pedidos agora. Verifique a ligação; atualiza sozinho quando voltar.")); });
    return;
  }
  desenharAcoes(caixa, lista);
  desenharProximas(proxCaixa, lista);
  desenharCanceladas(cancCaixa, lista);
}
