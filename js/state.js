/* =========================================================
   AUTH PAGE CONFIGURATOR
   File: js/state.js

   Central Application State

   This file manages:
   - Current customization configuration
   - Default login page settings
   - Login authentication settings
   - Signup settings
   - Forgot password settings
   - OTP settings
   - Branding
   - Logo
   - Background
   - Colors
   - Typography
   - Layout
   - Social login
   - Device preview mode
   - Active customization section
========================================================= */


/* =========================================================
   DEFAULT CONFIGURATION
========================================================= */

const DEFAULT_CONFIG = {

  /* =====================================================
     PROJECT
  ===================================================== */

  project: {
    name: "my-custom-auth-page"
  },


  /* =====================================================
     APPLICATION
  ===================================================== */

  app: {
    activeSection: "background",
    previewMode: "desktop"
  },


  /* =====================================================
     PAGE
  ===================================================== */

  page: {
    activePage: "login",
    availablePages: [
      "login",
      "signup",
      "forgot",
      "otp"
    ]
  },


  /* =====================================================
     LAYOUT
  ===================================================== */

  layout: {

    backgroundSide: "left",

    formPanelWidth: 50,

    backgroundPanelWidth: 50,

    formAlignment: "center",

    contentAlignment: "center",

    pageLayout: "split"
  },


  /* =====================================================
     BACKGROUND
  ===================================================== */

  background: {

    showPanel: true,

    type: "image",

    image: "assets/backgrounds/login-bg.jpg",

    color: "#0f172a",

    size: "cover",

    position: "center",

    repeat: "no-repeat",

    overlayColor: "#000000",

    overlayOpacity: 0.35,

    blur: 0,

    brightness: 1
  },


  /* =====================================================
     BRANDING
  ===================================================== */

  branding: {

    showLogo: true,

    logo: "assets/logos/default-logo.png",

    logoText: "A",

    logoStyle: "circle",

    logoPosition: "left",

    logoSize: 64,

    showBrandName: true,

    brandName: "AuthFlow",

    subtitle:
      "Secure access to your account with a seamless authentication experience.",

    heading:
      "Welcome back",

    showBackgroundText: true
  },


  /* =====================================================
     CARD
  ===================================================== */

  card: {

    width: 430,

    padding: 42,

    borderRadius: 20,

    backgroundColor: "#ffffff",

    textColor: "#0f172a",

    shadow: "large",

    border: false,

    borderColor: "#e2e8f0",

    transparent: false
  },


  /* =====================================================
     COLORS
  ===================================================== */

  colors: {

    primary: "#2563eb",

    primaryHover: "#1d4ed8",

    secondary: "#0f172a",

    background: "#ffffff",

    cardBackground: "#ffffff",

    text: "#0f172a",

    mutedText: "#64748b",

    linkColor: "#2563eb",

    inputBackground: "#ffffff",

    inputBorder: "#cbd5e1",

    inputText: "#0f172a",

    buttonText: "#ffffff",

    error: "#dc2626",

    success: "#16a34a"
  },


  /* =====================================================
     TYPOGRAPHY
  ===================================================== */

  typography: {

    fontFamily: "Inter, Arial, sans-serif",

    titleSize: 30,

    subtitleSize: 14,

    labelSize: 14,

    inputSize: 15,

    buttonSize: 15,

    titleWeight: 700,

    bodyWeight: 400,

    letterSpacing: 0
  },


  /* =====================================================
     LOGIN
  ===================================================== */

  login: {

    enabled: true,

    loginButtonText: "Login",

    title: "Welcome back",

    subtitle:
      "Login to access your account",

    showIdentifierSelector: true,

    defaultIdentifier: "email",

    identifierOptions: {
      email: true,
      mobile: true
    },


    /* =================================================
       AUTHENTICATION METHODS
    ================================================= */

    authenticationMethods: {

      password: true,

      otp: true,

      magicLink: false
    },


    defaultAuthentication: "password",


    /* =================================================
       PASSWORD
    ================================================= */

    password: {

      label: "Password",

      placeholder:
        "Enter your password",

      showToggle: true
    },


    /* =================================================
       OTP
    ================================================= */

    otpLength: 6,

    otpButtonText:
      "Get Verification Code",

    otpVerificationButtonText:
      "Verify Code",


    /* =================================================
       REMEMBER / FORGOT
    ================================================= */

    showRememberMe: true,

    rememberMeText:
      "Remember me",

    showForgotPassword: true,

    forgotPasswordText:
      "Forgot password?"
  },


  /* =====================================================
     SIGNUP
  ===================================================== */

  signup: {

    enabled: true,

    buttonText:
      "Create Account",

    title:
      "Create your account",

    subtitle:
      "Fill in your details to get started",


    /* =================================================
       SIGNUP FIELDS
    ================================================= */

    fields: {

      username: true,

      email: true,

      mobile: true,

      password: true,

      confirmPassword: true
    },


    labels: {

      username:
        "Username",

      email:
        "Email Address",

      mobile:
        "Mobile Number",

      password:
        "Password",

      confirmPassword:
        "Confirm Password"
    },


    placeholders: {

      username:
        "Enter your username",

      email:
        "Enter your email address",

      mobile:
        "Enter your mobile number",

      password:
        "Create your password",

      confirmPassword:
        "Confirm your password"
    },


    footerText:
      "Already have an account?",

    footerButtonText:
      "Login"
  },


  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */

  forgotPassword: {

    enabled: true,

    title:
      "Forgot password?",

    subtitle:
      "Enter your email or mobile number to receive a verification key.",

    identifierLabel:
      "Email or Mobile Number",

    identifierPlaceholder:
      "Enter your email or mobile number",

    buttonText:
      "Send Verification Key",

    backButtonText:
      "Back to login",

    successMessage:
      "Verification instructions have been sent."
  },


  /* =====================================================
     OTP PAGE
  ===================================================== */

  otp: {

    enabled: true,

    title:
      "Verify your account",

    subtitle:
      "Enter the verification code sent to you.",

    length: 6,

    verificationButtonText:
      "Verify",

    resendText:
      "Resend Code",

    backButtonText:
      "Back to login",

    inputStyle:
      "separate"
  },


  /* =====================================================
     SOCIAL LOGIN
  ===================================================== */

  social: {

    enabled: true,

    title:
      "Or continue with",

    layout:
      "vertical",

    providers: {

      google: true,

      facebook: false,

      apple: false,

      github: false
    }
  },


  /* =====================================================
     INPUT CUSTOMIZATION
  ===================================================== */

  inputs: {

    height: 50,

    borderRadius: 10,

    borderWidth: 1,

    padding: 15,

    focusShadow: true,

    placeholderColor: "#94a3b8"
  },


  /* =====================================================
     BUTTON CUSTOMIZATION
  ===================================================== */

  button: {

    height: 52,

    borderRadius: 10,

    fontWeight: 700,

    uppercase: false,

    fullWidth: true
  },


  /* =====================================================
     ANIMATION
  ===================================================== */

  animation: {

    enabled: true,

    pageTransition: "fade",

    buttonHover: true,

    inputTransition: true,

    duration: 300
  },


  /* =====================================================
     ADVANCED
  ===================================================== */

  advanced: {

    customCSS: "",

    hideBranding: false,

    enableFormValidation: true,

    enablePasswordStrength: true,

    enableAutoComplete: true
  }
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const AppState = {

  config: cloneValue(DEFAULT_CONFIG),

  listeners: [],

  history: [],

  historyIndex: -1,

  maxHistory: 50
};


/* =========================================================
   CLONE VALUE
========================================================= */

function cloneValue(value) {

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
   GET CONFIG
========================================================= */

function getConfig() {

  return cloneValue(
    AppState.config
  );
}


/* =========================================================
   GET LIVE CONFIG
   Used internally by application
========================================================= */

function getLiveConfig() {

  return AppState.config;
}


/* =========================================================
   GET VALUE USING PATH

   Example:

   getValue(
     "colors.primary"
   );

========================================================= */

function getValue(path) {

  if (!path) {
    return undefined;
  }

  const keys =
    path.split(".");

  let current =
    AppState.config;

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

  return cloneValue(
    current
  );
}


/* =========================================================
   SET VALUE USING PATH

   Example:

   setValue(
     "colors.primary",
     "#ff0000"
   );

========================================================= */

function setValue(
  path,
  value,
  options = {}
) {

  if (!path) {
    return;
  }

  const keys =
    path.split(".");

  const lastKey =
    keys.pop();

  let current =
    AppState.config;

  keys.forEach(
    (key) => {

      if (
        typeof current[key] !==
        "object"
      ) {

        current[key] = {};
      }

      current =
        current[key];
    }
  );

  current[lastKey] =
    cloneValue(value);


  if (
    options.saveHistory !== false
  ) {
    saveHistory();
  }


  notifyStateChange(
    path,
    value
  );

  return value;
}


/* =========================================================
   UPDATE MULTIPLE VALUES
========================================================= */

function updateConfig(
  updates,
  options = {}
) {

  if (
    !updates ||
    typeof updates !==
      "object"
  ) {
    return;
  }

  mergeObjects(
    AppState.config,
    updates
  );


  if (
    options.saveHistory !== false
  ) {
    saveHistory();
  }


  notifyStateChange(
    "*",
    updates
  );
}


/* =========================================================
   MERGE OBJECTS
========================================================= */

function mergeObjects(
  target,
  source
) {

  Object.keys(source)
    .forEach(
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
              "object"
          ) {

            target[key] = {};
          }

          mergeObjects(
            target[key],
            source[key]
          );

        } else {

          target[key] =
            cloneValue(
              source[key]
            );
        }
      }
    );
}


/* =========================================================
   RESET ENTIRE CONFIG
========================================================= */

function resetConfig() {

  AppState.config =
    cloneValue(
      DEFAULT_CONFIG
    );

  AppState.history = [];

  AppState.historyIndex = -1;

  saveHistory();

  notifyStateChange(
    "reset",
    AppState.config
  );
}


/* =========================================================
   RESET SECTION

   Example:

   resetSection(
     "background"
   );

========================================================= */

function resetSection(
  sectionName
) {

  if (
    !DEFAULT_CONFIG[
      sectionName
    ]
  ) {
    return;
  }

  AppState.config[
    sectionName
  ] =
    cloneValue(
      DEFAULT_CONFIG[
        sectionName
      ]
    );

  saveHistory();

  notifyStateChange(
    sectionName,
    AppState.config[
      sectionName
    ]
  );
}


/* =========================================================
   SUBSCRIBE TO STATE CHANGES
========================================================= */

function subscribe(
  listener
) {

  if (
    typeof listener !==
    "function"
  ) {
    return () => {};
  }

  AppState.listeners.push(
    listener
  );


  return () => {

    AppState.listeners =
      AppState.listeners.filter(
        (item) =>
          item !== listener
      );
  };
}


/* =========================================================
   NOTIFY STATE CHANGE
========================================================= */

function notifyStateChange(
  path,
  value
) {

  AppState.listeners.forEach(
    (listener) => {

      try {

        listener({
          path,
          value:
            cloneValue(value),

          config:
            getConfig()
        });

      } catch (error) {

        console.error(
          "State listener error:",
          error
        );
      }
    }
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth-builder:state-change",
      {
        detail: {
          path,
          value:
            cloneValue(value),

          config:
            getConfig()
        }
      }
    )
  );
}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

  const snapshot =
    cloneValue(
      AppState.config
    );


  if (
    AppState.historyIndex <
    AppState.history.length - 1
  ) {

    AppState.history =
      AppState.history.slice(
        0,
        AppState.historyIndex + 1
      );
  }


  AppState.history.push(
    snapshot
  );


  if (
    AppState.history.length >
    AppState.maxHistory
  ) {

    AppState.history.shift();

  } else {

    AppState.historyIndex++;
  }
}


/* =========================================================
   UNDO
========================================================= */

function undo() {

  if (
    AppState.historyIndex <= 0
  ) {
    return false;
  }

  AppState.historyIndex--;

  AppState.config =
    cloneValue(
      AppState.history[
        AppState.historyIndex
      ]
    );


  notifyStateChange(
    "undo",
    AppState.config
  );

  return true;
}


/* =========================================================
   REDO
========================================================= */

function redo() {

  if (
    AppState.historyIndex >=
    AppState.history.length - 1
  ) {
    return false;
  }

  AppState.historyIndex++;

  AppState.config =
    cloneValue(
      AppState.history[
        AppState.historyIndex
      ]
    );


  notifyStateChange(
    "redo",
    AppState.config
  );

  return true;
}


/* =========================================================
   CHECK UNDO
========================================================= */

function canUndo() {

  return (
    AppState.historyIndex > 0
  );
}


/* =========================================================
   CHECK REDO
========================================================= */

function canRedo() {

  return (
    AppState.historyIndex <
    AppState.history.length - 1
  );
}


/* =========================================================
   IMPORT CONFIG
========================================================= */

function importConfig(
  config
) {

  if (
    !config ||
    typeof config !==
    "object"
  ) {

    throw new Error(
      "Invalid configuration."
    );
  }


  AppState.config =
    cloneValue(
      DEFAULT_CONFIG
    );

  mergeObjects(
    AppState.config,
    config
  );

  saveHistory();

  notifyStateChange(
    "import",
    AppState.config
  );
}


/* =========================================================
   EXPORT CONFIG
========================================================= */

function exportConfig() {

  return JSON.stringify(
    AppState.config,
    null,
    2
  );
}


/* =========================================================
   DOWNLOAD CONFIG JSON
========================================================= */

function downloadConfigJSON() {

  const data =
    exportConfig();

  const blob =
    new Blob(
      [data],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    "auth-config.json";

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}


/* =========================================================
   LOAD CONFIG JSON FILE
========================================================= */

function loadConfigFile(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (
        !file
      ) {

        reject(
          new Error(
            "No file selected."
          )
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          try {

            const config =
              JSON.parse(
                reader.result
              );

            importConfig(
              config
            );

            resolve(
              config
            );

          } catch (error) {

            reject(
              error
            );
          }
        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Unable to read configuration file."
            )
          );
        };


      reader.readAsText(
        file
      );
    }
  );
}


/* =========================================================
   SET ACTIVE PAGE
========================================================= */

function setActivePage(
  pageName
) {

  const pages =
    AppState.config
      .page
      .availablePages;

  if (
    !pages.includes(
      pageName
    )
  ) {
    return;
  }

  setValue(
    "page.activePage",
    pageName
  );
}


/* =========================================================
   SET PREVIEW MODE
========================================================= */

function setPreviewMode(
  mode
) {

  const allowedModes = [
    "desktop",
    "tablet",
    "mobile"
  ];

  if (
    !allowedModes.includes(
      mode
    )
  ) {
    return;
  }

  setValue(
    "app.previewMode",
    mode
  );
}


/* =========================================================
   SET ACTIVE SECTION
========================================================= */

function setActiveSection(
  sectionName
) {

  setValue(
    "app.activeSection",
    sectionName
  );
}


/* =========================================================
   BACKGROUND HELPERS
========================================================= */

function setBackgroundImage(
  imageSource
) {

  updateConfig({
    background: {
      type: "image",
      image: imageSource
    }
  });
}


function setBackgroundColor(
  color
) {

  updateConfig({
    background: {
      type: "color",
      color
    }
  });
}


function setBackgroundPosition(
  position
) {

  setValue(
    "background.position",
    position
  );
}


function setBackgroundOverlay(
  color,
  opacity
) {

  updateConfig({
    background: {
      overlayColor: color,
      overlayOpacity: opacity
    }
  });
}


/* =========================================================
   LOGO HELPERS
========================================================= */

function setLogo(
  logoSource
) {

  setValue(
    "branding.logo",
    logoSource
  );
}


function setLogoStyle(
  style
) {

  const allowedStyles = [
    "circle",
    "square",
    "ellipse"
  ];

  if (
    !allowedStyles.includes(
      style
    )
  ) {
    return;
  }

  setValue(
    "branding.logoStyle",
    style
  );
}


function setLogoPosition(
  position
) {

  const allowedPositions = [
    "left",
    "center",
    "right"
  ];

  if (
    !allowedPositions.includes(
      position
    )
  ) {
    return;
  }

  setValue(
    "branding.logoPosition",
    position
  );
}


/* =========================================================
   COLOR HELPERS
========================================================= */

function setPrimaryColor(
  color
) {

  setValue(
    "colors.primary",
    color
  );
}


function setSecondaryColor(
  color
) {

  setValue(
    "colors.secondary",
    color
  );
}


function setTextColor(
  color
) {

  setValue(
    "colors.text",
    color
  );
}


/* =========================================================
   AUTHENTICATION HELPERS
========================================================= */

function setAuthenticationMethod(
  method
) {

  const allowedMethods = [
    "password",
    "otp",
    "magicLink"
  ];

  if (
    !allowedMethods.includes(
      method
    )
  ) {
    return;
  }

  setValue(
    "login.defaultAuthentication",
    method
  );
}


function toggleAuthenticationMethod(
  method,
  enabled
) {

  const path =
    `login.authenticationMethods.${method}`;

  setValue(
    path,
    Boolean(enabled)
  );
}


/* =========================================================
   SIGNUP FIELD HELPERS
========================================================= */

function toggleSignupField(
  field,
  enabled
) {

  const allowedFields = [
    "username",
    "email",
    "mobile",
    "password",
    "confirmPassword"
  ];

  if (
    !allowedFields.includes(
      field
    )
  ) {
    return;
  }

  setValue(
    `signup.fields.${field}`,
    Boolean(enabled)
  );
}


/* =========================================================
   SOCIAL LOGIN HELPERS
========================================================= */

function toggleSocialProvider(
  provider,
  enabled
) {

  const allowedProviders = [
    "google",
    "facebook",
    "apple",
    "github"
  ];

  if (
    !allowedProviders.includes(
      provider
    )
  ) {
    return;
  }

  setValue(
    `social.providers.${provider}`,
    Boolean(enabled)
  );
}


/* =========================================================
   FILE TO DATA URL

   Used for:

   - Uploaded logo
   - Uploaded background
   - User custom assets
========================================================= */

function fileToDataURL(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      if (
        !file
      ) {

        reject(
          new Error(
            "No file selected."
          )
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          resolve(
            reader.result
          );
        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "Unable to process image."
            )
          );
        };


      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   IMAGE UPLOAD HELPERS
========================================================= */

async function uploadBackground(
  file
) {

  const imageSource =
    await fileToDataURL(
      file
    );

  updateConfig({
    background: {
      type: "image",
      image: imageSource
    }
  });

  return imageSource;
}


async function uploadLogo(
  file
) {

  const imageSource =
    await fileToDataURL(
      file
    );

  updateConfig({
    branding: {
      logo: imageSource
    }
  });

  return imageSource;
}


/* =========================================================
   INITIAL HISTORY SNAPSHOT
========================================================= */

saveHistory();


/* =========================================================
   GLOBAL API
========================================================= */

window.AuthState = {

  /* State */

  getConfig,

  getLiveConfig,

  getValue,

  setValue,

  updateConfig,

  resetConfig,

  resetSection,


  /* Subscription */

  subscribe,


  /* History */

  undo,

  redo,

  canUndo,

  canRedo,


  /* Import / Export */

  importConfig,

  exportConfig,

  downloadConfigJSON,

  loadConfigFile,


  /* Navigation */

  setActivePage,

  setPreviewMode,

  setActiveSection,


  /* Background */

  setBackgroundImage,

  setBackgroundColor,

  setBackgroundPosition,

  setBackgroundOverlay,

  uploadBackground,


  /* Branding */

  setLogo,

  setLogoStyle,

  setLogoPosition,

  uploadLogo,


  /* Colors */

  setPrimaryColor,

  setSecondaryColor,

  setTextColor,


  /* Authentication */

  setAuthenticationMethod,

  toggleAuthenticationMethod,


  /* Signup */

  toggleSignupField,


  /* Social */

  toggleSocialProvider,


  /* Utilities */

  fileToDataURL
};


/* =========================================================
   DEFAULT CONFIG EXPORT
========================================================= */

window.DEFAULT_AUTH_CONFIG =
  cloneValue(
    DEFAULT_CONFIG
  );