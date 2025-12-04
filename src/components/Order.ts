import { ensureElement } from "../utils/utils";
import { Form } from "./base/Form";
import { IEvents } from "./base/Events";
import { TPayment, IBuyerErrors } from "../types";

interface IOrder {
  payment: TPayment | null;
  address: string;
  errors: Partial<IBuyerErrors>;
  valid?: boolean;
}

export class Order extends Form<IOrder> {
  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(events, container);

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

    this.setupEventListeners();
  }

  protected getSubmitEventName(): string {
    return "order:next";
  }

  protected getErrorMessages(errors: Partial<IBuyerErrors>): string[] {
    const errorMessages: string[] = [];
    if (errors.payment) errorMessages.push(errors.payment);
    if (errors.address) errorMessages.push(errors.address);
    return errorMessages;
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
}
