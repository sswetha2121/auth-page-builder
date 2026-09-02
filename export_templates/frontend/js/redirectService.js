/* =========================================================
   AUTHENTICATION PACKAGE - CLIENT REDIRECT SERVICE
   File: js/redirectService.js
========================================================= */

(function (root, factory) {
  const service = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = service;
  }
  if (root) {
    root.RedirectService = service;
    root.redirectService = service;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {

  let redirectExecuted = false;

  function validateUrl(urlInput) {
    if (urlInput === null || urlInput === undefined) {
      return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
    }
    const str = String(urlInput).trim();
    if (!str) {
      return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
    }
    const lower = str.toLowerCase();
    const dangerousSchemes = ["javascript:", "data:", "vbscript:", "file:"];
    for (const scheme of dangerousSchemes) {
      if (lower.startsWith(scheme)) {
        return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
      }
    }
    if (lower.startsWith("http://") || lower.startsWith("https://") || str.startsWith("/")) {
      return { valid: true, url: str };
    }
    if (!str.includes(":")) {
      return { valid: true, url: str };
    }
    return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
  }

  function resolveTargetUrl(rawUrl) {
    if (!rawUrl) return "/dashboard";
    const str = String(rawUrl).trim();
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return str;
    }
    try {
      const origin = (typeof window !== "undefined" && window.location && window.location.origin)
        ? window.location.origin
        : "http://localhost:3000";
      return new URL(str, origin).href;
    } catch (_) {
      return str;
    }
  }

  function execute(redirectConfig = {}, options = {}) {
    if (redirectExecuted && options.force !== true) {
      console.log("[RedirectService] Redirection guard active. Duplicate execution prevented.");
      return Promise.resolve({ success: false, reason: "duplicate_prevented" });
    }

    const config = {
      enabled: redirectConfig.enabled !== false,
      redirectUrl: redirectConfig.redirectUrl || redirectConfig.url || "/dashboard",
      redirectType: redirectConfig.redirectType || "url",
      openInNewTab: Boolean(redirectConfig.openInNewTab),
      showSuccessMessage: redirectConfig.showSuccessMessage !== false,
      successMessage: redirectConfig.successMessage || "Authentication completed successfully.",
      delay: Number(redirectConfig.delay) || 0
    };

    if (!config.enabled) {
      if (config.showSuccessMessage && typeof window !== "undefined" && typeof window.showToast === "function") {
        window.showToast(config.successMessage || "Authentication completed successfully.", "success");
      }
      return Promise.resolve({ success: true, reason: "disabled", redirected: false });
    }

    const valRes = validateUrl(config.redirectUrl);
    if (!valRes.valid) {
      const errToast = valRes.error || "Please enter a valid HTTP(S) URL or relative path.";
      if (typeof window !== "undefined" && typeof window.showToast === "function") {
        window.showToast(errToast, "error");
      }
      return Promise.reject(new Error(errToast));
    }

    redirectExecuted = true;
    const rawTarget = config.redirectUrl;
    const resolvedTarget = resolveTargetUrl(rawTarget);

    if (config.showSuccessMessage && typeof window !== "undefined" && typeof window.showToast === "function") {
      window.showToast(config.successMessage, "success");
    }

    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        window.dispatchEvent(new CustomEvent("auth:redirect", { detail: { url: rawTarget, resolvedUrl: resolvedTarget } }));
      } catch (e) {}
    }

    const delayMs = Math.max(0, config.delay);

    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (rawTarget.startsWith("#")) {
            if (typeof window !== "undefined" && window.location) {
              window.location.hash = rawTarget;
            }
          } else if (config.openInNewTab) {
            if (typeof window !== "undefined" && typeof window.open === "function") {
              window.open(resolvedTarget, "_blank", "noopener,noreferrer");
            }
          } else {
            if (typeof window !== "undefined" && window.location && typeof window.location.assign === "function") {
              window.location.assign(resolvedTarget);
            } else if (typeof window !== "undefined" && window.location) {
              window.location.href = resolvedTarget;
            }
          }
        } catch (err) {
          if (typeof window !== "undefined" && window.location) {
            window.location.href = resolvedTarget;
          }
        }
        resolve({ success: true, url: rawTarget });
      }, delayMs);
    });
  }

  function resetGuard() {
    redirectExecuted = false;
  }

  return {
    validateUrl,
    resolveTargetUrl,
    execute,
    resetGuard
  };
});
