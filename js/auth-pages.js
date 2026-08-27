/* =========================================================
   AUTH PAGE BUILDER - AUTH PAGES BRIDGE
   File: js/auth-pages.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const templates = require("./templates.js");
    const renderer = require("./renderer.js");
    module.exports = factory(templates, renderer);
  } else {
    root.AuthPage = factory(root.Templates, root.AuthPageRenderer);
  }
})(typeof window !== "undefined" ? window : globalThis, function (Templates, Renderer) {

  class AuthPage {
    constructor(container, config = {}) {
      this.container = typeof container === "string" 
        ? document.querySelector(container) 
        : container;
      this.config = config;
      this.render();
    }

    render() {
      if (this.container && Renderer && typeof Renderer.renderPreview === "function") {
        Renderer.renderPreview(this.container, {
          config: this.config,
          page: this.config.activePage || "login"
        });
      }
    }
  }

  return AuthPage;
});