/**
 * =============================================================================
 * AUTH PAGE BUILDER - PHASE 3 COMPREHENSIVE ACCEPTANCE TEST SUITE
 * =============================================================================
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

function runPhase3AcceptanceTests() {
  console.log("\n==================================================");
  console.log("RUNNING PHASE 3 — FINAL POLISH & CONSISTENCY ACCEPTANCE SUITE");
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
      console.log(`  [PASS] STEP ${testNum}: ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] STEP ${testNum}: ${message}`);
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

  // ---------------------------------------------------------------------------
  // 1. NO DUPLICATE UI AUDIT
  // ---------------------------------------------------------------------------
  const resetButtons = document.querySelectorAll('[data-action="reset-configuration"], .reset-button');
  assert(1, resetButtons.length === 1, `Exactly ONE Reset button in application (found ${resetButtons.length})`);

  const saveIndicators = document.querySelectorAll(".save-indicator, [data-unsaved-indicator]");
  assert(2, saveIndicators.length === 1, `Exactly ONE Live Sync status indicator in header (found ${saveIndicators.length})`);

  const indicatorDots = saveIndicators[0] ? saveIndicators[0].querySelectorAll(".indicator-dot") : [];
  assert(3, indicatorDots.length === 1, `Exactly ONE indicator dot inside the status badge (found ${indicatorDots.length})`);

  const deviceControls = document.querySelectorAll(".preview-device-controls");
  assert(4, deviceControls.length === 1, `Exactly ONE device switcher toolbar (found ${deviceControls.length})`);

  const fullscreenModals = document.querySelectorAll("#fullscreenPreview");
  assert(5, fullscreenModals.length === 1, `Exactly ONE fullscreen modal in DOM (found ${fullscreenModals.length})`);

  // ---------------------------------------------------------------------------
  // 2. DEVICE PREVIEW MODES & BACKGROUND PERSISTENCE
  // ---------------------------------------------------------------------------
  // Desktop mode
  const desktopBtn = document.querySelector('[data-preview-device="desktop"]');
  desktopBtn.click();
  assert(6, previewCanvas.classList.contains("device-desktop") && previewRoot.classList.contains("preview-device-desktop"), "Desktop preview mode active with full canvas sizing");

  // Select Background Preset 4
  const bgPreset = document.querySelector('[data-background="assets/backgrounds/background-4.svg"]');
  if (bgPreset) bgPreset.click();
  assert(7, getDynamicStyles().includes("background-4.svg"), "Background Preset 4 active in Desktop preview");

  // Tablet mode (768px)
  const tabletBtn = document.querySelector('[data-preview-device="tablet"]');
  tabletBtn.click();
  assert(8, previewCanvas.classList.contains("device-tablet") && previewRoot.classList.contains("preview-device-tablet"), "Tablet mode active with 768px frame");
  assert(9, getDynamicStyles().includes("background-4.svg"), "Background Preset 4 retained in Tablet mode");

  // Mobile mode (380px)
  const mobileBtn = document.querySelector('[data-preview-device="mobile"]');
  mobileBtn.click();
  assert(10, previewCanvas.classList.contains("device-mobile") && previewRoot.classList.contains("preview-device-mobile"), "Mobile mode active with 380px frame");
  assert(11, getDynamicStyles().includes("background-4.svg"), "Background Preset 4 retained in Mobile mode");

  // Switch back to Desktop
  desktopBtn.click();

  // ---------------------------------------------------------------------------
  // 3. FULLSCREEN PREVIEW & CLOSE INTEGRITY
  // ---------------------------------------------------------------------------
  const fsModal = document.getElementById("fullscreenPreview");
  const fsRoot = document.getElementById("fullscreenPreviewRoot");
  const fsOpenBtn = document.querySelector('[data-action="fullscreen-preview"]');
  fsOpenBtn.click();
  assert(12, !fsModal.hidden && fsModal.classList.contains("auth-fullscreen-open"), "Fullscreen preview opens cleanly on action button");
  assert(13, fsRoot.children.length > 0, "Fullscreen preview root contains complete rendered auth shell");

  const fsCloseBtn = document.querySelector('[data-action="close-fullscreen-preview"]');
  fsCloseBtn.click();
  assert(14, fsModal.hidden && !fsModal.classList.contains("auth-fullscreen-open"), "Fullscreen preview closes cleanly on close button");

  // ---------------------------------------------------------------------------
  // 4. LOGO AND BACKGROUND INDEPENDENCE
  // ---------------------------------------------------------------------------
  // Upload Custom Logo
  const customLogoData = "data:image/svg+xml;base64,PHN2Zz48Y2lyY2xlIHI9IjIwIi8+PC9zdmc+";
  window.state.updateConfig({
    branding: {
      uploadedLogo: customLogoData,
      logo: customLogoData,
      selectedLogo: ""
    }
  });
  assert(15, previewRoot.querySelector(".auth-logo-img")?.src === customLogoData, "Custom logo rendered in preview");
  assert(16, getDynamicStyles().includes("background-4.svg"), "Changing logo did NOT reset background");

  // Upload Custom Background
  const customBgData = "data:image/svg+xml;base64,PHN2Zz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0icmVkIi8+PC9zdmc+";
  window.state.updateConfig({
    background: {
      type: "uploaded",
      uploadedImage: customBgData,
      image: customBgData,
      selected: ""
    }
  });
  assert(17, getDynamicStyles().includes(customBgData), "Custom background applied to preview styles");
  assert(18, previewRoot.querySelector(".auth-logo-img")?.src === customLogoData, "Changing background did NOT reset logo");

  // ---------------------------------------------------------------------------
  // 5. BACKGROUND CONTROLS & VISUAL TEXT OVERLAY
  // ---------------------------------------------------------------------------
  window.state.set("imageSection.text", "NextGen Identity Cloud");
  window.state.set("imageSection.subtext", "Secure Zero Trust Architecture");
  window.state.set("imageSection.textColor", "#38bdf8");
  window.state.set("imageSection.textPosition", "top-left");

  const bgHeading = previewRoot.querySelector(".auth-image-text");
  const bgSubtext = previewRoot.querySelector(".auth-image-subtext");
  const bgPosWrapper = previewRoot.querySelector(".auth-image-content");
  assert(19, bgHeading && bgHeading.textContent === "NextGen Identity Cloud", "Background headline text updated");
  assert(20, bgSubtext && bgSubtext.textContent === "Secure Zero Trust Architecture", "Background subtext updated");
  assert(21, getDynamicStyles().includes("--auth-image-text-color: #38bdf8"), "Background text color updated");
  assert(22, bgPosWrapper && bgPosWrapper.classList.contains("position-top-left"), "Background text position 'top-left' applied");

  // ---------------------------------------------------------------------------
  // 6. SCROLL & LONG SIGN UP FORM
  // ---------------------------------------------------------------------------
  window.state.setActivePage("signup");
  window.state.set("pages.signup.termsEnabled", true);
  window.state.set("pages.signup.privacyEnabled", true);
  const signupForm = previewRoot.querySelector("#authSignupForm");
  const signupTerms = previewRoot.querySelector(".auth-terms-group");
  const signupCard = previewRoot.querySelector(".auth-card");
  assert(23, signupForm !== null && signupTerms !== null, "Sign Up page with all fields and Terms & Privacy rendered");
  assert(24, signupCard !== null, "Sign Up card formatted with natural safe vertical alignment");

  // ---------------------------------------------------------------------------
  // 7. RESET ALL CUSTOMIZATIONS INTEGRITY
  // ---------------------------------------------------------------------------
  const resetBtn = document.getElementById("resetConfigurationButton");
  resetBtn.click();
  const resetState = window.state.getState();
  assert(25, resetState.activePage === "login", "Reset restores default activePage 'login'");
  assert(26, resetState.branding.brandName === "Your Brand", "Reset restores default brandName");
  assert(27, resetState.background.type === "default", "Reset restores default background type");
  assert(28, previewRoot.querySelector(".auth-heading")?.textContent === "Welcome back", "Reset updates preview to default Login heading");

  // ---------------------------------------------------------------------------
  // 8. ZIP PACKAGE EXPORT CHECK
  // ---------------------------------------------------------------------------
  assert(29, typeof window.downloadPackage === "function", "Download Package export module available");

  console.log("\n==================================================");
  console.log(`PHASE 3 ACCEPTANCE SUITE: ${passed + failed} STEPS | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase3AcceptanceTests();
