/* =========================================================
   AUTH PAGE BUILDER - APPLICATION CONSTANTS
   File: js/constants.js
========================================================= */

const APP_INFO = Object.freeze({
    name: "Auth Page Builder",
    version: "2.0.0",
    author: "Auth Page Builder",
    defaultProjectName: "auth-page",
    projectFolderName: "generated-auth-page"
});

const PAGE_TYPES = Object.freeze({
    LOGIN: "login",
    SIGNUP: "signup",
    FORGOT_PASSWORD: "forgotPassword",
    OTP: "otp"
});

const DEVICE_TYPES = Object.freeze({
    DESKTOP: "desktop",
    TABLET: "tablet",
    MOBILE: "mobile"
});

const LAYOUT_TYPES = Object.freeze({
    SPLIT_LEFT: "split-left-image",
    SPLIT_RIGHT: "split-right-image",
    CENTERED: "centered",
    FULL_BACKGROUND: "full-background",
    MINIMAL: "minimal",
    CARD_LEFT: "card-left",
    CARD_RIGHT: "card-right"
});

const DEFAULT_BACKGROUND_ASSETS = Object.freeze([
    {
        id: "bg-1",
        name: "Geometric Dark",
        path: "assets/backgrounds/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg"
    },
    {
        id: "bg-2",
        name: "Creative Light",
        path: "assets/backgrounds/idea-6900632_1280.png"
    },
    {
        id: "bg-3",
        name: "Abstract Gradient",
        path: "assets/backgrounds/OIP (3).webp"
    },
    {
        id: "bg-4",
        name: "Deep Blue",
        path: "assets/backgrounds/OIP (4).webp"
    },
    {
        id: "bg-5",
        name: "Modern Texture",
        path: "assets/backgrounds/OIP (5).webp"
    }
]);

const DEFAULT_LOGO_ASSETS = Object.freeze([
    {
        id: "logo-1",
        name: "Prism Icon",
        path: "assets/logos/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg"
    },
    {
        id: "logo-2",
        name: "Lightbulb Emblem",
        path: "assets/logos/idea-6900632_1280.png"
    },
    {
        id: "logo-3",
        name: "Shield Brand",
        path: "assets/logos/OIP (4).webp"
    },
    {
        id: "logo-4",
        name: "Aura Badge",
        path: "assets/logos/OIP (3).webp"
    },
    {
        id: "logo-5",
        name: "Vector Mark",
        path: "assets/logos/OIP (5).webp"
    }
]);

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        APP_INFO,
        PAGE_TYPES,
        DEVICE_TYPES,
        LAYOUT_TYPES,
        DEFAULT_BACKGROUND_ASSETS,
        DEFAULT_LOGO_ASSETS
    };
}