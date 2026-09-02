/* =========================================================
   UNIQUE CUSTOMIZATION ROUND-TRIP ACCEPTANCE TEST
========================================================= */

const fs = require("fs");
const path = require("path");
const http = require("http");
const JSZip = require("jszip");

const state = require("./js/state.js");
const downloadManager = require("./js/download.js");

async function runUniqueCustomizationTest() {
  console.log("==================================================");
  console.log("RUNNING UNIQUE CUSTOMIZATION ROUND-TRIP TEST");
  console.log("==================================================");

  global.state = state;

  // Set unique test values
  const UNIQUE_BRAND = "TEST_BRAND_93821";
  const UNIQUE_HEADLINE = "TEST_HEADLINE_82731";
  const UNIQUE_SUBTITLE = "TEST_SUBTITLE_49281";
  const UNIQUE_BUTTON_COLOR = "#e11d48";
  const UNIQUE_CARD_WIDTH = 640;
  const UNIQUE_CARD_RADIUS = 32;
  const UNIQUE_SPECIAL_CHARS = 1;
  const UNIQUE_REDIRECT_URL = "https://customerwebsite.com/";
  const UNIQUE_LANDING_URL = "https://customerwebsite.com/";

  state.set("branding.brandName", UNIQUE_BRAND);
  state.set("pages.login.title", UNIQUE_HEADLINE);
  state.set("pages.login.subtitle", UNIQUE_SUBTITLE);
  state.set("button.backgroundColor", UNIQUE_BUTTON_COLOR);
  state.set("card.width", UNIQUE_CARD_WIDTH);
  state.set("card.borderRadius", UNIQUE_CARD_RADIUS);
  state.set("passwordPolicy.minSpecialChars", UNIQUE_SPECIAL_CHARS);
  state.set("urls.landingPageUrl", UNIQUE_LANDING_URL);
  state.set("redirect.redirectUrl", UNIQUE_REDIRECT_URL);

  console.log("  [INFO] Applied unique customization values to central state.");

  // Generate ZIP
  const zipBuffer = await downloadManager.downloadPackage();
  if (!zipBuffer || !Buffer.isBuffer(zipBuffer)) {
    throw new Error("downloadPackage() failed to generate a valid Buffer.");
  }
  console.log(`  [PASS] ZIP buffer created successfully (Size: ${zipBuffer.length} bytes)`);

  // Extract ZIP to C:\temp\auth-page-test\
  const targetDir = "C:\\temp\\auth-page-test\\";
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  const zip = await JSZip.loadAsync(zipBuffer);
  for (const filename of Object.keys(zip.files)) {
    const file = zip.files[filename];
    if (!file.dir) {
      const content = await file.async("nodebuffer");
      const fullPath = path.join(targetDir, filename);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }
  }
  console.log(`  [PASS] Extracted package to ${targetDir}`);

  // Inspect config/auth-config.json
  const configPath = path.join(targetDir, "config", "auth-config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error("config/auth-config.json was not found in extracted directory!");
  }
  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

  console.log("\n--- VERIFYING EXTRACTED CONFIGURATION PAYLOAD ---");
  const assertions = [
    { label: "Brand Name", actual: cfg.branding?.brandName, expected: UNIQUE_BRAND },
    { label: "Headline", actual: cfg.pages?.login?.title, expected: UNIQUE_HEADLINE },
    { label: "Subtitle", actual: cfg.pages?.login?.subtitle, expected: UNIQUE_SUBTITLE },
    { label: "Button Color", actual: cfg.button?.backgroundColor, expected: UNIQUE_BUTTON_COLOR },
    { label: "Card Width", actual: cfg.card?.width, expected: UNIQUE_CARD_WIDTH },
    { label: "Card Radius", actual: cfg.card?.borderRadius, expected: UNIQUE_CARD_RADIUS },
    { label: "Password Special Chars", actual: cfg.passwordPolicy?.minSpecialChars, expected: UNIQUE_SPECIAL_CHARS },
    { label: "Redirect URL", actual: cfg.redirect?.redirectUrl, expected: UNIQUE_REDIRECT_URL },
    { label: "Landing URL", actual: cfg.urls?.landingPageUrl, expected: UNIQUE_LANDING_URL }
  ];

  let failedCount = 0;
  for (const a of assertions) {
    if (a.actual === a.expected) {
      console.log(`  [PASS] ${a.label}: '${a.actual}'`);
    } else {
      console.error(`  [FAIL] ${a.label} mismatch! Expected '${a.expected}', got '${a.actual}'`);
      failedCount++;
    }
  }

  // Start HTTP server on port 8099 to test standalone runtime serving
  const PORT = 8099;
  const MIME = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml"
  };

  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(targetDir, path.normalize(p).replace(/^(\.\.[\/\\])+/, ""));
    if (fs.existsSync(fp) && !fs.statSync(fp).isDirectory()) {
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
      res.end(fs.readFileSync(fp));
    } else {
      res.writeHead(404);
      res.end("404 Not Found");
    }
  });

  await new Promise(res => server.listen(PORT, res));
  console.log(`\n  [INFO] Standalone Server running at http://localhost:${PORT}`);

  const fetchHttp = (urlPath) => new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });

  const rootRes = await fetchHttp("/");
  const cssRes = await fetchHttp("/css/styles.css");
  const jsRes = await fetchHttp("/js/app.js");

  if (rootRes.status === 200 && rootRes.data.includes(UNIQUE_BRAND)) {
    console.log("  [PASS] GET / returns HTTP 200 OK and contains unique Brand Name 'TEST_BRAND_93821'");
  } else {
    console.error("  [FAIL] GET / failed or missing unique brand name!");
    failedCount++;
  }

  if (cssRes.status === 200 && cssRes.data.includes("#e11d48")) {
    console.log("  [PASS] GET /css/styles.css returns HTTP 200 OK and contains button color '#e11d48'");
  } else {
    console.error("  [FAIL] GET /css/styles.css failed or missing button color!");
    failedCount++;
  }

  if (jsRes.status === 200) {
    console.log("  [PASS] GET /js/app.js returns HTTP 200 OK");
  } else {
    console.error("  [FAIL] GET /js/app.js failed!");
    failedCount++;
  }

  server.close();

  console.log("==================================================");
  if (failedCount === 0) {
    console.log("UNIQUE CUSTOMIZATION ROUND-TRIP RESULTS: PASSED ALL TESTS");
    console.log("==================================================");
  } else {
    console.error(`UNIQUE CUSTOMIZATION ROUND-TRIP RESULTS: ${failedCount} FAILURES`);
    process.exit(1);
  }
}

runUniqueCustomizationTest().catch(err => {
  console.error("Test execution exception:", err);
  process.exit(1);
});
