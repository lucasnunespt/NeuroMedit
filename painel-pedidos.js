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
import { linkRota } from "./perfil-dados.js";
import { tr, local, lingua } from "./traduzir.js";

// Moradas dos locais (Ajustes › Perfil público › Moradas). Com morada, a sessão ganha o botão tr("pn_route", "Rota").
let moradas = {};
export function definirMoradas(m) { moradas = m || {}; }
function linkRotaSessao(b) {
  const morada = moradas[b.local];
  if (!morada) return null;
  const a = el("a", "btn btn--link", tr("pn_route", "Rota")); a.target = "_blank"; a.rel = "noopener";
  a.href = linkRota(morada);
  a.setAttribute("aria-label", tr("pn_route_aria", "Rota até {l}, no Google Maps", { l: b.local }));
  return a;
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const quando = (b) => {
  const d = new Date(`${b.data}T${b.hora}`);
  if (lingua() !== "pt") return `${d.toLocaleDateString(local(), { weekday: "short", day: "numeric", month: "short" })} · ${b.hora}`;
  return `${SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]} · ${b.hora}`;
};
const pacote = (n) => tr("pn_pack_of", "pacote de {n}", { n });
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
  const rot = el("label", "rotulo-campo", tr("pn_reason", "Motivo (opcional, só você vê)"));
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
    botao(acoes, tr("pn_cancel_refund", "Cancelar e devolver o sinal"), "primary", () => cancelar(true));
    botao(acoes, tr("pn_cancel_keep", "Cancelar, o sinal fica"), "secondary", () => cancelar(false));
  } else {
    botao(acoes, tr("pn_cancel_request", "Cancelar o pedido"), "primary", () => cancelar(false));
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
  if (!acao.length) { caixa.append(el("p", "muted", tr("pn_nothing", "Nada por agora. Quando alguém pedir uma sessão, aparece aqui."))); return; }
  acao.forEach(({ b, tipo }) => {
    const item = el("div", "pedido");
    item.append(
      el("p", "label pedido-meta", { sinal: tr("pn_new_request", "Pedido novo · à espera do sinal"), reembolso: tr("pn_refund_todo", "Reembolso a fazer"), fechar: tr("pn_how_went", "Como correu?") }[tipo]),
      el("p", "pedido-nome", b.nome || b.email || tr("pn_no_name", "Sem nome")),
      el("p", "muted", tipo === "reembolso"
        ? tr("pn_refund_line", "Devolver {s} do sinal por MB Way · era {q}", { s: euro(b.sinal), q: quando(b) })
        : `${quando(b)} · ${euro(b.valor)}${b.plano > 1 ? ` · ${pacote(b.plano)}` : ""}`),
      el("p", "muted pedido-contacto", [b.telefone, b.email, b.local].filter(Boolean).join(" · "))
    );
    if (tipo === "reembolso" && b.motivo) item.append(el("p", "muted pedido-motivo", `"${b.motivo}"`));
    const acoes = el("div", "pedido-acoes");
    const ref = doc(db, "bookings", b.id);
    if (tipo === "sinal") {
      botao(acoes, tr("pn_got_deposit", "Recebi o sinal e confirmar"), "primary", () => updateDoc(ref, { estado: "confirmada", sinalRecebido: true, confirmadoEm: serverTimestamp() }));
      botao(acoes, tr("pn_release", "Libertar o horário"), "secondary", async () => { await updateDoc(ref, { estado: "libertada" }); await libertarHorario(b); });
    }
    if (tipo === "reembolso") botao(acoes, tr("pn_refunded", "Já devolvi"), "primary", () => updateDoc(ref, { reembolsoFeito: true, estado: "reembolsada", reembolsadoEm: serverTimestamp() }));
    if (tipo === "fechar") {
      botao(acoes, tr("pn_done", "Sessão feita"), "primary", () => updateDoc(ref, { estado: "realizada", realizadaEm: serverTimestamp() }));
      botao(acoes, tr("pn_noshow", "Faltou"), "secondary", () => updateDoc(ref, { estado: "falta" }));
    }
    const wa = linkWhatsApp(b); if (wa) acoes.append(wa);
    item.append(acoes);
    caixa.append(item);
  });
}

function desenharProximas(caixa, lista) {
  const proximas = lista.filter((b) => b.estado === "confirmada" && !passou(b)).sort(ordem);
  caixa.textContent = "";
  if (!proximas.length) { caixa.append(el("p", "muted", tr("pn_none_confirmed", "Nenhuma sessão confirmada por agora."))); return; }
  proximas.forEach((b) => {
    const item = el("div", "pedido");
    item.append(
      el("p", "pedido-nome", b.nome || b.email || tr("pn_no_name", "Sem nome")),
      el("p", "muted", `${quando(b)} · ${euro(b.valor)}${b.plano > 1 ? ` · ${pacote(b.plano)}` : ""} · ${b.local && b.local !== "A combinar" ? b.local : tr("pn_tbd", "a combinar")}`)
    );
    const acoes = el("div", "pedido-acoes");
    const cancelar = blocoCancelar(b);
    const abrir = el("button", "btn btn--secondary", tr("pn_cancel_this", "Cancelar esta sessão")); abrir.type = "button";
    abrir.addEventListener("click", () => {
      cancelar.hidden = !cancelar.hidden;
      abrir.textContent = cancelar.hidden ? tr("pn_cancel_this", "Cancelar esta sessão") : tr("pn_dont_cancel", "Não cancelar");
    });
    acoes.append(abrir);
    const wa = linkWhatsApp(b); if (wa) acoes.append(wa);
    const rota = linkRotaSessao(b); if (rota) acoes.append(rota);
    item.append(acoes, cancelar);
    caixa.append(item);
  });
}

function situacaoSinal(b) {
  if (b.estado === "libertada") return tr("pn_sig_released", "sem sinal, horário libertado");
  if (!b.sinalRecebido) return tr("pn_sig_not_arrived", "o sinal ainda não tinha chegado");
  if (b.estado === "reembolsada") return tr("pn_sig_refunded", "sinal de {s} devolvido", { s: euro(b.sinal) });
  if (b.reembolsoPedido) return tr("pn_sig_to_refund", "sinal de {s} por devolver", { s: euro(b.sinal) });
  return tr("pn_sig_kept", "sinal de {s} ficou", { s: euro(b.sinal) });
}

// Um pedido já arrumado pode sair do histórico. Nunca um com reembolso por fazer (as regras também o impedem).
const arrumada = (b) => b.estado === "libertada" || b.estado === "reembolsada"
  || (b.estado === "cancelada" && !(b.reembolsoPedido && !b.reembolsoFeito));
// Cancelada com sinal que ficou: apagá-la tira esse sinal das contas do Dinheiro.
const contaNoDinheiro = (b) => b.estado === "cancelada" && b.sinalRecebido;

/** Pergunta no próprio cartão antes de apagar (sem janelas do navegador). */
function confirmarApagar(item, lista, texto, rotulo) {
  if (item.querySelector("[data-confirmar]")) return;
  const caixa = el("div", "pedido-cancelar"); caixa.dataset.confirmar = "";
  const aviso = el("p", "muted", texto);
  const acoes = el("div", "pedido-acoes");
  const sim = el("button", "btn btn--primary", rotulo); sim.type = "button";
  const nao = el("button", "btn btn--secondary", tr("pn_no", "Não")); nao.type = "button";
  nao.addEventListener("click", () => caixa.remove());
  sim.addEventListener("click", async () => {
    sim.disabled = true; nao.disabled = true;
    try { await Promise.all(lista.map((b) => deleteDoc(doc(db, "bookings", b.id)))); }
    catch (e) { sim.disabled = false; nao.disabled = false; aviso.textContent = tr("pn_e_delete", "Não consegui apagar tudo. Tente de novo."); }
    // Com sucesso, a lista chega sozinha (tempo real) e o cartão desaparece.
  });
  acoes.append(sim, nao);
  caixa.append(aviso, acoes);
  item.append(caixa);
}

function desenharCanceladas(caixa, lista) {
  const canceladas = lista
    .filter((b) => ["cancelada", "reembolsada", "libertada"].includes(b.estado))
    .sort((a, b) => ordem(b, a))
    .slice(0, 30);
  caixa.textContent = "";
  if (!canceladas.length) { caixa.append(el("p", "muted", tr("pn_none_cancelled", "Nenhuma sessão cancelada."))); return; }
  canceladas.forEach((b) => {
    const item = el("div", "pedido");
    const quem = b.estado === "libertada" ? tr("pn_by_you_released", "Libertada por você") : b.canceladoPor === "lucas" ? tr("pn_by_you", "Cancelada por você") : tr("pn_by_person", "Cancelada pela pessoa");
    item.append(
      el("p", "label pedido-meta", quem),
      el("p", "pedido-nome", b.nome || b.email || tr("pn_no_name", "Sem nome")),
      el("p", "muted", `${quando(b)} · ${situacaoSinal(b)}`)
    );
    if (b.motivo) item.append(el("p", "muted pedido-motivo", `"${b.motivo}"`));
    if (arrumada(b)) {
      const acoes = el("div", "pedido-acoes");
      const apagar = el("button", "btn btn--secondary", tr("pn_del_history", "Apagar do histórico")); apagar.type = "button";
      apagar.addEventListener("click", () => confirmarApagar(item, [b],
        contaNoDinheiro(b) ? tr("pn_del_q_money", "Apagar esta sessão do histórico? O sinal que ficou deixa de contar nas contas do Dinheiro.") : tr("pn_del_q", "Apagar esta sessão do histórico?"),
        tr("pn_delete", "Apagar")));
      acoes.append(apagar);
      item.append(acoes);
    }
    caixa.append(item);
  });
  // Limpar tudo o que já está arrumado, mesmo o que passou das 30 mostradas.
  const todas = lista.filter((b) => ["cancelada", "reembolsada", "libertada"].includes(b.estado) && arrumada(b));
  if (todas.length > 1) {
    const rodape = el("div", "pedido");
    const acoes = el("div", "pedido-acoes");
    const limpar = el("button", "btn btn--secondary", tr("pn_clear_history", "Limpar o histórico ({n})", { n: todas.length })); limpar.type = "button";
    const dinheiro = todas.filter(contaNoDinheiro).length;
    limpar.addEventListener("click", () => confirmarApagar(rodape, todas,
      tr("pn_clear_q", "Apagar {n} sessões do histórico?", { n: todas.length }) + (dinheiro ? " " + (dinheiro === 1 ? tr("pn_clear_money_1", "O sinal que ficou deixa de contar nas contas do Dinheiro.") : tr("pn_clear_money_n", "Os sinais que ficaram deixam de contar nas contas do Dinheiro.")) : ""),
      tr("pn_clear", "Limpar")));
    acoes.append(limpar);
    rodape.append(acoes);
    caixa.append(rodape);
  }
}

export function desenharPedidos(caixa, proxCaixa, cancCaixa, lista) {
  if (lista === null) {
    [caixa, proxCaixa, cancCaixa].forEach((c) => { c.textContent = ""; c.append(el("p", "muted", tr("pn_e_requests", "Não consegui ler os pedidos agora. Verifique a ligação; atualiza sozinho quando voltar."))); });
    return;
  }
  desenharAcoes(caixa, lista);
  desenharProximas(proxCaixa, lista);
  desenharCanceladas(cancCaixa, lista);
}
