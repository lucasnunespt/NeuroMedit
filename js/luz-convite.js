/* NeuroMedit — Convite discreto para a versão de luz (só na home)
   Um cartão pequeno que aparece com calma, uma vez, e some para sempre
   quando a pessoa diz "Agora não" ou experimenta. */
(() => {
  if (window.NeuroMeditLuzConvite) return;
  window.NeuroMeditLuzConvite = true;

  const KEY = "nm-luz-convite";
  const settings = () => window.NeuroMeditSettings?.get?.() || {};
  const reduced = () => settings().muteAnimations || matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}
  if (settings().altDesign || reduced()) return;

  const LANG = () => { const l = localStorage.getItem("neuromedit-language"); return ["pt", "en", "es", "it", "ru"].includes(l) ? l : "pt"; };
  const TXT = {
    pt: { tag: "Novo · opcional", text: "Experimente meditar em luz, uma versão alternativa do NeuroMedit.", try: "Experimentar", no: "Agora não" },
    en: { tag: "New · optional", text: "Try meditating in light, an alternative version of NeuroMedit.", try: "Try it", no: "Not now" },
    es: { tag: "Nuevo · opcional", text: "Prueba meditar en luz, una versión alternativa de NeuroMedit.", try: "Probar", no: "Ahora no" },
    it: { tag: "Nuovo · facoltativo", text: "Prova a meditare nella luce, una versione alternativa di NeuroMedit.", try: "Prova", no: "Non ora" },
    ru: { tag: "Новое · по желанию", text: "Попробуйте медитировать в свете — альтернативная версия NeuroMedit.", try: "Попробовать", no: "Не сейчас" },
  };
  const tx = (k) => (TXT[LANG()] || TXT.pt)[k];

  const style = document.createElement("style");
  style.textContent = `
    /* Cartão de vidro com as cores do tema (design system): nada de cores fixas. */
    .luz-convite{position:fixed;left:24px;bottom:24px;z-index:70;width:min(300px,calc(100vw - 32px));box-sizing:border-box;
      padding:16px 18px 14px;border-radius:var(--radius-md);font-family:inherit;
      background:var(--surface-strong);border:1px solid var(--line);
      backdrop-filter:var(--surface-static-blur);-webkit-backdrop-filter:var(--surface-static-blur);
      box-shadow:var(--shadow-card),var(--glass-highlight);
      opacity:0;transform:translateY(var(--rise-distance));
      transition:opacity var(--duration-calm) var(--easing-calm),transform var(--duration-calm) var(--easing-calm)}
    .luz-convite.is-on{opacity:1;transform:none}
    .luz-convite .lc-tag{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-dark)}
    /* o ponto de luz: dourado da Luz, respira no ciclo de 11 s da figura */
    .luz-convite .lc-dot{width:7px;height:7px;border-radius:var(--radius-pill);background:var(--luz-gold);box-shadow:var(--glow-gold);animation:lcBreath 11s ease-in-out infinite}
    @keyframes lcBreath{0%,100%{opacity:.45}41%{opacity:1}}
    .luz-convite .lc-text{margin:0 0 12px;font-size:.92rem;line-height:1.45;color:var(--text)}
    .luz-convite .lc-row{display:flex;align-items:center;gap:14px}
    .luz-convite button{font:inherit;cursor:pointer;border-radius:var(--radius-pill)}
    .luz-convite .lc-try{padding:8px 16px;font-size:.88rem;font-weight:500;color:var(--button-text);border:0;
      background:var(--accent-light);box-shadow:var(--glass-highlight);
      transition:background-color var(--duration-quick) var(--easing-calm)}
    .luz-convite .lc-try:hover{background:var(--accent-light-hover)}
    .luz-convite .lc-try:focus-visible,.luz-convite .lc-no:focus-visible{outline:2px solid var(--text);outline-offset:2px}
    .luz-convite .lc-no{padding:8px 4px;font-size:.84rem;color:var(--text-soft);background:none;border:0}
    .luz-convite .lc-no:hover{color:var(--text);text-decoration:underline}
    @media (max-width:940px){.luz-convite{left:16px;right:16px;width:auto;bottom:calc(var(--bottom-bar-h,66px) + env(safe-area-inset-bottom) + 18px)}}
    @media (prefers-reduced-motion:reduce){.luz-convite .lc-dot{animation:none;opacity:1}}
    body.is-meditating .luz-convite,.settings-open .luz-convite{display:none}`;
  document.head.appendChild(style);

  const card = document.createElement("aside");
  card.className = "luz-convite";
  card.setAttribute("aria-label", tx("tag"));
  card.innerHTML = `
    <p class="lc-tag"><span class="lc-dot" aria-hidden="true"></span><span></span></p>
    <p class="lc-text"></p>
    <div class="lc-row"><button type="button" class="lc-try"></button><button type="button" class="lc-no"></button></div>`;
  card.querySelector(".lc-tag span:last-child").textContent = tx("tag");
  card.querySelector(".lc-text").textContent = tx("text");
  card.querySelector(".lc-try").textContent = tx("try");
  card.querySelector(".lc-no").textContent = tx("no");

  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }
  function hide(then) {
    card.classList.remove("is-on");
    setTimeout(() => { card.remove(); then && then(); }, 900);
  }
  card.querySelector(".lc-no").addEventListener("click", () => { remember(); hide(); });
  card.querySelector(".lc-try").addEventListener("click", () => {
    remember();
    hide(() => window.NeuroMeditSettings?.enableAltDesign?.());
  });

  // chega depois que a pessoa já está na página, sem interromper a entrada
  setTimeout(() => {
    if (settings().altDesign) return;
    document.body.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("is-on")));
  }, 4500);
})();
