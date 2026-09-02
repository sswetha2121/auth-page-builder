/* =========================================================
   AUTH PAGE - SOURCE APPLICATION INTEGRATION SCRIPT
   Place this script in your main application: https://customerwebsite.com
========================================================= */

(function () {
  const AUTH_URL = "./auth/index.html"; // Adjust to where you host index.html
  const REDIRECT_URL = "/dashboard";

  function navigateToAuth(mode = "login") {
    const target = `${AUTH_URL}?mode=${encodeURIComponent(mode)}&redirect=${encodeURIComponent(REDIRECT_URL)}`;
    window.location.assign(target);
  }

  // Expose globally
  window.AuthBridge = {
    login: () => navigateToAuth("login"),
    signup: () => navigateToAuth("signup"),
    forgotPassword: () => navigateToAuth("forgotPassword"),
    otp: () => navigateToAuth("otp"),
    redirectUrl: REDIRECT_URL
  };

  document.addEventListener("DOMContentLoaded", () => {
    const loginButtons = document.querySelectorAll("[data-auth-login-trigger]");
    loginButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        navigateToAuth("login");
      });
    });
  });
})();
