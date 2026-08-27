/* =========================================================
   AUTH PAGE CONFIGURATOR
   File: js/renderer.js

   Purpose:
   - Reads the current configuration from AuthState
   - Renders Login page
   - Renders Signup page
   - Renders Forgot Password page
   - Renders OTP page
   - Updates preview dynamically
   - Supports desktop / tablet / mobile preview
   - Supports uploaded images and default assets
========================================================= */

class AuthRenderer {

  constructor(container) {

    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    this.passwordVisible = false;

    this.activeAuthMethod = null;

    this.unsubscribe = null;

    if (!this.container) {
      console.error(
        "AuthRenderer: Preview container not found."
      );
      return;
    }

    this.initialize();
  }


  /* =====================================================
     INITIALIZE
  ===================================================== */

  initialize() {

    if (!window.AuthState) {
      console.error(
        "AuthState is not available. Load state.js before renderer.js."
      );
      return;
    }

    this.activeAuthMethod =
      AuthState.getValue(
        "login.defaultAuthentication"
      ) || "password";

    this.render();

    this.unsubscribe =
      AuthState.subscribe(
        () => {

          this.render();
        }
      );
  }


  /* =====================================================
     DESTROY
  ===================================================== */

  destroy() {

    if (this.unsubscribe) {

      this.unsubscribe();

      this.unsubscribe = null;
    }

    if (this.container) {

      this.container.innerHTML = "";
    }
  }


  /* =====================================================
     RENDER
  ===================================================== */

  render() {

    const config =
      AuthState.getConfig();

    if (!config || !this.container) {
      return;
    }

    this.container.innerHTML = "";

    const previewWrapper =
      this.createElement(
        "div",
        {
          className:
            this.getPreviewClass(config)
        }
      );

    const authPage =
      this.renderAuthPage(config);

    previewWrapper.appendChild(
      authPage
    );

    this.container.appendChild(
      previewWrapper
    );

    this.attachEvents(config);
  }


  /* =====================================================
     PREVIEW CLASS
  ===================================================== */

  getPreviewClass(config) {

    const mode =
      config.app?.previewMode ||
      "desktop";

    return [
      "auth-preview-wrapper",
      `preview-${mode}`
    ].join(" ");
  }


  /* =====================================================
     MAIN AUTH PAGE
  ===================================================== */

  renderAuthPage(config) {

    const page =
      this.createElement(
        "div",
        {
          className:
            this.getPageClass(config)
        }
      );

    const backgroundPanel =
      this.renderBackgroundPanel(config);

    const formPanel =
      this.renderFormPanel(config);


    const backgroundSide =
      config.layout?.backgroundSide ||
      "left";


    if (
      config.layout?.pageLayout ===
      "single"
    ) {

      page.appendChild(
        formPanel
      );

    } else if (
      backgroundSide ===
      "right"
    ) {

      page.appendChild(
        formPanel
      );

      page.appendChild(
        backgroundPanel
      );

    } else {

      page.appendChild(
        backgroundPanel
      );

      page.appendChild(
        formPanel
      );
    }

    return page;
  }


  /* =====================================================
     PAGE CLASS
  ===================================================== */

  getPageClass(config) {

    const classes = [
      "auth-page"
    ];

    classes.push(
      `auth-layout-${config.layout?.pageLayout || "split"}`
    );

    return classes.join(" ");
  }


  /* =====================================================
     BACKGROUND PANEL
  ===================================================== */

  renderBackgroundPanel(config) {

    const panel =
      this.createElement(
        "section",
        {
          className:
            "auth-background-panel"
        }
      );

    panel.style.flexBasis =
      `${config.layout?.backgroundPanelWidth || 50}%`;

    const background =
      config.background || {};

    if (
      background.type ===
      "image"
    ) {

      if (background.image) {

        panel.style.backgroundImage =
          `url("${background.image}")`;
      }

      panel.style.backgroundSize =
        background.size || "cover";

      panel.style.backgroundPosition =
        background.position || "center";

      panel.style.backgroundRepeat =
        background.repeat || "no-repeat";

    } else {

      panel.style.background =
        background.color ||
        "#0f172a";
    }


    if (background.blur) {

      panel.style.filter =
        `blur(${background.blur}px)`;
    }


    if (
      background.brightness !== undefined
    ) {

      panel.style.filter =
        `brightness(${background.brightness})`;
    }


    /* Overlay */

    const overlay =
      this.createElement(
        "div",
        {
          className:
            "auth-background-overlay"
        }
      );

    overlay.style.background =
      background.overlayColor ||
      "#000000";

    overlay.style.opacity =
      background.overlayOpacity ??
      0.35;


    panel.appendChild(
      overlay
    );


    /* Background content */

    const content =
      this.createElement(
        "div",
        {
          className:
            "auth-background-content"
        }
      );


    if (
      config.branding?.showLogo
    ) {

      content.appendChild(
        this.renderBackgroundLogo(config)
      );
    }


    if (
      config.branding?.showBrandName
    ) {

      const brand =
        this.createElement(
          "h2",
          {
            className:
              "auth-background-brand"
          },
          config.branding.brandName ||
          "AuthFlow"
        );

      content.appendChild(
        brand
      );
    }


    if (
      config.branding?.showBackgroundText
    ) {

      const textContainer =
        this.createElement(
          "div",
          {
            className:
              "auth-background-text"
          }
        );


      const heading =
        this.createElement(
          "h1",
          {},
          config.branding.heading ||
          "Welcome back"
        );


      const subtitle =
        this.createElement(
          "p",
          {},
          config.branding.subtitle ||
          "Secure access to your account with a seamless authentication experience."
        );


      textContainer.appendChild(
        heading
      );

      textContainer.appendChild(
        subtitle
      );

      content.appendChild(
        textContainer
      );
    }


    panel.appendChild(
      content
    );

    return panel;
  }


  /* =====================================================
     BACKGROUND LOGO
  ===================================================== */

  renderBackgroundLogo(config) {

    const branding =
      config.branding || {};

    const wrapper =
      this.createElement(
        "div",
        {
          className:
            `auth-logo auth-logo-${branding.logoStyle || "circle"}`
        }
      );

    wrapper.style.width =
      `${branding.logoSize || 64}px`;

    wrapper.style.height =
      `${branding.logoSize || 64}px`;


    if (
      branding.logo
    ) {

      const image =
        this.createElement(
          "img",
          {
            src:
              branding.logo,

            alt:
              branding.brandName ||
              "Logo"
          }
        );

      wrapper.appendChild(
        image
      );

    } else {

      const text =
        this.createElement(
          "span",
          {},
          branding.logoText || "A"
        );

      wrapper.appendChild(
        text
      );
    }

    return wrapper;
  }


  /* =====================================================
     FORM PANEL
  ===================================================== */

  renderFormPanel(config) {

    const panel =
      this.createElement(
        "section",
        {
          className:
            "auth-form-panel"
        }
      );

    panel.style.flexBasis =
      `${config.layout?.formPanelWidth || 50}%`;


    const inner =
      this.createElement(
        "div",
        {
          className:
            "auth-form-panel-inner"
        }
      );


    const card =
      this.renderCard(config);

    inner.appendChild(
      card
    );

    panel.appendChild(
      inner
    );

    return panel;
  }


  /* =====================================================
     AUTH CARD
  ===================================================== */

  renderCard(config) {

    const cardConfig =
      config.card || {};

    const card =
      this.createElement(
        "div",
        {
          className:
            this.getCardClass(cardConfig)
        }
      );

    card.style.maxWidth =
      `${cardConfig.width || 430}px`;

    card.style.padding =
      `${cardConfig.padding || 42}px`;

    card.style.borderRadius =
      `${cardConfig.borderRadius || 20}px`;

    card.style.background =
      cardConfig.transparent
        ? "transparent"
        : (
          cardConfig.backgroundColor ||
          config.colors?.cardBackground ||
          "#ffffff"
        );


    card.style.color =
      cardConfig.textColor ||
      config.colors?.text ||
      "#0f172a";


    if (
      cardConfig.border
    ) {

      card.style.border =
        `1px solid ${
          cardConfig.borderColor ||
          "#e2e8f0"
        }`;
    }


    const activePage =
      config.page?.activePage ||
      "login";


    switch (
      activePage
    ) {

      case "signup":

        card.appendChild(
          this.renderSignupPage(config)
        );

        break;


      case "forgot":

        card.appendChild(
          this.renderForgotPasswordPage(config)
        );

        break;


      case "otp":

        card.appendChild(
          this.renderOTPPage(config)
        );

        break;


      case "login":

      default:

        card.appendChild(
          this.renderLoginPage(config)
        );

        break;
    }

    return card;
  }


  /* =====================================================
     CARD CLASS
  ===================================================== */

  getCardClass(cardConfig) {

    const classes = [
      "auth-card"
    ];

    if (
      cardConfig.shadow
    ) {

      classes.push(
        `auth-shadow-${cardConfig.shadow}`
      );
    }

    if (
      cardConfig.transparent
    ) {

      classes.push(
        "auth-card-transparent"
      );
    }

    return classes.join(" ");
  }


  /* =====================================================
     LOGIN PAGE
  ===================================================== */

  renderLoginPage(config) {

    const login =
      config.login || {};

    const form =
      this.createElement(
        "div",
        {
          className:
            "auth-login-page"
        }
      );


    /* Header */

    form.appendChild(
      this.renderPageHeader(
        config,
        login.title ||
        "Welcome back",

        login.subtitle ||
        "Login to access your account"
      )
    );


    /* Identifier */

    if (
      login.showIdentifierSelector
    ) {

      form.appendChild(
        this.renderIdentifierSelector(
          config
        )
      );
    }


    /* Email / Mobile */

    form.appendChild(
      this.renderIdentifierInput(
        config
      )
    );


    /* Authentication method */

    form.appendChild(
      this.renderAuthenticationMethod(
        config
      )
    );


    /* Password / OTP */

    if (
      this.activeAuthMethod ===
      "password"
    ) {

      form.appendChild(
        this.renderPasswordInput(
          config,
          "login"
        )
      );

    } else if (
      this.activeAuthMethod ===
      "otp"
    ) {

      form.appendChild(
        this.renderOTPBoxes(
          config,
          login.otpLength ||
          6
        )
      );
    }


    /* Remember + forgot */

    if (
      this.activeAuthMethod ===
      "password"
    ) {

      form.appendChild(
        this.renderLoginOptions(
          config
        )
      );
    }


    /* Login button */

    form.appendChild(
      this.renderPrimaryButton(
        config,
        login.loginButtonText ||
        "Login"
      )
    );


    /* Social login */

    if (
      config.social?.enabled
    ) {

      form.appendChild(
        this.renderSocialLogin(
          config
        )
      );
    }


    /* Signup footer */

    if (
      config.signup?.enabled
    ) {

      form.appendChild(
        this.renderPageFooter(
          "Don't have an account?",
          "Create account",
          "signup"
        )
      );
    }

    return form;
  }


  /* =====================================================
     PAGE HEADER
  ===================================================== */

  renderPageHeader(
    config,
    title,
    subtitle
  ) {

    const header =
      this.createElement(
        "div",
        {
          className:
            "auth-page-header"
        }
      );


    const heading =
      this.createElement(
        "h2",
        {
          className:
            "auth-page-title"
        },
        title
      );


    const description =
      this.createElement(
        "p",
        {
          className:
            "auth-page-subtitle"
        },
        subtitle
      );


    header.appendChild(
      heading
    );

    header.appendChild(
      description
    );

    return header;
  }


  /* =====================================================
     IDENTIFIER SELECTOR
  ===================================================== */

  renderIdentifierSelector(config) {

    const wrapper =
      this.createElement(
        "div",
        {
          className:
            "auth-identifier-selector"
        }
      );


    const emailEnabled =
      config.login?.identifierOptions?.email;

    const mobileEnabled =
      config.login?.identifierOptions?.mobile;


    if (
      emailEnabled
    ) {

      const emailButton =
        this.createElement(
          "button",
          {
            type: "button",

            className:
              "auth-identifier-option active",

            dataset: {
              identifier:
                "email"
            }
          },
          "Email"
        );

      wrapper.appendChild(
        emailButton
      );
    }


    if (
      mobileEnabled
    ) {

      const mobileButton =
        this.createElement(
          "button",
          {
            type: "button",

            className:
              emailEnabled
                ? "auth-identifier-option"
                : "auth-identifier-option active",

            dataset: {
              identifier:
                "mobile"
            }
          },
          "Mobile"
        );

      wrapper.appendChild(
        mobileButton
      );
    }

    return wrapper;
  }


  /* =====================================================
     IDENTIFIER INPUT
  ===================================================== */

  renderIdentifierInput(config) {

    const defaultIdentifier =
      config.login?.defaultIdentifier ||
      "email";


    const placeholder =
      defaultIdentifier ===
      "mobile"
        ? "Enter your mobile number"
        : "Enter your email address";


    const type =
      defaultIdentifier ===
      "email"
        ? "email"
        : "tel";


    return this.renderInputField(
      config,
      {
        label:
          defaultIdentifier ===
          "mobile"
            ? "Mobile Number"
            : "Email Address",

        placeholder,

        type,

        id:
          "auth-identifier",

        name:
          "identifier"
      }
    );
  }


  /* =====================================================
     AUTHENTICATION METHOD
  ===================================================== */

  renderAuthenticationMethod(config) {

    const methods =
      config.login
        ?.authenticationMethods || {};

    const wrapper =
      this.createElement(
        "div",
        {
          className:
            "auth-method-selector"
        }
      );


    if (
      methods.password
    ) {

      const passwordButton =
        this.createElement(
          "button",
          {
            type:
              "button",

            className:
              this.activeAuthMethod ===
              "password"
                ? "auth-method-option active"
                : "auth-method-option",

            dataset: {
              authMethod:
                "password"
            }
          },
          "Password"
        );

      wrapper.appendChild(
        passwordButton
      );
    }


    if (
      methods.otp
    ) {

      const otpButton =
        this.createElement(
          "button",
          {
            type:
              "button",

            className:
              this.activeAuthMethod ===
              "otp"
                ? "auth-method-option active"
                : "auth-method-option",

            dataset: {
              authMethod:
                "otp"
            }
          },
          "Get key"
        );

      wrapper.appendChild(
        otpButton
      );
    }


    if (
      methods.magicLink
    ) {

      const magicButton =
        this.createElement(
          "button",
          {
            type:
              "button",

            className:
              this.activeAuthMethod ===
              "magicLink"
                ? "auth-method-option active"
                : "auth-method-option",

            dataset: {
              authMethod:
                "magicLink"
            }
          },
          "Magic Link"
        );

      wrapper.appendChild(
        magicButton
      );
    }

    return wrapper;
  }


  /* =====================================================
     PASSWORD INPUT
  ===================================================== */

  renderPasswordInput(
    config,
    context
  ) {

    const passwordConfig =
      context === "signup"
        ? {
            label:
              config.signup?.labels?.password ||
              "Password",

            placeholder:
              config.signup?.placeholders?.password ||
              "Enter password"
          }

        : (
          config.login?.password || {}
        );


    const field =
      this.renderInputField(
        config,
        {
          label:
            passwordConfig.label ||
            "Password",

          placeholder:
            passwordConfig.placeholder ||
            "Enter your password",

          type:
            this.passwordVisible
              ? "text"
              : "password",

          id:
            "auth-password",

          name:
            "password"
        }
      );


    if (
      config.login?.password?.showToggle !==
      false
    ) {

      const inputWrapper =
        field.querySelector(
          ".auth-input-wrapper"
        );

      if (
        inputWrapper
      ) {

        const toggle =
          this.createElement(
            "button",
            {
              type:
                "button",

              className:
                "auth-password-toggle",

              dataset: {
                action:
                  "toggle-password"
              }
            },
            this.passwordVisible
              ? "Hide"
              : "Show"
          );

        inputWrapper.appendChild(
          toggle
        );
      }
    }

    return field;
  }


  /* =====================================================
     LOGIN OPTIONS
  ===================================================== */

  renderLoginOptions(config) {

    const login =
      config.login || {};

    const options =
      this.createElement(
        "div",
        {
          className:
            "auth-login-options"
        }
      );


    if (
      login.showRememberMe
    ) {

      const remember =
        this.createElement(
          "label",
          {
            className:
              "auth-checkbox-label"
          }
        );


      const checkbox =
        this.createElement(
          "input",
          {
            type:
              "checkbox",

            name:
              "remember"
          }
        );


      const text =
        this.createElement(
          "span",
          {},
          login.rememberMeText ||
          "Remember me"
        );


      remember.appendChild(
        checkbox
      );

      remember.appendChild(
        text
      );

      options.appendChild(
        remember
      );
    }


    if (
      login.showForgotPassword &&
      config.forgotPassword?.enabled
    ) {

      const forgot =
        this.createElement(
          "button",
          {
            type:
              "button",

            className:
              "auth-text-link",

            dataset: {
              navigate:
                "forgot"
            }
          },
          login.forgotPasswordText ||
          "Forgot password?"
        );

      options.appendChild(
        forgot
      );
    }

    return options;
  }


  /* =====================================================
     SIGNUP PAGE
  ===================================================== */

  renderSignupPage(config) {

    const signup =
      config.signup || {};

    const form =
      this.createElement(
        "div",
        {
          className:
            "auth-signup-page"
        }
      );


    form.appendChild(
      this.renderPageHeader(
        config,
        signup.title ||
        "Create your account",

        signup.subtitle ||
        "Fill in your details to get started"
      )
    );


    const fields =
      signup.fields || {};


    if (
      fields.username
    ) {

      form.appendChild(
        this.renderInputField(
          config,
          {
            label:
              signup.labels?.username ||
              "Username",

            placeholder:
              signup.placeholders?.username ||
              "Enter your username",

            type:
              "text",

            name:
              "username"
          }
        )
      );
    }


    if (
      fields.email
    ) {

      form.appendChild(
        this.renderInputField(
          config,
          {
            label:
              signup.labels?.email ||
              "Email Address",

            placeholder:
              signup.placeholders?.email ||
              "Enter your email address",

            type:
              "email",

            name:
              "email"
          }
        )
      );
    }


    if (
      fields.mobile
    ) {

      form.appendChild(
        this.renderInputField(
          config,
          {
            label:
              signup.labels?.mobile ||
              "Mobile Number",

            placeholder:
              signup.placeholders?.mobile ||
              "Enter your mobile number",

            type:
              "tel",

            name:
              "mobile"
          }
        )
      );
    }


    if (
      fields.password
    ) {

      form.appendChild(
        this.renderPasswordInput(
          config,
          "signup"
        )
      );
    }


    if (
      fields.confirmPassword
    ) {

      form.appendChild(
        this.renderInputField(
          config,
          {
            label:
              signup.labels?.confirmPassword ||
              "Confirm Password",

            placeholder:
              signup.placeholders?.confirmPassword ||
              "Confirm your password",

            type:
              "password",

            name:
              "confirmPassword"
          }
        )
      );
    }


    form.appendChild(
      this.renderPrimaryButton(
        config,
        signup.buttonText ||
        "Create Account"
      )
    );


    form.appendChild(
      this.renderPageFooter(
        signup.footerText ||
        "Already have an account?",

        signup.footerButtonText ||
        "Login",

        "login"
      )
    );

    return form;
  }


  /* =====================================================
     FORGOT PASSWORD PAGE
  ===================================================== */

  renderForgotPasswordPage(config) {

    const forgot =
      config.forgotPassword || {};

    const form =
      this.createElement(
        "div",
        {
          className:
            "auth-forgot-page"
        }
      );


    form.appendChild(
      this.renderPageHeader(
        config,
        forgot.title ||
        "Forgot password?",

        forgot.subtitle ||
        "Enter your email or mobile number."
      )
    );


    form.appendChild(
      this.renderInputField(
        config,
        {
          label:
            forgot.identifierLabel ||
            "Email or Mobile Number",

          placeholder:
            forgot.identifierPlaceholder ||
            "Enter your email or mobile number",

          type:
            "text",

          name:
            "identifier"
        }
      )
    );


    form.appendChild(
      this.renderPrimaryButton(
        config,
        forgot.buttonText ||
        "Send Verification Key"
      )
    );


    form.appendChild(
      this.renderPageFooter(
        "",
        forgot.backButtonText ||
        "Back to login",

        "login"
      )
    );

    return form;
  }


  /* =====================================================
     OTP PAGE
  ===================================================== */

  renderOTPPage(config) {

    const otp =
      config.otp || {};

    const form =
      this.createElement(
        "div",
        {
          className:
            "auth-otp-page"
        }
      );


    form.appendChild(
      this.renderPageHeader(
        config,
        otp.title ||
        "Verify your account",

        otp.subtitle ||
        "Enter the verification code sent to you."
      )
    );


    form.appendChild(
      this.renderOTPBoxes(
        config,
        otp.length ||
        6
      )
    );


    form.appendChild(
      this.renderPrimaryButton(
        config,
        otp.verificationButtonText ||
        "Verify"
      )
    );


    const resend =
      this.createElement(
        "button",
        {
          type:
            "button",

          className:
            "auth-text-link auth-resend-code"
        },
        otp.resendText ||
        "Resend Code"
      );


    form.appendChild(
      resend
    );


    form.appendChild(
      this.renderPageFooter(
        "",
        otp.backButtonText ||
        "Back to login",

        "login"
      )
    );

    return form;
  }


  /* =====================================================
     INPUT FIELD
  ===================================================== */

  renderInputField(
    config,
    options
  ) {

    const field =
      this.createElement(
        "div",
        {
          className:
            "auth-field"
        }
      );


    if (
      options.label
    ) {

      const label =
        this.createElement(
          "label",
          {
            className:
              "auth-label"
          },
          options.label
        );

      field.appendChild(
        label
      );
    }


    const inputWrapper =
      this.createElement(
        "div",
        {
          className:
            "auth-input-wrapper"
        }
      );


    const input =
      this.createElement(
        "input",
        {
          type:
            options.type || "text",

          id:
            options.id || "",

          name:
            options.name || "",

          placeholder:
            options.placeholder || ""
        }
      );


    this.applyInputStyles(
      input,
      config
    );


    inputWrapper.appendChild(
      input
    );

    field.appendChild(
      inputWrapper
    );

    return field;
  }


  /* =====================================================
     INPUT STYLES
  ===================================================== */

  applyInputStyles(
    input,
    config
  ) {

    const inputs =
      config.inputs || {};

    const colors =
      config.colors || {};

    input.style.height =
      `${inputs.height || 50}px`;

    input.style.borderRadius =
      `${inputs.borderRadius || 10}px`;

    input.style.borderWidth =
      `${inputs.borderWidth || 1}px`;

    input.style.padding =
      `0 ${inputs.padding || 15}px`;

    input.style.background =
      colors.inputBackground ||
      "#ffffff";

    input.style.borderColor =
      colors.inputBorder ||
      "#cbd5e1";

    input.style.color =
      colors.inputText ||
      "#0f172a";

    input.style.fontSize =
      `${config.typography?.inputSize || 15}px`;
  }


  /* =====================================================
     OTP BOXES
  ===================================================== */

  renderOTPBoxes(
    config,
    length
  ) {

    const wrapper =
      this.createElement(
        "div",
        {
          className:
            "auth-otp-wrapper"
        }
      );


    for (
      let index = 0;

      index < length;

      index++
    ) {

      const input =
        this.createElement(
          "input",
          {
            type:
              "text",

            inputmode:
              "numeric",

            maxlength:
              "1",

            className:
              "auth-otp-input",

            dataset: {
              otpIndex:
                index
            }
          }
        );


      input.style.borderRadius =
        `${config.inputs?.borderRadius || 10}px`;

      input.style.borderColor =
        config.colors?.inputBorder ||
        "#cbd5e1";


      wrapper.appendChild(
        input
      );
    }

    return wrapper;
  }


  /* =====================================================
     PRIMARY BUTTON
  ===================================================== */

  renderPrimaryButton(
    config,
    text
  ) {

    const button =
      this.createElement(
        "button",
        {
          type:
            "button",

          className:
            "auth-primary-button"
        },
        text
      );


    const buttonConfig =
      config.button || {};

    button.style.height =
      `${buttonConfig.height || 52}px`;

    button.style.borderRadius =
      `${buttonConfig.borderRadius || 10}px`;

    button.style.fontWeight =
      buttonConfig.fontWeight || 700;

    button.style.background =
      config.colors?.primary ||
      "#2563eb";

    button.style.color =
      config.colors?.buttonText ||
      "#ffffff";

    button.style.fontSize =
      `${config.typography?.buttonSize || 15}px`;


    if (
      buttonConfig.uppercase
    ) {

      button.style.textTransform =
        "uppercase";
    }


    if (
      buttonConfig.fullWidth
    ) {

      button.style.width =
        "100%";
    }

    return button;
  }


  /* =====================================================
     SOCIAL LOGIN
  ===================================================== */

  renderSocialLogin(config) {

    const social =
      config.social || {};

    const wrapper =
      this.createElement(
        "div",
        {
          className:
            `auth-social-login auth-social-${social.layout || "vertical"}`
        }
      );


    const divider =
      this.createElement(
        "div",
        {
          className:
            "auth-social-divider"
        }
      );


    const dividerText =
      this.createElement(
        "span",
        {},
        social.title ||
        "Or continue with"
      );


    divider.appendChild(
      dividerText
    );

    wrapper.appendChild(
      divider
    );


    const providers =
      social.providers || {};


    const providerData = {

      google: {
        label:
          "Continue with Google",

        icon:
          "G"
      },

      facebook: {
        label:
          "Continue with Facebook",

        icon:
          "f"
      },

      apple: {
        label:
          "Continue with Apple",

        icon:
          "●"
      },

      github: {
        label:
          "Continue with GitHub",

        icon:
          "◉"
      }
    };


    Object.keys(providers)
      .forEach(
        (provider) => {

          if (
            !providers[provider]
          ) {
            return;
          }

          const providerInfo =
            providerData[provider];

          const button =
            this.createElement(
              "button",
              {
                type:
                  "button",

                className:
                  `auth-social-button auth-social-${provider}`
              }
            );


          const icon =
            this.createElement(
              "span",
              {
                className:
                  "auth-social-icon"
              },
              providerInfo.icon
            );


          const text =
            this.createElement(
              "span",
              {},
              providerInfo.label
            );


          button.appendChild(
            icon
          );

          button.appendChild(
            text
          );

          wrapper.appendChild(
            button
          );
        }
      );

    return wrapper;
  }


  /* =====================================================
     PAGE FOOTER
  ===================================================== */

  renderPageFooter(
    text,
    buttonText,
    navigateTo
  ) {

    const footer =
      this.createElement(
        "div",
        {
          className:
            "auth-page-footer"
        }
      );


    if (
      text
    ) {

      const span =
        this.createElement(
          "span",
          {},
          text
        );

      footer.appendChild(
        span
      );
    }


    const button =
      this.createElement(
        "button",
        {
          type:
            "button",

          className:
            "auth-text-link",

          dataset: {
            navigate:
              navigateTo
          }
        },
        buttonText
      );


    footer.appendChild(
      button
    );

    return footer;
  }


  /* =====================================================
     EVENTS
  ===================================================== */

  attachEvents(config) {

    if (!this.container) {
      return;
    }


    /* Navigation */

    this.container
      .querySelectorAll(
        "[data-navigate]"
      )
      .forEach(
        (element) => {

          element.addEventListener(
            "click",
            () => {

              const page =
                element.dataset.navigate;

              if (
                page
              ) {

                AuthState.setActivePage(
                  page
                );
              }
            }
          );
        }
      );


    /* Authentication method */

    this.container
      .querySelectorAll(
        "[data-auth-method]"
      )
      .forEach(
        (element) => {

          element.addEventListener(
            "click",
            () => {

              this.activeAuthMethod =
                element.dataset.authMethod;

              this.render();
            }
          );
        }
      );


    /* Identifier */

    this.container
      .querySelectorAll(
        "[data-identifier]"
      )
      .forEach(
        (element) => {

          element.addEventListener(
            "click",
            () => {

              const identifier =
                element.dataset.identifier;

              AuthState.setValue(
                "login.defaultIdentifier",
                identifier
              );
            }
          );
        }
      );


    /* Password toggle */

    this.container
      .querySelectorAll(
        "[data-action='toggle-password']"
      )
      .forEach(
        (element) => {

          element.addEventListener(
            "click",
            () => {

              this.passwordVisible =
                !this.passwordVisible;

              this.render();
            }
          );
        }
      );


    /* OTP input movement */

    this.container
      .querySelectorAll(
        ".auth-otp-input"
      )
      .forEach(
        (
          input,
          index,
          inputs
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
            }
          );
        }
      );


    /* Button hover */

    if (
      config.animation?.buttonHover
    ) {

      this.attachButtonHover(
        config
      );
    }
  }


  /* =====================================================
     BUTTON HOVER
  ===================================================== */

  attachButtonHover(config) {

    const buttons =
      this.container
        .querySelectorAll(
          ".auth-primary-button"
        );


    buttons.forEach(
      (button) => {

        button.addEventListener(
          "mouseenter",
          () => {

            button.style.background =
              config.colors?.primaryHover ||
              "#1d4ed8";
          }
        );


        button.addEventListener(
          "mouseleave",
          () => {

            button.style.background =
              config.colors?.primary ||
              "#2563eb";
          }
        );
      }
    );
  }


  /* =====================================================
     CREATE ELEMENT
  ===================================================== */

  createElement(
    tag,
    attributes = {},
    text = null
  ) {

    const element =
      document.createElement(
        tag
      );


    Object.entries(
      attributes
    )
      .forEach(
        (
          [
            key,
            value
          ]
        ) => {

          if (
            value ===
            undefined ||
            value ===
            null
          ) {
            return;
          }


          if (
            key ===
            "className"
          ) {

            element.className =
              value;

            return;
          }


          if (
            key ===
            "dataset" &&
            typeof value ===
            "object"
          ) {

            Object.entries(
              value
            )
              .forEach(
                (
                  [
                    dataKey,
                    dataValue
                  ]
                ) => {

                  element.dataset[
                    dataKey
                  ] =
                    dataValue;
                }
              );

            return;
          }


          if (
            key in element
          ) {

            try {

              element[key] =
                value;

              return;

            } catch (error) {

              /* Continue to setAttribute */
            }
          }


          element.setAttribute(
            key,
            value
          );
        }
      );


    if (
      text !== null &&
      text !== undefined
    ) {

      element.textContent =
        text;
    }

    return element;
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.AuthRenderer =
  AuthRenderer;