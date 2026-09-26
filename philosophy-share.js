/* ==========================================================
   NEUROMEDIT — CONVITE PARA INDICAR (página Filosofia)
   Quando a pessoa chega ao fim do texto, sobe um cartão discreto:
   agradece a leitura e convida a indicar o NeuroMedit. A mensagem
   partilhada sai no idioma que a pessoa está a usar no site.
   ========================================================== */
(() => {
  const card = document.querySelector("[data-philo-share]");
  const marker = document.querySelector("[data-philo-end]");
  if (!card || !marker) return;

  const button = card.querySelector("[data-philo-share-button]");
  const label = card.querySelector("[data-philo-share-label]");
  const closeButton = card.querySelector("[data-philo-share-close]");
  const DISMISS_KEY = "neuromedit.philoShareDismissed";

  function language() {
    try {
      if (typeof getPreferredLanguage === "function") return getPreferredLanguage();
      return localStorage.getItem("neuromedit-language") || document.documentElement.lang || "pt";
    } catch (e) {
      return document.documentElement.lang || "pt";
    }
  }

  function tr(key, fallback) {
    const lang = language();
    const dict = window.NeuroMeditTranslations || {};
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || fallback;
  }

  function isDismissed() {
    try { return sessionStorage.getItem(DISMISS_KEY) === "1"; } catch (e) { return false; }
  }

  function setVisible(visible) {
    if (visible && isDismissed()) visible = false;
    if (visible) {
      card.hidden = false;
      requestAnimationFrame(() => card.classList.add("is-visible"));
    } else {
      card.classList.remove("is-visible");
    }
  }

  card.addEventListener("transitionend", () => {
    if (!card.classList.contains("is-visible")) card.hidden = true;
  });

  // Aparece ao chegar ao fim do texto; some se a pessoa voltar para cima
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const reachedEnd = entry.isIntersecting || entry.boundingClientRect.top < 0;
      setVisible(reachedEnd);
    });
  }, { threshold: 0 });
  observer.observe(marker);

  closeButton.addEventListener("click", () => {
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch (e) { /* opcional */ }
    setVisible(false);
  });

  function flashLabel(key, fallback) {
    const original = label.dataset.i18n;
    label.textContent = tr(key, fallback);
    window.setTimeout(() => {
      label.textContent = tr(original, "Recommend to a friend");
    }, 2000);
  }

  button.addEventListener("click", async () => {
    const url = `${window.location.origin}/`;
    const text = tr("philo_share_message", "I just discovered NeuroMedit by Lucas Nunes: meditation explained with the science behind it. I think you'll like it.");

    if (navigator.share) {
      try {
        await navigator.share({ title: "NeuroMedit", text, url });
      } catch (e) {
        // Cancelado pela pessoa: nada a fazer
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      flashLabel("share_link_copied", "Link copied");
    } catch (e) {
      window.prompt(tr("philo_share_cta", "Recommend to a friend"), `${text} ${url}`);
    }
  });
})();
