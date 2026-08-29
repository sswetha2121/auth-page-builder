/* =========================================================
   AUTHENTICATION PACKAGE - FORM & PASSWORD POLICY VALIDATOR
   File: js/validation.js
========================================================= */

(function (root) {
  class AuthValidator {
    validateEmail(email) {
      if (!email || typeof email !== "string") return false;
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email.trim());
    }

    validatePasswordPolicy(password, policy = {}, userData = {}) {
      const minLen = Number(policy.minLength) || 6;
      const minNumbers = Number(policy.minNumbers) || 1;
      const minSpecial = Number(policy.minSpecialChars) || 1;
      const reqUpper = policy.requireUppercase !== false;
      const reqLower = policy.requireLowercase !== false;
      const reqNumber = policy.requireNumber !== false && policy.requireNumbers !== false;
      const reqSpecial = policy.requireSpecialChar !== false && policy.requireSpecialChars !== false;

      if (!password || password.length < minLen) {
        return { valid: false, message: `Password must be at least ${minLen} characters long.` };
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
        const specialMatches = password.match(/[^A-Za-z0-9]/g) || [];
        if (specialMatches.length < minSpecial) {
          const specText = minSpecial > 1 ? `at least ${minSpecial} special characters` : "at least one special character";
          return { valid: false, message: `Password must contain ${specText}.` };
        }
      }

      if (policy.preventUsernameInPassword && userData.username) {
        if (password.toLowerCase().includes(userData.username.toLowerCase())) {
          return { valid: false, message: "Password cannot contain your username." };
        }
      }

      return { valid: true, message: "Password meets all policy requirements." };
    }
  }

  root.AuthValidator = new AuthValidator();
})(typeof window !== "undefined" ? window : this);
