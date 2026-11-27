/* ==========================================================
   nav-global.js — a mesma navegação em todas as páginas (nov 2026).
   Uma linha em qualquer página que ainda não tenha o cabeçalho do site:
     <script src="nav-global.js" defer></script>
   Põe o cabeçalho (voltar, início, biblioteca, comunidade, pesquisa, conta e configurações)
   e, no telemóvel, a barra de baixo (voltar, início, biblioteca, menu) — os mesmos de
   todas as outras páginas, com os mesmos scripts (header-nav.js, bottom-nav.js, settings-panel.js).
   Opções no <body>:
     data-nav-sem-barra  → só o cabeçalho (páginas que já têm uma barra de ação em baixo, como a reserva).
   ========================================================== */
(() => {
  if (document.querySelector("[data-header]")) return;
  const CABECALHO = "  <header class=\"site-header\" data-header>\n    <div class=\"container header-shell\">\n      <a class=\"brand\" href=\"/\"><img src=\"assets/neuromedit-symbol-vector.svg\" alt=\"NeuroMedit symbol\" class=\"brand-symbol\"><span class=\"brand-wordmark\">NeuroMedit</span></a>\n\n      <nav class=\"header-nav header-nav-desktop\" aria-label=\"Main navigation\" data-i18n=\"library_nav_aria\" data-i18n-attr=\"aria-label\">\n        <span class=\"nav-indicator\" aria-hidden=\"true\"></span>\n        <a href=\"home.html\" class=\"header-nav-link nav-link\" data-nav-key=\"home\" aria-label=\"Home\" title=\"Home\" data-i18n=\"library_nav_home\" data-i18n-attr=\"aria-label,title\">\n          <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M3.5 10.5L12 3.75L20.5 10.5V19.5H14.75V14.25H9.25V19.5H3.5V10.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n          <span class=\"header-nav-text\" data-i18n=\"library_nav_home\">Home</span>\n        </a>\n        <a href=\"library.html\" class=\"header-nav-link nav-link\" data-nav-key=\"library\" aria-label=\"Library\" title=\"Library\" data-i18n=\"library_nav_library\" data-i18n-attr=\"aria-label,title\">\n          <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M12 6.5C10.3 5.4 8.3 4.85 6.25 4.9C5.03 4.93 3.83 5.18 2.7 5.65V18.35C3.83 17.88 5.03 17.63 6.25 17.6C8.3 17.55 10.3 18.1 12 19.2C13.7 18.1 15.7 17.55 17.75 17.6C18.97 17.63 20.17 17.88 21.3 18.35V5.65C20.17 5.18 18.97 4.93 17.75 4.9C15.7 4.85 13.7 5.4 12 6.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M12 6.5V19.2\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n          <span class=\"header-nav-text\" data-i18n=\"library_nav_library\">Library</span>\n        </a>\n        <a href=\"about.html\" class=\"header-nav-link nav-link\" data-nav-key=\"about\" aria-label=\"About\" title=\"About\" data-i18n=\"library_nav_about\" data-i18n-attr=\"aria-label,title\">\n          <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke=\"currentColor\" stroke-width=\"1.8\"></circle><path d=\"M12 10.75V15.25\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path><circle cx=\"12\" cy=\"8.2\" r=\"0.8\" fill=\"currentColor\"></circle></svg></span>\n          <span class=\"header-nav-text\" data-i18n=\"library_nav_about\">About</span>\n        </a>\n      </nav>\n\n      <div class=\"header-actions\">\n        <div class=\"header-language-slot\" data-language-host></div>\n\n        <button\n          type=\"button\"\n          class=\"header-menu-toggle\"\n          data-mobile-toggle\n          aria-controls=\"library-mobile-nav\"\n          aria-expanded=\"false\"\n          aria-label=\"Open menu\"\n          title=\"Open menu\"\n          data-i18n=\"global_menu_open\"\n          data-i18n-attr=\"aria-label,title\"\n        >\n          <span class=\"header-menu-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M4 7.5H20\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path><path d=\"M4 12H20\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path><path d=\"M4 16.5H20\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path></svg></span>\n        </button>\n      </div>\n    </div>\n\n    <div class=\"header-mobile-overlay\" data-mobile-overlay hidden></div>\n\n    <aside id=\"library-mobile-nav\" class=\"header-mobile-panel\" data-mobile-panel aria-hidden=\"true\" hidden>\n      <div class=\"header-mobile-inner\">\n        <div class=\"header-mobile-top\">\n          <p class=\"header-mobile-brand\">NeuroMedit</p>\n\n          <button\n            type=\"button\"\n            class=\"header-mobile-close\"\n            data-mobile-close\n            aria-label=\"Close menu\"\n            title=\"Close menu\"\n            data-i18n=\"global_menu_close\"\n            data-i18n-attr=\"aria-label,title\"\n          >\n            <span class=\"header-menu-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M6.5 6.5L17.5 17.5\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path><path d=\"M17.5 6.5L6.5 17.5\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path></svg></span>\n          </button>\n        </div>\n\n        <nav class=\"header-mobile-nav\" aria-label=\"Main navigation\" data-i18n=\"library_nav_aria\" data-i18n-attr=\"aria-label\">\n          <a href=\"home.html\" class=\"header-mobile-link nav-link\" data-nav-key=\"home\" aria-label=\"Home\" title=\"Home\" data-i18n=\"library_nav_home\" data-i18n-attr=\"aria-label,title\">\n            <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M3.5 10.5L12 3.75L20.5 10.5V19.5H14.75V14.25H9.25V19.5H3.5V10.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n            <span class=\"header-mobile-text\" data-i18n=\"library_nav_home\">Home</span>\n          </a>\n          <a href=\"library.html\" class=\"header-mobile-link nav-link\" data-nav-key=\"library\" aria-label=\"Library\" title=\"Library\" data-i18n=\"library_nav_library\" data-i18n-attr=\"aria-label,title\">\n            <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><path d=\"M12 6.5C10.3 5.4 8.3 4.85 6.25 4.9C5.03 4.93 3.83 5.18 2.7 5.65V18.35C3.83 17.88 5.03 17.63 6.25 17.6C8.3 17.55 10.3 18.1 12 19.2C13.7 18.1 15.7 17.55 17.75 17.6C18.97 17.63 20.17 17.88 21.3 18.35V5.65C20.17 5.18 18.97 4.93 17.75 4.9C15.7 4.85 13.7 5.4 12 6.5Z\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path><path d=\"M12 6.5V19.2\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></path></svg></span>\n            <span class=\"header-mobile-text\" data-i18n=\"library_nav_library\">Library</span>\n          </a>\n          <a href=\"about.html\" class=\"header-mobile-link nav-link\" data-nav-key=\"about\" aria-label=\"About\" title=\"About\" data-i18n=\"library_nav_about\" data-i18n-attr=\"aria-label,title\">\n            <span class=\"header-nav-icon\" aria-hidden=\"true\"><svg viewBox=\"0 0 24 24\" fill=\"none\" focusable=\"false\"><circle cx=\"12\" cy=\"12\" r=\"8.5\" stroke=\"currentColor\" stroke-width=\"1.8\"></circle><path d=\"M12 10.75V15.25\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"></path><circle cx=\"12\" cy=\"8.2\" r=\"0.8\" fill=\"currentColor\"></circle></svg></span>\n            <span class=\"header-mobile-text\" data-i18n=\"library_nav_about\">About</span>\n          </a>\n        </nav>\n      </div>\n    </aside>\n  </header>";
  const CSS = ["i18n.css", "share-button.css", "header.css", "bottom-nav.css", "settings-panel.css"];
  const SCRIPTS = ["translations-en.js", "translations-pt.js", "translations-it.js", "translations-es.js", "translations-ru.js", "translations.js", "share-button.js", "header-nav.js", "bottom-nav.js", "settings-panel.js"];
  const temCss = (h) => [...document.querySelectorAll('link[rel="stylesheet"]')].some((l) => (l.getAttribute("href") || "").replace(/^\//, "") === h);
  const temJs = (h) => [...document.scripts].some((s) => (s.getAttribute("src") || "").replace(/^\//, "") === h);
  const base = document.currentScript && /^\//.test(document.currentScript.getAttribute("src") || "") ? "/" : "";

  const semBarra = document.body.hasAttribute("data-nav-sem-barra");
  const link = (h) => { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = base + h; return l; };
  const primeiro = document.head.firstChild;
  // 1) Os tokens do design system antes dos estilos da página: as páginas antigas que não os carregam
  //    ganham as medidas da barra (largura, alturas, raios) e mantêm as suas próprias cores.
  if (!temCss("tokens.css")) document.head.insertBefore(link("tokens.css"), primeiro);
  // 2) O mesmo ponto de partida das outras páginas (o reset e o .container do library.css), só para a navegação,
  //    também antes dos estilos da página e com a mesma prioridade que lá têm: o header.css continua a mandar.
  const st = document.createElement("style");
  const NAV = ".site-header,.bottom-header,.bottom-back,.bottom-sheet,.bottom-sheet-overlay,.library-search-dock,.library-search-results,.settings-panel,.settings-overlay,.settings-fab";
  st.textContent = `:where(${NAV}),:where(${NAV}) *{margin:0;padding:0;box-sizing:border-box}:where(${NAV}){font-family:Arial,sans-serif;line-height:1.5}`
    + ".container:where(.site-header *){max-width:var(--container);margin:0 auto;padding:0 1.5rem}"
    + "@media (max-width:640px){.container:where(.site-header *){padding:0 1rem}}"
    + ".site-header{position:sticky;top:0;z-index:20}"
    + ".site-header a,.site-header a:hover,.bottom-header a{text-decoration:none}";
  document.head.insertBefore(st, primeiro);
  // 3) As folhas da navegação, no fim (como nas outras páginas). Sem a barra de baixo, o telemóvel
  //    usa o menu do cabeçalho (o bottom-nav.css esconde-o).
  CSS.filter((h) => !temCss(h) && !(semBarra && h === "bottom-nav.css")).forEach((h) => document.head.append(link(h)));
  // 4) Proteção, no fim: classes com o mesmo nome nas páginas antigas (.brand, .container) não mexem na barra.
  const prot = document.createElement("style");
  prot.textContent = ".site-header .brand{letter-spacing:normal;text-transform:none;margin-bottom:0;color:inherit}"
    + "@media (min-width:641px){.site-header .container{max-width:var(--container)}}";
  document.head.append(prot);

  const tpl = document.createElement("template");
  tpl.innerHTML = CABECALHO.replace(/(src|href)="(?!\/|https?:|#)([^"]+)"/g, (m, a, v) => `${a}="${base}${v}"`);
  document.body.prepend(tpl.content);
  // A marca leva sempre ao Início, num toque (aqui não há passagem pela entrada).
  const marca = document.querySelector(".site-header .brand");
  if (marca) { marca.href = base + "home.html"; marca.setAttribute("aria-label", "NeuroMedit, início"); }
  // Nenhum destino do menu é "esta página": nenhum fica marcado como atual por engano.
  if (!document.body.hasAttribute("data-sem-nav")) document.body.setAttribute("data-sem-nav", "");

  // Um script de cada vez, pela ordem: as traduções primeiro, depois a navegação.
  const falta = SCRIPTS.filter((h) => !temJs(h));
  (function seguinte() {
    const h = falta.shift();
    if (!h) return;
    if (h === "bottom-nav.js" && semBarra) return seguinte();
    const s = document.createElement("script"); s.src = base + h; s.onload = s.onerror = seguinte; document.body.append(s);
  })();
})();
