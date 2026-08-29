/* =========================================================
   AUTH PAGE BUILDER - API CLIENT ABSTRACTION LAYER
   File: js/api/client.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.ApiClient = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {

  const TOKEN_KEY = "auth_page_builder_jwt_token";
  const SESSION_STORAGE_KEY = "auth_page_builder_session_id";

  function getOrCreateBuilderSessionId() {
    if (typeof window === "undefined" || !window.localStorage) {
      return "session_fallback_id";
    }
    let sessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        sessionId = "sess_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  }

  class ApiClient {
    constructor(baseURL = "/api") {
      this.baseURL = baseURL;
      this.headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      this.mockMode = false;

      // Restore saved JWT token if available
      if (typeof window !== "undefined" && window.localStorage) {
        const savedToken = window.localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          this.setAuthToken(savedToken);
        }
      }
    }

    getBuilderSessionId() {
      return getOrCreateBuilderSessionId();
    }

    setAuthToken(token) {
      if (token) {
        this.token = token;
        this.headers["Authorization"] = `Bearer ${token}`;
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(TOKEN_KEY, token);
        }
      } else {
        this.token = null;
        delete this.headers["Authorization"];
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(TOKEN_KEY);
        }
      }
    }

    getAuthToken() {
      return this.token || (typeof window !== "undefined" && window.localStorage ? window.localStorage.getItem(TOKEN_KEY) : null);
    }

    async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getAuthToken();
      const requestHeaders = {
        ...this.headers,
        "X-Builder-Session-ID": getOrCreateBuilderSessionId(),
        ...options.headers
      };

      if (token && !requestHeaders["Authorization"]) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }

      const config = {
        ...options,
        headers: requestHeaders
      };

      if (this.mockMode) {
        return this.handleMockRequest(endpoint, config);
      }

      try {
        if (typeof fetch === "undefined") {
          throw new Error("HTTP fetch is not supported in this environment.");
        }

        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const err = new Error(data.message || `HTTP ${response.status}`);
          err.status = response.status;
          err.data = data;
          throw err;
        }
        return data;
      } catch (error) {
        if (error.code === "ECONNREFUSED" || (error.name === "TypeError" && (error.message.includes("fetch failed") || error.message.includes("Failed to fetch") || error.message.includes("NetworkError")))) {
          console.warn("[ApiClient] Backend unavailable. Switching to static demo mode.");
          const err = new Error("Backend unavailable");
          err.name = "BackendUnavailableError";
          err.isBackendUnavailable = true;
          err.status = 503;
          throw err;
        }
        throw error;
      }
    }

    async get(endpoint, options = {}) {
      return this.request(endpoint, { method: "GET", ...options });
    }

    async post(endpoint, body, options = {}) {
      return this.request(endpoint, {
        method: "POST",
        body: typeof body === "string" ? body : JSON.stringify(body),
        ...options
      });
    }

    async put(endpoint, body, options = {}) {
      return this.request(endpoint, {
        method: "PUT",
        body: typeof body === "string" ? body : JSON.stringify(body),
        ...options
      });
    }

    async delete(endpoint, options = {}) {
      return this.request(endpoint, { method: "DELETE", ...options });
    }

    async upload(endpoint, formData, options = {}) {
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getAuthToken();
      const requestHeaders = {
        "X-Builder-Session-ID": getOrCreateBuilderSessionId(),
        ...options.headers
      };
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: requestHeaders,
          body: formData
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const err = new Error(data.message || `HTTP ${response.status}`);
          err.status = response.status;
          throw err;
        }
        return data;
      } catch (error) {
        throw error;
      }
    }
  }

  return new ApiClient();
});
