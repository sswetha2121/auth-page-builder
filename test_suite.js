/* =========================================================
   AUTH PAGE BUILDER - AUTOMATED AUDIT & VERIFICATION SUITE
   File: test_suite.js
========================================================= */

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

// Make JSZip global for testing
global.JSZip = JSZip;

console.log("==================================================");
console.log("RUNNING AUTH PAGE BUILDER TEST SUITE");
console.log("==================================================\n");

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

// 1. Load Modules
const { APP_INFO, PAGE_TYPES, LAYOUT_TYPES, DEFAULT_BACKGROUND_ASSETS, DEFAULT_LOGO_ASSETS } = require("./js/constants.js");
const { defaultConfig } = require("./js/config.js");
const state = require("./js/state.js");
const Utils = require("./js/utils.js");
const Templates = require("./js/templates.js");
const Renderer = require("./js/renderer.js");
const Download = require("./js/download.js");

console.log("Test Group 1: Constants & Default Config");
assert(APP_INFO && APP_INFO.name === "Auth Page Builder", "APP_INFO is defined");
assert(PAGE_TYPES.LOGIN === "login" && PAGE_TYPES.OTP === "otp", "PAGE_TYPES defined");
assert(LAYOUT_TYPES.MINIMAL === "minimal" && LAYOUT_TYPES.CARD_LEFT === "card-left", "LAYOUT_TYPES includes all 7 layouts");
assert(DEFAULT_BACKGROUND_ASSETS.length === 5, "5 default background assets registered");
assert(DEFAULT_LOGO_ASSETS.length === 5, "5 default logo assets registered");
assert(defaultConfig.urls.landingPageUrl === "https://customerwebsite.com", "Default landingPageUrl set");
assert(defaultConfig.urls.redirectUrl === "https://customerwebsite.com/dashboard", "Default redirectUrl set");

console.log("\nTest Group 2: Central State Management & Deep Path APIs");
assert(state.get("urls.landingPageUrl") === "https://customerwebsite.com", "state.get('urls.landingPageUrl') works");
state.set("urls.landingPageUrl", "https://mysite.io");
assert(state.get("urls.landingPageUrl") === "https://mysite.io", "state.set('urls.landingPageUrl') updates state");

state.set("urls.redirectUrl", "https://mysite.io/welcome");
assert(state.get("urls.redirectUrl") === "https://mysite.io/welcome", "state.set('urls.redirectUrl') updates state");

// Page Switching & Isolation
state.set("pages.login.title", "Custom Login Title");
state.set("pages.signup.title", "Custom Signup Title");
assert(state.get("pages.login.title") === "Custom Login Title", "Login title updated");
assert(state.get("pages.signup.title") === "Custom Signup Title", "Signup title updated independently");

state.setActivePage("signup");
assert(state.getState().activePage === "signup", "setActivePage('signup') works");

state.setPreviewMode("mobile");
assert(state.getState().previewMode === "mobile", "setPreviewMode('mobile') works");

// Reset State
state.reset();
assert(state.get("urls.landingPageUrl") === "https://customerwebsite.com", "Reset restores default landing URL");
assert(state.getState().activePage === "login", "Reset restores default activePage");

console.log("\nTest Group 3: Utility Functions");
assert(Utils.isValidUrl("https://example.com"), "isValidUrl returns true for valid https URL");
assert(Utils.isValidUrl("http://localhost:3000/app"), "isValidUrl returns true for http URL");
assert(!Utils.isValidUrl("not-a-url"), "isValidUrl returns false for invalid string");
assert(Utils.escapeHtml("<script>") === "&lt;script&gt;", "escapeHtml sanitizes HTML tags");

console.log("\nTest Group 4: Template & HTML Generator (All 4 Pages)");
const currentConfig = state.getState();

// TEST: Login Page HTML
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

// TEST: Signup Page HTML
const signupHTML = Templates.generateSignupPage(currentConfig);
assert(signupHTML.includes('data-page="signup"'), "Signup page container rendered");
assert(signupHTML.includes('id="signupName"'), "Full Name input rendered");
assert(signupHTML.includes('id="signupUsername"'), "Username input rendered");
assert(signupHTML.includes('id="signupEmail"'), "Email input rendered");
assert(signupHTML.includes('id="signupMobile"'), "Mobile input rendered");
assert(signupHTML.includes('id="signupPassword"'), "Password input rendered");
assert(signupHTML.includes('id="signupConfirmPassword"'), "Confirm Password input rendered");
assert(signupHTML.includes('data-auth-nav="login"'), "Back to sign in link rendered");

// TEST: Forgot Password Page HTML
const forgotHTML = Templates.generateForgotPasswordPage(currentConfig);
assert(forgotHTML.includes('data-page="forgotPassword"'), "Forgot password container rendered");
assert(forgotHTML.includes('id="forgotIdentifier"'), "Forgot identifier input rendered");
assert(forgotHTML.includes('id="forgotSubmitBtn"'), "Send reset link button rendered");
assert(forgotHTML.includes('data-auth-nav="login"'), "Back to login link rendered");

// TEST: OTP Verification Page HTML (4, 6, 8 digits)
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

console.log("\nTest Group 5: Full Shell & Layouts Rendering");
// All 7 Layouts
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
  const shellHTML = Templates.generateAuthShell(currentConfig, "login");
  assert(shellHTML.includes(`layout-${layoutType}`), `generateAuthShell renders class 'layout-${layoutType}'`);
}

// Form Positions
currentConfig.layout.formHorizontalAlignment = "left";
currentConfig.layout.formVerticalAlignment = "top";
const posHTML = Templates.generateAuthShell(currentConfig, "login");
assert(posHTML.includes("form-horizontal-left") && posHTML.includes("form-vertical-top"), "Horizontal left & vertical top classes applied");

console.log("\nTest Group 6: Style Variables Calculation");
currentConfig.layout.imageWidth = 70;
currentConfig.card.borderRadius = 35;
currentConfig.button.height = 54;
currentConfig.typography.titleSize = 38;
currentConfig.typography.fontFamily = "Georgia, serif";

const cssVars = Renderer.computeStyleVariables(currentConfig);
assert(cssVars.includes("--auth-image-width: 70%"), "--auth-image-width calculated correctly");
assert(cssVars.includes("--auth-card-radius: 35px"), "--auth-card-radius calculated correctly");
assert(cssVars.includes("--auth-button-height: 54px"), "--auth-button-height calculated correctly");
assert(cssVars.includes("--auth-title-size: 38px"), "--auth-title-size calculated correctly");
assert(cssVars.includes("--auth-font-family: Georgia, serif"), "--auth-font-family calculated correctly");

console.log("\nTest Group 7: Standalone ZIP Package Export Integrity");
const standaloneCSS = Download.generateStandaloneCSS(currentConfig);
assert(standaloneCSS.length > 500 && standaloneCSS.includes(".auth-preview-root"), "Standalone CSS generated with rules");

const standaloneJS = Download.generateStandaloneAppJS();
assert(standaloneJS.includes("initOtpInputs") && standaloneJS.includes("initNavigation"), "Standalone JS contains runtime logic");

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
