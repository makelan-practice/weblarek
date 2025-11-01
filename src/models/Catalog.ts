import { EventEmitter, IEvents } from '../components/base/Events';
import { IProduct } from '../types';

/**
 * Класс модели данных каталога товаров
 * Отвечает за хранение и управление данными о товарах
 */
export class Catalog extends EventEmitter implements IEvents {
  private _items: IProduct[] = [];
  private _preview: IProduct | null = null;

  /**
   * Сохраняет массив товаров в модель
   */
  setItems(items: IProduct[]): void {
    this._items = items;
    this.emit('items:changed', { items });
  }

  /**
   * Возвращает массив всех товаров
   */
  getItems(): IProduct[] {
    return this._items;
  }

  /**
   * Возвращает товар по ID
   */
  getItemById(id: string): IProduct | null {
    return this._items.find(item => item.id === id) || null;
  }

  /**
   * Сохраняет товар для подробного отображения
   */
  setPreview(item: IProduct): void {
    this._preview = item;
    this.emit('preview:changed', { preview: item });
  }

  /**
   * Возвращает товар для подробного отображения
   */
  getPreview(): IProduct | null {
    return this._preview;
  }
}