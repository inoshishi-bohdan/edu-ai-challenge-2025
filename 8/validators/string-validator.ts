import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// String Validator
export class StringValidator implements Validator<string> {
  private _pattern?: RegExp;
  private _minLength?: number;
  private _maxLength?: number;
  private _customMessage?: string;

  validate(value: unknown): ValidationResult<string> {
    if (typeof value !== 'string') {
      return {
        success: false,
        errors: [this._customMessage || 'Value must be a string']
      };
    }

    const errors: string[] = [];

    if (this._pattern && !this._pattern.test(value)) {
      errors.push(this._customMessage || `Value must match pattern ${this._pattern}`);
    }

    if (this._minLength !== undefined && value.length < this._minLength) {
      errors.push(`Value must be at least ${this._minLength} characters long`);
    }

    if (this._maxLength !== undefined && value.length > this._maxLength) {
      errors.push(`Value must be at most ${this._maxLength} characters long`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: value };
  }

  pattern(regex: RegExp): StringValidator {
    this._pattern = regex;
    return this;
  }

  minLength(length: number): StringValidator {
    this._minLength = length;
    return this;
  }

  maxLength(length: number): StringValidator {
    this._maxLength = length;
    return this;
  }

  withMessage(message: string): StringValidator {
    this._customMessage = message;
    return this;
  }

  optional(): OptionalValidator<string> {
    return new OptionalValidator(this);
  }
} 