import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";

interface ISuccess {
  total: number;
}

export class Success extends Component<ISuccess> {
  protected descriptionElement: HTMLElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container
    );

    const closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container
    );

    closeButton.addEventListener("click", () => {
      this.events.emit("success:close");
    });
  }

  set total(value: number) {
    this.descriptionElement.textContent = `Списано ${value} синапсов`;
  }
}
