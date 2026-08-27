/* =========================================================
   AUTH PAGE BUILDER
   File: js/state.js

   CENTRAL APPLICATION STATE

   Responsibilities:
   - Store complete builder configuration
   - Support Login / Signup / Forgot Password / OTP
   - Provide get / set / update APIs
   - Deep merge configuration safely
   - Notify PreviewManager and Renderer
   - Support undo / redo
   - Handle uploaded logo and background assets
   - Import / export configuration
   - Maintain preview device state
========================================================= */


/* =========================================================
   DEFAULT CONFIG
========================================================= */

const DEFAULT_CONFIG = {

  /* =====================================================
     APPLICATION
  ===================================================== */

  app: {
    previewMode: "desktop",
    activeSection: "layout"
  },


  /* =====================================================
     PAGE NAVIGATION
  ===================================================== */

  currentPage: "login",

  page: {
    activePage: "login",

    availablePages: [
      "login",
      "signup",
      "forgotPassword",
      "otp"
    ]
  },


  /* =====================================================
     PROJECT
  ===================================================== */

  project: {
    name: "Auth Page",
    description: ""
  },


  /* =====================================================
     LAYOUT
  ===================================================== */

  layout: {

    pageLayout: "split",

    type: "split",

    imageWidth: 50,

    formPosition: "center",

    showBackgroundContent: true
  },


  /* =====================================================
     BACKGROUND
  ===================================================== */

  background: {

    type: "color",

    color: "#111827",

    backgroundColor: "#111827",

    image: "",

    imageUrl: "",

    uploadedImage: "",

    position: "center",

    size: "cover",

    repeat: "no-repeat",

    overlay: "rgba(15, 23, 42, 0.35)",

    overlayColor: "#0f172a",

    overlayOpacity: 0.35
  },


  /* =====================================================
     BRANDING
  ===================================================== */

  branding: {

    brandName: "",

    name: "",

    title: "Welcome",

    description:
      "Secure authentication designed for your application.",

    logo: "",

    logoUrl: "",

    uploadedLogo: "",

    image: "",

    logoWidth: 120,

    logoPosition: "center"
  },


  /* =====================================================
     COLORS
  ===================================================== */

  colors: {

    primary: "#2563eb",

    primaryHover: "#1d4ed8",

    secondary: "#64748b",

    text: "#0f172a",

    textColor: "#0f172a",

    muted: "#64748b",

    secondaryText: "#64748b",

    border: "#dbe3ee",

    inputBorder: "#dbe3ee",

    inputBackground: "#ffffff",

    inputText: "#0f172a",

    cardBackground: "#ffffff",

    linkColor: "#2563eb"
  },


  /* =====================================================
     CARD
  ===================================================== */

  card: {

    background: "#ffffff",

    backgroundColor: "#ffffff",

    borderRadius: 20,

    radius: 20,

    padding: 36,

    shadow: "medium",

    border: false,

    borderColor: "#e2e8f0",

    transparent: false
  },


  /* =====================================================
     TYPOGRAPHY
  ===================================================== */

  typography: {

    fontFamily:
      "Inter, Arial, sans-serif",

    titleSize: 30,

    subtitleSize: 15,

    bodySize: 14,

    fontWeight: 700
  },


  /* =====================================================
     LOGIN PAGE
  ===================================================== */

  login: {

    title: "Welcome back",

    subtitle:
      "Sign in to continue to your account",

    buttonText: "Sign In",

    loginButtonText: "Sign In",

    forgotPasswordText:
      "Forgot password?",

    signupPrompt:
      "New here?",

    signupButtonText:
      "Create Account",

    showPassword: true,

    showRememberMe: true,

    showForgotPassword: true,

    showSignup: true,

    showIdentifierSelector: true,

    identifierTypes: [
      "email",
      "mobile"
    ],

    identifierOptions: [
      "email",
      "mobile"
    ],

    identifierEnabled: true,

    identifierLabel:
      "Email Address",

    identifierPlaceholder:
      "Enter your email",

    authenticationMethods: {

      password: true,

      otp: true,

      magicLink: false
    },

    defaultAuthentication:
      "password",

    otpLength: 6
  },


  /* =====================================================
     SIGNUP PAGE
  ===================================================== */

  signup: {

    enabled: true,

    title:
      "Create account",

    subtitle:
      "Create your account to get started",

    buttonText:
      "Create Account",

    loginPrompt:
      "Already have an account?",

    loginButtonText:
      "Sign In",

    fields: {

      fullName: true,

      username: true,

      email: true,

      mobile: true,

      password: true,

      confirmPassword: true
    }
  },


  /* =====================================================
     FORGOT PASSWORD PAGE
  ===================================================== */

  forgotPassword: {

    enabled: true,

    title:
      "Forgot password?",

    subtitle:
      "Enter your email or mobile number and we will help you reset your password.",

    buttonText:
      "Send Reset Link",

    backButtonText:
      "Back to login"
  },


  /* =====================================================
     OTP PAGE
  ===================================================== */

  otp: {

    enabled: true,

    title:
      "Verify your identity",

    subtitle:
      "Enter the verification code sent to you.",

    buttonText:
      "Verify OTP",

    verificationButtonText:
      "Verify OTP",

    resendEnabled: true,

    resendText:
      "Resend OTP",

    resendSeconds: 30,

    backButtonText:
      "Back to login",

    length: 6,

    input: {

      length: 6,

      style: "separate",

      methods: [
        "email",
        "sms",
        "whatsapp"
      ]
    },

    deliveryMethods: [
      "email",
      "sms",
      "whatsapp"
    ],

    showWhatsApp: true,

    showSMS: true,

    showEmail: true,

    showAuthenticator: false
  },


  /* =====================================================
     AUTHENTICATION
  ===================================================== */

  authentication: {

    identifierTypes: [
      "email",
      "mobile"
    ],

    loginMethods: [
      "password",
      "otp"
    ],

    password: {
      enabled: true
    },

    otp: {

      enabled: true,

      length: 6,

      buttonText:
        "Continue with OTP",

      deliveryMethods: [
        "email",
        "sms",
        "whatsapp"
      ]
    },

    magicLink: {

      enabled: false,

      buttonText:
        "Send Magic Link"
    },

    social: {

      google: {
        enabled: true
      },

      linkedin: {
        enabled: false
      },

      github: {
        enabled: false
      },

      facebook: {
        enabled: false
      },

      apple: {
        enabled: false
      }
    }
  },


  /* =====================================================
     SOCIAL LOGIN
  ===================================================== */

  social: {

    enabled: true,

    title:
      "OR CONTINUE WITH",

    layout: "vertical",

    providers: {

      google: true,

      linkedin: false,

      github: false,

      facebook: false,

      apple: false
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

    placeholderColor:
      "#94a3b8"
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
  },


  /* =====================================================
     CUSTOM ASSETS

     Used by download.js
  ===================================================== */

  assets: {

    logo: null,

    background: null,

    uploads: []
  }
};


/* =========================================================
   APPLICATION STATE
========================================================= */

const AppState = {

  config:
    cloneValue(
      DEFAULT_CONFIG
    ),

  listeners: [],

  history: [],

  historyIndex: -1,

  maxHistory: 50
};


/* =========================================================
   CLONE VALUE
========================================================= */

function cloneValue(
  value
) {

  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    value === null
  ) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(
      value
    )
  );
}


/* =========================================================
   DEEP MERGE
========================================================= */

function deepMerge(
  target = {},
  source = {}
) {

  const output =
    Array.isArray(target)
      ? [...target]
      : {
          ...target
        };


  if (
    !source ||
    typeof source !== "object"
  ) {
    return output;
  }


  Object.keys(
    source
  ).forEach(
    (key) => {

      const sourceValue =
        source[key];

      const targetValue =
        output[key];


      if (
        sourceValue &&
        typeof sourceValue ===
          "object" &&
        !Array.isArray(
          sourceValue
        )
      ) {

        output[key] =
          deepMerge(
            targetValue &&
            typeof targetValue ===
              "object"
              ? targetValue
              : {},
            sourceValue
          );

      } else {

        output[key] =
          cloneValue(
            sourceValue
          );

      }

    }
  );


  return output;
}


/* =========================================================
   NORMALIZE PAGE NAME
========================================================= */

function normalizePageName(
  pageName
) {

  const value =
    String(
      pageName || ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /[\s_-]+/g,
        ""
      );


  const aliases = {

    login:
      "login",

    signin:
      "login",

    signup:
      "signup",

    register:
      "signup",

    forgot:
      "forgotPassword",

    forgotpassword:
      "forgotPassword",

    otp:
      "otp",

    verification:
      "otp",

    verify:
      "otp"
  };


  return (
    aliases[value] ||
    "login"
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
========================================================= */

function getLiveConfig() {

  return AppState.config;
}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(
  path
) {

  if (!path) {
    return undefined;
  }


  const keys =
    String(path)
      .split(".");


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
   SET VALUE
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
    String(path)
      .split(".");


  const lastKey =
    keys.pop();


  let current =
    AppState.config;


  keys.forEach(
    (key) => {

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
  );


  current[lastKey] =
    cloneValue(
      value
    );


  if (
    path ===
    "currentPage"
  ) {

    const page =
      normalizePageName(
        value
      );

    AppState.config.currentPage =
      page;

    AppState.config.page.activePage =
      page;

  }


  if (
    path ===
    "page.activePage"
  ) {

    const page =
      normalizePageName(
        value
      );

    AppState.config.page.activePage =
      page;

    AppState.config.currentPage =
      page;

  }


  if (
    path ===
    "app.previewMode"
  ) {

    const allowedModes = [
      "desktop",
      "tablet",
      "mobile"
    ];


    if (
      !allowedModes.includes(
        value
      )
    ) {

      AppState.config.app.previewMode =
        "desktop";

    }

  }


  if (
    options.history !== false
  ) {

    saveHistory();

  }


  if (
    options.notify !== false
  ) {

    notifyStateChange(
      "set",
      {
        path,
        value
      }
    );

  }


  return cloneValue(
    value
  );
}


/* =========================================================
   UPDATE CONFIG
========================================================= */

function updateConfig(
  newConfig = {},
  options = {}
) {

  if (
    !newConfig ||
    typeof newConfig !==
      "object"
  ) {
    return getConfig();
  }


  AppState.config =
    deepMerge(
      AppState.config,
      newConfig
    );


  syncPageConfiguration();


  if (
    options.history !== false
  ) {

    saveHistory();

  }


  if (
    options.notify !== false
  ) {

    notifyStateChange(
      "update",
      newConfig
    );

  }


  return getConfig();
}


/* =========================================================
   UPDATE MULTIPLE PATHS
========================================================= */

function setValues(
  values = {},
  options = {}
) {

  if (
    !values ||
    typeof values !==
      "object"
  ) {
    return;
  }


  Object.entries(
    values
  ).forEach(
    ([path, value]) => {

      setValue(
        path,
        value,
        {
          history: false,
          notify: false
        }
      );

    }
  );


  if (
    options.history !== false
  ) {

    saveHistory();

  }


  if (
    options.notify !== false
  ) {

    notifyStateChange(
      "batch",
      values
    );

  }
}


/* =========================================================
   PAGE CONFIGURATION SYNC
========================================================= */

function syncPageConfiguration() {

  if (
    !AppState.config.page
  ) {

    AppState.config.page = {};

  }


  const page =
    normalizePageName(
      AppState.config.currentPage ||
      AppState.config.page.activePage
    );


  AppState.config.currentPage =
    page;


  AppState.config.page.activePage =
    page;


  if (
    !Array.isArray(
      AppState.config.page.availablePages
    )
  ) {

    AppState.config.page.availablePages =
      [
        "login",
        "signup",
        "forgotPassword",
        "otp"
      ];

  }


  if (
    !AppState.config.pages
  ) {

    AppState.config.pages = {};

  }


  AppState.config.pages.login =
    deepMerge(
      AppState.config.login || {},
      AppState.config.pages.login || {}
    );


  AppState.config.pages.signup =
    deepMerge(
      AppState.config.signup || {},
      AppState.config.pages.signup || {}
    );


  AppState.config.pages.forgotPassword =
    deepMerge(
      AppState.config.forgotPassword || {},
      AppState.config.pages.forgotPassword || {}
    );


  AppState.config.pages.otp =
    deepMerge(
      AppState.config.otp || {},
      AppState.config.pages.otp || {}
    );
}


/* =========================================================
   RESET CONFIG
========================================================= */

function resetConfig() {

  AppState.config =
    cloneValue(
      DEFAULT_CONFIG
    );


  syncPageConfiguration();


  saveHistory();


  notifyStateChange(
    "reset",
    AppState.config
  );
}


/* =========================================================
   RESET SECTION
========================================================= */

function resetSection(
  sectionName
) {

  if (
    !sectionName
  ) {
    return;
  }


  if (
    !Object.prototype.hasOwnProperty.call(
      DEFAULT_CONFIG,
      sectionName
    )
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


  syncPageConfiguration();


  saveHistory();


  notifyStateChange(
    "reset-section",
    {
      section:
        sectionName
    }
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


  const currentSnapshot =
    AppState.history[
      AppState.historyIndex
    ];


  if (
    currentSnapshot &&
    JSON.stringify(
      currentSnapshot
    ) ===
    JSON.stringify(
      snapshot
    )
  ) {
    return;
  }


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

  }


  AppState.historyIndex =
    AppState.history.length - 1;
}


/* =========================================================
   UNDO
========================================================= */

function undo() {

  if (
    !canUndo()
  ) {
    return false;
  }


  AppState.historyIndex -= 1;


  AppState.config =
    cloneValue(
      AppState.history[
        AppState.historyIndex
      ]
    );


  syncPageConfiguration();


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
    !canRedo()
  ) {
    return false;
  }


  AppState.historyIndex += 1;


  AppState.config =
    cloneValue(
      AppState.history[
        AppState.historyIndex
      ]
    );


  syncPageConfiguration();


  notifyStateChange(
    "redo",
    AppState.config
  );


  return true;
}


function canUndo() {

  return (
    AppState.historyIndex >
    0
  );
}


function canRedo() {

  return (
    AppState.historyIndex >= 0 &&
    AppState.historyIndex <
      AppState.history.length - 1
  );
}


/* =========================================================
   SUBSCRIPTIONS
========================================================= */

function subscribe(
  callback
) {

  if (
    typeof callback !==
    "function"
  ) {
    return function () {};
  }


  AppState.listeners.push(
    callback
  );


  return function unsubscribe() {

    AppState.listeners =
      AppState.listeners.filter(
        (listener) =>
          listener !== callback
      );

  };
}


/* =========================================================
   NOTIFY STATE CHANGE
========================================================= */

function notifyStateChange(
  type,
  detail
) {

  const config =
    getConfig();


  AppState.listeners.forEach(
    (listener) => {

      try {

        listener(
          config,
          {
            type,
            detail
          }
        );

      } catch (error) {

        console.error(
          "State listener error:",
          error
        );

      }

    }
  );


  const eventDetail = {

    type,

    detail,

    config,

    liveConfig:
      AppState.config
  };


  document.dispatchEvent(
    new CustomEvent(
      "auth-builder:state-updated",
      {
        detail:
          eventDetail
      }
    )
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth-builder:config-updated",
      {
        detail:
          eventDetail
      }
    )
  );


  document.dispatchEvent(
    new CustomEvent(
      "auth-builder:rerender-preview",
      {
        detail:
          eventDetail
      }
    )
  );


  notifySpecificEvents(
    type,
    detail,
    eventDetail
  );
}


/* =========================================================
   SPECIFIC EVENTS
========================================================= */

function notifySpecificEvents(
  type,
  detail,
  eventDetail
) {

  const changedPaths =
    getChangedPaths(
      detail
    );


  const checks = [

    {
      event:
        "auth-builder:layout-updated",

      paths: [
        "layout"
      ]
    },

    {
      event:
        "auth-builder:background-updated",

      paths: [
        "background"
      ]
    },

    {
      event:
        "auth-builder:branding-updated",

      paths: [
        "branding"
      ]
    },

    {
      event:
        "auth-builder:customization-updated",

      paths: [
        "colors",
        "card",
        "typography",
        "inputs",
        "button",
        "animation",
        "advanced"
      ]
    },

    {
      event:
        "auth-builder:page-config-updated",

      paths: [
        "login",
        "signup",
        "forgotPassword",
        "otp",
        "pages",
        "currentPage",
        "page.activePage"
      ]
    }
  ];


  checks.forEach(
    (check) => {

      const shouldDispatch =
        changedPaths.some(
          (changedPath) => {

            return check.paths.some(
              (watchPath) => {

                return (
                  changedPath ===
                    watchPath ||

                  changedPath.startsWith(
                    `${watchPath}.`
                  )
                );

              }
            );

          }
        );


      if (
        shouldDispatch
      ) {

        document.dispatchEvent(
          new CustomEvent(
            check.event,
            {
              detail:
                eventDetail
            }
          )
        );

      }

    }
  );


  if (
    type ===
    "reset"
  ) {

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:customization-updated",
        {
          detail:
            eventDetail
        }
      )
    );

  }
}


/* =========================================================
   GET CHANGED PATHS
========================================================= */

function getChangedPaths(
  detail
) {

  if (
    !detail
  ) {
    return [];
  }


  if (
    detail.path
  ) {
    return [
      detail.path
    ];
  }


  if (
    typeof detail ===
    "object"
  ) {

    return Object.keys(
      detail
    );

  }


  return [];
}


/* =========================================================
   SET ACTIVE PAGE
========================================================= */

function setActivePage(
  pageName
) {

  const page =
    normalizePageName(
      pageName
    );


  setValues(
    {

      currentPage:
        page,

      "page.activePage":
        page

    }
  );


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


  return page;
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


  document.dispatchEvent(
    new CustomEvent(
      "auth-builder:device-changed",
      {
        detail: {
          device:
            mode
        }
      }
    )
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

  updateConfig(
    {

      background: {

        type:
          "image",

        image:
          imageSource,

        imageUrl:
          imageSource,

        uploadedImage:
          imageSource
      }

    }
  );


  AppState.config.assets.background =
    imageSource;
}


function setBackgroundColor(
  color
) {

  updateConfig(
    {

      background: {

        type:
          "color",

        color,

        backgroundColor:
          color
      }

    }
  );
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

  const safeOpacity =
    Number(
      opacity
    );


  const alpha =
    Number.isNaN(
      safeOpacity
    )
      ? 0.35
      : safeOpacity > 1
        ? safeOpacity / 100
        : safeOpacity;


  updateConfig(
    {

      background: {

        overlayColor:
          color,

        overlayOpacity:
          alpha,

        overlay:
          color
      }

    }
  );
}


/* =========================================================
   BRANDING HELPERS
========================================================= */

function setLogo(
  logoSource
) {

  updateConfig(
    {

      branding: {

        logo:
          logoSource,

        logoUrl:
          logoSource,

        uploadedLogo:
          logoSource,

        image:
          logoSource
      }

    }
  );


  AppState.config.assets.logo =
    logoSource;
}


function setLogoStyle(
  style = {}
) {

  updateConfig(
    {

      branding:
        style

    }
  );
}


function setLogoPosition(
  position
) {

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

  setValues(
    {

      "colors.text":
        color,

      "colors.textColor":
        color

    }
  );
}


/* =========================================================
   AUTHENTICATION HELPERS
========================================================= */

function setAuthenticationMethod(
  method,
  enabled
) {

  if (
    !method
  ) {
    return;
  }


  setValue(
    `login.authenticationMethods.${method}`,
    Boolean(
      enabled
    )
  );


  if (
    AppState.config.authentication[
      method
    ] &&
    typeof AppState.config.authentication[
      method
    ] ===
      "object"
  ) {

    setValue(
      `authentication.${method}.enabled`,
      Boolean(
        enabled
      ),
      {
        history: false,
        notify: false
      }
    );


    saveHistory();


    notifyStateChange(
      "authentication-update",
      {
        path:
          `authentication.${method}.enabled`,

        value:
          Boolean(
            enabled
          )
      }
    );

  }
}


function toggleAuthenticationMethod(
  method
) {

  const current =
    Boolean(
      getValue(
        `login.authenticationMethods.${method}`
      )
    );


  setAuthenticationMethod(
    method,
    !current
  );
}


/* =========================================================
   OTP HELPERS
========================================================= */

function setOtpLength(
  length
) {

  const validLengths = [
    4,
    6,
    8
  ];


  const safeLength =
    Number(
      length
    );


  if (
    !validLengths.includes(
      safeLength
    )
  ) {
    return;
  }


  setValues(
    {

      "otp.length":
        safeLength,

      "otp.input.length":
        safeLength,

      "login.otpLength":
        safeLength,

      "authentication.otp.length":
        safeLength

    }
  );
}


function setOtpMethods(
  methods
) {

  if (
    !Array.isArray(
      methods
    )
  ) {
    return;
  }


  const allowed = [
    "email",
    "sms",
    "whatsapp",
    "authenticator"
  ];


  const filtered =
    methods.filter(
      (method) =>
        allowed.includes(
          method
        )
    );


  setValues(
    {

      "otp.input.methods":
        filtered,

      "otp.deliveryMethods":
        filtered,

      "authentication.otp.deliveryMethods":
        filtered

    }
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

    "fullName",

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
    Boolean(
      enabled
    )
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

    "linkedin",

    "github",

    "facebook",

    "apple"
  ];


  if (
    !allowedProviders.includes(
      provider
    )
  ) {
    return;
  }


  const value =
    Boolean(
      enabled
    );


  setValues(
    {

      [`social.providers.${provider}`]:
        value,

      [`authentication.social.${provider}.enabled`]:
        value

    }
  );
}


/* =========================================================
   FILE TO DATA URL
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
              "Unable to process file."
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
   UPLOAD BACKGROUND
========================================================= */

async function uploadBackground(
  file
) {

  const imageSource =
    await fileToDataURL(
      file
    );


  setBackgroundImage(
    imageSource
  );


  return imageSource;
}


/* =========================================================
   UPLOAD LOGO
========================================================= */

async function uploadLogo(
  file
) {

  const imageSource =
    await fileToDataURL(
      file
    );


  setLogo(
    imageSource
  );


  return imageSource;
}


/* =========================================================
   IMPORT CONFIG
========================================================= */

function importConfig(
  config = {}
) {

  if (
    !config ||
    typeof config !==
      "object"
  ) {
    return;
  }


  AppState.config =
    deepMerge(
      cloneValue(
        DEFAULT_CONFIG
      ),
      config
    );


  syncPageConfiguration();


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
   LOAD CONFIG FILE
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

          } catch (
            error
          ) {

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
   INITIALIZE CONFIG
========================================================= */

syncPageConfiguration();

saveHistory();


/* =========================================================
   PRIMARY GLOBAL API
========================================================= */

window.AuthState = {

  /* Config */

  getConfig,

  getLiveConfig,

  getValue,

  setValue,

  setValues,

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


  /* OTP */

  setOtpLength,

  setOtpMethods,


  /* Signup */

  toggleSignupField,


  /* Social */

  toggleSocialProvider,


  /* Utilities */

  fileToDataURL
};


/* =========================================================
   COMPATIBILITY API

   preview.js expects window.state
========================================================= */

window.state = {

  getConfig,

  getLiveConfig,

  getValue,

  setValue,

  setValues,

  update: updateConfig,

  updateConfig,

  config:
    AppState.config
};


/* =========================================================
   CONFIG COMPATIBILITY
========================================================= */

window.getAuthConfig =
  getConfig;


window.updateAuthConfig =
  updateConfig;


/* =========================================================
   EXPOSE DEFAULT CONFIG
========================================================= */

window.DEFAULT_AUTH_CONFIG =
  cloneValue(
    DEFAULT_CONFIG
  );


/* =========================================================
   STATE READY EVENT
========================================================= */

document.dispatchEvent(
  new CustomEvent(
    "auth-builder:state-ready",
    {
      detail: {
        config:
          getConfig()
      }
    }
  )
);