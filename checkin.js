/* ==========================================================
   checkin.js — "Como você chega?" antes da prática e a diferença no fim (nov 2026).
   Fica só neste aparelho (localStorage): nada vai para o servidor nem para a comunidade.
   - Ecrã de preparação ([data-session-flow]): uma pergunta opcional de 1 (tenso) a 5 (calmo).
   - No fim: feedback.html já pergunta "Como você se sente agora?" (mais leve / igual / mais tenso);
     guardamos essa resposta junto da de antes. Em complete.html, que não pergunta, mostramos as mesmas três.
   - Depois de responder: chegou em X de 5 · saiu mais leve, e o padrão das últimas práticas.
   Porquê: notar a mudança ajuda o cérebro a ligar a prática ao alívio, e é isso que faz o hábito ganhar raiz.
   ========================================================== */
(() => {
  const CHAVE = "nm-checkins", ANTES = "nm-checkin-antes";
  const lingua = () => (document.documentElement.lang || "pt").slice(0, 2);
  const t = (k, f) => { const d = window.NeuroMeditTranslations || {}; return (d[lingua()] && d[lingua()][k]) || (d.pt && d.pt[k]) || f; };
  const ler = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado: sem histórico */ } };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  // ---------- Antes: no ecrã de preparação de cada prática ----------
  const fluxo = document.querySelector("[data-session-flow]");
  const linha = fluxo?.querySelector("[data-session-step='prep'] .session-play-row");
  if (fluxo && linha) {
    const caixa = el("div", "checkin");
    caixa.setAttribute("role", "group");
    const q = el("p", "checkin-q", t("checkin_antes", "Antes de começar: como você chega?"));
    q.id = "checkin-q";
    caixa.setAttribute("aria-labelledby", "checkin-q");
    const escala = el("div", "checkin-escala");
    const botoes = [1, 2, 3, 4, 5].map((v) => {
      const b = el("button", "checkin-ponto", String(v));
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", `${v} de 5${v === 1 ? ", " + t("checkin_tenso", "tenso") : v === 5 ? ", " + t("checkin_calmo", "calmo") : ""}`);
      b.addEventListener("click", () => {
        botoes.forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
        try { sessionStorage.setItem(ANTES, JSON.stringify({ v, pratica: fluxo.dataset.feedbackPractice || location.pathname.replace(/^.*\//, "").replace(/\.html$/, ""), t: Date.now() })); } catch (e) {}
      });
      return b;
    });
    escala.append(...botoes);
    const pontas = el("div", "checkin-pontas");
    pontas.append(el("span", "", t("checkin_tenso", "tenso")), el("span", "", t("checkin_calmo", "calmo")));
    caixa.append(q, escala, pontas, el("p", "checkin-nota", t("checkin_privado", "Opcional. Fica só neste aparelho.")));
    linha.before(caixa);
    try { sessionStorage.removeItem(ANTES); } catch (e) {}
  }

  // ---------- Depois: guardar e mostrar a diferença ----------
  const ROT = { leve: () => t("checkin_leve", "mais leve"), igual: () => t("checkin_igual", "igual"), tenso: () => t("checkin_mais_tenso", "mais tenso") };
  function registar(depois) {
    let antes = null;
    try { antes = JSON.parse(sessionStorage.getItem(ANTES)); sessionStorage.removeItem(ANTES); } catch (e) {}
    if (antes && Date.now() - antes.t > 3 * 3600 * 1000) antes = null; // de outra prática, há horas
    const lista = ler(CHAVE, []);
    lista.push({ t: Date.now(), pratica: antes?.pratica || "", antes: antes?.v || null, depois });
    gravar(CHAVE, lista.slice(-60));
    return { antes: antes?.v || null, lista };
  }
  function resumo(alvo, depois, antes, lista) {
    const box = el("div", "checkin checkin--fim");
    box.setAttribute("role", "status");
    const frase = antes ? `${t("checkin_chegou", "Chegou em")} ${antes} ${t("checkin_de5", "de 5")} · ${t("checkin_saiu", "saiu")} ${ROT[depois]()}.` : `${t("checkin_saiu_cap", "Saiu")} ${ROT[depois]()}.`;
    box.append(el("p", "checkin-q", frase));
    const ult = lista.slice(-7);
    if (ult.length >= 2) {
      const leves = ult.filter((x) => x.depois === "leve").length;
      box.append(el("p", "checkin-nota", t("checkin_padrao", "Nas últimas {n} práticas, saiu mais leve em {m}.").replace("{n}", ult.length).replace("{m}", leves)));
    }
    box.append(el("p", "checkin-nota", t("checkin_porque", "Reparar na diferença ajuda o cérebro a ligar a prática ao alívio. É assim que o hábito ganha raiz.")));
    alvo.after(box);
  }

  // feedback.html (prática completa): a pergunta que já existe.
  const opcoes = document.querySelectorAll("[data-feedback-completed]");
  if (opcoes.length && new URLSearchParams(location.search).get("status") === "completed") {
    const valores = ["leve", "igual", "tenso"];
    opcoes.forEach((b, i) => b.addEventListener("click", () => {
      if (document.querySelector(".checkin--fim")) return;
      const { antes, lista } = registar(valores[i] || "igual");
      resumo(document.querySelector("[data-feedback-thank-you]") || b.parentElement, valores[i] || "igual", antes, lista);
    }, { once: true }));
  }

  // complete.html: não há pergunta; mostramos as mesmas três.
  const texto = document.querySelector(".complete-page .complete-text");
  if (texto && !opcoes.length) {
    const caixa = el("div", "checkin");
    caixa.setAttribute("role", "group");
    const q = el("p", "checkin-q", t("checkin_depois", "E agora, como você sai?"));
    q.id = "checkin-q2";
    caixa.setAttribute("aria-labelledby", "checkin-q2");
    const fila = el("div", "checkin-opcoes");
    ["leve", "igual", "tenso"].forEach((v) => {
      const b = el("button", "checkin-opcao", ROT[v]().replace(/^./, (c) => c.toUpperCase()));
      b.type = "button";
      b.addEventListener("click", () => {
        const { antes, lista } = registar(v);
        caixa.replaceWith(el("div"));
        resumo(texto, v, antes, lista);
      });
      fila.append(b);
    });
    caixa.append(q, fila);
    texto.after(caixa);
  }
})();
