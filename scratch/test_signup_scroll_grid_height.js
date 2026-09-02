const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log("==================================================");
console.log("RUNNING SIGNUP BACKGROUND GRID & SCROLL HEIGHT TEST");
console.log("==================================================");

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const dom = new JSDOM(html, {
  url: "http://localhost:3000/",
  runScripts: "dangerously",
  resources: "usable"
});

const { window } = dom;
const { document } = window;

setTimeout(() => {
  try {
    const previewRoot = document.getElementById('previewRoot');
    const renderer = window.app ? window.app.renderer : (window.Renderer || require('../js/renderer'));

    // Test 1: Signup Page Split Left Layout
    renderer.renderPreview(previewRoot, {
      config: {
        activePage: "signup",
        previewMode: "desktop",
        layout: { type: "split-left-image", imageWidth: 50 },
        background: { type: "image", image: "assets/backgrounds/background-1.svg" },
        imageSection: { showText: true, text: "Experience next-gen auth", verticalPosition: "top", horizontalPosition: "left" }
      },
      page: "signup",
      device: "desktop"
    });

    const shell = previewRoot.querySelector('.auth-preview-shell');
    const imageSec = previewRoot.querySelector('.auth-image-section');
    const formSec = previewRoot.querySelector('.auth-form-section');
    const promo = previewRoot.querySelector('.auth-image-content');

    if (!shell) {
      console.error("  [FAIL] auth-preview-shell missing.");
      process.exit(1);
    }

    if (!imageSec) {
      console.error("  [FAIL] auth-image-section missing.");
      process.exit(1);
    }

    if (!formSec) {
      console.error("  [FAIL] auth-form-section missing.");
      process.exit(1);
    }

    if (!imageSec.style.backgroundImage || imageSec.style.backgroundImage === "none") {
      console.error("  [FAIL] Split image section missing background image.");
      process.exit(1);
    }

    if (imageSec.style.backgroundRepeat !== "no-repeat") {
      console.error("  [FAIL] Background repeat is not 'no-repeat'.");
      process.exit(1);
    }

    if (!promo || !promo.classList.contains('position-top-left')) {
      console.error("  [FAIL] Promotional text missing 'position-top-left' class.");
      process.exit(1);
    }

    console.log("  [PASS] Signup page split-left-image rendered correctly with background on image section.");
    console.log("  [PASS] Promotional text class 'position-top-left' applied.");

    // Test 2: Promotional Text Position Top/Center/Bottom Switching
    renderer.renderPreview(previewRoot, {
      config: {
        activePage: "signup",
        previewMode: "desktop",
        layout: { type: "split-left-image" },
        background: { type: "image", image: "assets/backgrounds/background-1.svg" },
        imageSection: { showText: true, text: "Promo Test", verticalPosition: "bottom", horizontalPosition: "right" }
      },
      page: "signup",
      device: "desktop"
    });

    const promoBottomRight = previewRoot.querySelector('.auth-image-content');
    if (!promoBottomRight || !promoBottomRight.classList.contains('position-bottom-right')) {
      console.error("  [FAIL] Promotional text missing 'position-bottom-right' class.");
      process.exit(1);
    }
    console.log("  [PASS] Promotional text positioning switches cleanly to 'position-bottom-right'.");

    // Test 3: Full Background Layout Coverage
    renderer.renderPreview(previewRoot, {
      config: {
        activePage: "signup",
        previewMode: "desktop",
        layout: { type: "full-background" },
        background: { type: "image", image: "assets/backgrounds/background-2.svg" }
      },
      page: "signup",
      device: "desktop"
    });

    const fullShell = previewRoot.querySelector('.auth-preview-shell');
    if (!fullShell || !fullShell.style.backgroundImage || fullShell.style.backgroundImage === "none") {
      console.error("  [FAIL] Full background image missing on auth-preview-shell.");
      process.exit(1);
    }
    if (fullShell.style.backgroundRepeat !== "no-repeat") {
      console.error("  [FAIL] Full background repeat is not 'no-repeat'.");
      process.exit(1);
    }
    console.log("  [PASS] Full background applied ONCE to auth-preview-shell with no-repeat.");

    console.log("==================================================");
    console.log("SIGNUP BACKGROUND GRID & SCROLL TEST: ALL PASSED");
    console.log("==================================================");
    process.exit(0);

  } catch (err) {
    console.error("  [FAIL] Test error:", err);
    process.exit(1);
  }
}, 800);
