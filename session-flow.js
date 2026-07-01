(() => {
  const root = document.querySelector("[data-session-flow]");
  if (!root) return;

  const prep = root.querySelector("[data-session-step='prep']");
  const airlock = root.querySelector("[data-session-step='airlock']");
  const practice = root.querySelector("[data-session-step='practice']");
  const startButton = root.querySelector("[data-session-start]");
  const exitButton = root.querySelector("[data-session-exit]");
  const pauseButton = root.querySelector("[data-session-pause]");
  const breathLabel = root.querySelector("[data-breath-label]");
  const progress = root.querySelector("[data-session-progress]");
  const audio = root.querySelector("[data-session-audio]");

  if (!prep || !airlock || !practice || !startButton || !exitButton || !audio) return;

  // Fallback duration (ms) used ONLY when no narration audio src is provided (generated-audio path).
  // For audio-backed sessions this value is never used — duration comes from audio.duration instead.
  const fallbackDurationMs = Number(root.dataset.duration || 240000);

  const sessionType = root.dataset.sessionType || "calm";
  const sessionAudioSrc = root.dataset.sessionAudioSrc || "";
  const feedbackSource = root.dataset.feedbackSource || "";
  const feedbackPractice = root.dataset.feedbackPractice || "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = new Set();

  // Whether this session is driven by a real narration audio file (true) or generated tones (false).
  const hasNarrationAudio = Boolean(sessionAudioSrc);

  // For audio-backed sessions: duration is read from audio.duration after metadata loads.
  // For generated-audio sessions: duration is the fallback value in milliseconds.
  let sessionDurationMs = hasNarrationAudio ? 0 : fallbackDurationMs; // 0 = not yet known

  // Wall-clock tracking (used only for the generated-audio path).
  let startedAt = 0;
  let elapsedBeforePause = 0;

  let progressFrame = 0;
  let completionTimer = 0;   // used only for generated-audio path
  let isPaused = false;
  let hasCompleted = false;
  let audioContext = null;
  let masterGain = null;
  let usingGeneratedAudio = false;

  // Whether practice has begun and we are waiting for audio metadata.
  let pendingPracticeStart = false;

  const toneMap = {
    calm: [72, 108, 146],
    focus: [96, 144, 192],
    sleep: [54, 81, 108],
    body: [64, 96, 128],
  };

  function currentLanguage() {
    const savedLanguage = window.localStorage.getItem("neuromedit-language");
    return ["en", "pt", "it", "es"].includes(savedLanguage) ? savedLanguage : "en";
  }

  function t(key) {
    if (typeof window.getTranslation === "function") {
      return window.getTranslation(currentLanguage(), key);
    }
    return key;
  }

  function setTimer(fn, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      fn();
    }, delay);
    timers.add(timer);
    return timer;
  }

  function clearTimers() {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    window.clearTimeout(completionTimer);
    completionTimer = 0;
    window.cancelAnimationFrame(progressFrame);
  }

  function getFeedbackUrl(status) {
    if (!feedbackSource || !feedbackPractice) {
      return status === "completed" ? "complete.html" : "feedback.html";
    }
    return `feedback.html?source=${encodeURIComponent(feedbackSource)}&practice=${encodeURIComponent(feedbackPractice)}&status=${status}`;
  }

  function getSettings() {
    return window.NeuroMeditSettings?.get?.() || {};
  }

  function getSettingsVolume(fallback = 1) {
    const volume = window.NeuroMeditSettings?.getVolume?.();
    return typeof volume === "number" ? Math.max(0, Math.min(1, volume)) : fallback;
  }

  function showStep(step) {
    [prep, airlock, practice].forEach((section) => {
      const active = section === step;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    });
  }

  // ---------------------------------------------------------------------------
  // Generated-audio path (oscillators via Web Audio API)
  // ---------------------------------------------------------------------------

  function makeAmbientWav(type) {
    const sampleRate = 22050;
    const seconds = 8;
    const samples = sampleRate * seconds;
    const dataBytes = samples * 2;
    const frequencies = toneMap[type] || toneMap.calm;
    const buffer = new ArrayBuffer(44 + dataBytes);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i += 1) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataBytes, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataBytes, true);

    for (let i = 0; i < samples; i += 1) {
      const ti = i / sampleRate;
      const swell = 0.38 + Math.sin(ti * Math.PI * 0.18) * 0.18;
      const tone =
        Math.sin(2 * Math.PI * frequencies[0] * ti) * 0.24 +
        Math.sin(2 * Math.PI * frequencies[1] * ti) * 0.16 +
        Math.sin(2 * Math.PI * frequencies[2] * ti) * 0.08;
      const sample = Math.max(-1, Math.min(1, tone * swell * 0.24));
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:audio/wav;base64,${btoa(binary)}`;
  }

  function startGeneratedAudio() {
    try {
      if (audioContext) return;

      const frequencies = toneMap[sessionType] || toneMap.calm;
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(audioContext.destination);

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = index === 1 ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.045 : 0.018;
        oscillator.connect(gain).connect(masterGain);
        oscillator.start();
      });

      masterGain.gain.linearRampToValueAtTime(getSettingsVolume(1) * 0.12, audioContext.currentTime + 5);
    } catch (error) {
      audioContext = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Audio start / stop
  // ---------------------------------------------------------------------------

  function startAudio() {
    if (sessionAudioSrc && audio.getAttribute("src") !== sessionAudioSrc) {
      audio.src = sessionAudioSrc;
      audio.loop = false;
      usingGeneratedAudio = false;
    } else if (!sessionAudioSrc) {
      usingGeneratedAudio = true;
      audio.pause();
      audio.removeAttribute("src");
      audio.loop = false;
      startGeneratedAudio();
      return;
    }

    audio.volume = getSettingsVolume(sessionAudioSrc ? 1 : 0.16);
    const attempt = audio.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(startGeneratedAudio);
    }
  }

  function stopAudio() {
    audio.pause();
    audio.currentTime = 0;

    if (audioContext && masterGain) {
      masterGain.gain.cancelScheduledValues(audioContext.currentTime);
      const fadeDuration = getSettings().smoothTransition === false ? 0.35 : 1.6;
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeDuration);
      window.setTimeout(() => {
        if (audioContext) {
          audioContext.close();
          audioContext = null;
          masterGain = null;
        }
      }, getSettings().smoothTransition === false ? 500 : 1800);
    }
  }

  // ---------------------------------------------------------------------------
  // Progress tracking
  // ---------------------------------------------------------------------------

  /**
   * For narration-audio sessions: progress = audio.currentTime / audio.duration
   * For generated-audio sessions: progress = wall-clock elapsed / fallback duration (ms)
   */
  function updateProgress() {
    let value;

    if (hasNarrationAudio && !usingGeneratedAudio) {
      const dur = audio.duration;
      if (dur && isFinite(dur) && dur > 0) {
        value = Math.min(100, (audio.currentTime / dur) * 100);
      } else {
        value = 0;
      }
    } else {
      // Generated-audio path: use wall-clock elapsed vs fallback duration.
      const elapsed = elapsedBeforePause + (isPaused ? 0 : Date.now() - startedAt);
      value = Math.min(100, (elapsed / sessionDurationMs) * 100);
    }

    if (progress) progress.style.setProperty("--session-progress", `${value}%`);

    if (value < 100 && !isPaused) {
      progressFrame = window.requestAnimationFrame(updateProgress);
    }
  }

  // ---------------------------------------------------------------------------
  // Completion (generated-audio path only)
  // ---------------------------------------------------------------------------

  function scheduleCompletion(remaining = sessionDurationMs) {
    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(completeSession, remaining);
  }

  function completeSession() {
    if (hasCompleted) return;
    hasCompleted = true;
    clearTimers();
    stopAudio();
    window.location.href = getFeedbackUrl("completed");
  }

  // ---------------------------------------------------------------------------
  // Pause / Resume
  // ---------------------------------------------------------------------------

  function pausePractice() {
    if (!root.classList.contains("is-practicing") || isPaused) return;

    isPaused = true;
    window.cancelAnimationFrame(progressFrame);
    audio.pause();
    root.classList.add("is-paused");

    if (!hasNarrationAudio) {
      // Wall-clock tracking only needed for generated-audio sessions.
      elapsedBeforePause += Date.now() - startedAt;
      window.clearTimeout(completionTimer);
    }

    if (pauseButton) {
      pauseButton.textContent = t("global_resume");
      pauseButton.dataset.i18n = "global_resume";
    }
  }

  function resumePractice() {
    if (!root.classList.contains("is-practicing") || !isPaused) return;

    isPaused = false;
    root.classList.remove("is-paused");
    startAudio();
    updateProgress();

    if (!hasNarrationAudio) {
      // Restart wall-clock and completion timer for generated-audio sessions.
      startedAt = Date.now();
      scheduleCompletion(Math.max(0, sessionDurationMs - elapsedBeforePause));
    }

    if (pauseButton) {
      pauseButton.textContent = t("global_pause");
      pauseButton.dataset.i18n = "global_pause";
    }
  }

  function togglePause() {
    if (isPaused) {
      resumePractice();
      return;
    }
    pausePractice();
  }

  // ---------------------------------------------------------------------------
  // Practice start — waits for audio metadata when necessary
  // ---------------------------------------------------------------------------

  function initPracticeSession() {
    startedAt = Date.now();
    elapsedBeforePause = 0;
    isPaused = false;
    hasCompleted = false;

    if (pauseButton) {
      pauseButton.hidden = false;
      pauseButton.textContent = t("global_pause");
      pauseButton.dataset.i18n = "global_pause";
    }

    try {
      window.sessionStorage.setItem(
        "neuromedit.lastSession",
        window.location.pathname.split("/").pop() || "calm.html"
      );
    } catch (e) {
      // Session storage is optional; completion still works without it.
    }

    startAudio();
    updateProgress();

    // For generated-audio or audio-that-already-has-metadata: schedule completion via timer.
    // For narration-audio: completion is driven solely by the "ended" event (see listener below).
    if (!hasNarrationAudio) {
      scheduleCompletion(sessionDurationMs);
    }
    // If narration audio is in use, the "ended" listener handles completion — no timer needed.
  }

  function beginPractice() {
    showStep(practice);
    root.classList.add("is-practicing");
    document.body.classList.add("is-meditating");
    window.dispatchEvent(new CustomEvent("neuromedit:meditationstatechange"));

    if (hasNarrationAudio) {
      // Pre-load the audio element so metadata arrives as soon as possible.
      if (!audio.src || audio.getAttribute("src") !== sessionAudioSrc) {
        audio.src = sessionAudioSrc;
        audio.preload = "auto";
        audio.load();
      }

      if (audio.readyState >= 1 && isFinite(audio.duration) && audio.duration > 0) {
        // Metadata already loaded (e.g. from a previous preload).
        sessionDurationMs = audio.duration * 1000;
        initPracticeSession();
      } else {
        // Wait for metadata before starting the timer/progress loop.
        pendingPracticeStart = true;
        // Show that the orb is waiting (progress bar stays at 0) while metadata loads.
      }
    } else {
      initPracticeSession();
    }
  }

  // Fires when audio metadata becomes available (including duration).
  audio.addEventListener("loadedmetadata", () => {
    if (!hasNarrationAudio) return;

    const dur = audio.duration;
    if (isFinite(dur) && dur > 0) {
      sessionDurationMs = dur * 1000;
    }

    if (pendingPracticeStart) {
      pendingPracticeStart = false;
      initPracticeSession();
    }
  });

  // Narration ended → complete the session.
  audio.addEventListener("ended", () => {
    if (!usingGeneratedAudio && hasNarrationAudio) {
      completeSession();
    }
  });

  // ---------------------------------------------------------------------------
  // Airlock
  // ---------------------------------------------------------------------------

  function beginAirlock() {
    showStep(airlock);
    root.classList.add("is-airlock");
    document.body.classList.add("is-meditating");
    window.dispatchEvent(new CustomEvent("neuromedit:meditationstatechange"));
    exitButton.hidden = false;

    // Pre-load the narration audio during the airlock so metadata is ready by
    // the time the practice step begins (avoids a visible delay at practice start).
    if (hasNarrationAudio && (!audio.src || audio.getAttribute("src") !== sessionAudioSrc)) {
      audio.src = sessionAudioSrc;
      audio.preload = "auto";
      audio.load();
    }

    if (breathLabel) {
      breathLabel.textContent = t("global_breathe_in");
      setTimer(() => {
        breathLabel.textContent = t("global_breathe_out");
      }, prefersReducedMotion ? 500 : 3600);
    }

    setTimer(beginPractice, prefersReducedMotion ? 900 : 7600);
  }

  // ---------------------------------------------------------------------------
  // Exit
  // ---------------------------------------------------------------------------

  function exitSession() {
    clearTimers();
    stopAudio();
    if (pauseButton) pauseButton.hidden = true;
    document.body.classList.remove("is-meditating");
    window.dispatchEvent(new CustomEvent("neuromedit:meditationstatechange"));
    root.classList.add("is-leaving");
    setTimer(() => {
      window.location.href = getFeedbackUrl("exited");
    }, prefersReducedMotion ? 50 : 700);
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  showStep(prep);
  document.body.classList.remove("is-meditating");
  window.dispatchEvent(new CustomEvent("neuromedit:meditationstatechange"));
  exitButton.hidden = true;
  if (pauseButton) pauseButton.hidden = true;

  startButton.addEventListener("click", beginAirlock);
  exitButton.addEventListener("click", exitSession);
  pauseButton?.addEventListener("click", togglePause);

  window.addEventListener("neuromedit:settingschange", () => {
    if (!audio.paused) {
      audio.volume = getSettingsVolume(audio.volume);
    }
    if (masterGain && audioContext) {
      masterGain.gain.setTargetAtTime(getSettingsVolume(0.12) * 0.12, audioContext.currentTime, 0.2);
    }
  });
})();
