// Import all validators
import { Validator } from './types';
import { StringValidator } from './string-validator';
import { NumberValidator } from './number-validator';
import { BooleanValidator } from './boolean-validator';
import { DateValidator } from './date-validator';
import { ObjectValidator } from './object-validator';
import { ArrayValidator } from './array-validator';

// Schema Builder
export class Schema {
  static string(): StringValidator {
    return new StringValidator();
  }
  
  static number(): NumberValidator {
    return new NumberValidator();
  }
  
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }
  
  static date(): DateValidator {
    return new DateValidator();
  }
  
  static object<T>(schema: Record<string, Validator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }
  
  static array<T>(itemValidator: Validator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }
}

// Define a complex schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Validate data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);

// Demo: Display validation results
console.log('Validation Result:', result);

// Demo: Test with invalid data
const invalidUserData = {
  id: 123, // Should be string
  name: "J", // Too short
  email: "invalid-email", // Invalid pattern
  isActive: "yes", // Should be boolean
  tags: ["developer", 123], // Mixed types in array
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "invalid", // Should be 5 digits
    country: "USA"
  }
};

const invalidResult = userSchema.validate(invalidUserData);
console.log('Invalid Data Result:', invalidResult);
