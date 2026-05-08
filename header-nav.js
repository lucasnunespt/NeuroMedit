(() => {
  const header = document.querySelector("[data-header]");

  if (!header) {
    return;
  }

  const contributorsNavItem = {
    href: "contributors.html",
    key: "contributors",
    i18n: "nav.contributors",
    text: "Contributors",
    icon: '<svg viewBox="0 0 24 24" fill="none" focusable="false"><path d="M8.2 11.2C10.02 11.2 11.5 9.72 11.5 7.9C11.5 6.08 10.02 4.6 8.2 4.6C6.38 4.6 4.9 6.08 4.9 7.9C4.9 9.72 6.38 11.2 8.2 11.2Z" stroke="currentColor" stroke-width="1.8"></path><path d="M3.6 19.4C4.08 16.72 5.88 15.2 8.2 15.2C10.52 15.2 12.32 16.72 12.8 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M15.8 10.7C17.3 10.7 18.5 9.5 18.5 8C18.5 6.5 17.3 5.3 15.8 5.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path><path d="M14.8 15.4C17.35 15.58 19.05 17 19.5 19.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>'
  };

  function isContributorsPage() {
    return /(?:^|\/)contributors\.html$/i.test(window.location.pathname);
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

    if (isContributorsPage()) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }

    link.innerHTML = `
      <span class="header-nav-icon" aria-hidden="true">${contributorsNavItem.icon}</span>
      <span class="${kind === "mobile" ? "header-mobile-text" : "header-nav-text"}" data-i18n="${contributorsNavItem.i18n}">${contributorsNavItem.text}</span>
    `;

    return link;
  }

  function ensureContributorsNavItem() {
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

  ensureContributorsNavItem();

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
