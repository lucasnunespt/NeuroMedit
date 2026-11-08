/**
 * painel-guard.js — porta de entrada do painel do Lucas.
 *
 * O que protege de verdade são as regras do Firestore (firestore.rules):
 * sem o documento /admins/{uid}, nenhum dado do painel sai do servidor.
 * Este ficheiro só decide o que a página mostra: entrar, sem acesso ou painel.
 */
import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc } from "./firebase-init.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function isAdmin(user) {
  if (!user) return false;
  try {
    const snap = await getDoc(doc(db, "admins", user.uid));
    return snap.exists();
  } catch (err) {
    // Sem permissão ou sem rede: trata como "não é admin".
    return false;
  }
}

/**
 * Chama onState(estado, user) sempre que o login muda.
 * estado: "a-verificar" | "sem-login" | "sem-acesso" | "admin"
 */
export function watchPainel(onState) {
  onState("a-verificar", null);
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return onState("sem-login", null);
    onState("a-verificar", user);
    onState((await isAdmin(user)) ? "admin" : "sem-acesso", user);
  });
}

export function entrar() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export function sair() {
  return signOut(auth);
}

/** Pedidos que esperam por uma ação do Lucas (só funciona para admin, pelas regras). */
export async function pedidosPendentes() {
  try {
    const q = query(collection(db, "bookings"), where("estado", "in", ["pedida", "reembolso", "remarcacao"]));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null; // null = não foi possível ler
  }
}
