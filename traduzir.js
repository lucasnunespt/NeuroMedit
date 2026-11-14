/* ==========================================================
   traduzir.js — tradução para as páginas do sistema de reservas
   (perfil, reservar, profissional, painel).

   Os textos vivem em translations-*.js, como no resto do site. Aqui:
   - tr(chave, reserva, valores): o texto na língua escolhida; sem tradução,
     fica a reserva (português do Brasil). {nome} é trocado por valores.nome.
   - local(): a língua para datas e números (pt-BR, en-GB, es-ES, it-IT, ru-RU).
   Estas páginas não têm seletor de idioma: usam a língua escolhida no site.
   ========================================================== */
const LOCAIS = { pt: "pt-BR", en: "en-GB", es: "es-ES", it: "it-IT", ru: "ru-RU" };

export const lingua = () => (typeof getPreferredLanguage === "function" ? getPreferredLanguage() : "pt");
export const local = () => LOCAIS[lingua()] || "pt-BR";

export function tr(chave, reserva, valores) {
  let s = reserva;
  if (typeof getTranslation === "function") {
    const v = getTranslation(lingua(), chave);
    if (v && v !== chave && v !== `[${chave}]`) s = v;
  }
  return valores ? String(s).replace(/\{(\w+)\}/g, (_, n) => (valores[n] ?? "")) : s;
}

/** Dias da semana na língua escolhida, a começar no domingo. */
export function diasSemana(formato = "short") {
  const f = new Intl.DateTimeFormat(local(), { weekday: formato });
  return [...Array(7)].map((_, i) => f.format(new Date(2026, 10, 1 + i))); // 1 nov 2026 é domingo
}

/** Nome do mês com maiúscula, na língua escolhida. */
export const nomeMes = (data, comAno = false) =>
  data.toLocaleDateString(local(), comAno ? { month: "long", year: "numeric" } : { month: "long" }).replace(/^./, (c) => c.toUpperCase());
