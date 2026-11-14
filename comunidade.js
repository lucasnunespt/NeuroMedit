/* ==========================================================
   comunidade.js — a página da Comunidade.
   Desenha os ecrãs a partir de um estado único e fala com os dados só
   através de comunidade-dados.js. Sem contagens, sem feed infinito, sem
   alertas: quem entra partilha, lê e volta para a vida.

   DÍVIDA DE DESIGN SYSTEM (combinada com o Lucas, nov 2026): os
   componentes novos desta página (cartão de partilha, campo de publicar,
   mensagem de conversa, janela de confirmação, aviso curto) ainda não
   estão no design system. Estão listados em docs/comunidade.md.
   ========================================================== */
import * as dados from "./comunidade-dados.js";

const app = document.getElementById("com-app");
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const IC = {
  voltar: I('<path d="M14.5 5.5L8 12L14.5 18.5"/>'),
  folha: I('<path d="M12 20c-4.5-2-7-5.5-7-9.5C5 7 8 4.5 12 4c4 .5 7 3 7 6.5 0 4-2.5 7.5-7 9.5z"/><path d="M12 8v12"/>'),
  responder: I('<path d="M9.5 7.5L4.5 12l5 4.5"/><path d="M5 12h9a5.5 5.5 0 0 1 5.5 5.5V19"/>'),
  bandeira: I('<path d="M6 20V4.5"/><path d="M6 5h10.5l-2 3.5 2 3.5H6"/>'),
  lixo: I('<path d="M5 7h14"/><path d="M9.5 7V5h5v2"/><path d="M7 7l1 12h8l1-12"/>'),
  editar: I('<path d="M5 19l1-4 9.5-9.5 3 3L9 18z"/><path d="M13.5 7.5l3 3"/>'),
  conversa: I('<path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-8l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 16V8A1.5 1.5 0 0 1 5 6.5z"/>'),
  mais: I('<path d="M12 5v14M5 12h14"/>'),
  enviar: I('<path d="M4.5 12L19.5 5l-4 14-3.5-5.5z"/><path d="M12 13.5l7.5-8.5"/>'),
  certo: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  megafone: I('<path d="M4.5 10v4h3l7 4V6l-7 4h-3z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>'),
  agenda: I('<rect x="4" y="5.5" width="16" height="14" rx="3"/><path d="M8 3.5v4M16 3.5v4M4 10.5h16"/>'),
  pessoa: I('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c0-3.7 3.1-6.2 7-6.2s7 2.5 7 6.2"/>')
};
/* ---------- Língua ----------
   Os textos vivem em translations-*.js (chaves com_*). Os dados guardados
   (prática escolhida, os quatro círculos iniciais) ficam em português do
   Brasil e são traduzidos só na hora de mostrar. */
const lang = () => (typeof getPreferredLanguage === "function" ? getPreferredLanguage() : "pt");
function t(chave, v) {
  const k = "com_" + chave;
  let s = typeof getTranslation === "function" ? getTranslation(lang(), k) : "";
  if (!s || s === k || s === `[${k}]`) s = chave;
  return v ? s.replace(/\{(\w+)\}/g, (_, n) => (v[n] ?? "")) : s;
}
function tGlobal(k, reserva) {
  const s = typeof getTranslation === "function" ? getTranslation(lang(), k) : "";
  return s && s !== k && s !== `[${k}]` ? s : reserva;
}
const MOTIVOS = ["sono", "calma", "foco", "prof"];
const motivo = (k) => (MOTIVOS.includes(k) ? t("mot_" + k) : k);
// Valor guardado (português) → chave da prática na Biblioteca.
const PRATICAS = [
  ["Nenhuma em especial", ""],
  ["Respiração Calma", "library_calm_session_1_title"],
  ["Quem está falando?", "library_radio_1_title"],
  ["Desacelerar à Noite", "library_sleep_session_1_title"],
  ["Antes de Dormir", "library_sleep_session_3_title"]
];
const pratica = (v) => { const p = PRATICAS.find((x) => x[0] === v); return !p ? v : (p[1] ? tGlobal(p[1], v) : t("prat_nenhuma")); };
const papel = (p) => t("papel_" + (["admin", "professor", "membro"].includes(p) ? p : "membro"));
/** Os quatro círculos iniciais são traduzidos ao mostrar; os criados por alguém ficam como foram escritos. */
function circ(c) {
  const i = dados.CIRCULOS_INICIAIS.findIndex((x) => x.nome === c?.nome);
  if (i < 0) return c;
  return { ...c, nome: t(`c${i}_nome`), sub: t(`c${i}_sub`), proposito: t(`c${i}_prop`), cuidado: c.cuidado ? t(`c${i}_cui`) : "" };
}

const S = {
  pronto: false, user: null, eu: null, erro: "", ocupado: false,
  motivos: { calma: true }, aceito: false,
  circulos: [], circuloId: "", posts: [], ressoou: {}, editando: "",
  aberto: null, respostas: [],
  grupos: [], grupo: null, msgs: [], pessoas: [],
  canal: [], encontros: [],
  gestao: { membros: [], convites: [], denuncias: [] }
};
let pararConversa = null;

/* ---------- Pequenas ajudas ---------- */
function aviso(texto) {
  const el = document.getElementById("com-aviso");
  el.textContent = texto;
  el.hidden = false;
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => { el.hidden = true; }, 3200);
}
const lingua = () => document.documentElement.lang || "pt-BR";
function quando(ts) {
  const m = ts?.toMillis ? ts.toMillis() : 0;
  if (!m) return t("agora");
  const dias = Math.floor((Date.now() - m) / 86400000);
  if (dias < 1) return t("hoje");
  if (dias === 1) return t("ontem");
  if (dias < 7) return t("ha_dias", { n: dias });
  return new Date(m).toLocaleDateString(lingua(), { day: "numeric", month: "long" });
}
const dataHora = (t) => new Date(t.toMillis()).toLocaleString(lingua(), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const inicial = (nome) => (nome || "·").trim().charAt(0).toUpperCase() || "·";
/** Rosto de quem escreveu: a foto da conta Google; sem foto (ou sem nome), a inicial ou um ponto. */
const rosto = (foto, nome, anon) => (!anon && foto
  ? `<span class="com-ini com-ini--foto" aria-hidden="true"><img src="${esc(foto)}" alt="" referrerpolicy="no-referrer" loading="lazy"></span>`
  : `<span class="com-ini" aria-hidden="true">${anon ? "·" : esc(inicial(nome))}</span>`);
const rota = () => {
  const h = location.hash.replace(/^#/, "");
  const [chave, valor] = h.split("=");
  return { chave: chave || "", valor: valor ? decodeURIComponent(valor) : "" };
};
const ir = (hash) => { if (location.hash === hash) carregarRota(); else location.hash = hash; };

/** Janela de confirmação antes de apagar. Com `nome`, obriga a escrever o nome. */
function confirmar({ titulo, texto, botao, nome }) {
  return new Promise((resolve) => {
    const d = document.getElementById("com-confirmar");
    d.innerHTML = `
      <form method="dialog" class="com-dlg">
        <h2 id="com-dlg-t">${esc(titulo)}</h2>
        <p id="com-dlg-d">${esc(texto)}</p>
        ${nome ? `<label for="com-dlg-n">${esc(t("dlg_escreva"))} <strong>${esc(nome)}</strong></label><input id="com-dlg-n" class="com-campo" type="text" autocomplete="off">` : ""}
        <div class="com-linha com-linha--fim">
          <button class="com-acao" value="nao" type="submit">${esc(t("cancelar"))}</button>
          <button class="com-perigo" value="sim" type="submit" ${nome ? "disabled" : ""}>${esc(botao)}</button>
        </div>
      </form>`;
    d.setAttribute("aria-labelledby", "com-dlg-t");
    d.setAttribute("aria-describedby", "com-dlg-d");
    const campo = d.querySelector("#com-dlg-n");
    const sim = d.querySelector(".com-perigo");
    campo?.addEventListener("input", () => { sim.disabled = campo.value.trim() !== nome; });
    d.addEventListener("close", () => resolve(d.returnValue === "sim"), { once: true });
    d.returnValue = "nao";
    d.showModal();
  });
}

async function tentar(fn, falha = t("erro_geral")) {
  if (S.ocupado) return false;
  S.ocupado = true;
  try { await fn(); return true; } catch (e) { console.error(e); aviso(falha); return false; } finally { S.ocupado = false; }
}

/* ---------- Peças ---------- */
const cuidados = () => `
  <ol class="com-cuidados">
    ${[1, 2, 3, 4].map((i) => `<li><strong>${t(`cui${i}_t`)}</strong> <span>${t(`cui${i}_d`)}</span></li>`).join("")}
  </ol>`;

const previa = () => `
  <section class="com-bloco" aria-labelledby="com-pv">
    <p class="com-sobre">${t("pv_eyebrow")}</p>
    <h2 id="com-pv">${t("pv_title")}</h2>
    <div class="com-grade">
      ${(S.circulos.length ? S.circulos : dados.CIRCULOS_INICIAIS).slice(0, 4).map(circ).map((c) => `<div class="com-cartao com-cartao--p"><strong>${esc(c.nome)}</strong><span>${esc(c.proposito)}</span></div>`).join("")}
    </div>
    <article class="com-cartao" aria-label="${t("pv_exemplo_aria")}">
      <div class="com-linha"><span class="com-ini" aria-hidden="true">·</span><div class="com-quem"><strong>${t("pv_assim")}</strong><span>${t("pv_exemplo")}</span></div><span class="com-etq">${esc(t("depois_de", { p: pratica("Respiração Calma") }))}</span></div>
      <p>${t("pv_texto")}</p>
    </article>
    <div class="com-grade com-grade--3">
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.megafone}</span><div class="com-quem"><strong>${t("pv_prof_t")}</strong><span>${t("pv_prof_d")}</span></div></div>
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.agenda}</span><div class="com-quem"><strong>${t("pv_enc_t")}</strong><span>${t("pv_enc_d")}</span></div></div>
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem"><strong>${t("pv_grp_t")}</strong><span>${t("pv_grp_d")}</span></div></div>
    </div>
  </section>`;

const capa = () => `
  <div class="com-capa">
    <p class="com-sobre">${t("capa_eyebrow")}</p>
    <h1>${t("capa_title")}</h1>
    <p class="com-lead">${t("capa_lead")}</p>
  </div>`;

function telaFora() {
  if (!S.user) {
    return `<main class="com-entrada">${capa()}
      <section class="com-cartao"><h2>${t("fora_login_t")}</h2>
      <p class="com-suave">${t("fora_login_d")}</p>
      <div class="com-linha"><button class="com-pri" data-a="login" type="button">${t("login_google")}</button></div></section>
      ${previa()}</main>`;
  }
  if (S.eu.estado === "removido") {
    return `<main class="com-entrada">${capa()}<section class="com-cartao"><h2>${t("removido_t")}</h2><p class="com-suave">${t("removido_d")}</p><div class="com-linha"><a class="com-opt" href="library.html">${t("ir_biblioteca")}</a></div></section></main>`;
  }
  if (S.eu.estado === "pendente") {
    return `<main class="com-entrada">${capa()}
      <section class="com-cartao"><h2>${t("pend_t")}</h2>
        <ol class="com-cuidados">
          ${[1, 2, 3].map((i) => `<li><strong>${t(`pend${i}_t`)}</strong> <span>${t(`pend${i}_d`)}</span></li>`).join("")}
        </ol>
        <div class="com-linha"><a class="com-opt" href="calm.html">${t("pend_praticar")}</a><button class="com-acao" data-a="cancelar-pedido" type="button">${t("pend_cancelar")}</button></div>
      </section>${previa()}</main>`;
  }
  const convidado = S.eu.convidado;
  return `<main class="com-entrada">${capa()}
    <section class="com-cartao" aria-labelledby="com-q1"><h2 id="com-q1">${t("q1_t")}</h2>
      <p class="com-suave">${t("q1_d")}</p>
      <div class="com-linha">${MOTIVOS.map((k) => `<button class="com-opt ${S.motivos[k] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.motivos[k])}" data-a="motivo" data-v="${k}">${motivo(k)}</button>`).join("")}</div>
    </section>
    <section class="com-cartao" aria-labelledby="com-q2"><h2 id="com-q2">${t("q2_t")}</h2>
      <p class="com-suave">${t("q2_d")}</p>
      ${cuidados()}
      <label class="com-chk"><input type="checkbox" data-a="aceitar" ${S.aceito ? "checked" : ""}>${t("aceito")}</label>
      <p class="com-suave com-peq">${t("dados_aviso")}</p>
      <div class="com-linha"><button class="com-pri" data-a="pedir" type="button" ${S.aceito ? "" : "disabled"}>${convidado ? t("entrar_com") : t("pedir")}</button>
      <span class="com-suave com-peq">${convidado ? t("convidado_d") : t("pedido_d")}</span></div>
    </section></main>`;
}

function lateral(tela) {
  const eu = S.eu;
  const pend = S.gestao.membros.filter((m) => m.estado === "pendente").length;
  return `<aside class="com-esq" aria-label="${t("lat_aria")}">
    <p class="com-cap">${t("circulos")}</p>
    <nav class="com-lista">
      ${S.circulos.map(circ).map((c) => `<a class="com-circ ${(tela === "circulo" || tela === "partilha") && c.id === S.circuloId ? "is-on" : ""}" href="#c=${c.id}"><span>${esc(c.nome)}</span><small>${esc(c.sub || "")}</small></a>`).join("")}
      <a class="com-circ ${tela === "grupos" || tela === "grupo" ? "is-on" : ""}" href="#grupos"><span>${t("grupos_t")}</span><small>${t("grupos_s")}</small></a>
      ${eu.admin ? `<a class="com-circ ${tela === "gestao" ? "is-on" : ""}" href="#gestao"><span>${t("gestao")}</span><small>${pend ? (pend === 1 ? t("pend_1") : t("pend_n", { n: pend })) : t("gestao_s")}</small></a>` : ""}
      <a class="com-circ ${tela === "perfil" ? "is-on" : ""}" href="#perfil"><span>${t("perfil_t")}</span><small>${t("perfil_s")}</small></a>
    </nav>
    ${eu.professor ? `<details class="com-mais"><summary>${t("novo_circulo")}</summary><form class="com-novo" data-f="novo-circulo"><label class="com-so-leitor" for="com-nc">${t("nome_circulo")}</label><input id="com-nc" class="com-campo" name="nome" type="text" maxlength="60" placeholder="${t("nome_circulo")}" required><input class="com-campo" name="proposito" type="text" maxlength="240" placeholder="${t("proposito_ph")}" aria-label="${t("proposito_aria")}"><button class="com-opt" type="submit">${IC.mais} ${t("criar_circulo")}</button></form></details>` : ""}
  </aside>`;
}

function direita() {
  const eu = S.eu;
  return `<aside class="com-dir" aria-label="${t("dir_aria")}">
    <section class="com-cartao com-cartao--p"><h3>${t("pv_prof_t")}</h3><p class="com-suave com-peq">${t("canal_d")}</p>
      ${S.canal.length ? S.canal.slice(0, 5).map((a) => `<div class="com-linha com-linha--topo"><span class="com-ic">${IC.megafone}</span><div class="com-quem"><strong>${esc(a.titulo)}</strong>${a.texto ? `<span>${esc(a.texto)}</span>` : ""}<span>${esc(a.nome)} · ${quando(a.criadoEm)}</span></div>${eu.admin || a.uid === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-canal" data-v="${a.id}" aria-label="${t("apagar_aviso")}">${IC.lixo}</button>` : ""}</div>`).join("") : `<p class="com-suave com-peq">${t("sem_avisos")}</p>`}
      ${eu.professor ? `<form class="com-novo" data-f="canal"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="${t("aviso_titulo")}" aria-label="${t("aviso_titulo")}" required><input class="com-campo" name="texto" type="text" maxlength="300" placeholder="${t("aviso_frase")}" aria-label="${t("aviso_texto")}"><button class="com-opt" type="submit">${t("publicar_aviso")}</button></form>` : ""}
    </section>
    <section class="com-cartao com-cartao--p"><h3>${t("enc_t")}</h3><p class="com-suave com-peq">${t("enc_d")}</p>
      ${S.encontros.length ? S.encontros.map((e) => `<div class="com-enc"><div class="com-linha com-linha--topo"><span class="com-ic">${IC.agenda}</span><div class="com-quem"><strong>${esc(e.titulo)}</strong><span>${esc(dataHora(e.quando))}</span><span>${esc(t("com_nome", { nome: e.nome }))}</span></div></div>
        <div class="com-linha"><button class="com-opt ${e.guardado ? "is-on" : ""}" type="button" aria-pressed="${e.guardado}" data-a="lugar" data-v="${e.id}">${e.guardado ? t("lugar_guardado") : t("guardar_lugar")}</button><a class="com-opt" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">${t("entrar_enc")}</a>${eu.admin || e.uid === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-encontro" data-v="${e.id}" aria-label="${t("apagar_enc")}">${IC.lixo}</button>` : ""}</div></div>`).join("") : `<p class="com-suave com-peq">${t("sem_enc")}</p>`}
      ${eu.professor ? `<form class="com-novo" data-f="encontro"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="${t("enc_nome")}" aria-label="${t("enc_nome")}" required><label class="com-peq com-suave" for="com-eq">${t("dia_hora")}</label><input id="com-eq" class="com-campo" name="quando" type="datetime-local" required><label class="com-peq com-suave" for="com-el">${t("link_meet")}</label><input id="com-el" class="com-campo" name="link" type="url" placeholder="https://meet.google.com/..." pattern="https://meet\\.google\\.com/.+" required><div class="com-linha"><a class="com-acao" href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">${t("criar_sala")}</a><button class="com-opt" type="submit">${t("marcar_enc")}</button></div></form>` : ""}
    </section>
  </aside>`;
}

function cartaoPartilha(p, { aberta = false } = {}) {
  const eu = S.eu;
  const autor = p.minha ? t("voce") : (p.anon ? t("sem_nome") : (p.nome || t("papel_membro")));
  const podeApagar = eu.admin || p.minha || S.circulos.find((c) => c.id === p.circulo)?.criador === eu.uid;
  const corpo = S.editando === p.id
    ? `<form data-f="editar" data-v="${p.id}" class="com-novo"><label for="com-ed">${t("editar_partilha")}</label><textarea id="com-ed" class="com-campo" name="texto" maxlength="2000" required>${esc(p.texto)}</textarea><div class="com-linha"><button class="com-pri" type="submit">${t("guardar")}</button><button class="com-acao" type="button" data-a="cancelar-edicao">${t("cancelar")}</button></div></form>`
    : `<p class="com-texto">${esc(p.texto)}</p>`;
  return `<article class="com-cartao">
    <div class="com-linha">${rosto(p.foto, p.nome, p.anon)}<div class="com-quem"><strong>${esc(autor)}</strong><span>${quando(p.criadoEm)}${p.editadoEm ? t("editada") : ""}</span></div>
      ${p.pratica && p.pratica !== PRATICAS[0][0] ? `<span class="com-etq">${esc(t("depois_de", { p: pratica(p.pratica) }))}</span>` : ""}${eu.admin && p.denunciada ? `<span class="com-etq com-etq--alerta">${t("denunciada")}</span>` : ""}</div>
    ${corpo}
    <div class="com-linha com-linha--acoes">
      <button class="com-acao ${S.ressoou[p.id] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.ressoou[p.id])}" data-a="ressoou" data-v="${p.id}">${IC.folha}<span>${S.ressoou[p.id] ? t("ressoou_em_voce") : t("ressoou")}</span></button>
      ${aberta ? "" : `<a class="com-acao" href="#p=${p.id}">${IC.responder}<span>${t("ler_responder")}</span></a>`}
      <span class="com-esp"></span>
      ${p.minha && S.editando !== p.id ? `<button class="com-acao" type="button" data-a="editar" data-v="${p.id}">${IC.editar}<span>${t("editar")}</span></button>` : ""}
      ${podeApagar ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>${t("apagar")}</span></button>` : ""}
      ${p.minha ? "" : `<button class="com-acao" type="button" data-a="denunciar" data-v="${p.id}" ${p.denunciada ? "disabled" : ""}>${IC.bandeira}<span>${p.denunciada ? t("denunciada") : t("denunciar")}</span></button>`}
    </div></article>`;
}

function telaCirculo() {
  const c = circ(S.circulos.find((x) => x.id === S.circuloId));
  if (!c) {
    return `<div class="com-cartao"><h2>${t("sem_circulos")}</h2>${S.eu.admin ? `<p class="com-suave">${t("semear_d")}</p><div class="com-linha"><button class="com-pri" type="button" data-a="semear">${t("semear")}</button></div>` : `<p class="com-suave">${t("preparando")}</p>`}</div>`;
  }
  const podeApagar = S.eu.admin || c.criador === S.eu.uid;
  return `<div class="com-topo"><div class="com-linha"><p class="com-sobre">${t("circulo")}</p><span class="com-esp"></span>${podeApagar ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-circulo" data-v="${c.id}">${IC.lixo}<span>${t("apagar_circulo")}</span></button>` : ""}</div>
      <h1 class="com-h1">${esc(c.nome)}</h1><p class="com-lead">${esc(c.proposito || "")}</p>${c.cuidado ? `<div><span class="com-etq">${esc(t("cuidado_circulo", { c: c.cuidado }))}</span></div>` : ""}</div>
    <form class="com-cartao com-novo" data-f="publicar">
      <label for="com-partilha"><strong>${t("pub_pergunta")}</strong></label>
      <textarea id="com-partilha" class="com-campo" name="texto" maxlength="2000" placeholder="${t("pub_ph")}" required></textarea>
      <div class="com-linha com-linha--base">
        <div class="com-sel"><label class="com-peq com-suave" for="com-pratica">${t("qual_pratica")}</label><select id="com-pratica" class="com-campo" name="pratica">${PRATICAS.map(([v]) => `<option value="${esc(v)}">${esc(pratica(v))}</option>`).join("")}</select></div>
        <label class="com-chk"><input type="checkbox" name="anon">${t("anon")}</label>
        <button class="com-pri" type="submit">${t("publicar")}</button>
      </div>
    </form>
    ${S.posts.length ? S.posts.map((p) => cartaoPartilha(p)).join("") : `<div class="com-cartao com-centro"><strong>${t("sem_partilhas")}</strong><span class="com-suave">${t("primeira")}</span></div>`}
    <div class="com-fim"><strong>${t("fim_t")}</strong><span>${t("fim_d")}</span></div>`;
}

function telaPartilha() {
  const p = S.aberto;
  if (!p) return `<div class="com-cartao"><h2>${t("nao_existe")}</h2><div class="com-linha"><a class="com-opt" href="#">${t("voltar_circulos")}</a></div></div>`;
  const c = circ(S.circulos.find((x) => x.id === p.circulo));
  return `<a class="com-acao com-acao--solta" href="#c=${p.circulo}">${IC.voltar}<span>${esc(t("voltar_a", { c: c?.nome || t("circulo") }))}</span></a>
    ${cartaoPartilha(p, { aberta: true })}
    <p class="com-cap">${t("respostas")}</p>
    ${S.respostas.length ? S.respostas.map((r) => `<div class="com-resp">${rosto(r.foto, r.nome, false)}<div class="com-quem com-quem--larga"><div class="com-linha"><strong>${esc(r.uid === S.eu.uid ? t("voce") : r.nome)}${r.professor ? t("professor_tag") : ""}</strong><span class="com-suave com-peq">${quando(r.criadoEm)}</span><span class="com-esp"></span>${S.eu.admin || r.uid === S.eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-resposta" data-v="${r.id}">${IC.lixo}<span>${t("apagar")}</span></button>` : ""}</div><p class="com-texto">${esc(r.texto)}</p></div></div>`).join("") : `<p class="com-suave com-peq com-recuo">${t("sem_respostas")}</p>`}
    <form class="com-cartao com-novo com-recuo" data-f="responder"><label for="com-resp"><strong>${t("responder_cuidado")}</strong></label><p class="com-suave com-peq">${t("responder_d")}</p><textarea id="com-resp" class="com-campo" name="texto" maxlength="1500" placeholder="${t("responder_ph")}" required></textarea><div class="com-linha com-linha--fim"><button class="com-pri" type="submit">${t("responder")}</button></div></form>`;
}

function telaGrupos() {
  const eu = S.eu;
  return `<div class="com-topo"><p class="com-sobre">${t("grupos_t")}</p><h1 class="com-h1">${t("grupos_h1")}</h1><p class="com-lead">${t("grupos_lead")}</p></div>
    ${eu.professor ? `<form class="com-cartao com-linha com-linha--base" data-f="novo-grupo"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-ng">${t("novo_grupo")}</label><input id="com-ng" class="com-campo" name="nome" type="text" maxlength="60" placeholder="${t("novo_grupo_ph")}" required></div><div class="com-sel"><label class="com-peq com-suave" for="com-tg">${t("quem_entra")}</label><select id="com-tg" class="com-campo" name="tipo"><option value="privado">${t("so_incluir")}</option><option value="aberto">${t("qualquer")}</option></select></div><button class="com-pri" type="submit">${IC.mais} ${t("criar_grupo")}</button></form>` : `<p class="com-suave com-peq">${t("grupos_quem")}</p>`}
    ${S.grupos.length ? S.grupos.map((g) => {
      const dentro = (g.membros || []).includes(eu.uid);
      return `<div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem com-quem--larga"><strong>${esc(g.nome)}</strong><span>${g.tipo === "privado" ? t("so_inclusao") : t("aberto")}${g.criador === eu.uid ? t("criado_voce") : ""}</span></div>
        ${dentro || eu.admin ? `<a class="com-opt" href="#g=${g.id}">${t("abrir_conversa")}</a>` : `<button class="com-opt" type="button" data-a="entrar-grupo" data-v="${g.id}">${t("entrar_grupo")}</button>`}
        ${eu.admin || g.criador === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-grupo" data-v="${g.id}">${IC.lixo}<span>${t("apagar")}</span></button>` : ""}</div>`;
    }).join("") : `<div class="com-cartao com-centro"><strong>${t("sem_grupos")}</strong></div>`}`;
}

function telaGrupo() {
  const g = S.grupo, eu = S.eu;
  if (!g) return `<div class="com-cartao"><h2>${t("grupo_nao")}</h2><div class="com-linha"><a class="com-opt" href="#grupos">${t("voltar_grupos")}</a></div></div>`;
  const dono = eu.admin || g.criador === eu.uid;
  const fora = S.pessoas.filter((m) => !(g.membros || []).includes(m.id));
  const dentro = S.pessoas.filter((m) => (g.membros || []).includes(m.id));
  return `<a class="com-acao com-acao--solta" href="#grupos">${IC.voltar}<span>${t("grupos_t")}</span></a>
    <div class="com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem"><h1 class="com-h2">${esc(g.nome)}</h1><span>${g.tipo === "privado" ? t("so_inclusao") : t("aberto")}</span></div><span class="com-esp"></span>${g.criador !== eu.uid && (g.membros || []).includes(eu.uid) ? `<button class="com-acao" type="button" data-a="sair-grupo" data-v="${g.id}">${t("sair_grupo")}</button>` : ""}</div>
    <section class="com-cartao com-conversa" id="com-msgs" aria-label="${t("mensagens")}" aria-live="polite">${mensagens()}</section>
    <form class="com-linha" data-f="mensagem"><label class="com-so-leitor" for="com-msg">${t("mensagem")}</label><input id="com-msg" class="com-campo com-campo--cresce" name="texto" type="text" maxlength="1000" placeholder="${t("msg_ph")}" autocomplete="off" required><button class="com-pri" type="submit" aria-label="${t("enviar")}">${IC.enviar}</button></form>
    <p class="com-suave com-peq">${t("privacidade_grupo")}</p>
    ${dono ? `<section class="com-cartao com-cartao--p"><h3>${t("quem_grupo")}</h3>
      ${dentro.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><span class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong></span>${m.id !== g.criador ? `<button class="com-acao" type="button" data-a="tirar-do-grupo" data-v="${m.id}">${t("tirar")}</button>` : `<span class="com-etq">${t("criou")}</span>`}</div>`).join("")}
      ${fora.length ? `<form class="com-linha com-linha--base" data-f="por-no-grupo"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-pg">${t("incluir")}</label><select id="com-pg" class="com-campo" name="pessoa">${fora.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join("")}</select></div><button class="com-opt" type="submit">${t("incluir_btn")}</button></form>` : ""}</section>` : ""}`;
}
function mensagens() {
  if (!S.msgs.length) return `<p class="com-suave com-peq com-centro">${t("sem_msgs")}</p>`;
  const g = S.grupo, eu = S.eu;
  return S.msgs.map((m) => `<div class="com-msg ${m.uid === eu.uid ? "is-minha" : ""}"><span class="com-suave com-peq">${esc(m.uid === eu.uid ? t("voce") : m.nome)}</span><span>${esc(m.texto)}</span>${eu.admin || m.uid === eu.uid || g.criador === eu.uid ? `<button class="com-acao com-acao--perigo com-acao--mini" type="button" data-a="apagar-mensagem" data-v="${m.id}" aria-label="${t("apagar_msg")}">${IC.lixo}</button>` : ""}</div>`).join("");
}

function telaGestao() {
  const { membros, convites, denuncias } = S.gestao;
  const pedidos = membros.filter((m) => m.estado === "pendente");
  const dentro = membros.filter((m) => m.estado === "aprovado");
  const fora = membros.filter((m) => m.estado === "removido");
  const nomeDe = (id) => membros.find((m) => m.id === id)?.nome || "";
  return `<div class="com-topo"><p class="com-sobre">${t("gest_eyebrow")}</p><h1 class="com-h1">${t("gest_h1")}</h1><p class="com-lead">${t("gest_lead")}</p></div>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g1"><h3 id="com-g1">${t("pedidos")}</h3>
      ${pedidos.length ? pedidos.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}${m.motivos?.length ? " · " + esc(m.motivos.map(motivo).join(", ")) : ""}</span></div><button class="com-opt" type="button" data-a="aprovar" data-v="${m.id}">${IC.certo} ${t("aprovar")}</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">${t("recusar")}</button></div>`).join("") : `<p class="com-suave com-peq">${t("sem_pedidos")}</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g2"><h3 id="com-g2">${t("convidar_t")}</h3><p class="com-suave com-peq">${t("convidar_d")} <strong>neuromedit.com/comunidade.html</strong>.</p>
      <form class="com-linha" data-f="convidar"><label class="com-so-leitor" for="com-cv">${t("email")}</label><input id="com-cv" class="com-campo com-campo--cresce" name="email" type="email" placeholder="${t("email_ph")}" required><button class="com-pri" type="submit">${t("guardar_convite")}</button></form>
      ${convites.map((c) => `<div class="com-linha"><span class="com-etq">${t("convite_espera")}</span><span class="com-suave com-peq">${esc(c.email)}</span><button class="com-acao" type="button" data-a="cancelar-convite" data-v="${esc(c.id)}">${t("cancelar")}</button></div>`).join("")}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g3"><h3 id="com-g3">${t("denuncias")}</h3>
      ${denuncias.length ? denuncias.map((p) => `<div class="com-den"><p class="com-texto">${esc(p.texto)}</p><div class="com-linha"><span class="com-suave com-peq">${esc(circ(S.circulos.find((c) => c.id === p.circulo))?.nome || "")} · ${esc(p.anon ? t("sem_nome_de", { n: nomeDe(p.autorUid) || t("autor_desconhecido") }) : p.nome)}</span><span class="com-esp"></span><button class="com-opt" type="button" data-a="manter" data-v="${p.id}">${t("manter")}</button><button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>${t("apagar_partilha")}</span></button></div></div>`).join("") : `<p class="com-suave com-peq">${t("sem_denuncias")}</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g4"><h3 id="com-g4">${t("membros")}</h3>
      ${dentro.length ? dentro.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><span class="com-etq">${papel(m.papel)}</span><button class="com-acao" type="button" data-a="papel" data-v="${m.id}" data-p="${m.papel === "professor" ? "membro" : "professor"}">${m.papel === "professor" ? t("tornar_membro") : t("tornar_prof")}</button><button class="com-acao com-acao--perigo" type="button" data-a="remover" data-v="${m.id}">${t("remover")}</button></div>`).join("") : `<p class="com-suave com-peq">${t("sem_membros")}</p>`}
      ${fora.length ? `<p class="com-cap">${t("removidos")}</p>${fora.map((m) => `<div class="com-linha"><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><button class="com-acao" type="button" data-a="aprovar" data-v="${m.id}">${t("deixar_voltar")}</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">${t("apagar_ficha")}</button></div>`).join("")}` : ""}</section>`;
}

function telaPerfil() {
  const eu = S.eu;
  return `<div class="com-topo"><p class="com-sobre">${t("perfil_t")}</p><h1 class="com-h1">${t("perfil_h1")}</h1></div>
    <section class="com-cartao com-linha"><span class="com-foto">${eu.foto ? `<img src="${esc(eu.foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</span><div class="com-quem"><strong>${esc(eu.nome)}</strong><span>${papel(eu.papel)}</span><span>${t("foto_google")}</span></div></section>
    ${eu.temFicha ? `<form class="com-cartao com-novo" data-f="perfil"><label for="com-pn">${t("nome_comunidade")}</label><input id="com-pn" class="com-campo" name="nome" type="text" maxlength="60" value="${esc(eu.nome)}" required><div class="com-linha com-linha--fim"><button class="com-pri" type="submit">${t("guardar_nome")}</button></div></form>` : ""}
    <section class="com-cartao com-novo"><h3>${t("meus_dados")}</h3><p class="com-suave">${t("meus_dados_d")}</p>
      <div class="com-linha"><button class="com-opt" type="button" data-a="exportar">${t("exportar")}</button>${eu.admin ? "" : `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-tudo">${t("sair_apagar")}</button>`}</div></section>
    <section class="com-cartao com-novo"><h3>${t("q2_t")}</h3>${cuidados()}</section>`;
}

/* ---------- Desenhar ---------- */
function desenhar() {
  if (!S.pronto) { app.innerHTML = `<p class="com-suave com-centro com-espera">${t("um_momento")}</p>`; return; }
  if (S.erro) { app.innerHTML = `<main class="com-entrada">${capa()}<section class="com-cartao"><h2>${t("ligando")}</h2><p class="com-suave">${esc(t(S.erro))}</p><div class="com-linha"><a class="com-opt" href="library.html">${t("ir_biblioteca")}</a></div></section></main>`; return; }
  if (!S.user || S.eu.estado !== "aprovado") { app.innerHTML = telaFora(); return; }
  const { chave } = rota();
  const tela = { c: "circulo", "": "circulo", p: "partilha", grupos: "grupos", g: "grupo", gestao: "gestao", perfil: "perfil" }[chave] || "circulo";
  const meio = { circulo: telaCirculo, partilha: telaPartilha, grupos: telaGrupos, grupo: telaGrupo, gestao: () => (S.eu.admin ? telaGestao() : telaCirculo()), perfil: telaPerfil }[tela]();
  app.innerHTML = `<div class="com-lay">${lateral(tela)}<main class="com-meio">${meio}</main>${direita()}</div>`;
  if (tela === "grupo") rolarConversa();
}
const rolarConversa = () => { const c = document.getElementById("com-msgs"); if (c) c.scrollTop = c.scrollHeight; };

/* ---------- Carregar ---------- */
async function carregarRessoou(itens) {
  await Promise.all(itens.map(async (p) => { S.ressoou[p.id] = await dados.ressoou(p.id); }));
}
async function carregarRota() {
  if (!S.user || S.eu?.estado !== "aprovado") return desenhar();
  pararConversa?.(); pararConversa = null;
  const { chave, valor } = rota();
  S.editando = "";
  try {
    if (chave === "p") {
      S.aberto = await dados.partilha(valor);
      if (S.aberto) { S.circuloId = S.aberto.circulo; S.respostas = await dados.respostas(valor); await carregarRessoou([S.aberto]); }
    } else if (chave === "grupos") {
      S.grupos = await dados.grupos(S.eu);
    } else if (chave === "g") {
      S.grupo = await dados.grupo(valor).catch(() => null);
      S.msgs = [];
      if (S.grupo) {
        if (S.eu.admin || S.grupo.criador === S.eu.uid) S.pessoas = await dados.membrosAprovados().catch(() => []);
        pararConversa = dados.ouvirMensagens(valor, (m) => {
          S.msgs = m;
          const caixa = document.getElementById("com-msgs");
          if (caixa) { caixa.innerHTML = mensagens(); rolarConversa(); }
        }, () => {});
      }
    } else if (chave === "gestao" && S.eu.admin) {
      const [membros, convites, denuncias] = await Promise.all([dados.membros(), dados.convites(), dados.denunciadas()]);
      S.gestao = { membros, convites, denuncias };
    } else if (chave !== "perfil") {
      S.circuloId = chave === "c" && S.circulos.some((c) => c.id === valor) ? valor : (S.circulos[0]?.id || "");
      S.posts = S.circuloId ? await dados.partilhas(S.circuloId) : [];
      await carregarRessoou(S.posts);
    }
  } catch (e) { console.error(e); aviso(t("erro_carregar")); }
  desenhar();
}
async function carregarLados() {
  const [canal, encontros] = await Promise.all([dados.canal().catch(() => []), dados.encontros().catch(() => [])]);
  S.canal = canal; S.encontros = encontros;
}
async function arrancar(user) {
  S.user = user; S.erro = "";
  try {
    S.eu = user ? await dados.carregarEu() : null;
    if (user) S.circulos = await dados.circulos().catch(() => []);
    if (S.eu?.estado === "aprovado") {
      await carregarLados();
      if (S.eu.admin) S.gestao.membros = await dados.membros().catch(() => []);
    }
  } catch (e) {
    console.error(e);
    S.erro = "erro_volte";
  }
  S.pronto = true;
  await carregarRota();
}
const recarregar = async () => { S.eu = await dados.carregarEu(); S.circulos = await dados.circulos().catch(() => []); await carregarLados(); if (S.eu.admin) S.gestao.membros = await dados.membros().catch(() => []); await carregarRota(); };

/* ---------- Ações (cliques) ---------- */
const ACOES = {
  login: () => tentar(() => dados.entrar(), t("erro_login")),
  motivo: (v) => { S.motivos[v] = !S.motivos[v]; desenhar(); },
  aceitar: (v, el) => { S.aceito = el.checked; desenhar(); },
  pedir: async () => { if (await tentar(() => dados.pedirEntrada({ nome: S.eu.nome, motivos: Object.keys(S.motivos).filter((k) => S.motivos[k]), convidado: S.eu.convidado }))) await arrancar(S.user); },
  "cancelar-pedido": async () => { if (await confirmar({ titulo: t("c_pedido_t"), texto: t("c_pedido_d"), botao: t("c_pedido_b") }) && await tentar(() => dados.apagarTudoOQueEMeu())) await arrancar(S.user); },
  semear: async () => { if (await tentar(() => dados.semearCirculos())) { aviso(t("a_circulos_criados")); await recarregar(); } },
  ressoou: async (v) => { const novo = !S.ressoou[v]; if (await tentar(() => dados.marcarRessoou(v, novo))) { S.ressoou[v] = novo; desenhar(); } },
  editar: (v) => { S.editando = v; desenhar(); document.getElementById("com-ed")?.focus(); },
  "cancelar-edicao": () => { S.editando = ""; desenhar(); },
  denunciar: async (v) => { if (await tentar(() => dados.denunciar(v))) { aviso(t("a_denuncia")); await carregarRota(); } },
  manter: async (v) => { if (await tentar(() => dados.manterPartilha(v))) { aviso(t("a_mantida")); await carregarRota(); } },
  "apagar-partilha": async (v) => {
    if (!await confirmar({ titulo: t("c_partilha_t"), texto: t("c_partilha_d"), botao: t("c_partilha_b") })) return;
    if (await tentar(() => dados.apagarPartilha(v))) { aviso(t("a_partilha_apagada")); if (rota().chave === "p") ir(`#c=${S.circuloId}`); else await carregarRota(); }
  },
  "apagar-resposta": async (v) => {
    if (!await confirmar({ titulo: t("c_resposta_t"), texto: t("c_resposta_d"), botao: t("c_resposta_b") })) return;
    if (await tentar(() => dados.apagarResposta(S.aberto.id, v))) { aviso(t("a_resposta_apagada")); await carregarRota(); }
  },
  "apagar-circulo": async (v) => {
    const c = circ(S.circulos.find((x) => x.id === v));
    if (!await confirmar({ titulo: t("c_circulo_t"), texto: t("c_circulo_d", { n: c.nome }), botao: t("c_circulo_b"), nome: c.nome })) return;
    if (await tentar(() => dados.apagarCirculo(v))) { aviso(t("a_circulo_apagado")); S.circulos = await dados.circulos(); ir("#"); }
  },
  "entrar-grupo": async (v) => { if (await tentar(() => dados.entrarNoGrupo(v))) ir(`#g=${v}`); },
  "sair-grupo": async (v) => { if (await confirmar({ titulo: t("c_sair_t"), texto: t("c_sair_d"), botao: t("c_sair_b") }) && await tentar(() => dados.sairDoGrupo(v))) ir("#grupos"); },
  "tirar-do-grupo": async (v) => { if (await tentar(() => dados.tirarDoGrupo(S.grupo.id, v))) await carregarRota(); },
  "apagar-grupo": async (v) => {
    const g = S.grupos.find((x) => x.id === v);
    if (!await confirmar({ titulo: t("c_grupo_t"), texto: t("c_grupo_d", { n: g.nome }), botao: t("c_grupo_b"), nome: g.nome })) return;
    if (await tentar(() => dados.apagarGrupo(v))) { aviso(t("a_grupo_apagado")); await carregarRota(); }
  },
  "apagar-mensagem": async (v) => { if (await confirmar({ titulo: t("c_msg_t"), texto: t("c_msg_d"), botao: t("c_msg_b") })) await tentar(() => dados.apagarMensagem(S.grupo.id, v)); },
  "apagar-canal": async (v) => { if (await confirmar({ titulo: t("c_aviso_t"), texto: t("c_aviso_d"), botao: t("c_aviso_b") }) && await tentar(() => dados.apagarDoCanal(v))) { await carregarLados(); desenhar(); } },
  "apagar-encontro": async (v) => { if (await confirmar({ titulo: t("c_enc_t"), texto: t("c_enc_d"), botao: t("c_enc_b") }) && await tentar(() => dados.apagarEncontro(v))) { await carregarLados(); desenhar(); } },
  lugar: async (v) => { const e = S.encontros.find((x) => x.id === v); const novo = !e.guardado; if (await tentar(() => dados.guardarLugar(v, novo))) { e.guardado = novo; aviso(novo ? t("a_lugar_guardado") : t("a_lugar_libertado")); desenhar(); } },
  aprovar: async (v) => { if (await tentar(() => dados.aprovar(v))) { aviso(t("a_aprovado")); await recarregar(); } },
  recusar: async (v) => { if (await confirmar({ titulo: t("c_recusar_t"), texto: t("c_recusar_d"), botao: t("c_recusar_b") }) && await tentar(() => dados.recusar(v))) await recarregar(); },
  remover: async (v) => {
    const m = S.gestao.membros.find((x) => x.id === v);
    if (!await confirmar({ titulo: t("c_remover_t", { n: m.nome }), texto: t("c_remover_d"), botao: t("c_remover_b") })) return;
    if (await tentar(() => dados.remover(v))) { aviso(t("a_removido", { n: m.nome })); await recarregar(); }
  },
  papel: async (v, el) => { if (await tentar(() => dados.mudarPapel(v, el.dataset.p))) await recarregar(); },
  "cancelar-convite": async (v) => { if (await tentar(() => dados.cancelarConvite(v))) await carregarRota(); },
  exportar: () => tentar(async () => {
    const blob = new Blob([JSON.stringify(await dados.exportarOsMeusDados(), null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "neuromedit-comunidade-os-meus-dados.json" });
    a.click(); URL.revokeObjectURL(a.href);
  }),
  "apagar-tudo": async () => {
    if (!await confirmar({ titulo: t("c_tudo_t"), texto: t("c_tudo_d"), botao: t("c_tudo_b"), nome: t("c_tudo_palavra") })) return;
    if (await tentar(() => dados.apagarTudoOQueEMeu())) { aviso(t("a_feito")); location.hash = ""; await arrancar(S.user); }
  }
};

/* ---------- Formulários ---------- */
const FORMS = {
  publicar: async (f) => {
    const d = new FormData(f);
    const texto = d.get("texto").trim(); if (!texto) return;
    if (await tentar(() => dados.publicar({ circulo: S.circuloId, texto, pratica: d.get("pratica"), anon: d.get("anon") === "on", nome: S.eu.nome, foto: S.eu.foto }))) { aviso(t("a_publicada")); await carregarRota(); }
  },
  editar: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.editarPartilha(f.dataset.v, texto))) { aviso(t("a_editada")); await carregarRota(); } },
  responder: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.responder(S.aberto, { texto, nome: S.eu.nome, professor: S.eu.professor, foto: S.eu.foto }))) { aviso(t("a_resposta")); await carregarRota(); } },
  "novo-circulo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarCirculo({ nome: d.get("nome").trim(), proposito: d.get("proposito").trim() }); })) { aviso(t("a_circulo_criado")); S.circulos = await dados.circulos(); ir(`#c=${id}`); } },
  "novo-grupo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarGrupo({ nome: d.get("nome").trim(), tipo: d.get("tipo") }); })) ir(`#g=${id}`); },
  "por-no-grupo": async (f) => { if (await tentar(() => dados.porNoGrupo(S.grupo, new FormData(f).get("pessoa")))) await carregarRota(); },
  mensagem: async (f) => { const campo = f.elements.texto; const texto = campo.value.trim(); if (!texto) return; campo.value = ""; if (!await tentar(() => dados.enviarMensagem(S.grupo.id, { texto, nome: S.eu.nome }))) campo.value = texto; campo.focus(); },
  canal: async (f) => { const d = new FormData(f); if (await tentar(() => dados.publicarNoCanal({ titulo: d.get("titulo").trim(), texto: d.get("texto").trim(), nome: S.eu.nome }))) { await carregarLados(); desenhar(); } },
  encontro: async (f) => {
    const d = new FormData(f); const data = new Date(d.get("quando"));
    if (Number.isNaN(data.getTime())) return aviso(t("a_dia_hora"));
    if (await tentar(() => dados.criarEncontro({ titulo: d.get("titulo").trim(), quando: data, link: d.get("link").trim(), nome: S.eu.nome }), t("e_meet"))) { aviso(t("a_enc_marcado")); await carregarLados(); desenhar(); }
  },
  convidar: async (f) => { const email = new FormData(f).get("email").trim(); if (await tentar(() => dados.convidar(email))) { aviso(t("a_convite", { e: email })); await carregarRota(); } },
  perfil: async (f) => { const nome = new FormData(f).get("nome").trim(); if (nome && await tentar(() => dados.guardarPerfil({ nome }))) { aviso(t("a_nome")); await recarregar(); } }
};

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el || el.tagName === "INPUT") return;
  ACOES[el.dataset.a]?.(el.dataset.v, el);
});
app.addEventListener("change", (e) => { const el = e.target.closest("input[data-a]"); if (el) ACOES[el.dataset.a]?.(el.dataset.v, el); });
app.addEventListener("submit", (e) => { const f = e.target.closest("form[data-f]"); if (!f) return; e.preventDefault(); FORMS[f.dataset.f]?.(f); });
window.addEventListener("hashchange", carregarRota);
// Ao trocar de língua, redesenha (sem recarregar os dados). Numa conversa aberta, só o que é texto da página muda.
window.addEventListener("neuromedit:languagechange", () => { if (!document.getElementById("com-confirmar").open) desenhar(); });

desenhar();
dados.observarSessao(arrancar);
