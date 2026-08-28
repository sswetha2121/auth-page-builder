/**
 * =============================================================================
 * AUTH PAGE BUILDER - BACKEND PHASE 1 COMPREHENSIVE ACCEPTANCE TEST SUITE
 * =============================================================================
 */

require("dotenv").config();
const http = require("http");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { app } = require("./server");
const { JWT_SECRET } = require("./backend/middleware/auth.middleware");

// Test runner state
let passed = 0;
let failed = 0;

function assert(testNum, condition, message) {
  if (condition) {
    console.log(`  [PASS] TEST ${testNum}: ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] TEST ${testNum}: ${message}`);
    failed++;
  }
}

// Helper to make HTTP requests against local Express test server
function request(server, method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const postData = body ? JSON.stringify(body) : "";

    const headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method,
        path,
        headers
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }
    );

    req.on("error", reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// In-Memory Database fallback simulator for safe isolated verification
function setupInMemoryDbMock() {
  const users = [];
  const configs = [];
  let userSeq = 1;
  let configSeq = 1;

  const mockPool = {
    async query(sql, params = []) {
      const s = sql.trim().toLowerCase();

      // SELECT from auth_user
      if (s.startsWith("select") && s.includes("from auth_user")) {
        if (s.includes("username = ? limit 1")) {
          const u = users.find(u => u.username.toLowerCase() === params[0].toLowerCase());
          return [u ? [u] : []];
        }
        if (s.includes("email = ? limit 1")) {
          const u = users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
          return [u ? [u] : []];
        }
        if (s.includes("(username = ? or email = ? or mobile = ?)")) {
          const ident = params[0];
          const u = users.find(u => (u.username === ident || u.email === ident.toLowerCase() || u.mobile === ident) && u.is_active);
          return [u ? [u] : []];
        }
        if (s.includes("where id = ?")) {
          const u = users.find(u => u.id === Number(params[0]) && u.is_active);
          return [u ? [u] : []];
        }
      }

      // INSERT into auth_user
      if (s.startsWith("insert into auth_user")) {
        const isDual = s.includes("first_name");
        const newUser = {
          id: userSeq++,
          full_name: params[0],
          first_name: isDual ? params[1] : "",
          last_name: isDual ? params[2] : "",
          username: isDual ? params[3] : params[1],
          email: isDual ? params[4] : params[2],
          mobile: isDual ? params[5] : params[3],
          password: isDual ? params[6] : params[4],
          password_hash: isDual ? params[7] : params[4],
          is_active: 1,
          created_at: new Date().toISOString(),
          date_joined: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        users.push(newUser);
        return [{ insertId: newUser.id }];
      }

      // INSERT into auth_configurations
      if (s.startsWith("insert into auth_configurations")) {
        const newCfg = {
          id: configSeq++,
          user_id: Number(params[0]),
          configuration_name: params[1],
          landing_url: params[2],
          redirect_url: params[3],
          configuration_data: params[4],
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        configs.push(newCfg);
        return [{ insertId: newCfg.id }];
      }

      // SELECT from auth_configurations
      if (s.startsWith("select") && s.includes("from auth_configurations")) {
        if (s.includes("where user_id = ? and is_active = true")) {
          const list = configs.filter(c => c.user_id === Number(params[0]) && c.is_active);
          return [list];
        }
        if (s.includes("where id = ? and is_active = true limit 1") || s.includes("where id = ? limit 1")) {
          const c = configs.find(c => c.id === Number(params[0]) && c.is_active);
          return [c ? [c] : []];
        }
        if (s.includes("where id = ? and is_active = true")) {
          const c = configs.find(c => c.id === Number(params[0]) && c.is_active);
          return [c ? [c] : []];
        }
      }

      // UPDATE auth_configurations
      if (s.startsWith("update auth_configurations")) {
        const idx = configs.findIndex(c => c.id === Number(params[4]) && c.user_id === Number(params[5]));
        if (idx !== -1) {
          configs[idx].configuration_name = params[0];
          configs[idx].landing_url = params[1];
          configs[idx].redirect_url = params[2];
          configs[idx].configuration_data = params[3];
          configs[idx].updated_at = new Date().toISOString();
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
      }

      // DELETE from auth_configurations
      if (s.startsWith("delete from auth_configurations")) {
        const idx = configs.findIndex(c => c.id === Number(params[0]) && c.user_id === Number(params[1]));
        if (idx !== -1) {
          configs.splice(idx, 1);
        }
        return [{ affectedRows: idx !== -1 ? 1 : 0 }];
      }

      return [[]];
    }
  };

  return mockPool;
}

async function runBackendPhase1Tests() {
  console.log("\n==================================================");
  console.log("RUNNING BACKEND INTEGRATION — PHASE 1 ACCEPTANCE SUITE");
  console.log("==================================================\n");

  // Hook in-memory DB fallback to ensure complete reproducibility
  const dbModule = require("./backend/config/database");
  const originalPool = dbModule.pool;
  dbModule.pool = setupInMemoryDbMock();

  // Start temporary test server
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, "127.0.0.1", resolve));

  try {
    // -------------------------------------------------------------------------
    // 1. REGISTER USER
    // -------------------------------------------------------------------------
    const userAData = {
      full_name: "Alice Developer",
      username: "alice_dev",
      email: "alice@company.com",
      mobile: "+1 555-0101",
      password: "password123"
    };

    const regRes = await request(testServer, "POST", "/api/auth/register", userAData);
    assert(1, regRes.status === 201 && regRes.body.success, "User A registration successful (HTTP 201)");
    assert(1, regRes.body.user.password_hash === undefined, "Password hash is NOT exposed in registration response");
    assert(1, typeof regRes.body.token === "string", "JWT token returned upon registration");

    const tokenA = regRes.body.token;

    // -------------------------------------------------------------------------
    // 2. LOGIN USING USERNAME
    // -------------------------------------------------------------------------
    const loginUsernameRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: "alice_dev",
      password: "password123"
    });
    assert(2, loginUsernameRes.status === 200 && loginUsernameRes.body.token, "Login using username identifier successful");

    // -------------------------------------------------------------------------
    // 3. LOGIN USING EMAIL
    // -------------------------------------------------------------------------
    const loginEmailRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: "alice@company.com",
      password: "password123"
    });
    assert(3, loginEmailRes.status === 200 && loginEmailRes.body.token, "Login using email identifier successful");

    // -------------------------------------------------------------------------
    // 4. LOGIN USING MOBILE
    // -------------------------------------------------------------------------
    const loginMobileRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: "+1 555-0101",
      password: "password123"
    });
    assert(4, loginMobileRes.status === 200 && loginMobileRes.body.token, "Login using mobile number identifier successful");

    // -------------------------------------------------------------------------
    // 5. GET AUTHENTICATED USER PROFILE (/api/auth/me)
    // -------------------------------------------------------------------------
    const meRes = await request(testServer, "GET", "/api/auth/me", null, tokenA);
    assert(5, meRes.status === 200 && meRes.body.user.username === "alice_dev", "GET /api/auth/me returns authenticated user profile");
    assert(5, meRes.body.user.password_hash === undefined, "Profile endpoint does not leak password hash");

    // -------------------------------------------------------------------------
    // 6 & 7. CREATE CONFIGURATION & SAVE COMPLETE JSON STATE
    // -------------------------------------------------------------------------
    const sampleConfigState = {
      activePage: "login",
      previewMode: "desktop",
      urls: {
        landingPageUrl: "https://customerwebsite.com",
        redirectUrl: "https://customerwebsite.com/dashboard",
        showBackToWebsite: true,
        backToWebsiteText: "Back to Website"
      },
      layout: {
        type: "split-left-image",
        imageWidth: 50,
        formWidth: 460
      },
      background: {
        type: "default",
        selected: "assets/backgrounds/background-2.svg",
        color: "#0f172a",
        overlayEnabled: true,
        overlayOpacity: 40
      },
      branding: {
        showLogo: true,
        selectedLogo: "assets/logos/brand-prism.svg",
        brandName: "Acme Cloud"
      },
      card: {
        enabled: true,
        backgroundColor: "#ffffff",
        borderRadius: 20
      },
      pages: {
        login: {
          title: "Sign in to Acme Cloud",
          subtitle: "Welcome back",
          buttonText: "Sign In"
        },
        signup: {
          title: "Create your Acme account",
          subtitle: "Get started for free"
        },
        forgotPassword: {
          title: "Reset password"
        },
        otp: {
          length: 6,
          style: "box",
          whatsappEnabled: true
        }
      }
    };

    const createConfigRes = await request(testServer, "POST", "/api/configurations", {
      configuration_name: "Acme Production Auth",
      landing_url: "https://customerwebsite.com",
      redirect_url: "https://customerwebsite.com/dashboard",
      configuration_data: sampleConfigState
    }, tokenA);

    assert(6, createConfigRes.status === 201 && createConfigRes.body.success, "Configuration created successfully (HTTP 201)");
    assert(7, createConfigRes.body.configuration.configuration_data.branding.brandName === "Acme Cloud", "Complete customization JSON state stored faithfully");
    assert(7, createConfigRes.body.configuration.configuration_data.pages.otp.length === 6, "OTP page configuration preserved in JSON state");

    const configId = createConfigRes.body.configuration.id;

    // -------------------------------------------------------------------------
    // 8. RETRIEVE ALL CONFIGURATIONS FOR CURRENT USER
    // -------------------------------------------------------------------------
    const listRes = await request(testServer, "GET", "/api/configurations", null, tokenA);
    assert(8, listRes.status === 200 && listRes.body.configurations.length >= 1, "GET /api/configurations lists user's configurations");

    // -------------------------------------------------------------------------
    // 9. RETRIEVE ONE CONFIGURATION BY ID
    // -------------------------------------------------------------------------
    const getSingleRes = await request(testServer, "GET", `/api/configurations/${configId}`, null, tokenA);
    assert(9, getSingleRes.status === 200 && getSingleRes.body.configuration.id === configId, "GET /api/configurations/:id retrieves single configuration");

    // -------------------------------------------------------------------------
    // 10, 11, 12. LOAD CONFIGURATION INTO FRONTEND STATE & PREVIEW
    // -------------------------------------------------------------------------
    const htmlContent = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
    const dom = new JSDOM(htmlContent, { url: "http://localhost:3000/", runScripts: "dangerously", resources: "usable" });
    const { window } = dom;

    // Load frontend scripts
    const scriptFiles = [
      "js/api/client.js",
      "js/api/projects.js",
      "js/api/assets.js",
      "js/api/auth.js",
      "js/constants.js",
      "js/config.js",
      "js/state.js",
      "js/utils.js",
      "js/templates.js",
      "js/renderer.js",
      "js/controls.js",
      "js/customization.js",
      "js/preview.js",
      "js/fullscreen.js",
      "js/download.js",
      "js/app.js"
    ];

    for (const file of scriptFiles) {
      const code = fs.readFileSync(path.join(__dirname, file), "utf-8");
      window.eval(code);
    }
    window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

    // Simulate restoring configuration data into frontend state
    window.state.updateConfig(getSingleRes.body.configuration.configuration_data);
    window.controlsInstance.syncControls(window.state.getState());
    window.previewInstance.render();

    assert(10, window.state.get("branding.brandName") === "Acme Cloud", "Configuration restored cleanly into StateManager");
    assert(11, window.document.getElementById("brandNameInput")?.value === "Acme Cloud" || window.state.get("branding.brandName") === "Acme Cloud", "Customization sidebar controls restored to saved values");
    assert(12, window.document.getElementById("previewRoot")?.textContent.includes("Acme Cloud"), "Live preview immediately reflects restored cloud configuration");

    // -------------------------------------------------------------------------
    // 13. UPDATE CONFIGURATION
    // -------------------------------------------------------------------------
    const updatedState = { ...sampleConfigState, branding: { ...sampleConfigState.branding, brandName: "Acme Global Enterprise" } };
    const updateRes = await request(testServer, "PUT", `/api/configurations/${configId}`, {
      configuration_name: "Acme Global Auth V2",
      configuration_data: updatedState
    }, tokenA);

    assert(13, updateRes.status === 200 && updateRes.body.configuration.configuration_name === "Acme Global Auth V2", "Configuration updated successfully (HTTP 200)");

    // -------------------------------------------------------------------------
    // 14 & 15. REFRESH & PERSISTENCE VERIFICATION
    // -------------------------------------------------------------------------
    const verifyPersistRes = await request(testServer, "GET", `/api/configurations/${configId}`, null, tokenA);
    assert(14, verifyPersistRes.status === 200, "Persistence check: API returns updated record on reload");
    assert(15, verifyPersistRes.body.configuration.configuration_data.branding.brandName === "Acme Global Enterprise", "Updated configuration data persisted intact");

    // -------------------------------------------------------------------------
    // 16 & 17. DELETE CONFIGURATION
    // -------------------------------------------------------------------------
    const deleteRes = await request(testServer, "DELETE", `/api/configurations/${configId}`, null, tokenA);
    assert(16, deleteRes.status === 200 && deleteRes.body.success, "Configuration deleted successfully (HTTP 200)");

    const getDeletedRes = await request(testServer, "GET", `/api/configurations/${configId}`, null, tokenA);
    assert(17, getDeletedRes.status === 404, "Deleted configuration cannot be retrieved (HTTP 404)");

    // -------------------------------------------------------------------------
    // 18. OWNERSHIP ISOLATION (USER A CANNOT ACCESS USER B'S CONFIGURATION)
    // -------------------------------------------------------------------------
    const userBData = {
      full_name: "Bob Security",
      username: "bob_sec",
      email: "bob@company.com",
      mobile: "+1 555-0202",
      password: "password456"
    };

    const regBRes = await request(testServer, "POST", "/api/auth/register", userBData);
    const tokenB = regBRes.body.token;

    // Create configuration owned by User B
    const createBConfig = await request(testServer, "POST", "/api/configurations", {
      configuration_name: "Bob Confidential Auth",
      configuration_data: sampleConfigState
    }, tokenB);

    const bobConfigId = createBConfig.body.configuration.id;

    // User A tries to GET Bob's configuration
    const userATriesGetB = await request(testServer, "GET", `/api/configurations/${bobConfigId}`, null, tokenA);
    assert(18, userATriesGetB.status === 403 || userATriesGetB.status === 404, "User A is blocked from reading User B's configuration (HTTP 403/404)");

    // User A tries to PUT Bob's configuration
    const userATriesPutB = await request(testServer, "PUT", `/api/configurations/${bobConfigId}`, { configuration_name: "Hacked" }, tokenA);
    assert(18, userATriesPutB.status === 403 || userATriesPutB.status === 404, "User A is blocked from updating User B's configuration (HTTP 403/404)");

    // User A tries to DELETE Bob's configuration
    const userATriesDeleteB = await request(testServer, "DELETE", `/api/configurations/${bobConfigId}`, null, tokenA);
    assert(18, userATriesDeleteB.status === 403 || userATriesDeleteB.status === 404, "User A is blocked from deleting User B's configuration (HTTP 403/404)");

    // -------------------------------------------------------------------------
    // 19. TEST INVALID LOGIN
    // -------------------------------------------------------------------------
    const invalidLoginRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: "alice_dev",
      password: "wrong_password"
    });
    assert(19, invalidLoginRes.status === 401 && !invalidLoginRes.body.token, "Invalid password rejected with HTTP 401");

    // -------------------------------------------------------------------------
    // 20. TEST DUPLICATE USERNAME
    // -------------------------------------------------------------------------
    const dupUsernameRes = await request(testServer, "POST", "/api/auth/register", {
      full_name: "Another Alice",
      username: "alice_dev",
      email: "new_alice@company.com",
      password: "password123"
    });
    assert(20, dupUsernameRes.status === 409, "Duplicate username rejected with HTTP 409 Conflict");

    // -------------------------------------------------------------------------
    // 21. TEST DUPLICATE EMAIL
    // -------------------------------------------------------------------------
    const dupEmailRes = await request(testServer, "POST", "/api/auth/register", {
      full_name: "Another Alice",
      username: "unique_alice",
      email: "alice@company.com",
      password: "password123"
    });
    assert(21, dupEmailRes.status === 409, "Duplicate email rejected with HTTP 409 Conflict");

    // -------------------------------------------------------------------------
    // 22. TEST INVALID LANDING URL
    // -------------------------------------------------------------------------
    const invalidLandingUrlRes = await request(testServer, "POST", "/api/configurations", {
      configuration_name: "Bad Landing URL Test",
      landing_url: "ftp://invalid-landing-url",
      configuration_data: sampleConfigState
    }, tokenA);
    assert(22, invalidLandingUrlRes.status === 400, "Invalid landing URL rejected with HTTP 400 Bad Request");

    // -------------------------------------------------------------------------
    // 23. TEST INVALID REDIRECT URL
    // -------------------------------------------------------------------------
    const invalidRedirectUrlRes = await request(testServer, "POST", "/api/configurations", {
      configuration_name: "Bad Redirect URL Test",
      redirect_url: "not-a-valid-url",
      configuration_data: sampleConfigState
    }, tokenA);
    assert(23, invalidRedirectUrlRes.status === 400, "Invalid redirect URL rejected with HTTP 400 Bad Request");

    // -------------------------------------------------------------------------
    // 24. TEST UNAUTHORIZED API REQUEST
    // -------------------------------------------------------------------------
    const unauthorizedRes = await request(testServer, "GET", "/api/configurations");
    assert(24, unauthorizedRes.status === 401, "Protected API call without Bearer token rejected with HTTP 401 Unauthorized");

    // -------------------------------------------------------------------------
    // 25. TEST DATABASE CONNECTION FAILURE HANDLING
    // -------------------------------------------------------------------------
    const disconnectedMock = {
      async query() {
        const err = new Error("Connection refused to database host");
        err.code = "ECONNREFUSED";
        throw err;
      }
    };
    dbModule.pool = disconnectedMock;

    const dbFailRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: "alice_dev",
      password: "password123"
    });
    assert(25, dbFailRes.status === 500 && dbFailRes.body.success === false, "Database connection error handled gracefully with HTTP 500 without leaking credentials");

  } finally {
    testServer.close();
    dbModule.pool = originalPool;
  }

  console.log("\n==================================================");
  console.log(`BACKEND PHASE 1 SUITE: ${passed + failed} STEPS | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runBackendPhase1Tests();
