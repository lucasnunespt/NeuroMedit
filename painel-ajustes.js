/**
 * painel-ajustes.js — os Ajustes do painel do Lucas.
 *
 * Tudo vive num documento: /settings/sessao (leitura pública, escrita só do admin).
 * As páginas de reserva vão ler preços, sinal, regras e locais daqui.
 * As mudanças ficam guardadas sozinhas, 700 ms depois da última.
 */
import { db, doc, getDoc, setDoc } from "./firebase-init.js";

export const PADRAO = {
  receberPedidos: true,
  precoAvulsa: 30,
  descontoLancamento: 20,
  descontoAte: "2026-12-31",
  pacote3: 90,
  pacote4: 80,
  sinal: 4,
  mbway: "933 594 881",
  duracao: 30,
  cancelarAteHoras: 24,
  validadePacoteMeses: 2,
  deslocacao: 60,
  semana: [ // segunda a domingo
    { k: "from", h: 19 }, { k: "from", h: 19 }, { k: "from", h: 19 }, { k: "from", h: 19 }, { k: "from", h: 19 },
    { k: "free" }, { k: "free" }
  ],
  locais: {
    "Espaço interior tranquilo": true,
    "Ao ar livre": true,
    "Casa do Ser": true,
    "Consultório": true,
    "Parque ou natureza": true
  },
  emailAvisos: "lucasnunesneuro@gmail.com",
  whatsapp: "+351 933 594 881"
};

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const pad = (h) => String(h).padStart(2, "0") + ":00";
const euro = (n) => "€" + (Math.round(n * 100) / 100).toString().replace(".", ",");

export function iniciarAjustes(raiz) {
  const ref = doc(db, "settings", "sessao");
  const estado = raiz.querySelector("[data-aj-estado]");
  let cfg = JSON.parse(JSON.stringify(PADRAO));
  let timer = null;

  function guardar() {
    estado.textContent = "Guardando…";
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await setDoc(ref, { ...cfg, atualizado: new Date() });
        estado.textContent = "Guardado.";
      } catch (err) {
        estado.textContent = "Não consegui guardar. Tente de novo.";
      }
    }, 700);
  }

  // ---------- campos simples (data-aj="nome", type number/text/date)
  raiz.querySelectorAll("[data-aj]").forEach((inp) => {
    inp.addEventListener("input", () => {
      const k = inp.dataset.aj;
      cfg[k] = inp.type === "number" ? Number(inp.value || 0) : inp.value;
      resumoPrecos();
      guardar();
    });
  });

  // ---------- interruptor "Receber pedidos"
  const sw = raiz.querySelector("[data-aj-switch]");
  const swNota = raiz.querySelector("[data-aj-switch-nota]");
  sw.addEventListener("click", () => { cfg.receberPedidos = !cfg.receberPedidos; pintarSwitch(); guardar(); });
  function pintarSwitch() {
    sw.setAttribute("aria-checked", cfg.receberPedidos ? "true" : "false");
    swNota.textContent = cfg.receberPedidos ? "Ligado: as pessoas veem os seus dias livres." : "Em pausa: ninguém consegue reservar. Nada é apagado.";
  }

  // ---------- tempo de deslocação
  const desl = raiz.querySelectorAll("[data-aj-desl]");
  desl.forEach((b) => b.addEventListener("click", () => { cfg.deslocacao = Number(b.dataset.ajDesl); pintarDesl(); guardar(); }));
  function pintarDesl() { desl.forEach((b) => b.setAttribute("aria-pressed", Number(b.dataset.ajDesl) === cfg.deslocacao ? "true" : "false")); }

  // ---------- semana padrão
  const semanaBox = raiz.querySelector("[data-aj-semana]");
  function pintarSemana() {
    semanaBox.textContent = "";
    DIAS.forEach((nome, i) => {
      const d = cfg.semana[i] || { k: "none" };
      const linha = document.createElement("div");
      linha.className = "aj-dia";
      const rot = document.createElement("span");
      rot.textContent = nome;
      const tipo = document.createElement("select");
      tipo.className = "aj-campo";
      tipo.setAttribute("aria-label", `${nome}: disponibilidade`);
      [["free", "Livre"], ["from", "A partir de"], ["none", "Indisponível"]].forEach(([v, t]) => {
        const o = new Option(t, v); o.selected = d.k === v; tipo.append(o);
      });
      const hora = document.createElement("select");
      hora.className = "aj-campo";
      hora.setAttribute("aria-label", `${nome}: a partir de que horas`);
      for (let h = 6; h <= 21; h++) { const o = new Option(pad(h), h); o.selected = d.h === h; hora.append(o); }
      hora.hidden = d.k !== "from";
      tipo.addEventListener("change", () => {
        cfg.semana[i] = tipo.value === "from" ? { k: "from", h: d.h || 19 } : { k: tipo.value };
        pintarSemana(); guardar();
      });
      hora.addEventListener("change", () => { cfg.semana[i] = { k: "from", h: Number(hora.value) }; guardar(); });
      linha.append(rot, tipo, hora);
      semanaBox.append(linha);
    });
  }

  // ---------- locais
  const locaisBox = raiz.querySelector("[data-aj-locais]");
  function pintarLocais() {
    locaisBox.textContent = "";
    Object.keys(cfg.locais).forEach((nome) => {
      const lab = document.createElement("label");
      lab.className = "aj-check";
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = !!cfg.locais[nome];
      cb.addEventListener("change", () => { cfg.locais[nome] = cb.checked; guardar(); });
      lab.append(cb, document.createTextNode(nome));
      locaisBox.append(lab);
    });
  }

  // ---------- resumo dos preços com desconto
  const resumo = raiz.querySelector("[data-aj-resumo]");
  function resumoPrecos() {
    const f = 1 - (cfg.descontoLancamento || 0) / 100;
    const ate = cfg.descontoAte ? new Date(cfg.descontoAte + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) : "";
    resumo.textContent = cfg.descontoLancamento > 0
      ? `Até ${ate}, quem reserva vê: sessão ${euro(cfg.precoAvulsa * f)}, pacote de 3 ${euro(cfg.pacote3 * f)}, pacote de 4 ${euro(cfg.pacote4)}. Restante a pagar na hora numa sessão avulsa: ${euro(cfg.precoAvulsa * f - cfg.sinal)}.`
      : `Quem reserva vê: sessão ${euro(cfg.precoAvulsa)}, pacote de 3 ${euro(cfg.pacote3)}, pacote de 4 ${euro(cfg.pacote4)}.`;
  }

  function pintarTudo() {
    raiz.querySelectorAll("[data-aj]").forEach((inp) => { inp.value = cfg[inp.dataset.aj] ?? ""; });
    pintarSwitch(); pintarDesl(); pintarSemana(); pintarLocais(); resumoPrecos();
  }

  (async () => {
    estado.textContent = "Carregando…";
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        cfg = { ...cfg, ...snap.data() };
        estado.textContent = "Guardado.";
        pintarTudo();
      } else {
        pintarTudo();
        guardar(); // primeira vez: grava os valores combinados
      }
    } catch (err) {
      pintarTudo();
      estado.textContent = "Não consegui ler os ajustes. Verifique a ligação e recarregue.";
    }
  })();
}

/** Para a Agenda: a semana padrão guardada (ou a combinada, se ainda não houver). */
export async function lerSemanaPadrao() {
  try {
    const snap = await getDoc(doc(db, "settings", "sessao"));
    return (snap.exists() && snap.data().semana) || PADRAO.semana;
  } catch (err) {
    return PADRAO.semana;
  }
}
