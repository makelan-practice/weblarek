import { EventEmitter, IEvents } from "../components/base/Events";
import { IProduct } from "../types";

/**
 * Класс модели данных каталога товаров
 * Отвечает за хранение и управление данными о товарах
 */
export class Catalog extends EventEmitter implements IEvents {
  private items: IProduct[] = [];
  private preview: IProduct | null = null;

  /**
   * Сохраняет массив товаров в модель
   */
  setItems(items: IProduct[]): void {
    this.items = items;
    this.emit("items:changed", { items });
  }

  /**
   * Возвращает массив всех товаров
   */
  getItems(): IProduct[] {
    return this.items;
  }

  /**
   * Возвращает товар по ID
   */
  getItemById(id: string): IProduct | null {
    return this.items.find((item) => item.id === id) || null;
  }

  /**
   * Сохраняет товар для подробного отображения
   */
  setPreview(item: IProduct | null): void {
    this.preview = item;
    this.emit("preview:changed", { preview: item });
  }

  /**
   * Возвращает товар для подробного отображения
   */
  getPreview(): IProduct | null {
    return this.preview;
  }
}
