import { EventEmitter, IEvents } from '../components/base/Events';
import { TPayment, IBuyer, IBuyerErrors } from '../types';

/**
 * Класс модели данных покупателя
 * Отвечает за хранение и валидацию данных покупателя
 */
export class Buyer extends EventEmitter implements IEvents {
  private _payment: TPayment | null = null;
  private _email: string = '';
  private _phone: string = '';
  private _address: string = '';

  /**
   * Сохраняет данные покупателя
   */
  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this._payment = data.payment;
    if (data.email !== undefined) this._email = data.email;
    if (data.phone !== undefined) this._phone = data.phone;
    if (data.address !== undefined) this._address = data.address;
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Сохраняет способ оплаты
   */
  setPayment(payment: TPayment): void {
    this._payment = payment;
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Сохраняет адрес доставки
   */
  setAddress(address: string): void {
    this._address = address;
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Сохраняет телефон
   */
  setPhone(phone: string): void {
    this._phone = phone;
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Сохраняет email
   */
  setEmail(email: string): void {
    this._email = email;
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Возвращает все данные покупателя
   */
  getData(): IBuyer {
    return {
      payment: this._payment as TPayment,
      email: this._email,
      phone: this._phone,
      address: this._address,
    };
  }

  /**
   * Очищает все данные покупателя
   */
  clear(): void {
    this._payment = null;
    this._email = '';
    this._phone = '';
    this._address = '';
    this.emit('data:changed', { data: this.getData() });
  }

  /**
   * Валидирует данные покупателя
   * Возвращает объект с ошибками валидации для каждого поля
   */
  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: IBuyerErrors = {};

    if (!this._payment) {
      errors.payment = 'Не выбран способ оплаты';
    }

    if (!this._email || this._email.trim() === '') {
      errors.email = 'Укажите email';
    }

    if (!this._phone || this._phone.trim() === '') {
      errors.phone = 'Укажите телефон';
    }

    if (!this._address || this._address.trim() === '') {
      errors.address = 'Укажите адрес доставки';
    }

    return errors;
  }
}