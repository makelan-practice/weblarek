export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

// Интерфейс товара
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

// Тип способа оплаты
export type TPayment = "online" | "offline" | string;

// Интерфейс покупателя
export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

// Интерфейс ошибок валидации покупателя
export interface IBuyerErrors {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Интерфейс ответа сервера с списком товаров
export interface IProductListResponse {
  total: number;
  items: IProduct[];
}

// Интерфейс запроса на создание заказа
export interface IOrderRequest {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

// Интерфейс ответа сервера при создании заказа
export interface IOrderResponse {
  id: string;
  total: number;
}

// Интерфейс ошибки от сервера
export interface IOrderError {
  error: string;
}
export interface ICardActions {
  onClick?: (event: MouseEvent) => void;
}
