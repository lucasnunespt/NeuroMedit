/*
 * NeuroMedit · Botão de compartilhar (componente reutilizável)
 * ------------------------------------------------------------
 * Uso: coloque na página um botão vazio
 *
 *   <button type="button" class="share-button" data-share-button
 *     aria-label="Compartilhar esta meditação"
 *     data-i18n="share_meditation_aria" data-i18n-attr="aria-label,title"></button>
 *
 * e inclua share-button.css + share-button.js. O script:
 *  - desenha o ícone dentro do botão;
 *  - usa navigator.share() com título e URL da meditação;
 *  - sem Web Share: copia o link e mostra "Link copiado" por 2s;
 *  - numa página de meditação ([data-session-flow]) esconde o botão enquanto
 *    o áudio toca e mostra-o de novo ao pausar ou terminar.
 *
 * Atributos opcionais:
 *  data-share-when="paused"      → só aparece com a sessão pausada
 *  data-share-source="last-session" → partilha a última meditação aberta
 *                                    (usado na tela de fim de sessão)
 */
(() => {
  const STORE_KEY = "neuromedit.lastSessionShare";
  const TOAST_MS = 2000;

  const ICON = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" focusable="false" aria-hidden="true">
      <circle cx="6" cy="12" r="2.3" stroke="currentColor" stroke-width="1.6"></circle>
      <circle cx="17.2" cy="5.8" r="2.3" stroke="currentColor" stroke-width="1.6"></circle>
      <circle cx="17.2" cy="18.2" r="2.3" stroke="currentColor" stroke-width="1.6"></circle>
      <path d="M8.05 10.85L15.15 6.95M8.05 13.15L15.15 17.05" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
    </svg>`;

  const buttons = Array.from(document.querySelectorAll("[data-share-button]"));
  if (!buttons.length) return;

  function language() {
    try {
      return localStorage.getItem("neuromedit-language")
        || localStorage.getItem("preferredLanguage")
        || document.documentElement.lang
        || "en";
    } catch (error) {
      return "en";
    }
  }

  function t(key, fallback) {
    if (typeof window.getTranslation !== "function") return fallback;
    const value = window.getTranslation(language(), key);
    return !value || value === `[${key}]` ? fallback : value;
  }

  // "Voltar · NeuroMedit" → "Voltar"
  function meditationTitle() {
    const title = document.title.split(/\s+[·•|]\s+/)[0].trim();
    return title || "NeuroMedit";
  }

  function pageUrl() {
    return `${window.location.origin}${window.location.pathname}`;
  }

  function shareDataFor(button) {
    if (button.dataset.shareSource === "last-session") {
      try {
        const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
        if (saved && saved.url) return saved;
      } catch (error) {
        // sem sessionStorage: segue para o fallback
      }
      return { title: "NeuroMedit", url: `${window.location.origin}/library.html` };
    }
    // Páginas (Início, Biblioteca, Filosofia…): título completo, com a marca
    if (button.classList.contains("share-button--page")) {
      return { title: document.title.trim() || "NeuroMedit", url: pageUrl() };
    }
    return { title: meditationTitle(), url: pageUrl() };
  }

  // ---------------------------------------------------------------------------
  // "Link copiado" — um único aviso discreto por página
  // ---------------------------------------------------------------------------
  let toast = null;
  let toastTimer = 0;

  function showToast(message) {
    if (!toast) {
      toast = document.createElement("p");
      toast.className = "share-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    window.clearTimeout(toastTimer);
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), TOAST_MS);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // tenta o método antigo abaixo
      }
    }
    try {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.top = "-1000px";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      return copied;
    } catch (error) {
      return false;
    }
  }

  async function share(button) {
    const data = shareDataFor(button);

    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, url: data.url });
      } catch (error) {
        // A pessoa fechou a folha de partilha: nada a fazer.
      }
      return;
    }

    const copied = await copyText(data.url);
    showToast(copied
      ? t("share_link_copied", "Link copiado")
      : t("feedback_share_copy_failed", "Não foi possível copiar o link."));
  }

  buttons.forEach((button) => {
    if (!button.querySelector("svg")) button.insertAdjacentHTML("afterbegin", ICON);
    if (!button.getAttribute("aria-label")) button.setAttribute("aria-label", "Compartilhar esta meditação");
    button.addEventListener("click", () => share(button));
  });

  // ---------------------------------------------------------------------------
  // Página de meditação: esconder durante a reprodução
  // ---------------------------------------------------------------------------
  const flow = document.querySelector("[data-session-flow]");
  if (!flow) return;

  // Guarda esta meditação para a tela de fim de sessão partilhar o link certo.
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ title: meditationTitle(), url: pageUrl() }));
  } catch (error) {
    // opcional
  }

  const pauseButton = flow.querySelector("[data-session-pause]");

  function sessionState() {
    const c = flow.classList;
    if (c.contains("is-paused")) return "paused";
    if (c.contains("is-practicing") || c.contains("is-airlock") || c.contains("is-leaving")) return "playing";
    return "idle";
  }

  // O botão da pausa fica fixo ao lado do botão Retomar (que passa a ser o "play").
  function placeNextToPause(button) {
    if (!pauseButton || pauseButton.hidden) return;
    const rect = pauseButton.getBoundingClientRect();
    const size = button.offsetHeight || 44;
    button.style.left = `${Math.round(rect.right + 8)}px`;
    button.style.top = `${Math.round(rect.top + (rect.height - size) / 2)}px`;
  }

  function update() {
    const state = sessionState();
    buttons.forEach((button) => {
      const onlyWhenPaused = button.dataset.shareWhen === "paused";
      const visible = onlyWhenPaused ? state === "paused" : state !== "playing";
      if (visible && onlyWhenPaused) placeNextToPause(button);
      button.classList.toggle("is-concealed", !visible);
    });
  }

  new MutationObserver(update).observe(flow, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("resize", update);
  update();
})();
