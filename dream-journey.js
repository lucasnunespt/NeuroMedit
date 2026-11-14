(() => {
  const STAR_COUNT = 170;
  const CARD_STAR_COUNT = 16;
  const SHOOTING_STAR_INTERVAL = 180000;
  const SHOOTING_STAR_VARIANCE = 30000;
  const DESTINATIONS = new Set(["space", "forest", "river", "cabin", "mountain"]);
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let lastShootingStarSide = -1;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createStarfield(root, count = STAR_COUNT) {
    if (!root || root.dataset.starsReady === "true") {
      return;
    }

    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const star = document.createElement("span");
      const size = randomBetween(0.7, 2.4);
      star.className = "dream-star";
      star.style.setProperty("--star-x", `${Math.random() * 100}%`);
      star.style.setProperty("--star-y", `${Math.random() * 100}%`);
      star.style.setProperty("--star-size", `${size}px`);
      star.style.setProperty("--star-alpha", `${randomBetween(0.22, 0.72)}`);
      star.style.setProperty("--star-glow", `${randomBetween(4, 14)}px`);
      star.style.setProperty("--star-duration", `${randomBetween(18, 34)}s`);
      star.style.setProperty("--star-delay", `${Math.random() * -10}s`);
      star.style.setProperty("--star-drift-x", `${randomBetween(-4, 4)}px`);
      star.style.setProperty("--star-drift-y", `${randomBetween(-4, 4)}px`);

      if (!reducedMotion?.matches && Math.random() < 0.34) {
        star.classList.add("is-twinkling");
        star.style.setProperty("--twinkle-duration", `${randomBetween(8, 18)}s`);
        star.style.setProperty("--twinkle-delay", `${randomBetween(-18, 0)}s`);
      }

      fragment.appendChild(star);
    }

    root.appendChild(fragment);
    root.dataset.starsReady = "true";
  }

  function createCardStars(card) {
    if (!card || card.querySelector(".dream-card-stars")) {
      return;
    }

    const starLayer = document.createElement("span");
    const fragment = document.createDocumentFragment();
    starLayer.className = "dream-card-stars";
    starLayer.setAttribute("aria-hidden", "true");

    for (let index = 0; index < CARD_STAR_COUNT; index += 1) {
      const star = document.createElement("span");
      star.className = "dream-card-star";
      star.style.setProperty("--card-star-x", `${randomBetween(8, 92)}%`);
      star.style.setProperty("--card-star-y", `${randomBetween(10, 86)}%`);
      star.style.setProperty("--card-star-size", `${randomBetween(1, 2.3)}px`);
      star.style.setProperty("--card-star-alpha", `${randomBetween(0.26, 0.74)}`);

      if (!reducedMotion?.matches && Math.random() < 0.45) {
        star.classList.add("is-twinkling");
        star.style.setProperty("--card-star-duration", `${randomBetween(5, 11)}s`);
        star.style.setProperty("--card-star-delay", `${randomBetween(-10, 0)}s`);
      }

      fragment.appendChild(star);
    }

    starLayer.appendChild(fragment);
    card.prepend(starLayer);
  }

  function getShootingStarStart() {
    let side = Math.floor(Math.random() * 4);
    if (side === lastShootingStarSide) {
      side = (side + 1 + Math.floor(Math.random() * 3)) % 4;
    }
    lastShootingStarSide = side;

    const edgeOffset = randomBetween(-8, 108);
    const edgeInset = randomBetween(-12, 18);

    if (side === 0) {
      return { x: edgeOffset, y: edgeInset, angle: randomBetween(28, 48) };
    }

    if (side === 1) {
      return { x: 100 + edgeInset, y: edgeOffset, angle: randomBetween(128, 152) };
    }

    if (side === 2) {
      return { x: edgeOffset, y: 100 + edgeInset, angle: randomBetween(210, 232) };
    }

    return { x: edgeInset, y: edgeOffset, angle: randomBetween(-38, -20) };
  }

  function launchShootingStar(root) {
    if (!root || reducedMotion?.matches) {
      return;
    }

    const start = getShootingStarStart();
    const star = document.createElement("span");
    star.className = "dream-shooting-star";
    star.setAttribute("aria-hidden", "true");
    star.style.setProperty("--shooting-start-x", `${start.x}%`);
    star.style.setProperty("--shooting-start-y", `${start.y}%`);
    star.style.setProperty("--shooting-angle", `${start.angle}deg`);
    star.style.setProperty("--shooting-travel", `${randomBetween(28, 46)}vw`);
    star.style.setProperty("--shooting-duration", `${randomBetween(1500, 2200)}ms`);
    star.addEventListener("animationend", () => star.remove(), { once: true });
    root.appendChild(star);
  }

  function createShootingStarScheduler(root) {
    let timer = 0;

    function schedule() {
      if (!root || reducedMotion?.matches) {
        return;
      }

      const delay = SHOOTING_STAR_INTERVAL + randomBetween(-SHOOTING_STAR_VARIANCE, SHOOTING_STAR_VARIANCE);
      timer = window.setTimeout(() => {
        launchShootingStar(root);
        schedule();
      }, delay);
    }

    return {
      start() {
        if (timer || reducedMotion?.matches) {
          return;
        }

        schedule();
      },
      stop() {
        window.clearTimeout(timer);
        timer = 0;
        root?.querySelectorAll(".dream-shooting-star").forEach((star) => star.remove());
      }
    };
  }

  function initDreamOverlay() {
    const overlay = document.querySelector("[data-dream-overlay]");
    const openButton = document.querySelector("[data-dream-open]");
    const closeButton = document.querySelector("[data-dream-close]");
    const stars = overlay?.querySelector("[data-dream-stars]");
    const shootingStars = createShootingStarScheduler(stars);
    let lastFocusedElement = null;

    if (!overlay || !openButton || !closeButton) {
      return;
    }

    const focusableSelector = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function getFocusableElements() {
      return Array.from(overlay.querySelectorAll(focusableSelector)).filter((element) => !element.disabled);
    }

    function openOverlay() {
      lastFocusedElement = document.activeElement;
      createStarfield(stars);
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("dream-overlay-open");
      shootingStars.start();

      requestAnimationFrame(() => {
        overlay.classList.add("is-open");
        closeButton.focus();
      });
    }

    function closeOverlay({ restoreFocus = true } = {}) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("dream-overlay-open");
      shootingStars.stop();

      window.setTimeout(() => {
        overlay.hidden = true;
        if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
          lastFocusedElement.focus();
        }
      }, 700);
    }

    openButton.addEventListener("click", openOverlay);
    closeButton.addEventListener("click", () => closeOverlay());

    overlay.addEventListener("click", (event) => {
      const destination = event.target.closest("[data-dream-destination]")?.dataset.dreamDestination;
      if (!DESTINATIONS.has(destination)) {
        return;
      }

      window.location.href = `dream.html?journey=${destination}`;
    });

    document.addEventListener("keydown", (event) => {
      if (overlay.hidden) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    });
  }

  function initDreamPage() {
    const page = document.querySelector("[data-dream-page]");
    const title = document.querySelector("[data-dream-title]");
    const stars = document.querySelector("[data-dream-stars]");

    if (!page || !title) {
      return;
    }

    const journey = new URLSearchParams(window.location.search).get("journey") || "space";
    const safeJourney = DESTINATIONS.has(journey) ? journey : "space";
    const pintarTitulo = () => {
      const lang = typeof getPreferredLanguage === "function" ? getPreferredLanguage() : "en";
      const v = typeof getTranslation === "function" ? getTranslation(lang, `dream_journey_${safeJourney}`) : "";
      title.textContent = v && !/^\[?dream_journey_/.test(v) ? v : `${safeJourney.charAt(0).toUpperCase()}${safeJourney.slice(1)} Journey`;
    };
    pintarTitulo();
    window.addEventListener("neuromedit:languagechange", pintarTitulo);
    createStarfield(stars, 190);
    createShootingStarScheduler(stars).start();
  }

  function initDreamCard() {
    createCardStars(document.querySelector("[data-dream-open]"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initDreamCard();
      initDreamOverlay();
      initDreamPage();
    }, { once: true });
  } else {
    initDreamCard();
    initDreamOverlay();
    initDreamPage();
  }
})();
