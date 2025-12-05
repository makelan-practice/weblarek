import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

export class Card<T> extends Component<T> {
  protected titleElement: HTMLElement | null = null;
  protected priceElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    super(container);

    // Инициализация элементов, если они существуют
    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
  }

  set title(value: string) {
    if (this.titleElement) {
      this.titleElement.textContent = value;
    }
  }

  set price(value: number | null) {
    if (this.priceElement) {
      if (value !== null && value !== undefined) {
        this.priceElement.textContent = `${value} синапсов`;
      } else {
        this.priceElement.textContent = "Бесценно";
      }
    }
  }
}
