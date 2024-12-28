// ./modals/simpleModal.js

class SimpleModal {
	constructor({
		modalId,
		title = "Notification",
		bodyText = "Do you wish to proceed?",
		type = "info", // info, warning, error, question
		confirmText = "OK",
		cancelText = "Cancel",
		confirmCallback = () => {},
		cancelCallback = () => {}
	}) {
		this.modalId = modalId;
		this.title = title;
		this.bodyText = bodyText;
		this.type = type;
		this.confirmText = confirmText;
		this.cancelText = cancelText;
		this.confirmCallback = confirmCallback;
		this.cancelCallback = cancelCallback;
	}

	createModal() {
		const modalHTML = `
      <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="${this.modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-${this.type}">
            <div class="modal-header">
              <h5 class="modal-title" id="${this.modalId}Label">${this.title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${this.bodyText}
            </div>
            <div class="modal-footer">
              ${this.cancelText ? `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.cancelText}</button>` : ""}
              ${this.confirmText ? `<button type="button" class="btn btn-primary" id="${this.modalId}-confirm">${this.confirmText}</button>` : ""}
            </div>
          </div>
        </div>
      </div>
    `;

		// Append modal to the body
		document.body.insertAdjacentHTML("beforeend", modalHTML);

		// Add event listeners
		if (this.confirmText) {
			document.getElementById(`${this.modalId}-confirm`).addEventListener("click", () => {
				this.confirmCallback();
				this.hide();
			});
		}

		if (this.cancelText) {
			const cancelButton = document.querySelector(`#${this.modalId} .btn-secondary`);
			if (cancelButton) {
				cancelButton.addEventListener("click", this.cancelCallback);
			}
		}
	}

	show() {
		const modalElement = document.getElementById(this.modalId);
		if (modalElement) {
			const bootstrapModal = new bootstrap.Modal(modalElement);
			bootstrapModal.show();
		} else {
			console.error(`Modal with ID ${this.modalId} not found`);
		}
	}

	hide() {
		const modalElement = bootstrap.Modal.getInstance(document.getElementById(this.modalId));
		modalElement.hide();
	}
}

export default SimpleModal;
