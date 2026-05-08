(() => {
  const AIRLOCK_AUDIO_SELECTOR = "#airlockAudio";
  const START_SELECTOR = "[data-airlock-start]";
  const STOP_SELECTOR = "[data-airlock-stop], [data-exit-meditation]";
  const AIRLOCK_LINK_SELECTOR = "[data-airlock-link]";
  const AUDIO_ERROR_MESSAGE = "Não foi possível iniciar o áudio. Toque novamente.";

  let airlockAudio = null;
  let airlockStartBtn = null;
  let preparationTimer = 0;
  let fadeTimer = 0;
  let isStarting = false;
  let isActive = false;
  let audioStarted = false;

  function getView() {
    return window.NeuroMeditAirlockView || {};
  }

  function isIndexPage() {
    const path = window.location.pathname.toLowerCase();
    return path.endsWith("/") || path.endsWith("/index.html") || path.endsWith("index.html");
  }

  function setStartButtonReady() {
    if (!airlockStartBtn) {
      return;
    }

    airlockStartBtn.disabled = false;
    airlockStartBtn.removeAttribute("disabled");
    airlockStartBtn.removeAttribute("aria-disabled");
    airlockStartBtn.style.pointerEvents = "auto";
    airlockStartBtn.style.cursor = "pointer";

    if (!isActive) {
      airlockStartBtn.dataset.i18n = "index_cta";
      if (typeof getTranslation === "function") {
        const language = localStorage.getItem("neuromedit-language") || "pt";
        airlockStartBtn.textContent = getTranslation(language, "index_cta") || "Começar";
      } else {
        airlockStartBtn.textContent = "Começar";
      }
    }
  }

  function resetAudio() {
    if (!airlockAudio) {
      return;
    }

    audioStarted = false;
    airlockAudio.pause();

    try {
      airlockAudio.currentTime = 0;
    } catch (error) {
      // Some mobile browsers delay seeking until metadata is available.
    }
  }

  async function primeAudioFromUserGesture() {
    if (!airlockAudio) {
      return false;
    }

    try {
      airlockAudio.loop = false;
      airlockAudio.currentTime = 0;
      airlockAudio.volume = 0;
      await airlockAudio.play();
      audioStarted = true;
      return true;
    } catch (error) {
      console.error("[Airlock] audio play failed", error);
      audioStarted = false;
      return false;
    }
  }

  function clearPreparationTimer() {
    window.clearTimeout(preparationTimer);
    preparationTimer = 0;
  }

  function fadeAudioIn(duration = 2400) {
    if (!airlockAudio) {
      return;
    }

    window.clearInterval(fadeTimer);
    const targetVolume = 1;
    const startedAt = Date.now();
    airlockAudio.volume = 0;

    fadeTimer = window.setInterval(() => {
      const progress = Math.min((Date.now() - startedAt) / duration, 1);
      airlockAudio.volume = progress * targetVolume;

      if (progress >= 1) {
        window.clearInterval(fadeTimer);
        fadeTimer = 0;
      }
    }, 80);
  }

  function showFallbackError() {
    const view = getView();

    if (typeof view.showError === "function") {
      view.showError(AUDIO_ERROR_MESSAGE);
      return;
    }

    const audioError = document.getElementById("audioError");
    if (audioError) {
      audioError.textContent = AUDIO_ERROR_MESSAGE;
      audioError.classList.add("is-visible");
    }
  }

  function clearError() {
    const view = getView();

    if (typeof view.clearError === "function") {
      view.clearError();
    }
  }

  async function startAirlockFlow(event) {
    event?.preventDefault();
    event?.stopPropagation();

    // Start index airlock
    console.log("[Airlock] clicked");

    if (isStarting || isActive) {
      return;
    }

    if (!airlockAudio) {
      console.error("[Airlock] audio element missing");
      showFallbackError();
      setStartButtonReady();
      return;
    }

    isStarting = true;
    clearError();
    setStartButtonReady();

    const canPlayAudio = await primeAudioFromUserGesture();
    if (!canPlayAudio) {
      showFallbackError();
    }

    const view = getView();
    if (typeof view.prepare === "function") {
      view.prepare();
    }

    clearPreparationTimer();
    preparationTimer = window.setTimeout(async () => {
      if (!isStarting) {
        return;
      }

    if (audioStarted && airlockAudio.paused) {
      const canResumeAudio = await primeAudioFromUserGesture();
      if (!canResumeAudio) {
        showFallbackError();
      }
    }

    if (audioStarted && !airlockAudio.paused) {
      fadeAudioIn();
      console.log("[Airlock] audio play success");
    }

    isStarting = false;
    isActive = true;
    document.body.classList.add("airlock-active", "is-meditating");

    if (typeof view.enter === "function") {
      view.enter();
    }
    }, typeof view.preparationDuration === "number" ? view.preparationDuration : 11000);
  }

  function stopAirlockFlow(event) {
    event?.preventDefault();
    event?.stopPropagation();

    isStarting = false;
    isActive = false;
    clearPreparationTimer();
    window.clearInterval(fadeTimer);
    resetAudio();
    document.body.classList.remove("airlock-active", "is-meditating");

    const view = getView();
    if (typeof view.reset === "function") {
      view.reset();
    } else {
      setStartButtonReady();
    }
  }

  function resetAirlockFlow() {
    isStarting = false;
    isActive = false;
    clearPreparationTimer();
    window.clearInterval(fadeTimer);
    resetAudio();
    document.body.classList.remove("airlock-active", "is-meditating");
    setStartButtonReady();
  }

  function completeAirlockFlow() {
    isStarting = false;
    isActive = false;
    clearPreparationTimer();
    window.clearInterval(fadeTimer);
    resetAudio();
    document.body.classList.remove("airlock-active", "is-meditating");

    const view = getView();
    if (typeof view.complete === "function") {
      view.complete();
      return;
    }

    // Redirect to feedback after completion
    window.location.href = "feedback.html?source=index&practice=initial-pause&status=completed";
  }

  function bindGenericMeditationCTAs() {
    document.querySelectorAll(AIRLOCK_LINK_SELECTOR).forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        if (isIndexPage()) {
          history.replaceState(null, "", "#airlock");
          airlockStartBtn?.focus({ preventScroll: true });
          startAirlockFlow(event);
          return;
        }

        window.location.href = "index.html#airlock";
      });
    });
  }

  function focusAirlockFromHash() {
    if (window.location.hash !== "#airlock") {
      return;
    }

    airlockStartBtn?.focus({ preventScroll: false });
  }

  function bindAirlockControls() {
    document.querySelectorAll(START_SELECTOR).forEach((button) => {
      button.addEventListener("click", startAirlockFlow);
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          startAirlockFlow(event);
        }
      });
    });

    document.querySelectorAll(STOP_SELECTOR).forEach((button) => {
      button.addEventListener("click", stopAirlockFlow);
    });

    if (airlockAudio) {
      airlockAudio.addEventListener("ended", () => {
        if (isActive) {
          completeAirlockFlow();
        }
      });
      airlockAudio.addEventListener("error", () => {
        if (!isActive) {
          isStarting = false;
          setStartButtonReady();
          showFallbackError();
        }
      });
    }
  }

  function initAirlockFlow() {
    console.log("[Airlock] init");

    airlockAudio = document.querySelector(AIRLOCK_AUDIO_SELECTOR);
    airlockStartBtn = document.getElementById("airlockStartBtn");

    console.log("[Airlock] start button found", airlockStartBtn);

    if (!airlockStartBtn) {
      console.error("[Airlock] start button missing");
    }

    if (!airlockAudio) {
      console.error("[Airlock] audio element missing");
    }

    resetAirlockFlow();
    bindAirlockControls();
    bindGenericMeditationCTAs();
    focusAirlockFromHash();
  }

  window.startAirlockFlow = startAirlockFlow;
  window.stopAirlockFlow = stopAirlockFlow;
  window.resetAirlockFlow = resetAirlockFlow;
  window.initAirlockFlow = initAirlockFlow;
  window.bindGenericMeditationCTAs = bindGenericMeditationCTAs;
  window.NeuroMeditAirlock = {
    initAirlockFlow,
    startAirlockFlow,
    stopAirlockFlow,
    resetAirlockFlow,
    bindGenericMeditationCTAs,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAirlockFlow, { once: true });
  } else {
    initAirlockFlow();
  }
})();
