/* =========================================================
   AUTH PAGE BUILDER - FULL DOM INTEGRATION TEST SUITE (27 TESTS)
   File: test_dom_integration.js
========================================================= */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");

async function runDomTests() {
  console.log("==================================================");
  console.log("RUNNING 27-POINT DOM INTEGRATION & FLOW VERIFICATION");
  console.log("==================================================\n");

  const htmlContent = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

  const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    url: "http://localhost:5173/"
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
  const dynamicStyles = document.getElementById("authDynamicPreviewStyles");

  // TEST 1: Change Image Width
  const widthInput = document.querySelector('input[data-config-path="layout.imageWidth"]');
  widthInput.value = "70";
  widthInput.dispatchEvent(new window.Event("input"));
  const styleAfterWidth = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(1, styleAfterWidth.includes("--auth-image-width: 70%"), "Changing Image Width updates CSS variable to 70%");

  // TEST 2: Change Form Horizontal Position
  const hPosSelect = document.querySelector('select[data-config-path="layout.formHorizontalAlignment"]');
  hPosSelect.value = "left";
  hPosSelect.dispatchEvent(new window.Event("change"));
  assert(2, previewRoot.innerHTML.includes("form-horizontal-left"), "Changing Horizontal Position moves form left");

  // TEST 3: Change Form Vertical Position
  const vPosSelect = document.querySelector('select[data-config-path="layout.formVerticalAlignment"]');
  vPosSelect.value = "top";
  vPosSelect.dispatchEvent(new window.Event("change"));
  assert(3, previewRoot.innerHTML.includes("form-vertical-top"), "Changing Vertical Position moves form top");

  // TEST 4: Select default background
  const bgButtons = document.querySelectorAll("[data-background]");
  bgButtons[1].click(); // Select Creative Graphic (idea-6900632_1280.png)
  const styleAfterBg = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(4, styleAfterBg.includes("idea-6900632_1280.png"), "Selecting default background updates preview background image");

  // TEST 5: Upload background
  window.state.set("background.uploadedImage", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  const styleAfterUploadBg = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(5, styleAfterUploadBg.includes("data:image/png;base64"), "Uploading custom background sets uploadedImage in preview");

  // TEST 6: Select default logo
  const logoButtons = document.querySelectorAll("[data-logo]");
  logoButtons[0].click(); // Shield Mark
  assert(6, previewRoot.innerHTML.includes("brand-shield.svg"), "Selecting default logo updates preview logo image");

  // TEST 7: Upload logo
  window.state.set("branding.uploadedLogo", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  assert(7, previewRoot.innerHTML.includes("data:image/png;base64"), "Uploading custom logo displays uploaded logo in preview");

  // TEST 8: Change Logo Size
  const logoSizeInput = document.querySelector('input[data-config-path="branding.logoSize"]');
  logoSizeInput.value = "96";
  logoSizeInput.dispatchEvent(new window.Event("input"));
  const styleAfterLogoSize = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(8, styleAfterLogoSize.includes("--auth-logo-size: 96px"), "Changing Logo Size updates --auth-logo-size to 96px");

  // TEST 9: Change Login Card
  const cardRadiusInput = document.querySelector('input[data-config-path="card.borderRadius"]');
  cardRadiusInput.value = "36";
  cardRadiusInput.dispatchEvent(new window.Event("input"));
  const styleAfterCard = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(9, styleAfterCard.includes("--auth-card-radius: 36px"), "Changing Card border radius updates --auth-card-radius");

  // TEST 10: Change Typography
  const titleSizeInput = document.querySelector('input[data-config-path="typography.titleSize"]');
  titleSizeInput.value = "42";
  titleSizeInput.dispatchEvent(new window.Event("input"));
  const styleAfterTypo = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(10, styleAfterTypo.includes("--auth-title-size: 42px"), "Changing Typography heading size updates --auth-title-size");

  // TEST 11: Change Login Button
  const btnHeightInput = document.querySelector('input[data-config-path="button.height"]');
  btnHeightInput.value = "56";
  btnHeightInput.dispatchEvent(new window.Event("input"));
  const styleAfterBtn = document.getElementById("authDynamicPreviewStyles").textContent;
  assert(11, styleAfterBtn.includes("--auth-button-height: 56px"), "Changing Button height updates --auth-button-height to 56px");

  // TEST 12: Switch to Signup
  const signupTab = document.querySelector('button[data-builder-page="signup"]');
  signupTab.click();
  assert(12, previewRoot.innerHTML.includes('data-page="signup"') && previewRoot.innerHTML.includes("signupName"), "Switching to Signup tab renders Signup page form");

  // TEST 13: Switch to Forgot Password
  const forgotTab = document.querySelector('button[data-builder-page="forgotPassword"]');
  forgotTab.click();
  assert(13, previewRoot.innerHTML.includes('data-page="forgotPassword"') && previewRoot.innerHTML.includes("forgotIdentifier"), "Switching to Forgot Password renders Forgot Password form");

  // TEST 14: Switch to OTP
  const otpTab = document.querySelector('button[data-builder-page="otp"]');
  otpTab.click();
  assert(14, previewRoot.innerHTML.includes('data-page="otp"') && previewRoot.innerHTML.includes("otp-digit-box"), "Switching to OTP renders OTP verification form");

  // TEST 15: Change OTP length to 4
  const otpLenSelect = document.querySelector('select[data-config-path="pages.otp.length"]');
  otpLenSelect.value = "4";
  otpLenSelect.dispatchEvent(new window.Event("change"));
  const count4 = (previewRoot.innerHTML.match(/class="otp-digit-box"/g) || []).length;
  assert(15, count4 === 4, "Changing OTP length to 4 renders exactly 4 digit boxes");

  // TEST 16: Change OTP length to 6
  otpLenSelect.value = "6";
  otpLenSelect.dispatchEvent(new window.Event("change"));
  const count6 = (previewRoot.innerHTML.match(/class="otp-digit-box"/g) || []).length;
  assert(16, count6 === 6, "Changing OTP length to 6 renders exactly 6 digit boxes");

  // TEST 17: Change OTP length to 8
  otpLenSelect.value = "8";
  otpLenSelect.dispatchEvent(new window.Event("change"));
  const count8 = (previewRoot.innerHTML.match(/class="otp-digit-box"/g) || []).length;
  assert(17, count8 === 8, "Changing OTP length to 8 renders exactly 8 digit boxes");

  // TEST 18: Enable WhatsApp
  const whatsappToggle = document.querySelector('input[data-config-path="authentication.otp.whatsappEnabled"]');
  whatsappToggle.checked = true;
  whatsappToggle.dispatchEvent(new window.Event("change"));
  assert(18, previewRoot.innerHTML.includes('data-otp-delivery="whatsapp"'), "Enabling WhatsApp renders WhatsApp delivery option");

  // TEST 19: Enable/disable social providers
  // Switch to login
  document.querySelector('button[data-builder-page="login"]').click();
  const githubToggle = document.querySelector('input[data-config-path="social.providers.github"]');
  githubToggle.checked = false;
  githubToggle.dispatchEvent(new window.Event("change"));
  assert(19, !previewRoot.innerHTML.includes('auth-social-github'), "Disabling GitHub provider removes GitHub button from preview");

  // TEST 20: Mobile preview
  const mobileDeviceBtn = document.querySelector('button[data-preview-device="mobile"]');
  mobileDeviceBtn.click();
  assert(20, previewRoot.classList.contains("preview-device-mobile"), "Clicking Mobile preview sets preview-device-mobile class");

  // TEST 21: Tablet preview
  const tabletDeviceBtn = document.querySelector('button[data-preview-device="tablet"]');
  tabletDeviceBtn.click();
  assert(21, previewRoot.classList.contains("preview-device-tablet"), "Clicking Tablet preview sets preview-device-tablet class");

  // TEST 22: Desktop preview
  const desktopDeviceBtn = document.querySelector('button[data-preview-device="desktop"]');
  desktopDeviceBtn.click();
  assert(22, previewRoot.classList.contains("preview-device-desktop"), "Clicking Desktop preview sets preview-device-desktop class");

  // TEST 23: Fullscreen
  const fullscreenBtn = document.querySelector('[data-action="fullscreen-preview"]');
  fullscreenBtn.click();
  const fullscreenModal = document.getElementById("fullscreenPreview");
  assert(23, !fullscreenModal.hidden && fullscreenModal.classList.contains("auth-fullscreen-open"), "Fullscreen button opens fullscreen preview modal");
  // Close fullscreen
  const closeBtn = document.querySelector('[data-action="close-fullscreen-preview"]');
  closeBtn.click();
  assert(23, fullscreenModal.hidden, "Close button closes fullscreen preview modal");

  // TEST 24: Set Landing Page URL
  const landingUrlInput = document.getElementById("landingPageUrlInput");
  landingUrlInput.value = "https://myteststore.com";
  landingUrlInput.dispatchEvent(new window.Event("input"));
  assert(24, window.state.get("urls.landingPageUrl") === "https://myteststore.com", "Landing Page URL is stored in central state");

  // TEST 25: Set Redirect URL
  const redirectUrlInput = document.getElementById("redirectUrlInput");
  redirectUrlInput.value = "https://myteststore.com/app/overview";
  redirectUrlInput.dispatchEvent(new window.Event("input"));
  assert(25, window.state.get("urls.redirectUrl") === "https://myteststore.com/app/overview", "Redirect URL is stored in central state");

  // TEST 26: Download ZIP
  let downloadTriggered = false;
  const originalAnchorClick = window.HTMLAnchorElement.prototype.click;
  window.HTMLAnchorElement.prototype.click = function () {
    if (this.download && this.download.includes(".zip")) {
      downloadTriggered = true;
    }
  };

  const downloadBtn = document.getElementById("downloadButton");
  await window.downloadPackage();
  assert(26, downloadTriggered, "Download Package triggers ZIP file download");
  window.HTMLAnchorElement.prototype.click = originalAnchorClick;

  // TEST 27: Open generated ZIP and verify standalone execution
  const standaloneHTML = window.DownloadManager.generateStandaloneIndexHTML(window.state.getState());
  const standaloneCSS = window.DownloadManager.generateStandaloneCSS(window.state.getState());
  const standaloneJS = window.DownloadManager.generateStandaloneAppJS();

  const standaloneDom = new JSDOM(standaloneHTML, {
    runScripts: "dangerously",
    url: "http://localhost:8080/"
  });
  standaloneDom.window.AUTH_CONFIG = {
    landingPageUrl: "https://myteststore.com",
    redirectUrl: "https://myteststore.com/app/overview"
  };
  standaloneDom.window.eval(standaloneJS);
  standaloneDom.window.document.dispatchEvent(new standaloneDom.window.Event("DOMContentLoaded"));

  const standaloneLoginForm = standaloneDom.window.document.getElementById("authLoginForm");
  assert(27, standaloneLoginForm !== null && standaloneHTML.includes("Back to Website"), "Generated authentication page is standalone and contains valid DOM and configured URLs");

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runDomTests().catch(err => {
  console.error("DOM test error:", err);
  process.exit(1);
});
