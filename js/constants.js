/* =========================================================
   AUTH PAGE BUILDER - APPLICATION CONSTANTS
   File: auth-page-builder/js/constants.js
   ========================================================= */


/* =========================================================
   APPLICATION INFORMATION
   ========================================================= */

const APP_INFO = Object.freeze({
    name: "Auth Page Builder",
    version: "1.0.0",
    author: "Auth Page Builder",
    defaultProjectName: "custom-auth-page"
});


/* =========================================================
   APPLICATION PAGE TYPES
   ========================================================= */

const PAGE_TYPES = Object.freeze({
    LOGIN: "login",
    SIGNUP: "signup",
    FORGOT_PASSWORD: "forgot-password"
});


/* =========================================================
   PREVIEW DEVICE TYPES
   ========================================================= */

const DEVICE_TYPES = Object.freeze({
    DESKTOP: "desktop",
    TABLET: "tablet",
    MOBILE: "mobile"
});


/* =========================================================
   DEVICE PREVIEW DIMENSIONS
   ========================================================= */

const DEVICE_DIMENSIONS = Object.freeze({

    desktop: {
        label: "Desktop",
        width: "100%",
        maxWidth: null,
        height: "100%",
        icon: "desktop"
    },

    tablet: {
        label: "Tablet",
        width: "768px",
        maxWidth: "100%",
        height: "1024px",
        icon: "tablet"
    },

    mobile: {
        label: "Mobile",
        width: "390px",
        maxWidth: "100%",
        height: "844px",
        icon: "mobile"
    }

});


/* =========================================================
   LAYOUT TYPES
   ========================================================= */

const LAYOUT_TYPES = Object.freeze({

    SPLIT: "split",

    BACKGROUND: "background",

    CENTERED: "centered"

});


/* =========================================================
   LAYOUT OPTIONS
   ========================================================= */

const LAYOUT_OPTIONS = Object.freeze([

    {
        value: "split",
        label: "Split Layout",
        description:
            "Background image and authentication panel displayed side by side.",
        icon: "columns"
    },

    {
        value: "background",
        label: "Full Background",
        description:
            "Authentication form displayed over the complete background image.",
        icon: "image"
    },

    {
        value: "centered",
        label: "Centered Card",
        description:
            "Authentication card displayed in the center of the page.",
        icon: "square"
    }

]);


/* =========================================================
   IMAGE POSITION OPTIONS
   ========================================================= */

const IMAGE_POSITION_OPTIONS = Object.freeze([

    {
        value: "left",
        label: "Image Left",
        description: "Background image appears on the left side."
    },

    {
        value: "right",
        label: "Image Right",
        description: "Background image appears on the right side."
    }

]);


/* =========================================================
   BACKGROUND IMAGE POSITIONS
   ========================================================= */

const BACKGROUND_POSITION_OPTIONS = Object.freeze([

    {
        value: "center",
        label: "Center"
    },

    {
        value: "top",
        label: "Top"
    },

    {
        value: "bottom",
        label: "Bottom"
    },

    {
        value: "left",
        label: "Left"
    },

    {
        value: "right",
        label: "Right"
    },

    {
        value: "top left",
        label: "Top Left"
    },

    {
        value: "top right",
        label: "Top Right"
    },

    {
        value: "bottom left",
        label: "Bottom Left"
    },

    {
        value: "bottom right",
        label: "Bottom Right"
    }

]);


/* =========================================================
   BACKGROUND SIZE OPTIONS
   ========================================================= */

const BACKGROUND_SIZE_OPTIONS = Object.freeze([

    {
        value: "cover",
        label: "Cover",
        description:
            "Fill the complete area while maintaining image proportions."
    },

    {
        value: "contain",
        label: "Contain",
        description:
            "Show the complete image without cropping."
    },

    {
        value: "100% 100%",
        label: "Stretch",
        description:
            "Stretch the image to fill the complete area."
    }

]);


/* =========================================================
   BACKGROUND SOURCE TYPES
   ========================================================= */

const BACKGROUND_SOURCE_TYPES = Object.freeze({
    DEFAULT: "default",
    UPLOAD: "upload",
    COLOR: "color",
    GRADIENT: "gradient"
});


/* =========================================================
   DEFAULT BACKGROUND ASSET DIRECTORY
   ========================================================= */

const BACKGROUND_ASSET_PATH = "assets/backgrounds/";


/* =========================================================
   DEFAULT BACKGROUND CATALOG
   =========================================================

   Add additional exact filenames here whenever you place
   a new image inside assets/backgrounds.

   The visible filenames from your project screenshot are used.
*/

const DEFAULT_BACKGROUNDS = Object.freeze([

    {
        id: "default",
        name: "Default Background",
        file: "",
        category: "default",
        path: "",
        description:
            "Default professional background used when no image is selected."
    },

    {
        id: "office-idea",
        name: "Professional Office",
        file: "idea-690632_1280.png",
        category: "office",
        path:
            `${BACKGROUND_ASSET_PATH}idea-690632_1280.png`,
        description:
            "Professional office environment suitable for corporate login pages."
    },

    {
        id: "background-oip",
        name: "Corporate Background",
        file: "OIP.webp",
        category: "corporate",
        path:
            `${BACKGROUND_ASSET_PATH}OIP.webp`,
        description:
            "Modern professional background."
    },

    {
        id: "background-oip-3",
        name: "Modern Workplace",
        file: "OIP (3).webp",
        category: "workplace",
        path:
            `${BACKGROUND_ASSET_PATH}OIP (3).webp`,
        description:
            "Modern workplace background for authentication screens."
    },

    {
        id: "background-oip-5",
        name: "Professional Team",
        file: "OIP (5).webp",
        category: "people",
        path:
            `${BACKGROUND_ASSET_PATH}OIP (5).webp`,
        description:
            "Professional team background."
    }

]);


/* =========================================================
   LOGO ASSET DIRECTORY
   ========================================================= */

const LOGO_ASSET_PATH = "assets/logos/";


/* =========================================================
   DEFAULT LOGO TYPES
   ========================================================= */

const LOGO_TYPES = Object.freeze({

    TEXT: "text",

    IMAGE: "image"

});


/* =========================================================
   LOGO SHAPES
   ========================================================= */

const LOGO_SHAPES = Object.freeze([

    {
        value: "none",
        label: "No Shape",
        description: "Display the logo without a surrounding shape."
    },

    {
        value: "circle",
        label: "Circle",
        description: "Display the logo inside a circular container."
    },

    {
        value: "square",
        label: "Square",
        description: "Display the logo inside a square container."
    },

    {
        value: "rounded",
        label: "Rounded",
        description: "Display the logo inside a rounded square."
    },

    {
        value: "ellipse",
        label: "Ellipse",
        description: "Display the logo inside an elliptical container."
    }

]);


/* =========================================================
   LOGO POSITIONS
   ========================================================= */

const LOGO_POSITIONS = Object.freeze([

    {
        value: "top-left",
        label: "Top Left"
    },

    {
        value: "top-center",
        label: "Top Center"
    },

    {
        value: "top-right",
        label: "Top Right"
    },

    {
        value: "form-top",
        label: "Above Form"
    },

    {
        value: "background-center",
        label: "Background Center"
    }

]);


/* =========================================================
   DEFAULT LOGO CATALOG
   ========================================================= */

const DEFAULT_LOGOS = Object.freeze([

    {
        id: "text-logo",
        name: "Text Logo",
        type: "text",
        path: null
    }

]);


/* =========================================================
   AUTHENTICATION METHODS
   ========================================================= */

const AUTH_METHODS = Object.freeze({

    OTP: "otp",

    PASSWORD: "password",

    MAGIC_LINK: "magic-link",

    SOCIAL: "social"

});


/* =========================================================
   LOGIN IDENTIFIER TYPES
   ========================================================= */

const IDENTIFIER_TYPES = Object.freeze([

    {
        value: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        inputType: "email"
    },

    {
        value: "mobile",
        label: "Mobile Number",
        placeholder: "Enter your mobile number",
        inputType: "tel"
    },

    {
        value: "email-mobile",
        label: "Email Id or Mobile Number",
        placeholder: "Enter your email or mobile number",
        inputType: "text"
    },

    {
        value: "username",
        label: "Username",
        placeholder: "Enter your username",
        inputType: "text"
    }

]);


/* =========================================================
   OTP DELIVERY METHODS
   ========================================================= */

const OTP_DELIVERY_METHODS = Object.freeze([

    {
        id: "email",
        label: "Email",
        icon: "mail"
    },

    {
        id: "sms",
        label: "SMS",
        icon: "message-square"
    },

    {
        id: "whatsapp",
        label: "WhatsApp",
        icon: "message-circle"
    }

]);


/* =========================================================
   SUPPORTED OTP LENGTHS
   ========================================================= */

const OTP_LENGTH_OPTIONS = Object.freeze([
    4,
    5,
    6,
    7,
    8
]);


/* =========================================================
   OTP BOX STYLES
   ========================================================= */

const OTP_BOX_STYLES = Object.freeze([

    {
        value: "individual",
        label: "Individual Boxes"
    },

    {
        value: "underline",
        label: "Underline"
    },

    {
        value: "connected",
        label: "Connected"
    }

]);


/* =========================================================
   SOCIAL LOGIN PROVIDERS
   ========================================================= */

const SOCIAL_PROVIDERS = Object.freeze([

    {
        id: "google",
        name: "Google",
        label: "Continue with Google",
        enabled: false
    },

    {
        id: "linkedin",
        name: "LinkedIn",
        label: "Continue with LinkedIn",
        enabled: false
    },

    {
        id: "facebook",
        name: "Facebook",
        label: "Continue with Facebook",
        enabled: false
    },

    {
        id: "microsoft",
        name: "Microsoft",
        label: "Continue with Microsoft",
        enabled: false
    },

    {
        id: "github",
        name: "GitHub",
        label: "Continue with GitHub",
        enabled: false
    },

    {
        id: "apple",
        name: "Apple",
        label: "Continue with Apple",
        enabled: false
    }

]);


/* =========================================================
   SIGNUP FIELD TYPES
   ========================================================= */

const SIGNUP_FIELDS = Object.freeze([

    {
        id: "username",
        label: "Username",
        type: "text",
        placeholder: "Enter your username",
        required: true
    },

    {
        id: "email",
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email address",
        required: true
    },

    {
        id: "mobile",
        label: "Mobile Number",
        type: "tel",
        placeholder: "Enter your mobile number",
        required: true
    },

    {
        id: "password",
        label: "Password",
        type: "password",
        placeholder: "Create a password",
        required: true
    },

    {
        id: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm your password",
        required: true
    }

]);


/* =========================================================
   FONT OPTIONS
   ========================================================= */

const FONT_OPTIONS = Object.freeze([

    {
        value: "Inter, Arial, sans-serif",
        label: "Inter"
    },

    {
        value: "Arial, sans-serif",
        label: "Arial"
    },

    {
        value: "Helvetica, Arial, sans-serif",
        label: "Helvetica"
    },

    {
        value: "Georgia, serif",
        label: "Georgia"
    },

    {
        value: "'Times New Roman', serif",
        label: "Times New Roman"
    },

    {
        value: "'Trebuchet MS', sans-serif",
        label: "Trebuchet MS"
    },

    {
        value: "Verdana, sans-serif",
        label: "Verdana"
    },

    {
        value: "'Courier New', monospace",
        label: "Courier New"
    }

]);


/* =========================================================
   FONT WEIGHT OPTIONS
   ========================================================= */

const FONT_WEIGHT_OPTIONS = Object.freeze([
    300,
    400,
    500,
    600,
    700,
    800,
    900
]);


/* =========================================================
   TEXT ALIGNMENT OPTIONS
   ========================================================= */

const TEXT_ALIGN_OPTIONS = Object.freeze([
    "left",
    "center",
    "right"
]);


/* =========================================================
   PANEL BACKGROUND TYPES
   ========================================================= */

const PANEL_BACKGROUND_TYPES = Object.freeze([

    {
        value: "solid",
        label: "Solid Color"
    },

    {
        value: "glass",
        label: "Glass Effect"
    },

    {
        value: "gradient",
        label: "Gradient"
    },

    {
        value: "transparent",
        label: "Transparent"
    }

]);


/* =========================================================
   GRADIENT DIRECTIONS
   ========================================================= */

const GRADIENT_DIRECTIONS = Object.freeze([

    "0deg",
    "45deg",
    "90deg",
    "135deg",
    "180deg",
    "225deg",
    "270deg",
    "315deg"

]);


/* =========================================================
   DEFAULT COLOR PALETTE
   ========================================================= */

const COLOR_PALETTE = Object.freeze([

    "#ffffff",
    "#000000",
    "#111827",
    "#1f2937",
    "#374151",
    "#6b7280",
    "#d1d5db",
    "#e5e7eb",

    "#2563eb",
    "#3b82f6",
    "#1d4ed8",

    "#7c3aed",
    "#8b5cf6",

    "#db2777",
    "#ec4899",

    "#dc2626",
    "#ef4444",

    "#ea580c",
    "#f97316",

    "#ca8a04",
    "#eab308",

    "#16a34a",
    "#22c55e",

    "#0891b2",
    "#06b6d4"

]);


/* =========================================================
   COMMON BORDER RADIUS OPTIONS
   ========================================================= */

const BORDER_RADIUS_OPTIONS = Object.freeze([
    0,
    4,
    8,
    10,
    12,
    16,
    20,
    24,
    32,
    999
]);


/* =========================================================
   DEFAULT FORM SETTINGS
   ========================================================= */

const FORM_LIMITS = Object.freeze({

    minInputHeight: 36,

    maxInputHeight: 80,

    minFontSize: 10,

    maxFontSize: 120,

    minPadding: 0,

    maxPadding: 100,

    minBorderRadius: 0,

    maxBorderRadius: 100,

    minOpacity: 0,

    maxOpacity: 1,

    minBlur: 0,

    maxBlur: 50

});


/* =========================================================
   UPLOAD LIMITS
   ========================================================= */

const UPLOAD_LIMITS = Object.freeze({

    maxImageSize: 10 * 1024 * 1024,

    supportedImageTypes: [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif",

        "image/svg+xml"

    ]

});


/* =========================================================
   DOWNLOAD PACKAGE SETTINGS
   ========================================================= */

const PACKAGE_FILES = Object.freeze({

    html: "index.html",

    css: "styles.css",

    javascript: "script.js",

    config: "config.json",

    readme: "README.md",

    assetsFolder: "assets",

    backgroundFolder: "assets/backgrounds",

    logoFolder: "assets/logos"

});


/* =========================================================
   LOCAL STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = Object.freeze({

    config: "authPageBuilderConfig",

    project: "authPageBuilderProject",

    lastUpdated: "authPageBuilderLastUpdated"

});


/* =========================================================
   EVENT NAMES
   ========================================================= */

const EVENTS = Object.freeze({

    CONFIG_CHANGED: "config:changed",

    PAGE_CHANGED: "page:changed",

    DEVICE_CHANGED: "device:changed",

    PREVIEW_REFRESH: "preview:refresh",

    FULLSCREEN_OPEN: "preview:fullscreen-open",

    FULLSCREEN_CLOSE: "preview:fullscreen-close",

    PROJECT_SAVED: "project:saved",

    PROJECT_RESET: "project:reset",

    DOWNLOAD_STARTED: "download:started",

    DOWNLOAD_COMPLETED: "download:completed",

    ASSET_UPLOADED: "asset:uploaded",

    ASSET_REMOVED: "asset:removed"

});


/* =========================================================
   VALIDATION PATTERNS
   ========================================================= */

const VALIDATION_PATTERNS = Object.freeze({

    email:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    mobile:
        /^[0-9+\-\s()]{7,20}$/,

    username:
        /^[a-zA-Z0-9_.-]{3,30}$/

});


/* =========================================================
   APPLICATION API
   ========================================================= */

window.AuthPageBuilder = window.AuthPageBuilder || {};


window.AuthPageBuilder.Constants = Object.freeze({

    APP_INFO,

    PAGE_TYPES,

    DEVICE_TYPES,

    DEVICE_DIMENSIONS,

    LAYOUT_TYPES,

    LAYOUT_OPTIONS,

    IMAGE_POSITION_OPTIONS,

    BACKGROUND_POSITION_OPTIONS,

    BACKGROUND_SIZE_OPTIONS,

    BACKGROUND_SOURCE_TYPES,

    BACKGROUND_ASSET_PATH,

    DEFAULT_BACKGROUNDS,

    LOGO_ASSET_PATH,

    LOGO_TYPES,

    LOGO_SHAPES,

    LOGO_POSITIONS,

    DEFAULT_LOGOS,

    AUTH_METHODS,

    IDENTIFIER_TYPES,

    OTP_DELIVERY_METHODS,

    OTP_LENGTH_OPTIONS,

    OTP_BOX_STYLES,

    SOCIAL_PROVIDERS,

    SIGNUP_FIELDS,

    FONT_OPTIONS,

    FONT_WEIGHT_OPTIONS,

    TEXT_ALIGN_OPTIONS,

    PANEL_BACKGROUND_TYPES,

    GRADIENT_DIRECTIONS,

    COLOR_PALETTE,

    BORDER_RADIUS_OPTIONS,

    FORM_LIMITS,

    UPLOAD_LIMITS,

    PACKAGE_FILES,

    STORAGE_KEYS,

    EVENTS,

    VALIDATION_PATTERNS

});