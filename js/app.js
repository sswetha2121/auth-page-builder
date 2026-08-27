/* =========================================================
   AUTH PAGE BUILDER - MAIN APPLICATION CONTROLLER
   File: js/app.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

function initializeApp() {
  initializeAccordion();
  initializePageSwitcher();
  initializeDeviceSwitcher();
  initializeFullscreenPreview();
  initializeResetButton();
  initializeDownloadButton();
  initializeCustomizationControls();

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

    header.addEventListener("click", () => {
      const isActive = section.classList.contains("active");

      sections.forEach((item) => {
        item.classList.remove("active");
      });

      if (!isActive) {
        section.classList.add("active");
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
    });

  renderCurrentPreview();

  updatePageSpecificControls(page);
}


/* =========================================================
   PAGE SPECIFIC CONTROLS
========================================================= */

function updatePageSpecificControls(page) {
  const pageControls = document.querySelectorAll(
    "[data-page-control]"
  );

  pageControls.forEach((control) => {
    const supportedPages =
      control.dataset.pageControl
        .split(",")
        .map((item) => item.trim());

    const shouldShow =
      supportedPages.includes(page);

    control.style.display =
      shouldShow ? "" : "none";
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


function setPreviewDevice(device) {
  const previewFrame = document.querySelector(
    ".preview-frame"
  );

  if (!previewFrame) {
    return;
  }

  previewFrame.classList.remove(
    "preview-desktop",
    "preview-tablet",
    "preview-mobile"
  );

  previewFrame.classList.add(
    `preview-${device}`
  );

  document
    .querySelectorAll("[data-device]")
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.device === device
      );
    });

  if (window.config) {
    window.config.previewDevice = device;
  }
}


/* =========================================================
   FULLSCREEN PREVIEW
========================================================= */

function initializeFullscreenPreview() {
  const fullscreenButton =
    document.querySelector(
      "[data-action='fullscreen']"
    );

  if (!fullscreenButton) {
    return;
  }

  fullscreenButton.addEventListener(
    "click",
    openFullscreenPreview
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape"
      ) {
        closeFullscreenPreview();
      }
    }
  );
}


function openFullscreenPreview() {
  const fullscreen =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!fullscreen) {
    createFullscreenPreview();
  }

  const fullscreenPreview =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!fullscreenPreview) {
    return;
  }

  fullscreenPreview.classList.add(
    "auth-fullscreen-open"
  );

  document.body.style.overflow =
    "hidden";

  renderFullscreenPreview();
}


function closeFullscreenPreview() {
  const fullscreen =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!fullscreen) {
    return;
  }

  fullscreen.classList.remove(
    "auth-fullscreen-open"
  );

  document.body.style.overflow = "";
}


function createFullscreenPreview() {
  const fullscreen =
    document.createElement("div");

  fullscreen.className =
    "auth-fullscreen-preview";

  fullscreen.innerHTML = `
    <div class="auth-fullscreen-header">

      <div class="auth-fullscreen-title">
        Fullscreen Preview
      </div>

      <button
        type="button"
        class="auth-fullscreen-close"
        aria-label="Close fullscreen preview"
      >
        ×
      </button>

    </div>

    <div class="auth-fullscreen-content">

      <div
        id="fullscreenPreviewRoot"
        class="preview-root"
      >
      </div>

    </div>
  `;

  document.body.appendChild(fullscreen);

  const closeButton =
    fullscreen.querySelector(
      ".auth-fullscreen-close"
    );

  closeButton.addEventListener(
    "click",
    closeFullscreenPreview
  );

  fullscreen.addEventListener(
    "click",
    (event) => {
      if (
        event.target === fullscreen
      ) {
        closeFullscreenPreview();
      }
    }
  );
}


function renderFullscreenPreview() {
  const root =
    document.getElementById(
      "fullscreenPreviewRoot"
    );

  if (!root) {
    return;
  }

  if (
    typeof window.renderPreview ===
    "function"
  ) {
    window.renderPreview(root);
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
    typeof window.resetConfig !==
    "function"
  ) {
    console.warn(
      "resetConfig() function not found"
    );

    return;
  }

  const confirmed =
    window.confirm(
      "Reset all customizations to default values?"
    );

  if (!confirmed) {
    return;
  }

  window.resetConfig();

  synchronizeControlsWithConfig();

  renderCurrentPreview();

  showToast(
    "All customizations have been reset"
  );
}


/* =========================================================
   CUSTOMIZATION CONTROLS
========================================================= */

function initializeCustomizationControls() {
  const controls =
    document.querySelectorAll(
      "[data-config]"
    );

  controls.forEach((control) => {
    const eventType =
      getControlEventType(control);

    control.addEventListener(
      eventType,
      () => {
        updateConfigFromControl(
          control
        );
      }
    );

    if (
      control.type === "text" ||
      control.type === "number" ||
      control.type === "range" ||
      control.tagName === "TEXTAREA"
    ) {
      control.addEventListener(
        "input",
        () => {
          updateConfigFromControl(
            control
          );
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
    control.type === "text" ||
    control.type === "range" ||
    control.type === "number" ||
    control.type === "color" ||
    control.type === "file"
  ) {
    return "input";
  }

  return "change";
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

  let value =
    getControlValue(control);

  setConfigValue(
    configPath,
    value
  );

  updateControlDisplay(
    control,
    value
  );

  renderCurrentPreview();
}


/* =========================================================
   GET CONTROL VALUE
========================================================= */

function getControlValue(control) {
  if (control.type === "checkbox") {
    return control.checked;
  }

  if (control.type === "number") {
    return Number(control.value);
  }

  if (control.type === "range") {
    return Number(control.value);
  }

  if (control.type === "file") {
    const file =
      control.files?.[0];

    if (!file) {
      return null;
    }

    handleUploadedFile(
      control,
      file
    );

    return control.value;
  }

  return control.value;
}


/* =========================================================
   FILE UPLOAD
========================================================= */

function handleUploadedFile(
  control,
  file
) {
  const configPath =
    control.dataset.config;

  if (!configPath) {
    return;
  }

  const reader =
    new FileReader();

  reader.onload = (event) => {
    const imageData =
      event.target.result;

    setConfigValue(
      configPath,
      imageData
    );

    renderCurrentPreview();

    showToast(
      `${file.name} uploaded successfully`
    );
  };

  reader.readAsDataURL(file);
}


/* =========================================================
   SET CONFIG VALUE USING PATH
========================================================= */

function setConfigValue(
  path,
  value
) {
  if (!window.config) {
    return;
  }

  const keys =
    path.split(".");

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

    current =
      current[key];
  }

  const finalKey =
    keys[keys.length - 1];

  current[finalKey] = value;
}


/* =========================================================
   GET CONFIG VALUE
========================================================= */

function getConfigValue(path) {
  if (!window.config) {
    return undefined;
  }

  const keys =
    path.split(".");

  let current =
    window.config;

  for (const key of keys) {
    if (
      current === undefined ||
      current === null
    ) {
      return undefined;
    }

    current =
      current[key];
  }

  return current;
}


/* =========================================================
   RANGE VALUE DISPLAY
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

  let suffix =
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

    const value =
      button.dataset.value;

    if (
      !configPath ||
      value === undefined
    ) {
      return;
    }

    const group =
      button.parentElement;

    if (group) {
      group
        .querySelectorAll(
          `[data-config-value="${configPath}"]`
        )
        .forEach((item) => {
          item.classList.remove(
            "active"
          );
        });
    }

    button.classList.add("active");

    setConfigValue(
      configPath,
      value
    );

    renderCurrentPreview();
  }
);


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

    const value =
      getConfigValue(configPath);

    if (value === undefined) {
      return;
    }

    if (control.type === "checkbox") {
      control.checked =
        Boolean(value);
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
      button.dataset.value;

    const configValue =
      getConfigValue(configPath);

    button.classList.toggle(
      "active",
      String(configValue) ===
      String(buttonValue)
    );
  });
}


/* =========================================================
   CURRENT PREVIEW
========================================================= */

function renderCurrentPreview() {
  const root =
    document.getElementById(
      "previewRoot"
    );

  if (!root) {
    return;
  }

  if (
    typeof window.renderPreview !==
    "function"
  ) {
    console.warn(
      "renderPreview() is not available"
    );

    return;
  }

  window.renderPreview(root);
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
      () => {
        if (
          typeof window.downloadPackage ===
          "function"
        ) {
          window.downloadPackage();
        } else {
          console.warn(
            "downloadPackage() is not available"
          );

          showToast(
            "Package generator is not ready yet"
          );
        }
      }
    );
  });
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
  let toast =
    document.querySelector(
      ".app-toast"
    );

  if (!toast) {
    toast =
      document.createElement("div");

    toast.className =
      "app-toast";

    document.body.appendChild(
      toast
    );
  }

  toast.textContent = message;

  toast.classList.add(
    "app-toast-visible"
  );

  clearTimeout(
    window.__authBuilderToastTimer
  );

  window.__authBuilderToastTimer =
    setTimeout(
      () => {
        toast.classList.remove(
          "app-toast-visible"
        );
      },
      3000
    );
}


/* =========================================================
   AUTO SAVE STATUS
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
}


/* =========================================================
   EXPOSE FUNCTIONS
========================================================= */

window.authPageBuilder = {
  initializeApp,
  renderCurrentPreview,
  setCurrentPage,
  setPreviewDevice,
  openFullscreenPreview,
  closeFullscreenPreview,
  resetConfiguration,
  synchronizeControlsWithConfig,
  getConfigValue,
  setConfigValue,
  showToast
};