(() => {
  "use strict";

  const STORAGE_KEY = "neuromedit-settings";
  const THEME_CLASSES = [
    "theme-morning",
    "theme-dawn",
    "theme-afternoon",
    "theme-day",
    "theme-sunset",
    "theme-evening",
    "theme-night",
    "theme-warm-night",
    "theme-sleep",
    "theme-late-night",
  ];

  const DEFAULTS = {
    vocalIsolation: false,
    ambientVolume: 40,
    smoothTransition: true,
    visualTheme: "auto",
    focusMode: false,
    muteAnimations: false,
    silenceStart: "22:00",
    silenceEnd: "07:00",
    hideMetrics: false,
  };

  const KEY_ALIASES = {
    "vocal-isolation": "vocalIsolation",
    "ambient-volume": "ambientVolume",
    "smooth-transition": "smoothTransition",
    "light-mode": "visualTheme",
    "focus-mode": "focusMode",
    "mute-animations": "muteAnimations",
    "silence-start": "silenceStart",
    "silence-end": "silenceEnd",
    "hide-metrics": "hideMetrics",
  };

  const THEME_MAP = {
    light: "day",
    dark: "night",
    "low-contrast": "evening",
  };

  const TEMPLATE = `
<button type="button" id="settings-fab" class="settings-fab" aria-label="Open settings" title="Settings">
  <svg class="settings-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <line x1="4" y1="7" x2="20" y2="7"></line>
    <line x1="4" y1="12" x2="20" y2="12"></line>
    <line x1="4" y1="17" x2="20" y2="17"></line>
    <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none"></circle>
    <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
    <circle cx="10" cy="17" r="1.5" fill="currentColor" stroke="none"></circle>
  </svg>
</button>

<div id="settings-overlay" class="settings-overlay" aria-hidden="true"></div>

<aside id="settings-panel" class="settings-panel" role="dialog" aria-modal="true" aria-label="Settings" aria-hidden="true">
  <div class="settings-header">
    <h2 class="settings-title">Settings</h2>
    <button type="button" id="settings-close" class="settings-close" aria-label="Close settings" title="Close">
      <svg class="settings-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
        <path d="M6.5 6.5L17.5 17.5"></path>
        <path d="M17.5 6.5L6.5 17.5"></path>
      </svg>
    </button>
  </div>

  <div class="settings-body">
    <section class="settings-section" aria-labelledby="settings-section-audio">
      <p class="settings-section-label" id="settings-section-audio">Immersion &amp; Audio</p>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Vocal Isolation</p>
          <p class="setting-hint">Prioritizes the guided voice when available.</p>
        </div>
        <input type="checkbox" class="setting-toggle" data-setting-key="vocalIsolation" id="toggle-vocal-isolation" aria-label="Vocal Isolation">
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Ambient Volume</p>
        </div>
        <div class="setting-slider-wrap">
          <input type="range" class="setting-slider" data-setting-key="ambientVolume" id="slider-ambient-volume" min="0" max="100" step="1" aria-label="Ambient Volume">
          <span class="setting-slider-value" aria-live="polite">40%</span>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Smooth Transition</p>
          <p class="setting-hint">Uses extended fades at the end of sessions.</p>
        </div>
        <input type="checkbox" class="setting-toggle" data-setting-key="smoothTransition" id="toggle-smooth-transition" aria-label="Smooth Transition">
      </div>
    </section>

    <section class="settings-section" aria-labelledby="settings-section-visual">
      <p class="settings-section-label" id="settings-section-visual">Visual Comfort</p>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Theme</p>
        </div>
        <div class="setting-select-group" data-setting-key="visualTheme" role="group" aria-label="Theme">
          <button type="button" class="setting-select-option" data-value="auto" aria-pressed="false">Auto</button>
          <button type="button" class="setting-select-option" data-value="light" aria-pressed="false">Light</button>
          <button type="button" class="setting-select-option" data-value="dark" aria-pressed="false">Dark</button>
          <button type="button" class="setting-select-option" data-value="low-contrast" aria-pressed="false">Low Contrast</button>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Focus Mode</p>
          <p class="setting-hint">Softly hides chrome after a few seconds of inactivity.</p>
        </div>
        <input type="checkbox" class="setting-toggle" data-setting-key="focusMode" id="toggle-focus-mode" aria-label="Focus Mode">
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Mute Animations</p>
          <p class="setting-hint">Reduces visual motion for a quieter experience.</p>
        </div>
        <input type="checkbox" class="setting-toggle" data-setting-key="muteAnimations" id="toggle-mute-animations" aria-label="Mute Animations">
      </div>
    </section>

    <section class="settings-section" aria-labelledby="settings-section-attention">
      <p class="settings-section-label" id="settings-section-attention">Attention Protection</p>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Deep Silence Hours</p>
          <p class="setting-hint">Marks the quiet window for the experience.</p>
        </div>
        <div class="setting-time-group">
          <input type="time" class="setting-time-input" data-setting-key="silenceStart" id="input-silence-start" aria-label="Silence start time">
          <span class="setting-time-sep">to</span>
          <input type="time" class="setting-time-input" data-setting-key="silenceEnd" id="input-silence-end" aria-label="Silence end time">
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <p class="setting-label">Hide Metrics</p>
          <p class="setting-hint">Hides streaks and progress counters when present.</p>
        </div>
        <input type="checkbox" class="setting-toggle" data-setting-key="hideMetrics" id="toggle-hide-metrics" aria-label="Hide Metrics">
      </div>
    </section>

    <section class="settings-section" aria-labelledby="settings-section-autonomy">
      <p class="settings-section-label" id="settings-section-autonomy">Autonomy</p>

      <div class="setting-row">
        <a href="#account-data" class="setting-link" id="settings-account-link">
          Manage Account Data
          <span class="setting-link-arrow" aria-hidden="true">&rarr;</span>
        </a>
      </div>

      <button type="button" class="setting-ghost-btn" id="btn-disconnect">
        Reset Local Preferences
      </button>
      <p class="settings-status" id="settings-status" role="status" aria-live="polite"></p>

      <div id="settings-auth-container" class="settings-auth-container"></div>
    </section>
  </div>
</aside>`;

  const AUTH_MODAL_TEMPLATE = `
<div id="auth-modal-overlay" class="auth-modal-overlay" aria-hidden="true">
  <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
    <button type="button" class="auth-modal-close" id="auth-modal-close" aria-label="Fechar" title="Fechar">
      <svg class="auth-modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>
    <div class="auth-modal-content">
      <h2 id="auth-modal-title" class="auth-modal-title">Personalizar o seu silêncio</h2>
      <p class="auth-modal-desc">Ao criar a sua conta NeuroMedit, guardamos as suas preferências de som e temas, permitindo que a sua experiência seja consistente em qualquer dispositivo.</p>
      
      <button type="button" class="auth-google-btn" id="auth-btn-signin">
        <svg class="google-icon" viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Continuar com o Google</span>
      </button>
      
      <button type="button" class="auth-modal-cancel" id="auth-btn-cancel">Continuar offline</button>
    </div>
  </div>
</div>`;

  let state = loadSettings();
  let focusIdleTimer = 0;

  // Firebase integration variables
  let auth, db, doc, getDoc, setDoc, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged;

  async function initFirebase() {
    try {
      const fb = await import('./firebase-init.js');
      auth = fb.auth;
      db = fb.db;
      doc = fb.doc;
      getDoc = fb.getDoc;
      setDoc = fb.setDoc;
      GoogleAuthProvider = fb.GoogleAuthProvider;
      signInWithPopup = fb.signInWithPopup;
      signOut = fb.signOut;
      onAuthStateChanged = fb.onAuthStateChanged;

      setupAuthListener();
    } catch (e) {
      console.warn("Firebase failed to load. Operating in local mode.", e);
      renderAuthUI();
    }
  }

  function openAuthModal() {
    const authOverlay = document.getElementById("auth-modal-overlay");
    if (authOverlay) {
      // Close settings panel so they can see the modal clearly
      const panel = document.getElementById("settings-panel");
      const overlay = document.getElementById("settings-overlay");
      if (panel && overlay) {
        document.body.classList.remove("settings-open");
        overlay.classList.remove("is-open");
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        syncFocusIdleState();
      }

      authOverlay.classList.add("is-active");
      authOverlay.setAttribute("aria-hidden", "false");
      document.getElementById("auth-btn-signin")?.focus();
      document.addEventListener("keydown", onAuthModalEscape);
    }
  }

  function closeAuthModal() {
    const authOverlay = document.getElementById("auth-modal-overlay");
    if (authOverlay) {
      authOverlay.classList.remove("is-active");
      authOverlay.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onAuthModalEscape);
    }
  }

  function onAuthModalEscape(event) {
    if (event.key === "Escape") closeAuthModal();
  }

  function setupAuthModalEvents() {
    const authOverlay = document.getElementById("auth-modal-overlay");
    const authClose = document.getElementById("auth-modal-close");
    const authCancel = document.getElementById("auth-btn-cancel");
    const authBtnSignin = document.getElementById("auth-btn-signin");

    authClose?.addEventListener("click", closeAuthModal);
    authCancel?.addEventListener("click", closeAuthModal);
    authOverlay?.addEventListener("click", (event) => {
      if (event.target === authOverlay) closeAuthModal();
    });

    authBtnSignin?.addEventListener("click", async () => {
      if (!auth || !GoogleAuthProvider || !signInWithPopup) {
        console.error("Firebase Auth not loaded yet.");
        return;
      }
      try {
        authBtnSignin.disabled = true;
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        closeAuthModal();
      } catch (error) {
        console.error("Sign in failed", error);
        authBtnSignin.disabled = false;
      }
    });
  }

  function setupAuthListener() {
    if (!auth || !onAuthStateChanged) return;

    onAuthStateChanged(auth, async (user) => {
      renderAuthUI();
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          
          if (!docSnap.exists()) {
            // First-time login: save ONLY email and default preferences (NeuroMedit data minimization rule)
            await setDoc(userRef, {
              email: user.email,
              preferences: {
                theme: 'system',
                audioMode: 'voice+ambient'
              }
            });
            // Apply default preferences locally
            setSettings({
              visualTheme: "auto",
              vocalIsolation: false
            }, { notify: true, skipCloudSync: true });
          } else {
            // Load and apply preferences from Firestore
            const data = docSnap.data();
            if (data && data.preferences) {
              const prefs = data.preferences;
              const mapped = {};
              if (prefs.theme) {
                mapped.visualTheme = prefs.theme === "system" ? "auto" : prefs.theme;
              }
              if (prefs.audioMode) {
                mapped.vocalIsolation = prefs.audioMode === "voice";
              }
              // Map remaining preferences fields if present
              Object.entries(prefs).forEach(([k, v]) => {
                if (k !== 'theme' && k !== 'audioMode' && k in DEFAULTS) {
                  mapped[k] = v;
                }
              });
              setSettings(mapped, { notify: true, skipCloudSync: true });
            }
          }
        } catch (error) {
          console.error("Error loading user preferences from Firestore", error);
        }
      } else {
        // Logged out: revert to local settings from localStorage
        const local = loadSettings();
        setSettings(local, { notify: true, skipCloudSync: true });
      }
    });
  }

  function renderAuthUI() {
    const container = document.getElementById("settings-auth-container");
    if (!container) return;

    if (!auth) {
      container.innerHTML = `
        <div class="setting-row">
          <p class="setting-hint">Loading authentication...</p>
        </div>
      `;
      return;
    }

    const user = auth.currentUser;
    if (user) {
      container.innerHTML = `
        <div class="setting-row auth-user-row">
          <div class="setting-info" style="max-width: 60%;">
            <p class="setting-label">Account</p>
            <p class="setting-hint" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${user.email}">${user.email}</p>
          </div>
          <button type="button" class="setting-ghost-btn" id="btn-signout" style="margin: 0; min-height: 38px; padding: 0.5rem 1rem;">
            Sign Out
          </button>
        </div>
      `;
      document.getElementById("btn-signout")?.addEventListener("click", async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Sign out failed", error);
        }
      });
    } else {
      container.innerHTML = `
        <div class="setting-row auth-login-row" style="flex-direction: column; align-items: stretch; gap: 0.75rem; width: 100%;">
          <div class="setting-info" style="margin-bottom: 0.25rem;">
            <p class="setting-label">Cloud Sync</p>
            <p class="setting-hint">Sync your preferences across all your devices using your Google account.</p>
          </div>
          <button type="button" class="google-signin-btn" id="btn-signin">
            <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      `;
      document.getElementById("btn-signin")?.addEventListener("click", () => {
        openAuthModal();
      });
    }
  }

  function normalizeSettings(raw) {
    const normalized = { ...DEFAULTS };
    if (!raw || typeof raw !== "object") return normalized;

    Object.entries(raw).forEach(([key, value]) => {
      const normalizedKey = KEY_ALIASES[key] || key;
      if (!(normalizedKey in normalized)) return;
      normalized[normalizedKey] = value;
    });

    normalized.ambientVolume = Math.max(0, Math.min(100, Number(normalized.ambientVolume) || 0));
    if (!["auto", "light", "dark", "low-contrast"].includes(normalized.visualTheme)) {
      normalized.visualTheme = normalized.visualTheme === "night" || normalized.visualTheme === "dark"
        ? "dark"
        : normalized.visualTheme === "day" || normalized.visualTheme === "light"
          ? "light"
          : "auto";
    }

    return normalized;
  }

  function loadSettings() {
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return { ...DEFAULTS };
    }
  }

  async function persistSettings(skipCloudSync = false) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      
      // If logged in and not skipping cloud sync, save to Firestore
      if (!skipCloudSync && auth && auth.currentUser && db && setDoc && doc) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
          email: auth.currentUser.email,
          preferences: {
            theme: state.visualTheme === "auto" ? "system" : state.visualTheme,
            audioMode: state.vocalIsolation ? "voice" : "voice+ambient",
            vocalIsolation: state.vocalIsolation,
            ambientVolume: state.ambientVolume,
            smoothTransition: state.smoothTransition,
            focusMode: state.focusMode,
            muteAnimations: state.muteAnimations,
            silenceStart: state.silenceStart,
            silenceEnd: state.silenceEnd,
            hideMetrics: state.hideMetrics
          }
        }, { merge: true });
      }
    } catch (error) {
      console.error("Failed to persist settings", error);
    }
  }

  function setForcedTheme(theme) {
    const forcedTheme = THEME_MAP[theme] || "";
    const targets = [document.documentElement, document.body].filter(Boolean);

    if (!forcedTheme) {
      document.documentElement.removeAttribute("data-force-theme");
      targets.forEach((target) => {
        target.removeAttribute("data-theme");
        target.removeAttribute("data-settings-theme");
      });
      window.NeuroMeditTheme?.apply?.();
      return;
    }

    document.documentElement.setAttribute("data-force-theme", forcedTheme);
    targets.forEach((target) => {
      target.classList.remove(...THEME_CLASSES);
      target.classList.add(`theme-${forcedTheme}`);
      target.dataset.theme = forcedTheme;
      target.dataset.settingsTheme = theme;
    });
  }

  function applyVolume() {
    const volume = state.ambientVolume / 100;
    document.documentElement.style.setProperty("--settings-ambient-volume", String(volume));

    document.querySelectorAll("audio, video").forEach((media) => {
      if (media.dataset.settingsVolume === "ignore") return;
      media.volume = volume;
      media.dataset.settingsManagedVolume = "true";
    });
  }

  function syncFocusIdleState() {
    window.clearTimeout(focusIdleTimer);
    document.body?.classList.remove("settings-focus-idle");

    if (!state.focusMode || document.body?.classList.contains("settings-open")) {
      return;
    }

    focusIdleTimer = window.setTimeout(() => {
      if (state.focusMode && !document.body.classList.contains("settings-open")) {
        document.body.classList.add("settings-focus-idle");
      }
    }, 7000);
  }

  function applySettings({ notify = false } = {}) {
    const body = document.body;
    if (!body) return;

    setForcedTheme(state.visualTheme);
    body.classList.toggle("settings-vocal-isolation", state.vocalIsolation);
    body.classList.toggle("settings-smooth-transition", state.smoothTransition);
    body.classList.toggle("settings-focus-mode", state.focusMode);
    body.classList.toggle("settings-muted-motion", state.muteAnimations);
    body.classList.toggle("settings-hide-metrics", state.hideMetrics);
    body.classList.toggle("settings-low-contrast", state.visualTheme === "low-contrast");
    body.dataset.silenceStart = state.silenceStart;
    body.dataset.silenceEnd = state.silenceEnd;
    applyVolume();
    syncFocusIdleState();

    if (notify) {
      window.dispatchEvent(new CustomEvent("neuromedit:settingschange", { detail: { settings: { ...state } } }));
    }
  }

  function setSettings(patch, options = {}) {
    state = normalizeSettings({ ...state, ...patch });
    persistSettings(options.skipCloudSync);
    applySettings({ notify: options.notify !== false });
    syncPanelControls();
  }

  function resetSettings() {
    state = { ...DEFAULTS };
    persistSettings();
    applySettings({ notify: true });
    syncPanelControls();
  }

  function syncPanelControls() {
    const panel = document.getElementById("settings-panel");
    if (!panel) return;

    panel.querySelectorAll("[data-setting-key]").forEach((control) => {
      const key = control.dataset.settingKey;
      const value = state[key];

      if (control.matches('input[type="checkbox"]')) {
        control.checked = Boolean(value);
      } else if (control.matches('input[type="range"], input[type="time"]')) {
        control.value = value;
      }
    });

    panel.querySelectorAll(".setting-slider").forEach((slider) => {
      const valueEl = slider.parentElement?.querySelector(".setting-slider-value");
      if (valueEl) valueEl.textContent = `${slider.value}%`;
    });

    panel.querySelectorAll(".setting-select-group[data-setting-key]").forEach((group) => {
      const value = state[group.dataset.settingKey];
      group.querySelectorAll(".setting-select-option").forEach((button) => {
        const active = button.dataset.value === value;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    });
  }

  function bindControls() {
    const fab = document.getElementById("settings-fab");
    const overlay = document.getElementById("settings-overlay");
    const panel = document.getElementById("settings-panel");
    const closeBtn = document.getElementById("settings-close");
    const resetBtn = document.getElementById("btn-disconnect");
    const accountLink = document.getElementById("settings-account-link");
    const status = document.getElementById("settings-status");

    if (!fab || !overlay || !panel || !closeBtn) return;

    function openSettings() {
      document.body.classList.add("settings-open");
      document.body.classList.remove("settings-focus-idle");
      overlay.classList.add("is-open");
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      closeBtn.focus();
      document.addEventListener("keydown", onEscape);
    }

    function closeSettings() {
      document.body.classList.remove("settings-open");
      overlay.classList.remove("is-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onEscape);
      syncFocusIdleState();
      fab.focus();
    }

    function onEscape(event) {
      if (event.key === "Escape") closeSettings();
    }

    fab.addEventListener("click", openSettings);
    closeBtn.addEventListener("click", closeSettings);
    overlay.addEventListener("click", closeSettings);

    document.body.addEventListener("click", (event) => {
      const target = event.target.closest("#mobile-menu-settings");
      if (target) {
        openSettings();
        const closeBtnMobile = document.querySelector("[data-mobile-close]");
        if (closeBtnMobile) {
          closeBtnMobile.click();
        }
      }
    });

    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;

      const focusable = Array.from(panel.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter((element) => !element.disabled && element.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // "input" only for live slider feedback (skips cloud sync to avoid a write per drag tick);
    // "change" is the single source of truth that persists (checkbox/time/range fire it once).
    panel.addEventListener("input", (event) => {
      const control = event.target.closest("[data-setting-key]");
      if (!control || !control.matches('input[type="range"]')) return;

      setSettings({ [control.dataset.settingKey]: control.value }, { skipCloudSync: true });
    });

    panel.addEventListener("change", (event) => {
      const control = event.target.closest("[data-setting-key]");
      if (!control || control.classList.contains("setting-select-group")) return;

      const key = control.dataset.settingKey;
      const value = control.matches('input[type="checkbox"]') ? control.checked : control.value;
      setSettings({ [key]: value });
    });

    panel.querySelectorAll(".setting-select-group").forEach((group) => {
      group.addEventListener("click", (event) => {
        const button = event.target.closest(".setting-select-option");
        if (!button) return;
        setSettings({ [group.dataset.settingKey]: button.dataset.value });
      });
    });

    resetBtn?.addEventListener("click", () => {
      resetSettings();
      if (status) {
        status.textContent = "Preferences reset on this device.";
        window.setTimeout(() => {
          status.textContent = "";
        }, 2400);
      }
    });

    accountLink?.addEventListener("click", (event) => {
      event.preventDefault();
      if (status) {
        if (auth && auth.currentUser) {
          status.textContent = "Your settings are synced to the cloud.";
        } else {
          status.textContent = "Account data is stored locally in this prototype.";
        }
        window.setTimeout(() => {
          status.textContent = "";
        }, 3000);
      }
    });

    // Initial auth UI rendering
    renderAuthUI();
  }

  function bindGlobalSettingsEvents() {
    ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"].forEach((eventName) => {
      window.addEventListener(eventName, syncFocusIdleState, { passive: true });
    });

    document.addEventListener("play", (event) => {
      if (event.target instanceof HTMLMediaElement) {
        applyVolume();
      }
    }, true);
  }

  function init() {
    if (!document.body) return;

    if (!document.getElementById("settings-fab")) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = TEMPLATE.trim();
      while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
      }
    }

    if (!document.getElementById("auth-modal-overlay")) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = AUTH_MODAL_TEMPLATE.trim();
      while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
      }
      setupAuthModalEvents();
    }

    const mobileNav = document.querySelector(".header-mobile-nav");
    if (mobileNav && !document.getElementById("mobile-menu-settings")) {
      const settingsBtn = document.createElement("button");
      settingsBtn.type = "button";
      settingsBtn.id = "mobile-menu-settings";
      settingsBtn.className = "header-mobile-link nav-link";
      settingsBtn.setAttribute("aria-label", "Configurações");
      settingsBtn.setAttribute("title", "Configurações");
      settingsBtn.dataset.i18n = "mobile_menu_settings";
      settingsBtn.dataset.i18nAttr = "aria-label,title";
      settingsBtn.innerHTML = `
        <span class="header-nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </span>
        <span class="header-mobile-text" data-i18n="mobile_menu_settings">Configurações</span>
      `;
      mobileNav.appendChild(settingsBtn);
    }

    bindControls();
    bindGlobalSettingsEvents();
    syncPanelControls();
    applySettings({ notify: true });
    
    // Load Firebase configuration and state
    initFirebase();
  }

  window.NeuroMeditSettings = {
    get: () => ({ ...state }),
    set: (patch) => setSettings(patch),
    reset: resetSettings,
    apply: () => applySettings({ notify: true }),
    getVolume: () => state.ambientVolume / 100,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
