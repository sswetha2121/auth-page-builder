/* =========================================================
   AUTH PAGE BUILDER
   File: js/templates.js

   TEMPLATE GENERATOR

   Supports:
   - Login
   - Signup
   - Forgot Password
   - OTP
   - 4 / 6 / 8 digit OTP
   - Email / Mobile / WhatsApp OTP
   - Password authentication
   - Social login
   - Dynamic branding
   - Dynamic colors
   - Uploaded logo support
   - Page-specific customization
========================================================= */


/* =========================================================
   TEMPLATE UTILITIES
========================================================= */

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getValue(object, path, fallback = "") {
  if (!object || !path) {
    return fallback;
  }

  const keys = String(path).split(".");
  let current = object;

  for (const key of keys) {
    if (
      current === undefined ||
      current === null ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return fallback;
    }

    current = current[key];
  }

  return current === undefined || current === null
    ? fallback
    : current;
}


function getBoolean(object, path, fallback = false) {
  const value = getValue(object, path, fallback);

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return Boolean(value);
}


function getArray(object, path, fallback = []) {
  const value = getValue(object, path, fallback);

  return Array.isArray(value)
    ? value
    : fallback;
}


function getConfig() {
  if (
    window.AuthState &&
    typeof window.AuthState.getConfig === "function"
  ) {
    return window.AuthState.getConfig();
  }

  if (
    window.state &&
    typeof window.state.getConfig === "function"
  ) {
    return window.state.getConfig();
  }

  if (window.state && window.state.config) {
    return window.state.config;
  }

  return {};
}


/* =========================================================
   NORMALIZE PAGE NAME
========================================================= */

function normalizePageName(pageName) {
  const page = String(pageName || "login")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  const aliases = {
    login: "login",
    signin: "login",

    signup: "signup",
    register: "signup",

    forgot: "forgotPassword",
    forgotpassword: "forgotPassword",

    otp: "otp",
    verification: "otp",
    verify: "otp"
  };

  return aliases[page] || "login";
}


/* =========================================================
   GET PAGE CONFIG

   Supports both:
   config.login

   and

   config.pages.login
========================================================= */

function getPageConfig(config, pageName) {
  const page = normalizePageName(pageName);

  const directConfig =
    config[page] || {};

  const pagesConfig =
    config.pages &&
    config.pages[page]
      ? config.pages[page]
      : {};

  return {
    ...directConfig,
    ...pagesConfig
  };
}


/* =========================================================
   GET BRANDING
========================================================= */

function getBranding(config) {
  return config.branding || {};
}


/* =========================================================
   GET COLORS
========================================================= */

function getColors(config) {
  return config.colors || {};
}


/* =========================================================
   GET CARD CONFIG
========================================================= */

function getCardConfig(config) {
  return config.card || {};
}


/* =========================================================
   LOGO TEMPLATE
========================================================= */

function getLogoTemplate(config) {
  const branding = getBranding(config);

  const logo =
    branding.uploadedLogo ||
    branding.logoUrl ||
    branding.logo ||
    branding.image ||
    "";

  const brandName =
    branding.brandName ||
    branding.name ||
    "";

  const logoWidth =
    Number(branding.logoWidth) || 120;

  if (!logo && !brandName) {
    return "";
  }

  const logoHTML = logo
    ? `
      <div class="auth-brand-logo">
        <img
          src="${escapeHTML(logo)}"
          alt="Brand logo"
          style="max-width:${logoWidth}px;"
        />
      </div>
    `
    : "";

  const brandHTML = brandName
    ? `
      <div class="auth-brand-name">
        ${escapeHTML(brandName)}
      </div>
    `
    : "";

  return `
    <div class="auth-branding">
      ${logoHTML}
      ${brandHTML}
    </div>
  `;
}


/* =========================================================
   PAGE HEADER TEMPLATE
========================================================= */

function getPageHeader(
  title = "",
  subtitle = ""
) {
  const titleHTML = title
    ? `
      <h1 class="auth-page-title">
        ${escapeHTML(title)}
      </h1>
    `
    : "";

  const subtitleHTML = subtitle
    ? `
      <p class="auth-page-subtitle">
        ${escapeHTML(subtitle)}
      </p>
    `
    : "";

  return `
    <div class="auth-page-header">
      ${titleHTML}
      ${subtitleHTML}
    </div>
  `;
}


/* =========================================================
   IDENTIFIER FIELD
========================================================= */

function getIdentifierField(config, options = {}) {
  const login = getPageConfig(config, "login");

  const identifierTypes =
    options.identifierTypes ||
    login.identifierTypes ||
    login.identifierOptions ||
    getArray(
      config,
      "authentication.identifierTypes",
      ["email"]
    );

  const types = Array.isArray(identifierTypes)
    ? identifierTypes
    : ["email"];

  const defaultType =
    types.includes("email")
      ? "email"
      : types[0] || "email";

  const label =
    options.label ||
    login.identifierLabel ||
    "Email Address";

  const placeholder =
    options.placeholder ||
    login.identifierPlaceholder ||
    "Enter your email";

  const showSelector =
    options.showSelector !== undefined
      ? options.showSelector
      : login.showIdentifierSelector !== false &&
        types.length > 1;

  let selectorHTML = "";

  if (showSelector) {
    selectorHTML = `
      <select
        class="auth-identifier-type"
        id="identifier-type"
        aria-label="Identifier type"
      >
        ${types
          .map((type) => {
            const selected =
              type === defaultType
                ? "selected"
                : "";

            return `
              <option
                value="${escapeHTML(type)}"
                ${selected}
              >
                ${escapeHTML(
                  formatIdentifierType(type)
                )}
              </option>
            `;
          })
          .join("")}
      </select>
    `;
  }

  return `
    <div class="auth-field-group auth-identifier-group">

      ${
        showSelector
          ? `
            <div class="auth-identifier-selector">
              ${selectorHTML}
            </div>
          `
          : ""
      }

      <label
        class="auth-label"
        for="auth-identifier"
      >
        ${escapeHTML(label)}
      </label>

      <input
        id="auth-identifier"
        class="auth-input"
        type="${
          defaultType === "email"
            ? "email"
            : "text"
        }"
        placeholder="${escapeHTML(placeholder)}"
        autocomplete="${
          defaultType === "email"
            ? "email"
            : "username"
        }"
      />

    </div>
  `;
}


function formatIdentifierType(type) {
  const map = {
    email: "Email",
    mobile: "Mobile",
    phone: "Phone Number",
    whatsapp: "WhatsApp"
  };

  return map[type] || type;
}


/* =========================================================
   PASSWORD FIELD
========================================================= */

function getPasswordField(options = {}) {
  const {
    id = "auth-password",
    label = "Password",
    placeholder = "Enter your password",
    showToggle = true
  } = options;

  return `
    <div class="auth-field-group">

      <label
        class="auth-label"
        for="${escapeHTML(id)}"
      >
        ${escapeHTML(label)}
      </label>

      <div class="auth-password-wrapper">

        <input
          id="${escapeHTML(id)}"
          class="auth-input auth-password-input"
          type="password"
          placeholder="${escapeHTML(placeholder)}"
          autocomplete="current-password"
        />

        ${
          showToggle
            ? `
              <button
                type="button"
                class="auth-password-toggle"
                data-password-toggle="${escapeHTML(id)}"
                aria-label="Show password"
              >
                👁
              </button>
            `
            : ""
        }

      </div>

    </div>
  `;
}


/* =========================================================
   AUTH METHOD SELECTOR
========================================================= */

function getAuthenticationMethodSelector(config) {
  const login =
    getPageConfig(config, "login");

  const methods =
    login.authenticationMethods || {};

  const passwordEnabled =
    methods.password !== false &&
    getBoolean(
      config,
      "authentication.password.enabled",
      true
    );

  const otpEnabled =
    methods.otp === true ||
    getBoolean(
      config,
      "authentication.otp.enabled",
      true
    );

  const magicLinkEnabled =
    methods.magicLink === true ||
    getBoolean(
      config,
      "authentication.magicLink.enabled",
      false
    );

  const availableMethods = [];

  if (passwordEnabled) {
    availableMethods.push({
      value: "password",
      label: "Password"
    });
  }

  if (otpEnabled) {
    availableMethods.push({
      value: "otp",
      label: "OTP"
    });
  }

  if (magicLinkEnabled) {
    availableMethods.push({
      value: "magicLink",
      label: "Magic Link"
    });
  }

  if (availableMethods.length <= 1) {
    return "";
  }

  const defaultMethod =
    login.defaultAuthentication ||
    availableMethods[0].value;

  return `
    <div class="auth-method-selector">

      ${availableMethods
        .map((method) => {
          const active =
            method.value === defaultMethod
              ? "active"
              : "";

          return `
            <button
              type="button"
              class="auth-method-button ${active}"
              data-auth-method="${escapeHTML(method.value)}"
            >
              ${escapeHTML(method.label)}
            </button>
          `;
        })
        .join("")}

    </div>
  `;
}


/* =========================================================
   LOGIN PAGE
========================================================= */

function getLoginTemplate(config = getConfig()) {
  const login =
    getPageConfig(config, "login");

  const title =
    login.title ||
    "Welcome back";

  const subtitle =
    login.subtitle ||
    "Sign in to continue";

  const buttonText =
    login.buttonText ||
    login.loginButtonText ||
    "Sign In";

  const showRememberMe =
    login.showRememberMe !== false;

  const showForgotPassword =
    login.showForgotPassword !== false;

  const showSignup =
    login.showSignup !== false;

  const showPassword =
    login.showPassword !== false;

  return `
    <div
      class="auth-page auth-login-page"
      data-page="login"
    >

      ${getLogoTemplate(config)}

      ${getPageHeader(
        title,
        subtitle
      )}

      ${getAuthenticationMethodSelector(config)}

      <form
        class="auth-form"
        id="login-form"
        autocomplete="on"
      >

        ${getIdentifierField(config)}

        ${
          showPassword
            ? `
              <div
                class="auth-password-method"
                data-auth-content="password"
              >
                ${getPasswordField({
                  id: "login-password",
                  label: "Password",
                  placeholder: "Enter your password"
                })}
              </div>
            `
            : ""
        }

        ${
          getOtpLoginMethodTemplate(config)
        }

        ${
          showRememberMe ||
          showForgotPassword
            ? `
              <div class="auth-login-options">

                ${
                  showRememberMe
                    ? `
                      <label class="auth-checkbox-label">
                        <input
                          type="checkbox"
                          id="remember-me"
                        />
                        <span>
                          Remember me
                        </span>
                      </label>
                    `
                    : ""
                }

                ${
                  showForgotPassword
                    ? `
                      <button
                        type="button"
                        class="auth-text-button"
                        data-page-action="forgotPassword"
                      >
                        ${escapeHTML(
                          login.forgotPasswordText ||
                          "Forgot password?"
                        )}
                      </button>
                    `
                    : ""
                }

              </div>
            `
            : ""
        }

        <button
          type="submit"
          class="auth-primary-button"
          id="login-submit-button"
        >
          ${escapeHTML(buttonText)}
        </button>

      </form>

      ${getSocialLoginTemplate(config)}

      ${
        showSignup
          ? `
            <div class="auth-page-footer">

              <span>
                ${escapeHTML(
                  login.signupPrompt ||
                  "New here?"
                )}
              </span>

              <button
                type="button"
                class="auth-text-button"
                data-page-action="signup"
              >
                ${escapeHTML(
                  login.signupButtonText ||
                  "Create Account"
                )}
              </button>

            </div>
          `
          : ""
      }

    </div>
  `;
}


/* =========================================================
   OTP LOGIN METHOD
========================================================= */

function getOtpLoginMethodTemplate(config) {
  const login =
    getPageConfig(config, "login");

  const otpEnabled =
    login.authenticationMethods &&
    login.authenticationMethods.otp === true;

  const globalOtpEnabled =
    getBoolean(
      config,
      "authentication.otp.enabled",
      true
    );

  if (!otpEnabled && !globalOtpEnabled) {
    return "";
  }

  return `
    <div
      class="auth-otp-method"
      data-auth-content="otp"
      hidden
    >

      <div class="auth-field-group">

        <label
          class="auth-label"
          for="login-otp-identifier"
        >
          Email or Mobile Number
        </label>

        <input
          id="login-otp-identifier"
          class="auth-input"
          type="text"
          placeholder="Enter your email or mobile number"
        />

      </div>

      <button
        type="button"
        class="auth-secondary-button"
        data-page-action="otp"
      >
        Continue with OTP
      </button>

    </div>
  `;
}


/* =========================================================
   SIGNUP PAGE
========================================================= */

function getSignupTemplate(config = getConfig()) {
  const signup =
    getPageConfig(config, "signup");

  const fields =
    signup.fields || {};

  const title =
    signup.title ||
    "Create account";

  const subtitle =
    signup.subtitle ||
    "Create your account to get started";

  const buttonText =
    signup.buttonText ||
    "Create Account";

  return `
    <div
      class="auth-page auth-signup-page"
      data-page="signup"
    >

      ${getLogoTemplate(config)}

      ${getPageHeader(
        title,
        subtitle
      )}

      <form
        class="auth-form"
        id="signup-form"
      >

        ${
          fields.fullName !== false
            ? getTextField({
                id: "signup-full-name",
                label: "Full Name",
                placeholder: "Enter your full name",
                autocomplete: "name"
              })
            : ""
        }

        ${
          fields.username === true
            ? getTextField({
                id: "signup-username",
                label: "Username",
                placeholder: "Choose a username",
                autocomplete: "username"
              })
            : ""
        }

        ${
          fields.email !== false
            ? getTextField({
                id: "signup-email",
                type: "email",
                label: "Email Address",
                placeholder: "Enter your email",
                autocomplete: "email"
              })
            : ""
        }

        ${
          fields.mobile === true
            ? getTextField({
                id: "signup-mobile",
                type: "tel",
                label: "Mobile Number",
                placeholder: "Enter your mobile number",
                autocomplete: "tel"
              })
            : ""
        }

        ${
          fields.password !== false
            ? getPasswordField({
                id: "signup-password",
                label: "Password",
                placeholder: "Create a password"
              })
            : ""
        }

        ${
          fields.confirmPassword !== false
            ? getPasswordField({
                id: "signup-confirm-password",
                label: "Confirm Password",
                placeholder: "Confirm your password"
              })
            : ""
        }

        <button
          type="submit"
          class="auth-primary-button"
          id="signup-submit-button"
        >
          ${escapeHTML(buttonText)}
        </button>

      </form>

      ${getSocialLoginTemplate(config)}

      <div class="auth-page-footer">

        <span>
          ${escapeHTML(
            signup.loginPrompt ||
            "Already have an account?"
          )}
        </span>

        <button
          type="button"
          class="auth-text-button"
          data-page-action="login"
        >
          ${escapeHTML(
            signup.loginButtonText ||
            "Sign In"
          )}
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   FORGOT PASSWORD PAGE
========================================================= */

function getForgotPasswordTemplate(
  config = getConfig()
) {
  const forgotPassword =
    getPageConfig(
      config,
      "forgotPassword"
    );

  const title =
    forgotPassword.title ||
    "Forgot password?";

  const subtitle =
    forgotPassword.subtitle ||
    "Enter your email or mobile number and we will help you reset your password.";

  const buttonText =
    forgotPassword.buttonText ||
    "Send Reset Link";

  const backButtonText =
    forgotPassword.backButtonText ||
    "Back to login";

  return `
    <div
      class="auth-page auth-forgot-password-page"
      data-page="forgotPassword"
    >

      ${getLogoTemplate(config)}

      ${getPageHeader(
        title,
        subtitle
      )}

      <form
        class="auth-form"
        id="forgot-password-form"
      >

        ${getTextField({
          id: "forgot-identifier",
          type: "text",
          label: "Email or Mobile Number",
          placeholder: "Enter your email or mobile number",
          autocomplete: "username"
        })}

        <button
          type="submit"
          class="auth-primary-button"
          id="forgot-password-submit-button"
        >
          ${escapeHTML(buttonText)}
        </button>

      </form>

      <div class="auth-page-footer">

        <button
          type="button"
          class="auth-text-button"
          data-page-action="login"
        >
          ← ${escapeHTML(backButtonText)}
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   OTP PAGE
========================================================= */

function getOTPTemplate(config = getConfig()) {
  const otp =
    getPageConfig(config, "otp");

  const otpLength =
    getOtpLength(config, otp);

  const title =
    otp.title ||
    "Verify your identity";

  const subtitle =
    otp.subtitle ||
    "Enter the verification code sent to you.";

  const buttonText =
    otp.buttonText ||
    otp.verificationButtonText ||
    "Verify OTP";

  const resendEnabled =
    otp.resendEnabled !== false;

  const resendText =
    otp.resendText ||
    "Resend OTP";

  const backButtonText =
    otp.backButtonText ||
    "Back to login";

  const deliveryMethods =
    getOtpDeliveryMethods(config, otp);

  return `
    <div
      class="auth-page auth-otp-page"
      data-page="otp"
    >

      ${getLogoTemplate(config)}

      ${getPageHeader(
        title,
        subtitle
      )}

      ${getOtpDeliveryMethodSelector(
        deliveryMethods
      )}

      <form
        class="auth-form"
        id="otp-form"
      >

        ${getOtpInputs(
          otpLength
        )}

        <button
          type="submit"
          class="auth-primary-button"
          id="otp-submit-button"
        >
          ${escapeHTML(buttonText)}
        </button>

      </form>

      ${
        resendEnabled
          ? `
            <div class="auth-otp-resend">

              <span
                id="otp-resend-message"
              >
                Didn't receive the code?
              </span>

              <button
                type="button"
                class="auth-text-button"
                id="resend-otp-button"
                data-resend-seconds="${
                  Number(
                    otp.resendSeconds
                  ) || 30
                }"
              >
                ${escapeHTML(resendText)}
              </button>

            </div>
          `
          : ""
      }

      <div class="auth-page-footer">

        <button
          type="button"
          class="auth-text-button"
          data-page-action="login"
        >
          ← ${escapeHTML(backButtonText)}
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   OTP LENGTH
========================================================= */

function getOtpLength(config, otp) {
  const candidates = [
    otp.length,
    getValue(config, "otp.input.length"),
    getValue(config, "login.otpLength"),
    getValue(config, "authentication.otp.length")
  ];

  for (const candidate of candidates) {
    const length = Number(candidate);

    if (
      length === 4 ||
      length === 6 ||
      length === 8
    ) {
      return length;
    }
  }

  return 6;
}


/* =========================================================
   OTP DELIVERY METHODS
========================================================= */

function getOtpDeliveryMethods(config, otp) {
  const candidates = [
    otp.deliveryMethods,
    getValue(config, "otp.input.methods"),
    getValue(
      config,
      "authentication.otp.deliveryMethods"
    )
  ];

  for (const methods of candidates) {
    if (
      Array.isArray(methods) &&
      methods.length > 0
    ) {
      return methods;
    }
  }

  return [
    "email",
    "sms",
    "whatsapp"
  ];
}


/* =========================================================
   OTP DELIVERY METHOD SELECTOR
========================================================= */

function getOtpDeliveryMethodSelector(methods = []) {
  if (
    !Array.isArray(methods) ||
    methods.length <= 1
  ) {
    return "";
  }

  const labels = {
    email: "Email",
    sms: "SMS",
    whatsapp: "WhatsApp",
    authenticator: "Authenticator"
  };

  return `
    <div class="auth-otp-delivery-methods">

      ${methods
        .map((method, index) => {
          const active =
            index === 0
              ? "active"
              : "";

          return `
            <button
              type="button"
              class="auth-delivery-method ${active}"
              data-otp-delivery="${escapeHTML(method)}"
            >
              ${escapeHTML(
                labels[method] || method
              )}
            </button>
          `;
        })
        .join("")}

    </div>
  `;
}


/* =========================================================
   OTP INPUTS
========================================================= */

function getOtpInputs(length = 6) {
  const inputs = [];

  for (let index = 0; index < length; index += 1) {
    inputs.push(`
      <input
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        class="auth-otp-input"
        data-otp-index="${index}"
        aria-label="OTP digit ${index + 1}"
        autocomplete="one-time-code"
      />
    `);
  }

  return `
    <div
      class="auth-otp-inputs"
      data-otp-length="${length}"
    >
      ${inputs.join("")}
    </div>
  `;
}


/* =========================================================
   SOCIAL LOGIN
========================================================= */

function getSocialLoginTemplate(config) {
  const social =
    config.social || {};

  const providers =
    social.providers || {};

  const authSocial =
    getValue(
      config,
      "authentication.social",
      {}
    );

  const enabled =
    social.enabled !== false;

  if (!enabled) {
    return "";
  }

  const providerConfig = [
    {
      id: "google",
      label: "Google",
      enabled:
        providers.google === true ||
        getBoolean(
          authSocial,
          "google.enabled",
          false
        )
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      enabled:
        providers.linkedin === true ||
        getBoolean(
          authSocial,
          "linkedin.enabled",
          false
        )
    },
    {
      id: "github",
      label: "GitHub",
      enabled:
        providers.github === true ||
        getBoolean(
          authSocial,
          "github.enabled",
          false
        )
    },
    {
      id: "facebook",
      label: "Facebook",
      enabled:
        providers.facebook === true ||
        getBoolean(
          authSocial,
          "facebook.enabled",
          false
        )
    },
    {
      id: "apple",
      label: "Apple",
      enabled:
        providers.apple === true ||
        getBoolean(
          authSocial,
          "apple.enabled",
          false
        )
    }
  ].filter(
    (provider) =>
      provider.enabled
  );

  if (
    providerConfig.length === 0
  ) {
    return "";
  }

  return `
    <div class="auth-social-section">

      <div class="auth-divider">
        <span>
          ${escapeHTML(
            social.title ||
            "OR CONTINUE WITH"
          )}
        </span>
      </div>

      <div
        class="auth-social-buttons auth-social-${escapeHTML(
          social.layout || "vertical"
        )}"
      >

        ${providerConfig
          .map(
            (provider) => `
              <button
                type="button"
                class="auth-social-button"
                data-social-provider="${provider.id}"
              >
                ${getProviderIcon(provider.id)}
                <span>
                  Continue with ${escapeHTML(provider.label)}
                </span>
              </button>
            `
          )
          .join("")}

      </div>

    </div>
  `;
}


/* =========================================================
   SOCIAL ICONS
========================================================= */

function getProviderIcon(provider) {
  const icons = {
    google: "G",
    linkedin: "in",
    github: "⌘",
    facebook: "f",
    apple: "●"
  };

  return `
    <span
      class="auth-social-icon auth-social-${escapeHTML(provider)}"
    >
      ${icons[provider] || "•"}
    </span>
  `;
}


/* =========================================================
   GENERIC TEXT FIELD
========================================================= */

function getTextField(options = {}) {
  const {
    id = "",
    type = "text",
    label = "",
    placeholder = "",
    autocomplete = ""
  } = options;

  return `
    <div class="auth-field-group">

      ${
        label
          ? `
            <label
              class="auth-label"
              for="${escapeHTML(id)}"
            >
              ${escapeHTML(label)}
            </label>
          `
          : ""
      }

      <input
        id="${escapeHTML(id)}"
        class="auth-input"
        type="${escapeHTML(type)}"
        placeholder="${escapeHTML(placeholder)}"
        autocomplete="${escapeHTML(autocomplete)}"
      />

    </div>
  `;
}


/* =========================================================
   PAGE TEMPLATE SWITCHER
========================================================= */

function getPageTemplate(
  pageName,
  config = getConfig()
) {
  const page =
    normalizePageName(pageName);

  switch (page) {
    case "signup":
      return getSignupTemplate(config);

    case "forgotPassword":
      return getForgotPasswordTemplate(config);

    case "otp":
      return getOTPTemplate(config);

    case "login":
    default:
      return getLoginTemplate(config);
  }
}


/* =========================================================
   GET CURRENT PAGE TEMPLATE
========================================================= */

function getCurrentPageTemplate(
  config = getConfig()
) {
  const currentPage =
    config.currentPage ||
    getValue(
      config,
      "page.activePage",
      "login"
    );

  return getPageTemplate(
    currentPage,
    config
  );
}


/* =========================================================
   EXPORT ALL TEMPLATES
========================================================= */

window.AuthTemplates = {

  getPageTemplate,

  getCurrentPageTemplate,

  getLoginTemplate,

  getSignupTemplate,

  getForgotPasswordTemplate,

  getOTPTemplate,

  getOtpInputs,

  getOtpLength,

  getOtpDeliveryMethods,

  getLogoTemplate,

  getPageHeader,

  getIdentifierField,

  getPasswordField,

  getAuthenticationMethodSelector,

  getSocialLoginTemplate,

  getTextField,

  normalizePageName,

  escapeHTML
};


/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

window.getLoginTemplate =
  getLoginTemplate;

window.getSignupTemplate =
  getSignupTemplate;

window.getForgotPasswordTemplate =
  getForgotPasswordTemplate;

window.getOTPTemplate =
  getOTPTemplate;

window.getPageTemplate =
  getPageTemplate;

window.getCurrentPageTemplate =
  getCurrentPageTemplate;