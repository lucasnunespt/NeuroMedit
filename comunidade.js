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
import { criarTerra } from "./terra.js";

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
  pessoa: I('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c0-3.7 3.1-6.2 7-6.2s7 2.5 7 6.2"/>'),
  foto: I('<rect x="3.5" y="6" width="17" height="13" rx="3"/><circle cx="12" cy="12.5" r="3.2"/><path d="M9 6l1.2-2h3.6L15 6"/>'),
  play: I('<path d="M8.5 6.2v11.6L18 12z"/>'),
  pontos: I('<circle cx="6" cy="12" r="0.9"/><circle cx="12" cy="12" r="0.9"/><circle cx="18" cy="12" r="0.9"/>'),
  fechar: I('<path d="M7 7l10 10M17 7L7 17"/>'),
  pin: I('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  globo: I('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>'),
  video: I('<rect x="3.5" y="6.5" width="12" height="11" rx="2.5"/><path d="M15.5 10.5l5-3v9l-5-3"/>'),
  sino: I('<path d="M6.5 17.5V11a5.5 5.5 0 0 1 11 0v6.5"/><path d="M4.5 17.5h15"/><path d="M10 20.5h4"/>'),
  repete: I('<path d="M17 4.5l2.5 2.5L17 9.5"/><path d="M4.5 12V10a3 3 0 0 1 3-3h12"/><path d="M7 19.5L4.5 17 7 14.5"/><path d="M19.5 12v2a3 3 0 0 1-3 3h-12"/>'),
  sol: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  engrenagem: I('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4L18 18M6 18l1.6-1.6M16.4 7.6L18 6"/>')
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

/* A escolha feita no globo antes de entrar sobrevive a um recarregar da página (só nesta sessão do navegador). */
function lerEscolha(k) { try { return sessionStorage.getItem(`com-escolha-${k}`) || ""; } catch { return ""; } }
function guardarEscolha() { try { sessionStorage.setItem("com-escolha-pais", S.paisEscolhido || ""); sessionStorage.setItem("com-escolha-cidade", S.cidadeEscolhida || ""); } catch { /* sem storage: fica só em memória */ } }

const S = {
  pronto: false, user: null, eu: null, erro: "", ocupado: false,
  motivos: { calma: true }, aceito: false,
  circulos: [], circuloId: "", posts: [], ressoou: {}, editando: "",
  aberto: null, respostas: [], novaFoto: "", comporAberto: false,
  cidades: [], cidadeId: "", muralId: "", cidadeEscolhida: lerEscolha("cidade"), paisEscolhido: lerEscolha("pais"), semCidade: false, paisAberto: "", pedidosCidade: {},
  cidadeInfo: { pendentes: [], anfitrioes: [], jaPedi: false },
  seguindo: [], seguidoresN: null, jaPediAnfitriao: false,
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
  : (anon ? `<span class="com-ini com-ini--anon" aria-hidden="true">${IC.pessoa}</span>` : `<span class="com-ini" aria-hidden="true">${esc(inicial(nome))}</span>`));
/** Menu "⋯" (como no Facebook): as ações secundárias de um cartão. Sem itens, não aparece. */
const menuMais = (itens) => (itens.filter(Boolean).length ? `<details class="com-menu com-menu--cartao"><summary aria-label="${t("mais_opcoes")}" title="${t("mais_opcoes")}">${IC.pontos}</summary><div class="com-menu-lista">${itens.filter(Boolean).join("")}</div></details>` : "");
const selo = () => `<span class="com-selo">${t("selo_prof")}</span>`;
const rota = () => {
  const h = location.hash.replace(/^#/, "");
  const [chave, valor] = h.split("=");
  return { chave: chave || "", valor: valor ? decodeURIComponent(valor) : "" };
};
/** Depois de um passo da porta, o foco vai para a pergunta seguinte (teclado e leitor de ecrã). */
const focarPasso = () => { const q = app.querySelector(".com-porta-passo .com-porta-q"); if (q) { q.tabIndex = -1; q.focus({ preventScroll: true }); } };
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
      <div class="com-linha"><span class="com-ini" aria-hidden="true">·</span><div class="com-quem"><strong>${t("pv_assim")}</strong><span>${t("pv_exemplo")}</span></div></div>
      <p>${t("pv_texto")}</p>
      ${cartaoPratica("Respiração Calma")}
    </article>
    <div class="com-grade">
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.pin}</span><div class="com-quem"><strong>${t("pv_cid_t")}</strong><span>${t("pv_cid_d")}</span></div></div>
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

/* ---------- A porta: a entrada de quem ainda não entrou ----------
   Como no Meetup e no Insight Timer: primeiro ver o que existe perto de si, depois a conta.
   1. O país (no globo ou nos botões) → 2. A cidade → 3. Entrar com o Google, com a cidade já escolhida. */
const nomeCidade = (id) => cidadeDe(id)?.nome || dados.CIDADES_INICIAIS.find((c) => c.id === id)?.nome || "";
const cidadeAberta = (id) => cidadeDe(id)?.estado === "aberta";
function passosPorta() {
  const p = S.paisEscolhido, c = S.cidadeEscolhida || S.semCidade || p === "outro";
  const passo = !p ? 1 : (!c ? 2 : 3);
  const itens = [1, 2, 3].map((i) => `<li class="${i < passo ? "is-feito" : ""}" ${i === passo ? 'aria-current="step"' : ""}><span aria-hidden="true">${i < passo ? IC.certo : i}</span>${t("passo" + i)}</li>`).join("");
  let corpo;
  if (passo === 1) {
    corpo = `<h2 class="com-porta-q">${t("q_pais_t")}</h2><p class="com-suave com-porta-d">${t("q_pais_d")}</p>
      <div class="com-porta-chips">${PAISES.map((cc) => `<button type="button" class="com-porta-chip" data-a="porta-pais" data-v="${cc}"><span class="com-porta-cod" aria-hidden="true">${cc}</span>${esc(nomePais(cc))}</button>`).join("")}
      <button type="button" class="com-porta-chip com-porta-chip--sec" data-a="porta-pais" data-v="outro">${t("pais_outro")}</button></div>`;
  } else if (passo === 2) {
    const l = dados.CIDADES_INICIAIS.filter((x) => x.pais === p).sort((a, b) => cidadeAberta(b.id) - cidadeAberta(a.id));
    corpo = `<h2 class="com-porta-q">${t("q_cid_t")}</h2><p class="com-suave com-porta-d">${t("q_cid_d")}</p>
      <div class="com-porta-chips">${l.map((x) => `<button type="button" class="com-porta-chip ${cidadeAberta(x.id) ? "is-aberta" : ""}" data-a="porta-cidade" data-v="${x.id}"><span class="com-porta-ponto" aria-hidden="true"></span>${esc(x.nome)}${cidadeAberta(x.id) ? `<span class="com-so-leitor"> · ${t("leg_aberta")}</span>` : ""}</button>`).join("")}
      <button type="button" class="com-porta-chip com-porta-chip--sec" data-a="porta-cidade" data-v="">${t("cid_nao_esta")}</button></div>
      <button type="button" class="com-porta-trocar" data-a="porta-pais" data-v="">${IC.voltar}${esc(nomePais(p))} · ${t("trocar")}</button>`;
  } else {
    const id = S.cidadeEscolhida, nome = nomeCidade(id);
    const [tit, desc] = !id ? [t("res_outra_t"), t("res_outra_d")] : cidadeAberta(id) ? [t("res_aberta_t", { c: nome }), t("res_aberta_d", { c: nome })] : [t("res_breve_t", { c: nome }), t("res_breve_d", { c: nome })];
    corpo = `<div class="com-porta-res ${id && cidadeAberta(id) ? "is-aberta" : ""}"><span class="com-porta-res-ic" aria-hidden="true">${IC.pin}</span><div><h2 class="com-porta-q">${esc(tit)}</h2><p class="com-suave com-porta-d">${esc(desc)}</p></div></div>
      <div class="com-porta-acoes"><button class="com-pri com-porta-entrar" data-a="login" type="button">${t("login_google")}</button>
      <button type="button" class="com-porta-trocar" data-a="${p === "outro" ? "porta-pais" : "porta-cidade-trocar"}" data-v="">${IC.voltar}${esc(id ? nome : (p === "outro" ? t("pais_outro") : nomePais(p)))} · ${t("trocar")}</button></div>
      <p class="com-suave com-peq com-porta-nota">${t("fora_login_d")}</p>`;
  }
  return `<ol class="com-passos" aria-label="${t("passos_aria")}">${itens}</ol><div class="com-porta-passo" aria-live="polite">${corpo}</div>`;
}
const legendaGlobo = () => `<ul class="terra-legenda"><li><i></i>${t("leg_aberta")}</li><li class="is-breve"><i></i>${t("leg_breve")}</li><li class="is-fechado"><i></i>${t("leg_fechado")}</li></ul>`;
const porta = () => `
  <section class="com-porta" aria-labelledby="com-porta-t">
    <div class="com-porta-cab">
      <p class="com-sobre">${t("porta_eyebrow")}</p>
      <h1 id="com-porta-t" class="com-porta-t">${t("porta_t")}</h1>
      <p class="com-lead com-porta-lead">${t("porta_lead")}</p>
    </div>
    <div class="com-porta-globo"><div data-terra></div>${legendaGlobo()}</div>
    <div class="com-porta-passos">${passosPorta()}</div>
  </section>`;

function telaFora() {
  if (!S.user) {
    return `<main class="com-entrada com-entrada--porta">${porta()}${previa()}</main>`;
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
  const cidAnf = S.eu.conviteAnfitriao ? cidadeDe(S.eu.conviteCidade) : null;
  return `<main class="com-entrada">${capa()}
    ${cidAnf ? `<section class="com-destaque com-destaque--anf" aria-labelledby="com-fa"><span class="com-ic com-ic--prof">${IC.pin}</span><div class="com-quem"><strong id="com-fa">${esc(t("fora_anf_t", { c: cidAnf.nome }))}</strong><span>${t("fora_anf_d")}</span></div></section>` : ""}
    <section class="com-cartao" aria-labelledby="com-q1"><h2 id="com-q1">${t("q1_t")}</h2>
      <p class="com-suave">${t("q1_d")}</p>
      <div class="com-linha">${MOTIVOS.map((k) => `<button class="com-opt ${S.motivos[k] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.motivos[k])}" data-a="motivo" data-v="${k}">${motivo(k)}</button>`).join("")}</div>
      ${S.cidades.length && !cidAnf ? `<div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-cid">${t("cid_entrada_l")}</label><select id="com-cid" class="com-campo" data-a="escolher-cidade">${opcoesCidades(S.cidadeEscolhida)}</select><span class="com-peq com-suave">${t("cid_entrada_d")}</span></div>` : ""}
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

/** O nome do lugar onde a pessoa está, para o botão "onde estou" do telemóvel. */
function lugarAtual(tela) {
  if (tela === "cidade") return cidadeDe(S.cidadeId)?.nome || t("cid_todas");
  if (tela === "cidades") return t("cid_todas");
  if (tela === "circulo" || tela === "partilha") return circ(S.circulos.find((x) => x.id === S.circuloId) || {}).nome || t("circulos");
  if (tela === "grupos" || tela === "grupo") return t("grupos_t");
  if (tela === "mensagens" || tela === "conversa") return t("msgs_t");
  if (tela === "perfil") return t("ajustes_t");
  if (tela === "gestao") return t("gestao");
  return t("circulos");
}
function lateral(tela) {
  const eu = S.eu;
  const pend = S.gestao.membros.filter((m) => m.estado === "pendente").length;
  // Como a SideNav do design system: destinos em cima, gestão colada ao fundo.
  // O perfil não aparece aqui: vive só no avatar do topo ("Meu perfil na comunidade"), como no Facebook.
  const minha = cidadeDe(eu.cidade);
  // Telemóvel (nov 2026): em vez de dez botões no topo, uma linha só — onde estou ▾, calma, mensagens, perfil.
  // "Onde estou" abre esta mesma coluna como painel, com tudo o resto (cidades, círculos, grupos, novo círculo, gestão).
  const barra = `<div class="com-barra-m">
      <button type="button" class="com-lugar" data-a="abrir-lugares" aria-expanded="${S.esqAberta ? "true" : "false"}" aria-controls="com-esq">${IC.pin}<span>${esc(lugarAtual(tela))}</span><svg class="com-lugar-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg></button>
      <a class="com-barra-ic com-barra-ic--calma" href="index.html" aria-label="${t("calma")}" title="${t("calma")}">${IC.sol}</a>
      <a class="com-barra-ic ${tela === "mensagens" || tela === "conversa" ? "is-on" : ""}" href="#mensagens" aria-label="${t("msgs_t")}" title="${t("msgs_t")}">${IC.conversa}${novasN() ? `<span class="com-dm-num" aria-hidden="true">${novasN()}</span>` : ""}</a>
      <a class="com-barra-ic ${tela === "perfil" ? "is-on" : ""}" href="#perfil" aria-label="${t("ajustes_t")}" title="${t("ajustes_t")}">${eu.foto ? `<img src="${esc(eu.foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</a>
    </div>`;
  return `${barra}<aside class="com-esq ${S.esqAberta ? "is-aberta" : ""}" id="com-esq" aria-label="${t("lat_aria")}">
    <div class="com-esq-topo"><p class="com-sobre">${t("lugares_t")}</p><button type="button" class="com-acao com-acao--mini" data-a="fechar-lugares" aria-label="${t("fechar")}">${IC.fechar}</button></div>
    ${S.cidades.length ? `<p class="com-cap">${t("cid_cap")}</p>
    <nav class="com-lista" aria-label="${t("cid_cap")}">
      ${minha ? `<a class="com-circ com-circ--conta ${tela === "cidade" && S.cidadeId === minha.id ? "is-on" : ""}" href="#cidade=${minha.id}">${IC.pin}<span>${esc(minha.nome)}<small>${minha.estado === "aberta" ? t("cid_sub_aberta") : t("em_breve")}</small></span></a>`
        : `<a class="com-circ com-circ--conta" href="#cidades">${IC.pin}<span>${t("cid_escolher")}<small>${t("cid_escolher_s")}</small></span></a>`}
      <a class="com-circ com-circ--conta ${tela === "cidades" || (tela === "cidade" && S.cidadeId !== eu.cidade) ? "is-on" : ""}" href="#cidades">${IC.globo}<span>${t("cid_todas")}<small>${t("cid_todas_s")}</small></span></a>
    </nav>` : ""}
    <p class="com-cap">${t("circulos")}</p>
    <nav class="com-lista">
      ${S.circulos.map(circ).map((c) => `<a class="com-circ ${(tela === "circulo" || tela === "partilha") && c.id === S.circuloId ? "is-on" : ""}" href="#c=${c.id}"${(tela === "circulo" || tela === "partilha") && c.id === S.circuloId ? ' aria-current="page"' : ""}><span>${esc(c.nome)}</span><small>${esc(c.sub || "")}</small></a>`).join("")}
      <a class="com-circ ${tela === "grupos" || tela === "grupo" ? "is-on" : ""}" href="#grupos"><span>${t("grupos_t")}</span><small>${t("grupos_s")}</small></a>
    </nav>
    <div class="com-esq-fim">
      <a class="com-calma" href="index.html">${IC.sol}<span>${t("calma")}<small>${t("calma_s")}</small></span></a>
      <a class="com-circ com-circ--conta ${tela === "mensagens" || tela === "conversa" ? "is-on" : ""}" href="#mensagens">${IC.conversa}${novasN() ? `<span class="com-dm-num" aria-hidden="true">${novasN()}</span>` : ""}<span>${t("msgs_t")}<small>${novasN() ? esc(t(novasN() === 1 ? "msgs_nova_1" : "msgs_nova_n", { n: novasN() })) : t("msgs_s")}</small></span></a>
      <a class="com-circ com-circ--conta ${tela === "perfil" ? "is-on" : ""}" href="#perfil">${IC.engrenagem}<span>${t("ajustes_t")}<small>${eu.usuario ? "@" + esc(eu.usuario) : t("ajustes_s")}</small></span></a>
      ${eu.professor ? `<details class="com-mais"><summary>${IC.mais}<span>${t("novo_circulo")}</span></summary><form class="com-novo" data-f="novo-circulo"><label class="com-so-leitor" for="com-nc">${t("nome_circulo")}</label><input id="com-nc" class="com-campo" name="nome" type="text" maxlength="60" placeholder="${t("nome_circulo")}" required><input class="com-campo" name="proposito" type="text" maxlength="240" placeholder="${t("proposito_ph")}" aria-label="${t("proposito_aria")}"><button class="com-opt" type="submit">${IC.mais} ${t("criar_circulo")}</button></form></details>` : ""}
      ${eu.admin ? `<a class="com-circ com-circ--conta ${tela === "gestao" ? "is-on" : ""}" href="#gestao">${IC.engrenagem}<span>${t("gestao")}<small>${pend ? (pend === 1 ? t("pend_1") : t("pend_n", { n: pend })) : t("gestao_s")}</small></span></a>` : ""}
    </div>
  </aside>`;
}

function direita(tela) {
  const eu = S.eu;
  if (tela === "cidade") return `<aside class="com-dir" aria-label="${t("dir_aria")}">${direitaCidade()}</aside>`;
  const encontrosAqui = S.encontros.filter((e) => !e.cidade || e.cidade === eu.cidade);
  const noCirculo = tela === "circulo" || tela === "partilha";
  const c = noCirculo ? circ(S.circulos.find((x) => x.id === S.circuloId)) : null;
  // No círculo, o aviso mais recente já está "Em destaque" no topo do feed; aqui ficam os anteriores.
  const avisos = tela === "circulo" ? S.canal.slice(1, 5) : S.canal.slice(0, 5);
  return `<aside class="com-dir" aria-label="${t("dir_aria")}">
    ${c ? `<section class="com-cartao com-cartao--p com-so-largo" aria-labelledby="com-sobre-t"><h3 id="com-sobre-t" class="com-dir-t">${t("sobre_circulo")}</h3><p class="com-suave com-peq">${esc(c.proposito || "")}</p>${c.cuidado ? `<div><span class="com-etq">${esc(t("cuidado_circulo", { c: c.cuidado }))}</span></div>` : ""}</section>` : ""}
    <section class="com-cartao com-cartao--p" aria-labelledby="com-enc-t"><h3 id="com-enc-t" class="com-dir-t"><span class="com-ic">${IC.agenda}</span>${t("enc_t")}</h3><p class="com-suave com-peq">${t("enc_d")}</p>
      ${encontrosAqui.length ? encontrosAqui.map(encontroItem).join("") : `<p class="com-suave com-peq">${t("sem_enc")}</p>`}
      ${eu.professor ? `<details class="com-mais com-mais--dir"><summary>${IC.mais}<span>${t("marcar_enc")}</span></summary><form class="com-novo" data-f="encontro"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="${t("enc_nome")}" aria-label="${t("enc_nome")}" required><label class="com-peq com-suave" for="com-eq">${t("dia_hora")}</label><input id="com-eq" class="com-campo" name="quando" type="datetime-local" required><label class="com-peq com-suave" for="com-el">${t("link_meet")}</label><input id="com-el" class="com-campo" name="link" type="url" placeholder="https://meet.google.com/..." pattern="https://meet\\.google\\.com/.+" required><label class="com-chk com-chk--mini"><input type="checkbox" name="repete">${t("repete_l")}</label><div class="com-linha"><a class="com-acao" href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">${t("criar_sala")}</a><button class="com-opt" type="submit">${t("marcar_enc")}</button></div></form></details>` : ""}
    </section>
    <section class="com-cartao com-cartao--p com-prof" aria-labelledby="com-prof-t"><h3 id="com-prof-t" class="com-dir-t"><span class="com-ic com-ic--prof">${IC.megafone}</span>${t("pv_prof_t")}</h3><p class="com-suave com-peq">${t("canal_d")}</p>
      ${avisos.length ? avisos.map((a) => `<div class="com-linha com-linha--topo com-aviso-item"><div class="com-quem"><strong>${esc(a.titulo)}</strong>${a.texto ? `<span>${esc(a.texto)}</span>` : ""}<span>${esc(a.nome)} · ${quando(a.criadoEm)}</span></div>${eu.admin || a.uid === eu.uid ? `<button class="com-acao com-acao--perigo com-acao--mini" type="button" data-a="apagar-canal" data-v="${a.id}" aria-label="${t("apagar_aviso")}">${IC.lixo}</button>` : ""}</div>`).join("") : (S.canal.length ? "" : `<p class="com-suave com-peq">${t("sem_avisos")}</p>`)}
      ${eu.professor ? `<details class="com-mais com-mais--dir"><summary>${IC.mais}<span>${t("novo_aviso")}</span></summary><form class="com-novo" data-f="canal"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="${t("aviso_titulo")}" aria-label="${t("aviso_titulo")}" required><input class="com-campo" name="texto" type="text" maxlength="300" placeholder="${t("aviso_frase")}" aria-label="${t("aviso_texto")}"><button class="com-opt" type="submit">${t("publicar_aviso")}</button></form></details>` : ""}
    </section>
    ${cartaoApoio()}
  </aside>`;
}
/** O espaço de apoio: discreto, no fim da coluna, sempre marcado como parceiro. */
function cartaoApoio() {
  const a = S.apoio;
  if (!a) return "";
  return `<section class="com-cartao com-cartao--p com-apoio" aria-labelledby="com-apoio-t"><p class="com-apoio-etq">${t("apoio_etq")} · ${esc(a.quem)}</p><h3 id="com-apoio-t" class="com-apoio-t">${esc(a.titulo)}</h3>${a.texto ? `<p class="com-suave com-peq">${esc(a.texto)}</p>` : ""}<a class="com-acao" href="${esc(a.link)}" target="_blank" rel="noopener noreferrer sponsored">${t("apoio_ver")}</a></section>`;
}

/* ---------- Capa da prática: um planeta de pontos de brilho ----------
   Cada prática tem o seu planeta (guia "Planetas de pontos de brilho" do design system),
   desenhado aqui em pequeno, só com pontos e com a luz a vir de cima à esquerda.
   Cores: accent-dark nos pontos, accent nos mais claros — seguem o tema. */
function planeta(tipo) {
  const R = tipo === "saturno" ? 16 : 20, C = 32, N = 90, pts = [];
  const luz = (x, y) => Math.max(0, Math.min(1, 0.55 + 0.5 * (-(x - C) - (y - C)) / (R * 1.41)));
  for (let i = 0; i < N; i++) {
    const r = R * Math.sqrt((i + 0.5) / N), a = i * 2.39996;
    const x = C + r * Math.cos(a), y = C + r * Math.sin(a);
    let l = luz(x, y);
    if (tipo === "netuno") l *= 0.7 + 0.3 * Math.sin((y - C) * 0.7);
    if (tipo === "lua") for (const [cx, cy, cr] of [[25, 27, 5], [38, 36, 4], [30, 41, 3]]) { const d = Math.hypot(x - cx, y - cy); if (d < cr) l *= 0.35; else if (d < cr + 1.6) l = Math.min(1, l + 0.25); }
    pts.push([x, y, l]);
  }
  if (tipo === "saturno") {
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2, x0 = R * 1.7 * Math.cos(a), y0 = R * 0.42 * Math.sin(a);
      const x = C + x0 * 0.95 - y0 * 0.31, y = C + x0 * 0.31 + y0 * 0.95;
      if (y0 < 0 && Math.hypot(x - C, y - C) < R) continue; // a parte de trás do anel fica escondida
      pts.push([x, y, 0.35 + 0.4 * luz(x, y)]);
    }
  }
  const estrelas = [[8, 10], [55, 8], [52, 54], [10, 50], [58, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.6" opacity="0.4"/>`).join("");
  const p = pts.map(([x, y, l]) => `<circle${l > 0.85 ? ' class="pl-brilho"' : ""} cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.45 + 0.9 * l).toFixed(2)}" opacity="${(0.22 + 0.78 * l).toFixed(2)}"/>`).join("");
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" fill="currentColor">${estrelas}${p}</svg>`;
}
/** O planeta de cada círculo: os quatro iniciais têm o seu; os criados depois recebem um pelo id. */
const PLANETAS_CIRCULO = ["saturno", "venus", "lua", "netuno"];
function planetaDoCirculo(raw) {
  const i = dados.CIRCULOS_INICIAIS.findIndex((x) => x.nome === raw?.nome);
  if (i >= 0) return PLANETAS_CIRCULO[i];
  const n = [...String(raw?.id || "")].reduce((soma, ch) => soma + ch.charCodeAt(0), 0);
  return PLANETAS_CIRCULO[n % PLANETAS_CIRCULO.length];
}
const CAPA = {
  "Respiração Calma": { href: "calm.html", planeta: "venus" },
  "Quem está falando?": { href: "radio.html", planeta: "saturno" },
  "Desacelerar à Noite": { href: "sleep.html", planeta: "lua" },
  "Antes de Dormir": { href: "antesdedormir.html", planeta: "netuno" }
};
/** Mini-cartão da prática dentro da partilha: diz o que é e convida a fazê-la. */
function cartaoPratica(v) {
  const c = CAPA[v];
  const nome = pratica(v);
  const capa = `<span class="com-pratica-capa">${planeta(c?.planeta || "venus")}</span><span class="com-quem"><small>${t("depois")}</small><strong>${esc(nome)}</strong></span>`;
  return c
    ? `<a class="com-pratica" href="${c.href}" aria-label="${esc(t("fazer_pratica", { p: nome }))}">${capa}<span class="com-pratica-play" aria-hidden="true">${IC.play}</span></a>`
    : `<div class="com-pratica">${capa}</div>`;
}

function cartaoPartilha(p, { aberta = false } = {}) {
  const eu = S.eu;
  const autor = p.minha ? t("voce") : (p.anon ? t("sem_nome") : (p.nome || t("papel_membro")));
  const podeApagar = eu.admin || p.minha || S.circulos.find((c) => c.id === p.circulo)?.criador === eu.uid || souAnfitriao(cidadeDe(p.circulo));
  const corpo = S.editando === p.id
    ? `<form data-f="editar" data-v="${p.id}" class="com-novo"><label for="com-ed">${t("editar_partilha")}</label><textarea id="com-ed" class="com-campo" name="texto" maxlength="2000" required>${esc(p.texto)}</textarea><div class="com-linha"><button class="com-pri" type="submit">${t("guardar")}</button><button class="com-acao" type="button" data-a="cancelar-edicao">${t("cancelar")}</button></div></form>`
    : `<p class="com-texto">${esc(p.texto)}</p>`;
  const menu = menuMais([
    p.minha && S.editando !== p.id ? `<button class="com-acao" type="button" data-a="editar" data-v="${p.id}">${IC.editar}<span>${t("editar")}</span></button>` : "",
    p.minha ? "" : `<button class="com-acao" type="button" data-a="denunciar" data-v="${p.id}" ${p.denunciada ? "disabled" : ""}>${IC.bandeira}<span>${p.denunciada ? t("denunciada") : t("denunciar")}</span></button>`,
    podeApagar ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>${t("apagar")}</span></button>` : ""
  ]);
  return `<article class="com-cartao com-post">
    <div class="com-linha com-post-topo">${rosto(p.foto, p.nome, p.anon)}<div class="com-quem com-quem--larga"><span class="com-nome">${!p.anon && p.uid ? `<a class="com-nome-link" href="#u=${p.uid}"><strong>${esc(autor)}</strong></a>` : `<strong>${esc(autor)}</strong>`}${p.professor && !p.anon ? selo() + (p.minha ? "" : botaoSeguir(p.uid)) : ""}</span><span>${quando(p.criadoEm)}${p.editadoEm ? t("editada") : ""}</span></div>
      ${eu.admin && p.denunciada ? `<span class="com-etq com-etq--alerta">${t("denunciada")}</span>` : ""}${menu}</div>
    ${corpo}
    ${p.imagem ? `<figure class="com-imagem"><img src="${esc(p.imagem)}" alt="${t("foto_alt")}" loading="lazy"></figure>` : ""}
    ${p.pratica && p.pratica !== PRATICAS[0][0] ? cartaoPratica(p.pratica) : ""}
    <div class="com-barra">
      <button class="com-acao ${S.ressoou[p.id] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.ressoou[p.id])}" data-a="ressoou" data-v="${p.id}">${IC.folha}<span>${S.ressoou[p.id] ? t("ressoou_em_voce") : t("ressoou")}</span></button>
      ${aberta ? `<button class="com-acao" type="button" data-a="focar-comentario">${IC.conversa}<span>${t("comentar")}</span></button>` : `<a class="com-acao" href="#p=${p.id}">${IC.conversa}<span>${t("comentar")}</span></a>`}
    </div></article>`;
}

/** O mural: campo de publicar + partilhas. Serve o círculo e a cidade (S.muralId). */
function mural() {
  const aberto = S.comporAberto || Boolean(S.novaFoto);
  return `${lembrete()}<form class="com-cartao com-novo com-compor ${aberto ? "is-aberto" : ""}" data-f="publicar">
      <button class="com-compor-abrir" type="button" data-a="abrir-compor" ${aberto ? "hidden" : ""}>${rosto(S.eu.foto, S.eu.nome, false)}<span>${t("pub_pergunta")}</span></button>
      <div class="com-compor-corpo" ${aberto ? "" : "hidden"}>
        <label class="com-compor-p" for="com-partilha">${t("pub_pergunta")}</label>
        <textarea id="com-partilha" class="com-campo" name="texto" rows="2" maxlength="2000" placeholder="${t("pub_ph")}" required></textarea>
        <div class="com-previa" id="com-previa" hidden><figure class="com-imagem"><img alt=""></figure><button class="com-acao com-acao--mini" type="button" data-a="tirar-foto" aria-label="${t("foto_tirar")}" title="${t("foto_tirar")}">${IC.fechar}</button></div>
        <div class="com-linha com-compor-barra">
          <input id="com-foto" class="com-so-leitor" type="file" accept="image/*" data-a="foto"><label class="com-opt com-opt--mini" for="com-foto" title="${t("foto_aria")}">${IC.foto}<span>${t("foto")}</span></label>
          <label class="com-so-leitor" for="com-pratica">${t("qual_pratica")}</label><select id="com-pratica" class="com-campo com-campo--mini" name="pratica" title="${t("qual_pratica")}">${PRATICAS.map(([v]) => `<option value="${esc(v)}">${esc(pratica(v))}</option>`).join("")}</select>
          <label class="com-chk com-chk--mini"><input type="checkbox" name="anon">${t("anon")}</label>
          <span class="com-compor-fim"><button class="com-acao" type="button" data-a="fechar-compor">${t("cancelar")}</button><button class="com-pri" type="submit">${t("publicar")}</button></span>
        </div>
      </div>
    </form>
    ${S.posts.length ? S.posts.map((p) => cartaoPartilha(p)).join("") : `<div class="com-cartao com-centro"><strong>${t("sem_partilhas")}</strong><span class="com-suave">${t("primeira")}</span></div>`}
    <div class="com-fim"><strong>${t("fim_t")}</strong><span>${t("fim_d")}</span></div>`;
}

function telaCirculo() {
  const c = circ(S.circulos.find((x) => x.id === S.circuloId));
  if (!c) {
    return `<div class="com-cartao"><h2>${t("sem_circulos")}</h2>${S.eu.admin ? `<p class="com-suave">${t("semear_d")}</p><div class="com-linha"><button class="com-pri" type="button" data-a="semear">${t("semear")}</button></div>` : `<p class="com-suave">${t("preparando")}</p>`}</div>`;
  }
  const podeApagar = S.eu.admin || c.criador === S.eu.uid;
  const destaque = S.canal[0];
  // Capa: o nome e o planeta do círculo (a identidade só se descobre ao entrar).
  // O propósito e o cuidado vivem em "Sobre este círculo", à direita; no telemóvel ficam aqui.
  // Apagar o círculo é a ação mais destrutiva da página: fica dentro de "Mais opções".
  return `<div class="com-topo com-topo--capa"><h1 class="com-h1">${esc(c.nome)}</h1>
      <span class="com-capa-planeta">${planeta(planetaDoCirculo(S.circulos.find((x) => x.id === S.circuloId)))}</span>
      ${podeApagar ? `<details class="com-menu"><summary aria-label="${t("mais_opcoes")}" title="${t("mais_opcoes")}">${IC.pontos}</summary><div class="com-menu-lista"><button class="com-acao com-acao--perigo" type="button" data-a="apagar-circulo" data-v="${c.id}">${IC.lixo}<span>${t("apagar_circulo")}</span></button></div></details>` : ""}
      <div class="com-capa-sobre com-so-movel"><p class="com-lead">${esc(c.proposito || "")}</p>${c.cuidado ? `<div><span class="com-etq">${esc(t("cuidado_circulo", { c: c.cuidado }))}</span></div>` : ""}</div></div>
    ${destaque ? `<section class="com-destaque" aria-labelledby="com-dest-t"><span class="com-ic com-ic--prof">${IC.megafone}</span><div class="com-quem"><small class="com-destaque-rot">${t("destaque")} · ${t("pv_prof_t")}</small><strong id="com-dest-t">${esc(destaque.titulo)}</strong>${destaque.texto ? `<span>${esc(destaque.texto)}</span>` : ""}<span class="com-peq">${esc(destaque.nome)} · ${quando(destaque.criadoEm)}</span></div>${S.eu.admin || destaque.uid === S.eu.uid ? `<button class="com-acao com-acao--perigo com-acao--mini" type="button" data-a="apagar-canal" data-v="${destaque.id}" aria-label="${t("apagar_aviso")}">${IC.lixo}</button>` : ""}</section>` : ""}
    ${mural()}`;
}

/* ---------- Cidades ----------
   Os círculos são globais (online). A cidade é a camada presencial: mural da cidade,
   encontros no sítio e subcomunidades dos professores. Uma cidade só abre com anfitrião;
   as outras aparecem "em breve", com o pedido "quero o NeuroMedit na minha cidade". */
const PAISES = ["PT", "ES", "FR", "IT", "BR"];
const nomePais = (cc) => { try { return new Intl.DisplayNames([lingua()], { type: "region" }).of(cc) || cc; } catch { return cc; } };
const cidadeDe = (id) => S.cidades.find((c) => c.id === id);
const souAnfitriao = (c) => Boolean(c && S.eu && (c.anfitrioes || []).includes(S.eu.uid));
const hashDoMural = (id) => (cidadeDe(id) ? `#cidade=${id}` : `#c=${id}`);
const slug = (txt) => String(txt || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
const porPais = () => {
  const paises = [...PAISES, ...new Set(S.cidades.map((c) => c.pais).filter((p) => !PAISES.includes(p)))];
  return paises.map((p) => [p, S.cidades.filter((c) => c.pais === p)]).filter(([, l]) => l.length);
};
/** Opções do seletor de cidade, por país; as em breve dizem-no. */
const opcoesCidades = (escolhida) => `<option value="">${t("cid_nenhuma")}</option>` + porPais().map(([p, l]) =>
  `<optgroup label="${esc(nomePais(p))}">${l.map((c) => `<option value="${c.id}" ${c.id === escolhida ? "selected" : ""}>${esc(c.nome)}${c.regiao ? ` (${esc(c.regiao)})` : ""}${c.estado === "aberta" ? "" : ` · ${t("em_breve")}`}</option>`).join("")}</optgroup>`).join("");
/** Badge do design system: "Aberta" (feito, com check) ou "Em breve" (neutro). */
const badgeCidade = (c) => (c.estado === "aberta"
  ? `<span class="com-badge com-badge--feito">${IC.certo}${t("cid_aberta")}</span>`
  : `<span class="com-badge">${t("em_breve")}</span>`);

function telaCidades() {
  const eu = S.eu;
  const topo = `<div class="com-topo"><p class="com-sobre">${t("cid_eyebrow")}</p><h1 class="com-h1">${t("cid_h1")}</h1><p class="com-lead">${t("cid_lead")}</p></div>`;
  if (!S.cidades.length) {
    return topo + `<div class="com-cartao">${eu.admin ? `<p class="com-suave">${t("cid_semear_d")}</p><div class="com-linha"><button class="com-pri" type="button" data-a="semear-cidades">${t("cid_semear")}</button></div>` : `<p class="com-suave">${t("preparando")}</p>`}</div>`;
  }
  const fora = eu.admin ? Object.entries(S.pedidosCidade).filter(([k]) => !cidadeDe(k)) : [];
  const faltam = eu.admin ? dados.CIDADES_INICIAIS.filter((c) => !cidadeDe(c.id)).length : 0;
  const AGRUPA = { ES: true, FR: true, IT: true };
  const linha = (c) => `<li><a class="com-cidade com-cid-linha ${c.id === S.cidadeMarcada ? "is-marcada" : ""}" data-cid="${c.id}" href="#cidade=${c.id}"><span class="com-cidade-ponto ${c.estado === "aberta" ? "is-aberta" : ""}" aria-hidden="true"></span><span class="com-cidade-nome">${esc(c.nome)}${c.regiao && !AGRUPA[c.pais] ? ` <small>${esc(c.regiao)}</small>` : ""}</span>${c.id === eu.cidade ? `<span class="com-selo">${t("cid_minha")}</span>` : ""}<span class="com-esp"></span>${eu.admin && S.pedidosCidade[c.id] ? `<span class="com-peq com-suave">${esc(t("cid_pedidos_n", { n: S.pedidosCidade[c.id].n }))}</span>` : ""}${badgeCidade(c)}</a></li>`;
  const pais = ([p, l]) => {
    const ab = l.filter((c) => c.estado === "aberta").length, br = l.length - ab, on = S.paisAberto === p;
    const resumo = t(ab === 0 ? "pais_res_0" : ab === 1 ? "pais_res_1" : "pais_res_n", { a: ab, b: br });
    const dentro = AGRUPA[p]
      ? [...new Set(l.map((c) => c.regiao))].map((r) => `${r ? `<p class="com-regiao">${esc(r)}</p>` : ""}<ul class="com-cidades">${l.filter((c) => c.regiao === r).map(linha).join("")}</ul>`).join("")
      : `<ul class="com-cidades">${l.map(linha).join("")}</ul>`;
    return `<li class="com-pais" data-pais="${p}"><button type="button" class="com-pais-btn" data-a="abrir-pais" data-v="${p}" aria-expanded="${on}" aria-controls="com-pc-${p}"><span class="com-pais-cod" aria-hidden="true">${p}</span><span class="com-pais-txt"><span class="com-pais-nome">${esc(nomePais(p))}</span><span class="com-pais-res">${esc(resumo)}</span></span><svg class="com-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><div class="com-pais-corpo ${on ? "is-on" : ""}" id="com-pc-${p}" ${on ? "" : "inert"}><div><div class="com-pais-dentro">${dentro}</div></div></div></li>`;
  };
  return topo + (faltam ? `<div class="com-cartao com-cartao--p com-linha"><span class="com-suave com-peq com-esp">${t("cid_acrescentar_d")}</span><button class="com-opt" type="button" data-a="acrescentar-cidades">${esc(t("cid_acrescentar", { n: faltam }))}</button></div>` : "")
    + `<section class="com-mapa" aria-label="${t("cid_globo_aria")}"><div data-terra></div>${legendaGlobo()}</section>`
    + diaDoYoga() + `<ul class="com-paises">${porPais().map(pais).join("")}</ul>`
    + `<section class="com-cartao com-cartao--p" aria-labelledby="com-outra-t"><h3 id="com-outra-t" class="com-dir-t">${t("cid_outra_t")}</h3><p class="com-suave com-peq">${t("cid_outra_d")}</p>
      <form class="com-linha" data-f="pedir-outra"><label class="com-so-leitor" for="com-oc">${t("cid_outra_ph")}</label><input id="com-oc" class="com-campo com-campo--cresce" name="nome" type="text" maxlength="60" placeholder="${t("cid_outra_ph")}" required><button class="com-opt" type="submit">${t("cid_quero_btn")}</button></form>
      ${formAnfitriao(null)}
      ${fora.length ? `<p class="com-cap">${t("cid_fora_lista")}</p>${fora.map(([, v]) => `<div class="com-linha"><span>${esc(v.nome || "")}</span><span class="com-suave com-peq">${esc(t("cid_pedidos_n", { n: v.n }))}</span></div>`).join("")}` : ""}</section>`;
}

function telaCidade() {
  const eu = S.eu;
  const c = cidadeDe(S.cidadeId);
  const info = S.cidadeInfo;
  if (!c) return `<div class="com-cartao"><h2>${t("cid_nao_existe")}</h2><div class="com-linha"><a class="com-opt" href="#cidades">${t("cid_todas")}</a></div></div>`;
  const aberta = c.estado === "aberta";
  const minha = eu.cidade === c.id;
  const capa = `<div class="com-topo com-topo--capa"><div class="com-capa-tit"><p class="com-sobre">${esc(nomePais(c.pais))}${c.regiao ? ` · ${esc(c.regiao)}` : ""}</p><h1 class="com-h1">${esc(c.nome)}</h1></div>
      <span class="com-capa-planeta">${planeta(planetaDoCirculo({ id: c.id }))}</span>
      ${eu.admin && aberta ? `<details class="com-menu"><summary aria-label="${t("mais_opcoes")}" title="${t("mais_opcoes")}">${IC.pontos}</summary><div class="com-menu-lista"><button class="com-acao com-acao--perigo" type="button" data-a="fechar-cidade" data-v="${c.id}">${t("cid_fechar")}</button></div></details>` : ""}
      <div class="com-capa-sobre"><p class="com-lead">${t(aberta ? "cid_capa_lead" : "cid_breve_lead")}</p>
        <div class="com-linha">${minha ? `<span class="com-selo">${IC.pin}${t("cid_minha")}</span>` : (eu.temFicha ? `<button class="com-opt com-opt--mini" type="button" data-a="minha-cidade" data-v="${c.id}">${IC.pin}<span>${t("cid_e_minha")}</span></button>` : "")}${info.anfitrioes.length ? `<span class="com-suave com-peq">${esc(t("cid_anfitrioes", { n: info.anfitrioes.map((a) => a.nome).join(", ") }))}</span>` : ""}</div></div></div>`;
  const gerir = eu.admin ? painelAnfitrioes(c) : "";
  const pedidos = aberto(c) ? `<section class="com-cartao com-cartao--p com-prof" aria-labelledby="com-cp"><h3 id="com-cp" class="com-dir-t"><span class="com-ic com-ic--prof">${IC.pessoa}</span>${esc(t("cid_pedidos_t", { c: c.nome }))}</h3>
      ${info.pendentes.length ? info.pendentes.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong>${m.motivos?.length ? `<span>${esc(m.motivos.map(motivo).join(", "))}</span>` : ""}</div><button class="com-opt" type="button" data-a="aprovar" data-v="${m.id}">${IC.certo} ${t("aprovar")}</button><button class="com-acao" type="button" data-a="recusar" data-v="${m.id}">${t("recusar")}</button></div>`).join("") : `<p class="com-suave com-peq">${t("cid_sem_pedidos")}</p>`}</section>` : "";
  if (!aberta) {
    return capa + `<section class="com-cartao com-centro com-breve"><strong>${esc(t("cid_breve_t", { c: c.nome }))}</strong><span class="com-suave">${t("cid_breve_d")}</span>
        ${eu.admin ? "" : `${info.jaPedi ? `<span class="com-badge com-badge--feito">${IC.certo}${t("cid_pedido_feito")}</span>` : `<button class="com-pri" type="button" data-a="pedir-cidade" data-v="${c.id}">${esc(t("cid_quero", { c: c.nome }))}</button>`}
        ${formAnfitriao(c)}`}</section>` + gerir + pedidos;
  }
  return capa + pedidos + gerir + mural();
}
/** Anfitriões de uma cidade (só o Lucas): quem cuida agora, escolher entre os membros, ou convidar pelo e-mail
   quem ainda não está na comunidade (ao entrar com esse e-mail, fica logo dentro e anfitrião desta cidade). */
function painelAnfitrioes(c) {
  const eu = S.eu, info = S.cidadeInfo, aberta = c.estado === "aberta";
  const ja = c.anfitrioes || [];
  const candidatos = (S.pessoas || []).filter((m) => !ja.includes(m.id))
    .sort((a, b) => (b.papel === "professor") - (a.papel === "professor") || (a.nome || "").localeCompare(b.nome || ""));
  const opcoes = (ja.includes(eu.uid) ? "" : `<option value="${esc(eu.uid)}">${t("cid_eu")}</option>`)
    + candidatos.filter((m) => m.id !== eu.uid).map((m) => `<option value="${esc(m.id)}">${esc(m.nome)}${m.papel === "professor" ? ` · ${t("papel_professor")}` : ""}</option>`).join("");
  const atuais = info.anfitrioes.length ? `<ul class="com-pessoas">${info.anfitrioes.map((a) => `<li class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(a.nome))}</span><span class="com-quem com-quem--larga"><strong>${esc(a.id === eu.uid ? t("voce") : a.nome)}</strong></span><button class="com-acao com-acao--mini" type="button" data-a="tirar-anfitriao" data-v="${esc(a.id)}">${t("anf_tirar")}</button></li>`).join("")}</ul>` : "";
  const espera = (info.convites || []).map((cv) => `<div class="com-convite"><div class="com-linha"><span class="com-etq">${t("anf_convite_espera")}</span><span class="com-quem com-quem--larga"><strong>${esc(cv.email)}</strong></span></div><div class="com-linha"><button class="com-opt com-opt--mini" type="button" data-a="copiar-convite" data-v="${esc(cv.email)}">${t("anf_copiar")}</button><button class="com-acao com-acao--mini" type="button" data-a="cancelar-convite" data-v="${esc(cv.id)}">${t("cancelar")}</button></div></div>`).join("");
  return `<section class="com-cartao com-cartao--p" aria-labelledby="com-cg"><h3 id="com-cg" class="com-dir-t">${t(aberta ? "cid_anfitrioes_t" : "cid_abrir_t")}</h3>
      ${atuais}
      <p class="com-suave com-peq">${t(aberta ? "cid_anfitrioes_d" : "cid_abrir_d")}</p>
      ${opcoes ? `<form class="com-linha com-linha--base" data-f="abrir-cidade" data-v="${c.id}"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-anf">${t("anf_membro_l")}</label><select id="com-anf" class="com-campo" name="anfitriao" required>${opcoes}</select></div><button class="com-opt" type="submit">${aberta ? `${IC.mais} ${t("cid_juntar")}` : esc(t("cid_abrir", { c: c.nome }))}</button></form>` : ""}
      <div class="com-sep" role="presentation"></div>
      <h4 class="com-sub">${t("anf_convidar_t")}</h4>
      <p class="com-suave com-peq">${esc(t("anf_convidar_d", { c: c.nome }))}</p>
      <form class="com-linha com-linha--base" data-f="convidar-anfitriao" data-v="${c.id}"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-anf-e">${t("email")}</label><input id="com-anf-e" class="com-campo" name="email" type="email" autocomplete="off" placeholder="${t("email_ph")}" required></div><button class="com-opt" type="submit">${t("anf_convidar_b")}</button></form>
      ${espera}</section>`;
}

/** "Quero ser anfitrião": numa cidade em breve (c) ou na lista de cidades (escreve a cidade). */
function formAnfitriao(c) {
  if (S.jaPediAnfitriao) return `<span class="com-badge com-badge--feito">${IC.certo}${t("anf_feito")}</span>`;
  return `<details class="com-mais com-anf"><summary>${IC.mais}<span>${t("anf_quero")}</span></summary>
    <form class="com-novo" data-f="pedir-anfitriao"${c ? ` data-cidade="${esc(c.nome)}"` : ""}>
      ${c ? "" : `<label class="com-peq com-suave" for="com-anf-c">${t("anf_cidade")}</label><input id="com-anf-c" class="com-campo" name="cidade" type="text" maxlength="60" required>`}
      <label class="com-peq com-suave" for="com-anf-s">${t("anf_sobre_l")}</label><textarea id="com-anf-s" class="com-campo" name="sobre" maxlength="600" placeholder="${t("anf_sobre_ph")}" required></textarea>
      <div class="com-linha"><button class="com-opt" type="submit">${t("anf_enviar")}</button></div></form></details>`;
}
/** Dia Internacional do Yoga (21 de junho, ONU): o dia em que todas as cidades meditam juntas. */
function diaDoYoga() {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const d = new Date(hoje.getFullYear(), 5, 21);
  if (d < hoje) d.setFullYear(d.getFullYear() + 1);
  const dias = Math.round((d - hoje) / 864e5);
  const ymd = (x) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}`;
  const fim = new Date(d); fim.setDate(fim.getDate() + 1);
  const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t("dy_t"))}&dates=${ymd(d)}/${ymd(fim)}&details=${encodeURIComponent(t("dy_d"))}&recur=${encodeURIComponent("RRULE:FREQ=YEARLY")}`;
  return `<section class="com-destaque" aria-labelledby="com-dy-t"><span class="com-ic com-ic--prof">${IC.sol}</span><div class="com-quem"><small class="com-destaque-rot">${t("dy_rot")}</small><strong id="com-dy-t">${t("dy_t")}</strong><span>${t("dy_d")}</span><span class="com-peq">${dias === 0 ? t("dy_hoje") : esc(t("dy_faltam", { n: dias }))}</span></div><a class="com-opt com-opt--mini" href="${esc(cal)}" target="_blank" rel="noopener noreferrer">${t("por_calendario")}</a></section>`;
}
/** Boas-vindas: depois de aprovar, o anfitrião manda uma mensagem curta (aviso no sino da pessoa). */
function boasVindas(m, c) {
  const d = document.getElementById("com-confirmar");
  const primeiro = (m.nome || "").split(" ")[0];
  d.innerHTML = `<form method="dialog" class="com-dlg"><h2 id="com-dlg-t">${esc(t("bv_t", { n: primeiro }))}</h2><p id="com-dlg-d">${t("bv_d")}</p>
      <label class="com-so-leitor" for="com-bv">${t("bv_t", { n: primeiro })}</label><textarea id="com-bv" class="com-campo" maxlength="200" required>${esc(t("bv_texto", { n: primeiro, c: c.nome }).slice(0, 200))}</textarea>
      <div class="com-linha com-linha--fim"><button class="com-acao" value="nao" type="submit">${t("bv_nao")}</button><button class="com-pri" value="sim" type="submit">${t("bv_enviar")}</button></div></form>`;
  d.setAttribute("aria-labelledby", "com-dlg-t");
  d.setAttribute("aria-describedby", "com-dlg-d");
  d.addEventListener("close", async () => {
    const texto = d.querySelector("#com-bv")?.value.trim();
    if (d.returnValue === "sim" && texto && await tentar(() => dados.avisar(m.id, { tipo: "boas-vindas", texto, link: `comunidade.html#cidade=${c.id}` }))) aviso(t("bv_enviada"));
  }, { once: true });
  d.returnValue = "nao";
  d.showModal();
  d.querySelector("#com-bv")?.focus();
}

/** Quem vê os pedidos de entrada de uma cidade: os seus anfitriões e o Lucas. */
const aberto = (c) => souAnfitriao(c) || S.eu.admin;

const msDe = (ts) => (ts?.toMillis ? ts.toMillis() : 0);
/** Seguir um professor: só aparece para outros (nunca para si mesmo). */
const botaoSeguir = (profUid) => {
  if (!profUid || profUid === S.eu.uid) return "";
  const sigo = S.seguindo.includes(profUid);
  return `<button class="com-acao com-acao--mini com-seguir ${sigo ? "is-on" : ""}" type="button" aria-pressed="${sigo}" data-a="seguir" data-v="${esc(profUid)}">${sigo ? t("a_seguir") : t("seguir")}</button>`;
};
/** Link do Google Calendar (1 hora; os semanais repetem). */
function calUrl(e) {
  const ini = msDe(e.quando);
  const f = (m) => new Date(m).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const c = e.cidade ? cidadeDe(e.cidade) : null;
  const onde = e.lugar ? e.lugar + (c ? `, ${c.nome}` : "") : (e.link || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.titulo)}&dates=${f(ini)}/${f(ini + 3600e3)}&details=${encodeURIComponent(t("cal_det") + " https://neuromedit.com/comunidade.html")}&location=${encodeURIComponent(onde)}${e.repete ? `&recur=${encodeURIComponent("RRULE:FREQ=WEEKLY")}` : ""}`;
}
const semanal = (e) => {
  const d = new Date(msDe(e.quando));
  return t("toda_semana", { d: d.toLocaleDateString(lingua(), { weekday: "long" }), h: d.toLocaleTimeString(lingua(), { hour: "2-digit", minute: "2-digit" }) });
};
/** Lembrete no topo: um encontro com lugar guardado nas próximas 24 horas (sem servidor: lido ao abrir). */
function lembrete() {
  const agora = Date.now();
  const e = S.encontros.find((x) => x.guardado && msDe(x.quando) >= agora - 3600e3 && msDe(x.quando) <= agora + 24 * 3600e3);
  if (!e) return "";
  const d = new Date(msDe(e.quando));
  const hoje = d.toDateString() === new Date().toDateString();
  const hora = d.toLocaleTimeString(lingua(), { hour: "2-digit", minute: "2-digit" });
  const c = e.cidade ? cidadeDe(e.cidade) : null;
  const acao = e.lugar
    ? `<a class="com-opt com-opt--mini" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.lugar + (c ? `, ${c.nome}` : ""))}" target="_blank" rel="noopener noreferrer">${t("cid_ver_mapa")}</a>`
    : `<a class="com-opt com-opt--mini" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">${t("entrar_enc")}</a>`;
  return `<section class="com-lembrete" role="status" aria-labelledby="com-lemb-t"><span class="com-ic">${IC.sino}</span><div class="com-quem"><small>${esc(t(hoje ? "lemb_hoje" : "lemb_amanha", { h: hora }))}</small><strong id="com-lemb-t">${esc(e.titulo)}</strong><span>${e.lugar ? esc(e.lugar) : t("cid_online")}</span></div>${acao}</section>`;
}

/** Encontro: online (entrar no Meet) ou presencial (lugar, com link para o mapa). */
function encontroItem(e) {
  const eu = S.eu;
  const c = e.cidade ? cidadeDe(e.cidade) : null;
  const mapa = e.lugar ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.lugar + (c ? `, ${c.nome}` : ""))}` : "";
  const vao = e.vao > 0 ? `<span class="com-enc-vao">${esc(t(e.vao === 1 ? "vai_1" : "vao_n", { n: e.vao }))}</span>` : "";
  const apagar = eu.admin || e.uid === eu.uid ? `<button class="com-acao com-acao--perigo com-acao--mini" type="button" data-a="apagar-encontro" data-v="${e.id}" aria-label="${t("apagar_enc")}" title="${t("apagar_enc")}">${IC.lixo}</button>` : "";
  return `<div class="com-enc"><div class="com-quem"><span class="com-enc-topo"><strong>${esc(e.titulo)}</strong>${apagar}</span><span>${esc(dataHora(e.quando))}</span>
      ${e.repete ? `<span class="com-enc-lugar">${IC.repete}${esc(semanal(e))}</span>` : ""}
      ${e.lugar ? `<span class="com-enc-lugar">${IC.pin}${esc(e.lugar)}${c ? ` · ${esc(c.nome)}` : ""}</span>` : `<span class="com-enc-lugar">${IC.video}${t("cid_online")}</span>`}
      <span class="com-nome"><span>${esc(t("com_nome", { nome: e.nome }))}</span>${botaoSeguir(e.uid)}</span>${vao}</div>
    <div class="com-linha"><button class="com-opt ${e.guardado ? "is-on" : ""}" type="button" aria-pressed="${e.guardado}" data-a="lugar" data-v="${e.id}">${e.guardado ? t("lugar_guardado") : t("guardar_lugar")}</button>${e.lugar ? `<a class="com-opt" href="${esc(mapa)}" target="_blank" rel="noopener noreferrer">${t("cid_ver_mapa")}</a>` : `<a class="com-opt" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">${t("entrar_enc")}</a>`}</div>
    <a class="com-acao com-acao--mini com-acao--solta" href="${esc(calUrl(e))}" target="_blank" rel="noopener noreferrer">${IC.agenda}<span>${t("por_calendario")}</span></a></div>`;
}

/** Coluna da direita na página de uma cidade: encontros no sítio e subcomunidades. */
function direitaCidade() {
  const eu = S.eu;
  const c = cidadeDe(S.cidadeId);
  if (!c || c.estado !== "aberta") return "";
  const encs = S.encontros.filter((e) => e.cidade === c.id);
  const subs = S.grupos.filter((g) => g.cidade === c.id);
  const cuida = eu.professor || souAnfitriao(c);
  return `<section class="com-cartao com-cartao--p" aria-labelledby="com-ce"><h3 id="com-ce" class="com-dir-t"><span class="com-ic">${IC.agenda}</span>${esc(t("cid_encontros_t", { c: c.nome }))}</h3><p class="com-suave com-peq">${t("cid_encontros_d")}</p>
      ${encs.length ? encs.map(encontroItem).join("") : `<p class="com-suave com-peq">${t("sem_enc")}</p>`}
      ${cuida ? `<details class="com-mais com-mais--dir"><summary>${IC.mais}<span>${t("marcar_enc")}</span></summary><form class="com-novo" data-f="encontro" data-cidade="${c.id}"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="${t("enc_nome")}" aria-label="${t("enc_nome")}" required><label class="com-peq com-suave" for="com-eq">${t("dia_hora")}</label><input id="com-eq" class="com-campo" name="quando" type="datetime-local" required><label class="com-peq com-suave" for="com-elg">${t("cid_lugar")}</label><input id="com-elg" class="com-campo" name="lugar" type="text" maxlength="160" placeholder="${t("cid_lugar_ph")}"><label class="com-peq com-suave" for="com-el">${t("cid_ou_online")}</label><input id="com-el" class="com-campo" name="link" type="url" placeholder="https://meet.google.com/..."><label class="com-chk com-chk--mini"><input type="checkbox" name="repete">${t("repete_l")}</label><div class="com-linha"><button class="com-opt" type="submit">${t("marcar_enc")}</button></div></form></details>` : ""}
    </section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-cs"><h3 id="com-cs" class="com-dir-t"><span class="com-ic">${IC.conversa}</span>${t("cid_subs_t")}</h3><p class="com-suave com-peq">${t("cid_subs_d")}</p>
      ${subs.length ? subs.map((g) => { const dentro = (g.membros || []).includes(eu.uid); return `<div class="com-linha com-aviso-item"><div class="com-quem com-quem--larga"><strong>${esc(g.nome)}</strong><span>${g.tipo === "privado" ? t("so_inclusao") : t("aberto")}</span></div>${dentro || eu.admin ? `<a class="com-opt com-opt--mini" href="#g=${g.id}">${t("abrir_conversa")}</a>` : `<button class="com-opt com-opt--mini" type="button" data-a="entrar-grupo" data-v="${g.id}">${t("entrar_grupo")}</button>`}</div>`; }).join("") : `<p class="com-suave com-peq">${t("cid_sem_subs")}</p>`}
      ${cuida ? `<details class="com-mais com-mais--dir"><summary>${IC.mais}<span>${t("cid_criar_sub")}</span></summary><form class="com-novo" data-f="novo-grupo" data-cidade="${c.id}"><input class="com-campo" name="nome" type="text" maxlength="60" placeholder="${t("cid_sub_ph")}" aria-label="${t("novo_grupo")}" required><select class="com-campo" name="tipo" aria-label="${t("quem_entra")}"><option value="aberto">${t("qualquer")}</option><option value="privado">${t("so_incluir")}</option></select><button class="com-opt" type="submit">${IC.mais} ${t("cid_criar_sub")}</button></form></details>` : ""}
    </section>`;
}

function telaPartilha() {
  const p = S.aberto;
  if (!p) return `<div class="com-cartao"><h2>${t("nao_existe")}</h2><div class="com-linha"><a class="com-opt" href="#">${t("voltar_circulos")}</a></div></div>`;
  const c = circ(S.circulos.find((x) => x.id === p.circulo)) || cidadeDe(p.circulo);
  return `<a class="com-acao com-acao--solta" href="${hashDoMural(p.circulo)}">${IC.voltar}<span>${esc(t("voltar_a", { c: c?.nome || t("circulo") }))}</span></a>
    ${cartaoPartilha(p, { aberta: true })}
    <section class="com-cartao com-comentarios" aria-labelledby="com-coms-t"><h2 id="com-coms-t" class="com-cap">${t("comentarios")}${S.respostas.length ? ` · ${S.respostas.length}` : ""}</h2>
    ${S.respostas.length ? S.respostas.map((r) => comentario(r, p)).join("") : `<p class="com-suave com-peq">${t("sem_respostas")}</p>`}
    <form class="com-coment com-coment--novo" data-f="responder">${rosto(S.eu.foto, S.eu.nome, false)}<div class="com-coment-corpo"><div class="com-balao-campo"><label class="com-so-leitor" for="com-resp">${t("comentar")}</label><textarea id="com-resp" class="com-campo com-campo--balao" name="texto" rows="1" maxlength="1500" placeholder="${t("coment_ph")}" required></textarea><button class="com-enviar" type="submit" aria-label="${t("coment_enviar")}" title="${t("coment_enviar")}">${IC.enviar}</button></div><p class="com-suave com-peq">${t("responder_d")}</p></div></form></section>`;
}

/** Um comentário: balão com o nome e o texto; por baixo, quando e as ações (como no Facebook). */
function comentario(r, p) {
  const eu = S.eu;
  const minha = r.uid === eu.uid;
  const podeApagar = eu.admin || minha || p.minha || S.circulos.find((c) => c.id === p.circulo)?.criador === eu.uid || souAnfitriao(cidadeDe(p.circulo));
  return `<div class="com-coment">${rosto(r.foto, r.nome, false)}<div class="com-coment-corpo">
      <div class="com-balao"><span class="com-nome">${r.uid ? `<a class="com-nome-link" href="#u=${r.uid}"><strong>${esc(minha ? t("voce") : r.nome)}</strong></a>` : `<strong>${esc(minha ? t("voce") : r.nome)}</strong>`}${r.professor ? selo() : ""}</span><p class="com-texto">${esc(r.texto)}</p></div>
      <div class="com-coment-meta"><span>${quando(r.criadoEm)}</span>${eu.admin && r.denunciada ? `<span class="com-etq com-etq--alerta">${t("denunciada")}</span><button class="com-acao com-acao--mini" type="button" data-a="manter-resposta" data-v="${r.id}">${t("manter")}</button>` : ""}${minha || (eu.admin && r.denunciada) ? "" : `<button class="com-acao com-acao--mini" type="button" data-a="denunciar-resposta" data-v="${r.id}" ${r.denunciada ? "disabled" : ""}>${r.denunciada ? t("denunciada") : t("denunciar")}</button>`}${podeApagar ? `<button class="com-acao com-acao--mini com-acao--perigo" type="button" data-a="apagar-resposta" data-v="${r.id}">${t("apagar")}</button>` : ""}</div>
    </div></div>`;
}

function telaGrupos() {
  const eu = S.eu;
  return `<div class="com-topo"><p class="com-sobre">${t("grupos_t")}</p><h1 class="com-h1">${t("grupos_h1")}</h1><p class="com-lead">${t("grupos_lead")}</p></div>
    ${eu.professor ? `<form class="com-cartao com-linha com-linha--base" data-f="novo-grupo"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-ng">${t("novo_grupo")}</label><input id="com-ng" class="com-campo" name="nome" type="text" maxlength="60" placeholder="${t("novo_grupo_ph")}" required></div><div class="com-sel"><label class="com-peq com-suave" for="com-tg">${t("quem_entra")}</label><select id="com-tg" class="com-campo" name="tipo"><option value="privado">${t("so_incluir")}</option><option value="aberto">${t("qualquer")}</option></select></div><button class="com-pri" type="submit">${IC.mais} ${t("criar_grupo")}</button></form>` : `<p class="com-suave com-peq">${t("grupos_quem")}</p>`}
    ${S.grupos.length ? S.grupos.map((g) => {
      const dentro = (g.membros || []).includes(eu.uid);
      return `<div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem com-quem--larga"><strong>${esc(g.nome)}</strong><span>${g.tipo === "privado" ? t("so_inclusao") : t("aberto")}${g.cidade && cidadeDe(g.cidade) ? ` · ${esc(cidadeDe(g.cidade).nome)}` : ""}${g.criador === eu.uid ? t("criado_voce") : ""}</span></div>
        ${dentro || eu.admin ? `<a class="com-opt" href="#g=${g.id}">${t("abrir_conversa")}</a>` : `<button class="com-opt" type="button" data-a="entrar-grupo" data-v="${g.id}">${t("entrar_grupo")}</button>`}
        ${eu.admin || g.criador === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-grupo" data-v="${g.id}">${IC.lixo}<span>${t("apagar")}</span></button>` : ""}</div>`;
    }).join("") : `<div class="com-cartao com-centro"><strong>${t("sem_grupos")}</strong></div>`}`;
}

function telaGrupo() {
  const g = S.grupo, eu = S.eu;
  if (!g) return `<div class="com-cartao"><h2>${t("grupo_nao")}</h2><div class="com-linha"><a class="com-opt" href="#grupos">${t("voltar_grupos")}</a></div></div>`;
  // Grupo aberto em que ainda não estou: só o nome e quantas pessoas, e o convite para entrar.
  if (g.vitrine && !eu.admin) return `<a class="com-acao com-acao--solta" href="#grupos">${IC.voltar}<span>${t("grupos_t")}</span></a>
    <section class="com-cartao com-novo com-centro"><span class="com-ic">${IC.conversa}</span><h1 class="com-h2">${esc(g.nome)}</h1>
      <p class="com-suave">${t("aberto")}${g.n ? ` · ${esc(t(g.n === 1 ? "grupo_n_1" : "grupo_n", { n: g.n }))}` : ""}</p>
      <p class="com-suave com-peq">${t("grupo_vitrine_d")}</p>
      <div class="com-linha" style="justify-content:center"><button class="com-pri" type="button" data-a="entrar-grupo" data-v="${g.id}">${t("entrar_grupo")}</button></div></section>`;
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
  const g = S.grupo, eu = S.eu;
  return bolhas(S.msgs, { nome: (m) => m.nome || "", apagar: (m) => eu.admin || m.uid === eu.uid || g.criador === eu.uid, acao: "apagar-mensagem", grupo: true });
}
/* ---------- Bolhas de conversa (nov 2026), como no WhatsApp e no Instagram ----------
   As minhas à direita, na cor de destaque; as dos outros à esquerda, na superfície.
   Separador por dia, hora dentro da bolha, nome só na primeira de uma sequência (em grupos).
   Apagar: toca-se na própria bolha e aparece o caixote (no computador, ao passar o rato). */
function bolhas(msgs, { nome, apagar, acao, grupo }) {
  if (!msgs.length) return `<p class="com-suave com-peq com-centro">${t("sem_msgs")}</p>`;
  const eu = S.eu.uid;
  const lingua = document.documentElement.lang || "pt-BR";
  const ms = (x) => (x?.toMillis ? x.toMillis() : 0);
  const dia = (m) => { const d = ms(m.criadoEm) ? new Date(ms(m.criadoEm)) : new Date(); return d.toDateString(); };
  const rotuloDia = (m) => {
    const d = ms(m.criadoEm) ? new Date(ms(m.criadoEm)) : new Date();
    const hoje = new Date(); const ontem = new Date(Date.now() - 86400000);
    if (d.toDateString() === hoje.toDateString()) return t("hoje");
    if (d.toDateString() === ontem.toDateString()) return t("ontem");
    return d.toLocaleDateString(lingua, { day: "numeric", month: "long" });
  };
  const hora = (m) => (ms(m.criadoEm) ? new Date(ms(m.criadoEm)) : new Date()).toLocaleTimeString(lingua, { hour: "2-digit", minute: "2-digit" });
  let out = "", diaAnt = "", quemAnt = "";
  msgs.forEach((m) => {
    const d = dia(m);
    if (d !== diaAnt) { out += `<p class="com-dia"><span>${esc(rotuloDia(m))}</span></p>`; diaAnt = d; quemAnt = ""; }
    const minha = m.uid === eu;
    const primeira = m.uid !== quemAnt;
    quemAnt = m.uid;
    const podeApagar = apagar(m);
    out += `<div class="com-msg ${minha ? "is-minha" : ""} ${primeira ? "is-primeira" : ""}"${podeApagar ? ` data-a="msg-acoes" tabindex="0"` : ""}>
      ${grupo && !minha && primeira ? `<span class="com-msg-nome">${esc(nome(m))}</span>` : ""}
      <span class="com-msg-texto">${esc(m.texto)}<span class="com-msg-hora" aria-label="${esc(hora(m))}">${esc(hora(m))}</span></span>
      ${podeApagar ? `<button class="com-msg-apagar" type="button" data-a="${acao}" data-v="${m.id}" aria-label="${t("apagar_msg")}">${IC.lixo}</button>` : ""}
    </div>`;
  });
  return out;
}

/* ---------- Mensagens diretas ---------- */
const novasN = () => (S.convs || []).filter((c) => c.novaPara === S.eu?.uid && c.estado !== "bloqueada").length;
/** Posso escrever a esta pessoa? Depende do que ela escolheu em "Quem me pode escrever". */
const podeEscrever = (p) => p && p.uid !== S.eu.uid && p.estado === "aprovado" && (!p.quemEscreve || p.quemEscreve === "todos" || (p.quemEscreve === "professores" && S.eu.professor));
function telaMensagens() {
  const eu = S.eu.uid;
  const quem = (c) => S.pessoas.find((m) => m.id === c.membros.find((x) => x !== eu)) || { nome: "", foto: "" };
  const linha = (c) => { const p = quem(c); const nova = c.novaPara === eu && c.estado !== "bloqueada";
    const estado = c.estado === "bloqueada" ? t("msg_estado_bloq") : (c.estado === "pedido" && c.de === eu ? t("msg_estado_esp") : "");
    return `<a class="com-dm-linha ${nova ? "is-nova" : ""}" href="#m=${c.id}">${rosto(p.foto, p.nome)}<span class="com-quem com-quem--larga"><strong>${esc(p.nome || t("papel_membro"))}</strong><span>${esc(estado || c.ultimaTexto || "")}</span></span><span class="com-suave com-peq">${c.ultimaEm ? quando(c.ultimaEm) : ""}</span>${nova ? `<span class="com-dm-ponto" aria-label="${t("msg_nova")}"></span>` : ""}</a>`; };
  const pedidos = S.convs.filter((c) => c.estado === "pedido" && c.para === eu);
  const resto = S.convs.filter((c) => !(c.estado === "pedido" && c.para === eu));
  return `<div class="com-topo"><h1 class="com-h1">${t("msgs_t")}</h1><p class="com-lead">${t("msgs_lead")}</p></div>
    ${pedidos.length ? `<section class="com-cartao com-novo"><h2 class="com-pessoa-h2">${t("msgs_pedidos")}</h2>${pedidos.map((c) => `<div class="com-dm-pedido">${linha(c)}<div class="com-linha"><button class="com-pri" type="button" data-a="aceitar-conversa" data-v="${c.id}">${t("msg_aceitar")}</button><button class="com-acao" type="button" data-a="bloquear-conversa" data-v="${c.id}">${t("msg_bloquear")}</button></div></div>`).join("")}</section>` : ""}
    <section class="com-cartao com-novo">${resto.length ? resto.map(linha).join("") : `<p class="com-suave com-centro">${t("msgs_vazio")}</p>`}</section>
    <p class="com-suave com-peq com-centro">${t("msgs_privacidade")} <a href="#perfil">${t("quem_escreve_l")}</a></p>`;
}
function telaConversa() {
  const c = S.conv, eu = S.eu.uid, o = S.convOutro;
  if (!c) return `<div class="com-cartao"><h2>${t("msg_nao")}</h2><div class="com-linha"><a class="com-opt" href="#mensagens">${t("msgs_t")}</a></div></div>`;
  const dentro = c.membros.includes(eu);
  const pedidoParaMim = c.estado === "pedido" && c.para === eu;
  const escrevo = dentro && (c.estado === "aberta" || (c.estado === "pedido" && c.de === eu));
  const menu = dentro ? `<details class="com-menu"><summary aria-label="${t("mais_opcoes")}" title="${t("mais_opcoes")}">${IC.pontos}</summary><div class="com-menu-lista">
      ${c.estado === "bloqueada" ? (c.bloqueadaPor === eu ? `<button type="button" class="com-acao" data-a="desbloquear-conversa" data-v="${c.id}">${t("msg_desbloquear")}</button>` : "") : `<button type="button" class="com-acao" data-a="bloquear-conversa" data-v="${c.id}">${t("msg_bloquear")}</button>`}
      ${c.denunciada ? "" : `<button type="button" class="com-acao com-acao--perigo" data-a="denunciar-conversa" data-v="${c.id}">${IC.bandeira}<span>${t("msg_denunciar")}</span></button>`}</div></details>` : "";
  return `<a class="com-acao com-acao--solta" href="#mensagens">${IC.voltar}<span>${t("msgs_t")}</span></a>
    <div class="com-linha">${rosto(o?.foto, o?.nome)}<div class="com-quem"><a class="com-nome-link" href="#u=${esc(o?.uid || "")}"><strong>${esc(o?.nome || t("papel_membro"))}</strong></a>${o?.usuario ? `<span>@${esc(o.usuario)}</span>` : ""}</div><span class="com-esp"></span>${menu}</div>
    ${!dentro ? `<p class="com-aviso-dm">${t("msg_admin_denuncia")}</p>${S.eu.admin ? `<div class="com-linha"><button class="com-opt" type="button" data-a="arquivar-conversa" data-v="${c.id}">${t("msg_arquivar")}</button></div>` : ""}` : ""}
    ${pedidoParaMim ? `<section class="com-cartao com-cartao--p com-novo"><p>${esc(t("msg_pedido_de", { n: o?.nome || "" }))}</p><div class="com-linha"><button class="com-pri" type="button" data-a="aceitar-conversa" data-v="${c.id}">${t("msg_aceitar")}</button><button class="com-acao" type="button" data-a="bloquear-conversa" data-v="${c.id}">${t("msg_bloquear")}</button></div></section>` : ""}
    <section class="com-cartao com-conversa" id="com-msgs" aria-label="${t("mensagens")}" aria-live="polite">${mensagensDiretas()}</section>
    ${escrevo ? `<form class="com-linha" data-f="dm"><label class="com-so-leitor" for="com-dm">${t("mensagem")}</label><input id="com-dm" class="com-campo com-campo--cresce" name="texto" type="text" maxlength="1000" placeholder="${t("msg_ph")}" autocomplete="off" required><button class="com-pri" type="submit" aria-label="${t("enviar")}">${IC.enviar}</button></form>` : ""}
    <p class="com-suave com-peq">${c.estado === "bloqueada" ? t("msg_estado_bloq_d") : (c.estado === "pedido" && c.de === eu ? t("msg_espera_d") : t("msg_privada_d"))}</p>`;
}
function mensagensDiretas() {
  return bolhas(S.msgs, { nome: () => S.convOutro?.nome || "", apagar: (m) => m.uid === S.eu.uid, acao: "apagar-dm", grupo: false });
}

function telaGestao() {
  const { membros, convites, denuncias } = S.gestao;
  const pedidos = membros.filter((m) => m.estado === "pendente");
  const dentro = membros.filter((m) => m.estado === "aprovado");
  const fora = membros.filter((m) => m.estado === "removido");
  const nomeDe = (id) => membros.find((m) => m.id === id)?.nome || "";
  const abertas = S.cidades.filter((c) => c.estado === "aberta").length;
  return `<div class="com-topo"><p class="com-sobre">${t("gest_eyebrow")}</p><h1 class="com-h1">${t("gest_h1")}</h1><p class="com-lead">${t("gest_lead")}</p></div>
    <section class="com-cartao com-cartao--p com-linha" aria-labelledby="com-g0"><span class="com-ic">${IC.globo}</span><div class="com-quem com-quem--larga"><strong id="com-g0">${t("cid_todas")}</strong><span>${S.cidades.length ? esc(t("cid_resumo", { a: abertas, n: S.cidades.length })) : t("cid_semear_d")}</span></div>${S.cidades.length ? `<a class="com-opt" href="#cidades">${t("cid_gerir")}</a>` : `<button class="com-pri" type="button" data-a="semear-cidades">${t("cid_semear")}</button>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g1"><h3 id="com-g1">${t("pedidos")}</h3>
      ${pedidos.length ? pedidos.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}${m.motivos?.length ? " · " + esc(m.motivos.map(motivo).join(", ")) : ""}</span></div><button class="com-opt" type="button" data-a="aprovar" data-v="${m.id}">${IC.certo} ${t("aprovar")}</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">${t("recusar")}</button></div>`).join("") : `<p class="com-suave com-peq">${t("sem_pedidos")}</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-ga"><h3 id="com-ga">${t("anf_pedidos_t")}</h3>
      ${(S.gestao.anfitriao || []).length ? S.gestao.anfitriao.map((a) => { const m = membros.find((x) => x.id === a.id); return `<div class="com-den"><div class="com-linha"><strong>${esc(a.nome)}</strong><span class="com-etq">${esc(a.cidade)}</span></div><p class="com-texto com-suave">${esc(a.sobre)}</p><div class="com-linha">${m && m.papel !== "professor" ? `<button class="com-opt" type="button" data-a="papel" data-v="${a.id}" data-p="professor">${t("anf_tornar_prof")}</button>` : (m ? `<span class="com-badge com-badge--feito">${IC.certo}${t("papel_professor")}</span>` : `<span class="com-suave com-peq">${t("anf_nao_membro")}</span>`)}<span class="com-esp"></span><button class="com-acao" type="button" data-a="apagar-pedido-anf" data-v="${a.id}">${t("anf_arquivar")}</button></div></div>`; }).join("") : `<p class="com-suave com-peq">${t("anf_sem")}</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g2"><h3 id="com-g2">${t("convidar_t")}</h3><p class="com-suave com-peq">${t("convidar_d")} <strong>neuromedit.com/comunidade.html</strong>.</p>
      <form class="com-linha" data-f="convidar"><label class="com-so-leitor" for="com-cv">${t("email")}</label><input id="com-cv" class="com-campo com-campo--cresce" name="email" type="email" placeholder="${t("email_ph")}" required><button class="com-pri" type="submit">${t("guardar_convite")}</button></form>
      ${convites.map((c) => `<div class="com-linha"><span class="com-etq">${c.anfitriao ? esc(t("convite_anf_rot", { c: cidadeDe(c.cidade)?.nome || c.cidade })) : t("convite_espera")}</span><span class="com-suave com-peq">${esc(c.email)}</span><button class="com-acao" type="button" data-a="cancelar-convite" data-v="${esc(c.id)}">${t("cancelar")}</button></div>`).join("")}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g3"><h3 id="com-g3">${t("denuncias")}</h3>
      ${denuncias.length ? denuncias.map((p) => `<div class="com-den"><p class="com-texto">${esc(p.texto)}</p><div class="com-linha"><span class="com-suave com-peq">${esc(circ(S.circulos.find((c) => c.id === p.circulo))?.nome || "")} · ${esc(p.anon ? t("sem_nome_de", { n: nomeDe(p.autorUid) || t("autor_desconhecido") }) : p.nome)}</span><span class="com-esp"></span><a class="com-acao" href="#p=${p.id}">${t("abrir")}</a><button class="com-opt" type="button" data-a="manter" data-v="${p.id}">${t("manter")}</button><button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>${t("apagar_partilha")}</span></button></div></div>`).join("") : `<p class="com-suave com-peq">${t("sem_denuncias")}</p>`}</section>
    ${(S.gestao.conversasDen || []).length ? `<section class="com-cartao com-cartao--p" aria-labelledby="com-g3b"><h3 id="com-g3b">${t("msg_den_t")}</h3>${S.gestao.conversasDen.map((c) => `<div class="com-linha"><span class="com-quem com-quem--larga"><strong>${esc(c.membros.map(nomeDe).filter(Boolean).join(" · ") || t("papel_membro"))}</strong><span>${t("msg_den_por", { n: nomeDe(c.bloqueadaPor) || "" })}</span></span><a class="com-acao" href="#m=${c.id}">${t("abrir")}</a><button class="com-opt" type="button" data-a="arquivar-conversa" data-v="${c.id}">${t("msg_arquivar")}</button></div>`).join("")}</section>` : ""}
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g5"><h3 id="com-g5">${t("apoio_gest_t")}</h3><p class="com-suave com-peq">${t("apoio_gest_d")}</p>
      <form class="com-novo" data-f="apoio"><input class="com-campo" name="quem" type="text" maxlength="60" placeholder="${t("apoio_quem")}" aria-label="${t("apoio_quem")}" value="${esc(S.apoio?.quem || "")}" required><input class="com-campo" name="titulo" type="text" maxlength="80" placeholder="${t("apoio_titulo")}" aria-label="${t("apoio_titulo")}" value="${esc(S.apoio?.titulo || "")}" required><textarea class="com-campo" name="texto" maxlength="200" rows="2" placeholder="${t("apoio_texto")}" aria-label="${t("apoio_texto")}">${esc(S.apoio?.texto || "")}</textarea><input class="com-campo" name="link" type="url" pattern="https://.+" placeholder="https://..." aria-label="${t("apoio_link")}" value="${esc(S.apoio?.link || "")}" required>
      <div class="com-linha"><button class="com-pri" type="submit">${t(S.apoio ? "apoio_guardar" : "apoio_por")}</button>${S.apoio ? `<button class="com-acao com-acao--perigo" type="button" data-a="tirar-apoio">${t("apoio_tirar")}</button>` : ""}</div></form></section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g4"><h3 id="com-g4">${t("membros")}</h3>
      ${dentro.length ? dentro.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><span class="com-etq">${papel(m.papel)}</span><button class="com-acao" type="button" data-a="papel" data-v="${m.id}" data-p="${m.papel === "professor" ? "membro" : "professor"}">${m.papel === "professor" ? t("tornar_membro") : t("tornar_prof")}</button><button class="com-acao com-acao--perigo" type="button" data-a="remover" data-v="${m.id}">${t("remover")}</button></div>`).join("") : `<p class="com-suave com-peq">${t("sem_membros")}</p>`}
      ${fora.length ? `<p class="com-cap">${t("removidos")}</p>${fora.map((m) => `<div class="com-linha"><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><button class="com-acao" type="button" data-a="aprovar" data-v="${m.id}">${t("deixar_voltar")}</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">${t("apagar_ficha")}</button></div>`).join("")}` : ""}</section>`;
}

/** As partilhas e os comentários guardam só um link curto da foto (≤ 500): uma foto carregada no perfil fica no perfil. */
const fotoCurta = (f) => (f && f.length <= 500 ? f : "");
const interessesDe = (l) => (l || []).map((i) => `<span class="com-chip">${t("int_" + i)}</span>`).join("");
function telaPerfil() {
  const eu = S.eu;
  const foto = S.fotoPerfil !== undefined ? S.fotoPerfil : eu.foto;
  return `<div class="com-topo"><p class="com-sobre">${t("ajustes_t")}</p><h1 class="com-h1">${t("perfil_h1")}</h1></div>
    ${eu.temFicha && S.minhaPagina ? perfilNoPainel(eu) : ""}
    ${eu.temFicha && !S.minhaPagina ? `<form class="com-cartao com-novo" data-f="perfil">
      <div class="com-linha com-perfil-foto"><span class="com-foto com-foto--g">${foto ? `<img src="${esc(foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</span>
        <div class="com-linha"><label class="com-opt">${IC.foto} ${t("foto_mudar")}<input class="com-so-leitor" type="file" accept="image/*" data-a="foto-perfil"></label>${eu.fotoGoogle && foto !== eu.fotoGoogle ? `<button class="com-acao" type="button" data-a="foto-google">${t("foto_google_usar")}</button>` : ""}</div></div>
      <label for="com-pn">${t("nome_comunidade")}</label><input id="com-pn" class="com-campo" name="nome" type="text" maxlength="60" value="${esc(eu.nome)}" required>
      <label for="com-pu">${t("usuario_l")}</label>
      <div class="com-arroba"><span aria-hidden="true">@</span><input id="com-pu" class="com-campo" name="usuario" type="text" minlength="3" maxlength="20" pattern="[a-z0-9._]{3,20}" autocapitalize="none" autocomplete="username" spellcheck="false" value="${esc(eu.usuario)}" aria-describedby="com-pu-d" ${eu.usuario ? "" : "required"}></div>
      <p id="com-pu-d" class="com-suave com-peq">${t("usuario_d")}</p>
      <label for="com-pb">${t("bio_l")}</label><input id="com-pb" class="com-campo" name="bio" type="text" maxlength="140" value="${esc(eu.bio)}" placeholder="${t("bio_ph")}">
      <fieldset class="com-interesses"><legend>${t("interesses_l")}</legend>${dados.INTERESSES.map((i) => `<label class="com-chip-op"><input type="checkbox" name="interesses" value="${i}" ${eu.interesses.includes(i) ? "checked" : ""}><span>${t("int_" + i)}</span></label>`).join("")}</fieldset>
      ${S.cidades.length ? `<label for="com-pc">${t("cid_entrada_l")}</label><select id="com-pc" class="com-campo" name="cidade">${opcoesCidades(eu.cidade)}</select>` : ""}
      <div class="com-linha com-linha--fim"><a class="com-acao" href="#u=${eu.uid}">${t("ver_publico")}</a>${eu.professor || eu.admin ? `<a class="com-acao" href="painel.html">${t("editar_pro")}</a>` : ""}<button class="com-pri" type="submit">${t("guardar_perfil")}</button></div></form>` : ""}
    <section class="com-cartao com-novo"><h3>${t("privacidade_t")}</h3>
      <label class="com-chk com-chk--bloco"><input type="checkbox" data-a="mostrar-comunidades" ${eu.mostrarComunidades ? "checked" : ""}><span>${t("mostrar_com_l")}<small class="com-suave">${t("mostrar_com_d2")}</small></span></label>
      <div class="com-sel"><label class="com-peq com-suave" for="com-qe">${t("quem_escreve_l")}</label><select id="com-qe" class="com-campo" data-a="quem-escreve">${["todos", "professores", "ninguem"].map((v) => `<option value="${v}" ${eu.quemEscreve === v ? "selected" : ""}>${t("qe_" + v)}</option>`).join("")}</select></div></section>
    ${eu.professor && S.seguidoresN !== null ? `<section class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.pessoa}</span><div class="com-quem com-quem--larga"><strong>${esc(t(S.seguidoresN === 1 ? "seg_1" : "seg_n", { n: S.seguidoresN }))}</strong><span>${t("seg_privado")}</span></div></section>` : ""}
    <section class="com-cartao com-novo"><h3>${t("meus_dados")}</h3><p class="com-suave">${t("meus_dados_d")}</p>
      <div class="com-linha"><button class="com-opt" type="button" data-a="exportar">${t("exportar")}</button>${eu.admin ? "" : `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-tudo">${t("sair_apagar")}</button>`}</div></section>
    <section class="com-cartao com-novo"><h3>${t("q2_t")}</h3>${cuidados()}</section>`;
}
/** Perfil único: quem tem página profissional vê aqui um resumo e edita tudo no painel. Aqui fica só a cidade da comunidade. */
function perfilNoPainel(eu) {
  return `<section class="com-cartao com-novo com-perfil-unico">
      <div class="com-linha"><span class="com-foto com-foto--g">${eu.foto ? `<img src="${esc(eu.foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</span>
        <div class="com-quem com-quem--larga"><strong>${esc(eu.nome)}</strong>${eu.usuario ? `<span>@${esc(eu.usuario)}</span>` : ""}${eu.bio ? `<span>${esc(eu.bio)}</span>` : ""}</div></div>
      <p class="com-suave com-peq">${t("perfil_unico_d")}</p>
      <div class="com-linha"><a class="com-pri" href="painel.html?ir=perfil#ajustes">${IC.editar} ${t("perfil_unico_editar")}</a><a class="com-acao" href="${esc(S.minhaPagina)}">${t("ver_publico")}</a></div>
    </section>
    ${S.cidades.length ? `<form class="com-cartao com-novo" data-f="cidade-com"><label for="com-pc">${t("cid_entrada_l")}</label><select id="com-pc" class="com-campo" name="cidade">${opcoesCidades(eu.cidade)}</select><div class="com-linha com-linha--fim"><button class="com-pri" type="submit">${t("guardar_perfil")}</button></div></form>` : ""}`;
}
/** Troca só a imagem, sem redesenhar o formulário (o que a pessoa já escreveu fica). */
function mostrarFotoPerfil() {
  const span = app.querySelector(".com-foto--g");
  if (span) span.innerHTML = S.fotoPerfil ? `<img src="${esc(S.fotoPerfil)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa;
}
/** O perfil de outra pessoa (ou o meu, como os outros o veem). */
function telaPessoa() {
  const p = S.pessoa, v = S.vida || {};
  if (!p || (p.estado !== "aprovado" && !S.eu.admin)) return `<div class="com-topo"><h1 class="com-h1">${t("perfil_nao")}</h1></div>`;
  const prof = p.papel === "professor" || p.papel === "admin";
  const eu = p.uid === S.eu.uid;
  const mostra = eu || p.mostrarComunidades !== false;
  const c = p.cidade ? cidadeDe(p.cidade) : null;
  const enc = (e) => { const d = `<strong>${esc(e.titulo)}</strong><span>${quando(e.quando)}${e.lugar ? " · " + esc(e.lugar) : (e.link ? " · " + t("pessoa_online") : "")}</span>`; return `<li>${e.cidade ? `<a class="com-pessoa-enc" href="#cidade=${esc(e.cidade)}">${d}</a>` : `<div class="com-pessoa-enc">${d}</div>`}</li>`; };
  const secao = (titulo, corpo) => `<section class="com-cartao com-novo"><h2 class="com-pessoa-h2">${titulo}</h2>${corpo}</section>`;
  return `<section class="com-cartao com-pessoa">
    <span class="com-foto com-foto--xg">${p.foto ? `<img src="${esc(p.foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</span>
    <h1 class="com-h1">${esc(p.nome || t("papel_membro"))}</h1>
    ${p.usuario ? `<p class="com-suave">@${esc(p.usuario)}</p>` : ""}
    ${v.pro?.profissao ? `<p class="com-pessoa-faz">${esc(v.pro.profissao)}</p>` : ""}
    <div class="com-linha com-pessoa-meta">${prof ? selo() : ""}${c && mostra ? `<a class="com-acao" href="#cidade=${c.id}">${IC.pin}${esc(c.nome)}</a>` : ""}</div>
    ${p.bio ? `<p class="com-pessoa-bio">${esc(p.bio)}</p>` : ""}
    ${(p.interesses || []).length ? `<div class="com-chips">${interessesDe(p.interesses)}</div>` : ""}
    <div class="com-linha com-pessoa-meta">${eu ? `<a class="com-opt" href="#perfil">${IC.editar} ${t("editar_perfil")}</a>` : `${prof ? botaoSeguir(p.uid) : ""}${podeEscrever(p) ? `<button class="com-opt" type="button" data-a="conversar" data-v="${esc(p.uid)}">${IC.conversa} ${t("msg_enviar")}</button>` : ""}`}${v.pro ? `<a class="com-pri" href="perfil.html?p=${encodeURIComponent(p.uid)}">${t("ver_pagina_pro")}</a>` : ""}</div>
  </section>
  ${(v.proximos || []).length || (v.passados || []).length ? secao(t("pessoa_encontros"), `${(v.proximos || []).length ? `<p class="com-regiao">${t("pessoa_proximos")}</p><ul class="com-pessoa-lista">${v.proximos.map(enc).join("")}</ul>` : ""}${(v.passados || []).length ? `<p class="com-regiao">${t("pessoa_passados")}</p><ul class="com-pessoa-lista com-pessoa-lista--passado">${v.passados.map(enc).join("")}</ul>` : ""}`) : ""}
  ${(v.fotos || []).length ? secao(t("pessoa_fotos"), `<div class="com-pessoa-fotos">${v.fotos.map((f) => `<a href="#p=${f.id}"><img src="${esc(f.imagem)}" alt="${esc((f.texto || "").slice(0, 80))}" loading="lazy"></a>`).join("")}</div>`) : ""}
  ${mostra && (c || (v.grupos || []).length) ? secao(t("pessoa_comunidades"), `<ul class="com-pessoa-lista">${c ? `<li><a class="com-pessoa-enc" href="#cidade=${c.id}"><strong>${esc(c.nome)}</strong><span>${t("pessoa_cidade")}</span></a></li>` : ""}${(v.grupos || []).map((g) => `<li><a class="com-pessoa-enc" href="#g=${g.id}"><strong>${esc(g.nome)}</strong><span>${g.tipo === "aberto" ? t("pessoa_grupo_aberto") : t("pessoa_grupo_privado")}</span></a></li>`).join("")}</ul>${eu && !p.mostrarComunidades ? "" : ""}`) : ""}
  ${!mostra ? `<p class="com-suave com-peq com-centro">${t("pessoa_comunidades_ocultas")}</p>` : ""}`;
}

/* ---------- Foto da prática ----------
   Padrão único para todas as fotos: corte ao centro em 4:3, 960×720, JPEG.
   Fica pequena o bastante para ir no próprio documento (regra: até 200 000 caracteres),
   sem precisar do Storage. O tom final (filtro quente) é dado no CSS, em .com-imagem. */
/** A foto de perfil: um quadrado pequeno (cabe na ficha, ≤ 30 000 caracteres). */
async function reduzirAvatar(ficheiro) {
  const img = await createImageBitmap(ficheiro);
  const lado = Math.min(img.width, img.height);
  for (const [L, q] of [[192, 0.8], [160, 0.72], [128, 0.65]]) {
    const tela = Object.assign(document.createElement("canvas"), { width: L, height: L });
    tela.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, L, L);
    const url = tela.toDataURL("image/jpeg", q);
    if (url.length <= 29000) { img.close?.(); return url; }
  }
  img.close?.();
  throw new Error("foto");
}
async function reduzirFoto(ficheiro) {
  const img = await createImageBitmap(ficheiro);
  const tentar = (L, A, q) => {
    const tela = Object.assign(document.createElement("canvas"), { width: L, height: A });
    const alvo = L / A, prop = img.width / img.height;
    const sw = prop > alvo ? img.height * alvo : img.width, sh = prop > alvo ? img.height : img.width / alvo;
    tela.getContext("2d").drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, L, A);
    return tela.toDataURL("image/jpeg", q);
  };
  for (const [L, A, q] of [[960, 720, 0.72], [960, 720, 0.6], [800, 600, 0.55], [640, 480, 0.5]]) {
    const url = tentar(L, A, q);
    if (url.startsWith("data:image/jpeg;base64,") && url.length <= 195000) { img.close?.(); return url; }
  }
  img.close?.();
  throw new Error("foto grande demais");
}
/** Abre ou fecha o campo de publicar sem redesenhar a página (o texto escrito não se perde). */
function comporAberto(sim) {
  S.comporAberto = sim;
  const f = document.querySelector("form.com-compor");
  if (!f) return;
  f.classList.toggle("is-aberto", sim);
  f.querySelector(".com-compor-abrir").hidden = sim;
  f.querySelector(".com-compor-corpo").hidden = !sim;
  if (sim) f.querySelector("textarea").focus();
  else { f.reset(); f.querySelector(".com-compor-abrir").focus(); }
}
function mostrarPrevia() {
  const caixa = document.getElementById("com-previa");
  if (!caixa) return;
  caixa.hidden = !S.novaFoto;
  caixa.querySelector("img").src = S.novaFoto || "";
}

/* ---------- A Terra ----------
   Uma só Terra para a página toda: a porta (visitantes) e o topo de "Todas as cidades".
   O HTML da página é redesenhado a cada mudança; o globo não: cada desenho deixa um lugar
   vazio (data-terra) e o mesmo elemento muda-se para lá, sem perder a rotação nem o zoom. */
let GLOBO = null;
function globo() {
  if (GLOBO) return GLOBO;
  const fora = !S.user || S.eu?.estado !== "aprovado";
  GLOBO = criarTerra({
    cidades: dados.CIDADES_INICIAIS, paises: dados.PAISES_GLOBO, aberta: cidadeAberta,
    inicio: fora ? { lon: -75, lat: 5, zoom: 0.7 } : { lon: -20, lat: 25, zoom: 1.05 },
    chegada: fora && !S.paisEscolhido ? { lon: -20, lat: 25, zoom: 1.05 } : null,
    vista: { lon: -20, lat: 25, zoom: 1.05 },
    rotulos: { aria: t("globo_aria"), dica: t("globo_dica"), mais: t("globo_mais"), menos: t("globo_menos"), inicio: t("globo_inicio") },
    aoEscolherPais: (p) => escolherNoGlobo(p, ""),
    aoEscolherCidade: (id) => escolherNoGlobo(dados.CIDADES_INICIAIS.find((c) => c.id === id)?.pais || "", id),
    aoLimpar: () => escolherNoGlobo("", "")
  });
  // Quem já tinha escolhido (e recarregou a página) volta a ver a sua escolha, sem a viagem de chegada.
  if (fora && S.cidadeEscolhida) GLOBO.escolherCidade(S.cidadeEscolhida);
  else if (fora && PAISES.includes(S.paisEscolhido)) GLOBO.escolherPais(S.paisEscolhido);
  return GLOBO;
}
function escolherNoGlobo(pais, cidade) {
  if (!S.user || S.eu?.estado !== "aprovado") {
    S.paisEscolhido = pais; S.cidadeEscolhida = cidade; S.semCidade = false; guardarEscolha(); desenhar();
  } else {
    S.paisAberto = pais; S.cidadeMarcada = cidade; desenhar();
    if (cidade) document.querySelector(`.com-cid-linha[data-cid="${cidade}"]`)?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
}
function montarGlobo() {
  const lugar = app.querySelector("[data-terra]");
  if (lugar) lugar.replaceWith(globo().el);
}

/* ---------- Desenhar ---------- */
function desenhar() {
  if (!S.pronto) { app.innerHTML = `<p class="com-suave com-centro com-espera">${t("um_momento")}</p>`; return; }
  if (S.erro) { app.innerHTML = `<main class="com-entrada">${capa()}<section class="com-cartao"><h2>${t("ligando")}</h2><p class="com-suave">${esc(t(S.erro))}</p><div class="com-linha"><a class="com-opt" href="library.html">${t("ir_biblioteca")}</a></div></section></main>`; return; }
  if (!S.user || S.eu.estado !== "aprovado") { app.classList.remove("com-pagina--app"); app.innerHTML = telaFora(); montarGlobo(); return; }
  const { chave } = rota();
  const tela = { c: "circulo", "": "circulo", p: "partilha", grupos: "grupos", g: "grupo", gestao: "gestao", perfil: "perfil", u: "pessoa", mensagens: "mensagens", m: "conversa", cidades: "cidades", cidade: "cidade" }[chave] || "circulo";
  const meio = { circulo: telaCirculo, partilha: telaPartilha, grupos: telaGrupos, grupo: telaGrupo, gestao: () => (S.eu.admin ? telaGestao() : telaCirculo()), perfil: telaPerfil, pessoa: telaPessoa, mensagens: telaMensagens, conversa: telaConversa, cidades: telaCidades, cidade: telaCidade }[tela]();
  app.classList.add("com-pagina--app");
  app.innerHTML = `<div class="com-lay">${lateral(tela)}<main class="com-meio">${meio}</main>${direita(tela)}</div>`;
  mostrarPrevia();
  montarGlobo();
  if (tela === "grupo" || tela === "conversa") rolarConversa();
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
      if (S.aberto) { S.muralId = S.aberto.circulo; if (!cidadeDe(S.aberto.circulo)) S.circuloId = S.aberto.circulo; S.respostas = await dados.respostas(valor); await carregarRessoou([S.aberto]); }
    } else if (chave === "grupos") {
      S.grupos = await dados.grupos(S.eu);
    } else if (chave === "g") {
      S.grupo = await dados.grupo(valor).catch(() => null);
      S.msgs = [];
      if (S.grupo && !S.grupo.vitrine) {
        if (S.eu.admin || S.grupo.criador === S.eu.uid) S.pessoas = await dados.membrosAprovados().catch(() => []);
        pararConversa = dados.ouvirMensagens(valor, (m) => {
          S.msgs = m;
          const caixa = document.getElementById("com-msgs");
          if (caixa) { caixa.innerHTML = mensagens(); rolarConversa(); }
        }, () => {});
      }
    } else if (chave === "gestao" && S.eu.admin) {
      const [membros, convites, denuncias, anfitriao, conversasDen] = await Promise.all([dados.membros(), dados.convites(), dados.denunciadas(), dados.pedidosAnfitriao().catch(() => []), dados.conversasDenunciadas().catch(() => [])]);
      S.gestao = { membros, convites, denuncias, anfitriao, conversasDen };
    } else if (chave === "cidades") {
      if (S.eu.admin) S.pedidosCidade = await dados.pedidosPorCidade().catch(() => ({}));
      S.jaPediAnfitriao = await dados.jaPediAnfitriao();
    } else if (chave === "cidade") {
      S.cidadeId = valor;
      S.cidadeInfo = { pendentes: [], anfitrioes: [], jaPedi: false };
      const c = cidadeDe(valor);
      if (c) {
        S.cidadeInfo.anfitrioes = await dados.nomesDe(c.anfitrioes).catch(() => []);
        if (c.estado === "aberta") {
          S.muralId = c.id;
          S.posts = await dados.partilhas(c.id);
          await carregarRessoou(S.posts);
          S.grupos = await dados.grupos(S.eu).catch(() => []);
        } else {
          S.cidadeInfo.jaPedi = await dados.jaPedi(c.id);
          S.jaPediAnfitriao = await dados.jaPediAnfitriao();
        }
        if (aberto(c)) S.cidadeInfo.pendentes = await dados.pendentesDaCidade(c.id).catch(() => []);
        if (S.eu.admin) {
          S.pessoas = await dados.membrosAprovados().catch(() => []);
          S.cidadeInfo.convites = (await dados.convites().catch(() => [])).filter((cv) => cv.cidade === c.id && cv.anfitriao);
        }
      }
    } else if (chave === "escrever") {
      // Vindo do botão "Mensagem" da página de um profissional: abre (ou cria) a conversa.
      const outro = valor === "lucas" ? (await dados.lerPerfilLucasUid().catch(() => "")) : valor;
      if (outro && outro !== S.eu.uid) {
        let id = "";
        if (await tentar(async () => { id = await dados.abrirConversa(outro); }, t("msg_nao_pode")) && id) { location.replace("#m=" + id); return; }
      }
      location.replace("#mensagens"); return;
    } else if (chave === "u") {
      // Perfil único: quem tem página profissional é visto lá (agenda, depoimentos, comunidade e mensagem).
      const pagina = await dados.paginaDe(valor).catch(() => "");
      if (pagina) { location.replace(pagina); return; }
      S.pessoa = await dados.membro(valor).catch(() => null);
      S.vida = S.pessoa ? await dados.vidaDe(valor, await dados.grupos(S.eu).catch(() => [])).catch(() => null) : null;
    } else if (chave === "mensagens") {
      [S.convs, S.pessoas] = await Promise.all([dados.conversas().catch(() => []), dados.membrosAprovados().catch(() => [])]);
    } else if (chave === "m") {
      S.conv = await dados.conversa(valor).catch(() => null);
      S.msgs = [];
      if (S.conv) {
        const outro = S.conv.membros.find((x) => x !== S.eu.uid) || S.conv.membros[0];
        S.convOutro = await dados.membro(outro).catch(() => null);
        if (S.conv.novaPara === S.eu.uid) { await dados.marcarLida(valor).catch(() => {}); S.conv.novaPara = ""; S.convs = (S.convs || []).map((c) => (c.id === valor ? { ...c, novaPara: "" } : c)); }
        pararConversa = dados.ouvirConversa(valor, (m) => {
          S.msgs = m;
          const caixa = document.getElementById("com-msgs");
          if (caixa) { caixa.innerHTML = mensagensDiretas(); rolarConversa(); }
        }, () => {});
      }
    } else if (chave === "perfil") {
      // Quem tem página profissional edita o perfil num só lugar: o painel.
      S.minhaPagina = await dados.paginaDe(S.eu.uid).catch(() => "");
      S.seguidoresN = S.eu.professor ? await dados.contarSeguidores().catch(() => null) : null;
    } else {
      S.circuloId = chave === "c" && S.circulos.some((c) => c.id === valor) ? valor : (S.circulos[0]?.id || "");
      S.muralId = S.circuloId;
      S.posts = S.circuloId ? await dados.partilhas(S.circuloId) : [];
      await carregarRessoou(S.posts);
    }
  } catch (e) { console.error(e); aviso(t("erro_carregar")); }
  desenhar();
}
async function carregarLados() {
  const [canal, encontros] = await Promise.all([dados.canal().catch(() => []), dados.encontros().catch(() => [])]);
  S.canal = canal; S.encontros = encontros;
  S.convs = await dados.conversas().catch(() => []);
  S.apoio = await dados.lerApoio().catch(() => null);
  // Perfil único: o @ chega à página profissional (neuromedit.com/@nome), sem esperar por uma nova gravação.
  if (S.eu.usuario) dados.sincronizarPaginaPro(S.eu, S.eu.usuario).catch(() => {});
}
async function arrancar(user) {
  S.user = user; S.erro = "";
  try {
    S.eu = user ? await dados.carregarEu() : null;
    // As cidades leem-se sempre: a porta mostra quais já estão abertas a quem ainda não entrou.
    [S.circulos, S.cidades] = await Promise.all([user ? dados.circulos().catch(() => []) : [], dados.cidades().catch(() => [])]);
    if (S.eu?.estado === "aprovado") {
      await carregarLados();
      S.seguindo = await dados.quemSigo().catch(() => []);
      if (S.eu.admin) S.gestao.membros = await dados.membros().catch(() => []);
    }
  } catch (e) {
    console.error(e);
    S.erro = "erro_volte";
  }
  S.pronto = true;
  await carregarRota();
}
const recarregar = async () => { S.eu = await dados.carregarEu(); [S.circulos, S.cidades] = await Promise.all([dados.circulos().catch(() => []), dados.cidades().catch(() => [])]); await carregarLados(); if (S.eu.admin) S.gestao.membros = await dados.membros().catch(() => []); await carregarRota(); };

/* ---------- Ações (cliques) ---------- */
const ACOES = {
  login: () => tentar(() => dados.entrar(), t("erro_login")),
  motivo: (v) => { S.motivos[v] = !S.motivos[v]; desenhar(); },
  aceitar: (v, el) => { S.aceito = el.checked; desenhar(); },
  pedir: async () => {
    const anf = S.eu.conviteAnfitriao ? S.eu.conviteCidade : "";
    const nomeCid = anf ? cidadeDe(anf)?.nome || "" : "";
    if (!await tentar(() => dados.pedirEntrada({ nome: S.eu.nome, motivos: Object.keys(S.motivos).filter((k) => S.motivos[k]), convidado: S.eu.convidado, cidade: S.cidadeEscolhida, anfitriaoDe: anf }))) return;
    if (anf) { location.hash = `#cidade=${anf}`; await arrancar(S.user); aviso(t("a_agora_anf", { c: nomeCid })); } else await arrancar(S.user);
  },
  "escolher-cidade": (_, el) => { S.cidadeEscolhida = el.value; guardarEscolha(); },
  "porta-pais": (v) => {
    S.paisEscolhido = v; S.cidadeEscolhida = ""; S.semCidade = false; guardarEscolha();
    if (v && v !== "outro") globo().escolherPais(v); else globo().limpar();
    desenhar(); focarPasso();
  },
  "porta-cidade": (v) => {
    S.cidadeEscolhida = v; S.semCidade = !v; guardarEscolha();
    if (v) globo().escolherCidade(v);
    desenhar(); focarPasso();
  },
  "porta-cidade-trocar": () => { S.cidadeEscolhida = ""; S.semCidade = false; guardarEscolha(); if (S.paisEscolhido) globo().escolherPais(S.paisEscolhido); desenhar(); focarPasso(); },
  "abrir-pais": (v, el) => {
    const abrir = el.getAttribute("aria-expanded") !== "true";
    S.paisAberto = abrir ? v : ""; S.cidadeMarcada = "";
    app.querySelectorAll(".com-pais").forEach((p) => {
      const on = abrir && p.dataset.pais === v;
      p.querySelector(".com-pais-btn").setAttribute("aria-expanded", on);
      p.querySelector(".com-pais-corpo").classList.toggle("is-on", on);
      p.querySelector(".com-pais-corpo").inert = !on;
    });
    if (abrir) globo().escolherPais(v); else globo().limpar();
  },
  "acrescentar-cidades": async () => { if (await tentar(() => dados.acrescentarCidades(S.cidades))) { S.cidades = await dados.cidades(); aviso(t("a_cidades_acrescentadas")); desenhar(); } },
  "minha-cidade": async (v) => { if (await tentar(() => dados.guardarPerfil({ cidade: v }))) { S.eu.cidade = v; aviso(t("a_cidade", { c: cidadeDe(v)?.nome || "" })); desenhar(); } },
  "pedir-cidade": async (v) => { if (await tentar(() => dados.pedirCidade(v))) { S.cidadeInfo.jaPedi = true; aviso(t("a_pedido_cidade")); desenhar(); } },
  "semear-cidades": async () => { if (await tentar(() => dados.semearCidades())) { S.cidades = await dados.cidades(); aviso(t("a_cidades_criadas")); ir("#cidades"); } },
  "fechar-cidade": async (v) => {
    const c = cidadeDe(v);
    if (!await confirmar({ titulo: t("c_fechar_t", { c: c.nome }), texto: t("c_fechar_d"), botao: t("cid_fechar") })) return;
    if (await tentar(() => dados.definirAnfitrioes(v, []))) { S.cidades = await dados.cidades(); await carregarRota(); }
  },
  "cancelar-pedido": async () => { if (await confirmar({ titulo: t("c_pedido_t"), texto: t("c_pedido_d"), botao: t("c_pedido_b") }) && await tentar(() => dados.apagarTudoOQueEMeu())) await arrancar(S.user); },
  semear: async () => { if (await tentar(() => dados.semearCirculos())) { aviso(t("a_circulos_criados")); await recarregar(); } },
  ressoou: async (v) => { const novo = !S.ressoou[v]; if (await tentar(() => dados.marcarRessoou(v, novo))) { S.ressoou[v] = novo; desenhar(); } },
  editar: (v) => { S.editando = v; desenhar(); document.getElementById("com-ed")?.focus(); },
  "cancelar-edicao": () => { S.editando = ""; desenhar(); },
  "denunciar-resposta": async (v) => { if (await tentar(() => dados.denunciarResposta(S.aberto.id, v))) { aviso(t("a_denuncia")); await carregarRota(); } },
  "manter-resposta": async (v) => { if (await tentar(() => dados.manterResposta(S.aberto.id, v))) { aviso(t("a_mantida")); await carregarRota(); } },
  "focar-comentario": () => { const c = document.getElementById("com-resp"); if (c) { c.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); c.focus({ preventScroll: true }); } },
  "tirar-anfitriao": async (v) => {
    const c = cidadeDe(S.cidadeId); if (!c) return;
    const nome = S.cidadeInfo.anfitrioes.find((a) => a.id === v)?.nome || "";
    if (!await confirmar({ titulo: t("c_tirar_anf_t", { n: nome }), texto: t("c_tirar_anf_d", { n: nome, c: c.nome }), botao: t("anf_tirar") })) return;
    if (await tentar(() => dados.definirAnfitrioes(c.id, (c.anfitrioes || []).filter((x) => x !== v)))) { S.cidades = await dados.cidades(); await carregarRota(); }
  },
  "copiar-convite": async (v) => {
    const c = cidadeDe(S.cidadeId);
    const msg = t("anf_msg", { c: c?.nome || "", e: v });
    try { await navigator.clipboard.writeText(msg); aviso(t("a_copiado")); } catch { window.prompt(t("anf_copiar"), msg); }
  },
  denunciar: async (v) => { if (await tentar(() => dados.denunciar(v))) { aviso(t("a_denuncia")); await carregarRota(); } },
  manter: async (v) => { if (await tentar(() => dados.manterPartilha(v))) { aviso(t("a_mantida")); await carregarRota(); } },
  "apagar-partilha": async (v) => {
    if (!await confirmar({ titulo: t("c_partilha_t"), texto: t("c_partilha_d"), botao: t("c_partilha_b") })) return;
    if (await tentar(() => dados.apagarPartilha(v))) { aviso(t("a_partilha_apagada")); if (rota().chave === "p") ir(hashDoMural(S.muralId)); else await carregarRota(); }
  },
  "apagar-resposta": async (v) => {
    if (!await confirmar({ titulo: t("c_resposta_t"), texto: t("c_resposta_d"), botao: t("c_resposta_b") })) return;
    if (await tentar(() => dados.apagarResposta(S.aberto.id, v))) { aviso(t("a_resposta_apagada")); await carregarRota(); }
  },
  "foto-perfil": async (_, el) => {
    const f = el.files?.[0]; el.value = "";
    if (!f) return;
    try { S.fotoPerfil = await reduzirAvatar(f); mostrarFotoPerfil(); } catch { aviso(t("foto_erro")); }
  },
  "tirar-apoio": async () => { if (confirm(t("apoio_tirar_q")) && await tentar(() => dados.tirarApoio())) { S.apoio = null; desenhar(); } },
  "msg-acoes": (_, el) => { const on = !el.classList.contains("is-acoes"); app.querySelectorAll(".com-msg.is-acoes").forEach((x) => x.classList.remove("is-acoes")); el.classList.toggle("is-acoes", on); },
  "abrir-lugares": () => { S.esqAberta = true; desenhar(); app.querySelector('[data-a="fechar-lugares"]')?.focus(); },
  "fechar-lugares": () => { S.esqAberta = false; desenhar(); app.querySelector('[data-a="abrir-lugares"]')?.focus(); },
  "quem-escreve": async (_, el) => { if (await tentar(() => dados.guardarQuemEscreve(el.value))) { S.eu.quemEscreve = el.value; aviso(t("a_perfil")); } },
  conversar: async (v) => { let id = ""; if (await tentar(async () => { id = await dados.abrirConversa(v); }, t("msg_nao_pode")) && id) location.hash = "m=" + id; },
  "aceitar-conversa": async (v) => { if (await tentar(() => dados.aceitarConversa(v))) { aviso(t("msg_aceite")); await carregarRota(); } },
  "bloquear-conversa": async (v) => { if (confirm(t("msg_bloquear_q")) && await tentar(() => dados.bloquearConversa(v))) { aviso(t("msg_bloqueada")); await carregarRota(); } },
  "desbloquear-conversa": async (v) => { if (await tentar(() => dados.desbloquearConversa(v))) await carregarRota(); },
  "denunciar-conversa": async (v) => { if (confirm(t("msg_denunciar_q")) && await tentar(() => dados.denunciarConversa(v, S.conv?.estado === "bloqueada"))) { aviso(t("msg_denunciada")); await carregarRota(); } },
  "arquivar-conversa": async (v) => { if (await tentar(() => dados.arquivarDenuncia(v))) await carregarRota(); },
  "apagar-dm": async (v) => { if (await tentar(() => dados.apagarMensagemDireta(S.conv.id, v))) aviso(t("msg_apagada")); },
  "mostrar-comunidades": async (_, el) => { if (await tentar(() => dados.guardarMostrarComunidades(el.checked))) { S.eu.mostrarComunidades = el.checked; aviso(t("a_perfil")); } },
  "foto-google": () => { S.fotoPerfil = S.eu.fotoGoogle; mostrarFotoPerfil(); },
  foto: async (_, el) => {
    const f = el.files?.[0]; el.value = "";
    if (!f) return;
    try { S.novaFoto = await reduzirFoto(f); mostrarPrevia(); } catch { aviso(t("foto_erro")); }
  },
  "tirar-foto": () => { S.novaFoto = ""; mostrarPrevia(); },
  "abrir-compor": () => comporAberto(true),
  "fechar-compor": () => { S.novaFoto = ""; mostrarPrevia(); comporAberto(false); },
  "apagar-circulo": async (v) => {
    const c = circ(S.circulos.find((x) => x.id === v));
    if (!await confirmar({ titulo: t("c_circulo_t"), texto: t("c_circulo_d", { n: c.nome }), botao: t("c_circulo_b"), nome: c.nome })) return;
    if (await tentar(() => dados.apagarCirculo(v))) { aviso(t("a_circulo_apagado")); S.circulos = await dados.circulos(); ir("#"); }
  },
  "entrar-grupo": async (v) => { if (await tentar(() => dados.entrarNoGrupo(v))) ir(`#g=${v}`); },
  "sair-grupo": async (v) => { if (await confirmar({ titulo: t("c_sair_t"), texto: t("c_sair_d"), botao: t("c_sair_b") }) && await tentar(() => dados.sairDoGrupo(v, S.grupo?.tipo || (S.grupos || []).find((g) => g.id === v)?.tipo))) ir("#grupos"); },
  "tirar-do-grupo": async (v) => { if (await tentar(() => dados.tirarDoGrupo(S.grupo.id, v, S.grupo.tipo))) await carregarRota(); },
  "apagar-grupo": async (v) => {
    const g = S.grupos.find((x) => x.id === v);
    if (!await confirmar({ titulo: t("c_grupo_t"), texto: t("c_grupo_d", { n: g.nome }), botao: t("c_grupo_b"), nome: g.nome })) return;
    if (await tentar(() => dados.apagarGrupo(v))) { aviso(t("a_grupo_apagado")); await carregarRota(); }
  },
  "apagar-mensagem": async (v) => { if (await confirmar({ titulo: t("c_msg_t"), texto: t("c_msg_d"), botao: t("c_msg_b") })) await tentar(() => dados.apagarMensagem(S.grupo.id, v)); },
  "apagar-canal": async (v) => { if (await confirmar({ titulo: t("c_aviso_t"), texto: t("c_aviso_d"), botao: t("c_aviso_b") }) && await tentar(() => dados.apagarDoCanal(v))) { await carregarLados(); desenhar(); } },
  "apagar-encontro": async (v) => { if (await confirmar({ titulo: t("c_enc_t"), texto: t("c_enc_d"), botao: t("c_enc_b") }) && await tentar(() => dados.apagarEncontro(v))) { await carregarLados(); desenhar(); } },
  lugar: async (v) => { const e = S.encontros.find((x) => x.id === v); const novo = !e.guardado; if (await tentar(() => dados.guardarLugar(v, novo))) { e.guardado = novo; e.vao = Math.max(0, (e.vao || 0) + (novo ? 1 : -1)); aviso(novo ? t("a_lugar_guardado") : t("a_lugar_libertado")); desenhar(); } },
  seguir: async (v) => { const sim = !S.seguindo.includes(v); if (await tentar(() => dados.seguir(v, sim))) { S.seguindo = sim ? [...S.seguindo, v] : S.seguindo.filter((x) => x !== v); aviso(t(sim ? "a_seguindo" : "a_deixou")); desenhar(); } },
  "apagar-pedido-anf": async (v) => { if (await tentar(() => dados.apagarPedidoAnfitriao(v))) await carregarRota(); },
  aprovar: async (v) => {
    const m = S.cidadeInfo.pendentes.find((x) => x.id === v);
    const c = rota().chave === "cidade" ? cidadeDe(S.cidadeId) : null;
    if (await tentar(() => dados.aprovar(v))) { aviso(t("a_aprovado")); await recarregar(); if (m && c) boasVindas(m, c); }
  },
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
    if (await tentar(() => dados.publicar({ circulo: S.muralId, texto, pratica: d.get("pratica"), anon: d.get("anon") === "on", nome: S.eu.nome, foto: fotoCurta(S.eu.foto), imagem: S.novaFoto, professor: S.eu.professor && d.get("anon") !== "on" }))) { S.novaFoto = ""; S.comporAberto = false; aviso(t("a_publicada")); await carregarRota(); }
  },
  editar: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.editarPartilha(f.dataset.v, texto))) { aviso(t("a_editada")); await carregarRota(); } },
  responder: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.responder(S.aberto, { texto, nome: S.eu.nome, professor: S.eu.professor, foto: fotoCurta(S.eu.foto) }))) { aviso(t("a_resposta")); await carregarRota(); } },
  "novo-circulo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarCirculo({ nome: d.get("nome").trim(), proposito: d.get("proposito").trim() }); })) { aviso(t("a_circulo_criado")); S.circulos = await dados.circulos(); ir(`#c=${id}`); } },
  "novo-grupo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarGrupo({ nome: d.get("nome").trim(), tipo: d.get("tipo"), cidade: f.dataset.cidade || "" }); })) ir(`#g=${id}`); },
  "pedir-outra": async (f) => { const nome = new FormData(f).get("nome").trim(); const id = slug(nome); if (id && await tentar(() => dados.pedirCidade(id, nome))) { f.reset(); aviso(t("a_pedido_cidade")); } },
  "abrir-cidade": async (f) => {
    const c = cidadeDe(f.dataset.v); const novo = new FormData(f).get("anfitriao");
    if (c && novo && await tentar(() => dados.definirAnfitrioes(c.id, [...(c.anfitrioes || []), novo]))) { S.cidades = await dados.cidades(); aviso(t("a_cidade_aberta", { c: c.nome })); await carregarRota(); }
  },
  "por-no-grupo": async (f) => { if (await tentar(() => dados.porNoGrupo(S.grupo, new FormData(f).get("pessoa")))) await carregarRota(); },
  apoio: async (f) => { const d = new FormData(f); const v = { quem: d.get("quem").trim(), titulo: d.get("titulo").trim(), texto: d.get("texto").trim(), link: d.get("link").trim() }; if (await tentar(() => dados.guardarApoio(v))) { S.apoio = { ...v, ativo: true }; aviso(t("apoio_ok")); desenhar(); } },
  dm: async (f) => { const campo = f.elements.texto; const texto = campo.value.trim(); if (!texto || !S.conv) return; campo.value = ""; if (await tentar(() => dados.escrever(S.conv, { texto, nome: S.eu.nome }))) { S.conv.ultimaPor = S.eu.uid; } else campo.value = texto; campo.focus(); },
  mensagem: async (f) => { const campo = f.elements.texto; const texto = campo.value.trim(); if (!texto) return; campo.value = ""; if (!await tentar(() => dados.enviarMensagem(S.grupo.id, { texto, nome: S.eu.nome }))) campo.value = texto; campo.focus(); },
  canal: async (f) => { const d = new FormData(f); const titulo = d.get("titulo").trim(); if (await tentar(() => dados.publicarNoCanal({ titulo, texto: d.get("texto").trim(), nome: S.eu.nome }))) { await carregarLados(); desenhar(); dados.avisarSeguidores(t("av_seg_aviso", { n: S.eu.nome, a: titulo }), "comunidade.html"); } },
  "pedir-anfitriao": async (f) => {
    const d = new FormData(f); const cidade = (f.dataset.cidade || d.get("cidade") || "").trim(); const sobre = String(d.get("sobre") || "").trim();
    if (cidade && sobre && await tentar(() => dados.pedirAnfitriao({ cidade, nome: S.eu.nome, sobre }))) { S.jaPediAnfitriao = true; aviso(t("a_anf_enviado")); desenhar(); }
  },
  encontro: async (f) => {
    const d = new FormData(f); const data = new Date(d.get("quando"));
    if (Number.isNaN(data.getTime())) return aviso(t("a_dia_hora"));
    const cidade = f.dataset.cidade || "";
    const lugar = String(d.get("lugar") || "").trim(); const link = String(d.get("link") || "").trim();
    // Na cidade: presencial (lugar) ou online (Meet). Fora da cidade: só online.
    if (!lugar && !/^https:\/\/meet\.google\.com\/.+/.test(link)) return aviso(t(cidade ? "a_lugar_ou_link" : "e_meet"));
    const titulo = d.get("titulo").trim();
    if (await tentar(() => dados.criarEncontro({ titulo, quando: data, link, lugar, cidade, nome: S.eu.nome, repete: d.get("repete") === "on" }), t("e_meet"))) {
      aviso(t("a_enc_marcado")); await carregarLados(); desenhar();
      dados.avisarSeguidores(t("av_seg_enc", { n: S.eu.nome, e: titulo }), cidade ? `comunidade.html#cidade=${cidade}` : "comunidade.html");
    }
  },
  "convidar-anfitriao": async (f) => {
    const c = cidadeDe(f.dataset.v); const email = String(new FormData(f).get("email") || "").trim();
    if (c && email && await tentar(() => dados.convidar(email, { cidade: c.id, anfitriao: true }))) { aviso(t("a_convite_anf", { e: email, c: c.nome })); await carregarRota(); }
  },
  convidar: async (f) => { const email = new FormData(f).get("email").trim(); if (await tentar(() => dados.convidar(email))) { aviso(t("a_convite", { e: email })); await carregarRota(); } },
  "cidade-com": async (f) => {
    const cidade = new FormData(f).get("cidade") || "";
    const e = S.eu;
    if (await tentar(() => dados.guardarPerfilCompleto(e, { nome: e.nome, cidade, usuario: e.usuario, bio: e.bio, interesses: e.interesses }))) { aviso(t("a_perfil")); await recarregar(); }
  },
  perfil: async (f) => {
    const d = new FormData(f), nome = d.get("nome").trim(), usuario = (d.get("usuario") || "").trim().toLowerCase().replace(/^@/, "");
    if (!nome) return;
    if (usuario && !dados.USUARIO_OK.test(usuario)) { aviso(t("usuario_invalido")); return; }
    if (usuario && usuario !== S.eu.usuario && !(await dados.usuarioLivre(usuario).catch(() => false))) { aviso(t("usuario_ocupado")); return; }
    const p = { nome, cidade: d.get("cidade") || "", usuario, bio: (d.get("bio") || "").trim(), interesses: d.getAll("interesses") };
    if (S.fotoPerfil !== undefined) p.foto = S.fotoPerfil;
    if (await tentar(() => dados.guardarPerfilCompleto(S.eu, p))) { S.fotoPerfil = undefined; aviso(t("a_perfil")); await recarregar(); }
  }
};

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el || el.tagName === "INPUT" || el.tagName === "SELECT") return;
  ACOES[el.dataset.a]?.(el.dataset.v, el);
});
app.addEventListener("change", (e) => { const el = e.target.closest("input[data-a], select[data-a]"); if (el) ACOES[el.dataset.a]?.(el.dataset.v, el); });
app.addEventListener("submit", (e) => { const f = e.target.closest("form[data-f]"); if (!f) return; e.preventDefault(); FORMS[f.dataset.f]?.(f); });
document.addEventListener("click", (e) => { document.querySelectorAll("details.com-menu[open]").forEach((d) => { if (!d.contains(e.target)) d.open = false; }); });
app.addEventListener("input", (e) => { const c = e.target; if (c.matches?.(".com-campo--balao")) { c.style.height = "auto"; c.style.height = `${c.scrollHeight}px`; } });
app.addEventListener("keydown", (e) => {
  const c = e.target;
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing && c.matches?.(".com-campo--balao") && matchMedia("(hover: hover) and (pointer: fine)").matches) { e.preventDefault(); c.form?.requestSubmit(); }
});
window.addEventListener("hashchange", () => { S.esqAberta = false; carregarRota(); });
// Painel "onde estou" (telemóvel): fecha com Escape e ao escolher um destino (mesmo que seja a página onde já está).
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S.esqAberta) ACOES["fechar-lugares"](); });
app.addEventListener("click", (e) => { if (S.esqAberta && e.target.closest(".com-esq.is-aberta a[href]")) { S.esqAberta = false; if (e.target.closest("a").getAttribute("href") === location.hash) desenhar(); } });
// Ao trocar de língua, redesenha (sem recarregar os dados). Numa conversa aberta, só o que é texto da página muda.
window.addEventListener("neuromedit:languagechange", () => { if (!document.getElementById("com-confirmar").open) desenhar(); });

desenhar();
dados.observarSessao(arrancar);
