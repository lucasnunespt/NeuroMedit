/**
 * painel-dinheiro.js — o que entrou no mês. Só entradas, sem despesas.
 *
 * Conta: sinais recebidos (menos os devolvidos) + o restante das sessões feitas.
 * Por receber: o restante das sessões confirmadas que ainda não aconteceram.
 */
import { euro } from "./reservas-dados.js";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export function iniciarDinheiro(raiz, obterLista) {
  const hoje = new Date();
  let ano = hoje.getFullYear(), mes = hoje.getMonth();
  const $ = (s) => raiz.querySelector(s);
  $("[data-din-ant]").addEventListener("click", () => { const d = new Date(ano, mes - 1, 1); ano = d.getFullYear(); mes = d.getMonth(); desenhar(); });
  $("[data-din-seg]").addEventListener("click", () => { const d = new Date(ano, mes + 1, 1); ano = d.getFullYear(); mes = d.getMonth(); desenhar(); });

  function desenhar() {
    $("[data-din-mes]").textContent = `${MESES[mes].replace(/^./, (c) => c.toUpperCase())} ${ano}`;
    const lista = obterLista();
    if (lista === null) { $("[data-din-total]").textContent = "—"; $("[data-din-nota]").textContent = "Não consegui ler os pedidos agora."; return; }
    const prefixo = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    const doMes = lista.filter((b) => (b.data || "").startsWith(prefixo));
    let sinais = 0, restante = 0, devolvido = 0, porReceber = 0;
    const cont = { realizada: 0, confirmada: 0, falta: 0, cancelada: 0, pacotes: 0 };
    doMes.forEach((b) => {
      if (b.sinalRecebido) sinais += b.sinal || 0;
      if (b.estado === "reembolsada") devolvido += b.sinal || 0;
      if (b.estado === "realizada") { restante += (b.valor || 0) - (b.sinal || 0); cont.realizada++; }
      if (b.estado === "confirmada") { porReceber += (b.valor || 0) - (b.sinal || 0); cont.confirmada++; }
      if (b.estado === "falta") cont.falta++;
      if (b.estado === "cancelada" || b.estado === "reembolsada") cont.cancelada++;
      if (b.plano > 1 && b.sinalRecebido) cont.pacotes++;
    });
    const total = sinais - devolvido + restante;
    $("[data-din-total]").textContent = euro(total);
    $("[data-din-linhas]").innerHTML = [
      ["Sinais recebidos", euro(sinais)],
      ["Pago na hora", euro(restante)],
      ["Sinais devolvidos", devolvido ? "−" + euro(devolvido) : euro(0)]
    ].map(([a, b]) => `<div class="item"><span>${a}</span><span>${b}</span></div>`).join("");
    $("[data-din-sessoes]").innerHTML = [
      ["Feitas", cont.realizada],
      ["Confirmadas, ainda por fazer", cont.confirmada],
      ["Faltou (sinal ficou)", cont.falta],
      ["Canceladas", cont.cancelada],
      ["Pacotes vendidos", cont.pacotes]
    ].map(([a, b]) => `<div class="item"><span>${a}</span><span>${b}</span></div>`).join("");
    $("[data-din-receber]").textContent = euro(porReceber);
    $("[data-din-nota]").textContent = doMes.length ? "" : "Ainda não há sessões neste mês.";
  }
  return desenhar;
}
