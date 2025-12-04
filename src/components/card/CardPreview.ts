import { IProduct, ICardActions } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";
import { categoryMap } from "../../utils/constants";

type CategoryKey = keyof typeof categoryMap;

export type TCardPreview = Pick<
  IProduct,
  "image" | "category" | "title" | "price" | "description"
> & {
  buttonText?: string;
  buttonDisabled?: boolean;
};

export class CardPreview extends Card<TCardPreview> {
  protected imageElement: HTMLImageElement | null = null;
  protected categoryElement: HTMLElement | null = null;
  protected textElement: HTMLElement;
  protected buttonElement: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.imageElement =
      this.container.querySelector<HTMLImageElement>(".card__image");
    this.categoryElement =
      this.container.querySelector<HTMLElement>(".card__category");

    this.textElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container
    );

    this.buttonElement = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container
    );

    if (actions?.onClick) {
      this.buttonElement.addEventListener("click", actions.onClick);
    }
  }

  set image(value: string) {
    if (this.imageElement) {
      this.setImage(this.imageElement, value, this.title);
    }
  }

  set category(value: string) {
    if (this.categoryElement) {
      this.categoryElement.textContent = value;

      // Установка соответствующего CSS класса для категории
      for (const key in categoryMap) {
        const categoryKey = key as CategoryKey;
        this.categoryElement.classList.toggle(
          categoryMap[categoryKey],
          key === value
        );
      }
    }
  }

  set description(value: string) {
    this.textElement.textContent = value;
  }

  set buttonText(value: string) {
    this.buttonElement.textContent = value;
  }

  set buttonDisabled(value: boolean) {
    this.buttonElement.disabled = value;
  }
}
