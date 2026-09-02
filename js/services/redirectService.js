/* =========================================================
   AUTH PAGE BUILDER - CENTRALIZED REDIRECT SERVICE
   File: js/services/redirectService.js
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

  /**
   * Validate redirection URL.
   * Allows valid HTTP/HTTPS URLs and safe relative paths (e.g. /dashboard).
   * Rejects dangerous schemes: javascript:, data:, vbscript:, file:.
   */
  function validateUrl(urlInput) {
    if (urlInput === null || urlInput === undefined) {
      return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
    }

    const str = String(urlInput).trim();
    if (!str) {
      return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
    }

    const lower = str.toLowerCase();
    // Reject unsafe executable schemes explicitly
    const dangerousSchemes = ["javascript:", "data:", "vbscript:", "file:"];
    for (const scheme of dangerousSchemes) {
      if (lower.startsWith(scheme)) {
        return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
      }
    }

    // Check absolute HTTP/HTTPS or relative URL format
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      try {
        const parsed = new URL(str);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          return { valid: true, url: str };
        }
      } catch (_) {
        return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
      }
    }

    // Relative URL paths starting with / or alphanumeric relative paths
    if (str.startsWith("/") || /^[a-zA-Z0-9_\-\.\/]+$/.test(str)) {
      return { valid: true, url: str };
    }

    // Fallback URL parser attempt with relative base
    try {
      const origin = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "http://localhost";
      const resolved = new URL(str, origin);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        return { valid: true, url: str };
      }
    } catch (_) {}

    return { valid: false, error: "Please enter a valid HTTP(S) URL or relative path." };
  }

  /**
   * Resolve a relative or absolute URL into an absolute URL string for browser navigation.
   */
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

  /**
   * Execute redirection.
   * THIS IS THE SOLE CHOKEPOINT FOR BROWSER NAVIGATION IN THE ENTIRE APPLICATION.
   *
   * @param {Object} redirectConfig - Canonical redirect config or partial override.
   * @param {Object} options - Options such as { isPreview: boolean, force: boolean, context: string }
   */
  function execute(redirectConfig = {}, options = {}) {
    if (redirectExecuted && options.force !== true && !options.isPreview) {
      console.log("[RedirectService] Redirection guard active. Duplicate execution prevented.");
      return Promise.resolve({ success: false, reason: "duplicate_prevented" });
    }

    // Normalize config values
    const config = {
      enabled: redirectConfig.enabled !== false,
      redirectUrl: redirectConfig.redirectUrl || redirectConfig.url || "/dashboard",
      redirectType: redirectConfig.redirectType || "url",
      openInNewTab: Boolean(redirectConfig.openInNewTab),
      showSuccessMessage: redirectConfig.showSuccessMessage !== false,
      successMessage: redirectConfig.successMessage || "Authentication completed successfully.",
      delay: Number(redirectConfig.delay) || 0
    };

    if (!redirectConfig || typeof redirectConfig !== "object") {
      console.log("[Redirect] No redirect configuration found");
      return Promise.resolve({ success: false, reason: "missing_config" });
    }

    if (!config.enabled) {
      console.log("[Redirect] Redirect disabled");
      return Promise.resolve({ success: false, reason: "disabled" });
    }

    // Validate URL scheme
    const valRes = validateUrl(config.redirectUrl);
    if (!valRes.valid) {
      const errToast = valRes.error || "Please enter a valid HTTP(S) URL or relative path.";
      if (typeof window !== "undefined" && window.Utils && typeof window.Utils.showToast === "function") {
        window.Utils.showToast(errToast, "error", 4000);
      }
      return Promise.reject(new Error(errToast));
    }

    // Activate single-execution guard
    redirectExecuted = true;

    const rawTarget = config.redirectUrl;
    const resolvedTarget = resolveTargetUrl(rawTarget);

    // Toast notification
    if (config.showSuccessMessage) {
      const displayMsg = `${config.successMessage} Redirect destination: ${rawTarget}`;
      const toastFn = (typeof window !== "undefined") ? (window.Utils?.showToast || window.showToast) : null;
      if (typeof toastFn === "function") {
        toastFn(displayMsg, "success", 3500);
      }
    }

    // Dispatch global redirect event for test runners / observers
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      try {
        window.dispatchEvent(
          new CustomEvent("auth:redirect", {
            detail: {
              url: rawTarget,
              resolvedUrl: resolvedTarget,
              config: config,
              isPreview: Boolean(options.isPreview)
            }
          })
        );
      } catch (e) {}
    }

    if (typeof window !== "undefined" && typeof window.onAuthRedirect === "function") {
      try {
        window.onAuthRedirect(rawTarget);
      } catch (e) {}
    }

    // Delay calculation
    const delayMs = Math.max(0, config.delay);

    return new Promise((resolve) => {
      setTimeout(() => {
        // If simulation explicitly requested by unit tests, suppress navigation
        if (options.simulateInPreview === true) {
          console.log("[Redirect] Simulated preview mode");
          console.log(`[Redirect] Target: ${rawTarget}`);
          resolve({ success: true, simulated: true, url: rawTarget, resolvedUrl: resolvedTarget });
          return;
        }

        // Sole Browser Navigation Execution Chokepoint
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
          console.error("[RedirectService] Navigation error:", err);
          if (typeof window !== "undefined" && window.location) {
            window.location.href = resolvedTarget;
          }
        }

        resolve({ success: true, url: rawTarget, resolvedUrl: resolvedTarget });
      }, delayMs);
    });
  }

  function resetGuard() {
    redirectExecuted = false;
  }

  function isExecuted() {
    return redirectExecuted;
  }

  return {
    validateUrl,
    resolveTargetUrl,
    execute,
    resetGuard,
    isExecuted
  };
});
