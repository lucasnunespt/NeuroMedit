/**
 * painel-perfil.js — Ajustes › Perfil público.
 *
 * Escreve /settings/perfil (só o admin consegue, pelas regras). A página perfil.html lê daqui.
 * Guarda sozinho, 700 ms depois da última mudança, como os outros Ajustes.
 */
import { lerPerfil, guardarPerfil } from "./perfil-dados.js";
import { lerAjustes } from "./reservas-dados.js";

export function iniciarPerfil(raiz, user) {
  if (!raiz) return;
  const estado = raiz.querySelector("[data-pf-estado]");
  let perfil = null;
  let timer = null;

  function guardar() {
    estado.textContent = "Guardando…";
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await guardarPerfil(perfil);
        estado.textContent = "Guardado.";
      } catch (err) {
        estado.textContent = "Não consegui guardar. Tente de novo.";
      }
    }, 700);
  }

  raiz.querySelectorAll("[data-pf]").forEach((inp) => {
    inp.addEventListener("input", () => {
      if (!perfil) return;
      perfil[inp.dataset.pf] = inp.value.trim() ? inp.value : "";
      guardar();
    });
  });

  const btnFoto = raiz.querySelector("[data-pf-foto]");
  if (!user?.photoURL) btnFoto.hidden = true;
  btnFoto.addEventListener("click", () => {
    if (!perfil || !user?.photoURL) return;
    perfil.foto = user.photoURL;
    guardar();
  });

  async function pintarMoradas() {
    const box = raiz.querySelector("[data-pf-moradas]");
    const cfg = await lerAjustes();
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
    perfil = await lerPerfil();
    raiz.querySelectorAll("[data-pf]").forEach((inp) => { inp.value = perfil[inp.dataset.pf] || ""; });
    estado.textContent = "";
    pintarMoradas();
  })();
}
