/* =========================================================
   AUTH PAGE BUILDER - APPLICATION CONSTANTS
   File: js/constants.js
========================================================= */


/* =========================================================
   APPLICATION INFORMATION
========================================================= */

const APP_INFO = Object.freeze({
    name: "Auth Page Builder",
    version: "2.0.0",
    author: "Auth Page Builder",
    defaultProjectName: "custom-auth-page",
    projectFolderName: "auth-page"
});


/* =========================================================
   APPLICATION PAGE TYPES
========================================================= */

const PAGE_TYPES = Object.freeze({
    LOGIN: "login",
    SIGNUP: "signup",
    FORGOT: "forgot",
    FORGOT_PASSWORD: "forgot",
    OTP: "otp"
});


/* =========================================================
   PREVIEW DEVICE TYPES
========================================================= */

const DEVICE_TYPES = Object.freeze({
    DESKTOP: "desktop",
    TABLET: "tablet",
    MOBILE: "mobile",
    FULLSCREEN: "fullscreen"
});


/* =========================================================
   DEVICE PREVIEW DIMENSIONS
========================================================= */

const DEVICE_DIMENSIONS = Object.freeze({

    desktop: {
        label: "Desktop",
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        minHeight: "680px",
        icon: "desktop",
        className: "preview-desktop"
    },

    tablet: {
        label: "Tablet",
        width: "768px",
        maxWidth: "100%",
        height: "1024px",
        minHeight: "700px",
        icon: "tablet",
        className: "preview-tablet"
    },

    mobile: {
        label: "Mobile",
        width: "390px",
        maxWidth: "100%",
        height: "844px",
        minHeight: "650px",
        icon: "mobile",
        className: "preview-mobile"
    },

    fullscreen: {
        label: "Fullscreen",
        width: "100%",
        maxWidth: "none",
        height: "100%",
        minHeight: "100vh",
        icon: "maximize",
        className: "preview-fullscreen"
    }

});


/* =========================================================
   LAYOUT TYPES
========================================================= */

const LAYOUT_TYPES = Object.freeze({

    SPLIT_LEFT_IMAGE: "split-left-image",

    SPLIT_RIGHT_IMAGE: "split-right-image",

    FULL_BACKGROUND: "full-background",

    CENTERED_CARD: "centered-card",

    STACKED: "stacked",

    SPLIT: "split",

    BACKGROUND: "background",

    CENTERED: "centered"

});


/* =========================================================
   LAYOUT OPTIONS
========================================================= */

const LAYOUT_OPTIONS = Object.freeze([

    {
        value: "split-left-image",
        label: "Split - Image Left",
        description:
            "A professional split layout with the visual section on the left and authentication form on the right.",
        icon: "columns"
    },

    {
        value: "split-right-image",
        label: "Split - Image Right",
        description:
            "Authentication form on the left with the visual section positioned on the right.",
        icon: "columns"
    },

    {
        value: "full-background",
        label: "Full Background",
        description:
            "Authentication content displayed elegantly over a full-page background.",
        icon: "image"
    },

    {
        value: "centered-card",
        label: "Centered Card",
        description:
            "A premium centered authentication card with focused content.",
        icon: "square"
    },

    {
        value: "stacked",
        label: "Stacked Layout",
        description:
            "Visual and authentication sections arranged vertically.",
        icon: "layout"
    }

]);


/* =========================================================
   LEGACY LAYOUT VALUE MAPPING
========================================================= */

const LAYOUT_VALUE_MAP = Object.freeze({

    split: "split-left-image",

    background: "full-background",

    centered: "centered-card"

});


/* =========================================================
   IMAGE SECTION POSITIONS
========================================================= */

const IMAGE_POSITION_OPTIONS = Object.freeze([

    {
        value: "left",
        label: "Image Left",
        description:
            "Display the image section on the left."
    },

    {
        value: "right",
        label: "Image Right",
        description:
            "Display the image section on the right."
    },

    {
        value: "top",
        label: "Image Top",
        description:
            "Display the image section above the form."
    },

    {
        value: "bottom",
        label: "Image Bottom",
        description:
            "Display the image section below the form."
    }

]);


/* =========================================================
   FORM HORIZONTAL POSITIONS
========================================================= */

const FORM_HORIZONTAL_POSITIONS = Object.freeze([

    {
        value: "left",
        label: "Left"
    },

    {
        value: "center",
        label: "Center"
    },

    {
        value: "right",
        label: "Right"
    }

]);


/* =========================================================
   FORM VERTICAL POSITIONS
========================================================= */

const FORM_VERTICAL_POSITIONS = Object.freeze([

    {
        value: "top",
        label: "Top"
    },

    {
        value: "center",
        label: "Center"
    },

    {
        value: "bottom",
        label: "Bottom"
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
            "Display the complete image without cropping."
    },

    {
        value: "100% 100%",
        label: "Stretch",
        description:
            "Stretch the image to fill the complete area."
    },

    {
        value: "auto",
        label: "Original Size",
        description:
            "Use the image at its natural size."
    }

]);


/* =========================================================
   BACKGROUND SOURCE TYPES
========================================================= */

const BACKGROUND_SOURCE_TYPES = Object.freeze({

    DEFAULT: "default",

    UPLOAD: "upload",

    COLOR: "color",

    GRADIENT: "gradient",

    NONE: "none"

});


/* =========================================================
   DEFAULT BACKGROUND ASSET DIRECTORY
========================================================= */

const BACKGROUND_ASSET_PATH =
    "assets/backgrounds/";


/* =========================================================
   DEFAULT BACKGROUND CATALOG

   IMPORTANT:
   These filenames match the assets currently present
   in the project folder.
========================================================= */

const DEFAULT_BACKGROUNDS = Object.freeze([

    {
        id: "background-1",
        name: "Abstract Professional",
        file:
            "1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
        category: "professional",
        path:
            "assets/backgrounds/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
        description:
            "Premium professional visual background."
    },

    {
        id: "background-2",
        name: "Creative Workspace",
        file:
            "idea-6900632_1280.png",
        category: "workspace",
        path:
            "assets/backgrounds/idea-6900632_1280.png",
        description:
            "Creative workspace suitable for modern product authentication."
    },

    {
        id: "background-3",
        name: "Modern Background",
        file:
            "OIP (3).webp",
        category: "modern",
        path:
            "assets/backgrounds/OIP (3).webp",
        description:
            "Modern visual background."
    },

    {
        id: "background-4",
        name: "Corporate Visual",
        file:
            "OIP (4).webp",
        category: "corporate",
        path:
            "assets/backgrounds/OIP (4).webp",
        description:
            "Professional corporate visual."
    },

    {
        id: "background-5",
        name: "Premium Workspace",
        file:
            "OIP (5).webp",
        category: "professional",
        path:
            "assets/backgrounds/OIP (5).webp",
        description:
            "Premium workspace background."
    }

]);


/* =========================================================
   LOGO ASSET DIRECTORY
========================================================= */

const LOGO_ASSET_PATH =
    "assets/logos/";


/* =========================================================
   DEFAULT LOGO TYPES
========================================================= */

const LOGO_TYPES = Object.freeze({

    TEXT: "text",

    DEFAULT: "default",

    IMAGE: "image",

    UPLOAD: "upload",

    NONE: "none"

});


/* =========================================================
   LOGO SHAPES
========================================================= */

const LOGO_SHAPES = Object.freeze([

    {
        value: "none",
        label: "No Shape",
        description:
            "Display the logo without a shape container."
    },

    {
        value: "circle",
        label: "Circle",
        description:
            "Display the logo inside a circular container."
    },

    {
        value: "ellipse",
        label: "Ellipse",
        description:
            "Display the logo inside an elliptical container."
    },

    {
        value: "square",
        label: "Square",
        description:
            "Display the logo inside a square container."
    },

    {
        value: "rounded",
        label: "Rounded",
        description:
            "Display the logo inside a rounded square."
    }

]);


/* =========================================================
   LOGO HORIZONTAL POSITIONS
========================================================= */

const LOGO_HORIZONTAL_POSITIONS = Object.freeze([

    {
        value: "left",
        label: "Left"
    },

    {
        value: "center",
        label: "Center"
    },

    {
        value: "right",
        label: "Right"
    }

]);


/* =========================================================
   LOGO VERTICAL POSITIONS
========================================================= */

const LOGO_VERTICAL_POSITIONS = Object.freeze([

    {
        value: "top",
        label: "Top"
    },

    {
        value: "center",
        label: "Center"
    },

    {
        value: "bottom",
        label: "Bottom"
    }

]);


/* =========================================================
   ADVANCED LOGO POSITIONS
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

   The same available images are supported as default
   visual logo options because those files are currently
   present inside assets/logos.
========================================================= */

const DEFAULT_LOGOS = Object.freeze([

    {
        id: "logo-1",
        name: "Default Logo 1",
        type: "image",
        file:
            "1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
        path:
            "assets/logos/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg"
    },

    {
        id: "logo-2",
        name: "Default Logo 2",
        type: "image",
        file:
            "idea-6900632_1280.png",
        path:
            "assets/logos/idea-6900632_1280.png"
    },

    {
        id: "logo-3",
        name: "Default Logo 3",
        type: "image",
        file:
            "OIP (3).webp",
        path:
            "assets/logos/OIP (3).webp"
    },

    {
        id: "logo-4",
        name: "Default Logo 4",
        type: "image",
        file:
            "OIP (4).webp",
        path:
            "assets/logos/OIP (4).webp"
    },

    {
        id: "logo-5",
        name: "Default Logo 5",
        type: "image",
        file:
            "OIP (5).webp",
        path:
            "assets/logos/OIP (5).webp"
    }

]);


/* =========================================================
   AUTHENTICATION METHODS
========================================================= */

const AUTH_METHODS = Object.freeze({

    PASSWORD: "password",

    OTP: "otp",

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
        placeholder:
            "Enter your email address",
        inputType: "email"
    },

    {
        value: "mobile",
        label: "Mobile Number",
        placeholder:
            "Enter your mobile number",
        inputType: "tel"
    },

    {
        value: "email-mobile",
        label: "Email or Mobile Number",
        placeholder:
            "Enter your email or mobile number",
        inputType: "text"
    },

    {
        value: "username",
        label: "Username",
        placeholder:
            "Enter your username",
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
        icon: "mail",
        description:
            "Receive the verification code through email."
    },

    {
        id: "sms",
        label: "SMS",
        icon: "message-square",
        description:
            "Receive the verification code through SMS."
    },

    {
        id: "whatsapp",
        label: "WhatsApp",
        icon: "message-circle",
        description:
            "Receive the verification code through WhatsApp."
    },

    {
        id: "authenticator",
        label: "Authenticator",
        icon: "shield-check",
        description:
            "Use a code generated by an authenticator application."
    }

]);


/* =========================================================
   GET KEY OPTIONS
========================================================= */

const GET_KEY_OPTIONS = Object.freeze([

    {
        value: "Authenticator",
        label: "Authenticator"
    },

    {
        value: "Email",
        label: "Email"
    },

    {
        value: "SMS",
        label: "SMS"
    },

    {
        value: "WhatsApp",
        label: "WhatsApp"
    }

]);


/* =========================================================
   SUPPORTED OTP LENGTHS
========================================================= */

const OTP_LENGTH_OPTIONS = Object.freeze([
    4,
    6,
    8
]);


/* =========================================================
   OTP BOX STYLES
========================================================= */

const OTP_BOX_STYLES = Object.freeze([

    {
        value: "separate",
        label: "Separate Boxes"
    },

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
   OTP RESEND OPTIONS
========================================================= */

const OTP_RESEND_OPTIONS = Object.freeze({

    defaultSeconds: 30,

    allowedSeconds: [
        15,
        30,
        45,
        60,
        90,
        120
    ],

    defaultText:
        "Resend code",

    timerText:
        "Resend available in {seconds}s"

});


/* =========================================================
   SOCIAL LOGIN PROVIDERS
========================================================= */

const SOCIAL_PROVIDERS = Object.freeze([

    {
        id: "google",
        name: "Google",
        label:
            "Continue with Google",
        enabled: true
    },

    {
        id: "linkedin",
        name: "LinkedIn",
        label:
            "Continue with LinkedIn",
        enabled: true
    },

    {
        id: "facebook",
        name: "Facebook",
        label:
            "Continue with Facebook",
        enabled: false
    },

    {
        id: "microsoft",
        name: "Microsoft",
        label:
            "Continue with Microsoft",
        enabled: false
    },

    {
        id: "github",
        name: "GitHub",
        label:
            "Continue with GitHub",
        enabled: false
    },

    {
        id: "apple",
        name: "Apple",
        label:
            "Continue with Apple",
        enabled: false
    }

]);


/* =========================================================
   SOCIAL LAYOUT OPTIONS
========================================================= */

const SOCIAL_LAYOUT_OPTIONS = Object.freeze([

    {
        value: "grid",
        label: "Grid"
    },

    {
        value: "horizontal",
        label: "Horizontal"
    },

    {
        value: "vertical",
        label: "Vertical"
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
        placeholder:
            "Enter your username",
        required: true
    },

    {
        id: "email",
        label: "Email Address",
        type: "email",
        placeholder:
            "Enter your email address",
        required: true
    },

    {
        id: "mobile",
        label: "Mobile Number",
        type: "tel",
        placeholder:
            "Enter your mobile number",
        required: true
    },

    {
        id: "password",
        label: "Password",
        type: "password",
        placeholder:
            "Create a password",
        required: true
    },

    {
        id: "confirmPassword",
        label: "Confirm Password",
        type: "password",
        placeholder:
            "Confirm your password",
        required: true
    }

]);


/* =========================================================
   FONT OPTIONS
========================================================= */

const FONT_OPTIONS = Object.freeze([

    {
        value:
            "Inter, Arial, sans-serif",
        label:
            "Inter"
    },

    {
        value:
            "Arial, sans-serif",
        label:
            "Arial"
    },

    {
        value:
            "Helvetica, Arial, sans-serif",
        label:
            "Helvetica"
    },

    {
        value:
            "Georgia, serif",
        label:
            "Georgia"
    },

    {
        value:
            "'Times New Roman', serif",
        label:
            "Times New Roman"
    },

    {
        value:
            "'Trebuchet MS', sans-serif",
        label:
            "Trebuchet MS"
    },

    {
        value:
            "Verdana, sans-serif",
        label:
            "Verdana"
    },

    {
        value:
            "'Courier New', monospace",
        label:
            "Courier New"
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
   PANEL / CARD BACKGROUND TYPES
========================================================= */

const PANEL_BACKGROUND_TYPES = Object.freeze([

    {
        value: "solid",
        label:
            "Solid Color"
    },

    {
        value: "glass",
        label:
            "Glass Effect"
    },

    {
        value: "gradient",
        label:
            "Gradient"
    },

    {
        value: "transparent",
        label:
            "Transparent"
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

    "#101828",
    "#344054",
    "#475467",
    "#667085",
    "#98a2b3",

    "#eaecf0",
    "#f2f4f7",
    "#f9fafb",

    "#6941c6",
    "#7f56d9",
    "#9e77ed",

    "#2563eb",
    "#3b82f6",
    "#1d4ed8",

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
    40,
    999
]);


/* =========================================================
   FORM LIMITS
========================================================= */

const FORM_LIMITS = Object.freeze({

    minInputHeight: 36,

    maxInputHeight: 80,

    minButtonHeight: 36,

    maxButtonHeight: 100,

    minFontSize: 10,

    maxFontSize: 120,

    minPadding: 0,

    maxPadding: 120,

    minBorderRadius: 0,

    maxBorderRadius: 100,

    minOpacity: 0,

    maxOpacity: 1,

    minBlur: 0,

    maxBlur: 50,

    minImageWidth: 20,

    maxImageWidth: 80,

    minFormWidth: 20,

    maxFormWidth: 80,

    minLogoSize: 20,

    maxLogoSize: 200,

    minFormMaxWidth: 280,

    maxFormMaxWidth: 900

});


/* =========================================================
   UPLOAD LIMITS
========================================================= */

const UPLOAD_LIMITS = Object.freeze({

    maxImageSize:
        10 * 1024 * 1024,

    maxImageSizeLabel:
        "10 MB",

    supportedImageTypes: [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/gif",

        "image/svg+xml"

    ],

    supportedExtensions: [

        ".jpg",

        ".jpeg",

        ".png",

        ".webp",

        ".gif",

        ".svg"

    ]

});


/* =========================================================
   DOWNLOAD PACKAGE SETTINGS
========================================================= */

const PACKAGE_FILES = Object.freeze({

    rootFolder:
        "custom-auth-page",

    html:
        "index.html",

    css:
        "css/styles.css",

    javascript:
        "js/script.js",

    config:
        "config.json",

    readme:
        "README.md",

    assetsFolder:
        "assets",

    backgroundFolder:
        "assets/backgrounds",

    logoFolder:
        "assets/logos",

    uploadFolder:
        "assets/uploads"

});


/* =========================================================
   DOWNLOAD MIME TYPES
========================================================= */

const DOWNLOAD_MIME_TYPES = Object.freeze({

    html:
        "text/html",

    css:
        "text/css",

    javascript:
        "text/javascript",

    json:
        "application/json",

    text:
        "text/plain",

    zip:
        "application/zip"

});


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const STORAGE_KEYS = Object.freeze({

    config:
        "authPageBuilderConfig",

    project:
        "authPageBuilderProject",

    state:
        "authPageBuilderState",

    lastUpdated:
        "authPageBuilderLastUpdated",

    uploadedAssets:
        "authPageBuilderUploadedAssets"

});


/* =========================================================
   EVENT NAMES
========================================================= */

const EVENTS = Object.freeze({

    CONFIG_CHANGED:
        "config:changed",

    PAGE_CHANGED:
        "page:changed",

    DEVICE_CHANGED:
        "device:changed",

    PREVIEW_MODE_CHANGED:
        "preview:mode-changed",

    PREVIEW_REFRESH:
        "preview:refresh",

    FULLSCREEN_OPEN:
        "preview:fullscreen-open",

    FULLSCREEN_CLOSE:
        "preview:fullscreen-close",

    PROJECT_SAVED:
        "project:saved",

    PROJECT_RESET:
        "project:reset",

    DOWNLOAD_STARTED:
        "download:started",

    DOWNLOAD_PROGRESS:
        "download:progress",

    DOWNLOAD_COMPLETED:
        "download:completed",

    DOWNLOAD_FAILED:
        "download:failed",

    ASSET_UPLOADED:
        "asset:uploaded",

    ASSET_REMOVED:
        "asset:removed",

    AUTH_METHOD_CHANGED:
        "auth-method:changed",

    OTP_METHOD_CHANGED:
        "otp-method:changed",

    OTP_RESEND:
        "otp:resend"

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
        /^[a-zA-Z0-9_.-]{3,30}$/,

    projectName:
        /^[a-zA-Z0-9_-]{2,80}$/

});


/* =========================================================
   DEFAULT FALLBACK ASSETS
========================================================= */

const FALLBACK_ASSETS = Object.freeze({

    background:
        DEFAULT_BACKGROUNDS[0].path,

    logo:
        DEFAULT_LOGOS[0].path

});


/* =========================================================
   HELPER: FIND DEFAULT BACKGROUND
========================================================= */

function getDefaultBackgroundById(id) {

    return (
        DEFAULT_BACKGROUNDS.find(
            (background) =>
                background.id === id
        ) || null
    );

}


/* =========================================================
   HELPER: FIND DEFAULT LOGO
========================================================= */

function getDefaultLogoById(id) {

    return (
        DEFAULT_LOGOS.find(
            (logo) =>
                logo.id === id
        ) || null
    );

}


/* =========================================================
   HELPER: GET BACKGROUND PATH
========================================================= */

function getBackgroundPath(id) {

    const background =
        getDefaultBackgroundById(id);

    return background
        ? background.path
        : "";
}


/* =========================================================
   HELPER: GET LOGO PATH
========================================================= */

function getLogoPath(id) {

    const logo =
        getDefaultLogoById(id);

    return logo
        ? logo.path
        : "";
}


/* =========================================================
   HELPER: NORMALIZE PAGE TYPE
========================================================= */

function normalizePageType(page) {

    const value =
        String(page || "")
            .toLowerCase()
            .trim();

    const aliases = {

        login: PAGE_TYPES.LOGIN,

        signin: PAGE_TYPES.LOGIN,

        "sign-in": PAGE_TYPES.LOGIN,

        signup: PAGE_TYPES.SIGNUP,

        "sign-up": PAGE_TYPES.SIGNUP,

        register: PAGE_TYPES.SIGNUP,

        forgot: PAGE_TYPES.FORGOT,

        "forgot-password":
            PAGE_TYPES.FORGOT,

        otp: PAGE_TYPES.OTP,

        verification:
            PAGE_TYPES.OTP

    };

    return (
        aliases[value] ||
        PAGE_TYPES.LOGIN
    );

}


/* =========================================================
   APPLICATION API
========================================================= */

window.AuthPageBuilder =
    window.AuthPageBuilder || {};


/* =========================================================
   CONSTANTS EXPORT
========================================================= */

window.AuthPageBuilder.Constants =
    Object.freeze({

        APP_INFO,

        PAGE_TYPES,

        DEVICE_TYPES,

        DEVICE_DIMENSIONS,

        LAYOUT_TYPES,

        LAYOUT_OPTIONS,

        LAYOUT_VALUE_MAP,

        IMAGE_POSITION_OPTIONS,

        FORM_HORIZONTAL_POSITIONS,

        FORM_VERTICAL_POSITIONS,

        BACKGROUND_POSITION_OPTIONS,

        BACKGROUND_SIZE_OPTIONS,

        BACKGROUND_SOURCE_TYPES,

        BACKGROUND_ASSET_PATH,

        DEFAULT_BACKGROUNDS,

        LOGO_ASSET_PATH,

        LOGO_TYPES,

        LOGO_SHAPES,

        LOGO_HORIZONTAL_POSITIONS,

        LOGO_VERTICAL_POSITIONS,

        LOGO_POSITIONS,

        DEFAULT_LOGOS,

        AUTH_METHODS,

        IDENTIFIER_TYPES,

        OTP_DELIVERY_METHODS,

        GET_KEY_OPTIONS,

        OTP_LENGTH_OPTIONS,

        OTP_BOX_STYLES,

        OTP_RESEND_OPTIONS,

        SOCIAL_PROVIDERS,

        SOCIAL_LAYOUT_OPTIONS,

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

        DOWNLOAD_MIME_TYPES,

        STORAGE_KEYS,

        EVENTS,

        VALIDATION_PATTERNS,

        FALLBACK_ASSETS,

        getDefaultBackgroundById,

        getDefaultLogoById,

        getBackgroundPath,

        getLogoPath,

        normalizePageType

    });


/* =========================================================
   OPTIONAL GLOBAL COMPATIBILITY EXPORTS
========================================================= */

window.DEFAULT_BACKGROUNDS =
    DEFAULT_BACKGROUNDS;

window.DEFAULT_LOGOS =
    DEFAULT_LOGOS;

window.DEVICE_TYPES =
    DEVICE_TYPES;

window.PAGE_TYPES =
    PAGE_TYPES;

window.AUTH_METHODS =
    AUTH_METHODS;