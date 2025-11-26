import { Card, ICard, CardActions } from "./Card";

export interface IBasketItem extends ICard {
  index: number;
}

/**
 * Карточка товара в корзине
 */
export class BasketItem extends Card {
  constructor(container: HTMLElement, actions: CardActions) {
    super(container, actions);
  }
}
