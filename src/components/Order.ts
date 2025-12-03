import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";
import { TPayment, IBuyerErrors } from "../types";

interface IOrder {
  payment: TPayment | null;
  address: string;
  errors: Partial<IBuyerErrors>;
  valid?: boolean;
}

export class Order extends Component<IOrder> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.cardButton = ensureElement<HTMLButtonElement>(
      'button[name="card"]',
      this.container
    );
    this.cashButton = ensureElement<HTMLButtonElement>(
      'button[name="cash"]',
      this.container
    );
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      this.container
    );
    this.submitButton = ensureElement<HTMLButtonElement>(
      ".order__button",
      this.container
    );
    this.errorsElement = ensureElement<HTMLElement>(
      ".form__errors",
      this.container
    );

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Обработка способа оплаты
    this.cardButton.addEventListener("click", () => {
      this.events.emit("order:payment:change", { payment: "online" });
    });

    this.cashButton.addEventListener("click", () => {
      this.events.emit("order:payment:change", { payment: "offline" });
    });

    // Обработка адреса
    this.addressInput.addEventListener("input", () => {
      this.events.emit("order:address:change", {
        address: this.addressInput.value,
      });
    });

    // Обработка submit
    if (this.container instanceof HTMLFormElement) {
      this.container.addEventListener("submit", (e) => {
        e.preventDefault();
        this.events.emit("order:next");
      });
    }
  }

  set payment(value: TPayment | null) {
    const isCard = value === "online";
    const isCash = value === "offline";

    this.cardButton.classList.toggle("button_alt-active", isCard);
    this.cashButton.classList.toggle("button_alt-active", isCash);
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  set errors(value: Partial<IBuyerErrors>) {
    const errorMessages: string[] = [];
    if (value.payment) errorMessages.push(value.payment);
    if (value.address) errorMessages.push(value.address);

    this.errorsElement.textContent = errorMessages.join(", ");
  }

  set valid(value: boolean) {
    this.submitButton.disabled = !value;
  }
}
