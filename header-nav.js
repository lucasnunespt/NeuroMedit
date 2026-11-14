(() => {
  const header = document.querySelector("[data-header]");

  if (!header) {
    return;
  }

  const contributorsNavItem = {
    href: "contributors.html",
    key: "contributors",
    i18n: "nav.contributors",
    text: "Creators",
    icon: '<svg viewBox="0 0 24 24" fill="none" focusable="false"><path d="M8.2 11.2C10.02 11.2 11.5 9.72 11.5 7.9C11.5 6.08 10.02 4.6 8.2 4.6C6.38 4.6 4.9 6.08 4.9 7.9C4.9 9.72 6.38 11.2 8.2 11.2Z" stroke="currentColor" stroke-width="1.8"></path><path d="M3.6 19.4C4.08 16.72 5.88 15.2 8.2 15.2C10.52 15.2 12.32 16.72 12.8 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M15.8 10.7C17.3 10.7 18.5 9.5 18.5 8C18.5 6.5 17.3 5.3 15.8 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M14.8 15.4C17.35 15.58 19.05 17 19.5 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>'
  };

  function isCurrentPage(item) {
    const basename = (path) =>
      path.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop().replace(/\.html$/i, "");
    const current = basename(window.location.pathname);
    if (item.key === "contributors" && current === "about-lucas") return true;
    return current === basename(item.href);
  }

  function buildContributorsLink(kind) {
    const link = document.createElement("a");
    link.href = contributorsNavItem.href;
    link.className = kind === "mobile"
      ? "header-mobile-link nav-link"
      : "header-nav-link nav-link";
    link.dataset.navKey = contributorsNavItem.key;
    link.setAttribute("aria-label", contributorsNavItem.text);
    link.setAttribute("title", contributorsNavItem.text);
    link.dataset.i18n = contributorsNavItem.i18n;
    link.dataset.i18nAttr = "aria-label,title";

    if (isCurrentPage(contributorsNavItem)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.innerHTML = `
      <span class="header-nav-icon" aria-hidden="true">${contributorsNavItem.icon}</span>
      <span class="${kind === "mobile" ? "header-mobile-text" : "header-nav-text"}" data-i18n="${contributorsNavItem.i18n}">${contributorsNavItem.text}</span>
    `;

    return link;
  }

  function ensureGlobalNavItems() {
    const desktopNav = header.querySelector(".header-nav-desktop");
    const mobileNav = header.querySelector(".header-mobile-nav");

    if (desktopNav && !desktopNav.querySelector('[data-nav-key="contributors"]')) {
      desktopNav.appendChild(buildContributorsLink("desktop"));
    }

    if (mobileNav && !mobileNav.querySelector('[data-nav-key="contributors"]')) {
      mobileNav.appendChild(buildContributorsLink("mobile"));
    }

    if (typeof applyTranslations === "function" && typeof getPreferredLanguage === "function") {
      applyTranslations(getPreferredLanguage());
    }
  }

  ensureGlobalNavItems();

  const desktopNav = header.querySelector(".header-nav-desktop");
  const indicator = desktopNav?.querySelector(".nav-indicator") || null;
  const desktopLinks = desktopNav
    ? Array.from(desktopNav.querySelectorAll(".header-nav-link[data-nav-key]"))
    : [];

  const menuToggle = header.querySelector("[data-mobile-toggle]");
  const mobilePanel = header.querySelector("[data-mobile-panel]");
  const mobileOverlay = header.querySelector("[data-mobile-overlay]");
  const closeButton = header.querySelector("[data-mobile-close]");
  const mobileLinks = mobilePanel
    ? Array.from(mobilePanel.querySelectorAll(".header-mobile-link[data-nav-key]"))
    : [];

  const allLinks = [...desktopLinks, ...mobileLinks];
  const mobileBreakpoint = window.matchMedia("(max-width: 940px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let resizeFrame = 0;
  let scrollFrame = 0;
  let indicatorFrame = 0;
  let closeToken = 0;
  let isMenuOpen = false;
  let headerFocusables = [];
  let footerFocusables = [];

  function getFocusableElements(rootNode) {
    if (!rootNode) {
      return [];
    }

    return Array.from(
      rootNode.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function setInertState(elements, inert) {
    elements.forEach((element) => {
      if (inert) {
        if (!element.hasAttribute("data-pre-meditation-tabindex")) {
          element.setAttribute(
            "data-pre-meditation-tabindex",
            element.getAttribute("tabindex") ?? ""
          );
        }

        element.setAttribute("tabindex", "-1");
        element.setAttribute("aria-hidden", "true");
        return;
      }

      if (!element.hasAttribute("data-pre-meditation-tabindex")) {
        return;
      }

      const previous = element.getAttribute("data-pre-meditation-tabindex");
      element.removeAttribute("data-pre-meditation-tabindex");
      element.removeAttribute("aria-hidden");

      if (previous) {
        element.setAttribute("tabindex", previous);
      } else {
        element.removeAttribute("tabindex");
      }
    });
  }

  function syncMeditationChromeState() {
    const isMeditating = document.body.classList.contains("is-meditating");
    const footer = document.querySelector(".site-footer");

    headerFocusables = getFocusableElements(header);
    footerFocusables = getFocusableElements(footer);

    if (isMeditating && isMenuOpen) {
      closeMobileMenu({ immediate: true });
    }

    header.setAttribute("aria-hidden", isMeditating ? "true" : "false");

    if (footer) {
      footer.setAttribute("aria-hidden", isMeditating ? "true" : "false");
    }

    setInertState(headerFocusables, isMeditating);
    setInertState(footerFocusables, isMeditating);
  }

  function getActiveLink(links) {
    return (
      links.find((link) => link.classList.contains("active")) ||
      links.find((link) => link.getAttribute("aria-current") === "page") ||
      links[0] ||
      null
    );
  }

  function getActiveKey() {
    const activeLink = getActiveLink(allLinks);
    return activeLink?.dataset.navKey || "";
  }

  function setActiveKey(key) {
    allLinks.forEach((link) => {
      const isActive = Boolean(key) && link.dataset.navKey === key;
      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function moveIndicator(targetLink, immediate = false) {
    if (!desktopNav || !indicator || !targetLink) {
      return;
    }

    if (mobileBreakpoint.matches) {
      desktopNav.classList.remove("ready");
      return;
    }

    const navRect = desktopNav.getBoundingClientRect();
    const linkRect = targetLink.getBoundingClientRect();

    if (navRect.width === 0 || linkRect.width === 0) {
      return;
    }

    const leftOffset = linkRect.left - navRect.left;

    if (immediate || reducedMotion.matches) {
      indicator.style.transition = "none";
      indicator.style.width = `${linkRect.width}px`;
      indicator.style.transform = `translateX(${leftOffset}px)`;
      indicator.getBoundingClientRect();
      indicator.style.removeProperty("transition");
    } else {
      indicator.style.width = `${linkRect.width}px`;
      indicator.style.transform = `translateX(${leftOffset}px)`;
    }

    desktopNav.classList.add("ready");
  }

  function syncIndicator(immediate = false) {
    if (!desktopNav || !indicator) {
      return;
    }

    if (mobileBreakpoint.matches) {
      desktopNav.classList.remove("ready");
      return;
    }

    const activeDesktopLink = getActiveLink(desktopLinks);
    if (!activeDesktopLink) {
      desktopNav.classList.remove("ready");
      return;
    }

    moveIndicator(activeDesktopLink, immediate);
  }

  function queueIndicatorSync(immediate = false) {
    if (indicatorFrame) {
      cancelAnimationFrame(indicatorFrame);
    }

    indicatorFrame = requestAnimationFrame(() => {
      syncIndicator(immediate);
    });
  }

  function openMobileMenu() {
    if (!menuToggle || !mobilePanel || !mobileOverlay || isMenuOpen) {
      return;
    }

    closeToken += 1;
    isMenuOpen = true;

    mobilePanel.hidden = false;
    mobileOverlay.hidden = false;
    mobilePanel.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");

    document.body.classList.add("menu-open");
    header.classList.add("mobile-open");

    requestAnimationFrame(() => {
      mobilePanel.classList.add("is-open");
      mobileOverlay.classList.add("is-open");
    });

    const focusTarget =
      mobilePanel.querySelector("[data-mobile-close]") ||
      mobilePanel.querySelector(".header-mobile-link");

    if (focusTarget) {
      window.setTimeout(() => {
        focusTarget.focus();
      }, reducedMotion.matches ? 0 : 90);
    }
  }

  function finalizeCloseMenu(restoreFocus) {
    if (!menuToggle || !mobilePanel || !mobileOverlay) {
      return;
    }

    mobilePanel.hidden = true;
    mobileOverlay.hidden = true;
    mobilePanel.classList.remove("is-open");
    mobileOverlay.classList.remove("is-open");
    mobilePanel.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    header.classList.remove("mobile-open");
    isMenuOpen = false;

    if (restoreFocus) {
      menuToggle.focus();
    }
  }

  function closeMobileMenu({ restoreFocus = false, immediate = false } = {}) {
    if (!menuToggle || !mobilePanel || !mobileOverlay || !isMenuOpen) {
      return;
    }

    closeToken += 1;
    const currentToken = closeToken;

    mobilePanel.classList.remove("is-open");
    mobileOverlay.classList.remove("is-open");

    const shouldCloseImmediately = immediate || reducedMotion.matches;

    if (shouldCloseImmediately) {
      finalizeCloseMenu(restoreFocus);
      return;
    }

    const finishIfCurrent = () => {
      if (currentToken !== closeToken) {
        return;
      }
      finalizeCloseMenu(restoreFocus);
    };

    const transitionEndHandler = (event) => {
      if (event.target !== mobilePanel) {
        return;
      }
      mobilePanel.removeEventListener("transitionend", transitionEndHandler);
      finishIfCurrent();
    };

    mobilePanel.addEventListener("transitionend", transitionEndHandler);
    window.setTimeout(() => {
      mobilePanel.removeEventListener("transitionend", transitionEndHandler);
      finishIfCurrent();
    }, 620);
  }

  function queueResizeWork() {
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      if (!mobileBreakpoint.matches && isMenuOpen) {
        closeMobileMenu({ immediate: true });
      }

      queueIndicatorSync(true);
    });
  }

  function updateScrolledState() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }

  function queueScrollWork() {
    if (scrollFrame) {
      return;
    }

    scrollFrame = requestAnimationFrame(() => {
      updateScrolledState();
      scrollFrame = 0;
    });
  }

  desktopLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveKey(link.dataset.navKey || "");
      queueIndicatorSync();
    });

    link.addEventListener("focus", () => {
      moveIndicator(link);
    });
  });

  if (desktopNav) {
    desktopNav.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!desktopNav.contains(document.activeElement)) {
          queueIndicatorSync();
        }
      }, 0);
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveKey(link.dataset.navKey || "");
      queueIndicatorSync();
      closeMobileMenu({ immediate: true });
    });
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (isMenuOpen) {
        closeMobileMenu({ restoreFocus: true });
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", () => {
      closeMobileMenu({ restoreFocus: true });
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeMobileMenu({ restoreFocus: true });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen) {
      event.preventDefault();
      closeMobileMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", queueResizeWork);
  window.addEventListener("scroll", queueScrollWork, { passive: true });
  window.addEventListener("neuromedit:languagechange", () => {
    queueIndicatorSync(true);
    syncMeditationChromeState();
  });
  window.addEventListener("load", () => {
    queueIndicatorSync(true);
    updateScrolledState();
    syncMeditationChromeState();
  });
  window.addEventListener("neuromedit:meditationstatechange", syncMeditationChromeState);

  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", queueResizeWork);
  } else if (typeof mobileBreakpoint.addListener === "function") {
    mobileBreakpoint.addListener(queueResizeWork);
  }

  setActiveKey(getActiveKey());
  queueIndicatorSync(true);
  updateScrolledState();
  syncMeditationChromeState();
})();


/* ==========================================================
   Barra do topo no computador (mockup da home, nov 2026):
   Voltar e Avançar à esquerda da marca; o Avatar (pessoa de luz)
   à direita do Globo, com o menu da conta. Comunidade e Novidades
   ficam para quando existirem. No telemóvel nada disto aparece:
   a BottomNav já tem Voltar e a conta vive em Ajustes.
   ========================================================== */
(() => {
  const header = document.querySelector("[data-header]");
  const shell = header?.querySelector(".header-shell");
  const brand = shell?.querySelector(".brand");
  const actions = shell?.querySelector(".header-actions");
  if (!shell || !brand || !actions || shell.querySelector("[data-header-history]")) return;

  const ICON_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14.5 5.5L8 12L14.5 18.5"/></svg>';
  const ICON_FORWARD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9.5 5.5L16 12L9.5 18.5"/></svg>';
  // Perfil: o contorno de uma pessoa num círculo; com sessão Google, a foto da própria pessoa.
  const PERSON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c0-3.7 3.1-6.2 7-6.2s7 2.5 7 6.2"/></svg>';
  const avatarMarkup = () => `<span class="header-avatar-face" data-avatar-face>${PERSON_SVG}</span>`;

  const translate = () => {
    if (typeof applyTranslations === "function" && typeof getPreferredLanguage === "function") {
      applyTranslations(getPreferredLanguage());
    }
  };

  /* ---------- Voltar e Avançar ---------- */
  const start = document.createElement("div");
  start.className = "header-start";
  brand.replaceWith(start);

  const history = document.createElement("div");
  history.className = "header-history";
  history.dataset.headerHistory = "";
  history.innerHTML = `
    <button type="button" class="header-dot" data-history-back aria-label="Voltar" title="Voltar" data-i18n="header_back" data-i18n-attr="aria-label,title">${ICON_BACK}</button>
    <button type="button" class="header-dot" data-history-forward aria-label="Avançar" title="Avançar" data-i18n="header_forward" data-i18n-attr="aria-label,title">${ICON_FORWARD}</button>
  `;
  start.append(history, brand);

  const backButton = history.querySelector("[data-history-back]");
  const forwardButton = history.querySelector("[data-history-forward]");
  const nav = window.navigation;

  function syncHistoryButtons() {
    // Navigation API: sabe se há para onde voltar e avançar. Sem ela, deixa os dois ativos.
    if (nav && "canGoBack" in nav) {
      backButton.disabled = !nav.canGoBack;
      forwardButton.disabled = !nav.canGoForward;
    } else {
      backButton.disabled = window.history.length < 2;
    }
  }

  backButton.addEventListener("click", () => window.history.back());
  forwardButton.addEventListener("click", () => window.history.forward());
  nav?.addEventListener?.("currententrychange", syncHistoryButtons);
  window.addEventListener("pageshow", syncHistoryButtons);
  syncHistoryButtons();

  /* ---------- Avatar e menu da conta ---------- */
  const account = document.createElement("div");
  account.className = "header-account";
  account.innerHTML = `
    <button type="button" class="header-dot header-avatar" data-account-trigger aria-expanded="false" aria-controls="headerAccountMenu" aria-label="Minha conta" title="Minha conta" data-i18n="account_menu" data-i18n-attr="aria-label,title">${avatarMarkup()}</button>
    <div class="header-pop" id="headerAccountMenu" data-account-menu hidden>
      <div class="header-pop-me">
        <span class="header-avatar header-avatar--static" aria-hidden="true">${avatarMarkup()}</span>
        <div class="header-pop-who">
          <span class="header-pop-name" data-account-name></span>
          <small data-account-detail></small>
        </div>
      </div>
      <div class="header-pop-sep"></div>
      <div data-account-in hidden>
        <a class="header-pop-item" href="reservar.html#minhas" data-i18n="account_my_sessions">Minhas sessões</a>
        <button type="button" class="header-pop-item" data-account-settings data-i18n="account_settings">Ajustes</button>
        <a class="header-pop-item" href="painel.html" data-account-pro hidden data-i18n="account_pro_panel">Painel de profissional</a>
        <div class="header-pop-sep"></div>
        <button type="button" class="header-pop-item header-pop-item--soft" data-account-signout data-i18n="account_sign_out">Sair da conta</button>
      </div>
      <div data-account-out>
        <button type="button" class="header-pop-item" data-account-signin data-i18n="account_sign_in">Entrar com o Google</button>
        <button type="button" class="header-pop-item" data-account-settings data-i18n="account_settings">Ajustes</button>
      </div>
    </div>
  `;
  const languageSlot = actions.querySelector(".header-language-slot");
  if (languageSlot) languageSlot.after(account);
  else actions.append(account);

  const trigger = account.querySelector("[data-account-trigger]");
  const menu = account.querySelector("[data-account-menu]");
  const nameEl = account.querySelector("[data-account-name]");
  const detailEl = account.querySelector("[data-account-detail]");
  const inGroup = account.querySelector("[data-account-in]");
  const outGroup = account.querySelector("[data-account-out]");
  const proLink = account.querySelector("[data-account-pro]");
  const settings = () => window.NeuroMeditSettings;

  function setOpen(isOpen, { restoreFocus = false } = {}) {
    if (isOpen) window.dispatchEvent(new CustomEvent("neuromedit:headerpop", { detail: { owner: account } }));
    menu.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    account.classList.toggle("is-open", isOpen);
    if (!isOpen && restoreFocus) trigger.focus();
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(menu.hidden);
  });
  window.addEventListener("neuromedit:headerpop", (event) => {
    if (event.detail?.owner !== account && !menu.hidden) setOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !account.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) setOpen(false, { restoreFocus: true });
  });

  account.querySelectorAll("[data-account-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      setOpen(false);
      settings()?.open?.();
    });
  });
  account.querySelector("[data-account-signin]").addEventListener("click", () => {
    setOpen(false);
    settings()?.signIn?.();
  });
  account.querySelector("[data-account-signout]").addEventListener("click", () => {
    setOpen(false);
    settings()?.signOut?.();
  });

  async function isProfessional(user) {
    try {
      const fb = await import("./firebase-init.js");
      const [admin, pro] = await Promise.all([
        fb.getDoc(fb.doc(fb.db, "admins", user.uid)).then((snap) => snap.exists()).catch(() => false),
        fb.getDoc(fb.doc(fb.db, "pros", user.uid)).then((snap) => snap.exists()).catch(() => false)
      ]);
      return admin || pro;
    } catch (error) {
      return false;
    }
  }

  let authToken = 0;
  async function renderAccount(user) {
    const token = ++authToken;
    inGroup.hidden = !user;
    outGroup.hidden = Boolean(user);
    proLink.hidden = true;
    account.querySelectorAll("[data-avatar-face]").forEach((face) => {
      face.textContent = "";
      if (user?.photoURL) {
        const img = document.createElement("img");
        img.src = user.photoURL;
        img.alt = "";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", () => { face.innerHTML = PERSON_SVG; });
        face.append(img);
      } else {
        face.innerHTML = PERSON_SVG;
      }
    });
    if (user) {
      nameEl.textContent = user.displayName || user.email || "";
      nameEl.removeAttribute("data-i18n");
      detailEl.textContent = user.displayName && user.email ? user.email : "";
      detailEl.removeAttribute("data-i18n");
      if (await isProfessional(user) && token === authToken) proLink.hidden = false;
    } else {
      nameEl.dataset.i18n = "account_menu";
      nameEl.textContent = "Minha conta";
      detailEl.dataset.i18n = "account_guest";
      detailEl.textContent = "Ainda sem sessão iniciada";
      translate();
    }
    // Ajustes só aparece onde o painel de ajustes existe.
    const canOpenSettings = Boolean(settings()?.canOpen?.());
    account.querySelectorAll("[data-account-settings]").forEach((button) => { button.hidden = !canOpenSettings; });
  }

  /* ---------- Comunidade e Novidades: ainda em preparação ----------
     Os botões já estão no lugar do mockup, mas só abrem um aviso calmo
     de que a página está a ser preparada. Sem conteúdo falso, sem ponto
     de aviso a chamar a atenção. */
  const ICON_PEOPLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3.1 2.4-5.2 5.5-5.2s5.5 2.1 5.5 5.2"/><path d="M15.2 5.8a2.8 2.8 0 0 1 0 5.4"/><path d="M17 14.2c2.2.4 3.5 2.2 3.5 4.8"/></svg>';
  const ICON_BELL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.5 17.5V11a5.5 5.5 0 0 1 11 0v6.5"/><path d="M4.5 17.5h15"/><path d="M10 20.5h4"/></svg>';

  function buildSoon({ key, icon, label, text }) {
    const wrap = document.createElement("div");
    wrap.className = "header-soon";
    wrap.innerHTML = `
      <button type="button" class="header-dot" aria-expanded="false" aria-controls="headerSoon-${key}" aria-label="${label}" title="${label}" data-i18n="header_${key}" data-i18n-attr="aria-label,title">${icon}</button>
      <div class="header-pop header-pop--soon" id="headerSoon-${key}" role="dialog" aria-labelledby="headerSoonTitle-${key}" hidden>
        <span class="header-pop-eyebrow" data-i18n="header_soon">Em breve</span>
        <span class="header-pop-title" id="headerSoonTitle-${key}" data-i18n="header_${key}">${label}</span>
        <span class="header-pop-text" data-i18n="header_${key}_soon">${text}</span>
      </div>
    `;
    const button = wrap.querySelector("button");
    const pop = wrap.querySelector(".header-pop");
    const set = (isOpen, restoreFocus = false) => {
      if (isOpen) window.dispatchEvent(new CustomEvent("neuromedit:headerpop", { detail: { owner: wrap } }));
      pop.hidden = !isOpen;
      button.setAttribute("aria-expanded", String(isOpen));
      if (!isOpen && restoreFocus) button.focus();
    };
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      set(pop.hidden);
    });
    document.addEventListener("click", (event) => {
      if (!pop.hidden && !wrap.contains(event.target)) set(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !pop.hidden) set(false, true);
    });
    window.addEventListener("neuromedit:headerpop", (event) => {
      if (event.detail?.owner !== wrap && !pop.hidden) set(false);
    });
    return wrap;
  }

  const community = buildSoon({
    key: "community",
    icon: ICON_PEOPLE,
    label: "Comunidade",
    text: "A comunidade está sendo preparada com calma. Quando estiver pronta, você a encontra aqui."
  });
  const news = buildSoon({
    key: "news",
    icon: ICON_BELL,
    label: "Novidades",
    text: "As novidades ainda estão sendo preparadas. Quando houver alguma, ela aparece aqui, sem pressa."
  });
  /* ---------- Busca (a lupa): procura em todo o site ----------
     Páginas da navegação e todas as práticas da Biblioteca, na língua
     em que o site está. As práticas vêm de library.html, lido na
     primeira busca; ignora acentos e maiúsculas. */
  const ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="M16 16L20 20"/></svg>';
  const search = document.createElement("div");
  search.className = "header-soon header-search";
  search.innerHTML = `
    <button type="button" class="header-dot" aria-expanded="false" aria-controls="headerSearch" aria-label="Buscar" title="Buscar" data-i18n="header_search" data-i18n-attr="aria-label,title">${ICON_SEARCH}</button>
    <div class="header-pop header-pop--search" id="headerSearch" role="dialog" aria-label="Buscar" data-i18n="header_search" data-i18n-attr="aria-label" hidden>
      <div class="header-search-field">
        ${ICON_SEARCH}
        <input type="search" autocomplete="off" spellcheck="false" aria-label="Buscar" placeholder="Buscar práticas e páginas" data-i18n="header_search_placeholder" data-i18n-attr="placeholder,aria-label">
      </div>
      <div class="header-search-results" data-search-results aria-live="polite"></div>
    </div>
  `;
  const searchButton = search.querySelector(".header-dot");
  const searchPop = search.querySelector(".header-pop");
  const searchInput = search.querySelector("input");
  const searchResults = search.querySelector("[data-search-results]");

  const lang = () => (typeof getPreferredLanguage === "function" ? getPreferredLanguage() : "pt");
  const tr = (key, fallback) => {
    if (!key || typeof getTranslation !== "function") return fallback || "";
    const value = getTranslation(lang(), key);
    return value && value !== key ? value : (fallback || "");
  };
  const normalize = (text) => (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const escapeHtml = (text) => (text || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let practices = null;
  async function loadPractices() {
    if (practices) return practices;
    try {
      const html = await fetch("library.html", { credentials: "same-origin" }).then((r) => r.text());
      const page = new DOMParser().parseFromString(html, "text/html");
      practices = [...page.querySelectorAll(".session-card")].map((card) => {
        const section = card.closest("section");
        const keyOf = (el) => el?.dataset.i18n || "";
        const meta = card.querySelector(".session-meta");
        const title = card.querySelector("h3");
        const text = [...card.querySelectorAll("p")].find((el) => el !== meta);
        const heading = section?.querySelector("h2");
        return {
          href: card.getAttribute("href") || "",
          locked: card.classList.contains("session-card--locked"),
          section: section?.id || "",
          keys: { meta: keyOf(meta), title: keyOf(title), text: keyOf(text), heading: keyOf(heading) },
          raw: { meta: meta?.textContent, title: title?.textContent, text: text?.textContent, heading: heading?.textContent }
        };
      });
    } catch (error) {
      practices = [];
    }
    return practices;
  }

  function pages() {
    const seen = new Set();
    return [...document.querySelectorAll(".header-nav-desktop a.header-nav-link")]
      .map((link) => ({ href: link.getAttribute("href"), title: (link.querySelector(".header-nav-text")?.textContent || link.textContent).trim() }))
      .filter((page) => page.href && !seen.has(page.href) && seen.add(page.href));
  }

  async function runSearch() {
    const terms = normalize(searchInput.value).split(" ").filter(Boolean);
    if (!terms.length) {
      searchResults.innerHTML = "";
      return;
    }
    const matches = (text) => terms.every((term) => normalize(text).includes(term));
    const pageHits = pages().filter((page) => matches(page.title));
    const items = await loadPractices();
    const practiceHits = items.map((item) => ({
      ...item,
      title: tr(item.keys.title, item.raw.title),
      meta: tr(item.keys.meta, item.raw.meta),
      text: tr(item.keys.text, item.raw.text),
      heading: tr(item.keys.heading, item.raw.heading)
    })).filter((item) => matches(`${item.title} ${item.text} ${item.meta} ${item.heading}`));

    const query = searchInput.value;
    if (normalize(query).split(" ").filter(Boolean).join(" ") !== terms.join(" ")) return;

    if (!pageHits.length && !practiceHits.length) {
      searchResults.innerHTML = `<div class="header-search-empty">${escapeHtml(tr("header_search_empty", "Nada encontrado com essa palavra. Tente outra, mais simples."))}</div>`;
      return;
    }
    const soonLabel = escapeHtml(tr("library_locked_badge", "Em breve"));
    const practiceHtml = practiceHits.slice(0, 8).map((item) => {
      const sub = escapeHtml([item.heading, item.meta].filter(Boolean).join(" · "));
      const inner = `<span class="header-search-title">${escapeHtml(item.title)}</span><small>${sub}${item.locked ? ` · ${soonLabel}` : ""}</small>`;
      return item.locked || !item.href
        ? `<span class="header-pop-item header-search-hit is-locked">${inner}</span>`
        : `<a class="header-pop-item header-search-hit" href="${escapeHtml(item.href)}">${inner}</a>`;
    }).join("");
    const pageHtml = pageHits.map((page) => `<a class="header-pop-item header-search-hit" href="${escapeHtml(page.href)}"><span class="header-search-title">${escapeHtml(page.title)}</span></a>`).join("");
    searchResults.innerHTML = [
      practiceHtml && `<div class="header-pop-eyebrow">${escapeHtml(tr("header_search_practices", "Práticas"))}</div>${practiceHtml}`,
      pageHtml && `<div class="header-pop-eyebrow">${escapeHtml(tr("header_search_pages", "Páginas"))}</div>${pageHtml}`
    ].filter(Boolean).join("");
  }

  const setSearch = (isOpen, restoreFocus = false) => {
    if (isOpen) window.dispatchEvent(new CustomEvent("neuromedit:headerpop", { detail: { owner: search } }));
    searchPop.hidden = !isOpen;
    searchButton.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      searchInput.focus();
      loadPractices();
    } else if (restoreFocus) {
      searchButton.focus();
    }
  };
  searchButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setSearch(searchPop.hidden);
  });
  searchInput.addEventListener("input", runSearch);
  document.addEventListener("click", (event) => {
    if (!searchPop.hidden && !search.contains(event.target)) setSearch(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !searchPop.hidden) setSearch(false, true);
  });
  window.addEventListener("neuromedit:headerpop", (event) => {
    if (event.detail?.owner !== search && !searchPop.hidden) setSearch(false);
  });
  window.addEventListener("neuromedit:languagechange", () => requestAnimationFrame(runSearch));

  const soonAnchor = actions.querySelector(".header-language-slot") || account;
  soonAnchor.before(search, community, news);

  window.addEventListener("neuromedit:authchange", (event) => renderAccount(event.detail?.user || null));
  renderAccount(settings()?.getUser?.() || null);
  translate();
})();
