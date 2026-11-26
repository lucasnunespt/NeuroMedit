/* ==========================================================
   faixa-terra.js — a faixa da comunidade na home.
   Um mapa plano em pontos de luz, na projeção Equal Earth (áreas verdadeiras:
   a África e o Brasil no tamanho real), recortado no mundo entre as Américas e a
   Europa. Decorativo: o texto da faixa diz tudo; o mapa é parado (sem loop).
   Cores: as variáveis --terra-* de terra.css (acento nos temas claros, luz nos escuros). Dados: data/terra.json, como a Terra.
   ========================================================== */
import { CIDADES_INICIAIS } from "./cidades-lista.js";

// Equal Earth (Šavrič, Patterson e Jenny, 2018).
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180, LON0 = -20; // meridiano central: o Atlântico, entre o Brasil e Portugal
function equalEarth(lat, lon) {
  const th = Math.asin(M * Math.sin(lat * RAD)), t2 = th * th, t6 = t2 * t2 * t2;
  const l = (((lon - LON0 + 540) % 360) - 180) * RAD;
  return [l * Math.cos(th) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2))), th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))];
}
// O recorte: das Américas à Europa e à África.
const [X0] = equalEarth(0, -100), [X1] = equalEarth(0, 60), [, Y1] = equalEarth(68, 0), [, Y0] = equalEarth(-42, 0);

let dados = null;
async function desenhar(cv) {
  dados ??= await fetch("data/terra.json").then((r) => r.json());
  const r = cv.getBoundingClientRect();
  if (!r.width) return;
  const dpr = Math.min(devicePixelRatio || 1, 2), W = r.width, H = r.height;
  cv.width = W * dpr; cv.height = H * dpr;
  const cx = cv.getContext("2d"); cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
  const css = getComputedStyle(cv), tok = (n) => css.getPropertyValue(n).trim();
  const COR = { terra: tok("--terra-mundo"), nucleo: tok("--terra-ativo"), meio: tok("--terra-halo"), ouro: tok("--terra-ouro") };
  // O recorte inteiro cabe: no computador encosta à direita (o texto fica à esquerda); no telemóvel ocupa a largura.
  const largo = W > 640, k = Math.min(H / (Y1 - Y0), (largo ? W * 0.66 : W) / (X1 - X0));
  const ox = largo ? W - (X1 - X0) * k : (W - (X1 - X0) * k) / 2, oy = H - (H - (Y1 - Y0) * k) / 2;
  const xy = (lat, lon) => { const [x, y] = equalEarth(lat, lon); return [ox + (x - X0) * k, oy - (y - Y0) * k]; };
  const p = dados.pontos, s = Math.max(1, Math.min(2, k / 160));
  for (let i = 0; i < p.length; i += 3) {
    const lat = p[i] / 10, lon = p[i + 1] / 10, c = p[i + 2];
    if (lat < -42 || lat > 68) continue;
    const [x, y] = xy(lat, lon);
    if (x < -2 || x > W + 2) continue;
    cx.globalAlpha = c ? 0.7 : 0.32; cx.fillStyle = c ? COR.nucleo : COR.terra;
    cx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  // Fronteiras dos cinco países, em dourado fino.
  cx.globalAlpha = 0.7; cx.strokeStyle = COR.ouro; cx.lineWidth = 0.8; cx.lineJoin = "round";
  cx.beginPath();
  for (const ls of Object.values(dados.linhas.ativos)) for (const l of ls) {
    for (let i = 0; i < l.length; i += 2) { const [x, y] = xy(l[i] / 100, l[i + 1] / 100); if (i) cx.lineTo(x, y); else cx.moveTo(x, y); }
  }
  cx.stroke();
  // As cidades da comunidade: pontos dourados com um halo ténue.
  for (const c of CIDADES_INICIAIS) {
    const [x, y] = xy(c.lat, c.lon);
    const g = cx.createRadialGradient(x, y, 0, x, y, 6);
    g.addColorStop(0, COR.meio); g.addColorStop(1, "transparent");
    cx.globalAlpha = 0.3; cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 6, 0, Math.PI * 2); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = COR.ouro; cx.beginPath(); cx.arc(x, y, 2, 0, Math.PI * 2); cx.fill();
  }
  cx.globalAlpha = 1;
}

document.querySelectorAll("canvas[data-faixa-terra]").forEach((cv) => {
  const ir = () => desenhar(cv).catch(() => {});
  new ResizeObserver(ir).observe(cv);
  // O tema do dia muda sozinho: redesenha com as cores novas.
  new MutationObserver(ir).observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
});
