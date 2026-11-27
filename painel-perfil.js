/**
 * painel-perfil.js — Ajustes › Perfil público.
 *
 * Escreve /settings/perfil (só o admin consegue, pelas regras). A página perfil.html lê daqui.
 * Guarda sozinho, 700 ms depois da última mudança, como os outros Ajustes.
 */
import { lerPerfil, guardarPerfil } from "./perfil-dados.js";
import { lerAjustes } from "./reservas-dados.js";
import { proPainel } from "./conta-pro.js";
import { AREAS, aplicarTermos } from "./termos.js";
import { db } from "./firebase-init.js";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function iniciarPerfil(raiz, user) {
  if (!raiz) return;
  const pro = proPainel();
  const estado = raiz.querySelector("[data-pf-estado]");
  let perfil = null;
  let timer = null;

  function guardar() {
    estado.textContent = "Guardando…";
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        if (com.eu && com.usuarioNovo) perfil.usuario = com.usuarioNovo;
        await guardarPerfil(perfil, pro);
        estado.textContent = "Guardado.";
        try { await sincronizarComunidade(); }
        catch (e) { estado.textContent = com.eu && !com.eu.usuario ? "Guardado. Escolha um @ para a comunidade receber o seu perfil." : "Guardado na sua página; a comunidade não foi atualizada."; }
      } catch (err) {
        estado.textContent = "Não consegui guardar. Tente de novo.";
      }
    }, 700);
  }

  // A lista de áreas, igual à do formulário de entrada.
  const caixaArea = raiz.querySelector("[data-pf-areas]");
  if (caixaArea) {
    caixaArea.append(new Option("—", ""));
    AREAS.forEach(([nome]) => caixaArea.append(new Option(nome, nome)));
  }

  raiz.querySelectorAll("[data-pf]").forEach((inp) => {
    inp.addEventListener("input", () => {
      if (!perfil) return;
      perfil[inp.dataset.pf] = inp.value.trim() ? inp.value : "";
      // Mudar de área muda a palavra em todo o painel, na hora.
      if (inp.dataset.pf === "area") aplicarTermos(document, perfil.area);
      guardar();
    });
  });

  // ---------- Foto ----------
  // A foto fica no próprio documento do perfil, como imagem pequena. O plano Spark não tem
  // armazenamento de ficheiros, e um quadrado de 256 px comprimido cabe de sobra num documento.
  const LADO = 256;          // a página mostra 96 px; 256 chega para ecrãs densos
  const MAXIMO = 180 * 1024; // acima disto não guarda: o documento tem um limite de 1 MB

  const preFoto = raiz.querySelector("[data-pf-foto-pre]");
  const btnFoto = raiz.querySelector("[data-pf-foto]");
  const ficheiro = raiz.querySelector("[data-pf-foto-ficheiro]");
  const btnEscolher = raiz.querySelector("[data-pf-foto-escolher]");
  const btnTirar = raiz.querySelector("[data-pf-foto-tirar]");
  const nota = raiz.querySelector("[data-pf-foto-nota]");

  const SIMBOLO = "assets/neuromedit-symbol-vector.svg";
  function pintarFoto() {
    const tem = !!perfil?.foto;
    preFoto.src = tem ? perfil.foto : SIMBOLO;
    preFoto.alt = tem ? "A sua foto" : "";
    preFoto.referrerPolicy = "no-referrer";
    if (tem) preFoto.removeAttribute("data-simbolo");
    else preFoto.setAttribute("data-simbolo", "");
    btnTirar.hidden = !tem;
    nota.textContent = tem ? "" : "Sem foto, a sua página mostra o símbolo do NeuroMedit.";
  }

  // Corta ao centro, reduz e comprime, no próprio navegador. Nada sai do dispositivo antes disto.
  function encolher(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const lado = Math.min(img.width, img.height);
        const tela = document.createElement("canvas");
        tela.width = tela.height = LADO;
        const ctx = tela.getContext("2d");
        ctx.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
        let fora = tela.toDataURL("image/jpeg", 0.82);
        if (fora.length > MAXIMO) fora = tela.toDataURL("image/jpeg", 0.68);
        resolve(fora);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("imagem")); };
      img.src = url;
    });
  }

  if (!user?.photoURL) btnFoto.hidden = true;
  btnFoto.addEventListener("click", () => {
    if (!perfil || !user?.photoURL) return;
    perfil.foto = user.photoURL;
    pintarFoto();
    guardar();
  });

  btnEscolher.addEventListener("click", () => ficheiro.click());

  ficheiro.addEventListener("change", async () => {
    const f = ficheiro.files?.[0];
    ficheiro.value = "";
    if (!perfil || !f) return;
    nota.textContent = "Preparando a foto…";
    try {
      const dados = await encolher(f);
      if (dados.length > MAXIMO) { nota.textContent = "Essa imagem é grande demais. Tente outra."; return; }
      perfil.foto = dados;
      pintarFoto();
      guardar();
    } catch {
      nota.textContent = "Não consegui ler essa imagem. Tente um JPEG ou PNG.";
    }
  });

  btnTirar.addEventListener("click", () => {
    if (!perfil) return;
    perfil.foto = "";
    pintarFoto();
    guardar();
  });

  // ---------- Depoimentos ----------
  // O campo já existia e a página pública já os mostrava: faltava o sítio onde escrevê-los.
  const caixaDep = raiz.querySelector("[data-pf-depoimentos]");
  const depTexto = raiz.querySelector("[data-dep-texto]");
  const depNome = raiz.querySelector("[data-dep-nome]");
  const depData = raiz.querySelector("[data-dep-data]");
  const depErro = raiz.querySelector("[data-dep-erro]");
  const depAdd = raiz.querySelector("[data-dep-add]");

  function pintarDepoimentos() {
    if (!caixaDep) return;
    caixaDep.textContent = "";
    const lista = (perfil?.depoimentos || []).filter((d) => d && d.texto);
    if (!lista.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Ainda nenhum. A sua página mostra uma frase a dizer que os primeiros aparecem depois.";
      caixaDep.append(p);
      return;
    }
    lista.forEach((d, i) => {
      const linha = document.createElement("div");
      linha.className = "item";
      const texto = document.createElement("span");
      texto.textContent = [d.texto, [d.nome, d.data].filter(Boolean).join(" · ")].filter(Boolean).join(" — ");
      const tirar = document.createElement("button");
      tirar.type = "button";
      tirar.className = "btn btn--secondary";
      tirar.textContent = "Remover";
      tirar.addEventListener("click", () => {
        perfil.depoimentos = lista.filter((_, j) => j !== i);
        pintarDepoimentos();
        guardar();
      });
      linha.append(texto, tirar);
      caixaDep.append(linha);
    });
  }

  // ---------- Depoimentos à espera (escritos por quem teve a sessão, nov 2026) ----------
  const caixaPend = raiz.querySelector("[data-pf-dep-pendentes]");
  const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  async function pintarPendentes() {
    if (!caixaPend) return;
    let lista = [];
    try { lista = (await getDocs(query(collection(db, "depoimentos"), where("proId", "==", pro)))).docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => d.estado === "pendente"); }
    catch (e) { lista = []; }
    caixaPend.textContent = "";
    caixaPend.hidden = !lista.length;
    if (!lista.length) return;
    const tit = document.createElement("p"); tit.className = "aj-titulo";
    tit.textContent = lista.length === 1 ? "1 depoimento à espera da sua aprovação" : `${lista.length} depoimentos à espera da sua aprovação`;
    caixaPend.append(tit);
    lista.forEach((d) => {
      const item = document.createElement("div");
      const q = document.createElement("blockquote"); q.textContent = `«${d.texto}» — ${d.nome}`;
      const acoes = document.createElement("div"); acoes.className = "dep-acoes";
      const sim = document.createElement("button"); sim.type = "button"; sim.className = "btn btn--primary"; sim.textContent = "Aprovar e mostrar na página";
      const nao = document.createElement("button"); nao.type = "button"; nao.className = "btn btn--secondary"; nao.textContent = "Recusar";
      sim.addEventListener("click", async () => {
        const quando = d.criadoEm?.toDate ? d.criadoEm.toDate() : new Date();
        perfil.depoimentos = [...(perfil.depoimentos || []), { texto: d.texto, nome: d.nome, data: `${MES[quando.getMonth()]} ${quando.getFullYear()}` }];
        pintarDepoimentos(); guardar();
        await deleteDoc(doc(db, "depoimentos", d.id)).catch(() => {});
        pintarPendentes();
      });
      nao.addEventListener("click", async () => { if (!confirm("Recusar este depoimento? Ele é apagado.")) return; await deleteDoc(doc(db, "depoimentos", d.id)).catch(() => {}); pintarPendentes(); });
      acoes.append(sim, nao);
      item.append(q, acoes);
      caixaPend.append(item);
    });
  }

  // ---------- Perguntas na página (nov 2026): responder ou apagar ----------
  const caixaPerg = raiz.querySelector("[data-pf-perguntas]");
  async function pintarPerguntas() {
    if (!caixaPerg) return;
    let lista = [];
    try { lista = (await getDocs(query(collection(db, "perguntas"), where("proId", "==", pro), where("respondida", "==", false)))).docs.map((d) => ({ id: d.id, ...d.data() })); }
    catch (e) { lista = []; }
    caixaPerg.textContent = "";
    if (!lista.length) { const p = document.createElement("p"); p.className = "muted"; p.textContent = "Nenhuma pergunta à espera."; caixaPerg.append(p); return; }
    lista.forEach((q) => {
      const item = document.createElement("div"); item.className = "perg-item";
      const perg = document.createElement("p"); perg.textContent = `«${q.texto}» — ${q.nome}`;
      const lab = document.createElement("label"); lab.className = "aj-campo-rot"; lab.textContent = "A sua resposta";
      const txt = document.createElement("textarea"); txt.className = "campo-texto"; txt.rows = 3; txt.maxLength = 600; lab.append(txt);
      const acoes = document.createElement("div"); acoes.className = "dep-acoes";
      const resp = document.createElement("button"); resp.type = "button"; resp.className = "btn btn--primary"; resp.textContent = "Responder e mostrar na página";
      const apagar = document.createElement("button"); apagar.type = "button"; apagar.className = "btn btn--secondary"; apagar.textContent = "Apagar";
      const nota = document.createElement("p"); nota.className = "ag-estado"; nota.setAttribute("aria-live", "polite");
      resp.addEventListener("click", async () => {
        const r = txt.value.trim();
        if (!r) { txt.focus(); return; }
        resp.disabled = true;
        try { await updateDoc(doc(db, "perguntas", q.id), { resposta: r, respondida: true, respondidaEm: serverTimestamp() }); pintarPerguntas(); }
        catch (e) { resp.disabled = false; nota.textContent = "Não consegui guardar. Tente de novo."; }
      });
      apagar.addEventListener("click", async () => { if (!confirm("Apagar esta pergunta?")) return; await deleteDoc(doc(db, "perguntas", q.id)).catch(() => {}); pintarPerguntas(); });
      acoes.append(resp, apagar);
      item.append(perg, lab, acoes, nota);
      caixaPerg.append(item);
    });
  }

  depAdd?.addEventListener("click", () => {
    if (!perfil) return;
    const texto = depTexto.value.trim();
    const nome = depNome.value.trim();
    if (!texto) { depErro.textContent = "Escreva o que a pessoa disse."; depTexto.focus(); return; }
    if (!nome) { depErro.textContent = "Falta quem escreveu. Pode ser só as iniciais."; depNome.focus(); return; }
    depErro.textContent = "";
    const novo = { texto, nome };
    const quando = depData.value.trim();
    if (quando) novo.data = quando;
    perfil.depoimentos = [...(perfil.depoimentos || []), novo];
    depTexto.value = ""; depNome.value = ""; depData.value = "";
    pintarDepoimentos();
    guardar();
  });

  async function pintarMoradas() {
    const box = raiz.querySelector("[data-pf-moradas]");
    const cfg = await lerAjustes(pro);
    box.textContent = "";
    Object.entries(cfg.locais || {}).filter(([, on]) => on).forEach(([nome]) => {
      const lab = document.createElement("label");
      lab.className = "aj-campo-rot";
      lab.append(nome);
      const inp = document.createElement("input");
      inp.className = "aj-campo";
      inp.type = "text";
      inp.autocomplete = "off";
      inp.placeholder = "Rua, número, código postal";
      inp.value = (perfil.moradas || {})[nome] || "";
      inp.addEventListener("input", () => {
        perfil.moradas = { ...(perfil.moradas || {}) };
        if (inp.value.trim()) perfil.moradas[nome] = inp.value.trim();
        else delete perfil.moradas[nome];
        guardar();
      });
      lab.append(inp);
      box.append(lab);
    });
  }

  // ---------- Perfil único: a comunidade recebe o que se edita aqui ----------
  // Nome, foto (pequena), uma frase do "Sobre", os interesses e o @ vão para a ficha da comunidade,
  // para a pessoa aparecer igual nas publicações e na sua página. Só para quem já é membro.
  const com = { d: null, eu: null, usuarioNovo: "", interesses: [] };
  const caixaCom = raiz.querySelector("[data-pf-comunidade]");
  const inpUsuario = raiz.querySelector("[data-pf-usuario]");
  const notaUsuario = raiz.querySelector("[data-pf-usuario-nota]");
  const ROTULOS = { meditacao: "Meditação", yoga: "Yoga", respiracao: "Respiração", ciencia: "Ciência", espiritualidade: "Espiritualidade", movimento: "Movimento", terapias: "Terapias" };
  async function prepararComunidade() {
    try {
      com.d = await import("./comunidade-dados.js");
      com.eu = await com.d.carregarEu();
    } catch (e) { com.eu = null; }
    if (!com.eu || com.eu.estado !== "aprovado") { com.eu = null; raiz.querySelector("[data-pf-sem-comunidade]")?.removeAttribute("hidden"); return; }
    caixaCom.hidden = false;
    inpUsuario.value = com.eu.usuario || "";
    com.interesses = [...(com.eu.interesses || [])];
    const box = raiz.querySelector("[data-pf-interesses]");
    com.d.INTERESSES.forEach((i) => {
      const lab = document.createElement("label");
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = com.interesses.includes(i);
      cb.addEventListener("change", () => {
        com.interesses = com.d.INTERESSES.filter((x) => x === i ? cb.checked : com.interesses.includes(x)).slice(0, 6);
        guardar();
      });
      lab.append(cb, document.createTextNode(ROTULOS[i] || i));
      box.append(lab);
    });
    let t2 = null;
    inpUsuario.addEventListener("input", () => {
      const v = inpUsuario.value.trim().toLowerCase().replace(/^@/, "");
      clearTimeout(t2);
      com.usuarioNovo = "";
      if (v === (com.eu.usuario || "")) { notaUsuario.textContent = "É o seu @ atual."; return; }
      if (!com.d.USUARIO_OK.test(v)) { notaUsuario.textContent = "Letras minúsculas, números, ponto e _ (3 a 20)."; return; }
      notaUsuario.textContent = "A ver se está livre…";
      t2 = setTimeout(async () => {
        const livre = await com.d.usuarioLivre(v).catch(() => false);
        if (inpUsuario.value.trim().toLowerCase().replace(/^@/, "") !== v) return;
        notaUsuario.textContent = livre ? `neuromedit.com/@${v} está livre. Guarda sozinho.` : "Esse @ já é de outra pessoa.";
        if (livre) { com.usuarioNovo = v; guardar(); }
      }, 500);
    });
  }
  /** Foto pequena para a comunidade (a ficha aceita até ~30 000 caracteres). */
  async function fotoPequena(src) {
    if (!src) return "";
    if (src.length <= 29000) return src;
    try {
      const img = new Image();
      await new Promise((ok, erro) => { img.onload = ok; img.onerror = erro; img.src = src; });
      for (const [lado, q] of [[160, 0.8], [128, 0.75], [112, 0.7]]) {
        const c = document.createElement("canvas"); c.width = c.height = lado;
        const k = Math.max(lado / img.width, lado / img.height);
        c.getContext("2d").drawImage(img, (lado - img.width * k) / 2, (lado - img.height * k) / 2, img.width * k, img.height * k);
        const url = c.toDataURL("image/jpeg", q);
        if (url.length <= 29000) return url;
      }
    } catch (e) { /* fica sem foto nova */ }
    return undefined;
  }
  /** Uma frase do "Sobre" serve de bio curta (140 caracteres). */
  const bioDe = (sobre) => { const t = (sobre || "").trim(); if (t.length <= 140) return t; const f = t.slice(0, 140); const p = f.lastIndexOf(". "); return p > 20 ? f.slice(0, p + 1) : f.replace(/\s+\S*$/, "") + "…"; };
  async function sincronizarComunidade() {
    if (!com.eu) return;
    const foto = await fotoPequena(perfil.foto || "");
    const novo = { nome: (perfil.nome || com.eu.nome || "").slice(0, 60), cidade: com.eu.cidade || "", usuario: com.usuarioNovo || com.eu.usuario || "", bio: bioDe(perfil.sobre), interesses: com.interesses };
    if (foto !== undefined) novo.foto = foto;
    if (!novo.nome) return;
    await com.d.guardarPerfilCompleto(com.eu, novo);
    com.eu = { ...com.eu, ...novo };
    if (com.usuarioNovo) { notaUsuario.textContent = `O seu endereço: neuromedit.com/@${com.usuarioNovo}`; com.usuarioNovo = ""; }
  }

  (async () => {
    estado.textContent = "Carregando…";
    prepararComunidade();
    perfil = (await lerPerfil(pro)) || {};
    raiz.querySelectorAll("[data-pf]").forEach((inp) => { inp.value = perfil[inp.dataset.pf] || ""; });
    estado.textContent = "";
    pintarFoto();
    pintarDepoimentos();
    pintarMoradas();
    pintarPendentes();
    pintarPerguntas();
  })();
}
