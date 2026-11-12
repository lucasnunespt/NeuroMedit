const STORAGE_KEY = "neuromedit-language";
const LEGACY_STORAGE_KEY = "preferredLanguage";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["pt", "en", "es", "it", "ru"];

window.NeuroMeditTranslations = window.NeuroMeditTranslations || {};

function getPreferredLanguage() {
  const savedLanguage = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(savedLanguage)) {
    return savedLanguage;
  }

  const legacyLanguage = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.includes(legacyLanguage)) {
    return legacyLanguage;
  }

  const browserLanguages = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || ""];
  const detectedLanguage = browserLanguages
    .map((language) => language.toLowerCase().split("-")[0])
    .find((language) => SUPPORTED_LANGUAGES.includes(language));

  return detectedLanguage || DEFAULT_LANGUAGE;
}

function getTranslation(language, key) {
  const translations = window.NeuroMeditTranslations;
  return translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE]?.[key] ?? `[${key}]`;
}

const LANGUAGE_OPTIONS = [
  { code: "pt", name: "Português" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "it", name: "Italiano" },
  { code: "ru", name: "Русский" }
];

// Globo: a Terra em pontos de brilho (design system, componente Globo).
// Fica em linha porque lê as variáveis de cor do tema.
const LANGUAGE_GLOBE_MARKUP = `<svg class="lang-globo-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><defs><radialGradient id="globoHalo"><stop offset="0" style="stop-color:var(--globo-core)" stop-opacity=".30"/><stop offset=".62" style="stop-color:var(--globo-mid)" stop-opacity=".12"/><stop offset="1" style="stop-color:var(--globo-edge)" stop-opacity="0"/></radialGradient><filter id="globoBlur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.6"/></filter></defs><circle cx="20" cy="20" r="17" fill="url(#globoHalo)"/><g style="fill:var(--globo-edge)" filter="url(#globoBlur)" opacity=".55"><circle cx="20.0" cy="6.0" r="1.23" opacity="0.97"/><circle cx="24.3" cy="6.7" r="1.33" opacity="0.95"/><circle cx="28.2" cy="8.7" r="1.24" opacity="0.98"/><circle cx="31.3" cy="11.8" r="1.36" opacity="0.95"/><circle cx="33.3" cy="15.7" r="1.30" opacity="0.92"/><circle cx="34.0" cy="20.0" r="1.20" opacity="0.94"/><circle cx="33.3" cy="24.3" r="1.32" opacity="0.91"/><circle cx="31.3" cy="28.2" r="1.36" opacity="0.92"/><circle cx="28.2" cy="31.3" r="1.24" opacity="0.90"/><circle cx="24.3" cy="33.3" r="1.40" opacity="0.97"/><circle cx="20.0" cy="34.0" r="1.38" opacity="0.96"/><circle cx="15.7" cy="33.3" r="1.20" opacity="0.93"/><circle cx="11.8" cy="31.3" r="1.30" opacity="0.91"/><circle cx="8.7" cy="28.2" r="1.39" opacity="0.94"/><circle cx="6.7" cy="24.3" r="1.23" opacity="0.98"/><circle cx="6.0" cy="20.0" r="1.22" opacity="0.99"/><circle cx="6.7" cy="15.7" r="1.29" opacity="0.96"/><circle cx="8.7" cy="11.8" r="1.27" opacity="0.95"/><circle cx="11.8" cy="8.7" r="1.23" opacity="0.90"/><circle cx="15.7" cy="6.7" r="1.38" opacity="0.92"/><circle cx="30.4" cy="22.1" r="1.10" opacity="0.74"/><circle cx="26.0" cy="23.6" r="1.13" opacity="0.79"/><circle cx="20.0" cy="24.2" r="1.09" opacity="0.78"/><circle cx="14.0" cy="23.6" r="1.06" opacity="0.78"/><circle cx="9.6" cy="22.1" r="0.99" opacity="0.76"/><circle cx="9.6" cy="17.9" r="1.10" opacity="0.74"/><circle cx="14.0" cy="16.4" r="1.12" opacity="0.79"/><circle cx="20.0" cy="15.8" r="1.03" opacity="0.75"/><circle cx="26.0" cy="16.4" r="1.04" opacity="0.75"/><circle cx="30.4" cy="17.9" r="1.13" opacity="0.75"/><circle cx="16.9" cy="30.4" r="0.97" opacity="0.73"/><circle cx="14.5" cy="26.0" r="1.09" opacity="0.80"/><circle cx="13.7" cy="20.0" r="1.05" opacity="0.76"/><circle cx="14.5" cy="14.0" r="1.06" opacity="0.78"/><circle cx="16.9" cy="9.6" r="1.00" opacity="0.77"/><circle cx="23.1" cy="9.6" r="1.06" opacity="0.77"/><circle cx="25.5" cy="14.0" r="1.00" opacity="0.73"/><circle cx="26.3" cy="20.0" r="1.02" opacity="0.79"/><circle cx="25.5" cy="26.0" r="1.02" opacity="0.77"/><circle cx="23.2" cy="30.4" r="1.02" opacity="0.73"/></g><g style="fill:var(--globo-core)"><circle cx="20.0" cy="6.0" r="1.23" opacity="0.97"/><circle cx="24.3" cy="6.7" r="1.33" opacity="0.95"/><circle cx="28.2" cy="8.7" r="1.24" opacity="0.98"/><circle cx="31.3" cy="11.8" r="1.36" opacity="0.95"/><circle cx="33.3" cy="15.7" r="1.30" opacity="0.92"/><circle cx="34.0" cy="20.0" r="1.20" opacity="0.94"/><circle cx="33.3" cy="24.3" r="1.32" opacity="0.91"/><circle cx="31.3" cy="28.2" r="1.36" opacity="0.92"/><circle cx="28.2" cy="31.3" r="1.24" opacity="0.90"/><circle cx="24.3" cy="33.3" r="1.40" opacity="0.97"/><circle cx="20.0" cy="34.0" r="1.38" opacity="0.96"/><circle cx="15.7" cy="33.3" r="1.20" opacity="0.93"/><circle cx="11.8" cy="31.3" r="1.30" opacity="0.91"/><circle cx="8.7" cy="28.2" r="1.39" opacity="0.94"/><circle cx="6.7" cy="24.3" r="1.23" opacity="0.98"/><circle cx="6.0" cy="20.0" r="1.22" opacity="0.99"/><circle cx="6.7" cy="15.7" r="1.29" opacity="0.96"/><circle cx="8.7" cy="11.8" r="1.27" opacity="0.95"/><circle cx="11.8" cy="8.7" r="1.23" opacity="0.90"/><circle cx="15.7" cy="6.7" r="1.38" opacity="0.92"/><circle cx="30.4" cy="22.1" r="1.10" opacity="0.74"/><circle cx="26.0" cy="23.6" r="1.13" opacity="0.79"/><circle cx="20.0" cy="24.2" r="1.09" opacity="0.78"/><circle cx="14.0" cy="23.6" r="1.06" opacity="0.78"/><circle cx="9.6" cy="22.1" r="0.99" opacity="0.76"/><circle cx="9.6" cy="17.9" r="1.10" opacity="0.74"/><circle cx="14.0" cy="16.4" r="1.12" opacity="0.79"/><circle cx="20.0" cy="15.8" r="1.03" opacity="0.75"/><circle cx="26.0" cy="16.4" r="1.04" opacity="0.75"/><circle cx="30.4" cy="17.9" r="1.13" opacity="0.75"/><circle cx="16.9" cy="30.4" r="0.97" opacity="0.73"/><circle cx="14.5" cy="26.0" r="1.09" opacity="0.80"/><circle cx="13.7" cy="20.0" r="1.05" opacity="0.76"/><circle cx="14.5" cy="14.0" r="1.06" opacity="0.78"/><circle cx="16.9" cy="9.6" r="1.00" opacity="0.77"/><circle cx="23.1" cy="9.6" r="1.06" opacity="0.77"/><circle cx="25.5" cy="14.0" r="1.00" opacity="0.73"/><circle cx="26.3" cy="20.0" r="1.02" opacity="0.79"/><circle cx="25.5" cy="26.0" r="1.02" opacity="0.77"/><circle cx="23.2" cy="30.4" r="1.02" opacity="0.73"/></g></svg>`;

function buildLanguageSwitcherMarkup() {
  const optionsMarkup = LANGUAGE_OPTIONS.map(({ code, name }) => `
        <button type="button" role="menuitem" lang="${code}" aria-label="${name}" data-lang-option="${code}">${code.toUpperCase()}</button>`).join("");

  return `
    <div class="lang-globo" data-language-menu>
      <div class="lang-globo-frame">
        <button
          class="lang-globo-trigger"
          type="button"
          aria-label="Choose language"
          aria-expanded="false"
          aria-controls="languageOptions"
          data-language-trigger
        >
          ${LANGUAGE_GLOBE_MARKUP}
          <span class="lang-globo-current" data-language-current>EN</span>
        </button>

        <div class="lang-globo-options" id="languageOptions" role="menu" aria-hidden="true" data-language-options>${optionsMarkup}
        </div>
      </div>
    </div>
  `;
}

function renderLanguageControls() {
  document.querySelectorAll("[data-language-host]").forEach((slot) => {
    slot.innerHTML = buildLanguageSwitcherMarkup();
  });
}

function updateLanguageButtons(language) {
  const selectorLabel = getTranslation(language, "global_language_selector");

  document.querySelectorAll("[data-language-trigger]").forEach((trigger) => {
    trigger.setAttribute("aria-label", selectorLabel || "Choose language");
    const currentLanguage = trigger.querySelector("[data-language-current]");
    if (currentLanguage) {
      currentLanguage.textContent = language.toUpperCase();
    }
  });

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    const isActive = button.dataset.langOption === language;

    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function applyTranslations(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    const value = getTranslation(language, key);
    const attributeNames = (element.dataset.i18nAttr || "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (attributeNames.length > 0) {
      attributeNames.forEach((attributeName) => {
        element.setAttribute(attributeName, value);
      });
      return;
    }

    element.textContent = value;
  });

  document.documentElement.lang = language;
  updateLanguageButtons(language);
}

function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, language);
  localStorage.setItem(LEGACY_STORAGE_KEY, language);
  applyTranslations(language);
  window.dispatchEvent(new CustomEvent("neuromedit:languagechange", { detail: { language } }));
}

function bindLanguageSwitcherEvents() {
  const canUseHover = typeof window.matchMedia === "function"
    ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
    : false;

  document.querySelectorAll("[data-language-menu]").forEach((languageMenu) => {
    const languageTrigger = languageMenu.querySelector("[data-language-trigger]");
    const languageOptionsPanel = languageMenu.querySelector("[data-language-options]");
    const languageOptions = languageMenu.querySelectorAll("[data-lang-option]");
    let languageCloseTimer = 0;

    function setLanguageMenuExpanded(isExpanded) {
      if (!languageTrigger) return;
      languageMenu.classList.toggle("is-open", isExpanded);
      languageTrigger.setAttribute("aria-expanded", String(isExpanded));
      languageOptionsPanel?.setAttribute("aria-hidden", String(!isExpanded));
      languageOptions.forEach((option) => {
        option.tabIndex = isExpanded ? 0 : -1;
      });
    }

    function openLanguageMenu() {
      if (!languageTrigger) return;
      window.clearTimeout(languageCloseTimer);
      setLanguageMenuExpanded(true);
    }

    function closeLanguageMenuNow({ restoreFocus = false } = {}) {
      if (!languageTrigger) return;
      window.clearTimeout(languageCloseTimer);
      setLanguageMenuExpanded(false);

      if (restoreFocus) {
        languageTrigger.focus();
      }
    }

    function closeLanguageMenuWithDelay(delay = 2000) {
      if (!languageTrigger) return;
      window.clearTimeout(languageCloseTimer);
      languageCloseTimer = window.setTimeout(() => {
        setLanguageMenuExpanded(false);
      }, delay);
    }

    function toggleLanguageMenu() {
      if (languageMenu.classList.contains("is-open")) {
        closeLanguageMenuNow();
        return;
      }

      openLanguageMenu();
    }

    languageTrigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      // Com rato, o cursor e o foco já abrem a lista: o clique não a deve fechar.
      if (canUseHover) {
        openLanguageMenu();
        return;
      }
      toggleLanguageMenu();
    });

    if (canUseHover) {
      languageMenu.addEventListener("mouseenter", () => {
        window.clearTimeout(languageCloseTimer);
        setLanguageMenuExpanded(true);
      });

      languageMenu.addEventListener("mouseleave", () => {
        if (!languageMenu.contains(document.activeElement)) {
          closeLanguageMenuNow();
        }
      });
    }

    if (canUseHover) {
      languageMenu.addEventListener("focusin", openLanguageMenu);
      languageMenu.addEventListener("focusout", () => {
        window.setTimeout(() => {
          if (!languageMenu.contains(document.activeElement)) {
            closeLanguageMenuNow();
          }
        }, 0);
      });
    }

    languageOptions.forEach((button) => {
      button.tabIndex = -1;

      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const selectedLanguage = button.dataset.langOption;

        if (!SUPPORTED_LANGUAGES.includes(selectedLanguage)) return;

        setLanguage(selectedLanguage);
        closeLanguageMenuNow();
      });
    });

    document.addEventListener("click", (event) => {
      if (languageMenu.contains(event.target)) {
        return;
      }

      closeLanguageMenuNow();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeLanguageMenuNow({ restoreFocus: true });
    });
  });
}

function initializeI18n() {
  renderLanguageControls();
  bindLanguageSwitcherEvents();
  setLanguage(getPreferredLanguage());
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeI18n, { once: true });
} else {
  initializeI18n();
}
