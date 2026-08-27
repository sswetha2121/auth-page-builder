/* =========================================================
   AUTH PAGE BUILDER - DEFAULT CONFIGURATION
   File: js/config.js
========================================================= */

const defaultConfig = {
  activePage: "login",
  previewMode: "desktop",
  fullscreenOpen: false,

  /* =======================================================
     URL CONFIGURATION (Customer Landing & Post-Auth Redirect)
  ======================================================= */
  urls: {
    landingPageUrl: "https://customerwebsite.com",
    redirectUrl: "https://customerwebsite.com/dashboard"
  },

  /* =======================================================
     LAYOUT SETTINGS
     Options: split-left-image, split-right-image, centered,
              full-background, minimal, card-left, card-right
  ======================================================= */
  layout: {
    type: "split-left-image",
    imageWidth: 50,
    formHorizontalAlignment: "center",
    formVerticalAlignment: "center",
    formWidth: 460,
    contentPadding: 48
  },

  /* =======================================================
     BACKGROUND SETTINGS
  ======================================================= */
  background: {
    type: "default",
    selected: "assets/backgrounds/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
    image: "assets/backgrounds/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
    uploadedImage: "",
    color: "#0f172a",
    gradientEnabled: false,
    gradientStart: "#0f172a",
    gradientEnd: "#1e293b",
    position: "center",
    size: "cover",
    repeat: "no-repeat",
    overlayEnabled: true,
    overlayColor: "#000000",
    overlayOpacity: 35
  },

  /* =======================================================
     BRANDING & LOGO SETTINGS
  ======================================================= */
  branding: {
    showLogo: true,
    selectedLogo: "assets/logos/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
    logo: "assets/logos/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
    uploadedLogo: "",
    logoSize: 64,
    logoShape: "circle",
    logoPosition: "center",
    logoBackgroundEnabled: false,
    logoBackgroundColor: "#ffffff",
    brandName: "Your Brand"
  },

  /* =======================================================
     CARD SETTINGS
  ======================================================= */
  card: {
    enabled: true,
    backgroundColor: "#ffffff",
    opacity: 100,
    width: 460,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowEnabled: true,
    blurEnabled: false,
    padding: 40
  },

  /* =======================================================
     TYPOGRAPHY SETTINGS
  ======================================================= */
  typography: {
    fontFamily: "Inter, sans-serif",
    titleColor: "#0f172a",
    subtitleColor: "#64748b",
    bodyColor: "#334155",
    labelColor: "#475569",
    titleSize: 32,
    subtitleSize: 15,
    titleWeight: "700",
    alignment: "left"
  },

  /* =======================================================
     BUTTON SETTINGS
  ======================================================= */
  button: {
    backgroundType: "solid",
    backgroundColor: "#2563eb",
    gradientStart: "#2563eb",
    gradientEnd: "#4f46e5",
    textColor: "#ffffff",
    borderRadius: 10,
    height: 48,
    fontSize: 15,
    fontWeight: "600",
    shadow: true
  },

  /* =======================================================
     SOCIAL LOGIN SETTINGS
  ======================================================= */
  social: {
    enabled: true,
    dividerText: "or continue with",
    providers: {
      google: true,
      apple: true,
      facebook: false,
      github: true,
      linkedin: false
    },
    layout: "horizontal",
    style: "standard"
  },

  /* =======================================================
     BACKGROUND IMAGE SECTION CONTENT
  ======================================================= */
  imageSection: {
    showText: true,
    text: "Experience the next generation of authentication.",
    subtext: "Fast, secure, and beautifully customized for your brand.",
    textColor: "#ffffff",
    textPosition: "center"
  },

  /* =======================================================
     AUTHENTICATION METHODS & OTP DELIVERY
  ======================================================= */
  authentication: {
    otp: {
      emailEnabled: true,
      smsEnabled: true,
      whatsappEnabled: true,
      authenticatorEnabled: false
    }
  },

  /* =======================================================
     CUSTOM CSS
  ======================================================= */
  customCSS: "",

  /* =======================================================
     PAGE-SPECIFIC CONFIGURATIONS
     (Changing one page does not affect others)
  ======================================================= */
  pages: {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to continue to your account",
      buttonText: "Sign In",
      emailEnabled: true,
      mobileEnabled: true,
      usernameEnabled: false,
      passwordEnabled: true,
      otpEnabled: true,
      rememberMeEnabled: true,
      forgotPasswordEnabled: true,
      signupEnabled: true
    },

    signup: {
      title: "Create account",
      subtitle: "Create your account to get started",
      buttonText: "Create Account",
      fields: {
        fullName: true,
        username: true,
        email: true,
        mobile: true,
        password: true,
        confirmPassword: true
      }
    },

    forgotPassword: {
      title: "Forgot password?",
      subtitle: "Enter your email or mobile number to reset password",
      buttonText: "Send Reset Link",
      allowEmail: true,
      allowMobile: true
    },

    otp: {
      title: "Verify your identity",
      subtitle: "Enter the verification code sent to your device",
      buttonText: "Verify OTP",
      length: 6,
      resendEnabled: true,
      resendText: "Resend OTP",
      resendSeconds: 30,
      boxSize: 50,
      boxGap: 10
    }
  }
};

if (typeof window !== "undefined") {
  window.defaultConfig = defaultConfig;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { defaultConfig };
}