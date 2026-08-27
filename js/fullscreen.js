/* =========================================================
   AUTH PAGE BUILDER - FULLSCREEN PREVIEW
   File: js/fullscreen.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const renderer = require("./renderer.js");
    module.exports = factory(renderer);
  } else {
    root.FullscreenManager = factory(root.AuthPageRenderer);
  }
})(typeof window !== "undefined" ? window : globalThis, function (Renderer) {

  class FullscreenManager {
    constructor() {
      this.modal = null;
      this.root = null;
      this.isOpen = false;
      this.init();
    }

    init() {
      if (typeof document === "undefined") return;

      this.modal = document.getElementById("fullscreenPreview");
      this.root = document.getElementById("fullscreenPreviewRoot");

      this.bindTriggers();
      this.bindCloseButtons();
      this.bindKeyboard();
      this.bindFullscreenChange();
    }

    bindTriggers() {
      const openButtons = document.querySelectorAll('[data-action="fullscreen-preview"]');
      openButtons.forEach(btn => {
        btn.addEventListener("click", () => this.open());
      });
    }

    bindCloseButtons() {
      const closeButtons = document.querySelectorAll('[data-action="close-fullscreen-preview"]');
      closeButtons.forEach(btn => {
        btn.addEventListener("click", () => this.close());
      });

      if (this.modal) {
        this.modal.addEventListener("click", (e) => {
          if (e.target === this.modal) {
            this.close();
          }
        });
      }
    }

    bindKeyboard() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }

    bindFullscreenChange() {
      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement && this.isOpen) {
          this.close(false); // don't call exitFullscreen again
        }
      });
    }

    open() {
      if (!this.modal || !this.root) {
        this.modal = document.getElementById("fullscreenPreview");
        this.root = document.getElementById("fullscreenPreviewRoot");
      }
      if (!this.modal || !this.root) return;

      this.isOpen = true;
      this.modal.hidden = false;
      this.modal.classList.add("auth-fullscreen-open");
      document.body.style.overflow = "hidden";

      // Render current state to fullscreen container
      const state = window.state ? window.state.getState() : (window.config || {});
      if (Renderer && typeof Renderer.renderPreview === "function") {
        Renderer.renderPreview(this.root, {
          config: state,
          page: state.activePage || "login",
          device: state.previewMode || "desktop"
        });
      }

      // Try browser Fullscreen API (gracefully fallback to fixed CSS modal if unavailable)
      if (this.modal.requestFullscreen && typeof this.modal.requestFullscreen === "function") {
        this.modal.requestFullscreen().catch(() => {
          // Fallback handled by CSS fixed overlay
        });
      }

      if (window.state && typeof window.state.setFullscreen === "function") {
        window.state.setFullscreen(true);
      }
    }

    close(shouldExitNative = true) {
      if (!this.isOpen && (!this.modal || this.modal.hidden)) return;

      this.isOpen = false;
      if (this.modal) {
        this.modal.hidden = true;
        this.modal.classList.remove("auth-fullscreen-open");
      }
      document.body.style.overflow = "";

      if (shouldExitNative && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      if (window.state && typeof window.state.setFullscreen === "function") {
        window.state.setFullscreen(false);
      }
    }
  }

  return FullscreenManager;
});