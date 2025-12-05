import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";

interface IModal {
  content: HTMLElement | null;
}

export type ModalContentType =
  | "cardPreview"
  | "basket"
  | "order"
  | "contacts"
  | "success";

const CONTENT_TYPE_SELECTORS: Record<ModalContentType, string> = {
  cardPreview: ".card_full",
  basket: ".basket",
  order: "form[name='order']",
  contacts: "form[name='contacts']",
  success: ".order-success",
};

export class Modal extends Component<IModal> {
  protected containerElement: HTMLElement;
  protected closeButton: HTMLButtonElement;
  protected contentElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.containerElement = ensureElement<HTMLElement>(
      ".modal__container",
      this.container
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".modal__close",
      this.container
    );
    this.contentElement = ensureElement<HTMLElement>(
      ".modal__content",
      this.container
    );

    // Закрытие по кнопке
    this.closeButton.addEventListener("click", () => {
      this.close();
    });

    // Закрытие по клику вне модального окна
    this.container.addEventListener("click", (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  }

  set content(value: HTMLElement | null) {
    if (value) {
      this.contentElement.innerHTML = "";
      this.contentElement.appendChild(value);
    } else {
      this.contentElement.innerHTML = "";
    }
  }
  get content(): HTMLElement | null {
    return this.contentElement.firstElementChild as HTMLElement | null;
  }

  hasContentType(type: ModalContentType): boolean {
    const selector = CONTENT_TYPE_SELECTORS[type];
    return this.contentElement.querySelector(selector) !== null;
  }

  open(): void {
    this.container.classList.add("modal_active");
  }

  close(): void {
    this.container.classList.remove("modal_active");
    this.events.emit("modal:close");
  }

  isOpen(): boolean {
    return this.container.classList.contains("modal_active");
  }
}
