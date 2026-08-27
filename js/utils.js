/* =========================================================
   AUTH PAGE BUILDER - UTILITIES
   File: js/utils.js

   Shared utilities for:
   - DOM operations
   - Safe HTML
   - Deep object operations
   - Config/state access
   - File and image uploads
   - Asset handling
   - Download helpers
   - Validation
   - Responsive helpers
   - OTP helpers
   - General utilities
========================================================= */

window.AuthPageBuilder = window.AuthPageBuilder || {};
window.AuthPageBuilder.Utils = {};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, parent = document) {
  if (!selector || !parent) {
    return null;
  }

  return parent.querySelector(selector);
}


function $$(selector, parent = document) {
  if (!selector || !parent) {
    return [];
  }

  return Array.from(
    parent.querySelectorAll(selector)
  );
}


function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.id) {
    element.id = options.id;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.html !== undefined) {
    element.innerHTML = options.html;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null
        ) {
          element.setAttribute(
            key,
            value
          );
        }
      }
    );
  }

  return element;
}


/* =========================================================
   SHOW / HIDE
========================================================= */

function showElement(element, display = "") {
  if (!element) {
    return;
  }

  element.style.display = display;
}


function hideElement(element) {
  if (!element) {
    return;
  }

  element.style.display = "none";
}


function toggleElement(
  element,
  visible,
  display = ""
) {
  if (!element) {
    return;
  }

  if (visible) {
    showElement(element, display);
  } else {
    hideElement(element);
  }
}


/* =========================================================
   CLASS HELPERS
========================================================= */

function addClass(element, className) {
  if (!element || !className) {
    return;
  }

  element.classList.add(className);
}


function removeClass(element, className) {
  if (!element || !className) {
    return;
  }

  element.classList.remove(className);
}


function toggleClass(
  element,
  className,
  force
) {
  if (!element || !className) {
    return false;
  }

  if (force === undefined) {
    return element.classList.toggle(
      className
    );
  }

  return element.classList.toggle(
    className,
    force
  );
}


function hasClass(element, className) {
  if (!element || !className) {
    return false;
  }

  return element.classList.contains(
    className
  );
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function unescapeHtml(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const textarea =
    document.createElement("textarea");

  textarea.innerHTML =
    String(value);

  return textarea.value;
}


/* =========================================================
   STRING HELPERS
========================================================= */

function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );
}


function capitalize(value) {
  const text =
    String(value || "");

  if (!text) {
    return "";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}


function toTitleCase(value) {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}


function sanitizeFileName(
  filename,
  fallback = "file"
) {
  const value =
    String(filename || fallback)
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  return value || fallback;
}


function getFileExtension(filename) {
  const name =
    String(filename || "");

  const index =
    name.lastIndexOf(".");

  if (
    index === -1 ||
    index === name.length - 1
  ) {
    return "";
  }

  return name
    .slice(index + 1)
    .toLowerCase();
}


/* =========================================================
   DEEP OBJECT HELPERS
========================================================= */

function deepClone(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  if (
    typeof structuredClone === "function"
  ) {
    try {
      return structuredClone(value);
    } catch (error) {
      /* fallback below */
    }
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}


function deepGet(
  object,
  path,
  fallback = null
) {
  if (
    !object ||
    !path
  ) {
    return fallback;
  }

  const keys =
    Array.isArray(path)
      ? path
      : String(path)
          .split(".")
          .filter(Boolean);

  let current = object;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      !Object.prototype.hasOwnProperty.call(
        current,
        key
      )
    ) {
      return fallback;
    }

    current =
      current[key];
  }

  return (
    current === undefined
      ? fallback
      : current
  );
}


function deepSet(
  object,
  path,
  value
) {
  if (
    !object ||
    !path
  ) {
    return object;
  }

  const keys =
    Array.isArray(path)
      ? path
      : String(path)
          .split(".")
          .filter(Boolean);

  let current = object;

  keys.forEach(
    (key, index) => {
      const isLast =
        index === keys.length - 1;

      if (isLast) {
        current[key] = value;
        return;
      }

      if (
        !current[key] ||
        typeof current[key] !== "object" ||
        Array.isArray(current[key])
      ) {
        current[key] = {};
      }

      current =
        current[key];
    }
  );

  return object;
}


function deepMerge(
  target,
  source
) {
  const output =
    deepClone(target || {});

  if (
    !source ||
    typeof source !== "object"
  ) {
    return output;
  }

  Object.entries(source).forEach(
    ([key, value]) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        output[key] =
          deepMerge(
            output[key] || {},
            value
          );
      } else {
        output[key] =
          deepClone(value);
      }
    }
  );

  return output;
}


/* =========================================================
   CONFIG HELPERS
========================================================= */

function getAppState() {
  if (
    window.AuthState &&
    typeof window.AuthState.getState ===
      "function"
  ) {
    return window.AuthState.getState();
  }

  if (window.state) {
    return window.state;
  }

  return {};
}


function getConfig() {
  if (
    window.AuthState &&
    typeof window.AuthState.getConfig ===
      "function"
  ) {
    return window.AuthState.getConfig();
  }

  const state =
    getAppState();

  if (state.config) {
    return state.config;
  }

  return state;
}


function getCurrentPage(
  fallback = "login"
) {
  const config =
    getConfig();

  return (
    config.currentPage ||
    deepGet(
      config,
      "page.activePage",
      fallback
    )
  );
}


function normalizePageName(pageName) {
  const value =
    String(pageName || "login")
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const aliases = {
    login: "login",
    signin: "login",

    signup: "signup",
    register: "signup",

    forgot: "forgotPassword",
    forgotpassword:
      "forgotPassword",

    otp: "otp",
    verification: "otp",
    verify: "otp"
  };

  return (
    aliases[value] ||
    "login"
  );
}


function getPageConfig(
  pageName,
  config = getConfig()
) {
  const page =
    normalizePageName(pageName);

  return {
    ...(config[page] || {}),
    ...deepGet(
      config,
      `pages.${page}`,
      {}
    )
  };
}


/* =========================================================
   STATE UPDATE HELPERS
========================================================= */

function updateConfig(
  path,
  value,
  options = {}
) {
  if (
    window.AuthState &&
    typeof window.AuthState.updateConfig ===
      "function"
  ) {
    return window.AuthState.updateConfig(
      path,
      value,
      options
    );
  }

  const config =
    getConfig();

  deepSet(
    config,
    path,
    value
  );

  return config;
}


function triggerPreviewUpdate() {
  if (
    window.AuthPreview &&
    typeof window.AuthPreview.render ===
      "function"
  ) {
    window.AuthPreview.render();
    return;
  }

  if (
    window.renderPreview &&
    typeof window.renderPreview ===
      "function"
  ) {
    window.renderPreview();
  }
}


/* =========================================================
   FILE HELPERS
========================================================= */

function isImageFile(file) {
  if (!file) {
    return false;
  }

  return (
    typeof file.type === "string" &&
    file.type.startsWith("image/")
  );
}


function validateImageFile(
  file,
  options = {}
) {
  const maxSize =
    options.maxSize ||
    10 * 1024 * 1024;

  const allowedTypes =
    options.allowedTypes || [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml"
    ];

  if (!file) {
    return {
      valid: false,
      message: "No image selected."
    };
  }

  if (
    !allowedTypes.includes(file.type)
  ) {
    return {
      valid: false,
      message:
        "Please select a valid image file."
    };
  }

  if (
    file.size > maxSize
  ) {
    return {
      valid: false,
      message:
        "Image size is too large."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function fileToDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(
          new Error(
            "No file was provided."
          )
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the file."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


function fileToText(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(
          new Error(
            "No file was provided."
          )
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the file."
          )
        );
      };

      reader.readAsText(file);
    }
  );
}


/* =========================================================
   DATA URL HELPERS
========================================================= */

function isDataURL(value) {
  return (
    typeof value === "string" &&
    value.startsWith("data:")
  );
}


function getDataURLMimeType(dataURL) {
  if (!isDataURL(dataURL)) {
    return "";
  }

  const match =
    String(dataURL).match(
      /^data:([^;,]+)/
    );

  return (
    match
      ? match[1]
      : ""
  );
}


function getMimeExtension(mimeType) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg"
  };

  return (
    map[mimeType] ||
    ""
  );
}


function dataURLToBlob(dataURL) {
  if (!isDataURL(dataURL)) {
    return null;
  }

  try {
    const parts =
      String(dataURL).split(",");

    if (parts.length < 2) {
      return null;
    }

    const header =
      parts.shift();

    const data =
      parts.join(",");

    const mimeMatch =
      header.match(
        /^data:(.*?)(;base64)?$/
      );

    const mimeType =
      mimeMatch &&
      mimeMatch[1]
        ? mimeMatch[1]
        : "application/octet-stream";

    const isBase64 =
      header.includes(";base64");

    if (!isBase64) {
      return new Blob(
        [
          decodeURIComponent(data)
        ],
        {
          type: mimeType
        }
      );
    }

    const binary =
      atob(data);

    const bytes =
      new Uint8Array(
        binary.length
      );

    for (
      let index = 0;
      index < binary.length;
      index += 1
    ) {
      bytes[index] =
        binary.charCodeAt(index);
    }

    return new Blob(
      [bytes],
      {
        type: mimeType
      }
    );

  } catch (error) {
    console.error(
      "Unable to convert data URL to blob:",
      error
    );

    return null;
  }
}


/* =========================================================
   IMAGE HELPERS
========================================================= */

function getImageDimensions(
  imageSource
) {
  return new Promise(
    (resolve, reject) => {
      if (!imageSource) {
        reject(
          new Error(
            "Image source is missing."
          )
        );
        return;
      }

      const image =
        new Image();

      image.onload = () => {
        resolve({
          width: image.naturalWidth ||
            image.width,
          height: image.naturalHeight ||
            image.height
        });
      };

      image.onerror = () => {
        reject(
          new Error(
            "Unable to load image."
          )
        );
      };

      image.src =
        imageSource;
    }
  );
}


async function createImagePreview(
  file
) {
  const validation =
    validateImageFile(file);

  if (!validation.valid) {
    throw new Error(
      validation.message
    );
  }

  const dataURL =
    await fileToDataURL(file);

  let dimensions = {
    width: 0,
    height: 0
  };

  try {
    dimensions =
      await getImageDimensions(
        dataURL
      );
  } catch (error) {
    console.warn(
      "Image dimensions unavailable:",
      error
    );
  }

  return {
    dataURL,
    name: file.name,
    size: file.size,
    type: file.type,
    width: dimensions.width,
    height: dimensions.height,
    uploadedAt:
      new Date().toISOString()
  };
}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function handleImageUpload(
  input,
  callback,
  options = {}
) {
  if (!input) {
    return;
  }

  input.addEventListener(
    "change",
    async (event) => {
      const file =
        event.target.files &&
        event.target.files[0];

      if (!file) {
        return;
      }

      try {
        const result =
          await createImagePreview(
            file
          );

        if (
          typeof callback ===
          "function"
        ) {
          callback(
            result,
            file
          );
        }

      } catch (error) {
        console.error(
          "Image upload failed:",
          error
        );

        if (
          typeof options.onError ===
          "function"
        ) {
          options.onError(error);
        }
      }
    }
  );
}


function resetFileInput(input) {
  if (!input) {
    return;
  }

  input.value = "";
}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(bytes) {
  const value =
    Number(bytes || 0);

  if (!value) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];

  const index =
    Math.min(
      Math.floor(
        Math.log(value) /
        Math.log(1024)
      ),
      units.length - 1
    );

  const size =
    value /
    Math.pow(
      1024,
      index
    );

  return (
    size.toFixed(
      index === 0
        ? 0
        : 2
    ) +
    " " +
    units[index]
  );
}


/* =========================================================
   DOWNLOAD HELPERS
========================================================= */

function downloadBlob(
  filename,
  blob
) {
  if (!blob) {
    return false;
  }

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    sanitizeFileName(
      filename
    );

  link.style.display = "none";

  document.body.appendChild(link);

  link.click();

  setTimeout(
    () => {
      URL.revokeObjectURL(url);
      link.remove();
    },
    1000
  );

  return true;
}


function downloadTextFile(
  filename,
  content,
  mimeType = "text/plain"
) {
  const blob =
    new Blob(
      [content],
      {
        type: mimeType
      }
    );

  return downloadBlob(
    filename,
    blob
  );
}


function downloadJSON(
  filename,
  data
) {
  const content =
    JSON.stringify(
      data,
      null,
      2
    );

  return downloadTextFile(
    filename,
    content,
    "application/json"
  );
}


/* =========================================================
   ASSET HELPERS

   Used by download.js to collect:
   - uploaded logo
   - uploaded background
   - uploaded images
   - default selected images
========================================================= */

function getAssetFromValue(
  value,
  type = "asset",
  name = ""
) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string"
  ) {
    return {
      type,
      name:
        name ||
        type,
      source: value,
      isDataURL:
        isDataURL(value)
    };
  }

  if (
    typeof value === "object"
  ) {
    const source =
      value.dataURL ||
      value.url ||
      value.src ||
      value.path ||
      "";

    if (!source) {
      return null;
    }

    return {
      type,
      name:
        value.name ||
        name ||
        type,
      source,
      mimeType:
        value.type ||
        getDataURLMimeType(source),
      isDataURL:
        isDataURL(source),
      metadata: value
    };
  }

  return null;
}


function collectAssetsFromConfig(
  config = getConfig()
) {
  const assets = [];

  const possibleAssets = [
    {
      path:
        "branding.uploadedLogo",
      type: "logo",
      name: "logo"
    },
    {
      path:
        "branding.logo",
      type: "logo",
      name: "logo"
    },
    {
      path:
        "branding.logoUrl",
      type: "logo",
      name: "logo"
    },
    {
      path:
        "background.uploadedImage",
      type: "background",
      name: "background"
    },
    {
      path:
        "background.image",
      type: "background",
      name: "background"
    },
    {
      path:
        "background.imageUrl",
      type: "background",
      name: "background"
    }
  ];

  possibleAssets.forEach(
    (item) => {
      const value =
        deepGet(
          config,
          item.path,
          null
        );

      const asset =
        getAssetFromValue(
          value,
          item.type,
          item.name
        );

      if (
        asset &&
        !assets.some(
          (existing) =>
            existing.source ===
            asset.source
        )
      ) {
        assets.push(asset);
      }
    }
  );

  return assets;
}


/* =========================================================
   DEBOUNCE
========================================================= */

function debounce(
  callback,
  delay = 200
) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);

    timer =
      setTimeout(
        () => {
          callback.apply(
            this,
            args
          );
        },
        delay
      );
  };
}


/* =========================================================
   THROTTLE
========================================================= */

function throttle(
  callback,
  delay = 200
) {
  let lastCall = 0;
  let timeout = null;

  return function (...args) {
    const now =
      Date.now();

    const remaining =
      delay -
      (
        now -
        lastCall
      );

    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      lastCall = now;

      callback.apply(
        this,
        args
      );

      return;
    }

    if (!timeout) {
      timeout =
        setTimeout(
          () => {
            lastCall =
              Date.now();

            timeout =
              null;

            callback.apply(
              this,
              args
            );
          },
          remaining
        );
    }
  };
}


/* =========================================================
   UNIQUE ID
========================================================= */

function generateId(
  prefix = "id"
) {
  return (
    sanitizeFileName(prefix) +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );
}


/* =========================================================
   RESPONSIVE HELPERS
========================================================= */

function isMobile() {
  return (
    window.innerWidth <= 768
  );
}


function isTablet() {
  return (
    window.innerWidth > 768 &&
    window.innerWidth <= 1024
  );
}


function isDesktop() {
  return (
    window.innerWidth > 1024
  );
}


function getViewportSize() {
  return {
    width:
      window.innerWidth,

    height:
      window.innerHeight
  };
}


function getPreviewDevice(
  value
) {
  const device =
    String(value || "")
      .toLowerCase()
      .trim();

  if (
    device === "mobile" ||
    device === "phone"
  ) {
    return "mobile";
  }

  if (
    device === "tablet"
  ) {
    return "tablet";
  }

  return "desktop";
}


/* =========================================================
   COLOR HELPERS
========================================================= */

function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(
    String(color || "")
  );
}


function hexToRgba(
  hex,
  alpha = 1
) {
  if (!hex) {
    return "";
  }

  let normalized =
    String(hex)
      .replace("#", "")
      .trim();

  if (
    normalized.length === 3
  ) {
    normalized =
      normalized
        .split("")
        .map(
          (character) =>
            character + character
        )
        .join("");
  }

  if (
    normalized.length !== 6
  ) {
    return hex;
  }

  const red =
    parseInt(
      normalized.substring(0, 2),
      16
    );

  const green =
    parseInt(
      normalized.substring(2, 4),
      16
    );

  const blue =
    parseInt(
      normalized.substring(4, 6),
      16
    );

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}


/* =========================================================
   NUMBER HELPERS
========================================================= */

function clamp(
  value,
  minimum,
  maximum
) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return minimum;
  }

  return Math.min(
    Math.max(
      number,
      minimum
    ),
    maximum
  );
}


/* =========================================================
   FORM VALIDATION
========================================================= */

function validateRequired(
  value,
  message = "This field is required."
) {
  if (isEmpty(value)) {
    return {
      valid: false,
      message
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function validateEmail(email) {
  const value =
    String(email || "")
      .trim();

  const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(value)) {
    return {
      valid: false,
      message:
        "Please enter a valid email address."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function validateMobile(
  mobile
) {
  const value =
    String(mobile || "")
      .replace(/\s+/g, "")
      .replace(/[()-]/g, "");

  const pattern =
    /^\+?[0-9]{7,15}$/;

  if (!pattern.test(value)) {
    return {
      valid: false,
      message:
        "Please enter a valid mobile number."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function validatePassword(
  password,
  options = {}
) {
  const minimumLength =
    Number(
      options.minimumLength ||
      8
    );

  const value =
    String(password || "");

  if (
    value.length <
    minimumLength
  ) {
    return {
      valid: false,
      message:
        `Password must contain at least ${minimumLength} characters.`
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function validatePasswordMatch(
  password,
  confirmPassword
) {
  if (
    password !== confirmPassword
  ) {
    return {
      valid: false,
      message:
        "Passwords do not match."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function validateOtp(
  otp,
  requiredLength = 6
) {
  const value =
    String(otp || "")
      .replace(/\D/g, "");

  const length =
    Number(requiredLength);

  if (
    ![4, 6, 8].includes(
      length
    )
  ) {
    return {
      valid: false,
      message:
        "OTP length must be 4, 6, or 8 digits."
    };
  }

  if (
    value.length !== length
  ) {
    return {
      valid: false,
      message:
        `Please enter the ${length}-digit OTP.`
    };
  }

  return {
    valid: true,
    message: ""
  };
}


function getOtpValue(
  inputs
) {
  if (!inputs) {
    return "";
  }

  const fields =
    Array.isArray(inputs)
      ? inputs
      : Array.from(inputs);

  return fields
    .map(
      (input) =>
        String(
          input.value || ""
        ).replace(/\D/g, "")
    )
    .join("");
}


/* =========================================================
   CLIPBOARD
========================================================= */

async function copyToClipboard(text) {
  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        text
      );

      return true;
    }

    const textArea =
      document.createElement(
        "textarea"
      );

    textArea.value =
      String(text || "");

    textArea.style.position =
      "fixed";

    textArea.style.opacity =
      "0";

    document.body.appendChild(
      textArea
    );

    textArea.select();

    const copied =
      document.execCommand(
        "copy"
      );

    textArea.remove();

    return copied;

  } catch (error) {
    console.error(
      "Clipboard copy failed:",
      error
    );

    return false;
  }
}


/* =========================================================
   SCROLL
========================================================= */

function scrollToElement(
  element,
  options = {}
) {
  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior:
      options.behavior ||
      "smooth",

    block:
      options.block ||
      "center",

    inline:
      options.inline ||
      "nearest"
  });
}


/* =========================================================
   CUSTOM EVENTS
========================================================= */

function emitEvent(
  eventName,
  detail = {}
) {
  document.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail
      }
    )
  );
}


function on(
  element,
  eventName,
  handler,
  options
) {
  if (
    !element ||
    !eventName ||
    !handler
  ) {
    return;
  }

  element.addEventListener(
    eventName,
    handler,
    options
  );
}


function once(
  element,
  eventName,
  handler,
  options
) {
  if (
    !element ||
    !eventName ||
    !handler
  ) {
    return;
  }

  element.addEventListener(
    eventName,
    handler,
    {
      ...options,
      once: true
    }
  );
}


/* =========================================================
   EXPOSE UTILITIES
========================================================= */

Object.assign(
  window.AuthPageBuilder.Utils,
  {

    /* DOM */
    $,
    $$,
    createElement,

    /* Visibility */
    showElement,
    hideElement,
    toggleElement,

    /* Classes */
    addClass,
    removeClass,
    toggleClass,
    hasClass,

    /* HTML */
    escapeHtml,
    unescapeHtml,

    /* String */
    isEmpty,
    capitalize,
    toTitleCase,
    sanitizeFileName,
    getFileExtension,

    /* Objects */
    deepClone,
    deepGet,
    deepSet,
    deepMerge,

    /* Config */
    getAppState,
    getConfig,
    getCurrentPage,
    normalizePageName,
    getPageConfig,
    updateConfig,
    triggerPreviewUpdate,

    /* Files */
    isImageFile,
    validateImageFile,
    fileToDataURL,
    fileToText,

    /* Data URL */
    isDataURL,
    getDataURLMimeType,
    getMimeExtension,
    dataURLToBlob,

    /* Images */
    getImageDimensions,
    createImagePreview,
    handleImageUpload,
    resetFileInput,

    /* Assets */
    getAssetFromValue,
    collectAssetsFromConfig,

    /* File info */
    formatFileSize,

    /* Downloads */
    downloadBlob,
    downloadTextFile,
    downloadJSON,

    /* Performance */
    debounce,
    throttle,

    /* IDs */
    generateId,

    /* Responsive */
    isMobile,
    isTablet,
    isDesktop,
    getViewportSize,
    getPreviewDevice,

    /* Colors */
    isValidHexColor,
    hexToRgba,

    /* Numbers */
    clamp,

    /* Validation */
    validateRequired,
    validateEmail,
    validateMobile,
    validatePassword,
    validatePasswordMatch,
    validateOtp,
    getOtpValue,

    /* Clipboard */
    copyToClipboard,

    /* DOM */
    scrollToElement,

    /* Events */
    emitEvent,
    on,
    once
  }
);


/* =========================================================
   BACKWARD COMPATIBILITY

   Allows existing project files to use the
   utility functions directly.
========================================================= */

window.$ = window.$ || $;
window.$$ = window.$$ || $$;

window.deepGet =
  window.deepGet || deepGet;

window.deepSet =
  window.deepSet || deepSet;

window.deepClone =
  window.deepClone || deepClone;

window.escapeHtml =
  window.escapeHtml || escapeHtml;

window.updateConfig =
  window.updateConfig || updateConfig;

window.getConfig =
  window.getConfig || getConfig;

window.collectAssetsFromConfig =
  window.collectAssetsFromConfig ||
  collectAssetsFromConfig;

window.dataURLToBlob =
  window.dataURLToBlob ||
  dataURLToBlob;

window.fileToDataURL =
  window.fileToDataURL ||
  fileToDataURL;

window.validateOtp =
  window.validateOtp ||
  validateOtp;

window.getOtpValue =
  window.getOtpValue ||
  getOtpValue;