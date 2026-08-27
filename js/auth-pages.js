/* =========================================================
   AUTH PAGE BUILDER
   File: js/auth-page.js

   Dynamic Authentication Page Renderer
========================================================= */

class AuthPage {
  constructor(container, config = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    this.config = config;

    this.currentPage = "login";
    this.identifierType = "email";
    this.passwordVisible = false;
    this.forgotPasswordStep = "identifier";

    this.defaultConfig = {
      page: {
        activePage: "login"
      },

      branding: {
        logo: "",
        logoText: "AUTH",
        logoStyle: "circle",
        logoPosition: "top",
        showLogo: true,
        showBrandName: true,
        brandName: "Welcome Back",
        subtitle: "Sign in to continue to your account"
      },

      background: {
        type: "default",
        image: "",
        color: "#0f172a",
        overlayColor: "#000000",
        overlayOpacity: 0.2,
        position: "center center",
        size: "cover",
        showPanel: true
      },

      layout: {
        type: "split",
        backgroundSide: "left",
        authWidth: 50,
        mobileBackgroundVisible: false,
        cardPosition: "center"
      },

      card: {
        backgroundColor: "#ffffff",
        textColor: "#0f172a",
        width: 420,
        padding: 42,
        borderRadius: 18,
        shadow: "medium",
        showCard: true
      },

      typography: {
        fontFamily: "Inter, Arial, sans-serif",
        titleSize: 30,
        subtitleSize: 14,
        bodySize: 14,
        fontWeight: 700
      },

      login: {
        identifierEnabled: true,
        identifierLabel: "Email or Mobile Number",
        identifierPlaceholder: "Enter your email or mobile number",

        showIdentifierSelector: true,
        identifierOptions: ["email", "mobile"],

        authenticationMethods: {
          otp: true,
          password: true
        },

        defaultAuthentication: "password",

        otpLength: 6,

        showRememberMe: true,
        showForgotPassword: true,

        loginButtonText: "Login"
      },

      signup: {
        enabled: true,
        buttonText: "Create Account",

        fields: {
          username: true,
          email: true,
          mobile: true,
          password: true,
          confirmPassword: true
        }
      },

      social: {
        enabled: true,

        providers: {
          google: true,
          facebook: true,
          apple: false
        },

        title: "Or continue with"
      },

      colors: {
        primary: "#2563eb",
        primaryHover: "#1d4ed8",
        inputBackground: "#ffffff",
        inputBorder: "#cbd5e1",
        inputText: "#0f172a",
        mutedText: "#64748b",
        linkColor: "#2563eb"
      }
    };

    this.config = this.mergeDeep(
      this.defaultConfig,
      this.config
    );

    if (this.config.page?.activePage) {
      this.currentPage =
        this.config.page.activePage;
    }

    this.render();
  }


  /* =======================================================
     DEEP MERGE
  ======================================================= */

  mergeDeep(target, source) {
    const output = { ...target };

    if (!source) {
      return output;
    }

    Object.keys(source).forEach((key) => {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        output[key] = this.mergeDeep(
          target[key] || {},
          source[key]
        );
      } else {
        output[key] = source[key];
      }
    });

    return output;
  }


  /* =======================================================
     UPDATE CONFIG
  ======================================================= */

  updateConfig(newConfig = {}) {
    this.config = this.mergeDeep(
      this.config,
      newConfig
    );

    this.render();
  }


  /* =======================================================
     SET CURRENT PAGE
  ======================================================= */

  setPage(page) {
    this.currentPage = page;

    this.render();
  }


  /* =======================================================
     MAIN RENDER
  ======================================================= */

  render() {
    if (!this.container) {
      console.error(
        "AuthPage: Container element not found."
      );

      return;
    }

    this.applyDynamicVariables();

    this.container.innerHTML = `
      <div class="auth-page-builder-runtime">
        ${this.renderAuthPage()}
      </div>
    `;

    this.attachEventListeners();
  }


  /* =======================================================
     DYNAMIC CSS VARIABLES
  ======================================================= */

  applyDynamicVariables() {
    const root = this.container;

    const config = this.config;

    root.style.setProperty(
      "--auth-primary",
      config.colors.primary
    );

    root.style.setProperty(
      "--auth-primary-hover",
      config.colors.primaryHover
    );

    root.style.setProperty(
      "--auth-card-background",
      config.card.backgroundColor
    );

    root.style.setProperty(
      "--auth-text-color",
      config.card.textColor
    );

    root.style.setProperty(
      "--auth-input-background",
      config.colors.inputBackground
    );

    root.style.setProperty(
      "--auth-input-border",
      config.colors.inputBorder
    );

    root.style.setProperty(
      "--auth-input-text",
      config.colors.inputText
    );

    root.style.setProperty(
      "--auth-muted-text",
      config.colors.mutedText
    );

    root.style.setProperty(
      "--auth-link-color",
      config.colors.linkColor
    );

    root.style.setProperty(
      "--auth-font-family",
      config.typography.fontFamily
    );

    root.style.setProperty(
      "--auth-title-size",
      `${config.typography.titleSize}px`
    );

    root.style.setProperty(
      "--auth-subtitle-size",
      `${config.typography.subtitleSize}px`
    );

    root.style.setProperty(
      "--auth-body-size",
      `${config.typography.bodySize}px`
    );

    root.style.setProperty(
      "--auth-card-radius",
      `${config.card.borderRadius}px`
    );

    root.style.setProperty(
      "--auth-card-padding",
      `${config.card.padding}px`
    );

    root.style.setProperty(
      "--auth-card-width",
      `${config.card.width}px`
    );
  }


  /* =======================================================
     AUTH PAGE STRUCTURE
  ======================================================= */

  renderAuthPage() {
    const layout = this.config.layout;

    const backgroundFirst =
      layout.backgroundSide === "left";

    const backgroundPanel =
      this.renderBackgroundPanel();

    const formPanel =
      this.renderFormPanel();

    return `
      <div
        class="
          auth-page
          auth-layout-${layout.type}
          auth-background-${layout.backgroundSide}
        "
      >
        ${
          layout.type === "split"
            ? `
              ${
                backgroundFirst
                  ? backgroundPanel + formPanel
                  : formPanel + backgroundPanel
              }
            `
            : `
              ${backgroundPanel}
              ${formPanel}
            `
        }
      </div>
    `;
  }


  /* =======================================================
     BACKGROUND PANEL
  ======================================================= */

  renderBackgroundPanel() {
    const background =
      this.config.background;

    if (!background.showPanel) {
      return "";
    }

    const backgroundStyle =
      this.getBackgroundStyle();

    return `
      <div
        class="auth-background-panel"
        style="${backgroundStyle}"
      >
        <div
          class="auth-background-overlay"
          style="
            background:
              ${background.overlayColor};

            opacity:
              ${background.overlayOpacity};
          "
        ></div>

        <div class="auth-background-content">
          ${this.renderBackgroundBranding()}
        </div>
      </div>
    `;
  }


  /* =======================================================
     BACKGROUND STYLE
  ======================================================= */

  getBackgroundStyle() {
    const background =
      this.config.background;

    if (
      background.type === "image" &&
      background.image
    ) {
      return `
        background-image:
          url('${background.image}');

        background-size:
          ${background.size};

        background-position:
          ${background.position};

        background-repeat:
          no-repeat;
      `;
    }

    if (background.type === "gradient") {
      return `
        background:
          linear-gradient(
            135deg,
            ${background.color},
            ${this.config.colors.primary}
          );
      `;
    }

    return `
      background:
        ${background.color};
    `;
  }


  /* =======================================================
     BACKGROUND BRANDING
  ======================================================= */

  renderBackgroundBranding() {
    const branding =
      this.config.branding;

    return `
      <div class="background-branding">
        ${
          branding.showLogo
            ? this.renderLogo()
            : ""
        }

        ${
          branding.showBrandName
            ? `
              <h1>
                ${this.escapeHTML(
                  branding.brandName
                )}
              </h1>

              <p>
                ${this.escapeHTML(
                  branding.subtitle
                )}
              </p>
            `
            : ""
        }
      </div>
    `;
  }


  /* =======================================================
     FORM PANEL
  ======================================================= */

  renderFormPanel() {
    const layout =
      this.config.layout;

    return `
      <div
        class="
          auth-form-panel
          auth-card-position-${layout.cardPosition}
        "
      >
        ${this.renderAuthCard()}
      </div>
    `;
  }


  /* =======================================================
     AUTH CARD
  ======================================================= */

  renderAuthCard() {
    const card =
      this.config.card;

    return `
      <div
        class="
          auth-card
          ${card.showCard ? "" : "auth-card-transparent"}
          auth-shadow-${card.shadow}
        "
      >
        <div class="auth-card-inner">
          ${this.renderPageContent()}
        </div>
      </div>
    `;
  }


  /* =======================================================
     PAGE CONTENT
  ======================================================= */

  renderPageContent() {
    switch (this.currentPage) {
      case "signup":
        return this.renderSignupPage();

      case "forgot":
        return this.renderForgotPasswordPage();

      case "otp":
        return this.renderOTPPage();

      case "login":
      default:
        return this.renderLoginPage();
    }
  }


  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  renderLoginPage() {
    const login =
      this.config.login;

    const social =
      this.config.social;

    return `
      <div class="auth-form-content">

        ${this.renderFormBranding()}

        <div class="auth-form-heading">
          <h2>
            Welcome back
          </h2>

          <p>
            Login to access your account
          </p>
        </div>

        <form
          class="auth-form"
          id="login-form"
        >
          ${
            login.identifierEnabled
              ? this.renderIdentifierField()
              : ""
          }

          ${
            login.showIdentifierSelector
              ? this.renderIdentifierSelector()
              : ""
          }

          ${
            this.renderAuthenticationFields()
          }

          ${
            login.showRememberMe ||
            login.showForgotPassword
              ? this.renderLoginOptions()
              : ""
          }

          <button
            type="submit"
            class="auth-primary-button"
          >
            ${this.escapeHTML(
              login.loginButtonText
            )}
          </button>
        </form>

        ${
          social.enabled
            ? this.renderSocialLogin()
            : ""
        }

        ${
          this.config.signup.enabled
            ? this.renderSignupLink()
            : ""
        }

      </div>
    `;
  }


  /* =======================================================
     FORM BRANDING
  ======================================================= */

  renderFormBranding() {
    const branding =
      this.config.branding;

    if (
      !branding.showLogo &&
      !branding.showBrandName
    ) {
      return "";
    }

    return `
      <div
        class="
          auth-form-branding
          auth-logo-position-${branding.logoPosition}
        "
      >
        ${
          branding.showLogo
            ? this.renderLogo()
            : ""
        }
      </div>
    `;
  }


  /* =======================================================
     LOGO
  ======================================================= */

  renderLogo() {
    const branding =
      this.config.branding;

    const styleClass =
      `auth-logo-${branding.logoStyle}`;

    if (branding.logo) {
      return `
        <div
          class="
            auth-logo
            ${styleClass}
          "
        >
          <img
            src="${branding.logo}"
            alt="Logo"
          />
        </div>
      `;
    }

    return `
      <div
        class="
          auth-logo
          ${styleClass}
        "
      >
        <span>
          ${this.escapeHTML(
            branding.logoText
          )}
        </span>
      </div>
    `;
  }


  /* =======================================================
     IDENTIFIER FIELD
  ======================================================= */

  renderIdentifierField() {
    const login =
      this.config.login;

    const isEmail =
      this.identifierType === "email";

    return `
      <div class="auth-form-group">

        <label class="auth-label">
          ${
            isEmail
              ? "Email Address"
              : "Mobile Number"
          }
        </label>

        <div class="auth-input-wrapper">
          <input
            id="login-identifier"

            type="${
              isEmail
                ? "email"
                : "tel"
            }"

            class="auth-input"

            placeholder="${
              isEmail
                ? "Enter your email address"
                : "Enter your mobile number"
            }"
          />
        </div>

      </div>
    `;
  }


  /* =======================================================
     IDENTIFIER SELECTOR
  ======================================================= */

  renderIdentifierSelector() {
    const options =
      this.config.login.identifierOptions;

    if (!options || options.length === 0) {
      return "";
    }

    return `
      <div class="auth-identifier-selector">

        ${options
          .map(
            (option) => `
              <button
                type="button"

                class="
                  auth-identifier-option
                  ${
                    this.identifierType === option
                      ? "active"
                      : ""
                  }
                "

                data-identifier="${option}"
              >
                ${
                  option === "email"
                    ? "Email"
                    : "Mobile Number"
                }
              </button>
            `
          )
          .join("")}

      </div>
    `;
  }


  /* =======================================================
     AUTHENTICATION METHOD
  ======================================================= */

  renderAuthenticationFields() {
    const methods =
      this.config.login.authenticationMethods;

    const defaultMethod =
      this.config.login.defaultAuthentication;

    if (
      defaultMethod === "otp" &&
      methods.otp
    ) {
      return this.renderGetKeySection();
    }

    if (
      defaultMethod === "password" &&
      methods.password
    ) {
      return this.renderPasswordField();
    }

    if (methods.password) {
      return this.renderPasswordField();
    }

    if (methods.otp) {
      return this.renderGetKeySection();
    }

    return "";
  }


  /* =======================================================
     PASSWORD FIELD
  ======================================================= */

  renderPasswordField() {
    return `
      <div class="auth-form-group">

        <div class="auth-label-row">

          <label class="auth-label">
            Password
          </label>

        </div>

        <div class="auth-password-wrapper">

          <input
            id="login-password"

            type="${
              this.passwordVisible
                ? "text"
                : "password"
            }"

            class="auth-input"

            placeholder="Enter your password"
          />

          <button
            type="button"

            class="auth-password-toggle"

            id="password-toggle"

            aria-label="Toggle password visibility"
          >
            ${
              this.passwordVisible
                ? "Hide"
                : "Show"
            }
          </button>

        </div>

      </div>
    `;
  }


  /* =======================================================
     GET KEY SECTION
  ======================================================= */

  renderGetKeySection() {
    const methods =
      this.config.login.authenticationMethods;

    return `
      <div class="auth-get-key-section">

        <div class="auth-get-key-header">

          <span>
            Get key from
          </span>

        </div>

        <div class="auth-get-key-options">

          ${
            methods.otp
              ? `
                <button
                  type="button"

                  class="auth-get-key-option"

                  data-auth-method="otp"
                >
                  Email / SMS OTP
                </button>
              `
              : ""
          }

          ${
            methods.password
              ? `
                <button
                  type="button"

                  class="auth-get-key-option"

                  data-auth-method="password"
                >
                  Password
                </button>
              `
              : ""
          }

        </div>

      </div>
    `;
  }


  /* =======================================================
     LOGIN OPTIONS
  ======================================================= */

  renderLoginOptions() {
    const login =
      this.config.login;

    return `
      <div class="auth-login-options">

        ${
          login.showRememberMe
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
          login.showForgotPassword
            ? `
              <button
                type="button"

                class="auth-text-button"

                data-page="forgot"
              >
                Forgot password?
              </button>
            `
            : ""
        }

      </div>
    `;
  }


  /* =======================================================
     OTP PAGE
  ======================================================= */

  renderOTPPage() {
    const otpLength =
      this.config.login.otpLength || 6;

    return `
      <div class="auth-form-content">

        <button
          type="button"

          class="auth-back-button"

          data-page="login"
        >
          ← Back to login
        </button>

        <div class="auth-form-heading">
          <h2>
            Verify your account
          </h2>

          <p>
            Enter the verification code sent to you
          </p>
        </div>

        <div class="auth-otp-container">

          ${Array.from(
            { length: otpLength }
          )
            .map(
              (_, index) => `
                <input
                  type="text"

                  maxlength="1"

                  inputmode="numeric"

                  class="auth-otp-input"

                  data-otp-index="${index}"
                />
              `
            )
            .join("")}

        </div>

        <button
          type="button"

          class="auth-primary-button"

          id="verify-otp"
        >
          Verify
        </button>

      </div>
    `;
  }


  /* =======================================================
     SIGNUP PAGE
  ======================================================= */

  renderSignupPage() {
    const fields =
      this.config.signup.fields;

    return `
      <div class="auth-form-content">

        ${this.renderFormBranding()}

        <div class="auth-form-heading">
          <h2>
            Create your account
          </h2>

          <p>
            Fill in your details to get started
          </p>
        </div>

        <form
          class="auth-form"
          id="signup-form"
        >

          ${
            fields.username
              ? this.renderSignupInput(
                  "username",
                  "Username",
                  "Enter your username",
                  "text"
                )
              : ""
          }

          ${
            fields.email
              ? this.renderSignupInput(
                  "email",
                  "Email Address",
                  "Enter your email address",
                  "email"
                )
              : ""
          }

          ${
            fields.mobile
              ? this.renderSignupInput(
                  "mobile",
                  "Mobile Number",
                  "Enter your mobile number",
                  "tel"
                )
              : ""
          }

          ${
            fields.password
              ? this.renderSignupInput(
                  "password",
                  "Password",
                  "Create a password",
                  "password"
                )
              : ""
          }

          ${
            fields.confirmPassword
              ? this.renderSignupInput(
                  "confirm-password",
                  "Confirm Password",
                  "Confirm your password",
                  "password"
                )
              : ""
          }

          <button
            type="submit"

            class="auth-primary-button"
          >
            ${this.escapeHTML(
              this.config.signup.buttonText
            )}
          </button>

        </form>

        <div class="auth-page-switch">

          <span>
            Already have an account?
          </span>

          <button
            type="button"

            class="auth-text-button"

            data-page="login"
          >
            Login
          </button>

        </div>

      </div>
    `;
  }


  /* =======================================================
     SIGNUP INPUT
  ======================================================= */

  renderSignupInput(
    name,
    label,
    placeholder,
    type
  ) {
    return `
      <div class="auth-form-group">

        <label
          class="auth-label"

          for="${name}"
        >
          ${label}
        </label>

        <input
          id="${name}"

          name="${name}"

          type="${type}"

          class="auth-input"

          placeholder="${placeholder}"
        />

      </div>
    `;
  }


  /* =======================================================
     FORGOT PASSWORD PAGE
  ======================================================= */

  renderForgotPasswordPage() {
    return `
      <div class="auth-form-content">

        <button
          type="button"

          class="auth-back-button"

          data-page="login"
        >
          ← Back to login
        </button>

        <div class="auth-form-heading">
          <h2>
            Forgot password?
          </h2>

          <p>
            Enter your email or mobile number.
            We will send you a verification key.
          </p>
        </div>

        <form
          class="auth-form"

          id="forgot-password-form"
        >

          <div class="auth-form-group">

            <label class="auth-label">
              Email or Mobile Number
            </label>

            <input
              id="forgot-identifier"

              type="text"

              class="auth-input"

              placeholder="
                Enter email or mobile number
              "
            />

          </div>

          <button
            type="submit"

            class="auth-primary-button"
          >
            Send Verification Key
          </button>

        </form>

      </div>
    `;
  }


  /* =======================================================
     SOCIAL LOGIN
  ======================================================= */

  renderSocialLogin() {
    const social =
      this.config.social;

    const buttons = [];

    if (social.providers.google) {
      buttons.push(`
        <button
          type="button"

          class="auth-social-button"

          data-provider="google"
        >
          <span class="social-icon">
            G
          </span>

          Continue with Google
        </button>
      `);
    }

    if (social.providers.facebook) {
      buttons.push(`
        <button
          type="button"

          class="auth-social-button"

          data-provider="facebook"
        >
          <span class="social-icon">
            f
          </span>

          Continue with Facebook
        </button>
      `);
    }

    if (social.providers.apple) {
      buttons.push(`
        <button
          type="button"

          class="auth-social-button"

          data-provider="apple"
        >
          <span class="social-icon">
            
          </span>

          Continue with Apple
        </button>
      `);
    }

    if (buttons.length === 0) {
      return "";
    }

    return `
      <div class="auth-social-section">

        <div class="auth-divider">
          <span>
            ${this.escapeHTML(
              social.title
            )}
          </span>
        </div>

        <div class="auth-social-buttons">
          ${buttons.join("")}
        </div>

      </div>
    `;
  }


  /* =======================================================
     SIGNUP LINK
  ======================================================= */

  renderSignupLink() {
    return `
      <div class="auth-page-switch">

        <span>
          Don't have an account?
        </span>

        <button
          type="button"

          class="auth-text-button"

          data-page="signup"
        >
          Create Account
        </button>

      </div>
    `;
  }


  /* =======================================================
     EVENT LISTENERS
  ======================================================= */

  attachEventListeners() {
    this.attachPageNavigation();

    this.attachIdentifierSelection();

    this.attachPasswordToggle();

    this.attachAuthenticationMethods();

    this.attachOTPInputs();

    this.attachForms();

    this.attachSocialButtons();
  }


  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  attachPageNavigation() {
    const buttons =
      this.container.querySelectorAll(
        "[data-page]"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.setPage(
            button.dataset.page
          );
        }
      );
    });
  }


  /* =======================================================
     IDENTIFIER SELECTION
  ======================================================= */

  attachIdentifierSelection() {
    const buttons =
      this.container.querySelectorAll(
        "[data-identifier]"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.identifierType =
            button.dataset.identifier;

          this.render();
        }
      );
    });
  }


  /* =======================================================
     PASSWORD TOGGLE
  ======================================================= */

  attachPasswordToggle() {
    const button =
      this.container.querySelector(
        "#password-toggle"
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        this.passwordVisible =
          !this.passwordVisible;

        this.render();
      }
    );
  }


  /* =======================================================
     AUTHENTICATION METHOD
  ======================================================= */

  attachAuthenticationMethods() {
    const buttons =
      this.container.querySelectorAll(
        "[data-auth-method]"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const method =
            button.dataset.authMethod;

          if (method === "otp") {
            this.currentPage = "otp";

            this.render();
          }

          if (method === "password") {
            this.config.login.defaultAuthentication =
              "password";

            this.render();
          }
        }
      );
    });
  }


  /* =======================================================
     OTP INPUTS
  ======================================================= */

  attachOTPInputs() {
    const inputs =
      this.container.querySelectorAll(
        ".auth-otp-input"
      );

    if (inputs.length === 0) {
      return;
    }

    inputs.forEach(
      (input, index) => {
        input.addEventListener(
          "input",
          (event) => {
            const value =
              event.target.value;

            if (
              value &&
              index < inputs.length - 1
            ) {
              inputs[index + 1].focus();
            }
          }
        );

        input.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === "Backspace" &&
              !input.value &&
              index > 0
            ) {
              inputs[index - 1].focus();
            }
          }
        );
      }
    );
  }


  /* =======================================================
     FORM EVENTS
  ======================================================= */

  attachForms() {
    const loginForm =
      this.container.querySelector(
        "#login-form"
      );

    const signupForm =
      this.container.querySelector(
        "#signup-form"
      );

    const forgotForm =
      this.container.querySelector(
        "#forgot-password-form"
      );

    if (loginForm) {
      loginForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          this.emit(
            "login",
            this.collectLoginData()
          );
        }
      );
    }

    if (signupForm) {
      signupForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          this.emit(
            "signup",
            this.collectSignupData()
          );
        }
      );
    }

    if (forgotForm) {
      forgotForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const input =
            forgotForm.querySelector(
              "#forgot-identifier"
            );

          this.emit(
            "forgot-password",
            {
              identifier:
                input?.value || ""
            }
          );

          this.setPage("otp");
        }
      );
    }
  }


  /* =======================================================
     SOCIAL LOGIN EVENTS
  ======================================================= */

  attachSocialButtons() {
    const buttons =
      this.container.querySelectorAll(
        "[data-provider]"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          this.emit(
            "social-login",
            {
              provider:
                button.dataset.provider
            }
          );
        }
      );
    });
  }


  /* =======================================================
     COLLECT LOGIN DATA
  ======================================================= */

  collectLoginData() {
    const identifier =
      this.container.querySelector(
        "#login-identifier"
      );

    const password =
      this.container.querySelector(
        "#login-password"
      );

    const remember =
      this.container.querySelector(
        "#remember-me"
      );

    return {
      identifierType:
        this.identifierType,

      identifier:
        identifier?.value || "",

      password:
        password?.value || "",

      rememberMe:
        remember?.checked || false
    };
  }


  /* =======================================================
     COLLECT SIGNUP DATA
  ======================================================= */

  collectSignupData() {
    const getValue = (id) =>
      this.container.querySelector(
        `#${id}`
      )?.value || "";

    return {
      username:
        getValue("username"),

      email:
        getValue("email"),

      mobile:
        getValue("mobile"),

      password:
        getValue("password"),

      confirmPassword:
        getValue("confirm-password")
    };
  }


  /* =======================================================
     CUSTOM EVENT
  ======================================================= */

  emit(name, detail = {}) {
    const event =
      new CustomEvent(
        `auth:${name}`,
        {
          detail
        }
      );

    this.container.dispatchEvent(
      event
    );
  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  escapeHTML(value) {
    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    const div =
      document.createElement("div");

    div.textContent =
      String(value);

    return div.innerHTML;
  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {
    if (this.container) {
      this.container.innerHTML = "";
    }

    this.container = null;
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.AuthPage = AuthPage;