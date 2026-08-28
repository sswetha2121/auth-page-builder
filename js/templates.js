/* =========================================================
   AUTH PAGE BUILDER - TEMPLATE GENERATOR
   File: js/templates.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const utils = require("./utils.js");
    module.exports = factory(utils);
  } else {
    root.Templates = factory(root.Utils || {});
  }
})(typeof window !== "undefined" ? window : globalThis, function (Utils) {

  const escapeHtml = Utils.escapeHtml || function (s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  /* =======================================================
     ICONS (INLINE SVG)
  ======================================================= */
  const ICONS = {
    google: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>`,
    apple: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.13.64-2.79 1.41-.57.65-1.06 1.71-.98 2.76 1.07.08 2.14-.55 2.76-1.3z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.02-3.28 1.64 1.64 0 0 0 .02 3.28M5.07 18.5h2.79v-8.37H5.07v8.37z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.677-1.633-.927-2.235-.244-.587-.492-.507-.677-.517l-.577-.01c-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.11.15.2 2.12 3.238 5.136 4.542.717.31 1.277.496 1.713.635.72.229 1.375.197 1.893.12.577-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.275-.201-.576-.351zm-5.452 7.558h-.008a10.024 10.024 0 0 1-5.118-1.398l-.367-.218-3.805.998 1.016-3.71-.24-.381a10.015 10.015 0 0 1-1.536-5.292c0-5.535 4.504-10.04 10.045-10.04 2.684 0 5.207 1.046 7.104 2.945a10.007 10.007 0 0 1 2.942 7.098c0 5.538-4.505 10.042-10.033 10.042zm8.517-18.552A11.936 11.936 0 0 0 12.02 0C5.393 0 .02 5.373.02 12a11.96 11.96 0 0 0 1.83 6.388L0 24l5.772-1.815A11.97 11.97 0 0 0 12.02 24c6.626 0 12-5.373 12-12 0-3.206-1.248-6.22-3.515-8.612z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    sms: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    eye: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`
  };

  /* =======================================================
     BRANDING & LOGO (True Shapes: square, rounded, circle, ellipse)
  ======================================================= */
  function generateLogo(config) {
    const branding = config.branding || {};
    if (branding.showLogo === false) {
      return "";
    }

    const brandName = escapeHtml(branding.brandName || "Your Brand");
    const shape = branding.logoShape || "circle";
    const position = branding.logoPosition || "center";
    const logoSrc = branding.uploadedLogo || branding.logo || branding.selectedLogo || "";

    const initials = brandName
      .split(" ")
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YB";

    let logoMarkup = "";
    if (logoSrc) {
      logoMarkup = `
        <div class="auth-logo-box auth-logo-shape-${shape}">
          <img src="${escapeHtml(logoSrc)}" alt="${brandName}" class="auth-logo-img"
               onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
          <div class="auth-logo-fallback" style="display: none;">
            <span>${initials}</span>
          </div>
        </div>
      `;
    } else {
      logoMarkup = `
        <div class="auth-logo-box auth-logo-shape-${shape}">
          <div class="auth-logo-fallback">
            <span>${initials}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="auth-branding-header auth-logo-pos-${position}">
        ${logoMarkup}
        ${brandName ? `<span class="auth-brand-title">${brandName}</span>` : ""}
      </div>
    `;
  }

  /* =======================================================
     SOCIAL LOGIN
  ======================================================= */
  function generateSocialLogin(config) {
    const social = config.social || {};
    if (!social.enabled) return "";

    const providers = social.providers || {};
    const layout = social.layout || "horizontal";
    const dividerText = escapeHtml(social.dividerText || "or continue with");

    const enabledList = [];
    if (providers.google) enabledList.push({ id: "google", name: "Google", icon: ICONS.google });
    if (providers.apple) enabledList.push({ id: "apple", name: "Apple", icon: ICONS.apple });
    if (providers.github) enabledList.push({ id: "github", name: "GitHub", icon: ICONS.github });
    if (providers.facebook) enabledList.push({ id: "facebook", name: "Facebook", icon: ICONS.facebook });
    if (providers.linkedin) enabledList.push({ id: "linkedin", name: "LinkedIn", icon: ICONS.linkedin });

    if (enabledList.length === 0) return "";

    const buttons = enabledList.map(item => `
      <button type="button" class="auth-social-btn auth-social-${item.id}" data-provider="${item.id}" aria-label="Sign in with ${item.name}">
        <span class="auth-social-icon">${item.icon}</span>
        <span class="auth-social-text">${item.name}</span>
      </button>
    `).join("");

    return `
      <div class="auth-social-section">
        <div class="auth-divider">
          <span>${dividerText}</span>
        </div>
        <div class="auth-social-buttons auth-social-layout-${layout}">
          ${buttons}
        </div>
      </div>
    `;
  }

  /* =======================================================
     OTP DELIVERY METHODS BUILDER
  ======================================================= */
  function generateDeliveryMethodsHTML(config) {
    const otpAuth = config.authentication?.otp || {};
    const emailDelivery = otpAuth.emailEnabled !== false;
    const smsDelivery = Boolean(otpAuth.smsEnabled);
    const whatsappDelivery = Boolean(otpAuth.whatsappEnabled);
    const defaultMethod = otpAuth.defaultMethod || "email";

    const enabledMethods = [];
    if (emailDelivery) enabledMethods.push({ id: "email", label: "Email", icon: ICONS.email });
    if (smsDelivery) enabledMethods.push({ id: "sms", label: "SMS", icon: ICONS.sms });
    if (whatsappDelivery) enabledMethods.push({ id: "whatsapp", label: "WhatsApp", icon: ICONS.whatsapp });

    if (enabledMethods.length === 0) {
      // Default to email if none selected
      enabledMethods.push({ id: "email", label: "Email", icon: ICONS.email });
    }

    if (enabledMethods.length === 1) {
      const single = enabledMethods[0];
      return `
        <div class="otp-delivery-methods otp-delivery-single">
          <span class="otp-delivery-badge">
            ${single.icon}
            <span>Code sent via ${single.label}</span>
          </span>
        </div>
      `;
    }

    const pills = enabledMethods.map(item => {
      const isDefault = (item.id === defaultMethod) || (enabledMethods.length > 0 && item === enabledMethods[0] && !enabledMethods.some(m => m.id === defaultMethod));
      return `
        <button type="button" class="otp-delivery-pill ${isDefault ? 'active' : ''}" data-otp-delivery="${item.id}">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `;
    }).join("");

    return `
      <div class="otp-delivery-methods">
        <span class="otp-delivery-label">Get code via:</span>
        <div class="otp-delivery-group">
          ${pills}
        </div>
      </div>
    `;
  }

  /* =======================================================
     DYNAMIC OTP DIGIT BOXES BUILDER (4, 6, or 8 & Styles)
  ======================================================= */
  function generateOtpBoxesHTML(config) {
    const pageConfig = config.pages?.otp || {};
    const length = Number(pageConfig.length) || 6;
    const inputStyle = pageConfig.inputStyle || "box"; // "box", "rounded", "underline"

    const boxes = [];
    for (let i = 0; i < length; i++) {
      boxes.push(`
        <input type="text" 
               class="otp-digit-box" 
               data-otp-index="${i}" 
               maxlength="1" 
               inputmode="numeric" 
               pattern="[0-9]*" 
               autocomplete="one-time-code" 
               aria-label="Digit ${i + 1}"
               required />
      `);
    }

    return `
      <div class="otp-boxes-container otp-boxes-style-${escapeHtml(inputStyle)}" data-otp-count="${length}">
        ${boxes.join("")}
      </div>
    `;
  }

  /* =======================================================
     PASSWORD STRENGTH METER & REQUIREMENTS BUILDERS
  ======================================================= */
  function generatePasswordStrengthMeterHTML(config) {
    const policy = config.passwordPolicy || {};
    if (policy.showStrengthMeter === false) return "";

    return `
      <div class="signup-password-meter" id="signupPasswordMeterContainer">
        <div class="signup-meter-header">
          <span class="signup-meter-label">Password Strength:</span>
          <span class="signup-meter-badge lvl-weak" id="signupMeterBadge">Weak</span>
        </div>
        <div class="signup-meter-track">
          <div class="signup-meter-bar lvl-weak" id="signupMeterBar" style="width: 25%;"></div>
        </div>
      </div>
    `;
  }

  function generatePasswordRequirementsHTML(config) {
    const policy = config.passwordPolicy || {};
    if (policy.showRequirementsList === false) return "";

    const minLen = policy.minLength || 8;
    const reqs = [];

    reqs.push(`<li class="signup-req-item" id="reqCheckMinLength" data-rule="min-length"><span class="signup-req-icon">○</span> At least ${minLen} characters</li>`);
    if (policy.requireUppercase !== false) {
      reqs.push(`<li class="signup-req-item" id="reqCheckUpper" data-rule="uppercase"><span class="signup-req-icon">○</span> One uppercase letter (A-Z)</li>`);
    }
    if (policy.requireLowercase !== false) {
      reqs.push(`<li class="signup-req-item" id="reqCheckLower" data-rule="lowercase"><span class="signup-req-icon">○</span> One lowercase letter (a-z)</li>`);
    }
    if (policy.requireNumber !== false) {
      reqs.push(`<li class="signup-req-item" id="reqCheckNumber" data-rule="number"><span class="signup-req-icon">○</span> One numeric digit (0-9)</li>`);
    }
    if (policy.requireSpecialChar !== false) {
      reqs.push(`<li class="signup-req-item" id="reqCheckSpecial" data-rule="special"><span class="signup-req-icon">○</span> One special character (${escapeHtml((policy.allowedSpecialChars || "!@#$%").slice(0, 6))}...)</li>`);
    }

    return `
      <div class="signup-requirements-card" id="signupRequirementsCard">
        <span class="signup-requirements-title">Your password must contain:</span>
        <ul class="signup-requirements-list">
          ${reqs.join("")}
        </ul>
      </div>
    `;
  }

  /* =======================================================
     PAGE: LOGIN (Supports Standard & Inline OTP Modes)
  ======================================================= */

  function generateLoginPage(config) {
    const pageConfig = config.pages?.login || {};
    const title = escapeHtml(pageConfig.title || "Welcome back");
    const subtitle = escapeHtml(pageConfig.subtitle || "Sign in to continue to your account");
    const buttonText = escapeHtml(pageConfig.buttonText || "Sign In");

    const emailEnabled = pageConfig.emailEnabled !== false;
    const mobileEnabled = Boolean(pageConfig.mobileEnabled);
    const usernameEnabled = Boolean(pageConfig.usernameEnabled);
    const passwordEnabled = pageConfig.passwordEnabled !== false;
    const otpEnabled = pageConfig.otpEnabled !== false;
    const rememberMeEnabled = Boolean(pageConfig.rememberMeEnabled);
    const rememberMeText = escapeHtml(pageConfig.rememberMeText || "Remember me for 30 days");
    const forgotPasswordEnabled = pageConfig.forgotPasswordEnabled !== false;
    const forgotPasswordText = escapeHtml(pageConfig.forgotPasswordText || "Forgot password?");
    const signupEnabled = pageConfig.signupEnabled !== false;
    const signupPrompt = escapeHtml(pageConfig.signupPrompt || "Don't have an account?");
    const signupLinkText = escapeHtml(pageConfig.signupLinkText || "Create account");
    const idPlaceholder = escapeHtml(pageConfig.identifierPlaceholder || "name@company.com");
    const passPlaceholder = escapeHtml(pageConfig.passwordPlaceholder || "••••••••");
    const otpBtnText = escapeHtml(pageConfig.otpButtonText || "Continue with OTP");
    const whatsappBtnText = escapeHtml(pageConfig.whatsappButtonText || "Get OTP via WhatsApp");
    const whatsappEnabled = Boolean(config.authentication?.otp?.whatsappEnabled);

    // Check OTP Display Mode (Separate Page vs Inline on Login)
    const isInlineOtp = config.pages?.otp?.displayMode === "inline";

    const identifierParts = [];
    if (emailEnabled) identifierParts.push("Email");
    if (usernameEnabled) identifierParts.push("Username");
    if (mobileEnabled) identifierParts.push("Phone");
    const identifierLabel = identifierParts.join(" / ") || "Email address";

    return `
      <div class="auth-page-form-wrapper" data-page="login">
        <div class="auth-form-header">
          <h1 class="auth-heading">${title}</h1>
          ${subtitle ? `<p class="auth-subheading">${subtitle}</p>` : ""}
        </div>

        <form class="auth-main-form" id="authLoginForm" onsubmit="event.preventDefault(); window.handleAuthSubmit ? window.handleAuthSubmit(event, 'login') : null;">
          
          <div class="auth-field-group">
            <label class="auth-label" for="loginIdentifier">${identifierLabel}</label>
            <div class="auth-input-wrapper">
              <input type="${emailEnabled && !usernameEnabled && !mobileEnabled ? 'email' : 'text'}" 
                     id="loginIdentifier" 
                     name="identifier" 
                     class="auth-input" 
                     placeholder="${idPlaceholder}" 
                     required />
            </div>
          </div>

          ${passwordEnabled && !isInlineOtp ? `
          <div class="auth-field-group">
            <div class="auth-label-row">
              <label class="auth-label" for="loginPassword">Password</label>
              ${forgotPasswordEnabled ? `
                <a href="#forgot" class="auth-link auth-link-forgot" data-auth-nav="forgotPassword">${forgotPasswordText}</a>
              ` : ""}
            </div>
            <div class="auth-input-wrapper auth-input-password-wrapper">
              <input type="password" 
                     id="loginPassword" 
                     name="password" 
                     class="auth-input" 
                     placeholder="${passPlaceholder}" 
                     required />
              <button type="button" class="auth-password-toggle" data-toggle-password aria-label="Toggle password visibility">
                ${ICONS.eye}
              </button>
            </div>
          </div>
          ` : ""}

          ${isInlineOtp ? `
          <!-- INLINE OTP FLOW ON LOGIN PAGE -->
          <div class="auth-inline-otp-section">
            <div class="auth-label-row">
              <label class="auth-label">Enter Verification Code</label>
              ${forgotPasswordEnabled ? `
                <a href="#forgot" class="auth-link auth-link-forgot" data-auth-nav="forgotPassword">${forgotPasswordText}</a>
              ` : ""}
            </div>
            ${generateDeliveryMethodsHTML(config)}
            ${generateOtpBoxesHTML(config)}
            ${config.pages?.otp?.resendEnabled !== false ? `
              <div class="otp-resend-row">
                <span>${escapeHtml(config.pages?.otp?.resendPromptText || "Didn't receive code?")}</span>
                <button type="button" class="otp-resend-btn" id="otpResendButtonInline" data-countdown="${config.pages?.otp?.resendSeconds || 30}">
                  <span>${escapeHtml(config.pages?.otp?.resendText || "Resend OTP")}</span>
                  <span class="otp-countdown-timer">(${config.pages?.otp?.resendSeconds || 30}s)</span>
                </button>
              </div>
            ` : ""}
          </div>
          ` : ""}

          ${rememberMeEnabled ? `
          <div class="auth-checkbox-group">
            <label class="auth-checkbox-label">
              <input type="checkbox" id="loginRememberMe" name="rememberMe" class="auth-checkbox" />
              <span>${rememberMeText}</span>
            </label>
          </div>
          ` : ""}

          <div class="auth-button-group">
            <button type="submit" class="auth-primary-btn" id="loginSubmitBtn">
              <span>${isInlineOtp ? (config.pages?.otp?.buttonText || "Verify & Sign In") : buttonText}</span>
            </button>
          </div>

          ${otpEnabled && !isInlineOtp ? `
          <div class="auth-alt-auth-group">
            <button type="button" class="auth-secondary-btn" data-auth-nav="otp">
              ${ICONS.sms}
              <span>${otpBtnText}</span>
            </button>
          </div>
          ` : ""}

          ${whatsappEnabled && !isInlineOtp ? `
          <div class="auth-whatsapp-badge-row">
            <button type="button" class="auth-whatsapp-btn" data-auth-nav="otp" data-otp-method="whatsapp">
              ${ICONS.whatsapp}
              <span>${whatsappBtnText}</span>
            </button>
          </div>
          ` : ""}

          ${generateSocialLogin(config)}

          ${signupEnabled ? `
          <div class="auth-footer-nav">
            <span>${signupPrompt}</span>
            <a href="#signup" class="auth-link auth-link-action" data-auth-nav="signup">${signupLinkText}</a>
          </div>
          ` : ""}
        </form>
      </div>
    `;
  }

  /* =======================================================
     PAGE: SIGNUP
  ======================================================= */
  function generateSignupPage(config) {
    const pageConfig = config.pages?.signup || {};
    const title = escapeHtml(pageConfig.title || "Create account");
    const subtitle = escapeHtml(pageConfig.subtitle || "Enter your details to create an account");
    const buttonText = escapeHtml(pageConfig.buttonText || "Create Account");
    const signinPrompt = escapeHtml(pageConfig.signinPrompt || "Already have an account?");
    const signinLinkText = escapeHtml(pageConfig.signinLinkText || "Sign in");

    const fields = pageConfig.fields || {
      fullName: true,
      username: true,
      email: true,
      mobile: true,
      password: true,
      confirmPassword: true
    };

    const labels = pageConfig.fieldLabels || {
      fullName: "Full Name",
      username: "Username",
      email: "Email Address",
      mobile: "Mobile Number",
      password: "Password",
      confirmPassword: "Confirm Password"
    };

    const placeholders = pageConfig.fieldPlaceholders || {
      fullName: "Alex Morgan",
      username: "alexmorgan",
      email: "alex@company.com",
      mobile: "+1 (555) 234-5678",
      password: "Minimum 8 characters",
      confirmPassword: "Repeat your password"
    };

    const termsEnabled = Boolean(pageConfig.termsEnabled);
    const termsText = escapeHtml(pageConfig.termsText || "I agree to the Terms of Service");
    const termsUrl = escapeHtml(pageConfig.termsUrl || "https://customerwebsite.com/terms");
    const privacyEnabled = Boolean(pageConfig.privacyEnabled);
    const privacyText = escapeHtml(pageConfig.privacyText || "Privacy Policy");
    const privacyUrl = escapeHtml(pageConfig.privacyUrl || "https://customerwebsite.com/privacy");

    return `
      <div class="auth-page-form-wrapper" data-page="signup">
        <div class="auth-form-header">
          <h1 class="auth-heading">${title}</h1>
          ${subtitle ? `<p class="auth-subheading">${subtitle}</p>` : ""}
        </div>

        <form class="auth-main-form" id="authSignupForm" onsubmit="event.preventDefault(); window.handleAuthSubmit ? window.handleAuthSubmit(event, 'signup') : null;">
          
          ${fields.fullName ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupName">${escapeHtml(labels.fullName || "Full Name")}</label>
            <input type="text" id="signupName" name="fullName" class="auth-input" placeholder="${escapeHtml(placeholders.fullName || "Alex Morgan")}" required />
          </div>
          ` : ""}

          ${fields.username ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupUsername">${escapeHtml(labels.username || "Username")}</label>
            <input type="text" id="signupUsername" name="username" class="auth-input" placeholder="${escapeHtml(placeholders.username || "alexmorgan")}" required />
          </div>
          ` : ""}

          ${fields.email ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupEmail">${escapeHtml(labels.email || "Email Address")}</label>
            <input type="email" id="signupEmail" name="email" class="auth-input" placeholder="${escapeHtml(placeholders.email || "alex@company.com")}" required />
          </div>
          ` : ""}

          ${fields.mobile ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupMobile">${escapeHtml(labels.mobile || "Mobile Number")}</label>
            <input type="tel" id="signupMobile" name="mobile" class="auth-input" placeholder="${escapeHtml(placeholders.mobile || "+1 (555) 234-5678")}" />
          </div>
          ` : ""}

          ${fields.password ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupPassword">${escapeHtml(labels.password || "Password")}</label>
            <div class="auth-input-wrapper auth-input-password-wrapper">
              <input type="password" id="signupPassword" name="password" class="auth-input" placeholder="${escapeHtml(placeholders.password || "Minimum 8 characters")}" required />
              <button type="button" class="auth-password-toggle" data-toggle-password aria-label="Toggle password visibility">
                ${ICONS.eye}
              </button>
            </div>
            ${generatePasswordStrengthMeterHTML(config)}
            ${generatePasswordRequirementsHTML(config)}
          </div>
          ` : ""}

          ${fields.confirmPassword ? `
          <div class="auth-field-group">
            <label class="auth-label" for="signupConfirmPassword">${escapeHtml(labels.confirmPassword || "Confirm Password")}</label>
            <div class="auth-input-wrapper auth-input-password-wrapper">
              <input type="password" id="signupConfirmPassword" name="confirmPassword" class="auth-input" placeholder="${escapeHtml(placeholders.confirmPassword || "Repeat your password")}" required />
              <button type="button" class="auth-password-toggle" data-toggle-password aria-label="Toggle password visibility">
                ${ICONS.eye}
              </button>
            </div>
          </div>
          ` : ""}

          ${termsEnabled ? `
          <div class="auth-checkbox-group auth-terms-group">
            <label class="auth-checkbox-label">
              <input type="checkbox" id="signupTerms" name="terms" class="auth-checkbox" required />
              <span>
                <a href="${termsUrl}" target="_blank" rel="noopener noreferrer" class="auth-inline-link">${termsText}</a>
                ${privacyEnabled ? ` and <a href="${privacyUrl}" target="_blank" rel="noopener noreferrer" class="auth-inline-link">${privacyText}</a>` : ""}
              </span>
            </label>
          </div>
          ` : ""}

          <div class="auth-button-group">
            <button type="submit" class="auth-primary-btn" id="signupSubmitBtn">
              <span>${buttonText}</span>
            </button>
          </div>

          ${generateSocialLogin(config)}

          <div class="auth-footer-nav">
            <span>${signinPrompt}</span>
            <a href="#login" class="auth-link auth-link-action" data-auth-nav="login">${signinLinkText}</a>
          </div>
        </form>
      </div>
    `;
  }

  /* =======================================================
     PAGE: FORGOT PASSWORD
  ======================================================= */
  function generateForgotPasswordPage(config) {
    const pageConfig = config.pages?.forgotPassword || {};
    const title = escapeHtml(pageConfig.title || "Forgot password?");
    const subtitle = escapeHtml(pageConfig.subtitle || "Enter your email or mobile number to receive reset instructions");
    const buttonText = escapeHtml(pageConfig.buttonText || "Send Reset Link");
    const mode = pageConfig.identifierMode || "both"; // "email", "phone", "both"
    const label = escapeHtml(pageConfig.identifierLabel || (mode === "email" ? "Email Address" : mode === "phone" ? "Mobile Number" : "Email or Phone Number"));
    const placeholder = escapeHtml(pageConfig.identifierPlaceholder || (mode === "email" ? "name@company.com" : mode === "phone" ? "+1 (555) 234-5678" : "name@company.com or +1 555-234-5678"));

    return `
      <div class="auth-page-form-wrapper" data-page="forgotPassword">
        <div class="auth-form-header">
          <h1 class="auth-heading">${title}</h1>
          ${subtitle ? `<p class="auth-subheading">${subtitle}</p>` : ""}
        </div>

        <form class="auth-main-form" id="authForgotForm" onsubmit="event.preventDefault(); window.handleAuthSubmit ? window.handleAuthSubmit(event, 'forgotPassword') : null;">
          
          <div class="auth-field-group">
            <label class="auth-label" for="forgotIdentifier">${label}</label>
            <input type="${mode === 'email' ? 'email' : mode === 'phone' ? 'tel' : 'text'}" id="forgotIdentifier" name="identifier" class="auth-input" placeholder="${placeholder}" required />
          </div>

          <div class="auth-button-group">
            <button type="submit" class="auth-primary-btn" id="forgotSubmitBtn">
              <span>${buttonText}</span>
            </button>
          </div>

          <div class="auth-footer-nav auth-back-center">
            <a href="#login" class="auth-link auth-back-link" data-auth-nav="login">
              ${ICONS.arrowLeft}
              <span>${escapeHtml(pageConfig.backToLoginText || "Back to login")}</span>
            </a>
          </div>
        </form>
      </div>
    `;
  }

  /* =======================================================
     PAGE: OTP VERIFICATION (Standalone Page)
  ======================================================= */
  function generateOtpPage(config) {
    const pageConfig = config.pages?.otp || {};
    const title = escapeHtml(pageConfig.title || "Verify your identity");
    const subtitle = escapeHtml(pageConfig.subtitle || "Enter the verification code sent to your device");
    const buttonText = escapeHtml(pageConfig.buttonText || "Verify OTP");

    const resendEnabled = pageConfig.resendEnabled !== false;
    const resendText = escapeHtml(pageConfig.resendText || "Resend OTP");
    const resendPrompt = escapeHtml(pageConfig.resendPromptText || "Didn't receive code?");
    const resendSeconds = Number(pageConfig.resendSeconds) || 30;
    const backToSignIn = escapeHtml(pageConfig.backToSignInText || "Back to sign in");

    return `
      <div class="auth-page-form-wrapper" data-page="otp">
        <div class="auth-form-header">
          <h1 class="auth-heading">${title}</h1>
          ${subtitle ? `<p class="auth-subheading">${subtitle}</p>` : ""}
        </div>

        ${generateDeliveryMethodsHTML(config)}

        <form class="auth-main-form" id="authOtpForm" onsubmit="event.preventDefault(); window.handleAuthSubmit ? window.handleAuthSubmit(event, 'otp') : null;">
          
          ${generateOtpBoxesHTML(config)}

          ${resendEnabled ? `
          <div class="otp-resend-row">
            <span class="otp-resend-prompt">${resendPrompt}</span>
            <button type="button" class="otp-resend-btn" id="otpResendButton" data-countdown="${resendSeconds}">
              <span>${resendText}</span>
              <span class="otp-countdown-timer">(${resendSeconds}s)</span>
            </button>
          </div>
          ` : ""}

          <div class="auth-button-group">
            <button type="submit" class="auth-primary-btn" id="otpSubmitBtn">
              <span>${buttonText}</span>
            </button>
          </div>

          <div class="auth-footer-nav auth-back-center">
            <a href="#login" class="auth-link auth-back-link" data-auth-nav="login">
              ${ICONS.arrowLeft}
              <span>${backToSignIn}</span>
            </a>
          </div>
        </form>
      </div>
    `;
  }

  /* =======================================================
     COMPLETE AUTH PAGE SHELL GENERATOR
  ======================================================= */
  function generateAuthShell(config, pageName = "login") {
    const page = pageName || config.activePage || "login";
    let pageHTML = "";

    switch (page) {
      case "signup":
        pageHTML = generateSignupPage(config);
        break;
      case "forgotPassword":
        pageHTML = generateForgotPasswordPage(config);
        break;
      case "otp":
        pageHTML = generateOtpPage(config);
        break;
      case "login":
      default:
        pageHTML = generateLoginPage(config);
        break;
    }

    const imageSection = config.imageSection || {};
    const showBackgroundText = imageSection.showText !== false;
    const bgHeading = escapeHtml(imageSection.text || "Experience the next generation of authentication.");
    const bgSubtext = escapeHtml(imageSection.subtext || "Fast, secure, and beautifully customized for your brand.");
    const bgPosClass = `position-${imageSection.textPosition || 'center'}`;

    const landingUrl = config.urls?.landingPageUrl || "";
    const showBackToWeb = config.urls?.showBackToWebsite !== false && Boolean(landingUrl);
    const backToWebText = escapeHtml(config.urls?.backToWebsiteText || "Back to Website");
    const openNewTab = config.urls?.openInNewTab !== false;

    return `
      <div class="auth-preview-shell">
        
        <!-- Background / Visual Section -->
        <div class="auth-image-section">
          <div class="auth-image-overlay"></div>
          ${showBackgroundText ? `
            <div class="auth-image-content ${bgPosClass}">
              <div class="auth-image-text-block">
                <h2 class="auth-image-text">${bgHeading}</h2>
                ${bgSubtext ? `<p class="auth-image-subtext">${bgSubtext}</p>` : ""}
              </div>
            </div>
          ` : ""}
        </div>

        <!-- Form & Content Section -->
        <div class="auth-form-section">
          <div class="auth-card">
            ${showBackToWeb ? `
              <div class="auth-landing-link-bar">
                <a href="${escapeHtml(landingUrl)}" target="${openNewTab ? '_blank' : '_self'}" rel="noopener noreferrer" class="auth-landing-link">
                  ${ICONS.arrowLeft}
                  <span>${backToWebText}</span>
                </a>
              </div>
            ` : ""}
            
            ${generateLogo(config)}

            <div class="auth-page-container">
              ${pageHTML}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  return {
    ICONS,
    generateLogo,
    generateSocialLogin,
    generateDeliveryMethodsHTML,
    generateOtpBoxesHTML,
    generateLoginPage,
    generateSignupPage,
    generateForgotPasswordPage,
    generateOtpPage,
    generateAuthShell
  };
});