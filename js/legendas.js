/* NeuroMedit — Legendas da voz guiada
   Para quem não ouve (ou prefere ler): mostra o texto da narração no
   ritmo do áudio. Liga-se em Configurações → Uso → Legendas.
   Cada áudio procura o seu arquivo em legendas/<nome-do-áudio>.vtt
   (ex.: audio/intro-v2.mp3 → legendas/intro-v2.vtt). Sem arquivo, nada aparece. */
(() => {
  if (window.NeuroMeditLegendas) return;
  window.NeuroMeditLegendas = true;

  const on = () => !!window.NeuroMeditSettings?.get?.().captions;
  const box = document.createElement("div");
  box.className = "nm-caption";
  box.setAttribute("aria-hidden", "true");     // é um apoio visual; leitores de tela já têm o áudio
  document.body.appendChild(box);

  const style = document.createElement("style");
  style.textContent = `
    .nm-caption{position:fixed;left:50%;bottom:14vh;transform:translateX(-50%);z-index:55;max-width:min(34ch,88vw);
      padding:.55em 1em;border-radius:14px;text-align:center;font-size:clamp(1rem,2.4vw,1.2rem);line-height:1.5;
      color:#f6eedd;background:rgba(10,8,6,.42);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
      text-shadow:0 1px 8px rgba(0,0,0,.5);opacity:0;transition:opacity 1.2s ease;pointer-events:none}
    .nm-caption.is-visible{opacity:1}
    .luz-active .nm-caption{background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;text-shadow:0 0 18px rgba(233,196,106,.35)}`;
  document.head.appendChild(style);

  const cache = {};
  let cues = [], currentSrc = "", audio = null;

  function nameFor(src) {
    let n = decodeURIComponent((src || "").split("?")[0].split("/").pop() || "");
    while (/\.(mp3|m4a|wav|ogg|aac)$/i.test(n)) n = n.replace(/\.(mp3|m4a|wav|ogg|aac)$/i, "");
    return n;
  }

  function toSec(ts) {
    const p = ts.trim().replace(",", ".").split(":").map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  }

  function parse(text) {
    const out = [];
    text.replace(/\r/g, "").split(/\n\n+/).forEach(block => {
      const lines = block.split("\n");
      const i = lines.findIndex(l => l.includes("-->"));
      if (i < 0) return;
      const [a, b] = lines[i].split("-->");
      const body = lines.slice(i + 1).join("\n").trim();
      if (body) out.push({ start: toSec(a), end: toSec(b.split(" ").filter(Boolean)[0]), text: body });
    });
    return out;
  }

  async function load(src) {
    const name = nameFor(src);
    if (!name) { cues = []; return; }
    if (!(name in cache)) {
      cache[name] = fetch(`legendas/${name}.vtt`).then(r => (r.ok ? r.text() : "")).then(parse).catch(() => []);
    }
    cues = await cache[name];
  }

  function pickAudio() {
    return document.querySelector("#airlockAudio, [data-session-audio]");
  }

  let shown = "";
  function tick() {
    document.documentElement.classList.toggle("nm-captions-on", on() && cues.length > 0);
    audio = audio || pickAudio();
    if (audio) {
      const src = audio.currentSrc || audio.getAttribute("src") || audio.querySelector("source")?.getAttribute("src") || "";
      if (src && src !== currentSrc) { currentSrc = src; load(src); }
      const t = audio.currentTime;
      const cue = on() && !audio.paused ? cues.find(c => t >= c.start && t < c.end) : null;
      const text = cue ? cue.text : "";
      if (text !== shown) {
        shown = text;
        if (text) { box.textContent = text; box.classList.add("is-visible"); }
        else box.classList.remove("is-visible");
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
