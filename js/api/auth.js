/* =========================================================
   AUTH PAGE BUILDER - UNIFIED AUTH CONTROLLER & API
   File: js/api/auth.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const client = require("./client.js");
    module.exports = factory(client);
  } else {
    root.AuthController = factory(root.ApiClient);
    root.AuthApi = root.AuthController;
  }
})(typeof window !== "undefined" ? window : globalThis, function (client) {

  class AuthController {
    constructor() {
      this.client = client;
      this.currentUser = null;
    }

    /* =======================================================
       USER AUTHENTICATION (BACKEND API)
    ======================================================= */
    async registerUser(userData) {
      const response = await this.client.post("/auth/register", userData);
      if (response && response.token) {
        this.client.setAuthToken(response.token);
        this.currentUser = response.user;
      }
      return response;
    }

    async loginUser(credentials) {
      const response = await this.client.post("/auth/login", credentials);
      if (response && response.token) {
        this.client.setAuthToken(response.token);
        this.currentUser = response.user;
      }
      return response;
    }

    async getCurrentUser() {
      if (!this.client.getAuthToken()) return null;
      try {
        const response = await this.client.get("/auth/me");
        if (response && response.user) {
          this.currentUser = response.user;
          return response.user;
        }
      } catch (err) {
        console.warn("[Auth] Session check failed:", err.message);
        this.logout();
      }
      return null;
    }

    logout() {
      this.currentUser = null;
      if (this.client) {
        this.client.setAuthToken(null);
      }
    }

    isAuthenticated() {
      return Boolean(this.client && this.client.getAuthToken());
    }

    async logoutUser() {
      try {
        await this.client.post("/auth/logout", {});
      } catch (e) {
        // ignore logout network errors
      }
      this.logout();
      return { success: true, message: "Logged out successfully." };
    }


    /* =======================================================
       REAL EMAIL OTP & PASSWORD RESET API
    ======================================================= */
    async sendEmailOtp(identifier, purpose = "login") {
      return this.client.post("/otp/send-email", {
        identifier: identifier.trim(),
        purpose
      });
    }

    async verifyOtp(identifier, otp, purpose = "login") {
      const response = await this.client.post("/otp/verify", {
        identifier: identifier.trim(),
        otp: String(otp).trim(),
        purpose
      });
      if (response && response.token) {
        this.client.setAuthToken(response.token);
        this.currentUser = response.user;
      }
      return response;
    }

    async requestPasswordReset(identifier) {
      return this.client.post("/password-reset/request", {
        identifier: identifier.trim()
      });
    }

    async verifyPasswordResetOtp(identifier, otp) {
      return this.client.post("/password-reset/verify-otp", {
        identifier: identifier.trim(),
        otp: String(otp).trim()
      });
    }

    async confirmPasswordReset(identifier, otp, newPassword) {
      return this.client.post("/password-reset/confirm", {
        identifier: identifier.trim(),
        otp: String(otp).trim(),
        new_password: newPassword
      });
    }


    /* =======================================================
       VALIDATION HELPERS
    ======================================================= */
    validateEmail(email) {
      if (!email || typeof email !== "string") return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.trim());
    }

    validateOtp(otp, expectedLength = 6) {
      if (!otp || typeof otp !== "string") return false;
      const digitsOnly = otp.replace(/\D/g, "");
      return digitsOnly.length === Number(expectedLength);
    }

    /* =======================================================
       PREVIEW SIMULATION SUBMISSION HANDLERS
    ======================================================= */
    async handleLogin(credentials, config) {
      const { identifier, password, otp } = credentials;

      if (!identifier || !identifier.trim()) {
        throw new Error("Please enter your email or identifier.");
      }

      if (otp !== undefined) {
        const expectedLen = config.pages?.otp?.length || 6;
        if (!this.validateOtp(otp, expectedLen)) {
          throw new Error(`Please enter all ${expectedLen} digits of your verification code.`);
        }
      } else if (config.pages?.login?.passwordEnabled !== false) {
        if (!password || !password.trim()) {
          throw new Error("Please enter your password.");
        }
      }

      return {
        success: true,
        redirectUrl: config.urls?.redirectUrl || "https://customerwebsite.com/dashboard"
      };
    }

    async handleSignup(userData, config) {
      const { fullName, email, password, confirmPassword } = userData;

      if (config.pages?.signup?.fields?.fullName && (!fullName || !fullName.trim())) {
        throw new Error("Please enter your full name.");
      }

      if (config.pages?.signup?.fields?.email && !this.validateEmail(email)) {
        throw new Error("Please enter a valid email address.");
      }

      if (config.pages?.signup?.fields?.password && (!password || password.length < 6)) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (config.pages?.signup?.fields?.confirmPassword && password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      return {
        success: true,
        redirectUrl: config.urls?.redirectUrl || "https://customerwebsite.com/dashboard"
      };
    }

    async handleForgotPassword(data, config) {
      const { identifier } = data;
      if (!identifier || !identifier.trim()) {
        throw new Error("Please enter your email or phone number.");
      }

      return {
        success: true,
        message: "Password reset link sent to your registered contact."
      };
    }

    async handleOtpVerification(data, config) {
      const { otp } = data;
      const expectedLength = config.pages?.otp?.length || 6;

      if (!this.validateOtp(otp, expectedLength)) {
        throw new Error(`Please enter all ${expectedLength} digits of your verification code.`);
      }

      return {
        success: true,
        redirectUrl: config.urls?.redirectUrl || "https://customerwebsite.com/dashboard"
      };
    }

    async requestResendOtp() {
      return { success: true, message: "Verification code resent." };
    }
  }

  return new AuthController();
});
