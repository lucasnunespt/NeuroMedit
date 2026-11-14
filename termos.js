/**
 * termos.js — como cada profissão chama aquilo que oferece.
 *
 * Um professor de yoga dá aulas, um psicólogo dá consultas, um treinador dá treinos.
 * Chamar "sessão" a tudo faz o painel parecer emprestado de outra pessoa.
 * As áreas são as mesmas do formulário de entrada (profissional.html).
 *
 * Uso: termosDe(perfil.area) devolve as quatro formas da palavra, e aplicarTermos(raiz, area)
 * troca o texto de cada elemento com data-t ("sg", "pl", "Sg", "Pl").
 */

const SESSAO = { sg: "sessão", pl: "sessões", Sg: "Sessão", Pl: "Sessões" };
const AULA = { sg: "aula", pl: "aulas", Sg: "Aula", Pl: "Aulas" };
const CONSULTA = { sg: "consulta", pl: "consultas", Sg: "Consulta", Pl: "Consultas" };
const TREINO = { sg: "treino", pl: "treinos", Sg: "Treino", Pl: "Treinos" };

const POR_AREA = {
  "Meditação": SESSAO,
  "Yoga": AULA,
  "Pilates": AULA,
  "Treino e educação física": TREINO,
  "Massagem": SESSAO,
  "Terapias holísticas": SESSAO,
  "Coaching": SESSAO,
  "Fisioterapia": CONSULTA,
  "Psicologia": CONSULTA,
  "Nutrição": CONSULTA,
  "Outra": SESSAO
};

/**
 * As áreas, por ordem de apresentação, com a marca de saúde: quem trabalha com saúde
 * tem deveres diferentes, e o aviso de "não é terapia" não se aplica.
 */
/** Aviso que as áreas que não são de saúde levam na página (não é terapia nem tratamento). */
export const AVISO_BEM_ESTAR = "É uma prática de bem-estar. Não é terapia nem tratamento, e não substitui psicólogo ou médico.";

export const AREAS = [
  ["Meditação", false], ["Yoga", false], ["Pilates", false], ["Treino e educação física", false],
  ["Massagem", false], ["Terapias holísticas", false], ["Coaching", false],
  ["Fisioterapia", true], ["Psicologia", true], ["Nutrição", true], ["Outra", false]
];

/** Nome da área na língua do site (o valor guardado fica em português). */
export function nomeArea(area) {
  const i = AREAS.findIndex(([n]) => n === area);
  if (i < 0 || typeof getTranslation !== "function" || typeof getPreferredLanguage !== "function") return area;
  const k = "area_" + i, v = getTranslation(getPreferredLanguage(), k);
  return v && v !== k && v !== `[${k}]` ? v : area;
}

/** As quatro formas da palavra para uma área. Área desconhecida ou vazia: "sessão". */
export function termosDe(area) {
  const base = POR_AREA[area] || SESSAO;
  if (typeof getTranslation !== "function" || typeof getPreferredLanguage !== "function") return base;
  const lang = getPreferredLanguage();
  if (lang === "pt") return base;
  const id = base === AULA ? "aula" : base === CONSULTA ? "consulta" : base === TREINO ? "treino" : "sessao";
  const ler = (f) => { const k = `term_${id}_${f}`, v = getTranslation(lang, k); return v && v !== k && v !== `[${k}]` ? v : base[f]; };
  const sg = ler("sg"), pl = ler("pl"), cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  return { sg, pl, Sg: cap(sg), Pl: cap(pl) };
}

/** O aviso de bem-estar na língua do site, quando é o texto padrão. */
export function avisoNaLingua(texto) {
  if (texto !== AVISO_BEM_ESTAR || typeof getTranslation !== "function" || typeof getPreferredLanguage !== "function") return texto;
  const v = getTranslation(getPreferredLanguage(), "term_wellbeing");
  return v && v !== "term_wellbeing" && v !== "[term_wellbeing]" ? v : texto;
}

/** Troca o texto de todos os [data-t] dentro de raiz. Chamar quando o perfil chega. */
export function aplicarTermos(raiz, area) {
  const t = termosDe(area);
  (raiz || document).querySelectorAll("[data-t]").forEach((el) => {
    const forma = el.dataset.t;
    if (t[forma]) el.textContent = t[forma];
  });
  // Frases inteiras com a palavra dentro (data-tt = chave, data-tt-pt = modelo em português com {sg} {pl} {Sg} {Pl}).
  (raiz || document).querySelectorAll("[data-tt]").forEach((el) => {
    let modelo = el.dataset.ttPt || "";
    if (typeof getTranslation === "function" && typeof getPreferredLanguage === "function") {
      const k = el.dataset.tt, v = getTranslation(getPreferredLanguage(), k);
      if (v && v !== k && v !== `[${k}]`) modelo = v;
    }
    el.textContent = modelo.replace(/\{(sg|pl|Sg|Pl)\}/g, (_, f) => t[f]);
  });
  return t;
}
