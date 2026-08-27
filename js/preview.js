/* =========================================================
   AUTH PAGE BUILDER
   File: js/preview.js

   Live Preview Manager
========================================================= */

class PreviewManager {
  constructor(options = {}) {
    this.previewSelector =
      options.previewSelector ||
      "#previewRoot";

    this.deviceSelector =
      options.deviceSelector ||
      "[data-preview-device]";

    this.pageSelector =
      options.pageSelector ||
      "[data-preview-page]";

    this.container = null;

    this.currentDevice = "desktop";

    this.currentPage = "login";

    this.otpTimer = null;

    this.resendSeconds = 30;

    this.init();
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  init() {
    this.container =
      document.querySelector(
        this.previewSelector
      );

    if (!this.container) {
      console.warn(
        "Preview container not found:",
        this.previewSelector
      );

      return;
    }

    this.currentPage =
      this.getCurrentPage();

    this.bindEvents();

    this.render();
  }


  /* =======================================================
     EVENTS
  ======================================================= */

  bindEvents() {
    document.addEventListener(
      "click",
      (event) => {

        const deviceButton =
          event.target.closest(
            this.deviceSelector
          );

        if (deviceButton) {
          event.preventDefault();

          const device =
            deviceButton.dataset.previewDevice;

          if (device) {
            this.setDevice(device);
          }

          return;
        }


        const pageButton =
          event.target.closest(
            this.pageSelector
          );

        if (pageButton) {
          event.preventDefault();

          const page =
            pageButton.dataset.previewPage;

          if (page) {
            this.setPage(page);
          }

          return;
        }


        const previewAction =
          event.target.closest(
            "[data-preview-action]"
          );

        if (!previewAction) {
          return;
        }

        event.preventDefault();

        const action =
          previewAction.dataset.previewAction;

        this.handlePreviewAction(
          action,
          previewAction
        );
      }
    );


    document.addEventListener(
      "change",
      (event) => {
        const target =
          event.target;

        if (
          target.closest(
            this.previewSelector
          )
        ) {
          this.emitPreviewUpdated();
        }
      }
    );


    document.addEventListener(
      "input",
      (event) => {
        const target =
          event.target;

        if (
          target.closest(
            this.previewSelector
          )
        ) {
          this.emitPreviewUpdated();
        }
      }
    );


    document.addEventListener(
      "auth-builder:config-updated",
      () => {
        this.render();
      }
    );


    document.addEventListener(
      "auth-builder:customization-updated",
      () => {
        this.render();
      }
    );


    document.addEventListener(
      "auth-builder:rerender-preview",
      () => {
        this.render();
      }
    );


    window.addEventListener(
      "resize",
      () => {
        this.applyDeviceMode();
      }
    );
  }


  /* =======================================================
     CONFIG
  ======================================================= */

  getConfig() {
    if (
      window.state &&
      typeof window.state.getConfig ===
        "function"
    ) {
      return (
        window.state.getConfig() ||
        window.state.config ||
        window.config ||
        {}
      );
    }

    if (
      window.state &&
      window.state.config
    ) {
      return window.state.config;
    }

    if (
      window.authBuilderState &&
      typeof window.authBuilderState.getConfig ===
        "function"
    ) {
      return (
        window.authBuilderState.getConfig() ||
        {}
      );
    }

    if (window.authBuilderConfig) {
      return window.authBuilderConfig;
    }

    return (
      window.config ||
      {}
    );
  }


  getCurrentPage() {
    const config =
      this.getConfig();

    const page =
      config?.currentPage ||
      config?.page?.activePage ||
      "login";

    return this.normalizePageName(
      page
    );
  }


  normalizePageName(page) {
    const value =
      String(page || "")
        .toLowerCase()
        .trim()
        .replace(
          /[\s_-]+/g,
          ""
        );

    const aliases = {
      login: "login",
      signin: "login",

      signup: "signup",
      register: "signup",

      forgot: "forgotPassword",
      forgotpassword:
        "forgotPassword",

      otp: "otp",
      verification: "otp",
      verify: "otp"
    };

    return (
      aliases[value] ||
      "login"
    );
  }


  getPageConfig(
    config,
    pageName
  ) {
    const page =
      this.normalizePageName(
        pageName
      );

    const pages =
      config?.pages || {};

    if (pages[page]) {
      return pages[page];
    }

    if (config?.[page]) {
      return config[page];
    }

    if (
      page === "forgotPassword" &&
      config?.forgot
    ) {
      return config.forgot;
    }

    return {};
  }


  /* =======================================================
     RENDER
  ======================================================= */

  render() {
    if (!this.container) {
      return;
    }

    this.stopOtpTimer();

    const config =
      this.getConfig();

    this.currentPage =
      this.getCurrentPage();

    this.container.innerHTML =
      this.generatePreview(
        config
      );

    this.applyDeviceMode();

    this.updateActivePageButtons();

    this.emitPreviewUpdated();
  }


  refresh() {
    this.render();
  }


  generatePreview(config) {
    const pageConfig =
      this.getPageConfig(
        config,
        this.currentPage
      );

    const previewStyle =
      this.getPreviewStyle(
        config
      );

    const background =
      this.getBackground(
        config
      );

    const layout =
      this.getLayout(
        config
      );

    const logo =
      this.getLogo(
        config
      );

    const branding =
      this.getBranding(
        config
      );

    const formHTML =
      this.generatePage(
        config,
        pageConfig
      );

    const backgroundContent =
      this.generateBackgroundContent(
        config,
        branding
      );

    const backgroundStyle =
      background.image
        ? `
          background-image:
            linear-gradient(
              ${background.overlay},
              ${background.overlay}
            ),
            url("${this.escapeAttribute(
              background.image
            )}");
        `
        : `
          background:
            ${background.color};
        `;

    const formPositionClass =
      `preview-form-position-${layout.formPosition}`;

    const layoutClass =
      `preview-layout-${layout.type}`;

    const imageWidthClass =
      `preview-image-width-${layout.imageWidth}`;

    return `
      <div
        class="
          auth-preview-root
          ${layoutClass}
          ${imageWidthClass}
          ${formPositionClass}
        "
        style="
          ${previewStyle}
        "
      >

        <div
          class="auth-preview-shell"
        >

          <section
            class="auth-preview-background"
            style="
              ${backgroundStyle}
            "
          >
            ${backgroundContent}
          </section>

          <section
            class="auth-preview-form-area"
          >

            <div
              class="auth-preview-card"
            >

              ${this.generateLogo(
                logo,
                branding
              )}

              <div
                class="auth-preview-page"
              >
                ${formHTML}
              </div>

            </div>

          </section>

        </div>

      </div>
    `;
  }


  /* =======================================================
     PREVIEW STYLE
  ======================================================= */

  getPreviewStyle(config) {
    const colors =
      config?.colors || {};

    const customization =
      config?.customization || {};

    const card =
      config?.card ||
      customization?.card ||
      {};

    const typography =
      config?.typography || {};

    const primary =
      colors.primary ||
      config?.primaryColor ||
      "#2563eb";

    const primaryHover =
      colors.primaryHover ||
      config?.primaryHoverColor ||
      "#1d4ed8";

    const text =
      colors.text ||
      colors.textColor ||
      "#0f172a";

    const muted =
      colors.muted ||
      colors.secondaryText ||
      "#64748b";

    const border =
      colors.border ||
      colors.inputBorder ||
      "#dbe3ee";

    const inputBackground =
      colors.inputBackground ||
      "#ffffff";

    const cardBackground =
      card.background ||
      card.backgroundColor ||
      "#ffffff";

    const cardRadius =
      card.borderRadius ||
      card.radius ||
      20;

    const cardPadding =
      card.padding ||
      36;

    const titleSize =
      typography.titleSize ||
      30;

    const subtitleSize =
      typography.subtitleSize ||
      15;

    return `
      --preview-primary:
        ${primary};

      --preview-primary-hover:
        ${primaryHover};

      --preview-text:
        ${text};

      --preview-muted:
        ${muted};

      --preview-border:
        ${border};

      --preview-input-background:
        ${inputBackground};

      --preview-card-background:
        ${cardBackground};

      --preview-card-radius:
        ${this.addPx(
          cardRadius
        )};

      --preview-card-padding:
        ${this.addPx(
          cardPadding
        )};

      --preview-title-size:
        ${this.addPx(
          titleSize
        )};

      --preview-subtitle-size:
        ${this.addPx(
          subtitleSize
        )};
    `;
  }


  /* =======================================================
     LAYOUT
  ======================================================= */

  getLayout(config) {
    const layout =
      config?.layout || {};

    const pageLayout =
      String(
        layout.pageLayout ||
        layout.type ||
        "split"
      )
        .toLowerCase()
        .replace(
          /[\s_-]+/g,
          ""
        );

    const imageWidth =
      String(
        layout.imageWidth ||
        "50"
      )
        .replace(
          "%",
          ""
        );

    const formPosition =
      String(
        layout.formPosition ||
        "center"
      )
        .toLowerCase()
        .replace(
          /[\s_-]+/g,
          ""
        );

    return {
      type:
        this.normalizeLayout(
          pageLayout
        ),

      imageWidth:
        this.normalizeImageWidth(
          imageWidth
        ),

      formPosition:
        this.normalizeFormPosition(
          formPosition
        )
    };
  }


  normalizeLayout(value) {
    const aliases = {
      split: "split",
      leftimage: "imageLeft",
      imageleft: "imageLeft",
      rightimage: "imageRight",
      imageright: "imageRight",
      full: "full",
      background: "background"
    };

    return (
      aliases[value] ||
      "split"
    );
  }


  normalizeImageWidth(value) {
    const number =
      Number(
        String(value)
          .replace(
            /[^0-9.]/g,
            ""
          )
      );

    if (number <= 30) {
      return "30";
    }

    if (number <= 40) {
      return "40";
    }

    if (number <= 50) {
      return "50";
    }

    if (number <= 60) {
      return "60";
    }

    if (number <= 70) {
      return "70";
    }

    return "50";
  }


  normalizeFormPosition(value) {
    const aliases = {
      left: "left",
      center: "center",
      right: "right",

      top: "top",
      bottom: "bottom",

      topleft: "topLeft",
      topright: "topRight",

      bottomleft: "bottomLeft",
      bottomright: "bottomRight"
    };

    return (
      aliases[value] ||
      "center"
    );
  }


  /* =======================================================
     BACKGROUND
  ======================================================= */

  getBackground(config) {
    const background =
      config?.background || {};

    const image =
      background.uploadedImage ||
      background.image ||
      background.imageUrl ||
      background.url ||
      "";

    const color =
      background.color ||
      background.backgroundColor ||
      "#111827";

    const overlay =
      background.overlay ||
      background.overlayColor ||
      "rgba(15, 23, 42, 0.45)";

    return {
      image,
      color,
      overlay
    };
  }


  /* =======================================================
     BRANDING
  ======================================================= */

  getBranding(config) {
    const branding =
      config?.branding || {};

    return {
      brandName:
        branding.brandName ||
        branding.name ||
        "",

      title:
        branding.title ||
        config?.title ||
        "",

      description:
        branding.description ||
        branding.subtitle ||
        ""
    };
  }


  getLogo(config) {
    const branding =
      config?.branding || {};

    return (
      branding.uploadedLogo ||
      branding.logo ||
      branding.logoUrl ||
      branding.image ||
      ""
    );
  }


  generateLogo(
    logo,
    branding
  ) {
    if (logo) {
      return `
        <div
          class="auth-preview-logo"
        >
          <img
            src="${this.escapeAttribute(
              logo
            )}"
            alt="${this.escapeAttribute(
              branding.brandName ||
              "Logo"
            )}"
          >
        </div>
      `;
    }

    if (branding.brandName) {
      return `
        <div
          class="auth-preview-brand-name"
        >
          ${this.escapeHTML(
            branding.brandName
          )}
        </div>
      `;
    }

    return "";
  }


  generateBackgroundContent(
    config,
    branding
  ) {
    const layout =
      config?.layout || {};

    const showContent =
      layout.showBackgroundContent !==
      false;

    if (!showContent) {
      return "";
    }

    const title =
      branding.title ||
      branding.brandName ||
      "Welcome";

    const description =
      branding.description ||
      "Secure authentication designed for your application.";

    return `
      <div
        class="auth-preview-background-content"
      >

        <div
          class="auth-preview-background-copy"
        >

          <h1>
            ${this.escapeHTML(
              title
            )}
          </h1>

          <p>
            ${this.escapeHTML(
              description
            )}
          </p>

        </div>

      </div>
    `;
  }


  /* =======================================================
     PAGE GENERATION
  ======================================================= */

  generatePage(
    config,
    pageConfig
  ) {
    switch (
      this.currentPage
    ) {

      case "signup":
        return this.generateSignup(
          config,
          pageConfig
        );

      case "forgotPassword":
        return this.generateForgotPassword(
          config,
          pageConfig
        );

      case "otp":
        return this.generateOTP(
          config,
          pageConfig
        );

      case "login":
      default:
        return this.generateLogin(
          config,
          pageConfig
        );
    }
  }


  /* =======================================================
     LOGIN
  ======================================================= */

  generateLogin(
    config,
    page
  ) {
    const authentication =
      config?.authentication || {};

    const social =
      authentication.social || {};

    const login =
      page || {};

    const title =
      login.title ||
      "Welcome back";

    const subtitle =
      login.subtitle ||
      "Sign in to continue to your account";

    const identifierOptions =
      this.getIdentifierOptions(
        login,
        authentication
      );

    const showPassword =
      login.showPassword !== false;

    const showRemember =
      login.showRememberMe !== false;

    const showForgot =
      login.showForgotPassword !== false;

    const showSignup =
      login.showSignup !== false;

    const showSocial =
      social.google?.enabled ||
      social.linkedin?.enabled ||
      social.github?.enabled;

    return `
      <div
        class="preview-page-header"
      >

        <h1>
          ${this.escapeHTML(
            title
          )}
        </h1>

        <p>
          ${this.escapeHTML(
            subtitle
          )}
        </p>

      </div>


      <form
        class="preview-auth-form"
        data-preview-form="login"
      >

        ${this.generateIdentifierSelector(
          identifierOptions
        )}


        <div
          class="preview-form-group"
        >

          <label>
            ${this.escapeHTML(
              this.getIdentifierLabel(
                identifierOptions[0]
              )
            )}
          </label>

          <input
            type="${this.getIdentifierInputType(
              identifierOptions[0]
            )}"
            placeholder="${this.escapeAttribute(
              this.getIdentifierPlaceholder(
                identifierOptions[0]
              )
            )}"
            autocomplete="username"
          >

        </div>


        ${
          showPassword
            ? `
              <div
                class="preview-form-group"
              >

                <label>
                  Password
                </label>

                <div
                  class="preview-password-wrapper"
                >

                  <input
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                  >

                  <button
                    type="button"
                    class="preview-password-toggle"
                    data-preview-action="toggle-password"
                  >
                    Show
                  </button>

                </div>

              </div>
            `
            : ""
        }


        <div
          class="preview-login-options"
        >

          ${
            showRemember
              ? `
                <label
                  class="preview-checkbox"
                >

                  <input
                    type="checkbox"
                  >

                  <span>
                    Remember me
                  </span>

                </label>
              `
              : ""
          }


          ${
            showForgot
              ? `
                <button
                  type="button"
                  class="preview-link-button"
                  data-preview-action="forgot-password"
                >
                  ${
                    this.escapeHTML(
                      login.forgotPasswordText ||
                      "Forgot password?"
                    )
                  }
                </button>
              `
              : ""
          }

        </div>


        ${
          authentication.magicLink?.enabled
            ? `
              <button
                type="button"
                class="preview-secondary-action"
                data-preview-action="magic-link"
              >
                Send Magic Link
              </button>
            `
            : ""
        }


        ${
          authentication.otp?.enabled
            ? `
              <button
                type="button"
                class="preview-secondary-action"
                data-preview-action="open-otp"
              >
                ${
                  this.escapeHTML(
                    authentication.otp.buttonText ||
                    "Continue with OTP"
                  )
                }
              </button>
            `
            : ""
        }


        <button
          type="submit"
          class="preview-primary-button"
        >
          ${
            this.escapeHTML(
              login.buttonText ||
              "Sign In"
            )
          }
        </button>

      </form>


      ${
        showSocial
          ? this.generateSocialLogin(
              social
            )
          : ""
      }


      ${
        showSignup
          ? `
            <div
              class="preview-page-switch"
            >

              <span>
                ${
                  this.escapeHTML(
                    login.signupPrompt ||
                    "New here?"
                  )
                }
              </span>

              <button
                type="button"
                data-preview-action="signup"
              >
                ${
                  this.escapeHTML(
                    login.signupButtonText ||
                    "Create Account"
                  )
                }
              </button>

            </div>
          `
          : ""
      }
    `;
  }


  /* =======================================================
     SIGNUP
  ======================================================= */

  generateSignup(
    config,
    page
  ) {
    const signup =
      page || {};

    const title =
      signup.title ||
      "Create account";

    const subtitle =
      signup.subtitle ||
      "Create your account to get started";

    const fields =
      signup.fields ||
      {
        fullName: true,
        email: true,
        mobile: false,
        username: false,
        password: true,
        confirmPassword: true
      };

    return `
      <div
        class="preview-page-header"
      >

        <h1>
          ${this.escapeHTML(
            title
          )}
        </h1>

        <p>
          ${this.escapeHTML(
            subtitle
          )}
        </p>

      </div>


      <form
        class="preview-auth-form"
        data-preview-form="signup"
      >

        ${
          fields.fullName !== false
            ? this.generateInputGroup(
                "Full Name",
                "text",
                "Enter your full name",
                "name"
              )
            : ""
        }

        ${
          fields.username
            ? this.generateInputGroup(
                "Username",
                "text",
                "Choose a username",
                "username"
              )
            : ""
        }

        ${
          fields.email !== false
            ? this.generateInputGroup(
                "Email Address",
                "email",
                "Enter your email",
                "email"
              )
            : ""
        }

        ${
          fields.mobile
            ? this.generateInputGroup(
                "Mobile Number",
                "tel",
                "Enter your mobile number",
                "tel"
              )
            : ""
        }

        ${
          fields.password !== false
            ? this.generatePasswordGroup(
                "Password",
                "Create a password"
              )
            : ""
        }

        ${
          fields.confirmPassword !== false
            ? this.generatePasswordGroup(
                "Confirm Password",
                "Confirm your password"
              )
            : ""
        }


        <button
          type="submit"
          class="preview-primary-button"
        >
          ${
            this.escapeHTML(
              signup.buttonText ||
              "Create Account"
            )
          }
        </button>

      </form>


      <div
        class="preview-page-switch"
      >

        <span>
          ${
            this.escapeHTML(
              signup.loginPrompt ||
              "Already have an account?"
            )
          }
        </span>

        <button
          type="button"
          data-preview-action="login"
        >
          ${
            this.escapeHTML(
              signup.loginButtonText ||
              "Sign In"
            )
          }
        </button>

      </div>
    `;
  }


  /* =======================================================
     FORGOT PASSWORD
  ======================================================= */

  generateForgotPassword(
    config,
    page
  ) {
    const forgot =
      page || {};

    const title =
      forgot.title ||
      "Forgot password?";

    const subtitle =
      forgot.subtitle ||
      "Enter your email or mobile number and we will help you reset your password.";

    return `
      <button
        type="button"
        class="preview-back-button"
        data-preview-action="login"
      >
        ← Back to login
      </button>


      <div
        class="preview-page-header"
      >

        <h1>
          ${this.escapeHTML(
            title
          )}
        </h1>

        <p>
          ${this.escapeHTML(
            subtitle
          )}
        </p>

      </div>


      <form
        class="preview-auth-form"
        data-preview-form="forgot-password"
      >

        <div
          class="preview-form-group"
        >

          <label>
            Email or Mobile Number
          </label>

          <input
            type="text"
            placeholder="Enter your email or mobile number"
          >

        </div>


        <button
          type="submit"
          class="preview-primary-button"
        >
          ${
            this.escapeHTML(
              forgot.buttonText ||
              "Send Reset Link"
            )
          }
        </button>

      </form>
    `;
  }


  /* =======================================================
     OTP
  ======================================================= */

  generateOTP(
    config,
    page
  ) {
    const otpConfig =
      config?.pages?.otp ||
      config?.otp ||
      config?.authentication?.otp ||
      {};

    const otp =
      page || otpConfig;

    const input =
      otp.input ||
      {};

    let length =
      Number(
        input.length ||
        otp.length ||
        otpConfig.length ||
        6
      );

    if (
      ![4, 6, 8].includes(
        length
      )
    ) {
      length = 6;
    }

    const methods =
      input.methods ||
      otp.methods ||
      otp.deliveryMethods ||
      otpConfig.deliveryMethods ||
      [
        "email",
        "sms",
        "whatsapp"
      ];

    const resendEnabled =
      otp.resendEnabled !== false;

    return `
      <button
        type="button"
        class="preview-back-button"
        data-preview-action="login"
      >
        ← Back to login
      </button>


      <div
        class="preview-page-header"
      >

        <h1>
          ${
            this.escapeHTML(
              otp.title ||
              "Verify your identity"
            )
          }
        </h1>

        <p>
          ${
            this.escapeHTML(
              otp.subtitle ||
              "Enter the verification code sent to you."
            )
          }
        </p>

      </div>


      ${
        this.generateOtpMethods(
          methods
        )
      }


      <form
        class="preview-auth-form"
        data-preview-form="otp"
      >

        <div
          class="preview-otp-inputs"
          data-otp-length="${length}"
        >

          ${
            Array.from(
              {
                length
              }
            )
              .map(
                (_, index) => `
                  <input
                    type="text"
                    inputmode="numeric"
                    maxlength="1"
                    class="preview-otp-input"
                    data-otp-index="${index}"
                    autocomplete="one-time-code"
                  >
                `
              )
              .join("")
          }

        </div>


        <button
          type="submit"
          class="preview-primary-button"
        >
          ${
            this.escapeHTML(
              otp.buttonText ||
              "Verify OTP"
            )
          }
        </button>

      </form>


      ${
        resendEnabled
          ? `
            <div
              class="preview-resend"
            >

              <span>
                Didn't receive the code?
              </span>

              <button
                type="button"
                class="preview-link-button"
                data-preview-action="resend-otp"
              >
                Resend OTP
              </button>

              <span
                class="preview-otp-timer"
                data-otp-timer
              >
                00:30
              </span>

            </div>
          `
          : ""
      }
    `;
  }


  generateOtpMethods(
    methods
  ) {
    if (
      !Array.isArray(
        methods
      ) ||
      methods.length === 0
    ) {
      return "";
    }

    const labels = {
      email: "Email",
      sms: "SMS",
      whatsapp: "WhatsApp",
      authenticator:
        "Authenticator"
    };

    return `
      <div
        class="preview-otp-methods"
      >

        ${
          methods
            .map(
              (
                method,
                index
              ) => `
                <button
                  type="button"
                  class="
                    preview-otp-method
                    ${
                      index === 0
                        ? "active"
                        : ""
                    }
                  "
                  data-preview-action="select-otp-method"
                  data-otp-method="${this.escapeAttribute(
                    method
                  )}"
                >
                  ${
                    this.escapeHTML(
                      labels[method] ||
                      method
                    )
                  }
                </button>
              `
            )
            .join("")
        }

      </div>
    `;
  }


  /* =======================================================
     IDENTIFIER OPTIONS
  ======================================================= */

  getIdentifierOptions(
    login,
    authentication
  ) {
    const options =
      login.identifierTypes ||
      authentication.identifierTypes ||
      authentication.loginMethods ||
      [
        "email"
      ];

    if (
      !Array.isArray(
        options
      ) ||
      options.length === 0
    ) {
      return ["email"];
    }

    return options;
  }


  generateIdentifierSelector(
    options
  ) {
    if (
      !options ||
      options.length <= 1
    ) {
      return "";
    }

    return `
      <div
        class="preview-identifier-options"
      >

        ${
          options
            .map(
              (
                option,
                index
              ) => `
                <button
                  type="button"
                  class="
                    preview-identifier-option
                    ${
                      index === 0
                        ? "active"
                        : ""
                    }
                  "
                  data-preview-action="select-identifier"
                  data-identifier="${this.escapeAttribute(
                    option
                  )}"
                >
                  ${
                    this.escapeHTML(
                      this.getIdentifierLabel(
                        option
                      )
                    )
                  }
                </button>
              `
            )
            .join("")
        }

      </div>
    `;
  }


  getIdentifierLabel(
    identifier
  ) {
    const labels = {
      email:
        "Email Address",

      mobile:
        "Mobile Number",

      phone:
        "Mobile Number",

      username:
        "Username"
    };

    return (
      labels[
        String(identifier)
          .toLowerCase()
      ] ||
      "Email Address"
    );
  }


  getIdentifierInputType(
    identifier
  ) {
    const value =
      String(identifier)
        .toLowerCase();

    if (value === "email") {
      return "email";
    }

    if (
      value === "mobile" ||
      value === "phone"
    ) {
      return "tel";
    }

    return "text";
  }


  getIdentifierPlaceholder(
    identifier
  ) {
    const value =
      String(identifier)
        .toLowerCase();

    if (value === "mobile") {
      return "Enter your mobile number";
    }

    if (value === "phone") {
      return "Enter your phone number";
    }

    if (value === "username") {
      return "Enter your username";
    }

    return "Enter your email";
  }


  /* =======================================================
     SOCIAL LOGIN
  ======================================================= */

  generateSocialLogin(
    social
  ) {
    const buttons = [];

    if (social.google?.enabled) {
      buttons.push(
        this.generateSocialButton(
          "Google",
          "G"
        )
      );
    }

    if (social.linkedin?.enabled) {
      buttons.push(
        this.generateSocialButton(
          "LinkedIn",
          "in"
        )
      );
    }

    if (social.github?.enabled) {
      buttons.push(
        this.generateSocialButton(
          "GitHub",
          "GH"
        )
      );
    }

    if (
      buttons.length === 0
    ) {
      return "";
    }

    return `
      <div
        class="preview-social-login"
      >

        <div
          class="preview-divider"
        >
          <span>
            OR CONTINUE WITH
          </span>
        </div>

        <div
          class="preview-social-buttons"
        >
          ${buttons.join("")}
        </div>

      </div>
    `;
  }


  generateSocialButton(
    name,
    icon
  ) {
    return `
      <button
        type="button"
        class="preview-social-button"
        data-preview-action="social-login"
        data-provider="${this.escapeAttribute(
          name
        )}"
      >

        <span
          class="preview-social-icon"
        >
          ${this.escapeHTML(
            icon
          )}
        </span>

        Continue with ${this.escapeHTML(
          name
        )}

      </button>
    `;
  }


  /* =======================================================
     FORM COMPONENTS
  ======================================================= */

  generateInputGroup(
    label,
    type,
    placeholder,
    autocomplete = ""
  ) {
    return `
      <div
        class="preview-form-group"
      >

        <label>
          ${this.escapeHTML(
            label
          )}
        </label>

        <input
          type="${this.escapeAttribute(
            type
          )}"
          placeholder="${this.escapeAttribute(
            placeholder
          )}"
          autocomplete="${this.escapeAttribute(
            autocomplete
          )}"
        >

      </div>
    `;
  }


  generatePasswordGroup(
    label,
    placeholder
  ) {
    return `
      <div
        class="preview-form-group"
      >

        <label>
          ${this.escapeHTML(
            label
          )}
        </label>

        <div
          class="preview-password-wrapper"
        >

          <input
            type="password"
            placeholder="${this.escapeAttribute(
              placeholder
            )}"
          >

          <button
            type="button"
            class="preview-password-toggle"
            data-preview-action="toggle-password"
          >
            Show
          </button>

        </div>

      </div>
    `;
  }


  /* =======================================================
     ACTIONS
  ======================================================= */

  handlePreviewAction(
    action,
    element
  ) {
    switch (action) {

      case "login":
        this.setPage("login");
        break;

      case "signup":
        this.setPage("signup");
        break;

      case "forgot-password":
        this.setPage(
          "forgotPassword"
        );
        break;

      case "open-otp":
        this.setPage("otp");
        break;

      case "toggle-password":
        this.togglePassword(
          element
        );
        break;

      case "select-identifier":
        this.selectIdentifier(
          element
        );
        break;

      case "select-otp-method":
        this.selectOtpMethod(
          element
        );
        break;

      case "resend-otp":
        this.resendOtp(
          element
        );
        break;

      case "magic-link":
        this.showTemporaryMessage(
          "Magic link would be sent here."
        );
        break;

      case "social-login":
        this.showTemporaryMessage(
          `Continue with ${
            element.dataset.provider ||
            "provider"
          }`
        );
        break;

      default:
        break;
    }
  }


  /* =======================================================
     PAGE SWITCHING
  ======================================================= */

  setPage(page) {
    this.currentPage =
      this.normalizePageName(
        page
      );

    this.updateStatePage(
      this.currentPage
    );

    this.render();
  }


  updateStatePage(page) {
    const paths = [
      "currentPage",
      "page.activePage"
    ];

    if (
      window.state &&
      typeof window.state.set ===
        "function"
    ) {
      paths.forEach(
        (path) => {
          try {
            window.state.set(
              path,
              page
            );
          } catch (error) {}
        }
      );
    }

    if (
      window.state &&
      typeof window.state.update ===
        "function"
    ) {
      try {
        window.state.update(
          {
            currentPage:
              page
          }
        );
      } catch (error) {}
    }

    if (
      window.state &&
      window.state.config
    ) {
      window.state.config.currentPage =
        page;
    }

    if (
      window.config
    ) {
      window.config.currentPage =
        page;
    }

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:page-changed",
        {
          detail: {
            page
          }
        }
      )
    );
  }


  /* =======================================================
     DEVICE PREVIEW
  ======================================================= */

  setDevice(device) {
    const allowed =
      [
        "desktop",
        "tablet",
        "mobile"
      ];

    if (
      !allowed.includes(
        device
      )
    ) {
      return;
    }

    this.currentDevice =
      device;

    this.applyDeviceMode();

    this.updateActiveDeviceButtons();

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:device-changed",
        {
          detail: {
            device
          }
        }
      )
    );
  }


  applyDeviceMode() {
    if (!this.container) {
      return;
    }

    const root =
      this.container.querySelector(
        ".auth-preview-root"
      );

    if (!root) {
      return;
    }

    root.classList.remove(
      "preview-device-desktop",
      "preview-device-tablet",
      "preview-device-mobile"
    );

    root.classList.add(
      `preview-device-${this.currentDevice}`
    );

    this.container.classList.remove(
      "preview-mode-desktop",
      "preview-mode-tablet",
      "preview-mode-mobile"
    );

    this.container.classList.add(
      `preview-mode-${this.currentDevice}`
    );
  }


  updateActiveDeviceButtons() {
    document
      .querySelectorAll(
        this.deviceSelector
      )
      .forEach(
        (button) => {
          button.classList.toggle(
            "active",
            button.dataset.previewDevice ===
              this.currentDevice
          );
        }
      );
  }


  updateActivePageButtons() {
    document
      .querySelectorAll(
        this.pageSelector
      )
      .forEach(
        (button) => {
          const page =
            this.normalizePageName(
              button.dataset.previewPage
            );

          button.classList.toggle(
            "active",
            page ===
              this.currentPage
          );
        }
      );
  }


  /* =======================================================
     PASSWORD
  ======================================================= */

  togglePassword(button) {
    const wrapper =
      button.closest(
        ".preview-password-wrapper"
      );

    if (!wrapper) {
      return;
    }

    const input =
      wrapper.querySelector(
        "input"
      );

    if (!input) {
      return;
    }

    const isPassword =
      input.type ===
      "password";

    input.type =
      isPassword
        ? "text"
        : "password";

    button.textContent =
      isPassword
        ? "Hide"
        : "Show";
  }


  /* =======================================================
     IDENTIFIER
  ======================================================= */

  selectIdentifier(
    button
  ) {
    const identifier =
      button.dataset.identifier ||
      "email";

    const parent =
      button.parentElement;

    if (!parent) {
      return;
    }

    parent
      .querySelectorAll(
        ".preview-identifier-option"
      )
      .forEach(
        (item) => {
          item.classList.remove(
            "active"
          );
        }
      );

    button.classList.add(
      "active"
    );

    const form =
      button.closest(
        ".preview-auth-form"
      );

    if (!form) {
      return;
    }

    const group =
      form.querySelector(
        ".preview-form-group"
      );

    if (!group) {
      return;
    }

    const label =
      group.querySelector(
        "label"
      );

    const input =
      group.querySelector(
        "input"
      );

    if (label) {
      label.textContent =
        this.getIdentifierLabel(
          identifier
        );
    }

    if (input) {
      input.type =
        this.getIdentifierInputType(
          identifier
        );

      input.placeholder =
        this.getIdentifierPlaceholder(
          identifier
        );

      input.value = "";
    }
  }


  /* =======================================================
     OTP
  ======================================================= */

  selectOtpMethod(
    button
  ) {
    const parent =
      button.parentElement;

    if (!parent) {
      return;
    }

    parent
      .querySelectorAll(
        ".preview-otp-method"
      )
      .forEach(
        (item) => {
          item.classList.remove(
            "active"
          );
        }
      );

    button.classList.add(
      "active"
    );

    const method =
      button.dataset.otpMethod;

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:otp-method-changed",
        {
          detail: {
            method
          }
        }
      )
    );
  }


  resendOtp(button) {
    if (
      button.disabled
    ) {
      return;
    }

    this.startOtpTimer();

    this.showTemporaryMessage(
      "OTP has been resent."
    );
  }


  startOtpTimer() {
    this.stopOtpTimer();

    this.resendSeconds =
      30;

    const timer =
      this.container.querySelector(
        "[data-otp-timer]"
      );

    const resendButton =
      this.container.querySelector(
        '[data-preview-action="resend-otp"]'
      );

    if (
      resendButton
    ) {
      resendButton.disabled =
        true;
    }

    const updateTimer = () => {
      if (timer) {
        timer.textContent =
          this.formatTimer(
            this.resendSeconds
          );
      }
    };

    updateTimer();

    this.otpTimer =
      setInterval(
        () => {
          this.resendSeconds -= 1;

          updateTimer();

          if (
            this.resendSeconds <= 0
          ) {
            this.stopOtpTimer();

            if (
              resendButton
            ) {
              resendButton.disabled =
                false;
            }

            if (timer) {
              timer.textContent =
                "";
            }
          }
        },
        1000
      );
  }


  stopOtpTimer() {
    if (
      this.otpTimer
    ) {
      clearInterval(
        this.otpTimer
      );

      this.otpTimer = null;
    }
  }


  formatTimer(seconds) {
    const safe =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(
        safe / 60
      );

    const remaining =
      safe % 60;

    return (
      String(minutes)
        .padStart(
          2,
          "0"
        ) +
      ":" +
      String(remaining)
        .padStart(
          2,
          "0"
        )
    );
  }


  /* =======================================================
     FORM EVENTS
  ======================================================= */

  handleForms() {
    if (!this.container) {
      return;
    }

    const forms =
      this.container.querySelectorAll(
        ".preview-auth-form"
      );

    forms.forEach(
      (form) => {
        form.addEventListener(
          "submit",
          (event) => {
            event.preventDefault();

            const type =
              form.dataset.previewForm;

            if (
              type ===
              "forgot-password"
            ) {
              this.setPage(
                "otp"
              );

              return;
            }

            this.showTemporaryMessage(
              `${
                type
                  ? this.capitalize(
                      type.replace(
                        /-/g,
                        " "
                      )
                    )
                  : "Form"
              } submitted.`
            );
          }
        );
      }
    );

    this.attachOtpInputBehavior();
  }


  attachOtpInputBehavior() {
    const inputs =
      this.container.querySelectorAll(
        ".preview-otp-input"
      );

    inputs.forEach(
      (
        input,
        index
      ) => {

        input.addEventListener(
          "input",
          () => {
            input.value =
              input.value
                .replace(
                  /\D/g,
                  ""
                )
                .slice(
                  0,
                  1
                );

            if (
              input.value &&
              inputs[index + 1]
            ) {
              inputs[
                index + 1
              ].focus();
            }
          }
        );

        input.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "Backspace" &&
              !input.value &&
              inputs[index - 1]
            ) {
              inputs[
                index - 1
              ].focus();
            }
          }
        );

        input.addEventListener(
          "paste",
          (event) => {
            event.preventDefault();

            const text =
              (
                event.clipboardData ||
                window.clipboardData
              )
                .getData("text")
                .replace(
                  /\D/g,
                  ""
                );

            text
              .slice(
                0,
                inputs.length
              )
              .split("")
              .forEach(
                (
                  character,
                  characterIndex
                ) => {
                  if (
                    inputs[
                      characterIndex
                    ]
                  ) {
                    inputs[
                      characterIndex
                    ].value =
                      character;
                  }
                }
              );

            const nextIndex =
              Math.min(
                text.length,
                inputs.length - 1
              );

            if (
              inputs[nextIndex]
            ) {
              inputs[
                nextIndex
              ].focus();
            }
          }
        );
      }
    );
  }


  /* =======================================================
     RENDER EVENTS
  ======================================================= */

  emitPreviewUpdated() {
    this.handleForms();

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:preview-updated",
        {
          detail: {
            page:
              this.currentPage,

            device:
              this.currentDevice,

            preview:
              this.container
          }
        }
      )
    );
  }


  /* =======================================================
     TEMP MESSAGE
  ======================================================= */

  showTemporaryMessage(
    message
  ) {
    const existing =
      document.querySelector(
        ".preview-temporary-message"
      );

    if (existing) {
      existing.remove();
    }

    const element =
      document.createElement(
        "div"
      );

    element.className =
      "preview-temporary-message";

    element.textContent =
      message;

    document.body.appendChild(
      element
    );

    setTimeout(
      () => {
        element.classList.add(
          "show"
        );
      },
      10
    );

    setTimeout(
      () => {
        element.classList.remove(
          "show"
        );

        setTimeout(
          () => {
            element.remove();
          },
          250
        );
      },
      2200
    );
  }


  /* =======================================================
     HELPERS
  ======================================================= */

  addPx(value) {
    if (
      typeof value ===
      "string"
    ) {
      if (
        value.includes(
          "px"
        ) ||
        value.includes(
          "%"
        ) ||
        value.includes(
          "rem"
        )
      ) {
        return value;
      }
    }

    const number =
      Number(value);

    if (
      Number.isNaN(
        number
      )
    ) {
      return "0px";
    }

    return `${number}px`;
  }


  capitalize(value) {
    return String(value)
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  }


  escapeHTML(value) {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  escapeAttribute(value) {
    return this.escapeHTML(
      value
    );
  }
}


/* =========================================================
   GLOBAL INSTANCE
========================================================= */

window.PreviewManager =
  PreviewManager;


document.addEventListener(
  "DOMContentLoaded",
  () => {

    window.previewManager =
      new PreviewManager({
        previewSelector:
          "#previewRoot",

        deviceSelector:
          "[data-preview-device]",

        pageSelector:
          "[data-preview-page]"
      });

  }
);


/* =========================================================
   GLOBAL COMPATIBILITY FUNCTIONS
========================================================= */

window.renderPreview =
  function () {

    if (
      window.previewManager
    ) {
      window.previewManager
        .render();
    }
  };


window.refreshPreview =
  window.renderPreview;


window.setPreviewDevice =
  function (device) {

    if (
      window.previewManager
    ) {
      window.previewManager
        .setDevice(
          device
        );
    }
  };


window.setPreviewPage =
  function (page) {

    if (
      window.previewManager
    ) {
      window.previewManager
        .setPage(
          page
        );
    }
  };


/* =========================================================
   CUSTOMIZATION LISTENERS
========================================================= */

[
  "auth-builder:config-updated",
  "auth-builder:customization-updated",
  "auth-builder:state-updated",
  "auth-builder:layout-updated",
  "auth-builder:branding-updated",
  "auth-builder:background-updated",
  "auth-builder:page-config-updated"
].forEach(
  (eventName) => {

    document.addEventListener(
      eventName,
      () => {

        if (
          window.previewManager
        ) {
          window.previewManager
            .render();
        }

      }
    );

  }
);