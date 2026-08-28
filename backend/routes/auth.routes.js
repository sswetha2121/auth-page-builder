/* =========================================================
   AUTH PAGE BUILDER - AUTHENTICATION ROUTES
   File: backend/routes/auth.routes.js
========================================================= */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

// Public endpoints
router.post("/register", authController.register);
router.post("/signup", authController.register); // alias
router.post("/login", authController.login);

// Protected endpoints
router.get("/me", authenticateToken, authController.getProfile);

module.exports = router;
