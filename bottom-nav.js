/* ==========================================================
   NEUROMEDIT — NAVEGAÇÃO INFERIOR (THUMB ZONE)
   Injeta a barra de 3 destinos (Início · Biblioteca · Perfil),
   a folha "Perfil" (Configurações + páginas de vitrine) e a
   busca ancorada embaixo na Biblioteca. Mesmo padrão de injeção
   de header-nav.js / settings-panel.js. Ícones reusados do
   header — comportamento deliberadamente previsível.
   ========================================================== */
(() => {
  if (!document.querySelector("[data-header]")) return;
  if (document.querySelector(".bottom-header")) return;

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M3.5 10.5L12 3.75L20.5 10.5V19.5H14.75V14.25H9.25V19.5H3.5V10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    library: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M12 6.5C10.3 5.4 8.3 4.85 6.25 4.9C5.03 4.93 3.83 5.18 2.7 5.65V18.35C3.83 17.88 5.03 17.63 6.25 17.6C8.3 17.55 10.3 18.1 12 19.2C13.7 18.1 15.7 17.55 17.75 17.6C18.97 17.63 20.17 17.88 21.3 18.35V5.65C20.17 5.18 18.97 4.93 17.75 4.9C15.7 4.85 13.7 5.4 12 6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 6.5V19.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
    profile: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="8.6" r="3.6" stroke="currentColor" stroke-width="1.8"></circle><path d="M5.4 19.6C6 16.4 8.6 14.6 12 14.6C15.4 14.6 18 16.4 18.6 19.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    about: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"></circle><path d="M12 10.75V15.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><circle cx="12" cy="8.2" r="0.8" fill="currentColor"></circle></svg>',
    why: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"></circle><path d="M9.7 9.7C9.7 8.43 10.73 7.4 12 7.4C13.27 7.4 14.3 8.43 14.3 9.7C14.3 10.53 13.86 11.13 13.09 11.57C12.38 11.98 12 12.41 12 13.15V13.45" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="16.5" r="0.8" fill="currentColor"></circle></svg>',
    contributors: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><path d="M8.2 11.2C10.02 11.2 11.5 9.72 11.5 7.9C11.5 6.08 10.02 4.6 8.2 4.6C6.38 4.6 4.9 6.08 4.9 7.9C4.9 9.72 6.38 11.2 8.2 11.2Z" stroke="currentColor" stroke-width="1.8"></path><path d="M3.6 19.4C4.08 16.72 5.88 15.2 8.2 15.2C10.52 15.2 12.32 16.72 12.8 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M15.8 10.7C17.3 10.7 18.5 9.5 18.5 8C18.5 6.5 17.3 5.3 15.8 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M14.8 15.4C17.35 15.58 19.05 17 19.5 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"></circle><path d="M15.8 15.8L20 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>'
  };

  const page = (window.location.pathname.split("/").pop() || "home.html").toLowerCase();
  const LIBRARY_PAGES = [
    "library.html", "calm.html", "focus.html", "sleep.html", "states.html",
    "healing-return-to-yourself.html", "healing-remember-your-value.html",
    "complete.html", "body.html", "dream.html"
  ];
  const activeTab = (page === "" || page === "home.html") ? "home"
    : LIBRARY_PAGES.includes(page) ? "library"
    : null;

  function navItem({ href, tab, i18nKey, fallback, icon }) {
    const current = activeTab === tab ? ' aria-current="page"' : "";
    return `
      <a href="${href}" class="bottom-nav-item${activeTab === tab ? " active" : ""}" data-nav-key="${tab}"${current}>
        <span class="bottom-nav-icon">${icon}</span>
        <span data-i18n="${i18nKey}">${fallback}</span>
      </a>`;
  }

  /* --- Barra inferior: shell do header, 3 destinos rotulados --- */
  const bar = document.createElement("div");
  bar.className = "bottom-header";
  bar.innerHTML = `
    <div class="bottom-header-shell">
      <nav class="bottom-nav" aria-label="Main navigation" data-i18n="global_nav_aria" data-i18n-attr="aria-label">
        ${navItem({ href: "home.html", tab: "home", i18nKey: "global_nav_home", fallback: "Home", icon: ICONS.home })}
        ${navItem({ href: "library.html", tab: "library", i18nKey: "global_nav_library", fallback: "Library", icon: ICONS.library })}
        <button type="button" class="bottom-nav-item" data-profile-toggle aria-haspopup="dialog" aria-expanded="false" aria-controls="bottom-profile-sheet">
          <span class="bottom-nav-icon">${ICONS.profile}</span>
          <span data-i18n="nav_profile">Profile</span>
        </button>
      </nav>
    </div>`;
  document.body.appendChild(bar);

  /* --- Folha "Perfil": Configurações + páginas de vitrine --- */
  const overlay = document.createElement("div");
  overlay.className = "bottom-sheet-overlay";

  const sheet = document.createElement("section");
  sheet.className = "bottom-sheet";
  sheet.id = "bottom-profile-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", "Profile");
  sheet.dataset.i18n = "nav_profile";
  sheet.dataset.i18nAttr = "aria-label";
  sheet.innerHTML = `
    <div class="bottom-sheet-handle" aria-hidden="true"></div>
    <p class="bottom-sheet-title" data-i18n="nav_profile">Profile</p>
    <ul class="bottom-sheet-list">
      <li>
        <button type="button" class="bottom-sheet-link" data-sheet-settings>
          <span class="bottom-nav-icon">${ICONS.settings}</span>
          <span data-i18n="mobile_menu_settings">Settings</span>
        </button>
      </li>
      <li class="bottom-sheet-divider" role="separator" aria-hidden="true"></li>
      <li>
        <a href="about.html" class="bottom-sheet-link">
          <span class="bottom-nav-icon">${ICONS.about}</span>
          <span data-i18n="global_nav_about">About</span>
        </a>
      </li>
      <li>
        <a href="why.html" class="bottom-sheet-link">
          <span class="bottom-nav-icon">${ICONS.why}</span>
          <span data-i18n="global_nav_why">Why</span>
        </a>
      </li>
      <li>
        <a href="contributors.html" class="bottom-sheet-link">
          <span class="bottom-nav-icon">${ICONS.contributors}</span>
          <span data-i18n="nav.contributors">Contributors</span>
        </a>
      </li>
    </ul>`;

  document.body.appendChild(overlay);
  document.body.appendChild(sheet);

  const profileToggle = bar.querySelector("[data-profile-toggle]");
  let sheetOpen = false;

  function setSheet(open) {
    sheetOpen = open;
    sheet.classList.toggle("open", open);
    overlay.classList.toggle("open", open);
    profileToggle.setAttribute("aria-expanded", String(open));
    profileToggle.classList.toggle("active", open);
    if (open) {
      const first = sheet.querySelector("button, a, [tabindex]");
      if (first) first.focus({ preventScroll: true });
    } else if (document.activeElement && sheet.contains(document.activeElement)) {
      profileToggle.focus({ preventScroll: true });
    }
  }

  profileToggle.addEventListener("click", () => setSheet(!sheetOpen));
  overlay.addEventListener("click", () => setSheet(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheetOpen) setSheet(false);
  });

  sheet.querySelector("[data-sheet-settings]").addEventListener("click", () => {
    setSheet(false);
    // Reusa o painel de configurações existente (conta, som, tema).
    // O FAB está oculto no mobile, mas .click() ainda dispara o handler.
    const fab = document.getElementById("settings-fab");
    if (fab) {
      fab.click();
    } else if (window.NeuroMeditSettings && typeof window.NeuroMeditSettings.open === "function") {
      window.NeuroMeditSettings.open();
    }
  });

  /* --- Biblioteca: busca com índice de todo o conteúdo ---
     Além de filtrar os cards, a busca entende sinônimos
     ("sono", "dormir", "psicologia", "ansiedade"...) e mostra
     um painel de resultados indicando para onde ir — sessões
     e também as páginas do site. --- */
  const libraryPage = document.querySelector(".library-page");
  if (libraryPage) {
    document.body.classList.add("has-search-dock");

    const normalize = (value) => value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    /* Sinônimos por destino (pt · en · es · it · ru) */
    const SYNONYMS = {
      "sleep.html": "sono dormir adormecer insonia descanso descansar noite noturno relaxar cansaco sleep insomnia rest night tired dormire sonno riposo sueno dormirse descanso noche сон спать отдых ночь",
      "calm.html": "calma calmo ansiedade estresse stress respiracao respirar acalmar tranquilidade paz nervoso panico calm anxiety breath breathing relax peace ansia respiro calma ansiedad respirar paz спокойствие дыхание тревога",
      "focus.html": "foco concentracao atencao estudo estudar trabalho produtividade clareza mente focus concentration attention study work clarity concentrazione attenzione concentracion atencion фокус внимание учеба",
      "body.html": "corpo tensao relaxamento muscular escaneamento soltar ombros body scan tension muscles release corpo tensione cuerpo tension тело напряжение",
      "healing-return-to-yourself.html": "cura curar emocional psicologia psicologico autocompaixao acolhimento culpa perdao voltar para si sentimentos emocoes healing emotional self-compassion guilt feelings emotions guarigione emozioni sanacion emociones исцеление эмоции",
      "healing-remember-your-value.html": "valor autoestima confianca merecimento amor proprio psicologia autoimagem worth self-esteem confidence self-worth autostima valore autoestima confianza самооценка ценность уверенность"
    };

    /* Páginas do site também entram na busca */
    const PAGES = [
      { href: "about.html", key: "global_nav_about", fallback: "About", icon: ICONS.about, kw: "sobre projeto missao historia neuromedit about project mission story" },
      { href: "why.html", key: "global_nav_why", fallback: "Why", icon: ICONS.why, kw: "por que porque ciencia neurociencia cerebro mente psicologia evidencia beneficios why science neuroscience brain mind evidence benefits scienza neurociencia ciencia наука мозг" },
      { href: "contributors.html", key: "nav.contributors", fallback: "Contributors", icon: ICONS.contributors, kw: "colaboradores equipe creditos pessoas contributors team credits people" }
    ];

    const dock = document.createElement("form");
    dock.className = "library-search-dock";
    dock.setAttribute("role", "search");
    dock.innerHTML = `
      ${ICONS.search}
      <input type="search" autocomplete="off" enterkeyhint="search"
        placeholder="Search sessions" aria-label="Search sessions"
        aria-controls="library-search-results"
        data-i18n="library_search_placeholder" data-i18n-attr="placeholder,aria-label">`;
    document.body.appendChild(dock);

    const results = document.createElement("nav");
    results.className = "library-search-results";
    results.id = "library-search-results";
    results.setAttribute("aria-label", "Search results");
    document.body.appendChild(results);

    const input = dock.querySelector("input");
    const cards = Array.from(libraryPage.querySelectorAll(".session-card"));
    const sections = Array.from(libraryPage.querySelectorAll("section")).filter(
      (section) => section.querySelector(".session-card")
    );

    function t(key, fallback) {
      const lang = document.documentElement.lang || "en";
      const dict = window.NeuroMeditTranslations || {};
      return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || fallback;
    }

    function cardHaystack(card) {
      const href = (card.getAttribute("href") || "").split("/").pop();
      return normalize(card.textContent + " " + (SYNONYMS[href] || ""));
    }

    function buildResults(query) {
      const rows = [];

      cards
        .filter((card) => !card.classList.contains("session-card--locked"))
        .filter((card) => cardHaystack(card).includes(query))
        .slice(0, 5)
        .forEach((card) => {
          const titleEl = card.querySelector("h3");
          const metaEl = card.querySelector(".session-meta");
          const title = titleEl ? titleEl.textContent.trim() : "";
          const meta = metaEl ? metaEl.textContent.trim() : "";
          rows.push(`
            <a href="${card.getAttribute("href")}" class="search-result">
              <span class="bottom-nav-icon">${ICONS.library}</span>
              <span class="search-result-text">${title}</span>
              <span class="search-result-meta">${meta}</span>
            </a>`);
        });

      const pageRows = PAGES
        .filter((p) => normalize(p.kw + " " + p.fallback).includes(query))
        .map((p) => `
          <a href="${p.href}" class="search-result search-result--page">
            <span class="bottom-nav-icon">${p.icon}</span>
            <span class="search-result-text" data-i18n="${p.key}">${t(p.key, p.fallback)}</span>
          </a>`);

      if (pageRows.length) {
        if (rows.length) rows.push('<div class="search-result-divider" aria-hidden="true"></div>');
        rows.push(...pageRows);
      }

      if (!rows.length) {
        rows.push(`<p class="search-result-empty" data-i18n="library_search_noresults">${t("library_search_noresults", "No results found.")}</p>`);
      }

      return rows.join("");
    }

    function filterLibrary() {
      const query = normalize(input.value.trim());

      cards.forEach((card) => {
        const match = !query || cardHaystack(card).includes(query);
        card.style.display = match ? "" : "none";
      });
      sections.forEach((section) => {
        const visible = Array.from(section.querySelectorAll(".session-card"))
          .some((card) => card.style.display !== "none");
        section.style.display = visible ? "" : "none";
      });

      if (query) {
        results.innerHTML = buildResults(query);
        results.classList.add("open");
      } else {
        results.classList.remove("open");
        results.innerHTML = "";
      }
    }

    input.addEventListener("input", filterLibrary);

    dock.addEventListener("submit", (event) => {
      event.preventDefault();
      const first = results.querySelector("a.search-result");
      if (first) window.location.href = first.getAttribute("href");
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && input.value) {
        input.value = "";
        filterLibrary();
      }
    });

    /* Título grande encolhe suavemente ao rolar — só visual */
    let condensed = false;
    window.addEventListener("scroll", () => {
      const shouldCondense = window.scrollY > 32;
      if (shouldCondense !== condensed) {
        condensed = shouldCondense;
        document.body.classList.toggle("title-condensed", condensed);
      }
    }, { passive: true });
  }
})();
