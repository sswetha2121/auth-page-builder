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

  const STORAGE_KEY = "auth_page_builder_state_v2";
  const ASSETS_STORAGE_KEY = "auth_page_builder_assets_v2";

  function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const copy = {};
    for (const key of Object.keys(obj)) {
      copy[key] = deepClone(obj[key]);
    }
    return copy;
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;
    for (const key of Object.keys(source)) {
      if (source[key] !== undefined && source[key] !== null) {
        if (
          typeof source[key] === "object" &&
          !Array.isArray(source[key]) &&
          typeof target[key] === "object" &&
          !Array.isArray(target[key])
        ) {
          deepMerge(target[key], source[key]);
        } else {
          target[key] = deepClone(source[key]);
        }
      }
    }
    return target;
  }

  function validateAndNormalize(state, defaults) {
    if (!state || typeof state !== "object") return deepClone(defaults);
    const normalized = deepClone(defaults);
    deepMerge(normalized, state);

    // Normalizations for background
    if (!normalized.background) normalized.background = deepClone(defaults.background);
    const bgType = normalized.background.type || "default";

    if (bgType === "default" || bgType === "image") {
      normalized.background.type = "default";
      const sel = normalized.background.selected || normalized.background.image || "assets/backgrounds/background-1.svg";
      normalized.background.selected = sel;
      normalized.background.image = sel;
      normalized.background.uploadedImage = "";
    } else if (bgType === "uploaded" || bgType === "upload" || bgType === "custom") {
      normalized.background.type = "uploaded";
      const upImg = normalized.background.uploadedImage || normalized.background.image || "";
      normalized.background.uploadedImage = upImg;
      normalized.background.image = upImg;
      normalized.background.selected = "";
    } else if (bgType === "color") {
      normalized.background.type = "color";
      normalized.background.image = "";
      normalized.background.uploadedImage = "";
      normalized.background.selected = "";
    } else if (bgType === "gradient") {
      normalized.background.type = "gradient";
      normalized.background.gradientEnabled = true;
      normalized.background.image = "";
      normalized.background.uploadedImage = "";
      normalized.background.selected = "";
    } else if (bgType === "none") {
      normalized.background.type = "none";
      normalized.background.image = "";
      normalized.background.uploadedImage = "";
      normalized.background.selected = "";
    }

    // Ensure OTP length is valid (4, 6, 8)
    if (normalized.pages?.otp) {
      const len = Number(normalized.pages.otp.length);
      if (![4, 6, 8].includes(len)) {
        normalized.pages.otp.length = 6;
      }
    }

    // Canonical redirect normalization & legacy migration
    if (!normalized.redirect || typeof normalized.redirect !== "object") {
      normalized.redirect = deepClone(defaults.redirect || {
        enabled: true,
        redirectUrl: "/dashboard",
        redirectType: "url",
        openInNewTab: false,
        showSuccessMessage: true,
        successMessage: "Authentication completed successfully.",
        delay: 0
      });
    }

    const legacyRedirectUrl = state.redirect_url || state.redirectUrl || state.postAuthUrl || state.successRedirect || state.urls?.redirectUrl;
    if (legacyRedirectUrl && (!state.redirect || !state.redirect.redirectUrl)) {
      normalized.redirect.redirectUrl = legacyRedirectUrl;
    }
    if (state.urls?.openInNewTab !== undefined && (!state.redirect || state.redirect.openInNewTab === undefined)) {
      normalized.redirect.openInNewTab = Boolean(state.urls.openInNewTab);
    }

    if (!normalized.urls) normalized.urls = {};
    normalized.urls.redirectUrl = normalized.redirect.redirectUrl;
    normalized.urls.openInNewTab = normalized.redirect.openInNewTab;

    return normalized;
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

      this.loadFromStorage();
      this.initIndexedDB();
    }

    initIndexedDB() {
      if (typeof window === "undefined" || !window.indexedDB) return;
      try {
        const req = window.indexedDB.open("AuthPageBuilderAssetsDB", 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("assets")) {
            db.createObjectStore("assets", { keyPath: "key" });
          }
        };
        req.onsuccess = (e) => {
          this.db = e.target.result;
          this.loadAssetsFromIndexedDB();
        };
      } catch (err) {
        console.warn("IndexedDB init skipped:", err);
      }
    }

    loadAssetsFromIndexedDB() {
      if (!this.db) return;
      try {
        const tx = this.db.transaction("assets", "readonly");
        const store = tx.objectStore("assets");
        const req = store.getAll();
        req.onsuccess = (e) => {
          const records = e.target.result || [];
          for (const rec of records) {
            if (rec.type && rec.name && rec.dataUrl) {
              if (!this.uploadedAssets[rec.type]) this.uploadedAssets[rec.type] = {};
              this.uploadedAssets[rec.type][rec.name] = rec;
            }
          }
        };
      } catch (err) {
        console.warn("IndexedDB load error:", err);
      }
    }

    persistAssetToIndexedDB(type, name, assetRecord) {
      if (!this.db) return;
      try {
        const tx = this.db.transaction("assets", "readwrite");
        const store = tx.objectStore("assets");
        store.put({
          key: `${type}:${name}`,
          type,
          name,
          ...assetRecord
        });
      } catch (err) {
        console.warn("IndexedDB save error:", err);
      }
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
      if (success) {
        if (path === "redirect.redirectUrl") {
          setByPath(this.state, "urls.redirectUrl", value);
        } else if (path === "urls.redirectUrl") {
          setByPath(this.state, "redirect.redirectUrl", value);
        } else if (path === "redirect.openInNewTab") {
          setByPath(this.state, "urls.openInNewTab", value);
        } else if (path === "urls.openInNewTab") {
          setByPath(this.state, "redirect.openInNewTab", value);
        }
        if (options.notify !== false) {
          this.notify(path, value);
        }
      }
      return success;
    }

    updateConfig(partialOrPath, value) {
      if (typeof partialOrPath === "string") {
        return this.set(partialOrPath, value);
      }
      if (partialOrPath && typeof partialOrPath === "object") {
        deepMerge(this.state, partialOrPath);
        this.notify("*", this.state);
        return true;
      }
      return false;
    }

    loadState(savedConfig) {
      if (!savedConfig || typeof savedConfig !== "object") return this.state;
      const normalized = validateAndNormalize(savedConfig, this.defaultConfig);
      this.state = normalized;
      this.saveToStorage();
      this.notify("*", this.state);
      return this.state;
    }

    serializeCurrentConfiguration() {
      return validateAndNormalize(this.state, this.defaultConfig);
    }

    serialize() {
      return this.serializeCurrentConfiguration();
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
      this.uploadedAssets = { backgrounds: {}, logos: {} };
      this.clearStorage();
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
      this.saveToStorage();

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

    /* =======================================================
       UPLOADED ASSET MANAGEMENT WITH RICH METADATA
    ======================================================= */
    setUploadedAsset(type, name, dataUrl, meta = {}) {
      if (!this.uploadedAssets[type]) {
        this.uploadedAssets[type] = {};
      }

      const ext = meta.extension || (name.includes(".") ? name.split(".").pop().toLowerCase() : "png");
      const mime = meta.mimeType || (ext === "svg" ? "image/svg+xml" : ext === "webp" ? "image/webp" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png");

      const record = {
        id: meta.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name,
        originalName: meta.originalName || name,
        mimeType: mime,
        extension: ext,
        dataUrl: dataUrl,
        size: meta.size || (dataUrl ? Math.round((dataUrl.length * 3) / 4) : 0)
      };

      this.uploadedAssets[type][name] = record;
      this.persistAssetToIndexedDB(type, name, record);
      this.saveToStorage();
    }

    getUploadedAsset(type, name) {
      const asset = this.uploadedAssets[type]?.[name];
      if (!asset) return null;
      return typeof asset === "string" ? asset : asset.dataUrl;
    }

    getUploadedAssetMeta(type, name) {
      return this.uploadedAssets[type]?.[name] || null;
    }

    getAllUploadedAssets() {
      return this.uploadedAssets;
    }

    /* =======================================================
       LOCAL STORAGE PERSISTENCE (Safe Deep Merge & Quota Protection)
    ======================================================= */
    saveToStorage() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        // Strip huge base64 strings if over 2MB to prevent quota crashes, IndexedDB retains full asset
        const stateToSave = deepClone(this.state);
        const stateStr = JSON.stringify(stateToSave);
        if (stateStr.length < 2500000) {
          window.localStorage.setItem(STORAGE_KEY, stateStr);
        } else {
          // Temporarily store reference without freezing localStorage
          if (stateToSave.background && stateToSave.background.uploadedImage && stateToSave.background.uploadedImage.length > 500000) {
            stateToSave.background.uploadedImage = "";
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }

        const assetMeta = { backgrounds: {}, logos: {} };
        for (const cat of ["backgrounds", "logos"]) {
          for (const key of Object.keys(this.uploadedAssets[cat] || {})) {
            const item = this.uploadedAssets[cat][key];
            if (item && typeof item === "object") {
              assetMeta[cat][key] = {
                id: item.id,
                name: item.name,
                originalName: item.originalName,
                mimeType: item.mimeType,
                extension: item.extension,
                size: item.size,
                // Only save small dataURLs into localStorage
                dataUrl: (item.dataUrl && item.dataUrl.length < 500000) ? item.dataUrl : ""
              };
            }
          }
        }
        window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assetMeta));
      } catch (e) {
        console.warn("Storage save skipped:", e.message);
      }
    }

    loadFromStorage() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            this.state = validateAndNormalize(parsed, this.defaultConfig);
          }
        }
        const rawAssets = window.localStorage.getItem(ASSETS_STORAGE_KEY);
        if (rawAssets) {
          const parsedAssets = JSON.parse(rawAssets);
          if (parsedAssets && typeof parsedAssets === "object") {
            this.uploadedAssets = parsedAssets;
          }
        }
      } catch (e) {
        console.warn("Storage load error:", e);
      }
    }

    clearStorage() {
      if (typeof window === "undefined" || !window.localStorage) return;
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ASSETS_STORAGE_KEY);
        if (this.db) {
          const tx = this.db.transaction("assets", "readwrite");
          tx.objectStore("assets").clear();
        }
      } catch (e) {
        // Ignore
      }
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