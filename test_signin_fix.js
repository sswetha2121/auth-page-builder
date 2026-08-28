/**
 * Verification Script for Sign In Submission, Single Toast, and Browser Redirection Fix
 */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

function setupDOM() {
  const indexHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
  const dom = new JSDOM(indexHtml, {
    url: "http://localhost:3000/",
    runScripts: "dangerously",
    resources: "usable"
  });

  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;

  // Load project modules in order
  const files = [
    "js/constants.js",
    "js/config.js",
    "js/utils.js",
    "js/state.js",
    "js/api/client.js",
    "js/api/auth.js",
    "js/api/projects.js",
    "js/templates.js",
    "js/renderer.js",
    "js/controls.js",
    "js/customization.js",
    "js/preview.js",
    "js/fullscreen.js",
    "js/download.js",
    "js/app.js"
  ];

  for (const file of files) {
    const code = fs.readFileSync(path.join(__dirname, file), "utf-8");
    window.eval(code);
  }

  // Trigger DOMContentLoaded
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

  return dom;
}

async function runTests() {
  console.log("\n==================================================");
  console.log("TESTING SIGN IN FIX: SINGLE TOAST & REAL REDIRECTION");
  console.log("==================================================\n");

  const dom = setupDOM();
  const { window } = dom;

  // Configure custom redirect URL
  const expectedRedirect = "https://customertenant.com/app/dashboard";
  window.state.set("urls.redirectUrl", expectedRedirect);
  window.state.setActivePage("login");

  // 1. Verify Renderer does NOT add duplicate submit listeners
  let toastCount = 0;
  let lastToastMsg = "";
  let lastToastType = "";
  const showToastSpy = (msg, type) => {
    toastCount++;
    lastToastMsg = msg;
    lastToastType = type;
  };
  window.Utils.showToast = showToastSpy;
  if (typeof global !== "undefined" && global.Utils) {
    global.Utils.showToast = showToastSpy;
  }

  const previewRoot = window.document.getElementById("previewRoot");
  const loginForm = previewRoot.querySelector("#authLoginForm");
  const identifierInput = loginForm.querySelector("#loginIdentifier");
  const passwordInput = loginForm.querySelector("#loginPassword");

  identifierInput.value = "admin@enterprise.com";
  passwordInput.value = "SecurePass123";

  // Mock location to capture redirection
  let redirectedTo = null;
  window.onAuthRedirect = (url) => { redirectedTo = url; };
  window.location.assign = (url) => { redirectedTo = url; };
  window.location.replace = (url) => { redirectedTo = url; };

  // Mock successful backend response
  window.AuthController.loginUser = async () => ({
    success: true,
    message: "Authentication successful!",
    redirect_url: expectedRedirect
  });

  // TRIGGER FORM SUBMISSION
  const submitEvent = new window.Event("submit", { bubbles: true, cancelable: true });
  loginForm.dispatchEvent(submitEvent);

  // Wait for async handler & redirect timeout
  await new Promise(resolve => setTimeout(resolve, 600));

  console.log(`1. Toast Notifications Count: ${toastCount} (Expected: 1)`);
  console.log(`   Toast Message: "${lastToastMsg}"`);
  console.log(`   Toast Type: "${lastToastType}"`);
  console.log(`   Redirect Destination: "${redirectedTo}" (Expected: "${expectedRedirect}")`);

  if (toastCount === 1) {
    console.log("  [PASS] TEST 1: Exactly ONE toast notification triggered on Sign In");
  } else {
    console.error(`  [FAIL] TEST 1: Expected 1 toast notification, but received ${toastCount}`);
    process.exit(1);
  }

  if (lastToastType === "success" && lastToastMsg.includes(expectedRedirect)) {
    console.log("  [PASS] TEST 2: Success toast includes the configured redirect URL");
  } else {
    console.error(`  [FAIL] TEST 2: Toast message does not include redirect URL: "${lastToastMsg}"`);
    process.exit(1);
  }

  if (redirectedTo === expectedRedirect) {
    console.log("  [PASS] TEST 3: Browser ACTUALLY redirected to configured Post-Auth URL");
  } else {
    console.error(`  [FAIL] TEST 3: Browser failed to redirect. Value: "${redirectedTo}"`);
    process.exit(1);
  }

  // TEST 4: Invalid credentials error handling
  toastCount = 0;
  redirectedTo = null;
  window.Utils.showToast = showToastSpy;
  window.AuthController.loginUser = async () => {
    throw new Error("Invalid username or password.");
  };

  await window.handleAuthSubmit({ preventDefault: () => {}, target: loginForm }, "login");
  await new Promise(resolve => setTimeout(resolve, 200));

  console.log(`\n2. Invalid Credentials Test:`);
  console.log(`   Toast Count: ${toastCount} | Message: "${lastToastMsg}" | Type: "${lastToastType}"`);
  console.log(`   Redirect Executed: ${Boolean(redirectedTo)}`);

  if (toastCount === 1 && lastToastType === "error" && lastToastMsg === "Invalid username or password.") {
    console.log("  [PASS] TEST 4: Exactly ONE error toast shown on invalid credentials");
  } else {
    console.error(`  [FAIL] TEST 4: Error handling failed`);
    process.exit(1);
  }

  if (!redirectedTo) {
    console.log("  [PASS] TEST 5: No redirection executed when authentication fails");
  } else {
    console.error(`  [FAIL] TEST 5: Unexpected redirection on error`);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("ALL SIGN IN FIX TESTS PASSED 100%!");
  console.log("==================================================\n");
}

runTests();
