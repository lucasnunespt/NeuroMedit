(() => {
  // Habilita o movimento de entrada do hero antes da pintura (evita flash).
  // Se o JS não rodar, a classe não é adicionada e nada fica escondido.
  try { document.documentElement.classList.add("nm-anim"); } catch (e) {}

  // Lista com exatamente os 10 termos do contrato CSS
  const themes = ["morning", "dawn", "afternoon", "day", "sunset", "evening", "night", "warm-night", "sleep", "late-night"];
  const themeClasses = themes.map((theme) => `theme-${theme}`);

  function getLocalTimeTheme(date = new Date()) {
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return "morning";
    }

    if (hour >= 12 && hour < 17) {
      return "afternoon";
    }

    if (hour >= 17 && hour < 20) {
      return "sunset";
    }

    if (hour >= 20 && hour < 21) {
      return "evening";
    }

    if (hour >= 21) {
      return "night";
    }

    return "late-night";
  }

  // O tema escolhido em Configurações (claro, escuro, baixo contraste) fica em localStorage.
  // Aplica-se aqui para valer em todas as páginas, mesmo nas que não carregam o painel de configurações.
  const SAVED_THEME_MAP = { light: "day", dark: "night", "low-contrast": "evening" };
  function getSavedTheme() {
    try {
      const saved = JSON.parse(localStorage.getItem("neuromedit-settings") || "{}") || {};
      const value = saved.visualTheme ?? saved["light-mode"];
      return SAVED_THEME_MAP[value] ? { theme: SAVED_THEME_MAP[value], setting: value } : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme() {
    // Se o elemento <html> contiver o atributo data-force-theme, aplica e retorna imediatamente
    const forcedTheme = document.documentElement.getAttribute("data-force-theme");
    if (forcedTheme) {
      const targets = [document.documentElement, document.body].filter(Boolean);
      targets.forEach((target) => {
        target.classList.remove(...themeClasses);
        target.classList.add(`theme-${forcedTheme}`);
      });
      return;
    }

    const saved = getSavedTheme();
    if (saved) {
      const targets = [document.documentElement, document.body].filter(Boolean);
      targets.forEach((target) => {
        target.classList.remove(...themeClasses);
        target.classList.add(`theme-${saved.theme}`);
        target.dataset.theme = saved.theme;
        target.dataset.settingsTheme = saved.setting;
      });
      return;
    }

    const theme = getLocalTimeTheme();
    const targets = [document.documentElement, document.body].filter(Boolean);

    targets.forEach((target) => {
      target.classList.remove(...themeClasses);
      target.classList.add(`theme-${theme}`);
    });
  }

  window.NeuroMeditTheme = {
    apply: applyTheme,
    getLocalTimeTheme,
    themes: [...themes],
  };

  applyTheme();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTheme, { once: true });
  } else {
    applyTheme();
  }
})();
