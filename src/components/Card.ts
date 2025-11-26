import { Component } from "./base/Component";
import { ensureElement } from "../utils/utils";
import { CDN_URL, categoryMap } from "../utils/constants";

export interface ICard {
  id: string;
  title: string;
  category: string;
  price: number | null;
  image?: string;
  description?: string;
  buttonTitle?: string;
  buttonDisabled?: boolean;
  buttonHidden?: boolean;
  index?: number;
}

export type CardActions = {
  onClick?: (event: MouseEvent) => void;
  onButtonClick?: (event: MouseEvent) => void;
  onDelete?: (event: MouseEvent) => void;
};

/**
 * Универсальный компонент карточки товара
 */
export class Card extends Component<ICard> {
  protected _title: HTMLElement;
  protected _category?: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _description?: HTMLElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement;
  protected _index?: HTMLElement;
  protected _deleteButton?: HTMLButtonElement;

  constructor(container: HTMLElement, actions: CardActions = {}) {
    super(container);
    this._title = ensureElement<HTMLElement>(".card__title", this.container);
    this._price = ensureElement<HTMLElement>(".card__price", this.container);
    this._category =
      this.container.querySelector<HTMLElement>(".card__category") ?? undefined;
    this._image =
      this.container.querySelector<HTMLImageElement>(".card__image") ??
      undefined;
    this._description =
      this.container.querySelector<HTMLElement>(".card__text") ?? undefined;
    this._button =
      this.container.querySelector<HTMLButtonElement>(".card__button") ??
      undefined;
    this._index =
      this.container.querySelector<HTMLElement>(".basket__item-index") ??
      undefined;
    this._deleteButton =
      this.container.querySelector<HTMLButtonElement>(".basket__item-delete") ??
      undefined;

    if (actions.onClick) {
      this.container.addEventListener("click", actions.onClick);
    }

    if (this._button && actions.onButtonClick) {
      this._button.addEventListener("click", (event: MouseEvent) => {
        event.stopPropagation();
        actions.onButtonClick!(event);
      });
    }

    if (this._deleteButton && actions.onDelete) {
      this._deleteButton.addEventListener("click", (event: MouseEvent) => {
        event.stopPropagation();
        actions.onDelete!(event);
      });
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || "";
  }

  set title(value: string) {
    this._title.textContent = value;
    if (this._image && !this._image.alt) {
      this._image.alt = value;
    }
  }

  set category(value: string) {
    if (this._category) {
      const classes = Object.values(categoryMap);
      this._category.classList.remove(...classes);
      const modifier = categoryMap[value as keyof typeof categoryMap];
      if (modifier) {
        this._category.classList.add(modifier);
      }
      this._category.textContent = value;
    }
  }

  set image(value: string | undefined) {
    if (this._image && value) {
      const normalized = value.startsWith("http")
        ? value
        : `${CDN_URL}${value}`;
      this._image.src = normalized;
    }
  }

  set description(value: string | undefined) {
    if (this._description && value !== undefined) {
      this._description.textContent = value;
    }
  }

  set price(value: number | null) {
    this._price.textContent = value === null ? "Бесценно" : `${value} синапсов`;
  }

  set buttonTitle(value: string | undefined) {
    if (this._button && value !== undefined) {
      this._button.textContent = value;
    }
  }

  set buttonDisabled(state: boolean | undefined) {
    if (this._button && state !== undefined) {
      this._button.disabled = state;
    }
  }

  set buttonHidden(state: boolean | undefined) {
    if (this._button && state !== undefined) {
      this._button.hidden = state;
    }
  }

  set index(value: number | undefined) {
    if (this._index && value !== undefined) {
      this._index.textContent = String(value);
    }
  }
}

export class CatalogCard extends Card {
  constructor(container: HTMLElement, actions: CardActions = {}) {
    super(container, actions);
  }
}

export class PreviewCard extends Card {
  constructor(container: HTMLElement, actions: CardActions = {}) {
    super(container, actions);
  }
}
