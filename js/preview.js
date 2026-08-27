/* =========================================================
   AUTH PAGE BUILDER - LIVE PREVIEW ENGINE
   File: js/preview.js
========================================================= */


/* =========================================================
   RENDER PREVIEW
========================================================= */

function renderPreview(root) {
  if (!root || !window.config || !window.authTemplates) {
    return;
  }

  root.innerHTML = "";

  const previewApp = document.createElement("div");

  previewApp.className = "auth-preview-app";

  previewApp.dataset.page =
    config.currentPage;

  previewApp.dataset.layout =
    config.layout.type;

  previewApp.innerHTML = createPreviewShell();

  root.appendChild(previewApp);

  applyPreviewStyles(previewApp);

  initializePreviewInteractions(previewApp);
}


/* =========================================================
   CREATE MAIN PREVIEW SHELL
========================================================= */

function createPreviewShell() {
  const imageSection = createImageSection();

  const formSection = createFormSection();

  const layoutType =
    config.layout.type;

  if (layoutType === "split-right-image") {
    return `
      <div class="auth-preview-layout auth-preview-split">

        ${formSection}

        ${imageSection}

      </div>
    `;
  }

  if (layoutType === "centered") {
    return `
      <div class="auth-preview-layout auth-preview-centered">

        ${formSection}

      </div>
    `;
  }

  if (layoutType === "full-background") {
    return `
      <div class="auth-preview-layout auth-preview-full-background">

        ${formSection}

      </div>
    `;
  }

  return `
    <div class="auth-preview-layout auth-preview-split">

      ${imageSection}

      ${formSection}

    </div>
  `;
}


/* =========================================================
   CREATE IMAGE SECTION
========================================================= */

function createImageSection() {
  const image =
    getActiveBackgroundImage();

  return `
    <section
      class="auth-image-section"
      aria-label="Authentication background"
    >

      <div class="auth-image-overlay"></div>

      ${
        config.imageSection.showText
          ? `
            <div
              class="auth-image-content"
              data-image-text-position="${escapeAttribute(
                config.imageSection.textPosition
              )}"
            >

              <h2 class="auth-image-title">
                ${escapeHTML(
                  config.imageSection.text
                )}
              </h2>

            </div>
          `
          : ""
      }

    </section>
  `;
}


/* =========================================================
   CREATE FORM SECTION
========================================================= */

function createFormSection() {
  const pageTemplate =
    authTemplates.getPageTemplate(
      config.currentPage
    );

  return `
    <section class="auth-form-section">

      <div class="auth-form-alignment">

        <div class="auth-card">

          ${pageTemplate}

        </div>

      </div>

    </section>
  `;
}


/* =========================================================
   GET ACTIVE BACKGROUND
========================================================= */

function getActiveBackgroundImage() {
  const background =
    config.background;

  if (
    background.uploadedImage &&
    background.uploadedImage.trim() !== ""
  ) {
    return background.uploadedImage;
  }

  return background.image || "";
}


/* =========================================================
   APPLY ALL PREVIEW STYLES
========================================================= */

function applyPreviewStyles(previewApp) {
  if (!previewApp) {
    return;
  }

  applyLayoutStyles(previewApp);

  applyBackgroundStyles(previewApp);

  applyImageTextStyles(previewApp);

  applyFormSectionStyles(previewApp);

  applyCardStyles(previewApp);

  applyBrandingStyles(previewApp);

  applyTypographyStyles(previewApp);

  applyInputStyles(previewApp);

  applyButtonStyles(previewApp);

  applySocialStyles(previewApp);

  applySpacingStyles(previewApp);

  applyAnimationStyles(previewApp);

  applyCustomCSS(previewApp);
}


/* =========================================================
   LAYOUT STYLES
========================================================= */

function applyLayoutStyles(root) {
  const layout =
    config.layout;

  const previewLayout =
    root.querySelector(
      ".auth-preview-layout"
    );

  if (!previewLayout) {
    return;
  }

  const imageWidth =
    Number(layout.imageWidth) || 50;

  const formWidth =
    Number(layout.formWidth) || 50;

  root.style.setProperty(
    "--image-width",
    `${imageWidth}%`
  );

  root.style.setProperty(
    "--form-width",
    `${formWidth}%`
  );

  root.style.setProperty(
    "--form-horizontal-alignment",
    getHorizontalAlignment(
      layout.formHorizontalAlignment
    )
  );

  root.style.setProperty(
    "--form-vertical-alignment",
    getVerticalAlignment(
      layout.formVerticalAlignment
    )
  );

  previewLayout.dataset.layout =
    layout.type;
}


/* =========================================================
   BACKGROUND STYLES
========================================================= */

function applyBackgroundStyles(root) {
  const imageSection =
    root.querySelector(
      ".auth-image-section"
    );

  if (!imageSection) {
    applyFullBackground(root);
    return;
  }

  const background =
    config.background;

  const image =
    getActiveBackgroundImage();

  imageSection.style.backgroundColor =
    background.color;

  if (image) {
    imageSection.style.backgroundImage =
      `url("${image}")`;
  } else {
    imageSection.style.backgroundImage =
      "none";
  }

  imageSection.style.backgroundPosition =
    background.position;

  imageSection.style.backgroundSize =
    background.size;

  imageSection.style.backgroundRepeat =
    background.repeat;

  const overlay =
    root.querySelector(
      ".auth-image-overlay"
    );

  if (!overlay) {
    return;
  }

  if (background.overlayEnabled) {
    overlay.style.display = "block";

    overlay.style.backgroundColor =
      background.overlayColor;

    overlay.style.opacity =
      clampOpacity(
        background.overlayOpacity
      );
  } else {
    overlay.style.display = "none";
  }
}


/* =========================================================
   FULL BACKGROUND
========================================================= */

function applyFullBackground(root) {
  const background =
    config.background;

  const image =
    getActiveBackgroundImage();

  root.style.backgroundColor =
    background.color;

  if (image) {
    root.style.backgroundImage =
      `url("${image}")`;
  } else {
    root.style.backgroundImage =
      "none";
  }

  root.style.backgroundPosition =
    background.position;

  root.style.backgroundSize =
    background.size;

  root.style.backgroundRepeat =
    background.repeat;
}


/* =========================================================
   IMAGE TEXT STYLES
========================================================= */

function applyImageTextStyles(root) {
  const imageContent =
    root.querySelector(
      ".auth-image-content"
    );

  const imageTitle =
    root.querySelector(
      ".auth-image-title"
    );

  if (!imageContent || !imageTitle) {
    return;
  }

  const imageConfig =
    config.imageSection;

  imageContent.dataset.position =
    imageConfig.textPosition;

  imageTitle.style.color =
    imageConfig.textColor;

  imageTitle.style.fontSize =
    `${imageConfig.textSize}px`;

  imageTitle.style.fontWeight =
    imageConfig.textWeight;

  imageTitle.style.fontFamily =
    imageConfig.textFont;

  imageTitle.style.textShadow =
    imageConfig.textShadow;
}


/* =========================================================
   FORM SECTION STYLES
========================================================= */

function applyFormSectionStyles(root) {
  const section =
    root.querySelector(
      ".auth-form-section"
    );

  if (!section) {
    return;
  }

  const formSection =
    config.formSection;

  if (formSection.useGradient) {
    section.style.background =
      `linear-gradient(
        135deg,
        ${formSection.gradientStart},
        ${formSection.gradientEnd}
      )`;
  } else {
    section.style.background =
      formSection.backgroundColor;
  }

  section.style.setProperty(
    "--form-horizontal-alignment",
    getHorizontalAlignment(
      config.layout.formHorizontalAlignment
    )
  );

  section.style.setProperty(
    "--form-vertical-alignment",
    getVerticalAlignment(
      config.layout.formVerticalAlignment
    )
  );
}


/* =========================================================
   CARD STYLES
========================================================= */

function applyCardStyles(root) {
  const card =
    root.querySelector(
      ".auth-card"
    );

  if (!card) {
    return;
  }

  const cardConfig =
    config.card;

  if (!cardConfig.enabled) {
    card.style.background =
      "transparent";

    card.style.boxShadow =
      "none";

    card.style.border =
      "none";

    card.style.borderRadius =
      "0";

    card.style.maxWidth =
      "100%";

    return;
  }

  card.style.background =
    hexToRGBA(
      cardConfig.backgroundColor,
      cardConfig.opacity
    );

  card.style.maxWidth =
    `${cardConfig.width}px`;

  card.style.minHeight =
    cardConfig.minHeight > 0
      ? `${cardConfig.minHeight}px`
      : "auto";

  card.style.borderRadius =
    `${cardConfig.borderRadius}px`;

  card.style.paddingTop =
    `${cardConfig.paddingTop}px`;

  card.style.paddingRight =
    `${cardConfig.paddingRight}px`;

  card.style.paddingBottom =
    `${cardConfig.paddingBottom}px`;

  card.style.paddingLeft =
    `${cardConfig.paddingLeft}px`;

  if (cardConfig.borderEnabled) {
    card.style.border =
      `${cardConfig.borderWidth}px solid ${cardConfig.borderColor}`;
  } else {
    card.style.border =
      "none";
  }

  if (cardConfig.shadowEnabled) {
    card.style.boxShadow =
      cardConfig.shadow;
  } else {
    card.style.boxShadow =
      "none";
  }

  if (cardConfig.blurEnabled) {
    card.style.backdropFilter =
      `blur(${cardConfig.blur}px)`;
  } else {
    card.style.backdropFilter =
      "none";
  }
}


/* =========================================================
   BRANDING STYLES
========================================================= */

function applyBrandingStyles(root) {
  const branding =
    config.branding;

  const logo =
    root.querySelector(
      ".auth-logo"
    );

  const logoContainer =
    root.querySelector(
      ".auth-logo-container"
    );

  const logoWrapper =
    root.querySelector(
      ".auth-logo-wrapper"
    );

  if (logo) {
    logo.style.width =
      `${branding.logoSize}px`;

    logo.style.height =
      `${branding.logoSize}px`;

    applyLogoShape(
      logo,
      branding.logoShape
    );
  }

  if (logoContainer) {
    logoContainer.style.padding =
      `${branding.logoPadding}px`;

    if (
      branding.logoBackgroundEnabled
    ) {
      logoContainer.style.backgroundColor =
        branding.logoBackgroundColor;
    } else {
      logoContainer.style.backgroundColor =
        "transparent";
    }

    if (
      branding.logoBorderEnabled
    ) {
      logoContainer.style.border =
        `${branding.logoBorderWidth}px solid ${branding.logoBorderColor}`;
    } else {
      logoContainer.style.border =
        "none";
    }

    applyLogoContainerShape(
      logoContainer,
      branding.logoShape
    );
  }

  if (logoWrapper) {
    applyLogoPosition(
      logoWrapper,
      branding.logoPosition
    );
  }
}


/* =========================================================
   LOGO SHAPE
========================================================= */

function applyLogoShape(
  logo,
  shape
) {
  const shapeMap = {
    square: "0",
    rounded: "16px",
    circle: "50%",
    ellipse: "50%"
  };

  logo.style.borderRadius =
    shapeMap[shape] ||
    "12px";

  if (shape === "ellipse") {
    logo.style.width =
      `${config.branding.logoSize * 1.5}px`;

    logo.style.height =
      `${config.branding.logoSize}px`;
  }

  logo.style.objectFit =
    "cover";
}


/* =========================================================
   LOGO CONTAINER SHAPE
========================================================= */

function applyLogoContainerShape(
  container,
  shape
) {
  const shapeMap = {
    square: "0",
    rounded: "18px",
    circle: "50%",
    ellipse: "50%"
  };

  container.style.borderRadius =
    shapeMap[shape] ||
    "16px";
}


/* =========================================================
   LOGO POSITION
========================================================= */

function applyLogoPosition(
  wrapper,
  position
) {
  wrapper.style.display = "flex";

  if (position === "center") {
    wrapper.style.justifyContent =
      "center";

    wrapper.style.textAlign =
      "center";
  } else if (position === "right") {
    wrapper.style.justifyContent =
      "flex-end";

    wrapper.style.textAlign =
      "right";
  } else {
    wrapper.style.justifyContent =
      "flex-start";

    wrapper.style.textAlign =
      "left";
  }
}


/* =========================================================
   TYPOGRAPHY STYLES
========================================================= */

function applyTypographyStyles(root) {
  const typography =
    config.typography;

  root.style.fontFamily =
    typography.fontFamily;

  const title =
    root.querySelector(
      ".auth-title"
    );

  if (title) {
    title.style.color =
      typography.titleColor;

    title.style.fontSize =
      `${typography.titleSize}px`;

    title.style.fontWeight =
      typography.titleWeight;

    title.style.fontFamily =
      typography.fontFamily;
  }

  const subtitle =
    root.querySelector(
      ".auth-subtitle"
    );

  if (subtitle) {
    subtitle.style.color =
      typography.subtitleColor;

    subtitle.style.fontSize =
      `${typography.subtitleSize}px`;

    subtitle.style.fontWeight =
      typography.subtitleWeight;

    subtitle.style.fontFamily =
      typography.fontFamily;
  }

  root
    .querySelectorAll(
      ".auth-label"
    )
    .forEach((label) => {
      label.style.color =
        typography.labelColor;

      label.style.fontSize =
        `${typography.labelSize}px`;

      label.style.fontWeight =
        typography.labelWeight;
    });

  root
    .querySelectorAll(
      ".auth-page-footer, .auth-terms"
    )
    .forEach((element) => {
      element.style.color =
        typography.bodyColor;

      element.style.fontSize =
        `${typography.bodySize}px`;

      element.style.fontWeight =
        typography.bodyWeight;
    });
}


/* =========================================================
   INPUT STYLES
========================================================= */

function applyInputStyles(root) {
  const inputConfig =
    config.inputs;

  root
    .querySelectorAll(
      ".auth-input"
    )
    .forEach((input) => {
      input.style.backgroundColor =
        inputConfig.backgroundColor;

      input.style.color =
        inputConfig.textColor;

      input.style.border =
        `${inputConfig.borderWidth}px solid ${inputConfig.borderColor}`;

      input.style.borderRadius =
        `${inputConfig.borderRadius}px`;

      input.style.height =
        `${inputConfig.height}px`;

      input.style.fontSize =
        `${inputConfig.fontSize}px`;

      input.style.paddingLeft =
        `${inputConfig.paddingHorizontal}px`;

      input.style.paddingRight =
        `${inputConfig.paddingHorizontal}px`;
    });

  root
    .querySelectorAll(
      ".otp-box"
    )
    .forEach((input) => {
      input.style.backgroundColor =
        inputConfig.backgroundColor;

      input.style.color =
        inputConfig.textColor;

      input.style.border =
        `${inputConfig.borderWidth}px solid ${inputConfig.borderColor}`;

      input.style.borderRadius =
        `${inputConfig.borderRadius}px`;

      input.style.fontSize =
        `${inputConfig.fontSize}px`;
    });
}


/* =========================================================
   BUTTON STYLES
========================================================= */

function applyButtonStyles(root) {
  const button =
    root.querySelector(
      ".auth-primary-button"
    );

  if (!button) {
    return;
  }

  const buttonConfig =
    config.button;

  button.style.height =
    `${buttonConfig.height}px`;

  button.style.color =
    buttonConfig.textColor;

  button.style.fontSize =
    `${buttonConfig.fontSize}px`;

  button.style.fontWeight =
    buttonConfig.fontWeight;

  button.style.borderRadius =
    `${buttonConfig.borderRadius}px`;

  if (
    buttonConfig.backgroundType ===
    "gradient"
  ) {
    button.style.background =
      `linear-gradient(
        135deg,
        ${buttonConfig.gradientStart},
        ${buttonConfig.gradientEnd}
      )`;
  } else {
    button.style.background =
      buttonConfig.backgroundColor;
  }

  if (
    buttonConfig.borderEnabled
  ) {
    button.style.border =
      `${buttonConfig.borderWidth}px solid ${buttonConfig.borderColor}`;
  } else {
    button.style.border =
      "none";
  }

  button.style.boxShadow =
    buttonConfig.shadowEnabled
      ? buttonConfig.shadow
      : "none";
}


/* =========================================================
   SOCIAL STYLES
========================================================= */

function applySocialStyles(root) {
  const social =
    config.social;

  const socialContainer =
    root.querySelector(
      ".auth-social-login"
    );

  if (!socialContainer) {
    return;
  }

  socialContainer.dataset.layout =
    social.layout;

  root
    .querySelectorAll(
      ".auth-social-button"
    )
    .forEach((button) => {
      button.style.height =
        `${social.buttonHeight}px`;

      button.style.borderRadius =
        `${social.buttonRadius}px`;

      button.style.backgroundColor =
        social.buttonBackground;

      button.style.color =
        social.buttonTextColor;

      button.style.border =
        `${social.buttonBorderWidth}px solid ${social.buttonBorderColor}`;
    });
}


/* =========================================================
   SPACING
========================================================= */

function applySpacingStyles(root) {
  const spacing =
    config.spacing;

  root.style.setProperty(
    "--form-group-gap",
    `${spacing.formGroupGap}px`
  );

  root.style.setProperty(
    "--button-gap",
    `${spacing.buttonGap}px`
  );

  root.style.setProperty(
    "--social-gap",
    `${spacing.socialGap}px`
  );

  root.style.setProperty(
    "--brand-bottom-margin",
    `${spacing.brandBottomMargin}px`
  );

  root.style.setProperty(
    "--divider-margin",
    `${spacing.dividerMargin}px`
  );
}


/* =========================================================
   ANIMATION
========================================================= */

function applyAnimationStyles(root) {
  const animation =
    config.animation;

  if (!animation.enabled) {
    root.style.animation =
      "none";

    return;
  }

  const animations = {
    fade: `authFadeIn ${animation.duration}ms ease`,
    slide: `authSlideIn ${animation.duration}ms ease`,
    zoom: `authZoomIn ${animation.duration}ms ease`
  };

  root.style.animation =
    animations[animation.type] ||
    animations.fade;
}


/* =========================================================
   CUSTOM CSS
========================================================= */

function applyCustomCSS(root) {
  if (!config.customCSS) {
    return;
  }

  let style =
    root.querySelector(
      ".auth-custom-css"
    );

  if (!style) {
    style =
      document.createElement("style");

    style.className =
      "auth-custom-css";

    root.appendChild(style);
  }

  style.textContent =
    config.customCSS;
}


/* =========================================================
   INITIALIZE PREVIEW INTERACTIONS
========================================================= */

function initializePreviewInteractions(root) {
  initializePageNavigation(root);

  initializePasswordToggles(root);

  initializeIdentifierSwitching(root);

  initializeOtpInputs(root);

  initializeGetKeySelection(root);

  initializePreviewForms(root);

  initializeSocialButtons(root);
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function initializePageNavigation(root) {
  root
    .querySelectorAll(
      "[data-page]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const page =
            button.dataset.page;

          if (!page) {
            return;
          }

          config.currentPage =
            page;

          renderPreviewRoot();
        }
      );
    });
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function initializePasswordToggles(root) {
  root
    .querySelectorAll(
      "[data-password-toggle]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const inputId =
            button.dataset.passwordToggle;

          const input =
            root.querySelector(
              `#${inputId}`
            );

          if (!input) {
            return;
          }

          if (
            input.type === "password"
          ) {
            input.type = "text";

            button.textContent =
              "🙈";

            button.setAttribute(
              "aria-label",
              "Hide password"
            );
          } else {
            input.type =
              "password";

            button.textContent =
              "👁";

            button.setAttribute(
              "aria-label",
              "Show password"
            );
          }
        }
      );
    });
}


/* =========================================================
   IDENTIFIER SWITCHING
========================================================= */

function initializeIdentifierSwitching(root) {
  root
    .querySelectorAll(
      "[data-auth-identifier]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const identifier =
            button.dataset.authIdentifier;

          config.login.identifier =
            identifier;

          renderPreviewRoot();
        }
      );
    });
}


/* =========================================================
   OTP INPUT BEHAVIOR
========================================================= */

function initializeOtpInputs(root) {
  const otpInputs =
    Array.from(
      root.querySelectorAll(
        ".otp-box"
      )
    );

  otpInputs.forEach(
    (input, index) => {

      input.addEventListener(
        "input",
        () => {
          input.value =
            input.value
              .replace(/\D/g, "")
              .slice(0, 1);

          if (
            input.value &&
            otpInputs[index + 1]
          ) {
            otpInputs[
              index + 1
            ].focus();
          }
        }
      );

      input.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Backspace" &&
            !input.value &&
            otpInputs[index - 1]
          ) {
            otpInputs[
              index - 1
            ].focus();
          }
        }
      );

      input.addEventListener(
        "paste",
        (event) => {
          event.preventDefault();

          const pasted =
            event.clipboardData
              .getData("text")
              .replace(/\D/g, "");

          if (!pasted) {
            return;
          }

          pasted
            .slice(
              0,
              otpInputs.length
            )
            .split("")
            .forEach(
              (digit, digitIndex) => {
                if (
                  otpInputs[digitIndex]
                ) {
                  otpInputs[
                    digitIndex
                  ].value = digit;
                }
              }
            );

          const lastIndex =
            Math.min(
              pasted.length,
              otpInputs.length
            ) - 1;

          if (
            otpInputs[lastIndex]
          ) {
            otpInputs[
              lastIndex
            ].focus();
          }
        }
      );
    }
  );
}


/* =========================================================
   GET KEY SELECTION
========================================================= */

function initializeGetKeySelection(root) {
  root
    .querySelectorAll(
      'input[name="getKeyFrom"]'
    )
    .forEach((radio) => {
      radio.addEventListener(
        "change",
        () => {
          if (!radio.checked) {
            return;
          }

          config.authentication.selectedGetKey =
            radio.value;
        }
      );
    });
}


/* =========================================================
   PREVIEW FORMS
========================================================= */

function initializePreviewForms(root) {
  root
    .querySelectorAll(
      ".auth-form"
    )
    .forEach((form) => {
      form.addEventListener(
        "submit",
        (event) => {
          event.preventDefault();

          showPreviewMessage(
            root,
            getSubmitMessage()
          );
        }
      );
    });
}


/* =========================================================
   SUBMIT MESSAGE
========================================================= */

function getSubmitMessage() {
  switch (
    config.currentPage
  ) {
    case "signup":
      return "Account created successfully";

    case "forgot":
      return "Password reset instructions sent";

    case "otp":
      return "Verification successful";

    case "login":
    default:
      return "Login successful";
  }
}


/* =========================================================
   SOCIAL BUTTONS
========================================================= */

function initializeSocialButtons(root) {
  root
    .querySelectorAll(
      "[data-social-provider]"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const provider =
            button.dataset.socialProvider;

          showPreviewMessage(
            root,
            `Continue with ${
              provider.charAt(0).toUpperCase() +
              provider.slice(1)
            }`
          );
        }
      );
    });
}


/* =========================================================
   PREVIEW MESSAGE
========================================================= */

function showPreviewMessage(
  root,
  message
) {
  let messageElement =
    root.querySelector(
      ".auth-preview-message"
    );

  if (!messageElement) {
    messageElement =
      document.createElement("div");

    messageElement.className =
      "auth-preview-message";

    root.appendChild(
      messageElement
    );
  }

  messageElement.textContent =
    message;

  messageElement.classList.add(
    "show"
  );

  clearTimeout(
    window.__previewMessageTimer
  );

  window.__previewMessageTimer =
    setTimeout(
      () => {
        messageElement.classList.remove(
          "show"
        );
      },
      2500
    );
}


/* =========================================================
   RENDER MAIN PREVIEW ROOT
========================================================= */

function renderPreviewRoot() {
  const root =
    document.getElementById(
      "previewRoot"
    );

  if (root) {
    renderPreview(root);
  }

  const fullscreenRoot =
    document.getElementById(
      "fullscreenPreviewRoot"
    );

  if (
    fullscreenRoot &&
    fullscreenRoot
      .closest(
        ".auth-fullscreen-preview"
      )
      ?.classList.contains(
        "auth-fullscreen-open"
      )
  ) {
    renderPreview(
      fullscreenRoot
    );
  }
}


/* =========================================================
   ALIGNMENT HELPERS
========================================================= */

function getHorizontalAlignment(
  alignment
) {
  const map = {
    left: "flex-start",
    center: "center",
    right: "flex-end"
  };

  return (
    map[alignment] ||
    "center"
  );
}


function getVerticalAlignment(
  alignment
) {
  const map = {
    top: "flex-start",
    center: "center",
    bottom: "flex-end"
  };

  return (
    map[alignment] ||
    "center"
  );
}


/* =========================================================
   OPACITY HELPER
========================================================= */

function clampOpacity(value) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return 0;
  }

  if (number > 1) {
    return Math.min(
      number / 100,
      1
    );
  }

  return Math.max(
    0,
    Math.min(number, 1)
  );
}


/* =========================================================
   HEX TO RGBA
========================================================= */

function hexToRGBA(
  hex,
  opacity = 1
) {
  if (!hex) {
    return `rgba(255, 255, 255, ${opacity})`;
  }

  let color =
    String(hex).replace(
      "#",
      ""
    );

  if (
    color.length === 3
  ) {
    color =
      color
        .split("")
        .map(
          (character) =>
            character + character
        )
        .join("");
  }

  if (
    color.length !== 6
  ) {
    return hex;
  }

  const red =
    parseInt(
      color.substring(0, 2),
      16
    );

  const green =
    parseInt(
      color.substring(2, 4),
      16
    );

  const blue =
    parseInt(
      color.substring(4, 6),
      16
    );

  return `
    rgba(
      ${red},
      ${green},
      ${blue},
      ${clampOpacity(opacity)}
    )
  `
    .replace(/\s+/g, " ")
    .trim();
}


/* =========================================================
   FALLBACK ESCAPE FUNCTIONS
========================================================= */

if (
  typeof window.escapeHTML !==
  "function"
) {
  window.escapeHTML =
    function (value = "") {
      const div =
        document.createElement(
          "div"
        );

      div.textContent = value;

      return div.innerHTML;
    };
}


if (
  typeof window.escapeAttribute !==
  "function"
) {
  window.escapeAttribute =
    function (value = "") {
      return String(value)
        .replace(
          /&/g,
          "&amp;"
        )
        .replace(
          /"/g,
          "&quot;"
        )
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        );
    };
}


/* =========================================================
   EXPOSE PREVIEW FUNCTIONS
========================================================= */

window.renderPreview =
  renderPreview;

window.renderPreviewRoot =
  renderPreviewRoot;

window.authPreview = {

  renderPreview,

  renderPreviewRoot,

  applyPreviewStyles,

  createPreviewShell,

  getActiveBackgroundImage,

  applyLayoutStyles,

  applyBackgroundStyles,

  applyBrandingStyles,

  applyTypographyStyles,

  applyInputStyles,

  applyButtonStyles,

  applySocialStyles,

  initializePreviewInteractions
};