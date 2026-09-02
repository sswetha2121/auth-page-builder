/* =========================================================
   AUTH PAGE BUILDER - STANDALONE ZIP PACKAGE E2E ACCEPTANCE TEST
   File: test_standalone_zip_package.js
========================================================= */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const JSZip = require("jszip");
const { JSDOM } = require("jsdom");

const Constants = require("./js/constants.js");
const { defaultConfig } = require("./js/config.js");
const StateManager = require("./js/state.js");
const Utils = require("./js/utils.js");
const Templates = require("./js/templates.js");
const Renderer = require("./js/renderer.js");
const Download = require("./js/download.js");

console.log("==================================================");
console.log("STANDALONE EXPORTED ZIP PACKAGE E2E ACCEPTANCE TEST");
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

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on("error", reject);
  });
}

async function runStandalonePackageTest() {
  // 1. Configure Custom State for Test (Section 16 Requirements)
  global.state = StateManager;
  StateManager.reset();

  StateManager.set("branding.brandName", "Acme Security");
  StateManager.set("branding.uploadedLogo", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9IiNlMTFkNDgiLz48L3N2Zz4=");
  StateManager.set("branding.logoShape", "circle");
  StateManager.set("typography.headingText", "Welcome Back to Acme");
  StateManager.set("pages.login.title", "Welcome Back to Acme");
  StateManager.set("layout.type", "full-background");
  StateManager.set("background.type", "uploaded");
  StateManager.set("background.uploadedImage", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
  StateManager.set("background.selected", "assets/backgrounds/background-3.svg");
  StateManager.set("button.backgroundColor", "#e11d48");
  StateManager.set("urls.redirectUrl", "/dashboard");
  StateManager.set("redirect.redirectUrl", "/dashboard");

  StateManager.set("pages.login.passwordEnabled", true);
  StateManager.set("pages.login.otpEnabled", true);
  StateManager.set("pages.login.forgotPasswordEnabled", true);
  StateManager.set("social.providers.google", true);
  StateManager.set("social.providers.github", true);

  const canonicalState = StateManager.serializeCurrentConfiguration();
  assert(canonicalState.branding.brandName === "Acme Security", "State serializes Brand Name: 'Acme Security'");
  assert(canonicalState.pages.login.title === "Welcome Back to Acme", "State serializes Heading: 'Welcome Back to Acme'");
  assert(canonicalState.layout.type === "full-background", "State serializes Layout: 'full-background'");
  assert(canonicalState.background.type === "uploaded", "State serializes Background: uploaded");
  assert(canonicalState.button.backgroundColor === "#e11d48", "State serializes Button Color: #e11d48");
  assert(canonicalState.redirect.redirectUrl === "/dashboard", "State serializes Redirect URL: /dashboard");
  assert(canonicalState.pages.login.otpEnabled === true, "State serializes OTP enabled: true");
  assert(canonicalState.pages.login.forgotPasswordEnabled === true, "State serializes Forgot Password enabled: true");
  assert(canonicalState.social.providers.google === true, "State serializes Google social: true");
  assert(canonicalState.social.providers.github === true, "State serializes GitHub social: true");

  // 2. Execute Real Download Export Pipeline via downloadPackage()
  console.log("\nStage 2: Executing Actual downloadPackage() Pipeline");
  const zipBuffer = await Download.downloadPackage();
  assert(zipBuffer && zipBuffer.length > 0, "Download Package generated fresh ZIP buffer");

  // 3. Extract Downloaded ZIP to Scratch Workspace
  console.log("\nStage 3: Extracting Package to Scratch Workspace");
  const scratchDir = path.join(__dirname, "scratch_test_extracted_pkg");
  if (fs.existsSync(scratchDir)) {
    fs.rmSync(scratchDir, { recursive: true, force: true });
  }
  fs.mkdirSync(scratchDir, { recursive: true });

  const extractedZip = await JSZip.loadAsync(zipBuffer);
  for (const relativePath of Object.keys(extractedZip.files)) {
    const entry = extractedZip.files[relativePath];
    const targetPath = path.join(scratchDir, relativePath);
    if (entry.dir) {
      fs.mkdirSync(targetPath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      const contentBuf = await entry.async("nodebuffer");
      fs.writeFileSync(targetPath, contentBuf);
    }
  }

  assert(fs.existsSync(path.join(scratchDir, "index.html")), "Extracted package contains root index.html");
  assert(fs.existsSync(path.join(scratchDir, "server.js")), "Extracted package contains root server.js");
  assert(fs.existsSync(path.join(scratchDir, "package.json")), "Extracted package contains root package.json");
  assert(fs.existsSync(path.join(scratchDir, "config", "assets-manifest.json")), "Extracted package contains config/assets-manifest.json");
  assert(fs.existsSync(path.join(scratchDir, "assets", "backgrounds", "default", "background-3.svg")), "Extracted package contains assets/backgrounds/default/background-3.svg");
  assert(fs.existsSync(path.join(scratchDir, "assets", "logos", "default", "brand-shield.svg")), "Extracted package contains assets/logos/default/brand-shield.svg");

  const rootIndexHTML = fs.readFileSync(path.join(scratchDir, "index.html"), "utf-8");
  assert(!rootIndexHTML.includes("Live Authentication STUDIO"), "Extracted index.html does NOT contain Builder Studio UI");
  assert(!rootIndexHTML.includes("Download Package"), "Extracted index.html does NOT contain 'Download Package' button");
  assert(!rootIndexHTML.includes("Save Changes"), "Extracted index.html does NOT contain 'Save Changes' button");
  assert(!rootIndexHTML.includes("js/controls.js"), "Extracted index.html does NOT link to Builder controls.js");
  assert(rootIndexHTML.includes("auth-preview-root"), "Extracted index.html DOES contain generated auth page root");

  // 4. Verify auth-config.json and assets-manifest.json Content
  console.log("\nStage 4: Verifying auth-config.json & assets-manifest.json Payload");
  const authConfigContent = fs.readFileSync(path.join(scratchDir, "config", "auth-config.json"), "utf-8");
  const parsedConfig = JSON.parse(authConfigContent);

  const manifestContent = fs.readFileSync(path.join(scratchDir, "config", "assets-manifest.json"), "utf-8");
  const parsedManifest = JSON.parse(manifestContent);
  assert(parsedManifest && parsedManifest.backgrounds && parsedManifest.logos, "assets-manifest.json parses valid background and logo arrays");

  assert(parsedConfig.branding.brandName === "Acme Security", "auth-config.json contains 'Acme Security'");
  assert(parsedConfig.pages.login.title === "Welcome Back to Acme", "auth-config.json contains 'Welcome Back to Acme'");
  assert(parsedConfig.layout.type === "full-background", "auth-config.json contains layout 'full-background'");
  assert(parsedConfig.button.backgroundColor === "#e11d48", "auth-config.json contains button color '#e11d48'");
  assert(parsedConfig.redirect.redirectUrl === "/dashboard", "auth-config.json contains redirectUrl '/dashboard'");
  assert(parsedConfig.pages.login.otpEnabled === true, "auth-config.json contains OTP enabled");
  assert(parsedConfig.pages.login.forgotPasswordEnabled === true, "auth-config.json contains Forgot Password enabled");
  assert(parsedConfig.social.providers.google === true, "auth-config.json contains Google enabled");
  assert(parsedConfig.social.providers.github === true, "auth-config.json contains GitHub enabled");

  // 5. Forbidden References Check (Section 21 Requirements)
  console.log("\nStage 5: Checking Forbidden Local References");
  const indexHtmlTxt = fs.readFileSync(path.join(scratchDir, "index.html"), "utf-8");
  const appJsTxt = fs.readFileSync(path.join(scratchDir, "js", "app.js"), "utf-8");
  const cssTxt = fs.readFileSync(path.join(scratchDir, "css", "styles.css"), "utf-8");

  const forbiddenRefs = ["blob:", "C:\\Users", "file://", "localhost:8000"];
  let leakDetected = false;
  for (const ref of forbiddenRefs) {
    if (indexHtmlTxt.includes(ref) || authConfigContent.includes(ref) || appJsTxt.includes(ref) || cssTxt.includes(ref)) {
      console.error(`  [FAIL] Forbidden reference found in package: ${ref}`);
      leakDetected = true;
    }
  }
  assert(!leakDetected, "No blob, C:\\Users, file://, or localhost:8000 references in runtime package files");

  // 5B. Test Interactive Standalone DOM Navigation & Hash Routing
  console.log("\nStage 5B: Testing Interactive Standalone DOM Navigation & Hash Routing");
  const extractedDom = new JSDOM(indexHtmlTxt, {
    url: `http://localhost:3000/`
  });

  extractedDom.window.AUTH_CONFIG = parsedConfig;
  extractedDom.window.showToast = () => {};
  extractedDom.window.RedirectService = { execute: (cfg) => ({ success: true, url: cfg.redirectUrl }) };

  // Execute app.js in extracted DOM context
  const evalScript = new extractedDom.window.Function("window", "document", "history", "location", appJsTxt);
  evalScript(extractedDom.window, extractedDom.window.document, extractedDom.window.history, extractedDom.window.location);

  // Fire DOMContentLoaded event
  extractedDom.window.document.dispatchEvent(new extractedDom.window.Event("DOMContentLoaded"));

  const doc = extractedDom.window.document;
  const loginWrapper = doc.querySelector('.auth-page-form-wrapper[data-page="login"]');
  const signupWrapper = doc.querySelector('.auth-page-form-wrapper[data-page="signup"]');
  const otpWrapper = doc.querySelector('.auth-page-form-wrapper[data-page="otp"]');
  const forgotWrapper = doc.querySelector('.auth-page-form-wrapper[data-page="forgotPassword"]');

  // Test 1: Click "Create account" link
  const signupLink = doc.querySelector('[data-auth-nav="signup"]') || doc.querySelector('a[href*="signup"]');
  assert(signupLink !== null, "Extracted index.html contains 'Create account' link");
  if (signupLink) {
    signupLink.dispatchEvent(new extractedDom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    assert(signupWrapper.closest('.auth-page-tab-content').style.display === "block", "Clicking 'Create account' switches tab display to 'signup'");
    assert(loginWrapper.closest('.auth-page-tab-content').style.display === "none", "Clicking 'Create account' hides 'login' tab");
  }

  // Test 2: Click "Continue with OTP" button
  const otpBtn = doc.querySelector('[data-auth-nav="otp"]') || doc.querySelector('button[data-auth-nav="otp"]');
  assert(otpBtn !== null, "Extracted index.html contains 'Continue with OTP' button");
  if (otpBtn) {
    otpBtn.dispatchEvent(new extractedDom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    assert(otpWrapper.closest('.auth-page-tab-content').style.display === "block", "Clicking 'Continue with OTP' switches tab display to 'otp'");
  }

  // Test 3: Click "Forgot password?" link
  const forgotLink = doc.querySelector('[data-auth-nav="forgotPassword"]') || doc.querySelector('a[href*="forgot"]');
  assert(forgotLink !== null, "Extracted index.html contains 'Forgot password?' link");
  if (forgotLink) {
    forgotLink.dispatchEvent(new extractedDom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    assert(forgotWrapper.closest('.auth-page-tab-content').style.display === "block", "Clicking 'Forgot password?' switches tab display to 'forgotPassword'");
  }

  // Test 4: Click "Back to login" link
  const backToLoginLink = doc.querySelector('[data-auth-nav="login"]') || doc.querySelector('a[href*="login"]');
  assert(backToLoginLink !== null, "Extracted index.html contains 'Back to login' link");
  if (backToLoginLink) {
    backToLoginLink.dispatchEvent(new extractedDom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    assert(loginWrapper.closest('.auth-page-tab-content').style.display === "block", "Clicking 'Back to login' switches tab display back to 'login'");
  }

  // 6. Start Standalone Server and Verify HTTP Endpoints
  console.log("\nStage 6: Starting Standalone Server & Testing HTTP Endpoints");
  const TEST_PORT = 49152 + Math.floor(Math.random() * 10000);

  const serverProc = spawn("node", ["server.js"], {
    cwd: scratchDir,
    env: Object.assign({}, process.env, { PORT: String(TEST_PORT) }),
    stdio: ["pipe", "pipe", "pipe"]
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rootRes = await httpGet(`http://localhost:${TEST_PORT}/`);
  assert(rootRes.status === 200, `GET / returns HTTP 200 (Got ${rootRes.status})`);
  assert(rootRes.body.includes("Acme Security"), "GET / contains custom Brand Name 'Acme Security'");
  assert(rootRes.body.includes("Welcome Back to Acme"), "GET / contains custom Heading 'Welcome Back to Acme'");
  assert(rootRes.body.includes("layout-full-background"), "GET / contains layout class 'layout-full-background'");
  assert(!rootRes.body.includes("404"), "GET / does NOT return 404 error page");

  const configRes = await httpGet(`http://localhost:${TEST_PORT}/config/auth-config.json`);
  assert(configRes.status === 200, `GET /config/auth-config.json returns HTTP 200`);

  const cssRes = await httpGet(`http://localhost:${TEST_PORT}/css/styles.css`);
  assert(cssRes.status === 200, "GET /css/styles.css returns HTTP 200");
  assert(cssRes.body.includes("custom-background.png"), "CSS contains custom background path reference");

  const jsRes = await httpGet(`http://localhost:${TEST_PORT}/js/app.js`);
  assert(jsRes.status === 200, "GET /js/app.js returns HTTP 200");

  const bgAssetRes = await httpGet(`http://localhost:${TEST_PORT}/assets/backgrounds/custom-background.png`);
  assert(bgAssetRes.status === 200, "GET /assets/backgrounds/custom-background.png returns HTTP 200");

  // 7. Second Download Isolation Test (Section 18 Requirements)
  console.log("\nStage 7: Testing Second Download Isolation & Fresh Serialization");
  StateManager.set("branding.brandName", "Second Corp Security");
  StateManager.set("card.borderRadius", 32);

  const zip2Buffer = await Download.downloadPackage();
  const zip2Extracted = await JSZip.loadAsync(zip2Buffer);
  const authConfig2Str = await zip2Extracted.file("config/auth-config.json").async("string");
  const parsed2Config = JSON.parse(authConfig2Str);

  assert(parsed2Config.branding.brandName === "Second Corp Security", "Download #2 reflects new Brand Name 'Second Corp Security'");
  assert(parsed2Config.card.borderRadius === 32, "Download #2 reflects new Border Radius 32px");
  assert(parsed2Config.branding.brandName !== "Acme Security", "Download #2 does NOT leak stale state from Download #1");

  // Cleanup server process
  serverProc.kill("SIGTERM");
  try { fs.rmSync(scratchDir, { recursive: true, force: true }); } catch (e) {}

  console.log("\n==================================================");
  console.log(`STANDALONE PACKAGE E2E RESULTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runStandalonePackageTest().catch((err) => {
  console.error("Standalone Package Test execution failed:", err);
  process.exit(1);
});
