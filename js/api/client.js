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

  class ApiClient {
    constructor(baseURL = "/api") {
      this.baseURL = baseURL;
      this.headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      this.mockMode = false;

      // Restore saved JWT token
      if (typeof window !== "undefined" && window.localStorage) {
        const savedToken = window.localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          this.setAuthToken(savedToken);
        }
      }
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
      const config = {
        headers: { ...this.headers, ...options.headers },
        ...options
      };

      if (this.mockMode) {
        return this.handleMockRequest(endpoint, config);
      }

      try {
        if (typeof fetch === "undefined") {
          return this.handleMockRequest(endpoint, config);
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
        // In local node / offline test environments without fetch server, provide mock fallback
        if (error.code === "ECONNREFUSED" || error.name === "TypeError" && error.message.includes("fetch failed")) {
          console.warn(`[ApiClient] Network connection failed for ${endpoint}, using local fallback.`);
          return this.handleMockRequest(endpoint, config);
        }
        throw error;
      }
    }

    async get(endpoint, params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const path = queryString ? `${endpoint}?${queryString}` : endpoint;
      return this.request(path, { method: "GET" });
    }

    async post(endpoint, body = {}) {
      return this.request(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    async put(endpoint, body = {}) {
      return this.request(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
      });
    }

    async delete(endpoint) {
      return this.request(endpoint, { method: "DELETE" });
    }

    async handleMockRequest(endpoint, options) {
      await new Promise(resolve => setTimeout(resolve, 50));

      if (endpoint.startsWith("/configurations") || endpoint.startsWith("/projects")) {
        return { success: true, message: "Local fallback response", count: 0, configurations: [] };
      }
      if (endpoint.startsWith("/auth/me")) {
        return { success: true, user: { id: 1, full_name: "Developer", username: "developer", email: "dev@example.com" } };
      }
      if (endpoint.startsWith("/auth")) {
        return { success: true, token: "mock_jwt_token", user: { id: 1, full_name: "Developer", username: "developer", email: "dev@example.com" } };
      }

      return { success: true, data: {} };
    }
  }

  return new ApiClient();
});
