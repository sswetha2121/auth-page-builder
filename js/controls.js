/* =========================================================
   AUTH PAGE BUILDER
   File: js/controls.js

   Customization Controls Engine

   Every control can update the central configuration object
   and notify the application to refresh the preview.
========================================================= */


class ControlsManager {
  constructor(options = {}) {
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container;

    this.config = options.config || {};

    this.onChange =
      typeof options.onChange === "function"
        ? options.onChange
        : () => {};

    this.onUpload =
      typeof options.onUpload === "function"
        ? options.onUpload
        : null;

    this.defaultConfig =
      this.clone(this.config);

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
      const handler = () => {
        const path =
          control.dataset.configText;

        this.updateValue(
          path,
          control.value
        );
      };

      control.addEventListener(
        "input",
        handler
      );

      control.addEventListener(
        "change",
        handler
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
      control.addEventListener(
        "input",
        () => {
          const path =
            control.dataset.configNumber;

          const value =
            Number(control.value);

          this.updateValue(
            path,
            Number.isNaN(value)
              ? 0
              : value
          );
        }
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
      control.addEventListener(
        "input",
        () => {
          const path =
            control.dataset.configRange;

          const value =
            Number(control.value);

          this.updateValue(
            path,
            value
          );

          this.updateRangeDisplay(
            control,
            value
          );
        }
      );
    });
  }


  /* =======================================================
     RANGE VALUE DISPLAY
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

    const output =
      this.container.querySelector(
        targetSelector
      );

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
      control.addEventListener(
        "input",
        () => {
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
        }
      );

      control.addEventListener(
        "change",
        () => {
          const path =
            control.dataset.configColor;

          this.updateValue(
            path,
            control.value
          );
        }
      );
    });
  }


  /* =======================================================
     COLOR INPUT SYNCHRONIZATION
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
          const path =
            control.dataset.configSelect;

          this.updateValue(
            path,
            control.value
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
          const path =
            control.dataset.configToggle;

          this.updateValue(
            path,
            control.checked
          );

          this.updateToggleUI(
            control
          );
        }
      );

      this.updateToggleUI(control);
    });
  }


  /* =======================================================
     TOGGLE UI
  ======================================================= */

  updateToggleUI(control) {
    const parent =
      control.closest(
        ".sidebar-toggle-row"
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

          const path =
            control.dataset.configRadio;

          this.updateValue(
            path,
            control.value
          );
        }
      );
    });
  }


  /* =======================================================
     OPTION CARDS
  ======================================================= */

  attachOptionCards() {
    const controls =
      this.container.querySelectorAll(
        "[data-config-option]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
          const path =
            control.dataset.configOption;

          const value =
            control.dataset.value;

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

          const typePath =
            control.dataset.imageType;

          this.updateValue(
            path,
            value
          );

          if (typePath) {
            this.updateValue(
              typePath,
              "image",
              false
            );
          }

          this.updateImageSelectionUI(
            path,
            control
          );
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
      this.attachDragAndDrop(zone);
    });
  }


  /* =======================================================
     HANDLE FILE UPLOAD
  ======================================================= */

  async handleFileUpload(
    control,
    file
  ) {
    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please upload a valid image file."
      );

      return;
    }

    const path =
      control.dataset.configUpload;

    const typePath =
      control.dataset.uploadType;

    try {
      const dataURL =
        await this.readFileAsDataURL(file);

      this.updateValue(
        path,
        dataURL,
        false
      );

      if (typePath) {
        this.updateValue(
          typePath,
          "image",
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
        value: dataURL
      });

      if (this.onUpload) {
        this.onUpload({
          file,
          path,
          value: dataURL
        });
      }
    } catch (error) {
      console.error(
        "Image upload failed:",
        error
      );
    }
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

        reader.readAsDataURL(file);
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

    const preview =
      this.container.querySelector(
        previewSelector
      );

    if (!preview) {
      return;
    }

    if (
      preview.tagName === "IMG"
    ) {
      preview.src = imageSource;

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
    zone.addEventListener(
      "dragover",
      (event) => {
        event.preventDefault();

        zone.classList.add(
          "drag-over"
        );
      }
    );


    zone.addEventListener(
      "dragleave",
      () => {
        zone.classList.remove(
          "drag-over"
        );
      }
    );


    zone.addEventListener(
      "drop",
      async (event) => {
        event.preventDefault();

        zone.classList.remove(
          "drag-over"
        );

        const file =
          event.dataTransfer.files?.[0];

        if (!file) {
          return;
        }

        const inputSelector =
          zone.dataset.uploadZone;

        const input =
          this.container.querySelector(
            inputSelector
          );

        if (!input) {
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
          const path =
            control.dataset.resetConfig;

          this.resetValue(path);
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

    this.syncControlValue(
      path,
      defaultValue
    );

    this.emitChange({
      type: "reset",
      path,
      value: defaultValue
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

    this.syncAllControls();

    this.emitChange({
      type: "reset-all",
      config: this.getConfig()
    });
  }


  /* =======================================================
     COLLAPSIBLE SECTIONS
  ======================================================= */

  attachSectionControls() {
    const controls =
      this.container.querySelectorAll(
        "[data-sidebar-section]"
      );

    controls.forEach((control) => {
      control.addEventListener(
        "click",
        () => {
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
     UPDATE CONFIG VALUE
  ======================================================= */

  updateValue(
    path,
    value,
    notify = true
  ) {
    if (!path) {
      return;
    }

    this.setValue(
      this.config,
      path,
      value
    );

    if (notify) {
      this.emitChange({
        type: "update",
        path,
        value
      });
    }
  }


  /* =======================================================
     GET NESTED VALUE
  ======================================================= */

  getValue(
    object,
    path
  ) {
    if (!path) {
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
    const keys =
      path.split(".");

    const lastKey =
      keys.pop();

    let current =
      object;

    keys.forEach((key) => {
      if (
        !current[key] ||
        typeof current[key] !== "object"
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

  emitChange(change) {
    this.onChange({
      ...change,
      config: this.getConfig()
    });

    const event =
      new CustomEvent(
        "auth-builder:config-change",
        {
          detail: {
            ...change,
            config: this.getConfig()
          }
        }
      );

    document.dispatchEvent(event);
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

  setConfig(newConfig = {}) {
    this.config =
      this.mergeDeep(
        this.config,
        newConfig
      );

    this.syncAllControls();

    this.emitChange({
      type: "set-config",
      config: this.getConfig()
    });
  }


  /* =======================================================
     SYNC ALL CONTROLS
  ======================================================= */

  syncAllControls() {
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
        control.type === "checkbox"
      ) {
        control.checked =
          Boolean(value);

        this.updateToggleUI(
          control
        );
      } else if (
        control.type === "radio"
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


    const optionControls =
      this.container.querySelectorAll(
        "[data-config-option]"
      );

    optionControls.forEach((control) => {
      const path =
        control.dataset.configOption;

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
    });
  }


  /* =======================================================
     GET CONTROL CONFIG PATH
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
          typeof sourceValue === "object" &&
          !Array.isArray(sourceValue)
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

    this.container
      .replaceWith(
        this.container.cloneNode(true)
      );

    this.container = null;
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.ControlsManager =
  ControlsManager;