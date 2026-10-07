/*
 * breath-sync.js — põe a respiração da Home no mesmo compasso.
 *
 * As palavras Inspire / Expire (home.css) e a aura da marca atrás delas
 * (hero-redesign.css) têm o mesmo ciclo de 8 s: 0–4 s inspira (a aura cresce),
 * 4–8 s expira (a aura encolhe). Cada animação começa quando o seu elemento é
 * pintado, e isso pode diferir uns milissegundos. Aqui as três passam a ter o
 * mesmo instante de arranque, mantendo o atraso de 4 s do Expire.
 */
(() => {
  const NAMES = new Set(["home-breathe-in", "home-breathe-out", "heroAuraBreathe"]);

  function sync() {
    if (typeof document.getAnimations !== "function") return;
    const animations = document.getAnimations().filter((animation) => NAMES.has(animation.animationName));
    if (animations.length < 2) return;
    const start = document.timeline.currentTime;
    animations.forEach((animation) => { animation.startTime = start; });
  }

  if (document.readyState === "complete") {
    sync();
  } else {
    window.addEventListener("load", sync, { once: true });
  }

  // Ao voltar ao separador, recompõe o compasso
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync();
  });
})();
