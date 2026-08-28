/* =========================================================
   AUTH PAGE BUILDER - ASSETS API SERVICE
   File: js/api/assets.js
========================================================= */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    const client = require("./client.js");
    module.exports = factory(client);
  } else {
    root.AssetsApi = factory(root.ApiClient);
  }
})(typeof window !== "undefined" ? window : globalThis, function (client) {

  class AssetsApi {
    constructor() {
      this.client = client;
    }

    async uploadAsset(file, type = "logo") {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      if (this.client.mockMode) {
        return {
          id: `asset_${Date.now()}`,
          name: file.name,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          extension: file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "png",
          size: file.size,
          url: `/uploads/${type}/${file.name}`
        };
      }

      return this.client.request("/assets/upload", {
        method: "POST",
        headers: {}, // Let browser set multipart/form-data boundary
        body: formData
      });
    }

    async getAsset(assetId) {
      return this.client.get(`/assets/${assetId}`);
    }

    async deleteAsset(assetId) {
      return this.client.delete(`/assets/${assetId}`);
    }
  }

  return new AssetsApi();
});
