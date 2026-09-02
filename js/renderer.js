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
     CANONICAL BACKGROUND RESOLVER
  ======================================================= */
  function resolveBackground(config) {
    const background = (config && config.background) ? config.background : {};
    const type = background.type || "default";

    let resolvedType = "image";
    let source = null;
    let color = null;

    switch (type) {
      case "uploaded":
      case "upload":
      case "custom": {
        resolvedType = "image";
        source = background.uploadedImage || background.image || "";
        break;
      }
      case "default":
      case "image": {
        resolvedType = "image";
        source = background.selected || background.image || background.uploadedImage || "assets/backgrounds/background-1.svg";
        break;
      }
      case "color": {
        resolvedType = "color";
        color = background.color || "#0f172a";
        break;
      }
      case "gradient": {
        resolvedType = "gradient";
        const gStart = background.gradientStart || background.color || "#0f172a";
        const gEnd = background.gradientEnd || "#1e293b";
        color = `linear-gradient(135deg, ${gStart}, ${gEnd})`;
        break;
      }
      case "none": {
        resolvedType = "none";
        color = "transparent";
        break;
      }
      default: {
        if (background.uploadedImage) {
          resolvedType = "image";
          source = background.uploadedImage;
        } else if (background.selected && background.selected !== "none") {
          resolvedType = "image";
          source = background.selected;
        } else if (background.image && background.image !== "none") {
          resolvedType = "image";
          source = background.image;
        } else {
          resolvedType = "color";
          color = background.color || "#0f172a";
        }
        break;
      }
    }

    const overlayOpacity = background.overlayEnabled !== false 
      ? ((Number(background.overlayOpacity) || 0) / 100)
      : 0;

    return {
      type: resolvedType,
      source: source,
      color: color,
      position: background.position || `${background.horizontalPosition || "center"} ${background.verticalPosition || "center"}`,
      size: background.size || "cover",
      repeat: background.repeat || "no-repeat",
      overlayColor: background.overlayColor || "#000000",
      overlayOpacity: overlayOpacity
    };
  }

  /* =======================================================
     COMPUTE DYNAMIC CSS VARIABLES
  ======================================================= */
  function computeStyleVariables(config, options = {}) {
    const layout = config.layout || {};
    const background = config.background || {};
    const branding = config.branding || {};
    const card = config.card || {};
    const typography = config.typography || {};
    const button = config.button || {};
    const imageSection = config.imageSection || {};
    const otpPage = config.pages?.otp || {};

    const imageWidth = Number(layout.imageWidth) || 50;
    const fromFile = options.fromFile || "index.html";

    // Canonical Background Calculation via resolveBackground
    const resolvedBg = resolveBackground(config);

    let bgImg = "none";
    if (resolvedBg.type === "image" && resolvedBg.source && resolvedBg.source !== "none") {
      const relPath = Utils && typeof Utils.getRelativeAssetPath === "function" 
        ? Utils.getRelativeAssetPath(fromFile, resolvedBg.source)
        : (fromFile.startsWith("css/") ? `../${resolvedBg.source.replace(/^\.\//, "").replace(/^\//, "")}` : resolvedBg.source);
      bgImg = `url("${relPath}")`;
    }

    let bgColor = resolvedBg.color || background.color || "#0f172a";
    if (resolvedBg.type === "gradient") {
      bgColor = resolvedBg.color;
    } else if (background.gradientEnabled) {
      const gStart = background.gradientStart || bgColor;
      const gEnd = background.gradientEnd || "#1e293b";
      bgColor = `linear-gradient(135deg, ${gStart}, ${gEnd})`;
    }

    const overlayOpacity = resolvedBg.overlayOpacity;

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
        --auth-background-color: ${bgColor};
        --auth-background-position: ${resolvedBg.position};
        --auth-background-size: ${resolvedBg.size};
        --auth-background-repeat: ${resolvedBg.repeat};
        --auth-overlay-color: ${resolvedBg.overlayColor};
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
        --auth-card-min-height: ${Number(card.minHeight) || 400}px;
        --auth-card-radius: ${cardEnabled ? (Number(card.borderRadius) || 20) : 0}px;
        --auth-card-border-width: ${cardEnabled ? (Number(card.borderWidth) || 1) : 0}px;
        --auth-card-border-color: ${card.borderColor || "#e2e8f0"};
        --auth-card-shadow: ${cardEnabled && card.shadowEnabled ? "0 20px 45px rgba(15, 23, 42, 0.10)" : "none"};
        --auth-card-blur: ${cardEnabled && card.blurEnabled ? "18px" : "0px"};
        --auth-card-padding: ${cardEnabled ? (Number(card.padding) || 40) : 0}px;

        /* Image Section Text */
        --auth-image-text-color: ${imageSection.textColor || "#ffffff"};

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
        const otpMethod = link.dataset.otpMethod;
        if (otpMethod && window.state && typeof window.state.set === "function") {
          window.state.set("authentication.otp.defaultMethod", otpMethod, { notify: false });
        }
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
          Utils.showToast("OTP request successful. Use 123456 for this demo.", "info", 3000);
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

    // 7. Live Password Evaluation on Sign Up Page
    const signupPasswordInput = container.querySelector("#signupPassword");
    if (signupPasswordInput) {
      const policy = config.passwordPolicy || {};
      const minLen = Number(policy.minLength) || 8;
      const minNums = Number(policy.minNumbers) || 1;
      const minSpecials = Number(policy.minSpecialChars) || 1;
      const allowedSpecials = policy.allowedSpecialChars || "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const escapedSpecials = allowedSpecials.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const specialRegex = new RegExp(`[${escapedSpecials}]`, "g");

      const updateLivePasswordEvaluation = () => {
        const val = signupPasswordInput.value || "";

        // Rules check
        const passLen = val.length >= minLen;
        const passUpper = (policy.requireUppercase === false) || /[A-Z]/.test(val);
        const passLower = (policy.requireLowercase === false) || /[a-z]/.test(val);
        const passNum = (policy.requireNumber === false) || ((val.match(/[0-9]/g) || []).length >= minNums);
        const passSpecial = (policy.requireSpecialChar === false) || ((val.match(specialRegex) || []).length >= minSpecials);

        const updateReqItem = (id, passed) => {
          const item = container.querySelector(id);
          if (item) {
            item.classList.toggle("passed", passed);
            const icon = item.querySelector(".signup-req-icon");
            if (icon) icon.textContent = passed ? "✓" : "○";
          }
        };

        updateReqItem("#reqCheckMinLength", passLen);
        updateReqItem("#reqCheckUpper", passUpper);
        updateReqItem("#reqCheckLower", passLower);
        updateReqItem("#reqCheckNumber", passNum);
        updateReqItem("#reqCheckSpecial", passSpecial);

        // Strength Calculation
        let score = 0;
        if (passLen) score++;
        if (passUpper && passLower) score++;
        if (passNum) score++;
        if (passSpecial) score++;
        if (val.length >= minLen + 4) score++;

        const meterBar = container.querySelector("#signupMeterBar");
        const meterBadge = container.querySelector("#signupMeterBadge");

        if (meterBar && meterBadge) {
          if (!val) {
            meterBar.style.width = "10%";
            meterBar.className = "signup-meter-bar lvl-weak";
            meterBadge.textContent = "Empty";
            meterBadge.className = "signup-meter-badge lvl-weak";
          } else if (score <= 2) {
            meterBar.style.width = "30%";
            meterBar.className = "signup-meter-bar lvl-weak";
            meterBadge.textContent = "Weak";
            meterBadge.className = "signup-meter-badge lvl-weak";
          } else if (score <= 4) {
            meterBar.style.width = "65%";
            meterBar.className = "signup-meter-bar lvl-medium";
            meterBadge.textContent = "Medium";
            meterBadge.className = "signup-meter-badge lvl-medium";
          } else {
            meterBar.style.width = "100%";
            meterBar.className = "signup-meter-bar lvl-strong";
            meterBadge.textContent = "Strong";
            meterBadge.className = "signup-meter-badge lvl-strong";
          }
        }
      };

      signupPasswordInput.addEventListener("input", updateLivePasswordEvaluation);
      updateLivePasswordEvaluation();
    }

    // 8. Form submit handler for Live Preview Canvas (Executes single redirect)
    const forms = container.querySelectorAll(".auth-main-form");
    forms.forEach(form => {
      form.onsubmit = function (e) {
        e.preventDefault();
        const baseRedirect = config.redirect || {};
        const customerLanding = config.urls?.landingPageUrl || config.landingPageUrl || "";
        const targetRedirect = baseRedirect.redirectUrl || config.redirectUrl || config.urls?.redirectUrl || customerLanding || "/dashboard";
        const redirectConfig = Object.assign({}, baseRedirect, {
          redirectUrl: targetRedirect
        });

        const service = window.RedirectService || window.redirectService;
        if (service && typeof service.resetGuard === "function") {
          service.resetGuard();
        }

        if (service && typeof service.execute === "function") {
          service.execute(redirectConfig, { isPreview: false, force: true });
        } else {
          const targetUrl = redirectConfig.redirectUrl || "/dashboard";
          if (redirectConfig.openInNewTab) {
            if (typeof window !== "undefined" && typeof window.open === "function") {
              window.open(targetUrl, "_blank", "noopener,noreferrer");
            }
          } else {
            if (typeof window !== "undefined" && window.location && typeof window.location.assign === "function") {
              window.location.assign(targetUrl);
            }
          }
        }
      };
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

    // Apply direct element background styles using canonical resolveBackground
    const resolvedBg = resolveBackground(config);
    const fullBgEl = root.querySelector(".auth-full-background");
    const imageSectionEl = root.querySelector(".auth-image-section");
    const shellEl = root.querySelector(".auth-preview-shell");

    // Reset background image on root, fullBgEl, and imageSectionEl first to avoid duplicates
    root.style.backgroundImage = "none";
    if (fullBgEl) fullBgEl.style.backgroundImage = "none";
    if (imageSectionEl) imageSectionEl.style.backgroundImage = "none";
    if (shellEl) shellEl.style.backgroundImage = "none";

    const isFullBackground = (
      layoutType === "full-background" ||
      layoutType === "centered" ||
      layoutType === "card-left" ||
      layoutType === "card-right"
    );

    if (isFullBackground) {
      // Single background layer on shellEl (the scroll container)
      const targetBgEl = shellEl || root;
      if (resolvedBg.type === "image" && resolvedBg.source) {
        targetBgEl.style.backgroundImage = `url("${resolvedBg.source}")`;
        targetBgEl.style.backgroundColor = resolvedBg.color || "#0f172a";
      } else if (resolvedBg.type === "color" || resolvedBg.type === "gradient") {
        targetBgEl.style.backgroundImage = resolvedBg.type === "gradient" ? resolvedBg.color : "none";
        targetBgEl.style.backgroundColor = resolvedBg.color || "#0f172a";
      } else {
        targetBgEl.style.backgroundImage = "none";
        targetBgEl.style.backgroundColor = "transparent";
      }
      targetBgEl.style.backgroundSize = resolvedBg.size || "cover";
      targetBgEl.style.backgroundPosition = resolvedBg.position || "center";
      targetBgEl.style.backgroundRepeat = "no-repeat";
    } else {
      // Split layout: single background layer on imageSectionEl ONLY
      if (imageSectionEl) {
        if (resolvedBg.type === "image" && resolvedBg.source) {
          imageSectionEl.style.backgroundImage = `url("${resolvedBg.source}")`;
          imageSectionEl.style.backgroundColor = resolvedBg.color || "#0f172a";
        } else if (resolvedBg.type === "color" || resolvedBg.type === "gradient") {
          imageSectionEl.style.backgroundImage = resolvedBg.type === "gradient" ? resolvedBg.color : "none";
          imageSectionEl.style.backgroundColor = resolvedBg.color || "#0f172a";
        } else {
          imageSectionEl.style.backgroundImage = "none";
          imageSectionEl.style.backgroundColor = "transparent";
        }
        imageSectionEl.style.backgroundSize = resolvedBg.size || "cover";
        imageSectionEl.style.backgroundPosition = resolvedBg.position || "center";
        imageSectionEl.style.backgroundRepeat = "no-repeat";
      }
    }

    const showBackgroundText = (config.imageSection?.showText !== false);
    const branding = config.branding || {};
    const logoSrc = branding.uploadedLogo || branding.logo || branding.selectedLogo || "assets/logos/brand-shield.svg";

    console.log(`[Renderer] Layout: ${layoutType}`);
    console.log(`[Renderer] Background resolved: type=${resolvedBg.type}, source=${resolvedBg.source || "none"}, color=${resolvedBg.color || "none"}`);
    console.log(`[Renderer] Background text enabled: ${showBackgroundText}`);
    console.log(`[Renderer] Logo resolved: ${logoSrc.startsWith("data:") ? "[data URL]" : logoSrc}`);

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
    resolveBackground,
    computeStyleVariables,
    injectStyles,
    renderPreview,
    render: renderPreview
  };
});