import { IProduct, ICardActions } from "../../types";
import { Card } from "./Card";
import { categoryMap } from "../../utils/constants";

type CategoryKey = keyof typeof categoryMap;

export type TCardCatalog = Pick<
  IProduct,
  "image" | "category" | "title" | "price"
>;

export class CardCatalog extends Card<TCardCatalog> {
  protected imageElement: HTMLImageElement | null = null;
  protected categoryElement: HTMLElement | null = null;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.imageElement =
      this.container.querySelector<HTMLImageElement>(".card__image");
    this.categoryElement =
      this.container.querySelector<HTMLElement>(".card__category");

    if (actions?.onClick) {
      this.container.addEventListener("click", actions.onClick);
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
}
