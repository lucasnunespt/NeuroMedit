/* ==========================================================
   comunidade-dados.js — tudo o que a Comunidade lê e escreve no Firestore.
   A página (comunidade.js) nunca fala com o Firebase diretamente: só com
   estas funções. As permissões a sério estão em firestore.rules; aqui só
   se pede o que as regras deixam.
   Plano gratuito: sem Cloud Functions. Os avisos ("o seu pedido foi
   aprovado", "responderam à sua partilha") são documentos lidos no site.
   ========================================================== */
import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase-init.js";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, collection, query, where, limit,
  onSnapshot, serverTimestamp, writeBatch, arrayUnion, arrayRemove, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const col = (...p) => collection(db, ...p);
const ref = (...p) => doc(db, ...p);
const lista = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));
const ms = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : 0);
const recentes = (a, b) => ms(b.criadoEm) - ms(a.criadoEm);
const antigas = (a, b) => ms(a.criadoEm) - ms(b.criadoEm);
const uid = () => auth.currentUser?.uid;
const email = () => (auth.currentUser?.email || "").toLowerCase();

export const CIRCULOS_INICIAIS = [
  { nome: "Partilhas depois da prática", sub: "O que ficou em você", proposito: "Escreva o que ficou em você depois de meditar: uma sensação, uma imagem, um pensamento que passou. Não precisa ser bonito nem certo.", cuidado: "sem conselhos não pedidos" },
  { nome: "Calma", sub: "Ansiedade e respiração", proposito: "Para quem está aprendendo a acalmar o corpo e a mente. Partilhe o que tem ajudado, no seu ritmo.", cuidado: "nada de diagnósticos" },
  { nome: "Sono", sub: "Noites e rotinas", proposito: "Rotinas de noite, práticas antes de dormir e o que muda quando o corpo desacelera.", cuidado: "sem receitas de remédios" },
  { nome: "Foco", sub: "Atenção no dia a dia", proposito: "Voltar ao que importa: pequenas práticas de atenção no trabalho e nos estudos.", cuidado: "sem comparar rendimentos" }
];

/* ---------- Sessão ---------- */
export function observarSessao(cb) { return onAuthStateChanged(auth, cb); }
export function entrar() { return signInWithPopup(auth, new GoogleAuthProvider()); }
export function sair() { return signOut(auth); }

/** Quem sou eu na comunidade: fora, pendente, aprovado ou removido; membro, professor ou admin. */
export async function carregarEu() {
  const u = auth.currentUser;
  if (!u) return null;
  const [admin, membro, convite] = await Promise.all([
    getDoc(ref("admins", u.uid)).then((s) => s.exists()).catch(() => false),
    getDoc(ref("comMembros", u.uid)).then((s) => (s.exists() ? s.data() : null)),
    u.emailVerified ? getDoc(ref("comConvites", email())).then((s) => s.exists()).catch(() => false) : false
  ]);
  return {
    uid: u.uid,
    email: u.email || "",
    nome: membro?.nome || u.displayName || "",
    foto: membro?.foto ?? u.photoURL ?? "",
    admin,
    estado: admin ? "aprovado" : (membro?.estado || "fora"),
    papel: admin ? "admin" : (membro?.papel || "membro"),
    professor: admin || membro?.papel === "professor",
    convidado: convite,
    resumo: membro?.resumo !== false,
    temFicha: Boolean(membro)
  };
}

/** Pede para entrar. Com convite do Lucas, entra logo. */
export async function pedirEntrada({ nome, motivos, convidado }) {
  const u = auth.currentUser;
  const lote = writeBatch(db);
  lote.set(ref("comMembros", u.uid), {
    nome: (nome || u.displayName || "Sem nome").slice(0, 60),
    foto: u.photoURL || "",
    estado: convidado ? "aprovado" : "pendente",
    papel: "membro",
    motivos: motivos || [],
    aceitouCuidados: true,
    criadoEm: serverTimestamp()
  });
  lote.set(ref("comMembros", u.uid, "privado", "contacto"), { uid: u.uid, email: u.email || "" });
  await lote.commit();
  if (convidado) await deleteDoc(ref("comConvites", email())).catch(() => {});
}

export function guardarPerfil({ nome, foto, resumo }) {
  const dados = {};
  if (nome !== undefined) dados.nome = nome.slice(0, 60);
  if (foto !== undefined) dados.foto = foto;
  if (resumo !== undefined) dados.resumo = resumo;
  return updateDoc(ref("comMembros", uid()), dados);
}

/* ---------- Círculos ---------- */
export async function circulos() {
  const todos = lista(await getDocs(col("comCirculos")));
  return todos.sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99) || antigas(a, b));
}
export async function criarCirculo({ nome, proposito, cuidado, sub, ordem }) {
  const r = await addDoc(col("comCirculos"), {
    nome: nome.slice(0, 60), sub: sub || "", proposito: proposito || "", cuidado: cuidado || "",
    criador: uid(), ordem: ordem ?? 50, criadoEm: serverTimestamp()
  });
  return r.id;
}
export async function semearCirculos() {
  for (let i = 0; i < CIRCULOS_INICIAIS.length; i += 1) await criarCirculo({ ...CIRCULOS_INICIAIS[i], ordem: i });
}
/** Apaga o círculo e as partilhas dentro dele (com as respostas que conseguir). */
export async function apagarCirculo(id) {
  const dentro = await getDocs(query(col("comPartilhas"), where("circulo", "==", id)));
  for (const p of dentro.docs) await apagarPartilha(p.id).catch(() => {});
  await deleteDoc(ref("comCirculos", id));
}

/* ---------- Partilhas ---------- */
async function marcarMinhas(itens) {
  const u = uid();
  const anon = await meusAnonimos();
  return itens.map((p) => ({ ...p, minha: p.anon ? anon.includes(p.id) : p.uid === u }));
}
async function meusAnonimos() {
  const s = await getDoc(ref("users", uid())).catch(() => null);
  return s?.exists() ? (s.data().comAnon || []) : [];
}
export async function partilhas(circuloId) {
  const s = await getDocs(query(col("comPartilhas"), where("circulo", "==", circuloId), limit(300)));
  return marcarMinhas(lista(s).sort(recentes));
}
export async function partilha(id) {
  const s = await getDoc(ref("comPartilhas", id));
  if (!s.exists()) return null;
  return (await marcarMinhas([{ id: s.id, ...s.data() }]))[0];
}
export async function publicar({ circulo, texto, pratica, anon, nome, foto, imagem, professor }) {
  const novo = doc(col("comPartilhas"));
  const lote = writeBatch(db);
  const dados = { circulo, texto: texto.slice(0, 2000), pratica: pratica || "", anon: Boolean(anon), denunciada: false, criadoEm: serverTimestamp() };
  // A foto da prática já chega reduzida (JPEG 4:3, ver reduzirFoto em comunidade.js) e vai no próprio documento.
  if (imagem) dados.imagem = imagem;
  if (anon) {
    lote.set(doc(db, "comPartilhas", novo.id, "privado", "autor"), { uid: uid() });
  } else {
    dados.uid = uid();
    dados.nome = (nome || "").slice(0, 60);
    if (foto) dados.foto = String(foto).slice(0, 500);
    if (professor) dados.professor = true;
  }
  lote.set(novo, dados);
  await lote.commit();
  // As partilhas sem nome ficam anotadas só no meu documento privado, para eu as poder editar e apagar.
  if (anon) await setDoc(ref("users", uid()), { comAnon: arrayUnion(novo.id) }, { merge: true }).catch(() => {});
  return novo.id;
}
export function editarPartilha(id, texto) {
  return updateDoc(ref("comPartilhas", id), { texto: texto.slice(0, 2000), editadoEm: serverTimestamp() });
}
export async function apagarPartilha(id) {
  // Ordem importa: nas partilhas sem nome, as regras confirmam o autor lendo /privado/autor,
  // por isso esse documento só se apaga depois da partilha.
  const rs = await getDocs(col("comPartilhas", id, "respostas")).catch(() => null);
  if (rs) for (const r of rs.docs) await deleteDoc(r.ref).catch(() => {});
  await deleteDoc(ref("comPartilhas", id, "ressoou", uid())).catch(() => {});
  await deleteDoc(ref("comPartilhas", id));
  await deleteDoc(ref("comPartilhas", id, "privado", "autor")).catch(() => {});
  await setDoc(ref("users", uid()), { comAnon: arrayRemove(id) }, { merge: true }).catch(() => {});
}
export function denunciar(id) { return updateDoc(ref("comPartilhas", id), { denunciada: true }); }
export function manterPartilha(id) { return updateDoc(ref("comPartilhas", id), { denunciada: false }); }
export async function denunciadas() {
  const itens = lista(await getDocs(query(col("comPartilhas"), where("denunciada", "==", true)))).sort(recentes);
  // Só a moderação consegue ler quem escreveu uma partilha sem nome.
  for (const p of itens) {
    if (p.anon) p.autorUid = await getDoc(ref("comPartilhas", p.id, "privado", "autor")).then((s) => s.data()?.uid).catch(() => "");
  }
  return itens;
}

export async function ressoou(id) {
  return getDoc(ref("comPartilhas", id, "ressoou", uid())).then((s) => s.exists()).catch(() => false);
}
export function marcarRessoou(id, sim) {
  const r = ref("comPartilhas", id, "ressoou", uid());
  return sim ? setDoc(r, { em: serverTimestamp() }) : deleteDoc(r);
}

/* ---------- Respostas ---------- */
export async function respostas(partilhaId) {
  return lista(await getDocs(col("comPartilhas", partilhaId, "respostas"))).sort(antigas);
}
export async function responder(p, { texto, nome, professor, foto }) {
  const r = { uid: uid(), nome: (nome || "").slice(0, 60), professor: Boolean(professor), texto: texto.slice(0, 1500), criadoEm: serverTimestamp() };
  if (foto) r.foto = String(foto).slice(0, 500);
  await addDoc(col("comPartilhas", p.id, "respostas"), r);
  // Aviso a quem escreveu (só nas partilhas com nome: nas sem nome ninguém sabe a quem avisar).
  if (!p.anon && p.uid && p.uid !== uid()) {
    await avisar(p.uid, { tipo: "resposta", texto: "Há uma resposta à sua partilha.", link: `comunidade.html#p=${p.id}` }).catch(() => {});
  }
}
export function apagarResposta(partilhaId, id) { return deleteDoc(ref("comPartilhas", partilhaId, "respostas", id)); }

/* ---------- Grupos e conversas ---------- */
export async function grupos(eu) {
  if (eu.admin) return lista(await getDocs(col("comGrupos"))).sort(recentes);
  const [meus, abertos] = await Promise.all([
    getDocs(query(col("comGrupos"), where("membros", "array-contains", eu.uid))),
    getDocs(query(col("comGrupos"), where("tipo", "==", "aberto")))
  ]);
  const mapa = new Map();
  [...lista(meus), ...lista(abertos)].forEach((g) => mapa.set(g.id, g));
  return [...mapa.values()].sort(recentes);
}
export async function grupo(id) {
  const s = await getDoc(ref("comGrupos", id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
export async function criarGrupo({ nome, tipo }) {
  const r = await addDoc(col("comGrupos"), { nome: nome.slice(0, 60), tipo: tipo === "aberto" ? "aberto" : "privado", criador: uid(), membros: [uid()], criadoEm: serverTimestamp() });
  return r.id;
}
export async function apagarGrupo(id) {
  const m = await getDocs(col("comGrupos", id, "mensagens")).catch(() => null);
  if (m) for (const d of m.docs) await deleteDoc(d.ref).catch(() => {});
  await deleteDoc(ref("comGrupos", id));
}
export function entrarNoGrupo(id) { return updateDoc(ref("comGrupos", id), { membros: arrayUnion(uid()) }); }
export function sairDoGrupo(id) { return updateDoc(ref("comGrupos", id), { membros: arrayRemove(uid()) }); }
export async function porNoGrupo(g, pessoaUid) {
  await updateDoc(ref("comGrupos", g.id), { membros: arrayUnion(pessoaUid) });
  await avisar(pessoaUid, { tipo: "grupo", texto: `Você foi incluído no grupo «${g.nome}».`.slice(0, 200), link: `comunidade.html#g=${g.id}` }).catch(() => {});
}
export function tirarDoGrupo(id, pessoaUid) { return updateDoc(ref("comGrupos", id), { membros: arrayRemove(pessoaUid) }); }
/** Conversa em tempo real. Devolve a função que para de ouvir. */
export function ouvirMensagens(grupoId, cb, erro) {
  return onSnapshot(col("comGrupos", grupoId, "mensagens"), (s) => cb(lista(s).sort(antigas)), erro);
}
export function enviarMensagem(grupoId, { texto, nome }) {
  return addDoc(col("comGrupos", grupoId, "mensagens"), { uid: uid(), nome: (nome || "").slice(0, 60), texto: texto.slice(0, 1000), criadoEm: serverTimestamp() });
}
export function apagarMensagem(grupoId, id) { return deleteDoc(ref("comGrupos", grupoId, "mensagens", id)); }

/* ---------- Dos professores e encontros ---------- */
export async function canal() { return lista(await getDocs(query(col("comCanal"), limit(30)))).sort(recentes); }
export function publicarNoCanal({ titulo, texto, nome }) {
  return addDoc(col("comCanal"), { uid: uid(), nome: (nome || "").slice(0, 60), titulo: titulo.slice(0, 120), texto: (texto || "").slice(0, 600), criadoEm: serverTimestamp() });
}
export function apagarDoCanal(id) { return deleteDoc(ref("comCanal", id)); }

export async function encontros() {
  const agora = Date.now() - 2 * 3600 * 1000;
  const itens = lista(await getDocs(query(col("comEncontros"), limit(50)))).filter((e) => ms(e.quando) >= agora).sort((a, b) => ms(a.quando) - ms(b.quando));
  await Promise.all(itens.map(async (e) => {
    e.guardado = await getDoc(ref("comEncontros", e.id, "lugares", uid())).then((s) => s.exists()).catch(() => false);
  }));
  return itens;
}
export function criarEncontro({ titulo, quando, link, nome }) {
  return addDoc(col("comEncontros"), { uid: uid(), nome: (nome || "").slice(0, 60), titulo: titulo.slice(0, 120), quando: Timestamp.fromDate(quando), link, criadoEm: serverTimestamp() });
}
export function apagarEncontro(id) { return deleteDoc(ref("comEncontros", id)); }
export function guardarLugar(id, sim) {
  const r = ref("comEncontros", id, "lugares", uid());
  return sim ? setDoc(r, { em: serverTimestamp() }) : deleteDoc(r);
}

/* ---------- Gestão (só o Lucas) ---------- */
export async function membros() {
  const todos = lista(await getDocs(col("comMembros")));
  await Promise.all(todos.map(async (m) => {
    m.email = await getDoc(ref("comMembros", m.id, "privado", "contacto")).then((s) => s.data()?.email || "").catch(() => "");
  }));
  return todos.sort(antigas);
}
/** Os membros aprovados, só com nome e papel (para escolher quem entra num grupo). */
export async function membrosAprovados() {
  return lista(await getDocs(query(col("comMembros"), where("estado", "==", "aprovado")))).sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
}
export async function aprovar(pessoaUid) {
  await updateDoc(ref("comMembros", pessoaUid), { estado: "aprovado", aprovadoEm: serverTimestamp() });
  await avisar(pessoaUid, { tipo: "aprovado", texto: "O seu pedido foi aprovado. Bem-vindo à comunidade.", link: "comunidade.html" }).catch(() => {});
}
export async function recusar(pessoaUid) {
  await deleteDoc(ref("comMembros", pessoaUid, "privado", "contacto")).catch(() => {});
  await deleteDoc(ref("comMembros", pessoaUid));
}
export function remover(pessoaUid) { return updateDoc(ref("comMembros", pessoaUid), { estado: "removido" }); }
export async function mudarPapel(pessoaUid, papel) {
  await updateDoc(ref("comMembros", pessoaUid), { papel });
  if (papel === "professor") await avisar(pessoaUid, { tipo: "papel", texto: "Agora você é professor na comunidade: pode criar círculos, grupos e encontros.", link: "comunidade.html" }).catch(() => {});
}
export async function convites() { return lista(await getDocs(col("comConvites"))).sort(recentes); }
export function convidar(emailPessoa) {
  const e = emailPessoa.trim().toLowerCase();
  return setDoc(ref("comConvites", e), { email: e, criadoEm: serverTimestamp() });
}
export function cancelarConvite(id) { return deleteDoc(ref("comConvites", id)); }

/* ---------- Avisos dentro do site ---------- */
export function avisar(paraUid, { tipo, texto, link }) {
  return addDoc(col("comAvisos", paraUid, "itens"), { tipo, texto, link: link || "", de: uid(), lido: false, criadoEm: serverTimestamp() });
}
export async function avisos() {
  if (!uid()) return [];
  return lista(await getDocs(query(col("comAvisos", uid(), "itens"), limit(30)))).sort(recentes);
}
export async function marcarAvisosLidos(itens) {
  await Promise.all(itens.filter((a) => !a.lido).map((a) => updateDoc(ref("comAvisos", uid(), "itens", a.id), { lido: true }).catch(() => {})));
}
export function apagarAviso(id) { return deleteDoc(ref("comAvisos", uid(), "itens", id)); }

/* ---------- Os meus dados (RGPD): levar e apagar ---------- */
async function minhasPartilhas() {
  const comNome = lista(await getDocs(query(col("comPartilhas"), where("uid", "==", uid()))));
  const semNome = [];
  for (const id of await meusAnonimos()) {
    const p = await getDoc(ref("comPartilhas", id)).catch(() => null);
    if (p?.exists()) semNome.push({ id: p.id, ...p.data() });
  }
  return [...comNome, ...semNome];
}
export async function exportarOsMeusDados() {
  const ficha = await getDoc(ref("comMembros", uid())).then((s) => s.data() || null).catch(() => null);
  const limpa = (p) => ({ texto: p.texto, pratica: p.pratica, semNome: p.anon, em: p.criadoEm ? new Date(ms(p.criadoEm)).toISOString() : "" });
  return { exportadoEm: new Date().toISOString(), email: auth.currentUser?.email || "", perfil: ficha && { nome: ficha.nome, papel: ficha.papel, estado: ficha.estado, motivos: ficha.motivos }, partilhas: (await minhasPartilhas().catch(() => [])).map(limpa) };
}
/** Sai da comunidade e apaga o que é meu: partilhas, avisos e a ficha de membro. */
export async function apagarTudoOQueEMeu() {
  for (const p of await minhasPartilhas().catch(() => [])) await apagarPartilha(p.id).catch(() => {});
  for (const a of await avisos().catch(() => [])) await apagarAviso(a.id).catch(() => {});
  await setDoc(ref("users", uid()), { comAnon: [] }, { merge: true }).catch(() => {});
  await deleteDoc(ref("comMembros", uid(), "privado", "contacto")).catch(() => {});
  await deleteDoc(ref("comMembros", uid()));
}
