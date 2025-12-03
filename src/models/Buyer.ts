import { EventEmitter, IEvents } from "../components/base/Events";
import { TPayment, IBuyer, IBuyerErrors } from "../types";

/**
 * Класс модели данных покупателя
 * Отвечает за хранение и валидацию данных покупателя
 */
export class Buyer extends EventEmitter implements IEvents {
  private payment: TPayment | null = null;
  private email: string = "";
  private phone: string = "";
  private address: string = "";

  /**
   * Сохраняет данные покупателя
   */
  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Сохраняет способ оплаты
   */
  setPayment(payment: TPayment): void {
    this.payment = payment;
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Сохраняет адрес доставки
   */
  setAddress(address: string): void {
    this.address = address;
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Сохраняет телефон
   */
  setPhone(phone: string): void {
    this.phone = phone;
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Сохраняет email
   */
  setEmail(email: string): void {
    this.email = email;
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Возвращает все данные покупателя
   */
  getData(): IBuyer {
    return {
      payment: this.payment as TPayment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  /**
   * Очищает все данные покупателя
   */
  clear(): void {
    this.payment = null;
    this.email = "";
    this.phone = "";
    this.address = "";
    this.emit("data:changed", { data: this.getData() });
  }

  /**
   * Валидирует данные покупателя
   * Возвращает объект с ошибками валидации для каждого поля
   */
  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: IBuyerErrors = {};

    if (!this.payment) {
      errors.payment = "Не выбран способ оплаты";
    }

    if (!this.email || this.email.trim() === "") {
      errors.email = "Укажите email";
    }

    if (!this.phone || this.phone.trim() === "") {
      errors.phone = "Укажите телефон";
    }

    if (!this.address || this.address.trim() === "") {
      errors.address = "Укажите адрес доставки";
    }

    return errors;
  }
}
