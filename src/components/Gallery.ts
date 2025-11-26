import { Component } from "./base/Component";

interface IGallery {
  items: HTMLElement[];
}

/**
 * Компонент списка товаров на главной странице
 */
export class Gallery extends Component<IGallery> {
  constructor(container: HTMLElement) {
    super(container);
  }

  set items(nodes: HTMLElement[]) {
    this.container.replaceChildren(...nodes);
  }
}
