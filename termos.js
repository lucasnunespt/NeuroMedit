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
export const AREAS = [
  ["Meditação", false], ["Yoga", false], ["Pilates", false], ["Treino e educação física", false],
  ["Massagem", false], ["Terapias holísticas", false], ["Coaching", false],
  ["Fisioterapia", true], ["Psicologia", true], ["Nutrição", true], ["Outra", false]
];

/** As quatro formas da palavra para uma área. Área desconhecida ou vazia: "sessão". */
export function termosDe(area) {
  return POR_AREA[area] || SESSAO;
}

/** Troca o texto de todos os [data-t] dentro de raiz. Chamar quando o perfil chega. */
export function aplicarTermos(raiz, area) {
  const t = termosDe(area);
  (raiz || document).querySelectorAll("[data-t]").forEach((el) => {
    const forma = el.dataset.t;
    if (t[forma]) el.textContent = t[forma];
  });
  return t;
}
