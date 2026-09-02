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

    captureFormState(container) {
      if (!container) return {};
      const values = {};
      const inputs = container.querySelectorAll("input, select, textarea");
      inputs.forEach(input => {
        const val = (input.type === "checkbox" || input.type === "radio") ? input.checked : (input.value || input.getAttribute("value") || "");
        if (val || val === false) {
          if (input.id) values[input.id] = val;
          if (input.name) values[input.name] = val;
        }
      });
      return values;
    }

    restoreFormState(container, values) {
      if (!container || !values) return;
      Object.keys(values).forEach(key => {
        const val = values[key];
        if (val === undefined || val === null || val === "") return;
        const input = container.querySelector(`#${key}`) || container.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = Boolean(val);
            if (val) {
              input.setAttribute("checked", "checked");
            } else {
              input.removeAttribute("checked");
            }
          } else {
            input.value = val;
            input.setAttribute("value", val);
          }
        }
      });
    }

    open() {
      if (!this.modal || !this.root) {
        this.modal = document.getElementById("fullscreenPreview");
        this.root = document.getElementById("fullscreenPreviewRoot");
      }
      if (!this.modal || !this.root) return;

      console.log("[Fullscreen] Rendering from canonical state");

      // Capture live typed form state from preview canvas
      const previewCanvas = document.getElementById("previewCanvas") || document.getElementById("authPreviewContainer");
      const capturedValues = this.captureFormState(previewCanvas);
      console.log("[Fullscreen] Captured live values:", JSON.stringify(capturedValues));

      this.isOpen = true;
      this.modal.hidden = false;
      this.modal.classList.add("auth-fullscreen-open");
      document.body.style.overflow = "hidden";

      // Render current canonical state to fullscreen container
      const state = window.state ? window.state.getState() : (window.config || {});
      const activePage = (window.state && typeof window.state.get === "function") ? window.state.get("activePage") : (state.activePage || "login");
      if (Renderer && typeof Renderer.renderPreview === "function") {
        Renderer.renderPreview(this.root, {
          config: state,
          page: activePage,
          device: state.previewMode || "desktop"
        });
      }

      // Restore captured live typed input values into fullscreen form
      this.restoreFormState(this.root, capturedValues);
      console.log("[Fullscreen] Form state preserved");

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

      // Capture form values from fullscreen before hiding
      const fullscreenValues = this.captureFormState(this.root);

      this.isOpen = false;
      if (this.modal) {
        this.modal.hidden = true;
        this.modal.classList.remove("auth-fullscreen-open");
      }
      document.body.style.overflow = "";

      // Restore form values back into normal preview canvas
      const previewCanvas = document.getElementById("previewCanvas") || document.getElementById("authPreviewContainer");
      this.restoreFormState(previewCanvas, fullscreenValues);
      console.log("[Fullscreen] Form state preserved");

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