/* =========================================================
   AUTH PAGE BUILDER
   File: js/auth-pages.js

   Dynamic Authentication Page Runtime

   Supported:
   - Login
   - Sign Up
   - Forgot Password
   - OTP Verification
   - Email / SMS / WhatsApp / Authenticator delivery
   - 4 / 6 / 8 digit OTP
   - OTP resend countdown
   - OTP paste support
   - Password visibility
   - Password strength
   - Social login
   - Dynamic backgrounds
   - Dynamic branding
   - Dynamic layout support
========================================================= */

"use strict";

class AuthPage {
  constructor(container, config = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    this.currentPage =
      config?.page?.activePage ||
      config?.currentPage ||
      "login";

    this.identifierType = "email";
    this.passwordVisible = false;

    this.activeOtpMethod =
      "email";

    this.otpResendTimer = null;
    this.otpSecondsRemaining = 0;

    this.defaultConfig = {
      page: {
        activePage: "login"
      },

      branding: {
        logo: "",
        logoImage: "",
        logoText: "AUTH",
        logoType: "auto",
        logoStyle: "circle",
        logoShape: "circle",
        logoPosition: "top-center",
        logoWidth: 56,

        showLogo: true,
        showBrandName: true,

        brandName: "Welcome Back",
        subtitle:
          "Sign in to continue to your account",

        backgroundText: "",
        backgroundTextSize: 42,
        backgroundTextColor: "#ffffff",
        backgroundTextPosition: "center",
        backgroundTextAlign: "left"
      },

      background: {
        type: "image",
        image: "",
        uploadedImage: "",
        color: "#0f172a",

        overlay: true,
        overlayColor: "#000000",
        overlayOpacity: 0.25,

        position: "center center",
        size: "cover",
        repeat: "no-repeat",

        blur: 0,
        brightness: 1,

        showPanel: true
      },

      layout: {
        type: "split",
        pageLayout: "split-left",

        backgroundSide: "left",
        imageWidth: 55,
        authWidth: 45,

        formHorizontalPosition: "center",
        formVerticalPosition: "center",

        cardPosition: "center",

        mobileBackgroundVisible: false
      },

      card: {
        backgroundColor: "#ffffff",
        textColor: "#0f172a",

        opacity: 1,
        blur: 0,

        width: 420,
        padding: 42,

        borderRadius: 18,

        borderEnabled: false,
        borderColor: "rgba(255,255,255,0.25)",

        shadow: "medium",

        showCard: true
      },

      typography: {
        fontFamily:
          "Inter, Arial, sans-serif",

        headingFont:
          "Inter, Arial, sans-serif",

        bodyFont:
          "Inter, Arial, sans-serif",

        titleSize: 30,
        subtitleSize: 14,
        bodySize: 14,

        headingColor: "#0f172a",
        textColor: "#475569",

        fontWeight: 700,
        letterSpacing: 0,
        textAlign: "left"
      },

      login: {
        identifierEnabled: true,

        identifierLabel:
          "Email or Mobile Number",

        identifierPlaceholder:
          "Enter your email or mobile number",

        showIdentifierSelector: true,

        identifierOptions: [
          "email",
          "mobile"
        ],

        authenticationMethods: {
          otp: true,
          password: true
        },

        defaultAuthentication:
          "password",

        otpLength: 6,

        otpDeliveryMethods: {
          email: true,
          sms: true,
          whatsapp: true,
          authenticator: false
        },

        defaultOtpMethod: "email",

        showRememberMe: true,
        showForgotPassword: true,

        loginButtonText: "Login",

        otpButtonText:
          "Continue with OTP"
      },

      otp: {
        length: 6,

        resendEnabled: true,
        resendSeconds: 30,

        title:
          "Verify your account",

        description:
          "Enter the verification code sent to you",

        verifyButtonText:
          "Verify Code",

        resendText:
          "Resend OTP",

        changeIdentifierText:
          "Change email or mobile number"
      },

      signup: {
        enabled: true,

        title:
          "Create your account",

        subtitle:
          "Fill in your details to get started",

        buttonText:
          "Create Account",

        fields: {
          username: true,
          email: true,
          mobile: true,
          password: true,
          confirmPassword: true
        },

        showPasswordStrength: true,
        showTerms: true,
        showSocial: true
      },

      forgotPassword: {
        enabled: true,

        title:
          "Forgot password?",

        subtitle:
          "Enter your email or mobile number. We will send you a verification code.",

        buttonText:
          "Send Verification Code",

        showRecoveryMethods: true
      },

      social: {
        enabled: true,

        providers: {
          google: true,
          facebook: true,
          apple: false,
          microsoft: false,
          github: false
        },

        title:
          "Or continue with",

        layout: "stacked"
      },

      colors: {
        primary: "#2563eb",

        primaryHover:
          "#1d4ed8",

        inputBackground:
          "#ffffff",

        inputBorder:
          "#cbd5e1",

        inputText:
          "#0f172a",

        mutedText:
          "#64748b",

        linkColor:
          "#2563eb",

        buttonText:
          "#ffffff"
      }
    };

    this.config = this.mergeDeep(
      this.defaultConfig,
      config || {}
    );

    this.normalizeConfig();

    this.render();
  }


  /* =======================================================
     CONFIG NORMALIZATION
  ======================================================= */

  normalizeConfig() {
    const config = this.config;

    if (
      config.currentPage &&
      !config.page?.activePage
    ) {
      config.page = config.page || {};
      config.page.activePage =
        config.currentPage;
    }

    if (
      config.page?.activePage
    ) {
      this.currentPage =
        config.page.activePage;
    }

    config.background =
      config.background || {};

    if (
      config.background.defaultImage &&
      !config.background.image
    ) {
      config.background.image =
        config.background.defaultImage;
    }

    if (
      config.background.uploadedImage &&
      !config.background.image
    ) {
      config.background.image =
        config.background.uploadedImage;
    }

    config.branding =
      config.branding || {};

    if (
      config.branding.logoImage &&
      !config.branding.logo
    ) {
      config.branding.logo =
        config.branding.logoImage;
    }

    config.login =
      config.login || {};

    if (
      config.login.otpLength
    ) {
      config.otp =
        config.otp || {};

      if (!config.otp.length) {
        config.otp.length =
          config.login.otpLength;
      }
    }

    const validOtpLengths = [
      4,
      6,
      8
    ];

    const requestedOtpLength =
      Number(
        config.otp?.length ||
        config.login?.otpLength ||
        6
      );

    const otpLength =
      validOtpLengths.includes(
        requestedOtpLength
      )
        ? requestedOtpLength
        : 6;

    config.otp =
      config.otp || {};

    config.otp.length =
      otpLength;

    config.login.otpLength =
      otpLength;

    if (
      !config.login.defaultOtpMethod
    ) {
      config.login.defaultOtpMethod =
        "email";
    }

    if (
      !config.login.otpDeliveryMethods
    ) {
      config.login.otpDeliveryMethods = {
        email: true,
        sms: true,
        whatsapp: true,
        authenticator: false
      };
    }

    this.activeOtpMethod =
      this.getAvailableOtpMethod(
        config.login.defaultOtpMethod
      );
  }


  /* =======================================================
     DEEP MERGE
  ======================================================= */

  mergeDeep(target, source) {
    const output = {
      ...target
    };

    if (
      !source ||
      typeof source !== "object"
    ) {
      return output;
    }

    Object.keys(source).forEach(
      (key) => {
        const sourceValue =
          source[key];

        const targetValue =
          target?.[key];

        if (
          sourceValue &&
          typeof sourceValue === "object" &&
          !Array.isArray(sourceValue) &&
          !(sourceValue instanceof File) &&
          !(sourceValue instanceof Blob)
        ) {
          output[key] =
            this.mergeDeep(
              targetValue || {},
              sourceValue
            );
        } else {
          output[key] =
            sourceValue;
        }
      }
    );

    return output;
  }


  /* =======================================================
     UPDATE CONFIG
  ======================================================= */

  updateConfig(newConfig = {}) {
    this.config =
      this.mergeDeep(
        this.config,
        newConfig
      );

    this.normalizeConfig();

    this.render();
  }


  /* =======================================================
     SET PAGE
  ======================================================= */

  setPage(page) {
    const allowedPages = [
      "login",
      "signup",
      "forgot",
      "otp"
    ];

    if (
      !allowedPages.includes(page)
    ) {
      return;
    }

    this.currentPage = page;

    this.config.page =
      this.config.page || {};

    this.config.page.activePage =
      page;

    this.emit(
      "page-change",
      {
        page
      }
    );

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

    this.clearOtpTimer();

    this.applyDynamicVariables();

    this.container.innerHTML = `
      <div
        class="auth-page-builder-runtime"
        data-auth-page="${this.escapeAttribute(
          this.currentPage
        )}"
      >
        ${this.renderAuthPage()}
      </div>
    `;

    this.attachEventListeners();

    if (
      this.currentPage === "otp"
    ) {
      this.initializeOtpTimer();
    }
  }


  /* =======================================================
     DYNAMIC CSS VARIABLES
  ======================================================= */

  applyDynamicVariables() {
    const root =
      this.container;

    const config =
      this.config;

    const cardOpacity =
      this.normalizeOpacity(
        config.card.opacity
      );

    root.style.setProperty(
      "--auth-primary",
      config.colors.primary
    );

    root.style.setProperty(
      "--auth-primary-hover",
      config.colors.primaryHover
    );

    root.style.setProperty(
      "--auth-button-text",
      config.colors.buttonText
    );

    root.style.setProperty(
      "--auth-card-background",
      config.card.backgroundColor
    );

    root.style.setProperty(
      "--auth-card-opacity",
      cardOpacity
    );

    root.style.setProperty(
      "--auth-card-blur",
      `${Number(
        config.card.blur || 0
      )}px`
    );

    root.style.setProperty(
      "--auth-card-border-color",
      config.card.borderColor
    );

    root.style.setProperty(
      "--auth-text-color",
      config.card.textColor
    );

    root.style.setProperty(
      "--auth-heading-color",
      config.typography.headingColor
    );

    root.style.setProperty(
      "--auth-body-text-color",
      config.typography.textColor
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
      config.typography.bodyFont ||
        config.typography.fontFamily
    );

    root.style.setProperty(
      "--auth-heading-font",
      config.typography.headingFont ||
        config.typography.fontFamily
    );

    root.style.setProperty(
      "--auth-title-size",
      `${Number(
        config.typography.titleSize || 30
      )}px`
    );

    root.style.setProperty(
      "--auth-subtitle-size",
      `${Number(
        config.typography.subtitleSize || 14
      )}px`
    );

    root.style.setProperty(
      "--auth-body-size",
      `${Number(
        config.typography.bodySize || 14
      )}px`
    );

    root.style.setProperty(
      "--auth-font-weight",
      String(
        config.typography.fontWeight || 700
      )
    );

    root.style.setProperty(
      "--auth-letter-spacing",
      `${Number(
        config.typography.letterSpacing || 0
      )}px`
    );

    root.style.setProperty(
      "--auth-card-radius",
      `${Number(
        config.card.borderRadius || 18
      )}px`
    );

    root.style.setProperty(
      "--auth-card-padding",
      `${Number(
        config.card.padding || 42
      )}px`
    );

    root.style.setProperty(
      "--auth-card-width",
      `${Number(
        config.card.width || 420
      )}px`
    );

    root.style.setProperty(
      "--auth-logo-width",
      `${Number(
        config.branding.logoWidth || 56
      )}px`
    );

    root.style.setProperty(
      "--auth-image-width",
      `${Number(
        config.layout.imageWidth || 55
      )}%`
    );
  }


  /* =======================================================
     AUTH PAGE STRUCTURE
  ======================================================= */

  renderAuthPage() {
    const layout =
      this.config.layout;

    const layoutType =
      this.getLayoutType();

    const backgroundFirst =
      this.getBackgroundSide() ===
      "left";

    const backgroundPanel =
      this.renderBackgroundPanel();

    const formPanel =
      this.renderFormPanel();

    const classes = [
      "auth-page",
      `auth-layout-${layoutType}`,
      `auth-background-${this.getBackgroundSide()}`,
      `auth-page-layout-${this.escapeAttribute(
        layout.pageLayout ||
          layoutType
      )}`
    ];

    if (
      layoutType === "split"
    ) {
      return `
        <div
          class="${classes.join(" ")}"
          style="
            --auth-background-width:
              ${Number(
                layout.imageWidth ||
                layout.authWidth ||
                55
              )}%;

            --auth-form-width:
              ${100 -
                Number(
                  layout.imageWidth ||
                  55
                )}%;
          "
        >
          ${
            backgroundFirst
              ? backgroundPanel + formPanel
              : formPanel + backgroundPanel
          }
        </div>
      `;
    }

    return `
      <div
        class="${classes.join(" ")}"
      >
        ${backgroundPanel}
        ${formPanel}
      </div>
    `;
  }


  /* =======================================================
     LAYOUT HELPERS
  ======================================================= */

  getLayoutType() {
    const layout =
      this.config.layout || {};

    const value =
      layout.pageLayout ||
      layout.type ||
      "split";

    if (
      [
        "split-left",
        "split-right",
        "image-left",
        "image-right"
      ].includes(value)
    ) {
      return "split";
    }

    if (
      [
        "full-background",
        "background"
      ].includes(value)
    ) {
      return "background";
    }

    if (
      [
        "center-card",
        "minimal-center",
        "center"
      ].includes(value)
    ) {
      return "center";
    }

    return value;
  }

  getBackgroundSide() {
    const layout =
      this.config.layout || {};

    const pageLayout =
      layout.pageLayout || "";

    if (
      pageLayout.includes("right")
    ) {
      return "right";
    }

    if (
      pageLayout.includes("left")
    ) {
      return "left";
    }

    return (
      layout.backgroundSide ||
      "left"
    );
  }


  /* =======================================================
     BACKGROUND PANEL
  ======================================================= */

  renderBackgroundPanel() {
    const background =
      this.config.background;

    const layoutType =
      this.getLayoutType();

    const shouldShow =
      background.showPanel !== false ||
      layoutType === "background";

    if (!shouldShow) {
      return "";
    }

    const backgroundStyle =
      this.getBackgroundStyle();

    const overlayEnabled =
      background.overlay !== false;

    const backgroundContentStyle =
      this.getBackgroundContentStyle();

    return `
      <div
        class="auth-background-panel"
        style="${backgroundStyle}"
      >
        ${
          overlayEnabled
            ? `
              <div
                class="auth-background-overlay"
                style="
                  background:
                    ${this.escapeAttribute(
                      background.overlayColor ||
                      "#000000"
                    )};

                  opacity:
                    ${this.normalizeOpacity(
                      background.overlayOpacity
                    )};
                "
              ></div>
            `
            : ""
        }

        <div
          class="auth-background-content"
          style="${backgroundContentStyle}"
        >
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
      this.config.background || {};

    const image =
      this.getBackgroundImage();

    const position =
      this.normalizeBackgroundPosition(
        background.position
      );

    const size =
      background.size || "cover";

    const repeat =
      background.repeat ||
      "no-repeat";

    const blur =
      Number(
        background.blur || 0
      );

    const brightness =
      Number(
        background.brightness ??
        1
      );

    const filter =
      `filter: blur(${blur}px) brightness(${brightness});`;

    if (image) {
      return `
        background-color:
          ${this.escapeAttribute(
            background.color ||
            "#0f172a"
          )};

        background-image:
          url("${this.escapeAttribute(
            image
          )}");

        background-size:
          ${this.escapeAttribute(size)};

        background-position:
          ${this.escapeAttribute(
            position
          )};

        background-repeat:
          ${this.escapeAttribute(
            repeat
          )};

        ${filter}
      `;
    }

    if (
      background.type ===
      "gradient"
    ) {
      return `
        background:
          linear-gradient(
            135deg,
            ${this.escapeAttribute(
              background.color ||
              "#0f172a"
            )},
            ${this.escapeAttribute(
              this.config.colors.primary
            )}
          );

        ${filter}
      `;
    }

    return `
      background:
        ${this.escapeAttribute(
          background.color ||
          "#0f172a"
        )};

      ${filter}
    `;
  }

  getBackgroundImage() {
    const background =
      this.config.background || {};

    return (
      background.image ||
      background.uploadedImage ||
      background.defaultImage ||
      background.selectedImage ||
      ""
    );
  }

  normalizeBackgroundPosition(
    position
  ) {
    const positions = {
      center: "center center",
      top: "center top",
      bottom: "center bottom",
      left: "left center",
      right: "right center"
    };

    return (
      positions[position] ||
      position ||
      "center center"
    );
  }


  /* =======================================================
     BACKGROUND CONTENT
  ======================================================= */

  getBackgroundContentStyle() {
    const branding =
      this.config.branding || {};

    const position =
      branding.backgroundTextPosition ||
      "center";

    const align =
      branding.backgroundTextAlign ||
      "left";

    return `
      justify-content:
        ${this.mapVerticalPosition(
          position
        )};

      align-items:
        ${this.mapHorizontalPosition(
          align
        )};

      text-align:
        ${this.escapeAttribute(
          align
        )};
    `;
  }

  mapVerticalPosition(position) {
    const normalized =
      String(
        position || "center"
      ).toLowerCase();

    if (
      normalized.includes("top")
    ) {
      return "flex-start";
    }

    if (
      normalized.includes("bottom")
    ) {
      return "flex-end";
    }

    return "center";
  }

  mapHorizontalPosition(position) {
    const normalized =
      String(
        position || "center"
      ).toLowerCase();

    if (
      normalized === "left" ||
      normalized.includes("left")
    ) {
      return "flex-start";
    }

    if (
      normalized === "right" ||
      normalized.includes("right")
    ) {
      return "flex-end";
    }

    return "center";
  }


  /* =======================================================
     BACKGROUND BRANDING
  ======================================================= */

  renderBackgroundBranding() {
    const branding =
      this.config.branding;

    const backgroundText =
      branding.backgroundText ||
      branding.brandName ||
      "";

    const subtitle =
      branding.subtitle ||
      "";

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
              <div
                class="auth-background-text"
                style="
                  color:
                    ${this.escapeAttribute(
                      branding.backgroundTextColor ||
                      "#ffffff"
                    )};

                  font-size:
                    ${Number(
                      branding.backgroundTextSize ||
                      42
                    )}px;
                "
              >
                <h1>
                  ${this.escapeHTML(
                    backgroundText
                  )}
                </h1>

                ${
                  subtitle
                    ? `
                      <p>
                        ${this.escapeHTML(
                          subtitle
                        )}
                      </p>
                    `
                    : ""
                }
              </div>
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

    const horizontal =
      layout.formHorizontalPosition ||
      layout.cardPosition ||
      "center";

    const vertical =
      layout.formVerticalPosition ||
      "center";

    return `
      <div
        class="
          auth-form-panel
          auth-form-horizontal-${this.escapeAttribute(
            horizontal
          )}
          auth-form-vertical-${this.escapeAttribute(
            vertical
          )}
          auth-card-position-${this.escapeAttribute(
            layout.cardPosition ||
            "center"
          )}
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

    const cardClasses = [
      "auth-card",
      card.showCard === false
        ? "auth-card-transparent"
        : "",
      `auth-shadow-${
        card.shadow ||
        "medium"
      }`,
      card.borderEnabled
        ? "auth-card-bordered"
        : ""
    ]
      .filter(Boolean)
      .join(" ");

    return `
      <div
        class="${cardClasses}"
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
    switch (
      this.currentPage
    ) {
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
      <div
        class="auth-form-content"
        data-page-content="login"
      >
        ${this.renderFormBranding()}

        <div class="auth-form-heading">
          <h2>
            ${this.escapeHTML(
              this.config.branding
                .brandName ||
              "Welcome back"
            )}
          </h2>

          <p>
            ${this.escapeHTML(
              this.config.branding
                .subtitle ||
              "Login to access your account"
            )}
          </p>
        </div>

        <form
          class="auth-form"
          id="login-form"
          novalidate
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

          ${this.renderAuthenticationFields()}

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
              login.loginButtonText ||
              "Login"
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
      !branding.showLogo
    ) {
      return "";
    }

    const position =
      branding.logoPosition ||
      "top-center";

    return `
      <div
        class="
          auth-form-branding
          auth-logo-position-${this.escapeAttribute(
            position
          )}
        "
      >
        ${this.renderLogo()}
      </div>
    `;
  }


  /* =======================================================
     LOGO
  ======================================================= */

  renderLogo() {
    const branding =
      this.config.branding || {};

    const logo =
      branding.logo ||
      branding.logoImage ||
      "";

    const style =
      branding.logoShape ||
      branding.logoStyle ||
      "circle";

    const logoType =
      branding.logoType ||
      "auto";

    const styleClass =
      `auth-logo-${style}`;

    const width =
      Number(
        branding.logoWidth ||
        56
      );

    if (
      logo &&
      (
        logoType === "image" ||
        logoType === "auto"
      )
    ) {
      return `
        <div
          class="
            auth-logo
            ${styleClass}
          "
          style="
            width:
              ${width}px;

            height:
              ${width}px;
          "
        >
          <img
            src="${this.escapeAttribute(
              logo
            )}"
            alt="Brand logo"
            onerror="
              this.closest('.auth-logo')
                ?.classList
                .add('auth-logo-image-error');
            "
          />
        </div>
      `;
    }

    return `
      <div
        class="
          auth-logo
          ${styleClass}
          auth-logo-text
        "
        style="
          min-width:
            ${width}px;

          min-height:
            ${width}px;
        "
      >
        <span>
          ${this.escapeHTML(
            branding.logoText ||
            "AUTH"
          )}
        </span>
      </div>
    `;
  }


  /* =======================================================
     IDENTIFIER FIELD
  ======================================================= */

  renderIdentifierField() {
    const isMobile =
      this.identifierType ===
      "mobile";

    const isBoth =
      this.identifierType ===
      "both";

    const label =
      isBoth
        ? "Email or Mobile Number"
        : isMobile
          ? "Mobile Number"
          : "Email Address";

    const placeholder =
      isBoth
        ? "Enter your email or mobile number"
        : isMobile
          ? "Enter your mobile number"
          : "Enter your email address";

    return `
      <div class="auth-form-group">
        <label
          class="auth-label"
          for="login-identifier"
        >
          ${label}
        </label>

        <div class="auth-input-wrapper">
          <input
            id="login-identifier"
            name="identifier"
            type="${
              isMobile
                ? "tel"
                : isBoth
                  ? "text"
                  : "email"
            }"
            class="auth-input"
            autocomplete="${
              isMobile
                ? "tel"
                : "email"
            }"
            placeholder="${placeholder}"
            required
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
      this.config.login
        .identifierOptions ||
      [];

    if (
      !Array.isArray(options) ||
      options.length === 0
    ) {
      return "";
    }

    return `
      <div
        class="auth-identifier-selector"
        role="group"
        aria-label="Choose login identifier"
      >
        ${options
          .map(
            (option) => `
              <button
                type="button"
                class="
                  auth-identifier-option
                  ${
                    this.identifierType ===
                    option
                      ? "active"
                      : ""
                  }
                "
                data-identifier="${this.escapeAttribute(
                  option
                )}"
              >
                ${this.formatIdentifierOption(
                  option
                )}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  formatIdentifierOption(option) {
    const labels = {
      email: "Email",
      mobile: "Mobile",
      both: "Email or Mobile"
    };

    return (
      labels[option] ||
      this.escapeHTML(option)
    );
  }


  /* =======================================================
     AUTHENTICATION FIELDS
  ======================================================= */

  renderAuthenticationFields() {
    const methods =
      this.config.login
        .authenticationMethods ||
      {};

    const defaultMethod =
      this.config.login
        .defaultAuthentication ||
      "password";

    const passwordEnabled =
      methods.password !== false;

    const otpEnabled =
      methods.otp === true;

    const methodSelector =
      passwordEnabled &&
      otpEnabled
        ? this.renderAuthenticationMethodSelector()
        : "";

    let fields = "";

    if (
      defaultMethod === "otp" &&
      otpEnabled
    ) {
      fields =
        this.renderGetKeySection();
    } else if (
      passwordEnabled
    ) {
      fields =
        this.renderPasswordField();
    } else if (
      otpEnabled
    ) {
      fields =
        this.renderGetKeySection();
    }

    return `
      ${methodSelector}
      ${fields}
    `;
  }


  /* =======================================================
     AUTHENTICATION METHOD SELECTOR
  ======================================================= */

  renderAuthenticationMethodSelector() {
    const activeMethod =
      this.config.login
        .defaultAuthentication ||
      "password";

    return `
      <div
        class="auth-auth-method-selector"
        role="group"
        aria-label="Authentication method"
      >
        <button
          type="button"
          class="
            auth-auth-method-option
            ${
              activeMethod ===
              "password"
                ? "active"
                : ""
            }
          "
          data-auth-method="password"
        >
          Password
        </button>

        <button
          type="button"
          class="
            auth-auth-method-option
            ${
              activeMethod ===
              "otp"
                ? "active"
                : ""
            }
          "
          data-auth-method="otp"
        >
          OTP
        </button>
      </div>
    `;
  }


  /* =======================================================
     PASSWORD FIELD
  ======================================================= */

  renderPasswordField() {
    return `
      <div class="auth-form-group">
        <div class="auth-label-row">
          <label
            class="auth-label"
            for="login-password"
          >
            Password
          </label>
        </div>

        <div class="auth-password-wrapper">
          <input
            id="login-password"
            name="password"
            type="${
              this.passwordVisible
                ? "text"
                : "password"
            }"
            class="auth-input"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />

          <button
            type="button"
            class="auth-password-toggle"
            data-password-toggle="login-password"
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
      this.config.login
        .otpDeliveryMethods ||
      {};

    const availableMethods =
      this.getAvailableOtpMethods();

    if (
      availableMethods.length === 0
    ) {
      return `
        <div class="auth-get-key-section">
          <p class="auth-empty-method-message">
            No OTP delivery method is enabled.
          </p>
        </div>
      `;
    }

    return `
      <div class="auth-get-key-section">
        <div class="auth-get-key-header">
          <span>
            Get key from
          </span>
        </div>

        <div class="auth-get-key-options">
          ${
            methods.email
              ? this.renderOtpMethodButton(
                  "email",
                  "Email"
                )
              : ""
          }

          ${
            methods.sms
              ? this.renderOtpMethodButton(
                  "sms",
                  "SMS"
                )
              : ""
          }

          ${
            methods.whatsapp
              ? this.renderOtpMethodButton(
                  "whatsapp",
                  "WhatsApp"
                )
              : ""
          }

          ${
            methods.authenticator
              ? this.renderOtpMethodButton(
                  "authenticator",
                  "Authenticator"
                )
              : ""
          }
        </div>

        <button
          type="button"
          class="auth-primary-button auth-otp-continue-button"
          data-action="continue-otp"
        >
          ${this.escapeHTML(
            this.config.login
              .otpButtonText ||
            "Continue with OTP"
          )}
        </button>
      </div>
    `;
  }

  renderOtpMethodButton(
    method,
    label
  ) {
    const active =
      this.activeOtpMethod ===
      method;

    return `
      <button
        type="button"
        class="
          auth-get-key-option
          ${active ? "active" : ""}
        "
        data-otp-method="${this.escapeAttribute(
          method
        )}"
      >
        ${label}
      </button>
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
          login.showForgotPassword &&
          this.config.forgotPassword
            .enabled !== false
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
      this.getOtpLength();

    const otp =
      this.config.otp || {};

    return `
      <div
        class="auth-form-content"
        data-page-content="otp"
      >
        <button
          type="button"
          class="auth-back-button"
          data-page="login"
        >
          ← Back to login
        </button>

        <div class="auth-form-heading">
          <h2>
            ${this.escapeHTML(
              otp.title ||
              "Verify your account"
            )}
          </h2>

          <p>
            ${this.escapeHTML(
              otp.description ||
              `Enter the ${otpLength}-digit verification code sent to you via ${this.getOtpMethodLabel(
                this.activeOtpMethod
              )}.`
            )}
          </p>
        </div>

        <div
          class="auth-otp-delivery-info"
        >
          <span>
            Verification via
          </span>

          <strong>
            ${this.getOtpMethodLabel(
              this.activeOtpMethod
            )}
          </strong>
        </div>

        <div
          class="auth-otp-container"
          data-otp-length="${otpLength}"
        >
          ${Array.from(
            {
              length: otpLength
            }
          )
            .map(
              (_, index) => `
                <input
                  type="text"
                  maxlength="1"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  autocomplete="${
                    index === 0
                      ? "one-time-code"
                      : "off"
                  }"
                  class="auth-otp-input"
                  data-otp-index="${index}"
                  aria-label="OTP digit ${
                    index + 1
                  }"
                />
              `
            )
            .join("")}
        </div>

        <div
          class="auth-otp-status"
          id="auth-otp-status"
          aria-live="polite"
        ></div>

        <button
          type="button"
          class="auth-primary-button"
          data-action="verify-otp"
        >
          ${this.escapeHTML(
            otp.verifyButtonText ||
            "Verify Code"
          )}
        </button>

        ${
          otp.resendEnabled !== false
            ? `
              <div
                class="auth-otp-resend-section"
              >
                <button
                  type="button"
                  class="auth-text-button"
                  data-action="resend-otp"
                  id="resend-otp-button"
                >
                  ${this.escapeHTML(
                    otp.resendText ||
                    "Resend OTP"
                  )}
                </button>

                <span
                  class="auth-otp-countdown"
                  id="otp-resend-countdown"
                ></span>
              </div>
            `
            : ""
        }

        <button
          type="button"
          class="auth-text-button auth-change-identifier"
          data-page="login"
        >
          ${this.escapeHTML(
            otp.changeIdentifierText ||
            "Change email or mobile number"
          )}
        </button>
      </div>
    `;
  }


  /* =======================================================
     SIGNUP PAGE
  ======================================================= */

  renderSignupPage() {
    const fields =
      this.config.signup.fields ||
      {};

    return `
      <div
        class="auth-form-content"
        data-page-content="signup"
      >
        ${this.renderFormBranding()}

        <div class="auth-form-heading">
          <h2>
            ${this.escapeHTML(
              this.config.signup.title ||
              "Create your account"
            )}
          </h2>

          <p>
            ${this.escapeHTML(
              this.config.signup.subtitle ||
              "Fill in your details to get started"
            )}
          </p>
        </div>

        <form
          class="auth-form"
          id="signup-form"
          novalidate
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
              ? this.renderSignupPasswordInput(
                  "signup-password",
                  "Password",
                  "Create a password"
                )
              : ""
          }

          ${
            fields.confirmPassword
              ? this.renderSignupPasswordInput(
                  "confirm-password",
                  "Confirm Password",
                  "Confirm your password"
                )
              : ""
          }

          ${
            this.config.signup
              .showPasswordStrength &&
            fields.password
              ? `
                <div
                  class="auth-password-strength"
                  id="password-strength"
                >
                  <div
                    class="auth-password-strength-bars"
                  >
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <small
                    id="password-strength-text"
                  >
                    Password strength
                  </small>
                </div>
              `
              : ""
          }

          ${
            this.config.signup
              .showTerms
              ? `
                <label
                  class="auth-checkbox-label auth-terms"
                >
                  <input
                    type="checkbox"
                    id="signup-terms"
                  />

                  <span>
                    I agree to the Terms and
                    Privacy Policy
                  </span>
                </label>
              `
              : ""
          }

          <button
            type="submit"
            class="auth-primary-button"
          >
            ${this.escapeHTML(
              this.config.signup
                .buttonText ||
              "Create Account"
            )}
          </button>
        </form>

        ${
          this.config.signup
            .showSocial &&
          this.config.social.enabled
            ? this.renderSocialLogin()
            : ""
        }

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
          for="${this.escapeAttribute(
            name
          )}"
        >
          ${this.escapeHTML(label)}
        </label>

        <input
          id="${this.escapeAttribute(
            name
          )}"
          name="${this.escapeAttribute(
            name
          )}"
          type="${this.escapeAttribute(
            type
          )}"
          class="auth-input"
          autocomplete="${
            type === "email"
              ? "email"
              : type === "tel"
                ? "tel"
                : "off"
          }"
          placeholder="${this.escapeAttribute(
            placeholder
          )}"
        />
      </div>
    `;
  }


  /* =======================================================
     SIGNUP PASSWORD INPUT
  ======================================================= */

  renderSignupPasswordInput(
    id,
    label,
    placeholder
  ) {
    return `
      <div class="auth-form-group">
        <label
          class="auth-label"
          for="${this.escapeAttribute(
            id
          )}"
        >
          ${this.escapeHTML(label)}
        </label>

        <div class="auth-password-wrapper">
          <input
            id="${this.escapeAttribute(
              id
            )}"
            type="password"
            class="auth-input"
            autocomplete="new-password"
            placeholder="${this.escapeAttribute(
              placeholder
            )}"
          />

          <button
            type="button"
            class="auth-password-toggle"
            data-password-toggle="${this.escapeAttribute(
              id
            )}"
            aria-label="Toggle password visibility"
          >
            Show
          </button>
        </div>
      </div>
    `;
  }


  /* =======================================================
     FORGOT PASSWORD PAGE
  ======================================================= */

  renderForgotPasswordPage() {
    const forgot =
      this.config.forgotPassword ||
      {};

    return `
      <div
        class="auth-form-content"
        data-page-content="forgot"
      >
        <button
          type="button"
          class="auth-back-button"
          data-page="login"
        >
          ← Back to login
        </button>

        <div class="auth-form-heading">
          <h2>
            ${this.escapeHTML(
              forgot.title ||
              "Forgot password?"
            )}
          </h2>

          <p>
            ${this.escapeHTML(
              forgot.subtitle ||
              "Enter your email or mobile number. We will send you a verification code."
            )}
          </p>
        </div>

        <form
          class="auth-form"
          id="forgot-password-form"
          novalidate
        >
          <div class="auth-form-group">
            <label
              class="auth-label"
              for="forgot-identifier"
            >
              Email or Mobile Number
            </label>

            <input
              id="forgot-identifier"
              type="text"
              class="auth-input"
              placeholder="
                Enter email or mobile number
              "
              required
            />
          </div>

          ${
            forgot.showRecoveryMethods
              ? this.renderForgotRecoveryMethods()
              : ""
          }

          <button
            type="submit"
            class="auth-primary-button"
          >
            ${this.escapeHTML(
              forgot.buttonText ||
              "Send Verification Code"
            )}
          </button>
        </form>
      </div>
    `;
  }

  renderForgotRecoveryMethods() {
    const methods =
      this.getAvailableOtpMethods();

    if (
      methods.length === 0
    ) {
      return "";
    }

    return `
      <div
        class="auth-recovery-methods"
      >
        <span class="auth-label">
          Send verification via
        </span>

        <div
          class="auth-get-key-options"
        >
          ${methods
            .map(
              (method) =>
                this.renderOtpMethodButton(
                  method,
                  this.getOtpMethodLabel(
                    method
                  )
                )
            )
            .join("")}
        </div>
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

    const providerDefinitions = [
      {
        id: "google",
        label:
          "Continue with Google",
        icon: "G"
      },
      {
        id: "facebook",
        label:
          "Continue with Facebook",
        icon: "f"
      },
      {
        id: "apple",
        label:
          "Continue with Apple",
        icon: ""
      },
      {
        id: "microsoft",
        label:
          "Continue with Microsoft",
        icon: "⊞"
      },
      {
        id: "github",
        label:
          "Continue with GitHub",
        icon: "⌘"
      }
    ];

    providerDefinitions.forEach(
      (provider) => {
        if (
          social.providers?.[
            provider.id
          ]
        ) {
          buttons.push(`
            <button
              type="button"
              class="
                auth-social-button
                auth-social-${provider.id}
              "
              data-provider="${provider.id}"
            >
              <span class="social-icon">
                ${provider.icon}
              </span>

              <span>
                ${provider.label}
              </span>
            </button>
          `);
        }
      }
    );

    if (
      buttons.length === 0
    ) {
      return "";
    }

    return `
      <div
        class="
          auth-social-section
          auth-social-layout-${
            this.escapeAttribute(
              social.layout ||
              "stacked"
            )
          }
        "
      >
        <div class="auth-divider">
          <span>
            ${this.escapeHTML(
              social.title ||
              "Or continue with"
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
          ${
            this.escapeHTML(
              this.config.signup
                .buttonText ||
              "Create Account"
            )
          }
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
    this.attachOtpMethodSelection();
    this.attachContinueOtp();
    this.attachOTPInputs();
    this.attachOtpVerification();
    this.attachOtpResend();
    this.attachForms();
    this.attachSocialButtons();
    this.attachPasswordStrength();
  }


  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  attachPageNavigation() {
    const buttons =
      this.container.querySelectorAll(
        "[data-page]"
      );

    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            this.setPage(
              button.dataset.page
            );
          }
        );
      }
    );
  }


  /* =======================================================
     IDENTIFIER SELECTION
  ======================================================= */

  attachIdentifierSelection() {
    const buttons =
      this.container.querySelectorAll(
        "[data-identifier]"
      );

    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            this.identifierType =
              button.dataset.identifier;

            this.render();
          }
        );
      }
    );
  }


  /* =======================================================
     PASSWORD TOGGLE
  ======================================================= */

  attachPasswordToggle() {
    const buttons =
      this.container.querySelectorAll(
        "[data-password-toggle]"
      );

    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const inputId =
              button.dataset.passwordToggle;

            const input =
              this.container.querySelector(
                `#${this.escapeSelector(
                  inputId
                )}`
              );

            if (!input) {
              return;
            }

            const visible =
              input.type === "text";

            input.type =
              visible
                ? "password"
                : "text";

            button.textContent =
              visible
                ? "Show"
                : "Hide";

            button.setAttribute(
              "aria-label",
              visible
                ? "Show password"
                : "Hide password"
            );
          }
        );
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

    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const method =
              button.dataset.authMethod;

            if (
              method === "otp"
            ) {
              this.config.login
                .defaultAuthentication =
                "otp";

              this.render();
            }

            if (
              method === "password"
            ) {
              this.config.login
                .defaultAuthentication =
                "password";

              this.render();
            }
          }
        );
      }
    );
  }


  /* =======================================================
     OTP METHOD SELECTION
  ======================================================= */

  attachOtpMethodSelection() {
    const buttons =
      this.container.querySelectorAll(
        "[data-otp-method]"
      );

    buttons.forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const method =
              button.dataset.otpMethod;

            this.activeOtpMethod =
              this.getAvailableOtpMethod(
                method
              );

            this.render();
          }
        );
      }
    );
  }


  /* =======================================================
     CONTINUE TO OTP
  ======================================================= */

  attachContinueOtp() {
    const button =
      this.container.querySelector(
        "[data-action='continue-otp']"
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        this.setPage("otp");
      }
    );
  }


  /* =======================================================
     OTP INPUTS
  ======================================================= */

  attachOTPInputs() {
    const inputs = Array.from(
      this.container.querySelectorAll(
        ".auth-otp-input"
      )
    );

    if (
      inputs.length === 0
    ) {
      return;
    }

    inputs.forEach(
      (input, index) => {
        input.addEventListener(
          "input",
          (event) => {
            const cleaned =
              event.target.value
                .replace(/\D/g, "")
                .slice(-1);

            event.target.value =
              cleaned;

            if (
              cleaned &&
              index <
                inputs.length - 1
            ) {
              inputs[
                index + 1
              ].focus();
            }

            this.updateOtpStatus();
          }
        );

        input.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "Backspace" &&
              !input.value &&
              index > 0
            ) {
              inputs[
                index - 1
              ].focus();
            }

            if (
              event.key ===
                "ArrowLeft" &&
              index > 0
            ) {
              inputs[
                index - 1
              ].focus();
            }

            if (
              event.key ===
                "ArrowRight" &&
              index <
                inputs.length - 1
            ) {
              inputs[
                index + 1
              ].focus();
            }
          }
        );

        input.addEventListener(
          "paste",
          (event) => {
            event.preventDefault();

            const pasted =
              (
                event.clipboardData ||
                window.clipboardData
              )
                .getData("text")
                .replace(/\D/g, "")
                .slice(
                  0,
                  inputs.length
                );

            pasted
              .split("")
              .forEach(
                (
                  value,
                  pasteIndex
                ) => {
                  if (
                    inputs[pasteIndex]
                  ) {
                    inputs[
                      pasteIndex
                    ].value =
                      value;
                  }
                }
              );

            const nextEmpty =
              inputs.find(
                (otpInput) =>
                  !otpInput.value
              );

            (
              nextEmpty ||
              inputs[
                inputs.length - 1
              ]
            ).focus();

            this.updateOtpStatus();
          }
        );
      }
    );

    setTimeout(
      () => {
        inputs[0]?.focus();
      },
      0
    );
  }


  /* =======================================================
     OTP STATUS
  ======================================================= */

  updateOtpStatus() {
    const status =
      this.container.querySelector(
        "#auth-otp-status"
      );

    if (!status) {
      return;
    }

    const code =
      this.getOtpCode();

    const expectedLength =
      this.getOtpLength();

    if (
      code.length ===
      expectedLength
    ) {
      status.textContent =
        "Verification code complete";
      status.dataset.state =
        "complete";
    } else {
      status.textContent =
        "";
      status.dataset.state =
        "";
    }
  }


  /* =======================================================
     OTP VERIFY
  ======================================================= */

  attachOtpVerification() {
    const button =
      this.container.querySelector(
        "[data-action='verify-otp']"
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        const code =
          this.getOtpCode();

        const expectedLength =
          this.getOtpLength();

        const status =
          this.container.querySelector(
            "#auth-otp-status"
          );

        if (
          code.length !==
          expectedLength
        ) {
          if (status) {
            status.textContent =
              `Enter the complete ${expectedLength}-digit OTP.`;

            status.dataset.state =
              "error";
          }

          return;
        }

        if (status) {
          status.textContent =
            "OTP verified successfully.";

          status.dataset.state =
            "success";
        }

        this.emit(
          "verify-otp",
          {
            code,
            method:
              this.activeOtpMethod
          }
        );
      }
    );
  }


  /* =======================================================
     OTP RESEND
  ======================================================= */

  attachOtpResend() {
    const button =
      this.container.querySelector(
        "[data-action='resend-otp']"
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        if (
          this.otpSecondsRemaining >
          0
        ) {
          return;
        }

        this.emit(
          "resend-otp",
          {
            method:
              this.activeOtpMethod
          }
        );

        this.otpSecondsRemaining =
          Number(
            this.config.otp
              ?.resendSeconds || 30
          );

        this.updateOtpCountdown();

        this.startOtpTimer();
      }
    );
  }


  /* =======================================================
     OTP TIMER
  ======================================================= */

  initializeOtpTimer() {
    if (
      this.config.otp
        ?.resendEnabled === false
    ) {
      return;
    }

    this.otpSecondsRemaining =
      Number(
        this.config.otp
          ?.resendSeconds || 30
      );

    this.updateOtpCountdown();

    this.startOtpTimer();
  }

  startOtpTimer() {
    this.clearOtpTimer();

    if (
      this.otpSecondsRemaining <=
      0
    ) {
      this.updateOtpCountdown();
      return;
    }

    this.otpResendTimer =
      setInterval(
        () => {
          this.otpSecondsRemaining -=
            1;

          this.updateOtpCountdown();

          if (
            this.otpSecondsRemaining <=
            0
          ) {
            this.clearOtpTimer();
          }
        },
        1000
      );
  }

  clearOtpTimer() {
    if (
      this.otpResendTimer
    ) {
      clearInterval(
        this.otpResendTimer
      );

      this.otpResendTimer =
        null;
    }
  }

  updateOtpCountdown() {
    const button =
      this.container?.querySelector(
        "#resend-otp-button"
      );

    const countdown =
      this.container?.querySelector(
        "#otp-resend-countdown"
      );

    if (
      !button ||
      !countdown
    ) {
      return;
    }

    if (
      this.otpSecondsRemaining >
      0
    ) {
      button.disabled = true;

      const minutes =
        Math.floor(
          this.otpSecondsRemaining /
            60
        );

      const seconds =
        String(
          this.otpSecondsRemaining %
            60
        ).padStart(2, "0");

      countdown.textContent =
        `Resend available in ${minutes}:${seconds}`;

      return;
    }

    button.disabled = false;

    countdown.textContent =
      "";
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

    if (
      loginForm
    ) {
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

    if (
      signupForm
    ) {
      signupForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const data =
            this.collectSignupData();

          if (
            !this.validateSignupData(
              data
            )
          ) {
            return;
          }

          this.emit(
            "signup",
            data
          );
        }
      );
    }

    if (
      forgotForm
    ) {
      forgotForm.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          const input =
            forgotForm.querySelector(
              "#forgot-identifier"
            );

          const identifier =
            input?.value.trim() ||
            "";

          if (
            !identifier
          ) {
            input?.focus();

            return;
          }

          this.emit(
            "forgot-password",
            {
              identifier,
              method:
                this.activeOtpMethod
            }
          );

          this.setPage(
            "otp"
          );
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

    buttons.forEach(
      (button) => {
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
      }
    );
  }


  /* =======================================================
     PASSWORD STRENGTH
  ======================================================= */

  attachPasswordStrength() {
    const password =
      this.container.querySelector(
        "#signup-password"
      );

    const strength =
      this.container.querySelector(
        "#password-strength"
      );

    const text =
      this.container.querySelector(
        "#password-strength-text"
      );

    if (
      !password ||
      !strength ||
      !text
    ) {
      return;
    }

    password.addEventListener(
      "input",
      () => {
        const score =
          this.getPasswordStrength(
            password.value
          );

        strength.dataset.strength =
          score.level;

        text.textContent =
          score.label;
      }
    );
  }

  getPasswordStrength(
    password
  ) {
    let score = 0;

    if (
      password.length >= 8
    ) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (
      /[^A-Za-z0-9]/.test(
        password
      )
    ) {
      score += 1;
    }

    const labels = [
      "Password strength",
      "Weak password",
      "Fair password",
      "Good password",
      "Strong password"
    ];

    const levels = [
      "none",
      "weak",
      "fair",
      "good",
      "strong"
    ];

    return {
      score,
      label: labels[score],
      level: levels[score]
    };
  }


  /* =======================================================
     VALIDATE SIGNUP
  ======================================================= */

  validateSignupData(data) {
    const fields =
      this.config.signup.fields ||
      {};

    if (
      fields.confirmPassword &&
      data.password !==
        data.confirmPassword
    ) {
      this.emit(
        "validation-error",
        {
          field:
            "confirmPassword",
          message:
            "Passwords do not match."
        }
      );

      const confirm =
        this.container.querySelector(
          "#confirm-password"
        );

      confirm?.focus();

      return false;
    }

    if (
      this.config.signup.showTerms
    ) {
      const terms =
        this.container.querySelector(
          "#signup-terms"
        );

      if (
        terms &&
        !terms.checked
      ) {
        this.emit(
          "validation-error",
          {
            field: "terms",
            message:
              "Please accept the terms and conditions."
          }
        );

        return false;
      }
    }

    return true;
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
        remember?.checked ||
        false,

      authenticationMethod:
        this.config.login
          .defaultAuthentication ||

        "password"
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
        getValue(
          "signup-password"
        ),

      confirmPassword:
        getValue(
          "confirm-password"
        )
    };
  }


  /* =======================================================
     OTP HELPERS
  ======================================================= */

  getOtpLength() {
    const length =
      Number(
        this.config.otp?.length ||
        this.config.login?.otpLength ||
        6
      );

    return [
      4,
      6,
      8
    ].includes(length)
      ? length
      : 6;
  }

  getOtpCode() {
    return Array.from(
      this.container.querySelectorAll(
        ".auth-otp-input"
      )
    )
      .map(
        (input) => input.value
      )
      .join("");
  }

  getAvailableOtpMethods() {
    const methods =
      this.config.login
        ?.otpDeliveryMethods ||
      {};

    return [
      "email",
      "sms",
      "whatsapp",
      "authenticator"
    ].filter(
      (method) =>
        methods[method] ===
        true
    );
  }

  getAvailableOtpMethod(
    preferred
  ) {
    const available =
      this.getAvailableOtpMethods();

    if (
      available.includes(
        preferred
      )
    ) {
      return preferred;
    }

    return (
      available[0] ||
      "email"
    );
  }

  getOtpMethodLabel(
    method
  ) {
    const labels = {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      authenticator:
        "Authenticator App"
    };

    return (
      labels[method] ||
      "Email"
    );
  }


  /* =======================================================
     CUSTOM EVENT
  ======================================================= */

  emit(name, detail = {}) {
    if (!this.container) {
      return;
    }

    const event =
      new CustomEvent(
        `auth:${name}`,
        {
          detail,
          bubbles: true
        }
      );

    this.container.dispatchEvent(
      event
    );
  }


  /* =======================================================
     OPACITY HELPER
  ======================================================= */

  normalizeOpacity(value) {
    const number =
      Number(
        value ?? 1
      );

    if (
      number > 1
    ) {
      return Math.min(
        Math.max(
          number / 100,
          0
        ),
        1
      );
    }

    return Math.min(
      Math.max(
        number,
        0
      ),
      1
    );
  }


  /* =======================================================
     ESCAPE HELPERS
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

  escapeAttribute(value) {
    return this.escapeHTML(value)
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  escapeSelector(value) {
    if (
      window.CSS &&
      typeof CSS.escape ===
        "function"
    ) {
      return CSS.escape(
        String(value)
      );
    }

    return String(value).replace(
      /[^a-zA-Z0-9_-]/g,
      "\\$&"
    );
  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {
    this.clearOtpTimer();

    if (
      this.container
    ) {
      this.container.innerHTML =
        "";
    }

    this.container = null;
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.AuthPage = AuthPage;