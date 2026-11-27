/* ==========================================================
   pesquisa-pessoas.js — a pesquisa (bottom-nav.js) também encontra pessoas.
   - Profissionais aprovados (públicos): levam à página com reservas (perfil.html).
   - Membros da comunidade (só para quem já é membro, pelas regras): levam a comunidade.html#u=…
   Carrega uma vez, na primeira pesquisa, e procura por nome, @, o que faz, cidade e interesses.
   ========================================================== */
import { auth } from "./firebase-init.js";
import { lerPerfil } from "./perfil-dados.js";
import { comPro } from "./reservas-dados.js";
import { prosAprovados } from "./conta-pro.js";

const norm = (v) => String(v || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
let todas = null;

async function carregar() {
  const [lucas, pros] = await Promise.all([lerPerfil().catch(() => null), prosAprovados().catch(() => [])]);
  const mapa = new Map();
  if (lucas?.nome) mapa.set("lucas", { nome: lucas.nome, sub: lucas.profissao || "", cidade: lucas.cidade || "", foto: lucas.foto || "", href: comPro("perfil.html", ""), pro: true, extra: "" });
  pros.filter((p) => p.perfil?.nome).forEach((p) => mapa.set(p.id, { nome: p.perfil.nome, sub: p.perfil.profissao || "", cidade: p.perfil.cidade || "", foto: p.perfil.foto || "", href: comPro("perfil.html", p.id), pro: true, extra: p.perfil.area || "" }));
  // Membros da comunidade: só quem já é membro os pode ler. Para os outros, a consulta falha em silêncio.
  try {
    await auth.authStateReady?.();
    if (auth.currentUser) {
      const { membrosAprovados } = await import("./comunidade-dados.js");
      // Só quem escolheu um @ (perfil completo) aparece na pesquisa.
      (await membrosAprovados()).filter((m) => m.usuario).forEach((m) => {
        const ja = mapa.get(m.id) || (m.papel === "admin" ? mapa.get("lucas") : null);
        const fotoCurta = m.foto && m.foto.length < 600 ? m.foto : (m.foto || "");
        if (ja) { ja.usuario = m.usuario || ""; ja.extra += " " + (m.bio || "") + " " + (m.interesses || []).join(" "); return; }
        mapa.set(m.id, { nome: m.nome || "", sub: m.usuario ? "@" + m.usuario : "", cidade: "", foto: fotoCurta, href: `comunidade.html#u=${encodeURIComponent(m.id)}`, pro: m.papel === "professor" || m.papel === "admin", usuario: m.usuario || "", extra: (m.bio || "") + " " + (m.interesses || []).join(" ") });
      });
    }
  } catch { /* sem acesso à comunidade: só os profissionais públicos */ }
  return [...mapa.values()].filter((p) => p.nome);
}

/** Até 5 pessoas para a pesquisa (professores primeiro). */
export async function pessoasPara(texto) {
  const q = norm(texto).replace(/^@/, "").trim();
  if (q.length < 2) return [];
  todas ??= carregar();
  const lista = await todas;
  const palavras = q.split(/\s+/).filter(Boolean);
  return lista
    .map((p) => {
      const nome = norm(p.nome), resto = norm([p.usuario, p.sub, p.cidade, p.extra].join(" "));
      let pontos = 0;
      for (const w of palavras) { if (nome.split(/\s+/).some((x) => x.startsWith(w))) pontos += 3; else if (norm(p.usuario).startsWith(w)) pontos += 3; else if (resto.includes(w)) pontos += 1; else return null; }
      return { p, pontos: pontos + (p.pro ? 0.5 : 0) };
    })
    .filter(Boolean)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 5)
    .map((x) => x.p);
}
