/**
 * conta-pro.js — a conta de cada profissional (/pros/{uid}).
 *
 * Um documento por profissional: { estado, perfil, sessao, criado, atualizado, notaRevisao? }.
 *   estado: "rascunho" (só o próprio vê) → "pendente" (pediu aprovação) → "aprovado" (público; só o Lucas aprova).
 * O painel usa definirProPainel() para saber de quem são os dados: "" = o Lucas (caminhos de sempre).
 * Ver docs/contas-por-profissional.md e firestore.rules.
 */
import { db, doc, getDoc, setDoc } from "./firebase-init.js";
import { collection, query, where, getDocs, updateDoc, deleteField } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
