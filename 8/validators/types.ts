// Validation Result Types
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Base Validator Interface
export interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
  optional(): OptionalValidator<T>;
}

// Forward declaration for OptionalValidator
export interface OptionalValidator<T> extends Validator<T | undefined> {} 