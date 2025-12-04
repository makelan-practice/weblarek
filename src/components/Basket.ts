import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/Events";

interface IBasket {
  total: number;
  items: HTMLElement[];
}

export class Basket extends Component<IBasket> {
  protected listElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(
    protected events: IEvents,
    container: HTMLElement
  ) {
    super(container);

    this.listElement = ensureElement<HTMLElement>(
      ".basket__list",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".basket__price",
      this.container
    );
    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );

    this.buttonElement.addEventListener("click", () => {
      this.events.emit("basket:order");
    });
  }

  set total(value: number) {
    this.priceElement.textContent = `${value} синапсов`;
  }

  set items(value: HTMLElement[]) {
    this.listElement.replaceChildren(...value);
    this.buttonElement.disabled = value.length === 0;
  }
}
