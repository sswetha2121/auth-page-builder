/* =========================================================
   AUTH PAGE BUILDER - JWT AUTHENTICATION MIDDLEWARE
   File: backend/middleware/auth.middleware.js
========================================================= */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_auth_page_builder_jwt_secret_2026";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. No Bearer token provided."
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: err.name === "TokenExpiredError" ? "Token expired. Please login again." : "Invalid authentication token."
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Malformed token payload."
      });
    }

    req.user = {
      id: Number(decoded.id),
      username: decoded.username,
      email: decoded.email
    };

    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
