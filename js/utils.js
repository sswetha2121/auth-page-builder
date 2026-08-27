/* =========================================================
   AUTH PAGE BUILDER - UTILITIES
   File: js/utils.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    const utils = factory();
    root.Utils = utils;
    root.escapeHtml = utils.escapeHtml;
    root.isValidUrl = utils.isValidUrl;
    root.showToast = utils.showToast;
    root.deepGet = utils.deepGet;
    root.deepSet = utils.deepSet;
    root.dataURLToBlob = utils.dataURLToBlob;
    root.fileToDataURL = utils.fileToDataURL;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {

  function $(selector, parent = typeof document !== "undefined" ? document : null) {
    if (!parent || !selector) return null;
    return parent.querySelector(selector);
  }

  function $$(selector, parent = typeof document !== "undefined" ? document : null) {
    if (!parent || !selector) return [];
    return Array.from(parent.querySelectorAll(selector));
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isValidUrl(urlString) {
    if (!urlString || typeof urlString !== "string") return false;
    try {
      const url = new URL(urlString.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  function deepGet(obj, path, fallback = undefined) {
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

  function deepSet(obj, path, value) {
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

  function dataURLToBlob(dataURL) {
    if (!dataURL || typeof dataURL !== "string" || !dataURL.includes(",")) {
      return null;
    }
    try {
      const parts = dataURL.split(";base64,");
      const contentType = parts[0].split(":")[1] || "image/png";
      const raw = atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    } catch (e) {
      console.error("dataURLToBlob error:", e);
      return null;
    }
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file provided"));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  function showToast(message, type = "info", duration = 3000) {
    if (typeof document === "undefined") return;
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toastContainer";
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `app-toast app-toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "⚠" : "ℹ"}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);
    const nextFrame = (typeof window !== "undefined" && window.requestAnimationFrame) 
      ? window.requestAnimationFrame 
      : (fn => setTimeout(fn, 16));

    nextFrame(() => {
      toast.classList.add("toast-visible");
    });

    setTimeout(() => {
      toast.classList.remove("toast-visible");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function debounce(fn, delay = 150) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  return {
    $,
    $$,
    escapeHtml,
    isValidUrl,
    deepGet,
    deepSet,
    dataURLToBlob,
    fileToDataURL,
    showToast,
    debounce
  };
});