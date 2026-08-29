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
    /* =======================================================
       USER AUTHENTICATION (BACKEND API + DEMO FALLBACK)
    ======================================================= */
    async registerUser(userData) {
      try {
        const sessionId = this.client.getBuilderSessionId ? this.client.getBuilderSessionId() : null;
        const payload = {
          ...userData,
          builder_session_id: sessionId
        };
        const response = await this.client.post("/auth/register", payload);
        if (response && response.token) {
          this.client.setAuthToken(response.token);
          this.currentUser = response.user;
          const configApi = typeof window !== "undefined" ? window.ConfigurationsApi : globalThis.ConfigurationsApi;
          if (configApi && typeof configApi.getCurrentConfiguration === "function") {
            configApi.getCurrentConfiguration().then(res => {
              if (res && res.configuration) {
                configApi.activeConfigId = res.configuration.id;
                configApi.activeConfigName = res.configuration.configuration_name;
              }
            }).catch(() => {});
          }
        }
        return response;
      } catch (err) {
        if (err.isBackendUnavailable || err.status === 503 || (err.message && err.message.includes("Backend unavailable"))) {
          console.warn("[Auth] Django backend unavailable. Using static demo mode for registration.");
          const redirectUrl = userData.redirect_url || (typeof window !== "undefined" && window.state ? window.state.get("urls.redirectUrl") : null) || "https://customerwebsite.com/dashboard";
          return {
            success: true,
            demoMode: true,
            token: "demo_jwt_token_123456",
            user: { username: userData.username || "demo_user", email: userData.email || "demo@example.com", full_name: userData.full_name || "Demo User" },
            redirect_url: redirectUrl,
            message: "Account created successfully."
          };
        }
        throw err;
      }
    }

    async loginUser(credentials) {
      try {
        const sessionId = this.client.getBuilderSessionId ? this.client.getBuilderSessionId() : null;
        const payload = {
          ...credentials,
          builder_session_id: sessionId
        };
        const response = await this.client.post("/auth/login", payload);
        if (response && response.token) {
          this.client.setAuthToken(response.token);
          this.currentUser = response.user;
          const configApi = typeof window !== "undefined" ? window.ConfigurationsApi : globalThis.ConfigurationsApi;
          if (configApi && typeof configApi.getCurrentConfiguration === "function") {
            configApi.getCurrentConfiguration().then(res => {
              if (res && res.configuration) {
                configApi.activeConfigId = res.configuration.id;
                configApi.activeConfigName = res.configuration.configuration_name;
              }
            }).catch(() => {});
          }
        }
        return response;
      } catch (err) {
        if (err.isBackendUnavailable || err.status === 503 || (err.message && err.message.includes("Backend unavailable"))) {
          console.warn("[Auth] Django backend unavailable. Using static demo mode for login.");
          const redirectUrl = credentials.redirect_url || (typeof window !== "undefined" && window.state ? window.state.get("urls.redirectUrl") : null) || "https://customerwebsite.com/dashboard";
          return {
            success: true,
            demoMode: true,
            token: "demo_jwt_token_123456",
            user: { username: credentials.identifier || "demo_user", email: credentials.identifier || "demo@example.com" },
            redirect_url: redirectUrl,
            message: "Login successful."
          };
        }
        throw err;
      }
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

    validateEmail(email) {
      if (!email || typeof email !== "string") return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.trim());
    }

    validatePasswordPolicy(password, policy = {}, userData = {}) {
      const minLen = Number(policy.minLength) || 6;
      const maxLen = Number(policy.maxLength) || 128;
      const minNumbers = Number(policy.minNumbers) || 1;
      const minSpecial = Number(policy.minSpecialChars) || 1;
      const reqUpper = policy.requireUppercase !== false;
      const reqLower = policy.requireLowercase !== false;
      const reqNumber = policy.requireNumber !== false && policy.requireNumbers !== false;
      const reqSpecial = policy.requireSpecialChar !== false && policy.requireSpecialChars !== false;
      const allowedSpecials = policy.allowedSpecialChars || "!@#$%^&*()_+-=[]{}|;:,.<>?";

      if (!password || password.length < minLen) {
        return { valid: false, message: `Password must be at least ${minLen} characters long.` };
      }

      if (password.length > maxLen) {
        return { valid: false, message: `Password cannot exceed ${maxLen} characters.` };
      }

      if (reqUpper && !/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter." };
      }

      if (reqLower && !/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter." };
      }

      if (reqNumber) {
        const numMatches = password.match(/[0-9]/g) || [];
        if (numMatches.length < minNumbers) {
          const numText = minNumbers > 1 ? `at least ${minNumbers} numeric digits (0-9)` : "at least one numeric digit (0-9)";
          return { valid: false, message: `Password must contain ${numText}.` };
        }
      }

      if (reqSpecial) {
        const escapedSpecials = allowedSpecials.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const specialRegex = new RegExp(`[${escapedSpecials}]`, "g");
        const specialMatches = password.match(specialRegex) || [];
        if (specialMatches.length < minSpecial) {
          const specText = minSpecial > 1 ? `at least ${minSpecial} special characters` : "at least one special character";
          return { valid: false, message: `Password must contain ${specText}.` };
        }
      }

      if (policy.preventUsername && userData.username) {
        if (password.toLowerCase().includes(userData.username.toLowerCase())) {
          return { valid: false, message: "Password cannot contain your username." };
        }
      }

      if (policy.preventEmail && userData.email) {
        const emailPrefix = userData.email.split("@")[0];
        if (emailPrefix && emailPrefix.length >= 3 && password.toLowerCase().includes(emailPrefix.toLowerCase())) {
          return { valid: false, message: "Password cannot contain your email username." };
        }
      }

      return { valid: true, message: "Password meets all policy requirements." };
    }


    /* =======================================================
       STATIC OTP (123456) & EMAIL OTP FALLBACK API
    ======================================================= */
    async sendEmailOtp(identifier, purpose = "login") {
      try {
        return await this.client.post("/otp/send-email", {
          identifier: identifier.trim(),
          purpose
        });
      } catch (err) {
        console.warn("[Auth] Django backend unavailable. Static OTP 123456 active.");
        return {
          success: true,
          demoMode: true,
          otp: "123456",
          message: "OTP request successful. Use 123456 for this demo."
        };
      }
    }

    async verifyOtp(identifier, otp, purpose = "login", configId = null) {
      const cleanOtp = String(otp || "").trim();
      try {
        const response = await this.client.post("/otp/verify", {
          identifier: String(identifier || "").trim(),
          otp: cleanOtp,
          purpose,
          configuration_id: configId
        });
        if (response && response.token) {
          this.client.setAuthToken(response.token);
          this.currentUser = response.user;
        }
        return response;
      } catch (err) {
        if (err.isBackendUnavailable || err.status === 503 || (err.message && err.message.includes("Backend unavailable"))) {
          console.warn("[Auth] Django backend unavailable. Validating via static OTP 123456.");
          if (cleanOtp === "123456") {
            const redirectUrl = (typeof window !== "undefined" && window.state ? window.state.get("urls.redirectUrl") : null) || "https://customerwebsite.com/dashboard";
            return {
              success: true,
              demoMode: true,
              token: "demo_jwt_token_123456",
              user: { username: identifier || "demo_user" },
              redirect_url: redirectUrl,
              message: "OTP verified successfully."
            };
          } else {
            throw new Error("Invalid OTP. Please try again.");
          }
        }
        throw err;
      }
    }

    async requestPasswordReset(identifier) {
      try {
        return await this.client.post("/password-reset/request", {
          identifier: String(identifier || "").trim()
        });
      } catch (err) {
        return {
          success: true,
          demoMode: true,
          message: "Password reset link sent to your registered contact."
        };
      }
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
