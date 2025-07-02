import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// Number Validator
export class NumberValidator implements Validator<number> {
  private _min?: number;
  private _max?: number;
  private _customMessage?: string;

  validate(value: unknown): ValidationResult<number> {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        success: false,
        errors: [this._customMessage || 'Value must be a number']
      };
    }

    const errors: string[] = [];

    if (this._min !== undefined && value < this._min) {
      errors.push(`Value must be at least ${this._min}`);
    }

    if (this._max !== undefined && value > this._max) {
      errors.push(`Value must be at most ${this._max}`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: value };
  }

  min(value: number): NumberValidator {
    this._min = value;
    return this;
  }

  max(value: number): NumberValidator {
    this._max = value;
    return this;
  }

  withMessage(message: string): NumberValidator {
    this._customMessage = message;
    return this;
  }

  optional(): OptionalValidator<number> {
    return new OptionalValidator(this);
  }
} 