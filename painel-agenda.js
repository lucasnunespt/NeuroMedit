/**
 * painel-agenda.js — a Agenda do painel do Lucas.
 *
 * Cada mês é um documento em /availability/{AAAA-MM}:
 *   { dias: { "11": { k: "free" }, "12": { k: "from", h: 19 }, ... }, publicado: true, atualizado: <data> }
 * Um dia sem entrada é Indisponível. Só o admin escreve (firestore.rules).
 * As mudanças ficam guardadas sozinhas, 600 ms depois do último toque.
 */
import { db, doc, getDoc, setDoc } from "./firebase-init.js";
import { lerSemanaPadrao } from "./painel-ajustes.js";

const H0 = 6, H1 = 21;              // roda de horas: 06:00 a 21:00
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

// Novembro de 2026, como combinado na sessão de 7 nov: usado só se o mês ainda não existir no Firebase.
const NOVEMBRO_2026 = (() => {
  const d = {};
  [11, 14, 20, 21, 28, 29].forEach((n) => { d[n] = { k: "free" }; });
  [9, 10, 12, 13, 15, 16, 17, 18, 19].forEach((n) => { d[n] = { k: "from", h: 19 }; });
  return d;
})();

const pad = (h) => String(h).padStart(2, "0") + ":00";
const chave = (a, m) => `${a}-${String(m + 1).padStart(2, "0")}`;

export function iniciarAgenda(raiz) {
  const hoje = new Date();
  const st = {
    ano: hoje.getFullYear(),
    mes: hoje.getMonth(),
    dias: {},
    sel: hoje.getDate(),
    carregado: false,
    timer: null
  };

  const el = {
    titulo: raiz.querySelector("[data-ag-mes]"),
    grelha: raiz.querySelector("[data-ag-grelha]"),
    dia: raiz.querySelector("[data-ag-dia]"),
    tipos: raiz.querySelectorAll("[data-ag-tipo]"),
    roda: raiz.querySelector("[data-ag-roda]"),
    rodaLista: raiz.querySelector("[data-ag-roda-lista]"),
    nota: raiz.querySelector("[data-ag-nota]"),
    estado: raiz.querySelector("[data-ag-estado]"),
    resumo: raiz.querySelector("[data-ag-resumo]"),
    ant: raiz.querySelector("[data-ag-ant]"),
    seg: raiz.querySelector("[data-ag-seg]"),
    preencher: raiz.querySelector("[data-ag-preencher]")
  };

  // ---------- roda de horas (scroll com encaixe; setas do teclado mudam uma hora)
  for (let h = H0; h <= H1; h++) {
    const li = document.createElement("li");
    li.textContent = pad(h);
    li.dataset.h = h;
    el.rodaLista.append(li);
  }
  const ALT = 48;
  let rodaHora = 19, rodaTimer = null, rodaPorCodigo = false;
  function pintarRoda(h) {
    el.rodaLista.querySelectorAll("li").forEach((li) => {
      const d = Math.abs(Number(li.dataset.h) - h);
      li.className = d === 0 ? "on" : d === 1 ? "perto" : "";
    });
    el.roda.setAttribute("aria-valuenow", h);
    el.roda.setAttribute("aria-valuetext", pad(h));
  }
  function moverRoda(h, suave) {
    rodaHora = h;
    rodaPorCodigo = true;
    el.roda.scrollTo({ top: (h - H0) * ALT, behavior: suave ? "smooth" : "auto" });
    pintarRoda(h);
    setTimeout(() => { rodaPorCodigo = false; }, 400);
  }
  el.roda.addEventListener("scroll", () => {
    const h = Math.max(H0, Math.min(H1, H0 + Math.round(el.roda.scrollTop / ALT)));
    pintarRoda(h);
    if (rodaPorCodigo) return;
    clearTimeout(rodaTimer);
    rodaTimer = setTimeout(() => { if (h !== rodaHora) { rodaHora = h; definir({ k: "from", h }); } }, 160);
  });
  el.roda.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const h = Math.max(H0, Math.min(H1, rodaHora + (e.key === "ArrowDown" ? 1 : -1)));
    moverRoda(h, true);
    definir({ k: "from", h });
  });
  el.rodaLista.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const h = Number(li.dataset.h);
    moverRoda(h, true);
    definir({ k: "from", h });
  });

  // ---------- dados
  const doMes = () => doc(db, "availability", chave(st.ano, st.mes));
  async function carregar() {
    st.carregado = false;
    el.estado.textContent = "Carregando…";
    desenhar();
    try {
      const snap = await getDoc(doMes());
      if (snap.exists()) {
        st.dias = snap.data().dias || {};
        el.estado.textContent = "Guardado.";
      } else if (st.ano === 2026 && st.mes === 10) {
        st.dias = JSON.parse(JSON.stringify(NOVEMBRO_2026));
        await guardarJa();
      } else {
        st.dias = {};
        el.estado.textContent = "Mês ainda vazio. Toque num dia para começar.";
      }
    } catch (err) {
      st.dias = {};
      el.estado.textContent = "Não consegui ler a agenda. Verifique a ligação e recarregue.";
    }
    st.carregado = true;
    desenhar();
  }
  async function guardarJa() {
    try {
      await setDoc(doMes(), { dias: st.dias, publicado: true, atualizado: new Date() });
      el.estado.textContent = "Guardado. Quem reserva já vê estes dias.";
    } catch (err) {
      el.estado.textContent = "Não consegui guardar. Tente de novo.";
    }
  }
  function guardar() {
    el.estado.textContent = "Guardando…";
    clearTimeout(st.timer);
    st.timer = setTimeout(guardarJa, 600);
  }

  // ---------- ações
  const tipoDe = (n) => st.dias[n] || { k: "none" };
  const passado = (n) => {
    const d = new Date(st.ano, st.mes, n);
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return d < h;
  };
  function definir(v) {
    if (!st.carregado || passado(st.sel)) return;
    if (v.k === "none") delete st.dias[st.sel];
    else st.dias[st.sel] = v;
    desenhar();
    guardar();
  }
  el.tipos.forEach((b) => b.addEventListener("click", () => {
    const k = b.dataset.agTipo;
    definir(k === "from" ? { k: "from", h: (tipoDe(st.sel).h || rodaHora || 19) } : { k });
  }));
  el.preencher.addEventListener("click", async () => {
    if (!st.carregado) return;
    const semana = await lerSemanaPadrao();
    const nDias = new Date(st.ano, st.mes + 1, 0).getDate();
    for (let n = 1; n <= nDias; n++) {
      if (passado(n)) continue;
      const d = semana[(new Date(st.ano, st.mes, n).getDay() + 6) % 7] || { k: "none" };
      if (d.k === "none") delete st.dias[n]; else st.dias[n] = { ...d };
    }
    desenhar();
    guardar();
  });
  el.ant.addEventListener("click", () => mudarMes(-1));
  el.seg.addEventListener("click", () => mudarMes(1));
  function mudarMes(d) {
    clearTimeout(st.timer);
    const m = new Date(st.ano, st.mes + d, 1);
    st.ano = m.getFullYear(); st.mes = m.getMonth(); st.sel = 1;
    const h = new Date();
    if (st.ano === h.getFullYear() && st.mes === h.getMonth()) st.sel = h.getDate();
    carregar();
  }

  // ---------- desenho
  function desenhar() {
    el.titulo.textContent = `${MESES[st.mes].replace(/^./, (c) => c.toUpperCase())} ${st.ano}`;
    const nDias = new Date(st.ano, st.mes + 1, 0).getDate();
    const vazios = (new Date(st.ano, st.mes, 1).getDay() + 6) % 7; // semana começa na segunda
    el.grelha.textContent = "";
    for (let i = 0; i < vazios; i++) el.grelha.append(document.createElement("span"));
    const cont = { free: 0, from: 0, none: 0 };
    for (let n = 1; n <= nDias; n++) {
      const t = tipoDe(n);
      cont[t.k]++;
      const b = document.createElement("button");
      b.type = "button";
      b.className = `dia dia--${t.k}` + (n === st.sel ? " is-sel" : "") + (passado(n) ? " is-passado" : "");
      b.setAttribute("aria-pressed", n === st.sel ? "true" : "false");
      const rotulo = t.k === "free" ? "livre" : t.k === "from" ? `livre a partir das ${t.h} horas` : "indisponível";
      b.setAttribute("aria-label", `${n} de ${MESES[st.mes]}, ${rotulo}`);
      b.innerHTML = `<span>${n}</span><small>${t.k === "from" ? t.h + "h" : ""}</small>`;
      b.addEventListener("click", () => { st.sel = n; desenhar(); });
      el.grelha.append(b);
    }
    el.resumo.textContent = `${cont.free} livres · ${cont.from} a partir de certa hora · ${cont.none} indisponíveis`;

    const t = tipoDe(st.sel);
    const wd = SEMANA[new Date(st.ano, st.mes, st.sel).getDay()];
    el.dia.textContent = `${wd.replace(/^./, (c) => c.toUpperCase())}, ${st.sel} de ${MESES[st.mes]}`;
    const fechado = passado(st.sel);
    el.tipos.forEach((b) => {
      const on = b.dataset.agTipo === t.k;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.disabled = fechado || !st.carregado;
      if (b.dataset.agTipo === "from") b.textContent = t.k === "from" ? `A partir das ${pad(t.h)}` : "A partir de…";
    });
    el.roda.parentElement.hidden = t.k !== "from" || fechado;
    if (t.k === "from") moverRoda(t.h, false);
    el.nota.textContent = fechado
      ? "Este dia já passou."
      : t.k === "free" ? "Quem reserva vê horários de hora em hora, das 09:00 às 20:00."
      : t.k === "from" ? `Quem reserva vê horários de hora em hora, das ${pad(t.h)} às 21:00.`
      : "Nada aparece para reservar neste dia.";
  }

  carregar();
}
