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


  /* -------------------------------------------------------
     LAYOUT
  ------------------------------------------------------- */

  layout: {

    type: "split-left-image",

    imagePosition: "left",

    imageWidth: 70,

    formWidth: 30,

    formVerticalAlignment: "center",

    formHorizontalAlignment: "center",

    mobileStackOrder: "image-first"
  },


  /* -------------------------------------------------------
     BACKGROUND
  ------------------------------------------------------- */

  background: {

    type: "default",

    selected: "background-1",

    image: "assets/backgrounds/background-1.jpg",

    uploadedImage: "",

    position: "center",

    size: "cover",

    repeat: "no-repeat",

    color: "#172033",

    overlayEnabled: true,

    overlayColor: "#000000",

    overlayOpacity: 0.22
  },


  /* -------------------------------------------------------
     IMAGE SECTION
  ------------------------------------------------------- */

  imageSection: {

    showText: false,

    text: "Welcome back",

    textPosition: "center",

    textColor: "#ffffff",

    textSize: 52,

    textWeight: 700,

    textFont: "Inter, Arial, sans-serif",

    textShadow: "0 4px 18px rgba(0,0,0,0.35)"
  },


  /* -------------------------------------------------------
     BRANDING
  ------------------------------------------------------- */

  branding: {

    showLogo: true,

    logoType: "default",

    logo: "assets/logos/logo-1.png",

    uploadedLogo: "",

    logoShape: "rounded",

    logoPosition: "left",

    logoSize: 64,

    logoBorderEnabled: false,

    logoBorderColor: "#ffffff",

    logoBorderWidth: 2,

    logoBackgroundEnabled: false,

    logoBackgroundColor: "#ffffff",

    logoPadding: 0,

    showBrandName: true,

    brandName: "Your Brand",

    showTitle: true,

    title: "Welcome back",

    showSubtitle: true,

    subtitle: "Enter your details to access your account."
  },


  /* -------------------------------------------------------
     TYPOGRAPHY
  ------------------------------------------------------- */

  typography: {

    fontFamily: "Inter, Arial, sans-serif",

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


  /* -------------------------------------------------------
     LOGIN IDENTIFIERS
  ------------------------------------------------------- */

  login: {

    identifier: "email",

    allowedIdentifiers: {
      email: true,
      mobile: true,
      username: false
    },

    emailLabel: "Email",

    emailPlaceholder: "Enter your email",

    mobileLabel: "Mobile Number",

    mobilePlaceholder: "Enter your mobile number",

    usernameLabel: "Username",

    usernamePlaceholder: "Enter your username",

    showIdentifierSwitcher: false,

    identifierSwitcherStyle: "buttons"
  },


  /* -------------------------------------------------------
     AUTHENTICATION METHODS
  ------------------------------------------------------- */

  authentication: {

    /* Password */

    passwordEnabled: true,

    passwordLabel: "Password",

    passwordPlaceholder: "Enter your password",

    passwordRequired: true,


    /* OTP */

    otpEnabled: false,

    otpLength: 6,

    otpLabel: "Enter verification code",

    otpPlaceholder: "",

    showOtpOnlyWhenSelected: true,


    /* Magic Link */

    magicLinkEnabled: false,

    magicLinkText: "Send me a magic link",


    /* Get Key */

    getKeyEnabled: true,

    getKeyLabel: "Get key from",

    getKeyOptions: [
      "Authenticator",
      "Email",
      "SMS"
    ],

    selectedGetKey: "Authenticator"
  },


  /* -------------------------------------------------------
     PASSWORD OPTIONS
  ------------------------------------------------------- */

  passwordOptions: {

    showPasswordToggle: true,

    showForgotPassword: true,

    forgotPasswordText: "Forgot password?",

    rememberMeEnabled: false,

    rememberMeText: "Remember me"
  },


  /* -------------------------------------------------------
     PRIMARY BUTTON
  ------------------------------------------------------- */

  button: {

    text: "Login",

    backgroundType: "gradient",

    backgroundColor: "#7f56d9",

    gradientStart: "#7f56d9",

    gradientEnd: "#6941c6",

    textColor: "#ffffff",

    fontSize: 15,

    fontWeight: 700,

    height: 54,

    borderRadius: 12,

    borderEnabled: false,

    borderColor: "#7f56d9",

    borderWidth: 1,

    shadowEnabled: true,

    shadow: "0 10px 20px rgba(127, 86, 217, 0.20)"
  },


  /* -------------------------------------------------------
     FORM INPUTS
  ------------------------------------------------------- */

  inputs: {

    backgroundColor: "#ffffff",

    textColor: "#101828",

    placeholderColor: "#98a2b3",

    borderColor: "#d0d5dd",

    focusBorderColor: "#7f56d9",

    focusShadow: "0 0 0 4px rgba(127, 86, 217, 0.12)",

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

    shadow: "0 24px 70px rgba(16, 24, 40, 0.15)",

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

    gradientStart: "#ffffff",

    gradientEnd: "#f3f6fb"
  },


  /* -------------------------------------------------------
     SOCIAL LOGIN
  ------------------------------------------------------- */

  social: {

    enabled: true,

    dividerText: "or continue with",

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


  /* -------------------------------------------------------
     SIGNUP
  ------------------------------------------------------- */

  signup: {

    enabled: true,

    bottomText: "Don't have an account?",

    linkText: "Create account",

    title: "Create your account",

    subtitle: "Enter your details to create an account.",

    fields: {

      username: true,

      email: true,

      mobile: true,

      password: true,

      confirmPassword: true
    },

    usernameLabel: "Username",

    usernamePlaceholder: "Enter your username",

    emailLabel: "Email",

    emailPlaceholder: "Enter your email",

    mobileLabel: "Mobile Number",

    mobilePlaceholder: "Enter your mobile number",

    passwordLabel: "Password",

    passwordPlaceholder: "Create a password",

    confirmPasswordLabel: "Confirm Password",

    confirmPasswordPlaceholder: "Confirm your password",

    buttonText: "Create account",

    loginText: "Already have an account?",

    loginLinkText: "Login"
  },


  /* -------------------------------------------------------
     FORGOT PASSWORD PAGE
  ------------------------------------------------------- */

  forgotPassword: {

    enabled: true,

    title: "Forgot password?",

    subtitle:
      "Enter your email address and we will send you instructions to reset your password.",

    identifierType: "email",

    emailLabel: "Email",

    emailPlaceholder: "Enter your email",

    buttonText: "Send reset link",

    backText: "Back to login"
  },


  /* -------------------------------------------------------
     OTP PAGE
  ------------------------------------------------------- */

  otpPage: {

    title: "Verify your account",

    subtitle:
      "Enter the verification code sent to you.",

    buttonText: "Verify",

    resendEnabled: true,

    resendText: "Resend code"
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

  customCSS: ""
};


/* =========================================================
   ACTIVE CONFIGURATION
========================================================= */

let config = deepClone(defaultConfig);


/* =========================================================
   DEEP CLONE
========================================================= */

function deepClone(value) {
  return JSON.parse(
    JSON.stringify(value)
  );
}


/* =========================================================
   RESET CONFIGURATION
========================================================= */

function resetConfig() {
  config = deepClone(defaultConfig);

  window.config = config;

  return config;
}


/* =========================================================
   GET DEFAULT CONFIGURATION
========================================================= */

function getDefaultConfig() {
  return deepClone(defaultConfig);
}


/* =========================================================
   REPLACE COMPLETE CONFIGURATION
========================================================= */

function setConfig(newConfig) {
  if (
    !newConfig ||
    typeof newConfig !== "object"
  ) {
    console.warn(
      "Invalid configuration provided"
    );

    return;
  }

  config = newConfig;

  window.config = config;
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
      typeof parsedConfig !== "object"
    ) {
      throw new Error(
        "Invalid configuration"
      );
    }

    config = mergeConfig(
      deepClone(defaultConfig),
      parsedConfig
    );

    window.config = config;

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
   MERGE CONFIGURATION
========================================================= */

function mergeConfig(
  target,
  source
) {

  Object.keys(source).forEach(
    (key) => {

      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {

        if (
          !target[key] ||
          typeof target[key] !== "object"
        ) {
          target[key] = {};
        }

        mergeConfig(
          target[key],
          source[key]
        );

      } else {

        target[key] =
          source[key];

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
    typeof path !== "string"
  ) {
    return undefined;
  }

  const keys =
    path.split(".");

  let current =
    config;

  for (const key of keys) {

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
    typeof path !== "string"
  ) {
    return;
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
      typeof current[key] !== "object"
    ) {
      current[key] = {};
    }

    current =
      current[key];
  }

  current[
    keys[keys.length - 1]
  ] = value;

  window.config = config;
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

  clearLocalConfig
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