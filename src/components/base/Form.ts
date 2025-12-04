import { ensureElement } from "../../utils/utils";
import { Component } from "./Component";
import { IEvents } from "./Events";
import { IBuyerErrors } from "../../types";

export abstract class Form<T> extends Component<T> {
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    this.setupSubmitListener();
  }

  protected setupSubmitListener(): void {
    if (this.container instanceof HTMLFormElement) {
      this.container.addEventListener("submit", (e) => {
        e.preventDefault();
        this.events.emit(this.getSubmitEventName());
      });
    }
  }

  protected abstract getSubmitEventName(): string;

  protected abstract getErrorMessages(errors: Partial<IBuyerErrors>): string[];

  set errors(value: Partial<IBuyerErrors>) {
    const errorMessages = this.getErrorMessages(value);
    this.errorsElement.textContent = errorMessages.join(", ");
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }
}
