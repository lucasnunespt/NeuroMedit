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
  onSnapshot, serverTimestamp, writeBatch, arrayUnion, arrayRemove, Timestamp, increment, getCountFromServer
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

/** Cidades iniciais: Portugal, Espanha, França e as 27 capitais do Brasil.
 *  Todas começam "em breve"; abrem quando o Lucas lhes dá um anfitrião. */
/* As cidades e os países da Terra vivem em cidades-lista.js (também os usa a faixa da home, sem o Firebase). */
export { CIDADES_INICIAIS, PAISES_GLOBO } from "./cidades-lista.js";
import { CIDADES_INICIAIS } from "./cidades-lista.js";

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
    u.emailVerified ? getDoc(ref("comConvites", email())).then((s) => (s.exists() ? s.data() : null)).catch(() => null) : null
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
    convidado: Boolean(convite),
    // Convite para anfitrião: ao entrar, a pessoa fica a cuidar desta cidade (e a cidade abre).
    conviteCidade: convite?.cidade || "",
    conviteAnfitriao: convite?.anfitriao === true,
    resumo: membro?.resumo !== false,
    temFicha: Boolean(membro),
    usuario: membro?.usuario || "",
    mostrarComunidades: membro?.mostrarComunidades !== false,
    quemEscreve: membro?.quemEscreve || "todos",
    bio: membro?.bio || "",
    interesses: membro?.interesses || [],
    fotoGoogle: u.photoURL || "",
    cidade: membro?.cidade || ""
  };
}

/** Pede para entrar. Com convite do Lucas, entra logo. */
export async function pedirEntrada({ nome, motivos, convidado, cidade, anfitriaoDe }) {
  const u = auth.currentUser;
  const lote = writeBatch(db);
  if (anfitriaoDe) cidade = anfitriaoDe;
  lote.set(ref("comMembros", u.uid), {
    nome: (nome || u.displayName || "Sem nome").slice(0, 60),
    foto: u.photoURL || "",
    estado: convidado ? "aprovado" : "pendente",
    papel: "membro",
    motivos: motivos || [],
    aceitouCuidados: true,
    ...(cidade ? { cidade } : {}),
    criadoEm: serverTimestamp()
  });
  lote.set(ref("comMembros", u.uid, "privado", "contacto"), { uid: u.uid, email: u.email || "" });
  // Convidado para anfitrião: entra na lista da cidade no mesmo lote (as regras confirmam o convite).
  if (convidado && anfitriaoDe) lote.update(ref("comCidades", anfitriaoDe), { anfitrioes: arrayUnion(u.uid), estado: "aberta" });
  await lote.commit();
  if (convidado) await deleteDoc(ref("comConvites", email())).catch(() => {});
}

export function guardarPerfil({ nome, foto, resumo, cidade }) {
  const dados = {};
  if (cidade) dados.cidade = cidade;
  if (nome !== undefined) dados.nome = nome.slice(0, 60);
  if (foto !== undefined) dados.foto = foto;
  if (resumo !== undefined) dados.resumo = resumo;
  return updateDoc(ref("comMembros", uid()), dados);
}

/* ---------- Perfil: @utilizador, uma linha sobre a pessoa, interesses, foto (nov 2026) ----------
   O @ é único: cada nome de utilizador é um documento comUsuarios/{nome} com o uid de quem o tem.
   Mudar de @ = apagar o antigo, criar o novo e atualizar a ficha, tudo no mesmo lote. */
export const USUARIO_OK = /^[a-z0-9._]{3,20}$/;
export const INTERESSES = ["meditacao", "yoga", "respiracao", "ciencia", "espiritualidade", "movimento", "terapias"];
export async function usuarioLivre(nome) {
  const s = await getDoc(ref("comUsuarios", nome));
  return !s.exists() || s.data().uid === uid();
}
export async function guardarPerfilCompleto(eu, { nome, cidade, usuario, bio, interesses, foto }) {
  const lote = writeBatch(db);
  const d = { nome: nome.slice(0, 60), bio: (bio || "").slice(0, 140), interesses: (interesses || []).filter((i) => INTERESSES.includes(i)).slice(0, 6) };
  if (cidade) d.cidade = cidade;
  if (foto !== undefined) d.foto = foto;
  if (usuario && usuario !== eu.usuario) {
    if (eu.usuario) lote.delete(ref("comUsuarios", eu.usuario));
    lote.set(ref("comUsuarios", usuario), { uid: uid(), em: serverTimestamp() });
    d.usuario = usuario;
  }
  lote.update(ref("comMembros", uid()), d);
  await lote.commit();
}
/** A ficha de outra pessoa (membros aprovados veem-se uns aos outros). */
export async function membro(id) {
  const s = await getDoc(ref("comMembros", id));
  return s.exists() ? { uid: id, ...s.data() } : null;
}
/** O que a página de uma pessoa mostra: encontros (próximos e passados), fotos publicadas,
   grupos abertos (e os privados onde eu também estou) e a página profissional, se tiver. */
export async function vidaDe(pessoaUid, meusGrupos) {
  const agora = Date.now() - 2 * 3600 * 1000;
  const [enc, parts, abertos, pro] = await Promise.all([
    getDocs(query(col("comEncontros"), where("uid", "==", pessoaUid), limit(40))).then(lista).catch(() => []),
    getDocs(query(col("comPartilhas"), where("uid", "==", pessoaUid), limit(40))).then(lista).catch(() => []),
    getDocs(query(col("comGrupos"), where("tipo", "==", "aberto"))).then(lista).catch(() => []),
    getDoc(doc(db, "pros", pessoaUid)).then((s) => (s.exists() && s.data().estado === "aprovado" ? s.data() : null)).catch(() => null)
  ]);
  const encontros = enc.map((e) => proximo(e, agora));
  const mapa = new Map();
  [...abertos, ...(meusGrupos || [])].filter((g) => (g.membros || []).includes(pessoaUid)).forEach((g) => mapa.set(g.id, g));
  return {
    proximos: encontros.filter((e) => ms(e.quando) >= agora).sort((a, b) => ms(a.quando) - ms(b.quando)),
    passados: encontros.filter((e) => ms(e.quando) < agora).sort((a, b) => ms(b.quando) - ms(a.quando)).slice(0, 6),
    fotos: parts.filter((x) => x.imagem && !x.anon && !x.denunciada).sort((a, b) => ms(b.criadoEm) - ms(a.criadoEm)).slice(0, 9),
    grupos: [...mapa.values()],
    pro: pro && { profissao: pro.perfil?.profissao || "", area: pro.perfil?.area || "" }
  };
}
export const guardarMostrarComunidades = (sim) => updateDoc(ref("comMembros", uid()), { mostrarComunidades: Boolean(sim) });
/* ---------- Mensagens diretas (nov 2026) ----------
   Uma conversa por par de pessoas, com id fixo "uidA_uidB" (ordem alfabética).
   Começa como "pedido": só quem pediu escreve, até a outra pessoa aceitar.
   Qualquer um bloqueia; só quem bloqueou desbloqueia. Denunciar bloqueia e deixa o Lucas ler. */
export const idConversa = (a, b) => (a < b ? `${a}_${b}` : `${b}_${a}`);
export const QUEM_ESCREVE = ["todos", "professores", "ninguem"];
export const guardarQuemEscreve = (v) => updateDoc(ref("comMembros", uid()), { quemEscreve: QUEM_ESCREVE.includes(v) ? v : "todos" });
export async function conversas() {
  const l = lista(await getDocs(query(col("comConversas"), where("membros", "array-contains", uid()), limit(100))));
  return l.sort((a, b) => ms(b.ultimaEm) - ms(a.ultimaEm));
}
export async function conversa(id) { const s = await getDoc(ref("comConversas", id)); return s.exists() ? { id, ...s.data() } : null; }
/** Abre (ou cria, como pedido) a conversa com outra pessoa. Devolve o id. */
export async function abrirConversa(outro) {
  const id = idConversa(uid(), outro);
  const ja = await getDoc(ref("comConversas", id)).catch(() => null);
  if (ja?.exists()) return id;
  await setDoc(ref("comConversas", id), { membros: [uid(), outro].sort(), de: uid(), para: outro, estado: "pedido", criadoEm: serverTimestamp(), ultimaEm: serverTimestamp() });
  return id;
}
export function ouvirConversa(id, cb, erro) {
  return onSnapshot(col("comConversas", id, "mensagens"), (s) => cb(lista(s).sort(antigas)), erro);
}
export async function escrever(c, { texto, nome }) {
  const outro = c.membros.find((m) => m !== uid());
  const t = texto.slice(0, 1000);
  await addDoc(col("comConversas", c.id, "mensagens"), { uid: uid(), texto: t, criadoEm: serverTimestamp() });
  await updateDoc(ref("comConversas", c.id), { ultimaEm: serverTimestamp(), ultimaTexto: t.slice(0, 120), ultimaPor: uid(), novaPara: outro }).catch(() => {});
  // O primeiro pedido avisa a outra pessoa dentro do site.
  if (c.estado === "pedido" && !c.ultimaPor) await avisar(outro, { tipo: "mensagem", texto: `${(nome || "Alguém").slice(0, 60)} quer conversar com você.`, link: `comunidade.html#m=${c.id}` }).catch(() => {});
}
export const apagarMensagemDireta = (conversaId, id) => deleteDoc(ref("comConversas", conversaId, "mensagens", id));
export const marcarLida = (id) => updateDoc(ref("comConversas", id), { novaPara: "" });
export const aceitarConversa = (id) => updateDoc(ref("comConversas", id), { estado: "aberta" });
export const bloquearConversa = (id) => updateDoc(ref("comConversas", id), { estado: "bloqueada", bloqueadaPor: uid() });
export const desbloquearConversa = (id) => updateDoc(ref("comConversas", id), { estado: "aberta", bloqueadaPor: "" });
export const denunciarConversa = (id, jaBloqueada) => updateDoc(ref("comConversas", id), jaBloqueada ? { denunciada: true } : { estado: "bloqueada", bloqueadaPor: uid(), denunciada: true });
export async function conversasDenunciadas() { return lista(await getDocs(query(col("comConversas"), where("denunciada", "==", true), limit(50)))); }
export const arquivarDenuncia = (id) => updateDoc(ref("comConversas", id), { denunciada: false });
export async function uidDoUsuario(nome) {
  const s = await getDoc(ref("comUsuarios", nome));
  return s.exists() ? s.data().uid : "";
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
/** Denunciar um comentário: marca-o e manda a partilha para a fila de moderação (onde o Lucas o vê). */
export async function denunciarResposta(partilhaId, id) {
  const lote = writeBatch(db);
  lote.update(ref("comPartilhas", partilhaId, "respostas", id), { denunciada: true });
  lote.update(ref("comPartilhas", partilhaId), { denunciada: true });
  await lote.commit();
}
export function manterResposta(partilhaId, id) { return updateDoc(ref("comPartilhas", partilhaId, "respostas", id), { denunciada: false }); }

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
export async function criarGrupo({ nome, tipo, cidade }) {
  const g = { nome: nome.slice(0, 60), tipo: tipo === "aberto" ? "aberto" : "privado", criador: uid(), membros: [uid()], criadoEm: serverTimestamp() };
  if (cidade) g.cidade = cidade; // subcomunidade de uma cidade
  const r = await addDoc(col("comGrupos"), g);
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

const SEMANA = 7 * 24 * 3600 * 1000;
/** Para um encontro semanal, o próximo dia a partir de agora (o original fica em quandoInicio). */
function proximo(e, desde) {
  if (e.repete !== "semanal") return e;
  let m = ms(e.quando);
  if (m < desde) m += Math.ceil((desde - m) / SEMANA) * SEMANA;
  return { ...e, quandoInicio: e.quando, quando: { toMillis: () => m } };
}
export async function encontros() {
  const agora = Date.now() - 2 * 3600 * 1000;
  const itens = lista(await getDocs(query(col("comEncontros"), limit(50)))).map((e) => proximo(e, agora)).filter((e) => ms(e.quando) >= agora).sort((a, b) => ms(a.quando) - ms(b.quando));
  await Promise.all(itens.map(async (e) => {
    e.guardado = await getDoc(ref("comEncontros", e.id, "lugares", uid())).then((s) => s.exists()).catch(() => false);
  }));
  return itens;
}
/** Online: com link do Meet. Presencial: com lugar, sempre numa cidade. */
export function criarEncontro({ titulo, quando, link, lugar, cidade, nome, repete }) {
  const e = { uid: uid(), nome: (nome || "").slice(0, 60), titulo: titulo.slice(0, 120), quando: Timestamp.fromDate(quando), vao: 0, criadoEm: serverTimestamp() };
  if (repete) e.repete = "semanal";
  if (lugar) e.lugar = lugar.slice(0, 160); else e.link = link;
  if (cidade) e.cidade = cidade;
  return addDoc(col("comEncontros"), e);
}
export function apagarEncontro(id) { return deleteDoc(ref("comEncontros", id)); }
/** Guardar ou libertar um lugar. O contador "N pessoas vão" muda no mesmo lote (as regras confirmam). */
export function guardarLugar(id, sim) {
  const lote = writeBatch(db);
  const r = ref("comEncontros", id, "lugares", uid());
  if (sim) lote.set(r, { em: serverTimestamp() }); else lote.delete(r);
  lote.update(ref("comEncontros", id), { vao: increment(sim ? 1 : -1) });
  return lote.commit();
}

/* ---------- Cidades ---------- */
export async function cidades() {
  return lista(await getDocs(col("comCidades")))
    .sort((a, b) => (a.pais || "").localeCompare(b.pais || "") || (a.ordem ?? 99) - (b.ordem ?? 99) || (a.nome || "").localeCompare(b.nome || ""));
}
/** Cria a lista inicial (todas "em breve"). Lisboa abre já, com o Lucas como anfitrião. */
export async function semearCidades() {
  const lote = writeBatch(db);
  CIDADES_INICIAIS.forEach((c, i) => {
    const aberta = c.id === "lisboa";
    lote.set(ref("comCidades", c.id), { nome: c.nome, pais: c.pais, regiao: c.regiao, estado: aberta ? "aberta" : "em-breve", anfitrioes: aberta ? [uid()] : [], ordem: i, criadoEm: serverTimestamp() });
  });
  await lote.commit();
}
/** Só o Lucas: cria as cidades da lista que ainda não existem (em breve) e põe a região e a ordem
   nas que já existem. Não mexe em quem é anfitrião nem no estado. */
export async function acrescentarCidades(existentes) {
  const lote = writeBatch(db);
  const ja = Object.fromEntries(existentes.map((c) => [c.id, c]));
  CIDADES_INICIAIS.forEach((c, i) => {
    const e = ja[c.id];
    if (!e) lote.set(ref("comCidades", c.id), { nome: c.nome, pais: c.pais, regiao: c.regiao, estado: "em-breve", anfitrioes: [], ordem: i, criadoEm: serverTimestamp() });
    else if (e.regiao !== c.regiao || e.ordem !== i) lote.update(ref("comCidades", c.id), { regiao: c.regiao, ordem: i });
  });
  await lote.commit();
}
/** Abrir com anfitriões, ou voltar a "em breve" (lista vazia). */
export function definirAnfitrioes(cidadeId, anfitrioes) {
  const lista = [...new Set(anfitrioes)].filter(Boolean);
  return updateDoc(ref("comCidades", cidadeId), { anfitrioes: lista, estado: lista.length ? "aberta" : "em-breve" });
}
/** Quem pediu para entrar e escolheu esta cidade (o anfitrião aprova). Sem e-mails. */
export async function pendentesDaCidade(cidadeId) {
  return lista(await getDocs(query(col("comMembros"), where("cidade", "==", cidadeId), where("estado", "==", "pendente")))).sort(antigas);
}
/** Anfitriões com nome (só os que já são membros aprovados): [{ id, nome }]. */
export async function nomesDe(uids) {
  const r = await Promise.all((uids || []).map((u) => getDoc(ref("comMembros", u)).then((s) => ({ id: u, nome: s.exists() ? s.data().nome : "" })).catch(() => ({ id: u, nome: "" }))));
  return r.filter((x) => x.nome);
}
/** "Quero o NeuroMedit na minha cidade". Para uma cidade fora da lista, o id vem do nome escrito. */
export function pedirCidade(cidadeId, nome) {
  const d = { uid: uid(), cidade: cidadeId, criadoEm: serverTimestamp() };
  if (nome) d.nome = nome.slice(0, 60);
  return setDoc(ref("comPedidosCidade", `${cidadeId}_${uid()}`), d);
}
export async function jaPedi(cidadeId) {
  return getDoc(ref("comPedidosCidade", `${cidadeId}_${uid()}`)).then((s) => s.exists()).catch(() => false);
}
/** Só o Lucas: quantas pessoas pediram cada cidade (incluindo as que não estão na lista). */
export async function pedidosPorCidade() {
  const todos = lista(await getDocs(col("comPedidosCidade")));
  const conta = {};
  todos.forEach((p) => { const k = p.cidade; conta[k] = conta[k] || { n: 0, nome: p.nome || "" }; conta[k].n += 1; });
  return conta;
}

/* ---------- Seguir professores ----------
   O documento do seguidor vive em comMembros/{prof}/seguidores/{eu}; a minha lista fica no meu
   documento privado (users/{eu}.comSigo), para saber a quem já sigo. O número só o professor vê. */
export async function quemSigo() {
  const s = await getDoc(ref("users", uid())).catch(() => null);
  return s?.exists() ? (s.data().comSigo || []) : [];
}
export async function seguir(profUid, sim) {
  const lote = writeBatch(db);
  const r = ref("comMembros", profUid, "seguidores", uid());
  if (sim) lote.set(r, { em: serverTimestamp() }); else lote.delete(r);
  lote.set(ref("users", uid()), { comSigo: sim ? arrayUnion(profUid) : arrayRemove(profUid) }, { merge: true });
  await lote.commit();
}
export async function contarSeguidores() {
  const c = await getCountFromServer(col("comMembros", uid(), "seguidores"));
  return c.data().count;
}
/** O professor avisa quem o segue (novo encontro, novo aviso). Até 200 avisos; falhas não param nada. */
export async function avisarSeguidores(texto, link) {
  const s = await getDocs(query(col("comMembros", uid(), "seguidores"), limit(200))).catch(() => null);
  if (!s) return;
  await Promise.all(s.docs.map((d) => avisar(d.id, { tipo: "seguindo", texto: texto.slice(0, 200), link }).catch(() => {})));
}

/* ---------- Quero ser anfitrião ---------- */
export function pedirAnfitriao({ cidade, nome, sobre }) {
  return setDoc(ref("comPedidosAnfitriao", uid()), { uid: uid(), cidade: cidade.slice(0, 60), nome: (nome || "").slice(0, 60), sobre: sobre.slice(0, 600), criadoEm: serverTimestamp() });
}
export async function jaPediAnfitriao() {
  return getDoc(ref("comPedidosAnfitriao", uid())).then((s) => s.exists()).catch(() => false);
}
export async function pedidosAnfitriao() { return lista(await getDocs(col("comPedidosAnfitriao"))).sort(recentes); }
export function apagarPedidoAnfitriao(id) { return deleteDoc(ref("comPedidosAnfitriao", id)); }

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
/** Convite pelo e-mail. Com cidade e anfitriao: true, quem entra fica anfitrião dessa cidade. */
export function convidar(emailPessoa, { cidade = "", anfitriao = false } = {}) {
  const e = emailPessoa.trim().toLowerCase();
  const d = { email: e, criadoEm: serverTimestamp() };
  if (cidade) d.cidade = cidade;
  if (cidade && anfitriao) d.anfitriao = true;
  return setDoc(ref("comConvites", e), d);
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
  return { exportadoEm: new Date().toISOString(), email: auth.currentUser?.email || "", perfil: ficha && { nome: ficha.nome, usuario: ficha.usuario || "", bio: ficha.bio || "", interesses: ficha.interesses || [], papel: ficha.papel, estado: ficha.estado, motivos: ficha.motivos }, partilhas: (await minhasPartilhas().catch(() => [])).map(limpa) };
}
/** Sai da comunidade e apaga o que é meu: partilhas, avisos e a ficha de membro. */
export async function apagarTudoOQueEMeu() {
  for (const p of await minhasPartilhas().catch(() => [])) await apagarPartilha(p.id).catch(() => {});
  for (const a of await avisos().catch(() => [])) await apagarAviso(a.id).catch(() => {});
  // As minhas mensagens diretas também saem (a conversa fica, sem o que eu escrevi).
  for (const c of await conversas().catch(() => [])) {
    const minhas = await getDocs(query(col("comConversas", c.id, "mensagens"), where("uid", "==", uid()))).catch(() => null);
    for (const d of minhas?.docs || []) await deleteDoc(d.ref).catch(() => {});
  }
  await setDoc(ref("users", uid()), { comAnon: [] }, { merge: true }).catch(() => {});
  await deleteDoc(ref("comMembros", uid(), "privado", "contacto")).catch(() => {});
  const ficha = await getDoc(ref("comMembros", uid())).catch(() => null);
  await deleteDoc(ref("comMembros", uid()));
  const usuario = ficha?.exists() ? ficha.data().usuario : "";
  if (usuario) await deleteDoc(ref("comUsuarios", usuario)).catch(() => {});
}
