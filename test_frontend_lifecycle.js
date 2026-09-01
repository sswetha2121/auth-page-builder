/*
Frontend Lifecycle, State Isolation & Background Layout Test Suite
Validates state persistence across refresh, user switching isolation, non-destructive background normalization,
and default/uploaded/color/gradient rendering across split-left, split-right, and full-background layouts.
*/

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const Constants = require("./js/constants.js");
const { defaultConfig } = require("./js/config.js");
const StateManager = require("./js/state.js");
const Utils = require("./js/utils.js");
const Templates = require("./js/templates.js");
const Renderer = require("./js/renderer.js");

// Setup DOM Environment
const html = `<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="previewRoot" class="auth-preview-root"></div>
  <div id="authDynamicPreviewStyles"></div>
  <div id="authLoggedOutView"></div>
  <div id="authLoggedInView" style="display:none;"></div>
  <span id="userAuthButtonText">Account</span>
  <span id="userProfileName"></span>
  <span id="userProfileEmail"></span>
  <span id="userProfileUsername"></span>
  <span id="userAvatar"></span>
</body>
</html>`;

const dom = new JSDOM(html, { url: "http://localhost:3000" });
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
global.getComputedStyle = dom.window.getComputedStyle;

// Attach required globals
global.window.Constants = Constants;
global.window.Utils = Utils;
global.window.Templates = Templates;
global.window.AuthPageRenderer = Renderer;
global.window.state = StateManager;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING FRONTEND AUTH LIFECYCLE & RENDERER SUITE");
  console.log("==================================================");

  // -------------------------------------------------------------
  // TEST 13: Refresh Preserves Saved State
  // -------------------------------------------------------------
  global.window.state.set("branding.brandName", "Quantum Corp");
  const savedState = global.window.state.serializeCurrentConfiguration();
  global.window.state.loadState(savedState);
  assert(global.window.state.get("branding.brandName") === "Quantum Corp", "Refresh / reload preserves saved state");

  // -------------------------------------------------------------
  // TEST 14: User Switching State Isolation
  // -------------------------------------------------------------
  // User A state
  global.window.state.set("branding.brandName", "User A Brand");
  global.window.state.set("background.type", "default");
  global.window.state.set("background.selected", "assets/backgrounds/background-3.svg");
  const userAData = global.window.state.serializeCurrentConfiguration();

  // Logout reset
  global.window.state.reset();
  assert(global.window.state.get("branding.brandName") === "Your Brand", "Logout resets state to default");

  // User B state
  global.window.state.set("branding.brandName", "User B Brand");
  global.window.state.set("background.type", "color");
  global.window.state.set("background.color", "#ff0000");

  assert(global.window.state.get("branding.brandName") === "User B Brand", "User B state set correctly");

  // Switch back to User A
  global.window.state.loadState(userAData);
  assert(global.window.state.get("branding.brandName") === "User A Brand", "User A state restored on login without User B leakage");
  assert(global.window.state.get("background.selected") === "assets/backgrounds/background-3.svg", "User A background restored");

  // -------------------------------------------------------------
  // TEST 15: Background Type Preservation (Non-Destructive Normalization)
  // -------------------------------------------------------------
  const bgTypes = ["color", "gradient", "none", "uploaded", "default"];
  bgTypes.forEach(t => {
    global.window.state.set("background.type", t);
    const serialized = global.window.state.serializeCurrentConfiguration();
    assert(serialized.background.type === t, `Background type '${t}' preserved in canonical serialization`);
  });

  // -------------------------------------------------------------
  // TEST 16: Default Background Works Split-Left
  // -------------------------------------------------------------
  global.window.state.set("layout.type", "split-left-image");
  global.window.state.set("background.type", "default");
  global.window.state.set("background.selected", "assets/backgrounds/background-1.svg");

  const previewRoot = global.document.getElementById("previewRoot");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const imageSectionSplitLeft = previewRoot.querySelector(".auth-image-section");
  assert(imageSectionSplitLeft !== null, "Split-left renders .auth-image-section");
  assert(imageSectionSplitLeft.style.backgroundImage.includes("background-1.svg"), "Default background renders in split-left layout");

  // -------------------------------------------------------------
  // TEST 17: Default Background Works Split-Right
  // -------------------------------------------------------------
  global.window.state.set("layout.type", "split-right-image");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const imageSectionSplitRight = previewRoot.querySelector(".auth-image-section");
  assert(imageSectionSplitRight !== null, "Split-right renders .auth-image-section");
  assert(imageSectionSplitRight.style.backgroundImage.includes("background-1.svg"), "Default background renders in split-right layout");

  // -------------------------------------------------------------
  // TEST 18: Default Background Works Full-Background
  // -------------------------------------------------------------
  global.window.state.set("layout.type", "full-background");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const fullBgDefault = previewRoot.querySelector(".auth-full-background");
  assert(fullBgDefault !== null, "Full-background layout renders dedicated .auth-full-background DOM element");
  assert(fullBgDefault.style.backgroundImage.includes("background-1.svg"), "Default background renders in full-background layout");

  // -------------------------------------------------------------
  // TEST 19: Uploaded Background Works Full-Background
  // -------------------------------------------------------------
  global.window.state.set("background.type", "uploaded");
  global.window.state.set("background.uploadedImage", "data:image/png;base64,mockUploadedFullBgData");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const fullBgUploaded = previewRoot.querySelector(".auth-full-background");
  assert(fullBgUploaded !== null, "Uploaded full-background renders dedicated element");
  assert(fullBgUploaded.style.backgroundImage.includes("mockUploadedFullBgData"), "Uploaded background renders in full-background layout");

  // -------------------------------------------------------------
  // TEST 20: Color Background Works Full-Background
  // -------------------------------------------------------------
  global.window.state.set("background.type", "color");
  global.window.state.set("background.color", "#123456");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const fullBgColor = previewRoot.querySelector(".auth-full-background");
  assert(fullBgColor.style.backgroundColor === "rgb(18, 52, 86)" || fullBgColor.style.backgroundColor === "#123456", "Color background applies to full-background element");

  // -------------------------------------------------------------
  // TEST 21: Gradient Background Works Full-Background
  // -------------------------------------------------------------
  global.window.state.set("background.type", "gradient");
  global.window.state.set("background.gradientStart", "#0f172a");
  global.window.state.set("background.gradientEnd", "#1e293b");
  Renderer.renderPreview(previewRoot, { config: global.window.state.getState() });

  const fullBgGradient = previewRoot.querySelector(".auth-full-background");
  assert(fullBgGradient.style.backgroundImage.includes("linear-gradient"), "Gradient background applies to full-background element");

  console.log("\n==================================================");
  console.log(`FRONTEND LIFECYCLE SUITE: TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
