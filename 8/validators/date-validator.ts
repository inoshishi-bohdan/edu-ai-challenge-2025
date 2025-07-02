import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// Date Validator
export class DateValidator implements Validator<Date> {
  private _customMessage?: string;

  validate(value: unknown): ValidationResult<Date> {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return {
        success: false,
        errors: [this._customMessage || 'Value must be a valid date']
      };
    }

    if (isNaN(date.getTime())) {
      return {
        success: false,
        errors: [this._customMessage || 'Value must be a valid date']
      };
    }

    return { success: true, data: date };
  }

  withMessage(message: string): DateValidator {
    this._customMessage = message;
    return this;
  }

  optional(): OptionalValidator<Date> {
    return new OptionalValidator(this);
  }
} 