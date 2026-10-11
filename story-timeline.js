/* story-timeline.js — linha do tempo horizontal da página da história.
   Cada capítulo é um neurónio; as ligações entre eles são desenhadas em SVG e
   acendem à medida que se avança. Sem animações com duração: o que se move é o
   scroll da própria pessoa. Sem JavaScript, a faixa continua a deslizar. */
(() => {
  const root = document.querySelector("[data-story]");
  if (!root) return;

  const sticky = root.querySelector("[data-story-sticky]");
  const scroller = root.querySelector("[data-story-scroller]");
  const track = root.querySelector("[data-story-track]");
  const svg = root.querySelector("[data-story-svg]");
  const nodes = Array.from(root.querySelectorAll("[data-story-node]"));
  const prev = root.querySelector("[data-story-prev]");
  const next = root.querySelector("[data-story-next]");
  const current = root.querySelector("[data-story-current]");
  const total = root.querySelector("[data-story-total]");
  const NS = "http://www.w3.org/2000/svg";
  const AXIS = 44;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let pinned = false;
  let maxScroll = 0;
  let active = 0;
  let dots = [];
  let segments = [];
  let halos = [];

  const pad = (n) => String(n).padStart(2, "0");
  const el = (name, attrs) => {
    const node = document.createElementNS(NS, name);
    Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };
  const bezier = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  };

  function draw() {
    const width = track.scrollWidth;
    svg.setAttribute("viewBox", "0 0 " + width + " " + AXIS * 2);
    svg.setAttribute("width", width);
    svg.setAttribute("height", AXIS * 2);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    dots = [];
    segments = [];
    halos = [];

    const centers = nodes.map((node) => ({ x: node.offsetLeft + node.offsetWidth / 2, y: AXIS }));

    centers.slice(0, -1).forEach((from, i) => {
      const to = centers[i + 1];
      const dx = to.x - from.x;
      const bend = (i % 2 === 0 ? -1 : 1) * 20;
      const c1 = { x: from.x + dx * 0.35, y: AXIS + bend };
      const c2 = { x: to.x - dx * 0.35, y: AXIS - bend };
      const group = el("g", { class: "story-link" });

      group.appendChild(el("path", {
        class: "story-segment",
        d: "M" + from.x + " " + from.y + " C" + c1.x + " " + c1.y + " " + c2.x + " " + c2.y + " " + to.x + " " + to.y
      }));

      [0.3, 0.52, 0.74].forEach((t, k) => {
        const base = bezier(from, c1, c2, to, t);
        const up = (i + k) % 2 === 0 ? -1 : 1;
        const reach = 14 + ((i * 7 + k * 11) % 12);
        const tip = { x: base.x + (k - 1) * 12, y: base.y + up * reach };
        group.appendChild(el("path", {
          class: "story-branch",
          d: "M" + base.x + " " + base.y + " Q" + (base.x + (k - 1) * 3) + " " + (base.y + up * reach * 0.5) + " " + tip.x + " " + tip.y
        }));
        group.appendChild(el("circle", { class: "story-bud", cx: tip.x, cy: tip.y, r: 2.4 }));
      });

      svg.appendChild(group);
      segments.push(group);
    });

    centers.forEach((center) => {
      const halo = el("circle", { class: "story-halo", cx: center.x, cy: center.y, r: 20 });
      const dot = el("circle", { class: "story-dot", cx: center.x, cy: center.y, r: 9 });
      svg.appendChild(halo);
      svg.appendChild(dot);
      halos.push(halo);
      dots.push(dot);
    });

    paint();
  }

  function paint() {
    nodes.forEach((node, i) => {
      node.classList.toggle("is-active", i === active);
      node.classList.toggle("is-passed", i < active);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      dot.classList.toggle("is-passed", i < active);
    });
    halos.forEach((halo, i) => halo.classList.toggle("is-active", i === active));
    segments.forEach((segment, i) => segment.classList.toggle("is-passed", i < active));
    current.textContent = pad(active + 1);
    prev.disabled = active === 0;
    next.disabled = active === nodes.length - 1;
  }

  function nearest() {
    const middle = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    nodes.forEach((node, i) => {
      const distance = Math.abs(node.offsetLeft + node.offsetWidth / 2 - middle);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  }

  function goTo(index) {
    const target = Math.max(0, Math.min(nodes.length - 1, index));
    const node = nodes[target];
    const left = Math.max(0, Math.min(maxScroll, node.offsetLeft + node.offsetWidth / 2 - scroller.clientWidth / 2));
    const behavior = reduceMotion ? "auto" : "smooth";

    if (pinned && maxScroll > 0) {
      const top = root.getBoundingClientRect().top + window.scrollY;
      const range = root.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + (left / maxScroll) * range, behavior });
      return;
    }
    scroller.scrollTo({ left, behavior });
  }

  /* Modo fixo: enquanto a linha do tempo está no ecrã, rolar a página para baixo
     move a linha para o lado (da direita para a esquerda). Só se ela couber no ecrã. */
  function layout() {
    root.classList.remove("is-pinned");
    root.style.height = "";
    maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    pinned = maxScroll > 0 && sticky.offsetHeight + 96 <= window.innerHeight;
    if (pinned) {
      root.classList.add("is-pinned");
      root.style.height = window.innerHeight + maxScroll + "px";
    }
  }

  function syncFromPage() {
    if (!pinned) return;
    const range = root.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -root.getBoundingClientRect().top / range));
    scroller.scrollLeft = progress * maxScroll;
  }

  let frame = 0;
  scroller.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = nearest();
      if (index !== active) {
        active = index;
        paint();
      }
    });
  });

  prev.addEventListener("click", () => goTo(active - 1));
  next.addEventListener("click", () => goTo(active + 1));
  svg.addEventListener("click", (event) => {
    const index = dots.indexOf(event.target);
    if (index > -1) goTo(index);
  });
  scroller.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
  });
  window.addEventListener("load", () => { layout(); draw(); syncFromPage(); });
  window.addEventListener("scroll", syncFromPage, { passive: true });
  window.addEventListener("resize", () => { layout(); draw(); syncFromPage(); });

  total.textContent = pad(nodes.length);
  layout();
  draw();
  syncFromPage();
})();
