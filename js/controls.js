/* =========================================================
   AUTH PAGE BUILDER
   File: js/controls.js

   Professional Customization Controls Engine

   Responsibilities:
   - Update the central configuration
   - Synchronize all customization controls
   - Handle layout, typography, colors and appearance
   - Handle default background/logo selection
   - Handle uploaded background/logo assets
   - Preserve uploaded asset metadata for ZIP generation
   - Notify renderer and application immediately
   - Support dynamic controls added later
========================================================= */

class ControlsManager {
  constructor(options = {}) {
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container;

    this.config =
      options.config ||
      window.config ||
      {};

    this.defaultConfig =
      this.clone(
        options.defaultConfig ||
        window.defaultConfig ||
        this.config
      );

    this.onChange =
      typeof options.onChange === "function"
        ? options.onChange
        : () => {};

    this.onUpload =
      typeof options.onUpload === "function"
        ? options.onUpload
        : null;

    this.uploadedAssets =
      this.loadUploadedAssets();

    this.bound = false;

    this.initialize();
  }


  /* =======================================================
     INITIALIZE
  ======================================================= */

  initialize() {
    if (!this.container) {
      console.error(
        "ControlsManager: Container not found."
      );

      return;
    }

    this.attachAllControls();

    this.syncAllControls();

    this.bound = true;
  }


  /* =======================================================
     ATTACH ALL CONTROLS
  ======================================================= */

  attachAllControls() {
    this.attachTextControls();

    this.attachNumberControls();

    this.attachRangeControls();

    this.attachColorControls();

    this.attachSelectControls();

    this.attachToggleControls();

    this.attachRadioControls();

    this.attachOptionCards();

    this.attachImageControls();

    this.attachFileUploads();

    this.attachResetControls();

    this.attachSectionControls();

    this.attachSpecialControls();
  }


  /* =======================================================
     TEXT CONTROLS
  ======================================================= */

  attachTextControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-text]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "input",
        () => {
          this.updateValue(
            control.dataset.configText,
            control.value
          );
        }
      );

      control.addEventListener(
        "change",
        () => {
          this.updateValue(
            control.dataset.configText,
            control.value
          );
        }
      );
    });
  }


  /* =======================================================
     NUMBER CONTROLS
  ======================================================= */

  attachNumberControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-number]"
      );

    controls.forEach((control) => {
      const update = () => {
        const value =
          Number(control.value);

        this.updateValue(
          control.dataset.configNumber,
          Number.isNaN(value)
            ? 0
            : value
        );
      };

      control.addEventListener(
        "input",
        update
      );

      control.addEventListener(
        "change",
        update
      );
    });
  }


  /* =======================================================
     RANGE CONTROLS
  ======================================================= */

  attachRangeControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-range]"
      );

    controls.forEach((control) => {
      const update = () => {
        const value =
          Number(control.value);

        this.updateValue(
          control.dataset.configRange,
          Number.isNaN(value)
            ? 0
            : value
        );

        this.updateRangeDisplay(
          control,
          value
        );
      };

      control.addEventListener(
        "input",
        update
      );

      control.addEventListener(
        "change",
        update
      );
    });
  }


  /* =======================================================
     RANGE DISPLAY
  ======================================================= */

  updateRangeDisplay(
    control,
    value
  ) {
    const targetSelector =
      control.dataset.rangeOutput;

    if (!targetSelector) {
      return;
    }

    let output =
      this.container.querySelector(
        targetSelector
      );

    if (!output) {
      output =
        document.querySelector(
          targetSelector
        );
    }

    if (!output) {
      return;
    }

    const suffix =
      control.dataset.rangeSuffix || "";

    output.textContent =
      `${value}${suffix}`;
  }


  /* =======================================================
     COLOR CONTROLS
  ======================================================= */

  attachColorControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-color]"
      );

    controls.forEach((control) => {
      const update = () => {
        const path =
          control.dataset.configColor;

        this.updateValue(
          path,
          control.value
        );

        this.syncColorInputs(
          path,
          control.value,
          control
        );
      };

      control.addEventListener(
        "input",
        update
      );

      control.addEventListener(
        "change",
        update
      );
    });
  }


  /* =======================================================
     COLOR SYNCHRONIZATION
  ======================================================= */

  syncColorInputs(
    path,
    value,
    currentControl
  ) {
    const controls =
      this.container.querySelectorAll(
        `[data-config-color="${path}"]`
      );

    controls.forEach((control) => {
      if (control !== currentControl) {
        control.value = value;
      }
    });
  }


  /* =======================================================
     SELECT CONTROLS
  ======================================================= */

  attachSelectControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-select]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "change",
        () => {
          this.updateValue(
            control.dataset.configSelect,
            this.parseValue(
              control.value
            )
          );
        }
      );
    });
  }


  /* =======================================================
     TOGGLE CONTROLS
  ======================================================= */

  attachToggleControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-toggle]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "change",
        () => {
          this.updateValue(
            control.dataset.configToggle,
            control.checked
          );

          this.updateToggleUI(
            control
          );
        }
      );

      this.updateToggleUI(
        control
      );
    });
  }


  /* =======================================================
     TOGGLE UI
  ======================================================= */

  updateToggleUI(control) {
    const parent =
      control.closest(
        ".sidebar-toggle-row, .toggle-row, .control-toggle"
      );

    if (!parent) {
      return;
    }

    parent.classList.toggle(
      "active",
      control.checked
    );
  }


  /* =======================================================
     RADIO CONTROLS
  ======================================================= */

  attachRadioControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-radio]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "change",
        () => {
          if (!control.checked) {
            return;
          }

          this.updateValue(
            control.dataset.configRadio,
            this.parseValue(
              control.value
            )
          );
        }
      );
    });
  }


  /* =======================================================
     OPTION CARDS

     Example:
     data-config-option="layout.type"
     data-value="split-left-image"
  ======================================================= */

  attachOptionCards() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-option]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        (event) => {
          if (
            event.target.closest(
              "input, select, textarea, button"
            )
          ) {
            return;
          }

          const path =
            control.dataset.configOption;

          const value =
            control.dataset.value;

          if (!path) {
            return;
          }

          this.updateValue(
            path,
            this.parseValue(value)
          );

          this.updateOptionCardUI(
            path,
            control
          );
        }
      );
    });
  }


  /* =======================================================
     OPTION CARD ACTIVE STATE
  ======================================================= */

  updateOptionCardUI(
    path,
    activeControl
  ) {
    const controls =
      this.container.querySelectorAll(
        `[data-config-option="${path}"]`
      );

    controls.forEach((control) => {
      control.classList.toggle(
        "active",
        control === activeControl
      );
    });
  }


  /* =======================================================
     IMAGE PRESET CONTROLS

     Supports:
     - Background presets
     - Logo presets
     - Default image selection

     Example:
     data-config-image="background.image"
     data-value="assets/backgrounds/file.jpg"
     data-config-id="background.selected"
     data-id="background-1"
     data-image-type="background.type"
     data-image-source="default"
  ======================================================= */

  attachImageControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-image]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const path =
            control.dataset.configImage;

          const value =
            control.dataset.value;

          const idPath =
            control.dataset.configId;

          const id =
            control.dataset.id;

          const typePath =
            control.dataset.imageType;

          const source =
            control.dataset.imageSource ||
            "default";

          if (!path || !value) {
            return;
          }

          this.updateValue(
            path,
            value,
            false
          );

          if (idPath && id) {
            this.updateValue(
              idPath,
              id,
              false
            );
          }

          if (typePath) {
            this.updateValue(
              typePath,
              source,
              false
            );
          }

          this.updateImageSelectionUI(
            path,
            control
          );

          this.emitChange({
            type: "image-select",
            path,
            value,
            source,
            config: this.getConfig()
          });
        }
      );
    });
  }


  /* =======================================================
     IMAGE ACTIVE STATE
  ======================================================= */

  updateImageSelectionUI(
    path,
    activeControl
  ) {
    const controls =
      this.container.querySelectorAll(
        `[data-config-image="${path}"]`
      );

    controls.forEach((control) => {
      control.classList.toggle(
        "active",
        control === activeControl
      );
    });
  }


  /* =======================================================
     FILE UPLOADS
  ======================================================= */

  attachFileUploads() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-upload]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "change",
        async () => {
          const file =
            control.files?.[0];

          if (!file) {
            return;
          }

          await this.handleFileUpload(
            control,
            file
          );
        }
      );
    });

    const dropZones =
      this.container.querySelectorAll(
        "[data-upload-zone]"
      );

    dropZones.forEach((zone) => {
      this.attachDragAndDrop(
        zone
      );
    });
  }


  /* =======================================================
     VALIDATE UPLOAD
  ======================================================= */

  validateImageFile(file) {
    if (!file) {
      return {
        valid: false,
        message: "No file selected."
      };
    }

    const limits =
      window.AuthPageBuilder?.Constants?.UPLOAD_LIMITS;

    const supportedTypes =
      limits?.supportedImageTypes || [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml"
      ];

    const maxSize =
      limits?.maxImageSize ||
      10 * 1024 * 1024;

    if (
      !file.type ||
      !supportedTypes.includes(
        file.type
      )
    ) {
      return {
        valid: false,
        message:
          "Please upload a JPG, PNG, WEBP, GIF, or SVG image."
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message:
          `Image is too large. Maximum size is ${
            limits?.maxImageSizeLabel || "10 MB"
          }.`
      };
    }

    return {
      valid: true
    };
  }


  /* =======================================================
     HANDLE FILE UPLOAD

     Uploaded files are stored as:
     - Data URL for immediate preview
     - Metadata for project ZIP generation
     - Original file object in memory when available
  ======================================================= */

  async handleFileUpload(
    control,
    file
  ) {
    const validation =
      this.validateImageFile(
        file
      );

    if (!validation.valid) {
      alert(
        validation.message
      );

      control.value = "";

      return;
    }

    const path =
      control.dataset.configUpload;

    const typePath =
      control.dataset.uploadType;

    const fileNamePath =
      control.dataset.uploadFileName;

    const assetRole =
      control.dataset.assetRole ||
      this.detectAssetRole(path);

    try {
      const dataURL =
        await this.readFileAsDataURL(
          file
        );

      const assetId =
        this.createAssetId(
          assetRole,
          file
        );

      const asset = {
        id: assetId,
        role: assetRole,
        path,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified:
          file.lastModified,
        dataURL,
        file
      };

      this.uploadedAssets =
        this.uploadedAssets.filter(
          (item) =>
            item.path !== path
        );

      this.uploadedAssets.push(
        asset
      );

      this.saveUploadedAssets();

      this.updateValue(
        path,
        dataURL,
        false
      );

      if (typePath) {
        this.updateValue(
          typePath,
          "upload",
          false
        );
      }

      if (fileNamePath) {
        this.updateValue(
          fileNamePath,
          file.name,
          false
        );
      }

      this.updateUploadPreview(
        control,
        dataURL
      );

      this.emitChange({
        type: "upload",
        path,
        file,
        value: dataURL,
        asset,
        config: this.getConfig()
      });

      if (this.onUpload) {
        this.onUpload({
          file,
          path,
          value: dataURL,
          asset
        });
      }

    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );

      alert(
        "Unable to upload this image."
      );
    }
  }


  /* =======================================================
     DETECT ASSET ROLE
  ======================================================= */

  detectAssetRole(path = "") {
    const normalized =
      String(path).toLowerCase();

    if (
      normalized.includes("logo")
    ) {
      return "logo";
    }

    if (
      normalized.includes("background")
    ) {
      return "background";
    }

    if (
      normalized.includes("icon")
    ) {
      return "icon";
    }

    return "image";
  }


  /* =======================================================
     CREATE ASSET ID
  ======================================================= */

  createAssetId(
    role,
    file
  ) {
    return [
      role,
      Date.now(),
      Math.random()
        .toString(36)
        .slice(2, 9),
      file.name
        .replace(
          /[^a-zA-Z0-9_-]/g,
          "-"
        )
    ].join("-");
  }


  /* =======================================================
     READ FILE AS DATA URL
  ======================================================= */

  readFileAsDataURL(file) {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(reader.result);

        reader.onerror = () =>
          reject(
            new Error(
              "Unable to read file."
            )
          );

        reader.readAsDataURL(
          file
        );
      }
    );
  }


  /* =======================================================
     UPLOAD PREVIEW
  ======================================================= */

  updateUploadPreview(
    control,
    imageSource
  ) {
    const previewSelector =
      control.dataset.uploadPreview;

    if (!previewSelector) {
      return;
    }

    let preview =
      this.container.querySelector(
        previewSelector
      );

    if (!preview) {
      preview =
        document.querySelector(
          previewSelector
        );
    }

    if (!preview) {
      return;
    }

    if (
      preview.tagName === "IMG"
    ) {
      preview.src =
        imageSource;

      preview.classList.add(
        "has-image"
      );

      return;
    }

    preview.style.backgroundImage =
      `url("${imageSource}")`;

    preview.classList.add(
      "has-image"
    );
  }


  /* =======================================================
     DRAG AND DROP
  ======================================================= */

  attachDragAndDrop(zone) {
    ["dragenter", "dragover"].forEach(
      (eventName) => {
        zone.addEventListener(
          eventName,
          (event) => {
            event.preventDefault();

            zone.classList.add(
              "drag-over"
            );
          }
        );
      }
    );

    ["dragleave", "drop"].forEach(
      (eventName) => {
        zone.addEventListener(
          eventName,
          () => {
            zone.classList.remove(
              "drag-over"
            );
          }
        );
      }
    );

    zone.addEventListener(
      "drop",
      async (event) => {
        event.preventDefault();

        const file =
          event.dataTransfer
            .files?.[0];

        if (!file) {
          return;
        }

        const inputSelector =
          zone.dataset.uploadZone;

        let input =
          this.container.querySelector(
            inputSelector
          );

        if (!input) {
          input =
            document.querySelector(
              inputSelector
            );
        }

        if (!input) {
          console.warn(
            "Upload input not found:",
            inputSelector
          );

          return;
        }

        await this.handleFileUpload(
          input,
          file
        );
      }
    );

    zone.addEventListener(
      "click",
      () => {
        const inputSelector =
          zone.dataset.uploadZone;

        const input =
          this.container.querySelector(
            inputSelector
          ) ||
          document.querySelector(
            inputSelector
          );

        input?.click();
      }
    );
  }


  /* =======================================================
     RESET CONTROLS
  ======================================================= */

  attachResetControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-reset-config]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          this.resetValue(
            control.dataset.resetConfig
          );
        }
      );
    });

    const fullReset =
      this.container.querySelectorAll(
        "[data-reset-all]"
      );

    fullReset.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          this.resetAll();
        }
      );
    });
  }


  /* =======================================================
     RESET SINGLE VALUE
  ======================================================= */

  resetValue(path) {
    const defaultValue =
      this.getValue(
        this.defaultConfig,
        path
      );

    if (
      defaultValue === undefined
    ) {
      return;
    }

    this.setValue(
      this.config,
      path,
      this.clone(defaultValue)
    );

    this.updateGlobalConfig(
      this.config
    );

    this.syncAllControls();

    this.emitChange({
      type: "reset",
      path,
      value:
        this.clone(defaultValue)
    });
  }


  /* =======================================================
     RESET ALL
  ======================================================= */

  resetAll() {
    const shouldReset =
      window.confirm(
        "Reset all customizations to default?"
      );

    if (!shouldReset) {
      return;
    }

    this.config =
      this.clone(
        this.defaultConfig
      );

    this.uploadedAssets = [];

    this.clearUploadedAssets();

    this.updateGlobalConfig(
      this.config
    );

    this.syncAllControls();

    this.emitChange({
      type: "reset-all",
      config:
        this.getConfig()
    });
  }


  /* =======================================================
     COLLAPSIBLE SIDEBAR SECTIONS
  ======================================================= */

  attachSectionControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-sidebar-section]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        (event) => {
          if (
            event.target.closest(
              "input, select, textarea, button"
            )
          ) {
            return;
          }

          const section =
            control.closest(
              ".sidebar-section"
            );

          if (!section) {
            return;
          }

          const isOpen =
            section.classList.toggle(
              "open"
            );

          control.setAttribute(
            "aria-expanded",
            String(isOpen)
          );
        }
      );
    });
  }


  /* =======================================================
     SPECIAL CONTROLS

     Handles:
     - OTP length cards
     - OTP delivery methods
     - Page type controls
     - Preview device controls
     - Fullscreen trigger
  ======================================================= */

  attachSpecialControls() {

    /* OTP LENGTH */

    const otpLengths =
      this.container.querySelectorAll(
        "[data-otp-length]"
      );

    otpLengths.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const value =
            Number(
              control.dataset.otpLength
            );

          this.updateValue(
            "authentication.otpLength",
            value
          );

          otpLengths.forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item === control
              );
            }
          );
        }
      );
    });


    /* OTP DELIVERY METHOD */

    const otpMethods =
      this.container.querySelectorAll(
        "[data-otp-method]"
      );

    otpMethods.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const value =
            control.dataset.otpMethod;

          this.updateValue(
            "authentication.defaultOtpMethod",
            value
          );

          otpMethods.forEach(
            (item) => {
              item.classList.toggle(
                "active",
                item === control
              );
            }
          );
        }
      );
    });


    /* PAGE TYPE */

    const pageControls =
      this.container.querySelectorAll(
        "[data-page-type]"
      );

    pageControls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const page =
            control.dataset.pageType;

          this.updateValue(
            "currentPage",
            page
          );
        }
      );
    });


    /* PREVIEW DEVICE */

    const deviceControls =
      this.container.querySelectorAll(
        "[data-preview-device]"
      );

    deviceControls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const device =
            control.dataset.previewDevice;

          this.updateValue(
            "previewDevice",
            device
          );
        }
      );
    });


    /* FULLSCREEN */

    const fullscreenControls =
      this.container.querySelectorAll(
        "[data-preview-fullscreen]"
      );

    fullscreenControls.forEach(
      (control) => {
        control.addEventListener(
          "click",
          () => {
            this.updateValue(
              "fullscreen",
              true
            );
          }
        );
      }
    );
  }


  /* =======================================================
     UPDATE CONFIG VALUE
  ======================================================= */

  updateValue(
    path,
    value,
    notify = true
  ) {
    if (
      !path ||
      typeof path !== "string"
    ) {
      return false;
    }

    this.setValue(
      this.config,
      path,
      value
    );

    this.updateGlobalConfig(
      this.config
    );

    if (notify) {
      this.emitChange({
        type: "update",
        path,
        value
      });
    }

    return true;
  }


  /* =======================================================
     UPDATE GLOBAL CONFIG
  ======================================================= */

  updateGlobalConfig(
    newConfig
  ) {
    if (
      typeof window.setConfig ===
      "function"
    ) {
      window.setConfig(
        newConfig
      );
    } else {
      window.config =
        newConfig;
    }

    this.config =
      window.config ||
      newConfig;
  }


  /* =======================================================
     GET NESTED VALUE
  ======================================================= */

  getValue(
    object,
    path
  ) {
    if (
      !object ||
      !path
    ) {
      return undefined;
    }

    return path
      .split(".")
      .reduce(
        (current, key) =>
          current?.[key],
        object
      );
  }


  /* =======================================================
     SET NESTED VALUE
  ======================================================= */

  setValue(
    object,
    path,
    value
  ) {
    if (
      !object ||
      !path
    ) {
      return;
    }

    const keys =
      path.split(".");

    const lastKey =
      keys.pop();

    let current =
      object;

    keys.forEach((key) => {
      if (
        !current[key] ||
        typeof current[key] !==
          "object" ||
        Array.isArray(
          current[key]
        )
      ) {
        current[key] = {};
      }

      current =
        current[key];
    });

    current[lastKey] =
      value;
  }


  /* =======================================================
     EMIT CONFIG CHANGE
  ======================================================= */

  emitChange(change = {}) {
    const currentConfig =
      this.getConfig();

    this.onChange({
      ...change,
      config:
        currentConfig
    });

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:config-change",
        {
          detail: {
            ...change,
            config:
              currentConfig
          }
        }
      )
    );

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:preview-refresh",
        {
          detail: {
            ...change,
            config:
              currentConfig
          }
        }
      )
    );

    this.dispatchApplicationEvent(
      change
    );
  }


  /* =======================================================
     DISPATCH APPLICATION EVENT
  ======================================================= */

  dispatchApplicationEvent(
    change
  ) {
    const events =
      window.AuthPageBuilder
        ?.Constants
        ?.EVENTS;

    if (!events) {
      return;
    }

    if (
      change.path === "currentPage"
    ) {
      document.dispatchEvent(
        new CustomEvent(
          events.PAGE_CHANGED,
          {
            detail: change
          }
        )
      );
    }

    if (
      change.path === "previewDevice"
    ) {
      document.dispatchEvent(
        new CustomEvent(
          events.DEVICE_CHANGED,
          {
            detail: change
          }
        )
      );
    }

    if (
      change.path === "fullscreen"
    ) {
      document.dispatchEvent(
        new CustomEvent(
          change.value
            ? events.FULLSCREEN_OPEN
            : events.FULLSCREEN_CLOSE,
          {
            detail: change
          }
        )
      );
    }

    document.dispatchEvent(
      new CustomEvent(
        events.CONFIG_CHANGED,
        {
          detail: change
        }
      )
    );
  }


  /* =======================================================
     GET CONFIG
  ======================================================= */

  getConfig() {
    return this.clone(
      this.config
    );
  }


  /* =======================================================
     SET CONFIG
  ======================================================= */

  setConfig(
    newConfig = {},
    notify = true
  ) {
    this.config =
      this.mergeDeep(
        this.config,
        newConfig
      );

    this.updateGlobalConfig(
      this.config
    );

    this.syncAllControls();

    if (notify) {
      this.emitChange({
        type: "set-config",
        config:
          this.getConfig()
      });
    }
  }


  /* =======================================================
     SYNC ALL CONTROLS
  ======================================================= */

  syncAllControls() {
    if (!this.container) {
      return;
    }

    const controls =
      this.container.querySelectorAll(
        [
          "[data-config-text]",
          "[data-config-number]",
          "[data-config-range]",
          "[data-config-color]",
          "[data-config-select]",
          "[data-config-toggle]",
          "[data-config-radio]"
        ].join(",")
      );

    controls.forEach((control) => {
      const path =
        this.getControlPath(
          control
        );

      if (!path) {
        return;
      }

      const value =
        this.getValue(
          this.config,
          path
        );

      if (
        value === undefined
      ) {
        return;
      }

      if (
        control.type ===
        "checkbox"
      ) {
        control.checked =
          Boolean(value);

        this.updateToggleUI(
          control
        );

      } else if (
        control.type ===
        "radio"
      ) {
        control.checked =
          String(value) ===
          String(control.value);

      } else {
        control.value =
          value;

        if (
          control.dataset.rangeOutput
        ) {
          this.updateRangeDisplay(
            control,
            value
          );
        }
      }
    });


    /* OPTION CARDS */

    const optionControls =
      this.container.querySelectorAll(
        "[data-config-option]"
      );

    optionControls.forEach(
      (control) => {
        const path =
          control.dataset
            .configOption;

        const currentValue =
          this.getValue(
            this.config,
            path
          );

        const optionValue =
          this.parseValue(
            control.dataset.value
          );

        control.classList.toggle(
          "active",
          String(currentValue) ===
            String(optionValue)
        );
      }
    );


    /* IMAGE PRESETS */

    const imageControls =
      this.container.querySelectorAll(
        "[data-config-image]"
      );

    imageControls.forEach(
      (control) => {
        const path =
          control.dataset
            .configImage;

        const currentValue =
          this.getValue(
            this.config,
            path
          );

        control.classList.toggle(
          "active",
          String(currentValue) ===
            String(
              control.dataset.value
            )
        );
      }
    );


    /* OTP LENGTH */

    const otpLength =
      this.getValue(
        this.config,
        "authentication.otpLength"
      );

    this.container
      .querySelectorAll(
        "[data-otp-length]"
      )
      .forEach((control) => {
        control.classList.toggle(
          "active",
          Number(
            control.dataset
              .otpLength
          ) ===
          Number(otpLength)
        );
      });


    /* OTP METHOD */

    const otpMethod =
      this.getValue(
        this.config,
        "authentication.defaultOtpMethod"
      );

    this.container
      .querySelectorAll(
        "[data-otp-method]"
      )
      .forEach((control) => {
        control.classList.toggle(
          "active",
          control.dataset
            .otpMethod ===
          otpMethod
        );
      });
  }


  /* =======================================================
     GET CONTROL PATH
  ======================================================= */

  getControlPath(control) {
    return (
      control.dataset.configText ||
      control.dataset.configNumber ||
      control.dataset.configRange ||
      control.dataset.configColor ||
      control.dataset.configSelect ||
      control.dataset.configToggle ||
      control.dataset.configRadio ||
      null
    );
  }


  /* =======================================================
     PARSE VALUE
  ======================================================= */

  parseValue(value) {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    if (
      value !== "" &&
      value !== null &&
      value !== undefined &&
      !Number.isNaN(
        Number(value)
      )
    ) {
      return Number(value);
    }

    return value;
  }


  /* =======================================================
     DEEP MERGE
  ======================================================= */

  mergeDeep(
    target = {},
    source = {}
  ) {
    const output =
      this.clone(target);

    Object.keys(source).forEach(
      (key) => {
        const sourceValue =
          source[key];

        if (
          sourceValue &&
          typeof sourceValue ===
            "object" &&
          !Array.isArray(
            sourceValue
          )
        ) {
          output[key] =
            this.mergeDeep(
              output[key] || {},
              sourceValue
            );

        } else {
          output[key] =
            this.clone(
              sourceValue
            );
        }
      }
    );

    return output;
  }


  /* =======================================================
     UPLOADED ASSET STORAGE
  ======================================================= */

  getStorageKey() {
    return (
      window.AuthPageBuilder
        ?.Constants
        ?.STORAGE_KEYS
        ?.uploadedAssets ||
      "authPageBuilderUploadedAssets"
    );
  }


  loadUploadedAssets() {
    try {
      const raw =
        localStorage.getItem(
          this.getStorageKey()
        );

      if (!raw) {
        return [];
      }

      const assets =
        JSON.parse(raw);

      return Array.isArray(assets)
        ? assets.map((asset) => ({
            ...asset,
            file: null
          }))
        : [];

    } catch (error) {
      console.warn(
        "Unable to load uploaded assets:",
        error
      );

      return [];
    }
  }


  saveUploadedAssets() {
    try {
      const serializableAssets =
        this.uploadedAssets.map(
          (asset) => ({
            id: asset.id,
            role: asset.role,
            path: asset.path,
            name: asset.name,
            type: asset.type,
            size: asset.size,
            lastModified:
              asset.lastModified,
            dataURL:
              asset.dataURL
          })
        );

      localStorage.setItem(
        this.getStorageKey(),
        JSON.stringify(
          serializableAssets
        )
      );

    } catch (error) {
      console.warn(
        "Unable to save uploaded assets:",
        error
      );
    }
  }


  clearUploadedAssets() {
    try {
      localStorage.removeItem(
        this.getStorageKey()
      );

    } catch (error) {
      console.warn(
        "Unable to clear uploaded assets:",
        error
      );
    }
  }


  /* =======================================================
     GET UPLOADED ASSETS

     Used by download.js / ZIP generator.
  ======================================================= */

  getUploadedAssets() {
    return this.uploadedAssets.map(
      (asset) => ({
        ...asset
      })
    );
  }


  /* =======================================================
     REMOVE UPLOADED ASSET
  ======================================================= */

  removeUploadedAsset(
    path
  ) {
    this.uploadedAssets =
      this.uploadedAssets.filter(
        (asset) =>
          asset.path !== path
      );

    this.saveUploadedAssets();

    return true;
  }


  /* =======================================================
     CLONE
  ======================================================= */

  clone(value) {
    if (
      value === undefined
    ) {
      return undefined;
    }

    return JSON.parse(
      JSON.stringify(value)
    );
  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {
    if (!this.container) {
      return;
    }

    this.container = null;

    this.bound = false;
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.ControlsManager =
  ControlsManager;