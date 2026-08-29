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
      this.bindCategoryNav();
      this.bindPasswordPolicyMeter();
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
       BIND CATEGORY NAVIGATION
    ======================================================= */
    bindCategoryNav() {
      const catButtons = document.querySelectorAll("[data-inspector-category]");
      if (!catButtons || catButtons.length === 0) return;

      catButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const targetCategory = btn.dataset ? btn.dataset.inspectorCategory : btn.getAttribute("data-inspector-category");
          if (!targetCategory) return;

          catButtons.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");

          // 1. Unhide outer category section groups
          const groups = document.querySelectorAll(".category-section-group[data-category]");
          let firstGroupMatch = null;

          groups.forEach(grp => {
            const cat = grp.dataset ? grp.dataset.category : grp.getAttribute("data-category");
            if (targetCategory === "all" || cat === targetCategory) {
              grp.style.display = "block";
              grp.classList.remove("cat-hidden");
              if (!firstGroupMatch) firstGroupMatch = grp;
            } else {
              grp.style.display = "none";
              grp.classList.add("cat-hidden");
            }
          });

          // 2. Unhide individual customization sections
          const sections = document.querySelectorAll(".customization-section[data-category]");
          sections.forEach(sec => {
            const secCategory = sec.dataset ? sec.dataset.category : sec.getAttribute("data-category");
            if (targetCategory === "all" || secCategory === targetCategory) {
              sec.style.display = "";
              sec.classList.remove("cat-hidden");
            } else {
              sec.style.display = "none";
              sec.classList.add("cat-hidden");
            }
          });

          // 3. Ensure first section inside target group is open
          if (firstGroupMatch) {
            const firstSec = firstGroupMatch.querySelector(".customization-section");
            if (firstSec) {
              firstSec.classList.add("open");
              const header = firstSec.querySelector("[data-accordion-trigger]");
              if (header) header.setAttribute("aria-expanded", "true");
            }
          }
        });
      });
    }

    /* =======================================================
       BIND PASSWORD POLICY DYNAMIC METER & CHECKLIST
    ======================================================= */
    bindPasswordPolicyMeter() {
      const updateChecklist = () => {
        const minLenInput = document.querySelector('[data-config-path="passwordPolicy.minLength"]');
        const reqUpperInput = document.querySelector('[data-config-path="passwordPolicy.requireUppercase"]');
        const reqLowerInput = document.querySelector('[data-config-path="passwordPolicy.requireLowercase"]');
        const reqNumInput = document.querySelector('[data-config-path="passwordPolicy.requireNumber"]');
        const reqSpecialInput = document.querySelector('[data-config-path="passwordPolicy.requireSpecialChar"]');
        const allowedSpecialInput = document.querySelector('[data-config-path="passwordPolicy.allowedSpecialChars"]');
        const strengthSelect = document.querySelector('[data-config-path="passwordPolicy.strengthRequirement"]');

        const minLen = minLenInput ? minLenInput.value : 8;
        const minLenEl = document.getElementById("reqMinLen");
        if (minLenEl) minLenEl.textContent = minLen;

        const reqUpperItem = document.getElementById("reqUpperItem");
        if (reqUpperItem) reqUpperItem.style.display = (reqUpperInput && !reqUpperInput.checked) ? "none" : "";

        const reqLowerItem = document.getElementById("reqLowerItem");
        if (reqLowerItem) reqLowerItem.style.display = (reqLowerInput && !reqLowerInput.checked) ? "none" : "";

        const reqNumItem = document.getElementById("reqNumberItem");
        if (reqNumItem) reqNumItem.style.display = (reqNumInput && !reqNumInput.checked) ? "none" : "";

        const reqSpecialItem = document.getElementById("reqSpecialItem");
        if (reqSpecialItem) reqSpecialItem.style.display = (reqSpecialInput && !reqSpecialInput.checked) ? "none" : "";

        const reqSpecialCharsEl = document.getElementById("reqSpecialChars");
        if (reqSpecialCharsEl && allowedSpecialInput) {
          const chars = allowedSpecialInput.value || "!@#$%";
          reqSpecialCharsEl.textContent = chars.length > 8 ? chars.slice(0, 8) + "..." : chars;
        }

        // Update strength meter badge & bar
        const strength = strengthSelect ? strengthSelect.value : "medium";
        const badge = document.getElementById("inspectorStrengthBadge");
        const bar = document.getElementById("inspectorStrengthBar");

        if (badge) {
          badge.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
          badge.className = `strength-pill strength-pill-${strength}`;
        }
        if (bar) {
          bar.className = `strength-bar-segment active lvl-${strength}`;
          bar.style.width = strength === "weak" ? "33%" : (strength === "strong" ? "100%" : "66%");
        }
      };

      const policyInputs = document.querySelectorAll('[data-config-path^="passwordPolicy"]');
      policyInputs.forEach(input => {
        input.addEventListener("input", updateChecklist);
        input.addEventListener("change", updateChecklist);
      });

      updateChecklist();
    }


    /* =======================================================
       BIND ALL [data-config-path] INPUTS
    ======================================================= */
    bindInputs() {
      const inputs = document.querySelectorAll("[data-config-path]");
      inputs.forEach(input => {
        const path = input.dataset.configPath;
        if (!path) return;

        const eventType = (input.type === "range" || input.type === "color" || input.type === "text" || input.type === "url" || input.type === "number" || input.tagName === "TEXTAREA") 
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

          // Live validation for URL fields
          if (input.type === "url" && value) {
            const isValid = Utils.isValidUrl(value);
            input.classList.toggle("input-invalid", !isValid);
          } else if (input.type === "url") {
            input.classList.remove("input-invalid");
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
          bgButtons.forEach(b => b.classList.remove("active", "selected"));
          btn.classList.add("active", "selected");
          const bgPath = btn.dataset.background;
          if (window.state && typeof window.state.updateConfig === "function") {
            if (bgPath === "none") {
              window.state.updateConfig({
                background: {
                  type: "color",
                  selected: "none",
                  image: "",
                  uploadedImage: ""
                }
              });
            } else {
              window.state.updateConfig({
                background: {
                  type: "default",
                  selected: bgPath,
                  image: bgPath,
                  uploadedImage: ""
                }
              });
            }
          } else if (window.state && typeof window.state.set === "function") {
            if (bgPath === "none") {
              window.state.set("background.type", "color", { notify: false });
              window.state.set("background.selected", "none", { notify: false });
              window.state.set("background.image", "", { notify: false });
              window.state.set("background.uploadedImage", "", { notify: true });
            } else {
              window.state.set("background.type", "default", { notify: false });
              window.state.set("background.selected", bgPath, { notify: false });
              window.state.set("background.image", bgPath, { notify: false });
              window.state.set("background.uploadedImage", "", { notify: true });
            }
          }
        });
      });

      // Default Logos
      const logoButtons = document.querySelectorAll("[data-logo]");
      logoButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          logoButtons.forEach(b => b.classList.remove("active", "selected"));
          btn.classList.add("active", "selected");
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
       BIND FILE UPLOADS (BACKGROUND & LOGO WITH VALIDATION)
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

          // Validate file size (max 15MB for high-resolution backgrounds)
          const maxBytes = 15 * 1024 * 1024;
          if (file.size > maxBytes) {
            if (Utils.showToast) {
              Utils.showToast("File is too large. Maximum supported upload size is 15MB.", "error");
            }
            input.value = "";
            return;
          }

          // Validate file type
          const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
          const fileExt = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
          if (file.type && !validTypes.includes(file.type) && !["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(fileExt)) {
            if (Utils.showToast) {
              Utils.showToast("Unsupported file format. Please upload JPG, PNG, WebP, SVG, or GIF.", "error");
            }
            input.value = "";
            return;
          }

          try {
            const dataUrl = await Utils.fileToDataURL(file);

            if (fileNameEl) {
              fileNameEl.textContent = file.name;
            }
            if (previewEl) {
              previewEl.src = dataUrl;
              previewEl.hidden = false;
            }

            const metadata = {
              originalName: file.name,
              extension: fileExt || "png",
              mimeType: file.type || "image/png",
              size: file.size
            };

            if (window.state && typeof window.state.setUploadedAsset === "function") {
              if (type === "background") {
                document.querySelectorAll("[data-background]").forEach(b => b.classList.remove("active", "selected"));
                window.state.setUploadedAsset("backgrounds", file.name, dataUrl, metadata);
                window.state.updateConfig({
                  background: {
                    type: "uploaded",
                    uploadedImage: dataUrl,
                    image: dataUrl,
                    selected: ""
                  }
                });
              } else if (type === "logo") {
                document.querySelectorAll("[data-logo]").forEach(b => b.classList.remove("active", "selected"));
                window.state.setUploadedAsset("logos", file.name, dataUrl, metadata);
                window.state.updateConfig({
                  branding: {
                    uploadedLogo: dataUrl,
                    logo: dataUrl,
                    selectedLogo: ""
                  }
                });
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
          document.querySelectorAll('input[type="file"]').forEach(fi => { fi.value = ""; });
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
        // 1. Sync inputs with [data-config-path]
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

        // 2. Update range badges
        const rangeInputs = document.querySelectorAll('input[type="range"][data-value-target]');
        rangeInputs.forEach(range => {
          const targetEl = document.querySelector(range.dataset.valueTarget);
          if (targetEl) {
            const suffix = range.dataset.valueSuffix || "";
            targetEl.textContent = `${range.value}${suffix}`;
          }
        });

        // 3. Sync active page tab
        const activePage = state.activePage || "login";
        document.querySelectorAll("[data-builder-page]").forEach(tab => {
          tab.classList.toggle("active", tab.dataset.builderPage === activePage);
        });

        // 4. Sync page specific section
        document.querySelectorAll("[data-control-page]").forEach(ctrl => {
          ctrl.hidden = ctrl.dataset.controlPage !== activePage;
        });

        // 5. Sync default asset buttons active state
        const isUploadedBg = Boolean(state.background?.uploadedImage);
        const isColorOnly = state.background?.type === "color" || state.background?.selected === "none" || (!state.background?.image && !state.background?.uploadedImage);
        const currentBg = isUploadedBg ? "" : (isColorOnly ? "none" : (state.background?.selected || state.background?.image || ""));
        document.querySelectorAll("[data-background]").forEach(btn => {
          const btnBg = btn.dataset.background;
          const match = (btnBg === currentBg) || (btnBg === "none" && isColorOnly && !isUploadedBg);
          btn.classList.toggle("active", match);
          btn.classList.toggle("selected", match);
        });

        // Sync background upload preview
        const bgUploadPreview = document.getElementById("backgroundUploadPreview");
        const bgFileName = document.getElementById("backgroundFileName");
        if (state.background?.uploadedImage) {
          if (bgUploadPreview) {
            bgUploadPreview.src = state.background.uploadedImage;
            bgUploadPreview.hidden = false;
          }
        } else {
          if (bgUploadPreview) {
            bgUploadPreview.src = "";
            bgUploadPreview.hidden = true;
          }
          if (bgFileName) {
            bgFileName.textContent = "";
          }
        }

        const currentLogo = state.branding?.uploadedLogo ? "" : (state.branding?.selectedLogo || state.branding?.logo || "");
        document.querySelectorAll("[data-logo]").forEach(btn => {
          const match = btn.dataset.logo === currentLogo;
          btn.classList.toggle("active", match);
          btn.classList.toggle("selected", match);
        });

        // Sync logo upload preview
        const logoUploadPreview = document.getElementById("logoUploadPreview");
        const logoFileName = document.getElementById("logoFileName");
        if (state.branding?.uploadedLogo) {
          if (logoUploadPreview) {
            logoUploadPreview.src = state.branding.uploadedLogo;
            logoUploadPreview.hidden = false;
          }
        } else {
          if (logoUploadPreview) {
            logoUploadPreview.src = "";
            logoUploadPreview.hidden = true;
          }
          if (logoFileName) {
            logoFileName.textContent = "";
          }
        }

        // 6. Update Integration Snippet text
        const snippetEl = document.getElementById("integrationSnippetText");
        if (snippetEl) {
          const siteUrl = state.urls?.landingPageUrl || "https://customerwebsite.com";
          snippetEl.value = `<!-- Embed on your landing page (${siteUrl}) -->\n<a href="./auth/index.html" class="auth-login-btn">Sign In</a>`;
        }

        // 7. Update toolbar title
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