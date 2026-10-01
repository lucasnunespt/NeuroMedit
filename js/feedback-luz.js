/* NeuroMedit — Feedback na versão alternativa do design ("Luz")
   Depois da meditação, a página se forma em linhas de luz.
   · Noite (fim de tarde, noite, madrugada): fundo de flores e só o essencial.
   · Manhã / dia: uma árvore da vida que cresce em linhas de brilho.
   Só entra em ação com a opção ligada e sem "Reduzir animações". */
(() => {
  if (window.NeuroMeditFeedbackLuz) return;
  window.NeuroMeditFeedbackLuz = true;

  const on = () => !!window.NeuroMeditSettings?.get?.().altDesign
    && !document.body.classList.contains("settings-muted-motion")
    && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = () => {
    const h = document.documentElement;
    if (!h.classList.contains("fb-luz-boot")) return;
    h.classList.add("fb-luz-boot-out");
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.remove("fb-luz-boot")));
  };
  if (!on()) { reveal(); return; }

  const card = document.querySelector(".complete-card");
  if (!card) { reveal(); return; }

  const LANG = () => { const l = localStorage.getItem("neuromedit-language"); return ["pt", "en", "es", "it", "ru"].includes(l) ? l : "pt"; };
  const TXT = {
    pt: { hello: "Todo o universo está dentro de você.", thanks: "Obrigado pela sua presença, aqui e agora.", stay: "Fique com o universo dentro de você." },
    en: { hello: "The whole universe is inside you.", thanks: "Thank you for your presence, here and now.", stay: "Keep the universe inside you." },
    es: { hello: "Todo el universo está dentro de ti.", thanks: "Gracias por tu presencia, aquí y ahora.", stay: "Quédate con el universo dentro de ti." },
    it: { hello: "Tutto l'universo è dentro di te.", thanks: "Grazie per la tua presenza, qui e ora.", stay: "Resta con l'universo dentro di te." },
    ru: { hello: "Вся вселенная внутри тебя.", thanks: "Спасибо за твоё присутствие, здесь и сейчас.", stay: "Сохрани вселенную внутри себя." },
  };
  const tx = (k) => (TXT[LANG()] || TXT.pt)[k];

  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "feedback-luz.css";
  document.head.appendChild(css);

  const html = document.documentElement;
  const DAY = ["theme-morning", "theme-dawn", "theme-afternoon", "theme-day"];
  const isDay = () => DAY.some(c => html.classList.contains(c) || document.body.classList.contains(c));

  // chegando de uma meditação na versão Luz? começamos do mesmo brilho
  let fromLuz = false;
  try {
    const at = Number(sessionStorage.getItem("nm-luz-arrival") || 0);
    fromLuz = Date.now() - at < 30000 || new URLSearchParams(location.search).has("luz");
    sessionStorage.removeItem("nm-luz-arrival");
  } catch (e) {}

  html.classList.add("fb-luz", isDay() ? "fb-luz-day" : "fb-luz-night");
  if (fromLuz) html.classList.add("fb-luz-arriving");
  // o novo design já está montado: só então a página aparece
  const cssReady = new Promise((ok) => { css.onload = ok; css.onerror = ok; setTimeout(ok, 800); });
  cssReady.then(reveal);

  // ---------- conteúdo: saudação + frase de despedida ----------
  const hello = document.createElement("div");
  hello.className = "fb-luz-hello";
  hello.innerHTML = `<p class="fb-luz-title"></p><p class="fb-luz-thanks"></p>`;
  card.prepend(hello);
  const stay = document.createElement("p");
  stay.className = "fb-luz-stay";
  const thankYou = card.querySelector("[data-feedback-thank-you]");
  (thankYou || card.firstChild).before(stay);

  // contorno de luz que desenha o card
  const outline = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  outline.setAttribute("class", "fb-luz-outline");
  outline.setAttribute("aria-hidden", "true");
  outline.innerHTML = '<rect x="0" y="0" width="100%" height="100%" rx="26" ry="26" pathLength="1"/>';
  card.prepend(outline);

  function label() {
    hello.querySelector(".fb-luz-title").textContent = tx("hello");
    hello.querySelector(".fb-luz-thanks").textContent = tx("thanks");
    stay.textContent = tx("stay");
  }
  label();
  addEventListener("neuromedit:languagechange", label);

  // ---------- fundo ----------
  const canvas = document.createElement("canvas");
  canvas.className = "fb-luz-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1, tree = null, motes = [];
  const t0 = performance.now();
  const breath = (t) => window.NeuroMeditLuzFigure?.breath ? window.NeuroMeditLuzFigure.breath(t) : 0.5 - 0.5 * Math.cos((t / 11) * Math.PI * 2);

  function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

  // Árvore da vida: tronco, copa e raízes espelhadas dentro de um círculo
  function buildTree() {
    const R = Math.min(W, H) * 0.34;
    const cx = W / 2, cy = H * 0.47;
    const rand = rng(7);
    const segs = [], tips = [];
    function grow(x, y, ang, len, depth, dir, t) {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const w = Math.max(0.6, (7 - depth) * (dir > 0 ? 1.15 : 0.8));
      segs.push({ x, y, x2, y2, w, t, d: 0.35 + len / R * 0.9 });
      if (depth >= 7) { tips.push({ x: x2, y: y2, dir, ph: rand() * 6.28 }); return; }
      const n = depth < 2 ? 2 : (rand() < 0.35 ? 3 : 2);
      for (let i = 0; i < n; i++) {
        const spread = (dir > 0 ? 0.55 : 0.5) + rand() * 0.25;
        const a = ang + (n === 2 ? (i ? spread : -spread) : (i - 1) * spread) + (rand() - 0.5) * 0.25;
        grow(x2, y2, a, len * (0.7 + rand() * 0.1), depth + 1, dir, t + 0.35 + len / R * 0.9);
      }
    }
    const trunkTop = cy - R * 0.05, base = cy + R * 0.38;
    segs.push({ x: cx, y: base, x2: cx, y2: trunkTop, w: 7.5, t: 0, d: 0.9 });
    grow(cx, trunkTop, -Math.PI / 2, R * 0.3, 1, 1, 0.9);          // copa
    grow(cx, base, Math.PI / 2, R * 0.16, 2, -1, 0.5);              // raízes
    return { segs, tips, R, cx, cy };
  }

  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    tree = isDay() ? buildTree() : null;
    motes = Array.from({ length: isDay() ? 40 : 28 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.6 + Math.random() * 1.6, v: 4 + Math.random() * 8, ph: Math.random() * 6.28 }));
  }

  function frame(now) {
    const t = (now - t0) / 1000;
    const b = breath(t);
    ctx.clearRect(0, 0, W, H);
    const day = html.classList.contains("fb-luz-day");

    if (day && tree) {
      // círculo da árvore da vida, quase invisível
      ctx.lineCap = "round";
      const ring = Math.min(1, t / 4);
      ctx.strokeStyle = `rgba(200,145,46,${(0.12 + 0.05 * b) * ring})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(tree.cx, tree.cy, tree.R * 1.12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); ctx.stroke();

      for (const s of tree.segs) {
        const k = Math.max(0, Math.min(1, (t * 1.1 - s.t) / s.d));
        if (k <= 0) continue;
        const x2 = s.x + (s.x2 - s.x) * k, y2 = s.y + (s.y2 - s.y) * k;
        ctx.strokeStyle = `rgba(233,176,70,${0.14 + 0.06 * b})`;       // halo
        ctx.lineWidth = s.w * 3.2;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.strokeStyle = `rgba(190,128,34,${0.75 + 0.15 * b})`;       // linha
        ctx.lineWidth = s.w * 0.9;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(x2, y2); ctx.stroke();
      }
      // folhas de luz nas pontas, respirando juntas
      const leaves = Math.max(0, Math.min(1, (t - 3.2) / 2.5));
      for (const p of tree.tips) {
        if (!leaves) break;
        const r = (p.dir > 0 ? 3 : 2) * (0.8 + 0.4 * b);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        g.addColorStop(0, `rgba(255,206,110,${0.7 * leaves})`);
        g.addColorStop(1, "rgba(255,214,120,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, 6.283); ctx.fill();
      }
    }

    // poeira de luz lenta (sobe ao inspirar)
    for (const m of motes) {
      m.y -= m.v * 0.016 * (0.4 + b);
      m.x += Math.sin(t * 0.1 + m.ph) * 0.08;
      if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
      ctx.fillStyle = day ? `rgba(214,150,40,${0.25 + 0.2 * b})` : `rgba(255,226,160,${0.3 + 0.25 * b})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.s, 0, 6.283); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);

  // o tema pode mudar depois (Configurações → Tema)
  addEventListener("neuromedit:settingschange", () => {
    if (!on()) { html.classList.remove("fb-luz", "fb-luz-day", "fb-luz-night"); canvas.remove(); return; }
    html.classList.toggle("fb-luz-day", isDay());
    html.classList.toggle("fb-luz-night", !isDay());
    resize();
  });

  // as linhas só começam a se desenhar quando o CSS já chegou
  let started = false;
  const start = () => { if (started) return; started = true; requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add("fb-luz-in"))); };
  css.addEventListener("load", start);
  setTimeout(start, 1200);
})();
