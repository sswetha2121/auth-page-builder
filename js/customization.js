/* =========================================================
   AUTH PAGE BUILDER - CUSTOMIZATION ENGINE
   File: js/customization.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.CustomizationEngine = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {

  function initializeCustomization() {
    if (typeof window !== "undefined" && window.ControlsManager) {
      if (!window.controlsInstance) {
        window.controlsInstance = new window.ControlsManager();
      }
    }
  }

  return {
    initializeCustomization,
    init: initializeCustomization
  };
});