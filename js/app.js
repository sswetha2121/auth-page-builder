/* =========================================================
   AUTH PAGE BUILDER - MAIN APPLICATION CONTROLLER
   File: js/app.js

   RESPONSIBILITIES
   ---------------------------------------------------------
   - Application initialization
   - Page switching
   - Device switching
   - Fullscreen preview
   - Central configuration updates
   - Customization control binding
   - File upload handling
   - Control synchronization
   - Download trigger
   - Toast notifications
========================================================= */

"use strict";

/* =========================================================
   RENDER MANAGEMENT
========================================================= */

let renderFrame = null;
let appInitialized = false;

/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

/* =========================================================
   MAIN INITIALIZATION
========================================================= */

function initializeApp() {
  if (appInitialized) {
    return;
  }

  appInitialized = true;

  initializeAccordion();
  initializePageSwitcher();
  initializeDeviceSwitcher();
  initializeFullscreenPreview();
  initializeResetButton();
  initializeDownloadButton();
  initializeCustomizationControls();

  synchronizeControlsWithConfig();
  applyInitialPreviewDevice();
  renderCurrentPreview();

  console.log("Auth Page Builder initialized successfully");
}

/* =========================================================
   ACCORDION
========================================================= */

function initializeAccordion() {
  const sections = document.querySelectorAll(
    ".customization-section"
  );

  sections.forEach((section) => {
    const header = section.querySelector(
      ".customization-section-header"
    );

    if (!header) {
      return;
    }

    header.setAttribute(
      "role",
      header.getAttribute("role") || "button"
    );

    if (!header.hasAttribute("tabindex")) {
      header.setAttribute("tabindex", "0");
    }

    const toggleSection = () => {
      const isActive = section.classList.contains("active");

      sections.forEach((item) => {
        item.classList.remove("active");
      });

      if (!isActive) {
        section.classList.add("active");
      }
    };

    header.addEventListener("click", toggleSection);

    header.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        toggleSection();
      }
    });
  });
}

/* =========================================================
   PAGE SWITCHER
========================================================= */

function initializePageSwitcher() {
  const buttons = document.querySelectorAll(
    "[data-page]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      if (!page) {
        return;
      }

      setCurrentPage(page);
    });
  });
}

function setCurrentPage(page) {
  if (!window.config) {
    console.warn("Configuration object is not available");
    return;
  }

  window.config.currentPage = page;

  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

      button.setAttribute(
        "aria-selected",
        button.dataset.page === page ? "true" : "false"
      );
    });

  updatePageSpecificControls(page);
  synchronizeControlsWithConfig();
  requestPreviewRender();

  markPreviewUpdated();
}

/* =========================================================
   PAGE SPECIFIC CONTROLS
========================================================= */

function updatePageSpecificControls(page) {
  const pageControls = document.querySelectorAll(
    "[data-page-control]"
  );

  pageControls.forEach((control) => {
    const supportedPages = String(
      control.dataset.pageControl || ""
    )
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const shouldShow =
      supportedPages.length === 0 ||
      supportedPages.includes(page);

    control.hidden = !shouldShow;

    if (shouldShow) {
      control.style.removeProperty("display");
    } else {
      control.style.display = "none";
    }
  });
}

/* =========================================================
   DEVICE SWITCHER
========================================================= */

function initializeDeviceSwitcher() {
  const buttons = document.querySelectorAll(
    "[data-device]"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const device = button.dataset.device;

      if (!device) {
        return;
      }

      setPreviewDevice(device);
    });
  });
}

function applyInitialPreviewDevice() {
  const device =
    window.config?.previewDevice || "desktop";

  setPreviewDevice(device, false);
}

function setPreviewDevice(
  device,
  shouldRender = true
) {
  const validDevices = [
    "desktop",
    "tablet",
    "mobile"
  ];

  if (!validDevices.includes(device)) {
    console.warn(
      `Unsupported preview device: ${device}`
    );

    device = "desktop";
  }

  if (window.config) {
    window.config.previewDevice = device;
  }

  const previewFrame = document.querySelector(
    ".preview-frame"
  );

  const previewStage = document.querySelector(
    ".preview-stage"
  );

  const previewContainer = document.querySelector(
    ".preview-container"
  );

  [
    previewFrame,
    previewStage,
    previewContainer
  ]
    .filter(Boolean)
    .forEach((element) => {
      element.classList.remove(
        "preview-desktop",
        "preview-tablet",
        "preview-mobile"
      );

      element.classList.add(
        `preview-${device}`
      );

      element.dataset.device = device;
    });

  document
    .querySelectorAll("[data-device]")
    .forEach((button) => {
      const isActive =
        button.dataset.device === device;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        isActive ? "true" : "false"
      );
    });

  if (shouldRender) {
    requestPreviewRender();
  }

  markPreviewUpdated();
}

/* =========================================================
   FULLSCREEN PREVIEW
========================================================= */

function initializeFullscreenPreview() {
  const fullscreenButtons =
    document.querySelectorAll(
      "[data-action='fullscreen']"
    );

  fullscreenButtons.forEach((button) => {
    button.addEventListener(
      "click",
      openFullscreenPreview
    );
  });

  document.addEventListener(
    "keydown",
    handleFullscreenKeyboard
  );
}

function handleFullscreenKeyboard(event) {
  if (event.key === "Escape") {
    closeFullscreenPreview();
  }
}

function openFullscreenPreview() {
  let fullscreen = document.querySelector(
    ".auth-fullscreen-preview"
  );

  if (!fullscreen) {
    fullscreen = createFullscreenPreview();
  }

  if (!fullscreen) {
    showToast(
      "Unable to open fullscreen preview"
    );

    return;
  }

  fullscreen.classList.add(
    "auth-fullscreen-open"
  );

  fullscreen.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "auth-fullscreen-active"
  );

  document.body.style.overflow = "hidden";

  renderFullscreenPreview();

  const closeButton =
    fullscreen.querySelector(
      ".auth-fullscreen-close"
    );

  if (closeButton) {
    requestAnimationFrame(() => {
      closeButton.focus();
    });
  }
}

function closeFullscreenPreview() {
  const fullscreen = document.querySelector(
    ".auth-fullscreen-preview"
  );

  if (!fullscreen) {
    return;
  }

  fullscreen.classList.remove(
    "auth-fullscreen-open"
  );

  fullscreen.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "auth-fullscreen-active"
  );

  document.body.style.overflow = "";
}

function createFullscreenPreview() {
  const fullscreen =
    document.createElement("div");

  fullscreen.className =
    "auth-fullscreen-preview";

  fullscreen.setAttribute(
    "aria-hidden",
    "true"
  );

  fullscreen.setAttribute(
    "role",
    "dialog"
  );

  fullscreen.setAttribute(
    "aria-modal",
    "true"
  );

  fullscreen.innerHTML = `
    <div class="auth-fullscreen-shell">
      <div class="auth-fullscreen-header">
        <div class="auth-fullscreen-brand">
          <span class="auth-fullscreen-title">
            Full Preview
          </span>
        </div>

        <button
          type="button"
          class="auth-fullscreen-close"
          aria-label="Close fullscreen preview"
        >
          <span aria-hidden="true">×</span>
          <span>Exit Preview</span>
        </button>
      </div>

      <div class="auth-fullscreen-content">
        <div
          id="fullscreenPreviewRoot"
          class="preview-root fullscreen-preview-root"
        ></div>
      </div>
    </div>
  `;

  document.body.appendChild(fullscreen);

  const closeButton =
    fullscreen.querySelector(
      ".auth-fullscreen-close"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeFullscreenPreview
    );
  }

  fullscreen.addEventListener(
    "click",
    (event) => {
      if (event.target === fullscreen) {
        closeFullscreenPreview();
      }
    }
  );

  return fullscreen;
}

function renderFullscreenPreview() {
  const root = document.getElementById(
    "fullscreenPreviewRoot"
  );

  if (!root) {
    return;
  }

  if (
    typeof window.renderPreview !== "function"
  ) {
    root.innerHTML = `
      <div class="preview-error-state">
        <strong>Preview unavailable</strong>
        <span>
          The main renderer is not ready.
        </span>
      </div>
    `;

    console.warn(
      "renderPreview() is not available"
    );

    return;
  }

  try {
    window.renderPreview(root, {
      mode: "fullscreen",
      device: "desktop",
      page: window.config?.currentPage || "login"
    });
  } catch (error) {
    console.error(
      "Fullscreen preview rendering failed:",
      error
    );

    root.innerHTML = `
      <div class="preview-error-state">
        <strong>Unable to render preview</strong>
        <span>
          Check the renderer configuration.
        </span>
      </div>
    `;
  }
}

/* =========================================================
   RESET BUTTON
========================================================= */

function initializeResetButton() {
  const resetButtons =
    document.querySelectorAll(
      "[data-action='reset']"
    );

  resetButtons.forEach((button) => {
    button.addEventListener(
      "click",
      resetConfiguration
    );
  });
}

function resetConfiguration() {
  if (
    typeof window.resetConfig !== "function"
  ) {
    console.warn(
      "resetConfig() function not found"
    );

    showToast(
      "Reset functionality is not available"
    );

    return;
  }

  const confirmed = window.confirm(
    "Reset all customizations to default values?"
  );

  if (!confirmed) {
    return;
  }

  window.resetConfig();

  synchronizeControlsWithConfig();

  const device =
    window.config?.previewDevice || "desktop";

  setPreviewDevice(device, false);

  updatePageSpecificControls(
    window.config?.currentPage || "login"
  );

  requestPreviewRender();

  showToast(
    "All customizations have been reset"
  );
}

/* =========================================================
   CUSTOMIZATION CONTROLS
========================================================= */

function initializeCustomizationControls() {
  const controls = document.querySelectorAll(
    "[data-config]"
  );

  controls.forEach((control) => {
    if (control.dataset.bound === "true") {
      return;
    }

    control.dataset.bound = "true";

    const eventType =
      getControlEventType(control);

    control.addEventListener(
      eventType,
      () => {
        updateConfigFromControl(control);
      }
    );

    if (
      [
        "text",
        "number",
        "range",
        "color"
      ].includes(control.type) ||
      control.tagName === "TEXTAREA"
    ) {
      control.addEventListener(
        "input",
        () => {
          updateConfigFromControl(control);
        }
      );
    }
  });
}

/* =========================================================
   CONTROL EVENT TYPE
========================================================= */

function getControlEventType(control) {
  if (
    control.type === "file" ||
    control.type === "checkbox" ||
    control.type === "radio" ||
    control.tagName === "SELECT"
  ) {
    return "change";
  }

  return "input";
}

/* =========================================================
   UPDATE CONFIG FROM CONTROL
========================================================= */

function updateConfigFromControl(control) {
  const configPath =
    control.dataset.config;

  if (!configPath) {
    return;
  }

  if (control.type === "file") {
    const file = control.files?.[0];

    if (!file) {
      return;
    }

    handleUploadedFile(
      control,
      file
    );

    return;
  }

  const value =
    getControlValue(control);

  setConfigValue(
    configPath,
    value
  );

  updateControlDisplay(
    control,
    value
  );

  requestPreviewRender();
  markPreviewUpdated();
}

/* =========================================================
   GET CONTROL VALUE
========================================================= */

function getControlValue(control) {
  if (control.type === "checkbox") {
    return control.checked;
  }

  if (control.type === "radio") {
    return control.checked
      ? control.value
      : getConfigValue(
          control.dataset.config
        );
  }

  if (
    control.type === "number" ||
    control.type === "range"
  ) {
    return Number(control.value);
  }

  return control.value;
}

/* =========================================================
   FILE UPLOAD HANDLING
========================================================= */

function handleUploadedFile(
  control,
  file
) {
  const configPath =
    control.dataset.config;

  if (!configPath || !file) {
    return;
  }

  const fileStoreKey =
    `${configPath}File`;

  /*
    Preserve original File for ZIP generation.
    The original file must remain available so the
    download package can include the real asset.
  */
  setConfigValue(
    fileStoreKey,
    file
  );

  const reader = new FileReader();

  reader.onload = (event) => {
    const imageData = event.target?.result;

    if (!imageData) {
      return;
    }

    /*
      Store preview-ready data URL at original config path.
    */
    setConfigValue(
      configPath,
      imageData
    );

    /*
      Store asset metadata for download generation.
    */
    setConfigValue(
      `${configPath}Asset`,
      {
        name: file.name,
        type: file.type,
        size: file.size,
        source: "upload"
      }
    );

    updateUploadedFilePreview(
      control,
      imageData
    );

    requestPreviewRender();

    showToast(
      `${file.name} uploaded successfully`
    );
  };

  reader.onerror = () => {
    console.error(
      "Unable to read uploaded file"
    );

    showToast(
      "Unable to read the selected file"
    );
  };

  reader.readAsDataURL(file);
}

function updateUploadedFilePreview(
  control,
  imageData
) {
  const previewTarget =
    control.dataset.previewTarget;

  if (!previewTarget) {
    return;
  }

  const target =
    document.getElementById(previewTarget) ||
    document.querySelector(previewTarget);

  if (!target) {
    return;
  }

  if (target.tagName === "IMG") {
    target.src = imageData;
    target.hidden = false;
    return;
  }

  target.style.backgroundImage =
    `url("${imageData}")`;

  target.classList.add(
    "has-uploaded-image"
  );
}

/* =========================================================
   CONFIG PATH UTILITIES
========================================================= */

function setConfigValue(
  path,
  value
) {
  if (
    !window.config ||
    !path
  ) {
    return;
  }

  const keys =
    String(path)
      .split(".")
      .filter(Boolean);

  if (!keys.length) {
    return;
  }

  let current =
    window.config;

  for (
    let index = 0;
    index < keys.length - 1;
    index++
  ) {
    const key = keys[index];

    if (
      typeof current[key] !== "object" ||
      current[key] === null
    ) {
      current[key] = {};
    }

    current = current[key];
  }

  const finalKey =
    keys[keys.length - 1];

  current[finalKey] = value;
}

function getConfigValue(path) {
  if (
    !window.config ||
    !path
  ) {
    return undefined;
  }

  const keys =
    String(path)
      .split(".")
      .filter(Boolean);

  let current =
    window.config;

  for (const key of keys) {
    if (
      current === undefined ||
      current === null
    ) {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

/* =========================================================
   RANGE / VALUE DISPLAY
========================================================= */

function updateControlDisplay(
  control,
  value
) {
  const valueElementId =
    control.dataset.valueTarget;

  if (!valueElementId) {
    return;
  }

  const valueElement =
    document.getElementById(
      valueElementId
    );

  if (!valueElement) {
    return;
  }

  const suffix =
    control.dataset.valueSuffix || "";

  valueElement.textContent =
    `${value}${suffix}`;
}

/* =========================================================
   BUTTON BASED CONFIG OPTIONS
========================================================= */

document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-config-value]"
      );

    if (!button) {
      return;
    }

    const configPath =
      button.dataset.configValue;

    const rawValue =
      button.dataset.value;

    if (
      !configPath ||
      rawValue === undefined
    ) {
      return;
    }

    const value =
      normalizeDataValue(rawValue);

    const group =
      button.closest(
        "[data-option-group]"
      ) || button.parentElement;

    if (group) {
      group
        .querySelectorAll(
          `[data-config-value="${configPath}"]`
        )
        .forEach((item) => {
          item.classList.remove(
            "active"
          );

          item.setAttribute(
            "aria-pressed",
            "false"
          );
        });
    }

    button.classList.add("active");

    button.setAttribute(
      "aria-pressed",
      "true"
    );

    setConfigValue(
      configPath,
      value
    );

    requestPreviewRender();
    markPreviewUpdated();
  }
);

function normalizeDataValue(value) {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (
    value !== "" &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }

  return value;
}

/* =========================================================
   SYNCHRONIZE UI WITH CONFIG
========================================================= */

function synchronizeControlsWithConfig() {
  const controls =
    document.querySelectorAll(
      "[data-config]"
    );

  controls.forEach((control) => {
    const configPath =
      control.dataset.config;

    if (!configPath) {
      return;
    }

    const value =
      getConfigValue(configPath);

    if (value === undefined) {
      return;
    }

    if (control.type === "checkbox") {
      control.checked =
        Boolean(value);
    } else if (control.type === "radio") {
      control.checked =
        String(control.value) ===
        String(value);
    } else if (
      control.type !== "file"
    ) {
      control.value = value;
    }

    updateControlDisplay(
      control,
      value
    );
  });

  synchronizeOptionButtons();
}

function synchronizeOptionButtons() {
  const buttons =
    document.querySelectorAll(
      "[data-config-value]"
    );

  buttons.forEach((button) => {
    const configPath =
      button.dataset.configValue;

    const buttonValue =
      normalizeDataValue(
        button.dataset.value
      );

    const configValue =
      getConfigValue(configPath);

    const isActive =
      String(configValue) ===
      String(buttonValue);

    button.classList.toggle(
      "active",
      isActive
    );

    button.setAttribute(
      "aria-pressed",
      isActive ? "true" : "false"
    );
  });
}

/* =========================================================
   PREVIEW RENDERING
========================================================= */

function requestPreviewRender() {
  if (renderFrame) {
    cancelAnimationFrame(renderFrame);
  }

  renderFrame =
    requestAnimationFrame(() => {
      renderFrame = null;
      renderCurrentPreview();

      const fullscreen =
        document.querySelector(
          ".auth-fullscreen-preview.auth-fullscreen-open"
        );

      if (fullscreen) {
        renderFullscreenPreview();
      }
    });
}

function renderCurrentPreview() {
  const root =
    document.getElementById(
      "previewRoot"
    );

  if (!root) {
    console.warn(
      "Preview root #previewRoot was not found"
    );

    return;
  }

  if (
    typeof window.renderPreview !== "function"
  ) {
    console.warn(
      "renderPreview() is not available"
    );

    return;
  }

  try {
    window.renderPreview(root, {
      mode: "builder",
      device:
        window.config?.previewDevice ||
        "desktop",
      page:
        window.config?.currentPage ||
        "login"
    });
  } catch (error) {
    console.error(
      "Preview rendering failed:",
      error
    );

    root.innerHTML = `
      <div class="preview-error-state">
        <strong>Unable to render preview</strong>
        <span>
          Check the renderer and current configuration.
        </span>
      </div>
    `;
  }
}

/* =========================================================
   DOWNLOAD BUTTON
========================================================= */

function initializeDownloadButton() {
  const downloadButtons =
    document.querySelectorAll(
      "[data-action='download']"
    );

  downloadButtons.forEach((button) => {
    button.addEventListener(
      "click",
      async () => {
        if (
          typeof window.downloadPackage !==
          "function"
        ) {
          console.warn(
            "downloadPackage() is not available"
          );

          showToast(
            "Package generator is not ready yet"
          );

          return;
        }

        const originalContent =
          button.innerHTML;

        button.disabled = true;
        button.classList.add(
          "is-loading"
        );

        try {
          await Promise.resolve(
            window.downloadPackage()
          );

          showToast(
            "Your customized package is ready"
          );
        } catch (error) {
          console.error(
            "Package generation failed:",
            error
          );

          showToast(
            "Unable to generate the package"
          );
        } finally {
          button.disabled = false;
          button.classList.remove(
            "is-loading"
          );

          if (button.dataset.restoreContent === "true") {
            button.innerHTML =
              originalContent;
          }
        }
      }
    );
  });
}

/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "default"
) {
  let toast =
    document.querySelector(
      ".app-toast"
    );

  if (!toast) {
    toast =
      document.createElement("div");

    toast.className =
      "app-toast";

    toast.setAttribute(
      "role",
      "status"
    );

    toast.setAttribute(
      "aria-live",
      "polite"
    );

    document.body.appendChild(
      toast
    );
  }

  toast.textContent = message;

  toast.dataset.type = type;

  toast.classList.add(
    "app-toast-visible"
  );

  clearTimeout(
    window.__authBuilderToastTimer
  );

  window.__authBuilderToastTimer =
    setTimeout(() => {
      toast.classList.remove(
        "app-toast-visible"
      );
    }, 3000);
}

/* =========================================================
   PREVIEW STATUS
========================================================= */

function markPreviewUpdated() {
  const status =
    document.querySelector(
      ".preview-status"
    );

  if (!status) {
    return;
  }

  status.textContent =
    "Updated";

  status.classList.add(
    "preview-status-updated"
  );

  clearTimeout(
    window.__previewStatusTimer
  );

  window.__previewStatusTimer =
    setTimeout(() => {
      status.classList.remove(
        "preview-status-updated"
      );
    }, 1200);
}

/* =========================================================
   EXPOSE PUBLIC API
========================================================= */

window.authPageBuilder = {
  initializeApp,
  renderCurrentPreview,
  requestPreviewRender,
  setCurrentPage,
  setPreviewDevice,
  openFullscreenPreview,
  closeFullscreenPreview,
  resetConfiguration,
  synchronizeControlsWithConfig,
  getConfigValue,
  setConfigValue,
  updateConfigFromControl,
  handleUploadedFile,
  showToast
};