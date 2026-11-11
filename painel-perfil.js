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
        await guardarPerfil(perfil, pro);
        estado.textContent = "Guardado.";
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

  (async () => {
    estado.textContent = "Carregando…";
    perfil = (await lerPerfil(pro)) || {};
    raiz.querySelectorAll("[data-pf]").forEach((inp) => { inp.value = perfil[inp.dataset.pf] || ""; });
    estado.textContent = "";
    pintarFoto();
    pintarDepoimentos();
    pintarMoradas();
  })();
}
