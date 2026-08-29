/* =========================================================
   AUTH PAGE BUILDER - CONFIGURATIONS API SERVICE
   File: js/api/projects.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const client = require("./client.js");
    module.exports = factory(client);
  } else {
    root.ProjectsApi = factory(root.ApiClient);
    root.ConfigurationsApi = root.ProjectsApi;
  }
})(typeof window !== "undefined" ? window : globalThis, function (client) {

  function cleanBlobUrls(data) {
    if (!data) return data;
    try {
      const clone = JSON.parse(JSON.stringify(data));
      if (clone.background && typeof clone.background.uploadedImage === "string" && clone.background.uploadedImage.startsWith("blob:")) {
        clone.background.uploadedImage = clone.background.image || "assets/backgrounds/auth_bg_1.webp";
      }
      if (clone.branding && typeof clone.branding.uploadedLogo === "string" && clone.branding.uploadedLogo.startsWith("blob:")) {
        clone.branding.uploadedLogo = clone.branding.logoAsset || "assets/logos/auth_logo_1.svg";
      }
      return clone;
    } catch (e) {
      return data;
    }
  }

  class ConfigurationsApi {
    constructor() {
      this.client = client;
      this.activeConfigId = null;
      this.activeConfigName = "Default Auth Experience";
    }

    createPayload(configName, state) {
      const cleanState = cleanBlobUrls(state || {});
      const sessionId = this.client.getBuilderSessionId ? this.client.getBuilderSessionId() : null;
      return {
        builder_session_id: sessionId,
        configuration_name: configName || (cleanState.branding?.brandName ? `${cleanState.branding.brandName} Auth` : "Auth Configuration"),
        landing_url: cleanState.urls?.landingPageUrl || null,
        redirect_url: cleanState.urls?.redirectUrl || null,
        configuration_data: cleanState
      };
    }

    async saveConfiguration(configName, state, configId = null) {
      const idToSave = configId || this.activeConfigId;
      const payload = this.createPayload(configName || this.activeConfigName, state);

      if (idToSave) {
        const result = await this.client.put(`/configurations/${idToSave}`, payload);
        if (result && result.configuration) {
          this.activeConfigId = result.configuration.id;
          this.activeConfigName = result.configuration.configuration_name;
        }
        return result;
      } else {
        const result = await this.client.post("/configurations", payload);
        if (result && result.configuration) {
          this.activeConfigId = result.configuration.id;
          this.activeConfigName = result.configuration.configuration_name;
        }
        return result;
      }
    }

    async getCurrentConfiguration() {
      const sessionId = this.client.getBuilderSessionId ? this.client.getBuilderSessionId() : null;
      const endpoint = sessionId ? `/configurations/current?builder_session_id=${encodeURIComponent(sessionId)}` : "/configurations/current";
      return this.client.get(endpoint);
    }

    async listConfigurations() {
      const sessionId = this.client.getBuilderSessionId ? this.client.getBuilderSessionId() : null;
      const endpoint = sessionId ? `/configurations?builder_session_id=${encodeURIComponent(sessionId)}` : "/configurations";
      return this.client.get(endpoint);
    }

    async getConfiguration(configId) {
      const result = await this.client.get(`/configurations/${configId}`);
      if (result && result.configuration) {
        this.activeConfigId = result.configuration.id;
        this.activeConfigName = result.configuration.configuration_name;
      }
      return result;
    }

    async uploadAsset(file) {
      const formData = new FormData();
      formData.append("file", file);
      return this.client.upload("/configurations/upload", formData);
    }

    async updateConfiguration(configId, updateData) {
      return this.client.put(`/configurations/${configId}`, updateData);
    }

    async deleteConfiguration(configId) {
      const result = await this.client.delete(`/configurations/${configId}`);
      if (this.activeConfigId === configId) {
        this.activeConfigId = null;
        this.activeConfigName = "Default Auth Experience";
      }
      return result;
    }

    async listHistory(configId) {
      const idToUse = configId || this.activeConfigId;
      if (!idToUse) return { success: false, history: [] };
      return this.client.get(`/configurations/${idToUse}/history`);
    }

    async restoreHistory(configId, versionId) {
      const idToUse = configId || this.activeConfigId;
      if (!idToUse || !versionId) return { success: false };
      const result = await this.client.post(`/configurations/${idToUse}/history/${versionId}/restore`, {});
      if (result && result.configuration) {
        this.activeConfigId = result.configuration.id;
        this.activeConfigName = result.configuration.configuration_name;
      }
      return result;
    }
  }

  return new ConfigurationsApi();
});
