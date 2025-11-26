import { Component } from "./base/Component";
import { ensureElement } from "../utils/utils";

interface IBasketView {
  items: HTMLElement[];
  total: number;
  buttonDisabled: boolean;
}

type BasketActions = {
  onSubmit: () => void;
};

/**
 * Компонент корзины
 */
export class Basket extends Component<IBasketView> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _submit: HTMLButtonElement;
  protected _empty: HTMLElement;

  constructor(container: HTMLElement, actions: BasketActions) {
    super(container);
    this._list = ensureElement<HTMLElement>(".basket__list", this.container);
    this._total = ensureElement<HTMLElement>(".basket__price", this.container);
    this._submit = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.container
    );
    this._empty = ensureElement<HTMLElement>(".basket__empty", this.container);

    this._submit.addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();
      actions.onSubmit();
    });
  }

  set items(nodes: HTMLElement[]) {
    const hasItems = nodes.length > 0;
    this._list.hidden = !hasItems;
    this._empty.hidden = hasItems;
    if (hasItems) {
      this._list.replaceChildren(...nodes);
    } else {
      this._list.replaceChildren();
      this._empty.textContent = "Корзина пуста";
    }
  }

  set total(value: number) {
    this._total.textContent = `${value} синапсов`;
  }

  set buttonDisabled(state: boolean) {
    this._submit.disabled = state;
  }
}
