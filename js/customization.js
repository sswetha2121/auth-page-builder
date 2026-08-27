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

  initializePreviewDeviceControls();

  initializeFullscreenPreview();

  initializeResetControls();

  initializePanelAccordions();
}


/* =========================================================
   CUSTOMIZATION CONTROLS
========================================================= */

/*
HTML convention:

<input
  data-config-path="branding.logoSize"
  type="range"
  value="64"
/>

<select
  data-config-path="layout.type"
>
  ...
</select>

<input
  data-config-path="background.overlayEnabled"
  type="checkbox"
/>

When a user changes a control, the value is written directly
to the corresponding location inside window.config.
*/


function initializeCustomizationControls() {
  const controls =
    document.querySelectorAll(
      "[data-config-path]"
    );

  controls.forEach((control) => {
    const eventName =
      getControlEvent(control);

    control.addEventListener(
      eventName,
      handleCustomizationChange
    );

    if (
      eventName !== "change"
    ) {
      control.addEventListener(
        "change",
        handleCustomizationChange
      );
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

  if (
    control.tagName === "TEXTAREA"
  ) {
    return "input";
  }

  return "change";
}


/* =========================================================
   HANDLE CUSTOMIZATION CHANGE
========================================================= */

function handleCustomizationChange(event) {
  const control =
    event.currentTarget;

  const path =
    control.dataset.configPath;

  if (!path) {
    return;
  }

  const value =
    getControlValue(control);

  setConfigValue(
    path,
    value
  );

  syncRelatedControls(
    control,
    value
  );

  saveConfig();

  refreshPreview();
}


/* =========================================================
   GET CONTROL VALUE
========================================================= */

function getControlValue(control) {
  if (
    control.type === "checkbox"
  ) {
    return control.checked;
  }

  if (
    control.type === "number"
  ) {
    const number =
      Number(control.value);

    return Number.isNaN(number)
      ? 0
      : number;
  }

  if (
    control.type === "range"
  ) {
    const number =
      Number(control.value);

    return Number.isNaN(number)
      ? 0
      : number;
  }

  if (
    control.type === "radio"
  ) {
    return control.checked
      ? control.value
      : getConfigValue(
          control.dataset.configPath
        );
  }

  return control.value;
}


/* =========================================================
   SET NESTED CONFIG VALUE
========================================================= */

function setConfigValue(
  path,
  value
) {
  if (!path) {
    return;
  }

  const keys =
    path.split(".");

  let target =
    window.config;

  for (
    let index = 0;
    index < keys.length - 1;
    index++
  ) {
    const key =
      keys[index];

    if (
      typeof target[key] !==
      "object"
    ) {
      target[key] = {};
    }

    target =
      target[key];
  }

  const finalKey =
    keys[keys.length - 1];

  target[finalKey] =
    value;
}


/* =========================================================
   GET NESTED CONFIG VALUE
========================================================= */

function getConfigValue(path) {
  if (!path) {
    return undefined;
  }

  const keys =
    path.split(".");

  let value =
    window.config;

  for (
    const key of keys
  ) {
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
   REFRESH PREVIEW
========================================================= */

function refreshPreview() {
  if (
    typeof window.renderPreviewRoot ===
    "function"
  ) {
    window.renderPreviewRoot();
  }

  updateConfigurationIndicators();
}


/* =========================================================
   RANGE VALUE DISPLAYS
========================================================= */

function initializeRangeValueDisplays() {
  document
    .querySelectorAll(
      "input[type='range'][data-value-target]"
    )
    .forEach((range) => {
      updateRangeDisplay(range);

      range.addEventListener(
        "input",
        () => {
          updateRangeDisplay(range);
        }
      );
    });
}


function updateRangeDisplay(range) {
  const targetSelector =
    range.dataset.valueTarget;

  if (!targetSelector) {
    return;
  }

  const target =
    document.querySelector(
      targetSelector
    );

  if (!target) {
    return;
  }

  const suffix =
    range.dataset.valueSuffix || "";

  target.textContent =
    `${range.value}${suffix}`;
}


/* =========================================================
   COLOR CONTROLS
========================================================= */

function initializeColorControls() {
  document
    .querySelectorAll(
      "[data-color-target]"
    )
    .forEach((control) => {
      control.addEventListener(
        "input",
        () => {
          syncColorControl(control);
        }
      );

      control.addEventListener(
        "change",
        () => {
          syncColorControl(control);
        }
      );
    });
}


function syncColorControl(control) {
  const targetSelector =
    control.dataset.colorTarget;

  if (!targetSelector) {
    return;
  }

  const target =
    document.querySelector(
      targetSelector
    );

  if (!target) {
    return;
  }

  target.value =
    control.value;

  target.dispatchEvent(
    new Event(
      "input",
      {
        bubbles: true
      }
    )
  );
}


/* =========================================================
   SYNC RELATED CONTROLS
========================================================= */

function syncRelatedControls(
  control,
  value
) {
  const targetSelector =
    control.dataset.syncTarget;

  if (!targetSelector) {
    return;
  }

  const targets =
    document.querySelectorAll(
      targetSelector
    );

  targets.forEach((target) => {
    if (
      target === control
    ) {
      return;
    }

    if (
      target.type === "checkbox"
    ) {
      target.checked =
        Boolean(value);
    } else {
      target.value =
        value;
    }
  });
}


/* =========================================================
   FILE UPLOAD INITIALIZATION
========================================================= */

function initializeFileUploads() {
  document
    .querySelectorAll(
      "[data-upload-type]"
    )
    .forEach((input) => {
      input.addEventListener(
        "change",
        handleFileUpload
      );
    });
}


/* =========================================================
   HANDLE FILE UPLOAD
========================================================= */

function handleFileUpload(event) {
  const input =
    event.currentTarget;

  const file =
    input.files?.[0];

  if (!file) {
    return;
  }

  const uploadType =
    input.dataset.uploadType;

  const reader =
    new FileReader();

  reader.onload =
    () => {
      const result =
        reader.result;

      applyUploadedFile(
        uploadType,
        result,
        file
      );

      saveConfig();

      refreshPreview();

      updateUploadPreview(
        input,
        result,
        file
      );
    };

  reader.readAsDataURL(file);
}


/* =========================================================
   APPLY UPLOADED FILE
========================================================= */

function applyUploadedFile(
  uploadType,
  data,
  file
) {
  if (
    uploadType ===
    "background"
  ) {
    config.background.uploadedImage =
      data;

    config.background.image =
      data;

    config.background.fileName =
      file.name;

    return;
  }

  if (
    uploadType ===
    "logo"
  ) {
    config.branding.logo =
      data;

    config.branding.uploadedLogo =
      data;

    config.branding.logoFileName =
      file.name;

    return;
  }

  if (
    uploadType ===
    "favicon"
  ) {
    config.branding.favicon =
      data;

    config.branding.faviconFileName =
      file.name;

    return;
  }

  if (
    uploadType ===
    "social"
  ) {
    const provider =
      fileInputProvider(
        file
      );

    if (
      provider
    ) {
      config.social.customIcons =
        config.social.customIcons || {};

      config.social.customIcons[
        provider
      ] = data;
    }
  }
}


/* =========================================================
   GET SOCIAL PROVIDER
========================================================= */

function fileInputProvider(file) {
  const activeInput =
    document.activeElement;

  if (
    activeInput?.dataset
      ?.socialProvider
  ) {
    return activeInput.dataset
      .socialProvider;
  }

  return null;
}


/* =========================================================
   UPDATE UPLOAD PREVIEW
========================================================= */

function updateUploadPreview(
  input,
  source,
  file
) {
  const previewSelector =
    input.dataset.uploadPreview;

  if (
    previewSelector
  ) {
    const preview =
      document.querySelector(
        previewSelector
      );

    if (
      preview &&
      preview.tagName === "IMG"
    ) {
      preview.src =
        source;

      preview.hidden =
        false;
    }
  }

  const fileNameSelector =
    input.dataset.fileNameTarget;

  if (
    fileNameSelector
  ) {
    const nameTarget =
      document.querySelector(
        fileNameSelector
      );

    if (
      nameTarget
    ) {
      nameTarget.textContent =
        file.name;
    }
  }
}


/* =========================================================
   PAGE CONTROLS
========================================================= */

function initializePageControls() {
  document
    .querySelectorAll(
      "[data-builder-page]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const page =
            button.dataset.builderPage;

          if (!page) {
            return;
          }

          config.currentPage =
            page;

          updateActivePageButton(
            page
          );

          saveConfig();

          refreshPreview();
        }
      );
    });
}


/* =========================================================
   UPDATE ACTIVE PAGE BUTTON
========================================================= */

function updateActivePageButton(
  page
) {
  document
    .querySelectorAll(
      "[data-builder-page]"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.builderPage ===
          page
      );
    });
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

function setPreviewDevice(
  device
) {
  const previewRoot =
    document.getElementById(
      "previewRoot"
    );

  if (
    previewRoot
  ) {
    previewRoot.classList.remove(
      "preview-device-desktop",
      "preview-device-tablet",
      "preview-device-mobile"
    );

    previewRoot.classList.add(
      `preview-device-${device}`
    );
  }

  const fullscreenRoot =
    document.getElementById(
      "fullscreenPreviewRoot"
    );

  if (
    fullscreenRoot
  ) {
    fullscreenRoot.classList.remove(
      "preview-device-desktop",
      "preview-device-tablet",
      "preview-device-mobile"
    );

    fullscreenRoot.classList.add(
      `preview-device-${device}`
    );
  }

  config.previewDevice =
    device;

  updateActiveDeviceButton(
    device
  );

  saveConfig();
}


/* =========================================================
   ACTIVE DEVICE BUTTON
========================================================= */

function updateActiveDeviceButton(
  device
) {
  document
    .querySelectorAll(
      "[data-preview-device]"
    )
    .forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.previewDevice ===
          device
      );
    });
}


/* =========================================================
   FULLSCREEN PREVIEW
========================================================= */

function initializeFullscreenPreview() {
  const openButton =
    document.querySelector(
      "[data-action='fullscreen-preview']"
    );

  const fullscreenContainer =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  const closeButton =
    document.querySelector(
      "[data-action='close-fullscreen-preview']"
    );

  if (
    openButton &&
    fullscreenContainer
  ) {
    openButton.addEventListener(
      "click",
      () => {
        openFullscreenPreview();
      }
    );
  }

  if (
    closeButton &&
    fullscreenContainer
  ) {
    closeButton.addEventListener(
      "click",
      () => {
        closeFullscreenPreview();
      }
    );
  }

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


/* =========================================================
   OPEN FULLSCREEN
========================================================= */

function openFullscreenPreview() {
  const container =
    document.querySelector(
      ".auth-fullscreen-preview"
    );

  if (!container) {
    return;
  }

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
    config.previewDevice ||
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

  if (!container) {
    return;
  }

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
          const path =
            button.dataset.resetPath;

          resetConfigPath(
            path
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
  if (
    !window.defaultConfig
  ) {
    return;
  }

  const confirmation =
    window.confirm(
      "Reset all customization settings?"
    );

  if (!confirmation) {
    return;
  }

  window.config =
    deepClone(
      window.defaultConfig
    );

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
  const keys =
    path.split(".");

  let value =
    object;

  for (
    const key of keys
  ) {
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
    config.currentPage
  );

  updateActiveDeviceButton(
    config.previewDevice ||
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

          if (!accordion) {
            return;
          }

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
      "[data-config-path]"
    )
    .forEach((control) => {
      const path =
        control.dataset.configPath;

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

      if (!section) {
        return;
      }

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

    window.config =
      mergeConfig(
        deepClone(
          window.defaultConfig
        ),
        savedConfig
      );

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
            "object"
        ) {
          target[key] = {};
        }

        mergeConfig(
          target[key],
          source[key]
        );
      } else {
        target[key] =
          source[key];
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

  if (
    window.defaultConfig
  ) {
    window.config =
      deepClone(
        window.defaultConfig
      );

    syncControlsFromConfig();

    refreshPreview();
  }
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
    config.previewDevice ||
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

  getActiveConfig() {
    return window.config;
  }

};