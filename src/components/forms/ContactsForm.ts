import { Form } from './Form';
import { ensureElement } from '../../utils/utils';

export interface IContactsFormState {
  email: string;
  phone: string;
}

export class ContactsForm extends Form<IContactsFormState> {
  protected _emailInput: HTMLInputElement;
  protected _phoneInput: HTMLInputElement;
  protected _state: IContactsFormState = {
    email: '',
    phone: '',
  };

  constructor(form: HTMLFormElement, actions: { onSubmit: (data: IContactsFormState) => void; onChange?: (data: Partial<IContactsFormState>) => void; }) {
    super(form, actions);
    this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', form);
    this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', form);

    this._emailInput.addEventListener('input', () => {
      this.email = this._emailInput.value;
    });

    this._phoneInput.addEventListener('input', () => {
      this.phone = this._phoneInput.value;
    });
  }

  get value(): IContactsFormState {
    return this._state;
  }

  set email(value: string) {
    this._state.email = value.trim();
    this._emailInput.value = value;
    this.notifyChange({ email: this._state.email });
  }

  set phone(value: string) {
    this._state.phone = value.trim();
    this._phoneInput.value = value;
    this.notifyChange({ phone: this._state.phone });
  }
}


