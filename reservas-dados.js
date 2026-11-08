/**
 * reservas-dados.js — o que a página de reserva e o painel partilham:
 * ajustes (preços, regras), agenda publicada, horários ocupados e o cálculo dos horários livres.
 */
import { db, doc, getDoc } from "./firebase-init.js";
import { collection, getDocs, query, where, documentId } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { PADRAO } from "./painel-ajustes.js";

export const pad2 = (n) => String(n).padStart(2, "0");
export const chaveMes = (a, m) => `${a}-${pad2(m + 1)}`;
export const chaveDia = (a, m, d) => `${a}-${pad2(m + 1)}-${pad2(d)}`;
export const euro = (n) => "€" + (Math.round(n * 100) / 100).toString().replace(".", ",");

export async function lerAjustes() {
  try {
    const s = await getDoc(doc(db, "settings", "sessao"));
    return s.exists() ? { ...PADRAO, ...s.data() } : { ...PADRAO };
  } catch (e) {
    return { ...PADRAO };
  }
}

/** Preços que a pessoa vê hoje (com o desconto de lançamento, se ainda valer). */
export function precos(cfg, hoje = new Date()) {
  const ate = cfg.descontoAte ? new Date(cfg.descontoAte + "T23:59:59") : null;
  const ativo = cfg.descontoLancamento > 0 && ate && hoje <= ate;
  const f = ativo ? 1 - cfg.descontoLancamento / 100 : 1;
  return {
    desconto: ativo ? cfg.descontoLancamento : 0,
    ate,
    planos: [
      { n: 1, nome: "1 sessão", valor: Math.round(cfg.precoAvulsa * f), antes: ativo ? cfg.precoAvulsa : null },
      { n: 3, nome: "3 sessões", valor: Math.round(cfg.pacote3 * f), antes: ativo ? cfg.pacote3 : null },
      { n: 4, nome: "4 sessões", valor: Math.round(cfg.pacote4), antes: null }
    ]
  };
}

/** Agenda publicada do mês: { "11": {k:"free"}, "12": {k:"from", h:19}, ... } */
export async function lerAgenda(ano, mes) {
  try {
    const s = await getDoc(doc(db, "availability", chaveMes(ano, mes)));
    return s.exists() && s.data().publicado ? (s.data().dias || {}) : {};
  } catch (e) {
    return {};
  }
}

/** Horários ocupados do mês: Set de "AAAA-MM-DD_HH". */
export async function lerOcupados(ano, mes) {
  const ini = `${chaveMes(ano, mes)}-00`, fim = `${chaveMes(ano, mes)}-99`;
  try {
    const q = query(collection(db, "slots"), where(documentId(), ">=", ini), where(documentId(), "<=", fim));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.id));
  } catch (e) {
    return new Set();
  }
}

/** Horas livres de um dia, já sem as ocupadas, as que não dão tempo de deslocação e as que já passaram. */
export function horasLivres({ ano, mes, dia, agenda, ocupados, cfg, agora = new Date() }) {
  const d = agenda[dia];
  if (!d || d.k === "none") return [];
  const ini = d.k === "free" ? 9 : d.h;
  const fim = d.k === "free" ? 20 : 21;
  const dur = cfg.duracao || 30, folga = cfg.deslocacao ?? 60;
  const ocup = [];
  for (let h = 6; h <= 22; h++) if (ocupados.has(`${chaveDia(ano, mes, dia)}_${pad2(h)}`)) ocup.push(h * 60);
  const res = [];
  for (let h = ini; h <= fim; h++) {
    const s = h * 60;
    const inicio = new Date(ano, mes, dia, h);
    if (inicio - agora < 2 * 3600 * 1000) continue; // pelo menos 2 horas de antecedência
    const choca = ocup.some((o) => s < o + dur + folga && o < s + dur + folga);
    if (!choca) res.push(h);
  }
  return res;
}
