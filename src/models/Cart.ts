import { EventEmitter, IEvents } from "../components/base/Events";
import { IProduct } from "../types";

/**
 * Класс модели данных корзины
 * Отвечает за хранение и управление товарами в корзине
 */
export class Cart extends EventEmitter implements IEvents {
  private items: IProduct[] = [];

  /**
   * Возвращает массив товаров в корзине
   */
  getItems(): IProduct[] {
    return this.items;
  }

  /**
   * Добавляет товар в корзину
   */
  addItem(item: IProduct): void {
    this.items.push(item);
    this.emit("items:changed", { items: this.items });
  }

  /**
   * Удаляет товар из корзины
   */
  removeItem(item: IProduct): void {
    this.items = this.items.filter((cartItem) => cartItem.id !== item.id);
    this.emit("items:changed", { items: this.items });
  }

  /**
   * Очищает корзину
   */
  clear(): void {
    this.items = [];
    this.emit("items:changed", { items: this.items });
  }

  /**
   * Возвращает общую стоимость товаров в корзине
   */
  getTotal(): number {
    return this.items.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }

  /**
   * Возвращает количество товаров в корзине
   */
  getCount(): number {
    return this.items.length;
  }

  /**
   * Проверяет наличие товара в корзине по ID
   */
  contains(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }

  /**
   * Возвращает текст кнопки для товара с учетом его наличия в корзине и цены
   */
  getButtonText(product: IProduct): string {
    if (product.price === null) {
      return "Недоступно";
    }
    return this.contains(product.id) ? "Удалить из корзины" : "Купить";
  }

  /**
   * Проверяет, должна ли кнопка быть заблокирована
   */
  isButtonDisabled(product: IProduct): boolean {
    return product.price === null;
  }
}
