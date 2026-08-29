/* =========================================================
   AUTHENTICATION PACKAGE - CONFIGURATION LOADER
   File: js/config.js
========================================================= */

(function (root) {
  root.AUTH_CONFIG = root.AUTH_CONFIG || {
    apiBaseUrl: "http://localhost:8000/api",
    urls: {
      landingPageUrl: "https://customerwebsite.com",
      redirectUrl: "https://customerwebsite.com/dashboard"
    },
    branding: {
      brandName: "Your Brand",
      logo: "./assets/logos/brand-shield.svg"
    },
    authentication: {},
    passwordPolicy: {}
  };
})(typeof window !== "undefined" ? window : this);
