import { action, observable } from 'mobx';

// Some simple regexes for quick validation. Non exhaustive.
const basicUrlRegex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/;
const basicEmailRegex = /^\S+@\S+$/;

const enum FieldError {
  REQUIRED = 'This field is required',
  INVALID_EMAIL_FORMAT = 'This doesn\'t look like a valid email address',
  INVALID_URL_FORMAT = 'This doesn\'t look like a valid URL',
  PASSWORD_TOO_SHORT = 'Your password needs to be at least 8 characters long',
}

export class FormStore<Field extends string> {
  @observable.shallow
  errors = new Map<Field, string>();

  get hasErrors() {
    return this.errors.size > 0;
  }
}

export class FormPresenter<Field extends string> {
  constructor(private readonly _store: FormStore<Field>) { }

  protected undefinedIfEmpty(s: string): string | undefined {
    return s.trim() === ''
      ? undefined
      : s;
  }

  @action
  protected checkRequiredFields(...fields: (readonly [Field, any])[]) {
    const errorFields = fields.filter(f => f[1] == null || typeof f[1] === 'string' && f[1].trim() === '').map(f => f[0]);
    this.pushErrors(errorFields, FieldError.REQUIRED);
    return errorFields;
  }

  @action
  protected checkUrlFields(...fields: (readonly [Field, string | undefined])[]) {
    const errorFields = fields.filter(f => f[1] != null && f[1].trim() !== '' && !f[1].match(basicUrlRegex)).map(f => f[0]);
    this.pushErrors(errorFields, FieldError.INVALID_URL_FORMAT);
    return errorFields;
  }

  @action
  protected checkEmailFields(...fields: (readonly [Field, string])[]) {
    const errorFields = fields.filter(f => !f[1].trim().match(basicEmailRegex)).map(f => f[0]);
    this.pushErrors(errorFields, FieldError.INVALID_EMAIL_FORMAT);
    return errorFields;
  }

  @action
  protected checkPasswordRestrictionFields(...fields: (readonly [Field, string])[]) {
    const errorFields = fields.filter(f => f[1].length < 8).map(f => f[0]);
    this.pushErrors(errorFields, FieldError.PASSWORD_TOO_SHORT);
    return errorFields;
  }

  @action
  protected pushErrors(fields: Field[], error: string) {
    fields.forEach(f => this._store.errors.set(f, error));
  }
}