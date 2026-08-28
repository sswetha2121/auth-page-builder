/* =========================================================
   AUTH PAGE BUILDER - CONFIGURATIONS CONTROLLER
   File: backend/controllers/configuration.controller.js
========================================================= */

const db = require("../config/database");

/**
 * Validate URL helper
 */
function isValidUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Create a new customization configuration
 * POST /api/configurations
 */
async function createConfiguration(req, res, next) {
  try {
    const userId = req.user.id;
    const { configuration_name, landing_url, redirect_url, configuration_data } = req.body;

    if (!configuration_name || !configuration_name.trim()) {
      return res.status(400).json({ success: false, message: "Configuration name is required." });
    }

    if (!configuration_data || typeof configuration_data !== "object") {
      return res.status(400).json({ success: false, message: "Valid configuration_data JSON object is required." });
    }

    // Validate URLs if provided
    if (landing_url && !isValidUrl(landing_url)) {
      return res.status(400).json({ success: false, message: "Invalid landing URL. Must be a valid http:// or https:// URL." });
    }
    if (redirect_url && !isValidUrl(redirect_url)) {
      return res.status(400).json({ success: false, message: "Invalid redirect URL. Must be a valid http:// or https:// URL." });
    }

    const configName = configuration_name.trim();
    const landingUrl = landing_url ? landing_url.trim() : null;
    const redirectUrl = redirect_url ? redirect_url.trim() : null;
    const configJson = JSON.stringify(configuration_data);

    const [result] = await db.pool.query(
      `INSERT INTO auth_configurations (user_id, configuration_name, landing_url, redirect_url, configuration_data, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [userId, configName, landingUrl, redirectUrl, configJson]
    );

    const newId = result.insertId;

    res.status(201).json({
      success: true,
      message: "Configuration saved successfully.",
      configuration: {
        id: newId,
        user_id: userId,
        configuration_name: configName,
        landing_url: landingUrl,
        redirect_url: redirectUrl,
        configuration_data,
        is_active: true
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all configurations for the logged-in user
 * GET /api/configurations
 */
async function getConfigurations(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await db.pool.query(
      `SELECT id, user_id, configuration_name, landing_url, redirect_url, configuration_data, is_active, created_at, updated_at
       FROM auth_configurations
       WHERE user_id = ? AND is_active = TRUE
       ORDER BY updated_at DESC`,
      [userId]
    );

    const configurations = rows.map(row => ({
      ...row,
      configuration_data: typeof row.configuration_data === "string" 
        ? JSON.parse(row.configuration_data) 
        : row.configuration_data
    }));

    res.status(200).json({
      success: true,
      count: configurations.length,
      configurations
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single configuration by ID (with ownership check)
 * GET /api/configurations/:id
 */
async function getConfigurationById(req, res, next) {
  try {
    const userId = req.user.id;
    const configId = Number(req.params.id);

    if (!configId || Number.isNaN(configId)) {
      return res.status(400).json({ success: false, message: "Invalid configuration ID." });
    }

    const [rows] = await db.pool.query(
      `SELECT id, user_id, configuration_name, landing_url, redirect_url, configuration_data, is_active, created_at, updated_at
       FROM auth_configurations
       WHERE id = ? AND is_active = TRUE
       LIMIT 1`,
      [configId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Configuration not found." });
    }

    const config = rows[0];

    // Security ownership check
    if (Number(config.user_id) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You do not own this configuration." });
    }

    config.configuration_data = typeof config.configuration_data === "string"
      ? JSON.parse(config.configuration_data)
      : config.configuration_data;

    res.status(200).json({
      success: true,
      configuration: config
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing configuration (with ownership check)
 * PUT /api/configurations/:id
 */
async function updateConfiguration(req, res, next) {
  try {
    const userId = req.user.id;
    const configId = Number(req.params.id);

    if (!configId || Number.isNaN(configId)) {
      return res.status(400).json({ success: false, message: "Invalid configuration ID." });
    }

    // Verify existing record and ownership
    const [rows] = await db.pool.query(
      "SELECT id, user_id, configuration_name, landing_url, redirect_url, configuration_data FROM auth_configurations WHERE id = ? AND is_active = TRUE LIMIT 1",
      [configId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Configuration not found." });
    }

    const existing = rows[0];

    if (Number(existing.user_id) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You cannot update another user's configuration." });
    }

    const { configuration_name, landing_url, redirect_url, configuration_data } = req.body;

    // Validate URLs if provided
    if (landing_url !== undefined && landing_url !== null && landing_url !== "" && !isValidUrl(landing_url)) {
      return res.status(400).json({ success: false, message: "Invalid landing URL. Must be a valid http:// or https:// URL." });
    }
    if (redirect_url !== undefined && redirect_url !== null && redirect_url !== "" && !isValidUrl(redirect_url)) {
      return res.status(400).json({ success: false, message: "Invalid redirect URL. Must be a valid http:// or https:// URL." });
    }

    const newName = configuration_name !== undefined ? configuration_name.trim() : existing.configuration_name;
    const newLandingUrl = landing_url !== undefined ? (landing_url ? landing_url.trim() : null) : existing.landing_url;
    const newRedirectUrl = redirect_url !== undefined ? (redirect_url ? redirect_url.trim() : null) : existing.redirect_url;
    const newConfigData = configuration_data !== undefined 
      ? JSON.stringify(configuration_data) 
      : existing.configuration_data;

    await db.pool.query(
      `UPDATE auth_configurations
       SET configuration_name = ?, landing_url = ?, redirect_url = ?, configuration_data = ?
       WHERE id = ? AND user_id = ?`,
      [newName, newLandingUrl, newRedirectUrl, newConfigData, configId, userId]
    );

    res.status(200).json({
      success: true,
      message: "Configuration updated successfully.",
      configuration: {
        id: configId,
        user_id: userId,
        configuration_name: newName,
        landing_url: newLandingUrl,
        redirect_url: newRedirectUrl,
        configuration_data: configuration_data !== undefined 
          ? configuration_data 
          : (typeof existing.configuration_data === "string" ? JSON.parse(existing.configuration_data) : existing.configuration_data)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a configuration (with ownership check)
 * DELETE /api/configurations/:id
 */
async function deleteConfiguration(req, res, next) {
  try {
    const userId = req.user.id;
    const configId = Number(req.params.id);

    if (!configId || Number.isNaN(configId)) {
      return res.status(400).json({ success: false, message: "Invalid configuration ID." });
    }

    const [rows] = await db.pool.query(
      "SELECT id, user_id FROM auth_configurations WHERE id = ? AND is_active = TRUE LIMIT 1",
      [configId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Configuration not found." });
    }

    if (Number(rows[0].user_id) !== userId) {
      return res.status(403).json({ success: false, message: "Access denied. You cannot delete another user's configuration." });
    }

    await db.pool.query(
      "DELETE FROM auth_configurations WHERE id = ? AND user_id = ?",
      [configId, userId]
    );

    res.status(200).json({
      success: true,
      message: "Configuration deleted successfully."
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConfiguration,
  getConfigurations,
  getConfigurationById,
  updateConfiguration,
  deleteConfiguration
};
