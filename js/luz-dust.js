/* NeuroMedit — Poeira de luz
   Copia o que está na tela e desfaz cada elemento em poeira que viaja,
   em linha quase reta e sem girar, até pousar dentro da silhueta da
   pessoa de luz. Usado pelos airlocks e pelas boas-vindas do tema. */
(() => {
  if (window.NeuroMeditLuzDust) return;

  const PROPS = [
    "color", "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
    "text-transform", "text-align", "text-decoration-line", "white-space", "background-color", "background-image",
    "border-top", "border-right", "border-bottom", "border-left", "border-radius",
    "padding-top", "padding-right", "padding-bottom", "padding-left", "box-shadow", "text-shadow",
    "display", "align-items", "justify-content", "gap", "flex-direction", "flex-wrap", "grid-template-columns",
    "box-sizing", "fill", "stroke", "width", "height", "overflow",
  ];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

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
    const n = Math.min(a.length, b.length, 500);
    for (let i = 0; i < n; i++) {
      copyStyles(a[i], b[i]);
      b[i].removeAttribute("id");
      [...b[i].attributes].forEach(at => { if (at.name.startsWith("data-") || at.name === "for") b[i].removeAttribute(at.name); });
    }
    return c;
  }

  // Copia os elementos visíveis para uma camada própria e esconde os originais
  function capture({ selector, keep, layer }) {
    const vw = innerWidth, vh = innerHeight;
    const found = [...document.querySelectorAll(selector)].filter(el => {
      if (keep && el.closest(keep)) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return false;
      if (getComputedStyle(el).visibility === "hidden") return false;
      let op = 1;
      for (let p = el; p && p !== document.body; p = p.parentElement) op *= parseFloat(getComputedStyle(p).opacity) || 0;
      return op > 0.05;
    });
    const set = new Set(found);
    const top = found.filter(el => { for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; return true; });

    const items = [], hidden = [];
    top.forEach(el => {
      const r = el.getBoundingClientRect();
      const c = cloneWithStyles(el);
      Object.assign(c.style, {
        position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px",
        opacity: getComputedStyle(el).opacity, willChange: "transform, opacity, filter", pointerEvents: "none",
      });
      layer.appendChild(c);
      items.push({ el: c, r: { x: r.left, y: r.top, w: r.width, h: r.height }, cx: r.left + r.width / 2, cy: r.top + r.height / 2, area: r.width * r.height });
      hidden.push([el, el.style.getPropertyValue("visibility"), el.style.getPropertyPriority("visibility")]);
      el.style.setProperty("visibility", "hidden", "important");   // vence animações CSS
    });

    function restore() {
      hidden.forEach(([el, v, pr]) => { if (v) el.style.setProperty("visibility", v, pr); else el.style.removeProperty("visibility"); });
      hidden.length = 0;
      items.forEach(it => it.el.remove());
    }
    return { items, restore, originals: () => hidden.map(h => h[0]) };
  }

  /* Desintegração: cada elemento esmaece no lugar enquanto solta a sua
     poeira. Os grãos seguem para dentro da silhueta.
     opts.target()      → {x,y}  centro de atração (para a ordem de queda)
     opts.land(p)       → {x,y}  onde o grão p pousa agora (a figura respira)
     opts.pick()        → ponto de pouso (em coordenadas da figura)       */
  function dissolver(items, opts) {
    const maxParts = opts.maxParts || (Math.min(innerWidth, innerHeight) < 700 ? 900 : 1600);
    const totalArea = items.reduce((s, it) => s + it.area, 0) || 1;
    const tg = opts.target();
    const dMax = Math.max(1, ...items.map(it => Math.hypot(it.cx - tg.x, it.cy - tg.y)));
    const spread = opts.spread == null ? 0.9 : opts.spread;
    items.forEach(it => {
      it.delay = (Math.hypot(it.cx - tg.x, it.cy - tg.y) / dMax) * spread + Math.random() * 0.1;
      it.n = Math.round(clamp(maxParts * (it.area / totalArea), 6, 220));
    });
    const parts = [];
    const state = { total: 0, arrived: 0, done: false, planned: items.reduce((n, it) => n + it.n, 0) };

    function spawn(it) {
      for (let i = 0; i < it.n; i++) {
        const x = it.r.x + Math.random() * it.r.w, y = it.r.y + Math.random() * it.r.h;
        parts.push({
          x0: x, y0: y, birth: it.delay + Math.random() * 0.85, dur: 1.5 + Math.random() * 1.1,
          off: (Math.random() - 0.5) * 0.12, land: opts.pick(), s: 0.6 + Math.random() * 1.3, warm: Math.random() < 0.6,
        });
      }
      state.total += it.n;
    }

    function ease(q) { return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; }

    state.step = (ctx, t) => {
      let live = 0;
      for (const it of items) {
        if (it.gone) continue;
        const e = clamp((t - it.delay) / 1.15);
        if (e > 0 && !it.spawned) { it.spawned = true; spawn(it); }
        if (e > 0) {
          // esmaece no lugar, com um leve deslizar para o centro (sem girar)
          const c = opts.target();
          const k = 0.08 * e;
          it.el.style.transform = `translate3d(${((c.x - it.cx) * k).toFixed(1)}px,${((c.y - it.cy) * k).toFixed(1)}px,0) scale(${(1 - 0.06 * e).toFixed(3)})`;
          it.el.style.opacity = String(Math.pow(1 - e, 1.6));
          it.el.style.filter = `blur(${(e * 5).toFixed(1)}px)`;
        }
        if (e >= 1) { it.gone = true; it.el.remove(); } else live++;
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        const q = (t - p.birth) / p.dur;
        if (q < 0) { live++; continue; }
        if (q >= 1) { parts.splice(i, 1); state.arrived++; continue; }
        live++;
        const L = opts.land(p.land);
        const e = ease(q);
        const mx = (p.x0 + L.x) / 2, my = (p.y0 + L.y) / 2;
        const dx = L.x - p.x0, dy = L.y - p.y0;
        const cx = mx - dy * p.off, cy = my + dx * p.off;        // curva suave, sempre em direção ao centro
        const x = (1 - e) * (1 - e) * p.x0 + 2 * (1 - e) * e * cx + e * e * L.x;
        const y = (1 - e) * (1 - e) * p.y0 + 2 * (1 - e) * e * cy + e * e * L.y;
        const a = Math.min(1, q * 8) * (1 - Math.max(0, (q - 0.85) / 0.15)) * 0.85;
        ctx.fillStyle = p.warm ? `rgba(255,222,150,${a.toFixed(3)})` : `rgba(255,246,228,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, p.s, 0, 6.283); ctx.fill();
      }
      ctx.restore();
      state.done = live === 0;
      return state;
    };
    state.progress = () => (state.planned ? state.arrived / state.planned : 1);
    return state;
  }

  window.NeuroMeditLuzDust = { capture, dissolver };
})();
