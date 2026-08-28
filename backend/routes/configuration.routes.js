/* =========================================================
   AUTH PAGE BUILDER - CONFIGURATION ROUTES
   File: backend/routes/configuration.routes.js
========================================================= */

const express = require("express");
const router = express.Router();
const configController = require("../controllers/configuration.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// All configuration endpoints require JWT authentication
router.use(authenticateToken);

router.post("/", configController.createConfiguration);
router.get("/", configController.getConfigurations);
router.get("/:id", configController.getConfigurationById);
router.put("/:id", configController.updateConfiguration);
router.delete("/:id", configController.deleteConfiguration);

module.exports = router;
