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

  class ConfigurationsApi {
    constructor() {
      this.client = client;
      this.activeConfigId = null;
      this.activeConfigName = "Default Auth Experience";
    }

    createProjectPayload(state) {
      return {
        id: `proj_${Date.now()}`,
        name: state?.branding?.brandName ? `${state.branding.brandName} Auth` : "Auth Project",
        version: "2.0.0",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        configuration: {
          urls: state?.urls || {},
          layout: state?.layout || {},
          background: state?.background || {},
          branding: state?.branding || {},
          card: state?.card || {},
          typography: state?.typography || {},
          button: state?.button || {},
          social: state?.social || {},
          authentication: state?.authentication || {},
          pages: state?.pages || {}
        },
        assets: {
          backgrounds: state?.uploadedAssets?.backgrounds || {},
          logos: state?.uploadedAssets?.logos || {}
        }
      };
    }

    createPayload(configName, state) {
      return {
        configuration_name: configName || state.branding?.brandName ? `${state.branding?.brandName || "My"} Auth Page` : "Auth Configuration",
        landing_url: state.urls?.landingPageUrl || null,
        redirect_url: state.urls?.redirectUrl || null,
        configuration_data: state
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

    async listConfigurations() {
      return this.client.get("/configurations");
    }

    async getConfiguration(configId) {
      const result = await this.client.get(`/configurations/${configId}`);
      if (result && result.configuration) {
        this.activeConfigId = result.configuration.id;
        this.activeConfigName = result.configuration.configuration_name;
      }
      return result;
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

    // Compatibility methods for projects
    async saveProject(state) {
      return this.saveConfiguration(this.activeConfigName, state, this.activeConfigId);
    }

    async listProjects() {
      return this.listConfigurations();
    }

    async getProject(id) {
      return this.getConfiguration(id);
    }
  }

  return new ConfigurationsApi();
});
