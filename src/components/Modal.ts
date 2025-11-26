import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface IModal {
  content: HTMLElement | null;
}

type ModalActions = {
  onClose?: () => void;
};

/**
 * Компонент модального окна
 */
export class Modal extends Component<IModal> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;
  protected _actions?: ModalActions;

  constructor(container: HTMLElement, actions: ModalActions = {}) {
    super(container);
    this._actions = actions;
    this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
    this._content = ensureElement<HTMLElement>('.modal__content', this.container);

    this._closeButton.addEventListener('click', () => this.close());
    this.container.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.target === this.container) {
        this.close();
      }
    });
  }

  set content(node: HTMLElement | null) {
    this._content.replaceChildren(...(node ? [node] : []));
  }

  open(node: HTMLElement) {
    this.content = node;
    this.container.classList.add('modal_active');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.content = null;
    this._actions?.onClose?.();
  }

  setCloseHandler(handler: () => void) {
    this._actions = {
      ...this._actions,
      onClose: handler,
    };
  }
}


