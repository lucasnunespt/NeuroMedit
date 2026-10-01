/* NeuroMedit — Boas-vindas à versão alternativa do design ("Luz")
   Quando a pessoa liga a opção em Configurações, o site inteiro vira
   poeira cósmica. A poeira viaja até o centro e forma, grão a grão, a
   pessoa de luz, que convida para meditar.

   Cuidados de experiência:
   · confirma o que mudou ("Versão de luz ativada") e diz como desfazer;
   · "Agora não" (ou Esc) devolve a página exatamente como estava;
   · é um diálogo acessível: foco no convite, Tab circula, Esc fecha;
   · com "Reduzir animações" não roda (o painel só confirma em texto). */
(() => {
  if (window.NeuroMeditLuzWelcome) return;

  const SELECTOR = [
    ".settings-panel", ".header-shell", ".bottom-header-shell", ".bottom-nav", ".settings-fab",
    ".site-footer .footer-container", "[data-language-menu]",
    "h1", "h2", "h3", "p", "a", "button", "img", "label", ".session-chip", ".intro-breath-word",
    "[class*='-card']", "input",
  ].join(",");
  const KEEP = "#luz-welcome, #luz-welcome-dust, #luz-layer, #luz-clones, #luz-controls, .settings-overlay, #auth-modal-overlay, .header-mobile-panel";

  const LANG = () => { const l = localStorage.getItem("neuromedit-language"); return ["pt", "en", "es", "it", "ru"].includes(l) ? l : "pt"; };
  const TXT = {
    pt: { kicker: "Versão de luz ativada", title: "Todo o universo está dentro de você.", sub: "A partir de agora, cada meditação começa assim: tudo se aquieta e fica só você, feito de luz.", go: "Vamos meditar?", later: "Agora não", note: "Pode voltar ao design de sempre em Configurações." },
    en: { kicker: "Light version on", title: "The whole universe is inside you.", sub: "From now on, every meditation begins like this: everything settles and only you remain, made of light.", go: "Shall we meditate?", later: "Not now", note: "You can switch back anytime in Settings." },
    es: { kicker: "Versión de luz activada", title: "Todo el universo está dentro de ti.", sub: "Desde ahora, cada meditación empieza así: todo se aquieta y quedas solo tú, hecho de luz.", go: "¿Meditamos?", later: "Ahora no", note: "Puedes volver al diseño de siempre en Ajustes." },
    it: { kicker: "Versione di luce attivata", title: "Tutto l'universo è dentro di te.", sub: "Da ora ogni meditazione inizia così: tutto si calma e resti solo tu, fatto di luce.", go: "Meditiamo?", later: "Non ora", note: "Puoi tornare al design di sempre nelle Impostazioni." },
    ru: { kicker: "Световая версия включена", title: "Вся вселенная внутри тебя.", sub: "Теперь каждая медитация начинается так: всё затихает, и остаёшься только ты — из света.", go: "Помедитируем?", later: "Не сейчас", note: "Вернуть обычный дизайн можно в Настройках." },
  };
  const tx = (k) => (TXT[LANG()] || TXT.pt)[k];
  const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  let running = false;

  function start() {
    if (running || !window.NeuroMeditLuzFigure || !window.NeuroMeditLuzDust) return;
    running = true;
    const previousFocus = document.activeElement;

    // camadas: céu (canvas) por cima da página, cópias por cima do céu, diálogo por cima de tudo
    const canvas = document.createElement("canvas");
    canvas.id = "luz-welcome-dust";
    canvas.setAttribute("aria-hidden", "true");
    const clones = document.createElement("div");
    clones.id = "luz-clones";
    clones.setAttribute("aria-hidden", "true");
    clones.inert = true;
    const dlg = document.createElement("div");
    dlg.id = "luz-welcome";
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    dlg.setAttribute("aria-labelledby", "luz-welcome-title");
    dlg.innerHTML = `
      <p class="lw-kicker"></p>
      <h2 class="lw-title" id="luz-welcome-title"></h2>
      <p class="lw-sub"></p>
      <div class="lw-actions">
        <a class="lw-go" href="luz.html"></a>
        <button type="button" class="lw-later"></button>
      </div>
      <p class="lw-note"></p>`;
    dlg.querySelector(".lw-kicker").textContent = tx("kicker");
    dlg.querySelector(".lw-title").textContent = tx("title");
    dlg.querySelector(".lw-sub").textContent = tx("sub");
    dlg.querySelector(".lw-go").textContent = tx("go");
    dlg.querySelector(".lw-later").textContent = tx("later");
    dlg.querySelector(".lw-note").textContent = tx("note");

    const style = document.createElement("style");
    style.id = "luz-welcome-style";
    style.textContent = `
      #luz-welcome-dust{position:fixed;inset:0;width:100%;height:100%;z-index:2147482990;pointer-events:none;opacity:0;transition:opacity 1.6s ease}
      #luz-welcome-dust.is-on{opacity:1;pointer-events:auto}
      #luz-clones{position:fixed;inset:0;z-index:2147482995;pointer-events:none;overflow:hidden}
      #luz-welcome{position:fixed;left:0;right:0;top:calc(40% + min(20vmin,150px));z-index:2147483001;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 20px;color:#f4ead6;font-family:inherit}
      #luz-welcome > *{opacity:0;transform:translateY(8px);transition:opacity 1.6s ease,transform 1.6s ease}
      #luz-welcome.s1 .lw-kicker,#luz-welcome.s2 .lw-title,#luz-welcome.s3 .lw-sub,#luz-welcome.s4 .lw-actions,#luz-welcome.s4 .lw-note{opacity:1;transform:none}
      #luz-welcome.is-closing > *{opacity:0 !important;transition-duration:.8s}
      .lw-kicker{margin:0 0 10px;font-size:.78rem;letter-spacing:.24em;text-transform:uppercase;color:rgba(233,196,106,.85)}
      .lw-title{margin:0 0 10px;font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-weight:400;font-size:clamp(1.6rem,4.6vw,2.5rem);line-height:1.15;color:#f6eddb;text-shadow:0 0 30px rgba(233,196,106,.35)}
      .lw-sub{margin:0 0 22px;max-width:40ch;font-size:clamp(.95rem,2.2vw,1.05rem);line-height:1.6;color:rgba(244,234,214,.7)}
      .lw-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
      .lw-go,.lw-later{display:inline-flex;align-items:center;justify-content:center;min-height:48px;min-width:160px;padding:0 28px;border-radius:999px;font:inherit;font-size:1rem;cursor:pointer;text-decoration:none}
      .lw-go{color:#f6ecd6;border:1px solid rgba(233,196,106,.7);text-shadow:0 0 10px rgba(233,196,106,.45);
        background:rgba(20,16,10,.5);
        box-shadow:0 0 22px rgba(233,196,106,.3),inset 0 0 16px rgba(233,196,106,.1);transition:box-shadow .8s ease,border-color .8s ease}
      .lw-go:hover,.lw-go:focus-visible{outline:none;border-color:#e9c46a;box-shadow:0 0 34px rgba(233,196,106,.5),inset 0 0 20px rgba(233,196,106,.16)}
      .lw-later{color:rgba(239,233,220,.72);background:transparent;border:1px solid rgba(239,233,220,.2)}
      .lw-later:hover,.lw-later:focus-visible{outline:none;border-color:rgba(239,233,220,.5);color:#f4ead6}
      .lw-note{margin:16px 0 0;font-size:.8rem;color:rgba(244,234,214,.45)}
      /* a cena de luz é sempre escura: o texto não herda as cores do tema claro do site */
      #luz-welcome{--text:#f4ead6;--text-primary:#f4ead6;--text-secondary:rgba(244,234,214,.72);--text-soft:rgba(244,234,214,.72);--text-muted:rgba(244,234,214,.6);--button-text:#f6ecd6;--link-text:#f6ecd6;--line:rgba(244,234,214,.16)}
      #luz-welcome .lw-kicker{color:rgba(233,196,106,.9) !important}
      #luz-welcome .lw-title{color:#f6eddb !important}
      #luz-welcome .lw-sub{color:rgba(244,234,214,.78) !important}
      #luz-welcome .lw-go{color:#f6ecd6 !important;background-color:rgba(20,16,10,.55)}
      #luz-welcome .lw-later{color:rgba(239,233,220,.8) !important}
      #luz-welcome .lw-later:hover,#luz-welcome .lw-later:focus-visible{color:#f4ead6 !important}
      #luz-welcome .lw-note{color:rgba(244,234,214,.62) !important}
      @media (max-height:640px){#luz-welcome{top:calc(36% + min(18vmin,120px))}.lw-sub{margin-bottom:14px}}`;
    document.head.appendChild(style);
    document.body.append(canvas, clones, dlg);

    const ctx = canvas.getContext("2d");
    let W = innerWidth, H = innerHeight;
    const DPR = Math.min(2, devicePixelRatio || 1);
    const size = () => Math.min(W, H) * (H < 640 ? 0.3 : 0.36);
    const center = () => ({ x: W / 2, y: H * (H < 640 ? 0.36 : 0.4) });
    function resize() {
      W = innerWidth; H = innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    addEventListener("resize", resize);

    // captura a página (painel incluído) e fecha o painel por trás
    const cap = window.NeuroMeditLuzDust.capture({ selector: SELECTOR, keep: KEEP, layer: clones });
    document.getElementById("settings-close")?.click();
    const figure = window.NeuroMeditLuzFigure.create();
    let cur = { ...center(), size: size() };
    const diss = window.NeuroMeditLuzDust.dissolver(cap.items, {
      target: () => ({ x: cur.x, y: cur.y }),
      land: (p) => figure.toScreen(p, cur.x, cur.y, cur.size),
      pick: () => figure.randomPoint(),
      spread: 1.0,
    });
    const stars = Array.from({ length: Math.round(Math.min(140, W * H / 9000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.3 + Math.random() * 1.1, ph: Math.random() * 6.28 }));

    requestAnimationFrame(() => canvas.classList.add("is-on"));
    const t0 = performance.now();
    let closing = 0, leaving = 0, stage = 0, raf = 0;

    function frame(now) {
      const t = (now - t0) / 1000;
      const b = window.NeuroMeditLuzFigure.breath(now / 1000);   // relógio comum com o airlock de luz
      const c = center();
      cur = { x: c.x, y: c.y - (b - 0.5) * size() * 0.03, size: size() };

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, Math.hypot(W, H) * 0.7);
      bg.addColorStop(0, "#16120b"); bg.addColorStop(0.4, "#0a0908"); bg.addColorStop(1, "#040405");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // estrelas distantes que respiram com a pessoa
      ctx.globalCompositeOperation = "lighter";
      const sky = smooth(0.4, 3, t);
      for (const s of stars) {
        ctx.fillStyle = `rgba(255,236,200,${((0.2 + 0.25 * b + 0.1 * Math.sin(t * 0.12 + s.ph)) * sky).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 6.283); ctx.fill();
      }

      diss.step(ctx, t);
      const form = Math.max(smooth(0.8, 4.5, t) * 0.7, Math.min(1, diss.progress() * 1.1));
      const L = leaving > 0 ? smooth(0, 2.2, (now - leaving) / 1000) : 0;
      figure.draw(ctx, cur.x, cur.y, cur.size * (1 + L * 0.35), t, { form, breath: b, glow: 1 + L * 1.4 });
      if (L > 0) {
        const g = ctx.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, Math.hypot(W, H) * (0.15 + L * 0.9));
        g.addColorStop(0, `rgba(255,244,220,${(L * 0.95).toFixed(3)})`);
        g.addColorStop(0.5, `rgba(233,196,106,${(L * 0.55).toFixed(3)})`);
        g.addColorStop(1, `rgba(233,196,106,${(L * L * 0.35).toFixed(3)})`);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      // o convite chega aos poucos, quando a pessoa já está formada
      const want = t > 5.6 ? 4 : t > 4.6 ? 3 : t > 3.6 ? 2 : t > 2.8 ? 1 : 0;
      if (want > stage && !closing) {
        stage = want;
        dlg.classList.add("s" + stage);
        if (stage === 4) dlg.querySelector(".lw-go").focus({ preventScroll: true });
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    function cleanup() {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      document.removeEventListener("keydown", onKey, true);
      [canvas, clones, dlg, style].forEach(el => el.remove());
      running = false;
    }

    // "Agora não": a página volta, suavemente, como estava
    function close() {
      if (closing || leaving) return;
      closing = performance.now();
      dlg.classList.add("is-closing");
      const back = cap.originals();
      cap.restore();
      back.forEach(el => { el.style.transition = "none"; el.style.opacity = "0"; });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        back.forEach(el => { el.style.transition = "opacity 1.2s ease"; el.style.opacity = ""; });
      }));
      canvas.classList.remove("is-on");
      setTimeout(() => {
        back.forEach(el => { el.style.transition = ""; });
        cleanup();
        (previousFocus && previousFocus.focus) ? previousFocus.focus({ preventScroll: true }) : null;
      }, 1700);
    }

    // "Vamos meditar?": tudo vira luz e a sessão de 2 minutos começa
    function go(event) {
      event.preventDefault();
      if (leaving || closing) return;
      // A mesma pessoa de luz continua a conduzir: o airlock de luz abre
      // por cima, sem trocar de página e sem um segundo airlock.
      if (window.NeuroMeditLuzPause) {
        leaving = -1;                         // impede o brilho de saída
        window.NeuroMeditLuzPause.start({ handoff: true });
        setTimeout(() => {
          cancelAnimationFrame(raf);
          removeEventListener("resize", resize);
          document.removeEventListener("keydown", onKey, true);
          [canvas, clones, dlg, style].forEach(el => el.remove());
          running = false;
        }, 400);
        return;
      }
      leaving = performance.now();
      dlg.classList.add("is-closing");
      setTimeout(() => { location.href = "luz.html"; }, 2300);
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "Tab") {
        const f = [dlg.querySelector(".lw-go"), dlg.querySelector(".lw-later")];
        const i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    }
    document.addEventListener("keydown", onKey, true);
    dlg.querySelector(".lw-later").addEventListener("click", close);
    dlg.querySelector(".lw-go").addEventListener("click", go);
    // tocar no céu antes do convite aparecer não faz nada; depois, só os botões agem
  }

  window.NeuroMeditLuzWelcome = { start };
})();
