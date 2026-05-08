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

function buildLanguageSwitcherMarkup() {
  return `
    <div class="language-pill" data-language-menu>
      <div class="language-options" id="languageOptions" role="menu" aria-hidden="true" data-language-options>
        <button type="button" role="menuitem" data-lang-option="pt">PT</button>
        <button type="button" role="menuitem" data-lang-option="en">EN</button>
        <button type="button" role="menuitem" data-lang-option="es">ES</button>
        <button type="button" role="menuitem" data-lang-option="it">IT</button>
        <button type="button" role="menuitem" data-lang-option="ru">RU</button>
      </div>

      <button
        class="language-trigger"
        type="button"
        aria-label="Choose language"
        aria-expanded="false"
        aria-controls="languageOptions"
        data-language-trigger
      >
        <span class="language-current" data-language-current>EN</span>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/>
          <path d="M3.6 9h16.8M3.6 15h16.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          <path d="M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/>
        </svg>
      </button>
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
