/* =========================================================
   AUTH PAGE BUILDER - MASTER END-TO-END ACCEPTANCE TEST
   File: test_master_acceptance.js
========================================================= */

const fs = require("fs");
const path = require("path");
const http = require("http");
const JSZip = require("jszip");
const { JSDOM } = require("jsdom");

const StateManager = require("./js/state.js");
const Renderer = require("./js/renderer.js");
const Download = require("./js/download.js");
const RedirectService = require("./js/services/redirectService.js");

console.log("==================================================");
console.log("RUNNING MASTER ACCEPTANCE & REDIRECT PIPELINE TEST");
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

async function runMasterAcceptanceTests() {
  // Setup JSDOM DOM environment
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
  global.RedirectService = RedirectService;
  global.window.RedirectService = RedirectService;
  StateManager.reset();

  // ----------------------------------------------------
  // 1. DANGEROUS SCHEME & REDIRECT URL VALIDATION
  // ----------------------------------------------------
  console.log("--- TEST 1: Redirect URL Scheme & Validation ---");
  const jsRes = RedirectService.validateUrl("javascript:alert(1)");
  assert(jsRes.valid === false, "javascript: scheme is REJECTED");

  const dataRes = RedirectService.validateUrl("data:text/html,<script>alert(1)</script>");
  assert(dataRes.valid === false, "data: scheme is REJECTED");

  const fileRes = RedirectService.validateUrl("file:///C:/Windows/system32/cmd.exe");
  assert(fileRes.valid === false, "file: scheme is REJECTED");

  const vbRes = RedirectService.validateUrl("vbscript:msgbox(1)");
  assert(vbRes.valid === false, "vbscript: scheme is REJECTED");

  const relRes = RedirectService.validateUrl("/dashboard");
  assert(relRes.valid === true, "Relative URL '/dashboard' is ACCEPTED");

  const absRes = RedirectService.validateUrl("https://example.com/portal/welcome");
  assert(absRes.valid === true, "HTTPS URL 'https://example.com/portal/welcome' is ACCEPTED");

  // ----------------------------------------------------
  // 2. BUILDER PREVIEW NAVIGATION SUPPRESSION
  // ----------------------------------------------------
  console.log("\n--- TEST 2: Builder Preview Navigation Suppression ---");
  RedirectService.resetGuard();
  const prevExec = await RedirectService.execute(
    { enabled: true, redirectUrl: "/dashboard" },
    { isPreview: true, simulateInPreview: true }
  );
  assert(prevExec.success === true, "Preview authentication returns success object");
  assert(prevExec.simulated === true, "Preview navigation is SUPPRESSED (simulated)");

  // ----------------------------------------------------
  // 3. FULL CUSTOMIZATION FIDELITY & UNSAVED EXPORT
  // ----------------------------------------------------
  console.log("\n--- TEST 3: Full Customization Export Fidelity ---");
  StateManager.set("branding.brandName", "Apex CyberSec Solutions");
  StateManager.set("layout.type", "card-right");
  StateManager.set("card.width", 640);
  StateManager.set("card.borderRadius", 24);
  StateManager.set("colors.primary", "#059669");
  StateManager.set("passwordPolicy.minSpecialChars", 3);
  StateManager.set("redirect.redirectUrl", "/portal/dashboard");

  const zipBuf = await Download.downloadPackage();
  assert(zipBuf && zipBuf.length > 0, "Download Package generated fresh ZIP buffer");

  const zip = await JSZip.loadAsync(zipBuf);
  const cfgTxt = await zip.file("config/auth-config.json").async("string");
  const cfg = JSON.parse(cfgTxt);

  assert(cfg.branding.brandName === "Apex CyberSec Solutions", "Exported config contains Brand Name 'Apex CyberSec Solutions'");
  assert(cfg.layout.type === "card-right", "Exported config contains Layout 'card-right'");
  assert(cfg.card.width === 640, "Exported config contains Card Width 640");
  assert(cfg.card.borderRadius === 24, "Exported config contains Card Radius 24");
  assert(cfg.colors.primary === "#059669", "Exported config contains Primary Color '#059669'");
  assert(cfg.passwordPolicy.minSpecialChars === 3, "Exported config contains minSpecialChars 3");
  assert(cfg.redirect.redirectUrl === "/portal/dashboard", "Exported config contains Redirect Destination '/portal/dashboard'");

  // ----------------------------------------------------
  // 4. STANDALONE SERVER RELATIVE DEMO ROUTE (NO 404)
  // ----------------------------------------------------
  console.log("\n--- TEST 4: Standalone Server Relative Route Handling ---");
  const scratchServerDir = path.join(__dirname, "scratch", "server_test_root");
  if (!fs.existsSync(scratchServerDir)) fs.mkdirSync(scratchServerDir, { recursive: true });
  fs.writeFileSync(path.join(scratchServerDir, "index.html"), "<!DOCTYPE html><html><body>Auth Index</body></html>");
  fs.writeFileSync(path.join(scratchServerDir, "server.js"), fs.readFileSync(path.join(__dirname, "export_templates", "server.js")));

  process.env.PORT = "3060";
  const exportServerModule = require(path.join(scratchServerDir, "server.js"));
  const server = exportServerModule.startServer();

  await new Promise(r => setTimeout(r, 600));
  const addr = server.address();
  const serverPort = addr ? addr.port : 3060;

  // Test root GET /
  const rootRes = await new Promise(res => {
    http.get(`http://localhost:${serverPort}/`, r => {
      let body = "";
      r.on("data", chunk => body += chunk);
      r.on("end", () => res({ status: r.statusCode, body }));
    });
  });
  assert(rootRes.status === 200, `GET / returns HTTP 200 OK (Port ${serverPort})`);

  // Test relative redirect path GET /portal/dashboard (Demo Route)
  const dashRes = await new Promise(res => {
    http.get(`http://localhost:${serverPort}/portal/dashboard`, r => {
      let body = "";
      r.on("data", chunk => body += chunk);
      r.on("end", () => res({ status: r.statusCode, body }));
    });
  });
  assert(dashRes.status === 200, `GET /portal/dashboard returns HTTP 200 OK (Demo Route)`);
  assert(dashRes.body.includes("Authentication Successful"), "Demo route HTML contains 'Authentication Successful' badge");
  assert(dashRes.body.includes("/portal/dashboard"), "Demo route HTML displays configured target '/portal/dashboard'");

  server.close();

  console.log("\n==================================================");
  console.log(`MASTER ACCEPTANCE RESULTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runMasterAcceptanceTests().catch(err => {
  console.error("Master Acceptance Test failed with exception:", err);
  process.exit(1);
});
