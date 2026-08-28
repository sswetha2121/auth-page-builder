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
        path: "assets/backgrounds/background-1.svg"
    },
    {
        id: "bg-2",
        name: "Blue Gradient",
        path: "assets/backgrounds/background-2.svg"
    },
    {
        id: "bg-3",
        name: "Clean Light",
        path: "assets/backgrounds/background-3.svg"
    },
    {
        id: "bg-4",
        name: "Cyber Grid",
        path: "assets/backgrounds/background-4.svg"
    },
    {
        id: "bg-5",
        name: "Purple Mesh",
        path: "assets/backgrounds/background-5.svg"
    },
    {
        id: "bg-6",
        name: "Soft Aurora",
        path: "assets/backgrounds/background-6.svg"
    }
]);

const DEFAULT_LOGO_ASSETS = Object.freeze([
    {
        id: "logo-1",
        name: "Shield Mark",
        path: "assets/logos/brand-shield.svg"
    },
    {
        id: "logo-2",
        name: "Prism Emblem",
        path: "assets/logos/brand-prism.svg"
    },
    {
        id: "logo-3",
        name: "Nexus Tech",
        path: "assets/logos/brand-nexus.svg"
    },
    {
        id: "logo-4",
        name: "Aurora Wave",
        path: "assets/logos/brand-aurora.svg"
    },
    {
        id: "logo-5",
        name: "Apex Peak",
        path: "assets/logos/brand-apex.svg"
    }
]);

if (typeof window !== "undefined") {
    window.APP_INFO = APP_INFO;
    window.PAGE_TYPES = PAGE_TYPES;
    window.DEVICE_TYPES = DEVICE_TYPES;
    window.LAYOUT_TYPES = LAYOUT_TYPES;
    window.DEFAULT_BACKGROUND_ASSETS = DEFAULT_BACKGROUND_ASSETS;
    window.DEFAULT_LOGO_ASSETS = DEFAULT_LOGO_ASSETS;
    window.Constants = {
        APP_INFO,
        PAGE_TYPES,
        DEVICE_TYPES,
        LAYOUT_TYPES,
        DEFAULT_BACKGROUND_ASSETS,
        DEFAULT_LOGO_ASSETS
    };
}

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