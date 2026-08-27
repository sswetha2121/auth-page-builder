/* =========================================================
   AUTH PAGE BUILDER - CENTRAL STATE MANAGEMENT
   File: js/state.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const { defaultConfig } = require("./config.js");
    module.exports = factory(defaultConfig);
  } else {
    const def = root.defaultConfig || {};
    const stateInstance = factory(def);
    root.state = stateInstance;
    root.AuthState = stateInstance;
    root.config = stateInstance.state;
  }
})(typeof window !== "undefined" ? window : globalThis, function (initialDefaultConfig) {

  function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const copy = {};
    for (const key of Object.keys(obj)) {
      copy[key] = deepClone(obj[key]);
    }
    return copy;
  }

  function getByPath(obj, path, fallback = undefined) {
    if (!obj || !path) return fallback;
    const parts = Array.isArray(path) ? path : String(path).split(".");
    let curr = obj;
    for (const part of parts) {
      if (curr === undefined || curr === null || typeof curr !== "object") {
        return fallback;
      }
      curr = curr[part];
    }
    return curr !== undefined && curr !== null ? curr : fallback;
  }

  function setByPath(obj, path, value) {
    if (!obj || !path) return false;
    const parts = Array.isArray(path) ? path : String(path).split(".");
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!curr[part] || typeof curr[part] !== "object" || Array.isArray(curr[part])) {
        curr[part] = {};
      }
      curr = curr[part];
    }
    curr[parts[parts.length - 1]] = value;
    return true;
  }

  class StateManager {
    constructor(baseConfig) {
      this.defaultConfig = deepClone(baseConfig);
      this.state = deepClone(baseConfig);
      this.listeners = new Set();
      this.uploadedAssets = {
        backgrounds: {},
        logos: {}
      };
    }

    getState() {
      return this.state;
    }

    getConfig() {
      return this.state;
    }

    get(path, fallback) {
      return getByPath(this.state, path, fallback);
    }

    set(path, value, options = { notify: true }) {
      const success = setByPath(this.state, path, value);
      if (success && options.notify !== false) {
        this.notify(path, value);
      }
      return success;
    }

    updateConfig(partialOrPath, value) {
      if (typeof partialOrPath === "string") {
        return this.set(partialOrPath, value);
      }
      if (partialOrPath && typeof partialOrPath === "object") {
        const merge = (target, source) => {
          for (const key of Object.keys(source)) {
            if (
              source[key] &&
              typeof source[key] === "object" &&
              !Array.isArray(source[key])
            ) {
              if (!target[key]) target[key] = {};
              merge(target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
        };
        merge(this.state, partialOrPath);
        this.notify("*", this.state);
        return true;
      }
      return false;
    }

    setActivePage(page) {
      const valid = ["login", "signup", "forgotPassword", "otp"];
      if (!valid.includes(page)) page = "login";
      this.state.activePage = page;
      this.notify("activePage", page);
      return page;
    }

    setPreviewMode(mode) {
      const valid = ["desktop", "tablet", "mobile"];
      if (!valid.includes(mode)) mode = "desktop";
      this.state.previewMode = mode;
      this.notify("previewMode", mode);
      return mode;
    }

    setFullscreen(isOpen) {
      this.state.fullscreenOpen = Boolean(isOpen);
      this.notify("fullscreenOpen", this.state.fullscreenOpen);
    }

    reset() {
      this.state = deepClone(this.defaultConfig);
      this.notify("reset", this.state);
      return this.state;
    }

    subscribe(callback) {
      if (typeof callback === "function") {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
      }
      return () => {};
    }

    notify(changedPath, changedValue) {
      for (const listener of this.listeners) {
        try {
          listener(this.state, changedPath, changedValue);
        } catch (err) {
          console.error("State listener error:", err);
        }
      }

      if (typeof document !== "undefined" && document.dispatchEvent) {
        document.dispatchEvent(
          new CustomEvent("auth-builder:state-changed", {
            detail: { state: this.state, path: changedPath, value: changedValue }
          })
        );
      }
    }

    setUploadedAsset(type, name, dataUrl) {
      if (!this.uploadedAssets[type]) {
        this.uploadedAssets[type] = {};
      }
      this.uploadedAssets[type][name] = dataUrl;
    }

    getUploadedAsset(type, name) {
      return this.uploadedAssets[type]?.[name] || null;
    }

    exportJSON() {
      return JSON.stringify(this.state, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        this.updateConfig(parsed);
        return true;
      } catch (e) {
        console.error("Failed to import state:", e);
        return false;
      }
    }
  }

  return new StateManager(initialDefaultConfig);
});