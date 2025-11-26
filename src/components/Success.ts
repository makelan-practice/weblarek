import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface ISuccess {
  total: number;
}

type SuccessActions = {
  onClose: () => void;
};

export class Success extends Component<ISuccess> {
  protected _description: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions: SuccessActions) {
    super(container);
    this._description = ensureElement<HTMLElement>('.order-success__description', container);
    this._button = ensureElement<HTMLButtonElement>('.order-success__close', container);

    this._button.addEventListener('click', () => actions.onClose());
  }

  set total(value: number) {
    this._description.textContent = `Списано ${value} синапсов`;
  }
}


