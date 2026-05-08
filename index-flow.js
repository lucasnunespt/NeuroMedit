(() => {
  const root = document.querySelector(".neuromedit-experience");
  if (!root) return;

  const introStep = root.querySelector(".intro-step");
  const airlockStep = root.querySelector(".airlock-step");
  const meditationCore = document.getElementById("meditationCore");
  const resetStep = root.querySelector(".reset-step");
  const checkinStep = root.querySelector(".checkin-step");

  const startButton = root.querySelector("[data-start-flow]");
  const nextToMeditationButton = root.querySelector('[data-next-step="meditation"]');
  const nextToCheckinButton = root.querySelector('[data-next-step="checkin"]');
  const meditationButton = document.getElementById("meditationStartButton");
  const meditationAudio = document.getElementById("meditationAudio");
  const orbTitle = document.getElementById("orbTitle");
  const orbSubtitle = document.getElementById("orbSubtitle");
  const meditationInstruction = document.getElementById("meditationInstruction");
  const meditationActions = document.getElementById("meditationActions");
  const progressRingFill = document.querySelector(".progress-ring-fill");
  const continueAfterMeditationButton = root.querySelector("[data-continue-after-meditation]");
  const finishSessionButton = root.querySelector("[data-finish-session]");
  const completeCheckinButtons = Array.from(root.querySelectorAll("[data-complete-checkin]"));

  if (
    !introStep ||
    !airlockStep ||
    !meditationCore ||
    !resetStep ||
    !checkinStep ||
    !startButton ||
    !nextToMeditationButton ||
    !nextToCheckinButton ||
    !meditationButton ||
    !meditationAudio ||
    !orbTitle ||
    !orbSubtitle ||
    !meditationInstruction ||
    !meditationActions ||
    !progressRingFill ||
    !continueAfterMeditationButton ||
    !finishSessionButton
  ) {
    return;
  }

  const steps = {
    intro: introStep,
    airlock: airlockStep,
    meditation: meditationCore,
    reset: resetStep,
    checkin: checkinStep,
  };

  const allSteps = Object.values(steps);
  const INTRO_TO_AIRLOCK_MS = 280;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isIntroTransitioning = false;
  const breathLabel = airlockStep.querySelector("[data-breath-label]");
  let breathCycleIntervalId = null;
  let breathOutTimeoutId = null;
  let hasMeditationStarted = false;

  const radius = progressRingFill.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressRingFill.style.strokeDasharray = `${circumference}`;
  progressRingFill.style.strokeDashoffset = `${circumference}`;

  const runBreathCycle = () => {
    if (!breathLabel) return;

    breathLabel.textContent = "Breathe in";

    if (breathOutTimeoutId !== null) {
      window.clearTimeout(breathOutTimeoutId);
    }

    breathOutTimeoutId = window.setTimeout(() => {
      breathLabel.textContent = "Breathe out";
    }, 4000);
  };

  const stopBreathCycle = () => {
    if (breathOutTimeoutId !== null) {
      window.clearTimeout(breathOutTimeoutId);
      breathOutTimeoutId = null;
    }

    if (breathCycleIntervalId !== null) {
      window.clearInterval(breathCycleIntervalId);
      breathCycleIntervalId = null;
    }
  };

  const startBreathCycle = () => {
    if (!breathLabel || breathCycleIntervalId !== null) return;

    runBreathCycle();
    breathCycleIntervalId = window.setInterval(runBreathCycle, 10000);
  };

  const showStep = (targetStep) => {
    allSteps.forEach((step) => {
      const isTarget = step === targetStep;
      step.hidden = !isTarget;
      step.classList.toggle("is-active", isTarget);
    });

    const isIntroStep = targetStep === steps.intro;
    const isAirlockStep = targetStep === steps.airlock;
    const isMeditationStep = targetStep === steps.meditation;
    root.classList.toggle("session-active", !isIntroStep);
    root.classList.toggle("is-airlock-active", isAirlockStep);
    root.classList.toggle("is-meditation-active", isMeditationStep);
    document.body.classList.toggle("airlock-mode", isAirlockStep);
    document.body.classList.toggle("meditation-mode", isMeditationStep);
    document.body.classList.toggle("is-meditating", isAirlockStep || isMeditationStep);
    window.dispatchEvent(new CustomEvent("neuromedit:meditationstatechange"));

    if (targetStep === steps.airlock) {
      startBreathCycle();
    } else {
      stopBreathCycle();
    }

    const heading = targetStep.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  };

  const updateMeditationProgress = () => {
    if (!Number.isFinite(meditationAudio.duration) || meditationAudio.duration <= 0) return;

    const progress = Math.min(meditationAudio.currentTime / meditationAudio.duration, 1);
    const offset = circumference - progress * circumference;
    progressRingFill.style.strokeDashoffset = `${offset}`;
  };

  const completeMeditation = () => {
    meditationButton.classList.remove("is-playing");
    progressRingFill.style.strokeDashoffset = "0";
    orbTitle.textContent = "Complete";
    orbSubtitle.textContent = "pause";
    meditationInstruction.textContent = "Session complete. Notice how your body feels.";
    meditationActions.hidden = false;
  };

  showStep(steps.intro);

  startButton.addEventListener("click", () => {
    if (isIntroTransitioning) return;

    if (prefersReducedMotion) {
      showStep(steps.airlock);
      return;
    }

    isIntroTransitioning = true;
    introStep.classList.add("is-leaving");
    startButton.disabled = true;

    window.setTimeout(() => {
      introStep.classList.remove("is-leaving");
      showStep(steps.airlock);
      airlockStep.classList.add("is-entering");

      window.requestAnimationFrame(() => {
        airlockStep.classList.remove("is-entering");
      });

      startButton.disabled = false;
      isIntroTransitioning = false;
    }, INTRO_TO_AIRLOCK_MS);
  });

  nextToMeditationButton.addEventListener("click", () => {
    showStep(steps.meditation);
  });

  meditationButton.addEventListener("click", async () => {
    if (hasMeditationStarted) return;

    hasMeditationStarted = true;
    meditationButton.disabled = true;
    meditationButton.classList.add("is-playing");
    orbTitle.textContent = "Breathe";
    orbSubtitle.textContent = "slowly";
    meditationInstruction.textContent = "Stay with the breath. Let the sound carry the rhythm.";

    try {
      await meditationAudio.play();
    } catch (error) {
      hasMeditationStarted = false;
      meditationButton.disabled = false;
      meditationButton.classList.remove("is-playing");
      orbTitle.textContent = "Start";
      orbSubtitle.textContent = "meditation";
      meditationInstruction.textContent = "Audio is not ready yet. Take one slow breath and try again.";
      meditationActions.hidden = false;
    }
  });

  meditationAudio.addEventListener("timeupdate", updateMeditationProgress);
  meditationAudio.addEventListener("ended", completeMeditation);

  continueAfterMeditationButton.addEventListener("click", () => {
    showStep(steps.reset);
  });

  finishSessionButton.addEventListener("click", () => {
    window.location.href = "complete.html";
  });

  nextToCheckinButton.addEventListener("click", () => {
    showStep(steps.checkin);
  });

  completeCheckinButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = "complete.html";
    });
  });
})();
