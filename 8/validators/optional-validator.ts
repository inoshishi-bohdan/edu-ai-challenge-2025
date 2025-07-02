import { Validator, ValidationResult, OptionalValidator as IOptionalValidator } from './types';

// Optional Validator Wrapper
export class OptionalValidator<T> implements IOptionalValidator<T> {
  constructor(private innerValidator: Validator<T>) {}

  validate(value: unknown): ValidationResult<T | undefined> {
    if (value === undefined || value === null) {
      return { success: true, data: undefined };
    }
    return this.innerValidator.validate(value);
  }

  optional(): OptionalValidator<T> {
    return this;
  }
} 