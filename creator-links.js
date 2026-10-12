/*
 * creator-links.js — monta o link do Gmail (compose) com destinatário, assunto e mensagem
 * na língua atual. O HTML traz um href simples (só com o destinatário) para funcionar sem JS.
 * Textos em translations-*.js: creator_mail_subject, creator_mail_body.
 */
(function () {
  var COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1";

  function currentLanguage() {
    return document.documentElement.lang || "pt";
  }

  function updateMailLinks() {
    if (typeof getTranslation !== "function") return;
    var language = currentLanguage();
    document.querySelectorAll("[data-creator-mail]").forEach(function (link) {
      var to = link.getAttribute("data-creator-mail");
      link.href = COMPOSE_URL +
        "&to=" + encodeURIComponent(to) +
        "&su=" + encodeURIComponent(getTranslation(language, "creator_mail_subject")) +
        "&body=" + encodeURIComponent(getTranslation(language, "creator_mail_body"));
    });
  }

  document.addEventListener("DOMContentLoaded", updateMailLinks);
  window.addEventListener("neuromedit:languagechange", updateMailLinks);
})();
