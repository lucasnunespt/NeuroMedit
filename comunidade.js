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
const MOTIVOS = [["sono", "Dormir melhor"], ["calma", "Acalmar a ansiedade"], ["foco", "Voltar ao foco"], ["prof", "Praticar com um professor"]];
const PRATICAS = ["Nenhuma em especial", "Respiração Calma", "Quem está falando?", "Desacelerar à Noite", "Antes de Dormir"];
const PAPEL = { admin: "Administrador", professor: "Professor", membro: "Membro" };

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
function quando(t) {
  const m = t?.toMillis ? t.toMillis() : 0;
  if (!m) return "agora";
  const dias = Math.floor((Date.now() - m) / 86400000);
  if (dias < 1) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return new Date(m).toLocaleDateString(lingua(), { day: "numeric", month: "long" });
}
const dataHora = (t) => new Date(t.toMillis()).toLocaleString(lingua(), { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const inicial = (nome) => (nome || "·").trim().charAt(0).toUpperCase() || "·";
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
        ${nome ? `<label for="com-dlg-n">Para confirmar, escreva o nome: <strong>${esc(nome)}</strong></label><input id="com-dlg-n" class="com-campo" type="text" autocomplete="off">` : ""}
        <div class="com-linha com-linha--fim">
          <button class="com-acao" value="nao" type="submit">Cancelar</button>
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

async function tentar(fn, falha = "Não foi possível agora. Tente de novo daqui a pouco.") {
  if (S.ocupado) return false;
  S.ocupado = true;
  try { await fn(); return true; } catch (e) { console.error(e); aviso(falha); return false; } finally { S.ocupado = false; }
}

/* ---------- Peças ---------- */
const cuidados = () => `
  <ol class="com-cuidados">
    <li><strong>Fale do que você viveu.</strong> <span>Partilhe a sua experiência; conselho só quando alguém pedir.</span></li>
    <li><strong>Nada de vendas nem links para fora.</strong> <span>Professores divulgam o seu trabalho no próprio canal.</span></li>
    <li><strong>O que é partilhado aqui fica aqui.</strong> <span>Não copie nem leve a história de alguém para outro lugar.</span></li>
    <li><strong>Isto não substitui ajuda profissional.</strong> <span>Se estiver em crise, procure apoio imediato: na Europa ligue 112; no Brasil, 188 (CVV) ou 192.</span></li>
  </ol>`;

const previa = () => `
  <section class="com-bloco" aria-labelledby="com-pv">
    <p class="com-sobre">Uma prévia</p>
    <h2 id="com-pv">O que você vai encontrar lá dentro</h2>
    <div class="com-grade">
      ${(S.circulos.length ? S.circulos : dados.CIRCULOS_INICIAIS).slice(0, 4).map((c) => `<div class="com-cartao com-cartao--p"><strong>${esc(c.nome)}</strong><span>${esc(c.proposito)}</span></div>`).join("")}
    </div>
    <article class="com-cartao" aria-label="Exemplo de partilha">
      <div class="com-linha"><span class="com-ini" aria-hidden="true">·</span><div class="com-quem"><strong>Assim é uma partilha</strong><span>Exemplo</span></div><span class="com-etq">Depois de: Respiração Calma</span></div>
      <p>Alguém conta, em poucas linhas, o que ficou depois de meditar. Quem lê pode dizer que aquilo ressoou ou responder com cuidado, sem contagem de gostos e sem pressa.</p>
    </article>
    <div class="com-grade com-grade--3">
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.megafone}</span><div class="com-quem"><strong>Dos professores</strong><span>Novas práticas e convites, só de quem ensina.</span></div></div>
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.agenda}</span><div class="com-quem"><strong>Encontros ao vivo</strong><span>Meditar em grupo, câmara opcional.</span></div></div>
      <div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem"><strong>Grupos pequenos</strong><span>Turmas e amigos que praticam juntos.</span></div></div>
    </div>
  </section>`;

const capa = () => `
  <div class="com-capa">
    <p class="com-sobre">Comunidade</p>
    <h1>Praticar junto, cada um no seu tempo.</h1>
    <p class="com-lead">Um lugar para partilhar o que a prática deixou em você. Sem seguidores, sem contagens, sem feed infinito e sem pressa de responder.</p>
  </div>`;

function telaFora() {
  if (!S.user) {
    return `<main class="com-entrada">${capa()}
      <section class="com-cartao"><h2>Entre para pedir o seu lugar</h2>
      <p class="com-suave">A comunidade é fechada: cada pedido é lido pelo Lucas antes de entrar. Usamos a sua conta Google só para saber quem é você.</p>
      <div class="com-linha"><button class="com-pri" data-a="login" type="button">Entrar com o Google</button></div></section>
      ${previa()}</main>`;
  }
  if (S.eu.estado === "removido") {
    return `<main class="com-entrada">${capa()}<section class="com-cartao"><h2>O seu acesso à comunidade foi retirado.</h2><p class="com-suave">As práticas da Biblioteca continuam abertas para você. Se achar que foi engano, fale com o Lucas pela página de contacto.</p><div class="com-linha"><a class="com-opt" href="library.html">Ir para a Biblioteca</a></div></section></main>`;
  }
  if (S.eu.estado === "pendente") {
    return `<main class="com-entrada">${capa()}
      <section class="com-cartao"><h2>Pedido enviado. Obrigado por querer praticar junto.</h2>
        <ol class="com-cuidados">
          <li><strong>Pedido recebido.</strong> <span>Você não precisa fazer mais nada.</span></li>
          <li><strong>O Lucas lê cada pedido com calma.</strong> <span>Uma pessoa, não um robô, decide quem entra.</span></li>
          <li><strong>O aviso aparece aqui no site.</strong> <span>Quando voltar, veja as Novidades (o sino). Nada de mensagens a insistir enquanto espera.</span></li>
        </ol>
        <div class="com-linha"><a class="com-opt" href="calm.html">Praticar enquanto espera: Respiração Calma</a><button class="com-acao" data-a="cancelar-pedido" type="button">Cancelar o pedido</button></div>
      </section>${previa()}</main>`;
  }
  const convidado = S.eu.convidado;
  return `<main class="com-entrada">${capa()}
    <section class="com-cartao" aria-labelledby="com-q1"><h2 id="com-q1">O que te traz aqui?</h2>
      <p class="com-suave">Escolha uma ou mais. Dá para mudar depois.</p>
      <div class="com-linha">${MOTIVOS.map(([k, n]) => `<button class="com-opt ${S.motivos[k] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.motivos[k])}" data-a="motivo" data-v="${k}">${n}</button>`).join("")}</div>
    </section>
    <section class="com-cartao" aria-labelledby="com-q2"><h2 id="com-q2">Os cuidados da comunidade</h2>
      <p class="com-suave">Quatro combinados curtos. Valem para todos, inclusive para os professores.</p>
      ${cuidados()}
      <label class="com-chk"><input type="checkbox" data-a="aceitar" ${S.aceito ? "checked" : ""}>Li e aceito os cuidados</label>
      <p class="com-suave com-peq">Guardamos o seu nome, a foto da conta Google, o seu e-mail (só o Lucas vê) e o que você escrever. Pode levar ou apagar tudo no seu perfil, a qualquer momento.</p>
      <div class="com-linha"><button class="com-pri" data-a="pedir" type="button" ${S.aceito ? "" : "disabled"}>${convidado ? "Entrar na comunidade" : "Pedir para entrar"}</button>
      <span class="com-suave com-peq">${convidado ? "O Lucas convidou você: a entrada é imediata." : "Cada pedido é visto pelo Lucas antes de entrar."}</span></div>
    </section></main>`;
}

function lateral(tela) {
  const eu = S.eu;
  const pend = S.gestao.membros.filter((m) => m.estado === "pendente").length;
  return `<aside class="com-esq" aria-label="Círculos e grupos">
    <p class="com-cap">Círculos</p>
    <nav class="com-lista">
      ${S.circulos.map((c) => `<a class="com-circ ${(tela === "circulo" || tela === "partilha") && c.id === S.circuloId ? "is-on" : ""}" href="#c=${c.id}"><span>${esc(c.nome)}</span><small>${esc(c.sub || "")}</small></a>`).join("")}
      <a class="com-circ ${tela === "grupos" || tela === "grupo" ? "is-on" : ""}" href="#grupos"><span>Grupos e conversas</span><small>Grupos fechados e chats</small></a>
      ${eu.admin ? `<a class="com-circ ${tela === "gestao" ? "is-on" : ""}" href="#gestao"><span>Gestão</span><small>${pend ? (pend === 1 ? "1 pedido à espera" : `${pend} pedidos à espera`) : "Membros, convites e denúncias"}</small></a>` : ""}
      <a class="com-circ ${tela === "perfil" ? "is-on" : ""}" href="#perfil"><span>Meu perfil</span><small>Nome e os meus dados</small></a>
    </nav>
    ${eu.professor ? `<details class="com-mais"><summary>Novo círculo</summary><form class="com-novo" data-f="novo-circulo"><label class="com-so-leitor" for="com-nc">Nome do círculo</label><input id="com-nc" class="com-campo" name="nome" type="text" maxlength="60" placeholder="Nome do círculo" required><input class="com-campo" name="proposito" type="text" maxlength="240" placeholder="Para que serve (uma frase)" aria-label="Propósito do círculo"><button class="com-opt" type="submit">${IC.mais} Criar círculo</button></form></details>` : ""}
  </aside>`;
}

function direita() {
  const eu = S.eu;
  return `<aside class="com-dir" aria-label="Professores e encontros">
    <section class="com-cartao com-cartao--p"><h3>Dos professores</h3><p class="com-suave com-peq">Só os professores publicam aqui: novas práticas e convites.</p>
      ${S.canal.length ? S.canal.slice(0, 5).map((a) => `<div class="com-linha com-linha--topo"><span class="com-ic">${IC.megafone}</span><div class="com-quem"><strong>${esc(a.titulo)}</strong>${a.texto ? `<span>${esc(a.texto)}</span>` : ""}<span>${esc(a.nome)} · ${quando(a.criadoEm)}</span></div>${eu.admin || a.uid === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-canal" data-v="${a.id}" aria-label="Apagar aviso">${IC.lixo}</button>` : ""}</div>`).join("") : `<p class="com-suave com-peq">Ainda sem avisos.</p>`}
      ${eu.professor ? `<form class="com-novo" data-f="canal"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="Título do aviso" aria-label="Título do aviso" required><input class="com-campo" name="texto" type="text" maxlength="300" placeholder="Uma frase (opcional)" aria-label="Texto do aviso"><button class="com-opt" type="submit">Publicar aviso</button></form>` : ""}
    </section>
    <section class="com-cartao com-cartao--p"><h3>Próximos encontros</h3><p class="com-suave com-peq">Meditar em grupo, ao vivo, pelo Google Meet. Câmara opcional.</p>
      ${S.encontros.length ? S.encontros.map((e) => `<div class="com-enc"><div class="com-linha com-linha--topo"><span class="com-ic">${IC.agenda}</span><div class="com-quem"><strong>${esc(e.titulo)}</strong><span>${esc(dataHora(e.quando))}</span><span>com ${esc(e.nome)}</span></div></div>
        <div class="com-linha"><button class="com-opt ${e.guardado ? "is-on" : ""}" type="button" aria-pressed="${e.guardado}" data-a="lugar" data-v="${e.id}">${e.guardado ? "Lugar guardado" : "Guardar lugar"}</button><a class="com-opt" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">Entrar no encontro</a>${eu.admin || e.uid === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-encontro" data-v="${e.id}" aria-label="Apagar encontro">${IC.lixo}</button>` : ""}</div></div>`).join("") : `<p class="com-suave com-peq">Nenhum encontro marcado.</p>`}
      ${eu.professor ? `<form class="com-novo" data-f="encontro"><input class="com-campo" name="titulo" type="text" maxlength="120" placeholder="Nome do encontro" aria-label="Nome do encontro" required><label class="com-peq com-suave" for="com-eq">Dia e hora</label><input id="com-eq" class="com-campo" name="quando" type="datetime-local" required><label class="com-peq com-suave" for="com-el">Link do Google Meet</label><input id="com-el" class="com-campo" name="link" type="url" placeholder="https://meet.google.com/..." pattern="https://meet\\.google\\.com/.+" required><div class="com-linha"><a class="com-acao" href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">Criar sala no Google Meet</a><button class="com-opt" type="submit">Marcar encontro</button></div></form>` : ""}
    </section>
  </aside>`;
}

function cartaoPartilha(p, { aberta = false } = {}) {
  const eu = S.eu;
  const autor = p.minha ? "Você" : (p.anon ? "Partilha sem nome" : (p.nome || "Membro"));
  const podeApagar = eu.admin || p.minha || S.circulos.find((c) => c.id === p.circulo)?.criador === eu.uid;
  const corpo = S.editando === p.id
    ? `<form data-f="editar" data-v="${p.id}" class="com-novo"><label for="com-ed">Editar partilha</label><textarea id="com-ed" class="com-campo" name="texto" maxlength="2000" required>${esc(p.texto)}</textarea><div class="com-linha"><button class="com-pri" type="submit">Guardar</button><button class="com-acao" type="button" data-a="cancelar-edicao">Cancelar</button></div></form>`
    : `<p class="com-texto">${esc(p.texto)}</p>`;
  return `<article class="com-cartao">
    <div class="com-linha"><span class="com-ini" aria-hidden="true">${p.anon ? "·" : esc(inicial(p.nome))}</span><div class="com-quem"><strong>${esc(autor)}</strong><span>${quando(p.criadoEm)}${p.editadoEm ? " · editada" : ""}</span></div>
      ${p.pratica && p.pratica !== PRATICAS[0] ? `<span class="com-etq">Depois de: ${esc(p.pratica)}</span>` : ""}${eu.admin && p.denunciada ? `<span class="com-etq com-etq--alerta">Denunciada</span>` : ""}</div>
    ${corpo}
    <div class="com-linha com-linha--acoes">
      <button class="com-acao ${S.ressoou[p.id] ? "is-on" : ""}" type="button" aria-pressed="${Boolean(S.ressoou[p.id])}" data-a="ressoou" data-v="${p.id}">${IC.folha}<span>${S.ressoou[p.id] ? "Ressoou em você" : "Isto ressoou em mim"}</span></button>
      ${aberta ? "" : `<a class="com-acao" href="#p=${p.id}">${IC.responder}<span>Ler e responder</span></a>`}
      <span class="com-esp"></span>
      ${p.minha && S.editando !== p.id ? `<button class="com-acao" type="button" data-a="editar" data-v="${p.id}">${IC.editar}<span>Editar</span></button>` : ""}
      ${podeApagar ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>Apagar</span></button>` : ""}
      ${p.minha ? "" : `<button class="com-acao" type="button" data-a="denunciar" data-v="${p.id}" ${p.denunciada ? "disabled" : ""}>${IC.bandeira}<span>${p.denunciada ? "Denunciada" : "Denunciar"}</span></button>`}
    </div></article>`;
}

function telaCirculo() {
  const c = S.circulos.find((x) => x.id === S.circuloId);
  if (!c) {
    return `<div class="com-cartao"><h2>Ainda não há círculos.</h2>${S.eu.admin ? `<p class="com-suave">Comece pelos quatro círculos do desenho: Partilhas depois da prática, Calma, Sono e Foco.</p><div class="com-linha"><button class="com-pri" type="button" data-a="semear">Criar os quatro círculos</button></div>` : `<p class="com-suave">O Lucas está preparando os primeiros.</p>`}</div>`;
  }
  const podeApagar = S.eu.admin || c.criador === S.eu.uid;
  return `<div class="com-topo"><div class="com-linha"><p class="com-sobre">Círculo</p><span class="com-esp"></span>${podeApagar ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-circulo" data-v="${c.id}">${IC.lixo}<span>Apagar círculo</span></button>` : ""}</div>
      <h1 class="com-h1">${esc(c.nome)}</h1><p class="com-lead">${esc(c.proposito || "")}</p>${c.cuidado ? `<div><span class="com-etq">Cuidado deste círculo: ${esc(c.cuidado)}</span></div>` : ""}</div>
    <form class="com-cartao com-novo" data-f="publicar">
      <label for="com-partilha"><strong>O que a prática deixou em você hoje?</strong></label>
      <textarea id="com-partilha" class="com-campo" name="texto" maxlength="2000" placeholder="Pode ser uma frase. Não precisa ser bonito nem certo." required></textarea>
      <div class="com-linha com-linha--base">
        <div class="com-sel"><label class="com-peq com-suave" for="com-pratica">Depois de qual prática? (opcional)</label><select id="com-pratica" class="com-campo" name="pratica">${PRATICAS.map((p) => `<option>${p}</option>`).join("")}</select></div>
        <label class="com-chk"><input type="checkbox" name="anon">Partilhar sem mostrar meu nome</label>
        <button class="com-pri" type="submit">Publicar</button>
      </div>
    </form>
    ${S.posts.length ? S.posts.map((p) => cartaoPartilha(p)).join("") : `<div class="com-cartao com-centro"><strong>Ainda não há partilhas neste círculo.</strong><span class="com-suave">A primeira pode ser sua, quando quiser.</span></div>`}
    <div class="com-fim"><strong>Você viu tudo.</strong><span>Não há mais nada para rolar. Volte amanhã, sem pressa.</span></div>`;
}

function telaPartilha() {
  const p = S.aberto;
  if (!p) return `<div class="com-cartao"><h2>Esta partilha já não existe.</h2><div class="com-linha"><a class="com-opt" href="#">Voltar aos círculos</a></div></div>`;
  const c = S.circulos.find((x) => x.id === p.circulo);
  return `<a class="com-acao com-acao--solta" href="#c=${p.circulo}">${IC.voltar}<span>Voltar a ${esc(c?.nome || "círculo")}</span></a>
    ${cartaoPartilha(p, { aberta: true })}
    <p class="com-cap">Respostas</p>
    ${S.respostas.length ? S.respostas.map((r) => `<div class="com-resp"><span class="com-ini" aria-hidden="true">${esc(inicial(r.nome))}</span><div class="com-quem com-quem--larga"><div class="com-linha"><strong>${esc(r.uid === S.eu.uid ? "Você" : r.nome)}${r.professor ? " · professor" : ""}</strong><span class="com-suave com-peq">${quando(r.criadoEm)}</span><span class="com-esp"></span>${S.eu.admin || r.uid === S.eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-resposta" data-v="${r.id}">${IC.lixo}<span>Apagar</span></button>` : ""}</div><p class="com-texto">${esc(r.texto)}</p></div></div>`).join("") : `<p class="com-suave com-peq com-recuo">Ainda sem respostas.</p>`}
    <form class="com-cartao com-novo com-recuo" data-f="responder"><label for="com-resp"><strong>Responder com cuidado</strong></label><p class="com-suave com-peq">Antes de aconselhar, pergunte. Muitas vezes, quem partilhou só quer ser ouvido.</p><textarea id="com-resp" class="com-campo" name="texto" maxlength="1500" placeholder="Escreva a sua resposta" required></textarea><div class="com-linha com-linha--fim"><button class="com-pri" type="submit">Responder</button></div></form>`;
}

function telaGrupos() {
  const eu = S.eu;
  return `<div class="com-topo"><p class="com-sobre">Grupos e conversas</p><h1 class="com-h1">Grupos pequenos, conversa direta.</h1><p class="com-lead">Grupos fechados para turmas, retiros ou amigos que praticam juntos. Cada grupo tem a sua conversa.</p></div>
    ${eu.professor ? `<form class="com-cartao com-linha com-linha--base" data-f="novo-grupo"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-ng">Nome do novo grupo</label><input id="com-ng" class="com-campo" name="nome" type="text" maxlength="60" placeholder="Por exemplo: Turma de quinta" required></div><div class="com-sel"><label class="com-peq com-suave" for="com-tg">Quem pode entrar</label><select id="com-tg" class="com-campo" name="tipo"><option value="privado">Só quem eu incluir</option><option value="aberto">Qualquer membro</option></select></div><button class="com-pri" type="submit">${IC.mais} Criar grupo</button></form>` : `<p class="com-suave com-peq">Os grupos são criados pelos professores e pelo Lucas.</p>`}
    ${S.grupos.length ? S.grupos.map((g) => {
      const dentro = (g.membros || []).includes(eu.uid);
      return `<div class="com-cartao com-cartao--p com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem com-quem--larga"><strong>${esc(g.nome)}</strong><span>${g.tipo === "privado" ? "Só por inclusão" : "Aberto a membros"}${g.criador === eu.uid ? " · criado por você" : ""}</span></div>
        ${dentro || eu.admin ? `<a class="com-opt" href="#g=${g.id}">Abrir conversa</a>` : `<button class="com-opt" type="button" data-a="entrar-grupo" data-v="${g.id}">Entrar no grupo</button>`}
        ${eu.admin || g.criador === eu.uid ? `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-grupo" data-v="${g.id}">${IC.lixo}<span>Apagar</span></button>` : ""}</div>`;
    }).join("") : `<div class="com-cartao com-centro"><strong>Ainda não há grupos para você.</strong></div>`}`;
}

function telaGrupo() {
  const g = S.grupo, eu = S.eu;
  if (!g) return `<div class="com-cartao"><h2>Este grupo já não existe ou você não está nele.</h2><div class="com-linha"><a class="com-opt" href="#grupos">Voltar aos grupos</a></div></div>`;
  const dono = eu.admin || g.criador === eu.uid;
  const fora = S.pessoas.filter((m) => !(g.membros || []).includes(m.id));
  const dentro = S.pessoas.filter((m) => (g.membros || []).includes(m.id));
  return `<a class="com-acao com-acao--solta" href="#grupos">${IC.voltar}<span>Grupos e conversas</span></a>
    <div class="com-linha"><span class="com-ic">${IC.conversa}</span><div class="com-quem"><h1 class="com-h2">${esc(g.nome)}</h1><span>${g.tipo === "privado" ? "Só por inclusão" : "Aberto a membros"}</span></div><span class="com-esp"></span>${g.criador !== eu.uid && (g.membros || []).includes(eu.uid) ? `<button class="com-acao" type="button" data-a="sair-grupo" data-v="${g.id}">Sair do grupo</button>` : ""}</div>
    <section class="com-cartao com-conversa" id="com-msgs" aria-label="Mensagens" aria-live="polite">${mensagens()}</section>
    <form class="com-linha" data-f="mensagem"><label class="com-so-leitor" for="com-msg">Mensagem</label><input id="com-msg" class="com-campo com-campo--cresce" name="texto" type="text" maxlength="1000" placeholder="Escreva uma mensagem" autocomplete="off" required><button class="com-pri" type="submit" aria-label="Enviar">${IC.enviar}</button></form>
    <p class="com-suave com-peq">As conversas dos grupos só são vistas por quem está no grupo e pela moderação.</p>
    ${dono ? `<section class="com-cartao com-cartao--p"><h3>Quem está no grupo</h3>
      ${dentro.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><span class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong></span>${m.id !== g.criador ? `<button class="com-acao" type="button" data-a="tirar-do-grupo" data-v="${m.id}">Tirar</button>` : `<span class="com-etq">Criou o grupo</span>`}</div>`).join("")}
      ${fora.length ? `<form class="com-linha com-linha--base" data-f="por-no-grupo"><div class="com-sel com-sel--larga"><label class="com-peq com-suave" for="com-pg">Incluir alguém</label><select id="com-pg" class="com-campo" name="pessoa">${fora.map((m) => `<option value="${m.id}">${esc(m.nome)}</option>`).join("")}</select></div><button class="com-opt" type="submit">Incluir no grupo</button></form>` : ""}</section>` : ""}`;
}
function mensagens() {
  if (!S.msgs.length) return `<p class="com-suave com-peq com-centro">Ainda sem mensagens. Comece com um olá.</p>`;
  const g = S.grupo, eu = S.eu;
  return S.msgs.map((m) => `<div class="com-msg ${m.uid === eu.uid ? "is-minha" : ""}"><span class="com-suave com-peq">${esc(m.uid === eu.uid ? "Você" : m.nome)}</span><span>${esc(m.texto)}</span>${eu.admin || m.uid === eu.uid || g.criador === eu.uid ? `<button class="com-acao com-acao--perigo com-acao--mini" type="button" data-a="apagar-mensagem" data-v="${m.id}" aria-label="Apagar mensagem">${IC.lixo}</button>` : ""}</div>`).join("");
}

function telaGestao() {
  const { membros, convites, denuncias } = S.gestao;
  const pedidos = membros.filter((m) => m.estado === "pendente");
  const dentro = membros.filter((m) => m.estado === "aprovado");
  const fora = membros.filter((m) => m.estado === "removido");
  const nomeDe = (id) => membros.find((m) => m.id === id)?.nome || "";
  return `<div class="com-topo"><p class="com-sobre">Gestão da comunidade</p><h1 class="com-h1">Só você vê esta página.</h1><p class="com-lead">Aprove pedidos, convide pessoas, cuide das denúncias e decida quem fica.</p></div>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g1"><h3 id="com-g1">Pedidos para entrar</h3>
      ${pedidos.length ? pedidos.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}${m.motivos?.length ? " · " + esc(m.motivos.map((k) => MOTIVOS.find((x) => x[0] === k)?.[1] || k).join(", ")) : ""}</span></div><button class="com-opt" type="button" data-a="aprovar" data-v="${m.id}">${IC.certo} Aprovar</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">Recusar</button></div>`).join("") : `<p class="com-suave com-peq">Nenhum pedido à espera.</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g2"><h3 id="com-g2">Convidar por e-mail</h3><p class="com-suave com-peq">O convite não envia e-mail: quando a pessoa entrar no site com este e-mail Google, entra logo, sem esperar. Avise-a você mesmo com o link <strong>neuromedit.com/comunidade.html</strong>.</p>
      <form class="com-linha" data-f="convidar"><label class="com-so-leitor" for="com-cv">E-mail</label><input id="com-cv" class="com-campo com-campo--cresce" name="email" type="email" placeholder="nome@exemplo.com" required><button class="com-pri" type="submit">Guardar convite</button></form>
      ${convites.map((c) => `<div class="com-linha"><span class="com-etq">Convite à espera</span><span class="com-suave com-peq">${esc(c.email)}</span><button class="com-acao" type="button" data-a="cancelar-convite" data-v="${esc(c.id)}">Cancelar</button></div>`).join("")}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g3"><h3 id="com-g3">Denúncias</h3>
      ${denuncias.length ? denuncias.map((p) => `<div class="com-den"><p class="com-texto">${esc(p.texto)}</p><div class="com-linha"><span class="com-suave com-peq">${esc(S.circulos.find((c) => c.id === p.circulo)?.nome || "")} · ${esc(p.anon ? `sem nome (${nomeDe(p.autorUid) || "autor desconhecido"})` : p.nome)}</span><span class="com-esp"></span><button class="com-opt" type="button" data-a="manter" data-v="${p.id}">Manter</button><button class="com-acao com-acao--perigo" type="button" data-a="apagar-partilha" data-v="${p.id}">${IC.lixo}<span>Apagar partilha</span></button></div></div>`).join("") : `<p class="com-suave com-peq">Nenhuma denúncia por resolver.</p>`}</section>
    <section class="com-cartao com-cartao--p" aria-labelledby="com-g4"><h3 id="com-g4">Membros</h3>
      ${dentro.length ? dentro.map((m) => `<div class="com-linha"><span class="com-ini" aria-hidden="true">${esc(inicial(m.nome))}</span><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><span class="com-etq">${PAPEL[m.papel] || "Membro"}</span><button class="com-acao" type="button" data-a="papel" data-v="${m.id}" data-p="${m.papel === "professor" ? "membro" : "professor"}">${m.papel === "professor" ? "Tornar membro" : "Tornar professor"}</button><button class="com-acao com-acao--perigo" type="button" data-a="remover" data-v="${m.id}">Remover</button></div>`).join("") : `<p class="com-suave com-peq">Ainda sem membros além de você.</p>`}
      ${fora.length ? `<p class="com-cap">Removidos</p>${fora.map((m) => `<div class="com-linha"><div class="com-quem com-quem--larga"><strong>${esc(m.nome)}</strong><span>${esc(m.email)}</span></div><button class="com-acao" type="button" data-a="aprovar" data-v="${m.id}">Deixar voltar</button><button class="com-acao com-acao--perigo" type="button" data-a="recusar" data-v="${m.id}">Apagar ficha</button></div>`).join("")}` : ""}</section>`;
}

function telaPerfil() {
  const eu = S.eu;
  return `<div class="com-topo"><p class="com-sobre">Meu perfil</p><h1 class="com-h1">Como os outros veem você.</h1></div>
    <section class="com-cartao com-linha"><span class="com-foto">${eu.foto ? `<img src="${esc(eu.foto)}" alt="" referrerpolicy="no-referrer">` : IC.pessoa}</span><div class="com-quem"><strong>${esc(eu.nome)}</strong><span>${PAPEL[eu.papel] || "Membro"}</span><span>A foto é a da sua conta Google.</span></div></section>
    ${eu.temFicha ? `<form class="com-cartao com-novo" data-f="perfil"><label for="com-pn">Nome que aparece na comunidade</label><input id="com-pn" class="com-campo" name="nome" type="text" maxlength="60" value="${esc(eu.nome)}" required><div class="com-linha com-linha--fim"><button class="com-pri" type="submit">Guardar nome</button></div></form>` : ""}
    <section class="com-cartao com-novo"><h3>Os meus dados</h3><p class="com-suave">Tudo o que você escreveu aqui é seu. Pode levar uma cópia ou apagar tudo quando quiser.</p>
      <div class="com-linha"><button class="com-opt" type="button" data-a="exportar">Descarregar os meus dados</button>${eu.admin ? "" : `<button class="com-acao com-acao--perigo" type="button" data-a="apagar-tudo">Sair da comunidade e apagar o que é meu</button>`}</div></section>
    <section class="com-cartao com-novo"><h3>Os cuidados da comunidade</h3>${cuidados()}</section>`;
}

/* ---------- Desenhar ---------- */
function desenhar() {
  if (!S.pronto) { app.innerHTML = `<p class="com-suave com-centro com-espera">Um momento…</p>`; return; }
  if (S.erro) { app.innerHTML = `<main class="com-entrada">${capa()}<section class="com-cartao"><h2>A comunidade ainda está sendo ligada.</h2><p class="com-suave">${esc(S.erro)}</p><div class="com-linha"><a class="com-opt" href="library.html">Ir para a Biblioteca</a></div></section></main>`; return; }
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
  } catch (e) { console.error(e); aviso("Não foi possível carregar esta parte. Tente de novo daqui a pouco."); }
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
    S.erro = "Volte daqui a pouco. Se continuar assim, avise o Lucas.";
  }
  S.pronto = true;
  await carregarRota();
}
const recarregar = async () => { S.eu = await dados.carregarEu(); S.circulos = await dados.circulos().catch(() => []); await carregarLados(); if (S.eu.admin) S.gestao.membros = await dados.membros().catch(() => []); await carregarRota(); };

/* ---------- Ações (cliques) ---------- */
const ACOES = {
  login: () => tentar(() => dados.entrar(), "Não foi possível entrar com o Google."),
  motivo: (v) => { S.motivos[v] = !S.motivos[v]; desenhar(); },
  aceitar: (v, el) => { S.aceito = el.checked; desenhar(); },
  pedir: async () => { if (await tentar(() => dados.pedirEntrada({ nome: S.eu.nome, motivos: Object.keys(S.motivos).filter((k) => S.motivos[k]), convidado: S.eu.convidado }))) await arrancar(S.user); },
  "cancelar-pedido": async () => { if (await confirmar({ titulo: "Cancelar o seu pedido?", texto: "O pedido é apagado. Pode pedir de novo quando quiser.", botao: "Sim, cancelar o pedido" }) && await tentar(() => dados.apagarTudoOQueEMeu())) await arrancar(S.user); },
  semear: async () => { if (await tentar(() => dados.semearCirculos())) { aviso("Círculos criados."); await recarregar(); } },
  ressoou: async (v) => { const novo = !S.ressoou[v]; if (await tentar(() => dados.marcarRessoou(v, novo))) { S.ressoou[v] = novo; desenhar(); } },
  editar: (v) => { S.editando = v; desenhar(); document.getElementById("com-ed")?.focus(); },
  "cancelar-edicao": () => { S.editando = ""; desenhar(); },
  denunciar: async (v) => { if (await tentar(() => dados.denunciar(v))) { aviso("Obrigado. A moderação vai ver com cuidado."); await carregarRota(); } },
  manter: async (v) => { if (await tentar(() => dados.manterPartilha(v))) { aviso("Partilha mantida."); await carregarRota(); } },
  "apagar-partilha": async (v) => {
    if (!await confirmar({ titulo: "Apagar esta partilha?", texto: "A partilha e as respostas a ela vão ser apagadas para sempre. Isto não pode ser desfeito.", botao: "Sim, apagar a partilha" })) return;
    if (await tentar(() => dados.apagarPartilha(v))) { aviso("Partilha apagada."); if (rota().chave === "p") ir(`#c=${S.circuloId}`); else await carregarRota(); }
  },
  "apagar-resposta": async (v) => {
    if (!await confirmar({ titulo: "Apagar esta resposta?", texto: "A resposta vai ser apagada para sempre. Isto não pode ser desfeito.", botao: "Sim, apagar a resposta" })) return;
    if (await tentar(() => dados.apagarResposta(S.aberto.id, v))) { aviso("Resposta apagada."); await carregarRota(); }
  },
  "apagar-circulo": async (v) => {
    const c = S.circulos.find((x) => x.id === v);
    if (!await confirmar({ titulo: "Apagar o círculo inteiro?", texto: `O círculo «${c.nome}» e todas as partilhas e respostas dentro dele vão ser apagados para sempre, para todas as pessoas. Isto não pode ser desfeito.`, botao: "Sim, apagar o círculo", nome: c.nome })) return;
    if (await tentar(() => dados.apagarCirculo(v))) { aviso("Círculo apagado."); S.circulos = await dados.circulos(); ir("#"); }
  },
  "entrar-grupo": async (v) => { if (await tentar(() => dados.entrarNoGrupo(v))) ir(`#g=${v}`); },
  "sair-grupo": async (v) => { if (await confirmar({ titulo: "Sair deste grupo?", texto: "Você deixa de ver a conversa. As suas mensagens ficam.", botao: "Sim, sair do grupo" }) && await tentar(() => dados.sairDoGrupo(v))) ir("#grupos"); },
  "tirar-do-grupo": async (v) => { if (await tentar(() => dados.tirarDoGrupo(S.grupo.id, v))) await carregarRota(); },
  "apagar-grupo": async (v) => {
    const g = S.grupos.find((x) => x.id === v);
    if (!await confirmar({ titulo: "Apagar o grupo inteiro?", texto: `O grupo «${g.nome}» e toda a sua conversa vão ser apagados para sempre, para todos os membros. Isto não pode ser desfeito.`, botao: "Sim, apagar o grupo", nome: g.nome })) return;
    if (await tentar(() => dados.apagarGrupo(v))) { aviso("Grupo apagado."); await carregarRota(); }
  },
  "apagar-mensagem": async (v) => { if (await confirmar({ titulo: "Apagar esta mensagem?", texto: "A mensagem desaparece para todo o grupo.", botao: "Sim, apagar a mensagem" })) await tentar(() => dados.apagarMensagem(S.grupo.id, v)); },
  "apagar-canal": async (v) => { if (await confirmar({ titulo: "Apagar este aviso?", texto: "O aviso desaparece para todos os membros.", botao: "Sim, apagar o aviso" }) && await tentar(() => dados.apagarDoCanal(v))) { await carregarLados(); desenhar(); } },
  "apagar-encontro": async (v) => { if (await confirmar({ titulo: "Apagar este encontro?", texto: "O encontro desaparece para todos, incluindo quem guardou lugar.", botao: "Sim, apagar o encontro" }) && await tentar(() => dados.apagarEncontro(v))) { await carregarLados(); desenhar(); } },
  lugar: async (v) => { const e = S.encontros.find((x) => x.id === v); const novo = !e.guardado; if (await tentar(() => dados.guardarLugar(v, novo))) { e.guardado = novo; aviso(novo ? "Lugar guardado." : "Lugar libertado."); desenhar(); } },
  aprovar: async (v) => { if (await tentar(() => dados.aprovar(v))) { aviso("Aprovado. A pessoa vê o aviso quando voltar ao site."); await recarregar(); } },
  recusar: async (v) => { if (await confirmar({ titulo: "Apagar este pedido?", texto: "A ficha da pessoa é apagada, sem aviso público. Ela pode pedir de novo.", botao: "Sim, apagar" }) && await tentar(() => dados.recusar(v))) await recarregar(); },
  remover: async (v) => {
    const m = S.gestao.membros.find((x) => x.id === v);
    if (!await confirmar({ titulo: `Remover ${m.nome} da comunidade?`, texto: "A pessoa perde o acesso aos círculos e grupos. As partilhas dela ficam. Para voltar, você tem de a deixar entrar de novo.", botao: "Sim, remover" })) return;
    if (await tentar(() => dados.remover(v))) { aviso(`${m.nome} saiu da comunidade.`); await recarregar(); }
  },
  papel: async (v, el) => { if (await tentar(() => dados.mudarPapel(v, el.dataset.p))) await recarregar(); },
  "cancelar-convite": async (v) => { if (await tentar(() => dados.cancelarConvite(v))) await carregarRota(); },
  exportar: () => tentar(async () => {
    const blob = new Blob([JSON.stringify(await dados.exportarOsMeusDados(), null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "neuromedit-comunidade-os-meus-dados.json" });
    a.click(); URL.revokeObjectURL(a.href);
  }),
  "apagar-tudo": async () => {
    if (!await confirmar({ titulo: "Sair da comunidade e apagar o que é seu?", texto: "As suas partilhas, os seus avisos e a sua ficha de membro são apagados para sempre. As respostas que deu a outras pessoas e as mensagens em grupos ficam. Isto não pode ser desfeito.", botao: "Sim, sair e apagar", nome: "apagar" })) return;
    if (await tentar(() => dados.apagarTudoOQueEMeu())) { aviso("Feito. Obrigado por ter estado aqui."); location.hash = ""; await arrancar(S.user); }
  }
};

/* ---------- Formulários ---------- */
const FORMS = {
  publicar: async (f) => {
    const d = new FormData(f);
    const texto = d.get("texto").trim(); if (!texto) return;
    if (await tentar(() => dados.publicar({ circulo: S.circuloId, texto, pratica: d.get("pratica"), anon: d.get("anon") === "on", nome: S.eu.nome }))) { aviso("Partilha publicada."); await carregarRota(); }
  },
  editar: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.editarPartilha(f.dataset.v, texto))) { aviso("Partilha editada."); await carregarRota(); } },
  responder: async (f) => { const texto = new FormData(f).get("texto").trim(); if (texto && await tentar(() => dados.responder(S.aberto, { texto, nome: S.eu.nome, professor: S.eu.professor }))) { aviso("Resposta publicada."); await carregarRota(); } },
  "novo-circulo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarCirculo({ nome: d.get("nome").trim(), proposito: d.get("proposito").trim() }); })) { aviso("Círculo criado."); S.circulos = await dados.circulos(); ir(`#c=${id}`); } },
  "novo-grupo": async (f) => { const d = new FormData(f); let id; if (await tentar(async () => { id = await dados.criarGrupo({ nome: d.get("nome").trim(), tipo: d.get("tipo") }); })) ir(`#g=${id}`); },
  "por-no-grupo": async (f) => { if (await tentar(() => dados.porNoGrupo(S.grupo, new FormData(f).get("pessoa")))) await carregarRota(); },
  mensagem: async (f) => { const campo = f.elements.texto; const texto = campo.value.trim(); if (!texto) return; campo.value = ""; if (!await tentar(() => dados.enviarMensagem(S.grupo.id, { texto, nome: S.eu.nome }))) campo.value = texto; campo.focus(); },
  canal: async (f) => { const d = new FormData(f); if (await tentar(() => dados.publicarNoCanal({ titulo: d.get("titulo").trim(), texto: d.get("texto").trim(), nome: S.eu.nome }))) { await carregarLados(); desenhar(); } },
  encontro: async (f) => {
    const d = new FormData(f); const data = new Date(d.get("quando"));
    if (Number.isNaN(data.getTime())) return aviso("Escolha o dia e a hora.");
    if (await tentar(() => dados.criarEncontro({ titulo: d.get("titulo").trim(), quando: data, link: d.get("link").trim(), nome: S.eu.nome }), "Não foi possível marcar. Confira se o link é do Google Meet.")) { aviso("Encontro marcado."); await carregarLados(); desenhar(); }
  },
  convidar: async (f) => { const email = new FormData(f).get("email").trim(); if (await tentar(() => dados.convidar(email))) { aviso(`Convite guardado para ${email}.`); await carregarRota(); } },
  perfil: async (f) => { const nome = new FormData(f).get("nome").trim(); if (nome && await tentar(() => dados.guardarPerfil({ nome }))) { aviso("Nome guardado."); await recarregar(); } }
};

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el || el.tagName === "INPUT") return;
  ACOES[el.dataset.a]?.(el.dataset.v, el);
});
app.addEventListener("change", (e) => { const el = e.target.closest("input[data-a]"); if (el) ACOES[el.dataset.a]?.(el.dataset.v, el); });
app.addEventListener("submit", (e) => { const f = e.target.closest("form[data-f]"); if (!f) return; e.preventDefault(); FORMS[f.dataset.f]?.(f); });
window.addEventListener("hashchange", carregarRota);

desenhar();
dados.observarSessao(arrancar);
