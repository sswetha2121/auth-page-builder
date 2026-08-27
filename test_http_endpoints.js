/* =========================================================
   AUTH PAGE BUILDER - HTTP SERVER ENDPOINTS VERIFICATION
   File: test_http_endpoints.js
========================================================= */

const http = require("http");

const endpoints = [
  "/",
  "/index.html",
  "/css/main.css",
  "/css/app.css",
  "/css/layout.css",
  "/css/sidebar.css",
  "/css/components.css",
  "/css/forms.css",
  "/css/customization.css",
  "/css/preview.css",
  "/css/responsive.css",
  "/js/constants.js",
  "/js/config.js",
  "/js/state.js",
  "/js/utils.js",
  "/js/templates.js",
  "/js/renderer.js",
  "/js/controls.js",
  "/js/customization.js",
  "/js/preview.js",
  "/js/fullscreen.js",
  "/js/download.js",
  "/js/app.js",
  "/js/jszip.min.js",
  "/assets/logos/brand-shield.svg",
  "/assets/logos/brand-prism.svg",
  "/assets/backgrounds/1000_F_913783737_GrYZ3ld62JdNADjqXinbQ7ogaqWu5Og3.jpg",
  "/assets/backgrounds/idea-6900632_1280.png"
];

async function checkEndpoint(path) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5173${path}`, (res) => {
      resolve({ path, statusCode: res.statusCode });
    });
    req.on("error", (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function verifyAll() {
  console.log("Verifying HTTP Dev Server Endpoints (http://localhost:5173/)...");
  let failed = 0;

  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    if (res.statusCode === 200) {
      console.log(`  [200 OK] ${ep}`);
    } else {
      console.error(`  [FAIL] ${ep} -> Status: ${res.statusCode || res.error}`);
      failed++;
    }
  }

  console.log(`\nEndpoint check complete. Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

verifyAll();
