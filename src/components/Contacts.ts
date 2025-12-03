import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";
import { IBuyerErrors } from "../types";

interface IContacts {
  email: string;
  phone: string;
  errors: Partial<IBuyerErrors>;
  valid?: boolean;
}

export class Contacts extends Component<IContacts> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      this.container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      this.container
    );
    this.submitButton = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      this.container
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Обработка email
    this.emailInput.addEventListener("input", () => {
      this.events.emit("contacts:email:change", {
        email: this.emailInput.value,
      });
    });

    // Обработка телефона
    this.phoneInput.addEventListener("input", () => {
      this.events.emit("contacts:phone:change", {
        phone: this.phoneInput.value,
      });
    });

    // Обработка submit
    if (this.container instanceof HTMLFormElement) {
      this.container.addEventListener("submit", (e) => {
        e.preventDefault();
        this.events.emit("contacts:submit");
      });
    }
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }

  set errors(value: Partial<IBuyerErrors>) {
    const errorMessages: string[] = [];
    if (value.email) errorMessages.push(value.email);
    if (value.phone) errorMessages.push(value.phone);

    this.errorsElement.textContent = errorMessages.join(", ");
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }
}
