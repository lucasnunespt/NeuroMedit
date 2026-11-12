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
  // Avatar: a cabeça da figura de luz, com o detalhe dos ombros (design system, Avatar).
  const AVATAR_SVG = `<svg class="cab" viewBox="60 14 80 80" aria-hidden="true" focusable="false"><defs><radialGradient id="@d"><stop offset="0" style="stop-color:var(--cabeca-core)" stop-opacity="1"/><stop offset=".22" style="stop-color:var(--cabeca-mid)" stop-opacity=".6"/><stop offset=".55" style="stop-color:var(--cabeca-edge)" stop-opacity=".2"/><stop offset="1" style="stop-color:var(--cabeca-edge)" stop-opacity="0"/></radialGradient><radialGradient id="@m"><stop offset="0" style="stop-color:var(--cabeca-core)" stop-opacity=".55"/><stop offset="1" style="stop-color:var(--cabeca-mid)" stop-opacity="0"/></radialGradient><clipPath id="@c"><rect x="40" y="10" width="120" height="82"/></clipPath><radialGradient id="@g" gradientUnits="userSpaceOnUse" cx="100" cy="58" r="42" gradientTransform="translate(100 58) scale(1 .9) translate(-100 -58)"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="@k" maskUnits="userSpaceOnUse" x="60" y="14" width="80" height="80"><rect x="60" y="14" width="80" height="80" fill="url(#@g)"/></mask><filter id="@b1" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter><filter id="@b2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2"/></filter></defs><g mask="url(#@k)"><g clip-path="url(#@c)" style="fill:var(--cabeca-edge)"><g filter="url(#@b1)" opacity=".5"><path fill-rule="evenodd" d="M100 66 C92 66 86 68 82 72 C72 74 64 78 60 88 C56 100 54 114 50 128 C47 138 40 146 32 152 C22 158 18 168 26 174 C40 182 70 182 100 180 C130 182 160 182 174 174 C182 168 178 158 168 152 C160 146 153 138 150 128 C146 114 144 100 140 88 C136 78 128 74 118 72 C114 68 108 66 100 66 Z M70 106 C68 120 62 134 55 146 C66 147 76 143 82 136 C77 127 73 118 70 106 Z M130 106 C132 120 138 134 145 146 C134 147 124 143 118 136 C123 127 127 118 130 106 Z"/><circle cx="100" cy="46" r="16.8"/><rect x="92" y="57" width="16" height="20" rx="6"/></g><g filter="url(#@b2)" opacity=".4"><path fill-rule="evenodd" d="M100 66 C92 66 86 68 82 72 C72 74 64 78 60 88 C56 100 54 114 50 128 C47 138 40 146 32 152 C22 158 18 168 26 174 C40 182 70 182 100 180 C130 182 160 182 174 174 C182 168 178 158 168 152 C160 146 153 138 150 128 C146 114 144 100 140 88 C136 78 128 74 118 72 C114 68 108 66 100 66 Z M70 106 C68 120 62 134 55 146 C66 147 76 143 82 136 C77 127 73 118 70 106 Z M130 106 C132 120 138 134 145 146 C134 147 124 143 118 136 C123 127 127 118 130 106 Z"/><circle cx="100" cy="46" r="16.8"/><rect x="92" y="57" width="16" height="20" rx="6"/></g></g><g fill="url(#@d)"><circle cx="108.9" cy="89.6" r="4.64" opacity="0.26"/><circle cx="122.3" cy="73.7" r="3.52" opacity="0.29"/><circle cx="109.1" cy="38" r="2.62" opacity="0.53"/><circle cx="92.1" cy="33.5" r="4.9" opacity="0.52"/><circle cx="73.4" cy="79.5" r="1.47" opacity="0.47"/><circle cx="114.7" cy="81" r="3.78" opacity="0.61"/><circle cx="84.6" cy="43.7" r="4.83" opacity="0.31"/><circle cx="108" cy="42.5" r="5.41" opacity="0.35"/><circle cx="106.2" cy="58.1" r="4.77" opacity="0.37"/><circle cx="106.7" cy="57.1" r="2.05" opacity="0.47"/><circle cx="119.1" cy="84.9" r="3.36" opacity="0.74"/><circle cx="114.3" cy="45.1" r="3.04" opacity="0.48"/><circle cx="108.5" cy="42" r="2.4" opacity="0.84"/><circle cx="95.3" cy="49.6" r="2.21" opacity="0.33"/><circle cx="113.1" cy="48.8" r="4.83" opacity="0.44"/><circle cx="86.4" cy="50" r="2.34" opacity="0.74"/><circle cx="104.5" cy="69.9" r="3.2" opacity="0.37"/><circle cx="103.4" cy="76.1" r="5.41" opacity="0.75"/><circle cx="101.3" cy="33.5" r="4.32" opacity="0.67"/><circle cx="118.8" cy="78.8" r="2.4" opacity="0.65"/><circle cx="87.6" cy="81" r="3.9" opacity="0.65"/><circle cx="109.9" cy="38.6" r="4.32" opacity="0.48"/><circle cx="98.1" cy="62.9" r="3.1" opacity="0.32"/><circle cx="100.9" cy="69.8" r="2.14" opacity="0.59"/><circle cx="92.1" cy="39.9" r="3.87" opacity="0.31"/><circle cx="88.4" cy="72.8" r="3.01" opacity="0.37"/><circle cx="106.4" cy="73.6" r="3.07" opacity="0.46"/><circle cx="102.7" cy="77.8" r="3.39" opacity="0.62"/><circle cx="92.4" cy="76.6" r="1.5" opacity="0.48"/><circle cx="113.5" cy="40.6" r="3.87" opacity="0.74"/><circle cx="95.3" cy="67.1" r="4.99" opacity="0.82"/><circle cx="69.8" cy="76.4" r="2.69" opacity="0.81"/><circle cx="99.1" cy="74" r="2.82" opacity="0.46"/><circle cx="76.4" cy="82.1" r="1.92" opacity="0.34"/><circle cx="90.6" cy="76.5" r="5.25" opacity="0.58"/><circle cx="97.1" cy="58.1" r="4.93" opacity="0.68"/><circle cx="107.4" cy="53.4" r="3.07" opacity="0.37"/><circle cx="88.7" cy="68.2" r="4.86" opacity="0.7"/><circle cx="96.9" cy="37.6" r="2.59" opacity="0.58"/><circle cx="109.8" cy="45.5" r="4.8" opacity="0.58"/><circle cx="90.9" cy="82.7" r="4.96" opacity="0.61"/><circle cx="95.3" cy="35.6" r="3.17" opacity="0.68"/><circle cx="114.6" cy="43.9" r="2.21" opacity="0.64"/><circle cx="110.7" cy="67.8" r="3.04" opacity="0.62"/><circle cx="110.8" cy="50.1" r="2.05" opacity="0.79"/><circle cx="102.1" cy="50.1" r="2.05" opacity="0.74"/><circle cx="90.3" cy="37.6" r="1.92" opacity="0.34"/><circle cx="111" cy="43.1" r="2.11" opacity="0.73"/><circle cx="117.5" cy="86.5" r="1.98" opacity="0.74"/><circle cx="119.2" cy="81.9" r="3.23" opacity="0.61"/><circle cx="79.9" cy="73.9" r="2.75" opacity="0.42"/><circle cx="111.9" cy="50.5" r="2.98" opacity="0.54"/><circle cx="83.9" cy="79.9" r="3.49" opacity="0.82"/><circle cx="109.5" cy="78.3" r="1.86" opacity="0.62"/><circle cx="88.6" cy="78.7" r="4.19" opacity="0.36"/><circle cx="89.1" cy="72" r="4.06" opacity="0.42"/><circle cx="95.9" cy="46.6" r="4.58" opacity="0.42"/><circle cx="79.4" cy="74.6" r="5.02" opacity="0.32"/><circle cx="83.8" cy="81" r="1.92" opacity="0.68"/><circle cx="97.1" cy="38.2" r="4.32" opacity="0.38"/><circle cx="88.3" cy="50.7" r="3.58" opacity="0.79"/><circle cx="98.5" cy="51.8" r="4.03" opacity="0.42"/><circle cx="91.1" cy="68.1" r="2.53" opacity="0.48"/><circle cx="101.3" cy="34" r="4.51" opacity="0.46"/><circle cx="106.4" cy="48.9" r="3.42" opacity="0.65"/><circle cx="94.6" cy="50.5" r="3.36" opacity="0.65"/><circle cx="95.2" cy="43.2" r="4.77" opacity="0.72"/><circle cx="113.7" cy="53.3" r="3.39" opacity="0.36"/><circle cx="103.8" cy="61.8" r="2.18" opacity="0.65"/><circle cx="128.7" cy="77.3" r="3.65" opacity="0.59"/><circle cx="87.7" cy="47.4" r="2.46" opacity="0.31"/><circle cx="104.5" cy="34.1" r="4.99" opacity="0.35"/><circle cx="107.1" cy="48" r="2.27" opacity="0.78"/><circle cx="106.6" cy="47.5" r="2.5" opacity="0.84"/><circle cx="104.3" cy="72.1" r="3.65" opacity="0.41"/><circle cx="118.6" cy="74.7" r="2.82" opacity="0.37"/><circle cx="86.2" cy="53.7" r="2.08" opacity="0.63"/><circle cx="96.4" cy="33.8" r="3.33" opacity="0.72"/><circle cx="98.8" cy="49.2" r="1.66" opacity="0.67"/><circle cx="86.9" cy="41" r="3.52" opacity="0.69"/><circle cx="113.4" cy="48.9" r="2.82" opacity="0.43"/><circle cx="115.4" cy="42.2" r="1.6" opacity="0.83"/><circle cx="111.1" cy="71.7" r="2.24" opacity="0.68"/><circle cx="105.1" cy="48.2" r="3.55" opacity="0.7"/><circle cx="105.1" cy="66.1" r="4.51" opacity="0.44"/><circle cx="87.8" cy="72.6" r="5.25" opacity="0.77"/><circle cx="104.9" cy="86.7" r="4.1" opacity="0.64"/><circle cx="85.6" cy="45.6" r="2.02" opacity="0.67"/><circle cx="77" cy="81.8" r="2.88" opacity="0.43"/><circle cx="96" cy="61.2" r="4.8" opacity="0.65"/><circle cx="92.4" cy="44.1" r="3.58" opacity="0.82"/><circle cx="105.7" cy="57" r="4.19" opacity="0.77"/><circle cx="85.6" cy="48.5" r="2.94" opacity="0.77"/><circle cx="80.8" cy="83.4" r="2.5" opacity="0.59"/><circle cx="106.8" cy="44.1" r="5.34" opacity="0.4"/><circle cx="105.5" cy="64.3" r="4.45" opacity="0.67"/><circle cx="94.8" cy="61.4" r="2.18" opacity="0.27"/><circle cx="99.2" cy="60.1" r="3.07" opacity="0.71"/><circle cx="101.7" cy="62.7" r="1.79" opacity="0.8"/><circle cx="90.6" cy="35.5" r="3.04" opacity="0.3"/><circle cx="109.6" cy="75.7" r="5.06" opacity="0.46"/><circle cx="91.1" cy="36.7" r="2.3" opacity="0.4"/><circle cx="101.2" cy="65.9" r="3.94" opacity="0.59"/><circle cx="112" cy="35.5" r="4.8" opacity="0.68"/><circle cx="99.3" cy="43.1" r="3.2" opacity="0.48"/><circle cx="103.1" cy="60" r="5.41" opacity="0.59"/><circle cx="103" cy="38.8" r="4.19" opacity="0.42"/><circle cx="92.5" cy="32.3" r="2.34" opacity="0.38"/><circle cx="106" cy="34.8" r="1.76" opacity="0.28"/><circle cx="117.8" cy="82.5" r="3.71" opacity="0.74"/><circle cx="72.5" cy="85.3" r="1.76" opacity="0.57"/><circle cx="110.5" cy="36.2" r="4.42" opacity="0.77"/><circle cx="94.2" cy="40.5" r="1.47" opacity="0.67"/><circle cx="111.8" cy="49" r="5.02" opacity="0.33"/><circle cx="98.3" cy="68.1" r="4.22" opacity="0.48"/><circle cx="84.4" cy="79.6" r="1.66" opacity="0.42"/><circle cx="122.7" cy="75.9" r="2.72" opacity="0.3"/><circle cx="100.5" cy="73" r="3.55" opacity="0.42"/><circle cx="113.6" cy="52.7" r="3.1" opacity="0.6"/><circle cx="101.4" cy="70.1" r="4.19" opacity="0.48"/><circle cx="89.8" cy="70.9" r="4.0" opacity="0.77"/><circle cx="104.5" cy="53.4" r="2.05" opacity="0.56"/><circle cx="97.6" cy="39" r="2.62" opacity="0.81"/><circle cx="87.5" cy="75.9" r="3.52" opacity="0.81"/><circle cx="125.1" cy="77.3" r="4.35" opacity="0.53"/><circle cx="111.9" cy="41.6" r="1.5" opacity="0.41"/><circle cx="94.4" cy="70.1" r="4.16" opacity="0.49"/><circle cx="107.6" cy="36.3" r="2.91" opacity="0.35"/><circle cx="93.7" cy="34.6" r="4.99" opacity="0.61"/><circle cx="91" cy="44.9" r="5.06" opacity="0.77"/><circle cx="101.3" cy="57.8" r="3.3" opacity="0.37"/><circle cx="111.4" cy="45.2" r="2.37" opacity="0.66"/><circle cx="97.1" cy="53.3" r="2.34" opacity="0.76"/><circle cx="93.4" cy="35.6" r="3.36" opacity="0.81"/><circle cx="106" cy="67.1" r="3.97" opacity="0.61"/><circle cx="84.1" cy="80.5" r="3.49" opacity="0.4"/><circle cx="105.4" cy="42.2" r="1.73" opacity="0.61"/><circle cx="63.7" cy="89.1" r="3.33" opacity="0.31"/><circle cx="99.3" cy="83.8" r="1.76" opacity="0.79"/><circle cx="71.3" cy="84.1" r="1.76" opacity="0.38"/><circle cx="98.5" cy="45.3" r="2.88" opacity="0.41"/><circle cx="107.1" cy="83.5" r="2.4" opacity="0.52"/><circle cx="107.8" cy="34.4" r="3.2" opacity="0.81"/><circle cx="110.6" cy="49.6" r="5.34" opacity="0.78"/><circle cx="98.3" cy="38.2" r="3.2" opacity="0.28"/><circle cx="84.7" cy="77.3" r="5.38" opacity="0.79"/><circle cx="107.1" cy="69.4" r="2.5" opacity="0.39"/><circle cx="101.6" cy="52.8" r="4.48" opacity="0.63"/><circle cx="112.1" cy="55.4" r="5.25" opacity="0.49"/><circle cx="94.2" cy="51" r="3.36" opacity="0.42"/><circle cx="101" cy="43.4" r="1.6" opacity="0.48"/><circle cx="105.6" cy="55.2" r="5.02" opacity="0.26"/><circle cx="98.3" cy="71.9" r="5.28" opacity="0.71"/><circle cx="99.2" cy="42.6" r="3.49" opacity="0.5"/><circle cx="91.9" cy="40.7" r="4.64" opacity="0.73"/><circle cx="123.8" cy="74.8" r="2.62" opacity="0.36"/><circle cx="101.9" cy="71.6" r="4.74" opacity="0.8"/><circle cx="114.2" cy="40.6" r="5.25" opacity="0.54"/><circle cx="74" cy="83.1" r="3.68" opacity="0.76"/><circle cx="110.1" cy="50.8" r="3.65" opacity="0.68"/><circle cx="86" cy="78.7" r="3.3" opacity="0.78"/><circle cx="114.2" cy="46.6" r="2.34" opacity="0.65"/><circle cx="106" cy="32.5" r="1.89" opacity="0.47"/><circle cx="100.8" cy="53.5" r="4.06" opacity="0.66"/><circle cx="102" cy="56.2" r="2.27" opacity="0.73"/><circle cx="110.1" cy="48.6" r="1.66" opacity="0.31"/><circle cx="89.2" cy="52.1" r="4.77" opacity="0.37"/><circle cx="98.3" cy="59.6" r="5.22" opacity="0.79"/><circle cx="110.1" cy="38.4" r="1.82" opacity="0.82"/><circle cx="90.6" cy="39.1" r="3.68" opacity="0.64"/><circle cx="102.9" cy="52.8" r="3.1" opacity="0.37"/><circle cx="127.5" cy="87.5" r="1.57" opacity="0.61"/><circle cx="113.1" cy="77" r="2.14" opacity="0.8"/><circle cx="110.6" cy="46.5" r="2.27" opacity="0.38"/><circle cx="91.7" cy="39.1" r="4.86" opacity="0.67"/><circle cx="97.3" cy="76.1" r="2.53" opacity="0.58"/><circle cx="97.9" cy="64.2" r="4.93" opacity="0.65"/><circle cx="75.6" cy="83.3" r="2.24" opacity="0.36"/><circle cx="106.8" cy="66.8" r="5.09" opacity="0.83"/><circle cx="95.3" cy="40.6" r="5.15" opacity="0.37"/><circle cx="62.4" cy="89.9" r="2.98" opacity="0.6"/><circle cx="89.3" cy="34.7" r="3.9" opacity="0.83"/><circle cx="109.8" cy="45.1" r="2.82" opacity="0.6"/><circle cx="92.1" cy="75" r="4.83" opacity="0.58"/><circle cx="99.7" cy="31" r="2.46" opacity="0.65"/><circle cx="107.9" cy="37.9" r="2.72" opacity="0.28"/><circle cx="114.7" cy="50.1" r="4.48" opacity="0.5"/><circle cx="119.6" cy="85.1" r="1.89" opacity="0.44"/><circle cx="112.6" cy="38.4" r="1.76" opacity="0.55"/><circle cx="94.9" cy="32.3" r="3.81" opacity="0.39"/></g><circle cx="100" cy="46" r="20" fill="url(#@m)"/></g></svg>`;
  let avatarCount = 0;
  const avatarMarkup = () => {
    avatarCount += 1;
    return AVATAR_SVG.replace(/@/g, `hav${avatarCount}`);
  };

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
    <button type="button" class="header-avatar" data-account-trigger aria-expanded="false" aria-controls="headerAccountMenu" aria-label="Minha conta" title="Minha conta" data-i18n="account_menu" data-i18n-attr="aria-label,title">${avatarMarkup()}</button>
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
    menu.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    account.classList.toggle("is-open", isOpen);
    if (!isOpen && restoreFocus) trigger.focus();
  }

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(menu.hidden);
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

  window.addEventListener("neuromedit:authchange", (event) => renderAccount(event.detail?.user || null));
  renderAccount(settings()?.getUser?.() || null);
  translate();
})();
