/**
 * comunidade.test.mjs — testa as regras da Comunidade em firestore.rules.
 *
 * Como correr (precisa de Java e de ligação à Google, que o ambiente do agente não tem):
 *   npm install
 *   npx firebase emulators:exec --only firestore "node --test tests/comunidade.test.mjs"
 */
import { test, before, after, beforeEach, describe } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, query, where, getDocs, serverTimestamp, writeBatch, arrayUnion, Timestamp } from "firebase/firestore";

const LUCAS = "lucas-uid", ANA = "ana-uid" /* professora, anfitriã de Lisboa */, RUI = "rui-uid" /* membro */, EVA = "eva-uid" /* membro */, ZE = "ze-uid" /* pendente, sem cidade */, FORA = "fora-uid";
const LIA = "lia-uid" /* pendente em Lisboa */, TOM = "tom-uid" /* pendente no Porto */;
let env;
const de = (uid, extra = {}) => env.authenticatedContext(uid, { email: `${uid}@x.pt`, email_verified: true, ...extra }).firestore();
const membro = (estado, papel = "membro", nome = "Nome") => ({ nome, foto: "", estado, papel, motivos: [], aceitouCuidados: true });

before(async () => {
  env = await initializeTestEnvironment({ projectId: "neuromedit-comunidade", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, "admins", LUCAS), { ok: true });
    await setDoc(doc(db, "comMembros", ANA), membro("aprovado", "professor", "Ana"));
    await setDoc(doc(db, "comMembros", RUI), membro("aprovado", "membro", "Rui"));
    await setDoc(doc(db, "comMembros", EVA), membro("aprovado", "membro", "Eva"));
    await setDoc(doc(db, "comMembros", ZE), membro("pendente", "membro", "Zé"));
    await setDoc(doc(db, "comCirculos", "c-lucas"), { nome: "Calma", criador: LUCAS });
    await setDoc(doc(db, "comCirculos", "c-ana"), { nome: "Turma da Ana", criador: ANA });
    await setDoc(doc(db, "comPartilhas", "p-rui"), { circulo: "c-lucas", uid: RUI, nome: "Rui", anon: false, pratica: "", texto: "olá", denunciada: false });
    await setDoc(doc(db, "comPartilhas", "p-anon"), { circulo: "c-ana", anon: true, pratica: "", texto: "sem nome", denunciada: false });
    await setDoc(doc(db, "comPartilhas", "p-anon", "privado", "autor"), { uid: EVA });
    await setDoc(doc(db, "comGrupos", "g-ana"), { nome: "Turma", tipo: "privado", criador: ANA, membros: [ANA, RUI] });
    await setDoc(doc(db, "comGrupos", "g-aberto"), { nome: "Manhã", tipo: "aberto", criador: ANA, membros: [ANA] });
    await setDoc(doc(db, "comGrupos", "g-ana", "mensagens", "m1"), { uid: ANA, nome: "Ana", texto: "oi" });
    // Cidades: Lisboa aberta com a Ana como anfitriã; Porto ainda em breve.
    await setDoc(doc(db, "comCidades", "lisboa"), { nome: "Lisboa", pais: "PT", estado: "aberta", anfitrioes: [ANA] });
    await setDoc(doc(db, "comCidades", "porto"), { nome: "Porto", pais: "PT", estado: "em-breve", anfitrioes: [] });
    await setDoc(doc(db, "comMembros", LIA), { ...membro("pendente", "membro", "Lia"), cidade: "lisboa" });
    await setDoc(doc(db, "comMembros", LIA, "privado", "contacto"), { uid: LIA, email: "lia@x.pt" });
    await setDoc(doc(db, "comMembros", TOM), { ...membro("pendente", "membro", "Tom"), cidade: "porto" });
  });
});

describe("Entrada", () => {
  test("quem entra pede lugar como pendente", async () => {
    await assertSucceeds(setDoc(doc(de(FORA), "comMembros", FORA), { ...membro("pendente"), criadoEm: serverTimestamp() }));
  });
  test("ninguém se aprova sozinho", async () => {
    await assertFails(setDoc(doc(de(FORA), "comMembros", FORA), membro("aprovado")));
    await assertFails(updateDoc(doc(de(ZE), "comMembros", ZE), { estado: "aprovado" }));
  });
  test("ninguém se faz professor", async () => {
    await assertFails(setDoc(doc(de(FORA), "comMembros", FORA), membro("pendente", "professor")));
    await assertFails(updateDoc(doc(de(RUI), "comMembros", RUI), { papel: "professor" }));
  });
  test("com convite do Lucas entra logo", async () => {
    await assertSucceeds(setDoc(doc(de(LUCAS), "comConvites", "fora-uid@x.pt"), { email: "fora-uid@x.pt", criadoEm: serverTimestamp() }));
    await assertSucceeds(setDoc(doc(de(FORA), "comMembros", FORA), membro("aprovado")));
  });
  test("só o Lucas aprova, remove e convida", async () => {
    await assertSucceeds(updateDoc(doc(de(LUCAS), "comMembros", ZE), { estado: "aprovado" }));
    await assertFails(updateDoc(doc(de(ANA), "comMembros", ZE), { estado: "aprovado" }));
    await assertFails(setDoc(doc(de(ANA), "comConvites", "x@x.pt"), { email: "x@x.pt" }));
    await assertSucceeds(updateDoc(doc(de(LUCAS), "comMembros", RUI), { estado: "removido" }));
  });
  test("o e-mail de um membro só é lido por ele e pelo Lucas", async () => {
    await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), "comMembros", RUI, "privado", "contacto"), { uid: RUI, email: "rui@x.pt" }));
    await assertSucceeds(getDoc(doc(de(RUI), "comMembros", RUI, "privado", "contacto")));
    await assertSucceeds(getDoc(doc(de(LUCAS), "comMembros", RUI, "privado", "contacto")));
    await assertFails(getDoc(doc(de(EVA), "comMembros", RUI, "privado", "contacto")));
    await assertFails(getDoc(doc(de(ANA), "comMembros", RUI, "privado", "contacto")));
  });
});

describe("Partilhas", () => {
  const nova = (uid, extra = {}) => ({ circulo: "c-lucas", uid, nome: "N", anon: false, pratica: "", texto: "texto", denunciada: false, criadoEm: serverTimestamp(), ...extra });
  test("membro aprovado publica; pendente e de fora não leem nem publicam", async () => {
    await assertSucceeds(addDoc(collection(de(RUI), "comPartilhas"), nova(RUI)));
    await assertFails(addDoc(collection(de(ZE), "comPartilhas"), nova(ZE)));
    await assertFails(getDoc(doc(de(ZE), "comPartilhas", "p-rui")));
    await assertFails(getDoc(doc(de(FORA), "comPartilhas", "p-rui")));
  });
  test("ninguém publica em nome de outra pessoa", async () => {
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), nova(EVA)));
  });
  test("partilha sem nome: sem uid à vista, autor guardado à parte", async () => {
    const db = de(RUI), ref = doc(collection(db, "comPartilhas")), lote = writeBatch(db);
    lote.set(doc(db, "comPartilhas", ref.id, "privado", "autor"), { uid: RUI });
    lote.set(ref, { circulo: "c-lucas", anon: true, pratica: "", texto: "t", denunciada: false, criadoEm: serverTimestamp() });
    await assertSucceeds(lote.commit());
    await assertFails(addDoc(collection(db, "comPartilhas"), { circulo: "c-lucas", anon: true, pratica: "", texto: "t", denunciada: false, criadoEm: serverTimestamp() }));
  });
  test("o autor de uma partilha sem nome só é lido por ele e pelo Lucas", async () => {
    await assertSucceeds(getDoc(doc(de(EVA), "comPartilhas", "p-anon", "privado", "autor")));
    await assertSucceeds(getDoc(doc(de(LUCAS), "comPartilhas", "p-anon", "privado", "autor")));
    await assertFails(getDoc(doc(de(RUI), "comPartilhas", "p-anon", "privado", "autor")));
    await assertFails(getDoc(doc(de(ANA), "comPartilhas", "p-anon", "privado", "autor")));
  });
  test("só o autor edita; só o texto", async () => {
    await assertSucceeds(updateDoc(doc(de(RUI), "comPartilhas", "p-rui"), { texto: "novo" }));
    await assertSucceeds(updateDoc(doc(de(EVA), "comPartilhas", "p-anon"), { texto: "novo" }));
    await assertFails(updateDoc(doc(de(EVA), "comPartilhas", "p-rui"), { texto: "novo" }));
    await assertFails(updateDoc(doc(de(RUI), "comPartilhas", "p-rui"), { nome: "Outro" }));
  });
  test("qualquer membro denuncia; só o Lucas tira a denúncia", async () => {
    await assertSucceeds(updateDoc(doc(de(EVA), "comPartilhas", "p-rui"), { denunciada: true }));
    await assertFails(updateDoc(doc(de(RUI), "comPartilhas", "p-rui"), { denunciada: false }));
    await assertSucceeds(updateDoc(doc(de(LUCAS), "comPartilhas", "p-rui"), { denunciada: false }));
  });
  test("apagar: o autor, o Lucas, ou quem criou o círculo", async () => {
    await assertFails(deleteDoc(doc(de(EVA), "comPartilhas", "p-rui")));
    await assertFails(deleteDoc(doc(de(ANA), "comPartilhas", "p-rui")));   // o círculo é do Lucas
    await assertSucceeds(deleteDoc(doc(de(ANA), "comPartilhas", "p-anon"))); // o círculo é da Ana
    await assertSucceeds(deleteDoc(doc(de(RUI), "comPartilhas", "p-rui")));
  });
  test("partilha sem nome: a autora apaga-a (a ficha do autor só sai depois)", async () => {
    await env.withSecurityRulesDisabled((c) => setDoc(doc(c.firestore(), "comPartilhas", "p-anon", "respostas", "r1"), { uid: RUI, nome: "Rui", professor: false, texto: "oi" }));
    await assertSucceeds(deleteDoc(doc(de(EVA), "comPartilhas", "p-anon", "respostas", "r1")));
    await assertSucceeds(deleteDoc(doc(de(EVA), "comPartilhas", "p-anon")));
    await assertSucceeds(deleteDoc(doc(de(EVA), "comPartilhas", "p-anon", "privado", "autor")));
  });
  test("partilha com nome pode levar a foto da conta; sem nome, nunca", async () => {
    await assertSucceeds(addDoc(collection(de(RUI), "comPartilhas"), { circulo: "c-lucas", uid: RUI, nome: "Rui", foto: "https://lh3.googleusercontent.com/a/x", anon: false, pratica: "", texto: "t", denunciada: false, criadoEm: serverTimestamp() }));
  });
  test("partilha pode levar uma foto da prática em JPEG pequeno; outra coisa não", async () => {
    const base = { circulo: "c-lucas", uid: RUI, nome: "Rui", anon: false, pratica: "", texto: "t", denunciada: false, criadoEm: serverTimestamp() };
    await assertSucceeds(addDoc(collection(de(RUI), "comPartilhas"), { ...base, imagem: "data:image/jpeg;base64,/9j/4AAQSkZJRg==" }));
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), { ...base, imagem: "https://exemplo.com/foto.jpg" }));
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), { ...base, imagem: "data:image/png;base64,iVBORw0KGgo=" }));
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), { ...base, imagem: "data:image/jpeg;base64," + "A".repeat(200000) }));
  });
  test("etiqueta Professor na partilha: só professores, e nunca sem nome", async () => {
    const base = (uid, nome) => ({ circulo: "c-lucas", uid, nome, anon: false, pratica: "", texto: "t", denunciada: false, criadoEm: serverTimestamp() });
    await assertSucceeds(addDoc(collection(de(ANA), "comPartilhas"), { ...base(ANA, "Ana"), professor: true }));
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), { ...base(RUI, "Rui"), professor: true }));
    await assertFails(addDoc(collection(de(ANA), "comPartilhas"), { ...base(ANA, "Ana"), professor: false }));
  });
  test("ressoou: cada pessoa só vê o seu", async () => {
    await assertSucceeds(setDoc(doc(de(EVA), "comPartilhas", "p-rui", "ressoou", EVA), { em: serverTimestamp() }));
    await assertFails(getDoc(doc(de(RUI), "comPartilhas", "p-rui", "ressoou", EVA)));
    await assertFails(getDocs(collection(de(RUI), "comPartilhas", "p-rui", "ressoou")));
  });
  test("resposta: assinada por quem a escreve; membro não se marca como professor", async () => {
    const r = (uid, professor) => ({ uid, nome: "N", professor, texto: "t", criadoEm: serverTimestamp() });
    await assertSucceeds(addDoc(collection(de(EVA), "comPartilhas", "p-rui", "respostas"), r(EVA, false)));
    await assertSucceeds(addDoc(collection(de(ANA), "comPartilhas", "p-rui", "respostas"), r(ANA, true)));
    await assertFails(addDoc(collection(de(EVA), "comPartilhas", "p-rui", "respostas"), r(EVA, true)));
    await assertFails(addDoc(collection(de(EVA), "comPartilhas", "p-rui", "respostas"), r(RUI, false)));
  });
});

describe("Círculos e grupos", () => {
  test("membro não cria círculo nem grupo; professor cria", async () => {
    await assertFails(addDoc(collection(de(RUI), "comCirculos"), { nome: "X", criador: RUI }));
    await assertSucceeds(addDoc(collection(de(ANA), "comCirculos"), { nome: "X", criador: ANA }));
    await assertFails(addDoc(collection(de(RUI), "comGrupos"), { nome: "X", tipo: "aberto", criador: RUI, membros: [RUI] }));
    await assertSucceeds(addDoc(collection(de(ANA), "comGrupos"), { nome: "X", tipo: "aberto", criador: ANA, membros: [ANA] }));
  });
  test("professor só apaga o círculo que criou; o Lucas apaga qualquer um", async () => {
    await assertFails(deleteDoc(doc(de(ANA), "comCirculos", "c-lucas")));
    await assertSucceeds(deleteDoc(doc(de(ANA), "comCirculos", "c-ana")));
    await assertSucceeds(deleteDoc(doc(de(LUCAS), "comCirculos", "c-lucas")));
  });
  test("a conversa de um grupo privado só é lida por quem está nele (e pelo Lucas)", async () => {
    await assertSucceeds(getDocs(collection(de(RUI), "comGrupos", "g-ana", "mensagens")));
    await assertFails(getDocs(collection(de(EVA), "comGrupos", "g-ana", "mensagens")));
    await assertFails(getDoc(doc(de(EVA), "comGrupos", "g-ana")));
    await assertSucceeds(getDocs(collection(de(LUCAS), "comGrupos", "g-ana", "mensagens")));
  });
  test("num grupo aberto cada um entra por si, mas não mete outra pessoa", async () => {
    await assertSucceeds(updateDoc(doc(de(EVA), "comGrupos", "g-aberto"), { membros: arrayUnion(EVA) }));
    await assertFails(updateDoc(doc(de(RUI), "comGrupos", "g-aberto"), { membros: arrayUnion(ZE) }));
    await assertFails(updateDoc(doc(de(EVA), "comGrupos", "g-ana"), { membros: arrayUnion(EVA) }));
  });
  test("as listas de grupos que a página pede são permitidas", async () => {
    await assertSucceeds(getDocs(query(collection(de(RUI), "comGrupos"), where("membros", "array-contains", RUI))));
    await assertSucceeds(getDocs(query(collection(de(RUI), "comGrupos"), where("tipo", "==", "aberto"))));
    await assertFails(getDocs(collection(de(RUI), "comGrupos")));
  });
});

describe("Encontros e avisos", () => {
  const enc = (uid, link) => ({ uid, nome: "N", titulo: "Meditar", quando: Timestamp.fromDate(new Date("2027-01-01T19:00:00Z")), link, criadoEm: serverTimestamp() });
  test("encontro: só professor, e o link tem de ser do Google Meet", async () => {
    await assertSucceeds(addDoc(collection(de(ANA), "comEncontros"), enc(ANA, "https://meet.google.com/abc-defg-hij")));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), enc(ANA, "https://exemplo.com/sala")));
    await assertFails(addDoc(collection(de(RUI), "comEncontros"), enc(RUI, "https://meet.google.com/abc-defg-hij")));
  });
  test("avisos: só o dono lê; quem deixa o aviso assina com o seu uid", async () => {
    const a = (de_) => ({ tipo: "resposta", texto: "Há uma resposta.", link: "comunidade.html", de: de_, lido: false, criadoEm: serverTimestamp() });
    await assertSucceeds(addDoc(collection(de(EVA), "comAvisos", RUI, "itens"), a(EVA)));
    await assertFails(addDoc(collection(de(EVA), "comAvisos", RUI, "itens"), a(LUCAS)));
    await assertFails(addDoc(collection(de(ZE), "comAvisos", RUI, "itens"), a(ZE)));
    await assertSucceeds(getDocs(collection(de(RUI), "comAvisos", RUI, "itens")));
    await assertFails(getDocs(collection(de(EVA), "comAvisos", RUI, "itens")));
  });
});

describe("Cidades", () => {
  const encontro = (extra) => ({ uid: ANA, nome: "Ana", titulo: "Meditação no jardim", quando: Timestamp.fromDate(new Date(Date.now() + 864e5)), criadoEm: serverTimestamp(), ...extra });
  test("só o Lucas cria e muda cidades; uma cidade só abre com anfitrião", async () => {
    await assertSucceeds(setDoc(doc(de(LUCAS), "comCidades", "recife"), { nome: "Recife", pais: "BR", regiao: "PE", estado: "em-breve", anfitrioes: [] }));
    await assertFails(setDoc(doc(de(LUCAS), "comCidades", "aracaju"), { nome: "Aracaju", pais: "BR", estado: "aberta", anfitrioes: [] }));
    await assertFails(updateDoc(doc(de(ANA), "comCidades", "lisboa"), { anfitrioes: [ANA, RUI] }));
    await assertSucceeds(updateDoc(doc(de(LUCAS), "comCidades", "porto"), { estado: "aberta", anfitrioes: [ANA] }));
  });
  test("a anfitriã vê e aprova quem pediu para entrar na sua cidade, e só aí", async () => {
    await assertSucceeds(getDocs(query(collection(de(ANA), "comMembros"), where("cidade", "==", "lisboa"), where("estado", "==", "pendente"))));
    await assertFails(getDocs(query(collection(de(ANA), "comMembros"), where("cidade", "==", "porto"), where("estado", "==", "pendente"))));
    await assertSucceeds(updateDoc(doc(de(ANA), "comMembros", LIA), { estado: "aprovado" }));
    await assertFails(updateDoc(doc(de(ANA), "comMembros", TOM), { estado: "aprovado" }));
    await assertFails(updateDoc(doc(de(RUI), "comMembros", LIA), { estado: "aprovado" }));
  });
  test("a anfitriã não dá outro papel nem lê o e-mail", async () => {
    await assertFails(updateDoc(doc(de(ANA), "comMembros", LIA), { estado: "aprovado", papel: "professor" }));
    await assertFails(getDoc(doc(de(ANA), "comMembros", LIA, "privado", "contacto")));
  });
  test("a anfitriã recusa (apaga) um pedido da sua cidade", async () => {
    await assertSucceeds(deleteDoc(doc(de(ANA), "comMembros", LIA, "privado", "contacto")));
    await assertSucceeds(deleteDoc(doc(de(ANA), "comMembros", LIA)));
    await assertFails(deleteDoc(doc(de(ANA), "comMembros", TOM)));
  });
  test("cada pessoa escolhe a sua cidade, que tem de existir", async () => {
    await assertSucceeds(updateDoc(doc(de(RUI), "comMembros", RUI), { cidade: "porto" }));
    await assertFails(updateDoc(doc(de(RUI), "comMembros", RUI), { cidade: "atlantida" }));
  });
  test("quero o NeuroMedit na minha cidade: um pedido por pessoa, só o Lucas vê todos", async () => {
    await assertSucceeds(setDoc(doc(de(FORA), "comPedidosCidade", "porto_" + FORA), { uid: FORA, cidade: "porto", criadoEm: serverTimestamp() }));
    await assertFails(setDoc(doc(de(FORA), "comPedidosCidade", "porto_outro"), { uid: FORA, cidade: "porto", criadoEm: serverTimestamp() }));
    await assertFails(getDocs(collection(de(RUI), "comPedidosCidade")));
    await assertSucceeds(getDocs(collection(de(LUCAS), "comPedidosCidade")));
  });
  test("encontro presencial: lugar numa cidade aberta; online: só Meet", async () => {
    await assertSucceeds(addDoc(collection(de(ANA), "comEncontros"), encontro({ cidade: "lisboa", lugar: "Jardim da Estrela, junto ao coreto" })));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), encontro({ lugar: "Jardim da Estrela" })));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), encontro({ cidade: "porto", lugar: "Palácio de Cristal" })));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), encontro({ cidade: "lisboa", lugar: "Estrela", link: "https://meet.google.com/abc" })));
    await assertSucceeds(addDoc(collection(de(ANA), "comEncontros"), encontro({ link: "https://meet.google.com/abc-defg-hij" })));
  });
  test("mural da cidade: só cidades abertas; a anfitriã modera", async () => {
    const p = { uid: RUI, nome: "Rui", anon: false, pratica: "", texto: "Primeira vez no jardim", denunciada: false, criadoEm: serverTimestamp() };
    await assertSucceeds(addDoc(collection(de(RUI), "comPartilhas"), { ...p, circulo: "lisboa" }));
    await assertFails(addDoc(collection(de(RUI), "comPartilhas"), { ...p, circulo: "porto" }));
    await env.withSecurityRulesDisabled(async (c) => setDoc(doc(c.firestore(), "comPartilhas", "p-lx"), { ...p, circulo: "lisboa", criadoEm: Timestamp.now() }));
    await assertSucceeds(deleteDoc(doc(de(ANA), "comPartilhas", "p-lx")));
  });
  test("subcomunidade: grupo de professor numa cidade aberta", async () => {
    const g = { nome: "Yoga ao nascer do sol", tipo: "aberto", criador: ANA, membros: [ANA] };
    await assertSucceeds(addDoc(collection(de(ANA), "comGrupos"), { ...g, cidade: "lisboa" }));
    await assertFails(addDoc(collection(de(ANA), "comGrupos"), { ...g, cidade: "porto" }));
    await assertFails(addDoc(collection(de(RUI), "comGrupos"), { ...g, criador: RUI, membros: [RUI], cidade: "lisboa" }));
  });
});

describe("Seguir, quem vai e anfitriões", () => {
  const enc = (extra) => ({ uid: ANA, nome: "Ana", titulo: "Meditação no jardim", quando: Timestamp.fromDate(new Date(Date.now() + 864e5)), criadoEm: serverTimestamp(), cidade: "lisboa", lugar: "Jardim da Estrela", ...extra });
  test("só se seguem professores; ninguém se segue a si mesmo", async () => {
    await assertSucceeds(setDoc(doc(de(RUI), "comMembros", ANA, "seguidores", RUI), { em: serverTimestamp() }));
    await assertFails(setDoc(doc(de(RUI), "comMembros", EVA, "seguidores", RUI), { em: serverTimestamp() }));
    await assertFails(setDoc(doc(de(ANA), "comMembros", ANA, "seguidores", ANA), { em: serverTimestamp() }));
    await assertFails(setDoc(doc(de(RUI), "comMembros", ANA, "seguidores", EVA), { em: serverTimestamp() }));
  });
  test("o número de seguidores só o professor vê", async () => {
    await env.withSecurityRulesDisabled(async (c) => setDoc(doc(c.firestore(), "comMembros", ANA, "seguidores", RUI), { em: Timestamp.now() }));
    await assertSucceeds(getDocs(collection(de(ANA), "comMembros", ANA, "seguidores")));
    await assertFails(getDocs(collection(de(EVA), "comMembros", ANA, "seguidores")));
  });
  test("encontro semanal; outra repetição não", async () => {
    await assertSucceeds(addDoc(collection(de(ANA), "comEncontros"), enc({ repete: "semanal", vao: 0 })));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), enc({ repete: "diario" })));
    await assertFails(addDoc(collection(de(ANA), "comEncontros"), enc({ vao: 50 })));
  });
  test("\"N pessoas vão\": o contador só muda 1, com o lugar guardado ou libertado no mesmo lote", async () => {
    await env.withSecurityRulesDisabled(async (c) => setDoc(doc(c.firestore(), "comEncontros", "e1"), { ...enc({ vao: 3 }), criadoEm: Timestamp.now() }));
    const guardar = (u, n) => { const b = writeBatch(de(u)); b.set(doc(de(u), "comEncontros", "e1", "lugares", u), { em: serverTimestamp() }); b.update(doc(de(u), "comEncontros", "e1"), { vao: n }); return b.commit(); };
    await assertFails(guardar(RUI, 5));
    await assertSucceeds(guardar(RUI, 4));
    await assertFails(updateDoc(doc(de(EVA), "comEncontros", "e1"), { vao: 5 }));
    const b = writeBatch(de(RUI)); b.delete(doc(de(RUI), "comEncontros", "e1", "lugares", RUI)); b.update(doc(de(RUI), "comEncontros", "e1"), { vao: 3 });
    await assertSucceeds(b.commit());
  });
  test("aviso de boas-vindas e de quem se segue", async () => {
    const av = (tipo) => ({ tipo, texto: "Olá!", link: "comunidade.html", de: ANA, lido: false, criadoEm: serverTimestamp() });
    await assertSucceeds(addDoc(collection(de(ANA), "comAvisos", RUI, "itens"), av("boas-vindas")));
    await assertSucceeds(addDoc(collection(de(ANA), "comAvisos", RUI, "itens"), av("seguindo")));
    await assertFails(addDoc(collection(de(ANA), "comAvisos", RUI, "itens"), av("publicidade")));
  });
  test("quero ser anfitrião: cada um o seu pedido; só o Lucas lê todos", async () => {
    const p = { uid: RUI, cidade: "Porto", nome: "Rui", sobre: "Yoga há 5 anos", criadoEm: serverTimestamp() };
    await assertSucceeds(setDoc(doc(de(RUI), "comPedidosAnfitriao", RUI), p));
    await assertFails(setDoc(doc(de(RUI), "comPedidosAnfitriao", EVA), { ...p, uid: EVA }));
    await assertFails(getDocs(collection(de(EVA), "comPedidosAnfitriao")));
    await assertSucceeds(getDocs(collection(de(LUCAS), "comPedidosAnfitriao")));
  });
});
