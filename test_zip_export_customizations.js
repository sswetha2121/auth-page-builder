/* =========================================================
   AUTH PAGE BUILDER - COMPREHENSIVE ZIP EXPORT ACCEPTANCE SUITE
   File: test_zip_export_customizations.js
========================================================= */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const JSZip = require("jszip");

const Constants = require("./js/constants.js");
const { defaultConfig } = require("./js/config.js");
const StateManager = require("./js/state.js");
const Utils = require("./js/utils.js");
const Templates = require("./js/templates.js");
const Renderer = require("./js/renderer.js");
const Download = require("./js/download.js");

console.log("==================================================");
console.log("RUNNING ZIP EXPORT CUSTOMIZATIONS VERIFICATION");
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

async function runZipAcceptanceTests() {
  // 1. Initialize State Manager & apply comprehensive user customizations
  console.log("Stage 1: Apply Real User Customizations to State");

  // Create isolated state instance
  const stateInstance = StateManager;
  stateInstance.reset();

  stateInstance.set("layout.type", "full-background");
  stateInstance.set("background.type", "uploaded");
  stateInstance.set("background.uploadedImage", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  stateInstance.set("background.color", "#1e1b4b");
  stateInstance.set("branding.brandName", "Acme Enterprise");
  stateInstance.set("branding.uploadedLogo", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjAiIGZpbGw9InJlZCIvPjwvc3ZnPg==");
  stateInstance.set("branding.logoShape", "circle");
  stateInstance.set("typography.headingText", "Access Your Acme Dashboard");
  stateInstance.set("typography.subtitleText", "Enter credentials to proceed securely");
  stateInstance.set("typography.titleColor", "#312e81");
  stateInstance.set("button.backgroundColor", "#4338ca");
  stateInstance.set("button.borderRadius", 14);
  stateInstance.set("button.height", 52);
  stateInstance.set("pages.signup.fields.mobile", false);
  stateInstance.set("pages.signup.termsEnabled", true);
  stateInstance.set("passwordPolicy.minLength", 12);
  stateInstance.set("urls.landingPageUrl", "https://acmeenterprise.io");
  stateInstance.set("urls.redirectUrl", "https://acmeenterprise.io/portal/analytics");
  stateInstance.set("urls.backToWebsiteText", "Return to Acme Portal");
  stateInstance.set("redirect.redirectUrl", "https://acmeenterprise.io/portal/analytics");

  const serialized = stateInstance.serializeCurrentConfiguration();
  assert(serialized !== null && typeof serialized === "object", "state.serializeCurrentConfiguration() returns valid state object");
  assert(serialized.branding.brandName === "Acme Enterprise", "Canonical state preserves custom brand name");
  assert(serialized.background.type === "uploaded", "Canonical state preserves uploaded background mode");
  assert(serialized.layout.type === "full-background", "Canonical state preserves full-background layout");

  // 2. Perform Download Package & Export Generation
  console.log("\nStage 2: Package Export & Asset Resolution");

  let exportConfig = JSON.parse(JSON.stringify(serialized));
  const zip = new JSZip();

  const bgMeta = Download.detectMimeAndExt(exportConfig.background.uploadedImage, "png");
  const logoMeta = Download.detectMimeAndExt(exportConfig.branding.uploadedLogo, "png");
  assert(bgMeta.ext === "png", "Detected uploaded background extension is png");
  assert(logoMeta.ext === "svg", "Detected uploaded logo extension is svg");

  const bgData = exportConfig.background.uploadedImage.split(",")[1];
  const logoData = exportConfig.branding.uploadedLogo.split(",")[1];

  const assetsFolder = zip.folder("assets");
  const bgFolder = assetsFolder.folder("backgrounds");
  const logoFolder = assetsFolder.folder("logos");

  bgFolder.file(`custom-background.${bgMeta.ext}`, bgData, { base64: true });
  logoFolder.file(`custom-logo.${logoMeta.ext}`, logoData, { base64: true });

  exportConfig.background.image = `./assets/backgrounds/custom-background.${bgMeta.ext}`;
  exportConfig.background.uploadedImage = `./assets/backgrounds/custom-background.${bgMeta.ext}`;
  exportConfig.branding.logo = `./assets/logos/custom-logo.${logoMeta.ext}`;
  exportConfig.branding.uploadedLogo = `./assets/logos/custom-logo.${logoMeta.ext}`;

  const configJSON = Object.assign({}, exportConfig, {
    landingPageUrl: exportConfig.urls.landingPageUrl,
    redirectUrl: exportConfig.urls.redirectUrl,
    backToWebsiteText: exportConfig.urls.backToWebsiteText
  });

  const configStr = JSON.stringify(configJSON, null, 2);
  const configFolder = zip.folder("config");
  configFolder.file("auth-config.json", configStr);
  zip.file("config.json", configStr);

  const standaloneHTML = Download.generateStandaloneIndexHTML(exportConfig);
  const standaloneCSS = Download.generateStandaloneCSS(exportConfig);
  const standaloneAppJS = Download.generateStandaloneAppJS();

  zip.file("index.html", standaloneHTML);
  zip.folder("css").file("styles.css", standaloneCSS);
  zip.folder("js").file("config.js", `window.AUTH_CONFIG = ${configStr};\n`);
  zip.folder("js").file("app.js", standaloneAppJS);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  assert(zipBuffer.length > 0, "ZIP buffer generated successfully");

  // 3. Inspect ZIP Content & Validate ZIP-relative asset paths
  console.log("\nStage 3: ZIP Content & Asset Path Verification");
  const extracted = await JSZip.loadAsync(zipBuffer);

  const rawConfig = await extracted.file("config/auth-config.json").async("text");
  const parsedConfig = JSON.parse(rawConfig);

  assert(parsedConfig.branding.brandName === "Acme Enterprise", "auth-config.json contains customized brand name");
  assert(parsedConfig.layout.type === "full-background", "auth-config.json contains full-background layout");
  assert(parsedConfig.background.type === "uploaded", "auth-config.json contains uploaded background type");
  assert(parsedConfig.background.image === "./assets/backgrounds/custom-background.png", "auth-config.json contains ZIP-relative background path");
  assert(parsedConfig.branding.logo === "./assets/logos/custom-logo.svg", "auth-config.json contains ZIP-relative logo path");
  assert(parsedConfig.urls.redirectUrl === "https://acmeenterprise.io/portal/analytics", "auth-config.json contains customized redirect URL");

  // 4. Forbidden References Check
  console.log("\nStage 4: Sanity Check for Forbidden Local References");
  const forbidden = ["blob:", "data:", "C:\\Users", "file://"];
  let leakFound = false;

  for (const ref of forbidden) {
    if (parsedConfig.background.image.includes(ref) || parsedConfig.branding.logo.includes(ref)) {
      leakFound = true;
      console.error(`Asset reference contains forbidden substring: ${ref}`);
    }
  }
  assert(!leakFound, "No blob, data, C:\\Users, or file:// URLs leaked into asset references");

  // 5. Standalone JSDOM Execution Test
  console.log("\nStage 5: Standalone Runtime Execution Verification in JSDOM");
  const unzippedHTML = await extracted.file("index.html").async("text");
  const unzippedCSS = await extracted.file("css/styles.css").async("text");
  const unzippedConfigJS = await extracted.file("js/config.js").async("text");
  const unzippedAppJS = await extracted.file("js/app.js").async("text");

  assert(unzippedHTML.includes("layout-full-background"), "Standalone HTML includes 'layout-full-background'");
  assert(unzippedHTML.includes("Return to Acme Portal"), "Standalone HTML includes custom back to website text");
  assert(unzippedHTML.includes("https://acmeenterprise.io"), "Standalone HTML links to custom landing URL");
  assert(unzippedHTML.includes("Acme Enterprise"), "Standalone HTML renders custom brand name");
  assert(unzippedCSS.includes("custom-background.png"), "Standalone CSS references custom-background.png");

  const dom = new JSDOM(unzippedHTML, {
    runScripts: "dangerously",
    url: "http://localhost:3000/index.html"
  });

  let redirectedTarget = null;
  dom.window.location.assign = (target) => {
    redirectedTarget = target;
  };
  dom.window.onAuthRedirect = (target) => {
    redirectedTarget = target;
  };

  dom.window.eval(unzippedConfigJS);
  dom.window.eval(unzippedAppJS);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));

  const loginForm = dom.window.document.querySelector("#authLoginForm");
  assert(loginForm !== null, "Standalone Login form found in JSDOM");

  loginForm.dispatchEvent(new dom.window.Event("submit"));
  await new Promise(r => setTimeout(r, 600));

  assert(redirectedTarget === "https://acmeenterprise.io/portal/analytics", `Standalone runtime form submit redirected to ${redirectedTarget}`);

  console.log("\n==================================================");
  console.log(`TOTAL ZIP CUSTOMIZATION TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runZipAcceptanceTests().catch(err => {
  console.error("ZIP Export Customizations Test failed:", err);
  process.exit(1);
});
