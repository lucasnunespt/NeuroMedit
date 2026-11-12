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
