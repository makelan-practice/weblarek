import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

export interface IFormState {
  valid: boolean;
  errors: string;
}

type FormActions<T> = {
  onSubmit: (data: T) => void;
  onChange?: (data: Partial<T>) => void;
};

export abstract class Form<T> extends Component<T & IFormState> {
  protected _submit: HTMLButtonElement;
  protected _errors: HTMLElement;
  protected _actions: FormActions<T>;

  constructor(form: HTMLFormElement, actions: FormActions<T>) {
    super(form);
    this._actions = actions;
    this._submit = ensureElement<HTMLButtonElement>(
      'button[type="submit"]',
      form
    );
    this._errors = ensureElement<HTMLElement>(".form__errors", form);

    form.addEventListener("submit", (event: SubmitEvent) => {
      event.preventDefault();
      this._actions.onSubmit(this.value);
    });
  }

  abstract get value(): T;

  set valid(state: boolean) {
    this._submit.disabled = !state;
  }

  set errors(message: string) {
    this._errors.textContent = message;
  }

  protected notifyChange(payload: Partial<T>) {
    this._actions.onChange?.(payload);
  }
}
