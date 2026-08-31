/* =========================================================
   AUTHENTICATION PACKAGE - CONFIGURATION LOADER
   File: js/config.js
========================================================= */

(function (root) {
  root.AUTH_CONFIG = root.AUTH_CONFIG || {
    apiBaseUrl: "http://localhost:8000/api",
    redirect: {
      enabled: true,
      redirectUrl: "/dashboard",
      redirectType: "url",
      openInNewTab: false,
      showSuccessMessage: true,
      successMessage: "Authentication completed successfully.",
      delay: 0
    },
    urls: {
      landingPageUrl: "https://customerwebsite.com",
      redirectUrl: "/dashboard"
    },
    branding: {
      brandName: "Your Brand",
      logo: "./assets/logos/brand-shield.svg"
    },
    authentication: {},
    passwordPolicy: {}
  };
})(typeof window !== "undefined" ? window : this);
