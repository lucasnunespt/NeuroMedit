(() => {
  const themes = ["morning", "afternoon", "day", "sunset", "evening", "night", "late-night"];
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

  function applyTheme() {
    const theme = getLocalTimeTheme();
    const targets = [document.documentElement, document.body].filter(Boolean);

    targets.forEach((target) => {
      target.classList.remove(...themeClasses);
      target.classList.add(`theme-${theme}`);
    });
  }

  applyTheme();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTheme, { once: true });
  } else {
    applyTheme();
  }
})();
