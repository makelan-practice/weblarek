import { IProduct, ICardActions } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";

export type TCardBasket = Pick<IProduct, "title" | "price"> & {
  index?: number;
};

export class CardBasket extends Card<TCardBasket> {
  protected indexElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>(
      ".basket__item-index",
      this.container
    );

    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".basket__item-delete",
      this.container
    );

    if (actions?.onClick) {
      this.buttonElement.addEventListener("click", actions.onClick);
    }
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
