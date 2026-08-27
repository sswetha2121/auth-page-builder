/* =========================================================
   AUTH PAGE BUILDER - CENTRAL CONFIGURATION
   File: js/config.js
========================================================= */


/* =========================================================
   DEFAULT CONFIGURATION
========================================================= */

const defaultConfig = {

  /* -------------------------------------------------------
     APPLICATION
  ------------------------------------------------------- */

  currentPage: "login",

  previewDevice: "desktop",

  previewMode: "builder",

  previewScale: 1,

  fullscreen: false,

  projectName: "auth-page",

  projectVersion: "2.0.0",


  /* -------------------------------------------------------
     LAYOUT
  ------------------------------------------------------- */

  layout: {

    type: "split-left-image",

    /*
      split-left-image
      split-right-image
      full-background
      centered-card
      stacked
    */

    pageLayout: "split-left-image",

    imagePosition: "left",

    imageSide: "left",

    imageWidth: 50,

    formWidth: 50,

    formPosition: "right",

    formVerticalAlignment: "center",

    /*
      top
      center
      bottom
    */

    formHorizontalAlignment: "center",

    /*
      left
      center
      right
    */

    formMaxWidth: 560,

    formOffsetX: 0,

    formOffsetY: 0,

    contentPadding: 48,

    mobileStackOrder: "image-first",

    mobileImageHeight: 38,

    showImageSection: true,

    showFormSection: true,

    split: {
      imageWidth: 50,
      imageSide: "left"
    }
  },


  /* -------------------------------------------------------
     BACKGROUND
  ------------------------------------------------------- */

  background: {

    type: "default",

    /*
      default
      upload
      color
      gradient
      none
    */

    selected: "background-1",

    image: "assets/backgrounds/background-1.jpg",

    imageUrl: "assets/backgrounds/background-1.jpg",

    uploadedImage: "",

    imageFileName: "",

    imageSource: "default",

    position: "center",

    size: "cover",

    repeat: "no-repeat",

    attachment: "scroll",

    color: "#172033",

    opacity: 1,

    gradientEnabled: false,

    gradientDirection: "135deg",

    gradientStart: "#172033",

    gradientEnd: "#344054",

    overlayEnabled: true,

    overlayColor: "#000000",

    overlayOpacity: 0.22
  },


  /* -------------------------------------------------------
     IMAGE SECTION
  ------------------------------------------------------- */

  imageSection: {

    enabled: true,

    showText: false,

    text: "Welcome back",

    textPosition: "center",

    textColor: "#ffffff",

    textSize: 52,

    textWeight: 700,

    textFont: "Inter, Arial, sans-serif",

    textShadow:
      "0 4px 18px rgba(0,0,0,0.35)",

    padding: 48,

    contentPosition: "center"
  },


  /* -------------------------------------------------------
     BRANDING
  ------------------------------------------------------- */

  branding: {

    showLogo: true,

    logoEnabled: true,

    logoType: "default",

    /*
      default
      upload
      none
    */

    selectedLogo: "logo-1",

    logo: "assets/logos/logo-1.png",

    logoUrl: "assets/logos/logo-1.png",

    uploadedLogo: "",

    logoFileName: "",

    logoSource: "default",

    logoShape: "circle",

    /*
      circle
      ellipse
      rounded
      square
      none
    */

    logoPosition: "left",

    /*
      left
      center
      right
    */

    logoVerticalPosition: "top",

    logoSize: 64,

    logoWidth: 64,

    logoHeight: 64,

    logoObjectFit: "contain",

    logoBorderEnabled: false,

    logoBorderColor: "#ffffff",

    logoBorderWidth: 2,

    logoBackgroundEnabled: false,

    logoBackgroundColor: "#ffffff",

    logoPadding: 0,

    logoShadowEnabled: false,

    logoShadow:
      "0 8px 24px rgba(16,24,40,0.18)",

    showBrandName: true,

    brandName: "Your Brand",

    brandNameColor: "#101828",

    brandNameSize: 16,

    brandNameWeight: 700,

    brandGap: 12
  },


  /* -------------------------------------------------------
     GLOBAL TYPOGRAPHY
  ------------------------------------------------------- */

  typography: {

    fontFamily:
      "Inter, Arial, sans-serif",

    titleColor: "#101828",

    titleSize: 34,

    titleWeight: 750,

    subtitleColor: "#667085",

    subtitleSize: 15,

    subtitleWeight: 400,

    bodyColor: "#344054",

    bodySize: 14,

    bodyWeight: 400,

    labelColor: "#344054",

    labelSize: 14,

    labelWeight: 650
  },


  /* =======================================================
     PAGE-SPECIFIC CUSTOMIZATION
     
     Each authentication page has its own independent
     configuration.

     pages.login
     pages.signup
     pages.forgotPassword
     pages.otp
  ======================================================= */

  pages: {


    /* =====================================================
       LOGIN PAGE
    ===================================================== */

    login: {

      enabled: true,

      /* PAGE HEADER */

      header: {

        showTitle: true,

        title: "Welcome back",

        showSubtitle: true,

        subtitle:
          "Enter your details to access your account."
      },


      /* IDENTIFIER */

      identifier: {

        type: "email",

        /*
          email
          mobile
          username
        */

        allowed: {

          email: true,

          mobile: true,

          username: false
        },

        showSwitcher: false,

        switcherStyle: "buttons",

        emailLabel: "Email",

        emailPlaceholder:
          "Enter your email",

        mobileLabel:
          "Mobile Number",

        mobilePlaceholder:
          "Enter your mobile number",

        usernameLabel:
          "Username",

        usernamePlaceholder:
          "Enter your username"
      },


      /* PASSWORD */

      password: {

        enabled: true,

        label: "Password",

        placeholder:
          "Enter your password",

        required: true,

        showToggle: true,

        showForgotPassword: true,

        forgotPasswordText:
          "Forgot password?"
      },


      /* REMEMBER ME */

      rememberMe: {

        enabled: false,

        text: "Remember me",

        defaultChecked: false
      },


      /* PRIMARY BUTTON */

      button: {

        enabled: true,

        text: "Login",

        action: "login"
      },


      /* OTP LOGIN */

      otp: {

        enabled: true,

        showAsAlternative: true,

        buttonText:
          "Continue with OTP",

        preferredMethod: "email"
      },


      /* MAGIC LINK */

      magicLink: {

        enabled: false,

        text:
          "Send me a magic link"
      },


      /* GET KEY */

      getKey: {

        enabled: true,

        label: "Get key from",

        options: [

          "Authenticator",

          "Email",

          "SMS",

          "WhatsApp"
        ],

        selected: "Email"
      },


      /* SOCIAL LOGIN */

      social: {

        enabled: true,

        dividerText:
          "or continue with",

        showGoogle: true,

        showLinkedIn: true,

        showFacebook: false,

        showGitHub: false,

        layout: "grid"
      },


      /* BOTTOM NAVIGATION */

      bottom: {

        enabled: true,

        text:
          "Don't have an account?",

        linkText:
          "Create account",

        linkTarget:
          "signup"
      }
    },


    /* =====================================================
       SIGNUP PAGE
    ===================================================== */

    signup: {

      enabled: true,


      /* PAGE HEADER */

      header: {

        showTitle: true,

        title:
          "Create your account",

        showSubtitle: true,

        subtitle:
          "Enter your details to create an account."
      },


      /* FIELDS */

      fields: {

        fullName: false,

        username: true,

        email: true,

        mobile: true,

        password: true,

        confirmPassword: true
      },


      /* FIELD CUSTOMIZATION */

      fullName: {

        label: "Full Name",

        placeholder:
          "Enter your full name"
      },


      username: {

        label: "Username",

        placeholder:
          "Choose a username"
      },


      email: {

        label: "Email",

        placeholder:
          "Enter your email"
      },


      mobile: {

        label:
          "Mobile Number",

        placeholder:
          "Enter your mobile number"
      },


      password: {

        label: "Password",

        placeholder:
          "Create a password",

        showToggle: true,

        showStrength: false,

        strengthLabel:
          "Password strength"
      },


      confirmPassword: {

        label:
          "Confirm Password",

        placeholder:
          "Confirm your password",

        showToggle: true
      },


      /* TERMS */

      terms: {

        enabled: false,

        required: true,

        text:
          "I agree to the Terms and Privacy Policy.",

        termsText:
          "Terms",

        privacyText:
          "Privacy Policy"
      },


      /* BUTTON */

      button: {

        enabled: true,

        text:
          "Create account",

        action: "signup"
      },


      /* SOCIAL SIGNUP */

      social: {

        enabled: true,

        dividerText:
          "or sign up with",

        showGoogle: true,

        showLinkedIn: true,

        showFacebook: false,

        showGitHub: false,

        layout: "grid"
      },


      /* BOTTOM */

      bottom: {

        enabled: true,

        text:
          "Already have an account?",

        linkText:
          "Login",

        linkTarget:
          "login"
      }
    },


    /* =====================================================
       FORGOT PASSWORD PAGE
    ===================================================== */

    forgotPassword: {

      enabled: true,


      /* HEADER */

      header: {

        showTitle: true,

        title:
          "Forgot password?",

        showSubtitle: true,

        subtitle:
          "Enter your details and we will send you instructions to reset your password."
      },


      /* IDENTIFIER */

      identifier: {

        type: "email",

        /*
          email
          mobile
        */

        allowEmail: true,

        allowMobile: true,

        showSwitcher: false,

        emailLabel: "Email",

        emailPlaceholder:
          "Enter your email",

        mobileLabel:
          "Mobile Number",

        mobilePlaceholder:
          "Enter your mobile number"
      },


      /* BUTTON */

      button: {

        enabled: true,

        text:
          "Send reset link",

        action:
          "send-reset-link"
      },


      /* ALTERNATIVE */

      showOtpOption: false,

      otpOptionText:
        "Verify using OTP",


      /* BACK BUTTON */

      back: {

        enabled: true,

        text:
          "Back to login",

        target:
          "login"
      }
    },


    /* =====================================================
       OTP PAGE
    ===================================================== */

    otp: {

      enabled: true,


      /* HEADER */

      header: {

        showTitle: true,

        title:
          "Verify your account",

        showSubtitle: true,

        subtitle:
          "Enter the verification code sent to you."
      },


      /* OTP INPUT */

      input: {

        length: 6,

        /*
          4
          6
          8
        */

        type: "numeric",

        onlyDigits: true,

        autoFocus: true,

        autoSubmit: false,

        boxStyle: "separate",

        /*
          separate
          connected
          underline
        */

        boxSize: 52,

        boxGap: 10,

        borderRadius: 12
      },


      /* DELIVERY METHOD */

      delivery: {

        showMethod: true,

        showChangeMethod: true,

        defaultMethod: "email",

        /*
          email
          sms
          whatsapp
          authenticator
        */

        methods: {

          email: true,

          sms: true,

          whatsapp: true,

          authenticator: false
        },

        emailText:
          "Get code from Email",

        smsText:
          "Get code from SMS",

        whatsappText:
          "Get code from WhatsApp",

        authenticatorText:
          "Get code from Authenticator",

        changeMethodText:
          "Change verification method"
      },


      /* BUTTON */

      button: {

        enabled: true,

        text: "Verify",

        action:
          "verify-otp"
      },


      /* RESEND OTP */

      resend: {

        enabled: true,

        text:
          "Resend code",

        timerEnabled: true,

        timerSeconds: 30,

        timerText:
          "Resend available in {seconds}s",

        showTimer:
          true
      },


      /* BACK */

      back: {

        enabled: true,

        text:
          "Back to login",

        target:
          "login"
      }
    }
  },


  /* =======================================================
     LEGACY LOGIN CONFIGURATION
     
     Kept for backward compatibility with existing JS files.
  ======================================================= */

  login: {

    identifier: "email",

    allowedIdentifiers: {

      email: true,

      mobile: true,

      username: false
    },

    emailLabel: "Email",

    emailPlaceholder:
      "Enter your email",

    mobileLabel:
      "Mobile Number",

    mobilePlaceholder:
      "Enter your mobile number",

    usernameLabel:
      "Username",

    usernamePlaceholder:
      "Enter your username",

    showIdentifierSwitcher: false,

    identifierSwitcherStyle:
      "buttons"
  },


  /* =======================================================
     LEGACY AUTHENTICATION CONFIGURATION
     
     Kept for backward compatibility.
  ======================================================= */

  authentication: {

    passwordEnabled: true,

    passwordLabel: "Password",

    passwordPlaceholder:
      "Enter your password",

    passwordRequired: true,


    /* OTP */

    otpEnabled: true,

    otpLength: 6,

    otp: {

      enabled: true,

      length: 6,

      defaultMethod: "email",

      deliveryMethods: [

        "email",

        "sms",

        "whatsapp"
      ]
    },

    otpLabel:
      "Enter verification code",

    otpPlaceholder: "",

    otpOnlyDigits: true,

    otpAutoFocus: true,

    otpAutoSubmit: false,

    otpBoxStyle: "separate",

    showOtpOnlyWhenSelected: true,

    otpMethods: {

      email: true,

      sms: true,

      whatsapp: true,

      authenticator: false
    },

    defaultOtpMethod: "email",


    /* MAGIC LINK */

    magicLinkEnabled: false,

    magicLinkText:
      "Send me a magic link",


    /* GET KEY */

    getKeyEnabled: true,

    getKeyLabel:
      "Get key from",

    getKeyOptions: [

      "Authenticator",

      "Email",

      "SMS",

      "WhatsApp"
    ],

    selectedGetKey:
      "Email"
  },


  /* -------------------------------------------------------
     PASSWORD OPTIONS
  ------------------------------------------------------- */

  passwordOptions: {

    showPasswordToggle: true,

    showForgotPassword: true,

    forgotPasswordText:
      "Forgot password?",

    rememberMeEnabled: false,

    rememberMeText:
      "Remember me",

    passwordStrengthEnabled: false,

    passwordStrengthLabel:
      "Password strength"
  },


  /* =======================================================
     GLOBAL PRIMARY BUTTON DESIGN
     
     This controls the visual design of buttons across pages.
     Individual pages control only their text and action.
  ======================================================= */

  button: {

    backgroundType: "gradient",

    backgroundColor: "#7f56d9",

    gradientStart: "#7f56d9",

    gradientEnd: "#6941c6",

    gradientDirection: "135deg",

    textColor: "#ffffff",

    fontSize: 15,

    fontWeight: 700,

    height: 54,

    borderRadius: 12,

    borderEnabled: false,

    borderColor: "#7f56d9",

    borderWidth: 1,

    shadowEnabled: true,

    shadow:
      "0 10px 20px rgba(127, 86, 217, 0.20)"
  },


  /* -------------------------------------------------------
     FORM INPUT DESIGN
  ------------------------------------------------------- */

  inputs: {

    backgroundColor: "#ffffff",

    textColor: "#101828",

    placeholderColor: "#98a2b3",

    borderColor: "#d0d5dd",

    focusBorderColor: "#7f56d9",

    focusShadow:
      "0 0 0 4px rgba(127, 86, 217, 0.12)",

    borderWidth: 1,

    borderRadius: 12,

    height: 52,

    fontSize: 15,

    paddingHorizontal: 16
  },


  /* -------------------------------------------------------
     FORM CARD
  ------------------------------------------------------- */

  card: {

    enabled: true,

    backgroundColor: "#ffffff",

    opacity: 1,

    width: 560,

    minHeight: 0,

    borderRadius: 24,

    borderEnabled: false,

    borderColor: "#e4e7ec",

    borderWidth: 1,

    shadowEnabled: false,

    shadow:
      "0 24px 70px rgba(16,24,40,0.15)",

    blurEnabled: false,

    blur: 0,

    paddingTop: 56,

    paddingRight: 56,

    paddingBottom: 56,

    paddingLeft: 56
  },


  /* -------------------------------------------------------
     FORM SECTION
  ------------------------------------------------------- */

  formSection: {

    backgroundColor: "#ffffff",

    useGradient: true,

    gradientDirection: "135deg",

    gradientStart: "#ffffff",

    gradientEnd: "#f3f6fb"
  },


  /* =======================================================
     LEGACY SOCIAL CONFIGURATION
     
     Backward compatibility.
  ======================================================= */

  social: {

    enabled: true,

    dividerText:
      "or continue with",

    showGoogle: true,

    showLinkedIn: true,

    showFacebook: false,

    showGitHub: false,

    layout: "grid",

    buttonHeight: 50,

    buttonRadius: 12,

    buttonBackground: "#ffffff",

    buttonTextColor: "#344054",

    buttonBorderColor: "#d0d5dd",

    buttonBorderWidth: 1
  },


  /* =======================================================
     LEGACY PAGE CONFIGURATION
     
     These remain temporarily so older renderer code
     continues to work.
  ======================================================= */

  signup: {

    enabled: true,

    bottomText:
      "Don't have an account?",

    linkText:
      "Create account",

    title:
      "Create your account",

    subtitle:
      "Enter your details to create an account.",

    fields: {

      username: true,

      email: true,

      mobile: true,

      password: true,

      confirmPassword: true
    },

    usernameLabel:
      "Username",

    usernamePlaceholder:
      "Enter your username",

    emailLabel:
      "Email",

    emailPlaceholder:
      "Enter your email",

    mobileLabel:
      "Mobile Number",

    mobilePlaceholder:
      "Enter your mobile number",

    passwordLabel:
      "Password",

    passwordPlaceholder:
      "Create a password",

    confirmPasswordLabel:
      "Confirm Password",

    confirmPasswordPlaceholder:
      "Confirm your password",

    buttonText:
      "Create account",

    loginText:
      "Already have an account?",

    loginLinkText:
      "Login"
  },


  forgotPassword: {

    enabled: true,

    title:
      "Forgot password?",

    subtitle:
      "Enter your email address and we will send you instructions to reset your password.",

    identifierType: "email",

    emailLabel: "Email",

    emailPlaceholder:
      "Enter your email",

    mobileLabel:
      "Mobile Number",

    mobilePlaceholder:
      "Enter your mobile number",

    buttonText:
      "Send reset link",

    backText:
      "Back to login"
  },


  otpPage: {

    enabled: true,

    title:
      "Verify your account",

    subtitle:
      "Enter the verification code sent to you.",

    buttonText:
      "Verify",

    resendEnabled: true,

    resendText:
      "Resend code",

    resendTimerEnabled: true,

    resendTimerSeconds: 30,

    resendTimerText:
      "Resend available in {seconds}s",

    showDeliveryMethod: true,

    showChangeMethod: true,

    changeMethodText:
      "Change verification method"
  },


  /* -------------------------------------------------------
     BOTTOM CONTENT
  ------------------------------------------------------- */

  bottomContent: {

    showTerms: false,

    termsText:
      "By continuing, you agree to our Terms and Privacy Policy.",

    textColor: "#98a2b3",

    textSize: 11
  },


  /* -------------------------------------------------------
     SPACING
  ------------------------------------------------------- */

  spacing: {

    formGroupGap: 20,

    buttonGap: 14,

    socialGap: 12,

    brandBottomMargin: 38,

    dividerMargin: 28
  },


  /* -------------------------------------------------------
     ANIMATIONS
  ------------------------------------------------------- */

  animation: {

    enabled: true,

    type: "fade",

    duration: 250
  },


  /* -------------------------------------------------------
     CUSTOM CSS
  ------------------------------------------------------- */

  customCSS: "",


  /* -------------------------------------------------------
     DOWNLOADED PROJECT
  ------------------------------------------------------- */

  download: {

    includeHTML: true,

    includeCSS: true,

    includeJS: true,

    includeAssets: true,

    includeUploadedAssets: true,

    includeDefaultAssets: true,

    includeConfig: true,

    generateProjectFolder: true
  }
};


/* =========================================================
   ACTIVE CONFIGURATION
========================================================= */

let config =
  deepClone(defaultConfig);


/* =========================================================
   DEEP CLONE
========================================================= */

function deepClone(value) {

  if (
    value === undefined
  ) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}


/* =========================================================
   RESET CONFIGURATION
========================================================= */

function resetConfig() {

  config =
    deepClone(defaultConfig);

  window.config =
    config;

  return config;
}


/* =========================================================
   GET DEFAULT CONFIGURATION
========================================================= */

function getDefaultConfig() {

  return deepClone(
    defaultConfig
  );
}


/* =========================================================
   REPLACE COMPLETE CONFIGURATION
========================================================= */

function setConfig(newConfig) {

  if (
    !newConfig ||
    typeof newConfig !==
      "object"
  ) {

    console.warn(
      "Invalid configuration provided"
    );

    return false;
  }

  config =
    mergeConfig(
      deepClone(defaultConfig),
      newConfig
    );

  synchronizePageCompatibility();

  window.config =
    config;

  return true;
}


/* =========================================================
   EXPORT CONFIGURATION
========================================================= */

function exportConfig() {

  return JSON.stringify(
    config,
    null,
    2
  );
}


/* =========================================================
   IMPORT CONFIGURATION
========================================================= */

function importConfig(jsonData) {

  try {

    const parsedConfig =
      typeof jsonData === "string"
        ? JSON.parse(jsonData)
        : jsonData;

    if (
      !parsedConfig ||
      typeof parsedConfig !==
        "object"
    ) {

      throw new Error(
        "Invalid configuration"
      );
    }

    config =
      mergeConfig(
        deepClone(defaultConfig),
        parsedConfig
      );

    synchronizePageCompatibility();

    window.config =
      config;

    return true;

  } catch (error) {

    console.error(
      "Configuration import failed:",
      error
    );

    return false;
  }
}


/* =========================================================
   SYNCHRONIZE LEGACY + PAGE CONFIG
========================================================= */

function synchronizePageCompatibility() {

  if (
    !config.pages
  ) {
    return;
  }

  /* LOGIN */

  if (
    config.pages.login
  ) {

    const loginPage =
      config.pages.login;

    config.login.identifier =
      loginPage.identifier?.type ||
      config.login.identifier;

    config.login.emailLabel =
      loginPage.identifier?.emailLabel ||
      config.login.emailLabel;

    config.login.emailPlaceholder =
      loginPage.identifier?.emailPlaceholder ||
      config.login.emailPlaceholder;

    config.login.mobileLabel =
      loginPage.identifier?.mobileLabel ||
      config.login.mobileLabel;

    config.login.mobilePlaceholder =
      loginPage.identifier?.mobilePlaceholder ||
      config.login.mobilePlaceholder;

    config.authentication.passwordEnabled =
      loginPage.password?.enabled;

    config.authentication.passwordLabel =
      loginPage.password?.label ||
      config.authentication.passwordLabel;

    config.authentication.passwordPlaceholder =
      loginPage.password?.placeholder ||
      config.authentication.passwordPlaceholder;

    config.button.text =
      loginPage.button?.text ||
      config.button.text;
  }


  /* OTP */

  if (
    config.pages.otp
  ) {

    const otp =
      config.pages.otp;

    config.authentication.otpLength =
      otp.input?.length ||
      config.authentication.otpLength;

    config.authentication.otp.length =
      otp.input?.length ||
      config.authentication.otp.length;

    config.authentication.defaultOtpMethod =
      otp.delivery?.defaultMethod ||
      config.authentication.defaultOtpMethod;

    config.authentication.otp.defaultMethod =
      otp.delivery?.defaultMethod ||
      config.authentication.otp.defaultMethod;
  }
}


/* =========================================================
   MERGE CONFIGURATION
========================================================= */

function mergeConfig(
  target,
  source
) {

  if (
    !source ||
    typeof source !==
      "object"
  ) {
    return target;
  }

  Object.keys(source).forEach(
    (key) => {

      if (
        source[key] &&
        typeof source[key] ===
          "object" &&
        !Array.isArray(
          source[key]
        )
      ) {

        if (
          !target[key] ||
          typeof target[key] !==
            "object" ||
          Array.isArray(
            target[key]
          )
        ) {

          target[key] = {};
        }

        mergeConfig(
          target[key],
          source[key]
        );

      } else {

        target[key] =
          deepClone(
            source[key]
          );
      }
    }
  );

  return target;
}


/* =========================================================
   CONFIG PATH GETTER
========================================================= */

function getConfigByPath(path) {

  if (
    !path ||
    typeof path !==
      "string"
  ) {
    return undefined;
  }

  const keys =
    path.split(".");

  let current =
    config;

  for (
    const key of keys
  ) {

    if (
      current === undefined ||
      current === null
    ) {
      return undefined;
    }

    current =
      current[key];
  }

  return current;
}


/* =========================================================
   CONFIG PATH SETTER
========================================================= */

function setConfigByPath(
  path,
  value
) {

  if (
    !path ||
    typeof path !==
      "string"
  ) {
    return false;
  }

  const keys =
    path.split(".");

  let current =
    config;

  for (
    let index = 0;
    index < keys.length - 1;
    index++
  ) {

    const key =
      keys[index];

    if (
      !current[key] ||
      typeof current[key] !==
        "object" ||
      Array.isArray(
        current[key]
      )
    ) {

      current[key] = {};
    }

    current =
      current[key];
  }

  current[
    keys[keys.length - 1]
  ] = value;

  synchronizeChangedPath(
    path,
    value
  );

  window.config =
    config;

  return true;
}


/* =========================================================
   SYNCHRONIZE CHANGED PATHS
========================================================= */

function synchronizeChangedPath(
  path,
  value
) {

  /* OTP LENGTH */

  if (
    path ===
    "pages.otp.input.length"
  ) {

    config.authentication.otpLength =
      Number(value);

    config.authentication.otp.length =
      Number(value);
  }


  /* OTP METHOD */

  if (
    path ===
    "pages.otp.delivery.defaultMethod"
  ) {

    config.authentication.defaultOtpMethod =
      value;

    config.authentication.otp.defaultMethod =
      value;
  }


  /* LOGIN TITLE */

  if (
    path ===
    "pages.login.header.title"
  ) {

    config.branding.title =
      value;
  }


  /* SIGNUP */

  if (
    path ===
    "pages.signup.header.title"
  ) {

    config.signup.title =
      value;
  }


  /* FORGOT PASSWORD */

  if (
    path ===
    "pages.forgotPassword.header.title"
  ) {

    config.forgotPassword.title =
      value;
  }


  /* OTP TITLE */

  if (
    path ===
    "pages.otp.header.title"
  ) {

    config.otpPage.title =
      value;
  }
}


/* =========================================================
   SAVE CONFIGURATION LOCALLY
========================================================= */

function saveConfigLocally() {

  try {

    localStorage.setItem(
      "authPageBuilderConfig",
      exportConfig()
    );

    return true;

  } catch (error) {

    console.error(
      "Unable to save configuration:",
      error
    );

    return false;
  }
}


/* =========================================================
   LOAD CONFIGURATION LOCALLY
========================================================= */

function loadConfigLocally() {

  try {

    const savedConfig =
      localStorage.getItem(
        "authPageBuilderConfig"
      );

    if (!savedConfig) {

      return false;
    }

    return importConfig(
      savedConfig
    );

  } catch (error) {

    console.error(
      "Unable to load configuration:",
      error
    );

    return false;
  }
}


/* =========================================================
   CLEAR LOCAL CONFIGURATION
========================================================= */

function clearLocalConfig() {

  try {

    localStorage.removeItem(
      "authPageBuilderConfig"
    );

    return true;

  } catch (error) {

    console.error(
      "Unable to clear configuration:",
      error
    );

    return false;
  }
}


/* =========================================================
   INITIALIZE GLOBAL CONFIG
========================================================= */

synchronizePageCompatibility();

window.defaultConfig =
  defaultConfig;

window.config =
  config;


/* =========================================================
   EXPOSE CONFIG FUNCTIONS
========================================================= */

window.authConfig = {

  getDefaultConfig,

  resetConfig,

  getConfig: () => config,

  setConfig,

  exportConfig,

  importConfig,

  mergeConfig,

  getConfigByPath,

  setConfigByPath,

  saveConfigLocally,

  loadConfigLocally,

  clearLocalConfig,

  synchronizePageCompatibility
};


/* =========================================================
   GLOBAL COMPATIBILITY FUNCTIONS
========================================================= */

window.resetConfig =
  resetConfig;

window.getConfigByPath =
  getConfigByPath;

window.setConfigByPath =
  setConfigByPath;