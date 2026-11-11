/**
 * regras.test.mjs — testa firestore.rules contra o emulador do Firestore.
 *
 * Porquê existir: as regras que separam os dados de cada profissional foram escritas e
 * publicadas sem nunca terem corrido. Enquanto só o Lucas usa o painel não há risco; no
 * dia em que entrar outra pessoa, há. Este ficheiro é o que transforma "acho que está
 * certo" em "está certo".
 *
 * Como correr (precisa de Java e de ligação à Google, que o ambiente do agente não tem):
 *
 *   npm install
 *   npx firebase emulators:exec --only firestore "node --test tests/regras.test.mjs"
 *
 * Os casos são os de docs/contas-por-profissional.md.
 */

import { strict as assert } from "node:assert";
import { test, before, after, beforeEach, describe } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

const ADMIN = "lucas-uid";
const ANA = "ana-uid";      // profissional
const BRUNO = "bruno-uid";  // outro profissional
const CLIENTE = "cliente-uid";

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "neuromedit-regras",
    firestore: { rules: readFileSync("firestore.rules", "utf8") }
  });
});

after(async () => { await env?.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  // Dados de partida, escritos sem passar pelas regras.
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "admins", ADMIN), { nome: "Lucas" });
    await setDoc(doc(db, "pros", ANA), {
      estado: "rascunho",
      perfil: { nome: "Ana", area: "Yoga" },
      sessao: { duracao: 60 }
    });
    await setDoc(doc(db, "pros", BRUNO), {
      estado: "aprovado",
      perfil: { nome: "Bruno", area: "Massagem" },
      sessao: { duracao: 60 }
    });
  });
});

const comoAna = () => env.authenticatedContext(ANA).firestore();
const comoBruno = () => env.authenticatedContext(BRUNO).firestore();
const comoAdmin = () => env.authenticatedContext(ADMIN).firestore();
const comoCliente = () => env.authenticatedContext(CLIENTE).firestore();
const semLogin = () => env.unauthenticatedContext().firestore();

describe("quem pode ver um perfil", () => {
  test("sem login, lê um perfil aprovado", async () => {
    await assertSucceeds(getDoc(doc(semLogin(), "pros", BRUNO)));
  });

  test("sem login, NÃO lê um rascunho", async () => {
    await assertFails(getDoc(doc(semLogin(), "pros", ANA)));
  });

  test("a dona lê o seu próprio rascunho", async () => {
    await assertSucceeds(getDoc(doc(comoAna(), "pros", ANA)));
  });

  test("outro profissional NÃO lê o rascunho alheio", async () => {
    await assertFails(getDoc(doc(comoBruno(), "pros", ANA)));
  });

  test("o admin lê qualquer rascunho", async () => {
    await assertSucceeds(getDoc(doc(comoAdmin(), "pros", ANA)));
  });
});

describe("quem pode aprovar", () => {
  test("a dona pede aprovação: rascunho vai a pendente", async () => {
    await assertSucceeds(updateDoc(doc(comoAna(), "pros", ANA), { estado: "pendente" }));
  });

  test("a dona NÃO se aprova a si própria", async () => {
    await assertFails(updateDoc(doc(comoAna(), "pros", ANA), { estado: "aprovado" }));
  });

  test("a dona NÃO salta de rascunho direto a aprovado nem com outros campos à mistura", async () => {
    await assertFails(updateDoc(doc(comoAna(), "pros", ANA), { estado: "aprovado", perfil: { nome: "Ana" } }));
  });

  test("o admin aprova", async () => {
    await assertSucceeds(updateDoc(doc(comoAdmin(), "pros", ANA), { estado: "aprovado" }));
  });

  test("a dona edita o perfil sem mexer no estado", async () => {
    await assertSucceeds(updateDoc(doc(comoAna(), "pros", ANA), { perfil: { nome: "Ana Reis", area: "Yoga" } }));
  });

  test("outro profissional NÃO escreve no perfil alheio", async () => {
    await assertFails(updateDoc(doc(comoBruno(), "pros", ANA), { estado: "aprovado" }));
  });

  test("ninguém se cria já aprovado", async () => {
    const novo = env.authenticatedContext("nova-uid").firestore();
    await assertFails(setDoc(doc(novo, "pros", "nova-uid"), { estado: "aprovado", perfil: {}, sessao: {} }));
    await assertSucceeds(setDoc(doc(novo, "pros", "nova-uid"), { estado: "rascunho", perfil: {}, sessao: {} }));
  });
});

describe("horários e pedidos", () => {
  const slotDaAna = `${ANA}_2026-12-01_10`;

  test("o cliente ocupa um horário com o prefixo certo", async () => {
    await assertSucceeds(setDoc(doc(comoCliente(), "slots", slotDaAna), {
      uid: CLIENTE, bookingId: "p1", proId: ANA
    }));
  });

  test("NÃO ocupa um horário cujo prefixo não bate com o proId", async () => {
    await assertFails(setDoc(doc(comoCliente(), "slots", `${BRUNO}_2026-12-01_10`), {
      uid: CLIENTE, bookingId: "p1", proId: ANA
    }));
  });

  test("o pedido nasce ligado ao horário e ao profissional", async () => {
    const db = comoCliente();
    await setDoc(doc(db, "slots", slotDaAna), { uid: CLIENTE, bookingId: "p1", proId: ANA });
    await assertSucceeds(setDoc(doc(db, "bookings", "p1"), {
      userId: CLIENTE, proId: ANA, slotId: slotDaAna, estado: "pedida", valor: 30, sinal: 5
    }));
  });

  test("o pedido NÃO pode nascer já com sinal recebido", async () => {
    const db = comoCliente();
    await setDoc(doc(db, "slots", slotDaAna), { uid: CLIENTE, bookingId: "p2", proId: ANA });
    await assertFails(setDoc(doc(db, "bookings", "p2"), {
      userId: CLIENTE, proId: ANA, slotId: slotDaAna, estado: "pedida", valor: 30, sinal: 5, sinalRecebido: true
    }));
  });

  test("a profissional lê os seus pedidos e NÃO os de outra pessoa", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "bookings", "da-ana"), { userId: CLIENTE, proId: ANA, estado: "pedida", valor: 30, sinal: 5 });
      await setDoc(doc(db, "bookings", "do-bruno"), { userId: CLIENTE, proId: BRUNO, estado: "pedida", valor: 30, sinal: 5 });
      await setDoc(doc(db, "bookings", "do-lucas"), { userId: CLIENTE, estado: "pedida", valor: 30, sinal: 5 });
    });
    const db = comoAna();
    await assertSucceeds(getDocs(query(collection(db, "bookings"), where("proId", "==", ANA))));
    await assertFails(getDoc(doc(db, "bookings", "do-bruno")));
    await assertFails(getDoc(doc(db, "bookings", "do-lucas")));
  });

  test("o cliente cancela o seu pedido e só isso", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "bookings", "meu"), {
        userId: CLIENTE, proId: ANA, estado: "pedida", valor: 30, sinal: 5
      });
    });
    const db = comoCliente();
    await assertFails(updateDoc(doc(db, "bookings", "meu"), { valor: 0 }));
    await assertSucceeds(updateDoc(doc(db, "bookings", "meu"), { estado: "cancelada", canceladoPor: "cliente" }));
  });

  test("as moradas do cliente têm limite de tamanho", async () => {
    const db = comoCliente();
    const slot = `${ANA}_2026-12-02_10`;
    await setDoc(doc(db, "slots", slot), { uid: CLIENTE, bookingId: "p3", proId: ANA });
    await assertFails(setDoc(doc(db, "bookings", "p3"), {
      userId: CLIENTE, proId: ANA, slotId: slot, estado: "pedida", valor: 30, sinal: 5,
      moradaCliente: "x".repeat(201)
    }));
  });
});

describe("o painel do Lucas continua como estava", () => {
  test("os ajustes são públicos de ler e só o admin escreve", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "settings", "sessao"), { duracao: 30 });
    });
    await assertSucceeds(getDoc(doc(semLogin(), "settings", "sessao")));
    await assertFails(setDoc(doc(comoAna(), "settings", "sessao"), { duracao: 90 }));
    await assertSucceeds(setDoc(doc(comoAdmin(), "settings", "sessao"), { duracao: 45 }));
  });

  test("um pedido sem proId é do Lucas e nenhum profissional lhe toca", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "bookings", "antigo"), {
        userId: CLIENTE, estado: "pedida", valor: 30, sinal: 5
      });
    });
    await assertFails(updateDoc(doc(comoAna(), "bookings", "antigo"), { estado: "confirmada" }));
    await assertSucceeds(updateDoc(doc(comoAdmin(), "bookings", "antigo"), { estado: "confirmada" }));
  });

  test("ninguém se torna admin a partir do site", async () => {
    await assertFails(setDoc(doc(comoAna(), "admins", ANA), { nome: "Ana" }));
    await assertFails(setDoc(doc(comoAdmin(), "admins", "outro"), { nome: "Outro" }));
  });

  test("uma pessoa só pergunta se é admin sobre si própria", async () => {
    await assertSucceeds(getDoc(doc(comoAna(), "admins", ANA)));
    await assertFails(getDoc(doc(comoAna(), "admins", ADMIN)));
  });
});

describe("a disponibilidade de cada profissional", () => {
  test("a dona escreve e lê os seus meses", async () => {
    await assertSucceeds(setDoc(doc(comoAna(), "pros", ANA, "availability", "2026-12"), { publicado: false, dias: {} }));
    await assertSucceeds(getDoc(doc(comoAna(), "pros", ANA, "availability", "2026-12")));
  });

  test("outro profissional NÃO escreve nos meses alheios", async () => {
    await assertFails(setDoc(doc(comoBruno(), "pros", ANA, "availability", "2026-12"), { publicado: true }));
  });

  test("sem login, só se lê um mês publicado de um perfil aprovado", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "pros", BRUNO, "availability", "2026-12"), { publicado: true, dias: {} });
      await setDoc(doc(db, "pros", ANA, "availability", "2026-12"), { publicado: true, dias: {} });
    });
    await assertSucceeds(getDoc(doc(semLogin(), "pros", BRUNO, "availability", "2026-12")));
    // A Ana ainda está em rascunho: o mês dela não é público, mesmo publicado.
    await assertFails(getDoc(doc(semLogin(), "pros", ANA, "availability", "2026-12")));
  });
});
