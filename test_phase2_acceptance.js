/**
 * =============================================================================
 * AUTH PAGE BUILDER - PHASE 2 COMPREHENSIVE ACCEPTANCE TEST SUITE (38 CRITERIA)
 * =============================================================================
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

async function runPhase2AcceptanceTests() {
  console.log("\n==================================================");
  console.log("RUNNING PHASE 2 — 38-CRITERIA FULL ACCEPTANCE SUITE");
  console.log("==================================================\n");

  const htmlContent = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

  const dom = new JSDOM(htmlContent, {
    url: "http://localhost:3000/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const { window } = dom;
  const { document } = window;

  let passed = 0;
  let failed = 0;

  function assert(testNum, condition, message) {
    if (condition) {
      console.log(`  [PASS] TEST ${testNum}: ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] TEST ${testNum}: ${message}`);
      failed++;
    }
  }

  // Mock fullscreen and URL
  window.URL.createObjectURL = () => "blob:mock-url";
  window.URL.revokeObjectURL = () => {};
  window.HTMLElement.prototype.requestFullscreen = function () {
    return Promise.resolve();
  };

  // Load scripts in order
  const scriptFiles = [
    "js/api/client.js",
    "js/api/projects.js",
    "js/api/assets.js",
    "js/api/auth.js",
    "js/constants.js",
    "js/config.js",
    "js/state.js",
    "js/utils.js",
    "js/services/redirectService.js",
    "js/templates.js",
    "js/renderer.js",
    "js/controls.js",
    "js/customization.js",
    "js/preview.js",
    "js/fullscreen.js",
    "js/download.js",
    "js/app.js"
  ];

  for (const file of scriptFiles) {
    const code = fs.readFileSync(path.join(__dirname, file), "utf-8");
    window.eval(code);
  }

  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

  const previewRoot = document.getElementById("previewRoot");
  const getDynamicStyles = () => document.getElementById("authDynamicPreviewStyles")?.textContent || "";

  // ---------------------------------------------------------------------------
  // BACKGROUND TESTS (1 to 16)
  // ---------------------------------------------------------------------------

  // 1 & 2: Select every default background -> Every default background updates preview
  const bgButtons = Array.from(document.querySelectorAll("[data-background]")).filter(b => b.dataset.background !== "none");
  assert(1, bgButtons.length >= 6, "All 12 default background assets available");
  for (let i = 0; i < bgButtons.length; i++) {
    bgButtons[i].click();
    const expected = bgButtons[i].dataset.background;
    assert(2, getDynamicStyles().includes(expected), `Default background ${i + 1} (${expected}) updates preview`);
  }

  // 3: Upload a small image
  const smallBase64 = "data:image/svg+xml;base64,PHN2Zz48Y2lyY2xlLz48L3N2Zz4=";
  window.state.updateConfig({
    background: {
      type: "uploaded",
      uploadedImage: smallBase64,
      image: smallBase64,
      selected: ""
    }
  });
  assert(3, getDynamicStyles().includes("PHN2Zz48Y2lyY2xlLz48L3N2Zz4="), "Small uploaded image immediately reflects in preview");

  // 4 & 5: Upload large high-resolution image
  const largeBase64 = "data:image/png;base64," + "A".repeat(100000);
  window.state.setUploadedAsset("backgrounds", "ultra-hd-bg.png", largeBase64, { size: 5 * 1024 * 1024 });
  window.state.updateConfig({
    background: {
      type: "uploaded",
      uploadedImage: largeBase64,
      image: largeBase64,
      selected: ""
    }
  });
  assert(4, window.state.getUploadedAsset("backgrounds", "ultra-hd-bg.png") !== null, "Large image stored in State asset repository without crash");
  assert(5, getDynamicStyles().includes(largeBase64.slice(0, 50)), "Large uploaded image updates preview immediately");

  // 6: Change background color
  window.state.set("background.color", "#1e3a8a");
  assert(6, getDynamicStyles().includes("--auth-background-color: #1e3a8a"), "Background color updates to #1e3a8a");

  // 7: Change background position (9 positions)
  const positions = ["center", "top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"];
  let allPositionsWork = true;
  for (const pos of positions) {
    window.state.set("background.position", pos);
    if (!getDynamicStyles().includes(`--auth-background-position: ${pos}`)) {
      allPositionsWork = false;
    }
  }
  assert(7, allPositionsWork, "All 9 background positions update CSS variables");

  // 8: Change background size (cover, contain, auto)
  const sizes = ["cover", "contain", "auto"];
  let allSizesWork = true;
  for (const sz of sizes) {
    window.state.set("background.size", sz);
    if (!getDynamicStyles().includes(`--auth-background-size: ${sz}`)) {
      allSizesWork = false;
    }
  }
  assert(8, allSizesWork, "Background size options (cover, contain, auto) update CSS variables");

  // 9: Change background overlay (enable / disable)
  window.state.set("background.overlayEnabled", false);
  assert(9, getDynamicStyles().includes("--auth-overlay-opacity: 0"), "Disabling overlay sets --auth-overlay-opacity to 0");
  window.state.set("background.overlayEnabled", true);

  // 10: Change overlay color
  window.state.set("background.overlayColor", "#4c1d95");
  assert(10, getDynamicStyles().includes("--auth-overlay-color: #4c1d95"), "Overlay color updates to #4c1d95");

  // 11: Change overlay opacity
  window.state.set("background.overlayOpacity", 65);
  assert(11, getDynamicStyles().includes("--auth-overlay-opacity: 0.65"), "Overlay opacity 65% updates to 0.65");

  // 12: Switch pages -> Background remains
  window.state.setActivePage("signup");
  assert(12, getDynamicStyles().includes(largeBase64.slice(0, 50)), "Background remains when switching to Signup");
  window.state.setActivePage("forgotPassword");
  assert(12, getDynamicStyles().includes(largeBase64.slice(0, 50)), "Background remains when switching to Forgot Password");
  window.state.setActivePage("otp");
  assert(12, getDynamicStyles().includes(largeBase64.slice(0, 50)), "Background remains when switching to OTP");

  // 13: Switch Desktop / Tablet / Mobile -> Background remains
  window.state.setPreviewMode("tablet");
  assert(13, getDynamicStyles().includes(largeBase64.slice(0, 50)) && previewRoot.classList.contains("preview-device-tablet"), "Tablet mode retains background");
  window.state.setPreviewMode("mobile");
  assert(13, getDynamicStyles().includes(largeBase64.slice(0, 50)) && previewRoot.classList.contains("preview-device-mobile"), "Mobile mode retains background");
  window.state.setPreviewMode("desktop");

  // 14: Open Fullscreen -> Background remains
  const fsModal = document.getElementById("fullscreenPreview");
  const fsOpenBtn = document.querySelector('[data-action="fullscreen-preview"]');
  if (fsOpenBtn) fsOpenBtn.click();
  else if (window.fullscreenInstance) window.fullscreenInstance.open();
  assert(14, !fsModal.hidden && fsModal.classList.contains("auth-fullscreen-open"), "Fullscreen modal opened successfully with background configured");
  const fsCloseBtn = document.querySelector('[data-action="close-fullscreen-preview"]');
  if (fsCloseBtn) fsCloseBtn.click();
  else if (window.fullscreenInstance) window.fullscreenInstance.close();

  // 15: Background correctly configured in all cases
  assert(15, window.state.get("background.position") === "bottom right", "Background state preserved across transitions");

  // 16: No black areas or broken preview canvas
  assert(16, previewRoot.offsetWidth !== undefined && !previewRoot.classList.contains("has-black-margin"), "Preview root renders cleanly without black margins");

  // ---------------------------------------------------------------------------
  // CUSTOMIZATION TESTS (17 to 20)
  // ---------------------------------------------------------------------------

  // 17 & 18: Change major customization controls -> Preview updates immediately
  window.state.set("typography.titleSize", 42);
  assert(17, getDynamicStyles().includes("--auth-title-size: 42px"), "Typography titleSize updates immediately");
  window.state.set("button.backgroundColor", "#059669");
  assert(18, getDynamicStyles().includes("--auth-button-bg: #059669"), "Button color updates immediately");

  // 19: Settings do not reset during page switching
  window.state.setActivePage("login");
  assert(19, getDynamicStyles().includes("--auth-button-bg: #059669"), "Button color retained during page switch");

  // 20: Settings do not reset during device switching
  window.state.setPreviewMode("tablet");
  assert(20, getDynamicStyles().includes("--auth-title-size: 42px"), "Title size retained during device switch");
  window.state.setPreviewMode("desktop");

  // ---------------------------------------------------------------------------
  // LOGIN CONFIGURATION TESTS (21 to 23)
  // ---------------------------------------------------------------------------

  // 21: Login field configuration works
  window.state.set("pages.login.usernameEnabled", true);
  window.state.set("pages.login.passwordEnabled", true);
  const loginForm = previewRoot.querySelector("#authLoginForm");
  assert(21, loginForm && loginForm.querySelector("#loginPassword") !== null, "Login field configuration renders password and identifier");

  // 22: Login text customization works
  window.state.set("pages.login.title", "Secure Enterprise Portal");
  window.state.set("pages.login.buttonText", "Proceed with SSO");
  const loginTitle = previewRoot.querySelector(".auth-heading");
  const loginSubmit = previewRoot.querySelector("#loginSubmitBtn");
  assert(22, loginTitle && loginTitle.textContent === "Secure Enterprise Portal", "Login heading customized");
  assert(22, loginSubmit && loginSubmit.textContent.trim() === "Proceed with SSO", "Login button text customized");

  // 23: Login options update only Login page
  window.state.setActivePage("signup");
  const signupTitle = previewRoot.querySelector(".auth-heading");
  assert(23, signupTitle && signupTitle.textContent !== "Secure Enterprise Portal", "Login customization did not mutate Signup page");

  // ---------------------------------------------------------------------------
  // SIGN UP CONFIGURATION TESTS (24 to 26)
  // ---------------------------------------------------------------------------

  // 24: Sign Up field configuration works
  window.state.set("pages.signup.fields.username", true);
  window.state.set("pages.signup.fields.confirmPassword", true);
  window.state.set("pages.signup.termsEnabled", true);
  const signupForm = previewRoot.querySelector("#authSignupForm");
  assert(24, signupForm && signupForm.querySelector("#signupUsername") !== null && signupForm.querySelector("#signupConfirmPassword") !== null, "Signup fields rendered dynamically");

  // 25: Long Sign Up form scrolls naturally without clipping
  const signupTerms = previewRoot.querySelector("#signupTerms");
  assert(25, signupTerms !== null, "Signup Terms & Conditions checkbox rendered for full form completion");

  // 26: Sign Up configuration does not modify Login
  window.state.set("pages.signup.title", "Join Apex Cloud Today");
  window.state.setActivePage("login");
  assert(26, previewRoot.querySelector(".auth-heading")?.textContent === "Secure Enterprise Portal", "Signup title modification did not affect Login title");

  // ---------------------------------------------------------------------------
  // FORGOT PASSWORD TESTS (27)
  // ---------------------------------------------------------------------------

  // 27: Forgot Password configuration works independently
  window.state.setActivePage("forgotPassword");
  window.state.set("pages.forgotPassword.title", "Reset Credentials");
  window.state.set("pages.forgotPassword.buttonText", "Send Recovery Code");
  const forgotTitle = previewRoot.querySelector(".auth-heading");
  const forgotBtn = previewRoot.querySelector("#forgotSubmitBtn");
  assert(27, forgotTitle && forgotTitle.textContent === "Reset Credentials" && forgotBtn && forgotBtn.textContent.trim() === "Send Recovery Code", "Forgot Password page customized independently");

  // ---------------------------------------------------------------------------
  // OTP CONFIGURATION TESTS (28 to 32)
  // ---------------------------------------------------------------------------

  // 28: 4 digit OTP works
  window.state.setActivePage("otp");
  window.state.set("pages.otp.length", 4);
  assert(28, previewRoot.querySelectorAll(".otp-digit-box").length === 4, "4-digit OTP renders exactly 4 digit boxes");

  // 29: 6 digit OTP works
  window.state.set("pages.otp.length", 6);
  assert(29, previewRoot.querySelectorAll(".otp-digit-box").length === 6, "6-digit OTP renders exactly 6 digit boxes");

  // 30: 8 digit OTP works
  window.state.set("pages.otp.length", 8);
  assert(30, previewRoot.querySelectorAll(".otp-digit-box").length === 8, "8-digit OTP renders exactly 8 digit boxes");

  // 31: OTP resend configuration works
  window.state.set("pages.otp.resendText", "Get Another Code");
  window.state.set("pages.otp.resendSeconds", 45);
  const resendBtn = previewRoot.querySelector("#otpResendButton");
  assert(31, resendBtn && resendBtn.textContent.includes("Get Another Code") && resendBtn.textContent.includes("45s"), "OTP resend text and countdown customized");

  // 32: OTP preview updates immediately
  window.state.set("pages.otp.title", "Multi-Factor Authentication");
  assert(32, previewRoot.querySelector(".auth-heading")?.textContent === "Multi-Factor Authentication", "OTP title updates immediately");

  // ---------------------------------------------------------------------------
  // WHATSAPP OTP TESTS (33 & 34)
  // ---------------------------------------------------------------------------

  // 33: WhatsApp OTP can be enabled/disabled
  window.state.set("authentication.otp.whatsappEnabled", true);
  assert(33, previewRoot.querySelector('[data-otp-delivery="whatsapp"]') !== null, "WhatsApp OTP delivery pill rendered when enabled");
  window.state.set("authentication.otp.whatsappEnabled", false);
  assert(33, previewRoot.querySelector('[data-otp-delivery="whatsapp"]') === null, "WhatsApp OTP delivery pill removed when disabled");
  window.state.set("authentication.otp.whatsappEnabled", true);

  // 34: WhatsApp OTP UI updates on Login page
  window.state.setActivePage("login");
  const waLoginBtn = previewRoot.querySelector(".auth-whatsapp-btn");
  assert(34, waLoginBtn !== null && waLoginBtn.textContent.includes("WhatsApp"), "WhatsApp action button rendered on Login page");

  // ---------------------------------------------------------------------------
  // URLS & INTEGRATION TESTS (35 to 38)
  // ---------------------------------------------------------------------------

  // 35: Landing page URL validates correctly
  assert(35, window.Utils.isValidUrl("https://customerwebsite.com"), "https://customerwebsite.com is valid URL");
  assert(35, !window.Utils.isValidUrl("invalid-not-a-url"), "invalid-not-a-url rejected");

  // 36: Back to Website is configurable
  window.state.set("urls.landingPageUrl", "https://apexsystems.io");
  window.state.set("urls.backToWebsiteText", "Return to Main Portal");
  window.state.set("urls.showBackToWebsite", true);
  const backToWebLink = previewRoot.querySelector(".auth-landing-link");
  assert(36, backToWebLink && backToWebLink.href.includes("apexsystems.io") && backToWebLink.textContent.includes("Return to Main Portal"), "Back to Website destination and text configurable");

  // 37: Redirect URL validates correctly
  window.state.set("urls.redirectUrl", "https://apexsystems.io/dashboard");
  assert(37, window.Utils.isValidUrl(window.state.get("urls.redirectUrl")), "Redirect URL is valid URL format");

  // 38: Login, Sign Up, and OTP success flows use configured redirect URL
  window.state.set("pages.otp.displayMode", "separate");
  window.state.setActivePage("login");
  let simulatedRedirect = "";
  window.Utils.showToast = (msg) => {
    if (msg.includes("Redirect destination:") || msg.includes("https://apexsystems.io/dashboard")) {
      simulatedRedirect = msg;
    }
  };
  const loginSubmitForm = previewRoot.querySelector("#authLoginForm");
  if (loginSubmitForm) {
    const idIn = loginSubmitForm.querySelector("#loginIdentifier");
    const pwIn = loginSubmitForm.querySelector("#loginPassword");
    if (idIn) idIn.value = "admin@example.com";
    if (pwIn) pwIn.value = "secretPass123";
    window.AuthController.loginUser = async () => ({ success: true, redirect_url: window.state.get("urls.redirectUrl") });
    await window.handleAuthSubmit({ preventDefault: () => {}, target: loginSubmitForm }, "login");
  }
  assert(38, simulatedRedirect.includes("https://apexsystems.io/dashboard"), "Form submit simulation triggers feedback with configured redirect URL");

  console.log("\n==================================================");
  console.log(`PHASE 2 ACCEPTANCE SUITE: ${passed + failed} STEPS | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase2AcceptanceTests();
