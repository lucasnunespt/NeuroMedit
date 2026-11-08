/**
 * painel-pedidos.js — o que espera pelo Lucas no Início, e as ações de um toque.
 *
 * Estados de um pedido: pedida → confirmada → realizada (ou falta);
 * pedida → libertada (sem sinal em 24 h); confirmada → cancelada (→ reembolsada).
 */
import { db, doc } from "./firebase-init.js";
import { updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { euro } from "./reservas-dados.js";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const quando = (b) => { const d = new Date(`${b.data}T${b.hora}`); return `${SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]} · ${b.hora}`; };
const passou = (b) => new Date(`${b.data}T${b.hora}`) < new Date();

function grupos(lista) {
  const ag = (a, b) => (a.data + a.hora).localeCompare(b.data + b.hora);
  return {
    acao: [
      ...lista.filter((b) => b.estado === "pedida").map((b) => ({ b, tipo: "sinal" })),
      ...lista.filter((b) => b.estado === "cancelada" && b.reembolsoPedido && !b.reembolsoFeito).map((b) => ({ b, tipo: "reembolso" })),
      ...lista.filter((b) => b.estado === "confirmada" && passou(b)).map((b) => ({ b, tipo: "fechar" }))
    ].sort((x, y) => ag(x.b, y.b)),
    proximas: lista.filter((b) => b.estado === "confirmada" && !passou(b)).sort(ag)
  };
}

export function desenharPedidos(caixa, proxCaixa, lista, recarregar) {
  if (lista === null) { caixa.innerHTML = '<p class="muted">Não consegui ler os pedidos agora. Tente de novo daqui a pouco.</p>'; return; }
  const { acao, proximas } = grupos(lista);
  caixa.textContent = "";
  if (!acao.length) caixa.innerHTML = '<p class="muted">Nada por agora. Quando alguém pedir uma sessão, aparece aqui.</p>';

  acao.forEach(({ b, tipo }) => {
    const item = document.createElement("div");
    item.className = "pedido";
    const meta = { sinal: "Pedido novo · à espera do sinal", reembolso: "Reembolso a fazer", fechar: "Como correu?" }[tipo];
    const linha2 = tipo === "reembolso" ? `Devolver ${euro(b.sinal)} do sinal por MB Way` : `${quando(b)} · ${euro(b.valor)}${b.plano > 1 ? ` · pacote de ${b.plano}` : ""}`;
    item.innerHTML = `<p class="label" style="margin-bottom: 4px;">${meta}</p><p class="pedido-nome"></p><p class="muted"></p><p class="muted pedido-contacto"></p><div class="pedido-acoes"></div>`;
    item.querySelector(".pedido-nome").textContent = b.nome || b.email || "Sem nome";
    item.querySelectorAll(".muted")[0].textContent = linha2;
    item.querySelector(".pedido-contacto").textContent = [b.telefone, b.email, b.local].filter(Boolean).join(" · ");
    const acoes = item.querySelector(".pedido-acoes");
    const botao = (texto, tipoBtn, fn) => {
      const x = document.createElement("button"); x.type = "button"; x.className = `btn btn--${tipoBtn}`; x.textContent = texto;
      x.addEventListener("click", async () => {
        acoes.querySelectorAll("button").forEach((y) => { y.disabled = true; });
        try { await fn(); recarregar(); } catch (e) { acoes.querySelectorAll("button").forEach((y) => { y.disabled = false; }); }
      });
      acoes.append(x);
    };
    const ref = doc(db, "bookings", b.id);
    if (tipo === "sinal") {
      botao("Recebi o sinal e confirmar", "primary", () => updateDoc(ref, { estado: "confirmada", sinalRecebido: true, confirmadoEm: serverTimestamp() }));
      botao("Libertar o horário", "secondary", async () => { await updateDoc(ref, { estado: "libertada" }); await deleteDoc(doc(db, "slots", b.slotId)).catch(() => {}); });
    }
    if (tipo === "reembolso") botao("Já devolvi", "primary", () => updateDoc(ref, { reembolsoFeito: true, estado: "reembolsada", reembolsadoEm: serverTimestamp() }));
    if (tipo === "fechar") {
      botao("Sessão feita", "primary", () => updateDoc(ref, { estado: "realizada", realizadaEm: serverTimestamp() }));
      botao("Faltou", "secondary", () => updateDoc(ref, { estado: "falta" }));
    }
    if (b.telefone) {
      const wa = document.createElement("a"); wa.className = "btn btn--link"; wa.textContent = "WhatsApp"; wa.target = "_blank"; wa.rel = "noopener";
      wa.href = `https://wa.me/${b.telefone.replace(/\D/g, "")}`;
      acoes.append(wa);
    }
    caixa.append(item);
  });

  proxCaixa.textContent = "";
  if (!proximas.length) { proxCaixa.innerHTML = '<p class="muted">Nenhuma sessão confirmada por agora.</p>'; return; }
  proximas.forEach((b) => {
    const l = document.createElement("div"); l.className = "item";
    const a = document.createElement("span"); a.textContent = b.nome || b.email;
    const c = document.createElement("span"); c.textContent = quando(b);
    l.append(a, c); proxCaixa.append(l);
  });
}
