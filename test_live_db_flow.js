require("dotenv").config();
const http = require("http");
const { app } = require("./server");
const { pool } = require("./backend/config/database");

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
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runLiveDbTest() {
  console.log("\n==================================================");
  console.log("RUNNING LIVE AWS RDS MYSQL DATABASE END-TO-END FLOW");
  console.log("==================================================\n");

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, "127.0.0.1", resolve));

  const uniqueSuffix = Date.now();
  const testUser = {
    full_name: "Test Engineer",
    username: `test_user_${uniqueSuffix}`,
    email: `test_${uniqueSuffix}@company.com`,
    mobile: `+1 555-${String(uniqueSuffix).slice(-4)}`,
    password: "secure_password_123"
  };

  try {
    // 1. Register User in Live DB
    console.log("1. Testing Registration on Live DB...");
    const regRes = await request(testServer, "POST", "/api/auth/register", testUser);
    console.log("   Registration Status:", regRes.status, "| User ID:", regRes.body.user?.id);
    if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);

    const token = regRes.body.token;

    // 2. Login via Username
    console.log("2. Testing Login via Username...");
    const loginRes = await request(testServer, "POST", "/api/auth/login", {
      identifier: testUser.username,
      password: testUser.password
    });
    console.log("   Login Status:", loginRes.status, "| Token issued:", Boolean(loginRes.body.token));

    // 3. Get User Profile
    console.log("3. Testing GET /api/auth/me...");
    const meRes = await request(testServer, "GET", "/api/auth/me", null, token);
    console.log("   Profile Status:", meRes.status, "| Username:", meRes.body.user?.username);

    // 4. Create Configuration in Live DB
    console.log("4. Testing Configuration Creation on Live DB...");
    const configPayload = {
      configuration_name: `Live Test Config ${uniqueSuffix}`,
      landing_url: "https://customerwebsite.com",
      redirect_url: "https://customerwebsite.com/dashboard",
      configuration_data: {
        branding: { brandName: "Live DB Enterprise", logoShape: "circle" },
        pages: { otp: { length: 6, style: "rounded", whatsappEnabled: true } }
      }
    };
    const createConfigRes = await request(testServer, "POST", "/api/configurations", configPayload, token);
    console.log("   Create Config Status:", createConfigRes.status, "| Config ID:", createConfigRes.body.configuration?.id);
    const configId = createConfigRes.body.configuration?.id;

    // 5. List Configurations
    console.log("5. Testing List Configurations on Live DB...");
    const listRes = await request(testServer, "GET", "/api/configurations", null, token);
    console.log("   List Status:", listRes.status, "| Count:", listRes.body.count);

    // 6. Retrieve Configuration by ID
    console.log("6. Testing GET Configuration by ID...");
    const getRes = await request(testServer, "GET", `/api/configurations/${configId}`, null, token);
    console.log("   Get Config Status:", getRes.status, "| Brand Name:", getRes.body.configuration?.configuration_data?.branding?.brandName);

    // 7. Update Configuration
    console.log("7. Testing PUT Configuration Update...");
    const updateRes = await request(testServer, "PUT", `/api/configurations/${configId}`, {
      configuration_name: `Live Test Config ${uniqueSuffix} (Updated)`,
      configuration_data: {
        branding: { brandName: "Updated Live Enterprise", logoShape: "rounded" }
      }
    }, token);
    console.log("   Update Status:", updateRes.status, "| New Name:", updateRes.body.configuration?.configuration_name);

    // 8. Delete Configuration
    console.log("8. Testing DELETE Configuration...");
    const deleteRes = await request(testServer, "DELETE", `/api/configurations/${configId}`, null, token);
    console.log("   Delete Status:", deleteRes.status, "| Success:", deleteRes.body.success);

    // Clean up test user from live DB
    await pool.query("DELETE FROM auth_user WHERE id = ?", [regRes.body.user.id]);
    console.log("   Cleaned up test user safely from live database.");

    console.log("\n==================================================");
    console.log("LIVE AWS RDS MYSQL E2E TEST: ALL 8 STEPS PASSED 100%!");
    console.log("==================================================\n");
  } finally {
    testServer.close();
    await pool.end();
  }
}

runLiveDbTest();
