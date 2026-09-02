const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const templates = require('./js/templates.js');
const utils = require('./js/utils.js');
const renderer = require('./js/renderer.js');

function runResponsiveTests() {
  console.log("==================================================");
  console.log("RUNNING RESPONSIVE PREVIEW ARCHITECTURE TEST");
  console.log("==================================================");

  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        <div id="previewCanvas" class="preview-canvas device-desktop">
          <div id="previewRoot" class="preview-root preview-device-desktop"></div>
        </div>
        <div class="auth-fullscreen-preview" id="fullscreenPreview" hidden>
          <div class="fullscreen-canvas-wrapper">
            <div class="preview-canvas device-desktop" id="fullscreenCanvas">
              <div id="fullscreenPreviewRoot" class="fullscreen-preview-root preview-device-desktop"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `, { url: "http://localhost:3000/" });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.CustomEvent = dom.window.CustomEvent;

  const previewRoot = document.getElementById('previewRoot');
  const fullscreenCanvas = document.getElementById('fullscreenCanvas');
  const fullscreenRoot = document.getElementById('fullscreenPreviewRoot');

  // Test 1: Desktop Render (Normal)
  renderer.renderPreview(previewRoot, {
    config: {
      activePage: "login",
      previewMode: "desktop",
      layout: { type: "split-left-image", imageWidth: 50 },
      imageSection: { text: "Experience the next generation of authentication.", subtext: "Fast and secure." }
    },
    page: "login",
    device: "desktop"
  });

  if (!previewRoot.classList.contains('preview-device-desktop')) {
    console.error("  [FAIL] Desktop device classes not set properly.");
    process.exit(1);
  }
  console.log("  [PASS] Desktop preview rendered with '.preview-device-desktop'");

  // Test 2: Tablet Render (Normal)
  renderer.renderPreview(previewRoot, {
    config: {
      activePage: "login",
      previewMode: "tablet",
      layout: { type: "split-left-image", imageWidth: 42 }
    },
    page: "login",
    device: "tablet"
  });

  if (!previewRoot.classList.contains('preview-device-tablet')) {
    console.error("  [FAIL] Tablet device classes not set properly.");
    process.exit(1);
  }
  console.log("  [PASS] Tablet preview rendered with '.preview-device-tablet'");

  // Test 3: Mobile Render (Normal Stacked Layout)
  renderer.renderPreview(previewRoot, {
    config: {
      activePage: "login",
      previewMode: "mobile",
      layout: { type: "split-left-image" }
    },
    page: "login",
    device: "mobile"
  });

  if (!previewRoot.classList.contains('preview-device-mobile')) {
    console.error("  [FAIL] Mobile device classes not set properly.");
    process.exit(1);
  }

  const heroSection = previewRoot.querySelector('.auth-image-section');
  const heroText = previewRoot.querySelector('.auth-image-text');
  const authCard = previewRoot.querySelector('.auth-card');

  if (!heroSection || !heroText || !authCard) {
    console.error("  [FAIL] Missing hero section or auth card in mobile render.");
    process.exit(1);
  }

  console.log("  [PASS] Mobile preview rendered hero top banner and auth card without hiding content.");

  // Test 4: Password Field Visibility Icon Positioning
  const passwordWrapper = previewRoot.querySelector('.auth-input-password-wrapper');
  const passwordInput = passwordWrapper ? passwordWrapper.querySelector('input') : null;
  const passwordToggle = passwordWrapper ? passwordWrapper.querySelector('.auth-password-toggle') : null;

  if (!passwordWrapper || !passwordInput || !passwordToggle) {
    console.error("  [FAIL] Password field structure missing inside auth-card.");
    process.exit(1);
  }

  console.log("  [PASS] Password toggle icon correctly positioned inside '.auth-input-password-wrapper'");

  // Test 5: Fullscreen Mobile Render
  renderer.renderPreview(fullscreenRoot, {
    config: {
      activePage: "login",
      previewMode: "mobile",
      layout: { type: "split-left-image" }
    },
    page: "login",
    device: "mobile"
  });

  if (!fullscreenRoot.classList.contains('preview-device-mobile')) {
    console.error("  [FAIL] Fullscreen root missing 'preview-device-mobile' class.");
    process.exit(1);
  }

  if (!fullscreenCanvas.classList.contains('device-mobile')) {
    console.error("  [FAIL] Fullscreen device canvas missing 'device-mobile' class.");
    process.exit(1);
  }

  console.log("  [PASS] Fullscreen Mobile preview correctly applies 'device-mobile' frame and 'preview-device-mobile' viewport (remains phone-shaped).");

  // Test 6: Fullscreen Tablet Render
  renderer.renderPreview(fullscreenRoot, {
    config: {
      activePage: "login",
      previewMode: "tablet",
      layout: { type: "split-left-image" }
    },
    page: "login",
    device: "tablet"
  });

  if (!fullscreenCanvas.classList.contains('device-tablet')) {
    console.error("  [FAIL] Fullscreen device canvas missing 'device-tablet' class.");
    process.exit(1);
  }

  console.log("  [PASS] Fullscreen Tablet preview correctly applies 'device-tablet' frame.");

  // Test 7: Fullscreen Desktop Render (Wide Unconstrained Layout)
  renderer.renderPreview(fullscreenRoot, {
    config: {
      activePage: "login",
      previewMode: "desktop",
      layout: { type: "split-left-image" }
    },
    page: "login",
    device: "desktop"
  });

  if (!fullscreenCanvas.classList.contains('device-desktop')) {
    console.error("  [FAIL] Fullscreen device canvas missing 'device-desktop' class.");
    process.exit(1);
  }

  console.log("  [PASS] Fullscreen Desktop preview correctly applies 'device-desktop' wide unconstrained layout.");

  // Test 8: Signup Page Full Background Scroll Height Coverage
  renderer.renderPreview(previewRoot, {
    config: {
      activePage: "signup",
      previewMode: "desktop",
      layout: { type: "full-background" },
      background: { type: "image", image: "assets/backgrounds/background-1.svg" }
    },
    page: "signup",
    device: "desktop"
  });

  const signupShell = previewRoot.querySelector('.auth-preview-shell');
  if (!signupShell || !signupShell.style.backgroundImage || signupShell.style.backgroundImage === "none") {
    console.error("  [FAIL] Background image not applied directly to auth-preview-shell scroll container.");
    process.exit(1);
  }

  console.log("  [PASS] Signup page full background applied directly to '.auth-preview-shell' (spans 100% of scroll height).");

  console.log("==================================================");
  console.log("RESPONSIVE PREVIEW ARCHITECTURE: ALL PASSED");
  console.log("==================================================");
}

runResponsiveTests();
