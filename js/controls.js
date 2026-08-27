/* =========================================================
   AUTH PAGE BUILDER - CONTROLS ENGINE
   File: js/controls.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const utils = require("./utils.js");
    module.exports = factory(utils);
  } else {
    root.ControlsManager = factory(root.Utils || {});
  }
})(typeof window !== "undefined" ? window : globalThis, function (Utils) {

  class ControlsManager {
    constructor() {
      this.isUpdatingFromState = false;
      this.init();
    }

    init() {
      if (typeof document === "undefined") return;
      this.bindInputs();
      this.bindRangeDisplays();
      this.bindAssetPickers();
      this.bindFileUploads();
      this.bindPageTabs();
      this.bindAccordions();
      this.bindResetButton();

      // Listen for state changes to sync controls
      if (window.state && typeof window.state.subscribe === "function") {
        window.state.subscribe((state, path, value) => {
          if (!this.isUpdatingFromState) {
            this.syncControls(state);
          }
        });
      }
    }

    /* =======================================================
       BIND ALL [data-config-path] INPUTS
    ======================================================= */
    bindInputs() {
      const inputs = document.querySelectorAll("[data-config-path]");
      inputs.forEach(input => {
        const path = input.dataset.configPath;
        if (!path) return;

        const eventType = (input.type === "range" || input.type === "text" || input.type === "url" || input.type === "number" || input.tagName === "TEXTAREA") 
          ? "input" 
          : "change";

        input.addEventListener(eventType, () => {
          if (this.isUpdatingFromState) return;

          let value;
          if (input.type === "checkbox") {
            value = input.checked;
          } else if (input.type === "number" || input.type === "range") {
            value = Number(input.value);
            if (Number.isNaN(value)) value = 0;
          } else {
            value = input.value;
          }

          if (window.state && typeof window.state.set === "function") {
            window.state.set(path, value);
          }
        });

        if (eventType === "input") {
          input.addEventListener("change", () => {
            if (this.isUpdatingFromState) return;
            let value = (input.type === "number" || input.type === "range") ? Number(input.value) : input.value;
            if (window.state && typeof window.state.set === "function") {
              window.state.set(path, value);
            }
          });
        }
      });
    }

    /* =======================================================
       BIND RANGE DISPLAY BADGES
    ======================================================= */
    bindRangeDisplays() {
      const rangeInputs = document.querySelectorAll('input[type="range"][data-value-target]');
      rangeInputs.forEach(range => {
        const targetSelector = range.dataset.valueTarget;
        const suffix = range.dataset.valueSuffix || "";
        const targetEl = document.querySelector(targetSelector);
        if (!targetEl) return;

        const updateBadge = () => {
          targetEl.textContent = `${range.value}${suffix}`;
        };

        range.addEventListener("input", updateBadge);
        updateBadge();
      });
    }

    /* =======================================================
       BIND DEFAULT ASSET PICKERS (BACKGROUND & LOGO)
    ======================================================= */
    bindAssetPickers() {
      // Default Backgrounds
      const bgButtons = document.querySelectorAll("[data-background]");
      bgButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          bgButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const bgPath = btn.dataset.background;
          if (window.state && typeof window.state.set === "function") {
            window.state.set("background.selected", bgPath, { notify: false });
            window.state.set("background.image", bgPath, { notify: false });
            window.state.set("background.uploadedImage", "", { notify: true });
          }
        });
      });

      // Default Logos
      const logoButtons = document.querySelectorAll("[data-logo]");
      logoButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          logoButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const logoPath = btn.dataset.logo;
          if (window.state && typeof window.state.set === "function") {
            window.state.set("branding.selectedLogo", logoPath, { notify: false });
            window.state.set("branding.logo", logoPath, { notify: false });
            window.state.set("branding.uploadedLogo", "", { notify: true });
          }
        });
      });
    }

    /* =======================================================
       BIND FILE UPLOADS (BACKGROUND & LOGO)
    ======================================================= */
    bindFileUploads() {
      const fileInputs = document.querySelectorAll('input[type="file"][data-upload-type]');
      fileInputs.forEach(input => {
        const type = input.dataset.uploadType; // 'background' or 'logo'
        const previewSelector = input.dataset.uploadPreview;
        const fileNameSelector = input.dataset.fileNameTarget;

        const previewEl = previewSelector ? document.querySelector(previewSelector) : null;
        const fileNameEl = fileNameSelector ? document.querySelector(fileNameSelector) : null;

        input.addEventListener("change", async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          try {
            const dataUrl = await Utils.fileToDataURL(file);

            if (fileNameEl) {
              fileNameEl.textContent = file.name;
            }
            if (previewEl) {
              previewEl.src = dataUrl;
              previewEl.hidden = false;
            }

            if (window.state && typeof window.state.set === "function") {
              if (type === "background") {
                // Clear active states on default buttons
                document.querySelectorAll("[data-background]").forEach(b => b.classList.remove("active"));
                window.state.setUploadedAsset("backgrounds", file.name, dataUrl);
                window.state.set("background.uploadedImage", dataUrl, { notify: false });
                window.state.set("background.image", dataUrl, { notify: true });
              } else if (type === "logo") {
                // Clear active states on default buttons
                document.querySelectorAll("[data-logo]").forEach(b => b.classList.remove("active"));
                window.state.setUploadedAsset("logos", file.name, dataUrl);
                window.state.set("branding.uploadedLogo", dataUrl, { notify: false });
                window.state.set("branding.logo", dataUrl, { notify: true });
              }
            }

            if (Utils.showToast) {
              Utils.showToast(`${type === "logo" ? "Logo" : "Background"} uploaded successfully!`, "success");
            }
          } catch (err) {
            console.error("Upload error:", err);
            if (Utils.showToast) {
              Utils.showToast("Failed to read image file.", "error");
            }
          }
        });
      });
    }

    /* =======================================================
       BIND SIDEBAR PAGE TABS
    ======================================================= */
    bindPageTabs() {
      const tabs = document.querySelectorAll("[data-builder-page]");
      tabs.forEach(tab => {
        tab.addEventListener("click", () => {
          const page = tab.dataset.builderPage;
          if (!page) return;

          tabs.forEach(t => t.classList.remove("active"));
          tab.classList.add("active");

          // Update page title in toolbar
          const titleEl = document.getElementById("previewPageTitle");
          if (titleEl) {
            const names = {
              login: "Login Page",
              signup: "Sign Up Page",
              forgotPassword: "Forgot Password Page",
              otp: "OTP Verification Page"
            };
            titleEl.textContent = names[page] || "Authentication Page";
          }

          // Show corresponding page-specific controls in "Page Content" accordion
          const pageControls = document.querySelectorAll("[data-control-page]");
          pageControls.forEach(ctrl => {
            if (ctrl.dataset.controlPage === page) {
              ctrl.hidden = false;
            } else {
              ctrl.hidden = true;
            }
          });

          if (window.state && typeof window.state.setActivePage === "function") {
            window.state.setActivePage(page);
          }
        });
      });
    }

    /* =======================================================
       BIND ACCORDIONS
    ======================================================= */
    bindAccordions() {
      const headers = document.querySelectorAll("[data-accordion-trigger]");
      headers.forEach(header => {
        header.addEventListener("click", () => {
          const section = header.closest(".customization-section");
          if (!section) return;

          const isCurrentlyOpen = section.classList.contains("open");
          section.classList.toggle("open", !isCurrentlyOpen);
          header.setAttribute("aria-expanded", isCurrentlyOpen ? "false" : "true");
        });
      });
    }

    /* =======================================================
       BIND RESET BUTTON
    ======================================================= */
    bindResetButton() {
      const resetBtn = document.getElementById("resetConfigurationButton");
      if (!resetBtn) return;

      resetBtn.addEventListener("click", () => {
        if (window.state && typeof window.state.reset === "function") {
          const newState = window.state.reset();
          this.syncControls(newState);
          if (Utils.showToast) {
            Utils.showToast("All customizations have been reset to defaults.", "info");
          }
        }
      });
    }

    /* =======================================================
       SYNCHRONIZE ALL FORM CONTROLS WITH CURRENT STATE
    ======================================================= */
    syncControls(state) {
      if (!state) return;
      this.isUpdatingFromState = true;

      try {
        // Sync inputs with [data-config-path]
        const inputs = document.querySelectorAll("[data-config-path]");
        inputs.forEach(input => {
          const path = input.dataset.configPath;
          if (!path) return;

          const val = Utils.deepGet(state, path);
          if (val === undefined || val === null) return;

          if (input.type === "checkbox") {
            input.checked = Boolean(val);
          } else {
            input.value = String(val);
          }
        });

        // Update range badges
        const rangeInputs = document.querySelectorAll('input[type="range"][data-value-target]');
        rangeInputs.forEach(range => {
          const targetEl = document.querySelector(range.dataset.valueTarget);
          if (targetEl) {
            const suffix = range.dataset.valueSuffix || "";
            targetEl.textContent = `${range.value}${suffix}`;
          }
        });

        // Sync active page tab
        const activePage = state.activePage || "login";
        document.querySelectorAll("[data-builder-page]").forEach(tab => {
          tab.classList.toggle("active", tab.dataset.builderPage === activePage);
        });

        // Sync page specific section
        document.querySelectorAll("[data-control-page]").forEach(ctrl => {
          ctrl.hidden = ctrl.dataset.controlPage !== activePage;
        });

        // Update toolbar title
        const titleEl = document.getElementById("previewPageTitle");
        if (titleEl) {
          const names = {
            login: "Login Page",
            signup: "Sign Up Page",
            forgotPassword: "Forgot Password Page",
            otp: "OTP Verification Page"
          };
          titleEl.textContent = names[activePage] || "Authentication Page";
        }
      } catch (err) {
        console.error("syncControls error:", err);
      } finally {
        this.isUpdatingFromState = false;
      }
    }
  }

  return ControlsManager;
});