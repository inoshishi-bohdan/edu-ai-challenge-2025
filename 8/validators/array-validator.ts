import { Validator, ValidationResult } from './types';
import { OptionalValidator } from './optional-validator';

// Array Validator
export class ArrayValidator<T> implements Validator<T[]> {
  constructor(private itemValidator: Validator<T>) {}

  validate(value: unknown): ValidationResult<T[]> {
    if (!Array.isArray(value)) {
      return {
        success: false,
        errors: ['Value must be an array']
      };
    }

    const result: T[] = [];
    const errors: string[] = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      
      if (!itemResult.success) {
        errors.push(...(itemResult.errors || []).map(err => `[${i}]: ${err}`));
      } else {
        result.push(itemResult.data as T);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: result };
  }

  optional(): OptionalValidator<T[]> {
    return new OptionalValidator(this);
  }
} 