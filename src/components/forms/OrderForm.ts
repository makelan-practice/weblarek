import { Form } from './Form';
import { ensureElement } from '../../utils/utils';
import { TPayment } from '../../types';

export interface IOrderFormState {
  payment: TPayment | null;
  address: string;
}

const PAYMENT_MAP: Record<string, TPayment> = {
  card: 'online',
  cash: 'offline',
};

export class OrderForm extends Form<IOrderFormState> {
  protected _addressInput: HTMLInputElement;
  protected _paymentButtons: HTMLButtonElement[];
  protected _state: IOrderFormState = {
    payment: null,
    address: '',
  };

  constructor(form: HTMLFormElement, actions: { onSubmit: (data: IOrderFormState) => void; onChange?: (data: Partial<IOrderFormState>) => void; }) {
    super(form, actions);
    this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', form);
    this._paymentButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('.order__buttons .button'));

    this._paymentButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const payment = PAYMENT_MAP[button.name];
        this.payment = payment || null;
      });
    });

    this._addressInput.addEventListener('input', () => {
      this.address = this._addressInput.value;
    });
  }

  get value(): IOrderFormState {
    return this._state;
  }

  set payment(value: TPayment | null) {
    this._state.payment = value;
    this._paymentButtons.forEach((button) => {
      const payment = PAYMENT_MAP[button.name];
      const isActive = value === payment;
      button.classList.toggle('button_alt-active', isActive);
      button.classList.toggle('button_alt', !isActive);
    });
    this.notifyChange({ payment: value ?? undefined });
  }

  set address(value: string) {
    this._state.address = value.trim();
    this._addressInput.value = value;
    this.notifyChange({ address: this._state.address });
  }
}


