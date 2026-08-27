/* =========================================================
   AUTH PAGE BUILDER
   File: js/renderer.js

   Central Render Coordinator

   Responsibilities:
   - Coordinate rendering between state and preview
   - Prevent duplicate render loops
   - Render updated customer configuration
   - Handle Login / Signup / Forgot Password / OTP pages
   - Sync layout and customization updates
   - Expose compatibility functions for other JS files
========================================================= */

class AuthPageRenderer {
  constructor() {
    this.isRendering = false;
    this.renderQueued = false;

    this.previewSelector =
      "#previewRoot";

    this.initialized = false;

    this.init();
  }


  /* =======================================================
     INITIALIZATION
  ======================================================= */

  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    this.bindEvents();

    this.waitForPreviewManager();
  }


  /* =======================================================
     WAIT FOR PREVIEW
  ======================================================= */

  waitForPreviewManager() {
    let attempts = 0;

    const maxAttempts = 50;

    const timer =
      setInterval(() => {

        attempts += 1;

        if (
          window.previewManager &&
          typeof window.previewManager.render ===
            "function"
        ) {
          clearInterval(timer);

          this.render();

          return;
        }

        if (
          attempts >= maxAttempts
        ) {
          clearInterval(timer);

          console.warn(
            "PreviewManager was not initialized."
          );
        }

      }, 100);
  }


  /* =======================================================
     EVENTS
  ======================================================= */

  bindEvents() {

    /*
      Configuration update events
    */

    const renderEvents = [
      "auth-builder:config-updated",
      "auth-builder:state-updated",
      "auth-builder:customization-updated",
      "auth-builder:layout-updated",
      "auth-builder:branding-updated",
      "auth-builder:background-updated",
      "auth-builder:page-config-updated"
    ];

    renderEvents.forEach(
      (eventName) => {

        document.addEventListener(
          eventName,
          () => {
            this.requestRender();
          }
        );

      }
    );


    /*
      Page changed
    */

    document.addEventListener(
      "auth-builder:page-changed",
      () => {
        this.requestRender();
      }
    );


    /*
      Preview refresh request
    */

    document.addEventListener(
      "auth-builder:rerender-preview",
      () => {
        this.requestRender();
      }
    );


    /*
      Layout refresh
    */

    document.addEventListener(
      "auth-builder:layout-changed",
      () => {
        this.requestRender();
      }
    );


    /*
      Browser resize
    */

    window.addEventListener(
      "resize",
      () => {
        this.applyResponsivePreview();
      }
    );
  }


  /* =======================================================
     REQUEST RENDER

     Prevents many events from creating multiple renders.
  ======================================================= */

  requestRender() {
    if (this.renderQueued) {
      return;
    }

    this.renderQueued = true;

    requestAnimationFrame(
      () => {

        this.renderQueued =
          false;

        this.render();
      }
    );
  }


  /* =======================================================
     MAIN RENDER
  ======================================================= */

  render() {
    if (this.isRendering) {
      return;
    }

    this.isRendering =
      true;

    try {

      /*
        PreviewManager owns the actual
        HTML preview generation.
      */

      if (
        window.previewManager &&
        typeof window.previewManager.render ===
          "function"
      ) {

        window.previewManager.render();

      } else {

        console.warn(
          "PreviewManager is not available."
        );

      }


      /*
        Apply final layout classes
      */

      this.applyPreviewLayout();


      /*
        Apply responsive state
      */

      this.applyResponsivePreview();


      /*
        Notify other modules
      */

      document.dispatchEvent(
        new CustomEvent(
          "auth-builder:render-complete",
          {
            detail: {
              renderer: this
            }
          }
        )
      );

    } catch (error) {

      console.error(
        "Renderer error:",
        error
      );

    } finally {

      this.isRendering =
        false;
    }
  }


  /* =======================================================
     CONFIG
  ======================================================= */

  getConfig() {

    if (
      window.state &&
      typeof window.state.getConfig ===
        "function"
    ) {

      try {
        return (
          window.state.getConfig() ||
          {}
        );
      } catch (error) {}
    }


    if (
      window.state &&
      window.state.config
    ) {
      return window.state.config;
    }


    if (
      window.authBuilderState &&
      typeof window.authBuilderState.getConfig ===
        "function"
    ) {

      try {
        return (
          window.authBuilderState.getConfig() ||
          {}
        );
      } catch (error) {}
    }


    if (
      window.authBuilderConfig
    ) {
      return window.authBuilderConfig;
    }


    if (
      window.config
    ) {
      return window.config;
    }


    return {};
  }


  /* =======================================================
     PREVIEW ELEMENT
  ======================================================= */

  getPreviewElement() {

    return document.querySelector(
      this.previewSelector
    );

  }


  getPreviewRoot() {

    const preview =
      this.getPreviewElement();

    if (!preview) {
      return null;
    }

    return preview.querySelector(
      ".auth-preview-root"
    );

  }


  /* =======================================================
     LAYOUT
  ======================================================= */

  applyPreviewLayout() {

    const previewRoot =
      this.getPreviewRoot();

    if (!previewRoot) {
      return;
    }

    const config =
      this.getConfig();

    const layout =
      config.layout || {};


    /*
      Page layout
    */

    const pageLayout =
      this.normalizeLayout(
        layout.pageLayout ||
        layout.type ||
        "split"
      );


    /*
      Image width
    */

    const imageWidth =
      this.normalizeImageWidth(
        layout.imageWidth ||
        50
      );


    /*
      Form position
    */

    const formPosition =
      this.normalizeFormPosition(
        layout.formPosition ||
        "center"
      );


    /*
      Remove previous layout classes
    */

    [
      "preview-layout-split",
      "preview-layout-imageLeft",
      "preview-layout-imageRight",
      "preview-layout-full",
      "preview-layout-background",

      "preview-image-width-30",
      "preview-image-width-40",
      "preview-image-width-50",
      "preview-image-width-60",
      "preview-image-width-70",

      "preview-form-position-left",
      "preview-form-position-center",
      "preview-form-position-right",
      "preview-form-position-top",
      "preview-form-position-bottom",
      "preview-form-position-topLeft",
      "preview-form-position-topRight",
      "preview-form-position-bottomLeft",
      "preview-form-position-bottomRight"
    ].forEach(
      (className) => {
        previewRoot.classList.remove(
          className
        );
      }
    );


    /*
      Add current classes
    */

    previewRoot.classList.add(
      `preview-layout-${pageLayout}`
    );

    previewRoot.classList.add(
      `preview-image-width-${imageWidth}`
    );

    previewRoot.classList.add(
      `preview-form-position-${formPosition}`
    );
  }


  /* =======================================================
     NORMALIZE LAYOUT
  ======================================================= */

  normalizeLayout(value) {

    const normalized =
      String(value || "")
        .toLowerCase()
        .replace(
          /[\s_-]+/g,
          ""
        );

    const aliases = {

      split:
        "split",

      imageleft:
        "imageLeft",

      leftimage:
        "imageLeft",

      imageright:
        "imageRight",

      rightimage:
        "imageRight",

      full:
        "full",

      background:
        "background"
    };

    return (
      aliases[normalized] ||
      "split"
    );
  }


  /* =======================================================
     NORMALIZE IMAGE WIDTH
  ======================================================= */

  normalizeImageWidth(value) {

    const width =
      Number(
        String(value)
          .replace(
            /[^0-9.]/g,
            ""
          )
      );

    if (width <= 30) {
      return 30;
    }

    if (width <= 40) {
      return 40;
    }

    if (width <= 50) {
      return 50;
    }

    if (width <= 60) {
      return 60;
    }

    if (width <= 70) {
      return 70;
    }

    return 50;
  }


  /* =======================================================
     NORMALIZE FORM POSITION
  ======================================================= */

  normalizeFormPosition(value) {

    const normalized =
      String(value || "")
        .toLowerCase()
        .replace(
          /[\s_-]+/g,
          ""
        );

    const aliases = {

      left:
        "left",

      center:
        "center",

      right:
        "right",

      top:
        "top",

      bottom:
        "bottom",

      topleft:
        "topLeft",

      topright:
        "topRight",

      bottomleft:
        "bottomLeft",

      bottomright:
        "bottomRight"
    };

    return (
      aliases[normalized] ||
      "center"
    );
  }


  /* =======================================================
     RESPONSIVE PREVIEW
  ======================================================= */

  applyResponsivePreview() {

    const preview =
      this.getPreviewElement();

    if (!preview) {
      return;
    }


    /*
      PreviewManager controls
      desktop/tablet/mobile mode.
    */

    if (
      window.previewManager &&
      typeof window.previewManager
        .applyDeviceMode ===
        "function"
    ) {

      window.previewManager
        .applyDeviceMode();
    }
  }


  /* =======================================================
     PAGE SWITCHING
  ======================================================= */

  renderPage(pageName) {

    if (
      window.previewManager &&
      typeof window.previewManager
        .setPage ===
        "function"
    ) {

      window.previewManager
        .setPage(
          pageName
        );

      return;
    }


    this.updateCurrentPage(
      pageName
    );

    this.render();
  }


  updateCurrentPage(pageName) {

    if (
      window.state &&
      typeof window.state.set ===
        "function"
    ) {

      try {

        window.state.set(
          "currentPage",
          pageName
        );

      } catch (error) {}
    }


    if (
      window.state &&
      window.state.config
    ) {

      window.state.config.currentPage =
        pageName;
    }


    if (
      window.config
    ) {

      window.config.currentPage =
        pageName;
    }
  }


  /* =======================================================
     DEVICE SWITCHING
  ======================================================= */

  renderDevice(device) {

    if (
      window.previewManager &&
      typeof window.previewManager
        .setDevice ===
        "function"
    ) {

      window.previewManager
        .setDevice(
          device
        );

      return;
    }

    const preview =
      this.getPreviewElement();

    if (!preview) {
      return;
    }


    preview.classList.remove(
      "preview-mode-desktop",
      "preview-mode-tablet",
      "preview-mode-mobile"
    );


    preview.classList.add(
      `preview-mode-${device}`
    );
  }


  /* =======================================================
     CUSTOMIZATION
  ======================================================= */

  updateCustomization() {

    this.requestRender();

  }


  updateLayout() {

    this.requestRender();

  }


  updateBranding() {

    this.requestRender();

  }


  updateBackground() {

    this.requestRender();

  }


  updatePageConfiguration() {

    this.requestRender();

  }


  /* =======================================================
     FULLSCREEN SYNC
  ======================================================= */

  refreshFullscreen() {

    if (
      window.fullscreenManager &&
      typeof window.fullscreenManager
        .refresh ===
        "function"
    ) {

      window.fullscreenManager
        .refresh();
    }
  }


  /* =======================================================
     DESTROY
  ======================================================= */

  destroy() {

    this.isRendering =
      false;

    this.renderQueued =
      false;

    this.initialized =
      false;
  }
}


/* =========================================================
   GLOBAL CLASS
========================================================= */

window.AuthPageRenderer =
  AuthPageRenderer;


/* =========================================================
   GLOBAL INSTANCE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    window.authPageRenderer =
      new AuthPageRenderer();

  }
);


/* =========================================================
   GLOBAL COMPATIBILITY FUNCTIONS
========================================================= */


/*
  Render complete preview
*/

window.renderAuthPage =
  function () {

    if (
      window.authPageRenderer
    ) {

      window.authPageRenderer
        .render();
    }
  };


/*
  Refresh renderer
*/

window.refreshRenderer =
  window.renderAuthPage;


/*
  Render specific page
*/

window.renderPage =
  function (pageName) {

    if (
      window.authPageRenderer
    ) {

      window.authPageRenderer
        .renderPage(
          pageName
        );
    }
  };


/*
  Switch preview device
*/

window.renderPreviewDevice =
  function (device) {

    if (
      window.authPageRenderer
    ) {

      window.authPageRenderer
        .renderDevice(
          device
        );
    }
  };


/*
  Render Login
*/

window.renderLogin =
  function () {

    window.renderPage(
      "login"
    );

  };


/*
  Render Signup
*/

window.renderSignup =
  function () {

    window.renderPage(
      "signup"
    );

  };


/*
  Render Forgot Password
*/

window.renderForgotPassword =
  function () {

    window.renderPage(
      "forgotPassword"
    );

  };


/*
  Render OTP
*/

window.renderOTP =
  function () {

    window.renderPage(
      "otp"
    );

  };


/* =========================================================
   LISTEN FOR CUSTOMIZATION EVENTS
========================================================= */

[
  "auth-builder:config-updated",
  "auth-builder:state-updated",
  "auth-builder:customization-updated",
  "auth-builder:layout-updated",
  "auth-builder:branding-updated",
  "auth-builder:background-updated",
  "auth-builder:page-config-updated",
  "auth-builder:rerender-preview"
].forEach(
  (eventName) => {

    document.addEventListener(
      eventName,
      () => {

        if (
          window.authPageRenderer
        ) {

          window.authPageRenderer
            .requestRender();
        }

      }
    );

  }
);