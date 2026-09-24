/*
 * NeuroMedit · Avaliações (Firestore)
 * ------------------------------------
 * Módulo com as duas únicas operações que o site faz na coleção "ratings":
 *   addRating({ meditationId, stars, comment })  → cria uma avaliação
 *   getRatingSummary(meditationId)               → { count, average }
 *
 * Reaproveita a ligação ao Firebase que já existe em firebase-init.js
 * (mesmo projeto "neuromedit", mesma versão do SDK).
 */
import { db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getAggregateFromServer,
  count,
  average,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ratingsCollection = collection(db, "ratings");

export const COMMENT_MAX = 500;

export async function addRating({ meditationId, stars, comment = "" }) {
  const id = String(meditationId || "").trim();
  const value = Number(stars);
  if (!id) throw new Error("meditationId em falta");
  if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error("stars tem de ser 1–5");

  const rating = { meditationId: id, stars: value, createdAt: serverTimestamp() };
  const text = String(comment || "").trim().slice(0, COMMENT_MAX);
  if (text) rating.comment = text;

  const ref = await addDoc(ratingsCollection, rating);
  return ref.id;
}

// Média e total calculados pelo próprio Firestore (não descarrega os comentários).
export async function getRatingSummary(meditationId) {
  const q = query(ratingsCollection, where("meditationId", "==", meditationId));
  const snapshot = await getAggregateFromServer(q, {
    count: count(),
    average: average("stars"),
  });
  const data = snapshot.data();
  return { count: data.count, average: data.average ?? null };
}
