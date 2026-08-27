/* =========================================================
   AUTH PAGE BUILDER - MAIN APPLICATION CONTROLLER
   File: js/app.js
========================================================= */

"use strict";

let appInitialized = false;

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;

  console.log("Initializing Auth Page Builder...");

  // 1. Initialize Controls Manager
  if (window.ControlsManager) {
    window.controlsInstance = new window.ControlsManager();
  }

  // 2. Initialize Preview Manager
  if (window.PreviewManager) {
    window.previewInstance = new window.PreviewManager();
  }

  // 3. Initialize Fullscreen Manager
  if (window.FullscreenManager) {
    window.fullscreenInstance = new window.FullscreenManager();
  }

  // 4. Initialize Download Button
  initializeDownloadButton();

  // 5. Initial Sync & Render
  if (window.state && window.controlsInstance) {
    window.controlsInstance.syncControls(window.state.getState());
  }

  if (window.previewInstance) {
    window.previewInstance.render();
  }

  console.log("Auth Page Builder initialized successfully!");
}

/* =========================================================
   DOWNLOAD BUTTON BINDING
========================================================= */
function initializeDownloadButton() {
  const downloadButtons = document.querySelectorAll('[data-action="download-package"], #downloadButton');
  downloadButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (typeof window.downloadPackage === "function") {
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>Generating ZIP...</span>`;
        try {
          await window.downloadPackage();
        } catch (e) {
          console.error("Download package error:", e);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      } else {
        console.warn("downloadPackage is not available.");
      }
    });
  });
}

/* =========================================================
   GLOBAL FORM SUBMIT HANDLER (PREVIEW SIMULATION)
========================================================= */
window.handleAuthSubmit = function (event, pageType) {
  event.preventDefault();
  const config = window.state ? window.state.getState() : (window.config || {});
  const redirectUrl = config.urls?.redirectUrl || "https://customerwebsite.com/dashboard";
  
  if (window.Utils && typeof window.Utils.showToast === "function") {
    window.Utils.showToast(`[Preview Mode] ${pageType.toUpperCase()} submitted! Redirecting to: ${redirectUrl}`, "success", 4000);
  }
};