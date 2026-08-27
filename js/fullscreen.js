/* =========================================================
   AUTH PAGE BUILDER
   File: js/fullscreen.js

   Fullscreen Preview Manager
========================================================= */

class FullscreenManager {
  constructor(options = {}) {
    this.previewSelector =
      options.previewSelector ||
      "#preview";

    this.previewContentSelector =
      options.previewContentSelector ||
      "#preview-content";

    this.fullscreenButtonSelector =
      options.fullscreenButtonSelector ||
      "#fullscreen-btn";

    this.closeButtonSelector =
      options.closeButtonSelector ||
      "#fullscreen-close";

    this.modalId =
      options.modalId ||
      "auth-builder-fullscreen-modal";

    this.modal = null;
    this.fullscreenContent = null;

    this.isOpen = false;

    this.init();
  }

  init() {
    this.createFullscreenModal();
    this.bindEvents();
  }

  getPreviewElement() {
    let preview =
      document.querySelector(
        this.previewContentSelector
      );

    if (!preview) {
      preview =
        document.querySelector(
          this.previewSelector
        );
    }

    return preview;
  }

  createFullscreenModal() {
    if (
      document.getElementById(
        this.modalId
      )
    ) {
      this.modal =
        document.getElementById(
          this.modalId
        );

      this.fullscreenContent =
        this.modal.querySelector(
          ".fullscreen-preview-content"
        );

      return;
    }

    this.modal =
      document.createElement("div");

    this.modal.id =
      this.modalId;

    this.modal.className =
      "fullscreen-preview-modal";

    this.modal.innerHTML = `
      <div class="fullscreen-preview-header">

        <div class="fullscreen-preview-title">
          Fullscreen Preview
        </div>

        <div class="fullscreen-preview-actions">

          <button
            type="button"
            class="fullscreen-browser-button"
            id="fullscreen-browser-toggle"
            title="Browser Fullscreen"
          >
            ⛶
          </button>

          <button
            type="button"
            class="fullscreen-close-button"
            id="fullscreen-close"
            title="Close Fullscreen"
          >
            ×
          </button>

        </div>

      </div>

      <div class="fullscreen-preview-body">

        <div
          class="fullscreen-preview-content"
        ></div>

      </div>
    `;

    document.body.appendChild(
      this.modal
    );

    this.fullscreenContent =
      this.modal.querySelector(
        ".fullscreen-preview-content"
      );
  }

  bindEvents() {
    document.addEventListener(
      "click",
      (event) => {
        const fullscreenButton =
          event.target.closest(
            this.fullscreenButtonSelector
          );

        if (fullscreenButton) {
          event.preventDefault();

          this.open();
        }

        const closeButton =
          event.target.closest(
            "#fullscreen-close"
          );

        if (closeButton) {
          event.preventDefault();

          this.close();
        }

        const browserFullscreenButton =
          event.target.closest(
            "#fullscreen-browser-toggle"
          );

        if (
          browserFullscreenButton
        ) {
          event.preventDefault();

          this.toggleBrowserFullscreen();
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          this.isOpen
        ) {
          this.close();
        }
      }
    );

    document.addEventListener(
      "fullscreenchange",
      () => {
        this.updateFullscreenButton();
      }
    );
  }

  open() {
    const preview =
      this.getPreviewElement();

    if (!preview) {
      console.warn(
        "Preview element was not found."
      );

      return;
    }

    this.updateContent();

    this.modal.classList.add(
      "active"
    );

    document.body.classList.add(
      "auth-builder-fullscreen-open"
    );

    this.isOpen = true;

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:fullscreen-open",
        {
          detail: {
            preview
          }
        }
      )
    );
  }

  close() {
    if (!this.modal) {
      return;
    }

    this.modal.classList.remove(
      "active"
    );

    document.body.classList.remove(
      "auth-builder-fullscreen-open"
    );

    this.isOpen = false;

    if (document.fullscreenElement) {
      document.exitFullscreen()
        .catch(() => {});
    }

    document.dispatchEvent(
      new CustomEvent(
        "auth-builder:fullscreen-close"
      )
    );
  }

  updateContent() {
    const preview =
      this.getPreviewElement();

    if (
      !preview ||
      !this.fullscreenContent
    ) {
      return;
    }

    const clonedPreview =
      preview.cloneNode(true);

    this.removeDuplicateIds(
      clonedPreview
    );

    this.fullscreenContent.innerHTML =
      "";

    this.fullscreenContent.appendChild(
      clonedPreview
    );

    this.syncInputs(
      preview,
      clonedPreview
    );
  }

  removeDuplicateIds(element) {
    if (
      element.nodeType !==
      Node.ELEMENT_NODE
    ) {
      return;
    }

    if (element.id) {
      element.removeAttribute("id");
    }

    element
      .querySelectorAll("[id]")
      .forEach(
        (item) => {
          item.removeAttribute("id");
        }
      );
  }

  syncInputs(
    original,
    clone
  ) {
    const originalInputs =
      original.querySelectorAll(
        "input, textarea, select"
      );

    const clonedInputs =
      clone.querySelectorAll(
        "input, textarea, select"
      );

    originalInputs.forEach(
      (input, index) => {
        const clonedInput =
          clonedInputs[index];

        if (!clonedInput) {
          return;
        }

        if (
          input instanceof
          HTMLInputElement
        ) {
          clonedInput.value =
            input.value;

          clonedInput.checked =
            input.checked;
        }

        if (
          input instanceof
          HTMLTextAreaElement
        ) {
          clonedInput.value =
            input.value;
        }

        if (
          input instanceof
          HTMLSelectElement
        ) {
          clonedInput.value =
            input.value;
        }
      }
    );
  }

  async toggleBrowserFullscreen() {
    try {
      if (
        !document.fullscreenElement
      ) {
        await this.modal.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn(
        "Browser fullscreen is not available:",
        error
      );
    }
  }

  updateFullscreenButton() {
    const button =
      document.querySelector(
        "#fullscreen-browser-toggle"
      );

    if (!button) {
      return;
    }

    if (
      document.fullscreenElement
    ) {
      button.textContent =
        "⤢";

      button.title =
        "Exit Browser Fullscreen";
    } else {
      button.textContent =
        "⛶";

      button.title =
        "Browser Fullscreen";
    }
  }

  refresh() {
    if (this.isOpen) {
      this.updateContent();
    }
  }
}


/* =========================================================
   GLOBAL INITIALIZATION
========================================================= */

window.FullscreenManager =
  FullscreenManager;


document.addEventListener(
  "DOMContentLoaded",
  () => {

    window.fullscreenManager =
      new FullscreenManager({

        previewSelector:
          "#preview",

        previewContentSelector:
          "#preview-content",

        fullscreenButtonSelector:
          "#fullscreen-btn"

      });

  }
);


/* =========================================================
   LISTEN FOR PREVIEW UPDATES

   Whenever customization changes,
   fullscreen preview automatically updates.
========================================================= */

document.addEventListener(
  "auth-builder:preview-updated",
  () => {

    if (
      window.fullscreenManager
    ) {
      window.fullscreenManager
        .refresh();
    }

  }
);


/* =========================================================
   OPTIONAL COMPATIBILITY FUNCTION

   Other files can call:

   openFullscreenPreview();
========================================================= */

function openFullscreenPreview() {

  if (
    window.fullscreenManager
  ) {
    window.fullscreenManager
      .open();
  }

}


/* =========================================================
   OPTIONAL CLOSE FUNCTION
========================================================= */

function closeFullscreenPreview() {

  if (
    window.fullscreenManager
  ) {
    window.fullscreenManager
      .close();
  }

}