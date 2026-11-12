/**
 * painel-guard.js — porta de entrada do painel do Lucas.
 *
 * O que protege de verdade são as regras do Firestore (firestore.rules):
 * sem o documento /admins/{uid}, nenhum dado do painel sai do servidor.
 * Este ficheiro só decide o que a página mostra: entrar, sem acesso ou painel.
 */
import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc } from "./firebase-init.js";
import { collection, getDocs, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { lerContaPro, reclamarConvite } from "./conta-pro.js";

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
 * Chama onState(estado, user, conta) sempre que o login muda.
 * estado: "a-verificar" | "sem-login" | "sem-acesso" | "admin" | "pro"
 * "pro" = profissional com conta em /pros/{uid}; conta = o documento dele (estado, perfil, sessao).
 */
export function watchPainel(onState) {
  onState("a-verificar", null);
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return onState("sem-login", null);
    onState("a-verificar", user);
    if (await isAdmin(user)) return onState("admin", user, null);
    // Quem o Lucas convidou pelo e-mail reclama aqui a página que ele reservou.
    const conta = (await lerContaPro(user.uid)) || (await reclamarConvite(user));
    onState(conta ? "pro" : "sem-acesso", user, conta);
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

/** Todos os pedidos (só funciona para admin, pelas regras). null = não foi possível ler. */
export async function todosPedidos() {
  try {
    const snap = await getDocs(collection(db, "bookings"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return null;
  }
}

/** Escuta os pedidos em tempo real: onLista(lista) a cada mudança, onLista(null) se falhar. Devolve a função para parar. */
export function ouvirPedidos(onLista, proId = "") {
  // Um profissional só pode pedir os seus (as regras recusam a coleção inteira).
  // O Lucas lê tudo, mas no painel dele só entram os pedidos sem proId, que são os dele.
  const fonte = proId ? query(collection(db, "bookings"), where("proId", "==", proId)) : collection(db, "bookings");
  return onSnapshot(fonte,
    (snap) => onLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((b) => (proId ? true : !b.proId))),
    () => onLista(null));
}
