/* NeuroMedit — Pessoa de luz
   Uma pessoa meditando feita só de brilho: uma névoa difusa com a forma
   do corpo e centenas de pontos de luz que respiram. Sem contornos.
   Uso:
     const fig = NeuroMeditLuzFigure.create();
     fig.draw(ctx, cx, cy, size, tempoEmSegundos, { form, breath, glow });
     fig.head(cx, cy, size) -> { x, y, r }
*/
(() => {
  if (window.NeuroMeditLuzFigure) return;

  // Silhueta numa caixa de 200×200 (cabeça + corpo com o vão entre braços e tronco)
  const BODY = "M100 66 C92 66 86 68 82 72 C72 74 64 78 60 88 C56 100 54 114 50 128 C47 138 40 146 32 152 C22 158 18 168 26 174 C40 182 70 182 100 180 C130 182 160 182 174 174 C182 168 178 158 168 152 C160 146 153 138 150 128 C146 114 144 100 140 88 C136 78 128 74 118 72 C114 68 108 66 100 66 Z M70 106 C68 120 62 134 55 146 C66 147 76 143 82 136 C77 127 73 118 70 106 Z M130 106 C132 120 138 134 145 146 C134 147 124 143 118 136 C123 127 127 118 130 106 Z";
  const HEAD = { x: 100, y: 46, r: 16 };
  const HEART = { x: 100, y: 124 };
  const CX = 100, CY = 106;          // centro visual da figura
  const TAU = Math.PI * 2;

  let sprite = null;
  function getSprite() {
    if (sprite) return sprite;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,250,232,1)");
    gr.addColorStop(0.22, "rgba(255,228,168,.55)");
    gr.addColorStop(0.55, "rgba(233,196,106,.14)");
    gr.addColorStop(1, "rgba(233,196,106,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return (sprite = c);
  }

  function samplePoints(n) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const g = c.getContext("2d");
    const body = new Path2D(BODY);
    const head = new Path2D();
    head.arc(HEAD.x, HEAD.y, HEAD.r, 0, TAU);
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard < n * 60) {
      guard++;
      const x = 18 + Math.random() * 164;
      const y = 28 + Math.random() * 156;
      const inHead = g.isPointInPath(head, x, y);
      const inBody = !inHead && g.isPointInPath(body, x, y, "evenodd");
      if (!inHead && !inBody) continue;
      // mais luz no eixo do corpo e no peito, mais rarefeito nas bordas
      const dx = (x - 100) / 58, dy = (y - HEART.y) / 52;
      const core = Math.exp(-(dx * dx + dy * dy) * 1.1);
      if (Math.random() > (inHead ? 0.95 : 0.3 + 0.7 * core)) continue;
      pts.push({
        x, y,
        ph: Math.random() * TAU,
        f: 0.08 + Math.random() * 0.22,       // movimentos lentos (períodos de 30–80 s)
        s: 0.45 + Math.random() * 1.25,
        b: 0.3 + Math.random() * 0.7,
        ember: Math.random() < 0.07,          // alguns sobem como fumaça de luz
        es: 0.015 + Math.random() * 0.03,
        order: Math.random(),                 // ordem em que se acendem ao formar
      });
    }
    pts.sort((a, b) => a.order - b.order);
    return pts;
  }

  // Névoa com a forma do corpo, pré-renderizada com sombra desfocada
  function makeHaze(size) {
    const s = size / 200;
    const W = Math.ceil(size * 1.9), H = Math.ceil(size * 1.9);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const body = new Path2D(BODY);
    const ox = W / 2 - CX * s, oy = H / 2 - CY * s;
    const FAR = 6000;
    const pass = (blur, color) => {
      g.save();
      g.setTransform(s, 0, 0, s, ox - FAR, oy);
      g.shadowOffsetX = FAR;
      g.shadowBlur = blur;
      g.shadowColor = color;
      g.fillStyle = "#000";
      g.fill(body, "nonzero");
      g.beginPath(); g.arc(HEAD.x, HEAD.y, HEAD.r * 1.05, 0, TAU); g.fill();
      g.restore();
    };
    pass(size * 0.16, "rgba(233,196,106,.55)");
    pass(size * 0.07, "rgba(245,214,140,.45)");
    pass(size * 0.025, "rgba(255,236,190,.35)");
    return c;
  }

  function create(opts = {}) {
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const pts = samplePoints(opts.points || (small ? 650 : 950));
    const spr = getSprite();
    let haze = null, hazeSize = 0;

    function head(cx, cy, size) {
      const s = size / 200;
      return { x: cx + (HEAD.x - CX) * s, y: cy + (HEAD.y - CY) * s, r: HEAD.r * s };
    }

    function draw(ctx, cx, cy, size, t, o = {}) {
      const form = o.form == null ? 1 : o.form;          // 0..1 quanto a pessoa já se formou
      const breath = o.breath == null ? 0.5 : o.breath;  // 0..1 inspiração
      const glow = o.glow == null ? 1 : o.glow;
      const still = !!o.still;                           // movimento reduzido
      if (form <= 0.001 || size < 8) return;
      const s = size / 200;
      const k = 1 + 0.03 * (breath - 0.5);               // o corpo expande ao inspirar

      if (!haze || Math.abs(hazeSize - size) > size * 0.08) { haze = makeHaze(size); hazeSize = size; }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // 1. névoa do corpo
      const hw = haze.width * (size / hazeSize) * k, hh = haze.height * (size / hazeSize) * k;
      ctx.globalAlpha = Math.min(1, form * 1.2) * glow * (0.7 + 0.3 * breath);
      ctx.drawImage(haze, cx - hw / 2, cy - hh / 2, hw, hh);

      // 2. pontos de luz
      const visible = Math.floor(pts.length * Math.min(1, form * 1.15));
      for (let i = 0; i < visible; i++) {
        const p = pts[i];
        let px = p.x, py = p.y, a = p.b * 0.8;
        if (!still) {
          px += Math.sin(t * p.f + p.ph) * 1.4;
          py += Math.cos(t * p.f * 0.8 + p.ph) * 1.4;
          a *= 0.78 + 0.22 * Math.sin(t * p.f + p.ph * 2);   // cintilar quase imperceptível
          if (p.ember) {
            const life = (t * p.es + p.order) % 1;       // sobe e se apaga
            py -= life * 46;
            px += Math.sin(life * 6 + p.ph) * 5;
            a *= Math.sin(life * Math.PI) * 0.9;
          }
        }
        const x = cx + (px - CX) * s * k;
        const y = cy + (py - CY) * s * k;
        const d = p.s * s * 11;
        ctx.globalAlpha = Math.max(0, a) * glow * Math.min(1, (form * 1.15 * pts.length - i) / 40);
        ctx.drawImage(spr, x - d / 2, y - d / 2, d, d);
      }

      // 3. dois centros de luz: mente e coração
      const cores = [
        { p: HEAD, r: 34, a: 0.5 },
        { p: HEART, r: 42, a: 0.28 },
      ];
      for (const c of cores) {
        const x = cx + (c.p.x - CX) * s * k, y = cy + (c.p.y - CY) * s * k;
        const r = c.r * s * (0.9 + 0.25 * breath);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,248,226,${(c.a * glow).toFixed(3)})`);
        g.addColorStop(1, "rgba(255,230,170,0)");
        ctx.globalAlpha = form;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }

      ctx.restore();
    }

    // um ponto aleatório dentro da silhueta (onde a poeira vai pousar)
    function randomPoint() {
      const p = pts[(Math.random() * pts.length) | 0];
      return { x: p.x + (Math.random() - 0.5) * 3, y: p.y + (Math.random() - 0.5) * 3 };
    }
    function toScreen(p, cx, cy, size) {
      const s = size / 200;
      return { x: cx + (p.x - CX) * s, y: cy + (p.y - CY) * s };
    }

    return { draw, head, randomPoint, toScreen };
  }

  /* Respiração-mestra de todos os brilhos: 11 s por ciclo (~5,5 resp/min,
     ritmo de coerência). Inspira 4,5 s, expira 6,5 s — a expiração mais
     longa ativa o sistema parassimpático. Devolve 0 (vazio) … 1 (cheio). */
  const IN = 4.5, OUT = 6.5, CYCLE = IN + OUT;
  function breath(t) {
    const p = ((t % CYCLE) + CYCLE) % CYCLE;
    const x = p < IN ? p / IN : 1 - (p - IN) / OUT;
    return 0.5 - 0.5 * Math.cos(Math.PI * x);
  }

  window.NeuroMeditLuzFigure = { create, breath, CYCLE };
})();
