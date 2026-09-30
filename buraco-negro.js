/* NeuroMedit — Home "buraco negro"
   No scroll, o conteúdo da home é sugado para dentro da cabeça
   de uma pessoa meditando. Tudo veio de dentro de alguém. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrolly = document.getElementById('bh-scrolly');
  const stage = document.getElementById('bh-stage');
  if (!scrolly || !stage) return;
  const canvas = document.getElementById('bh-field');
  const ctx = canvas.getContext('2d');
  const fig = document.getElementById('bh-meditator');
  // pessoa de luz (js/luz-figure.js), desenhada numa camada própria
  const luz = window.NeuroMeditLuzFigure ? window.NeuroMeditLuzFigure.create() : null;
  const fcanvas = document.createElement('canvas');
  fcanvas.className = 'bh-figure-canvas'; fcanvas.setAttribute('aria-hidden', 'true');
  canvas.after(fcanvas);
  const fctx = fcanvas.getContext('2d');
  let figBase = { x: 0, y: 0, size: 200 };
  const finale = document.getElementById('bh-finale');
  const hint = document.getElementById('bh-hint');
  const title = document.getElementById('bh-title');

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  if (reduce) document.documentElement.classList.add('bh-rm');

  // ---------- Ritmo (proporções do scroll) ----------
  const T = {
    start: 0.05,      // quando o primeiro elemento começa a cair
    spread: 0.4,      // janela em que os elementos vão caindo
    durCh: 0.15,      // duração de cada letra
    durBlock: 0.2,    // duração de cada card/bloco
    riseEnd: 0.34,    // a pessoa termina de subir
    iIn: [0.04, 0.24], iOut: [0.6, 0.8],   // intensidade do buraco negro
    absorb: [0.06, 0.66],
    finale: [0.7, 0.84],
    follow: 6,        // quão rápido a animação alcança o scroll (maior = menos atraso)
  };

  // ---------- Letras do título ----------
  // As traduções reescrevem o textContent do título; por isso refazemos
  // a divisão sempre que o idioma muda.
  function splitTitle() {
    const text = title.textContent.replace(/\s+/g, ' ').trim();
    title.setAttribute('aria-label', text);
    title.textContent = '';
    text.split(' ').forEach((word, i, arr) => {
      const w = document.createElement('span');
      w.className = 'bh-w'; w.setAttribute('aria-hidden', 'true');
      for (const c of word) { const s = document.createElement('span'); s.className = 'bh-ch'; s.textContent = c; w.appendChild(s); }
      title.appendChild(w);
      if (i < arr.length - 1) title.appendChild(document.createTextNode(' '));
    });
  }

  const CHROME = '.site-header .header-shell, .bottom-nav, .bottom-back, .bottom-header-shell, .settings-fab';
  let items = [];
  function collect() {
    items = [
      ...[...title.querySelectorAll('.bh-ch')].map(el => ({ el, kind: 'ch' })),
      ...[...stage.querySelectorAll('.bh-absorb')].map(el => ({ el, kind: el.classList.contains('bh-card') ? 'card' : 'block' })),
      // header, navegação e botões fixos também se dissolvem: no fim, zero ruído
      ...[...document.querySelectorAll(CHROME)]
        .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
        .map(el => { el.style.transition = 'none'; return { el, kind: 'chrome' }; }),
    ];
    items.forEach(it => {
      it.color = it.kind === 'card' ? (getComputedStyle(it.el).getPropertyValue('--c').trim() || '#e9c46a') : '#e9c46a';
    });
  }

  // ---------- Medidas ----------
  let W = 0, H = 0, DPR = 1, headBase = { x: 0, y: 0 }, headR = 15, riseMax = 0;
  function measure() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = stage.clientWidth; H = stage.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fcanvas.width = W * DPR; fcanvas.height = H * DPR;
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    items.forEach(it => { it.el.style.transform = ''; it.el.style.opacity = ''; it.el.style.filter = ''; it.el.style.pointerEvents = ''; it.css = ''; });
    fig.style.transform = 'translate(-50%,-50%)';
    const s = stage.getBoundingClientRect();
    const fr = fig.getBoundingClientRect();
    figBase = { x: fr.left + fr.width / 2 - s.left, y: fr.top + fr.height / 2 - s.top, size: fig.offsetWidth };
    const hd = luz ? luz.head(figBase.x, figBase.y, figBase.size) : { x: figBase.x, y: figBase.y - figBase.size * 0.3, r: figBase.size * 0.08 };
    headBase = { x: hd.x, y: hd.y };
    headR = hd.r;
    riseMax = reduce ? 0 : H * 0.6;

    let dMin = Infinity, dMax = 0;
    items.forEach(it => {
      const r = it.el.getBoundingClientRect();
      it.cx = r.left + r.width / 2 - s.left;
      it.cy = r.top + r.height / 2 - s.top;
      it.d = Math.hypot(it.cx - headBase.x, it.cy - (headBase.y + riseMax * 0.5));
      dMin = Math.min(dMin, it.d); dMax = Math.max(dMax, it.d);
    });
    // o mais próximo cai primeiro, como num horizonte de eventos
    items.forEach(it => {
      const n = (it.d - dMin) / Math.max(1, dMax - dMin);
      it.start = T.start + n * T.spread + Math.random() * 0.03;
      it.dur = it.kind === 'ch' ? T.durCh : T.durBlock;
      if (it.kind === 'chrome') it.start = Math.max(it.start, 0.3);   // a navegação sai por último
      it.pe = 0;
    });
    seedStars();
  }

  function rebuild() { splitTitle(); collect(); measure(); }

  // ---------- Estrelas ----------
  let stars = [];
  function seedStars() {
    const n = Math.round(Math.min(650, (W * H) / 2600));
    const R = Math.hypot(W, H) * 0.75;
    stars = Array.from({ length: n }, () => ({
      r: Math.sqrt(Math.random()) * R + 20, a: Math.random() * Math.PI * 2,
      s: 0.4 + Math.random() * 1.2, warm: Math.random() < 0.35, px: null, py: null,
    }));
  }

  // partículas que saem dos cards quando se desfazem
  let bits = [];
  function emit(x, y, color, n, head) {
    for (let i = 0; i < n; i++) {
      const dx = x - head.x, dy = y - head.y, d = Math.hypot(dx, dy) || 1;
      const sp = 90 + Math.random() * 160;
      bits.push({
        x: x + (Math.random() - .5) * 40, y: y + (Math.random() - .5) * 24,
        vx: (-dy / d) * sp + (Math.random() - .5) * 40, vy: (dx / d) * sp + (Math.random() - .5) * 40,
        c: color, life: 0, px: null, py: null, s: 0.6 + Math.random() * 1.4,
      });
    }
  }

  // ---------- Loop ----------
  let sp = 0, last = performance.now(), lastSp = 0;
  const SWIRL = 2.4;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;

    const rect = scrolly.getBoundingClientRect();
    const p = reduce ? 0 : clamp(-rect.top / Math.max(1, rect.height - innerHeight));
    sp += (p - sp) * Math.min(1, dt * T.follow);
    if (Math.abs(p - sp) < 0.0005) sp = p;
    const vel = Math.abs(sp - lastSp) / Math.max(dt, 1e-3); lastSp = sp;

    const I = smooth(T.iIn[0], T.iIn[1], sp) * (1 - smooth(T.iOut[0], T.iOut[1], sp));
    const A = smooth(T.absorb[0], T.absorb[1], sp);
    const rise = (1 - smooth(0, T.riseEnd, sp)) * riseMax;
    // respiração-mestra (11 s): todos os brilhos seguem o mesmo ritmo
    const breathe = window.NeuroMeditLuzFigure ? window.NeuroMeditLuzFigure.breath(now / 1000) : 0.5 + 0.5 * Math.sin((now / 11000) * Math.PI * 2);
    // no fim a pessoa flutua devagar: sobe ao inspirar, desce ao expirar
    const float = reduce ? 0 : -(breathe - 0.5) * 12 * smooth(0.55, 0.9, sp);
    const head = { x: headBase.x, y: headBase.y + rise + float };

    if (!reduce) for (const it of items) {
      const e = clamp((sp - it.start) / it.dur);
      const ee = Math.pow(e, 2.2);
      let css = '';
      if (ee > 0) {
        const vx = it.cx - head.x, vy = it.cy - head.y;
        const th = SWIRL * ee, k = 1 - ee;
        const nx = head.x + (vx * Math.cos(th) - vy * Math.sin(th)) * k;
        const ny = head.y + (vx * Math.sin(th) + vy * Math.cos(th)) * k;
        const sc = Math.max(0.001, Math.pow(1 - ee, 1.4));
        const rot = th * 57.3 * (it.kind === 'ch' ? 1.6 : 0.5);
        css = `translate3d(${(nx - it.cx).toFixed(1)}px,${(ny - it.cy).toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
        if (it.pe < 0.45 && ee >= 0.45) emit(nx, ny, it.color, it.kind === 'ch' ? 3 : 36, head);
        it.op = 1 - smooth(0.7, 1, ee);
        it.blur = it.kind === 'ch' || it.kind === 'chrome' ? 0 : ee * 8;
      }
      it.pe = ee;
      if (css !== it.css) {
        it.css = css;
        it.el.style.transform = css;
        it.el.style.opacity = css ? it.op : '';
        it.el.style.filter = css && it.blur > 0.2 ? `blur(${it.blur.toFixed(1)}px)` : '';
        it.el.style.pointerEvents = css ? 'none' : '';
        if (it.kind !== 'ch') it.el.toggleAttribute('inert', !!css && ee > 0.5);
      }
    }

    if (!reduce) {
      const f = smooth(T.finale[0], T.finale[1], sp);
      finale.style.opacity = f;
      finale.style.transform = `translateY(${((1 - f) * 16).toFixed(1)}px)`;
      finale.style.pointerEvents = f > 0.6 ? 'auto' : 'none';
      finale.toggleAttribute('inert', f < 0.6);
      hint.style.opacity = 1 - smooth(0.01, 0.05, sp);
    }
    const fin = smooth(T.finale[0] - 0.1, T.finale[1], sp);
    draw(dt, head, I, A, vel, breathe, fin);

    fctx.clearRect(0, 0, W, H);
    if (luz) luz.draw(fctx, figBase.x, figBase.y + rise + float, figBase.size, now / 1000, {
      form: 0.35 + 0.65 * A, breath: breathe, glow: 0.85 + 0.15 * I, still: reduce,
    });
    requestAnimationFrame(frame);
  }

  function draw(dt, head, I, A, vel, breathe, fin) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(7,8,10,${(0.2 + (1 - I) * 0.45).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    const R = Math.hypot(W, H) * 0.75;
    const v = Math.min(vel, 1.5);

    for (const s of stars) {
      s.a += (0.03 + I * 1.5 + v * 5) * (120 / (s.r + 80)) * dt;
      s.r -= (I * 70 + v * 900) * (1 + 160 / (s.r + 30)) * dt;
      if (s.r < headR * 0.6) { s.r = R * (0.55 + Math.random() * 0.45); s.a = Math.random() * Math.PI * 2; s.px = null; }
      const flat = lerp(1, 0.32 + 0.68 * smooth(0, 280, s.r), I);
      const x = head.x + Math.cos(s.a) * s.r;
      const y = head.y + Math.sin(s.a) * s.r * flat;
      // no fim quase não sobram marcas à volta: só a pessoa e o convite
      const alpha = (0.25 + 0.55 * I + 0.2 * breathe * (1 - I)) * clamp((s.r - headR) / 60) * (1 - 0.8 * fin);
      ctx.strokeStyle = s.warm ? `rgba(233,196,106,${alpha.toFixed(3)})` : `rgba(239,233,220,${(alpha * 0.8).toFixed(3)})`;
      ctx.lineWidth = s.s;
      ctx.beginPath();
      if (s.px === null) { ctx.moveTo(x, y); ctx.lineTo(x + 0.5, y + 0.5); } else { ctx.moveTo(s.px, s.py); ctx.lineTo(x, y); }
      ctx.stroke();
      s.px = x; s.py = y;
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      const dx = head.x - b.x, dy = head.y - b.y, d = Math.hypot(dx, dy) || 1;
      const acc = Math.min(4000, 1.1e6 / (d * d + 3000));
      b.vx += (dx / d) * acc * dt; b.vy += (dy / d) * acc * dt;
      b.vx *= 0.992; b.vy *= 0.992;
      b.x += b.vx * dt; b.y += b.vy * dt; b.life += dt;
      if (d < headR * 0.7 || b.life > 6) { bits.splice(i, 1); continue; }
      ctx.strokeStyle = b.c; ctx.globalAlpha = clamp(d / 50) * 0.9; ctx.lineWidth = b.s;
      ctx.beginPath();
      ctx.moveTo(b.px ?? b.x, b.py ?? b.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      b.px = b.x; b.py = b.y;
    }
    ctx.globalAlpha = 1;

    // disco de luz difusa (sem anéis visíveis): só brilho achatado à volta da cabeça
    if (I > 0.01) {
      ctx.save(); ctx.translate(head.x, head.y); ctx.rotate(-0.14); ctx.scale(1, 0.34);
      const dr = headR * 7;
      const dg = ctx.createRadialGradient(0, 0, headR * 0.8, 0, 0, dr);
      dg.addColorStop(0, `rgba(255,236,190,${(I * 0.22).toFixed(3)})`);
      dg.addColorStop(0.4, `rgba(233,196,106,${(I * 0.1).toFixed(3)})`);
      dg.addColorStop(1, 'rgba(233,196,106,0)');
      ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, dr, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    const gr = headR * (1.6 + A * 3.2 + I * 1.6) * (1 + 0.12 * breathe * A);
    const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, gr);
    g.addColorStop(0, `rgba(255,244,214,${(0.04 + 0.08 * A + 0.14 * I).toFixed(3)})`);
    g.addColorStop(0.35, `rgba(233,196,106,${(0.03 + 0.05 * A + 0.1 * I).toFixed(3)})`);
    g.addColorStop(1, 'rgba(233,196,106,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(head.x, head.y, gr, 0, Math.PI * 2); ctx.fill();
  }

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
  addEventListener('neuromedit:languagechange', () => requestAnimationFrame(rebuild));

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    rebuild();
    requestAnimationFrame(t => { last = t; frame(t); });
    // a navegação inferior é criada por outro script; medimos de novo quando tudo carregar
    const late = () => setTimeout(() => { collect(); measure(); }, 300);
    if (document.readyState === 'complete') late(); else addEventListener('load', late);
  });
})();
