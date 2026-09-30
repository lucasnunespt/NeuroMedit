/* NeuroMedit — Versão alternativa do design ("Luz")
   Ativada em Configurações → Aparência → Versão alternativa do design.
   Ao entrar em qualquer airlock, todos os elementos da tela se dissolvem
   em espiral para dentro de uma pessoa feita de luz, que fica no centro
   respirando durante a meditação. O resto do fluxo (áudio, textos,
   tempos) continua exatamente como no design padrão. */
(() => {
  if (window.NeuroMeditLuz) return;

  const TRIGGERS = "[data-airlock-start], [data-session-start], .session-restart-link, [data-airlock-link]";
  const DISSOLVE = [
    ".header-shell", ".bottom-header-shell", "[data-language-menu]", ".language-menu", ".bottom-nav", ".settings-fab", ".site-footer .footer-container",
    "h1", "h2", "h3", "p", "a", "button", ".session-chip", ".intro-breath-word",
  ].join(",");
  const KEEP = ".exit-btn, .session-exit, [data-session-step='airlock'], [data-session-step='practice'], #message, #choices, #breathField, #luz-layer, #luz-clones, #settings-panel, #settings-overlay, #auth-modal-overlay, .header-mobile-panel, .header-mobile-overlay, .bottom-sheet, .bottom-sheet-overlay";
  const ANCHORS = ".session-step:not([hidden]) .practice-orb, .session-step:not([hidden]) .airlock-orb, #breathField";
  const PROPS = [
    "color", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
    "text-transform", "text-align", "text-decoration-line", "white-space", "background-color", "background-image",
    "border-top", "border-right", "border-bottom", "border-left", "border-radius",
    "padding-top", "padding-right", "padding-bottom", "padding-left", "box-shadow", "text-shadow",
    "display", "align-items", "justify-content", "gap", "flex-direction", "flex-wrap", "grid-template-columns",
    "box-sizing", "fill", "stroke", "width", "height", "overflow",
  ];

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Com "Reduzir animações" (ou o pedido do sistema) fica o orbe do design
  // padrão: é ele que sustenta a atenção de quem medita de olhos fechados.
  const isOn = () => !!window.NeuroMeditSettings?.get?.().altDesign
    && !document.body.classList.contains("settings-muted-motion")
    && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isStill = () => false;

  const LANG = () => { const l = localStorage.getItem("neuromedit-language"); return ["pt", "en", "es", "it", "ru"].includes(l) ? l : "pt"; };
  const TXT = {
    pt: { pause: "Pausar", cont: "Continuar", exit: "Sair", rest: "Fique aqui o tempo que quiser.", restSub: "Quando estiver pronto, volte devagar." },
    en: { pause: "Pause", cont: "Continue", exit: "Leave", rest: "Stay here as long as you like.", restSub: "When you are ready, come back slowly." },
    es: { pause: "Pausar", cont: "Continuar", exit: "Salir", rest: "Quédate aquí el tiempo que quieras.", restSub: "Cuando estés listo, vuelve despacio." },
    it: { pause: "Pausa", cont: "Continua", exit: "Esci", rest: "Resta qui quanto vuoi.", restSub: "Quando sei pronto, torna piano." },
    ru: { pause: "Пауза", cont: "Продолжить", exit: "Выйти", rest: "Оставайтесь здесь сколько захотите.", restSub: "Когда будете готовы, возвращайтесь медленно." },
  };
  const tx = (k) => (TXT[LANG()] || TXT.pt)[k];

  // CSS do modo
  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "luz-airlock.css";
  document.head.appendChild(css);

  let layer, canvas, ctx, clonesLayer, figure;
  let active = false, running = false, closing = 0;
  let t0 = 0, last = 0, W = 0, H = 0, DPR = 1;
  let cap = null, diss = null, dust = [], cur = { x: 0, y: 0, size: 200 };
  let anchor = null, absorbed = 0, total = 0, guard = 0;
  let resting = false, restAt = 0, leaving = false, leaveAt = 0, leaveUrl = '', controls = null, idleTimer = 0, pausedAudio = null;

  function ensureLayer() {
    if (layer) return;
    layer = document.createElement("div");
    layer.id = "luz-layer";
    layer.setAttribute("aria-hidden", "true");
    canvas = document.createElement("canvas");
    layer.appendChild(canvas);
    const video = document.querySelector(".video-atmosphere");
    if (video) video.after(layer); else document.body.prepend(layer);
    ctx = canvas.getContext("2d");

    clonesLayer = document.createElement("div");
    clonesLayer.id = "luz-clones";
    clonesLayer.setAttribute("aria-hidden", "true");
    clonesLayer.inert = true;
    document.body.appendChild(clonesLayer);

    figure = window.NeuroMeditLuzFigure.create();
    addEventListener("resize", resize);
    buildControls();
  }

  function resize() {
    if (!canvas) return;
    DPR = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // ---------- captura: copia o que está na tela antes de tudo sumir ----------
  function copyStyles(src, dst) {
    const cs = getComputedStyle(src);
    let text = "";
    for (const p of PROPS) text += `${p}:${cs.getPropertyValue(p)};`;
    dst.style.cssText = text + "margin:0;transition:none;animation:none;";
  }

  function cloneWithStyles(el) {
    const c = el.cloneNode(true);
    const a = [el, ...el.querySelectorAll("*")];
    const b = [c, ...c.querySelectorAll("*")];
    const n = Math.min(a.length, b.length, 400);
    for (let i = 0; i < n; i++) {
      if (!(a[i] instanceof Element)) continue;
      copyStyles(a[i], b[i]);
      b[i].removeAttribute("id");
      [...b[i].attributes].forEach(at => { if (at.name.startsWith("data-") || at.name === "for") b[i].removeAttribute(at.name); });
    }
    return c;
  }

  // ---------- figura: ocupa o lugar do orbe do design padrão ----------
  function readAnchor() {
    const el = [...document.querySelectorAll(ANCHORS)].find(e => e.offsetWidth > 0);
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: Math.max(el.offsetWidth, el.offsetHeight) * 1.02 };
    }
    return { x: W / 2, y: H * 0.42, size: Math.min(W, H) * 0.42 };
  }

  function seedDust() {
    dust = Array.from({ length: Math.round(Math.min(90, (W * H) / 14000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random() * 1.4, ph: Math.random() * 6.28,
    }));
  }

  // ---------- um só botão no centro (pausa → continuar / sair) ----------
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';
  function buildControls() {
    controls = document.createElement("div");
    controls.id = "luz-controls";
    controls.innerHTML = `
      <button type="button" class="luz-orb-btn" data-luz="menu">${ICON_PAUSE}</button>
      <div class="luz-menu" hidden>
        <button type="button" class="luz-pill" data-luz="continue"></button>
        <button type="button" class="luz-pill luz-pill--ghost" data-luz="exit"></button>
      </div>
      <div class="luz-rest" hidden>
        <p class="luz-rest-title"></p>
        <p class="luz-rest-sub"></p>
        <button type="button" class="luz-pill" data-luz="finish"></button>
      </div>`;
    document.body.appendChild(controls);
    controls.addEventListener("click", onControl);
    ["pointermove", "pointerdown", "keydown", "touchstart"].forEach(e => addEventListener(e, wake, { passive: true }));
    labelControls();
    addEventListener("neuromedit:languagechange", labelControls);
  }

  function labelControls() {
    if (!controls) return;
    const q = (s) => controls.querySelector(s);
    q('[data-luz="menu"]').setAttribute("aria-label", tx("pause"));
    q('[data-luz="continue"]').textContent = tx("cont");
    q('[data-luz="exit"]').textContent = tx("exit");
    q('[data-luz="finish"]').textContent = tx("cont");
    q(".luz-rest-title").textContent = tx("rest");
    q(".luz-rest-sub").textContent = tx("restSub");
  }

  function wake() {
    if (!controls || !active) return;
    controls.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (controls.querySelector(".luz-menu").hidden && !resting) controls.classList.add("is-idle");
    }, 4000);
  }

  function pauseMeditation() {
    const pauseBtn = document.querySelector("[data-session-pause]");
    if (pauseBtn && !pauseBtn.hidden && document.querySelector(".session-flow.is-practicing:not(.is-paused)")) { pauseBtn.click(); pausedAudio = "button"; return; }
    const a = [...document.querySelectorAll("audio")].find(x => !x.paused);
    if (a) { a.pause(); pausedAudio = a; }
  }
  function resumeMeditation() {
    if (pausedAudio === "button") document.querySelector("[data-session-pause]")?.click();
    else if (pausedAudio) pausedAudio.play().catch(() => {});
    pausedAudio = null;
  }

  function onControl(event) {
    const b = event.target.closest("[data-luz]");
    if (!b) return;
    const menu = controls.querySelector(".luz-menu");
    const act = b.dataset.luz;
    if (act === "menu") { pauseMeditation(); menu.hidden = false; controls.classList.add("is-open"); menu.querySelector("button").focus(); }
    if (act === "continue") { menu.hidden = true; controls.classList.remove("is-open"); resumeMeditation(); wake(); }
    if (act === "exit") {
      menu.hidden = true; controls.classList.remove("is-open"); pausedAudio = null;
      (document.querySelector(".session-exit") || document.querySelector(".exit-btn"))?.click();
    }
    if (act === "finish") leave(leaveUrl);
  }

  // ---------- fim: a pessoa continua a brilhar; ninguém é empurrado ----------
  function handleEnd(url) {
    if (!active || leaving) return false;
    resting = true; restAt = performance.now(); leaveUrl = url;
    document.documentElement.classList.add("luz-resting");
    controls.querySelector(".luz-menu").hidden = true;
    controls.classList.remove("is-open", "is-idle");
    controls.classList.add("is-resting");
    setTimeout(() => {
      if (!resting) return;
      const rest = controls.querySelector(".luz-rest");
      rest.hidden = false;
      requestAnimationFrame(() => rest.classList.add("is-visible"));
    }, 4000);
    return true;
  }

  // ---------- saída: tudo volta a ser luz antes de mudar de página ----------
  function leave(url) {
    if (!active || leaving) return false;
    leaving = true; resting = false; leaveAt = performance.now(); leaveUrl = url;
    controls.classList.add("is-leaving");
    document.documentElement.classList.add("luz-leaving");
    setTimeout(() => {
      try { sessionStorage.setItem("nm-luz-arrival", String(Date.now())); } catch (e) {}
      const sep = url.includes("?") ? "&" : "?";
      window.location.href = url + sep + "luz=1";
    }, 2600);
    return true;
  }

  // ---------- ciclo de vida ----------
  function activate() {
    if (active || !window.NeuroMeditLuzFigure) return;
    ensureLayer();
    resize();
    active = true; closing = 0;
    seedDust();
    anchor = readAnchor();
    cur = { x: anchor.x, y: anchor.y, size: anchor.size };
    // tudo o que está na tela vira poeira que pousa dentro da pessoa (sem girar)
    cap = window.NeuroMeditLuzDust.capture({ selector: DISSOLVE, keep: KEEP, layer: clonesLayer });
    diss = window.NeuroMeditLuzDust.dissolver(cap.items, {
      target: () => ({ x: cur.x, y: cur.y }),
      land: (p) => figure.toScreen(p, cur.x, cur.y, cur.size),
      pick: () => figure.randomPoint(),
      spread: 0.7,
    });
    document.documentElement.classList.add("luz-active");
    requestAnimationFrame(() => layer.classList.add("is-visible"));
    controls.classList.add("is-on");
    wake();
    t0 = last = performance.now();
    if (!running) { running = true; requestAnimationFrame(frame); }
    // segurança: se a meditação não chegou a começar (ex.: erro de áudio),
    // devolvemos a tela como estava para a pessoa poder tentar de novo
    clearTimeout(guard);
    guard = setTimeout(() => { if (active && !document.body.classList.contains("is-meditating")) deactivate(); }, 4500);
  }

  function deactivate() {
    if (!active) return;
    active = false;
    closing = performance.now();
    layer?.classList.remove("is-visible");
    controls?.classList.remove("is-on", "is-open", "is-resting", "is-leaving");
    document.documentElement.classList.remove("luz-active", "luz-resting", "luz-leaving");
    resting = false; leaving = false;
    cap?.restore(); cap = null; diss = null;
    clonesLayer && (clonesLayer.innerHTML = "");
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    const still = isStill();

    if (!active && closing && now - closing > 1600) { running = false; ctx.clearRect(0, 0, W, H); return; }

    // âncora suave (a figura desliza do orbe do airlock para o da prática)
    const target = (resting || leaving) ? anchor || readAnchor() : readAnchor();
    const f = anchor ? Math.min(1, dt * 3) : 1;
    anchor = anchor || target;
    anchor.x += (target.x - anchor.x) * f;
    anchor.y += (target.y - anchor.y) * f;
    anchor.size += (target.size - anchor.size) * f;
    // respiração-mestra: 11 s (inspira 4,5 s · expira 6,5 s) para todos os brilhos
    const breath = window.NeuroMeditLuzFigure.breath(t);
    const float = still ? 0 : -(breath - 0.5) * anchor.size * 0.03;   // sobe ao inspirar
    const cx = anchor.x, cy = anchor.y + float;
    const head = figure.head(cx, cy, anchor.size);

    cur = { x: cx, y: cy, size: anchor.size };
    const swirling = diss && !diss.done ? 1 : 0;

    // --- desenho ---
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.7);
    bg.addColorStop(0, "#15120c");
    bg.addColorStop(0.35, "#0b0a09");
    bg.addColorStop(1, "#050506");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    const pull = swirling > 0 ? 1 : 0.15;
    // poeira de luz: poucos pontos, lentos, sem rastros
    for (const d of dust) {
      if (!still) {
        const dx = cx - d.x, dy = cy - d.y, dist = Math.hypot(dx, dy) || 1;
        const v = (8 + pull * 60) * dt;
        d.x += (dx / dist) * v;
        d.y += (dy / dist) * v;
        if (dist < anchor.size * 0.25) { const a = Math.random() * 6.283, R = Math.hypot(W, H) * 0.55; d.x = cx + Math.cos(a) * R; d.y = cy + Math.sin(a) * R; }
      }
      const tw = 0.3 + 0.25 * breath + 0.1 * Math.sin(t * 0.1 + d.ph);
      ctx.fillStyle = `rgba(233,196,106,${(tw * 0.5).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.s, 0, 6.283); ctx.fill();
    }

    // a poeira dos elementos viaja até dentro da silhueta
    if (diss) diss.step(ctx, t);

    // a pessoa se forma conforme tudo entra nela
    const byTime = smooth(0.2, 2.8, t);
    const byAbsorb = diss ? diss.progress() : 1;
    const form = still ? smooth(0, 0.8, t) : Math.max(byTime * 0.75, Math.min(1, byTime * 0.4 + byAbsorb * 0.8));
    // saída: a pessoa se expande em luz e a tela se enche de um brilho quente
    const L = leaving ? smooth(0, 2.4, (now - leaveAt) / 1000) : 0;
    figure.draw(ctx, cx, cy, anchor.size * (1 + L * 0.35), t, { form, breath, glow: 1 + L * 1.4, still });
    if (L > 0) {
      const R = Math.hypot(W, H) * (0.15 + L * 0.9);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, `rgba(255,244,220,${(L * 0.95).toFixed(3)})`);
      g.addColorStop(0.5, `rgba(233,196,106,${(L * 0.55).toFixed(3)})`);
      g.addColorStop(1, `rgba(233,196,106,${(L * L * 0.35).toFixed(3)})`);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    requestAnimationFrame(frame);
  }

  // ---------- gatilhos ----------
  // 1) clique em "Começar": captura antes do fluxo da página esconder a tela
  document.addEventListener("click", (event) => {
    if (!isOn() || active) return;
    if (event.target.closest?.(TRIGGERS)) activate();
  }, true);

  // 2) qualquer outra entrada em meditação (ex.: início automático por #airlock)
  new MutationObserver(() => {
    const meditating = document.body.classList.contains("is-meditating");
    if (meditating && isOn() && !active) activate();
    if (!meditating && active && !resting && !leaving) deactivate();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // 3) desligar a opção no meio de uma sessão volta ao design padrão
  addEventListener("neuromedit:settingschange", () => { if (!isOn() && active) deactivate(); });

  window.NeuroMeditLuz = { activate, deactivate, handleEnd, leave, isActive: () => active };
})();
