/* ==========================================================
   terra.js — a Terra do design system NeuroMedit (interativa).
   A Terra em pontos de luz, com fronteiras em linha, numa janela escura da Luz.
   Arrasta para rodar (com inércia), roda/pinça para aproximar, toca num país
   ativo para voar até ele, toca numa cidade para a escolher.

   Cores: só tokens, pelas variáveis --terra-* de terra.css, que mudam com o tema
   (acento nos claros, luz dourada nos escuros). Ao mudar de tema, a Terra relê-as.
   Movimento: o voo usa easing-calm e múltiplos de duration-calm; o único loop é
   a respiração das cidades abertas (duration-breath). Com prefers-reduced-motion,
   tudo parado e as mudanças são imediatas.
   Dados: data/terra.json (pontos de terra e linhas das fronteiras, Natural Earth via
   world-atlas). Só Portugal, Espanha, França, Itália e Brasil respondem ao toque.
   ========================================================== */

const easing = ((x1, y1, x2, y2) => (t) => {
  let a = 0, b = 1, u = t;
  for (let i = 0; i < 20; i++) { u = (a + b) / 2; const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3; if (x < t) a = u; else b = u; }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3;
})(0.22, 1, 0.36, 1); // easing-calm

let terra = null;
const carregarTerra = (url) => (terra ??= fetch(url).then((r) => r.json()).then((d) => {
  const N = d.pontos.length / 3, pts = new Float32Array(N * 3), cod = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const la = d.pontos[i * 3] / 10 * Math.PI / 180;
    pts[i * 3] = Math.sin(la); pts[i * 3 + 1] = Math.cos(la); pts[i * 3 + 2] = d.pontos[i * 3 + 1] / 10 * Math.PI / 180;
    cod[i] = d.pontos[i * 3 + 2];
  }
  const linhas = (ls) => ls.map((l) => {
    const a = new Float32Array(l.length / 2 * 3);
    for (let i = 0; i < l.length / 2; i++) { const la = l[i * 2] / 100 * Math.PI / 180; a[i * 3] = Math.sin(la); a[i * 3 + 1] = Math.cos(la); a[i * 3 + 2] = l[i * 2 + 1] / 100 * Math.PI / 180; }
    return a;
  });
  return { N, pts, cod, codigos: d.codigos, mundo: linhas(d.linhas.mundo), ativos: Object.fromEntries(Object.entries(d.linhas.ativos).map(([k, v]) => [k, linhas(v)])) };
}));

/**
 * @param {object} o
 * @param {{id,nome,pais,lat,lon}[]} o.cidades
 * @param {{id,lat,lon,zoom}[]} o.paises   países ativos (os únicos que respondem ao toque)
 * @param {(id:string)=>boolean} o.aberta  a cidade tem comunidade aberta?
 * @param {{lon,lat,zoom}} o.inicio        vista de partida
 * @param {{lon,lat,zoom}} [o.chegada]     se existir, ao abrir o globo voa uma vez até aqui
 * @param {{lon,lat,zoom}} [o.vista]       para onde volta o botão "início" (por omissão, a chegada)
 * @param {object} o.rotulos               { aria, dica, mais, menos, inicio }
 */
export function criarTerra(o) {
  const el = document.createElement("div");
  el.className = "terra";
  el.innerHTML = `<canvas role="img" aria-label="${o.rotulos.aria}"></canvas>
    <p class="terra-dica">${o.rotulos.dica}</p>
    <div class="terra-ctrl">
      <button type="button" data-g="mais" aria-label="${o.rotulos.mais}" title="${o.rotulos.mais}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
      <button type="button" data-g="menos" aria-label="${o.rotulos.menos}" title="${o.rotulos.menos}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>
      <button type="button" data-g="inicio" aria-label="${o.rotulos.inicio}" title="${o.rotulos.inicio}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/></svg></button>
    </div>
    <div class="terra-etiqueta" aria-hidden="true"></div>`;
  const cv = el.querySelector("canvas"), cx = cv.getContext("2d"), etq = el.querySelector(".terra-etiqueta");
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let COR = null, DUR = 1400, BREATH = 11000;
  const lerTokens = () => {
    const css = getComputedStyle(el), tok = (n) => css.getPropertyValue(n).trim();
    const ms = (n) => { const v = tok(n); return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000; };
    COR = { terra: tok("--terra-mundo"), ativo: tok("--terra-ativo"), ouro: tok("--terra-ouro"), halo: tok("--terra-halo"), meio: tok("--terra-meio"), mar: tok("--terra-mar"), fundo: tok("--terra-fundo") };
    DUR = 2 * (ms("--duration-calm") || 0); BREATH = ms("--duration-breath") || 11000;
  };

  const v = { ...o.inicio, oy: 0 };
  let T = null, W = 0, H = 0, dpr = 1, R0 = 0, sujo = true, vivo = true;
  let paisSel = "", cidSel = "", hover = null, voo = null, vel = { lon: 0, lat: 0 }, arrasto = null, chegou = !o.chegada;

  const medir = () => { const r = cv.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; R0 = Math.min(W, H) * 0.42; sujo = true; };
  const ro = new ResizeObserver(medir); ro.observe(cv);
  // O tema do dia muda sozinho (theme-sync): relê as cores quando o body muda de tema.
  const mo = new MutationObserver(() => { COR = null; sujo = true; });
  mo.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });

  // Projeção ortográfica: (v.lat, v.lon) fica no centro do círculo.
  function proj(sinLa, cosLa, lo) {
    const f0 = v.lat * Math.PI / 180, l0 = v.lon * Math.PI / 180, R = R0 * v.zoom, dl = lo - l0, cdl = Math.cos(dl);
    const c = Math.sin(f0) * sinLa + Math.cos(f0) * cosLa * cdl;
    return [W / 2 + R * cosLa * Math.sin(dl), H / 2 + v.oy - R * (Math.cos(f0) * sinLa - Math.sin(f0) * cosLa * cdl), c];
  }
  const projLL = (lat, lon) => { const la = lat * Math.PI / 180; return proj(Math.sin(la), Math.cos(la), lon * Math.PI / 180); };
  function tracar(ls) {
    cx.beginPath();
    for (const l of ls) { let antes = false; for (let i = 0; i < l.length; i += 3) { const [x, y, c] = proj(l[i], l[i + 1], l[i + 2]); if (c > 0) { if (antes) cx.lineTo(x, y); else cx.moveTo(x, y); antes = true; } else antes = false; } }
    cx.stroke();
  }

  function desenhar(t) {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    const R = R0 * v.zoom, ox = W / 2, oy = H / 2 + v.oy;
    // Atmosfera: um anel dourado só por fora da Terra (o gradiente não pinta o interior).
    const atm = cx.createRadialGradient(ox, oy, R, ox, oy, R * 1.12);
    atm.addColorStop(0, COR.halo); atm.addColorStop(1, "transparent");
    cx.globalAlpha = 0.34; cx.fillStyle = atm; cx.beginPath(); cx.arc(ox, oy, R * 1.12, 0, Math.PI * 2); cx.arc(ox, oy, R, 0, Math.PI * 2, true); cx.fill("evenodd");
    // Oceano: um véu dourado e uma luz de cima à esquerda. De perto, o mar volta ao escuro e a terra sobressai.
    const perto = Math.min(1, 1.6 / v.zoom);
    cx.globalAlpha = 0.22 * perto; cx.fillStyle = COR.mar; cx.beginPath(); cx.arc(ox, oy, R, 0, Math.PI * 2); cx.fill();
    const mar = cx.createRadialGradient(ox - R * 0.35, oy - R * 0.4, R * 0.1, ox, oy, R);
    mar.addColorStop(0, COR.mar); mar.addColorStop(1, "transparent");
    cx.globalAlpha = 0.16 * perto; cx.fillStyle = mar; cx.fill();
    cx.globalAlpha = 0.5; cx.strokeStyle = COR.halo; cx.lineWidth = 1; cx.stroke();
    if (!T) { cx.globalAlpha = 1; return; }
    // Pontos de terra: o resto do mundo ténue; os países ativos quase brancos.
    const tam = Math.max(1, Math.min(2.6, 1.1 * Math.sqrt(v.zoom))), tamD = Math.max(0.9, Math.min(2.2, 0.55 * Math.sqrt(v.zoom) + 0.3));
    for (let i = 0; i < T.N; i++) {
      const [x, y, c] = proj(T.pts[i * 3], T.pts[i * 3 + 1], T.pts[i * 3 + 2]);
      if (c <= 0 || x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
      const k = T.cod[i], pais = T.codigos[k];
      let a = !k ? 0.4 : (paisSel && pais !== paisSel ? 0.55 : (paisSel ? 1 : 0.85));
      if (k && hover && hover.pais === pais) a = 1;
      cx.globalAlpha = a * (0.35 + 0.65 * c); cx.fillStyle = k ? COR.ativo : COR.terra;
      const s = k ? tamD : tam; cx.fillRect(x - s / 2, y - s / 2, s, s);
    }
    // Fronteiras em linha.
    cx.lineJoin = "round";
    cx.globalAlpha = 0.42; cx.strokeStyle = COR.terra; cx.lineWidth = 0.7; tracar(T.mundo);
    for (const [pais, ls] of Object.entries(T.ativos)) {
      const sel = pais === paisSel, hov = hover && hover.pais === pais;
      cx.globalAlpha = sel || hov ? 1 : (paisSel ? 0.45 : 0.75); cx.strokeStyle = COR.ouro; cx.lineWidth = sel ? 1.6 : 1.1; tracar(ls);
    }
    // Cidades: abertas respiram em dourado; em breve, ponto claro com anel escuro.
    const resp = reduz ? 1 : 0.62 + 0.38 * (0.5 - 0.5 * Math.cos((t % BREATH) / BREATH * Math.PI * 2));
    for (const ci of o.cidades) {
      const [x, y, c] = projLL(ci.lat, ci.lon);
      if (c <= 0.02) continue;
      const b = 0.4 + 0.6 * c, sel = ci.id === cidSel, hov = hover && hover.cidade === ci.id;
      if (o.aberta(ci.id)) {
        const g = cx.createRadialGradient(x, y, 0, x, y, 16 + 6 * resp);
        g.addColorStop(0, COR.halo); g.addColorStop(1, "transparent");
        cx.globalAlpha = 0.55 * resp * b; cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 22, 0, Math.PI * 2); cx.fill();
        cx.globalAlpha = b; cx.fillStyle = COR.ouro; cx.beginPath(); cx.arc(x, y, 4.2, 0, Math.PI * 2); cx.fill();
        cx.fillStyle = COR.fundo; cx.beginPath(); cx.arc(x, y, 1.6, 0, Math.PI * 2); cx.fill();
      } else {
        if (paisSel && ci.pais !== paisSel && !sel) continue;
        cx.globalAlpha = (sel || hov ? 1 : 0.9) * b; cx.fillStyle = COR.meio; cx.strokeStyle = COR.fundo; cx.lineWidth = 1.5;
        cx.beginPath(); cx.arc(x, y, sel || hov ? 4 : 3, 0, Math.PI * 2); cx.stroke(); cx.fill();
      }
      if (sel) { cx.globalAlpha = b; cx.strokeStyle = COR.ouro; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(x, y, 9, 0, Math.PI * 2); cx.stroke(); }
    }
    cx.globalAlpha = 1;
    const hc = hover?.cidade && o.cidades.find((c) => c.id === hover.cidade);
    if (hc) { const [x, y, c] = projLL(hc.lat, hc.lon); if (c > 0) { etq.style.left = `${x}px`; etq.style.top = `${y}px`; etq.textContent = hc.nome; etq.classList.add("is-on"); } }
    else etq.classList.remove("is-on");
  }

  function voar(alvo, dur = DUR) {
    const de = { ...v }, dl = ((alvo.lon - de.lon + 540) % 360) - 180;
    voo = { de, para: { lon: de.lon + dl, lat: alvo.lat, zoom: alvo.zoom, oy: alvo.oy || 0 }, t0: performance.now(), dur: reduz ? 0 : dur };
    vel = { lon: 0, lat: 0 }; sujo = true;
  }
  function quadro(t) {
    if (!vivo) return;
    if (!el.isConnected) { requestAnimationFrame(quadro); return; }
    if (!COR) lerTokens();
    if (!W) medir();
    if (!chegou && T && W) { chegou = true; voar(o.chegada, DUR * 1.5); }
    if (voo) {
      const p = voo.dur ? Math.min(1, (t - voo.t0) / voo.dur) : 1, e = easing(p);
      v.lon = voo.de.lon + (voo.para.lon - voo.de.lon) * e; v.lat = voo.de.lat + (voo.para.lat - voo.de.lat) * e;
      v.zoom = Math.exp(Math.log(voo.de.zoom) + (Math.log(voo.para.zoom) - Math.log(voo.de.zoom)) * e); // zoom em escala log
      v.oy = voo.de.oy + (voo.para.oy - voo.de.oy) * e;
      if (p >= 1) voo = null; sujo = true;
    } else if (!arrasto && (Math.abs(vel.lon) > 0.01 || Math.abs(vel.lat) > 0.01)) {
      v.lon += vel.lon; v.lat = Math.max(-80, Math.min(80, v.lat + vel.lat)); vel.lon *= 0.93; vel.lat *= 0.93; sujo = true;
    }
    // Sem movimento reduzido, redesenha sempre (a respiração das cidades abertas); com ele, só quando muda.
    if (W && (sujo || !reduz)) { desenhar(t); sujo = false; }
    requestAnimationFrame(quadro);
  }

  // ---------- Toque, rato e teclado ----------
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function alvoEm(x, y) {
    let melhor = null, d0 = 16 * 16;
    for (const ci of o.cidades) {
      const [px, py, c] = projLL(ci.lat, ci.lon);
      if (c <= 0.02 || (paisSel && ci.pais !== paisSel && !o.aberta(ci.id))) continue;
      const d = (px - x) ** 2 + (py - y) ** 2; if (d < d0) { d0 = d; melhor = { cidade: ci.id, pais: ci.pais }; }
    }
    if (melhor || !T) return melhor;
    let dp = 10 * 10, pais = "";
    for (let i = 0; i < T.N; i++) {
      if (!T.cod[i]) continue;
      const [px, py, c] = proj(T.pts[i * 3], T.pts[i * 3 + 1], T.pts[i * 3 + 2]);
      if (c <= 0) continue;
      const d = (px - x) ** 2 + (py - y) ** 2; if (d < dp) { dp = d; pais = T.codigos[T.cod[i]]; }
    }
    return pais ? { pais } : null;
  }
  const toques = new Map(); let pin = null;
  cv.addEventListener("pointerdown", (e) => {
    cv.setPointerCapture(e.pointerId);
    const [x, y] = pos(e);
    if (e.pointerType === "touch") { toques.set(e.pointerId, [x, y]); if (toques.size === 2) { const [a, b] = [...toques.values()]; pin = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: v.zoom }; arrasto = null; return; } }
    arrasto = { x, y, x0: x, y0: y, moveu: false }; voo = null; vel = { lon: 0, lat: 0 }; el.classList.add("is-arrastar");
  });
  cv.addEventListener("pointermove", (e) => {
    const [x, y] = pos(e);
    if (toques.has(e.pointerId)) toques.set(e.pointerId, [x, y]);
    if (pin && toques.size === 2) { const [a, b] = [...toques.values()]; v.zoom = Math.max(0.8, Math.min(14, pin.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pin.d)); sujo = true; return; }
    if (arrasto) {
      const dx = x - arrasto.x, dy = y - arrasto.y, k = 180 / Math.PI / (R0 * v.zoom);
      if (Math.abs(x - arrasto.x0) + Math.abs(y - arrasto.y0) > 4) arrasto.moveu = true;
      v.lon -= dx * k; v.lat = Math.max(-80, Math.min(80, v.lat + dy * k)); vel = reduz ? { lon: 0, lat: 0 } : { lon: -dx * k, lat: dy * k };
      arrasto.x = x; arrasto.y = y; sujo = true; return;
    }
    if (e.pointerType === "mouse") { const h = alvoEm(x, y); if (JSON.stringify(h) !== JSON.stringify(hover)) { hover = h; sujo = true; cv.style.cursor = h ? "pointer" : ""; } }
  });
  const soltar = (e) => {
    toques.delete(e.pointerId); if (toques.size < 2) pin = null;
    el.classList.remove("is-arrastar");
    const a = arrasto; arrasto = null;
    if (!a || a.moveu || e.type === "pointercancel") return;
    const h = alvoEm(...pos(e));
    if (h?.cidade) { escolherCidade(h.cidade); o.aoEscolherCidade?.(h.cidade); }
    else if (h?.pais) { escolherPais(h.pais); o.aoEscolherPais?.(h.pais); }
  };
  cv.addEventListener("pointerup", soltar); cv.addEventListener("pointercancel", soltar);
  cv.addEventListener("pointerleave", () => { if (hover) { hover = null; sujo = true; } });
  cv.addEventListener("wheel", (e) => { e.preventDefault(); v.zoom = Math.max(0.8, Math.min(14, v.zoom * Math.exp(-e.deltaY * 0.0015))); voo = null; sujo = true; }, { passive: false });
  el.querySelector('[data-g="mais"]').onclick = () => voar({ lon: v.lon, lat: v.lat, zoom: Math.min(14, v.zoom * 1.8), oy: v.oy }, DUR / 2);
  el.querySelector('[data-g="menos"]').onclick = () => voar({ lon: v.lon, lat: v.lat, zoom: Math.max(0.8, v.zoom / 1.8), oy: v.oy }, DUR / 2);
  el.querySelector('[data-g="inicio"]').onclick = () => { limpar(); o.aoLimpar?.(); };

  // ---------- Escolher (também chamado de fora: a lista e os passos) ----------
  function escolherPais(id) {
    const p = o.paises.find((x) => x.id === id); if (!p) return;
    paisSel = id; cidSel = ""; sujo = true; voar({ lon: p.lon, lat: p.lat, zoom: p.zoom });
  }
  function escolherCidade(id) {
    const c = o.cidades.find((x) => x.id === id); if (!c) return;
    const p = o.paises.find((x) => x.id === c.pais);
    paisSel = c.pais; cidSel = id; sujo = true; voar({ lon: c.lon, lat: c.lat, zoom: (p?.zoom || 3) * 1.3 });
  }
  function limpar() { paisSel = ""; cidSel = ""; sujo = true; voar(o.vista || o.chegada || o.inicio); }

  carregarTerra(o.dados || "data/terra.json").then((d) => { T = d; sujo = true; }).catch(() => {});
  requestAnimationFrame(quadro);
  return {
    el, escolherPais, escolherCidade, limpar,
    atualizar() { COR = null; sujo = true; },
    destruir() { vivo = false; ro.disconnect(); mo.disconnect(); el.remove(); }
  };
}
