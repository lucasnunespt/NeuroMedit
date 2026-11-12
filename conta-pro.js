/**
 * conta-pro.js — a conta de cada profissional (/pros/{uid}).
 *
 * Um documento por profissional: { estado, perfil, sessao, criado, atualizado, notaRevisao? }.
 *   estado: "rascunho" (só o próprio vê) → "pendente" (pediu aprovação) → "aprovado" (público; só o Lucas aprova);
 *   "lixeira" = retirada pelo Lucas (guarda estadoAnterior; ele restaura ou apaga para sempre).
 *   Convites: /convites/{e-mail em minúsculas} = página reservada pelo Lucas para um e-mail; quem entra com ele reclama-a.
 * O painel usa definirProPainel() para saber de quem são os dados: "" = o Lucas (caminhos de sempre).
 * Ver docs/contas-por-profissional.md e firestore.rules.
 */
import { db, doc, getDoc, setDoc } from "./firebase-init.js";
import { AREAS, AVISO_BEM_ESTAR } from "./termos.js";
import { collection, query, where, getDocs, updateDoc, deleteField, deleteDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let PRO = "";
export const definirProPainel = (uid) => { PRO = uid || ""; };
export const proPainel = () => PRO;

export async function lerContaPro(uid) {
  try {
    const s = await getDoc(doc(db, "pros", uid));
    return s.exists() ? s.data() : null;
  } catch (e) {
    return null;
  }
}

/** Cria a conta em rascunho (as regras só deixam criar com este estado, e só a própria pessoa). */
export function criarContaPro(uid, { perfil, sessao }) {
  return setDoc(doc(db, "pros", uid), { estado: "rascunho", perfil, sessao, criado: new Date(), atualizado: new Date() });
}

export const pedirAprovacao = (uid) => updateDoc(doc(db, "pros", uid), { estado: "pendente", pedidoEm: new Date(), notaRevisao: deleteField() });

// ---------- só o Lucas (admin)
async function porEstado(estado) {
  const snap = await getDocs(query(collection(db, "pros"), where("estado", "==", estado)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export const perfisPendentes = () => porEstado("pendente");
export const aprovarPro = (uid) => updateDoc(doc(db, "pros", uid), { estado: "aprovado", aprovadoEm: new Date(), notaRevisao: deleteField() });
export const devolverPro = (uid, nota) => updateDoc(doc(db, "pros", uid), { estado: "rascunho", notaRevisao: String(nota || "").slice(0, 300) });

// ---------- público: profissionais aprovados (a consulta tem de pedir estado == "aprovado", pelas regras)
export async function prosAprovados() {
  try { return await porEstado("aprovado"); } catch (e) { return []; }
}


// ---------- lixeira (só o Lucas)
/** Todos os profissionais, para o Lucas gerir. */
export async function todosPros() {
  const snap = await getDocs(collection(db, "pros"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export const moverParaLixeira = (uid, estadoAnterior) =>
  updateDoc(doc(db, "pros", uid), { estado: "lixeira", estadoAnterior: estadoAnterior || "rascunho", naLixeiraEm: new Date() });
export const restaurarPro = (uid, estadoAnterior) =>
  updateDoc(doc(db, "pros", uid), { estado: estadoAnterior && estadoAnterior !== "lixeira" ? estadoAnterior : "rascunho", estadoAnterior: deleteField(), naLixeiraEm: deleteField() });
/** Apaga para sempre. Os meses de agenda são uma subcoleção: o Firestore não os apaga com o documento, por isso vão primeiro. */
export async function apagarProParaSempre(uid) {
  const meses = await getDocs(collection(db, "pros", uid, "availability"));
  if (meses.size) {
    const lote = writeBatch(db);
    meses.docs.forEach((m) => lote.delete(m.ref));
    await lote.commit();
  }
  await deleteDoc(doc(db, "pros", uid));
}

// ---------- convites: página reservada a um e-mail
const chaveEmail = (email) => String(email || "").trim().toLowerCase();
export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(chaveEmail(email));

/** Só o Lucas. perfil = { nome, profissao, area, cidade, ... } (o que a pessoa vai encontrar ao entrar). */
export function criarConvite(email, perfil) {
  const e = chaveEmail(email);
  return setDoc(doc(db, "convites", e), { email: e, perfil, criadoEm: new Date() });
}
export async function listarConvites() {
  const snap = await getDocs(collection(db, "convites"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export const apagarConvite = (email) => deleteDoc(doc(db, "convites", chaveEmail(email)));

/**
 * Quem entra com um e-mail convidado reclama a página: cria /pros/{uid} já aprovada, com o perfil do convite,
 * e apaga o convite (os dois num só passo). Devolve a conta criada, ou null se não há convite (ou o e-mail não está verificado).
 */
export async function reclamarConvite(user) {
  if (!user?.email || !user.emailVerified) return null;
  try {
    const ref = doc(db, "convites", chaveEmail(user.email));
    const s = await getDoc(ref);
    if (!s.exists()) return null;
    const perfil = { ...s.data().perfil };
    const saude = (AREAS.find(([nome]) => nome === perfil.area) || [])[1] === true;
    const sessao = { emailAvisos: user.email, avisoPratica: saude ? "" : AVISO_BEM_ESTAR };
    const agora = new Date();
    const conta = { estado: "aprovado", perfil, sessao, criado: agora, atualizado: agora, aprovadoEm: agora, origem: "convite" };
    const lote = writeBatch(db);
    lote.set(doc(db, "pros", user.uid), conta);
    lote.delete(ref);
    await lote.commit();
    try { sessionStorage.setItem("neuromedit-tem-painel-" + user.uid, "1"); } catch (e) {} // o painel de Ajustes deixa de oferecer "Crie a sua página"
    return conta;
  } catch (e) {
    return null;
  }
}
