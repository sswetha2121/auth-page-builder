/* =========================================================
   AUTH PAGE BUILDER - UNIT & ENGINE TEST SUITE
   File: test_suite.js
========================================================= */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const Constants = require("./js/constants.js");
const { defaultConfig } = require("./js/config.js");
const StateManager = require("./js/state.js");
const Utils = require("./js/utils.js");
const Templates = require("./js/templates.js");
const Renderer = require("./js/renderer.js");
const Download = require("./js/download.js");

console.log("==================================================");
console.log("RUNNING AUTH PAGE BUILDER TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// Group 1: Constants & Default Configuration
// -----------------------------------------------------------------------------
console.log("Test Group 1: Constants & Default Config");
assert(Constants.APP_INFO && Constants.APP_INFO.name === "Auth Page Builder", "APP_INFO is defined");
assert(Object.keys(Constants.PAGE_TYPES).length === 4, "PAGE_TYPES defined with 4 types");
assert(Object.keys(Constants.LAYOUT_TYPES).length === 7, "LAYOUT_TYPES includes all 7 layouts");
assert(Constants.DEFAULT_BACKGROUND_ASSETS.length >= 6, "12 default background assets registered");
assert(Constants.DEFAULT_LOGO_ASSETS.length === 5, "5 default logo assets registered");
assert(defaultConfig.urls.landingPageUrl === "https://customerwebsite.com", "Default landingPageUrl set");
assert(defaultConfig.urls.redirectUrl === "https://customerwebsite.com/dashboard", "Default redirectUrl set");
assert(defaultConfig.pages.otp.displayMode === "separate", "Default OTP displayMode set to 'separate'");

// -----------------------------------------------------------------------------
// Group 2: Central State Management & Deep Path APIs
// -----------------------------------------------------------------------------
console.log("\nTest Group 2: Central State Management & Deep Path APIs");
const state = StateManager;
assert(state.get("urls.landingPageUrl") === "https://customerwebsite.com", "state.get('urls.landingPageUrl') works");

state.set("urls.landingPageUrl", "https://mycustomsite.org");
assert(state.get("urls.landingPageUrl") === "https://mycustomsite.org", "state.set('urls.landingPageUrl') updates state");

state.set("urls.redirectUrl", "https://mycustomsite.org/app");
assert(state.get("urls.redirectUrl") === "https://mycustomsite.org/app", "state.set('urls.redirectUrl') updates state");

// Test independent page customization
state.set("pages.login.title", "Custom Sign In Header");
assert(state.get("pages.login.title") === "Custom Sign In Header", "Login title updated");
assert(state.get("pages.signup.title") === "Create account", "Signup title updated independently");

// Page and Mode switches
state.setActivePage("signup");
assert(state.get("activePage") === "signup", "setActivePage('signup') works");

state.setPreviewMode("mobile");
assert(state.get("previewMode") === "mobile", "setPreviewMode('mobile') works");

// Reset test
state.reset();
assert(state.get("urls.landingPageUrl") === "https://customerwebsite.com", "Reset restores default landing URL");
assert(state.get("activePage") === "login", "Reset restores default activePage");

// -----------------------------------------------------------------------------
// Group 3: Utility Functions
// -----------------------------------------------------------------------------
console.log("\nTest Group 3: Utility Functions");
assert(Utils.isValidUrl("https://example.com/login"), "isValidUrl returns true for valid https URL");
assert(Utils.isValidUrl("http://localhost:3000"), "isValidUrl returns true for http URL");
assert(!Utils.isValidUrl("not-a-valid-url"), "isValidUrl returns false for invalid string");
assert(Utils.escapeHtml('<script>alert("xss")</script>').includes("&lt;script&gt;"), "escapeHtml sanitizes HTML tags");

// -----------------------------------------------------------------------------
// Group 4: Template & HTML Generator (All 4 Pages + OTP Modes)
// -----------------------------------------------------------------------------
console.log("\nTest Group 4: Template & HTML Generator (All 4 Pages + OTP Modes)");
const currentConfig = JSON.parse(JSON.stringify(defaultConfig));

// 4.1 Login Page
const loginHTML = Templates.generateLoginPage(currentConfig);
assert(loginHTML.includes('data-page="login"'), "Login page container rendered");
assert(loginHTML.includes("Welcome back"), "Login title rendered");
assert(loginHTML.includes('id="loginIdentifier"'), "Login identifier input rendered");
assert(loginHTML.includes('id="loginPassword"'), "Login password input rendered");
assert(loginHTML.includes('data-toggle-password'), "Password toggle button rendered");
assert(loginHTML.includes('data-auth-nav="forgotPassword"'), "Forgot password navigation link rendered");
assert(loginHTML.includes('data-auth-nav="otp"'), "Continue with OTP button rendered");
assert(loginHTML.includes('data-otp-method="whatsapp"'), "WhatsApp OTP option rendered");
assert(loginHTML.includes('data-auth-nav="signup"'), "Sign up navigation link rendered");

// 4.2 Inline OTP on Login Page
currentConfig.pages.otp.displayMode = "inline";
const inlineLoginHTML = Templates.generateLoginPage(currentConfig);
assert(inlineLoginHTML.includes("auth-inline-otp-section"), "Inline OTP section rendered on Login page");
assert(inlineLoginHTML.includes("otp-digit-box"), "Dynamic OTP boxes rendered inline on Login page");
assert(inlineLoginHTML.includes("otp-resend-btn"), "Inline OTP resend timer rendered on Login page");
currentConfig.pages.otp.displayMode = "separate"; // reset

// 4.3 Signup Page
const signupHTML = Templates.generateSignupPage(currentConfig);
assert(signupHTML.includes('data-page="signup"'), "Signup page container rendered");
assert(signupHTML.includes('id="signupName"'), "Full Name input rendered");
assert(signupHTML.includes('id="signupUsername"'), "Username input rendered");
assert(signupHTML.includes('id="signupEmail"'), "Email input rendered");
assert(signupHTML.includes('id="signupMobile"'), "Mobile input rendered");
assert(signupHTML.includes('id="signupPassword"'), "Password input rendered");
assert(signupHTML.includes('id="signupConfirmPassword"'), "Confirm Password input rendered");
assert(signupHTML.includes('data-auth-nav="login"'), "Back to sign in link rendered");

// 4.4 Forgot Password Page
const forgotHTML = Templates.generateForgotPasswordPage(currentConfig);
assert(forgotHTML.includes('data-page="forgotPassword"'), "Forgot password container rendered");
assert(forgotHTML.includes('id="forgotIdentifier"'), "Forgot identifier input rendered");
assert(forgotHTML.includes('id="forgotSubmitBtn"'), "Send reset link button rendered");
assert(forgotHTML.includes('data-auth-nav="login"'), "Back to login link rendered");

// 4.5 OTP Verification Page with 4, 6, 8 digits
currentConfig.pages.otp.length = 4;
const otp4HTML = Templates.generateOtpPage(currentConfig);
const count4 = (otp4HTML.match(/class="otp-digit-box"/g) || []).length;
assert(count4 === 4, `OTP length=4 renders exactly 4 digit boxes (found ${count4})`);

currentConfig.pages.otp.length = 6;
const otp6HTML = Templates.generateOtpPage(currentConfig);
const count6 = (otp6HTML.match(/class="otp-digit-box"/g) || []).length;
assert(count6 === 6, `OTP length=6 renders exactly 6 digit boxes (found ${count6})`);

currentConfig.pages.otp.length = 8;
const otp8HTML = Templates.generateOtpPage(currentConfig);
const count8 = (otp8HTML.match(/class="otp-digit-box"/g) || []).length;
assert(count8 === 8, `OTP length=8 renders exactly 8 digit boxes (found ${count8})`);
assert(otp8HTML.includes('data-otp-delivery="whatsapp"'), "WhatsApp delivery pill rendered");
assert(otp8HTML.includes('id="otpResendButton"'), "OTP resend button rendered");

// -----------------------------------------------------------------------------
// Group 5: Full Shell & Standalone Layout Export
// -----------------------------------------------------------------------------
console.log("\nTest Group 5: Full Shell & Standalone Layout Export");
const layouts = [
  "split-left-image",
  "split-right-image",
  "centered",
  "full-background",
  "minimal",
  "card-left",
  "card-right"
];

for (const layoutType of layouts) {
  currentConfig.layout.type = layoutType;
  const standaloneHTML = Download.generateStandaloneIndexHTML(currentConfig);
  assert(standaloneHTML.includes(`layout-${layoutType}`), `generateStandaloneIndexHTML renders class 'layout-${layoutType}'`);
}

// Form Positions
currentConfig.layout.formHorizontalAlignment = "left";
currentConfig.layout.formVerticalAlignment = "top";
const posHTML = Download.generateStandaloneIndexHTML(currentConfig);
assert(posHTML.includes("form-horizontal-left") && posHTML.includes("form-vertical-top"), "Horizontal left & vertical top classes applied");

// -----------------------------------------------------------------------------
// Group 6: Style Variables & Dynamic Customizations
// -----------------------------------------------------------------------------
console.log("\nTest Group 6: Style Variables Calculation");
currentConfig.layout.imageWidth = 70;
currentConfig.card.borderRadius = 35;
currentConfig.button.height = 54;
currentConfig.typography.titleSize = 38;
currentConfig.typography.fontFamily = "Georgia, serif";
currentConfig.pages.otp.boxWidth = 52;
currentConfig.pages.otp.boxHeight = 58;

const cssVars = Renderer.computeStyleVariables(currentConfig);
assert(cssVars.includes("--auth-image-width: 70%"), "--auth-image-width calculated correctly");
assert(cssVars.includes("--auth-card-radius: 35px"), "--auth-card-radius calculated correctly");
assert(cssVars.includes("--auth-button-height: 54px"), "--auth-button-height calculated correctly");
assert(cssVars.includes("--auth-title-size: 38px"), "--auth-title-size calculated correctly");
assert(cssVars.includes("--auth-font-family: Georgia, serif"), "--auth-font-family calculated correctly");
assert(cssVars.includes("--otp-box-width: 52px"), "--otp-box-width calculated correctly");

// -----------------------------------------------------------------------------
// Group 7: Standalone ZIP Package Export Integrity
// -----------------------------------------------------------------------------
console.log("\nTest Group 7: Standalone ZIP Package Export Integrity");
const standaloneCSS = Download.generateStandaloneCSS(currentConfig);
assert(standaloneCSS.length > 500 && standaloneCSS.includes(".auth-preview-root"), "Standalone CSS generated with rules");

const standaloneJS = Download.generateStandaloneAppJS();
assert(standaloneJS.includes("initOtpInputs") && standaloneJS.includes("initNavigation"), "Standalone JS contains runtime logic");

const integrationJS = Download.generateIntegrationJS(currentConfig);
assert(integrationJS.includes("AuthBridge") && integrationJS.includes("navigateToAuth"), "Integration JS contains bridge logic");

const integrationSnippet = Download.generateIntegrationSnippetHTML(currentConfig);
assert(integrationSnippet.includes("auth-login-link") || integrationSnippet.includes("data-auth-login-trigger"), "Integration snippet generated");

const standaloneHTML = Download.generateStandaloneIndexHTML(currentConfig);
assert(standaloneHTML.includes('rel="stylesheet" href="./css/styles.css"'), "Standalone HTML links to ./css/styles.css");
assert(standaloneHTML.includes('src="./js/config.js"'), "Standalone HTML links to ./js/config.js");
assert(standaloneHTML.includes('src="./js/app.js"'), "Standalone HTML links to ./js/app.js");

// Generate an in-memory ZIP package and test structure
async function testZipCreation() {
  const zip = new JSZip();
  const folder = zip.folder("generated-auth-page");
  
  folder.file("config.json", JSON.stringify({
    landingPageUrl: currentConfig.urls.landingPageUrl,
    redirectUrl: currentConfig.urls.redirectUrl,
    authentication: currentConfig.authentication
  }, null, 2));

  folder.folder("css").file("styles.css", standaloneCSS);
  folder.folder("js").file("config.js", "window.AUTH_CONFIG = {};");
  folder.folder("js").file("app.js", standaloneJS);
  folder.folder("js").file("integration.js", integrationJS);
  folder.file("integration-snippet.html", integrationSnippet);
  folder.folder("assets").folder("backgrounds").file("test-bg.jpg", "image-content");
  folder.file("index.html", standaloneHTML);
  folder.file("README.md", Download.generateReadme(currentConfig));

  const zipBlob = await zip.generateAsync({ type: "nodebuffer" });
  assert(zipBlob.length > 0, "ZIP buffer created successfully");

  // Read back ZIP and verify contents
  const loadedZip = await JSZip.loadAsync(zipBlob);
  assert(loadedZip.file("generated-auth-page/index.html") !== null, "ZIP contains generated-auth-page/index.html");
  assert(loadedZip.file("generated-auth-page/css/styles.css") !== null, "ZIP contains generated-auth-page/css/styles.css");
  assert(loadedZip.file("generated-auth-page/js/config.js") !== null, "ZIP contains generated-auth-page/js/config.js");
  assert(loadedZip.file("generated-auth-page/js/app.js") !== null, "ZIP contains generated-auth-page/js/app.js");
  assert(loadedZip.file("generated-auth-page/js/integration.js") !== null, "ZIP contains generated-auth-page/js/integration.js");
  assert(loadedZip.file("generated-auth-page/integration-snippet.html") !== null, "ZIP contains generated-auth-page/integration-snippet.html");
  assert(loadedZip.file("generated-auth-page/config.json") !== null, "ZIP contains generated-auth-page/config.json");
  assert(loadedZip.file("generated-auth-page/README.md") !== null, "ZIP contains generated-auth-page/README.md");

  const configContent = await loadedZip.file("generated-auth-page/config.json").async("text");
  const parsed = JSON.parse(configContent);
  assert(parsed.landingPageUrl === "https://customerwebsite.com", "ZIP config.json stores landingPageUrl");
  assert(parsed.redirectUrl === "https://customerwebsite.com/dashboard", "ZIP config.json stores redirectUrl");
}

testZipCreation().then(() => {
  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");
  if (failed > 0) {
    process.exit(1);
  }
}).catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
