(() => {
  const repeatLink = document.querySelector("[data-repeat-session]");
  if (!repeatLink) return;

  try {
    const lastSession = window.sessionStorage.getItem("neuromedit.lastSession");
    if (lastSession && /^[a-z-]+\.html$/.test(lastSession)) {
      repeatLink.href = lastSession;
    }
  } catch (error) {
    // Keep the default repeat destination if session storage is unavailable.
  }
})();
