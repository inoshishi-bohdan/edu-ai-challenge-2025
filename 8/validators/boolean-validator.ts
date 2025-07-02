import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// Boolean Validator
export class BooleanValidator implements Validator<boolean> {
  private _customMessage?: string;

  validate(value: unknown): ValidationResult<boolean> {
    if (typeof value !== 'boolean') {
      return {
        success: false,
        errors: [this._customMessage || 'Value must be a boolean']
      };
    }

    return { success: true, data: value };
  }

  withMessage(message: string): BooleanValidator {
    this._customMessage = message;
    return this;
  }

  optional(): OptionalValidator<boolean> {
    return new OptionalValidator(this);
  }
} 