/* =========================================================
   AUTH PAGE BUILDER - UTILITIES
   File: js/utils.js

   Contains:
   - DOM helpers
   - Safe HTML helpers
   - Deep object utilities
   - File and image upload helpers
   - Data URL conversion
   - Download helpers
   - Debounce and throttle
   - Responsive helpers
   - Form validation
   - Unique IDs
========================================================= */

window.AuthPageBuilder = window.AuthPageBuilder || {};

window.AuthPageBuilder.Utils = {};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}


function $$(selector, parent = document) {
  return Array.from(
    parent.querySelectorAll(selector)
  );
}


function createElement(tagName, options = {}) {
  const element =
    document.createElement(tagName);

  if (options.className) {
    element.className =
      options.className;
  }

  if (options.id) {
    element.id =
      options.id;
  }

  if (options.text !== undefined) {
    element.textContent =
      options.text;
  }

  if (options.html !== undefined) {
    element.innerHTML =
      options.html;
  }

  if (options.attributes) {
    Object.entries(
      options.attributes
    ).forEach(([key, value]) => {
      element.setAttribute(
        key,
        value
      );
    });
  }

  return element;
}


/* =========================================================
   SHOW / HIDE ELEMENTS
========================================================= */

function showElement(element, display = "") {
  if (!element) {
    return;
  }

  element.style.display =
    display;
}


function hideElement(element) {
  if (!element) {
    return;
  }

  element.style.display =
    "none";
}


function toggleElement(
  element,
  visible,
  display = ""
) {
  if (visible) {
    showElement(element, display);
  } else {
    hideElement(element);
  }
}


/* =========================================================
   CLASS HELPERS
========================================================= */

function addClass(
  element,
  className
) {
  if (!element || !className) {
    return;
  }

  element.classList.add(className);
}


function removeClass(
  element,
  className
) {
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


/* =========================================================
   SAFE HTML ESCAPING
========================================================= */

function escapeHtml(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const div =
    document.createElement("div");

  div.textContent =
    String(value);

  return div.innerHTML;
}


/* =========================================================
   DEEP CLONE
========================================================= */

function deepClone(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}


/* =========================================================
   DEEP GET
========================================================= */

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
      : String(path).split(".");

  let current =
    object;

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

  return current;
}


/* =========================================================
   DEEP SET
========================================================= */

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
      : String(path).split(".");

  let current =
    object;

  keys.forEach(
    (key, index) => {

      const isLast =
        index === keys.length - 1;

      if (isLast) {
        current[key] =
          value;

        return;
      }

      if (
        !current[key] ||
        typeof current[key] !== "object"
      ) {
        current[key] = {};
      }

      current =
        current[key];
    }
  );

  return object;
}


/* =========================================================
   FILE TYPE VALIDATION
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
      message: "No file selected."
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

  if (file.size > maxSize) {
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


/* =========================================================
   FILE TO DATA URL

   Used for:
   - Uploaded background
   - Uploaded logo
   - ZIP export metadata
========================================================= */

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


/* =========================================================
   FILE TO TEXT
========================================================= */

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
   DATA URL TO BLOB
========================================================= */

function dataURLToBlob(dataURL) {
  if (
    !dataURL ||
    !String(dataURL).startsWith("data:")
  ) {
    return null;
  }

  const parts =
    dataURL.split(",");

  const header =
    parts[0];

  const base64 =
    parts[1];

  const mimeMatch =
    header.match(
      /data:(.*?);base64/
    );

  const mimeType =
    mimeMatch
      ? mimeMatch[1]
      : "application/octet-stream";

  const binary =
    atob(base64);

  const length =
    binary.length;

  const bytes =
    new Uint8Array(length);

  for (
    let index = 0;
    index < length;
    index++
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
}


/* =========================================================
   IMAGE DIMENSIONS
========================================================= */

function getImageDimensions(
  imageSource
) {
  return new Promise(
    (resolve, reject) => {

      const image =
        new Image();

      image.onload = () => {
        resolve({
          width: image.width,
          height: image.height
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


/* =========================================================
   CREATE IMAGE PREVIEW
========================================================= */

function createImagePreview(
  file
) {
  return new Promise(
    async (
      resolve,
      reject
    ) => {

      try {

        const validation =
          validateImageFile(file);

        if (!validation.valid) {
          reject(
            new Error(
              validation.message
            )
          );

          return;
        }

        const dataURL =
          await fileToDataURL(file);

        const dimensions =
          await getImageDimensions(
            dataURL
          );

        resolve({
          dataURL,
          name: file.name,
          size: file.size,
          type: file.type,
          width:
            dimensions.width,
          height:
            dimensions.height
        });

      } catch (error) {
        reject(error);
      }
    }
  );
}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

function formatFileSize(bytes) {
  if (!bytes) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

  return (
    (
      bytes /
      Math.pow(
        1024,
        index
      )
    ).toFixed(
      index === 0 ? 0 : 2
    ) +
    " " +
    units[index]
  );
}


/* =========================================================
   DOWNLOAD TEXT FILE
========================================================= */

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


/* =========================================================
   DOWNLOAD JSON FILE
========================================================= */

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
   DOWNLOAD BLOB

   Browser download behaviour:
   The file will appear in the user's normal Downloads folder,
   exactly like a browser file download.
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

  link.href =
    url;

  link.download =
    filename;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  link.click();

  setTimeout(
    () => {

      URL.revokeObjectURL(
        url
      );

      link.remove();

    },
    1000
  );

  return true;
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

        timeout =
          null;
      }

      lastCall =
        now;

      callback.apply(
        this,
        args
      );

    } else if (!timeout) {

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
    prefix +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 9)
  );
}


/* =========================================================
   DEVICE HELPERS
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


/* =========================================================
   GET VIEWPORT SIZE
========================================================= */

function getViewportSize() {
  return {
    width:
      window.innerWidth,

    height:
      window.innerHeight
  };
}


/* =========================================================
   COLOR HELPERS
========================================================= */

function hexToRgba(
  hex,
  alpha = 1
) {
  if (!hex) {
    return "";
  }

  let normalized =
    String(hex).replace(
      "#",
      ""
    );

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
   HEX COLOR VALIDATION
========================================================= */

function isValidHexColor(color) {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(
    String(color)
  );
}


/* =========================================================
   CLAMP NUMBER
========================================================= */

function clamp(
  value,
  minimum,
  maximum
) {
  const number =
    Number(value);

  if (Number.isNaN(number)) {
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
   REQUIRED FIELD VALIDATION
========================================================= */

function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );
}


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


/* =========================================================
   EMAIL VALIDATION
========================================================= */

function validateEmail(email) {
  const value =
    String(email || "").trim();

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


/* =========================================================
   MOBILE NUMBER VALIDATION
========================================================= */

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


/* =========================================================
   PASSWORD VALIDATION
========================================================= */

function validatePassword(
  password,
  options = {}
) {
  const minimumLength =
    options.minimumLength || 8;

  if (
    String(password || "").length <
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


/* =========================================================
   PASSWORD CONFIRMATION
========================================================= */

function validatePasswordMatch(
  password,
  confirmPassword
) {
  if (password !== confirmPassword) {
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


/* =========================================================
   VALIDATE OTP
========================================================= */

function validateOtp(
  otp,
  requiredLength = 6
) {
  const value =
    String(otp || "")
      .replace(/\D/g, "");

  if (
    value.length !==
    Number(requiredLength)
  ) {
    return {
      valid: false,
      message:
        `Please enter the ${requiredLength}-digit key.`
    };
  }

  return {
    valid: true,
    message: ""
  };
}


/* =========================================================
   COPY TEXT
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
      text;

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
   SCROLL HELPERS
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
      options.behavior || "smooth",

    block:
      options.block || "center",

    inline:
      options.inline || "nearest"
  });
}


/* =========================================================
   EMIT CUSTOM EVENT
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


/* =========================================================
   ADD EVENT LISTENER SAFELY
========================================================= */

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


/* =========================================================
   IMAGE UPLOAD HANDLER

   Usage:

   handleImageUpload(inputElement, async (result) => {
     updateConfig(
       "background.uploadedImage",
       result.dataURL
     );
   });
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
        event.target.files?.[0];

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
          options.onError(
            error
          );
        }
      }
    }
  );
}


/* =========================================================
   RESET FILE INPUT
========================================================= */

function resetFileInput(input) {
  if (!input) {
    return;
  }

  input.value =
    "";
}


/* =========================================================
   EXPOSE ALL UTILITIES
========================================================= */

Object.assign(
  window.AuthPageBuilder.Utils,
  {

    $,

    $$,

    createElement,

    showElement,

    hideElement,

    toggleElement,

    addClass,

    removeClass,

    toggleClass,

    escapeHtml,

    deepClone,

    deepGet,

    deepSet,

    isImageFile,

    validateImageFile,

    fileToDataURL,

    fileToText,

    dataURLToBlob,

    getImageDimensions,

    createImagePreview,

    formatFileSize,

    downloadTextFile,

    downloadJSON,

    downloadBlob,

    debounce,

    throttle,

    generateId,

    isMobile,

    isTablet,

    isDesktop,

    getViewportSize,

    hexToRgba,

    isValidHexColor,

    clamp,

    isEmpty,

    validateRequired,

    validateEmail,

    validateMobile,

    validatePassword,

    validatePasswordMatch,

    validateOtp,

    copyToClipboard,

    scrollToElement,

    emitEvent,

    on,

    handleImageUpload,

    resetFileInput
  }
);