/* =========================================================
   AUTH PAGE BUILDER - AUTHENTICATION CONTROLLER
   File: backend/controllers/auth.controller.js
========================================================= */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const { JWT_SECRET } = require("../middleware/auth.middleware");

// Email regex validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { full_name, username, email, mobile, password } = req.body;

    // 1. Validate required fields
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: "Full name is required." });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email address is required." });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = full_name.trim();
    const cleanMobile = mobile ? mobile.trim() : null;

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    // 2. Check for duplicate username
    const [existingUsername] = await db.pool.query(
      "SELECT id FROM auth_user WHERE username = ? LIMIT 1",
      [cleanUsername]
    );
    if (existingUsername.length > 0) {
      return res.status(409).json({ success: false, message: "Username is already taken. Please choose another." });
    }

    // 3. Check for duplicate email
    const [existingEmail] = await db.pool.query(
      "SELECT id FROM auth_user WHERE email = ? LIMIT 1",
      [cleanEmail]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: "Email address is already registered. Please login." });
    }

    // 4. Hash password
    const password_hash = await bcrypt.hash(password, 10);
    const nameParts = cleanFullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 5. Insert new user record with dual column compatibility
    const [insertResult] = await db.pool.query(
      `INSERT INTO auth_user (full_name, first_name, last_name, username, email, mobile, password, password_hash, is_active, is_staff, is_superuser, date_joined)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, FALSE, NOW())`,
      [cleanFullName, firstName, lastName, cleanUsername, cleanEmail, cleanMobile, password_hash.substring(0, 128), password_hash]
    );

    const userId = insertResult.insertId;

    // 6. Generate JWT token
    const token = jwt.sign(
      { id: userId, username: cleanUsername, email: cleanEmail },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: userId,
        full_name: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        mobile: cleanMobile,
        is_active: true
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user via username, email, or mobile
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: "Username, email, or mobile number is required." });
    }
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }

    const cleanIdentifier = identifier.trim();

    // Find user by username, email, or mobile
    const [users] = await db.pool.query(
      `SELECT id, full_name, first_name, last_name, username, email, mobile, password, password_hash, is_active
       FROM auth_user
       WHERE (username = ? OR email = ? OR mobile = ?) AND is_active = TRUE
       LIMIT 1`,
      [cleanIdentifier, cleanIdentifier.toLowerCase(), cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please check your details and try again." });
    }

    const user = users[0];
    const hashToVerify = user.password_hash || user.password;

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, hashToVerify);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please check your password and try again." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Lookup configuration-specific redirect_url if configuration_id is provided
    const { configuration_id, config_id } = req.body;
    const targetConfigId = configuration_id || config_id;
    let redirectUrl = null;

    try {
      if (targetConfigId) {
        const [targetConfigs] = await db.pool.query(
          "SELECT redirect_url FROM auth_configurations WHERE id = ? AND is_active = TRUE LIMIT 1",
          [targetConfigId]
        );
        if (targetConfigs && targetConfigs.length > 0 && targetConfigs[0].redirect_url) {
          redirectUrl = targetConfigs[0].redirect_url;
        }
      }
      if (!redirectUrl) {
        const [configs] = await db.pool.query(
          "SELECT redirect_url FROM auth_configurations WHERE user_id = ? AND is_active = TRUE ORDER BY updated_at DESC LIMIT 1",
          [user.id]
        );
        if (configs && configs.length > 0 && configs[0].redirect_url) {
          redirectUrl = configs[0].redirect_url;
        }
      }
    } catch {
      // Non-fatal if config query fails
    }

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        is_active: Boolean(user.is_active)
      },
      redirect_url: redirectUrl
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const [users] = await db.pool.query(
      "SELECT * FROM auth_user WHERE id = ? AND is_active = TRUE LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User account not found or deactivated." });
    }

    const rawUser = users[0];

    const safeUser = {
      id: rawUser.id,
      full_name: rawUser.full_name || `${rawUser.first_name || ""} ${rawUser.last_name || ""}`.trim() || rawUser.username,
      username: rawUser.username,
      email: rawUser.email,
      mobile: rawUser.mobile || null,
      is_active: Boolean(rawUser.is_active),
      created_at: rawUser.created_at || rawUser.date_joined || new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile
};
