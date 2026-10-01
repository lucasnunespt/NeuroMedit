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
    .luz-convite{position:fixed;left:24px;bottom:24px;z-index:70;width:min(300px,calc(100vw - 32px));box-sizing:border-box;
      padding:16px 18px 14px;border-radius:18px;color:#f1e7d3;font-family:inherit;
      background:rgba(18,15,11,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      border:1px solid rgba(233,196,106,.32);box-shadow:0 10px 30px rgba(0,0,0,.22),0 0 18px rgba(233,196,106,.1);
      opacity:0;transform:translateY(10px);transition:opacity 1.4s ease,transform 1.4s ease}
    .luz-convite.is-on{opacity:1;transform:none}
    .luz-convite .lc-tag{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(233,196,106,.9)}
    .luz-convite .lc-dot{width:7px;height:7px;border-radius:50%;background:#f3d890;box-shadow:0 0 8px 2px rgba(233,196,106,.55);animation:lcBreath 11s ease-in-out infinite}
    @keyframes lcBreath{0%,100%{opacity:.45}41%{opacity:1}}
    .luz-convite .lc-text{margin:0 0 12px;font-size:.92rem;line-height:1.45;color:rgba(241,231,211,.86)}
    .luz-convite .lc-row{display:flex;align-items:center;gap:14px}
    .luz-convite button{font:inherit;cursor:pointer;border-radius:999px}
    .luz-convite .lc-try{padding:8px 16px;font-size:.88rem;color:#f6ecd6;background:transparent;border:1px solid rgba(233,196,106,.6);box-shadow:0 0 12px rgba(233,196,106,.18);transition:box-shadow .8s ease,border-color .8s ease}
    .luz-convite .lc-try:hover,.luz-convite .lc-try:focus-visible{outline:none;border-color:#e9c46a;box-shadow:0 0 20px rgba(233,196,106,.38)}
    .luz-convite .lc-no{padding:8px 4px;font-size:.84rem;color:rgba(241,231,211,.6);background:none;border:0}
    .luz-convite .lc-no:hover,.luz-convite .lc-no:focus-visible{outline:none;color:#f1e7d3;text-decoration:underline}
    @media (max-width:940px){.luz-convite{left:16px;right:16px;width:auto;bottom:calc(var(--bottom-bar-h,66px) + env(safe-area-inset-bottom) + 18px)}}
    /* cores próprias: o cartão é escuro em qualquer tema, então o texto não herda as cores do tema claro */
    .luz-convite{--text:#f1e7d3;--text-primary:#f1e7d3;--text-secondary:rgba(241,231,211,.86);--text-soft:rgba(241,231,211,.86);--button-text:#f6ecd6;--link-text:#f6ecd6;background:rgba(18,15,11,.9) !important}
    .luz-convite .lc-tag,.luz-convite .lc-tag span{color:rgba(233,196,106,.95) !important}
    .luz-convite .lc-text{color:rgba(241,231,211,.9) !important}
    .luz-convite .lc-try{color:#f6ecd6 !important}
    .luz-convite .lc-no{color:rgba(241,231,211,.72) !important}
    .luz-convite .lc-no:hover,.luz-convite .lc-no:focus-visible{color:#f1e7d3 !important}
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
