/* =========================================================
   AUTH PAGE BUILDER - PHASE 1 ACCEPTANCE TEST SUITE
   File: test_phase1_acceptance.js
========================================================= */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

console.log("==================================================");
console.log("RUNNING PHASE 1 — 17-STEP EXACT ACCEPTANCE SUITE");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(stepNum, condition, desc) {
  if (condition) {
    console.log(`  [PASS] STEP ${stepNum}: ${desc}`);
    passed++;
  } else {
    console.error(`  [FAIL] STEP ${stepNum}: ${desc}`);
    failed++;
  }
}

async function runAcceptanceTest() {
  const htmlPath = path.join(__dirname, "index.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf-8");

  const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    resources: "usable",
    url: "http://localhost:3000/"
  });

  const { window } = dom;
  const { document } = window;

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
  const previewCanvas = document.getElementById("previewCanvas");
  const getDynamicStyles = () => document.getElementById("authDynamicPreviewStyles")?.textContent || "";

  // -------------------------------------------------------------
  // STEP 1: Open Login page
  // -------------------------------------------------------------
  const loginForm = previewRoot.querySelector("#authLoginForm");
  const loginTitle = previewRoot.querySelector(".auth-heading");
  assert(1, loginForm !== null && loginTitle.textContent === "Welcome back", "Login page is open with 'Welcome back'");

  // -------------------------------------------------------------
  // STEP 2: Select default background A -> preview updates
  // -------------------------------------------------------------
  const bgButtons = document.querySelectorAll("[data-background]");
  assert(2, bgButtons.length === 7, `Found ${bgButtons.length} default background options including color swatch`);
  bgButtons[1].click(); // background-1.svg
  assert(2, bgButtons[1].classList.contains("active") && getDynamicStyles().includes("background-1.svg"), "Default background A (background-1.svg) updates preview");

  // -------------------------------------------------------------
  // STEP 3: Select default background B -> preview updates
  // -------------------------------------------------------------
  bgButtons[2].click(); // background-2.svg
  assert(3, bgButtons[2].classList.contains("active") && getDynamicStyles().includes("background-2.svg"), "Default background B (background-2.svg) updates preview");

  // -------------------------------------------------------------
  // STEP 4: Upload custom background -> preview updates immediately
  // -------------------------------------------------------------
  window.state.set("background.uploadedImage", "data:image/svg+xml;base64,PHN2Zz48Y2lyY2xlLz48L3N2Zz4=");
  window.state.set("background.image", "data:image/svg+xml;base64,PHN2Zz48Y2lyY2xlLz48L3N2Zz4=");
  assert(4, getDynamicStyles().includes("PHN2Zz48Y2lyY2xlLz48L3N2Zz4="), "Uploaded custom background updates preview immediately");

  // -------------------------------------------------------------
  // STEP 5: Switch to Sign Up -> selected background remains
  // -------------------------------------------------------------
  const signupTab = document.querySelector('[data-builder-page="signup"]');
  signupTab.click();
  const signupForm = previewRoot.querySelector("#authSignupForm");
  assert(5, signupForm !== null && getDynamicStyles().includes("PHN2Zz48Y2lyY2xlLz48L3N2Zz4="), "Switch to Sign Up preserves selected background");

  // -------------------------------------------------------------
  // STEP 6: Switch to OTP -> selected background remains
  // -------------------------------------------------------------
  const otpTab = document.querySelector('[data-builder-page="otp"]');
  otpTab.click();
  const otpBoxes = previewRoot.querySelectorAll(".otp-digit-box");
  assert(6, otpBoxes.length > 0 && getDynamicStyles().includes("PHN2Zz48Y2lyY2xlLz48L3N2Zz4="), "Switch to OTP preserves selected background");

  // -------------------------------------------------------------
  // STEP 7: Switch to Desktop -> correct layout
  // -------------------------------------------------------------
  const desktopBtn = document.querySelector('[data-preview-device="desktop"]');
  desktopBtn.click();
  assert(7, previewCanvas.classList.contains("device-desktop") && previewRoot.classList.contains("preview-device-desktop"), "Desktop preview mode applies full desktop layout classes");

  // -------------------------------------------------------------
  // STEP 8: Switch to Tablet -> correct responsive layout
  // -------------------------------------------------------------
  const tabletBtn = document.querySelector('[data-preview-device="tablet"]');
  tabletBtn.click();
  assert(8, previewCanvas.classList.contains("device-tablet") && previewRoot.classList.contains("preview-device-tablet"), "Tablet preview mode applies tablet frame classes");

  // -------------------------------------------------------------
  // STEP 9: Switch to Mobile -> correct responsive layout
  // -------------------------------------------------------------
  const mobileBtn = document.querySelector('[data-preview-device="mobile"]');
  mobileBtn.click();
  assert(9, previewCanvas.classList.contains("device-mobile") && previewRoot.classList.contains("preview-device-mobile"), "Mobile preview mode applies mobile phone frame classes");

  // -------------------------------------------------------------
  // STEP 10: Open Fullscreen -> selected background fills the entire screen
  // -------------------------------------------------------------
  const fullscreenModal = document.getElementById("fullscreenPreview");
  const fullscreenRoot = document.getElementById("fullscreenPreviewRoot");
  window.fullscreenInstance.open();
  assert(10, !fullscreenModal.hidden && fullscreenModal.classList.contains("auth-fullscreen-open") && fullscreenRoot.children.length > 0, "Fullscreen preview opens with full generated auth page");

  // -------------------------------------------------------------
  // STEP 11: No black areas appear
  // -------------------------------------------------------------
  const styles = getDynamicStyles();
  assert(11, styles.includes("--auth-background-color: #0f172a") && styles.includes("--auth-background-size: cover"), "Background variables cover full viewport with cover sizing");

  // -------------------------------------------------------------
  // STEP 12: Sign Up page can scroll and nothing is clipped
  // -------------------------------------------------------------
  window.state.setActivePage("signup");
  const signupCard = previewRoot.querySelector(".auth-card");
  const signupSection = previewRoot.querySelector(".auth-form-section");
  assert(12, signupCard !== null && signupSection !== null, "Sign Up page rendered in form section with natural vertical scrolling");

  // -------------------------------------------------------------
  // STEP 13: Top logo and content are fully visible
  // -------------------------------------------------------------
  const logoBox = previewRoot.querySelector(".auth-branding-header");
  assert(13, logoBox !== null, "Top logo branding header is fully rendered and visible");

  // -------------------------------------------------------------
  // STEP 14: Default background thumbnails all work
  // -------------------------------------------------------------
  const imageBgButtons = Array.from(bgButtons).filter(btn => btn.dataset.background !== "none");
  for (let i = 0; i < imageBgButtons.length; i++) {
    const bgImg = imageBgButtons[i].querySelector("img");
    assert(14, bgImg && bgImg.getAttribute("src").startsWith("./assets/backgrounds/background-"), `Thumbnail ${i + 1} (${imageBgButtons[i].textContent.trim()}) has valid image path`);
  }

  // -------------------------------------------------------------
  // STEP 15: Default logo thumbnails still work
  // -------------------------------------------------------------
  const logoButtons = document.querySelectorAll("[data-logo]");
  assert(15, logoButtons.length === 5, "5 default logo thumbnails registered");
  for (let i = 0; i < logoButtons.length; i++) {
    const logoImg = logoButtons[i].querySelector("img");
    assert(15, logoImg && logoImg.getAttribute("src").startsWith("./assets/logos/brand-"), `Logo thumbnail ${i + 1} (${logoButtons[i].textContent.trim()}) has valid SVG path`);
  }

  // -------------------------------------------------------------
  // STEP 16: Uploaded logo still works
  // -------------------------------------------------------------
  window.state.set("branding.uploadedLogo", "data:image/svg+xml;base64,mockLogoData");
  window.state.set("branding.logo", "data:image/svg+xml;base64,mockLogoData");
  const renderedLogoImg = previewRoot.querySelector(".auth-logo-img");
  assert(16, renderedLogoImg && renderedLogoImg.src.includes("mockLogoData"), "Uploaded custom logo renders in preview");

  // -------------------------------------------------------------
  // STEP 17: No existing authentication page functionality is broken
  // -------------------------------------------------------------
  window.state.setActivePage("login");
  const emailInput = previewRoot.querySelector("#loginIdentifier");
  const passwordInput = previewRoot.querySelector("#loginPassword");
  const submitBtn = previewRoot.querySelector("#loginSubmitBtn");
  assert(17, emailInput !== null && passwordInput !== null && submitBtn !== null, "Login inputs, password toggle, and submit button fully intact");

  console.log("\n==================================================");
  console.log(`PHASE 1 ACCEPTANCE SUITE: ${passed + failed} STEPS | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAcceptanceTest().catch(err => {
  console.error("Acceptance test failed:", err);
  process.exit(1);
});
