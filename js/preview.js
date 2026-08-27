/* =========================================================
   AUTH PAGE BUILDER - PREVIEW MANAGER
   File: js/preview.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const renderer = require("./renderer.js");
    module.exports = factory(renderer);
  } else {
    root.PreviewManager = factory(root.AuthPageRenderer);
  }
})(typeof window !== "undefined" ? window : globalThis, function (Renderer) {

  class PreviewManager {
    constructor() {
      this.previewRoot = null;
      this.currentDevice = "desktop";
      this.init();
    }

    init() {
      if (typeof document === "undefined") return;

      this.previewRoot = document.getElementById("previewRoot");
      this.bindDeviceButtons();

      // Subscribe to central state changes
      if (window.state && typeof window.state.subscribe === "function") {
        window.state.subscribe((state, path, value) => {
          this.render();
        });
      }

      // Initial render
      this.render();
    }

    /* =======================================================
       DEVICE SWITCHER BUTTONS (Desktop / Tablet / Mobile)
    ======================================================= */
    bindDeviceButtons() {
      const buttons = document.querySelectorAll("[data-preview-device]");
      buttons.forEach(button => {
        button.addEventListener("click", () => {
          const device = button.dataset.previewDevice;
          if (!device) return;

          this.setDevice(device);
        });
      });
    }

    setDevice(device) {
      const validDevices = ["desktop", "tablet", "mobile"];
      if (!validDevices.includes(device)) device = "desktop";

      this.currentDevice = device;

      // Update button active state
      document.querySelectorAll("[data-preview-device]").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.previewDevice === device);
      });

      // Update state
      if (window.state && typeof window.state.setPreviewMode === "function") {
        window.state.setPreviewMode(device);
      } else {
        this.render();
      }
    }

    /* =======================================================
       RENDER PREVIEW
    ======================================================= */
    render() {
      if (!this.previewRoot) {
        this.previewRoot = document.getElementById("previewRoot");
      }
      if (!this.previewRoot) return;

      const state = window.state ? window.state.getState() : (window.config || {});
      const device = state.previewMode || this.currentDevice || "desktop";

      // Render to main preview canvas
      if (Renderer && typeof Renderer.renderPreview === "function") {
        Renderer.renderPreview(this.previewRoot, {
          config: state,
          page: state.activePage || "login",
          device: device
        });

        // Also render to fullscreen preview if open
        const fullscreenModal = document.getElementById("fullscreenPreview");
        const fullscreenRoot = document.getElementById("fullscreenPreviewRoot");
        if (fullscreenModal && !fullscreenModal.hidden && fullscreenRoot) {
          Renderer.renderPreview(fullscreenRoot, {
            config: state,
            page: state.activePage || "login",
            device: device
          });
        }
      }
    }
  }

  return PreviewManager;
});