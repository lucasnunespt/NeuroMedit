/**
 * convite-presencial.js — no fim de uma meditação, para quem entrou com conta,
 * um cartão discreto: "Se quiser, podemos meditar juntos, ao vivo."
 *
 * Regras (do mockup de 7 nov 2026): nunca interrompe, nunca aparece sem conta,
 * não aparece se o Lucas pausou os pedidos, e "Agora não" esconde por 14 dias.
 * No ecrã de feedback, só aparece depois de a pessoa responder.
 */
import { auth, db, onAuthStateChanged, doc, getDoc } from "./firebase-init.js";

const CHAVE = "nm-convite-presencial-ate";
const DIAS_ESCONDIDO = 14;

function escondidoAgora() {
  try { return Number(localStorage.getItem(CHAVE) || 0) > Date.now(); } catch (e) { return false; }
}

async function recebePedidos() {
  try {
    const s = await getDoc(doc(db, "settings", "sessao"));
    return !s.exists() || s.data().receberPedidos !== false;
  } catch (e) {
    return false;
  }
}

function criarCartao(lugar) {
  const caixa = document.createElement("div");
  caixa.className = "convite-presencial";
  caixa.innerHTML = `
    <a class="convite-presencial__card" href="reservar.html">
      <p class="convite-presencial__meta">Meditação presencial</p>
      <p class="convite-presencial__titulo">Se quiser, podemos meditar juntos, ao vivo.</p>
      <p class="convite-presencial__texto">Uma sessão individual de 30 minutos comigo, aqui em Lisboa.</p>
      <span class="convite-presencial__seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </a>
    <button type="button" class="convite-presencial__agora-nao">Agora não</button>`;
  caixa.querySelector("button").addEventListener("click", () => {
    try { localStorage.setItem(CHAVE, String(Date.now() + DIAS_ESCONDIDO * 86400000)); } catch (e) {}
    caixa.remove();
  });
  lugar.after(caixa);
}

function quandoVisivel(el, fn) {
  if (!el.hidden) return fn();
  const obs = new MutationObserver(() => { if (!el.hidden) { obs.disconnect(); fn(); } });
  obs.observe(el, { attributes: true, attributeFilter: ["hidden"] });
}

const lugar = document.querySelector("[data-convite-presencial]");
if (lugar && !escondidoAgora()) {
  const sel = lugar.dataset.convitePresencial;
  const espera = sel ? document.querySelector(sel) : null;
  let feito = false;
  onAuthStateChanged(auth, async (user) => {
    if (feito || !user || !(await recebePedidos())) return;
    feito = true;
    if (espera) quandoVisivel(espera, () => criarCartao(lugar));
    else criarCartao(lugar);
  });
}
