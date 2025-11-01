import { EventEmitter, IEvents } from '../components/base/Events';
import { IProduct } from '../types';

/**
 * Класс модели данных корзины
 * Отвечает за хранение и управление товарами в корзине
 */
export class Cart extends EventEmitter implements IEvents {
  private _items: IProduct[] = [];

  /**
   * Возвращает массив товаров в корзине
   */
  getItems(): IProduct[] {
    return this._items;
  }

  /**
   * Добавляет товар в корзину
   */
  addItem(item: IProduct): void {
    this._items.push(item);
    this.emit('items:changed', { items: this._items });
  }

  /**
   * Удаляет товар из корзины
   */
  removeItem(item: IProduct): void {
    this._items = this._items.filter(cartItem => cartItem.id !== item.id);
    this.emit('items:changed', { items: this._items });
  }

  /**
   * Очищает корзину
   */
  clear(): void {
    this._items = [];
    this.emit('items:changed', { items: this._items });
  }

  /**
   * Возвращает общую стоимость товаров в корзине
   */
  getTotal(): number {
    return this._items.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }

  /**
   * Возвращает количество товаров в корзине
   */
  getCount(): number {
    return this._items.length;
  }

  /**
   * Проверяет наличие товара в корзине по ID
   */
  contains(id: string): boolean {
    return this._items.some(item => item.id === id);
  }
}