/* =========================================================
   AUTHENTICATION PACKAGE - CLIENT APPLICATION CONTROLLER
   File: js/app.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initPackageApp();
});

function initPackageApp() {
  const config = window.AUTH_CONFIG || {};

  // 1. Set Brand & UI Text
  const brandNameEl = document.getElementById("authBrandName");
  if (brandNameEl) brandNameEl.textContent = config.branding?.brandName || "Your Brand";

  const logoImgEl = document.getElementById("authLogoImg");
  if (logoImgEl && config.branding?.logo) logoImgEl.src = config.branding.logo;

  // 2. Set Up Landing Link
  const backToWebBar = document.getElementById("backToWebBar");
  const backToWebLink = document.getElementById("backToWebLink");
  if (backToWebBar && backToWebLink && config.urls?.landingPageUrl) {
    backToWebBar.style.display = "block";
    backToWebLink.href = config.urls.landingPageUrl;
    if (config.urls.backToWebsiteText) {
      backToWebLink.textContent = config.urls.backToWebsiteText;
    }
  }

  // 3. Setup Tab Switches
  setupTabs();

  // 4. Setup Form Submissions
  setupFormHandlers(config);
}

function setupTabs() {
  const pageTabLogin = document.getElementById("pageTabLogin");
  const pageTabSignup = document.getElementById("pageTabSignup");
  const pageTabOtp = document.getElementById("pageTabOtp");

  const showTab = (tabEl) => {
    if (pageTabLogin) pageTabLogin.style.display = "none";
    if (pageTabSignup) pageTabSignup.style.display = "none";
    if (pageTabOtp) pageTabOtp.style.display = "none";
    if (tabEl) tabEl.style.display = "block";
  };

  document.getElementById("switchToSignupBtn")?.addEventListener("click", (e) => { e.preventDefault(); showTab(pageTabSignup); });
  document.getElementById("switchToLoginFromSignup")?.addEventListener("click", (e) => { e.preventDefault(); showTab(pageTabLogin); });
  document.getElementById("switchToOtpBtn")?.addEventListener("click", (e) => { e.preventDefault(); showTab(pageTabOtp); });
  document.getElementById("switchToLoginFromOtp")?.addEventListener("click", (e) => { e.preventDefault(); showTab(pageTabLogin); });
}

function setupFormHandlers(config) {
  let isSubmitting = false;
  let redirectInProgress = false;
  let lastToastMsg = "";
  let lastToastTime = 0;

  const showToast = (message, type = "info") => {
    if (!message) return;
    const now = Date.now();
    if (message === lastToastMsg && (now - lastToastTime) < 1500) return;
    lastToastMsg = message;
    lastToastTime = now;

    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    const bgColor = type === "error" ? "#ef4444" : type === "success" ? "#10b981" : type === "warning" ? "#f59e0b" : "#3b82f6";
    toast.style.cssText = `padding:12px 18px;border-radius:8px;color:#fff;font-size:14px;font-weight:600;background:${bgColor};box-shadow:0 10px 25px rgba(0,0,0,0.15);`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  };

  const executeRedirect = (targetUrl, successMsg = "Authentication completed successfully.") => {
    const service = window.RedirectService || window.redirectService;
    const baseRedirect = config.redirect || {};
    const redirectConfig = Object.assign({}, baseRedirect, {
      redirectUrl: targetUrl || baseRedirect.redirectUrl || config.urls?.redirectUrl || "/dashboard",
      successMessage: successMsg || baseRedirect.successMessage || "Authentication completed successfully."
    });

    if (service && typeof service.execute === "function") {
      return service.execute(redirectConfig);
    }

    if (redirectInProgress) return;
    redirectInProgress = true;
    const url = redirectConfig.redirectUrl;
    showToast(successMsg, "success");
    setTimeout(() => {
      window.location.assign(url);
    }, redirectConfig.delay || 300);
  };

  // Delivery Method Buttons (Email, SMS, WhatsApp)
  document.querySelectorAll("[data-otp-delivery]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("OTP request successful. Use 123456 for this demo.", "info");
    });
  });

  // Login Form Handler
  document.getElementById("authLoginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const identifier = document.getElementById("loginIdentifier")?.value?.trim();
      const password = document.getElementById("loginPassword")?.value;

      if (!identifier || !password) {
        showToast("Please enter both identifier and password.", "error");
        return;
      }

      const res = await window.AuthApiClient.login({ identifier, password });
      if (res && res.success) {
        executeRedirect(res.redirect_url, "Login successful.");
      } else {
        showToast(res.message || "Invalid credentials.", "error");
      }
    } catch (err) {
      showToast(err.message || "Login failed.", "error");
    } finally {
      isSubmitting = false;
    }
  });

  // Signup Form Handler
  document.getElementById("authSignupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const fullName = document.getElementById("signupName")?.value?.trim();
      const username = document.getElementById("signupUsername")?.value?.trim();
      const email = document.getElementById("signupEmail")?.value?.trim();
      const password = document.getElementById("signupPassword")?.value;

      // Validate Registration Password Policy
      if (window.AuthValidator && typeof window.AuthValidator.validatePasswordPolicy === "function") {
        const validation = window.AuthValidator.validatePasswordPolicy(password, config.passwordPolicy || {}, { username, email });
        if (!validation.valid) {
          showToast(validation.message, "error");
          return;
        }
      }

      const res = await window.AuthApiClient.register({ full_name: fullName, username, email, password });
      if (res && res.success) {
        executeRedirect(res.redirect_url, "Account created successfully.");
      } else {
        showToast(res.message || "Registration failed.", "error");
      }
    } catch (err) {
      showToast(err.message || "Registration failed.", "error");
    } finally {
      isSubmitting = false;
    }
  });

  // OTP Form Handler
  document.getElementById("authOtpForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const identifier = document.getElementById("otpIdentifier")?.value?.trim() || "user";
      const otpInputEl = document.getElementById("otpCodeInput");
      let otp = otpInputEl ? otpInputEl.value?.trim() : "";

      if (!otp) {
        const boxes = document.querySelectorAll(".otp-digit-box");
        if (boxes && boxes.length > 0) {
          otp = Array.from(boxes).map(b => b.value || "").join("");
        }
      }

      const res = await window.AuthApiClient.verifyOtp(identifier, otp, "login");
      if (res && res.success) {
        executeRedirect(res.redirect_url, "OTP verified successfully.");
      } else {
        showToast(res.message || "Invalid OTP. Please try again.", "error");
      }
    } catch (err) {
      showToast(err.message || "Invalid OTP. Please try again.", "error");
    } finally {
      isSubmitting = false;
    }
  });
}
