import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// Object Validator
export class ObjectValidator<T> implements Validator<T> {
  constructor(private schema: Record<string, Validator<any>>) {}

  validate(value: unknown): ValidationResult<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {
        success: false,
        errors: ['Value must be an object']
      };
    }

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    const errors: string[] = [];

    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldResult = validator.validate(obj[key]);
      
      if (!fieldResult.success) {
        errors.push(...(fieldResult.errors || []).map(err => `${key}: ${err}`));
      } else {
        result[key] = fieldResult.data;
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: result as T };
  }

  optional(): OptionalValidator<T> {
    return new OptionalValidator(this);
  }
} 