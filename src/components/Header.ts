import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

export interface IHeader {
  counter: number;
}

type HeaderActions = {
  onBasketClick: () => void;
};

/**
 * Компонент шапки страницы
 */
export class Header extends Component<IHeader> {
  protected _basketButton: HTMLButtonElement;
  protected _counter: HTMLElement;

  constructor(container: HTMLElement, actions: HeaderActions) {
    super(container);
    this._basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);
    this._counter = ensureElement<HTMLElement>('.header__basket-counter', this.container);

    this._basketButton.addEventListener('click', () => actions.onBasketClick());
  }

  set counter(value: number) {
    this._counter.textContent = String(value);
  }
}


