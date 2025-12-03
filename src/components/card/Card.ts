import { Component } from "../base/Component";

export class Card<T> extends Component<T> {
  protected title: string = "";
  protected titleElement: HTMLElement | null = null;
  protected priceElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    super(container);

    // Инициализация элементов, если они существуют
    this.titleElement =
      this.container.querySelector<HTMLElement>(".card__title");
    this.priceElement =
      this.container.querySelector<HTMLElement>(".card__price");
  }

  setTitle(value: string): void {
    this.title = value;
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
