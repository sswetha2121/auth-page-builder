/* =========================================================
   AUTH PAGE BUILDER
   File: js/download.js

   Package Download Manager

   Generates a complete downloadable ZIP package containing:

   - index.html
   - CSS
   - JavaScript
   - Authentication configuration
   - Customized logo
   - Customized background
   - Selected/uploaded assets
   - README
========================================================= */


class DownloadManager {
  constructor(options = {}) {
    this.getConfig =
      typeof options.getConfig === "function"
        ? options.getConfig
        : () => options.config || {};

    this.projectName =
      options.projectName ||
      "my-custom-auth-page";

    this.onProgress =
      typeof options.onProgress === "function"
        ? options.onProgress
        : null;

    this.onComplete =
      typeof options.onComplete === "function"
        ? options.onComplete
        : null;

    this.onError =
      typeof options.onError === "function"
        ? options.onError
        : null;

    this.isDownloading = false;
  }


  /* =======================================================
     MAIN DOWNLOAD METHOD
  ======================================================= */

  async download() {
    if (this.isDownloading) {
      return;
    }

    if (
      typeof JSZip === "undefined"
    ) {
      const error =
        new Error(
          "JSZip is not loaded. Please include the JSZip library."
        );

      this.handleError(error);

      return;
    }

    try {
      this.isDownloading = true;

      this.emitProgress(
        "Preparing your authentication package...",
        5
      );

      const config =
        this.clone(
          this.getConfig()
        );

      const zip =
        new JSZip();

      const safeProjectName =
        this.getSafeProjectName(
          config
        );

      const root =
        zip.folder(
          safeProjectName
        );

      if (!root) {
        throw new Error(
          "Unable to create ZIP package."
        );
      }


      /* ===================================================
         CREATE FOLDERS
      =================================================== */

      const cssFolder =
        root.folder("css");

      const jsFolder =
        root.folder("js");

      const assetsFolder =
        root.folder("assets");

      if (
        !cssFolder ||
        !jsFolder ||
        !assetsFolder
      ) {
        throw new Error(
          "Unable to create package folders."
        );
      }


      this.emitProgress(
        "Processing customized assets...",
        15
      );


      /* ===================================================
         PROCESS ASSETS
      =================================================== */

      const assetMap =
        await this.processAssets(
          config,
          assetsFolder
        );


      this.emitProgress(
        "Generating authentication configuration...",
        35
      );


      /* ===================================================
         REPLACE ASSET REFERENCES
      =================================================== */

      const exportConfig =
        this.prepareExportConfig(
          config,
          assetMap
        );


      /* ===================================================
         CONFIG FILE
      =================================================== */

      jsFolder.file(
        "auth-config.js",
        this.generateConfigFile(
          exportConfig
        )
      );


      this.emitProgress(
        "Generating HTML...",
        45
      );


      /* ===================================================
         INDEX HTML
      =================================================== */

      root.file(
        "index.html",
        this.generateHTML(
          exportConfig
        )
      );


      this.emitProgress(
        "Generating CSS...",
        55
      );


      /* ===================================================
         AUTH PAGE CSS
      =================================================== */

      cssFolder.file(
        "auth-page.css",
        this.generateAuthCSS()
      );


      cssFolder.file(
        "responsive.css",
        this.generateResponsiveCSS()
      );


      this.emitProgress(
        "Generating authentication functionality...",
        70
      );


      /* ===================================================
         AUTH PAGE JAVASCRIPT
      =================================================== */

      jsFolder.file(
        "auth-page.js",
        this.generateAuthPageJS()
      );


      jsFolder.file(
        "main.js",
        this.generateMainJS()
      );


      this.emitProgress(
        "Generating project documentation...",
        80
      );


      /* ===================================================
         README
      =================================================== */

      root.file(
        "README.md",
        this.generateReadme(
          safeProjectName,
          exportConfig
        )
      );


      this.emitProgress(
        "Building ZIP file...",
        88
      );


      /* ===================================================
         CREATE ZIP BLOB
      =================================================== */

      const blob =
        await zip.generateAsync(
          {
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
              level: 6
            }
          },
          (metadata) => {
            const progress =
              Math.round(
                88 +
                  metadata.percent * 0.12
              );

            this.emitProgress(
              "Creating downloadable ZIP...",
              progress
            );
          }
        );


      this.emitProgress(
        "Starting download...",
        100
      );


      /* ===================================================
         BROWSER DOWNLOAD
      =================================================== */

      const fileName =
        `${safeProjectName}.zip`;

      this.triggerBrowserDownload(
        blob,
        fileName
      );


      this.isDownloading = false;

      this.emitProgress(
        "Package downloaded successfully.",
        100
      );


      if (this.onComplete) {
        this.onComplete({
          fileName,
          config: exportConfig
        });
      }

    } catch (error) {
      this.isDownloading = false;

      this.handleError(error);
    }
  }


  /* =======================================================
     PROCESS ASSETS
  ======================================================= */

  async processAssets(
    config,
    assetsFolder
  ) {
    const assetMap = {
      background: "",
      logo: ""
    };


    /* =====================================================
       BACKGROUND
    ===================================================== */

    const backgroundImage =
      config?.background?.image;

    if (backgroundImage) {
      const backgroundFileName =
        await this.addAsset(
          assetsFolder,
          backgroundImage,
          "background"
        );

      if (backgroundFileName) {
        assetMap.background =
          `assets/${backgroundFileName}`;
      }
    }


    /* =====================================================
       LOGO
    ===================================================== */

    const logo =
      config?.branding?.logo;

    if (logo) {
      const logoFileName =
        await this.addAsset(
          assetsFolder,
          logo,
          "logo"
        );

      if (logoFileName) {
        assetMap.logo =
          `assets/${logoFileName}`;
      }
    }


    return assetMap;
  }


  /* =======================================================
     ADD ASSET TO ZIP
  ======================================================= */

  async addAsset(
    assetsFolder,
    source,
    name
  ) {
    if (!source) {
      return "";
    }


    /* =====================================================
       DATA URL
       Uploaded image stored in browser
    ===================================================== */

    if (
      source.startsWith(
        "data:"
      )
    ) {
      const asset =
        this.dataURLToBlob(
          source
        );

      const extension =
        this.getExtensionFromMimeType(
          asset.type
        );

      const fileName =
        `${name}.${extension}`;

      assetsFolder.file(
        fileName,
        asset.blob
      );

      return fileName;
    }


    /* =====================================================
       LOCAL / RELATIVE ASSET
       For project assets such as:
       assets/backgrounds/forest.jpg
    ===================================================== */

    if (
      !source.startsWith("http")
    ) {
      try {
        const response =
          await fetch(source);

        if (!response.ok) {
          throw new Error(
            `Unable to load asset: ${source}`
          );
        }

        const blob =
          await response.blob();

        const extension =
          this.getExtensionFromMimeType(
            blob.type,
            source
          );

        const fileName =
          `${name}.${extension}`;

        assetsFolder.file(
          fileName,
          blob
        );

        return fileName;

      } catch (error) {
        console.warn(
          "Asset could not be added:",
          source,
          error
        );

        return "";
      }
    }


    /* =====================================================
       REMOTE IMAGE URL
    ===================================================== */

    try {
      const response =
        await fetch(source);

      if (!response.ok) {
        throw new Error(
          "Unable to fetch remote asset."
        );
      }

      const blob =
        await response.blob();

      const extension =
        this.getExtensionFromMimeType(
          blob.type,
          source
        );

      const fileName =
        `${name}.${extension}`;

      assetsFolder.file(
        fileName,
        blob
      );

      return fileName;

    } catch (error) {
      console.warn(
        "Remote asset could not be included:",
        source,
        error
      );

      return "";
    }
  }


  /* =======================================================
     DATA URL TO BLOB
  ======================================================= */

  dataURLToBlob(dataURL) {
    const parts =
      dataURL.split(",");

    const metadata =
      parts[0];

    const data =
      parts[1];

    const mimeMatch =
      metadata.match(
        /data:(.*?);base64/
      );

    const mimeType =
      mimeMatch
        ? mimeMatch[1]
        : "image/png";

    const binary =
      atob(data);

    const array =
      new Uint8Array(
        binary.length
      );

    for (
      let i = 0;
      i < binary.length;
      i++
    ) {
      array[i] =
        binary.charCodeAt(i);
    }

    return {
      blob: new Blob(
        [array],
        {
          type: mimeType
        }
      ),

      type: mimeType
    };
  }


  /* =======================================================
     PREPARE CONFIG FOR EXPORT
  ======================================================= */

  prepareExportConfig(
    config,
    assetMap
  ) {
    const exportConfig =
      this.clone(config);


    /* =====================================================
       BACKGROUND PATH
    ===================================================== */

    if (
      assetMap.background
    ) {
      exportConfig.background.image =
        assetMap.background;
    }


    /* =====================================================
       LOGO PATH
    ===================================================== */

    if (
      assetMap.logo
    ) {
      exportConfig.branding.logo =
        assetMap.logo;
    }


    return exportConfig;
  }


  /* =======================================================
     GENERATE CONFIG FILE
  ======================================================= */

  generateConfigFile(config) {
    return `/* =========================================================
   CUSTOM AUTHENTICATION CONFIGURATION

   Generated by Auth Page Builder

   You can manually modify this file.
========================================================= */

const authConfig = ${JSON.stringify(
  config,
  null,
  2
)};

window.authConfig = authConfig;
`;
  }


  /* =======================================================
     GENERATE HTML
  ======================================================= */

  generateHTML(config) {
    const projectTitle =
      config?.branding?.brandName ||
      "Authentication Page";

    return `<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="Custom authentication page"
  >

  <title>
    ${this.escapeHTML(projectTitle)}
  </title>

  <link
    rel="stylesheet"
    href="css/auth-page.css"
  >

  <link
    rel="stylesheet"
    href="css/responsive.css"
  >

</head>

<body>

  <!-- Authentication Application -->
  <main
    id="auth-app"
    class="auth-application"
  ></main>


  <!-- Configuration -->
  <script src="js/auth-config.js"></script>


  <!-- Authentication Page -->
  <script src="js/auth-page.js"></script>


  <!-- Application -->
  <script src="js/main.js"></script>

</body>

</html>`;
  }


  /* =======================================================
     AUTH PAGE CSS
  ======================================================= */

  generateAuthCSS() {
    return `/* =========================================================
   CUSTOM AUTHENTICATION PAGE
   Generated by Auth Page Builder
========================================================= */


* {
  box-sizing: border-box;
}


html,
body {
  width: 100%;
  min-height: 100%;
  margin: 0;
}


body {
  font-family:
    Inter,
    Arial,
    sans-serif;

  background:
    #f8fafc;
}


button,
input {
  font:
    inherit;
}


button {
  cursor:
    pointer;
}


.auth-application {
  width:
    100%;
  min-height:
    100vh;
}


/* =========================================================
   MAIN PAGE
========================================================= */

.auth-page {
  width:
    100%;
  min-height:
    100vh;

  display:
    flex;
}


/* =========================================================
   BACKGROUND PANEL
========================================================= */

.auth-background-panel {
  position:
    relative;

  width:
    50%;

  min-height:
    100vh;

  overflow:
    hidden;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;
}


.auth-background-overlay {
  position:
    absolute;

  inset:
    0;
}


.auth-background-content {
  position:
    relative;

  z-index:
    2;

  width:
    100%;

  padding:
    60px;

  color:
    white;
}


.background-branding {
  max-width:
    560px;
}


.background-branding h1 {
  margin:
    28px 0 14px;

  font-size:
    46px;

  line-height:
    1.1;
}


.background-branding p {
  margin:
    0;

  max-width:
    500px;

  font-size:
    18px;

  line-height:
    1.6;

  opacity:
    0.9;
}


/* =========================================================
   FORM PANEL
========================================================= */

.auth-form-panel {
  width:
    50%;

  min-height:
    100vh;

  padding:
    40px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #ffffff;
}


/* =========================================================
   CARD
========================================================= */

.auth-card {
  width:
    min(
      100%,
      var(--auth-card-width, 420px)
    );

  background:
    var(
      --auth-card-background,
      #ffffff
    );

  color:
    var(
      --auth-text-color,
      #0f172a
    );

  border-radius:
    var(
      --auth-card-radius,
      18px
    );

  padding:
    var(
      --auth-card-padding,
      42px
    );
}


.auth-card-transparent {
  background:
    transparent;

  box-shadow:
    none;
}


.auth-shadow-none {
  box-shadow:
    none;
}


.auth-shadow-small {
  box-shadow:
    0 10px 25px
    rgba(
      15,
      23,
      42,
      0.08
    );
}


.auth-shadow-medium {
  box-shadow:
    0 24px 60px
    rgba(
      15,
      23,
      42,
      0.14
    );
}


.auth-shadow-large {
  box-shadow:
    0 30px 80px
    rgba(
      15,
      23,
      42,
      0.2
    );
}


/* =========================================================
   BRANDING
========================================================= */

.auth-form-branding {
  margin-bottom:
    28px;
}


.auth-logo {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  width:
    64px;

  height:
    64px;

  overflow:
    hidden;

  background:
    var(
      --auth-primary,
      #2563eb
    );

  color:
    white;

  font-weight:
    800;

  letter-spacing:
    0.04em;
}


.auth-logo img {
  width:
    100%;

  height:
    100%;

  object-fit:
    cover;
}


.auth-logo-circle {
  border-radius:
    50%;
}


.auth-logo-square {
  border-radius:
    12px;
}


.auth-logo-ellipse {
  width:
    92px;

  border-radius:
    999px;
}


.auth-logo-position-center {
  display:
    flex;

  justify-content:
    center;
}


.auth-logo-position-right {
  display:
    flex;

  justify-content:
    flex-end;
}


/* =========================================================
   HEADING
========================================================= */

.auth-form-heading {
  margin-bottom:
    28px;
}


.auth-form-heading h2 {
  margin:
    0 0 10px;

  font-size:
    var(
      --auth-title-size,
      30px
    );

  line-height:
    1.2;
}


.auth-form-heading p {
  margin:
    0;

  font-size:
    var(
      --auth-subtitle-size,
      14px
    );

  line-height:
    1.6;

  color:
    var(
      --auth-muted-text,
      #64748b
    );
}


/* =========================================================
   FORM
========================================================= */

.auth-form {
  display:
    flex;

  flex-direction:
    column;

  gap:
    18px;
}


.auth-form-group {
  display:
    flex;

  flex-direction:
    column;

  gap:
    8px;
}


.auth-label {
  font-size:
    14px;

  font-weight:
    600;
}


.auth-input {
  width:
    100%;

  height:
    50px;

  padding:
    0 15px;

  border:
    1px solid
    var(
      --auth-input-border,
      #cbd5e1
    );

  border-radius:
    10px;

  outline:
    none;

  background:
    var(
      --auth-input-background,
      #ffffff
    );

  color:
    var(
      --auth-input-text,
      #0f172a
    );

  transition:
    0.2s ease;
}


.auth-input:focus {
  border-color:
    var(
      --auth-primary,
      #2563eb
    );

  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(
        --auth-primary,
        #2563eb
      )
      15%,
      transparent
    );
}


.auth-password-wrapper {
  position:
    relative;
}


.auth-password-wrapper .auth-input {
  padding-right:
    72px;
}


.auth-password-toggle {
  position:
    absolute;

  top:
    50%;

  right:
    10px;

  transform:
    translateY(-50%);

  border:
    none;

  background:
    transparent;

  color:
    var(
      --auth-link-color,
      #2563eb
    );

  font-size:
    13px;

  font-weight:
    600;
}


/* =========================================================
   IDENTIFIER SELECTOR
========================================================= */

.auth-identifier-selector {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(120px, 1fr)
    );

  gap:
    10px;
}


.auth-identifier-option {
  min-height:
    44px;

  padding:
    10px;

  border:
    1px solid
    var(
      --auth-input-border,
      #cbd5e1
    );

  border-radius:
    10px;

  background:
    white;

  color:
    var(
      --auth-muted-text,
      #64748b
    );
}


.auth-identifier-option.active {
  border-color:
    var(
      --auth-primary,
      #2563eb
    );

  background:
    var(
      --auth-primary,
      #2563eb
    );

  color:
    white;
}


/* =========================================================
   LOGIN OPTIONS
========================================================= */

.auth-login-options {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;
}


.auth-checkbox-label {
  display:
    inline-flex;

  align-items:
    center;

  gap:
    8px;

  color:
    var(
      --auth-muted-text,
      #64748b
    );

  font-size:
    13px;
}


.auth-text-button {
  border:
    none;

  padding:
    0;

  background:
    transparent;

  color:
    var(
      --auth-link-color,
      #2563eb
    );

  font-weight:
    600;
}


/* =========================================================
   GET KEY
========================================================= */

.auth-get-key-section {
  display:
    flex;

  flex-direction:
    column;

  gap:
    10px;
}


.auth-get-key-header {
  font-size:
    14px;

  font-weight:
    600;
}


.auth-get-key-options {
  display:
    grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(140px, 1fr)
    );

  gap:
    10px;
}


.auth-get-key-option {
  min-height:
    46px;

  border:
    1px solid
    var(
      --auth-input-border,
      #cbd5e1
    );

  border-radius:
    10px;

  background:
    white;
}


/* =========================================================
   BUTTON
========================================================= */

.auth-primary-button {
  width:
    100%;

  min-height:
    52px;

  border:
    none;

  border-radius:
    10px;

  background:
    var(
      --auth-primary,
      #2563eb
    );

  color:
    white;

  font-weight:
    700;

  transition:
    0.2s ease;
}


.auth-primary-button:hover {
  background:
    var(
      --auth-primary-hover,
      #1d4ed8
    );

  transform:
    translateY(-1px);
}


/* =========================================================
   OTP
========================================================= */

.auth-otp-container {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    8px;

  margin:
    25px 0;
}


.auth-otp-input {
  width:
    48px;

  height:
    54px;

  text-align:
    center;

  font-size:
    20px;

  border:
    1px solid
    var(
      --auth-input-border,
      #cbd5e1
    );

  border-radius:
    10px;

  outline:
    none;
}


/* =========================================================
   SOCIAL LOGIN
========================================================= */

.auth-social-section {
  margin-top:
    26px;
}


.auth-divider {
  position:
    relative;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  margin:
    20px 0;
}


.auth-divider::before {
  content:
    "";

  position:
    absolute;

  width:
    100%;

  height:
    1px;

  background:
    #e2e8f0;
}


.auth-divider span {
  position:
    relative;

  z-index:
    1;

  padding:
    0 12px;

  background:
    var(
      --auth-card-background,
      #ffffff
    );

  color:
    var(
      --auth-muted-text,
      #64748b
    );

  font-size:
    12px;
}


.auth-social-buttons {
  display:
    flex;

  flex-direction:
    column;

  gap:
    10px;
}


.auth-social-button {
  width:
    100%;

  min-height:
    48px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    10px;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    10px;

  background:
    white;

  font-weight:
    600;
}


.social-icon {
  width:
    24px;

  height:
    24px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  font-weight:
    800;
}


/* =========================================================
   PAGE SWITCH
========================================================= */

.auth-page-switch {
  display:
    flex;

  justify-content:
    center;

  gap:
    7px;

  margin-top:
    24px;

  font-size:
    14px;

  color:
    var(
      --auth-muted-text,
      #64748b
    );
}


.auth-back-button {
  margin-bottom:
    24px;

  border:
    none;

  padding:
    0;

  background:
    transparent;

  color:
    var(
      --auth-link-color,
      #2563eb
    );

  font-weight:
    600;
}
`;
  }


  /* =======================================================
     RESPONSIVE CSS
  ======================================================= */

  generateResponsiveCSS() {
    return `/* =========================================================
   RESPONSIVE AUTHENTICATION PAGE
========================================================= */


@media (
  max-width: 900px
) {

  .auth-page {
    min-height:
      100vh;

    flex-direction:
      column;
  }


  .auth-background-panel,
  .auth-form-panel {
    width:
      100%;
  }


  .auth-background-panel {
    min-height:
      280px;
  }


  .auth-form-panel {
    min-height:
      auto;

    padding:
      30px 20px 50px;
  }


  .auth-background-content {
    padding:
      35px 25px;
  }


  .background-branding h1 {
    font-size:
      34px;
  }
}


@media (
  max-width: 600px
) {

  .auth-form-panel {
    padding:
      20px 14px 35px;
  }


  .auth-card {
    width:
      100%;

    padding:
      26px 20px;

    border-radius:
      16px;
  }


  .auth-login-options {
    flex-direction:
      column;

    align-items:
      flex-start;
  }


  .auth-otp-input {
    width:
      42px;

    height:
      48px;
  }


  .background-branding h1 {
    font-size:
      30px;
  }


  .background-branding p {
    font-size:
      15px;
  }
}
`;
  }


  /* =======================================================
     AUTH PAGE JAVASCRIPT
  ======================================================= */

  generateAuthPageJS() {
    return `/* =========================================================
   CUSTOM AUTH PAGE
   Runtime Authentication UI
========================================================= */


class AuthPage {

  constructor(
    container,
    config
  ) {

    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    this.config =
      config;

    this.currentPage =
      config.page?.activePage ||
      "login";

    this.identifierType =
      "email";

    this.passwordVisible =
      false;

    this.render();
  }


  render() {

    if (!this.container) {
      return;
    }

    this.applyVariables();

    this.container.innerHTML =
      this.renderPage();

    this.attachEvents();
  }


  applyVariables() {

    const root =
      this.container;

    const config =
      this.config;

    root.style.setProperty(
      "--auth-primary",
      config.colors.primary
    );

    root.style.setProperty(
      "--auth-primary-hover",
      config.colors.primaryHover
    );

    root.style.setProperty(
      "--auth-card-background",
      config.card.backgroundColor
    );

    root.style.setProperty(
      "--auth-text-color",
      config.card.textColor
    );

    root.style.setProperty(
      "--auth-input-background",
      config.colors.inputBackground
    );

    root.style.setProperty(
      "--auth-input-border",
      config.colors.inputBorder
    );

    root.style.setProperty(
      "--auth-input-text",
      config.colors.inputText
    );

    root.style.setProperty(
      "--auth-muted-text",
      config.colors.mutedText
    );

    root.style.setProperty(
      "--auth-link-color",
      config.colors.linkColor
    );

    root.style.setProperty(
      "--auth-card-width",
      config.card.width + "px"
    );

    root.style.setProperty(
      "--auth-card-padding",
      config.card.padding + "px"
    );

    root.style.setProperty(
      "--auth-card-radius",
      config.card.borderRadius + "px"
    );

    root.style.setProperty(
      "--auth-title-size",
      config.typography.titleSize + "px"
    );

    root.style.setProperty(
      "--auth-subtitle-size",
      config.typography.subtitleSize + "px"
    );
  }


  renderPage() {

    const layout =
      this.config.layout;

    const background =
      this.renderBackground();

    const form =
      this.renderFormPanel();

    const content =
      layout.backgroundSide === "right"
        ? form + background
        : background + form;

    return \`
      <div class="auth-page">
        \${content}
      </div>
    \`;
  }


  renderBackground() {

    const background =
      this.config.background;

    const branding =
      this.config.branding;

    if (!background.showPanel) {
      return "";
    }

    let style =
      \`background:\${background.color};\`;

    if (background.type === "image" &&
        background.image) {

      style =
        \`
          background-image:
            url('\${background.image}');

          background-size:
            \${background.size};

          background-position:
            \${background.position};

          background-repeat:
            no-repeat;
        \`;
    }

    return \`
      <section
        class="auth-background-panel"
        style="\${style}"
      >

        <div
          class="auth-background-overlay"
          style="
            background:
              \${background.overlayColor};

            opacity:
              \${background.overlayOpacity};
          "
        ></div>

        <div class="auth-background-content">

          <div class="background-branding">

            \${branding.showLogo
              ? this.renderLogo()
              : ""
            }

            \${branding.showBrandName
              ? \`
                <h1>
                  \${branding.brandName}
                </h1>

                <p>
                  \${branding.subtitle}
                </p>
              \`
              : ""
            }

          </div>

        </div>

      </section>
    \`;
  }


  renderLogo() {

    const branding =
      this.config.branding;

    if (branding.logo) {

      return \`
        <div
          class="
            auth-logo
            auth-logo-\${branding.logoStyle}
          "
        >

          <img
            src="\${branding.logo}"
            alt="Logo"
          >

        </div>
      \`;
    }

    return \`
      <div
        class="
          auth-logo
          auth-logo-\${branding.logoStyle}
        "
      >

        <span>
          \${branding.logoText}
        </span>

      </div>
    \`;
  }


  renderFormPanel() {

    return \`
      <section class="auth-form-panel">

        <div
          class="
            auth-card
            auth-shadow-\${this.config.card.shadow}
          "
        >

          \${this.renderCurrentForm()}

        </div>

      </section>
    \`;
  }


  renderCurrentForm() {

    if (
      this.currentPage === "signup"
    ) {
      return this.renderSignup();
    }

    if (
      this.currentPage === "forgot"
    ) {
      return this.renderForgotPassword();
    }

    if (
      this.currentPage === "otp"
    ) {
      return this.renderOTP();
    }

    return this.renderLogin();
  }


  renderLogin() {

    const login =
      this.config.login;

    return \`
      <div class="auth-form-content">

        <div class="auth-form-heading">

          <h2>
            Welcome back
          </h2>

          <p>
            Login to access your account
          </p>

        </div>


        <form id="login-form">

          <div class="auth-form-group">

            <label class="auth-label">
              \${this.identifierType === "email"
                ? "Email Address"
                : "Mobile Number"
              }
            </label>

            <input
              class="auth-input"

              id="login-identifier"

              type="\${this.identifierType === "email"
                ? "email"
                : "tel"
              }"

              placeholder="\${this.identifierType === "email"
                ? "Enter your email address"
                : "Enter your mobile number"
              }"
            >

          </div>


          \${login.showIdentifierSelector
            ? this.renderIdentifierSelector()
            : ""
          }


          \${this.renderAuthenticationMethod()}


          <div class="auth-login-options">

            \${login.showRememberMe
              ? \`
                <label class="auth-checkbox-label">

                  <input
                    type="checkbox"
                  >

                  <span>
                    Remember me
                  </span>

                </label>
              \`
              : ""
            }


            \${login.showForgotPassword
              ? \`
                <button
                  type="button"

                  class="auth-text-button"

                  data-page="forgot"
                >
                  Forgot password?
                </button>
              \`
              : ""
            }

          </div>


          <button
            class="auth-primary-button"
            type="submit"
          >
            \${login.loginButtonText}
          </button>

        </form>


        \${this.renderSocialLogin()}


        \${this.config.signup.enabled
          ? \`
            <div class="auth-page-switch">

              <span>
                Don't have an account?
              </span>

              <button
                class="auth-text-button"
                type="button"
                data-page="signup"
              >
                Create Account
              </button>

            </div>
          \`
          : ""
        }

      </div>
    \`;
  }


  renderIdentifierSelector() {

    return \`
      <div class="auth-identifier-selector">

        <button
          type="button"

          class="
            auth-identifier-option
            \${this.identifierType === "email"
              ? "active"
              : ""
            }
          "

          data-identifier="email"
        >
          Email
        </button>

        <button
          type="button"

          class="
            auth-identifier-option
            \${this.identifierType === "mobile"
              ? "active"
              : ""
            }
          "

          data-identifier="mobile"
        >
          Mobile Number
        </button>

      </div>
    \`;
  }


  renderAuthenticationMethod() {

    const login =
      this.config.login;

    if (
      login.defaultAuthentication === "otp" &&
      login.authenticationMethods.otp
    ) {

      return \`
        <div class="auth-get-key-section">

          <div class="auth-get-key-header">
            Get key from
          </div>

          <button
            type="button"

            class="auth-get-key-option"

            data-page="otp"
          >
            Email / SMS OTP
          </button>

        </div>
      \`;
    }

    return \`
      <div class="auth-form-group">

        <label class="auth-label">
          Password
        </label>

        <div class="auth-password-wrapper">

          <input
            class="auth-input"

            id="login-password"

            type="\${this.passwordVisible
              ? "text"
              : "password"
            }"

            placeholder="Enter your password"
          >

          <button
            type="button"

            class="auth-password-toggle"

            id="password-toggle"
          >
            \${this.passwordVisible
              ? "Hide"
              : "Show"
            }
          </button>

        </div>

      </div>
    \`;
  }


  renderSignup() {

    const fields =
      this.config.signup.fields;

    return \`
      <button
        type="button"

        class="auth-back-button"

        data-page="login"
      >
        ← Back
      </button>


      <div class="auth-form-heading">

        <h2>
          Create your account
        </h2>

        <p>
          Fill in your details to get started
        </p>

      </div>


      <form id="signup-form">

        \${fields.username
          ? this.renderInput(
              "username",
              "Username",
              "Enter your username",
              "text"
            )
          : ""
        }

        \${fields.email
          ? this.renderInput(
              "email",
              "Email Address",
              "Enter your email",
              "email"
            )
          : ""
        }

        \${fields.mobile
          ? this.renderInput(
              "mobile",
              "Mobile Number",
              "Enter your mobile number",
              "tel"
            )
          : ""
        }

        \${fields.password
          ? this.renderInput(
              "password",
              "Password",
              "Create password",
              "password"
            )
          : ""
        }

        \${fields.confirmPassword
          ? this.renderInput(
              "confirm-password",
              "Confirm Password",
              "Confirm password",
              "password"
            )
          : ""
        }

        <button
          class="auth-primary-button"
          type="submit"
        >
          \${this.config.signup.buttonText}
        </button>

      </form>


      <div class="auth-page-switch">

        <span>
          Already have an account?
        </span>

        <button
          class="auth-text-button"
          type="button"
          data-page="login"
        >
          Login
        </button>

      </div>
    \`;
  }


  renderInput(
    id,
    label,
    placeholder,
    type
  ) {

    return \`
      <div class="auth-form-group">

        <label class="auth-label">
          \${label}
        </label>

        <input
          class="auth-input"

          id="\${id}"

          type="\${type}"

          placeholder="\${placeholder}"
        >

      </div>
    \`;
  }


  renderForgotPassword() {

    return \`
      <button
        type="button"

        class="auth-back-button"

        data-page="login"
      >
        ← Back to login
      </button>


      <div class="auth-form-heading">

        <h2>
          Forgot password?
        </h2>

        <p>
          Enter your email or mobile number
          to receive a verification key.
        </p>

      </div>


      <form id="forgot-form">

        <div class="auth-form-group">

          <label class="auth-label">
            Email or Mobile Number
          </label>

          <input
            class="auth-input"

            type="text"

            placeholder="
              Enter email or mobile number
            "
          >

        </div>

        <button
          class="auth-primary-button"
          type="submit"
        >
          Send Verification Key
        </button>

      </form>
    \`;
  }


  renderOTP() {

    const length =
      this.config.login.otpLength || 6;

    let inputs =
      "";

    for (
      let index = 0;
      index < length;
      index++
    ) {

      inputs += \`
        <input
          type="text"

          maxlength="1"

          inputmode="numeric"

          class="auth-otp-input"
        >
      \`;
    }

    return \`
      <button
        type="button"

        class="auth-back-button"

        data-page="login"
      >
        ← Back to login
      </button>


      <div class="auth-form-heading">

        <h2>
          Verify your account
        </h2>

        <p>
          Enter the verification code
          sent to you.
        </p>

      </div>


      <div class="auth-otp-container">

        \${inputs}

      </div>


      <button
        class="auth-primary-button"
        type="button"
      >
        Verify
      </button>
    \`;
  }


  renderSocialLogin() {

    const social =
      this.config.social;

    if (!social.enabled) {
      return "";
    }

    let buttons =
      "";

    if (
      social.providers.google
    ) {

      buttons += \`
        <button
          class="auth-social-button"
          type="button"
        >
          G
          Continue with Google
        </button>
      \`;
    }

    if (
      social.providers.facebook
    ) {

      buttons += \`
        <button
          class="auth-social-button"
          type="button"
        >
          f
          Continue with Facebook
        </button>
      \`;
    }

    if (
      social.providers.apple
    ) {

      buttons += \`
        <button
          class="auth-social-button"
          type="button"
        >
          
          Continue with Apple
        </button>
      \`;
    }

    if (!buttons) {
      return "";
    }

    return \`
      <div class="auth-social-section">

        <div class="auth-divider">

          <span>
            \${social.title}
          </span>

        </div>

        <div class="auth-social-buttons">

          \${buttons}

        </div>

      </div>
    \`;
  }


  attachEvents() {

    this.container
      .querySelectorAll(
        "[data-page]"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            this.currentPage =
              button.dataset.page;

            this.render();
          }
        );
      });


    this.container
      .querySelectorAll(
        "[data-identifier]"
      )
      .forEach((button) => {

        button.addEventListener(
          "click",
          () => {

            this.identifierType =
              button.dataset.identifier;

            this.render();
          }
        );
      });


    const passwordToggle =
      this.container.querySelector(
        "#password-toggle"
      );

    if (passwordToggle) {

      passwordToggle.addEventListener(
        "click",
        () => {

          this.passwordVisible =
            !this.passwordVisible;

          this.render();
        }
      );
    }


    const loginForm =
      this.container.querySelector(
        "#login-form"
      );

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          console.log(
            "Login submitted"
          );
        }
      );
    }


    const signupForm =
      this.container.querySelector(
        "#signup-form"
      );

    if (signupForm) {

      signupForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          console.log(
            "Signup submitted"
          );
        }
      );
    }


    const forgotForm =
      this.container.querySelector(
        "#forgot-form"
      );

    if (forgotForm) {

      forgotForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();

          this.currentPage =
            "otp";

          this.render();
        }
      );
    }
  }
}


window.AuthPage =
  AuthPage;
`;
  }


  /* =======================================================
     MAIN JAVASCRIPT
  ======================================================= */

  generateMainJS() {
    return `/* =========================================================
   AUTHENTICATION PAGE INITIALIZATION
========================================================= */


document.addEventListener(
  "DOMContentLoaded",
  () => {

    const app =
      document.querySelector(
        "#auth-app"
      );

    if (!app) {
      return;
    }


    const authPage =
      new AuthPage(
        app,
        window.authConfig
      );


    window.authPage =
      authPage;


    /* =====================================================
       BACKEND INTEGRATION EXAMPLE

       Replace these events with your API calls.

       Example:

       fetch("/api/login", {
         method: "POST",
         headers: {
           "Content-Type":
             "application/json"
         },
         body:
           JSON.stringify(data)
       });

    ===================================================== */
  }
);
`;
  }


  /* =======================================================
     README
  ======================================================= */

  generateReadme(
    projectName,
    config
  ) {
    return `# ${projectName}

This authentication page was generated using the Auth Page Builder.

## Included Features

- Customized login page
- Email login
- Mobile number login
- Password authentication
- OTP authentication
- OTP verification screen
- Forgot password screen
- Signup screen
- Username field
- Email field
- Mobile number field
- Password field
- Confirm password field
- Social login UI
- Customized logo
- Customized background
- Responsive desktop layout
- Responsive mobile layout

## Folder Structure

\`\`\`
${projectName}/

├── index.html
│
├── css/
│   ├── auth-page.css
│   └── responsive.css
│
├── js/
│   ├── auth-config.js
│   ├── auth-page.js
│   └── main.js
│
└── assets/
    ├── background.*
    └── logo.*
\`\`\`

## How To Use

Open \`index.html\` in a browser.

For production use:

1. Copy the HTML, CSS and JavaScript files into your project.
2. Keep the \`assets\` folder.
3. Connect login/signup forms to your backend API.
4. Replace the example form handlers with your authentication API endpoints.

## Configuration

All generated customization settings are stored in:

\`\`\`
js/auth-config.js
\`\`\`

You can modify:

- Colors
- Fonts
- Logo
- Background
- Layout
- Login settings
- Signup fields
- OTP settings
- Social login visibility

## Backend Integration

The generated package contains the complete frontend authentication UI.

To make authentication fully functional, connect the forms to your backend:

\`\`\`javascript
fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});
\`\`\`

## Generated Configuration

Primary color: ${config?.colors?.primary || "Default"}

Background type: ${config?.background?.type || "Default"}

Authentication mode: ${
  config?.login?.defaultAuthentication ||
  "Password"
}

OTP enabled: ${
  config?.login?.authenticationMethods?.otp
    ? "Yes"
    : "No"
}

Password enabled: ${
  config?.login?.authenticationMethods?.password
    ? "Yes"
    : "No"
}
`;
  }


  /* =======================================================
     TRIGGER BROWSER DOWNLOAD
  ======================================================= */

  triggerBrowserDownload(
    blob,
    fileName
  ) {
    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      fileName;

    link.style.display =
      "none";

    document.body.appendChild(
      link
    );

    link.click();


    setTimeout(
      () => {

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );
  }


  /* =======================================================
     SAFE PROJECT NAME
  ======================================================= */

  getSafeProjectName(config) {
    const source =
      config?.project?.name ||
      config?.branding?.brandName ||
      this.projectName;

    return (
      source
        .toLowerCase()
        .trim()
        .replace(
          /[^a-z0-9]+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        ) ||
      "my-custom-auth-page"
    );
  }


  /* =======================================================
     MIME TYPE TO EXTENSION
  ======================================================= */

  getExtensionFromMimeType(
    mimeType,
    source = ""
  ) {
    const mimeMap = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg"
    };

    if (
      mimeMap[mimeType]
    ) {
      return mimeMap[mimeType];
    }

    const match =
      source.match(
        /\.([a-zA-Z0-9]+)(?:\?|$)/
      );

    if (match) {
      return match[1];
    }

    return "png";
  }


  /* =======================================================
     PROGRESS
  ======================================================= */

  emitProgress(
    message,
    percentage
  ) {
    if (this.onProgress) {
      this.onProgress({
        message,
        percentage
      });
    }

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:download-progress",
        {
          detail: {
            message,
            percentage
          }
        }
      )
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  handleError(error) {
    console.error(
      "Download failed:",
      error
    );

    if (this.onError) {
      this.onError(error);
    }

    alert(
      `Unable to create package: ${error.message}`
    );
  }


  /* =======================================================
     ESCAPE HTML
  ======================================================= */

  escapeHTML(value) {
    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      String(
        value || ""
      );

    return div.innerHTML;
  }


  /* =======================================================
     CLONE
  ======================================================= */

  clone(value) {
    if (
      value === undefined
    ) {
      return undefined;
    }

    return JSON.parse(
      JSON.stringify(value)
    );
  }
}


/* =========================================================
   GLOBAL EXPORT
========================================================= */

window.DownloadManager =
  DownloadManager;