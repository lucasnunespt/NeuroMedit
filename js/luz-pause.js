/* NeuroMedit — Pausa inicial em Luz (o airlock novo)
   A versão alternativa tem o seu próprio airlock, separado do antigo
   (index.html). Ele roda em luz.html e também pode continuar direto das
   boas-vindas, sem troca de página: a pessoa de luz que se formou ali é a
   mesma que conduz a meditação.

   Fluxo: preparação (11 s) → voz guiada → a luz fica até a pessoa decidir
   sair → volta em brilho para o feedback. */
(() => {
  if (window.NeuroMeditLuzPause) return;

  const AUDIO_SRC = "audio/intro-v2.mp3";
  const PREP_MS = 11000;
  const FALLBACK_END_MS = 240000;

  const LANG = () => { const l = localStorage.getItem("neuromedit-language"); return ["pt", "en", "es", "it", "ru"].includes(l) ? l : "pt"; };
  const TXT = {
    pt: { prep: "Prepare o corpo.", slow: "Respire devagar.", eyes: "feche os olhos", ready: "Quando estiver pronto.", begin: "Começar", back: "Voltar", pause: "Pausar", cont: "Continuar", exit: "Sair", rest: "Fique aqui o tempo que quiser.", restSub: "Quando estiver pronto, volte devagar.", headphones: "Melhor com fones de ouvido." },
    en: { prep: "Prepare your body.", slow: "Breathe slowly.", eyes: "close your eyes", ready: "Whenever you are ready.", begin: "Begin", back: "Back", pause: "Pause", cont: "Continue", exit: "Leave", rest: "Stay here as long as you like.", restSub: "When you are ready, come back slowly.", headphones: "Best with headphones." },
    es: { prep: "Prepara el cuerpo.", slow: "Respira despacio.", eyes: "cierra los ojos", ready: "Cuando estés listo.", begin: "Empezar", back: "Volver", pause: "Pausar", cont: "Continuar", exit: "Salir", rest: "Quédate aquí el tiempo que quieras.", restSub: "Cuando estés listo, vuelve despacio.", headphones: "Mejor con auriculares." },
    it: { prep: "Prepara il corpo.", slow: "Respira lentamente.", eyes: "chiudi gli occhi", ready: "Quando sei pronto.", begin: "Inizia", back: "Indietro", pause: "Pausa", cont: "Continua", exit: "Esci", rest: "Resta qui quanto vuoi.", restSub: "Quando sei pronto, torna piano.", headphones: "Meglio con le cuffie." },
    ru: { prep: "Подготовьте тело.", slow: "Дышите медленно.", eyes: "закройте глаза", ready: "Когда будете готовы.", begin: "Начать", back: "Назад", pause: "Пауза", cont: "Продолжить", exit: "Выйти", rest: "Оставайтесь здесь сколько захотите.", restSub: "Когда будете готовы, возвращайтесь медленно.", headphones: "Лучше в наушниках." },
  };
  const tx = (k) => (TXT[LANG()] || TXT.pt)[k];
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const feedbackUrl = (status) => `feedback.html?source=index&practice=initial-pause&status=${status}&luz=1`;

  const CSS = `
    #luz-pause{position:fixed;inset:0;z-index:2147483100;background:#050506;color:#f4ead6;font-family:inherit;overflow:hidden}
    #luz-pause{--text:#f4ead6;--text-primary:#f4ead6;--text-secondary:rgba(244,234,214,.72);--text-soft:rgba(244,234,214,.72);--text-muted:rgba(244,234,214,.6);--button-text:#f6ecd6;--link-text:#f6ecd6}
    #luz-pause :is(.lp-title,.lp-pill){color:#f6ecd6 !important}
    #luz-pause .lp-sub{color:rgba(239,233,220,.7) !important}
    #luz-pause .lp-ghost{color:rgba(239,233,220,.82) !important}
    #luz-pause canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #luz-pause .lp-msg{position:absolute;left:0;right:0;top:calc(40% + min(19vmin,145px));margin:0;padding:0 20px;text-align:center;
      font-size:clamp(1.25rem,3.4vw,2rem);font-weight:300;letter-spacing:.01em;color:#f4e6da;text-shadow:0 0 30px rgba(233,196,106,.28);
      opacity:0;transform:translateY(8px);transition:opacity 1.6s ease,transform 1.8s ease}
    #luz-pause .lp-msg.is-on{opacity:1;transform:none}
    #luz-pause .lp-bottom{position:absolute;left:50%;bottom:max(5vh,28px);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:14px;width:max-content;max-width:92vw;transition:opacity 1.6s ease}
    #luz-pause .lp-bottom.is-idle{opacity:.16}
    #luz-pause .lp-bottom.is-gone{opacity:0;pointer-events:none}
    #luz-pause [hidden]{display:none !important}
    #luz-pause .lp-orb{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#f3dfae;
      background:radial-gradient(circle,rgba(233,196,106,.14),rgba(233,196,106,.02) 70%);border:1px solid rgba(233,196,106,.42);
      box-shadow:0 0 22px rgba(233,196,106,.22),inset 0 0 14px rgba(233,196,106,.12);transition:box-shadow .8s ease,border-color .8s ease}
    #luz-pause .lp-orb svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(233,196,106,.8))}
    #luz-pause .lp-orb:hover,#luz-pause .lp-orb:focus-visible{outline:none;border-color:rgba(233,196,106,.8);box-shadow:0 0 34px rgba(233,196,106,.38),inset 0 0 18px rgba(233,196,106,.18)}
    #luz-pause .lp-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
    #luz-pause .lp-pill{min-width:150px;min-height:48px;padding:0 28px;border-radius:999px;cursor:pointer;font:inherit;font-size:1rem;color:#f6ecd6;
      border:1px solid rgba(233,196,106,.6);background:rgba(20,16,10,.5);text-shadow:0 0 10px rgba(233,196,106,.45);
      box-shadow:0 0 18px rgba(233,196,106,.25),inset 0 0 16px rgba(233,196,106,.1);transition:box-shadow .8s ease,border-color .8s ease;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
    #luz-pause .lp-pill:hover,#luz-pause .lp-pill:focus-visible{outline:none;border-color:#e9c46a;box-shadow:0 0 30px rgba(233,196,106,.45),inset 0 0 20px rgba(233,196,106,.16)}
    #luz-pause .lp-ghost{border-color:rgba(239,233,220,.22);box-shadow:none;text-shadow:none;color:rgba(239,233,220,.78);background:transparent}
    #luz-pause .lp-panel{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;opacity:0;transition:opacity 2.4s ease}
    #luz-pause .lp-panel.is-on{opacity:1}
    #luz-pause .lp-title{margin:0;font-size:clamp(1.1rem,2.6vw,1.45rem);color:#f3e8d2;text-shadow:0 0 24px rgba(233,196,106,.35)}
    #luz-pause .lp-sub{margin:0 0 12px;font-size:.92rem;color:rgba(239,233,220,.58)}
    .luz-pause-on .nm-caption{z-index:2147483200 !important;bottom:calc(max(5vh,28px) + 74px) !important;background:transparent !important;text-shadow:0 0 18px rgba(233,196,106,.35) !important}`;

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6v12M15 6v12"/></svg>';

  function start(opts = {}) {
    if (document.getElementById("luz-pause") || !window.NeuroMeditLuzFigure) return;
    const handoff = !!opts.handoff;      // veio das boas-vindas: a pessoa já está formada
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    document.documentElement.classList.add("luz-pause-on");

    const root = document.createElement("div");
    root.id = "luz-pause";
    root.setAttribute("role", "main");
    root.innerHTML = `
      <canvas aria-hidden="true"></canvas>
      <p class="lp-msg" aria-live="polite"></p>
      <div class="lp-bottom">
        <div class="lp-panel lp-ready" hidden>
          <p class="lp-title"></p><p class="lp-sub"></p>
          <div class="lp-row"><button type="button" class="lp-pill" data-lp="begin"></button><a class="lp-pill lp-ghost" href="home.html" data-lp="back"></a></div>
        </div>
        <button type="button" class="lp-orb" data-lp="menu" hidden>${ICON_PAUSE}</button>
        <div class="lp-row lp-menu" hidden>
          <button type="button" class="lp-pill" data-lp="continue"></button>
          <button type="button" class="lp-pill lp-ghost" data-lp="exit"></button>
        </div>
        <div class="lp-panel lp-rest" hidden>
          <p class="lp-title"></p><p class="lp-sub"></p>
          <button type="button" class="lp-pill" data-lp="finish"></button>
        </div>
      </div>`;
    document.body.appendChild(root);
    const $ = (s) => root.querySelector(s);
    $(".lp-ready .lp-title").textContent = tx("ready");
    $(".lp-ready .lp-sub").textContent = tx("headphones");
    $('[data-lp="begin"]').textContent = tx("begin");
    $('[data-lp="back"]').textContent = tx("back");
    $('[data-lp="menu"]').setAttribute("aria-label", tx("pause"));
    $('[data-lp="continue"]').textContent = tx("cont");
    $('[data-lp="exit"]').textContent = tx("exit");
    $(".lp-rest .lp-title").textContent = tx("rest");
    $(".lp-rest .lp-sub").textContent = tx("restSub");
    $('[data-lp="finish"]').textContent = tx("cont");

    // áudio: reaproveita o da página (luz.html) ou cria um
    let audio = document.getElementById("airlockAudio");
    if (!audio) {
      audio = document.createElement("audio");
      audio.id = "airlockAudio";
      audio.preload = "auto";
      audio.src = AUDIO_SRC;
      root.appendChild(audio);
    }
    if (window.NeuroMeditSettings?.get?.().captions && !document.querySelector('script[src="js/legendas.js"]')) {
      const s = document.createElement("script"); s.src = "js/legendas.js"; document.head.appendChild(s);
    }

    // ---------- cena ----------
    const canvas = $("canvas");
    const ctx = canvas.getContext("2d");
    const figure = window.NeuroMeditLuzFigure.create();
    let W = 0, H = 0;
    function resize() {
      const DPR = Math.min(2, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    addEventListener("resize", resize);
    const motes = Array.from({ length: Math.round(Math.min(90, W * H / 14000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random() * 1.3, ph: Math.random() * 6.28 }));

    const t0 = performance.now();
    let phase = "arrive", leavingAt = 0, raf = 0;

    function frame(now) {
      const t = (now - t0) / 1000;
      const b = window.NeuroMeditLuzFigure.breath(now / 1000);       // mesmo relógio das boas-vindas
      const small = H < 640;
      const size = Math.min(W, H) * (small ? 0.3 : 0.36);
      const cx = W / 2, cy = H * (small ? 0.36 : 0.4) - (b - 0.5) * size * 0.03;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.7);
      bg.addColorStop(0, "#16120b"); bg.addColorStop(0.4, "#0a0908"); bg.addColorStop(1, "#040405");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";
      for (const m of motes) {
        const dx = cx - m.x, dy = cy - m.y, d = Math.hypot(dx, dy) || 1;
        m.x += dx / d * 0.12; m.y += dy / d * 0.12;
        if (d < size * 0.25) { const a = Math.random() * 6.283, R = Math.hypot(W, H) * 0.55; m.x = cx + Math.cos(a) * R; m.y = cy + Math.sin(a) * R; }
        ctx.fillStyle = `rgba(233,196,106,${((0.3 + 0.25 * b + 0.1 * Math.sin(t * 0.1 + m.ph)) * 0.5).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.s, 0, 6.283); ctx.fill();
      }

      const form = handoff ? 1 : smooth(0.2, 3.2, t);
      const L = leavingAt ? smooth(0, 2.2, (now - leavingAt) / 1000) : 0;
      figure.draw(ctx, cx, cy, size * (1 + L * 0.35), t, { form, breath: b, glow: 1 + L * 1.4 });
      if (L > 0) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * (0.15 + L * 0.9));
        g.addColorStop(0, `rgba(255,244,220,${(L * 0.95).toFixed(3)})`);
        g.addColorStop(0.5, `rgba(233,196,106,${(L * 0.55).toFixed(3)})`);
        g.addColorStop(1, `rgba(233,196,106,${(L * L * 0.35).toFixed(3)})`);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ---------- mensagens ----------
    const msg = $(".lp-msg");
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
    function say(text, ms) {
      msg.classList.remove("is-on");
      later(() => { msg.textContent = text; msg.classList.add("is-on"); }, 400);
      if (ms) later(() => msg.classList.remove("is-on"), ms);
    }

    // ---------- controles ----------
    const bottom = $(".lp-bottom");
    let idle = 0;
    function wake() {
      bottom.classList.remove("is-idle");
      clearTimeout(idle);
      idle = setTimeout(() => { if ($(".lp-menu").hidden && phase === "meditating") bottom.classList.add("is-idle"); }, 4000);
    }
    ["pointermove", "pointerdown", "keydown", "touchstart"].forEach(e => addEventListener(e, wake, { passive: true }));

    let pausedByUs = false;
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lp]");
      if (!b) return;
      const act = b.dataset.lp;
      if (act === "begin") { e.preventDefault(); $(".lp-ready").hidden = true; begin(true); }
      if (act === "menu") { if (!audio.paused) { audio.pause(); pausedByUs = true; } $('[data-lp="menu"]').hidden = true; $(".lp-menu").hidden = false; $('[data-lp="continue"]').focus(); }
      if (act === "continue") { $(".lp-menu").hidden = true; $('[data-lp="menu"]').hidden = false; if (pausedByUs) audio.play().catch(() => {}); pausedByUs = false; wake(); }
      if (act === "exit") { leave("exited"); }
      if (act === "finish") { leave("completed"); }
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && phase === "meditating" && $(".lp-menu").hidden) $('[data-lp="menu"]').click();
    });

    // ---------- fluxo ----------
    async function prime() {
      try {
        audio.loop = false; audio.currentTime = 0; audio.volume = 0;
        await audio.play();
        return true;
      } catch (e) { return false; }
    }

    function fadeIn(ms = 2400) {
      const target = window.NeuroMeditSettings?.getVolume?.() ?? 1;
      const s = performance.now();
      const id = setInterval(() => {
        const p = Math.min(1, (performance.now() - s) / ms);
        audio.volume = p * target;
        if (p >= 1) clearInterval(id);
      }, 80);
    }

    let begun = false;
    async function begin(fromGesture) {
      if (begun) return;
      const ok = await prime();
      if (!ok && !fromGesture) { showReady(); return; }
      begun = true;
      phase = "preparing";
      document.body.classList.add("is-meditating");
      say(tx("prep"), 3800);
      later(() => say(tx("slow"), PREP_MS - 4200 - 600), 4200);
      later(() => {
        phase = "meditating";
        if (!audio.paused) fadeIn();
        say(tx("eyes"), 6200);
        $('[data-lp="menu"]').hidden = false;
        wake();
      }, PREP_MS);
      later(end, PREP_MS + FALLBACK_END_MS);
    }

    function showReady() {
      phase = "ready";
      const p = $(".lp-ready");
      p.hidden = false;
      requestAnimationFrame(() => p.classList.add("is-on"));
      $('[data-lp="begin"]').focus({ preventScroll: true });
    }

    function end() {
      if (phase === "resting" || phase === "leaving") return;
      phase = "resting";
      timers.forEach(clearTimeout); timers.clear();
      msg.classList.remove("is-on");
      $('[data-lp="menu"]').hidden = true;
      $(".lp-menu").hidden = true;
      bottom.classList.remove("is-idle");
      setTimeout(() => {
        const r = $(".lp-rest");
        r.hidden = false;
        requestAnimationFrame(() => r.classList.add("is-on"));
        $('[data-lp="finish"]').focus({ preventScroll: true });
      }, 4000);
    }
    audio.addEventListener("ended", () => { if (phase === "meditating" || phase === "preparing") end(); });

    function leave(status) {
      if (phase === "leaving") return;
      phase = "leaving";
      timers.forEach(clearTimeout); timers.clear();
      msg.classList.remove("is-on");
      bottom.classList.add("is-gone");
      const v0 = audio.volume, s = performance.now();
      const fade = setInterval(() => {
        const p = Math.min(1, (performance.now() - s) / 1800);
        audio.volume = v0 * (1 - p);
        if (p >= 1) { clearInterval(fade); audio.pause(); }
      }, 80);
      leavingAt = performance.now();
      setTimeout(() => {
        try { sessionStorage.setItem("nm-luz-arrival", String(Date.now())); } catch (e) {}
        location.href = feedbackUrl(status);
      }, 2400);
    }

    // das boas-vindas já temos o toque da pessoa: começa sem pedir outro
    if (handoff) begin(true);
    else later(() => begin(false), 1600);
  }

  window.NeuroMeditLuzPause = { start };
})();
