/* =========================================================
   AUTH PAGE BUILDER - END-TO-END ZIP EXPORT & VERIFICATION TEST
   File: test_e2e_zip_export.js
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
const ApiClient = require("./js/api/client.js");
const ProjectsApi = require("./js/api/projects.js");
const AssetsApi = require("./js/api/assets.js");
const AuthController = require("./js/api/auth.js");

console.log("==================================================");
console.log("RUNNING END-TO-END ZIP EXPORT & RUNTIME VERIFICATION");
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

async function runE2ETests() {
  // 1. Test API Abstraction Layer
  console.log("Test Section 1: API Abstraction Layer");
  assert(ApiClient && typeof ApiClient.request === "function", "ApiClient is initialized");
  assert(ProjectsApi && typeof ProjectsApi.saveProject === "function", "ProjectsApi service is available");
  assert(AssetsApi && typeof AssetsApi.uploadAsset === "function", "AssetsApi service is available");
  assert(AuthController && typeof AuthController.handleLogin === "function", "AuthController service is available");

  const projectPayload = ProjectsApi.createProjectPayload(defaultConfig);
  assert(projectPayload.id.startsWith("proj_"), "Project payload generated with unique ID");
  assert(projectPayload.configuration.urls.landingPageUrl === "https://customerwebsite.com", "Project payload captures URLs");

  // 2. Configure Custom State for Export
  console.log("\nTest Section 2: Custom Multi-Feature State Configuration");
  const testState = JSON.parse(JSON.stringify(defaultConfig));
  testState.layout.type = "split-right-image";
  testState.layout.imageWidth = 65;
  testState.layout.formHorizontalAlignment = "left";
  testState.layout.formVerticalAlignment = "top";
  
  testState.branding.brandName = "Apex Systems";
  testState.branding.logoShape = "ellipse";
  testState.branding.logoSize = 80;
  testState.branding.uploadedLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==";
  
  testState.background.type = "uploaded";
  testState.background.color = "#0b1120";
  testState.background.uploadedImage = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  
  testState.urls.landingPageUrl = "https://apexsystems.io";
  testState.urls.redirectUrl = "https://apexsystems.io/portal/dashboard";
  testState.urls.authPageUrl = "https://apexsystems.io/auth";
  testState.urls.showBackToWebsite = true;
  testState.urls.backToWebsiteText = "Return to Apex Portal";

  testState.redirect = {
    enabled: true,
    redirectUrl: "https://apexsystems.io/portal/dashboard",
    redirectType: "url",
    openInNewTab: false,
    showSuccessMessage: true,
    successMessage: "Authentication completed successfully.",
    delay: 0
  };
  
  testState.authentication.otp.defaultMethod = "whatsapp";
  testState.authentication.otp.whatsappEnabled = true;
  testState.pages.otp.length = 8;
  testState.pages.otp.resendSeconds = 45;
  testState.pages.otp.resendPromptText = "Need another verification code?";
  testState.pages.otp.backToSignInText = "Return to Apex Sign In";

  // 3. Test In-Memory ZIP Generation & Structure
  console.log("\nTest Section 3: In-Memory ZIP Package Generation & Extension Integrity");
  
  const zip = new JSZip();
  const folder = zip.folder("generated-auth-page");
  const cssFolder = folder.folder("css");
  const jsFolder = folder.folder("js");
  const assetsFolder = folder.folder("assets");
  const bgFolder = assetsFolder.folder("backgrounds");
  const logoFolder = assetsFolder.folder("logos");

  // Extension detection test
  const bgMeta = Download.detectMimeAndExt(testState.background.uploadedImage, "webp");
  const logoMeta = Download.detectMimeAndExt(testState.branding.uploadedLogo, "svg");
  assert(bgMeta.ext === "webp" && bgMeta.mime === "image/webp", "detectMimeAndExt accurately identifies WebP background");
  assert(logoMeta.ext === "svg" && logoMeta.mime === "image/svg+xml", "detectMimeAndExt accurately identifies SVG logo");

  const bgData = testState.background.uploadedImage.split(",")[1];
  const logoData = testState.branding.uploadedLogo.split(",")[1];
  bgFolder.file(`custom-background.${bgMeta.ext}`, bgData, { base64: true });
  logoFolder.file(`custom-logo.${logoMeta.ext}`, logoData, { base64: true });

  testState.background.image = `./assets/backgrounds/custom-background.${bgMeta.ext}`;
  testState.background.uploadedImage = "";
  testState.branding.logo = `./assets/logos/custom-logo.${logoMeta.ext}`;
  testState.branding.uploadedLogo = "";

  // Copy default assets
  for (const item of Constants.DEFAULT_LOGO_ASSETS) {
    const filename = item.path.split("/").pop();
    const diskPath = path.join(__dirname, item.path);
    if (fs.existsSync(diskPath)) {
      logoFolder.file(filename, fs.readFileSync(diskPath));
    }
  }

  for (const item of Constants.DEFAULT_BACKGROUND_ASSETS) {
    const filename = item.path.split("/").pop();
    const diskPath = path.join(__dirname, item.path);
    if (fs.existsSync(diskPath)) {
      bgFolder.file(filename, fs.readFileSync(diskPath));
    }
  }

  const standaloneCSS = Download.generateStandaloneCSS(testState);
  const standaloneAppJS = Download.generateStandaloneAppJS();
  const integrationJS = Download.generateIntegrationJS(testState);
  const snippetHTML = Download.generateIntegrationSnippetHTML(testState);
  const standaloneHTML = Download.generateStandaloneIndexHTML(testState);
  const readme = Download.generateReadme(testState);

  cssFolder.file("styles.css", standaloneCSS);
  jsFolder.file("config.js", `window.AUTH_CONFIG = ${JSON.stringify(testState, null, 2)};\n`);
  jsFolder.file("app.js", standaloneAppJS);
  jsFolder.file("integration.js", integrationJS);
  folder.file("integration-snippet.html", snippetHTML);
  folder.file("index.html", standaloneHTML);
  folder.file("config.json", JSON.stringify(testState, null, 2));
  folder.file("README.md", readme);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  assert(zipBuffer.length > 0, "ZIP buffer generated successfully");

  // 4. Inspect Unzipped Package
  console.log("\nTest Section 4: Inspect Extracted Package Content");
  const extracted = await JSZip.loadAsync(zipBuffer);
  
  assert(extracted.file("generated-auth-page/index.html") !== null, "Package contains generated-auth-page/index.html");
  assert(extracted.file("generated-auth-page/css/styles.css") !== null, "Package contains generated-auth-page/css/styles.css");
  assert(extracted.file("generated-auth-page/js/config.js") !== null, "Package contains generated-auth-page/js/config.js");
  assert(extracted.file("generated-auth-page/js/app.js") !== null, "Package contains generated-auth-page/js/app.js");
  assert(extracted.file("generated-auth-page/js/integration.js") !== null, "Package contains generated-auth-page/js/integration.js");
  assert(extracted.file("generated-auth-page/assets/backgrounds/custom-background.webp") !== null, "Package preserved custom-background.webp");
  assert(extracted.file("generated-auth-page/assets/logos/custom-logo.svg") !== null, "Package preserved custom-logo.svg");
  assert(extracted.file("generated-auth-page/assets/logos/brand-shield.svg") !== null, "Package bundled default brand-shield.svg");
  assert(extracted.file("generated-auth-page/assets/logos/brand-prism.svg") !== null, "Package bundled default brand-prism.svg");
  assert(extracted.file("generated-auth-page/assets/logos/brand-nexus.svg") !== null, "Package bundled default brand-nexus.svg");
  assert(extracted.file("generated-auth-page/assets/logos/brand-aurora.svg") !== null, "Package bundled default brand-aurora.svg");
  assert(extracted.file("generated-auth-page/assets/logos/brand-apex.svg") !== null, "Package bundled default brand-apex.svg");

  // 5. Test Extracted HTML & Standalone Runtime Execution
  console.log("\nTest Section 5: Standalone HTML & Runtime Verification in JSDOM");
  const unzippedHTML = await extracted.file("generated-auth-page/index.html").async("text");
  const unzippedConfigJS = await extracted.file("generated-auth-page/js/config.js").async("text");
  const redirectServiceFile = extracted.file("generated-auth-page/js/redirectService.js") || extracted.file("frontend/js/redirectService.js");
  const unzippedRedirectServiceJS = redirectServiceFile ? await redirectServiceFile.async("text") : null;
  const unzippedAppJS = await extracted.file("generated-auth-page/js/app.js").async("text");
  const unzippedCSS = await extracted.file("generated-auth-page/css/styles.css").async("text");

  assert(unzippedHTML.includes("layout-split-right-image"), "Extracted HTML contains 'layout-split-right-image'");
  assert(unzippedHTML.includes("Return to Apex Portal"), "Extracted HTML contains custom Back to Website text");
  assert(unzippedHTML.includes("https://apexsystems.io"), "Extracted HTML links to customer landing URL");
  assert(unzippedHTML.includes("Apex Systems"), "Extracted HTML renders brand name");
  assert(unzippedHTML.includes("custom-logo.svg"), "Extracted HTML references custom-logo.svg");
  assert(unzippedCSS.includes("--auth-image-width: 65%"), "Extracted CSS contains --auth-image-width: 65%");
  assert(unzippedCSS.includes("custom-background.webp"), "Extracted CSS references custom-background.webp");

  // Run extracted code in JSDOM
  const dom = new JSDOM(unzippedHTML, {
    runScripts: "dangerously",
    url: "http://localhost:3000/generated-auth-page/index.html"
  });

  let redirectedTo = null;
  dom.window.onAuthRedirect = (url) => {
    redirectedTo = url;
  };
  dom.window.location.assign = (url) => {
    redirectedTo = url;
  };

  dom.window.eval(unzippedConfigJS);
  if (unzippedRedirectServiceJS) {
    dom.window.eval(unzippedRedirectServiceJS);
  }
  dom.window.eval(unzippedAppJS);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));

  // Verify form submit redirects to configured redirectUrl
  const loginForm = dom.window.document.querySelector("#authLoginForm");
  assert(loginForm !== null, "Standalone Login form found in DOM");

  loginForm.dispatchEvent(new dom.window.Event("submit"));
  
  await new Promise(resolve => setTimeout(resolve, 900));
  assert(redirectedTo === "https://apexsystems.io/portal/dashboard", `Standalone form submission redirected to ${redirectedTo}`);

  console.log("\n==================================================");
  console.log(`TOTAL E2E TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch(err => {
  console.error("E2E Test execution failed:", err);
  process.exit(1);
});
