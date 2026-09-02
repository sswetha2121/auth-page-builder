/* =========================================================
   AUTH PAGE BUILDER - COMPREHENSIVE END-TO-END INTEGRATION TEST
   File: test_e2e_full_integration.js
========================================================= */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const StateManager = require("./js/state.js");
const Renderer = require("./js/renderer.js");
const Templates = require("./js/templates.js");
const FullscreenManager = require("./js/fullscreen.js");
const Download = require("./js/download.js");

console.log("==================================================");
console.log("RUNNING COMPREHENSIVE END-TO-END INTEGRATION TEST");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, desc) {
  if (condition) {
    console.log(`  [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    failed++;
  }
}

async function runE2EIntegrationTests() {
  // Setup JSDOM-like environment for state & template testing
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="previewCanvas"></div>
      <div id="fullscreenPreview" hidden><div id="fullscreenPreviewRoot"></div></div>
    </body>
    </html>
  `, { url: "http://localhost:3000" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.Event = dom.window.Event;
  global.CustomEvent = dom.window.CustomEvent;
  global.state = StateManager;
  global.window.state = StateManager;
  StateManager.reset();

  // ----------------------------------------------------
  // 1. FULLSCREEN PRESERVES TYPED FIELD VALUES
  // ----------------------------------------------------
  console.log("--- SECTION 1: Fullscreen Live Form State Preservation ---");
  StateManager.setActivePage("signup");
  const canvas = document.getElementById("previewCanvas");
  Renderer.renderPreview(canvas, { config: StateManager.getState(), page: StateManager.get("activePage"), device: "desktop" });

  // Simulate typing into inputs
  const nameInput = canvas.querySelector("#signupName");
  const userInput = canvas.querySelector("#signupUsername");
  const emailInput = canvas.querySelector("#signupEmail");

  if (nameInput) { nameInput.value = "Swetha"; nameInput.setAttribute("value", "Swetha"); }
  if (userInput) { userInput.value = "swetha123"; userInput.setAttribute("value", "swetha123"); }
  if (emailInput) { emailInput.value = "swetha@example.com"; emailInput.setAttribute("value", "swetha@example.com"); }

  assert(canvas.querySelector("#signupName")?.value === "Swetha", "Typed Full Name: 'Swetha' in preview canvas");
  assert(canvas.querySelector("#signupUsername")?.value === "swetha123", "Typed Username: 'swetha123' in preview canvas");
  assert(canvas.querySelector("#signupEmail")?.value === "swetha@example.com", "Typed Email: 'swetha@example.com' in preview canvas");

  // Trigger Fullscreen
  const fullscreen = new FullscreenManager();
  fullscreen.open();

  const fullRoot = document.getElementById("fullscreenPreviewRoot");
  assert(fullRoot.querySelector("#signupName")?.value === "Swetha", "Fullscreen container PRESERVES typed Full Name: 'Swetha'");
  assert(fullRoot.querySelector("#signupUsername")?.value === "swetha123", "Fullscreen container PRESERVES typed Username: 'swetha123'");
  assert(fullRoot.querySelector("#signupEmail")?.value === "swetha@example.com", "Fullscreen container PRESERVES typed Email: 'swetha@example.com'");

  // Close Fullscreen
  fullscreen.close();
  assert(canvas.querySelector("#signupName")?.value === "Swetha", "Normal preview canvas PRESERVES typed Full Name after closing fullscreen");
  assert(canvas.querySelector("#signupUsername")?.value === "swetha123", "Normal preview canvas PRESERVES typed Username after closing fullscreen");
  assert(canvas.querySelector("#signupEmail")?.value === "swetha@example.com", "Normal preview canvas PRESERVES typed Email after closing fullscreen");

  // ----------------------------------------------------
  // 2. CANONICAL PASSWORD POLICY (DYNAMIC WORD FORMATTING)
  // ----------------------------------------------------
  console.log("\n--- SECTION 2: Dynamic Password Policy Formatting ---");
  
  // Test specialCharacters = 1
  StateManager.set("passwordPolicy.minSpecialChars", 1);
  let html1 = Templates.generateAuthShell(StateManager.getState(), "signup");
  assert(html1.includes("One special character"), "Password policy specialCharacters = 1 displays 'One special character'");
  assert(!html1.includes("Three special characters"), "Password policy specialCharacters = 1 does NOT display 'Three special characters'");

  // Test specialCharacters = 3
  StateManager.set("passwordPolicy.minSpecialChars", 3);
  let html3 = Templates.generateAuthShell(StateManager.getState(), "signup");
  assert(html3.includes("Three special characters"), "Password policy specialCharacters = 3 displays 'Three special characters'");

  // Test specialCharacters = 5
  StateManager.set("passwordPolicy.minSpecialChars", 5);
  let html5 = Templates.generateAuthShell(StateManager.getState(), "signup");
  assert(html5.includes("Five special characters"), "Password policy specialCharacters = 5 displays 'Five special characters'");

  // ----------------------------------------------------
  // 3. CURRENT STATE EXPORT (UNSAVED STATE FIDELITY)
  // ----------------------------------------------------
  console.log("\n--- SECTION 3: Current Unsaved State Export Fidelity ---");
  StateManager.set("branding.brandName", "Acme Security Studio");
  StateManager.set("passwordPolicy.minSpecialChars", 1);
  StateManager.set("card.width", 680);
  StateManager.set("card.minHeight", 550);
  StateManager.set("card.borderRadius", 28);
  StateManager.set("backgroundText.position", "bottom-right");
  StateManager.set("redirect.redirectUrl", "/portal/welcome");

  const zipBuffer = await Download.downloadPackage();
  assert(zipBuffer && zipBuffer.length > 0, "Generated fresh ZIP buffer from current unsaved state");

  const zip = await JSZip.loadAsync(zipBuffer);
  assert(zip.file("index.html") !== null, "ZIP contains root index.html");
  assert(zip.file("config/auth-config.json") !== null, "ZIP contains config/auth-config.json");
  assert(zip.file("config/assets-manifest.json") !== null, "ZIP contains config/assets-manifest.json");

  const authConfigTxt = await zip.file("config/auth-config.json").async("string");
  const parsedCfg = JSON.parse(authConfigTxt);

  assert(parsedCfg.branding.brandName === "Acme Security Studio", "ZIP config contains current Brand Name: 'Acme Security Studio'");
  assert(parsedCfg.passwordPolicy.minSpecialChars === 1, "ZIP config contains current Special Characters: 1");
  assert(parsedCfg.card.width === 680, "ZIP config contains current Card Width: 680");
  assert(parsedCfg.card.minHeight === 550, "ZIP config contains current Card minHeight: 550");
  assert(parsedCfg.card.borderRadius === 28, "ZIP config contains current Card Radius: 28");
  assert(parsedCfg.backgroundText.position === "bottom-right", "ZIP config contains current Background Text Position: 'bottom-right'");
  assert(parsedCfg.redirect.redirectUrl === "/portal/welcome", "ZIP config contains current Redirect Destination: '/portal/welcome'");

  console.log("\n==================================================");
  console.log(`E2E INTEGRATION TEST RESULTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2EIntegrationTests().catch(err => {
  console.error("E2E Integration Test failed with exception:", err);
  process.exit(1);
});
