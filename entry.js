/*
 * entry.js — as duas portas do site.
 *
 *  · Quem vem do TikTok (ligação da bio com ?from=tiktok) fica em index.html,
 *    no alívio: um toque e começa. Sem "Explorar antes".
 *  · Quem chega à raiz de outro modo (Google, endereço escrito, partilha) vai
 *    direto para home.html, antes de qualquer áudio.
 *  · Voltas internas ao alívio não são redirecionadas: index.html#airlock
 *    (botões "Começar" da Home e da Filosofia), "repetir sessão" do feedback e
 *    qualquer ligação vinda de uma página do próprio site.
 *
 * Carregar no <head> de index.html, antes de tudo, para o redirecionamento
 * acontecer antes de qualquer pintura ou áudio.
 */
(() => {
  const KEY = "neuromedit-origin";
  const root = document.documentElement;

  let from = "";
  let refHost = "";
  try {
    from = (new URLSearchParams(window.location.search).get("from") || "").toLowerCase();
    refHost = document.referrer ? new URL(document.referrer).hostname : "";
  } catch (error) {}

  const userAgent = navigator.userAgent || "";
  // O parâmetro é o sinal fiável. O referrer e o navegador interno do TikTok
  // são reserva: o app às vezes corta o referrer.
  const fromTikTok = from === "tiktok"
    || /(^|\.)tiktok\.com$/.test(refHost)
    || /musical_ly|BytedanceWebview|TikTok/i.test(userAgent);

  const sameSite = Boolean(refHost) && refHost === window.location.hostname;

  let stored = "";
  try { stored = sessionStorage.getItem(KEY) || ""; } catch (error) {}

  const origin = fromTikTok ? "tiktok" : stored;
  if (fromTikTok) {
    try { sessionStorage.setItem(KEY, "tiktok"); } catch (error) {}
  }

  const path = window.location.pathname;
  const onIndex = path.endsWith("/") || path.endsWith("/index.html") || path === "index.html";
  const cold = !fromTikTok && !window.location.hash && !sameSite;

  if (onIndex && cold) {
    try { sessionStorage.setItem(KEY, "other"); } catch (error) {}
    window.location.replace("home.html");
    return;
  }

  if (origin) root.dataset.origin = origin;
})();
