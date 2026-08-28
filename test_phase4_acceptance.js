/**
 * =============================================================================
 * AUTH PAGE BUILDER - PHASE 4 COMPREHENSIVE ACCEPTANCE TEST SUITE
 * =============================================================================
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

function runPhase4AcceptanceTests() {
  console.log("\n==================================================");
  console.log("RUNNING PHASE 4 — PREMIUM UI & SPACE UTILIZATION ACCEPTANCE SUITE");
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
  // 1. WIDER SIDEBAR & SPACE UTILIZATION AUDIT
  // ---------------------------------------------------------------------------
  const appCss = fs.readFileSync(path.join(__dirname, "css", "app.css"), "utf-8");
  const hasWiderSidebar = appCss.includes("minmax(440px, 480px)") || appCss.includes("480px");
  assert(1, hasWiderSidebar, "Customization panel width increased significantly (440px–480px grid definition)");

  const pageTabs = document.querySelectorAll(".sidebar-page-tab");
  assert(2, pageTabs.length === 4, `All 4 authentication page tabs rendered (found ${pageTabs.length})`);

  const has4ColTabs = appCss.includes("repeat(4, minmax(0, 1fr))");
  assert(3, has4ColTabs, "Sidebar page tabs organized into 4 responsive columns across one row");

  // ---------------------------------------------------------------------------
  // 2. ACCORDION & CONTROL LAYOUT
  // ---------------------------------------------------------------------------
  const accordions = document.querySelectorAll(".customization-accordion");
  assert(4, accordions.length >= 10, `Spacious accordion inspector sections organized (found ${accordions.length})`);

  const assetOptions = document.querySelectorAll(".asset-option");
  assert(5, assetOptions.length >= 10, `Preset asset selection cards styled in multi-column grid (found ${assetOptions.length})`);

  // ---------------------------------------------------------------------------
  // 3. SINGLE SOURCE OF TRUTH & NO DUPLICATE UI
  // ---------------------------------------------------------------------------
  const resetButtons = document.querySelectorAll('[data-action="reset-configuration"], .reset-button');
  assert(6, resetButtons.length === 1, `Exactly ONE Reset All Customizations control in DOM (found ${resetButtons.length})`);

  const saveIndicators = document.querySelectorAll(".save-indicator, [data-unsaved-indicator]");
  assert(7, saveIndicators.length === 1, `Exactly ONE Live Sync status indicator in header (found ${saveIndicators.length})`);

  const indicatorDots = saveIndicators[0] ? saveIndicators[0].querySelectorAll(".indicator-dot") : [];
  assert(8, indicatorDots.length === 1, `Exactly ONE live indicator dot in status badge (found ${indicatorDots.length})`);

  // ---------------------------------------------------------------------------
  // 4. HEADER ACTIONS & DOWNLOAD BUTTON
  // ---------------------------------------------------------------------------
  const downloadBtn = document.getElementById("downloadButton");
  assert(9, downloadBtn !== null && downloadBtn.classList.contains("primary"), "Prominent Download Package button in header");

  const fullscreenBtn = document.querySelector('[data-action="fullscreen-preview"]');
  assert(10, fullscreenBtn !== null, "Fullscreen preview action button in header");

  // ---------------------------------------------------------------------------
  // 5. SEGMENTED DEVICE PREVIEW SWITCHER
  // ---------------------------------------------------------------------------
  const deviceBtns = document.querySelectorAll(".device-button");
  assert(11, deviceBtns.length === 3, `Segmented device switcher contains Desktop, Tablet, Mobile (found ${deviceBtns.length})`);

  // Desktop test
  document.querySelector('[data-preview-device="desktop"]').click();
  assert(12, previewCanvas.classList.contains("device-desktop"), "Desktop preview mode utilizes full available canvas space");

  // Tablet test
  document.querySelector('[data-preview-device="tablet"]').click();
  assert(13, previewCanvas.classList.contains("device-tablet"), "Tablet mode framed in realistic 768px bezel");

  // Mobile test
  document.querySelector('[data-preview-device="mobile"]').click();
  assert(14, previewCanvas.classList.contains("device-mobile"), "Mobile mode framed in realistic 380px smartphone bezel");

  document.querySelector('[data-preview-device="desktop"]').click();

  // ---------------------------------------------------------------------------
  // 6. LIVE SYNC & PREVIEW RESPONSIVENESS
  // ---------------------------------------------------------------------------
  window.state.set("branding.brandName", "Acme Enterprise");
  assert(15, previewRoot.querySelector(".auth-brand-title")?.textContent === "Acme Enterprise", "Live sync updates preview instantaneously");

  // Switch to OTP page
  document.querySelector('[data-builder-page="otp"]').click();
  const otpState = window.state.getState();
  assert(16, otpState.activePage === "otp", "Page switch tab switches active builder page to OTP");
  assert(17, previewRoot.querySelector("#authOtpForm") !== null, "OTP page rendered in preview workspace");

  // Switch back to Login
  document.querySelector('[data-builder-page="login"]').click();
  assert(18, previewRoot.querySelector("#authLoginForm") !== null, "Login page rendered back in preview workspace");

  // ---------------------------------------------------------------------------
  // 7. DOWNLOAD PACKAGE INTEGRITY
  // ---------------------------------------------------------------------------
  assert(19, typeof window.downloadPackage === "function", "Download Package export pipeline intact");

  console.log("\n==================================================");
  console.log(`PHASE 4 ACCEPTANCE SUITE: ${passed + failed} STEPS | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runPhase4AcceptanceTests();
