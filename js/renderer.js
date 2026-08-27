/* =========================================================
   AUTH PAGE BUILDER - RENDERER & STYLE ENGINE
   File: js/renderer.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const templates = require("./templates.js");
    const utils = require("./utils.js");
    module.exports = factory(templates, utils);
  } else {
    const renderer = factory(root.Templates, root.Utils);
    root.AuthPageRenderer = renderer;
    root.renderPreview = renderer.renderPreview;
  }
})(typeof window !== "undefined" ? window : globalThis, function (Templates, Utils) {

  let otpCountdownInterval = null;
  let otpInlineCountdownInterval = null;

  /* =======================================================
     COMPUTE DYNAMIC CSS VARIABLES
  ======================================================= */
  function computeStyleVariables(config) {
    const layout = config.layout || {};
    const background = config.background || {};
    const branding = config.branding || {};
    const card = config.card || {};
    const typography = config.typography || {};
    const button = config.button || {};
    const imageSection = config.imageSection || {};
    const otpPage = config.pages?.otp || {};

    const imageWidth = Number(layout.imageWidth) || 50;

    // Background image calculation
    let bgImg = "none";
    if (background.uploadedImage) {
      bgImg = `url("${background.uploadedImage}")`;
    } else if (background.image) {
      bgImg = `url("${background.image}")`;
    } else if (background.selected) {
      bgImg = `url("${background.selected}")`;
    }

    const overlayOpacity = background.overlayEnabled !== false 
      ? ((Number(background.overlayOpacity) || 0) / 100)
      : 0;

    // Button Background
    let buttonBg = button.backgroundColor || "#2563eb";
    if (button.backgroundType === "gradient") {
      const gStart = button.gradientStart || buttonBg;
      const gEnd = button.gradientEnd || "#4f46e5";
      buttonBg = `linear-gradient(135deg, ${gStart}, ${gEnd})`;
    }

    // Card Opacity & Enabled
    const cardOpacity = (card.opacity !== undefined ? Number(card.opacity) : 100) / 100;
    const cardBgColor = card.backgroundColor || "#ffffff";
    const cardEnabled = card.enabled !== false;

    // Logo shape clipping and radius
    let logoRadius = "50%";
    let logoClip = "none";
    if (branding.logoShape === "square") {
      logoRadius = "0px";
      logoClip = "none";
    } else if (branding.logoShape === "rounded") {
      logoRadius = "14px";
      logoClip = "none";
    } else if (branding.logoShape === "circle") {
      logoRadius = "50%";
      logoClip = "circle(50% at 50% 50%)";
    } else if (branding.logoShape === "ellipse") {
      logoRadius = "50% / 35%";
      logoClip = "ellipse(50% 38% at 50% 50%)";
    }

    // OTP Dynamic Box Variables
    const otpBoxWidth = Number(otpPage.boxWidth) || (otpPage.length === 8 ? 38 : 48);
    const otpBoxHeight = Number(otpPage.boxHeight) || (otpPage.length === 8 ? 46 : 54);
    const otpBoxGap = Number(otpPage.gap) || (otpPage.length === 8 ? 6 : 10);
    const otpBoxRadius = Number(otpPage.borderRadius) || (otpPage.length === 8 ? 8 : 12);
    const otpFontSize = Number(otpPage.fontSize) || (otpPage.length === 8 ? 20 : 24);

    return `
      :root, .preview-root, .fullscreen-preview-root, .auth-preview-root {
        /* Layout */
        --auth-image-width: ${imageWidth}%;
        --auth-form-width: ${Number(layout.formWidth) || 460}px;
        --auth-content-padding: ${Number(layout.contentPadding) || 48}px;

        /* Background */
        --auth-background-image: ${bgImg};
        --auth-background-color: ${background.color || "#0f172a"};
        --auth-background-position: ${background.position || "center"};
        --auth-background-size: ${background.size || "cover"};
        --auth-background-repeat: ${background.repeat || "no-repeat"};
        --auth-overlay-color: ${background.overlayColor || "#000000"};
        --auth-overlay-opacity: ${overlayOpacity};

        /* Branding & Logo */
        --auth-logo-size: ${Number(branding.logoSize) || 64}px;
        --auth-logo-radius: ${logoRadius};
        --auth-logo-clip: ${logoClip};
        --auth-logo-bg: ${branding.logoBackgroundEnabled ? (branding.logoBackgroundColor || "#ffffff") : "transparent"};

        /* Card */
        --auth-card-enabled: ${cardEnabled ? "1" : "0"};
        --auth-card-background: ${cardEnabled ? cardBgColor : "transparent"};
        --auth-card-opacity: ${cardEnabled ? cardOpacity : 1};
        --auth-card-width: ${Number(card.width) || 460}px;
        --auth-card-radius: ${cardEnabled ? (Number(card.borderRadius) || 20) : 0}px;
        --auth-card-border-width: ${cardEnabled ? (Number(card.borderWidth) || 1) : 0}px;
        --auth-card-border-color: ${card.borderColor || "#e2e8f0"};
        --auth-card-shadow: ${cardEnabled && card.shadowEnabled ? "0 20px 45px rgba(15, 23, 42, 0.10)" : "none"};
        --auth-card-blur: ${cardEnabled && card.blurEnabled ? "18px" : "0px"};
        --auth-card-padding: ${cardEnabled ? (Number(card.padding) || 40) : 0}px;

        /* Typography */
        --auth-font-family: ${typography.fontFamily || "Inter, sans-serif"};
        --auth-title-color: ${typography.titleColor || "#0f172a"};
        --auth-title-size: ${Number(typography.titleSize) || 32}px;
        --auth-title-weight: ${typography.titleWeight || 700};
        --auth-subtitle-color: ${typography.subtitleColor || "#64748b"};
        --auth-subtitle-size: ${Number(typography.subtitleSize) || 15}px;
        --auth-body-color: ${typography.bodyColor || "#334155"};
        --auth-label-color: ${typography.labelColor || "#475569"};

        /* Button */
        --auth-button-bg: ${buttonBg};
        --auth-button-text: ${button.textColor || "#ffffff"};
        --auth-button-radius: ${Number(button.borderRadius) || 10}px;
        --auth-button-height: ${Number(button.height) || 48}px;
        --auth-button-shadow: ${button.shadow ? "0 4px 14px rgba(37, 99, 235, 0.28)" : "none"};

        /* Image Section Text */
        --auth-image-text-color: ${imageSection.textColor || "#ffffff"};

        /* OTP Box Sizing */
        --otp-box-width: ${otpBoxWidth}px;
        --otp-box-height: ${otpBoxHeight}px;
        --otp-box-gap: ${otpBoxGap}px;
        --otp-box-radius: ${otpBoxRadius}px;
        --otp-font-size: ${otpFontSize}px;
      }
    `;
  }

  /* =======================================================
     INJECT DYNAMIC STYLES
  ======================================================= */
  function injectStyles(config) {
    if (typeof document === "undefined") return;

    let styleEl = document.getElementById("authDynamicPreviewStyles");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "authDynamicPreviewStyles";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = computeStyleVariables(config);

    // Custom CSS
    let customEl = document.getElementById("authCustomCSSStyles");
    if (!customEl) {
      customEl = document.createElement("style");
      customEl.id = "authCustomCSSStyles";
      document.head.appendChild(customEl);
    }
    customEl.textContent = config.customCSS || "";
  }

  /* =======================================================
     ATTACH INTERACTIVE PREVIEW BEHAVIORS
  ======================================================= */
  function attachInteractiveBehaviors(container, config) {
    if (!container) return;

    // 1. Password toggle
    const passwordToggles = container.querySelectorAll("[data-toggle-password]");
    passwordToggles.forEach(toggle => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const wrapper = toggle.closest(".auth-input-password-wrapper");
        const input = wrapper ? wrapper.querySelector("input") : null;
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.innerHTML = isPassword ? Templates.ICONS.eyeOff : Templates.ICONS.eye;
      });
    });

    // 2. Navigation switches (e.g. from Login to Signup / Forgot / OTP)
    const navLinks = container.querySelectorAll("[data-auth-nav]");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetPage = link.dataset.authNav;
        if (targetPage && window.state && typeof window.state.setActivePage === "function") {
          window.state.setActivePage(targetPage);
        }
      });
    });

    // 3. OTP Delivery method switches
    const deliveryPills = container.querySelectorAll("[data-otp-delivery]");
    deliveryPills.forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.preventDefault();
        deliveryPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const method = pill.dataset.otpDelivery;
        if (window.state && typeof window.state.set === "function") {
          window.state.set("authentication.otp.defaultMethod", method, { notify: false });
        }
        if (Utils.showToast) {
          Utils.showToast(`Verification delivery method set to: ${method.toUpperCase()}`, "info", 2000);
        }
      });
    });

    // 4. OTP Digit Inputs Auto-Advance & Navigation
    const otpBoxes = container.querySelectorAll(".otp-digit-box");
    otpBoxes.forEach((box, idx) => {
      box.addEventListener("input", () => {
        const val = box.value.replace(/\D/g, "");
        box.value = val ? val[0] : "";
        if (box.value && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });

      box.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !box.value && idx > 0) {
          otpBoxes[idx - 1].focus();
        } else if (e.key === "ArrowLeft" && idx > 0) {
          otpBoxes[idx - 1].focus();
        } else if (e.key === "ArrowRight" && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });

      box.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        if (!pasteData) return;
        const digits = pasteData.split("");
        digits.forEach((digit, i) => {
          if (idx + i < otpBoxes.length) {
            otpBoxes[idx + i].value = digit;
          }
        });
        const nextFocus = Math.min(idx + digits.length, otpBoxes.length - 1);
        if (otpBoxes[nextFocus]) {
          otpBoxes[nextFocus].focus();
        }
      });
    });

    // 5. OTP Resend Timer (Standalone OTP Page)
    const resendBtn = container.querySelector("#otpResendButton");
    if (resendBtn) {
      if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
        otpCountdownInterval = null;
      }

      let remaining = Number(config.pages?.otp?.resendSeconds) || 30;
      const countdownSpan = resendBtn.querySelector(".otp-countdown-timer");
      resendBtn.disabled = true;

      otpCountdownInterval = setInterval(() => {
        remaining -= 1;
        if (countdownSpan) {
          countdownSpan.textContent = `(${remaining}s)`;
        }
        if (remaining <= 0) {
          clearInterval(otpCountdownInterval);
          otpCountdownInterval = null;
          resendBtn.disabled = false;
          if (countdownSpan) countdownSpan.textContent = "";
        }
      }, 1000);

      resendBtn.addEventListener("click", () => {
        if (remaining <= 0) {
          if (Utils.showToast) {
            Utils.showToast("New verification code sent!", "success");
          }
          remaining = Number(config.pages?.otp?.resendSeconds) || 30;
          resendBtn.disabled = true;
          if (countdownSpan) countdownSpan.textContent = `(${remaining}s)`;
          otpCountdownInterval = setInterval(() => {
            remaining -= 1;
            if (countdownSpan) countdownSpan.textContent = `(${remaining}s)`;
            if (remaining <= 0) {
              clearInterval(otpCountdownInterval);
              otpCountdownInterval = null;
              resendBtn.disabled = false;
              if (countdownSpan) countdownSpan.textContent = "";
            }
          }, 1000);
        }
      });
    }

    // 6. Inline OTP Resend Timer
    const inlineResendBtn = container.querySelector("#otpResendButtonInline");
    if (inlineResendBtn) {
      if (otpInlineCountdownInterval) {
        clearInterval(otpInlineCountdownInterval);
        otpInlineCountdownInterval = null;
      }

      let remainingInline = Number(config.pages?.otp?.resendSeconds) || 30;
      const countdownSpan = inlineResendBtn.querySelector(".otp-countdown-timer");
      inlineResendBtn.disabled = true;

      otpInlineCountdownInterval = setInterval(() => {
        remainingInline -= 1;
        if (countdownSpan) {
          countdownSpan.textContent = `(${remainingInline}s)`;
        }
        if (remainingInline <= 0) {
          clearInterval(otpInlineCountdownInterval);
          otpInlineCountdownInterval = null;
          inlineResendBtn.disabled = false;
          if (countdownSpan) countdownSpan.textContent = "";
        }
      }, 1000);

      inlineResendBtn.addEventListener("click", () => {
        if (remainingInline <= 0) {
          if (Utils.showToast) {
            Utils.showToast("New verification code sent!", "success");
          }
          remainingInline = Number(config.pages?.otp?.resendSeconds) || 30;
          inlineResendBtn.disabled = true;
          if (countdownSpan) countdownSpan.textContent = `(${remainingInline}s)`;
          otpInlineCountdownInterval = setInterval(() => {
            remainingInline -= 1;
            if (countdownSpan) countdownSpan.textContent = `(${remainingInline}s)`;
            if (remainingInline <= 0) {
              clearInterval(otpInlineCountdownInterval);
              otpInlineCountdownInterval = null;
              inlineResendBtn.disabled = false;
              if (countdownSpan) countdownSpan.textContent = "";
            }
          }, 1000);
        }
      });
    }

    // 7. Form Submission Simulation & Feedback
    const forms = container.querySelectorAll(".auth-main-form");
    forms.forEach(form => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const redirectUrl = config.urls?.redirectUrl || "https://customerwebsite.com/dashboard";
        if (Utils.showToast) {
          Utils.showToast(`Authentication simulated! Redirect destination: ${redirectUrl}`, "success", 4000);
        }
      });
    });
  }

  /* =======================================================
     MAIN RENDER FUNCTION (Non-Destructive Class Updates)
  ======================================================= */
  function renderPreview(targetElement, options = {}) {
    const root = typeof targetElement === "string" 
      ? (document ? document.querySelector(targetElement) : null) 
      : targetElement;

    if (!root) {
      console.warn("AuthPageRenderer: target root element not found.");
      return;
    }

    const config = options.config || (window.state ? window.state.getState() : window.config) || {};
    const pageName = options.page || config.activePage || "login";
    const device = options.device || config.previewMode || "desktop";

    // Inject CSS variables
    injectStyles(config);

    // Layout options
    const layout = config.layout || {};
    const layoutType = layout.type || "split-left-image";
    const formHPos = layout.formHorizontalAlignment || "center";
    const formVPos = layout.formVerticalAlignment || "center";

    // Update classes on target root non-destructively using classList
    const validDevices = ["desktop", "tablet", "mobile"];
    validDevices.forEach(d => {
      root.classList.toggle(`preview-device-${d}`, d === device);
    });

    // Update parent .preview-canvas device class as well
    if (root.parentElement && root.parentElement.classList.contains("preview-canvas")) {
      validDevices.forEach(d => {
        root.parentElement.classList.toggle(`device-${d}`, d === device);
      });
    }

    const allLayouts = [
      "split-left-image",
      "split-right-image",
      "centered",
      "full-background",
      "minimal",
      "card-left",
      "card-right"
    ];
    allLayouts.forEach(l => {
      root.classList.toggle(`layout-${l}`, l === layoutType);
    });

    ["left", "center", "right"].forEach(h => {
      root.classList.toggle(`form-horizontal-${h}`, h === formHPos);
    });

    ["top", "center", "bottom"].forEach(v => {
      root.classList.toggle(`form-vertical-${v}`, v === formVPos);
    });

    // Generate complete HTML (auth-preview-shell)
    const html = Templates.generateAuthShell(config, pageName);
    root.innerHTML = html;

    // Attach interactive behaviors
    attachInteractiveBehaviors(root, config);

    // Trigger completion event
    if (typeof document !== "undefined" && document.dispatchEvent) {
      document.dispatchEvent(
        new CustomEvent("auth-builder:render-complete", {
          detail: { root, config, pageName, device }
        })
      );
    }
  }

  return {
    computeStyleVariables,
    injectStyles,
    renderPreview,
    render: renderPreview
  };
});