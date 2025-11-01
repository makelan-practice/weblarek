import { IApi } from '../types';
import { IProductListResponse, IOrderRequest, IOrderResponse } from '../types';

/**
 * Класс представитель коммуникационного слоя
 * Отвечает за получение данных с сервера и отправку данных на сервер
 */
export class ShopAPI {
  /**
   * Объект для выполнения запросов на сервер
   */
  protected api: IApi;

  /**
   * Создает экземпляр ShopAPI
   * @param api объект, соответствующий интерфейсу IApi
   */
  constructor(api: IApi) {
    this.api = api;
  }

  /**
   * Получает список товаров с сервера
   * @returns промис с объектом, содержащим массив товаров
   */
  getProductList(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/');
  }

  /**
   * Создает заказ на сервере
   * @param order данные заказа
   * @returns промис с результатом создания заказа
   */
  createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order', order);
  }
}