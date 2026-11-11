/**
 * reservas-dados.js — o que a página de reserva e o painel partilham:
 * ajustes (preços, regras), agenda publicada, horários ocupados e o cálculo dos horários livres.
 *
 * Contas por profissional (nov 2026): cada profissional tem um id (o uid da conta Google).
 * Sem id (proId vazio) = o Lucas, nos caminhos de sempre (/settings/sessao, /availability, slots "AAAA-MM-DD_HH").
 * Com id = /pros/{proId} (campo sessao), /pros/{proId}/availability e slots "{proId}_AAAA-MM-DD_HH".
 * Ver docs/contas-por-profissional.md.
 */
import { db, doc, getDoc } from "./firebase-init.js";
import { collection, getDocs, query, where, documentId } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { PADRAO } from "./painel-ajustes.js";

export const pad2 = (n) => String(n).padStart(2, "0");
export const chaveMes = (a, m) => `${a}-${pad2(m + 1)}`;
export const chaveDia = (a, m, d) => `${a}-${pad2(m + 1)}-${pad2(d)}`;
export const euro = (n) => "€" + (Math.round(n * 100) / 100).toString().replace(".", ",");

/** O profissional da página, pelo endereço (?p=<id>). Vazio = o Lucas. */
export function proDaPagina() {
  const p = new URLSearchParams(location.search).get("p") || "";
  return /^[A-Za-z0-9_-]{1,128}$/.test(p) ? p : "";
}
/** Prefixo do id dos horários ocupados: "" para o Lucas, "{proId}_" para os outros. */
export const prefixoSlot = (proId) => (proId ? `${proId}_` : "");
/** Sufixo do endereço para levar o profissional de uma página para a outra. */
export const comPro = (url, proId) => (proId ? `${url}${url.includes("?") ? "&" : "?"}p=${encodeURIComponent(proId)}` : url);

export async function lerAjustes(proId = "") {
  try {
    if (!proId) {
      const s = await getDoc(doc(db, "settings", "sessao"));
      return s.exists() ? { ...PADRAO, ...s.data() } : { ...PADRAO };
    }
    const s = await getDoc(doc(db, "pros", proId));
    return s.exists() ? { ...PADRAO, ...(s.data().sessao || {}) } : { ...PADRAO };
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
export async function lerAgenda(ano, mes, proId = "") {
  try {
    const ref = proId ? doc(db, "pros", proId, "availability", chaveMes(ano, mes)) : doc(db, "availability", chaveMes(ano, mes));
    const s = await getDoc(ref);
    return s.exists() && s.data().publicado ? (s.data().dias || {}) : {};
  } catch (e) {
    return {};
  }
}

/** Horários ocupados do mês: Set de "AAAA-MM-DD_HH" (já sem o prefixo do profissional). */
export async function lerOcupados(ano, mes, proId = "") {
  const pre = prefixoSlot(proId);
  const ini = `${pre}${chaveMes(ano, mes)}-00`, fim = `${pre}${chaveMes(ano, mes)}-99`;
  try {
    const q = query(collection(db, "slots"), where(documentId(), ">=", ini), where(documentId(), "<=", fim));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => d.id.slice(pre.length)));
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
