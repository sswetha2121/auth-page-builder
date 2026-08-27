/* =========================================================
   AUTH PAGE BUILDER - HTML TEMPLATES
   File: js/templates.js
========================================================= */


/* =========================================================
   HELPER: ESCAPE HTML
========================================================= */

function escapeHTML(value = "") {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}


/* =========================================================
   HELPER: SAFE ATTRIBUTE
========================================================= */

function escapeAttribute(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


/* =========================================================
   HELPER: GET ACTIVE LOGO
========================================================= */

function getActiveLogo() {
  if (!window.config) {
    return "";
  }

  const branding = config.branding;

  if (
    branding.uploadedLogo &&
    branding.uploadedLogo.trim() !== ""
  ) {
    return branding.uploadedLogo;
  }

  return branding.logo || "";
}


/* =========================================================
   LOGO TEMPLATE
========================================================= */

function createLogoTemplate() {
  const branding = config.branding;

  if (!branding.showLogo) {
    return "";
  }

  const logo = getActiveLogo();

  if (!logo) {
    return "";
  }

  return `
    <div
      class="auth-logo-wrapper"
      data-logo-position="${escapeAttribute(
        branding.logoPosition
      )}"
    >
      <div class="auth-logo-container">
        <img
          src="${escapeAttribute(logo)}"
          alt="Brand logo"
          class="auth-logo"
        />
      </div>

      ${
        branding.showBrandName
          ? `
            <span class="auth-brand-name">
              ${escapeHTML(
                branding.brandName
              )}
            </span>
          `
          : ""
      }
    </div>
  `;
}


/* =========================================================
   BRAND HEADER
========================================================= */

function createBrandHeaderTemplate(
  pageType = "login"
) {
  let title = config.branding.title;
  let subtitle = config.branding.subtitle;

  if (pageType === "signup") {
    title = config.signup.title;
    subtitle = config.signup.subtitle;
  }

  if (pageType === "forgot") {
    title = config.forgotPassword.title;
    subtitle = config.forgotPassword.subtitle;
  }

  if (pageType === "otp") {
    title = config.otpPage.title;
    subtitle = config.otpPage.subtitle;
  }

  return `
    <div class="auth-brand-header">

      ${createLogoTemplate()}

      ${
        config.branding.showTitle
          ? `
            <h1 class="auth-title">
              ${escapeHTML(title)}
            </h1>
          `
          : ""
      }

      ${
        config.branding.showSubtitle
          ? `
            <p class="auth-subtitle">
              ${escapeHTML(subtitle)}
            </p>
          `
          : ""
      }

    </div>
  `;
}


/* =========================================================
   GENERIC INPUT FIELD
========================================================= */

function createInputTemplate({
  id,
  name,
  label,
  placeholder,
  type = "text",
  autocomplete = "",
  required = false,
  extraClass = "",
  icon = "",
  action = ""
}) {

  return `
    <div
      class="auth-field ${escapeAttribute(
        extraClass
      )}"
    >

      ${
        label
          ? `
            <label
              class="auth-label"
              for="${escapeAttribute(id)}"
            >
              ${escapeHTML(label)}
            </label>
          `
          : ""
      }

      <div class="auth-input-wrapper">

        ${
          icon
            ? `
              <span class="auth-input-icon">
                ${icon}
              </span>
            `
            : ""
        }

        <input
          id="${escapeAttribute(id)}"
          name="${escapeAttribute(name)}"
          type="${escapeAttribute(type)}"
          placeholder="${escapeAttribute(
            placeholder
          )}"
          autocomplete="${escapeAttribute(
            autocomplete
          )}"
          ${required ? "required" : ""}
          class="auth-input"
        />

        ${
          action
            ? action
            : ""
        }

      </div>

    </div>
  `;
}


/* =========================================================
   EMAIL FIELD
========================================================= */

function createEmailField(
  id = "loginEmail"
) {
  return createInputTemplate({
    id,
    name: "email",
    label: config.login.emailLabel,
    placeholder:
      config.login.emailPlaceholder,
    type: "email",
    autocomplete: "email",
    required: true
  });
}


/* =========================================================
   MOBILE FIELD
========================================================= */

function createMobileField(
  id = "loginMobile"
) {
  return createInputTemplate({
    id,
    name: "mobile",
    label: config.login.mobileLabel,
    placeholder:
      config.login.mobilePlaceholder,
    type: "tel",
    autocomplete: "tel",
    required: true
  });
}


/* =========================================================
   USERNAME FIELD
========================================================= */

function createUsernameField(
  id = "loginUsername"
) {
  return createInputTemplate({
    id,
    name: "username",
    label: config.login.usernameLabel,
    placeholder:
      config.login.usernamePlaceholder,
    type: "text",
    autocomplete: "username",
    required: true
  });
}


/* =========================================================
   LOGIN IDENTIFIER FIELD
========================================================= */

function createLoginIdentifierTemplate() {

  const identifier =
    config.login.identifier;

  if (identifier === "mobile") {
    return createMobileField();
  }

  if (identifier === "username") {
    return createUsernameField();
  }

  return createEmailField();
}


/* =========================================================
   IDENTIFIER SWITCHER
========================================================= */

function createIdentifierSwitcherTemplate() {

  if (
    !config.login.showIdentifierSwitcher
  ) {
    return "";
  }

  const allowed =
    config.login.allowedIdentifiers;

  const buttons = [];

  if (allowed.email) {
    buttons.push(`
      <button
        type="button"
        class="identifier-switch-button ${
          config.login.identifier === "email"
            ? "active"
            : ""
        }"
        data-auth-identifier="email"
      >
        Email
      </button>
    `);
  }

  if (allowed.mobile) {
    buttons.push(`
      <button
        type="button"
        class="identifier-switch-button ${
          config.login.identifier === "mobile"
            ? "active"
            : ""
        }"
        data-auth-identifier="mobile"
      >
        Mobile
      </button>
    `);
  }

  if (allowed.username) {
    buttons.push(`
      <button
        type="button"
        class="identifier-switch-button ${
          config.login.identifier === "username"
            ? "active"
            : ""
        }"
        data-auth-identifier="username"
      >
        Username
      </button>
    `);
  }

  if (buttons.length === 0) {
    return "";
  }

  return `
    <div class="identifier-switcher">
      ${buttons.join("")}
    </div>
  `;
}


/* =========================================================
   GET KEY SECTION
========================================================= */

function createGetKeyTemplate() {

  if (
    !config.authentication.getKeyEnabled
  ) {
    return "";
  }

  const options =
    config.authentication.getKeyOptions;

  const selected =
    config.authentication.selectedGetKey;

  return `
    <div class="auth-get-key-section">

      <div class="auth-get-key-label">
        ${escapeHTML(
          config.authentication.getKeyLabel
        )}
      </div>

      <div class="auth-get-key-options">

        ${options
          .map(
            (option) => `
              <label class="get-key-option">

                <input
                  type="radio"
                  name="getKeyFrom"
                  value="${escapeAttribute(
                    option
                  )}"
                  ${
                    option === selected
                      ? "checked"
                      : ""
                  }
                />

                <span class="get-key-radio"></span>

                <span class="get-key-text">
                  ${escapeHTML(option)}
                </span>

              </label>
            `
          )
          .join("")}

      </div>

    </div>
  `;
}


/* =========================================================
   PASSWORD FIELD
========================================================= */

function createPasswordField(
  id = "loginPassword"
) {

  if (
    !config.authentication.passwordEnabled
  ) {
    return "";
  }

  const toggle =
    config.passwordOptions
      .showPasswordToggle
      ? `
        <button
          type="button"
          class="auth-password-toggle"
          data-password-toggle="${escapeAttribute(
            id
          )}"
          aria-label="Show password"
        >
          👁
        </button>
      `
      : "";

  return createInputTemplate({
    id,
    name: "password",
    label:
      config.authentication.passwordLabel,
    placeholder:
      config.authentication.passwordPlaceholder,
    type: "password",
    autocomplete: "current-password",
    required:
      config.authentication.passwordRequired,
    extraClass:
      "auth-password-field",
    action: toggle
  });
}


/* =========================================================
   PASSWORD OPTIONS
========================================================= */

function createPasswordOptionsTemplate() {

  const options =
    config.passwordOptions;

  if (
    !options.showForgotPassword &&
    !options.rememberMeEnabled
  ) {
    return "";
  }

  return `
    <div class="auth-password-options">

      ${
        options.rememberMeEnabled
          ? `
            <label class="auth-checkbox-label">

              <input
                type="checkbox"
                class="auth-checkbox"
              />

              <span class="auth-checkbox-custom"></span>

              <span>
                ${escapeHTML(
                  options.rememberMeText
                )}
              </span>

            </label>
          `
          : "<span></span>"
      }

      ${
        options.showForgotPassword
          ? `
            <button
              type="button"
              class="auth-text-link"
              data-page="forgot"
            >
              ${escapeHTML(
                options.forgotPasswordText
              )}
            </button>
          `
          : ""
      }

    </div>
  `;
}


/* =========================================================
   OTP INPUTS
========================================================= */

function createOtpInputsTemplate() {

  if (
    !config.authentication.otpEnabled
  ) {
    return "";
  }

  const length =
    Number(
      config.authentication.otpLength
    ) || 6;

  const boxes = [];

  for (
    let index = 0;
    index < length;
    index++
  ) {
    boxes.push(`
      <input
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="otp-box"
        data-otp-index="${index}"
        aria-label="OTP digit ${
          index + 1
        }"
      />
    `);
  }

  return `
    <div class="auth-otp-section">

      <label class="auth-label">
        ${escapeHTML(
          config.authentication.otpLabel
        )}
      </label>

      <div class="otp-input-container">
        ${boxes.join("")}
      </div>

    </div>
  `;
}


/* =========================================================
   MAGIC LINK
========================================================= */

function createMagicLinkTemplate() {

  if (
    !config.authentication.magicLinkEnabled
  ) {
    return "";
  }

  return `
    <button
      type="button"
      class="auth-magic-link"
    >
      ${escapeHTML(
        config.authentication.magicLinkText
      )}
    </button>
  `;
}


/* =========================================================
   PRIMARY BUTTON
========================================================= */

function createPrimaryButtonTemplate(
  text,
  type = "submit"
) {
  return `
    <button
      type="${escapeAttribute(type)}"
      class="auth-primary-button"
    >
      ${escapeHTML(text)}
    </button>
  `;
}


/* =========================================================
   DIVIDER
========================================================= */

function createDividerTemplate() {

  if (!config.social.enabled) {
    return "";
  }

  const hasSocial =
    config.social.showGoogle ||
    config.social.showLinkedIn ||
    config.social.showFacebook ||
    config.social.showGitHub;

  if (!hasSocial) {
    return "";
  }

  return `
    <div class="auth-divider">

      <span class="auth-divider-line"></span>

      <span class="auth-divider-text">
        ${escapeHTML(
          config.social.dividerText
        )}
      </span>

      <span class="auth-divider-line"></span>

    </div>
  `;
}


/* =========================================================
   SOCIAL ICONS
========================================================= */

function getSocialIcon(provider) {

  const icons = {

    google: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.85h3.14c1.84-1.7 2.92-4.2 2.92-7.81Z"
        />
        <path
          d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.85c-.87.59-1.98.94-3.29.94-2.53 0-4.67-1.7-5.44-4v2.94H3.32v2.95A9.72 9.72 0 0 0 12 21.75Z"
        />
        <path
          d="M6.56 13.48A5.85 5.85 0 0 1 6.26 12c0-.51.09-1 .3-1.48V7.58H3.32A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.07 4.42l3.24-2.94Z"
        />
        <path
          d="M12 6.52c1.43 0 2.71.49 3.72 1.46l2.79-2.73C16.81 3.66 14.62 2.25 12 2.25a9.72 9.72 0 0 0-8.68 5.33l3.24 2.94c.77-2.3 2.91-4 5.44-4Z"
        />
      </svg>
    `,

    linkedin: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M5.34 8.5A1.94 1.94 0 1 0 5.34 4.62a1.94 1.94 0 0 0 0 3.88ZM3.66 9.96h3.36V20.75H3.66V9.96ZM9.14 9.96h3.22v1.48h.05c.45-.85 1.55-1.75 3.2-1.75 3.42 0 4.05 2.25 4.05 5.17v5.89h-3.35v-5.22c0-1.25-.02-2.86-1.74-2.86-1.74 0-2 1.36-2 2.77v5.31H9.14V9.96Z"
        />
      </svg>
    `,

    facebook: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M13.8 21v-8h2.68l.4-3.12H13.8V7.89c0-.9.25-1.52 1.55-1.52H17V3.58c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.03 1.46-4.03 4.14v2.28H7.85V13h2.71v8h3.24Z"
        />
      </svg>
    `,

    github: `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M12 2.3a9.7 9.7 0 0 0-3.07 18.9c.49.09.66-.21.66-.47v-1.87c-2.69.59-3.26-1.14-3.26-1.14-.44-1.12-1.08-1.42-1.08-1.42-.88-.6.07-.59.07-.59.97.07 1.48 1 1.48 1 .87 1.49 2.27 1.06 2.82.81.09-.63.34-1.06.62-1.3-2.15-.25-4.42-1.08-4.42-4.8 0-1.06.38-1.93 1-2.61-.1-.25-.43-1.24.1-2.59 0 0 .82-.26 2.67 1a9.24 9.24 0 0 1 4.86 0c1.85-1.26 2.67-1 2.67-1 .53 1.35.2 2.34.1 2.59.62.68 1 1.55 1 2.61 0 3.73-2.27 4.55-4.43 4.8.35.3.66.88.66 1.78v2.64c0 .26.18.56.67.47A9.7 9.7 0 0 0 12 2.3Z"
        />
      </svg>
    `
  };

  return icons[provider] || "";
}


/* =========================================================
   SOCIAL BUTTON
========================================================= */

function createSocialButtonTemplate(
  provider,
  label
) {
  return `
    <button
      type="button"
      class="auth-social-button"
      data-social-provider="${escapeAttribute(
        provider
      )}"
    >
      <span class="auth-social-icon">
        ${getSocialIcon(provider)}
      </span>

      <span>
        ${escapeHTML(label)}
      </span>
    </button>
  `;
}


/* =========================================================
   SOCIAL LOGIN
========================================================= */

function createSocialLoginTemplate() {

  if (!config.social.enabled) {
    return "";
  }

  const buttons = [];

  if (config.social.showGoogle) {
    buttons.push(
      createSocialButtonTemplate(
        "google",
        "Continue with Google"
      )
    );
  }

  if (config.social.showLinkedIn) {
    buttons.push(
      createSocialButtonTemplate(
        "linkedin",
        "Continue with LinkedIn"
      )
    );
  }

  if (config.social.showFacebook) {
    buttons.push(
      createSocialButtonTemplate(
        "facebook",
        "Continue with Facebook"
      )
    );
  }

  if (config.social.showGitHub) {
    buttons.push(
      createSocialButtonTemplate(
        "github",
        "Continue with GitHub"
      )
    );
  }

  if (buttons.length === 0) {
    return "";
  }

  return `
    <div
      class="auth-social-login"
      data-social-layout="${escapeAttribute(
        config.social.layout
      )}"
    >
      ${buttons.join("")}
    </div>
  `;
}


/* =========================================================
   SIGNUP FOOTER
========================================================= */

function createSignupFooterTemplate() {

  if (!config.signup.enabled) {
    return "";
  }

  return `
    <div class="auth-page-footer">

      <span>
        ${escapeHTML(
          config.signup.bottomText
        )}
      </span>

      <button
        type="button"
        class="auth-text-link"
        data-page="signup"
      >
        ${escapeHTML(
          config.signup.linkText
        )}
      </button>

    </div>
  `;
}


/* =========================================================
   LOGIN FOOTER
========================================================= */

function createLoginFooterTemplate() {

  return `
    <div class="auth-page-footer">

      <span>
        ${escapeHTML(
          config.signup.loginText
        )}
      </span>

      <button
        type="button"
        class="auth-text-link"
        data-page="login"
      >
        ${escapeHTML(
          config.signup.loginLinkText
        )}
      </button>

    </div>
  `;
}


/* =========================================================
   TERMS
========================================================= */

function createTermsTemplate() {

  if (
    !config.bottomContent.showTerms
  ) {
    return "";
  }

  return `
    <div class="auth-terms">
      ${escapeHTML(
        config.bottomContent.termsText
      )}
    </div>
  `;
}


/* =========================================================
   LOGIN PAGE TEMPLATE
========================================================= */

function createLoginTemplate() {

  return `
    <div class="auth-page auth-login-page">

      <form
        class="auth-form"
        novalidate
      >

        ${createBrandHeaderTemplate(
          "login"
        )}

        ${createIdentifierSwitcherTemplate()}

        ${createLoginIdentifierTemplate()}

        ${createGetKeyTemplate()}

        ${createPasswordField()}

        ${createPasswordOptionsTemplate()}

        ${createOtpInputsTemplate()}

        ${createMagicLinkTemplate()}

        ${createPrimaryButtonTemplate(
          config.button.text
        )}

        ${createDividerTemplate()}

        ${createSocialLoginTemplate()}

        ${createSignupFooterTemplate()}

        ${createTermsTemplate()}

      </form>

    </div>
  `;
}


/* =========================================================
   SIGNUP USERNAME
========================================================= */

function createSignupUsernameTemplate() {

  return createInputTemplate({
    id: "signupUsername",
    name: "username",
    label:
      config.signup.usernameLabel,
    placeholder:
      config.signup.usernamePlaceholder,
    type: "text",
    autocomplete: "username",
    required: true
  });
}


/* =========================================================
   SIGNUP EMAIL
========================================================= */

function createSignupEmailTemplate() {

  return createInputTemplate({
    id: "signupEmail",
    name: "email",
    label:
      config.signup.emailLabel,
    placeholder:
      config.signup.emailPlaceholder,
    type: "email",
    autocomplete: "email",
    required: true
  });
}


/* =========================================================
   SIGNUP MOBILE
========================================================= */

function createSignupMobileTemplate() {

  return createInputTemplate({
    id: "signupMobile",
    name: "mobile",
    label:
      config.signup.mobileLabel,
    placeholder:
      config.signup.mobilePlaceholder,
    type: "tel",
    autocomplete: "tel",
    required: true
  });
}


/* =========================================================
   SIGNUP PASSWORD
========================================================= */

function createSignupPasswordTemplate() {

  return createInputTemplate({
    id: "signupPassword",
    name: "password",
    label:
      config.signup.passwordLabel,
    placeholder:
      config.signup.passwordPlaceholder,
    type: "password",
    autocomplete: "new-password",
    required: true
  });
}


/* =========================================================
   CONFIRM PASSWORD
========================================================= */

function createConfirmPasswordTemplate() {

  return createInputTemplate({
    id: "signupConfirmPassword",
    name: "confirmPassword",
    label:
      config.signup.confirmPasswordLabel,
    placeholder:
      config.signup.confirmPasswordPlaceholder,
    type: "password",
    autocomplete: "new-password",
    required: true
  });
}


/* =========================================================
   SIGNUP PAGE TEMPLATE
========================================================= */

function createSignupTemplate() {

  const fields =
    config.signup.fields;

  return `
    <div class="auth-page auth-signup-page">

      <form
        class="auth-form"
        novalidate
      >

        ${createBrandHeaderTemplate(
          "signup"
        )}

        ${
          fields.username
            ? createSignupUsernameTemplate()
            : ""
        }

        ${
          fields.email
            ? createSignupEmailTemplate()
            : ""
        }

        ${
          fields.mobile
            ? createSignupMobileTemplate()
            : ""
        }

        ${
          fields.password
            ? createSignupPasswordTemplate()
            : ""
        }

        ${
          fields.confirmPassword
            ? createConfirmPasswordTemplate()
            : ""
        }

        ${createPrimaryButtonTemplate(
          config.signup.buttonText
        )}

        ${createLoginFooterTemplate()}

        ${createTermsTemplate()}

      </form>

    </div>
  `;
}


/* =========================================================
   FORGOT PASSWORD TEMPLATE
========================================================= */

function createForgotPasswordTemplate() {

  const forgot =
    config.forgotPassword;

  return `
    <div class="auth-page auth-forgot-page">

      <form
        class="auth-form"
        novalidate
      >

        ${createBrandHeaderTemplate(
          "forgot"
        )}

        ${createInputTemplate({
          id: "forgotEmail",
          name: "email",
          label:
            forgot.emailLabel,
          placeholder:
            forgot.emailPlaceholder,
          type: "email",
          autocomplete: "email",
          required: true
        })}

        ${createPrimaryButtonTemplate(
          forgot.buttonText
        )}

        <div class="auth-page-footer">

          <button
            type="button"
            class="auth-text-link"
            data-page="login"
          >
            ← ${escapeHTML(
              forgot.backText
            )}
          </button>

        </div>

      </form>

    </div>
  `;
}


/* =========================================================
   OTP PAGE TEMPLATE
========================================================= */

function createOtpPageTemplate() {

  const length =
    Number(
      config.authentication.otpLength
    ) || 6;

  const boxes = [];

  for (
    let index = 0;
    index < length;
    index++
  ) {
    boxes.push(`
      <input
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="otp-box"
        data-otp-index="${index}"
        aria-label="OTP digit ${
          index + 1
        }"
      />
    `);
  }

  return `
    <div class="auth-page auth-otp-page">

      <form
        class="auth-form"
        novalidate
      >

        ${createBrandHeaderTemplate(
          "otp"
        )}

        <div class="auth-otp-section">

          <div class="otp-input-container">
            ${boxes.join("")}
          </div>

        </div>

        ${createPrimaryButtonTemplate(
          config.otpPage.buttonText
        )}

        ${
          config.otpPage.resendEnabled
            ? `
              <div class="auth-page-footer">

                <button
                  type="button"
                  class="auth-text-link"
                  data-action="resend-otp"
                >
                  ${escapeHTML(
                    config.otpPage.resendText
                  )}
                </button>

              </div>
            `
            : ""
        }

        <div class="auth-page-footer">

          <button
            type="button"
            class="auth-text-link"
            data-page="login"
          >
            ← Back to login
          </button>

        </div>

      </form>

    </div>
  `;
}


/* =========================================================
   PAGE ROUTER
========================================================= */

function getPageTemplate(
  page = config.currentPage
) {

  switch (page) {

    case "signup":
      return createSignupTemplate();

    case "forgot":
      return createForgotPasswordTemplate();

    case "otp":
      return createOtpPageTemplate();

    case "login":
    default:
      return createLoginTemplate();

  }
}


/* =========================================================
   EXPOSE TEMPLATE FUNCTIONS
========================================================= */

window.authTemplates = {

  getPageTemplate,

  createLoginTemplate,

  createSignupTemplate,

  createForgotPasswordTemplate,

  createOtpPageTemplate,

  createLogoTemplate,

  createBrandHeaderTemplate,

  createLoginIdentifierTemplate,

  createIdentifierSwitcherTemplate,

  createGetKeyTemplate,

  createPasswordField,

  createPasswordOptionsTemplate,

  createOtpInputsTemplate,

  createMagicLinkTemplate,

  createPrimaryButtonTemplate,

  createDividerTemplate,

  createSocialLoginTemplate,

  createSignupFooterTemplate,

  createLoginFooterTemplate,

  createTermsTemplate
};