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
    redirectUrl: "https://customerwebsite.com/dashboard",
    authPageUrl: "https://customerwebsite.com/auth",
    showBackToWebsite: true,
    backToWebsiteText: "Back to Website",
    openInNewTab: true
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
    type: "default", // "default", "uploaded", "color", "gradient"
    selected: "assets/backgrounds/background-1.svg",
    image: "assets/backgrounds/background-1.svg",
    uploadedImage: "",
    color: "#0f172a",
    gradientEnabled: false,
    gradientStart: "#0f172a",
    gradientEnd: "#1e293b",
    position: "center", // "center", "top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"
    size: "cover", // "cover", "contain", "auto"
    repeat: "no-repeat", // "no-repeat", "repeat", "repeat-x", "repeat-y"
    overlayEnabled: true,
    overlayColor: "#000000",
    overlayOpacity: 35
  },

  /* =======================================================
     BRANDING & LOGO SETTINGS
  ======================================================= */
  branding: {
    showLogo: true,
    selectedLogo: "assets/logos/brand-shield.svg",
    logo: "assets/logos/brand-shield.svg",
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
      authenticatorEnabled: false,
      defaultMethod: "email"
    }
  },

  /* =======================================================
     PASSWORD POLICY & AUTHENTICATION REQUIREMENTS
  ======================================================= */
  passwordPolicy: {
    minLength: 8,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    allowedSpecialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    minNumbers: 1,
    minSpecialChars: 1,
    preventUsername: true,
    preventEmail: true,
    strengthRequirement: "medium", // "weak", "medium", "strong"
    showStrengthMeter: true,
    showRequirementsList: true
  },

  /* =======================================================
     ADVANCED NO-CODE SETTINGS
  ======================================================= */
  advanced: {
    sessionTimeout: 30,
    autoFocus: true,
    smoothTransitions: true,
    showPasswordToggle: true
  },


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
      rememberMeText: "Remember me for 30 days",
      forgotPasswordEnabled: true,
      forgotPasswordText: "Forgot password?",
      signupEnabled: true,
      signupPrompt: "Don't have an account?",
      signupLinkText: "Create account",
      identifierPlaceholder: "name@company.com",
      passwordPlaceholder: "••••••••",
      otpButtonText: "Continue with OTP",
      whatsappButtonText: "Get OTP via WhatsApp"
    },

    signup: {
      title: "Create account",
      subtitle: "Create your account to get started",
      buttonText: "Create Account",
      signinPrompt: "Already have an account?",
      signinLinkText: "Sign in",
      termsEnabled: true,
      termsText: "I agree to the Terms of Service",
      termsUrl: "https://customerwebsite.com/terms",
      privacyEnabled: true,
      privacyText: "Privacy Policy",
      privacyUrl: "https://customerwebsite.com/privacy",
      fields: {
        fullName: true,
        username: true,
        email: true,
        mobile: true,
        password: true,
        confirmPassword: true
      },
      fieldLabels: {
        fullName: "Full Name",
        username: "Username",
        email: "Email Address",
        mobile: "Mobile Number",
        password: "Password",
        confirmPassword: "Confirm Password"
      },
      fieldPlaceholders: {
        fullName: "Alex Morgan",
        username: "alexmorgan",
        email: "alex@company.com",
        mobile: "+1 (555) 234-5678",
        password: "Minimum 8 characters",
        confirmPassword: "Repeat your password"
      }
    },

    forgotPassword: {
      title: "Forgot password?",
      subtitle: "Enter your email or mobile number to reset password",
      buttonText: "Send Reset Link",
      backToLoginText: "Back to login",
      identifierMode: "both", // "email", "phone", "both"
      identifierLabel: "Email or Phone Number",
      identifierPlaceholder: "name@company.com"
    },

    otp: {
      title: "Verify your identity",
      subtitle: "Enter the verification code sent to your device",
      buttonText: "Verify OTP",
      displayMode: "separate", // "separate" or "inline"
      length: 6, // 4, 6, 8
      inputStyle: "box", // "box", "rounded", "underline"
      resendEnabled: true,
      resendText: "Resend OTP",
      resendPromptText: "Didn't receive code?",
      resendSeconds: 30,
      backToSignInText: "Back to sign in",
      boxWidth: 48,
      boxHeight: 54,
      gap: 10,
      borderRadius: 12,
      fontSize: 24
    }
  }
};

if (typeof window !== "undefined") {
  window.defaultConfig = defaultConfig;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { defaultConfig };
}