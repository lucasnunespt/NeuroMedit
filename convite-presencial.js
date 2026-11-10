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
  // Usa as mesmas peças do cartão de fim de sessão (complete.css): mesmo cartão, mesmo rótulo, mesmos botões.
  const caixa = document.createElement("div");
  caixa.className = "complete-card card-static convite-presencial";
  caixa.innerHTML = `
    <p class="complete-label">Meditação presencial</p>
    <h2>Se quiser, podemos meditar juntos, ao vivo.</h2>
    <p class="complete-meta">Uma sessão individual de 30 minutos comigo, aqui em Lisboa.</p>
    <div class="complete-actions">
      <a href="reservar.html" class="button secondary-button">Ver dias e horários</a>
      <button type="button" class="feedback-ghost-link" data-agora-nao>Agora não</button>
    </div>`;
  caixa.querySelector("[data-agora-nao]").addEventListener("click", () => {
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
