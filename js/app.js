/* =========================================================
   AUTH PAGE BUILDER - MAIN APPLICATION CONTROLLER
   File: js/app.js
========================================================= */

"use strict";

let appInitialized = false;
let autosaveTimeout = null;
let isAutosaving = false;

/* =========================================================
   STARTUP CONFIGURATION RESTORATION
========================================================= */
async function loadSavedConfigurationOnStartup() {
  if (!window.ConfigurationsApi) return;
  try {
    const res = await window.ConfigurationsApi.getCurrentConfiguration();
    if (res && res.configuration) {
      const config = res.configuration;
      window.ConfigurationsApi.activeConfigId = config.id;
      window.ConfigurationsApi.activeConfigName = config.configuration_name || "Default Auth Experience";
      if (config.configuration_data && window.state && typeof window.state.loadState === "function") {
        window.state.loadState(config.configuration_data);
        if (window.controlsInstance) {
          window.controlsInstance.syncControls(window.state.getState());
        }
        if (window.previewInstance) {
          window.previewInstance.render();
        }
        console.log(`[Startup] Loaded active configuration: ID ${config.id} (${config.configuration_name})`);
      }
    }
  } catch (err) {
    console.log("[Startup] Startup configuration restoration skipped:", err.message);
  }
}
window.loadSavedConfigurationOnStartup = loadSavedConfigurationOnStartup;

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

async function initializeApp() {
  if (appInitialized) return;
  appInitialized = true;

  console.log("Initializing Auth Page Builder...");

  // 1. Initialize Controls Manager
  if (window.ControlsManager) {
    window.controlsInstance = new window.ControlsManager();
  }

  // 2. Initialize Preview Manager
  if (window.PreviewManager) {
    window.previewInstance = new window.PreviewManager();
  }

  // 3. Initialize Fullscreen Manager
  if (window.FullscreenManager) {
    window.fullscreenInstance = new window.FullscreenManager();
  }

  // 4. Initialize Download Button
  initializeDownloadButton();

  // 5. Initialize Backend Auth & Cloud Modals
  initializeModals();
  initializeBackendAuth();
  initializeConfigurationsManager();

  // 6. Initial Sync & Render
  if (window.state && window.controlsInstance) {
    window.controlsInstance.syncControls(window.state.getState());
  }

  if (window.previewInstance) {
    window.previewInstance.render();
  }

  // 7. Subscribe to State Changes for Debounced Cloud Autosave
  if (window.state && typeof window.state.subscribe === "function") {
    window.state.subscribe((state) => {
      triggerDebouncedAutosave(state);
    });
  }

  // 8. Restore Saved Configuration from Session / Cloud on Startup
  loadSavedConfigurationOnStartup();

  // Check existing session
  if (window.AuthController) {
    window.AuthController.getCurrentUser().then(user => {
      updateUserAuthUI(user);
    }).catch(() => {});
  }

  console.log("Auth Page Builder initialized successfully!");
}

/* =========================================================
   DOWNLOAD BUTTON BINDING
========================================================= */
function initializeDownloadButton() {
  const downloadButtons = document.querySelectorAll('[data-action="download-package"], #downloadButton');
  downloadButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      if (typeof window.downloadPackage === "function") {
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>Generating ZIP...</span>`;
        try {
          await window.downloadPackage();
        } catch (e) {
          console.error("Download package error:", e);
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      } else {
        console.warn("downloadPackage is not available.");
      }
    });
  });
}

/* =========================================================
   DEBOUNCED CLOUD AUTOSAVE
========================================================= */
function triggerDebouncedAutosave(state) {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }

  const indicator = document.querySelector("[data-unsaved-indicator]");
  const indicatorText = indicator?.querySelector(".indicator-text");

  if (!window.ConfigurationsApi) {
    return;
  }

  autosaveTimeout = setTimeout(async () => {
    if (isAutosaving) return;
    isAutosaving = true;

    if (indicatorText) {
      indicatorText.textContent = "Saving to Cloud...";
    }

    try {
      const currentState = window.state ? window.state.getState() : state;
      const activeId = window.ConfigurationsApi.activeConfigId;

      if (activeId) {
        console.log(`[Autosave] Updating configuration: ID ${activeId}`);
        await window.ConfigurationsApi.saveConfiguration(
          window.ConfigurationsApi.activeConfigName || "Default Auth Experience",
          currentState,
          activeId
        );
        console.log(`[Autosave] Configuration updated successfully`);
      } else {
        console.log("[Autosave] Creating configuration...");
        const result = await window.ConfigurationsApi.saveConfiguration(
          "Default Auth Experience",
          currentState,
          null
        );

        if (result?.configuration?.id) {
          window.ConfigurationsApi.activeConfigId = result.configuration.id;
          window.ConfigurationsApi.activeConfigName = result.configuration.configuration_name || "Default Auth Experience";
          console.log(`[Autosave] Configuration created: ID ${result.configuration.id}`);
        }
      }

      if (indicatorText) {
        indicatorText.textContent = "Saved to Cloud";
      }
    } catch (err) {
      console.warn("[Autosave] Cloud sync skipped:", err.message);
      if (indicatorText) {
        indicatorText.textContent = "Live Sync Active";
      }
    } finally {
      isAutosaving = false;
      setTimeout(() => {
        if (indicatorText && indicatorText.textContent === "Saved to Cloud") {
          indicatorText.textContent = "Live Sync Active";
        }
      }, 3000);
    }
  }, 1200);
}

/* =========================================================
   MODAL CONTROLLER (GENERIC)
========================================================= */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.setAttribute("hidden", "true");
    document.body.style.overflow = "";
  }
}

function initializeModals() {
  document.querySelectorAll("[data-action='close-modal']").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".app-modal");
      if (modal) {
        closeModal(modal.id);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".app-modal:not([hidden])").forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
}

/* =========================================================
   BACKEND AUTHENTICATION (REGISTER / LOGIN / LOGOUT)
========================================================= */
function initializeBackendAuth() {
  const authBtn = document.getElementById("userAuthButton");
  if (authBtn) {
    authBtn.addEventListener("click", () => {
      openModal("userAuthModal");
    });
  }

  // Tab switching in auth modal
  document.querySelectorAll("[data-auth-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll("[data-auth-tab]").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const target = tab.dataset.authTab;
      const loginForm = document.getElementById("backendLoginForm");
      const regForm = document.getElementById("backendRegisterForm");

      if (target === "login") {
        if (loginForm) loginForm.style.display = "flex";
        if (regForm) regForm.style.display = "none";
      } else {
        if (loginForm) loginForm.style.display = "none";
        if (regForm) regForm.style.display = "flex";
      }
    });
  });

  // Login Form Submit
  const loginForm = document.getElementById("backendLoginForm");
  const loginFeedback = document.getElementById("loginFormFeedback");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identifier = document.getElementById("loginUserInput")?.value;
      const password = document.getElementById("loginUserPass")?.value;

      if (loginFeedback) {
        loginFeedback.className = "form-feedback";
        loginFeedback.textContent = "Signing in...";
      }

      try {
        const result = await window.AuthController.loginUser({ identifier, password });
        if (loginFeedback) {
          loginFeedback.className = "form-feedback success";
          loginFeedback.textContent = "Signed in successfully!";
        }
        updateUserAuthUI(result.user);
        setTimeout(() => {
          closeModal("userAuthModal");
          if (loginFeedback) loginFeedback.textContent = "";
        }, 600);
      } catch (err) {
        if (loginFeedback) {
          loginFeedback.className = "form-feedback error";
          loginFeedback.textContent = err.message || "Invalid credentials.";
        }
      }
    });
  }

  // Register Form Submit
  const regForm = document.getElementById("backendRegisterForm");
  const regFeedback = document.getElementById("regFormFeedback");

  if (regForm) {
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const full_name = document.getElementById("regFullName")?.value;
      const username = document.getElementById("regUsername")?.value;
      const email = document.getElementById("regEmail")?.value;
      const mobile = document.getElementById("regMobile")?.value;
      const password = document.getElementById("regPassword")?.value;

      if (regFeedback) {
        regFeedback.className = "form-feedback";
        regFeedback.textContent = "Creating account...";
      }

      try {
        const result = await window.AuthController.registerUser({ full_name, username, email, mobile, password });
        if (regFeedback) {
          regFeedback.className = "form-feedback success";
          regFeedback.textContent = "Account created successfully!";
        }
        updateUserAuthUI(result.user);
        setTimeout(() => {
          closeModal("userAuthModal");
          if (regFeedback) regFeedback.textContent = "";
        }, 600);
      } catch (err) {
        if (regFeedback) {
          regFeedback.className = "form-feedback error";
          regFeedback.textContent = err.message || "Registration failed.";
        }
      }
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (window.AuthController) {
        window.AuthController.logout();
      }
      updateUserAuthUI(null);
      closeModal("userAuthModal");
      if (window.Utils?.showToast) {
        window.Utils.showToast("Signed out successfully.", "info");
      }
    });
  }
}

function updateUserAuthUI(user) {
  const loggedOutView = document.getElementById("authLoggedOutView");
  const loggedInView = document.getElementById("authLoggedInView");
  const authBtnText = document.getElementById("userAuthButtonText");
  const profileName = document.getElementById("userProfileName");
  const profileEmail = document.getElementById("userProfileEmail");
  const profileUsername = document.getElementById("userProfileUsername");
  const userAvatar = document.getElementById("userAvatar");

  if (user) {
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView) loggedLoggedInView();
    if (authBtnText) authBtnText.textContent = user.full_name?.split(" ")[0] || user.username || "Account";
    if (profileName) profileName.textContent = user.full_name || "User";
    if (profileEmail) profileEmail.textContent = user.email || "";
    if (profileUsername) profileUsername.textContent = `@${user.username || "user"}`;
    if (userAvatar) userAvatar.textContent = (user.full_name?.[0] || user.username?.[0] || "U").toUpperCase();
  } else {
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView) loggedInView.style.display = "none";
    if (authBtnText) authBtnText.textContent = "Account";
  }

  function loggedLoggedInView() {
    if (loggedInView) loggedInView.style.display = "block";
  }
}

/* =========================================================
   SAVED CONFIGURATIONS MANAGER
========================================================= */
function initializeConfigurationsManager() {
  const configBtn = document.getElementById("savedConfigsButton");
  if (configBtn) {
    configBtn.addEventListener("click", () => {
      openModal("configurationsModal");
      loadAndRenderConfigurations();
    });
  }

  const handleSaveClick = async (btnElement, defaultName = "My Auth Page Experience") => {
    if (!window.ConfigurationsApi) return;
    const nameInput = document.getElementById("newConfigNameInput");
    const configName = nameInput?.value?.trim() || window.ConfigurationsApi.activeConfigName || defaultName;

    if (btnElement) {
      btnElement.disabled = true;
      btnElement.dataset.originalText = btnElement.innerHTML;
      btnElement.innerHTML = `<span>Saving...</span>`;
    }

    try {
      const state = window.state ? window.state.getState() : {};
      const activeId = window.ConfigurationsApi.activeConfigId;
      const result = await window.ConfigurationsApi.saveConfiguration(configName, state, activeId);

      if (result?.configuration?.id) {
        window.ConfigurationsApi.activeConfigId = result.configuration.id;
        window.ConfigurationsApi.activeConfigName = result.configuration.configuration_name || configName;
      }

      if (nameInput) nameInput.value = "";
      if (window.Utils?.showToast) {
        window.Utils.showToast(`Saved "${configName}" to database!`, "success");
      }
      await loadAndRenderConfigurations();
    } catch (err) {
      if (window.Utils?.showToast) {
        window.Utils.showToast(err.message || "Failed to save configuration.", "error");
      }
    } finally {
      if (btnElement) {
        btnElement.disabled = false;
        btnElement.innerHTML = btnElement.dataset.originalText || `<span>Save Changes</span>`;
      }
    }
  };

  const headerSaveBtn = document.getElementById("headerSaveButton");
  if (headerSaveBtn) {
    headerSaveBtn.addEventListener("click", () => handleSaveClick(headerSaveBtn));
  }

  const panelSaveBtn = document.getElementById("panelSaveButton");
  if (panelSaveBtn) {
    panelSaveBtn.addEventListener("click", () => handleSaveClick(panelSaveBtn));
  }

  // Save new configuration button inside modal
  const saveBtn = document.getElementById("saveNewConfigButton");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => handleSaveClick(saveBtn));
  }
}

async function loadAndRenderConfigurations() {
  const container = document.getElementById("configurationsListContainer");
  if (!container) return;

  container.innerHTML = `<div class="config-loading-spinner">Loading configurations...</div>`;

  if (!window.AuthController?.isAuthenticated()) {
    container.innerHTML = `
      <div class="config-empty-state">
        <p>Please <strong>Sign In</strong> to view and save your cloud configurations.</p>
        <button type="button" class="btn btn-primary" onclick="closeModal('configurationsModal'); openModal('userAuthModal');">Sign In / Register</button>
      </div>
    `;
    return;
  }

  try {
    const response = await window.ConfigurationsApi.listConfigurations();
    const configs = response.configurations || [];

    if (configs.length === 0) {
      container.innerHTML = `
        <div class="config-empty-state">
          <p>No saved configurations found. Give your current design a name above and click <strong>Save Current State</strong>!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = configs.map(cfg => {
      const isActive = window.ConfigurationsApi.activeConfigId === cfg.id;
      const updatedDate = new Date(cfg.updated_at || cfg.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      return `
        <div class="config-item-card ${isActive ? 'active-config' : ''}" data-config-id="${cfg.id}">
          <div class="config-item-info">
            <h5>${window.Utils.escapeHtml(cfg.configuration_name)} ${isActive ? '<span class="user-badge">Active</span>' : ''}</h5>
            <p>Last modified: ${updatedDate}</p>
          </div>
          <div class="config-item-actions">
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.handleLoadConfiguration(${cfg.id})">Load</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.handleDeleteConfiguration(${cfg.id})" style="color: #dc2626;">Delete</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    container.innerHTML = `
      <div class="config-empty-state" style="color: #dc2626;">
        <p>Failed to load configurations: ${err.message}</p>
      </div>
    `;
  }
}

// Global load configuration handler
window.handleLoadConfiguration = async function (configId) {
  try {
    const response = await window.ConfigurationsApi.getConfiguration(configId);
    if (!response || !response.configuration) {
      throw new Error("Configuration not found.");
    }

    const cfg = response.configuration;
    const configData = cfg.configuration_data;

    if (configData && window.state) {
      // 1. Restore complete state
      window.state.updateConfig(configData);

      // 2. Restore all sidebar controls
      if (window.controlsInstance) {
        window.controlsInstance.syncControls(window.state.getState());
      }

      // 3. Render live preview immediately
      if (window.previewInstance) {
        window.previewInstance.render();
      }

      closeModal("configurationsModal");

      if (window.Utils?.showToast) {
        window.Utils.showToast(`Loaded "${cfg.configuration_name}" successfully!`, "success");
      }
    }
  } catch (err) {
    if (window.Utils?.showToast) {
      window.Utils.showToast(err.message || "Failed to load configuration.", "error");
    }
  }
};

// Global delete configuration handler
window.handleDeleteConfiguration = async function (configId) {
  if (!confirm("Are you sure you want to delete this saved configuration?")) return;

  try {
    await window.ConfigurationsApi.deleteConfiguration(configId);
    if (window.Utils?.showToast) {
      window.Utils.showToast("Configuration deleted.", "info");
    }
    await loadAndRenderConfigurations();
  } catch (err) {
    if (window.Utils?.showToast) {
      window.Utils.showToast(err.message || "Failed to delete configuration.", "error");
    }
  }
};

/* =========================================================
   GLOBAL FORM SUBMIT HANDLER (AUTHENTICATION & REDIRECTION)
========================================================= */
window.handleAuthSubmit = async function (event, pageType) {
  if (event && event.preventDefault) event.preventDefault();
  
  // Guard against duplicate rapid submissions
  if (window._isAuthSubmitting) return;
  window._isAuthSubmitting = true;

  const config = window.state ? window.state.getState() : (window.config || {});
  let targetRedirectUrl = config.urls?.redirectUrl || "https://customerwebsite.com/dashboard";

  const form = (event && event.target && event.target.tagName === "FORM") 
    ? event.target 
    : (event?.target?.closest ? event.target.closest("form") : document.querySelector(".auth-main-form"));
    
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    if (window.AuthController) {
      if (pageType === "login") {
        const identifier = form?.querySelector("#loginIdentifier")?.value?.trim() || "";
        const password = form?.querySelector("#loginPassword")?.value || "";

        if (!identifier) {
          throw new Error("Please enter your username, email, or mobile number.");
        }
        if (config.pages?.login?.passwordEnabled !== false && !password) {
          throw new Error("Please enter your password.");
        }

        let result = null;
        const configId = window.ConfigurationsApi?.activeConfigId || config.id || null;
        
        result = await window.AuthController.loginUser({ identifier, password, configuration_id: configId });

        if (result && result.redirect_url) {
          targetRedirectUrl = result.redirect_url;
        }

        const successMsg = `${result?.message || "Login successful."} Redirect destination: ${targetRedirectUrl}`;
        if (window.Utils && typeof window.Utils.showToast === "function") {
          window.Utils.showToast(successMsg, "success", 3000);
        }

        if (window.Utils && typeof window.Utils.redirectAfterSuccess === "function") {
          window.Utils.redirectAfterSuccess(targetRedirectUrl, 600);
        }

      } else if (pageType === "signup") {
        const fullName = form?.querySelector("#signupName")?.value?.trim() || "User";
        const email = form?.querySelector("#signupEmail")?.value?.trim() || "";
        const password = form?.querySelector("#signupPassword")?.value || "";
        const confirmPassword = form?.querySelector("#signupConfirmPassword")?.value || "";
        const mobile = form?.querySelector("#signupMobile")?.value?.trim() || "";

        if (config.pages?.signup?.fields?.fullName && !fullName) {
          throw new Error("Please enter your full name.");
        }
        if (config.pages?.signup?.fields?.email && (!email || (window.AuthController.validateEmail && !window.AuthController.validateEmail(email)))) {
          throw new Error("Please enter a valid email address.");
        }
        if (config.pages?.signup?.fields?.password) {
          if (window.AuthController && typeof window.AuthController.validatePasswordPolicy === "function") {
            const valRes = window.AuthController.validatePasswordPolicy(password, config.passwordPolicy || {}, { username: email ? email.split("@")[0] : "", email });
            if (!valRes.valid) {
              throw new Error(valRes.message);
            }
          } else if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters.");
          }
        }
        if (config.pages?.signup?.fields?.confirmPassword && password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const username = email ? email.split("@")[0] : `user_${Date.now()}`;
        const configId = window.ConfigurationsApi?.activeConfigId || config.id || null;
        
        const result = await window.AuthController.registerUser({
          full_name: fullName,
          username,
          email,
          password,
          mobile,
          configuration_id: configId
        });

        if (result && result.redirect_url) {
          targetRedirectUrl = result.redirect_url;
        }

        const successMsg = `${result?.message || "Account created successfully."} Redirect destination: ${targetRedirectUrl}`;
        if (window.Utils && typeof window.Utils.showToast === "function") {
          window.Utils.showToast(successMsg, "success", 3000);
        }

        if (window.Utils && typeof window.Utils.redirectAfterSuccess === "function") {
          window.Utils.redirectAfterSuccess(targetRedirectUrl, 600);
        }

      } else if (pageType === "forgotPassword") {
        const identifier = form?.querySelector("#forgotIdentifier")?.value?.trim() || "";
        if (!identifier) {
          throw new Error("Please enter your email or username.");
        }
        
        const result = await window.AuthController.requestPasswordReset(identifier);

        const msg = result?.message || "Password reset link sent to your registered contact.";
        if (window.Utils && typeof window.Utils.showToast === "function") {
          window.Utils.showToast(msg, "success", 4000);
        }
        if (submitBtn) {
          submitBtn.disabled = false;
        }

      } else if (pageType === "otp") {
        let otpValue = "";
        const otpBoxes = form ? form.querySelectorAll(".otp-digit-box") : document.querySelectorAll(".otp-digit-box");
        if (otpBoxes && otpBoxes.length > 0) {
          otpValue = Array.from(otpBoxes).map(b => b.value || "").join("");
        }

        const identifier = (window.state && window.state.get("auth")?.identifier) || "user";
        const configId = window.ConfigurationsApi?.activeConfigId || config.id || null;

        const result = await window.AuthController.verifyOtp(identifier, otpValue, "login", configId);

        if (result && result.redirect_url) {
          targetRedirectUrl = result.redirect_url;
        }

        const successMsg = `OTP verified successfully. Redirect destination: ${targetRedirectUrl}`;
        if (window.Utils && typeof window.Utils.showToast === "function") {
          window.Utils.showToast(successMsg, "success", 3000);
        }

        if (window.Utils && typeof window.Utils.redirectAfterSuccess === "function") {
          window.Utils.redirectAfterSuccess(targetRedirectUrl, 600);
        }
      }
    }
  } catch (err) {
    if (window.Utils && typeof window.Utils.showToast === "function") {
      window.Utils.showToast(err.message || "Invalid OTP. Please try again.", "error", 4000);
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  } finally {
    window._isAuthSubmitting = false;
  }
};

/* =========================================================
   STARTUP CONFIGURATION RESTORATION
========================================================= */
async function loadSavedConfigurationOnStartup() {
  if (!window.ConfigurationsApi) return;
  try {
    const res = await window.ConfigurationsApi.getCurrentConfiguration();
    if (res && res.configuration) {
      const config = res.configuration;
      window.ConfigurationsApi.activeConfigId = config.id;
      window.ConfigurationsApi.activeConfigName = config.configuration_name || "Default Auth Experience";
      if (config.configuration_data && window.state && typeof window.state.loadState === "function") {
        window.state.loadState(config.configuration_data);
        if (window.controlsInstance) {
          window.controlsInstance.syncControls(window.state.getState());
        }
        if (window.previewInstance) {
          window.previewInstance.render();
        }
        console.log(`[Startup] Loaded active configuration: ID ${config.id} (${config.configuration_name})`);
      }
    }
  } catch (err) {
    console.log("[Startup] Startup configuration restoration skipped:", err.message);
  }
}