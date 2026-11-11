/**
 * perfil-dados.js — o perfil público do colaborador (hoje, só o Lucas).
 *
 * Vive em /settings/perfil: leitura pública, escrita só do admin (firestore.rules, bloco settings).
 * A página perfil.html lê daqui; o painel (Ajustes › Perfil público) escreve.
 * Componentes do design system: ProfileHeader, VerifiedBadge, LocationCard, Testimonial (decididos a 10 nov 2026).
 */
import { db, doc, getDoc, setDoc } from "./firebase-init.js";

export const PERFIL_PADRAO = {
  nome: "Lucas Nunes",
  profissao: "Meditação guiada com base em neurociência",
  cidade: "Lisboa",
  desde: "2026",
  sobre: "Guio meditações com base em neurociência. Ao vivo, num parque ou num espaço de meditação, a voz fica perto de você e o corpo sente a vibração do som. Uma sessão de 30 minutos, só para você.",
  foto: "",
  verificado: true,
  // Morada por local (o mesmo nome dos Locais nos Ajustes). Com morada, o local ganha "Como chegar".
  moradas: {},
  // Só depoimentos reais, aprovados pelo Lucas: [{ texto, nome, data }]
  depoimentos: []
};

export async function lerPerfil() {
  try {
    const s = await getDoc(doc(db, "settings", "perfil"));
    return s.exists() ? { ...PERFIL_PADRAO, ...s.data() } : { ...PERFIL_PADRAO };
  } catch (e) {
    return { ...PERFIL_PADRAO };
  }
}

export function guardarPerfil(perfil) {
  return setDoc(doc(db, "settings", "perfil"), { ...perfil, atualizado: new Date() });
}

/** Link do Google Maps para chegar a uma morada (sem chave de API). */
export function linkRota(morada) {
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(morada);
}
