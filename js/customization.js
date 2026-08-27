/* =========================================================
   AUTH PAGE BUILDER - CUSTOMIZATION ENGINE
   File: js/customization.js
========================================================= */

/* =========================================================
   INITIALIZE CUSTOMIZATION ENGINE
========================================================= */

function initializeCustomization() {
  initializeCustomizationControls();
  initializeRangeValueDisplays();
  initializeColorControls();
  initializeFileUploads();
  initializePageControls();
  initializePageSpecificCustomization();
  initializePreviewDeviceControls();
  initializeFullscreenPreview();
  initializeResetControls();
  initializePanelAccordions();
}

/* =========================================================
   CUSTOMIZATION CONTROLS
========================================================= */

function initializeCustomizationControls() {
  const controls = document.querySelectorAll("[data-config-path]");

  controls.forEach((control) => {
    const eventName = getControlEvent(control);

    control.addEventListener(eventName, handleCustomizationChange);

    if (eventName !== "change") {
      control.addEventListener("change", handleCustomizationChange);
    }
  });
}

/* =========================================================
   GET CONTROL EVENT
========================================================= */

function getControlEvent(control) {
  if (
    control.type === "range" ||
    control.type === "text" ||
    control.type === "number"
  ) {
    return "input";
  }

  if (control.tagName === "TEXTAREA") {
    return "input";
  }

  return "change";
}

/* =========================================================
   HANDLE CUSTOMIZATION CHANGE
========================================================= */

function handleCustomizationChange(event) {
  const control = event.currentTarget;
  const path = control.dataset.configPath;

  if (!path) return;

  const value = getControlValue(control);

  setConfigValue(path, value);

  syncRelatedControls(control, value);

  saveConfig();
  refreshPreview();
}

/* =========================================================
   GET CONTROL VALUE
========================================================= */

function getControlValue(control) {
  if (control.type === "checkbox") {
    return control.checked;
  }

  if (control.type === "number" || control.type === "range") {
    const number = Number(control.value);
    return Number.isNaN(number) ? 0 : number;
  }

  if (control.type === "radio") {
    if (!control.checked) {
      return getConfigValue(control.dataset.configPath);
    }

    return control.value;
  }

  return control.value;
}

/* =========================================================
   SET CONFIG VALUE
========================================================= */

function setConfigValue(path, value) {
  if (!path) return;

  if (typeof window.setConfigByPath === "function") {
    window.setConfigByPath(path, value);
    return;
  }

  const keys = path.split(".");
  let target = window.config;

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index];

    if (
      !target[key] ||
      typeof target[key] !== "object" ||
      Array.isArray(target[key])
    ) {
      target[key] = {};
    }

    target = target[key];
  }

  target[keys[keys.length - 1]] = value;
}

/* =========================================================
   GET CONFIG VALUE
========================================================= */

function getConfigValue(path) {
  if (!path) return undefined;

  if (typeof window.getConfigByPath === "function") {
    return window.getConfigByPath(path);
  }

  const keys = path.split(".");
  let value = window.config;

  for (const key of keys) {
    if (value === undefined || value === null) {
      return undefined;
    }

    value = value[key];
  }

  return value;
}

/* =========================================================
   REFRESH PREVIEW
========================================================= */

function refreshPreview() {
  if (typeof window.renderPreviewRoot === "function") {
    window.renderPreviewRoot();
  } else if (typeof window.renderPreview === "function") {
    const previewRoot = document.getElementById("previewRoot");

    if (previewRoot) {
      window.renderPreview(previewRoot);
    }
  }

  updateConfigurationIndicators();
}

/* =========================================================
   RANGE VALUE DISPLAYS
========================================================= */

function initializeRangeValueDisplays() {
  document
    .querySelectorAll("input[type='range'][data-value-target]")
    .forEach((range) => {
      updateRangeDisplay(range);

      range.addEventListener("input", () => {
        updateRangeDisplay(range);
      });
    });
}

function updateRangeDisplay(range) {
  if (!range || !range.dataset) return;

  const targetSelector = range.dataset.valueTarget;

  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);

  if (!target) return;

  const suffix = range.dataset.valueSuffix || "";

  target.textContent = `${range.value}${suffix}`;
}

/* =========================================================
   COLOR CONTROLS
========================================================= */

function initializeColorControls() {
  document
    .querySelectorAll("[data-color-target]")
    .forEach((control) => {
      control.addEventListener("input", () => {
        syncColorControl(control);
      });

      control.addEventListener("change", () => {
        syncColorControl(control);
      });
    });
}

function syncColorControl(control) {
  const targetSelector = control.dataset.colorTarget;

  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);

  if (!target) return;

  target.value = control.value;

  target.dispatchEvent(
    new Event("input", {
      bubbles: true
    })
  );
}

/* =========================================================
   SYNC RELATED CONTROLS
========================================================= */

function syncRelatedControls(control, value) {
  const targetSelector = control.dataset.syncTarget;

  if (!targetSelector) return;

  const targets = document.querySelectorAll(targetSelector);

  targets.forEach((target) => {
    if (target === control) return;

    if (target.type === "checkbox") {
      target.checked = Boolean(value);
    } else {
      target.value = value;
    }
  });
}

/* =========================================================
   FILE UPLOADS
========================================================= */

function initializeFileUploads() {
  document
    .querySelectorAll("[data-upload-type]")
    .forEach((input) => {
      input.addEventListener("change", handleFileUpload);
    });
}

function handleFileUpload(event) {
  const input = event.currentTarget;
  const file = input.files?.[0];

  if (!file) return;

  const uploadType = input.dataset.uploadType;
  const reader = new FileReader();

  reader.onload = () => {
    const result = reader.result;

    applyUploadedFile(uploadType, result, file);

    saveConfig();
    refreshPreview();

    updateUploadPreview(input, result, file);
  };

  reader.readAsDataURL(file);
}

function applyUploadedFile(uploadType, data, file) {
  if (!window.config) return;

  if (uploadType === "background") {
    window.config.background.uploadedImage = data;
    window.config.background.image = data;
    window.config.background.imageUrl = data;
    window.config.background.fileName = file.name;
    window.config.background.imageFileName = file.name;
    window.config.background.imageSource = "upload";
    window.config.background.type = "upload";
    return;
  }

  if (uploadType === "logo") {
    window.config.branding.logo = data;
    window.config.branding.logoUrl = data;
    window.config.branding.uploadedLogo = data;
    window.config.branding.logoFileName = file.name;
    window.config.branding.logoSource = "upload";
    window.config.branding.logoType = "upload";
    return;
  }

  if (uploadType === "favicon") {
    window.config.branding.favicon = data;
    window.config.branding.faviconFileName = file.name;
    return;
  }

  if (uploadType === "social") {
    const provider =
      eventTargetProvider(uploadType);

    if (!provider) return;

    window.config.social =
      window.config.social || {};

    window.config.social.customIcons =
      window.config.social.customIcons || {};

    window.config.social.customIcons[provider] = data;
  }
}

function eventTargetProvider() {
  const activeInput = document.activeElement;

  if (activeInput?.dataset?.socialProvider) {
    return activeInput.dataset.socialProvider;
  }

  return null;
}

function updateUploadPreview(input, source, file) {
  const previewSelector = input.dataset.uploadPreview;

  if (previewSelector) {
    const preview = document.querySelector(previewSelector);

    if (preview) {
      if (preview.tagName === "IMG") {
        preview.src = source;
      } else {
        preview.style.backgroundImage = `url("${source}")`;
      }
    }
  }

  const nameTargetSelector = input.dataset.fileNameTarget;

  if (nameTargetSelector) {
    const target = document.querySelector(nameTargetSelector);

    if (target) {
      target.textContent = file.name;
    }
  }
}

/* =========================================================
   PAGE CONTROLS
========================================================= */

function initializePageControls() {
  const pageButtons = document.querySelectorAll(
    "[data-page]"
  );

  pageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const page = normalizePageName(
        button.dataset.page
      );

      setActivePage(page);
    });
  });
}

/* =========================================================
   NORMALIZE PAGE NAME
========================================================= */

function normalizePageName(page) {
  const value = String(page || "")
    .trim()
    .toLowerCase();

  const aliases = {
    login: "login",
    signin: "login",
    "sign-in": "login",

    signup: "signup",
    "sign-up": "signup",
    register: "signup",

    forgot: "forgotPassword",
    forgotpassword: "forgotPassword",
    "forgot-password": "forgotPassword",
    "forgot password": "forgotPassword",

    otp: "otp",
    verification: "otp",
    verify: "otp"
  };

  return aliases[value] || "login";
}

/* =========================================================
   GET ACTIVE PAGE
========================================================= */

function getActivePage() {
  if (window.config?.currentPage) {
    return normalizePageName(
      window.config.currentPage
    );
  }

  const activeButton =
    document.querySelector(
      "[data-page].active, [data-page][aria-selected='true']"
    );

  if (activeButton) {
    return normalizePageName(
      activeButton.dataset.page
    );
  }

  return "login";
}

/* =========================================================
   GET ACTIVE PAGE CONFIG
========================================================= */

function getActivePageConfig() {
  const activePage = getActivePage();

  return (
    window.config?.pages?.[activePage] ||
    null
  );
}

/* =========================================================
   SET ACTIVE PAGE
========================================================= */

function setActivePage(page) {
  const normalizedPage =
    normalizePageName(page);

  if (!window.config) return;

  window.config.currentPage =
    normalizedPage;

  updateActivePageButton(
    normalizedPage
  );

  updatePageSpecificCustomization(
    normalizedPage
  );

  syncPageSpecificControlsFromConfig(
    normalizedPage
  );

  saveConfig();
  refreshPreview();
}

/* =========================================================
   UPDATE ACTIVE PAGE BUTTON
========================================================= */

function updateActivePageButton(page) {
  document
    .querySelectorAll("[data-page]")
    .forEach((button) => {
      const buttonPage =
        normalizePageName(
          button.dataset.page
        );

      const isActive =
        buttonPage === page;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-selected",
        String(isActive)
      );
    });
}

/* =========================================================
   PAGE-SPECIFIC CUSTOMIZATION
========================================================= */

function initializePageSpecificCustomization() {
  document
    .querySelectorAll(
      "[data-page-customization], [data-customization-page]"
    )
    .forEach((panel) => {
      panel.setAttribute(
        "data-page-customization-ready",
        "true"
      );
    });

  updatePageSpecificCustomization(
    getActivePage()
  );

  initializePageSpecificControls();
}

/* =========================================================
   INITIALIZE PAGE-SPECIFIC CONTROLS
========================================================= */

function initializePageSpecificControls() {
  const controls =
    document.querySelectorAll(
      "[data-page-config-path]"
    );

  controls.forEach((control) => {
    const eventName =
      getControlEvent(control);

    control.addEventListener(
      eventName,
      handlePageSpecificCustomizationChange
    );

    if (eventName !== "change") {
      control.addEventListener(
        "change",
        handlePageSpecificCustomizationChange
      );
    }
  });
}

/* =========================================================
   HANDLE PAGE-SPECIFIC CHANGE
========================================================= */

function handlePageSpecificCustomizationChange(event) {
  const control =
    event.currentTarget;

  const path =
    control.dataset.pageConfigPath;

  if (!path) return;

  const value =
    getControlValue(control);

  setConfigValue(
    path,
    value
  );

  handlePageSpecificControlEffects(
    path,
    value,
    control
  );

  saveConfig();
  refreshPreview();
}

/* =========================================================
   HANDLE SPECIAL PAGE EFFECTS
========================================================= */

function handlePageSpecificControlEffects(
  path,
  value,
  control
) {
  if (
    path ===
    "pages.otp.input.length"
  ) {
    const length =
      Number(value);

    if (
      ![4, 6, 8].includes(length)
    ) {
      setConfigValue(
        path,
        6
      );
    }
  }

  if (
    path ===
    "pages.otp.delivery.defaultMethod"
  ) {
    const methods =
      getConfigValue(
        "pages.otp.delivery.methods"
      ) || {};

    if (
      !methods[value]
    ) {
      methods[value] = true;

      setConfigValue(
        "pages.otp.delivery.methods",
        methods
      );
    }
  }

  if (
    path ===
    "pages.login.identifier.type"
  ) {
    updateLoginIdentifierControls(
      value
    );
  }

  if (
    path ===
    "pages.forgotPassword.identifier.type"
  ) {
    updateForgotIdentifierControls(
      value
    );
  }

  if (
    control?.dataset?.toggleTarget
  ) {
    const target =
      document.querySelector(
        control.dataset.toggleTarget
      );

    if (target) {
      target.hidden =
        !Boolean(value);

      target.classList.toggle(
        "is-hidden",
        !Boolean(value)
      );
    }
  }
}

/* =========================================================
   UPDATE LOGIN IDENTIFIER CONTROLS
========================================================= */

function updateLoginIdentifierControls(type) {
  document
    .querySelectorAll(
      "[data-login-identifier-control]"
    )
    .forEach((element) => {
      const allowed =
        element.dataset
          .loginIdentifierControl;

      element.hidden =
        allowed !== type;
    });
}

/* =========================================================
   UPDATE FORGOT IDENTIFIER CONTROLS
========================================================= */

function updateForgotIdentifierControls(type) {
  document
    .querySelectorAll(
      "[data-forgot-identifier-control]"
    )
    .forEach((element) => {
      const allowed =
        element.dataset
          .forgotIdentifierControl;

      element.hidden =
        allowed !== type;
    });
}

/* =========================================================
   UPDATE PAGE-SPECIFIC PANELS
========================================================= */

function updatePageSpecificCustomization(page) {
  const normalizedPage =
    normalizePageName(page);

  const panels =
    document.querySelectorAll(
      "[data-page-customization], [data-customization-page]"
    );

  panels.forEach((panel) => {
    const panelPage =
      normalizePageName(
        panel.dataset.pageCustomization ||
        panel.dataset.customizationPage
      );

    const isActive =
      panelPage === normalizedPage;

    panel.hidden =
      !isActive;

    panel.classList.toggle(
      "active",
      isActive
    );

    panel.classList.toggle(
      "is-active",
      isActive
    );

    panel.setAttribute(
      "aria-hidden",
      String(!isActive)
    );
  });

  document
    .querySelectorAll(
      "[data-page-customization-label]"
    )
    .forEach((element) => {
      const pageName =
        normalizePageName(
          element.dataset
            .pageCustomizationLabel
        );

      element.hidden =
        pageName !== normalizedPage;
    });
}

/* =========================================================
   SYNC PAGE CONTROLS FROM CONFIG
========================================================= */

function syncPageSpecificControlsFromConfig(page) {
  const normalizedPage =
    normalizePageName(page);

  document
    .querySelectorAll(
      "[data-page-config-path]"
    )
    .forEach((control) => {
      const path =
        control.dataset.pageConfigPath;

      if (
        !path.startsWith(
          `pages.${normalizedPage}.`
        )
      ) {
        return;
      }

      const value =
        getConfigValue(path);

      if (
        value === undefined
      ) {
        return;
      }

      if (
        control.type === "checkbox"
      ) {
        control.checked =
          Boolean(value);
      } else if (
        control.type === "radio"
      ) {
        control.checked =
          String(control.value) ===
          String(value);
      } else {
        control.value =
          value;
      }

      updateRangeDisplay(
        control
      );
    });

  if (
    normalizedPage === "login"
  ) {
    const type =
      getConfigValue(
        "pages.login.identifier.type"
      );

    updateLoginIdentifierControls(
      type
    );
  }

  if (
    normalizedPage ===
    "forgotPassword"
  ) {
    const type =
      getConfigValue(
        "pages.forgotPassword.identifier.type"
      );

    updateForgotIdentifierControls(
      type
    );
  }
}

/* =========================================================
   PREVIEW DEVICE CONTROLS
========================================================= */

function initializePreviewDeviceControls() {
  document
    .querySelectorAll(
      "[data-preview-device]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const device =
            button.dataset.previewDevice;

          setPreviewDevice(
            device
          );
        }
      );
    });
}

/* =========================================================
   SET PREVIEW DEVICE
========================================================= */

function setPreviewDevice(device) {
  if (!window.config) return;

  const allowedDevices = [
    "desktop",
    "tablet",
    "mobile"
  ];

  const selected =
    allowedDevices.includes(device)
      ? device
      : "desktop";

  window.config.previewDevice =
    selected;

  updateActiveDeviceButton(
    selected
  );

  const previewRoot =
    document.getElementById(
      "previewRoot"
    ) ||
    document.querySelector(
      ".preview-root"
    );

  if (previewRoot) {
    previewRoot.dataset.device =
      selected;

    previewRoot.classList.remove(
      "preview-desktop",
      "preview-tablet",
      "preview-mobile"
    );

    previewRoot.classList.add(
      `preview-${selected}`
    );
  }

  saveConfig();

  refreshPreview();
}

/* =========================================================
   UPDATE ACTIVE DEVICE BUTTON
========================================================= */

function updateActiveDeviceButton(device) {
  document
    .querySelectorAll(
      "[data-preview-device]"
    )
    .forEach((button) => {
      const isActive =
        button.dataset.previewDevice ===
        device;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    });
}

/* =========================================================
   FULLSCREEN PREVIEW
========================================================= */

function initializeFullscreenPreview() {
  document
    .querySelectorAll(
      "[data-fullscreen-preview]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        openFullscreenPreview
      );
    });

  document
    .querySelectorAll(
      "[data-close-fullscreen]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        closeFullscreenPreview
      );
    });
}

/* =========================================================
   OPEN FULLSCREEN
========================================================= */

function openFullscreenPreview() {
  const container =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!container) {
    console.warn(
      "Fullscreen preview container not found."
    );

    return;
  }

  window.config.fullscreen =
    true;

  container.classList.add(
    "auth-fullscreen-open"
  );

  document.body.style.overflow =
    "hidden";

  const fullscreenRoot =
    document.getElementById(
      "fullscreenPreviewRoot"
    );

  if (
    fullscreenRoot &&
    typeof window.renderPreview ===
      "function"
  ) {
    window.renderPreview(
      fullscreenRoot
    );
  }

  setPreviewDevice(
    window.config.previewDevice ||
    "desktop"
  );
}

/* =========================================================
   CLOSE FULLSCREEN
========================================================= */

function closeFullscreenPreview() {
  const container =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!container) return;

  window.config.fullscreen =
    false;

  container.classList.remove(
    "auth-fullscreen-open"
  );

  document.body.style.overflow =
    "";
}

/* =========================================================
   RESET CONTROLS
========================================================= */

function initializeResetControls() {
  document
    .querySelectorAll(
      "[data-reset-path]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          resetConfigPath(
            button.dataset.resetPath
          );
        }
      );
    });
}

/* =========================================================
   RESET CONFIG PATH
========================================================= */

function resetConfigPath(path) {
  if (
    !path ||
    !window.defaultConfig
  ) {
    return;
  }

  const defaultValue =
    getObjectValue(
      window.defaultConfig,
      path
    );

  if (
    defaultValue === undefined
  ) {
    return;
  }

  setConfigValue(
    path,
    deepClone(defaultValue)
  );

  syncControlsFromConfig();

  saveConfig();
  refreshPreview();
}

/* =========================================================
   RESET COMPLETE CONFIG
========================================================= */

function resetCompleteConfiguration() {
  if (!window.defaultConfig) return;

  const confirmation =
    window.confirm(
      "Reset all customization settings?"
    );

  if (!confirmation) return;

  if (
    typeof window.resetConfig ===
    "function"
  ) {
    window.resetConfig();
  } else {
    window.config =
      deepClone(
        window.defaultConfig
      );
  }

  syncControlsFromConfig();

  saveConfig();
  refreshPreview();
}

/* =========================================================
   GET OBJECT VALUE
========================================================= */

function getObjectValue(
  object,
  path
) {
  if (!object || !path) {
    return undefined;
  }

  const keys =
    path.split(".");

  let value =
    object;

  for (const key of keys) {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }

    value =
      value[key];
  }

  return value;
}

/* =========================================================
   DEEP CLONE
========================================================= */

function deepClone(value) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

/* =========================================================
   SYNC CONTROLS FROM CONFIG
========================================================= */

function syncControlsFromConfig() {
  document
    .querySelectorAll(
      "[data-config-path]"
    )
    .forEach((control) => {
      const path =
        control.dataset.configPath;

      const value =
        getConfigValue(path);

      if (
        value === undefined
      ) {
        return;
      }

      if (
        control.type === "checkbox"
      ) {
        control.checked =
          Boolean(value);
      } else if (
        control.type === "radio"
      ) {
        control.checked =
          control.value ===
          String(value);
      } else {
        control.value =
          value;
      }

      updateRangeDisplay(
        control
      );
    });

  updateActivePageButton(
    getActivePage()
  );

  updatePageSpecificCustomization(
    getActivePage()
  );

  syncPageSpecificControlsFromConfig(
    getActivePage()
  );

  updateActiveDeviceButton(
    window.config?.previewDevice ||
    "desktop"
  );
}

/* =========================================================
   PANEL ACCORDIONS
========================================================= */

function initializePanelAccordions() {
  document
    .querySelectorAll(
      "[data-accordion-trigger]"
    )
    .forEach((trigger) => {
      trigger.addEventListener(
        "click",
        () => {
          const accordion =
            trigger.closest(
              ".customization-accordion"
            );

          if (!accordion) return;

          accordion.classList.toggle(
            "open"
          );

          const isOpen =
            accordion.classList.contains(
              "open"
            );

          trigger.setAttribute(
            "aria-expanded",
            String(isOpen)
          );
        }
      );
    });
}

/* =========================================================
   CONFIGURATION INDICATORS
========================================================= */

function updateConfigurationIndicators() {
  updateActiveCustomizationIndicators();
  updateUnsavedState();
}

function updateActiveCustomizationIndicators() {
  document
    .querySelectorAll(
      "[data-config-path], [data-page-config-path]"
    )
    .forEach((control) => {
      const path =
        control.dataset.configPath ||
        control.dataset.pageConfigPath;

      const currentValue =
        getConfigValue(path);

      const defaultValue =
        window.defaultConfig
          ? getObjectValue(
              window.defaultConfig,
              path
            )
          : undefined;

      const section =
        control.closest(
          ".customization-section"
        );

      if (!section) return;

      const isCustomized =
        JSON.stringify(
          currentValue
        ) !==
        JSON.stringify(
          defaultValue
        );

      section.classList.toggle(
        "is-customized",
        isCustomized
      );
    });
}

function updateUnsavedState() {
  document
    .querySelectorAll(
      "[data-unsaved-indicator]"
    )
    .forEach((indicator) => {
      indicator.textContent =
        "All changes saved";

      indicator.classList.remove(
        "unsaved"
      );
    });
}

/* =========================================================
   SAVE CONFIG
========================================================= */

function saveConfig() {
  try {
    localStorage.setItem(
      "authPageBuilderConfig",
      JSON.stringify(
        window.config
      )
    );
  } catch (error) {
    console.warn(
      "Unable to save configuration",
      error
    );
  }
}

/* =========================================================
   LOAD SAVED CONFIG
========================================================= */

function loadSavedConfig() {
  try {
    const saved =
      localStorage.getItem(
        "authPageBuilderConfig"
      );

    if (!saved) {
      return false;
    }

    const savedConfig =
      JSON.parse(saved);

    if (
      !savedConfig ||
      typeof savedConfig !==
        "object"
    ) {
      return false;
    }

    const merged =
      mergeConfig(
        deepClone(
          window.defaultConfig
        ),
        savedConfig
      );

    if (
      typeof window.setConfig ===
      "function"
    ) {
      window.setConfig(
        merged
      );
    } else {
      window.config =
        merged;
    }

    return true;
  } catch (error) {
    console.warn(
      "Unable to load saved configuration",
      error
    );

    return false;
  }
}

/* =========================================================
   MERGE CONFIG
========================================================= */

function mergeConfig(
  target,
  source
) {
  if (
    !source ||
    typeof source !== "object"
  ) {
    return target;
  }

  Object.keys(source).forEach(
    (key) => {
      if (
        source[key] &&
        typeof source[key] ===
          "object" &&
        !Array.isArray(
          source[key]
        )
      ) {
        if (
          !target[key] ||
          typeof target[key] !==
            "object" ||
          Array.isArray(
            target[key]
          )
        ) {
          target[key] = {};
        }

        mergeConfig(
          target[key],
          source[key]
        );
      } else {
        target[key] =
          deepClone(
            source[key]
          );
      }
    }
  );

  return target;
}

/* =========================================================
   CLEAR SAVED CONFIG
========================================================= */

function clearSavedConfiguration() {
  localStorage.removeItem(
    "authPageBuilderConfig"
  );

  if (!window.defaultConfig) {
    return;
  }

  if (
    typeof window.resetConfig ===
    "function"
  ) {
    window.resetConfig();
  } else {
    window.config =
      deepClone(
        window.defaultConfig
      );
  }

  syncControlsFromConfig();
  refreshPreview();
}

/* =========================================================
   START APPLICATION
========================================================= */

function initializeAuthPageBuilder() {
  loadSavedConfig();

  initializeCustomization();

  syncControlsFromConfig();

  if (
    typeof window.renderPreviewRoot ===
    "function"
  ) {
    window.renderPreviewRoot();
  }

  setPreviewDevice(
    window.config?.previewDevice ||
    "desktop"
  );
}

/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAuthPageBuilder
  );
} else {
  initializeAuthPageBuilder();
}

/* =========================================================
   EXPOSE FUNCTIONS
========================================================= */

window.authCustomization = {
  initializeCustomization,

  initializeAuthPageBuilder,

  refreshPreview,

  setConfigValue,

  getConfigValue,

  syncControlsFromConfig,

  saveConfig,

  loadSavedConfig,

  resetConfigPath,

  resetCompleteConfiguration,

  clearSavedConfiguration,

  setPreviewDevice,

  openFullscreenPreview,

  closeFullscreenPreview,

  getActivePage,

  getActivePageConfig,

  setActivePage,

  updatePageSpecificCustomization,

  syncPageSpecificControlsFromConfig,

  getActiveConfig() {
    return window.config;
  }
};