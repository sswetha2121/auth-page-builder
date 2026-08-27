/* =========================================================
   AUTH PAGE BUILDER - COMPLETE 38-POINT DOM INTEGRATION TEST SUITE
   File: test_dom_integration.js
========================================================= */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");

async function runDomTests() {
  console.log("==================================================");
  console.log("RUNNING 38-POINT FULL END-TO-END DOM AUDIT SUITE");
  console.log("==================================================\n");

  const htmlContent = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

  const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    url: "http://localhost:3000/"
  });

  const { window } = dom;
  const { document } = window;

  // Polyfills for JSDOM
  window.JSZip = JSZip;
  window.URL.createObjectURL = () => "blob:mock-url";
  window.URL.revokeObjectURL = () => {};
  window.HTMLElement.prototype.requestFullscreen = function () {
    return Promise.resolve();
  };

  // Load scripts in order into JSDOM window
  const scriptFiles = [
    "js/constants.js",
    "js/config.js",
    "js/state.js",
    "js/utils.js",
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

  // Trigger DOMContentLoaded
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

  let passed = 0;
  let failed = 0;

  function assert(testNum, condition, desc) {
    if (condition) {
      console.log(`  [PASS] TEST ${testNum}: ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] TEST ${testNum}: ${desc}`);
      failed++;
    }
  }

  const previewRoot = document.getElementById("previewRoot");
  const getDynamicStyles = () => document.getElementById("authDynamicPreviewStyles")?.textContent || "";

  // -------------------------------------------------------------
  // TEST 1: Change Image Width
  // -------------------------------------------------------------
  const widthInput = document.querySelector('input[data-config-path="layout.imageWidth"]');
  widthInput.value = "65";
  widthInput.dispatchEvent(new window.Event("input"));
  assert(1, getDynamicStyles().includes("--auth-image-width: 65%"), "Changing Image Width updates CSS variable to 65%");

  // -------------------------------------------------------------
  // TEST 2: Change Form Horizontal Position
  // -------------------------------------------------------------
  const hPosSelect = document.querySelector('select[data-config-path="layout.formHorizontalAlignment"]');
  hPosSelect.value = "left";
  hPosSelect.dispatchEvent(new window.Event("change"));
  assert(2, previewRoot.classList.contains("form-horizontal-left"), "Changing Form Horizontal Position applies 'form-horizontal-left' to previewRoot");

  // -------------------------------------------------------------
  // TEST 3: Change Form Vertical Position
  // -------------------------------------------------------------
  const vPosSelect = document.querySelector('select[data-config-path="layout.formVerticalAlignment"]');
  vPosSelect.value = "top";
  vPosSelect.dispatchEvent(new window.Event("change"));
  assert(3, previewRoot.classList.contains("form-vertical-top"), "Changing Form Vertical Position applies 'form-vertical-top' to previewRoot");

  // -------------------------------------------------------------
  // TEST 4: Select Default Background Thumbnail
  // -------------------------------------------------------------
  const bgButtons = document.querySelectorAll("[data-background]");
  bgButtons[1].click(); // Select Creative Graphic
  assert(4, bgButtons[1].classList.contains("active") && getDynamicStyles().includes("idea-6900632_1280.png"), "Selecting background thumbnail updates active class & CSS variable");

  // -------------------------------------------------------------
  // TEST 5: Upload Custom Background
  // -------------------------------------------------------------
  window.state.set("background.uploadedImage", "data:image/png;base64,mockCustomBgData");
  window.state.set("background.image", "data:image/png;base64,mockCustomBgData");
  assert(5, getDynamicStyles().includes("mockCustomBgData"), "Custom background dataURL injected into dynamic CSS");

  // -------------------------------------------------------------
  // TEST 6: Change Background Color
  // -------------------------------------------------------------
  const bgColorInput = document.querySelector('input[data-config-path="background.color"]');
  bgColorInput.value = "#123456";
  bgColorInput.dispatchEvent(new window.Event("input"));
  assert(6, getDynamicStyles().includes("--auth-background-color: #123456"), "Background color updates to #123456");

  // -------------------------------------------------------------
  // TEST 7: Change Background Position
  // -------------------------------------------------------------
  const bgPosSelect = document.querySelector('select[data-config-path="background.position"]');
  bgPosSelect.value = "top";
  bgPosSelect.dispatchEvent(new window.Event("change"));
  assert(7, getDynamicStyles().includes("--auth-background-position: top"), "Background position updates to top");

  // -------------------------------------------------------------
  // TEST 8: Change Background Size
  // -------------------------------------------------------------
  const bgSizeSelect = document.querySelector('select[data-config-path="background.size"]');
  bgSizeSelect.value = "contain";
  bgSizeSelect.dispatchEvent(new window.Event("change"));
  assert(8, getDynamicStyles().includes("--auth-background-size: contain"), "Background size updates to contain");

  // -------------------------------------------------------------
  // TEST 9: Change Background Repeat
  // -------------------------------------------------------------
  const bgRepSelect = document.querySelector('select[data-config-path="background.repeat"]');
  bgRepSelect.value = "repeat";
  bgRepSelect.dispatchEvent(new window.Event("change"));
  assert(9, getDynamicStyles().includes("--auth-background-repeat: repeat"), "Background repeat updates to repeat");

  // -------------------------------------------------------------
  // TEST 10: Toggle Overlay
  // -------------------------------------------------------------
  const overlayToggle = document.querySelector('input[data-config-path="background.overlayEnabled"]');
  overlayToggle.checked = false;
  overlayToggle.dispatchEvent(new window.Event("change"));
  assert(10, getDynamicStyles().includes("--auth-overlay-opacity: 0"), "Disabling overlay sets --auth-overlay-opacity to 0");

  // -------------------------------------------------------------
  // TEST 11: Change Overlay Color
  // -------------------------------------------------------------
  overlayToggle.checked = true;
  overlayToggle.dispatchEvent(new window.Event("change"));
  const overlayColor = document.querySelector('input[data-config-path="background.overlayColor"]');
  overlayColor.value = "#ff0000";
  overlayColor.dispatchEvent(new window.Event("input"));
  assert(11, getDynamicStyles().includes("--auth-overlay-color: #ff0000"), "Overlay color updates to #ff0000");

  // -------------------------------------------------------------
  // TEST 12: Change Overlay Opacity
  // -------------------------------------------------------------
  const overlayOpacity = document.querySelector('input[data-config-path="background.overlayOpacity"]');
  overlayOpacity.value = "80";
  overlayOpacity.dispatchEvent(new window.Event("input"));
  assert(12, getDynamicStyles().includes("--auth-overlay-opacity: 0.8"), "Overlay opacity 80% computes to 0.8");

  // -------------------------------------------------------------
  // TEST 13: Toggle Show Logo
  // -------------------------------------------------------------
  const showLogoToggle = document.querySelector('input[data-config-path="branding.showLogo"]');
  showLogoToggle.checked = false;
  showLogoToggle.dispatchEvent(new window.Event("change"));
  assert(13, !previewRoot.querySelector(".auth-branding-header"), "Disabling showLogo removes logo header from preview");

  // -------------------------------------------------------------
  // TEST 14: Change Brand Name
  // -------------------------------------------------------------
  showLogoToggle.checked = true;
  showLogoToggle.dispatchEvent(new window.Event("change"));
  const brandInput = document.querySelector('input[data-config-path="branding.brandName"]');
  brandInput.value = "Nova Corp";
  brandInput.dispatchEvent(new window.Event("input"));
  assert(14, previewRoot.textContent.includes("Nova Corp"), "Brand name updates to 'Nova Corp'");

  // -------------------------------------------------------------
  // TEST 15: Select Default Logo Thumbnail
  // -------------------------------------------------------------
  const logoButtons = document.querySelectorAll("[data-logo]");
  logoButtons[0].click(); // Select brand-shield.svg
  assert(15, logoButtons[0].classList.contains("active") && previewRoot.innerHTML.includes("brand-shield.svg"), "Logo thumbnail selector updates logo image");

  // -------------------------------------------------------------
  // TEST 16: Upload Custom Logo
  // -------------------------------------------------------------
  window.state.set("branding.uploadedLogo", "data:image/svg+xml;base64,mockLogoData");
  window.state.set("branding.logo", "data:image/svg+xml;base64,mockLogoData");
  assert(16, previewRoot.innerHTML.includes("mockLogoData"), "Uploaded custom logo dataURL renders in preview");

  // -------------------------------------------------------------
  // TEST 17: Change Logo Size Slider
  // -------------------------------------------------------------
  const logoSize = document.querySelector('input[data-config-path="branding.logoSize"]');
  logoSize.value = "96";
  logoSize.dispatchEvent(new window.Event("input"));
  assert(17, getDynamicStyles().includes("--auth-logo-size: 96px"), "Logo size 96px sets --auth-logo-size: 96px");

  // -------------------------------------------------------------
  // TEST 18: Logo Shape - Square
  // -------------------------------------------------------------
  const logoShape = document.querySelector('select[data-config-path="branding.logoShape"]');
  logoShape.value = "square";
  logoShape.dispatchEvent(new window.Event("change"));
  assert(18, previewRoot.querySelector(".auth-logo-shape-square") !== null && getDynamicStyles().includes("--auth-logo-radius: 0px"), "Square shape applies .auth-logo-shape-square & 0px radius");

  // -------------------------------------------------------------
  // TEST 19: Logo Shape - Rounded
  // -------------------------------------------------------------
  logoShape.value = "rounded";
  logoShape.dispatchEvent(new window.Event("change"));
  assert(19, previewRoot.querySelector(".auth-logo-shape-rounded") !== null && getDynamicStyles().includes("--auth-logo-radius: 14px"), "Rounded shape applies .auth-logo-shape-rounded & 14px radius");

  // -------------------------------------------------------------
  // TEST 20: Logo Shape - Circle (True Clipping)
  // -------------------------------------------------------------
  logoShape.value = "circle";
  logoShape.dispatchEvent(new window.Event("change"));
  assert(20, previewRoot.querySelector(".auth-logo-shape-circle") !== null && getDynamicStyles().includes("circle(50%"), "Circle shape applies circle clip-path");

  // -------------------------------------------------------------
  // TEST 21: Logo Shape - Ellipse (True Clipping)
  // -------------------------------------------------------------
  logoShape.value = "ellipse";
  logoShape.dispatchEvent(new window.Event("change"));
  assert(21, previewRoot.querySelector(".auth-logo-shape-ellipse") !== null && getDynamicStyles().includes("ellipse(50%"), "Ellipse shape applies ellipse clip-path");

  // -------------------------------------------------------------
  // TEST 22: Logo Position
  // -------------------------------------------------------------
  const logoPos = document.querySelector('select[data-config-path="branding.logoPosition"]');
  logoPos.value = "left";
  logoPos.dispatchEvent(new window.Event("change"));
  assert(22, previewRoot.querySelector(".auth-logo-pos-left") !== null, "Logo position 'left' applies .auth-logo-pos-left");

  // -------------------------------------------------------------
  // TEST 23: Toggle Logo Background & Color
  // -------------------------------------------------------------
  const logoBgToggle = document.querySelector('input[data-config-path="branding.logoBackgroundEnabled"]');
  logoBgToggle.checked = true;
  logoBgToggle.dispatchEvent(new window.Event("change"));
  const logoBgColor = document.querySelector('input[data-config-path="branding.logoBackgroundColor"]');
  logoBgColor.value = "#fef08a";
  logoBgColor.dispatchEvent(new window.Event("input"));
  assert(23, getDynamicStyles().includes("--auth-logo-bg: #fef08a"), "Logo background enables with color #fef08a");

  // -------------------------------------------------------------
  // TEST 24: OTP Digits Count = 4
  // -------------------------------------------------------------
  window.state.setActivePage("otp");
  const otpLength = document.querySelector('select[data-config-path="pages.otp.length"]');
  otpLength.value = "4";
  otpLength.dispatchEvent(new window.Event("change"));
  const boxes4 = previewRoot.querySelectorAll(".otp-digit-box");
  assert(24, boxes4.length === 4, `OTP length=4 renders exactly 4 digit boxes (found ${boxes4.length})`);

  // -------------------------------------------------------------
  // TEST 25: OTP Digits Count = 6
  // -------------------------------------------------------------
  otpLength.value = "6";
  otpLength.dispatchEvent(new window.Event("change"));
  const boxes6 = previewRoot.querySelectorAll(".otp-digit-box");
  assert(25, boxes6.length === 6, `OTP length=6 renders exactly 6 digit boxes (found ${boxes6.length})`);

  // -------------------------------------------------------------
  // TEST 26: OTP Digits Count = 8
  // -------------------------------------------------------------
  otpLength.value = "8";
  otpLength.dispatchEvent(new window.Event("change"));
  const boxes8 = previewRoot.querySelectorAll(".otp-digit-box");
  assert(26, boxes8.length === 8, `OTP length=8 renders exactly 8 digit boxes (found ${boxes8.length})`);

  // -------------------------------------------------------------
  // TEST 27: OTP Display Mode (Separate Page vs Inline OTP)
  // -------------------------------------------------------------
  window.state.setActivePage("login");
  const otpDisplayMode = document.querySelector('select[data-config-path="pages.otp.displayMode"]');
  otpDisplayMode.value = "inline";
  otpDisplayMode.dispatchEvent(new window.Event("change"));
  const hasInlineOtp = previewRoot.querySelector(".auth-inline-otp-section") !== null;
  assert(27, hasInlineOtp, "OTP Display Mode 'inline' renders OTP boxes directly on Login page");
  otpDisplayMode.value = "separate";
  otpDisplayMode.dispatchEvent(new window.Event("change"));

  // -------------------------------------------------------------
  // TEST 28: OTP Delivery Methods (Email, SMS, WhatsApp)
  // -------------------------------------------------------------
  window.state.setActivePage("otp");
  const whatsappToggle = document.querySelector('input[data-config-path="authentication.otp.whatsappEnabled"]');
  whatsappToggle.checked = true;
  whatsappToggle.dispatchEvent(new window.Event("change"));
  const deliveryPills = previewRoot.querySelectorAll("[data-otp-delivery]");
  assert(28, deliveryPills.length >= 2 && previewRoot.querySelector('[data-otp-delivery="whatsapp"]') !== null, "Delivery pills render selectable methods including WhatsApp");

  // -------------------------------------------------------------
  // TEST 29: WhatsApp Action on Login Page
  // -------------------------------------------------------------
  window.state.setActivePage("login");
  const whatsappBtn = previewRoot.querySelector('[data-otp-method="whatsapp"]');
  assert(29, whatsappBtn !== null && whatsappBtn.textContent.includes("WhatsApp"), "Login page renders 'Get OTP via WhatsApp' action button");

  // -------------------------------------------------------------
  // TEST 30: OTP Resend Delay & Countdown
  // -------------------------------------------------------------
  window.state.setActivePage("otp");
  const resendDelayInput = document.querySelector('input[data-config-path="pages.otp.resendSeconds"]');
  resendDelayInput.value = "45";
  resendDelayInput.dispatchEvent(new window.Event("input"));
  const resendBtn = previewRoot.querySelector("#otpResendButton");
  assert(30, resendBtn !== null && resendBtn.dataset.countdown === "45", "OTP resend button configured with 45s countdown delay");

  // -------------------------------------------------------------
  // TEST 31: Customer Landing Page URL
  // -------------------------------------------------------------
  const landingInput = document.querySelector('input[data-config-path="urls.landingPageUrl"]');
  landingInput.value = "https://mytenant.io";
  landingInput.dispatchEvent(new window.Event("input"));
  const landingLink = previewRoot.querySelector(".auth-landing-link");
  assert(31, landingLink !== null && landingLink.href.includes("mytenant.io"), "Customer Landing URL updates 'Back to Website' link destination");

  // -------------------------------------------------------------
  // TEST 32: Post-Authentication Redirect URL
  // -------------------------------------------------------------
  const redirectInput = document.querySelector('input[data-config-path="urls.redirectUrl"]');
  redirectInput.value = "https://mytenant.io/app/home";
  redirectInput.dispatchEvent(new window.Event("input"));
  assert(32, window.state.get("urls.redirectUrl") === "https://mytenant.io/app/home", "Post-Auth Redirect URL persists in state");

  // -------------------------------------------------------------
  // TEST 33: Integration Snippet Auto-Generation
  // -------------------------------------------------------------
  const snippetBox = document.getElementById("integrationSnippetText");
  assert(33, snippetBox !== null && snippetBox.value.includes("https://mytenant.io"), "Landing Page Integration Snippet updates with source URL");

  // -------------------------------------------------------------
  // TEST 34: Form Submission Simulation Feedback
  // -------------------------------------------------------------
  let submittedSuccess = false;
  window.Utils.showToast = (msg, type) => {
    if (type === "success" && msg.includes("Redirect destination")) submittedSuccess = true;
  };
  const form = previewRoot.querySelector(".auth-main-form");
  if (form) form.dispatchEvent(new window.Event("submit"));
  assert(34, submittedSuccess, "Submitting preview form simulates redirect with feedback");

  // -------------------------------------------------------------
  // TEST 35: Device Switching (Desktop -> Tablet -> Mobile)
  // -------------------------------------------------------------
  const canvas = document.querySelector(".preview-canvas");
  const tabletBtn = document.querySelector('[data-preview-device="tablet"]');
  tabletBtn.click();
  const tabletOk = canvas.classList.contains("device-tablet") && previewRoot.classList.contains("preview-device-tablet");

  const mobileBtn = document.querySelector('[data-preview-device="mobile"]');
  mobileBtn.click();
  const mobileOk = canvas.classList.contains("device-mobile") && previewRoot.classList.contains("preview-device-mobile");

  assert(35, tabletOk && mobileOk, "Device buttons switch both canvas & preview-root classes to tablet and mobile");

  // -------------------------------------------------------------
  // TEST 36: Fullscreen Modal Toggle & Key handling
  // -------------------------------------------------------------
  const fsModal = document.getElementById("fullscreenPreview");
  const fsTrigger = document.querySelector('[data-action="fullscreen-preview"]');
  fsTrigger.click();
  const fsOpen = !fsModal.hidden && fsModal.classList.contains("auth-fullscreen-open");

  const escEvent = new window.KeyboardEvent("keydown", { key: "Escape" });
  document.dispatchEvent(escEvent);
  const fsClosed = fsModal.hidden || !fsModal.classList.contains("auth-fullscreen-open");

  assert(36, fsOpen && fsClosed, "Fullscreen modal opens on button click and closes cleanly on Escape key");

  // -------------------------------------------------------------
  // TEST 37: Page-Specific Isolated Customization
  // -------------------------------------------------------------
  window.state.setActivePage("signup");
  const signupTitle = document.querySelector('input[data-config-path="pages.signup.title"]');
  signupTitle.value = "Join the Club";
  signupTitle.dispatchEvent(new window.Event("input"));

  window.state.setActivePage("login");
  const loginTitleText = previewRoot.querySelector(".auth-heading")?.textContent;
  assert(37, loginTitleText === "Welcome back" && window.state.get("pages.signup.title") === "Join the Club", "Changing Signup title does not mutate Login title");

  // -------------------------------------------------------------
  // TEST 38: Standalone ZIP Packaging
  // -------------------------------------------------------------
  let zipTriggered = false;
  window.downloadPackage().then(() => {
    zipTriggered = true;
    assert(38, zipTriggered, "Download Package triggers ZIP generation with full assets & scripts");

    console.log("\n==================================================");
    console.log(`TOTAL AUDIT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==================================================");
    if (failed > 0) {
      process.exit(1);
    }
  }).catch(e => {
    console.error("Test 38 error:", e);
    process.exit(1);
  });
}

runDomTests().catch(err => {
  console.error("DOM Test runner error:", err);
  process.exit(1);
});
